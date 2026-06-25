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

// ========================================================================
// v1.16 — SIX new detectors for defect classes the differ was still blind to.
// Each emits CLEAR rows and dedups a single repeating root cause to ONE summary
// row (low-noise). They share a container-pairing helper that mirrors the
// non-text-container pass's structural→geometry matching.
// ========================================================================

// Shared: pair mock CONTAINERS to app containers (path → tag-agnostic x/w bucket, nearest
// normalised-Y). Returns [{ m, a }] for every mock container that found a partner. This is the
// same pairing the v1.15 non-text-container pass uses; factored so the layout (1) + value-precision
// (3) + transform (4) + animation (6) detectors all pair on the SAME basis as the box pass.
function pairContainers(predicate, opts = {}) {
  // `predicate` selects which MOCK containers to compare. The APP side is indexed by `appPredicate`
  // (defaults to `predicate`). CRITICAL for the "mock HAS x, app does NOT" detectors (motion,
  // transform, pseudo): if the app index used the same interesting predicate, a static/plain app
  // node would be excluded and the mock node would find NO pair — so the very divergence we want
  // could never be reported. Those detectors pass a BROAD appPredicate (any sized container).
  const { geomFallback = true, appPredicate = predicate } = opts;
  const kidsByParent = arr => { const m = new Map(); for (const n of arr) { if (!m.has(n.parent)) m.set(n.parent, []); m.get(n.parent).push(n); } return m; };
  const mKidsP = kidsByParent(mock), aKidsP = kidsByParent(appAll);
  const pathOf = (nodes, kids, n) => {
    const parts = []; let cur = n, hops = 0;
    while (cur && cur.parent >= 0 && hops++ < 40) { const sibs = kids.get(cur.parent) || []; parts.unshift(`${cur.tag}[${sibs.indexOf(cur)}]`); cur = nodes[cur.parent]; }
    return parts.join('/');
  };
  const geomKey = a => `${Math.round((a.rect?.x || 0) / 8) * 8}|${Math.round((a.rect?.w || 0) / 8) * 8}`;
  const appByPath = new Map(), appByGeom = new Map();
  for (const a of appAll) if (appPredicate(a)) {
    const p = pathOf(appAll, aKidsP, a); if (!appByPath.has(p)) appByPath.set(p, a);
    const k = geomKey(a); if (!appByGeom.has(k)) appByGeom.set(k, []); appByGeom.get(k).push(a);
  }
  const out = [], used = new Set();
  for (const m of mock.filter(predicate)) {
    let a = appByPath.get(pathOf(mock, mKidsP, m));
    if (a && used.has(a.i)) a = null;
    if (!a && geomFallback) {
      const bucket = (appByGeom.get(geomKey(m)) || []).filter(n => !used.has(n.i));
      if (bucket.length) {
        const mYn = (m.rect?.y || 0) / (mockDoc.frame?.h || 1), mH = m.rect?.h || 0;
        const scored = bucket.map(n => {
          const dY = Math.abs((n.rect?.y || 0) / (appDoc.frame?.h || 1) - mYn);
          const dH = Math.abs((n.rect?.h || 0) - mH);
          const hOk = dH <= Math.max(60, 0.4 * mH);
          return { n, dY, hOk, cost: dY + (dH / (mockDoc.frame?.h || 1)) * 0.5 + (n.tag === m.tag ? 0 : 0.005) };
        }).filter(s => s.hOk).sort((x, y) => x.cost - y.cost)[0];
        if (scored && scored.dY <= 0.04) a = scored.n;
      }
    }
    if (a) { used.add(a.i); out.push({ m, a }); }
  }
  return out;
}
const clabel = m => `[container ${m.tag}.${(m.cls || '').split(/\s+/)[0]} @y${Math.round(m.rect?.y || 0)} w${Math.round(m.rect?.w || 0)}]`;

