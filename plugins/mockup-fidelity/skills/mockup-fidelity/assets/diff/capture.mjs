// mockup-fidelity CAPTURE HARNESS (v2.5.0) — the Node-side orchestrator around the browser-injectable
// analyze.js. It adds the three trustworthy RENDERED signals that a getComputedStyle dump (and therefore
// analyze.js alone) structurally cannot provide:
//
//   1. CDP RENDERED-FONT (the headline fix).  Per visible text node it calls
//      `CSS.getPlatformFontsForNode` over a raw CDP session and records the ACTUAL rendered familyName +
//      isCustomFont — the genuinely-rendered typeface, not the declared font-family. Live can resolve to its
//      loaded web font ("Inter Medium", isCustomFont:true) while the target silently falls back to the system
//      face ("Helvetica", isCustomFont:false) even though getComputedStyle font-family still lists Inter first
//      on BOTH sides. analyze.js's DOM-span probe approximates this; CDP MEASURES it. The two are recorded
//      keyed by normalised text + tag + frame-relative bbox so MODE B can pair them.
//
//   2. ELEMENT-SCOPED RASTER DIFF (odiff).  A full-page screenshot is captured per side; each PAIRED element
//      (paired by analyze.js MODE B's structure — text/structure pairing, plus the v2.5.0 IoU text-less
//      pairing) is cropped from both screenshots by its bounding box and the two equal-size crops are run
//      through odiff. A localized mismatch% with computed styles MATCHING ⇒ a layout/occlusion/rendering
//      anomaly the DOM passes are blind to — most importantly a MISSING DECORATIVE CHILD (a trailing → svg,
//      a divider, an icon) the structure pass passed because both element boxes exist.
//
//   3. IoU TEXT-LESS PAIRING.  analyze.js pairs by text + structural path; a bare <svg> / icon / decorative
//      div has no text. After the normal pairing we pair the remaining text-less nodes across sides by
//      Intersection-over-Union of bounding boxes (≥0.9), so an arrow/icon becomes a paired candidate the
//      raster + presence checks can evaluate.
//
// All of this is orchestrated HERE in Node (playwright-core + odiff-bin) because the raw CDP font path and a
// real headless screenshot are unreachable through the `playwright-cli eval` wrapper that drives analyze.js.
// analyze.js's injectable MODE A/B contract is UNCHANGED — this harness injects it verbatim and consumes its
// JSON, then ENRICHES the findings with bbox-delta + odiff mismatch% + rendered-font where relevant.
//
// FONT-RENDER-HINTING DETERMINISM: chromium is launched with ['--font-render-hinting=none'] so glyph
// rasterisation is stable across machines, reducing font-edge false positives in the raster crops. NOTE
// (documented in run.md): this does NOT make headless == a real browser. The CDP rendered-font check — not
// any width number and not the raster %, both of which a headless renderer can still skew — is the
// trustworthy signal for the FONT class.
//
// USAGE:
//   node capture.mjs --ref <refURL|file> --target <targetURL|file> --out <dir> [options]
//     --ref       reference (LIVE rendered URL, e.g. https://diolog.app/) — required
//     --target    target (e.g. http://diolog.site/) — required
//     --out       output directory for artifacts (created if absent) — required
//     --analyze   path to analyze.js (default: ./analyze.js next to this file)
//     --width     viewport width (default 1280)
//     --height    viewport height (default 2000)
//     --frame-selector / --frame-title / --frame-index  forwarded to analyze.js __MF_OPTS__
//     --chrome-selector  forwarded (default '__none__' for web↔web so app chrome is measured)
//     --iou       IoU threshold for text-less pairing (default 0.9)
//     --raster-min  minimum element area (px²) to raster-diff (default 64; skips 1px slivers)
//     --raster-max  max paired elements to raster-diff (default 600; protects runtime)
//     --no-raster   skip the odiff raster layer (CDP fonts + analyze.js only)
//     --no-fonts    skip the CDP rendered-font layer
//
// OUTPUT (in --out):
//   reference.analysis.json   MODE-A analysis of the reference
//   target.findings.json      MODE-B { summary, findings, noiseExcluded, analysis } ENRICHED with
//                             renderedFont / raster blocks + summary.layers
//   reference.fonts.json      per-text-node CDP rendered fonts (reference)
//   target.fonts.json         per-text-node CDP rendered fonts (target)
//   reference.full.png        full-page reference screenshot (raster source)
//   target.full.png           full-page target screenshot (raster source)
//   raster/*.png              per-element diff crops for raster findings (diff masks)

import { chromium } from 'playwright-core';
import { compare } from 'odiff-bin';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, isAbsolute } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------- arg parsing ----------
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith('--')) continue;
    const name = k.slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith('--')) { a[name] = true; }
    else { a[name] = next; i++; }
  }
  return a;
}
const args = parseArgs(process.argv.slice(2));
function need(name) {
  if (args[name] == null || args[name] === true) {
    console.error(`ERROR: --${name} is required`);
    process.exit(2);
  }
  return args[name];
}

