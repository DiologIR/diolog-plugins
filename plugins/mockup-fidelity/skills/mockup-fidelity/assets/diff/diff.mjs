#!/usr/bin/env node
// mockup-fidelity computed-style DIFFER — the mechanical analytic.
//
// This is the piece that makes "I diffed both sides" true instead of aspirational.
// It compares the TARGET's rendered tree against the MOCK's COMPUTED styles, per
// element, per property, and writes a mismatch REPORT. The agent reads the report
// (which cannot skip a property) — eyeballing the raw dumps is exactly how real
// divergences get missed. Screenshots are a LATER, visual-only confirmation.
//
// Inputs:
//   --mock  <extract-mock.js output>            (the reference; immutable per pass)
//   --app   <target dump>                       RN harness dump, OR an extract-mock
//                                               dump of a React/DOM target
//   --anchor "<text>"                           a text on the target screen used to
//                                               scope a multi-screen RN dump (the RN
//                                               harness keeps tabs+pushed screens
//                                               mounted); pick the screen's title.
//   --out   <report.md>                         default .mockup-fidelity/diff/report.md
//   --geom / --no-geom                          force/disable the absolute rendered-
//                                               geometry checks (center-x/width/height).
//                                               Auto-ON when both sides are DOM at the
//                                               SAME viewport; --geom-tol-center /
//                                               --geom-tol-size override the tolerances.
//
// Match: every non-empty mock text (+ each placeholder) is a probe, matched to the
// target node with the same text (or same placeholder). Per match it diffs the
// TEXT (font size / weight / colour / gutter inset) and its nearest styled-ancestor
// BOX (background / radius / SHADOW / left-pad — this is how an inherited
// `.card.ai-card` shadow surfaces). Probes with no target match are listed for the
// human (a missing element OR an intentional content / icon-ligature swap).

import { readFileSync, writeFileSync } from 'node:fs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => {
    if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1]]);
    return a;
  }, []),
);
const APP = args.app, MOCK = args.mock;
const ANCHOR = args.anchor || null;
const OUT = args.out || '.mockup-fidelity/diff/report.md';
const TOL_PX = 1.5;
if (!APP || !MOCK) {
  console.error('usage: node diff.mjs --mock <extract.json> --app <dump.json> [--anchor TEXT] [--out report.md]');
  process.exit(2);
}

const load = p => {
  let v = JSON.parse(readFileSync(p, 'utf8'));
  if (typeof v === 'string') v = JSON.parse(v); // playwright-cli --filename double-encodes a returned string
  return v;
};
const appDoc = load(APP);
const appAll = Array.isArray(appDoc) ? appDoc : appDoc.nodes || [];
// A DOM target dump (extract-mock run against a live React/Next route — the
// web↔web case) carries `comp` per node and a top-level `frame`; an RN harness
// dump carries `effStyle`/`style` and `id`. Detecting it lets the few RN-specific
// heuristics below (the id-keyed ancestor map, the RNS* screen-bg wrappers, the
// device width) take a DOM-correct branch instead of silently degrading.
const APP_IS_DOM = appAll.some(n => n && n.comp);
const mockDoc = load(MOCK);
if (mockDoc.error) { console.error('mock extract error:', JSON.stringify(mockDoc)); process.exit(2); }
const mock = mockDoc.nodes;

// ---------- normalisers ----------
const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim();
function toHex(c) {
  if (c == null) return null;
  let s = String(c).trim().toLowerCase();
  if (!s || s === 'transparent' || s === 'none') return 'transparent';
  if (s.startsWith('#')) return s.length === 4 ? '#' + [...s.slice(1)].map(x => x + x).join('') : s.slice(0, 7);
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map(x => parseFloat(x));
    if (p.length >= 4 && p[3] === 0) return 'transparent';
    return '#' + p.slice(0, 3).map(n => Math.round(n).toString(16).padStart(2, '0')).join('');
  }
  return s;
}
const px = v => { if (v == null) return null; if (typeof v === 'number') return v; const m = String(v).match(/-?[\d.]+/); return m ? parseFloat(m[0]) : null; };
function weightFromFamily(fam) {
  if (!fam) return null;
  if (/SemiBold|_600|Semibold/.test(fam)) return 600;
  if (/Medium|_500/.test(fam)) return 500;
  if (/Bold|_700|800|900/.test(fam)) return 700;
  if (/Regular|_400|Normal/.test(fam)) return 400;
  return null;
}
const close = (a, b, t = TOL_PX) => a != null && b != null && Math.abs(a - b) <= t;
// Typeface KIND — the weight check can't tell serif 500 from sans 500, so a
// serif-vs-sans swap slips by. Note: the generic `sans-serif` fallback contains
// the substring "serif", so exclude it explicitly.
function familyKind(fam) {
  if (!fam) return null;
  if (/Mono|JetBrains/i.test(fam)) return 'mono';
  if (/Newsreader|Georgia|GT Super|Times/i.test(fam)) return 'serif';
  if (/\bserif\b/i.test(fam) && !/sans-?serif/i.test(fam)) return 'serif';
  return 'sans';
}
const alignNorm = a => {
  const v = String(a ?? 'left');
  return v === 'start' ? 'left' : v === 'end' ? 'right' : v;
};

// ---------- target (app) accessors — RN harness OR extract-mock(DOM) shape ----------
const A = {
  text: n => norm(n.text),
  placeholder: n => norm(n.placeholder ?? (n.isPh ? n.text : '')),
  fontSize: n => n.effStyle?.fontSize ?? px(n.comp?.fontSize),
  weight: n => weightFromFamily(n.effStyle?.fontFamily) ?? (n.comp?.fontWeight ? parseInt(n.comp.fontWeight, 10) : null),
  family: n => familyKind(n.effStyle?.fontFamily ?? n.comp?.fontFamily),
  align: n => alignNorm(n.effStyle?.textAlign ?? n.comp?.textAlign),
  color: n => toHex(n.effStyle?.color ?? n.comp?.color),
  phColor: n => toHex(n.placeholderTextColor ?? n.comp?.color),
  lineHeight: n => n.effStyle?.lineHeight ?? px(n.comp?.lineHeight) ?? null,
  rect: n => n.rect,
  box: n => {
    const s = n.style || {};
    if (n.comp) { // DOM target
      const c = n.comp;
      return {
        bg: toHex(c.backgroundColor), radius: px(c.borderTopLeftRadius),
        padLeft: px(c.paddingLeft), padTop: px(c.paddingTop), padBottom: px(c.paddingBottom),
        shadow: !!c.boxShadow && c.boxShadow !== 'none',
      };
    }
    const hasShadow = (s.shadowRadius > 0 && s.shadowOpacity > 0) || s.elevation > 0;
    return {
      bg: toHex(s.backgroundColor), radius: s.borderRadius ?? s.borderTopLeftRadius,
      padLeft: s.paddingLeft ?? s.paddingHorizontal ?? s.padding,
      padTop: s.paddingTop ?? s.paddingVertical ?? s.padding,
      padBottom: s.paddingBottom ?? s.paddingVertical ?? s.padding,
      shadow: hasShadow,
    };
  },
  isBox: n => {
    const b = A.box(n);
    return b.bg && b.bg !== 'transparent' || b.shadow || (n.style?.borderWidth > 0) || (n.comp && px(n.comp.borderTopWidth) > 0);
  },
};

