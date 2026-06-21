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
    const myIndex = out.length;
    out.push({
      i: myIndex,
      parent,
      depth,
      tag: el.tagName.toLowerCase(),
      cls: el.getAttribute('class') || '',
      text: directText,
      // `.ph` = the mock's resting placeholder span; carry its colour explicitly.
      isPh: el.classList.contains('ph') || el.classList.contains('placeholder'),
      rect: {
        x: +(r.left - f.left).toFixed(1),
        y: +(r.top - f.top).toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
      },
      comp,
    });
    for (const c of el.children) walk(c, depth + 1, myIndex);
  };
  walk(root, 0, -1);
  return JSON.stringify({ title: TITLE || SEL || 'body', frame: { w: f.width, h: f.height }, nodes: out });
}