const REF = need('ref');
const TARGET = need('target');
const OUT = resolve(need('out'));
const ANALYZE_PATH = args.analyze ? resolve(String(args.analyze)) : join(__dirname, 'analyze.js');
const VW = parseInt(args.width ?? '1280', 10);
const VH = parseInt(args.height ?? '2000', 10);
const IOU_THRESHOLD = parseFloat(args.iou ?? '0.9');
const RASTER_MIN_AREA = parseInt(args['raster-min'] ?? '64', 10);
const RASTER_MAX = parseInt(args['raster-max'] ?? '600', 10);
const DO_RASTER = !args['no-raster'];
const DO_FONTS = !args['no-fonts'];
const CHROME_SELECTOR = args['chrome-selector'] ?? '__none__';

if (!existsSync(ANALYZE_PATH)) { console.error(`ERROR: analyze.js not found at ${ANALYZE_PATH}`); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const RASTER_DIR = join(OUT, 'raster');
if (DO_RASTER) mkdirSync(RASTER_DIR, { recursive: true });

const ANALYZE_SRC = readFileSync(ANALYZE_PATH, 'utf8');

// resolve a ref/target that may be a URL or a local file path → a goto-able target.
function toNavTarget(s) {
  if (/^https?:\/\//i.test(s) || /^file:\/\//i.test(s)) return s;
  // a local file path
  const p = isAbsolute(s) ? s : resolve(s);
  return 'file://' + p;
}

// ---------- analyze.js injection (MODE A / MODE B) ----------
// analyze.js is an `(async function(){…})()` IIFE that READS globals and RETURNS a JSON string. We run it
// via page.evaluate by wrapping it so the page sets the globals first, then returns the IIFE's resolved
// value. Because page.evaluate serialises a function, we build the body as a string and use `new Function`
// shape via evaluate(string). playwright's evaluate(pageFunction|string) accepts a string expression.
async function runAnalyze(page, { reference } = {}) {
  // Set globals, then evaluate the IIFE source as an expression and await it.
  await page.evaluate(
    ({ opts, ref }) => {
      globalThis.__MF_OPTS__ = opts;
      globalThis.__MF_REFERENCE__ = ref || null;
      globalThis.__MF_REFERENCE_BYWIDTH__ = null;
      globalThis.__MF_TARGET_BYWIDTH__ = null;
    },
    { opts: buildOpts(), ref: reference ?? null },
  );
  // analyze.js source IS the IIFE expression (it ends with `})()`), so evaluating it returns the promise.
  const raw = await page.evaluate(ANALYZE_SRC);
  let v = raw;
  if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { /* leave as string */ } }
  return v;
}

function buildOpts() {
  const o = { chromeSelector: CHROME_SELECTOR };
  if (args['frame-selector']) o.frameSelector = String(args['frame-selector']);
  if (args['frame-title']) o.frameTitle = String(args['frame-title']);
  if (args['frame-index']) o.frameIndex = parseInt(String(args['frame-index']), 10);
  return o;
}

// ---------- frame origin (for screenshot↔analysis coordinate mapping) ----------
// analyze.js records each node's rect as FRAME-RELATIVE (x/y relative to the frame root's top-left). For the
// raster crop we need VIEWPORT/page coordinates. We read the frame root's bounding rect in page coords here,
// using the SAME frame-selection logic analyze.js uses, so node.rect.{x,y} + frameOrigin = page coords.
async function readFrameOrigin(page) {
  return await page.evaluate((opts) => {
    const SEL = opts.frameSelector;
    const TITLE = opts.frameTitle;
    const INDEX = opts.frameIndex;
    const FRAME_SEL = 'figure, .frame';
    const CAP_SEL = 'figcaption, .cap';
    const ROOT_PROBES = ['.scr', '.screen', '.frame', '.phone'];
    const screenOf = (fig) => {
      if (!fig) return null;
      for (const s of ROOT_PROBES) { const hit = fig.querySelector(s); if (hit) return hit; }
      return fig;
    };
    let root;
    if (SEL) root = document.querySelector(SEL);
    else if (INDEX != null) root = screenOf([...document.querySelectorAll(FRAME_SEL)][INDEX - 1]);
    else if (TITLE) {
      const fig = [...document.querySelectorAll(FRAME_SEL)].find(
        (f) => ((f.querySelector(CAP_SEL) || {}).textContent || '').replace(/\s+/g, ' ').includes(TITLE),
      );
      root = screenOf(fig);
    } else root = document.body;
    if (!root) return { x: 0, y: 0, found: false };
    const r = root.getBoundingClientRect();
    // page (document) coords = client rect + scroll offset
    return { x: r.left + (window.scrollX || 0), y: r.top + (window.scrollY || 0), found: true, dpr: window.devicePixelRatio || 1 };
  }, buildOpts());
}

// ======================================================================
// CDP RENDERED-FONT EXTRACTION (the PROVEN sequence)
// ======================================================================
// Per visible text node we get the genuinely-rendered typeface via CSS.getPlatformFontsForNode. The two
// non-obvious gotchas (proven in the spike) are baked in:
//   (1) you can NOT get a usable CDP objectId from a Playwright JSHandle (handle._object is undefined in
//       pw 1.61) — instead do the element lookup INSIDE a CDP Runtime.evaluate and keep the result as a
//       RemoteObject (returnByValue:false → objectId);
//   (2) you MUST call DOM.getDocument BEFORE DOM.requestNode, or the returned nodeId is unresolvable
//       ("Could not find node with given id").
// We harvest EVERY visible text node in one Runtime.evaluate (tagging each with a sequential index + its
// normalised text + tag + frame-relative bbox), then for each index re-resolve the node object and call
// getPlatformFontsForNode. Keyed for MODE-B pairing by `${tag}|${normText}` (+ bbox for disambiguation).
async function extractRenderedFonts(page, frameOrigin) {
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('DOM.enable');
    await client.send('CSS.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.getDocument', { depth: -1, pierce: true }); // REQUIRED first

    // (1) Catalogue every visible text node into a page-global array, returning lightweight metadata.
    //     We keep the actual Text nodes referenced from window.__MF_TEXTNODES__ so a follow-up
    //     Runtime.evaluate can return each by index as a RemoteObject (objectId).
    const fox = frameOrigin?.x || 0, foy = frameOrigin?.y || 0;
    const { result: catResult } = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();
        const fox = ${JSON.stringify(fox)}, foy = ${JSON.stringify(foy)};
        const nodes = [];
        const meta = [];
        const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const t = norm(n.nodeValue);
          if (!t) continue;
          const parent = n.parentElement;
          if (!parent) continue;
          // visibility / layout gate — skip script/style/hidden/zero-box text
          const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
          if (tag === 'script' || tag === 'style' || tag === 'noscript') continue;
          let rect;
          try { const rng = document.createRange(); rng.selectNodeContents(n); rect = rng.getBoundingClientRect(); } catch (e) { continue; }
          if (!rect || rect.width <= 0 || rect.height <= 0) continue;
          const cs = getComputedStyle(parent);
          if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
          const idx = nodes.length;
          nodes.push(n);
          meta.push({
            idx, tag, text: t.slice(0, 80),
            declaredFamily: (cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim(),
            declaredWeight: cs.fontWeight, declaredSize: cs.fontSize,
            // frame-relative bbox (page coords minus frame origin) — matches analyze.js node.rect space
            rect: {
              x: +(rect.left + (window.scrollX || 0) - fox).toFixed(1),
              y: +(rect.top + (window.scrollY || 0) - foy).toFixed(1),
              w: +rect.width.toFixed(1), h: +rect.height.toFixed(1),
            },
          });
        }
        window.__MF_TEXTNODES__ = nodes;
        return JSON.stringify(meta);
      })()`,
      returnByValue: true,
    });
    const meta = JSON.parse(catResult.value || '[]');

    const out = [];
    // (2) Per index: re-resolve the Text node as a RemoteObject, requestNode → nodeId,
    //     getPlatformFontsForNode → the ACTUAL rendered typefaces.
    for (const m of meta) {
      let entry = { ...m, fonts: [], rendered: null, isCustomFont: null };
      try {
        const { result } = await client.send('Runtime.evaluate', {
          expression: `window.__MF_TEXTNODES__[${m.idx}]`,
          returnByValue: false, // keep as RemoteObject → objectId
        });
        if (!result || !result.objectId) { out.push(entry); continue; }
        const { nodeId } = await client.send('DOM.requestNode', { objectId: result.objectId });
        const { fonts } = await client.send('CSS.getPlatformFontsForNode', { nodeId });
        // fonts[] is ordered by glyph coverage; the first (most glyphs) is the dominant rendered face.
        const mapped = (fonts || []).map((f) => ({
          familyName: f.familyName, isCustomFont: !!f.isCustomFont, glyphCount: f.glyphCount,
          postScriptName: f.postScriptName,
        }));
        const dominant = mapped.slice().sort((a, b) => (b.glyphCount || 0) - (a.glyphCount || 0))[0] || null;
        entry.fonts = mapped;
        entry.rendered = dominant ? dominant.familyName : null;
        entry.isCustomFont = dominant ? dominant.isCustomFont : null;
      } catch (e) {
        entry.error = String(e && e.message || e);
      }
      out.push(entry);
    }
    // clean up the page global we created
    try { await client.send('Runtime.evaluate', { expression: 'delete window.__MF_TEXTNODES__', returnByValue: true }); } catch (e) {}
    return out;
  } finally {
    try { await client.detach(); } catch (e) {}
  }
}

// ======================================================================
// SIDE CAPTURE — one page: analyze.js + frame origin + screenshot + CDP fonts
// ======================================================================
async function captureSide(browser, navTarget, { reference, label } = {}) {
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    try { await page.goto(navTarget, { waitUntil: 'networkidle', timeout: 45000 }); }
    catch (e) { await page.goto(navTarget, { waitUntil: 'domcontentloaded', timeout: 45000 }); await page.waitForTimeout(2500); }
    try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch (e) {}
    await page.waitForTimeout(400);

    const analysis = await runAnalyze(page, { reference });
    const frameOrigin = await readFrameOrigin(page);

    let pngPath = null;
    if (DO_RASTER) {
      pngPath = join(OUT, `${label}.full.png`);
      await page.screenshot({ path: pngPath, fullPage: true });
    }
    let fonts = null;
    if (DO_FONTS) {
      try { fonts = await extractRenderedFonts(page, frameOrigin); }
      catch (e) { fonts = { error: String(e && e.message || e) }; }
    }
    return { analysis, frameOrigin, pngPath, fonts };
  } finally {
    await ctx.close();
  }
}

// ======================================================================
// MODE-B PAIRING REPLAY — recover {mock node, target node} pairs from analyze.js's analyses.
// ======================================================================
// analyze.js computes the pairing internally but only surfaces findings (with a TARGET locator), not the
// explicit pair list. We re-derive the same pairing chain here (fid → tag+text → structural path), then ADD
// the v2.5.0 IoU TEXT-LESS pairing for the remaining bare svg/icon/decorative-div nodes. The result is the
// list of element pairs the raster + font layers operate on. (This intentionally mirrors analyze.js's
// `matchedPairs`; we replicate it rather than change analyze.js's contract.)
function normText(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); }
function buildKidsPath(nodes) {
  const kids = new Map();
  for (const n of nodes) { if (!kids.has(n.parent)) kids.set(n.parent, []); kids.get(n.parent).push(n); }
  const byIndex = new Map(nodes.map((n) => [n.i, n]));
  const pathOf = (n) => {
    const parts = []; let cur = n, hops = 0;
    while (cur && cur.parent >= 0 && hops++ < 40) {
      const sibs = kids.get(cur.parent) || [];
      parts.unshift(`${cur.tag}[${sibs.indexOf(cur)}]`);
      cur = byIndex.get(cur.parent);
    }
    return parts.join('/');
  };
  return { kids, byIndex, pathOf };
}
function iou(a, b) {
  if (!a || !b) return 0;
  const ax2 = a.x + a.w, ay2 = a.y + a.h, bx2 = b.x + b.w, by2 = b.y + b.h;
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y));
  const inter = ix * iy;
  if (inter <= 0) return 0;
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}
function buildPairs(refAnalysis, tgtAnalysis) {
  const mock = refAnalysis.nodes || [];
  const app = tgtAnalysis.nodes || [];
  const pairs = []; // { mock, app, via }
  const usedApp = new Set();
  const take = (m, a, via) => { if (a && !usedApp.has(a.i)) { pairs.push({ mock: m, app: a, via }); usedApp.add(a.i); return true; } return false; };

  // (0) fid
  const byFid = new Map(); for (const a of app) if (a.fid) byFid.set(a.fid, a);
  for (const m of mock) if (m.fid && byFid.has(m.fid)) take(m, byFid.get(m.fid), 'fid');
  const paired = new Set(pairs.map((p) => p.mock.i));

  // (1) tag + normalised text
  const byText = new Map();
  for (const a of app) { const t = normText(a.text).slice(0, 60); if (t.length < 2) continue; const k = a.tag + '|' + t; if (!byText.has(k)) byText.set(k, []); byText.get(k).push(a); }
  for (const m of mock) {
    if (paired.has(m.i)) continue;
    const t = normText(m.text).slice(0, 60); if (t.length < 2) continue;
    const cand = (byText.get(m.tag + '|' + t) || []).find((a) => !usedApp.has(a.i));
    if (take(m, cand, 'text')) paired.add(m.i);
  }

  // (2) structural path
  const mp = buildKidsPath(mock), ap = buildKidsPath(app);
  const byPath = new Map(); for (const a of app) { const p = ap.pathOf(a); if (!byPath.has(p)) byPath.set(p, a); }
  for (const m of mock) {
    if (paired.has(m.i)) continue;
    const cand = byPath.get(mp.pathOf(m));
    if (take(m, cand, 'path')) paired.add(m.i);
  }

  // (3) v2.5.0 — IoU TEXT-LESS pairing for the remaining bare svg/icon/decorative-div nodes.
  //     Pair remaining unpaired TEXT-LESS mock nodes to unpaired TEXT-LESS app nodes by bbox IoU ≥ threshold.
  const isTextless = (n) => !normText(n.text) && (n.rect?.w || 0) > 0 && (n.rect?.h || 0) > 0;
  const textlessApp = app.filter((a) => isTextless(a) && !usedApp.has(a.i));
  let iouPaired = 0;
  for (const m of mock) {
    if (paired.has(m.i) || !isTextless(m)) continue;
    let best = null, bestIoU = 0;
    for (const a of textlessApp) {
      if (usedApp.has(a.i)) continue;
      const ov = iou(m.rect, a.rect);
      if (ov > bestIoU) { bestIoU = ov; best = a; }
    }
    if (best && bestIoU >= IOU_THRESHOLD) {
      if (take(m, best, 'iou')) { paired.add(m.i); iouPaired++; }
    }
  }
  return { pairs, iouPaired };
}

// ======================================================================
// RASTER LAYER — crop each paired element from both full-page PNGs and odiff the equal-size crops.
// ======================================================================
// We crop each full-page PNG by re-opening it in a fresh data-URL page and slicing it on a <canvas>. That
// keeps deps to playwright-core + odiff only (no sharp / no native image lib), and odiff needs each side's
// crop as its own PNG file. (CDP Runtime.evaluate interpolations in this file are only JSON-stringified
// NUMBERS — frame-origin coords and node indices — never untrusted strings, so there is no injection path;
// the analyze.js source string passed to page.evaluate is read from disk and is the trusted skill asset.)
async function cropFromPng(browser, pngPath, rect, dpr, outPath) {
  // rect is in PAGE coordinates (frame-relative + frameOrigin already applied by caller). Screenshot pixels
  // are page-px × dpr; with deviceScaleFactor:1 dpr==1, so page coords == screenshot px.
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    const dataUrl = 'data:image/png;base64,' + readFileSync(pngPath).toString('base64');
    const ok = await page.evaluate(async ({ url, r, scale }) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const sx = Math.max(0, Math.round(r.x * scale));
      const sy = Math.max(0, Math.round(r.y * scale));
      const sw = Math.max(1, Math.round(r.w * scale));
      const sh = Math.max(1, Math.round(r.h * scale));
      const c = document.createElement('canvas');
      c.width = sw; c.height = sh;
      const g = c.getContext('2d');
      g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      window.__MF_CROP__ = c.toDataURL('image/png');
      return true;
    }, { url: dataUrl, r: rect, scale: dpr || 1 });
    if (!ok) return false;
    const cropUrl = await page.evaluate(() => window.__MF_CROP__);
    const b64 = String(cropUrl).split(',')[1];
    writeFileSync(outPath, Buffer.from(b64, 'base64'));
    return true;
  } finally {
    await ctx.close();
  }
}

async function rasterLayer(browser, pairs, refSide, tgtSide) {
  const refOrigin = refSide.frameOrigin || { x: 0, y: 0, dpr: 1 };
  const tgtOrigin = tgtSide.frameOrigin || { x: 0, y: 0, dpr: 1 };
  const refDpr = refOrigin.dpr || 1, tgtDpr = tgtOrigin.dpr || 1;
  // candidate pairs: both rects sized, area ≥ min, sort by area desc and cap.
  const cands = pairs.pairs
    .filter((p) => p.mock.rect && p.app.rect && p.mock.rect.w > 0 && p.mock.rect.h > 0 && p.app.rect.w > 0 && p.app.rect.h > 0)
    .filter((p) => (p.mock.rect.w * p.mock.rect.h) >= RASTER_MIN_AREA)
    .sort((a, b) => (b.mock.rect.w * b.mock.rect.h) - (a.mock.rect.w * a.mock.rect.h))
    .slice(0, RASTER_MAX);

  const results = []; // { pairIndex, via, ref/app rects, match, mismatchPct, diffPath, classifiedAs, sizeMismatch }
  let i = 0;
  for (const p of cands) {
    i++;
    // crop dimensions must match for a meaningful pixel-diff. We crop each side at its own rect, then odiff
    // with failOnLayoutDiff:false so a small size mismatch reports a real pixel-diff% rather than refusing.
    const refRect = { x: (refOrigin.x || 0) + p.mock.rect.x, y: (refOrigin.y || 0) + p.mock.rect.y, w: p.mock.rect.w, h: p.mock.rect.h };
    const tgtRect = { x: (tgtOrigin.x || 0) + p.app.rect.x, y: (tgtOrigin.y || 0) + p.app.rect.y, w: p.app.rect.w, h: p.app.rect.h };
    const refCrop = join(RASTER_DIR, `pair-${i}-ref.png`);
    const tgtCrop = join(RASTER_DIR, `pair-${i}-tgt.png`);
    const diffCrop = join(RASTER_DIR, `pair-${i}-diff.png`);
    let okR = false, okT = false;
    try { okR = await cropFromPng(browser, refSide.pngPath, refRect, refDpr, refCrop); } catch (e) {}
    try { okT = await cropFromPng(browser, tgtSide.pngPath, tgtRect, tgtDpr, tgtCrop); } catch (e) {}
    if (!okR || !okT) continue;
    let res;
    try {
      res = await compare(refCrop, tgtCrop, diffCrop, { failOnLayoutDiff: false, outputDiffMask: false, antialiasing: true });
    } catch (e) { res = { match: null, reason: 'odiff-error', error: String(e && e.message || e) }; }
    const sizeMismatch = !(Math.abs(p.mock.rect.w - p.app.rect.w) <= 1 && Math.abs(p.mock.rect.h - p.app.rect.h) <= 1);
    const mismatchPct = typeof res.diffPercentage === 'number' ? +res.diffPercentage.toFixed(2) : null;
    results.push({
      pairIndex: i, via: p.via,
      mockI: p.mock.i, appI: p.app.i,
      tag: p.app.tag, text: normText(p.app.text).slice(0, 48) || null,
      refRect: { x: +refRect.x.toFixed(1), y: +refRect.y.toFixed(1), w: refRect.w, h: refRect.h },
      tgtRect: { x: +tgtRect.x.toFixed(1), y: +tgtRect.y.toFixed(1), w: tgtRect.w, h: tgtRect.h },
      match: res.match === true,
      mismatchPct, reason: res.reason || null, sizeMismatch,
      diffPath: res.match === false ? diffCrop : null,
    });
  }
  return results;
}

// ======================================================================
// FONT LAYER — pair reference vs target CDP rendered fonts by tag+text (+ nearest bbox), emit findings when
// the genuinely-RENDERED typeface differs (a custom face on one side, a system fallback on the other).
// ======================================================================
function fontLayer(refFonts, tgtFonts) {
  if (!Array.isArray(refFonts) || !Array.isArray(tgtFonts)) return { findings: [], summary: { compared: 0, divergent: 0 } };
  const key = (e) => e.tag + '|' + normText(e.text);
  const tgtByKey = new Map();
  for (const e of tgtFonts) { const k = key(e); if (!tgtByKey.has(k)) tgtByKey.set(k, []); tgtByKey.get(k).push(e); }
  const findings = [];
  let compared = 0;
  const seenKeys = new Set();
  for (const r of refFonts) {
    if (!r.rendered) continue;
    const k = key(r);
    const cands = tgtByKey.get(k);
    if (!cands || !cands.length) continue;
    // disambiguate repeated text by nearest bbox (frame-relative).
    const t = cands.slice().sort((a, b) => {
      const da = Math.hypot((a.rect?.x || 0) - (r.rect?.x || 0), (a.rect?.y || 0) - (r.rect?.y || 0));
      const db = Math.hypot((b.rect?.x || 0) - (r.rect?.x || 0), (b.rect?.y || 0) - (r.rect?.y || 0));
      return da - db;
    })[0];
    if (!t || !t.rendered) continue;
    compared++;
    const rfam = String(r.rendered).trim(), tfam = String(t.rendered).trim();
    // dedup per (declaredFamily|renderedRef|renderedTgt) — a site-wide fallback is ONE root cause.
    const dk = (r.declaredFamily || '') + '|' + rfam.toLowerCase() + '|' + tfam.toLowerCase();
    const sameRendered = rfam.toLowerCase() === tfam.toLowerCase();
    if (sameRendered) continue;
    // genuine divergence: the CDP-reported rendered face differs. This fires EVEN when getComputedStyle
    // font-family agrees or is a generic — the headline case (live "Inter Medium" isCustomFont:true vs
    // target "Helvetica" isCustomFont:false on the SAME declared Inter stack).
    findings.push({
      tag: r.tag, text: normText(r.text).slice(0, 48),
      declaredFamily: r.declaredFamily || null,
      referenceRendered: rfam, referenceCustom: r.isCustomFont,
      targetRendered: tfam, targetCustom: t.isCustomFont,
      rect: t.rect || r.rect || null,
      dedupKey: dk,
      firstOfDedup: !seenKeys.has(dk),
    });
    seenKeys.add(dk);
  }
  // mark dedup counts
  const counts = new Map();
  for (const f of findings) counts.set(f.dedupKey, (counts.get(f.dedupKey) || 0) + 1);
  for (const f of findings) f.dedupCount = counts.get(f.dedupKey);
  return { findings, summary: { compared, divergent: findings.length, distinctRootCauses: counts.size } };
}

// ======================================================================
// ENRICHMENT — fold the font + raster layers into the analyze.js findings payload (the deterministic
// "diff-as-instruction" shape): each finding carries bbox-delta + odiff mismatch% + rendered-font where
// relevant. We ADD new findings for the two new classes and ATTACH raster/font evidence onto existing
// findings whose locator targets the same element box.
// ======================================================================
function enrich(modeB, fontResult, rasterResults, pairs) {
  // Defensive: modeB may be an error or a bare analysis (MODE A) if injection was dropped.
  if (!modeB || !modeB.findings) {
    return { ...(modeB || {}), _harnessNote: 'MODE-B result missing findings; font/raster layers attached separately', renderedFont: fontResult, raster: rasterResults };
  }
  const findings = modeB.findings;
  let nextId = findings.length;
  const newFindings = [];

  // ---- (1) CDP RENDERED-FONT findings — the root-cause font instrument ----
  for (const f of (fontResult?.findings || [])) {
    if (!f.firstOfDedup) continue; // emit ONE per root cause; dedupCount carries the breadth
    const n = (f.targetCustom === false && f.referenceCustom === true)
      ? `the target renders the SYSTEM fallback "${f.targetRendered}" (isCustomFont:false) while the reference renders the loaded web font "${f.referenceRendered}" (isCustomFont:true)`
      : `the genuinely-rendered typeface differs: reference "${f.referenceRendered}"${f.referenceCustom ? ' (custom)' : ''} vs target "${f.targetRendered}"${f.targetCustom ? ' (custom)' : ''}`;
    newFindings.push({
      id: 'mf-cdpfont-' + (++nextId),
      locator: `text "${f.text}"  ·  ${f.tag}${f.rect ? `  ·  @${Math.round(f.rect.x)},${Math.round(f.rect.y)} ${Math.round(f.rect.w)}×${Math.round(f.rect.h)}` : ''}`,
      section: null,
      class: 'font',
      property: 'cdp-rendered-font',
      target: `${f.targetRendered}${f.targetCustom === false ? ' (system fallback)' : ''}`,
      reference: `${f.referenceRendered}${f.referenceCustom ? ' (web font)' : ''}`,
      severity: 'high',
      renderedFont: {
        declaredFamily: f.declaredFamily,
        reference: { familyName: f.referenceRendered, isCustomFont: f.referenceCustom },
        target: { familyName: f.targetRendered, isCustomFont: f.targetCustom },
        affectedNodes: f.dedupCount,
        source: 'CDP CSS.getPlatformFontsForNode',
      },
      suggestedChange: `${n} — getComputedStyle font-family does NOT reveal this (it still lists ${f.declaredFamily || 'the declared family'} first on both sides). Ensure the ${f.referenceRendered} webfont actually LOADS and is APPLIED to this element on the target (check @font-face load, unicode-range, and that the family is wired to it). Affects ${f.dedupCount} text node(s) with this root cause.`,
    });
  }

  // ---- (2) ELEMENT-SCOPED RASTER findings — visual diffs the DOM passes are blind to ----
  // Classify per the research:
  //   · odiff mismatch + computed-style MATCHES ⇒ layout/occlusion/rendering anomaly (incl. a missing
  //     decorative child the DOM passed). Localized small-element ⇒ likely a style/glyph diff.
  // We only EMIT a raster finding above a meaningful threshold so antialiased text edges don't flood.
  const RASTER_FIND_PCT = 12; // % — below this, a crop diff is edge/antialias noise (odiff antialiasing:true already suppresses most)
  // index existing findings by the target element index they reference (via locator bbox heuristics is
  // unreliable; instead we map appI → whether any non-raster finding already exists for it).
  const findingTargetText = new Set(findings.map((x) => normText(String(x.locator || '')).toLowerCase()));
  for (const r of (rasterResults || [])) {
    if (r.match !== false || r.mismatchPct == null || r.mismatchPct < RASTER_FIND_PCT) continue;
    // a size mismatch (the two element boxes differ in size) is itself a geometry finding analyze.js already
    // emits; the raster value here CORROBORATES it. A SAME-SIZE box with a high pixel-diff and no other
    // finding is the interesting case — a missing decorative child / occlusion / rendering anomaly.
    const classifiedAs = r.sizeMismatch
      ? 'geometry/occlusion (element boxes differ in size — corroborates a geometry/wrap finding)'
      : 'rendering-anomaly (same-size box, pixels differ — a missing decorative child / occlusion / glyph or paint difference the DOM passes did not catch)';
    const sev = r.sizeMismatch ? 'med' : 'high';
    newFindings.push({
      id: 'mf-raster-' + (++nextId),
      locator: `${r.tag}${r.text ? ` "${r.text}"` : ''}  ·  @${Math.round(r.tgtRect.x)},${Math.round(r.tgtRect.y)} ${r.tgtRect.w}×${r.tgtRect.h}`,
      section: null,
      class: 'raster',
      property: 'element-raster-diff',
      target: `${r.mismatchPct}% pixels differ`,
      reference: '0% (pixel-identical crop)',
      deltaPx: r.sizeMismatch ? Math.round(Math.max(Math.abs(r.refRect.w - r.tgtRect.w), Math.abs(r.refRect.h - r.tgtRect.h))) : undefined,
      severity: sev,
      raster: {
        mismatchPct: r.mismatchPct,
        classifiedAs,
        sizeMismatch: r.sizeMismatch,
        pairedVia: r.via,
        refRect: r.refRect, targetRect: r.tgtRect,
        diffImage: r.diffPath,
      },
      bboxDelta: { dw: +(r.tgtRect.w - r.refRect.w).toFixed(1), dh: +(r.tgtRect.h - r.refRect.h).toFixed(1) },
      suggestedChange: r.sizeMismatch
        ? `this element's box differs in size (${r.refRect.w}×${r.refRect.h} ref vs ${r.tgtRect.w}×${r.tgtRect.h} target) AND its rendered pixels differ ${r.mismatchPct}% — confirm the geometry/wrap finding for this element and re-check after fixing the size`
        : `this element's box is the SAME size on both sides but its rendered pixels differ by ${r.mismatchPct}% — inspect ${r.diffPath} (the diff crop). The DOM passes matched it, so the difference is a MISSING DECORATIVE CHILD (a trailing → svg, a divider, an icon), an occlusion, or a paint/glyph difference. Add/restore whatever the reference draws here that the target does not.`,
    });
  }

  // ---- merge + re-sort + re-summarise ----
  const allFindings = findings.concat(newFindings);
  const sevRank = { high: 0, med: 1, low: 2 };
  allFindings.sort((a, b) => (sevRank[a.severity] - sevRank[b.severity]) || ((b.deltaPx || 0) - (a.deltaPx || 0)));
  const byClass = {}; for (const f of allFindings) byClass[f.class] = (byClass[f.class] || 0) + 1;
  const bySev = { high: 0, med: 0, low: 0 }; for (const f of allFindings) bySev[f.severity]++;
  const penalty = bySev.high * 5 + bySev.med * 2 + bySev.low * 0.5;
  const score = Math.max(1, Math.round(100 * Math.exp(-penalty / 900)));

  return {
    summary: {
      ...(modeB.summary || {}),
      score,
      totalFindings: allFindings.length,
      bySeverity: bySev,
      byClass,
      layers: {
        analyze: (modeB.findings || []).length,
        cdpRenderedFont: { compared: fontResult?.summary?.compared ?? 0, divergent: fontResult?.summary?.divergent ?? 0, distinctRootCauses: fontResult?.summary?.distinctRootCauses ?? 0, emitted: newFindings.filter((f) => f.class === 'font' && f.property === 'cdp-rendered-font').length },
        raster: { pairsCompared: (rasterResults || []).length, mismatches: (rasterResults || []).filter((r) => r.match === false).length, emitted: newFindings.filter((f) => f.class === 'raster').length },
        iouTextlessPairs: pairs.iouPaired,
      },
    },
    findings: allFindings,
    noiseExcluded: modeB.noiseExcluded || {},
    renderedFontDetail: fontResult?.findings || [],
    rasterDetail: rasterResults || [],
    analysis: modeB.analysis,
  };
}

