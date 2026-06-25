// ⚠️ DEPRECATED (kept one version as a fallback) — superseded by `analyze.js`.
// `analyze.js` MODE B now runs this layout/child-count/MISSING/EXTRA structure pass in-page as
// part of the single analyzer+differ (its findings carry class `structure`/`layout`/`extra`).
// Prefer `analyze.js` (see `run.md`); use this only for an in-flight pipeline. Removed in a future version.
//
// structure-diff.mjs — the LAYOUT/STRUCTURE differ (improvement #1).
//
// The per-property style differ (`diff.mjs`) matches elements by TEXT and compares
// computed STYLE, so it is structurally blind to the highest-frequency real defects:
//   • a 2×2 grid rendered as 1×4 (or vice-versa)
//   • a card laid out `row` when the mock is `column` (icon BESIDE vs ABOVE its label)
//   • a missing icon / divider / badge node (the mock has it, the app doesn't)
//   • an EXTRA node the app renders that the mock doesn't
//   • a reflowed gap, a changed child order
// The words and colours match, so the style diff scores it "close" while the layout
// is wrong — exactly the class of gap that reads as "looks very different".
//
// This script consumes two `extract-mock.js` dumps (reference + target, same viewport)
// and emits a STRUCTURE report: layout-property mismatches on matched containers, plus
// MISSING / EXTRA / REORDERED nodes. Run it BEFORE the style diff (structure before
// styling). Match nodes by, in order: `data-fid` anchor → normalized text+tag →
// structural tag-path. Add `data-fid="x"` to the matching ref+target nodes to make a
// region's matching exact (kills text-collision mispairs).
//
//   node structure-diff.mjs --mock ref.json --app target.json [--out structure-report.md]
//   # scope to one section by passing pre-sliced dumps, or use --anchor "<text in the section>"

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => {
    if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]?.startsWith('--') ? true : arr[i + 1]]);
    return a;
  }, []),
);
if (!args.mock || !args.app) {
  console.error('usage: node structure-diff.mjs --mock <ref.json> --app <target.json> [--anchor TEXT] [--out report.md]');
  process.exit(2);
}
const OUT = args.out || '.mockup-fidelity/diff/structure-report.md';
const ANCHOR = args.anchor ? norm(args.anchor) : null;

const load = (p) => {
  let v = JSON.parse(readFileSync(p, 'utf8'));
  if (typeof v === 'string') v = JSON.parse(v); // playwright-cli --filename double-encodes
  return v;
};
function norm(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); }

const mockDoc = load(args.mock);
const appDoc = load(args.app);
const mock = mockDoc.nodes || [];
const app = appDoc.nodes || [];

// ---- helpers -------------------------------------------------------------
const childrenOf = (nodes, i) => nodes.filter((n) => n.parent === i);
function colCount(gtc) {
  // getComputedStyle resolves `repeat(4,1fr)` to explicit per-track values, so counting
  // top-level whitespace-separated tokens (ignoring anything inside parentheses) = columns.
  if (!gtc || gtc === 'none') return null;
  let depth = 0, count = 0, inTok = false;
  for (const ch of gtc) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ' ' && depth === 0) inTok = false;
    else if (depth === 0 && !inTok) { inTok = true; count++; }
  }
  return count || null;
}
// A node's structural path: tag chain + child-index from root (stable identity w/o text).
function pathOf(nodes, n) {
  const parts = [];
  let cur = n;
  while (cur && cur.parent !== -1) {
    const sibs = childrenOf(nodes, cur.parent);
    parts.unshift(`${cur.tag}[${sibs.indexOf(cur)}]`);
    cur = nodes[cur.parent];
  }
  return parts.join('/');
}
function sigText(n) { return norm(n.text).slice(0, 60); }

// ---- node matching (fid → text+tag → path) -------------------------------
function buildMatch(mockNodes, appNodes) {
  const pairs = new Map(); // mockIndex -> appNode
  const usedApp = new Set();
  const take = (mn, an) => { if (an && !usedApp.has(an.i)) { pairs.set(mn.i, an); usedApp.add(an.i); return true; } return false; };

  // 1) by fid
  const appByFid = new Map();
  for (const a of appNodes) if (a.fid) appByFid.set(a.fid, a);
  for (const m of mockNodes) if (m.fid && appByFid.has(m.fid)) take(m, appByFid.get(m.fid));

  // 2) by normalized text + tag (only non-trivial text)
  const appByText = new Map();
  for (const a of appNodes) {
    const t = sigText(a);
    if (t.length < 2) continue;
    const k = a.tag + '|' + t;
    if (!appByText.has(k)) appByText.set(k, []);
    appByText.get(k).push(a);
  }
  for (const m of mockNodes) {
    if (pairs.has(m.i)) continue;
    const t = sigText(m);
    if (t.length < 2) continue;
    const cands = appByText.get(m.tag + '|' + t) || [];
    take(m, cands.find((a) => !usedApp.has(a.i)));
  }

  // 3) by structural path
  const appByPath = new Map();
  for (const a of appNodes) appByPath.set(pathOf(appNodes, a), a);
  for (const m of mockNodes) {
    if (pairs.has(m.i)) continue;
    take(m, appByPath.get(pathOf(mockNodes, m)));
  }
  return { pairs, usedApp };
}

