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
const appById = new Map(appAll.map(n => [n.id, n]));
let app = appAll;
let scr = null;
if (ANCHOR) {
  const cands = appAll.filter(n => A.text(n) === ANCHOR);
  const anchor = cands.sort((a, b) => (A.fontSize(b) || 0) - (A.fontSize(a) || 0))[0];
  if (anchor && anchor.scr != null) { scr = anchor.scr; app = appAll.filter(n => n.scr === scr); }
}
const appFrameW = Math.max(...app.map(n => (A.rect(n)?.x || 0) + (A.rect(n)?.w || 0)), 0) || (mockDoc.frame?.w || 393);
const mockFrameW = mockDoc.frame?.w || 393;

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

// ---------- diff ----------
const rows = [], oks = [], unmatched = [];
const rec = (el, prop, a, m, ok) => rows.push({ el, prop, app: a, mock: m, ok });
const CHROME_TXT = /^\d{1,2}:\d{2}$|signal_cellular|wifi|battery_full/;

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
  const deviceW = Math.max(...app.filter(n => isRNS(n.type)).map(n => n.rect?.w || 0), 0) || appFrameW;
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

  const an = isPh ? app.find(n => A.placeholder(n) === text) : app.find(n => A.text(n) === text);
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
    const aLh = A.lineHeight(an), mLh = px(mn.comp.lineHeight);
    if (mLh != null) rec(elName, 'line-height', aLh, mLh, close(aLh, mLh, 1.5));
    // typeface kind (serif/sans/mono) — catches a serif-vs-sans swap the weight
    // check is blind to. text-align catches centred-vs-left (quiet when both left).
    const mFam = familyKind(mn.comp.fontFamily);
    if (mFam) rec(elName, 'font-family', A.family(an), mFam, A.family(an) === mFam);
    rec(elName, 'text-align', A.align(an), alignNorm(mn.comp.textAlign), A.align(an) === alignNorm(mn.comp.textAlign));
  } else {
    const mC = toHex(mn.comp.color); rec(elName, 'placeholder-color', A.phColor(an), mC, A.phColor(an) === mC);
    const mFs = px(mn.comp.fontSize); if (mFs != null) rec(elName, 'font-size', A.fontSize(an), mFs, close(A.fontSize(an), mFs, 0.6));
  }

  // gutter inset — compare only the edge the element is anchored to (frame
  // widths differ); skip flex-spanning elements whose edges are content-driven.
  const ar = A.rect(an), aX = ar?.x, aW = ar?.w, mX = mn.rect?.x, mW = mn.rect?.w;
  if (aX != null && mX != null) {
    const leftAnch = mX < 0.33 * mockFrameW, rightAnch = mX + (mW || 0) > 0.67 * mockFrameW;
    const wide = leftAnch && rightAnch;
    if (!wide && leftAnch) rec(elName, 'left-inset', aX, mX, close(aX, mX));
    if (!wide && rightAnch && aW != null && mW != null) {
      rec(elName, 'right-inset', +(appFrameW - (aX + aW)).toFixed(1), +(mockFrameW - (mX + mW)).toFixed(1),
        close(appFrameW - (aX + aW), mockFrameW - (mX + mW)));
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

// ---------- report ----------
const fails = rows.filter(r => !r.ok);
const L = [];
L.push(`# Mock-fidelity diff — ${mockDoc.title}`, '');
L.push(`- mock: \`${MOCK}\` (${mock.length} nodes, frame ${mockDoc.frame?.w}×${mockDoc.frame?.h})`);
L.push(`- target: \`${APP}\`${scr != null ? ` (anchor "${ANCHOR}", scr=${scr}, ${app.length} nodes)` : ''}`);
L.push(`- matched probes: ${oks.length + new Set(fails.map(f => f.el)).size}, **mismatches: ${fails.length}**, unmatched mock texts: ${unmatched.length}`, '');
L.push('## ❌ Mismatches (fix these)', '');
if (!fails.length) L.push('_None — every matched property is within tolerance._');
else { L.push('| element | property | target | mock |', '|---|---|---|---|'); for (const r of fails) L.push(`| ${r.el} | ${r.prop} | \`${r.app}\` | \`${r.mock}\` |`); }
L.push('', '## ⚠︎ In mock, not matched in target (missing element OR intentional content / icon-ligature swap)', '');
L.push(unmatched.length ? unmatched.map(u => `- \`${u.tag}.${u.cls}\` — "${u.text}"`).join('\n') : '_None._');
L.push('', '## ✓ Matched & within tolerance', '', oks.length ? oks.map(o => `- ${o}`).join('\n') : '_None._', '');
writeFileSync(OUT, L.join('\n'));
writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({ title: mockDoc.title, scr, fails, unmatched, oks }, null, 2));
console.log(`${fails.length} mismatch(es), ${unmatched.length} unmatched mock text(s) → ${OUT}`);
for (const r of fails) console.log(`  ✗ ${r.el} · ${r.prop}: target=${r.app} mock=${r.mock}`);