// ---------- (1) LAYOUT STRUCTURE ----------
// The HIGHEST-FREQUENCY real defect: a row rendered as a column (icon BESIDE vs ABOVE), a 2-up
// grid as 1-up, a different flex gap / justify / align. The text-probe + box passes are blind to
// it (words + colours match, layout is wrong). Per matched CONTAINER compare the flow model:
// display, flex-direction/wrap, justify/align, row/column gap, grid track COUNT (+ rough fr ratio).
// Grid templates are normalised to track-COUNT + a coarse fr-ratio signature so 1fr-1fr vs 1fr
// FLIPS but 547.5px vs 548px does NOT. Only fires on a real flex/grid container (display flex|grid
// on at least one side) so a plain block's irrelevant defaults never noise.
{
  // grid-template → track count + a coarse signature ("2:1fr|1fr" vs "1:1fr"): split top-level
  // tokens (ignoring parens), bucket each track to fr / a rounded px decile / auto|min|max|minmax.
  const trackSig = gt => {
    if (!gt || gt === 'none') return { n: 0, sig: 'none' };
    let depth = 0, tok = '', toks = [];
    for (const ch of gt) {
      if (ch === '(') { depth++; tok += ch; }
      else if (ch === ')') { depth--; tok += ch; }
      else if (ch === ' ' && depth === 0) { if (tok) toks.push(tok); tok = ''; }
      else tok += ch;
    }
    if (tok) toks.push(tok);
    const bucket = t => {
      if (/fr$/.test(t)) return 'fr';
      if (/auto|min-content|max-content|minmax/.test(t)) return 'flex';
      const px = parseFloat(t); return isNaN(px) ? t : 'p' + Math.round(px / 40); // 40px deciles → ignore sub-px
    };
    return { n: toks.length, sig: toks.map(bucket).join('|') };
  };
  const isFlexGrid = n => /flex|grid/.test(n.comp?.display || '');
  // Pair containers that are flex/grid on the MOCK side (the layout authority). SCOPE to MEANINGFUL
  // layout regions — w ≥ 240 (a real column/row/grid section), not the swarm of tiny nested Framer
  // wrappers (a `w122` icon-row wrapper) whose x/w buckets COLLIDE across siblings and produce a
  // flood of contradictory row↔column flips (pure pairing noise). A row-vs-column defect that
  // matters is a content section, not a 12px-tall affordance wrapper.
  // PATH-ONLY pairing (no geometry fallback): a flow-model defect is only trustworthy on a container
  // matched by STRUCTURE — the tag-agnostic x/w bucket collides Framer's many same-width nested
  // wrappers and mispairs them into contradictory row↔column flips. A genuinely missing/added wrapper
  // shows up in structure-diff.mjs, not here.
  const bigBox = n => { if (!n || n.tag === 'body' || /\b(body|scr|frame|screen)\b/.test(n.cls || '')) return false; const r = n.rect || {}; return (r.w || 0) >= 240 && (r.h || 0) >= 24; };
  const pairs = pairContainers(n => bigBox(n) && isFlexGrid(n), { geomFallback: false, appPredicate: bigBox });
  let n = 0;
  for (const { m, a } of pairs) {
    const mc = m.comp || {}, ac = a.comp || {}; const lbl = clabel(m);
    const mDisp = mc.display, aDisp = ac.display;
    if (mDisp !== aDisp) { rec(lbl, 'display', aDisp, mDisp, false); n++; }
    // flex axis + wrap + justify/align only meaningful when BOTH are flex (or grid)
    if (/flex/.test(mDisp || '')) {
      if ((mc.flexDirection || 'row') !== (ac.flexDirection || 'row')) { rec(lbl, 'flex-direction', ac.flexDirection, mc.flexDirection, false); n++; }
      if ((mc.flexWrap || 'nowrap') !== (ac.flexWrap || 'nowrap')) { rec(lbl, 'flex-wrap', ac.flexWrap, mc.flexWrap, false); n++; }
    }
    if (/flex|grid/.test(mDisp || '') && /flex|grid/.test(aDisp || '')) {
      if ((mc.justifyContent || 'normal') !== (ac.justifyContent || 'normal')) { rec(lbl, 'justify-content', ac.justifyContent, mc.justifyContent, false); n++; }
      if ((mc.alignItems || 'normal') !== (ac.alignItems || 'normal')) { rec(lbl, 'align-items', ac.alignItems, mc.alignItems, false); n++; }
      const mRg = px(mc.rowGap), aRg = px(ac.rowGap); if (mRg != null && aRg != null && !close(mRg, aRg, 3)) { rec(lbl, 'row-gap', aRg, mRg, false); n++; }
      const mCg = px(mc.columnGap), aCg = px(ac.columnGap); if (mCg != null && aCg != null && !close(mCg, aCg, 3)) { rec(lbl, 'column-gap', aCg, mCg, false); n++; }
    }
    if (/grid/.test(mDisp || '')) {
      const mt = trackSig(mc.gridTemplateColumns), at = trackSig(ac.gridTemplateColumns);
      if (mt.n !== at.n) { rec(lbl, 'grid-columns', at.n, mt.n, false); n++; }
      else if (mt.sig !== at.sig) { rec(lbl, 'grid-col-ratio', at.sig, mt.sig, false); n++; }
      const mtr = trackSig(mc.gridTemplateRows), atr = trackSig(ac.gridTemplateRows);
      if (mtr.n !== atr.n && (mtr.n > 1 || atr.n > 1)) { rec(lbl, 'grid-rows', atr.n, mtr.n, false); n++; }
      if ((mc.gridAutoFlow || 'row') !== (ac.gridAutoFlow || 'row')) { rec(lbl, 'grid-auto-flow', ac.gridAutoFlow, mc.gridAutoFlow, false); n++; }
    }
  }
}