// scope to a section if --anchor given (slice both trees to the subtree whose nearest
// container holds the anchor text)
function scope(nodes, anchor) {
  if (!anchor) return nodes;
  const hit = nodes.find((n) => norm(n.text).includes(anchor));
  if (!hit) return nodes;
  // climb to a reasonably-sized container (a section-ish ancestor)
  let root = hit;
  for (let k = 0; k < 4 && nodes[root.parent] && root.parent !== -1; k++) root = nodes[root.parent];
  const keep = new Set([root.i]);
  let changed = true;
  while (changed) { changed = false; for (const n of nodes) if (keep.has(n.parent) && !keep.has(n.i)) { keep.add(n.i); changed = true; } }
  return nodes.filter((n) => keep.has(n.i));
}

const M = scope(mock, ANCHOR);
const A = scope(app, ANCHOR);
const { pairs, usedApp } = buildMatch(M, A);

// ---- collect findings ----------------------------------------------------
const LAYOUT_PROPS = ['display', 'flexDirection', 'gridTemplateColumns', 'flexWrap', 'gap', 'columnGap', 'rowGap', 'justifyContent', 'alignItems'];
const layoutFails = [];
const childCountFails = [];
// CONTAINER STYLE diffs (improvement A) — structure-diff already pairs nodes by path, so it's
// the natural place to also surface STYLE divergences on matched NON-TEXT containers that the
// text-probe style differ can't reach: a section's full-bleed gradient/media layer present vs
// absent, a card border/divider gained/lost, a background-colour or radius change. Emitted only
// for nodes with NO own text (a styled container, not a label) to stay distinct from diff.mjs.
const containerStyleFails = [];
const hexOf = (c) => { if (c == null) return null; const s = String(c).trim().toLowerCase(); if (!s || s === 'transparent') return 'transparent'; const m = s.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(',').map(Number); if (p.length >= 4 && p[3] === 0) return 'transparent'; return '#' + p.slice(0, 3).map(n => Math.round(n).toString(16).padStart(2, '0')).join(''); } return s; };
const numOf = (v) => { if (v == null) return null; const m = String(v).match(/-?[\d.]+/); return m ? parseFloat(m[0]) : null; };
for (const m of M) {
  const a = pairs.get(m.i);
  if (!a) continue;
  const mc = m.comp || {}, ac = a.comp || {};
  // container-style comparison (non-text styled containers only)
  if (!norm(m.text) && (m.rect?.w || 0) >= 80 && (m.rect?.h || 0) >= 8) {
    const lbl = `${m.tag}.${(m.cls || '').split(/\s+/)[0]} @y${Math.round(m.rect?.y || 0)}`;
    if (m.fullBleedMedia && !a.fullBleedMedia) containerStyleFails.push({ el: lbl, prop: 'bg-media-layer', app: 'none', mock: m.fullBleedMedia.tag });
    if (m.divider && !a.divider) containerStyleFails.push({ el: lbl, prop: 'divider', app: 'absent', mock: `${m.divider.kind} ${m.divider.thickness}px` });
    const mBt = numOf(mc.borderTopWidth) || 0, aBt = numOf(ac.borderTopWidth) || 0;
    if (Math.abs(mBt - aBt) > 0.5) containerStyleFails.push({ el: lbl, prop: 'border-top-width', app: aBt, mock: mBt });
    const mBb = numOf(mc.borderBottomWidth) || 0, aBb = numOf(ac.borderBottomWidth) || 0;
    if (Math.abs(mBb - aBb) > 0.5) containerStyleFails.push({ el: lbl, prop: 'border-bottom-width', app: aBb, mock: mBb });
    const mBg = hexOf(mc.backgroundColor), aBg = hexOf(ac.backgroundColor);
    if (mBg !== aBg && (mBg !== 'transparent' || aBg !== 'transparent')) containerStyleFails.push({ el: lbl, prop: 'background', app: aBg, mock: mBg });
  }
  for (const p of LAYOUT_PROPS) {
    let mv = mc[p], av = ac[p];
    if (p === 'gridTemplateColumns') { const mn = colCount(mv), an = colCount(av); if (mn !== an && (mn || an)) layoutFails.push({ el: sigText(m) || m.tag, prop: 'grid-columns', app: an ?? '—', mock: mn ?? '—' }); continue; }
    if (mv == null || av == null) continue;
    if (String(mv) !== String(av)) {
      // gap/justify/align only matter on flex/grid containers
      if ((p.includes('gap') || p === 'justifyContent' || p === 'alignItems' || p === 'flexWrap') && !/flex|grid/.test(mc.display || '')) continue;
      layoutFails.push({ el: sigText(m) || m.tag, prop: p, app: String(av), mock: String(mv) });
    }
  }
  // child-count divergence on a matched container (a missing/extra row, icon, divider)
  const mKids = childrenOf(M, m.i).length, aKids = childrenOf(A, a.i).length;
  if (mKids !== aKids && mKids > 0) childCountFails.push({ el: sigText(m) || m.tag, app: aKids, mock: mKids });
}