// scope a multi-screen RN dump to the screen under test
// Key by id (RN harness) OR by i (extract-mock DOM dump, which has NO `id` — its
// node index is `i` and `parent` references that index). Without the `?? n.i`
// fallback every DOM node keys to `undefined`, so appStyledAncestor's parent-walk
// dies and every ▸box property reports `target=undefined` (the DOM-target bug).
const appById = new Map(appAll.map(n => [n.id ?? n.i, n]));
let app = appAll;
let scr = null;
if (ANCHOR) {
  const cands = appAll.filter(n => A.text(n) === ANCHOR);
  const anchor = cands.sort((a, b) => (A.fontSize(b) || 0) - (A.fontSize(a) || 0))[0];
  if (anchor && anchor.scr != null) { scr = anchor.scr; app = appAll.filter(n => n.scr === scr); }
}
// For a DOM target prefer the extracted frame width (symmetric with the mock's
// frame width) so web↔web geometry compares like-for-like AND the `scrolled` guard
// below can correctly skip horizontally-overflowing content (a kanban board, a tab
// strip). For RN the device width isn't in the dump, so fall back to the content
// extent (max x+w).
const appContentW = Math.max(...app.map(n => (A.rect(n)?.x || 0) + (A.rect(n)?.w || 0)), 0);
const appFrameW = (APP_IS_DOM && appDoc.frame?.w) || appContentW || (mockDoc.frame?.w || 393);
const mockFrameW = mockDoc.frame?.w || 393;

// ---------- RENDERED-GEOMETRY assertions (web↔web / same-viewport) ----------
// The gutter-inset checks above are deliberately frame-width-AGNOSTIC (left-inset for
// left-anchored, right-inset for right-pinned) so an RN device width ≠ the mock frame
// width doesn't fire false positives. That very design makes them BLIND to a whole
// class of real defects that only show as ABSOLUTE rendered geometry:
//   • a centred element translated sideways (a nav link grouped left vs centred — its
//     gutter inset is "fine" on neither edge, so nothing flagged the 350px shift)
//   • an element rendered WIDER/NARROWER than the mock (a heading constrained to the
//     wrong max-width so it wraps at the wrong word; a panel sized 528 vs 468)
//   • an element TALLER/SHORTER (a heading that wraps to 3 lines vs 2; a control whose
//     box grew) — and width is also a faithful proxy for a single-line label's tracking.
// When BOTH sides are DOM at the SAME viewport, absolute x/w/h ARE comparable, so add
// center-x / width / height checks. Auto-enabled only then (frames within 5%); force
// with --geom, disable with --no-geom. Tolerances: center 6px, size 10px (loose enough
// to ignore sub-pixel font-rendering jitter, tight enough to catch every layout delta).
const sameViewport = APP_IS_DOM && mockDoc.frame?.w && Math.abs(appFrameW - mockFrameW) < 0.05 * mockFrameW;
const GEOM = args['no-geom'] ? false : (args.geom ? true : sameViewport);
const GEOM_TOL_CENTER = px(args['geom-tol-center']) ?? 6;
const GEOM_TOL_SIZE = px(args['geom-tol-size']) ?? 10;
// HEIGHT is a discrete layout dimension (line-count, box height) — a tight tolerance
// catches a button rendered 3px short (a `line-height:1` vs `normal`), where the 10px
// width tolerance (content-driven, noisy) is too loose. Override with --geom-tol-height.
const GEOM_TOL_HEIGHT = px(args['geom-tol-height']) ?? 2;
// CSS `line-height: normal` ≈ this × font-size (Inter/most sans ~1.2). Lets us compare a
// mock's `normal` (unparseable as px) against a target that forces a tight `line-height:1`.
const NORMAL_LH = 1.2;

// The element whose own box we compare. Crucially, check the text node ITSELF
// first: when a mock label sits directly on a styled element (a `.btn`/`.badge`
// span whose directText IS the label), the box to compare is THAT element, not
// its parent card — otherwise the walk skips to the card and you diff the app's
// button against the mock's CARD (an element-vs-container false mismatch on
// bg/radius/pad). The app side is naturally symmetric — its label is a child
// <Text> of the styled View, so self isn't a box and the walk finds the View —
// and self-first on both keeps them aligned for the rare app text node that is
// itself styled.
function appStyledAncestor(node) {
  if (A.isBox(node)) return node;
  let cur = appById.get(node.parent); let hops = 0;
  while (cur && hops++ < 12) { if (A.isBox(cur)) return cur; cur = appById.get(cur.parent); }
  return null;
}
function mockOwnBox(node) {
  const c = node.comp || {};
  const box = (toHex(c.backgroundColor) !== 'transparent' && c.backgroundColor) || (c.boxShadow && c.boxShadow !== 'none') || px(c.borderTopWidth) > 0;
  return box && node.tag !== 'body' && !/\b(body|scr|frame|screen)\b/.test(node.cls);
}
function mockStyledAncestor(node) {
  if (mockOwnBox(node)) return node;
  let cur = node.parent >= 0 ? mock[node.parent] : null; let hops = 0;
  while (cur && hops++ < 12) {
    if (mockOwnBox(cur)) return cur;
    cur = cur.parent >= 0 ? mock[cur.parent] : null;
  }
  return null;
}
const mockHasShadow = c => !!c && !!c.boxShadow && c.boxShadow !== 'none';

// letter-spacing in px — `normal` resolves to 0 (its rendered value for tracking).
const lsPx = v => { if (v == null) return null; if (/normal/i.test(String(v))) return 0; return px(v); };

// The nearest BUTTON/LINK-styled ancestor of a text node — an <a>/<button>, or a styled box
// that looks like a control (has a background/border + a small height + horizontal padding).
// Used for the button-arrow / button-geometry / tracking checks (improvement B): the mock's
// label is a text span INSIDE the <a>, so the arrow/height/width live on the ancestor.
function isButtonish(n) {
  if (!n) return false;
  if (n.tag === 'a' || n.tag === 'button') return true;
  const c = n.comp || {};
  const r = n.rect || {};
  const hasBox = (toHex(c.backgroundColor) !== 'transparent' && c.backgroundColor) || (c.boxShadow && c.boxShadow !== 'none') || (px(c.borderTopWidth) > 0) || px(c.borderTopLeftRadius) >= 4;
  return !!hasBox && r.h > 0 && r.h <= 64 && px(c.paddingLeft) >= 8;
}
function buttonAncestor(node, byId) {
  let cur = node, hops = 0;
  while (cur && hops++ < 6) { if (isButtonish(cur)) return cur; cur = byId.get(cur.parent); }
  return null;
}
function mockButtonAncestor(node) {
  let cur = node, hops = 0;
  while (cur && hops++ < 6) { if (isButtonish(cur)) return cur; cur = cur.parent >= 0 ? mock[cur.parent] : null; }
  return null;
}

// ---------- diff ----------
const rows = [], oks = [], unmatched = [];
const rec = (el, prop, a, m, ok) => rows.push({ el, prop, app: a, mock: m, ok });
const CHROME_TXT = /^\d{1,2}:\d{2}$|signal_cellular|wifi|battery_full/;

// SIBLING-GAP — the vertical gap from an element to its NEXT sibling. Padding checks see a
// box's own padding, but the gap BETWEEN two siblings (an icon-row → its label, one card → the
// next card, a heading → its body) is a flex/grid `gap` or margin the per-box diff misses. Map
// children by parent once, then compare each matched element's gap-to-next-sibling on both sides.
const childrenByParent = arr => { const m = new Map(); for (const n of arr) { if (!m.has(n.parent)) m.set(n.parent, []); m.get(n.parent).push(n); } for (const v of m.values()) v.sort((a, b) => (a.i ?? 0) - (b.i ?? 0)); return m; };
const mockKids = childrenByParent(mock), appKids = childrenByParent(appAll);
const nextSibGap = (node, kids) => { const sibs = kids.get(node.parent); if (!sibs) return null; const idx = sibs.indexOf(node); const nx = sibs[idx + 1]; if (!nx || !node.rect || !nx.rect || nx.rect.h <= 0 || node.rect.h <= 0) return null; return +(nx.rect.y - (node.rect.y + node.rect.h)).toFixed(1); };