// ======================================================================
// MAIN
// ======================================================================
async function main() {
  const t0 = Date.now();
  const browser = await chromium.launch({ headless: true, args: ['--font-render-hinting=none'] });
  try {
    // (1) reference — MODE A
    console.error('[mf] capturing reference:', REF);
    const refSide = await captureSide(browser, toNavTarget(REF), { reference: null, label: 'reference' });
    if (refSide.analysis?.error) { console.error('[mf] reference analyze error:', refSide.analysis.error); }
    writeFileSync(join(OUT, 'reference.analysis.json'), JSON.stringify(refSide.analysis));
    if (refSide.fonts) writeFileSync(join(OUT, 'reference.fonts.json'), JSON.stringify(refSide.fonts));

    // (2) target — MODE B (inject the reference analysis)
    console.error('[mf] capturing target:', TARGET);
    const tgtSide = await captureSide(browser, toNavTarget(TARGET), { reference: refSide.analysis, label: 'target' });
    if (tgtSide.fonts) writeFileSync(join(OUT, 'target.fonts.json'), JSON.stringify(tgtSide.fonts));

    const modeB = tgtSide.analysis;
    if (modeB?.error) console.error('[mf] MODE-B error:', modeB.error);

    // (3) pairs (replay analyze.js pairing + IoU text-less)
    let pairs = { pairs: [], iouPaired: 0 };
    if (refSide.analysis?.nodes && (modeB?.analysis?.nodes || modeB?.nodes)) {
      const tgtAnalysis = modeB.analysis?.nodes ? modeB.analysis : modeB;
      pairs = buildPairs(refSide.analysis, tgtAnalysis);
    }
    console.error('[mf] pairs:', pairs.pairs.length, '(', pairs.iouPaired, 'via IoU text-less )');

    // (4) CDP rendered-font layer
    let fontResult = { findings: [], summary: { compared: 0, divergent: 0 } };
    if (DO_FONTS && Array.isArray(refSide.fonts) && Array.isArray(tgtSide.fonts)) {
      fontResult = fontLayer(refSide.fonts, tgtSide.fonts);
      console.error('[mf] CDP fonts compared:', fontResult.summary.compared, 'divergent:', fontResult.summary.divergent);
    }

    // (5) raster layer
    let rasterResults = [];
    if (DO_RASTER && refSide.pngPath && tgtSide.pngPath && pairs.pairs.length) {
      rasterResults = await rasterLayer(browser, pairs, refSide, tgtSide);
      const mm = rasterResults.filter((r) => r.match === false).length;
      console.error('[mf] raster pairs diffed:', rasterResults.length, 'mismatches:', mm);
    }

    // (6) enrich + write
    const enriched = enrich(modeB, fontResult, rasterResults, pairs);
    writeFileSync(join(OUT, 'target.findings.json'), JSON.stringify(enriched));

    console.error('[mf] done in', ((Date.now() - t0) / 1000).toFixed(1) + 's',
      '· score', enriched.summary?.score, '· findings', enriched.summary?.totalFindings,
      '· layers', JSON.stringify(enriched.summary?.layers || {}));
    console.error('[mf] wrote:', join(OUT, 'target.findings.json'));
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error('FATAL', e && e.stack || e); process.exit(1); });
