// guide-qa.mjs — compositional design audit driven by CSS/DOM facts, not eyeballing.
//
//   node scripts/guide-qa.mjs guide.html --out crops/
//
// Exits 1 on any HIGH. Writes per-component crops at high zoom to --out.
//
// READ THIS BEFORE YOU TRUST IT.
// Every rule below was written *after* a human pointed at a defect. That is what a gate is: a
// record of known failures. It can prove a defect you have already met has not come back. It can
// never tell you the page is good, because it has no rule for the defect nobody has met yet.
// "0 HIGH" means "no known defect present". It does not mean "verified". The crops are the point;
// the exit code is the cheap part.

import fs from 'node:fs';
import { open, loadConfig, parseArgs } from './lib/harness.mjs';

// Serialized into the page. Written as a real function so regexes and quotes need no escaping.
function AUDIT(CFG) {
  const V = [];
  const R = el => el.getBoundingClientRect();
  const pages = [...document.querySelectorAll(CFG.page)];
  const vis = el => { const r = R(el); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const path = el => {
    if (!el || !el.tagName) return '?';
    const p = pages.findIndex(pg => pg.contains(el)) + 1;
    const cn = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return 'p' + p + ' ' + el.tagName.toLowerCase() + cn;
  };
  const add = (rule, sev, el, msg, data) => V.push({ rule, sev, sel: path(el), msg, ...data });
  const flat = sels => sels.join(',');
  const modeOf = arr => { const c = {}; arr.forEach(v => c[v] = (c[v] || 0) + 1); return +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; };
  const exempt = el => el.matches(flat(CFG.geometryExempt)) || (CFG.chromeExempt.length && el.closest(flat(CFG.chromeExempt)));

  // ---- ink measurement -------------------------------------------------------------------
  // getBoundingClientRect() returns the BOX. A display glyph's ink sits somewhere inside that box,
  // and where depends on line-height, font metrics, and the glyph itself. Aligning boxes therefore
  // does not align what the eye sees. Cap-height needs the baseline plus the font's real ascent.
  const cv = document.createElement('canvas').getContext('2d');
  function inkTop(el) {
    const cs = getComputedStyle(el);
    const txt = (el.textContent || '').trim();
    if (!txt) return null;
    const probe = document.createElement('span');            // zero-size, baseline-aligned: reports the first-line baseline
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.insertBefore(probe, el.firstChild);
    const baselineY = probe.getBoundingClientRect().top;
    probe.remove();
    cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    const m = cv.measureText(txt);
    if (!m.actualBoundingBoxAscent) return null;
    return baselineY - m.actualBoundingBoxAscent;
  }

  // ---- 1. line-height shorter than the glyph: the box lies about where the letter is -------
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el) || el.children.length) return;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
    if (fs >= 24 && lh < fs * 0.95)
      add('lineheight-lt-font', 'HIGH', el, 'box shorter than glyph, so centring and alignment lie', { fontSize: +fs.toFixed(1), lineHeight: +lh.toFixed(1) });
  });

  // ---- 2. pills must never wrap ------------------------------------------------------------
  if (CFG.pills.length) document.querySelectorAll(flat(CFG.pills)).forEach(el => {
    if (!vis(el)) return;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    const lh = cs.lineHeight === 'normal' ? fs * 1.4 : parseFloat(cs.lineHeight);
    const inner = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (inner > lh * 1.4) add('pill-wrap', 'HIGH', el, 'pill wraps to a second line', { h: Math.round(R(el).height), lh: Math.round(lh), text: (el.textContent || '').trim().slice(0, 32) });
  });

  // ---- 3. overflow and clipping ------------------------------------------------------------
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el)) return;
    if (!el.children.length && el.scrollWidth > el.clientWidth + 1)
      add('text-overflow', 'HIGH', el, 'text overflows its box', { sw: el.scrollWidth, cw: el.clientWidth });
    const cs = getComputedStyle(el);
    if (/hidden|clip/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1)
      add('clipped-content', 'HIGH', el, 'content clipped by overflow:hidden', { over: el.scrollHeight - el.clientHeight });
  });

  // ---- 4. legibility floor -----------------------------------------------------------------
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el) || el.children.length || !(el.textContent || '').trim()) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < CFG.minFontPx) add('font-too-small', 'HIGH', el, 'below the print legibility floor', { px: +fs.toFixed(1) });
    else if (fs < CFG.warnFontPx) add('font-small', 'LOW', el, 'below the documented chrome floor', { px: +fs.toFixed(1) });
  });

  // ---- 5. spacing scale --------------------------------------------------------------------
  const off = new Map();
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el) || exempt(el)) return;
    const cs = getComputedStyle(el);
    ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'gap', 'rowGap', 'columnGap'].forEach(p => {
      const raw = cs[p];
      if (!raw || raw === 'normal' || raw === 'auto') return;
      const v = parseFloat(raw);
      if (isNaN(v) || v === 0 || v > 200) return;            // >200px is paper geometry declared in mm
      if (!CFG.spacingScale.includes(Math.round(v * 10) / 10) && !CFG.spacingScale.includes(Math.round(v))) {
        const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase();
        const k = cls + ' ' + p + '=' + (Math.round(v * 10) / 10) + 'px';
        off.set(k, (off.get(k) || 0) + 1);
      }
    });
  });
  if (off.size) V.push({ rule: 'spacing-off-scale', sev: 'MED', sel: '(document)', msg: 'values not on the spacing scale', values: [...off.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14) });

  // ---- 6. cross-page baseline and content edges --------------------------------------------
  const tops = [], lefts = [];
  pages.forEach((p, i) => {
    const inner = p.querySelector(CFG.inner);
    if (!inner) return;
    const pr = R(p), first = [...inner.children].find(c => R(c).height > 0);
    if (first) tops.push([i + 1, Math.round(R(first).top - pr.top)]);
    lefts.push([i + 1, Math.round(R(inner).left - pr.left)]);
  });
  if (tops.length) { const m = modeOf(tops.map(t => t[1])); tops.filter(([, v]) => v !== m).forEach(([pg, v]) => V.push({ rule: 'baseline-drift', sev: 'HIGH', sel: 'p' + pg, msg: 'first content element off the shared baseline', expected: m, actual: v })); }
  if (lefts.length) { const m = modeOf(lefts.map(t => t[1])); lefts.filter(([, v]) => v !== m).forEach(([pg, v]) => V.push({ rule: 'edge-drift', sev: 'HIGH', sel: 'p' + pg, msg: 'content left edge off grid', expected: m, actual: v })); }

  // ---- 7. repeated-block rhythm, and the gap under a full-bleed band ------------------------
  (CFG.rhythm || []).forEach(sel => {
    const pads = new Set();
    document.querySelectorAll(sel).forEach(q => { if (q.previousElementSibling) pads.add(getComputedStyle(q).paddingTop); });
    if (pads.size > 1) V.push({ rule: 'rhythm-inconsistent', sev: 'MED', sel, msg: 'repeated blocks use different top padding', values: [...pads] });
  });
  if (CFG.bandGap) {
    const gaps = new Set();
    document.querySelectorAll(CFG.bandGap.band).forEach(b => {
      const n = b.parentElement && b.parentElement.querySelector(CFG.bandGap.next);
      if (n) gaps.add(Math.round(R(n).top - R(b).bottom));
    });
    if (gaps.size) {
      const tight = [...gaps].filter(g => g < CFG.minBandGapPx);
      if (tight.length) V.push({ rule: 'band-gap-tight', sev: 'HIGH', sel: CFG.bandGap.band, msg: 'gap under the band is too tight', min: CFG.minBandGapPx, values: tight });
      if (gaps.size > 1) V.push({ rule: 'band-gap-inconsistent', sev: 'MED', sel: CFG.bandGap.band, msg: 'band gap differs across pages', values: [...gaps] });
    }
  }

  // ---- 8. optical cap alignment (ink, not boxes) --------------------------------------------
  (CFG.marginColumn || []).forEach(({ row, glyph, text }) => {
    document.querySelectorAll(row).forEach(r => {
      const g = r.querySelector(glyph), t = r.querySelector(text);
      if (!g || !t) return;
      const a = inkTop(g), b = inkTop(t);
      if (a != null && b != null && Math.abs(a - b) > CFG.capAlignTolerancePx)
        add('cap-misalign', 'HIGH', r, 'glyph ink top not aligned to the text cap height', { glyphInkTop: +a.toFixed(1), textInkTop: +b.toFixed(1), delta: +(a - b).toFixed(1) });
    });
  });
  (CFG.capAlign || []).forEach(({ scope, a: sa, b: sb, tolerance = 2 }) => {
    document.querySelectorAll(scope).forEach(s => {
      const ea = s.querySelector(sa), eb = s.querySelector(sb);
      if (!ea || !eb) return;
      const a = inkTop(ea), b = inkTop(eb);
      if (a != null && b != null && Math.abs(a - b) > tolerance)
        add('cap-misalign', 'HIGH', s, `${sa} ink top not aligned to ${sb}`, { delta: +(a - b).toFixed(1) });
    });
  });

  // ---- 8b. does the grid actually hold across components? ------------------------------------
  (CFG.columnAlign || []).forEach(({ scope, a: sa, pageB, label }) => {
    document.querySelectorAll(scope).forEach(s => {
      const page = s.closest(CFG.page);
      const ea = s.querySelector(sa), eb = page && page.querySelector(pageB);
      if (!ea || !eb) return;
      const d = Math.round(R(ea).left - R(eb).left);
      if (Math.abs(d) > 1) add('column-misalign', 'HIGH', s, label, { delta: d });
    });
  });

  // ---- 8c. centred text inside a clamped, non-centred box ------------------------------------
  // A max-width on an ancestor selector can silently clamp a caption; text-align:center then centres
  // it inside the clamped box, not inside the card. The caption looks off-centre and the CSS looks right.
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el)) return;
    const cs = getComputedStyle(el);
    if (cs.textAlign !== 'center') return;
    if (!/^(block|flow-root|list-item)$/.test(cs.display)) return;
    if (cs.marginLeft === 'auto' || cs.marginRight === 'auto') return;
    const par = el.parentElement;
    if (!par) return;
    const pcs = getComputedStyle(par);
    if (/(flex|grid|table)/.test(pcs.display)) return;                 // the parent owns placement
    const pl = parseFloat(pcs.paddingLeft), pr = parseFloat(pcs.paddingRight);
    const cw = R(par).width - pl - pr, ew = R(el).width;
    if (ew < cw - 1) {
      const pC = R(par).left + pl + cw / 2, eC = R(el).left + ew / 2;
      if (Math.abs(eC - pC) > 2)
        add('centre-drift', 'HIGH', el, 'centred text in a clamped, non-centred box', { drift: Math.round(eC - pC), boxW: Math.round(ew), containerW: Math.round(cw) });
    }
  });

  // ---- 8d. widows. Range-based: never mutate the DOM to measure it ---------------------------
  function lastLine(el) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const words = []; let n;
    while ((n = w.nextNode())) {
      const t = n.nodeValue, re = /\S+/g; let m;
      while ((m = re.exec(t))) {
        const r = document.createRange();
        r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const rc = r.getBoundingClientRect();
        if (rc.width > 0 || rc.height > 0) words.push({ w: m[0], t: Math.round(rc.top) });
      }
    }
    if (words.length < 5) return null;
    const lines = new Set(words.map(x => x.t));
    if (lines.size < 2) return null;
    const lastTop = Math.max(...words.map(x => x.t));
    const last = words.filter(x => x.t === lastTop);
    return { count: last.length, text: last.map(x => x.w).join(' '), lines: lines.size };
  }
  if (CFG.prose.length) document.querySelectorAll(flat(CFG.prose)).forEach(el => {
    if (!vis(el)) return;
    if (parseFloat(getComputedStyle(el).fontSize) < 11) return;
    const L = lastLine(el);
    if (L && L.count === 1) add('widow', 'MED', el, 'one-word last line', { word: L.text, lines: L.lines });
  });

  // ---- 8e. repeated siblings must be uniform (an odd height means one wrapped) ---------------
  (CFG.uniformRows || []).forEach(sel => {
    const kids = [...document.querySelectorAll(sel)];
    if (kids.length < 3) return;
    const hs = kids.map(k => Math.round(R(k).height));
    if (new Set(hs).size > 1) V.push({ rule: 'sibling-height-variance', sev: 'MED', sel, msg: 'repeated rows have unequal heights (one is wrapping)', heights: hs });
  });

  // ---- 8f. stretch voids: a big margin masquerading as composition ---------------------------
  // `margin-top:auto` and `justify-content:space-between` on an under-full page do not read as
  // generous. They read as holes. This is the single most common defect this system produces.
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el) || exempt(el)) return;
    const cs = getComputedStyle(el);
    ['marginTop', 'marginBottom'].forEach(p => {
      const v = parseFloat(cs[p]);
      if (v > CFG.maxVoidPx) add('stretch-void', 'MED', el, 'oversized margin creates a large void', { [p]: Math.round(v), max: CFG.maxVoidPx });
    });
  });

  // ---- 8g. orphan wrap row: a lone item on the last line -------------------------------------
  if (CFG.wrapRows.length) document.querySelectorAll(flat(CFG.wrapRows)).forEach(c => {
    const kids = [...c.children].filter(vis);
    if (kids.length < 4) return;
    const rows = {};
    kids.forEach(k => { const t = Math.round(R(k).top); (rows[t] = rows[t] || []).push(k); });
    const counts = Object.values(rows).map(r => r.length);
    if (counts.length > 1 && counts[counts.length - 1] === 1 && Math.max(...counts) > 1)
      add('orphan-row', 'MED', c, 'last wrapped row holds a single item', { rows: counts });
  });

  // ---- 8h. optical gutter: the glyph run, not the column box, must sit a constant gap away ----
  (function () {
    const gaps = [];
    (CFG.marginColumn || []).forEach(({ row, glyph, text }) => {
      document.querySelectorAll(row).forEach(r => {
        const g = r.querySelector(glyph), t = r.querySelector(text);
        if (!g || !t) return;
        const rng = document.createRange();
        rng.selectNodeContents(g);
        const run = rng.getBoundingClientRect();               // the glyph run's box, not the column's
        if (!run.width) return;
        gaps.push({ row: r, gap: Math.round(R(t).left - run.right) });
      });
    });
    if (gaps.length < 2) return;
    const m = modeOf(gaps.map(x => x.gap));
    gaps.filter(x => Math.abs(x.gap - m) > CFG.gutterTolerancePx).forEach(x =>
      add('optical-gutter', 'MED', x.row, 'glyph sits a different distance from its text than its peers', { gap: x.gap, expected: m }));
  })();

  // ---- 8i. overlays that rely on default paint order ------------------------------------------
  // An absolutely-positioned overlay covering a positioned parent that also holds inline text is
  // resolved by tree order when z-index is `auto`. It is one refactor away from painting underneath.
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'absolute' || cs.zIndex !== 'auto') return;
    const par = el.parentElement;
    if (!par || getComputedStyle(par).position === 'static') return;
    const pr = R(par), er = R(el);
    if (er.width < pr.width * 0.9 || er.height < pr.height * 0.9) return;   // not a full cover
    const ownText = [...par.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    if (ownText) add('overlay-paint-order', 'MED', el, 'full-cover overlay over inline text with z-index:auto; set an explicit z-index', {});
  });

  // ---- 9. contrast (WCAG AA), blending alpha up the ancestor chain ----------------------------
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const bgOf = el => {
    let e = el; const stack = [];
    while (e && e !== document.documentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;     // gradient or image: cannot resolve honestly
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
      e = e.parentElement;
    }
    if (!stack.length) return { r: 255, g: 255, b: 255 };
    let out = stack.pop();
    while (stack.length) { const t = stack.pop(); out = { r: t.r * t.a + out.r * (1 - t.a), g: t.g * t.a + out.g * (1 - t.a), b: t.b * t.a + out.b * (1 - t.a) }; }
    return out;
  };
  document.querySelectorAll(CFG.page + ' *').forEach(el => {
    if (!vis(el) || el.children.length || !(el.textContent || '').trim()) return;
    const cs = getComputedStyle(el), fg = parse(cs.color), bg = bgOf(el);
    if (!fg || !bg) return;
    const eff = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
    const L1 = lum(eff.r, eff.g, eff.b) + .05, L2 = lum(bg.r, bg.g, bg.b) + .05;
    const ratio = Math.max(L1, L2) / Math.min(L1, L2);
    const fs = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const need = (fs >= 24 || (fs >= 18.66 && bold)) ? 3 : 4.5;
    if (ratio < need) add('contrast', 'HIGH', el, 'below WCAG AA', { ratio: +ratio.toFixed(2), need, px: +fs.toFixed(1), text: (el.textContent || '').trim().slice(0, 26) });
  });

  const bySev = s => V.filter(v => v.sev === s).length;
  return { total: V.length, HIGH: bySev('HIGH'), MED: bySev('MED'), LOW: bySev('LOW'), violations: V };
}