// ---- SCREEN BACKGROUND (top-level, NOT tied to a text probe) ----
// The per-element box check only reaches the nearest styled ancestor of a matched
// text node — text sits in a card, so the walk stops there and the screen root is
// never compared. Diff it explicitly: the mock frame root vs the shallowest
// APP-rendered backgrounded container (skip native RNS* wrappers, which carry a
// default opaque bg ABOVE the app's own root and would mask it).
{
  const mockBg = toHex(mock[0]?.comp?.backgroundColor);
  const isRNS = t => /^RNS/.test(t || '');
  // Device width from the native wrapper (appFrameW can be inflated by off-screen
  // horizontally-scrollable content like a tab strip). The screen root sits at the
  // left edge and spans ~the device width; a tinted banner/header (x≠0) or a card
  // (margins) does not, and would otherwise win on depth.
  // DOM target: the device/frame width is the extracted frame width (no RNS*
  // wrappers exist). RN: take it from the native screen wrappers.
  const deviceW = APP_IS_DOM
    ? (appDoc.frame?.w || appFrameW)
    : (Math.max(...app.filter(n => isRNS(n.type)).map(n => n.rect?.w || 0), 0) || appFrameW);
  const appRoot = app
    .filter(n => {
      const bg = n.style?.backgroundColor ?? (n.comp && n.comp.backgroundColor);
      const r = n.rect || {};
      const isRoot = (r.x ?? 99) <= 2 && (r.w || 0) >= 0.9 * deviceW;
      return bg && toHex(bg) !== 'transparent' && !isRNS(n.type) && isRoot;
    })
    .sort((a, b) => (a.depth ?? 99) - (b.depth ?? 99))[0];
  const appBg = appRoot ? toHex(appRoot.style?.backgroundColor ?? appRoot.comp?.backgroundColor) : null;
  if (mockBg && mockBg !== 'transparent') rec('[screen background]', 'background', appBg, mockBg, appBg === mockBg);
}

