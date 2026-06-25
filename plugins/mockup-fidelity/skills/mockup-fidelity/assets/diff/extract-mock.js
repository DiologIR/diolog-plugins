// Browser-context mock COMPUTED-style extractor for the mockup-fidelity diff.
//
// AUTHORING-AGNOSTIC: it reads `getComputedStyle` from the RENDERED DOM, so it
// works the same on any mock that renders to a browser —
//   • a hand-written HTML+CSS mockup (served, multi-frame gallery or single page)
//   • a React / Next prototype route
//   • a StyleX app (StyleX compiles to atomic CSS classes at build time, so the
//     computed styles resolve exactly like normal CSS — dev-vs-prod class names
//     don't matter because we read the computed value, not the class)
// Point it at the frame root with MF_FRAME_SELECTOR (any CSS selector — the screen
// root in a React/StyleX app) or MF_FRAME_TITLE (figcaption match, for HTML
// mockup galleries).
//
// WHY computed, never source: never hand-resolve the CSS cascade from source
// rules. A class like `.ai-card` may declare no box-shadow, yet the element
// `class="card ai-card"` still HAS one (inherited from `.card`); a StyleX atomic
// class set resolves the same way. Only getComputedStyle gives the final value —
// read THAT, never the individual class rules.
//
// Run against the SERVED mock (a real browser; file:// often blocks fonts/CSS):
//   playwright-cli open http://localhost:<port>/<mock>.html
//   # pick the frame: a CSS selector, or (for multi-frame HTML mocks) a caption substring
//   playwright-cli eval "() => { window.MF_FRAME_SELECTOR = '#screen-2 .scr'; }"
//   #   …or: window.MF_FRAME_TITLE = 'Discover · home'
//   playwright-cli eval "$(cat extract-mock.js)" --filename mock.<screen>.json
//
// Emits, for every element under the frame root: its COMPUTED style subset and a
// FRAME-RELATIVE rect (measured from the frame's own top-left), so the left/right
// gutter inset is directly comparable to a target measured in a different frame
// width (e.g. an RN device). Native chrome (status bar, tab bar, home indicator,
// nav bar) is skipped — the target app renders that itself, it isn't content.
() => {
  const SEL = window.MF_FRAME_SELECTOR;
  const TITLE = window.MF_FRAME_TITLE;
  const INDEX = window.MF_FRAME_INDEX; // 1-based ordinal, robust when captions aren't unique
  // Frame galleries differ in markup — a `<figure><figcaption>` gallery (e.g. the
  // investor mock) OR a `<div class="frame"><div class="cap">` gallery (e.g. the
  // customer mock, where each `.frame` holds a `.device > .screen` plus a `.cap`).
  // Treat both: frame containers + caption selector are configurable, with the
  // union as the default so the same command works on either format.
  const FRAME_SEL = window.MF_FRAME_CONTAINER || 'figure, .frame';
  const CAP_SEL = window.MF_CAPTION_SELECTOR || 'figcaption, .cap';
  const ROOT_PROBES = ['.scr', '.screen', '.frame', '.phone'];
  // Chrome the target renders natively — not screen content. Override via
  // window.MF_CHROME_SELECTOR for a different mock's chrome class names.
  const CHROME = window.MF_CHROME_SELECTOR || '.sb, .island, .tabbar, .homebar, .nav, .statusbar, .notch';

  // Pick the screen-content node inside a frame container (prefer it over the bezel).
  const screenOf = (fig) => {
    if (!fig) return null;
    for (const s of ROOT_PROBES) { const hit = fig.querySelector(s); if (hit) return hit; }
    return fig;
  };

  let root;
  if (SEL) {
    root = document.querySelector(SEL);
  } else if (INDEX != null) {
    root = screenOf([...document.querySelectorAll(FRAME_SEL)][INDEX - 1]);
  } else if (TITLE) {
    const fig = [...document.querySelectorAll(FRAME_SEL)].find(
      f => (f.querySelector(CAP_SEL)?.textContent || '').replace(/\s+/g, ' ').includes(TITLE),
    );
    root = screenOf(fig);
  } else {
    root = document.body;
  }
  if (!root) return JSON.stringify({ error: 'frame-not-found', selector: SEL, title: TITLE, index: INDEX });
  const f = root.getBoundingClientRect();

  const PROPS = [
    'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'color', 'backgroundColor',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderTopLeftRadius', 'borderTopWidth', 'borderTopColor',
    'borderBottomWidth', 'borderBottomColor',
    'boxShadow', 'display', 'flexDirection', 'alignItems', 'justifyContent',
    'textAlign', 'letterSpacing', 'lineHeight', 'opacity', 'textTransform',
    // text-wrap: `balance` redistributes a heading to EQUAL-length lines, so a word wraps to
    // the next line even when it FITS — a different wrap point from the greedy `wrap` the
    // reference uses, and invisible to width/geometry (the text "fits", it just breaks
    // elsewhere). This was a real miss: "The workspace for" (441px) fit a 558px column yet
    // "for" wrapped, purely because of balance.
    'textWrap', 'textWrapStyle',
    // LAYOUT props — consumed by structure-diff.mjs to catch grid/flex divergences
    // a per-property STYLE diff is structurally blind to (a 2×2 grid rendered 1×4,
    // a row that should be a column, a reflowed gap, an icon column that's missing).
    'gridTemplateColumns', 'gridAutoFlow', 'gap', 'columnGap', 'rowGap',
    'position', 'flexWrap', 'gridTemplateRows',
  ];

  // RENDERED-FONT fingerprint (improvement D) — the declared computed `font-family`
  // can MATCH the reference while the element actually renders in a FALLBACK face
  // (the named webfont never loaded/applied on this origin). `document.fonts.check`
  // is necessary but NOT sufficient — on some origins a face registers as "loaded"
  // yet does not serve glyphs to rendered text (a Next/Framer hydration or CSP quirk),
  // so `check('400 16px Inter')` returns true while text set in Inter measures at the
  // generic-fallback width. The ground truth is a GLYPH METRIC: measure a fixed probe
  // string via canvas in (a) the element's exact declared family stack, (b) the SAME
  // stack with the leading NAMED families stripped (the generic-only baseline), and
  // (c) the first named family ALONE. If (a) ≈ (b) the named face is NOT actually
  // rendering (it fell straight to the generic); if (a) clearly differs from (b) it IS.
  // We compare that boolean + the metric ratio across sides, so "declared Inter but
  // rendered fallback on target, real Inter on ref" is caught even though both declare
  // Inter and both `fonts.check` true. Memoised by family|weight|style|size.
  const _mctx = (() => { try { return document.createElement('canvas').getContext('2d'); } catch (e) { return null; } })();
  const FONT_PROBE = 'Diolog workspace 20 — investor-facing AaBbGg';
  const GENERIC = /^(serif|sans-serif|monospace|system-ui|cursive|fantasy|ui-sans-serif|ui-serif|ui-monospace|-apple-system|"?BlinkMacSystemFont"?)$/i;
  const firstFamily = (fam) => String(fam || '').split(',')[0].replace(/["']/g, '').trim();
  const stripNamed = (fam) => {
    // keep only the trailing generic(s) of the stack, so this is the "what the browser
    // falls back to" baseline. If the stack has no generic, default to sans-serif.
    const parts = String(fam || '').split(',').map(s => s.replace(/["']/g, '').trim());
    const generics = parts.filter(p => GENERIC.test(p));
    return (generics.length ? generics : ['sans-serif']).join(', ');
  };
  const _fontCache = new Map();
  const fontRender = (cs) => {
    if (!_mctx) return null;
    const fam = cs.fontFamily, w = cs.fontWeight || '400', st = cs.fontStyle || 'normal', sz = cs.fontSize || '16px';
    const first = firstFamily(fam);
    if (!first || GENERIC.test(first)) return null; // already a generic — nothing to verify
    const key = first + '|' + w + '|' + st + '|' + sz;
    if (_fontCache.has(key)) return _fontCache.get(key);
    const base = stripNamed(fam);
    const meas = (stack) => { _mctx.font = `${st} ${w} ${sz} ${stack}`; return +_mctx.measureText(FONT_PROBE).width.toFixed(1); };
    const wDeclared = meas(fam);            // the element's real stack
    const wFallback = meas(base);           // generic-only baseline
    const wNamed = meas(`"${first}"`);      // the first named family alone
    // The named face is genuinely rendering when the declared stack does NOT collapse to
    // the generic baseline (allow ~0.5px sub-pixel jitter). `available` is the additional
    // fonts.check signal (kept for diagnosis); the metric is the authoritative one.
    let available = false;
    try { available = document.fonts.check(`${st} ${w} ${sz} "${first}"`); } catch (e) {}
    const rendering = Math.abs(wDeclared - wFallback) > 0.5;
    const v = { family: first, available, rendering, wDeclared, wFallback, wNamed };
    _fontCache.set(key, v);
    return v;
  };

  const out = [];
  const walk = (el, depth, parent) => {
    if (el.matches && el.matches(CHROME)) return;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    let directText = '';
    for (const n of el.childNodes) if (n.nodeType === 3) directText += n.textContent;
    directText = directText.replace(/\s+/g, ' ').trim();
    const comp = {};
    for (const p of PROPS) comp[p] = cs[p];
    // PSEUDO-ELEMENT BORDER/SHADOW — Framer & most page-builders draw a card's border or
    // elevation on a ::after/::before OVERLAY (`content:""; border:1px solid var(--border-color)`
    // or a box-shadow), which `getComputedStyle(element)` CANNOT see — so the element reads
    // `border:0 / box-shadow:none` while the rendered card clearly has an edge. Fold a RENDERING
    // pseudo's border/shadow into the element's effective values when the element itself has none,
    // so the differ's existing border/radius/shadow checks catch the real edge. (This was a
    // whole class of false "flat" reads on diolog.app's module cards.)
    for (const ps of ['::after', '::before']) {
      const pc = getComputedStyle(el, ps);
      if (!pc || pc.content === 'none' || pc.content === 'normal') continue; // pseudo not rendered
      if ((parseFloat(comp.borderTopWidth) || 0) === 0 && (parseFloat(pc.borderTopWidth) || 0) > 0) {
        comp.borderTopWidth = pc.borderTopWidth; comp.borderTopColor = pc.borderTopColor;
        comp.borderBottomWidth = comp.borderBottomWidth && parseFloat(comp.borderBottomWidth) ? comp.borderBottomWidth : pc.borderBottomWidth;
        comp._borderFromPseudo = ps;
      }
      if ((!comp.boxShadow || comp.boxShadow === 'none') && pc.boxShadow && pc.boxShadow !== 'none') {
        comp.boxShadow = pc.boxShadow; comp._shadowFromPseudo = ps;
      }
    }
    // ICON GLYPH extent — for an <svg> the element box is often padded around the drawn
    // glyph (a 12px box can hold a 6×3 OR an 8×4 chevron), so the box size alone misses a
    // wrong-sized icon. Capture the union path bbox in RENDERED px (viewBox units scaled to
    // the element's pixel size) — that's the visible glyph, what the eye compares.
    let glyph = null;
    if (el.tagName.toLowerCase() === 'svg') {
      try {
        const vb = el.viewBox && el.viewBox.baseVal;
        const sx = vb && vb.width ? r.width / vb.width : 1;
        const sy = vb && vb.height ? r.height / vb.height : 1;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const g of el.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse')) {
          const b = g.getBBox && g.getBBox();
          if (!b) continue;
          minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
          maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
        }
        if (isFinite(minX)) glyph = { w: +((maxX - minX) * sx).toFixed(1), h: +((maxY - minY) * sy).toFixed(1) };
      } catch (e) { /* getBBox can throw on a detached/hidden svg — skip */ }
    }
    // HARD LINE BREAK + LINE COUNT — a heading with an explicit `<br>` ("One workspace.<br>Four
    // specialist modules.") reads as identical TEXT (textContent collapses the <br> to a space),
    // so the differ pairs it as matching while the rendered wrap differs. Capture a hard-break
    // flag + the rendered line count (Range client-rect count) so the differ can compare WHERE
    // text breaks, not just the string.
    let hardBreak = false;
    for (const c of el.children) if (c.tagName === 'BR') { hardBreak = true; break; }
    let lines = null;
    if (directText) { try { const rng = document.createRange(); rng.selectNodeContents(el); lines = rng.getClientRects().length; } catch (e) {} }
    // WRAP-POINT (improvement C) — the line COUNT can match while the BREAK POSITION
    // differs (a tagline that wraps after a different word). Reconstruct the rendered
    // line boxes by walking the leading text node char-by-char and grouping by `top`,
    // then capture the FIRST line's text + an x for where line 1 ends. Diffing the
    // first-line text catches "wraps after the hyphen in investor-facing" on live vs a
    // different word on target even at equal line count. Cheap: only for nodes whose
    // direct text actually wraps (lines > 1) and is a real sentence (has a space).
    let wrap = null;
    if (directText && lines && lines > 1 && /\s/.test(directText)) {
      try {
        const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.replace(/\s+/g, ' ').trim());
        if (tn) {
          const s = tn.textContent; const rng2 = document.createRange();
          let curTop = null, cur = '', lineArr = [], firstEndX = null;
          for (let i = 0; i < s.length; i++) {
            rng2.setStart(tn, i); rng2.setEnd(tn, i + 1);
            const rects = rng2.getClientRects(); if (!rects.length) { cur += s[i]; continue; }
            const top = Math.round(rects[0].top);
            if (curTop === null) curTop = top;
            if (Math.abs(top - curTop) > 3) {
              if (lineArr.length === 0) firstEndX = +(rects[0].left - f.left).toFixed(1);
              lineArr.push(cur.replace(/\s+/g, ' ').trim()); cur = ''; curTop = top;
            }
            cur += s[i];
          }
          if (cur.trim()) lineArr.push(cur.replace(/\s+/g, ' ').trim());
          if (lineArr.length > 1) wrap = { first: lineArr[0], n: lineArr.length, endX: firstEndX };
        }
      } catch (e) { /* detached/hidden — skip */ }
    }
    // RENDERED-FONT fingerprint (improvement D) — see fontRender() above. Only for nodes
    // with their own visible text (the rendered face is what the eye reads).
    const fontRn = directText ? fontRender(cs) : null;
    // FULL-BLEED BACKGROUND LAYER — a "background" can be an <img>/<canvas>/<svg> child sized to
    // the element (a Framer hero gradient is an <img>, INVISIBLE to a `background-image` check).
    // Capture a near-full-size media child so the differ can compare it as a background.
    let bgLayer = null;
    if (r.width > 200) for (const c of el.children) {
      const t = c.tagName.toLowerCase();
      if (t === 'img' || t === 'canvas' || t === 'svg' || t === 'video') {
        const cr = c.getBoundingClientRect();
        if (cr.width >= 0.9 * r.width && cr.height >= 0.7 * r.height) {
          bgLayer = { tag: t, src: (c.getAttribute('src') || c.getAttribute('href') || c.currentSrc || '').slice(0, 100) };
          break;
        }
      }
    }
    // CONTAINER FULL-BLEED MEDIA (improvement A) — a section's gradient/texture layer is
    // frequently an ABSOLUTELY-POSITIONED descendant (not a direct child) sized to cover the
    // section — a sibling of the content column, so it is NEVER an ancestor of any text node
    // and the text-probe box-walk can't reach it. Scan ALL descendants for a media element
    // (img/canvas/svg/video) or a positioned div carrying a background-image that covers ≥0.9×
    // this node's width and ≥0.6× its height. This surfaces the CTA-band gradient (a full-bleed
    // <img> SVG on live, flat-colour on target) to the container pass.
    let fullBleedMedia = null;
    if (r.width >= 400 && r.height >= 120) {
      for (const d of el.querySelectorAll('img, canvas, svg, video')) {
        const dr = d.getBoundingClientRect();
        if (dr.width >= 0.9 * r.width && dr.height >= 0.6 * r.height) {
          fullBleedMedia = { tag: d.tagName.toLowerCase(), src: (d.getAttribute('src') || d.getAttribute('href') || d.currentSrc || '').slice(0, 100) };
          break;
        }
      }
      if (!fullBleedMedia) {
        for (const d of el.querySelectorAll('div, span')) {
          const dcs = getComputedStyle(d);
          if (!dcs.backgroundImage || dcs.backgroundImage === 'none') continue;
          if (!/absolute|fixed/.test(dcs.position)) continue;
          const dr = d.getBoundingClientRect();
          if (dr.width >= 0.9 * r.width && dr.height >= 0.6 * r.height) {
            fullBleedMedia = { tag: 'css-bg', src: dcs.backgroundImage.slice(0, 100) };
            break;
          }
        }
      }
    }
    // THIN-LINE DIVIDER (improvement A) — a ≥page-wide 1–2px hairline (an <hr>, a thin
    // backgrounded box, OR a border-top/bottom on a wide element) is a non-text container
    // the text-probe differ never reaches. Flag the node when it reads as such a line, so a
    // divider present on live but absent on target (and vice-versa) is matched & compared.
    // Read from the FOLDED `comp` (not raw `cs`) so a hairline drawn on a ::after/::before
    // overlay — the common page-builder pattern, already folded into comp.borderTopWidth
    // above — counts as a real divider (the footer rule on diolog.app lives on ::after).
    let divider = null;
    {
      const bt = parseFloat(comp.borderTopWidth) || 0, bb = parseFloat(comp.borderBottomWidth) || 0;
      const wide = r.width >= 0.4 * f.width;
      const bgSolid = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
      if (wide && !directText && r.height > 0 && r.height <= 3 && (bgSolid || el.tagName === 'HR')) {
        divider = { kind: 'line', thickness: +r.height.toFixed(1), color: cs.backgroundColor };
      } else if (wide && (bt >= 1 || bb >= 1)) {
        const side = bt >= 1 ? 'top' : 'bottom';
        divider = { kind: 'border-' + side, thickness: side === 'top' ? bt : bb, color: side === 'top' ? comp.borderTopColor : comp.borderBottomColor };
      }
    }
    // SVG CHILD presence (improvement B) — a button/link with a trailing ARROW carries an
    // <svg> child the text-probe loop never sees. Capture a flag so a button that gains/loses
    // its arrow (vs the reference) is caught once the button is paired by position.
    let hasSvgChild = false;
    for (const c of el.children) { const t = c.tagName.toLowerCase(); if (t === 'svg' || (t === 'img' && (c.getAttribute('src') || '').includes('.svg'))) { hasSvgChild = true; break; } }
    const myIndex = out.length;
    // Stable ANCHOR id (improvement #2): match elements by an explicit, layout-stable
    // identity instead of by text — kills the text-collision mispairs (nav "diolog"
    // paired with a 112px footer wordmark, a card heading paired with a nav link).
    // Put `data-fid="<same id on both sides>"` on the matching ref + target nodes.
    const fid =
      el.getAttribute('data-fid') ||
      el.getAttribute('data-fidelity-id') ||
      el.getAttribute('data-testid') ||
      null;
    out.push({
      i: myIndex,
      parent,
      depth,
      tag: el.tagName.toLowerCase(),
      cls: el.getAttribute('class') || '',
      fid,
      text: directText,
      // `.ph` = the mock's resting placeholder span; carry its colour explicitly.
      isPh: el.classList.contains('ph') || el.classList.contains('placeholder'),
      rect: {
        x: +(r.left - f.left).toFixed(1),
        y: +(r.top - f.top).toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
      },
      glyph,
      hardBreak,
      lines,
      wrap,            // improvement C — first-line text + break-x
      bgLayer,
      fullBleedMedia,  // improvement A — container's full-bleed gradient/media layer
      divider,         // improvement A — thin page-wide hairline / wide border
      hasSvgChild,     // improvement B — trailing-arrow svg child on a button
      fontRn,          // improvement D — rendered-font fingerprint
      comp,
    });
    for (const c of el.children) walk(c, depth + 1, myIndex);
  };
  walk(root, 0, -1);
  // LOADED FONT FACES — a font declared with a WEIGHT RANGE from a single file (e.g. a static
  // Inter-500 woff2 declared `font-weight: 100 900`) makes the browser FAUX-WEIGHT-SYNTHESIZE
  // every other weight → blurry text on HiDPI. Capture the loaded faces (deduped) so the differ
  // can flag a range-from-one-source vs the reference's discrete static instances.
  const fonts = (() => {
    try {
      const seen = new Set(), out2 = [];
      for (const ff of document.fonts) {
        if (ff.status !== 'loaded') continue;
        const k = ff.family + '|' + ff.weight + '|' + ff.style;
        if (seen.has(k)) continue; seen.add(k);
        out2.push({ family: ff.family.replace(/["']/g, ''), weight: ff.weight, style: ff.style });
      }
      return out2;
    } catch (e) { return []; }
  })();
  return JSON.stringify({ title: TITLE || SEL || 'body', frame: { w: f.width, h: f.height }, fonts, nodes: out });
}
