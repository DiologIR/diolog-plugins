// motion-check.mjs — prove the motion layer is print-safe, then film it so you can actually see it.
//
//   node scripts/motion-check.mjs guide.html --out frames/
//   node scripts/motion-check.mjs guide.html --slice 3 --frames 8 --interval 220
//
// Two jobs, because motion has exactly two ways of going wrong and they need opposite tools.
//
// 1. PRINT SAFETY (static, cheap, decidable).
//    The contract is: RESTING STYLE = FINAL STYLE. The "from" state lives only inside @keyframes,
//    never in the rule. Kill the animation and you get the settled design, not a blank page.
//    Write `.row { opacity: 1 }  @keyframes fadeUp { from { opacity: 0 } }`,
//    never `.row { opacity: 0 }  @keyframes fadeUp { to { opacity: 1 } }`.
//    This script emulates print, then finds anything that is invisible in that state. Anything it
//    lists is content that will be MISSING from the PDF.
//
// 2. MID-FLIGHT CORRECTNESS (only visible in a moving frame).
//    A gate reads the DOM at rest. Every rule in guide-qa.mjs passed on a chip whose "Checking..."
//    overlay painted UNDERNEATH its own label, so a real export briefly rendered "CONSISTEN" +
//    "CHECKING..." + "RRENT DRAFT" on top of each other. Nothing static could see it, because at
//    rest the overlay is opacity:0 and at the end it is gone. Only a frame captured DURING the
//    animation contains the bug. So: capture frames, and open them.

import { open, loadConfig, parseArgs } from './lib/harness.mjs';

function RESTING(CFG) {
  const out = { hidden: [], overlayText: [] };
  const els = document.querySelectorAll(CFG.page + ' *');
  for (const el of els) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;

    const reasons = [];
    if (parseFloat(cs.opacity) < 0.05) reasons.push('opacity=' + cs.opacity);
    if (cs.visibility === 'hidden') reasons.push('visibility:hidden');

    const m = cs.transform && cs.transform.match(/^matrix\(([^)]+)\)/);
    if (m) {
      const [a, , , d] = m[1].split(',').map(Number);
      if (Math.abs(a) < 0.05) reasons.push('scaleX~0');
      if (Math.abs(d) < 0.05) reasons.push('scaleY~0');
    }

    // an SVG stroke fully dashed out of view (a draw-on animation left at its "from" state)
    const da = cs.strokeDasharray, dofs = parseFloat(cs.strokeDashoffset);
    if (da && da !== 'none' && !isNaN(dofs)) {
      const total = da.split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n)).reduce((x, y) => x + y, 0);
      if (total > 0 && Math.abs(dofs) >= total * 0.95) reasons.push('stroke fully dashed out');
    }

    if (reasons.length) {
      const txt = (el.textContent || '').trim().slice(0, 40);
      out.hidden.push({
        sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''),
        reasons, text: txt, animation: cs.animationName,
      });
    }

    // a pseudo-element overlay that is VISIBLE at rest and carries text will print its label
    for (const pe of ['::before', '::after']) {
      const p = getComputedStyle(el, pe);
      if (!p.content || p.content === 'none' || p.content === 'normal') continue;
      if (parseFloat(p.opacity) < 0.05) continue;
      const literal = p.content.replace(/^"|"$/g, '');
      if (!literal.trim() || literal === 'counter') continue;
      for (const bad of (CFG.motion?.overlayText || [])) {
        if (literal.toLowerCase().includes(bad.toLowerCase()))
          out.overlayText.push({ sel: el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + pe, content: literal });
      }
    }
  }
  return out;
}

const args = parseArgs();
const cfg = loadConfig(args.file, args.config);
const nFrames = +(args.rest.includes('--frames') ? args.rest[args.rest.indexOf('--frames') + 1] : 8);
const interval = +(args.rest.includes('--interval') ? args.rest[args.rest.indexOf('--interval') + 1] : 220);
const sliceIdx = +(args.rest.includes('--slice') ? args.rest[args.rest.indexOf('--slice') + 1] : 0);

let fail = 0;

