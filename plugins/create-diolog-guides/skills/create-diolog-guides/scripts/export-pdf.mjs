// export-pdf.mjs — print to PDF, then check the PDF rather than assuming it.
//
//   node scripts/export-pdf.mjs guide.html --out guide.pdf
//
// Verifies, in the produced file: the page count matches the .page count, the sheet really is A4,
// link annotations survived, and no transient animation label ("Checking...") leaked into the ink.
// If `pdftotext` / `pdfinfo` (poppler) are absent it says so rather than reporting a pass.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { open, loadConfig, parseArgs } from './lib/harness.mjs';

// execFile, never exec: no shell, so a path containing spaces or metacharacters is just a path.
const run = (cmd, argv) => execFileSync(cmd, argv, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const have = cmd => { try { run(cmd, ['-v']); return true; } catch (e) { return e.code !== 'ENOENT'; } };

const args = parseArgs();
const cfg = loadConfig(args.file, args.config);
const out = args.out || args.file.replace(/\.html?$/i, '.pdf');

const b = await open(args.file, { settleMs: 2000 });
let expectedPages = 0;
try {
  expectedPages = await b.ev(`document.querySelectorAll(${JSON.stringify(cfg.page)}).length`);
  const r = await b.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,          // honour @page { size: A4 } instead of guessing
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    displayHeaderFooter: false,
    generateTaggedPDF: true,
  });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(r.result.data, 'base64'));
} finally { await b.close(); }

console.log(`\n=== PDF EXPORT ===\n`);
console.log(`wrote ${out}  (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);

let fail = 0;

// Link annotations: scan the raw bytes. Uncompressed annot dicts are the common case for this
// producer; if yours compresses object streams this undercounts, so treat 0 as "check by hand".
const links = (fs.readFileSync(out).toString('latin1').match(/\/URI\s*\(/g) || []).length;
console.log(`link annots: ${links}`);

if (!have('pdfinfo') || !have('pdftotext')) {
  console.log(`\npoppler (pdfinfo/pdftotext) not installed - page count, size, and ink were NOT verified.`);
  console.log(`Do not report this export as checked. Install poppler, or open the PDF and read it.\n`);
  process.exit(0);
}

const info = run('pdfinfo', [out]);
const pages = +(info.match(/^Pages:\s+(\d+)/m)?.[1] || 0);
const size = info.match(/^Page size:\s+(.+)$/m)?.[1] || '?';

console.log(`pages      : ${pages}  (expected ${expectedPages}) ${pages === expectedPages ? 'ok' : 'MISMATCH'}`);
console.log(`page size  : ${size}${/A4/.test(size) ? '' : '  <- not A4'}`);
if (pages !== expectedPages) fail = 1;
if (!/A4/.test(size)) fail = 1;

const text = run('pdftotext', ['-q', out, '-']);
const leaks = (cfg.motion?.overlayText || []).filter(s => new RegExp(s, 'i').test(text));
if (leaks.length) { fail = 1; console.log(`\nTransient animation text LEAKED into the PDF: ${leaks.join(', ')}`); }
else if (cfg.motion?.overlayText?.length) console.log(`overlay leak: none (checked for ${cfg.motion.overlayText.join(', ')})`);

// pdftotext ends every page with \f, so the final split element is a trailing empty string, not a page
const perPage = text.split('\f').slice(0, pages);
const blanks = perPage.map((p, i) => [i + 1, p.trim().length]).filter(([, n]) => n === 0).map(([i]) => i);
if (blanks.length) console.log(`\nPages with no extractable text: ${blanks.join(', ')} (fine if purely graphical, a bug if not)`);

console.log(fail ? `\nPDF verification FAILED.\n` : `\nPDF verified. Now open a page or two and look at them.\n`);
process.exit(fail);