// MISSING: a mock node (with meaningful identity) that never matched
const missing = M.filter((m) => !pairs.has(m.i) && (sigText(m).length >= 2 || isVisual(m)))
  .map((m) => ({ tag: m.tag, text: sigText(m), kind: visualKind(m), path: pathOf(M, m) }));
// EXTRA: an app node that no mock node claimed
const extra = A.filter((a) => !usedApp.has(a.i) && (sigText(a).length >= 2 || isVisual(a)))
  .map((a) => ({ tag: a.tag, text: sigText(a), kind: visualKind(a), path: pathOf(A, a) }));

function isVisual(n) {
  // a non-text structural element that still carries visual weight: svg/img/hr, or a
  // small empty box with a background/border/radius (an icon tile, a divider, a dot).
  if (['svg', 'img', 'hr', 'path'].includes(n.tag)) return true;
  const c = n.comp || {};
  const hasBg = c.backgroundColor && c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent';
  const hasBorder = c.borderTopWidth && parseFloat(c.borderTopWidth) > 0;
  const small = n.rect && n.rect.w <= 80 && n.rect.h <= 80;
  return (hasBg || hasBorder) && small && !sigText(n);
}
function visualKind(n) {
  if (['svg', 'path', 'img'].includes(n.tag)) return 'icon/image';
  if (n.tag === 'hr') return 'divider';
  if (isVisual(n)) return 'icon/tile/dot';
  return 'text';
}

// ---- write report --------------------------------------------------------
const L = [];
L.push(`# Structure diff${ANCHOR ? ` — section “${args.anchor}”` : ''}`);
L.push(`- mock: \`${args.mock}\` (${M.length} nodes)  ·  target: \`${args.app}\` (${A.length} nodes)`);
L.push(`- matched: ${pairs.size}  ·  **layout mismatches: ${layoutFails.length}**  ·  **container-style diffs: ${containerStyleFails.length}**  ·  **missing (in mock, absent in app): ${missing.length}**  ·  **extra (app-only): ${extra.length}**  ·  child-count diffs: ${childCountFails.length}`);
L.push('');
L.push('> Read this BEFORE the style diff. A layout/missing/extra finding is a STRUCTURAL defect the per-property style report cannot show. Resolve each to a fix or a cited intentional divergence.');
L.push('');

if (containerStyleFails.length) {
  L.push('## ◆ Container-style diffs (non-text section/card/divider: media-layer · border · divider · bg)');
  L.push('| container | property | target | mock |', '|---|---|---|---|');
  for (const f of containerStyleFails) L.push(`| ${esc(f.el)} | ${f.prop} | \`${f.app}\` | \`${f.mock}\` |`);
  L.push('');
}
if (layoutFails.length) {
  L.push('## ❌ Layout mismatches (grid columns · flex-direction · gap · wrap · justify/align)');
  L.push('| container | property | target | mock |', '|---|---|---|---|');
  for (const f of layoutFails) L.push(`| ${esc(f.el)} | ${f.prop} | \`${f.app}\` | \`${f.mock}\` |`);
  L.push('');
}
if (childCountFails.length) {
  L.push('## ◑ Child-count differences (a missing/extra row · icon · divider inside a matched container)');
  L.push('| container | target children | mock children |', '|---|---|---|');
  for (const f of childCountFails) L.push(`| ${esc(f.el)} | ${f.app} | ${f.mock} |`);
  L.push('');
}
if (missing.length) {
  L.push('## ⊖ MISSING — in the mock, absent in the target (build these)');
  L.push('| kind | text / tag | mock path |', '|---|---|---|');
  for (const m of missing.slice(0, 200)) L.push(`| ${m.kind} | ${esc(m.text || '‹' + m.tag + '›')} | \`${esc(m.path)}\` |`);
  if (missing.length > 200) L.push(`| … | _${missing.length - 200} more_ | |`);
  L.push('');
}
if (extra.length) {
  L.push('## ⊕ EXTRA — in the target, NOT in the mock (remove, or cite why it stays)');
  L.push('| kind | text / tag | target path |', '|---|---|---|');
  for (const e of extra.slice(0, 200)) L.push(`| ${e.kind} | ${esc(e.text || '‹' + e.tag + '›')} | \`${esc(e.path)}\` |`);
  if (extra.length > 200) L.push(`| … | _${extra.length - 200} more_ | |`);
  L.push('');
}
if (!layoutFails.length && !missing.length && !extra.length && !childCountFails.length) {
  L.push('## ✓ No structural divergences — same grid/flex layout, same node set. Proceed to the style diff (`diff.mjs`).');
}

function esc(s) { return String(s ?? '').replace(/\|/g, '\\|'); }
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, L.join('\n'));
writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({ matched: pairs.size, layoutFails, childCountFails, missing, extra }, null, 2));
console.log(`structure-diff → ${OUT}  (layout:${layoutFails.length} missing:${missing.length} extra:${extra.length} childcount:${childCountFails.length})`);
