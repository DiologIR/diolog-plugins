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
  // Chrome the target renders natively — not screen content. Override via
  // window.MF_CHROME_SELECTOR for a different mock's chrome class names.
  const CHROME = window.MF_CHROME_SELECTOR || '.sb, .island, .tabbar, .homebar, .nav, .statusbar, .notch';

  let root;
  if (SEL) {
    root = document.querySelector(SEL);
  } else if (TITLE) {
    const fig = [...document.querySelectorAll('figure')].find(
      f => (f.querySelector('figcaption')?.textContent || '').replace(/\s+/g, ' ').includes(TITLE),
    );
    // Prefer the SCREEN content node over the device bezel. querySelector on a
    // comma-list returns first-in-DOM (the outer .phone), so probe in priority
    // order instead and take the first that matches.
    root = null;
    if (fig) {
      for (const s of ['.scr', '.screen', '.frame', '.phone']) {
        const hit = fig.querySelector(s);
        if (hit) { root = hit; break; }
      }
      root = root || fig;
    }
  } else {
    root = document.body;
  }
  if (!root) return JSON.stringify({ error: 'frame-not-found', selector: SEL, title: TITLE });
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