for (const mn of mock) {
  const isPh = mn.isPh, text = norm(mn.text);
  if (!text && !isPh) continue;
  if (CHROME_TXT.test(text)) continue;

  // REPEATED-TEXT DISAMBIGUATION (improvement B) — when the probe text is NON-unique
  // (e.g. "Book a demo" appears in nav, hero AND the cta-band), `app.find` returns the
  // FIRST match, so the cta-band instance is never compared to live's cta-band instance
  // (it mispairs to the nav button). Instead: collect ALL same-text app candidates and
  // pick the one whose VERTICAL position best matches this mock node's — normalised by
  // frame height so the two pages' accumulated drift cancels. With a single candidate
  // this is identical to the old behaviour; with several it pairs by structural position.
  const cands = isPh
    ? app.filter(n => A.placeholder(n) === text)
    : app.filter(n => A.text(n) === text);
  let an;
  if (cands.length <= 1) an = cands[0];
  else {
    const mYrel = (mn.rect?.y ?? 0) / (mockFrameW ? (mockDoc.frame?.h || 1) : 1);
    const mYn = (mn.rect?.y ?? 0) / (mockDoc.frame?.h || 1);
    an = cands
      .map(n => ({ n, d: Math.abs(((A.rect(n)?.y ?? 0) / (appDoc.frame?.h || mockDoc.frame?.h || 1)) - mYn) }))
      .sort((a, b) => a.d - b.d)[0].n;
  }
  if (!an) { if (text) unmatched.push({ text, tag: mn.tag, cls: mn.cls }); continue; }

  const elName = isPh ? `[placeholder] "${text}"` : `"${text}"`;
  const before = rows.length;

  if (!isPh) {
    const mFs = px(mn.comp.fontSize); if (mFs != null) rec(elName, 'font-size', A.fontSize(an), mFs, close(A.fontSize(an), mFs, 0.6));
    const mW = parseInt(mn.comp.fontWeight, 10); if (mW) rec(elName, 'font-weight', A.weight(an), mW, A.weight(an) === mW);
    const mC = toHex(mn.comp.color); if (mC && mC !== 'transparent') rec(elName, 'color', A.color(an), mC, A.color(an) === mC);
    // line-height: easy to leave unset in RN (font default ≈ 1.2×), which renders
    // tighter than the mock's CSS line-height (commonly 1.5× font-size) and
    // shrinks every multi-line block. A `null` target value is a real miss.
    // line-height: easy to leave unset (RN font default ≈ 1.2×) OR force too tight
    // (`line-height: 1`), both of which render shorter than the mock and shrink every
    // block + box. The mock's value is often the keyword `normal`, which `px()` can't
    // parse — resolve it to NORMAL_LH×font-size so a target that forces a tight numeric
    // line-height still gets compared (this is the button-height-via-line-height miss).
    const aLh = A.lineHeight(an);
    let mLh = px(mn.comp.lineHeight);
    if (mLh == null && /normal/i.test(mn.comp.lineHeight || '') && px(mn.comp.fontSize) != null) {
      mLh = px(mn.comp.fontSize) * NORMAL_LH;
    }
    if (mLh != null) rec(elName, 'line-height', aLh, mLh, close(aLh, mLh, Math.max(2, 0.12 * (px(mn.comp.fontSize) || 16))));
    // typeface kind (serif/sans/mono) — catches a serif-vs-sans swap the weight
    // check is blind to. text-align catches centred-vs-left (quiet when both left).
    const mFam = familyKind(mn.comp.fontFamily);
    if (mFam) rec(elName, 'font-family', A.family(an), mFam, A.family(an) === mFam);
    rec(elName, 'text-align', A.align(an), alignNorm(mn.comp.textAlign), A.align(an) === alignNorm(mn.comp.textAlign));
    // text-wrap: `balance` vs `wrap` changes WHERE a multi-word heading breaks, even when the
    // line fits — geometry can't catch it (the box width is similar). Normalise the shorthand
    // (`balance`) and the longhand (`textWrapStyle: balance`) to one token, compare on the
    // multi-word case only (a single word never wraps, so wrap-mode is moot there).
    const wrapOf = c => /balance/.test(`${c.textWrap || ''} ${c.textWrapStyle || ''}`) ? 'balance'
      : /pretty/.test(`${c.textWrap || ''} ${c.textWrapStyle || ''}`) ? 'pretty' : 'wrap';
    if (/\s/.test(text)) { const mw = wrapOf(mn.comp), aw = an.comp ? wrapOf(an.comp) : 'wrap'; rec(elName, 'text-wrap', aw, mw, aw === mw); }
    // HARD BREAK + LINE COUNT — a `<br>` inside a heading reads as identical text but breaks the
    // wrap differently ("One workspace.<br>Four…" vs greedy). Compare the explicit-break flag and
    // the rendered line count (a different line count = a real, visible wrap difference).
    if (mn.hardBreak !== undefined) rec(elName, 'hard-break(<br>)', !!an.hardBreak, !!mn.hardBreak, !!an.hardBreak === !!mn.hardBreak);
    if (mn.lines != null && an.lines != null) rec(elName, 'line-count', an.lines, mn.lines, an.lines === mn.lines);
    // BACKGROUND MEDIA LAYER — a hero "gradient" / texture is often an <img>/<canvas>/<svg>
    // child, invisible to a `background-image` computed-style check. Compare presence+type.
    if (mn.bgLayer) rec(elName, 'bg-media-layer', an.bgLayer ? an.bgLayer.tag : 'none', mn.bgLayer.tag, !!an.bgLayer && an.bgLayer.tag === mn.bgLayer.tag);
    // WRAP-POINT (improvement C) — the line COUNT can match while the BREAK POSITION differs
    // (a tagline that wraps after a different word). Compare the FIRST rendered line's text:
    // if both sides wrap but line 1 ends on a different word, flag it. (line-count already
    // covers the unequal-count case; this is the equal-count, different-break case.)
    if (mn.wrap && an.wrap && mn.wrap.first && an.wrap.first) {
      rec(elName, 'wrap-point(line1)', JSON.stringify(an.wrap.first), JSON.stringify(mn.wrap.first), an.wrap.first === mn.wrap.first);
    }
    // RENDERED-FONT (improvement D) — the declared font-family can MATCH while the element
    // actually renders in a FALLBACK (the named face never applied on this origin). The
    // extractor's glyph-metric fingerprint (fontRn) says whether the first declared family is
    // truly rendering. Flag when the reference renders its named face but the target does NOT
    // (declared-vs-rendered drift) — this is the governance-bullet / role-views-body "wrong
    // font" class, invisible to font-size / family-kind / family-not-loaded (all match).
    if (mn.fontRn && an.fontRn && mn.fontRn.family.toLowerCase() === an.fontRn.family.toLowerCase()) {
      if (mn.fontRn.rendering && !an.fontRn.rendering) {
        rec(elName, 'rendered-font',
          `fallback (${an.fontRn.family} declared, not applied)`,
          `${mn.fontRn.family} (applied)`, false);
      }
    }
    // BUTTON ARROW + GEOMETRY + TRACKING (improvement B) — once a cta-band button pairs to the
    // RIGHT instance (position-disambiguated above), compare the things that distinguish a
    // mock button from a heavier target one: a trailing ARROW (svg child), the button HEIGHT &
    // WIDTH (left/right-anchored buttons are skipped by the centred-only 📐 geometry, so check
    // them explicitly here), and letter-spacing. Scoped to genuine button/link-styled nodes so
    // it doesn't fire on prose. Compare the styled ancestor's box (the <a>/<button>) for svg &
    // geometry, since the mock probe's text node sits inside it.
    {
      const aBtn = buttonAncestor(an, appById), mBtn = mockButtonAncestor(mn);
      if (mBtn && aBtn) {
        if (mBtn.hasSvgChild !== undefined)
          rec(elName, 'button-arrow(svg)', !!aBtn.hasSvgChild, !!mBtn.hasSvgChild, !!aBtn.hasSvgChild === !!mBtn.hasSvgChild);
        if (mBtn.rect && aBtn.rect) {
          rec(elName, 'button-height', Math.round(aBtn.rect.h), Math.round(mBtn.rect.h), close(aBtn.rect.h, mBtn.rect.h, 3));
          rec(elName, 'button-width', Math.round(aBtn.rect.w), Math.round(mBtn.rect.w), close(aBtn.rect.w, mBtn.rect.w, 8));
        }
        const mLs = lsPx(mBtn.comp?.letterSpacing), aLs = lsPx(aBtn.comp?.letterSpacing);
        if (mLs != null && aLs != null) rec(elName, 'button-letter-spacing', aLs, mLs, close(aLs, mLs, 0.2));
      }
    }
    // gap to the next sibling (and to the previous — catches a NON-text leading row like an icon
    // tile whose gap to this label is the only signal). Same-viewport only; tolerate 3px.
    if (GEOM) {
      const mGn = nextSibGap(mn, mockKids), aGn = nextSibGap(an, appKids);
      if (mGn != null && aGn != null && (mGn > 1 || aGn > 1)) rec(elName, 'gap→next-sibling', aGn, mGn, close(aGn, mGn, 3));
      const mSibs = mockKids.get(mn.parent), aSibs = appKids.get(an.parent);
      const mPrev = mSibs && mSibs[mSibs.indexOf(mn) - 1], aPrev = aSibs && aSibs[aSibs.indexOf(an) - 1];
      if (mPrev && aPrev && mPrev.rect && aPrev.rect && mn.rect && an.rect) {
        const mGp = +(mn.rect.y - (mPrev.rect.y + mPrev.rect.h)).toFixed(1), aGp = +(an.rect.y - (aPrev.rect.y + aPrev.rect.h)).toFixed(1);
        if (mGp > 1 || aGp > 1) rec(elName, 'gap←prev-sibling', aGp, mGp, close(aGp, mGp, 3));
      }
    }
  } else {
    const mC = toHex(mn.comp.color); rec(elName, 'placeholder-color', A.phColor(an), mC, A.phColor(an) === mC);
    const mFs = px(mn.comp.fontSize); if (mFs != null) rec(elName, 'font-size', A.fontSize(an), mFs, close(A.fontSize(an), mFs, 0.6));
  }

  // gutter inset. Compare the edge an element is anchored to (frame widths differ).
  // CRITICAL: the LEFT edge of a LEFT-anchored element is a real gutter inset even
  // when the element is also WIDE — a list-row TITLE flexes to fill the row, so its
  // text node spans wide (left- AND right-anchored), and the old `wide` skip dropped
  // its left-inset entirely. That is exactly how the Invest "CommSec" title (app x=84
  // vs mock 66, w≈280) passed silently. So: check left-inset whenever left-anchored;
  // check right-inset only when right-anchored AND NOT left-anchored (a genuinely
  // right-pinned element, whose right edge isn't content-driven).
  const ar = A.rect(an), aX = ar?.x, aW = ar?.w, mX = mn.rect?.x, mW = mn.rect?.w;
  if (aX != null && mX != null) {
    const leftAnch = mX < 0.33 * mockFrameW, rightAnch = mX + (mW || 0) > 0.67 * mockFrameW;

    // ROW EDGES — the leftmost / rightmost content node sharing this probe's vertical
    // band, on both sides. Catches a row whose content is pushed in by a leading
    // TILE/ICON/AVATAR (never probed, it's non-text) or whose trailing ICON/BADGE is
    // displaced — the brokers' tile at x=36 vs mock 20, open_in_new vs ASX badge.
    const rowEdges = (nodes, getRect, cy, frameW) => {
      let min = Infinity, max = -Infinity;
      for (const n of nodes) {
        const r = getRect(n); if (!r || r.w <= 0 || r.x == null) continue;
        if (r.w >= 0.9 * frameW && (r.x || 0) <= 2) continue; // page/section full-bleed bg
        if (r.y <= cy && r.y + r.h >= cy) { min = Math.min(min, r.x); max = Math.max(max, r.x + r.w); }
      }
      return { min, max };
    };
    const me = rowEdges(mock, n => n.rect, mn.rect.y + mn.rect.h / 2, mockFrameW);
    const ae = rowEdges(app, A.rect, ar.y + ar.h / 2, appFrameW);
    // A horizontally-scrolled row (a tab strip) has content off-screen left/right —
    // its x is scroll-position-dependent, not a gutter, so skip ALL geometry for it
    // (kills the false positives the company tab strip would otherwise emit).
    const scrolled = ae.min < -2 || ae.max > appFrameW + 2;

    if (!scrolled) {
      if (leftAnch) rec(elName, 'left-inset', aX, mX, close(aX, mX));
      if (rightAnch && !leftAnch && aW != null && mW != null) {
        rec(elName, 'right-inset', +(appFrameW - (aX + aW)).toFixed(1), +(mockFrameW - (mX + mW)).toFixed(1),
          close(appFrameW - (aX + aW), mockFrameW - (mX + mW)));
      }
      if (isFinite(me.min) && isFinite(ae.min) && me.min < 0.5 * mockFrameW)
        rec(elName, 'row-left-inset', +ae.min.toFixed(1), +me.min.toFixed(1), close(ae.min, me.min));
      if (isFinite(me.max) && isFinite(ae.max) && (mockFrameW - me.max) < 0.5 * mockFrameW)
        rec(elName, 'row-right-inset', +(appFrameW - ae.max).toFixed(1), +(mockFrameW - me.max).toFixed(1), close(appFrameW - ae.max, mockFrameW - me.max));

      // ABSOLUTE rendered geometry (same-viewport only) — the class the inset checks miss.
      // SCOPE it to the inset model's actual blind spot to stay low-noise: a CENTERED
      // element (neither left- nor right-anchored) is exactly what left-inset/right-inset
      // can't verify — and a sideways translation of one (a nav link grouped left vs
      // centred) is invisible to them. So check center-x + width ONLY when centred; on a
      // left-aligned block the left edge is already inset-checked and its WIDTH is
      // container-vs-content-driven (block reports its box, a Framer node reports text-fit)
      // → pure noise. HEIGHT (wrap-count / box growth) is anchor-independent, so check it
      // for all. Findings still need the usual classification (a repeated-text mispair, or
      // a wrapper-vs-bare-text pairing, inflates a delta — confirm before fixing).
      if (GEOM && aW != null && mW != null) {
        const centered = !leftAnch && !rightAnch;
        if (centered) {
          const aCx = aX + aW / 2, mCx = mX + mW / 2;
          rec(elName, '📐 center-x', Math.round(aCx), Math.round(mCx), close(aCx, mCx, GEOM_TOL_CENTER));
          rec(elName, '📐 width', Math.round(aW), Math.round(mW), close(aW, mW, GEOM_TOL_SIZE));
        }
        const aH = ar?.h, mH = mn.rect?.h;
        if (aH != null && mH != null) rec(elName, '📐 height', Math.round(aH), Math.round(mH), close(aH, mH, GEOM_TOL_HEIGHT));
      }
    }
  }

  // nearest styled-ancestor BOX
  const ab = appStyledAncestor(an), mb = mockStyledAncestor(mn);
  if (mb) {
    const abox = ab ? A.box(ab) : {};
    rec(`${elName} ▸ box`, 'background', abox.bg, toHex(mb.comp.backgroundColor), abox.bg === toHex(mb.comp.backgroundColor));
    const mR = px(mb.comp.borderTopLeftRadius); if (mR != null) rec(`${elName} ▸ box`, 'border-radius', abox.radius, mR, close(abox.radius, mR, 2.5));
    rec(`${elName} ▸ box`, 'shadow', abox.shadow ? 'yes' : 'no', mockHasShadow(mb.comp) ? 'yes' : 'no', !!abox.shadow === mockHasShadow(mb.comp));
    const mPL = px(mb.comp.paddingLeft); if (mPL != null) rec(`${elName} ▸ box`, 'pad-left', abox.padLeft, mPL, close(abox.padLeft, mPL));
    // vertical padding — diffed too, so a card with the right pad-left but wrong
    // pad-top/bottom no longer passes silently.
    const mPT = px(mb.comp.paddingTop); if (mPT != null) rec(`${elName} ▸ box`, 'pad-top', abox.padTop, mPT, close(abox.padTop, mPT));
    const mPB = px(mb.comp.paddingBottom); if (mPB != null) rec(`${elName} ▸ box`, 'pad-bottom', abox.padBottom, mPB, close(abox.padBottom, mPB));
  }

  if (rows.slice(before).every(r => r.ok)) oks.push(elName);
}

