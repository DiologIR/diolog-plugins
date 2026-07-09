// scope-lint.mjs — finds CSS selectors that escape the scope they were written for.
//
//   node scripts/scope-lint.mjs guide.html
//
// This class of bug is invisible in a screenshot AND invisible in the source, because both the rule
// and the markup look correct in isolation. It only exists in the relationship between them. Three
// real examples from one document:
//
//   1. `.q { padding: 26px 0; border-top: 1px solid }`  (a page-level question row)
//      also matched  <span class="q">  inside a search-field mock.
//   2. `.prose p { max-width: 68ch }`  clamped a caption inside a card to 555px within a 606px box.
//      The caption was then centred inside the CLAMPED box: off-centre by 24px, CSS "correct".
//   3. `.slice .st { margin: 0 0 10px }`  was dead for its own component but still reached
//      `.statuscard .st` inside it, adding 10px of phantom height nobody could account for.
//
// The test that catches all three: does a component boundary sit STRICTLY BETWEEN the selector's
// head and the element it matched? An earlier version asked "does it match both inside and outside
// a component", which misses (3) entirely, because that rule matched nothing outside.

import { open, loadConfig, parseArgs } from './lib/harness.mjs';

function LINT(CFG) {
  const COMPONENTS = CFG.components.join(',');
  const findings = [];
  const rules = [];
  for (const sheet of document.styleSheets) {
    let rs; try { rs = sheet.cssRules; } catch { continue; }         // cross-origin sheet
    for (const r of rs) if (r.selectorText) rules.push(r.selectorText);
  }

  // Motion rules are gated on a state class the DOM only carries while scrolled into view.
  // At rest they match nothing. That is conditional, not dead, and they are allowed inside components.
  const stateClasses = [CFG.motion?.entranceClass, CFG.motion?.ambientClass].filter(Boolean);
  const stateRe = stateClasses.length ? new RegExp('\\.(' + stateClasses.join('|') + ')\\b') : null;

  for (const selText of rules) {
    for (const sel of selText.split(',').map(s => s.trim())) {
      if (!sel || sel.startsWith('@') || sel.includes(':')) continue;

      // (a) descendant leak
      if (/\s/.test(sel) && !sel.includes('>')) {
        let els; try { els = [...document.querySelectorAll(sel)]; } catch { continue; }
        const gated = stateRe && stateRe.test(sel);
        if (!els.length) { if (!gated) findings.push({ type: 'dead-rule', sel, msg: 'selector matches nothing' }); continue; }
        if (gated) continue;
        const head = sel.split(/\s+/)[0];
        const bad = [];
        for (const e of els) {
          let headEl; try { headEl = e.closest(head); } catch { continue; }
          if (!headEl) continue;
          let p = e.parentElement, crossed = null;
          while (p && p !== headEl) { if (p.matches(COMPONENTS)) { crossed = p; break; } p = p.parentElement; }
          if (crossed) bad.push({ e, crossed });
        }
        if (bad.length) findings.push({
          type: 'descendant-leak', sel,
          msg: 'rule crosses a component boundary it does not own',
          matches: bad.length,
          leakedInto: '.' + String(bad[0].crossed.className).split(' ')[0],
          example: '.' + String(bad[0].e.className || bad[0].e.tagName).split(' ')[0],
        });
      }

      // (b) short bare class reused across contexts: a collision waiting to happen
      const m = sel.match(/^\.([a-z0-9-]{1,3})$/);
      if (m) {
        let els; try { els = [...document.querySelectorAll(sel)]; } catch { continue; }
        const ctxs = new Set(els.map(e => { const c = e.closest(COMPONENTS); return c ? String(c.className).split(' ')[0] : 'PAGE'; }));
        if (ctxs.size > 1) findings.push({
          type: 'generic-global-class', sel,
          msg: 'short global class used in more than one context',
          contexts: [...ctxs], count: els.length,
        });
      }
    }
  }
  return findings;
}

const args = parseArgs();
const cfg = loadConfig(args.file, args.config);
const b = await open(args.file, { settleMs: 1200 });
let out;
try { out = await b.ev(`(${LINT.toString()})(${JSON.stringify(cfg)})`); }
finally { await b.close(); }

if (args.json) { console.log(JSON.stringify(out, null, 1)); }
else {
  console.log(`\n=== CSS SCOPE LINT - ${out.length} finding(s) ===\n`);
  for (const f of out) {
    console.log(`[${f.type}]  ${f.sel}`);
    console.log(`   ${f.msg}`);
    const rest = Object.fromEntries(Object.entries(f).filter(([k]) => !['type', 'sel', 'msg'].includes(k)));
    if (Object.keys(rest).length) console.log(`   ${JSON.stringify(rest)}`);
    console.log('');
  }
  if (!out.length) console.log('No selector escapes its scope.\n');
}
process.exit(out.length ? 1 : 0);