// ---------- (2) VERTICAL RHYTHM / CUMULATIVE DRIFT ----------
// At the FRAME level: total document height. Then the ACCUMULATING vertical drift DOWN the page —
// reported against TEXT ANCHORS (a reliable cross-framework pairing; Framer and StyleX nest the DOM
// completely differently, so a "Nth wide block at depth D" section pairing mispairs — but a section
// HEADING text pairs exactly). Pick the unique heading-ish texts present on both sides, order them
// top-to-bottom, and report (a) each anchor's top-offset (target.y − mock.y) and (b) the GAP each
// section adds vs the one above (its own height contribution). This surfaces the home −387px drift
// WITH the inter-anchor gaps that contribute it — one concise block, not per-descendant.
if (GEOM) {
  const mH = mockDoc.frame?.contentH || mockDoc.frame?.h, aH = appDoc.frame?.contentH || appDoc.frame?.h;
  if (mH && aH && Math.abs(aH - mH) > 6) rec('[frame]', '📏 doc-height', Math.round(aH), Math.round(mH), false);
  // heading-ish anchors: a sizeable text node (font ≥ 18 OR an all-caps eyebrow), unique on each
  // side, present on both. Build the ordered intersection.
  const headingish = n => {
    const t = norm(n.text); if (!t || t.length < 3 || t.length > 60) return false;
    if (CHROME_TXT.test(t)) return false;
    const sz = px(n.comp?.fontSize) || 0;
    const eyebrow = /^[A-Z0-9 ·&,'’\-]+$/.test(t) && t.length <= 40;
    return sz >= 18 || eyebrow;
  };
  const uniqByText = nodes => { const seen = new Map(), dup = new Set(); for (const n of nodes) { if (!headingish(n)) continue; const t = norm(n.text); if (seen.has(t)) dup.add(t); else seen.set(t, n); } for (const t of dup) seen.delete(t); return seen; };
  const mAnchors = uniqByText(mock), aAnchors = uniqByText(app);
  const common = [...mAnchors.keys()].filter(t => aAnchors.has(t))
    .map(t => ({ t, m: mAnchors.get(t), a: aAnchors.get(t) }))
    .sort((x, y) => (x.m.rect?.y || 0) - (y.m.rect?.y || 0));
  if (common.length >= 2) {
    let prevMy = null, prevAy = null, drifted = [];
    for (const c of common) {
      const my = c.m.rect?.y || 0, ay = c.a.rect?.y || 0;
      if (prevMy != null) {
        const mGap = my - prevMy, aGap = ay - prevAy;     // inter-anchor vertical gap (rhythm)
        const dGap = aGap - mGap;
        if (Math.abs(dGap) > 12) drifted.push({ t: c.t, dGap });
      }
      prevMy = my; prevAy = ay;
    }
    // the cumulative drift at the page bottom = last anchor's top-offset
    const last = common[common.length - 1];
    const cumTop = (last.a.rect?.y || 0) - (last.m.rect?.y || 0);
    if (Math.abs(cumTop) > 12) {
      rec('[page]', '📏 cumulative-top-drift', Math.round(cumTop), 0, false);
      // the sections (between which anchors) that contribute the drift — one summary row, the
      // top contributors by absolute gap delta, so the −387px is visible WITH its causes.
      const contrib = drifted.sort((a, b) => Math.abs(b.dGap) - Math.abs(a.dGap)).slice(0, 6)
        .map(d => `"${d.t.slice(0, 16)}":${d.dGap > 0 ? '+' : ''}${Math.round(d.dGap)}`).join('  ');
      if (contrib) rec('[page]', '📏 drift-contributors (gap Δ above anchor)', contrib, '(rhythm matches → 0)', false);
    }
  }
}

// ---------- (3) VALUE-PRECISION (present-but-WRONG) ----------
// Today the box pass catches PRESENCE/absence (shadow yes/no, border 0-vs-1). It is blind to a
// property PRESENT ON BOTH but with a different VALUE: a box-shadow with a different offset/blur/
// spread/colour, a different GRADIENT (function/angle/stops), an off colour (deltaE), a wrong
// per-corner radius. Compare on every paired container (incl. text-styled boxes) and emit ONLY a
// genuine beyond-tolerance value difference. Pairs reuse pairContainers (any visually-styled box).
{
  // parse the FIRST box-shadow layer → {dx,dy,blur,spread,color} (skip `inset`, take outer layer)
  const parseShadow = s => {
    if (!s || s === 'none') return null;
    const layer = s.split(/,(?![^(]*\))/)[0].trim(); // first layer only
    const colorM = layer.match(/rgba?\([^)]+\)|#[0-9a-f]+/i);
    const color = colorM ? toHex(colorM[0]) : null;
    const nums = (colorM ? layer.replace(colorM[0], '') : layer).match(/-?[\d.]+px/g) || [];
    const [dx, dy, blur, spread] = nums.map(parseFloat);
    return { dx: dx || 0, dy: dy || 0, blur: blur || 0, spread: spread || 0, color };
  };
  // deltaE-ish: max per-channel rgb distance (cheap, good enough to ignore sub-1 jitter)
  const rgbOf = h => { if (!h || h === 'transparent') return null; const m = h.match(/^#([0-9a-f]{6})$/i); if (!m) return null; const x = m[1]; return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)); };
  const colorDelta = (a, b) => { const ra = rgbOf(a), rb = rgbOf(b); if (!ra || !rb) return a === b ? 0 : 999; return Math.max(...ra.map((v, i) => Math.abs(v - rb[i]))); };
  // normalise a gradient string → function + angle + stop-count + stop colours (ignore exact %s,
  // which are layout-driven; the COLOURS + the function + count are the identity)
  const gradSig = g => {
    if (!g || g === 'none' || !/gradient/i.test(g)) return null;
    const fn = (g.match(/(repeating-)?(linear|radial|conic)-gradient/i) || [''])[0].toLowerCase();
    const angle = (g.match(/(\d+)deg/) || [, null])[1];
    const stops = (g.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/gi) || []).map(toHex);
    return { fn, angle, n: stops.length, stops: stops.join('>') };
  };
  const styled = n => {
    if (!n || n.tag === 'body' || /\b(body|scr|frame|screen)\b/.test(n.cls || '')) return false;
    const c = n.comp || {}, r = n.rect || {};
    if ((r.w || 0) < 24 || (r.h || 0) < 8) return false;
    const hasShadow = c.boxShadow && c.boxShadow !== 'none';
    const hasGrad = c.backgroundImage && /gradient/i.test(c.backgroundImage);
    const hasRadius = (px(c.borderTopLeftRadius) || 0) >= 2;
    const hasBg = toHex(c.backgroundColor) !== 'transparent' && c.backgroundColor;
    return !!(hasShadow || hasGrad || hasRadius || hasBg);
  };
  // app index is BROAD (any sized box) so a "mock has a gradient/shadow, app has none" case still
  // pairs (a styled-only app predicate would drop the plain app node and hide the divergence).
  const anyBox = n => { if (!n || n.tag === 'body' || /\b(body|scr|frame|screen)\b/.test(n.cls || '')) return false; const r = n.rect || {}; return (r.w || 0) >= 24 && (r.h || 0) >= 8; };
  for (const { m, a } of pairContainers(styled, { appPredicate: anyBox })) {
    const mc = m.comp || {}, ac = a.comp || {}; const lbl = clabel(m);
    // box-shadow VALUE (only when BOTH present) — offset/blur/spread ~1px, colour small delta
    const ms = parseShadow(mc.boxShadow), as = parseShadow(ac.boxShadow);
    if (ms && as) {
      const geomOff = Math.abs(ms.dx - as.dx) > 1.5 || Math.abs(ms.dy - as.dy) > 1.5 || Math.abs(ms.blur - as.blur) > 2 || Math.abs(ms.spread - as.spread) > 1.5;
      const colOff = ms.color && as.color && colorDelta(ms.color, as.color) > 24;
      if (geomOff || colOff) rec(`${lbl} ▸ shadow`, 'shadow-value', `${as.dx},${as.dy},${as.blur},${as.spread} ${as.color || ''}`, `${ms.dx},${ms.dy},${ms.blur},${ms.spread} ${ms.color || ''}`, false);
    }
    // GRADIENT background (function/angle/stops)
    const mg = gradSig(mc.backgroundImage), ag = gradSig(ac.backgroundImage);
    if (mg && ag) {
      if (mg.fn !== ag.fn) rec(`${lbl} ▸ gradient`, 'gradient-type', ag.fn, mg.fn, false);
      else if (mg.n !== ag.n) rec(`${lbl} ▸ gradient`, 'gradient-stops', ag.n, mg.n, false);
      else if (mg.stops !== ag.stops) rec(`${lbl} ▸ gradient`, 'gradient-colors', ag.stops, mg.stops, false);
      else if (mg.angle != null && ag.angle != null && Math.abs(+mg.angle - +ag.angle) > 3) rec(`${lbl} ▸ gradient`, 'gradient-angle', ag.angle + 'deg', mg.angle + 'deg', false);
    } else if (mg && !ag) rec(`${lbl} ▸ gradient`, 'gradient-present', 'none', mg.fn, false);
    // exact BACKGROUND colour (both opaque, beyond rgb-24 — a real off-tint, not jitter)
    const mBg = toHex(mc.backgroundColor), aBg = toHex(ac.backgroundColor);
    if (mBg !== 'transparent' && aBg !== 'transparent' && mBg !== aBg && colorDelta(mBg, aBg) > 12)
      rec(`${lbl} ▸ box`, 'bg-color-precise', aBg, mBg, false);
    // border colour precise (both have a border)
    if ((px(mc.borderTopWidth) || 0) > 0 && (px(ac.borderTopWidth) || 0) > 0) {
      const mBc = toHex(mc.borderTopColor), aBc = toHex(ac.borderTopColor);
      if (mBc !== aBc && colorDelta(mBc, aBc) > 12) rec(`${lbl} ▸ box`, 'border-color-precise', aBc, mBc, false);
    }
    // per-corner radius (TL is already box-checked elsewhere; catch a DIFFERENT corner: a
    // top-rounded-only card vs all-rounded). Compare the 4 corners as a signature.
    const corners = c => ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'].map(k => Math.round(px(c[k]) || 0));
    const mCr = corners(mc), aCr = corners(ac);
    if (mCr.some((v, i) => Math.abs(v - aCr[i]) > 2.5) && (mCr.some(v => v > 0) || aCr.some(v => v > 0)))
      rec(`${lbl} ▸ box`, 'radius-corners', `[${aCr}]`, `[${mCr}]`, false);
  }
}

// ---------- (4) TRANSFORM / OPACITY / FILTER ----------
// A rotated / scaled / translated / faded / blurred element the box + geometry checks are blind to.
// Per paired element compare transform (normalise matrix→{scale,rotate,translate}), opacity, filter.
// Ignore the identity/none case (only fire on a real divergence). Pairs reuse pairContainers over
// any sized element so a transformed decorative panel or a faded section is reached.
{
  // matrix(a,b,c,d,e,f) → { scale, rotateDeg, tx, ty }; matrix3d → just flag non-identity.
  const decompose = t => {
    if (!t || t === 'none') return { scale: 1, rot: 0, tx: 0, ty: 0, id: true };
    const m2 = t.match(/^matrix\(([^)]+)\)/);
    if (m2) {
      const [a, b, c, d, e, f] = m2[1].split(',').map(parseFloat);
      const scale = +Math.hypot(a, b).toFixed(3);
      const rot = +(Math.atan2(b, a) * 180 / Math.PI).toFixed(1);
      const id = Math.abs(scale - 1) < 0.01 && Math.abs(rot) < 0.5 && Math.abs(e) < 0.5 && Math.abs(f) < 0.5;
      return { scale, rot, tx: +e.toFixed(1), ty: +f.toFixed(1), id };
    }
    return { scale: 1, rot: 0, tx: 0, ty: 0, id: false, raw: t.slice(0, 30) }; // matrix3d/other → opaque, non-identity
  };
  const sized = n => { const r = n.rect || {}; return n.comp && (r.w || 0) >= 16 && (r.h || 0) >= 8 && n.tag !== 'body' && !/\b(body|scr|frame|screen)\b/.test(n.cls || ''); };
  // only ENTER the loop for mock nodes that actually carry a transform/opacity/filter divergence
  // candidate (non-identity transform, a fade, or a filter) — keeps the pass focused and low-noise;
  // app index is broad so a static app counterpart still pairs.
  const motionMock = n => sized(n) && ((n.comp.transform && n.comp.transform !== 'none') || (n.comp.filter && n.comp.filter !== 'none') || (parseFloat(n.comp.opacity ?? '1') < 0.99));
  for (const { m, a } of pairContainers(motionMock, { appPredicate: sized })) {
    const mc = m.comp || {}, ac = a.comp || {}; const lbl = clabel(m);
    const mt = decompose(mc.transform), at = decompose(ac.transform);
    // only emit when at least ONE side is non-identity AND they meaningfully differ
    if (!(mt.id && at.id)) {
      if (Math.abs(mt.scale - at.scale) > 0.02) rec(lbl, 'transform-scale', at.scale, mt.scale, false);
      else if (Math.abs(mt.rot - at.rot) > 1) rec(lbl, 'transform-rotate', at.rot + '°', mt.rot + '°', false);
      else if (Math.abs(mt.tx - at.tx) > 2 || Math.abs(mt.ty - at.ty) > 2) rec(lbl, 'transform-translate', `${at.tx},${at.ty}`, `${mt.tx},${mt.ty}`, false);
      else if (mt.raw || at.raw) rec(lbl, 'transform', at.raw || mc.transform || 'none', mt.raw || ac.transform || 'none', (mc.transform || 'none') === (ac.transform || 'none'));
    }
    // opacity — both present; only a real fade (≥0.05) and not both ~1
    const mo = parseFloat(mc.opacity ?? '1'), ao = parseFloat(ac.opacity ?? '1');
    if (!isNaN(mo) && !isNaN(ao) && Math.abs(mo - ao) > 0.05 && (mo < 0.99 || ao < 0.99)) rec(lbl, 'opacity', +ao.toFixed(2), +mo.toFixed(2), false);
    // filter — a blur/brightness/etc on one side, none on the other (or a different filter)
    const mf = (mc.filter && mc.filter !== 'none') ? mc.filter.slice(0, 40) : 'none';
    const af = (ac.filter && ac.filter !== 'none') ? ac.filter.slice(0, 40) : 'none';
    if (mf !== af) rec(lbl, 'filter', af, mf, false);
  }
}

// ---------- (5) PSEUDO-ELEMENT CONTENT ----------
// A custom bullet, a quote mark, a → arrow, a counter, or a url() icon drawn via `::before/::after
// content` — invisible to getComputedStyle(element) AND to the text-probe loop. Captured per node
// as pseudoContent. Pair by the OWNING node (reuse the text-probe pairing where possible: pair by
// normalised text+tag; fall back to position). Diff presence + the content value + size/colour.
{
  // index app nodes carrying a pseudoContent by normalised text (their primary identity)
  const appWithPseudo = appAll.filter(n => n.pseudoContent);
  const byText = new Map();
  for (const n of appWithPseudo) { const t = A.text(n); if (!t) continue; if (!byText.has(t)) byText.set(t, []); byText.get(t).push(n); }
  const used = new Set();
  const pRows = []; // collect then DEDUP — a whole list of `<li>` bullets all missing the same `•`
  for (const m of mock) {
    if (!m.pseudoContent) continue;
    const mt = norm(m.text);
    // find the app partner: same text+tag (nearest-Y among them), else nearest position+tag
    let a = null;
    if (mt) { const cands = (byText.get(mt) || []).filter(n => !used.has(n.i) && n.tag === m.tag); a = cands.sort((x, y) => Math.abs((x.rect?.y || 0) - (m.rect?.y || 0)) - Math.abs((y.rect?.y || 0) - (m.rect?.y || 0)))[0]; }
    if (!a) {
      const cands = appWithPseudo.filter(n => !used.has(n.i) && n.tag === m.tag && Math.abs((n.rect?.x || 0) - (m.rect?.x || 0)) < 24);
      a = cands.sort((x, y) => Math.abs((x.rect?.y || 0) - (m.rect?.y || 0)) - Math.abs((y.rect?.y || 0) - (m.rect?.y || 0)))[0];
    }
    const lbl = `["${mt.slice(0, 24) || m.tag}" pseudo]`;
    for (const ps of ['::before', '::after']) {
      const mp = m.pseudoContent[ps]; if (!mp) continue;
      const ap = a && a.pseudoContent && a.pseudoContent[ps];
      if (!ap) pRows.push({ lbl, prop: `${ps}-content`, app: 'none', mock: mp.content, dk: `${ps}|none|${mp.content}|${m.tag}` });
      else {
        if (a) used.add(a.i);
        if (mp.content !== ap.content) pRows.push({ lbl, prop: `${ps}-content`, app: ap.content, mock: mp.content, dk: `${ps}|${ap.content}|${mp.content}|${m.tag}` });
        else {
          // same marker — check it isn't restyled (size/colour) beyond tolerance
          const mFs = px(mp.fontSize), aFs = px(ap.fontSize);
          if (mFs != null && aFs != null && !close(mFs, aFs, 1)) pRows.push({ lbl, prop: `${ps}-content-size`, app: aFs, mock: mFs, dk: `${ps}|sz|${aFs}|${mFs}` });
          else if (toHex(mp.color) !== toHex(ap.color)) pRows.push({ lbl, prop: `${ps}-content-color`, app: toHex(ap.color), mock: toHex(mp.color), dk: `${ps}|col|${toHex(ap.color)}|${toHex(mp.color)}` });
        }
      }
    }
  }
  // DEDUP: collapse a repeating identical marker defect (every `<li>` missing the SAME `•`, every
  // numbered item missing the SAME `counter(list-item)`) — emit the first 3 distinct instances, then
  // ONE summary count row per (marker, verdict). One root cause → a handful of rows, not hundreds.
  const groups = new Map();
  for (const r of pRows) { if (!groups.has(r.dk)) groups.set(r.dk, []); groups.get(r.dk).push(r); }
  for (const [, g] of groups) {
    g.slice(0, 3).forEach(r => rec(r.lbl, r.prop, r.app, r.mock, false));
    if (g.length > 3) rec(`[×${g.length} elements]`, g[0].prop, g[0].app, g[0].mock, false);
  }
}

// ---------- (6) ANIMATION / TRANSITION PRESENCE ----------
// One side animates/transitions, the other is static — the generalisation of "does the CTA headline
// animate?". Per paired element compare running-animation count (anims) and the declared transition
// (transitionProperty/Duration non-none). Only emit when one side has motion and the other does not
// (or a markedly different running-animation count). Dedup a repeating root cause (a whole section's
// children all transitioning) to a few rows — cap per-class emission and add a summary if it floods.
{
  const hasTransition = c => { const p = c?.transitionProperty, d = px(c?.transitionDuration); return !!(p && p !== 'none' && p !== 'all 0s' && d && d > 0); };
  const sized = n => { const r = n.rect || {}; return n.comp && (r.w || 0) >= 24 && (r.h || 0) >= 8 && n.tag !== 'body' && !/\b(body|scr|frame|screen)\b/.test(n.cls || ''); };
  const animRows = [], transRows = [];
  // mock side: only containers WITH motion; app side: broad (a static app counterpart must still
  // pair so "mock animates, app static" can be reported — the whole point of this detector).
  for (const { m, a } of pairContainers(n => sized(n) && ((n.anims || 0) > 0 || hasTransition(n.comp)), { appPredicate: sized })) {
    const mc = m.comp || {}, ac = a.comp || {}; const lbl = clabel(m);
    const mAnim = m.anims || 0, aAnim = a.anims || 0;
    if ((mAnim > 0) !== (aAnim > 0)) animRows.push({ lbl, a: aAnim, m: mAnim });
    const mT = hasTransition(mc), aT = hasTransition(ac);
    if (mT !== aT) transRows.push({ lbl, a: aT ? (ac.transitionProperty || '').slice(0, 24) : 'none', m: mT ? (mc.transitionProperty || '').slice(0, 24) : 'none' });
  }
  // DEDUP / cap: a whole section of cards each transitioning is ONE root cause. Emit up to 6 rows
  // per class, then a single summary count row, so the report doesn't balloon.
  const emitCapped = (rows, prop) => {
    rows.slice(0, 6).forEach(r => rec(r.lbl, prop, r.a, r.m, false));
    if (rows.length > 6) rec('[summary]', prop, `${rows.length} elements differ`, '(motion present on one side only)', false);
  };
  emitCapped(animRows, 'animation-presence');
  emitCapped(transRows, 'transition-presence');
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
const rhythmFails = fails.filter(f => /📏/.test(f.prop));
L.push(`- matched probes: ${oks.length + new Set(fails.map(f => f.el)).size}, **mismatches: ${fails.length}**${GEOM ? ` (incl. ${geomFails.length} 📐 geometry, ${rhythmFails.length} 📏 rhythm)` : ' (geometry OFF — different viewport)'}, unmatched mock texts: ${unmatched.length}${coverage.length ? ` (⚠︎⚠︎ ${coverage.length} present-in-app = WRONG STATE)` : ''}`, '');
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