// ---------- FONT FACES — synthesis risk + missing family (top-level) ----------
// A face declared with a WEIGHT RANGE (e.g. "100 900") from one file makes the browser
// FAUX-WEIGHT-SYNTHESIZE every other weight → blurry text on HiDPI (the diolog body text). The
// reference instead loads discrete STATIC instances (400/500/600). Flag a range-weight face on
// the app when the mock has none, and any mock font family the app didn't load (→ fallback).
{
  const mockFonts = mockDoc.fonts || [], appFonts = appDoc.fonts || [];
  const isRange = w => /\s/.test(String(w)); // "100 900"
  const appRange = appFonts.find(f => isRange(f.weight) && !/placeholder/i.test(f.family));
  const mockHasRange = mockFonts.some(f => isRange(f.weight));
  if (appRange && mockFonts.length && !mockHasRange) {
    const mockWeights = mockFonts.filter(f => f.family.toLowerCase() === appRange.family.toLowerCase()).map(f => f.weight).join('/') || 'static instances';
    rec(`[fonts] ${appRange.family}`, 'weight-range-synthesis-risk', appRange.weight, mockWeights, false);
  }
  const appFamilies = new Set(appFonts.map(f => f.family.toLowerCase()));
  for (const fam of new Set(mockFonts.filter(f => !/placeholder/i.test(f.family)).map(f => f.family))) {
    if (!appFamilies.has(fam.toLowerCase())) rec(`[fonts] ${fam}`, 'family-not-loaded', 'absent', 'loaded', false);
  }
}

// ---------- ICON GLYPH sizes (no text → the text-probe loop never reaches them) ----------
// An icon's element box can match while its drawn glyph differs — a 12px <svg> box holds a
// 6×3 OR an 8×4 chevron, and the text-driven loop never measures a bare <svg> at all (the
// documented "standalone icons" blind spot). Pair mock↔app icons by POSITION (same viewport
// only — geometry must be comparable), then diff the visible glyph extent captured in the
// dump (`glyph`). Co-located within GEOM_TOL_CENTER×4 so a genuinely-absent icon stays
// unmatched (a real signal) instead of pairing to a distant one.
if (GEOM) {
  const mockIcons = mock.filter(n => n.glyph && n.glyph.w > 0);
  const appIcons = app.filter(n => n.glyph && n.glyph.w > 0);
  const usedApp = new Set();
  for (const mi of mockIcons) {
    const mcx = mi.rect.x + mi.rect.w / 2, mcy = mi.rect.y + mi.rect.h / 2;
    let best = null, bestD = Infinity;
    for (const ai of appIcons) {
      if (usedApp.has(ai.i)) continue;
      const d = Math.hypot((ai.rect.x + ai.rect.w / 2) - mcx, (ai.rect.y + ai.rect.h / 2) - mcy);
      if (d < bestD) { bestD = d; best = ai; }
    }
    if (best && bestD <= GEOM_TOL_CENTER * 4) {
      usedApp.add(best.i);
      const label = `[icon @${Math.round(mcx)},${Math.round(mcy)}]`;
      rec(label, '📐 icon-glyph-w', best.glyph.w, mi.glyph.w, close(best.glyph.w, mi.glyph.w, 1.5));
      rec(label, '📐 icon-glyph-h', best.glyph.h, mi.glyph.h, close(best.glyph.h, mi.glyph.h, 1.5));
    }
  }
}