// -------------------------------------------------------------------------------------------
const args = parseArgs();
const cfg = loadConfig(args.file, args.config);
const b = await open(args.file);
let report, crops = [];

try {
  report = await b.ev(`(${AUDIT.toString()})(${JSON.stringify(cfg)})`);

  if (args.out && cfg.crops?.length) {
    // Component crops at high zoom. A 794x1123 page thumbnailed into a review is a resolution at
    // which a 161px void reads as "generous whitespace". Crop, zoom, and OPEN THE IMAGES.
    await b.setDpr(3);
    await new Promise(r => setTimeout(r, 400));
    const rects = await b.ev(`(() => {
      const pages=[...document.querySelectorAll(${JSON.stringify(cfg.page)})];
      const out=[], seen=new Set();
      ${JSON.stringify(cfg.crops)}.forEach(s => document.querySelectorAll(s).forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.height < 12 || r.width < 12) return;
        const pg = pages.findIndex(p => p.contains(el)) + 1;
        const key = s + pg; if (seen.has(key)) return; seen.add(key);
        out.push({ name: s.replace(/[^a-z]/g,'') + '-p' + String(pg).padStart(2,'0'),
                   x: r.left+scrollX, y: r.top+scrollY,
                   w: Math.min(r.width, 780), h: Math.min(r.height, 720) });
      }));
      return out; })()`);
    for (const r of rects) crops.push(await b.shot(`${args.out}/${r.name}.png`, r, 2));
  }
} finally {
  await b.close();
}

