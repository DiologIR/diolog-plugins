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
      bgLayer,
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