// ---------- NON-TEXT CONTAINER PASS (improvement A) ----------
// The text-probe differ only style-checks elements it pairs BY TEXT (or their nearest styled
// ancestor), so it is BLIND to section / card / divider CONTAINERS that carry no text — a
// section with a gradient/media-layer bg, a card's border, a page-wide hairline. Match those
// containers STRUCTURALLY (by a tag-path key, the same approach as structure-diff.mjs) and
// compare: background-color, a full-bleed media/gradient LAYER (fullBleedMedia), border
// (top/bottom width+colour, folded from ::after) + radius, box-shadow, and a thin-line DIVIDER.
// This is where cases 1 (section gradient flat on target), 4 (missing footer rule) and 8
// (role-views cards lost their border) surface — none of which any text probe can reach.
{
  // structural path: tag chain + child-index from root (stable identity without text)
  const kidsByParent = arr => { const m = new Map(); for (const n of arr) { if (!m.has(n.parent)) m.set(n.parent, []); m.get(n.parent).push(n); } return m; };
  const mKidsP = kidsByParent(mock), aKidsP = kidsByParent(appAll);
  const pathOf = (nodes, kids, n) => {
    const parts = []; let cur = n, hops = 0;
    while (cur && cur.parent >= 0 && hops++ < 40) {
      const sibs = kids.get(cur.parent) || [];
      parts.unshift(`${cur.tag}[${sibs.indexOf(cur)}]`);
      cur = nodes[cur.parent];
    }
    return parts.join('/');
  };
  // a CONTAINER worth comparing: non-text, has visual identity (a bg, a border, a radius, a
  // media/gradient layer, OR is a wide divider) and is reasonably large (a section/card/rule —
  // not a 1px decorative dot). Skip the frame root itself (handled by [screen background]).
  const isContainer = n => {
    if (!n || n.tag === 'body' || /\b(body|scr|frame|screen)\b/.test(n.cls || '')) return false;
    if (norm(n.text)) return false; // has its OWN text → already probed
    const c = n.comp || {}; const r = n.rect || {};
    if ((r.w || 0) < 80 || (r.h || 0) < 8) return false;
    const hasBg = toHex(c.backgroundColor) !== 'transparent' && c.backgroundColor;
    const hasBorder = (px(c.borderTopWidth) || 0) > 0 || (px(c.borderBottomWidth) || 0) > 0;
    const hasRadius = (px(c.borderTopLeftRadius) || 0) >= 4;
    const hasShadow = c.boxShadow && c.boxShadow !== 'none';
    return !!(hasBg || hasBorder || hasRadius || hasShadow || n.fullBleedMedia || n.divider);
  };
  const mockContainers = mock.filter(isContainer);
  const appByPath = new Map();
  for (const a of appAll) if (isContainer(a)) { const p = pathOf(appAll, aKidsP, a); if (!appByPath.has(p)) appByPath.set(p, a); }
  // also index app containers by a geometry key (rounded x/w) as a fallback when the structural
  // paths drift (a wrapper div added/removed on one side) — pick the nearest-Y.
  //
  // TAG-AGNOSTIC geometry key (reliability fix): the SAME card is frequently a different ELEMENT
  // TYPE across sides — a Framer reference draws a clickable card as an `<a>` while the rebuilt
  // target renders it as a `<div>` (this is exactly the role-views "One workspace, every
  // investor-facing desk" cards: mock `a @y3298 w359 bt=1 #e5e9f0`, target `div @y3079 w359
  // bt=0`). A tag-locked key (`a|x|w` vs `div|x|w`) NEVER matches them, so the 1-vs-0 border
  // comparison silently never runs and the missing-border defect is undetectable. So key the
  // geometry index on x/w ONLY (no tag) — a card's POSITION + WIDTH is its stable identity here,
  // and the border/bg/radius/shadow comparison is tag-independent. The structural-path pass above
  // (which IS tag-aware) still runs first and wins for the cases where the markup matches, so this
  // only changes behaviour for the cross-tag cards the old key dropped — no new noise on matches.
  const geomKey = a => `${Math.round((a.rect.x || 0) / 8) * 8}|${Math.round((a.rect.w || 0) / 8) * 8}`;
  const appByGeom = new Map();
  for (const a of appAll) if (isContainer(a)) {
    const k = geomKey(a);
    if (!appByGeom.has(k)) appByGeom.set(k, []);
    appByGeom.get(k).push(a);
  }
  const cFails = [], cUsed = new Set();
  // DEDUP nested wrappers that carry the SAME full-bleed media / divider over the same Y-band:
  // a gradient layer is usually 2–3 nested absolute divs (a relative→absolute→img chain), all of
  // which would otherwise each emit an identical "media-layer absent" row. Collapse them by
  // (kind|src|rounded-y) so the section-level finding is reported once. The SAME key dedups across
  // BOTH the unpaired-absent branch and the paired branch (a media-layer/divider can be reported
  // by either depending on whether a sibling wrapper paired), so a single defect reports once.
  const mediaDedupKey = n => (n.fullBleedMedia ? 'media|' + n.fullBleedMedia.src : 'div|' + (n.divider?.kind || '')) + '|' + Math.round((n.rect.y || 0) / 24);
  const absentSeen = new Set();
  for (const m of mockContainers) {
    const mp = pathOf(mock, mKidsP, m);
    let a = appByPath.get(mp);
    if (!a) {
      // geometry fallback: same x/w bucket (tag-AGNOSTIC — a card may be `<a>` on the mock and
      // `<div>` on the target, see geomKey above), nearest normalised Y (within 4% of frame H).
      // Disambiguate WITHIN the bucket by a combined fit so a tag-agnostic key can't mispair two
      // co-located full-width wrappers (a transparent outer div ↔ the dark nav bar): score each
      // candidate by normalised-Y distance + a HEIGHT mismatch penalty, and prefer the SAME tag on
      // a near-tie. Also gate on the height being comparable (within 40% or 60px) so a 58px header
      // never pairs to a 248px card sharing its x/w.
      const bucket = (appByGeom.get(geomKey(m)) || []).filter(n => !cUsed.has(n.i));
      if (bucket.length) {
        const mYn = (m.rect.y || 0) / (mockDoc.frame?.h || 1), mH = m.rect.h || 0;
        const scored = bucket.map(n => {
          const dY = Math.abs((n.rect.y || 0) / (appDoc.frame?.h || 1) - mYn);
          const dH = Math.abs((n.rect.h || 0) - mH);
          const hOk = dH <= Math.max(60, 0.4 * mH);
          // cost: Y distance dominates; height delta is a tie-breaker (scaled to the same range);
          // a different tag adds a tiny penalty so an exact-tag match wins an otherwise-tie.
          const cost = dY + (dH / (mockDoc.frame?.h || 1)) * 0.5 + (n.tag === m.tag ? 0 : 0.005);
          return { n, dY, hOk, cost };
        }).filter(s => s.hOk).sort((x, y) => x.cost - y.cost)[0];
        if (scored && scored.dY <= 0.04) a = scored.n;
      }
    }
    if (!a) {
      // A meaningful NON-TEXT visual the target never built: a section's full-bleed gradient/media
      // layer, or a page-wide divider/rule. (A plain styled wrapper with no counterpart is NOT
      // reported here — too noisy; only the media-layer + divider classes, which are the real
      // "section gradient flat" / "rule missing" defects this pass exists to catch.)
      if (!m.fullBleedMedia && !m.divider) continue;
      const what = m.fullBleedMedia ? `media-layer ${m.fullBleedMedia.tag}` : `divider ${m.divider.kind}`;
      const dk = mediaDedupKey(m);
      if (absentSeen.has(dk)) continue; absentSeen.add(dk);
      cFails.push({ el: `[container ${m.tag} @y${Math.round(m.rect.y)} w${Math.round(m.rect.w)}]`, prop: m.fullBleedMedia ? 'bg-media-layer' : 'divider', app: 'absent', mock: what });
      continue;
    }
    cUsed.add(a.i);
    const mc = m.comp || {}, ac = a.comp || {};
    const lbl = `[container ${m.tag}.${(m.cls || '').split(/\s+/)[0]} @y${Math.round(m.rect.y)} w${Math.round(m.rect.w)}]`;
    // background colour
    const mBg = toHex(mc.backgroundColor), aBg = toHex(ac.backgroundColor);
    if (mBg !== aBg) cFails.push({ el: lbl, prop: 'background', app: aBg, mock: mBg });
    // full-bleed media / gradient layer (a section's <img>/css-gradient cover). Dedup against the
    // unpaired-absent branch so the same section's media-layer defect isn't reported twice.
    if (m.fullBleedMedia && !a.fullBleedMedia) {
      const dk = mediaDedupKey(m);
      if (!absentSeen.has(dk)) { absentSeen.add(dk); cFails.push({ el: lbl, prop: 'bg-media-layer', app: 'none', mock: m.fullBleedMedia.tag }); }
    }
    // border (top + bottom; folded from ::after in the extractor)
    const mBt = px(mc.borderTopWidth) || 0, aBt = px(ac.borderTopWidth) || 0;
    if (Math.abs(mBt - aBt) > 0.5) cFails.push({ el: lbl, prop: 'border-top-width', app: aBt, mock: mBt });
    else if (mBt > 0 && toHex(mc.borderTopColor) !== toHex(ac.borderTopColor)) cFails.push({ el: lbl, prop: 'border-top-color', app: toHex(ac.borderTopColor), mock: toHex(mc.borderTopColor) });
    const mBb = px(mc.borderBottomWidth) || 0, aBb = px(ac.borderBottomWidth) || 0;
    if (Math.abs(mBb - aBb) > 0.5) cFails.push({ el: lbl, prop: 'border-bottom-width', app: aBb, mock: mBb });
    // border-radius
    const mR = px(mc.borderTopLeftRadius), aR = px(ac.borderTopLeftRadius);
    if (mR != null && aR != null && !close(mR, aR, 2.5)) cFails.push({ el: lbl, prop: 'border-radius', app: aR, mock: mR });
    // box-shadow presence
    const mSh = mockHasShadow(mc), aSh = mockHasShadow(ac);
    if (mSh !== aSh) cFails.push({ el: lbl, prop: 'shadow', app: aSh ? 'yes' : 'no', mock: mSh ? 'yes' : 'no' });
    // divider (a wide hairline / wide border): present on mock, absent on target (deduped against
    // the unpaired-absent branch over the same Y-band).
    if (m.divider && !a.divider) {
      const dk = mediaDedupKey(m);
      if (!absentSeen.has(dk)) { absentSeen.add(dk); cFails.push({ el: lbl, prop: 'divider', app: 'absent', mock: `${m.divider.kind} ${m.divider.thickness}px` }); }
    }
  }
  for (const f of cFails) rec(f.el, f.prop, f.app, f.mock, false);
}

