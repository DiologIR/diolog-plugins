// page-fit.mjs — does each page fit one A4 sheet, and did the fonts actually load?
//
//   node scripts/page-fit.mjs guide.html --out shots/
//
// A `.page` with `overflow:hidden` hides its own overflow, so a page-height check passes with
// perfect confidence while content collides at the bottom of the sheet. The page-level number is
// therefore the least informative one here. `innerOver` and `rfGap` are the ones that find bugs.

import { open, loadConfig, parseArgs } from './lib/harness.mjs';

const A4_W = 794, A4_H = 1123;   // at 96dpi

function MEASURE(CFG, A4H) {
  const pages = [...document.querySelectorAll(CFG.page)];
  const data = pages.map((p, i) => {
    const pr = p.getBoundingClientRect();
    let maxBottom = 0, offender = '';
    for (const el of p.querySelectorAll('*')) {
      const rel = el.getBoundingClientRect().bottom - pr.top;
      if (rel > maxBottom) { maxBottom = rel; offender = String(el.className || el.tagName); }
    }
    const inner = p.querySelector(CFG.inner);
    const rf = p.querySelector(CFG.runningFooter);
    return {
      page: i + 1,
      h: Math.round(pr.height),
      over: maxBottom > p.clientHeight + 1 ? Math.round(maxBottom - p.clientHeight) : 0,
      // content overflowing the inner box = element collisions that overflow:hidden conceals
      innerOver: inner ? Math.max(0, Math.round(inner.scrollHeight - inner.clientHeight)) : 0,
      // negative = the last block is sitting on top of the running footer
      rfGap: (rf && inner) ? Math.round(rf.getBoundingClientRect().top - inner.getBoundingClientRect().bottom) : null,
      offender: offender.slice(0, 28),
    };
  });
  const headline = document.querySelector('h1, h2');
  const mono = document.querySelector('.ml, .eyebrow, .rf');
  return {
    count: pages.length,
    headlineFont: headline ? getComputedStyle(headline).fontFamily.split(',')[0] : 'none',
    monoFont: mono ? getComputedStyle(mono).fontFamily.split(',')[0] : 'none',
    fonts: {
      newsreader: document.fonts.check('40px "Newsreader"'),
      mono: document.fonts.check('12px "JetBrains Mono"'),
      inter: document.fonts.check('12px "Inter"'),
    },
    hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    pages: data,
  };
}

const args = parseArgs();
const cfg = loadConfig(args.file, args.config);
const b = await open(args.file, { width: A4_W, height: A4_H });
let r, shots = 0;
try {
  r = await b.ev(`(${MEASURE.toString()})(${JSON.stringify(cfg)}, ${A4_H})`);
  if (args.out) {
    const rects = await b.ev(`[...document.querySelectorAll(${JSON.stringify(cfg.page)})].map(p=>{const r=p.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height}})`);
    for (let i = 0; i < rects.length; i++) {
      await b.shot(`${args.out}/page-${String(i + 1).padStart(2, '0')}.png`, rects[i], 1);
      shots++;
    }
  }
} finally { await b.close(); }

if (args.json) { console.log(JSON.stringify(r, null, 1)); process.exit(0); }

const bad = r.pages.filter(p => p.over || p.innerOver || (p.rfGap !== null && p.rfGap < 0));
const fontsOK = r.fonts.newsreader && r.fonts.mono && r.fonts.inter;

console.log(`\n=== PAGE FIT - ${r.count} pages ===\n`);
console.log(`headline font : ${r.headlineFont}   ${/Newsreader/.test(r.headlineFont) ? 'ok' : 'FALLBACK - the inlined @font-face did not apply'}`);
console.log(`mono font     : ${r.monoFont}`);
console.log(`fonts loaded  : Newsreader=${r.fonts.newsreader} Inter=${r.fonts.inter} JetBrainsMono=${r.fonts.mono}`);
console.log(`h-scroll      : ${r.hScroll ? 'YES (bad)' : 'no'}`);

const baselines = r.pages.map(p => p.rfGap).filter(v => v !== null);
if (baselines.length) console.log(`footer gaps   : min ${Math.min(...baselines)}px  max ${Math.max(...baselines)}px`);

if (bad.length) {
  console.log(`\n${bad.length} page(s) with fit problems:\n`);
  for (const p of bad) {
    const why = [];
    if (p.over) why.push(`overflows the sheet by ${p.over}px`);
    if (p.innerOver) why.push(`content collides inside .inner by ${p.innerOver}px (hidden by overflow:hidden)`);
    if (p.rfGap !== null && p.rfGap < 0) why.push(`overlaps the running footer by ${-p.rfGap}px`);
    console.log(`  p${String(p.page).padStart(2, '0')}  ${why.join('; ')}   [${p.offender}]`);
  }
} else {
  console.log(`\nAll ${r.count} pages fit one A4 sheet with no hidden collisions.`);
}
if (shots) console.log(`\n${shots} page screenshots -> ${args.out}/  (these are thumbnails: use guide-qa crops to actually inspect components)`);
console.log('');

process.exit(bad.length || !fontsOK || r.hScroll ? 1 : 0);