if (args.json) {
  console.log(JSON.stringify({ ...report, crops, config: cfg.__source }, null, 1));
} else {
  const groups = {};
  for (const v of report.violations) (groups[v.rule] ||= []).push(v);
  console.log(`\n=== GUIDE QA - ${report.HIGH} HIGH / ${report.MED} MED / ${report.LOW} LOW ===`);
  console.log(`config: ${cfg.__source}\n`);
  for (const [rule, list] of Object.entries(groups)) {
    console.log(`[${list[0].sev}] ${rule}  (${list.length})`);
    for (const v of list.slice(0, 6)) {
      const extra = Object.entries(v).filter(([k]) => !['rule', 'sev', 'sel', 'msg'].includes(k))
        .map(([k, val]) => `${k}=${JSON.stringify(val)}`).join(' ');
      console.log(`   ${String(v.sel).padEnd(24)} ${v.msg}${extra ? '  { ' + extra + ' }' : ''}`);
    }
    if (list.length > 6) console.log(`   ... +${list.length - 6} more`);
    console.log('');
  }
  if (crops.length) {
    console.log(`${crops.length} component crops written to ${args.out}/`);
    console.log(`NOW OPEN THEM. A passing gate is not a reviewed page.\n`);
  }
}

process.exit(report.HIGH > 0 ? 1 : 0);