// ---------- MEDIA / ILLUSTRATION GEOMETRY (improvement E) ----------
// Illustrations/mockup cards are excluded from the text-probe + geometry passes as noise, so an
// image rendered at the wrong VERTICAL position is never caught. Pair media/illustration
// elements (img/canvas/svg/picture, and large mockup-card containers) by structure/geometry and
// compare their POSITION ONLY — but relative to a stable SECTION ANCHOR on each side, so the
// page's accumulated vertical drift (every section a few px off) cancels and only a GENUINE
// in-section mispositioning fires. (Internal content is NOT compared — that's the noise this
// historically re-introduced.) Case 6: the readiness mockup sits below its heading on live but
// ABOVE it on target — a ~29px relative shift the absolute-y drift would otherwise mask.
if (GEOM) {
  // Exclude FULL-BLEED media (≥0.9×frame wide): a page-wide background layer is a decorative
  // cover handled by the container pass (bg-media-layer), not a positioned in-column illustration
  // — its "relative position" is meaningless and only adds noise (the hero bg anchoring to a nav
  // link). The signal here is an in-COLUMN mockup card / image whose vertical placement vs its own
  // section drifted (the readiness card sitting above vs below its eyebrow).
  const frameW = mockDoc.frame?.w || mockFrameW;
  const isMediaEl = n => ['img', 'canvas', 'svg', 'picture', 'video'].includes(n.tag) && (n.rect?.w || 0) >= 120 && (n.rect?.h || 0) >= 100 && (n.rect?.w || 0) < 0.9 * frameW;
  const isMockupCard = n => (n.rect?.w || 0) >= 280 && (n.rect?.w || 0) < 0.9 * frameW && (n.rect?.h || 0) >= 260 && (px(n.comp?.borderTopLeftRadius) >= 8 || (toHex(n.comp?.backgroundColor) !== 'transparent' && n.comp?.backgroundColor)) && !norm(n.text);
  const mMedia = mock.filter(n => isMediaEl(n) || isMockupCard(n));
  const aMedia = app.filter(n => isMediaEl(n) || isMockupCard(n));
  // SECTION-LEAD detector: a text node that titles a section — an EYEBROW (short, upper-ish) or a
  // heading-sized line. Stable identity = its text. (Reliability fix: this is now a predicate, so
  // BOTH sides resolve the anchor the same way and we can find the SAME lead by text.)
  const isSectionLead = t => {
    const tx = norm(t.text);
    if (!tx || (t.rect?.h || 0) <= 0 || (t.rect?.w || 0) < 60) return false;
    const sz = px(t.comp?.fontSize) || 0;
    const eyebrow = /^[A-Z0-9 ·&,'’\-]+$/.test(tx) && tx.length <= 40; // ALL-CAPS short eyebrow
    return eyebrow || sz >= 18;
  };
  // The section anchor for a media element = the NEAREST section-lead by absolute vertical distance
  // to the media's top — NOT a one-sided "must be above" gap. The old `gap < -60` floor REJECTED the
  // anchor exactly in the defect direction (a card that sits ABOVE its eyebrow has a negative gap),
  // so a large mis-positioning silently dropped the very check meant to catch it; the window is now
  // symmetric. Prefer an EYEBROW over a generic heading on a near-tie (the eyebrow is the strongest,
  // most stable per-section marker), so the chosen anchor is deterministic across extractions.
  const anchorOf = (node, nodes) => {
    let best = null, bestScore = Infinity;
    const my = node.rect.y;
    for (const t of nodes) {
      if (!isSectionLead(t)) continue;
      const tMid = t.rect.y + (t.rect.h || 0) / 2;
      const dist = Math.abs(my - tMid);
      if (dist > 280) continue;                            // must be a near-by lead, not page-far
      const tx = norm(t.text);
      const eyebrow = /^[A-Z0-9 ·&,'’\-]+$/.test(tx) && tx.length <= 40;
      const score = dist - (eyebrow ? 12 : 0);             // small eyebrow preference on a near-tie
      if (score < bestScore) { bestScore = score; best = t; }
    }
    return best;
  };
  // Resolve the SAME section lead on the target by matching the mock anchor's TEXT, falling back to
  // the target media's own nearest lead. Using the text-matched lead guarantees both rel-Y values
  // are measured against the same section title (so page drift cancels), and it is order-independent.
  const anchorByText = (txt, nodes) => {
    const t = norm(txt);
    let best = null, bestW = -1;
    for (const n of nodes) { if (isSectionLead(n) && norm(n.text) === t && (n.rect?.w || 0) > bestW) { best = n; bestW = n.rect.w; } }
    return best;
  };
  const aUsed = new Set();
  for (const m of mMedia) {
    const mAnchor = anchorOf(m, mock);
    if (!mAnchor) continue;
    const mRelY = m.rect.y - (mAnchor.rect.y + mAnchor.rect.h);
    // pair to the app media of similar x/w (same column); among those, prefer the one whose nearest
    // section-lead text matches the mock anchor; else the nearest-Y candidate; else the sole one.
    const cands = aMedia.filter(n => !aUsed.has(n.i) && close(n.rect.x, m.rect.x, 24) && close(n.rect.w, m.rect.w, 40));
    let a = cands.find(c => { const aAnc = anchorOf(c, app); return aAnc && norm(aAnc.text) === norm(mAnchor.text); });
    if (!a && cands.length) {
      const mYn = (m.rect.y || 0) / (mockDoc.frame?.h || 1);
      a = cands.map(n => ({ n, d: Math.abs((n.rect.y || 0) / (appDoc.frame?.h || 1) - mYn) })).sort((x, y) => x.d - y.d)[0].n;
    }
    if (!a) continue;
    aUsed.add(a.i);
    // measure the target rel-Y against the SAME section lead (matched by the mock anchor's text);
    // if the target lacks that exact lead, fall back to the target media's own nearest lead.
    const aAnchor = anchorByText(mAnchor.text, app) || anchorOf(a, app);
    if (!aAnchor) continue;
    // GUARD against a cross-section mispair: the target media must be in the SAME section as its
    // anchor — i.e. the anchor must sit within a sane in-section distance of the target media's top
    // (the same proximity the mock side requires). Without this, a relaxed media pairing that lands
    // on a media in a DIFFERENT section produces an absurd rel-Y (e.g. -1269px) — a false finding,
    // not a real in-section shift. The legit defect (card above vs below its eyebrow) is at most a
    // few hundred px; a multi-hundred-px |rel-Y| on EITHER side means the pairing is wrong, skip it.
    const aRelY = a.rect.y - (aAnchor.rect.y + aAnchor.rect.h);
    const inSection = Math.abs(aRelY) <= 320 && Math.abs(mRelY) <= 320;
    if (!inSection) continue;
    const lbl = `[media ${m.tag} @y${Math.round(m.rect.y)} w${Math.round(m.rect.w)} ↔"${norm(mAnchor.text).slice(0, 24)}"]`;
    rec(lbl, '📐 media-rel-y(vs section)', Math.round(aRelY), Math.round(mRelY), close(aRelY, mRelY, 8));
  }
}

// ---------- coverage: unmatched-but-present-elsewhere ----------
// An unmatched mock probe usually means "missing OR intentional swap" — but if the
// SAME text exists in the full app dump (any screen), the element is NOT missing:
// you measured the WRONG STATE (the surface was never opened, or --anchor scoped to
// the wrong screen), so its geometry/style was never checked. That is exactly how
// the Invest "Example brokers" rows' inset slipped through. Surface these loudly and
// separately — they are coverage failures to re-measure, not absences to rationalise.
const appAllText = new Set(appAll.filter(n => A.text(n)).map(n => A.text(n)));
const coverage = unmatched.filter(u => u.text && appAllText.has(norm(u.text)));
const trulyUnmatched = unmatched.filter(u => !(u.text && appAllText.has(norm(u.text))));

// ---------- app-EXTRA: text the app renders that the mock does NOT ----------
// The differ only walks mock→app, so an element the APP adds (an extra badge, an
// extra line, a wrapper label) is invisible — yet "mock wins" means REMOVING those
// too (LAW rule 6; the Invest brokers had an extra `· not endorsements` line + an
// ASX badge). List app text with no mock match. CAVEAT: this also surfaces
// legitimate extra DATA (more list rows than the mock's sample, live prices/names) —
// it is a SCAN AID, not a hard fail: confirm each is real data, else remove/cite it.
const mockTextSet = new Set(mock.filter(n => norm(n.text)).map(n => norm(n.text)));
const appExtra = [...new Map(
  app.filter(n => { const t = A.text(n); return t && !CHROME_TXT.test(t) && !mockTextSet.has(t); })
     .map(n => [A.text(n), { text: A.text(n), x: A.rect(n)?.x }])
).values()];

// ---------- report ----------
const fails = rows.filter(r => !r.ok);
const L = [];
L.push(`# Mock-fidelity diff — ${mockDoc.title}`, '');
L.push(`- mock: \`${MOCK}\` (${mock.length} nodes, frame ${mockDoc.frame?.w}×${mockDoc.frame?.h})`);
L.push(`- target: \`${APP}\`${scr != null ? ` (anchor "${ANCHOR}", scr=${scr}, ${app.length} nodes)` : ''}`);
const geomFails = fails.filter(f => /📐/.test(f.prop));
L.push(`- matched probes: ${oks.length + new Set(fails.map(f => f.el)).size}, **mismatches: ${fails.length}**${GEOM ? ` (incl. ${geomFails.length} 📐 geometry)` : ' (geometry OFF — different viewport)'}, unmatched mock texts: ${unmatched.length}${coverage.length ? ` (⚠︎⚠︎ ${coverage.length} present-in-app = WRONG STATE)` : ''}`, '');
L.push('## ❌ Mismatches (fix these)', '');
if (!fails.length) L.push('_None — every matched property is within tolerance._');
else { L.push('| element | property | target | mock |', '|---|---|---|---|'); for (const r of fails) L.push(`| ${r.el} | ${r.prop} | \`${r.app}\` | \`${r.mock}\` |`); }
if (coverage.length) {
  L.push('', '## ⚠︎⚠︎ WRONG STATE — present in the app dump but NOT on the measured screen (re-measure!)', '');
  L.push('These mock texts exist elsewhere in the app — the surface was not opened, or `--anchor` scoped to the wrong screen. Their geometry/style was NEVER checked. Drive to the populated state and re-run before trusting this report.', '');
  L.push(coverage.map(u => `- \`${u.tag}.${u.cls}\` — "${u.text}"`).join('\n'));
}
L.push('', '## ⚠︎ In mock, not matched in target (missing element OR intentional content / icon-ligature swap)', '');
L.push(trulyUnmatched.length ? trulyUnmatched.map(u => `- \`${u.tag}.${u.cls}\` — "${u.text}"`).join('\n') : '_None._');
L.push('', '## ◆ App-EXTRA — text in the app, not in the mock (scan: real data, or remove/cite per "mock wins")', '');
L.push(appExtra.length ? appExtra.map(u => `- "${u.text}"${u.x != null ? ` (x=${Math.round(u.x)})` : ''}`).join('\n') : '_None._');
L.push('', '## ✓ Matched & within tolerance', '', oks.length ? oks.map(o => `- ${o}`).join('\n') : '_None._', '');
writeFileSync(OUT, L.join('\n'));
writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({ title: mockDoc.title, scr, fails, coverage, unmatched: trulyUnmatched, appExtra, oks }, null, 2));
console.log(`${fails.length} mismatch(es)${GEOM ? ` (${geomFails.length} 📐 geometry)` : ' [geometry OFF: different viewport]'}, ${trulyUnmatched.length} unmatched, ${coverage.length} WRONG-STATE, ${appExtra.length} app-extra → ${OUT}`);
for (const r of fails) console.log(`  ✗ ${r.el} · ${r.prop}: target=${r.app} mock=${r.mock}`);
for (const u of coverage) console.log(`  ⚠︎⚠︎ WRONG STATE (present in app, not on measured screen): "${u.text}"`);