// ---- pass 1: print media, at rest -------------------------------------------------------------
{
  const b = await open(args.file, { settleMs: 1400 });
  try {
    await b.send('Emulation.setEmulatedMedia', { media: 'print' });
    await new Promise(r => setTimeout(r, 500));
    const r = await b.ev(`(${RESTING.toString()})(${JSON.stringify(cfg)})`);

    console.log(`\n=== PRINT SAFETY (media: print, at rest) ===\n`);
    if (r.hidden.length) {
      fail = 1;
      console.log(`${r.hidden.length} element(s) are INVISIBLE in print. They will be missing from the PDF.`);
      console.log(`The fix is not a print override. It is to make the resting style the FINAL style,`);
      console.log(`and move the "from" state into @keyframes.\n`);
      for (const h of r.hidden.slice(0, 20)) console.log(`  ${h.sel.padEnd(26)} ${h.reasons.join(', ').padEnd(28)} ${h.animation !== 'none' ? '[anim: ' + h.animation + ']' : ''} ${h.text ? '"' + h.text + '"' : ''}`);
      if (r.hidden.length > 20) console.log(`  ... +${r.hidden.length - 20} more`);
    } else {
      console.log('Nothing is hidden at rest. Killing the animations yields the settled design.');
    }
    if (r.overlayText.length) {
      fail = 1;
      console.log(`\n${r.overlayText.length} transient overlay label(s) visible at rest - these will print:\n`);
      for (const o of r.overlayText) console.log(`  ${o.sel}  content: ${JSON.stringify(o.content)}`);
    }
  } finally { await b.close(); }
}

// ---- pass 2: reduced motion --------------------------------------------------------------------
{
  const b = await open(args.file, { settleMs: 1400, reducedMotion: true });
  try {
    const r = await b.ev(`(${RESTING.toString()})(${JSON.stringify(cfg)})`);
    console.log(`\n=== REDUCED MOTION (prefers-reduced-motion: reduce) ===\n`);
    if (r.hidden.length) { fail = 1; console.log(`${r.hidden.length} element(s) invisible for reduced-motion users. Same fix.`); for (const h of r.hidden.slice(0, 10)) console.log(`  ${h.sel}  ${h.reasons.join(', ')}`); }
    else console.log('Nothing hidden. Reduced-motion users see the full, settled design.');
  } finally { await b.close(); }
}

// ---- pass 3: film the entrance ------------------------------------------------------------------
if (args.out && cfg.motion?.slice) {
  const b = await open(args.file, { settleMs: 1200 });
  try {
    const target = await b.ev(`(() => {
      const s = document.querySelectorAll(${JSON.stringify(cfg.motion.slice)})[${sliceIdx}];
      if (!s) return null;
      s.scrollIntoView({ block: 'center' });
      const r = s.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    })()`);
    if (!target) {
      console.log(`\nNo element matches ${cfg.motion.slice}[${sliceIdx}] - nothing to film.\n`);
    } else {
      await new Promise(r => setTimeout(r, 400));
      // Restart the entrance deterministically instead of waiting on the IntersectionObserver.
      await b.ev(`(() => {
        const s = document.querySelectorAll(${JSON.stringify(cfg.motion.slice)})[${sliceIdx}];
        s.classList.remove(${JSON.stringify(cfg.motion.entranceClass)});
        void s.offsetWidth;                                  // force reflow: restarts the animations
        s.classList.add(${JSON.stringify(cfg.motion.entranceClass)});
        if (${JSON.stringify(!!cfg.motion.ambientClass)}) s.classList.add(${JSON.stringify(cfg.motion.ambientClass)});
        return true; })()`);
      console.log(`\n=== ENTRANCE FRAMES - ${cfg.motion.slice}[${sliceIdx}] ===\n`);
      for (let i = 0; i < nFrames; i++) {
        const t = i * interval;
        await b.shot(`${args.out}/frame-${String(i).padStart(2, '0')}-t${t}ms.png`, target, 2);
        await new Promise(r => setTimeout(r, interval));
      }
      console.log(`${nFrames} frames -> ${args.out}/`);
      console.log(`OPEN EVERY ONE. The mid-flight frames are the only place overlay/paint-order bugs exist.\n`);
    }
  } finally { await b.close(); }
}

process.exit(fail);
