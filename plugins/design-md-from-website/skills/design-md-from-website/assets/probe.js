/* DIO design-md-from-website — MEASURED design tokens for one page.
 * Run via: playwright-cli -s=probe-<slug> --raw eval "$(cat assets/probe.js)"
 * Returns a JSON string of getComputedStyle values by role — the AUTHORITATIVE
 * source for the DESIGN.md's colours / fonts / radii / spacing (never guess these
 * from the screenshot). Self-contained IIFE; safe to paste inline if your shell
 * mangles the file substitution. */
(() => {
  const read = (el, props) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) { const v = cs.getPropertyValue(p); if (v) o[p] = v.trim(); }
    return Object.keys(o).length ? o : null;
  };
  const pick = (sel, props) => read(document.querySelector(sel), props);
  // For action/surface roles, the FIRST DOM match is often a utility/chrome element
  // (e.g. a WP-toolbar button) — the representative one (primary CTA, a real card) is
  // the most visually prominent, so pick the LARGEST visible match instead.
  const area = (el) => { const r = el.getBoundingClientRect(); return r.width * r.height; };
  const pickBiggest = (sel, props) => {
    const els = [...document.querySelectorAll(sel)].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!els.length) return null;
    els.sort((a, b) => area(b) - area(a));
    return read(els[0], props);
  };
  const TYPE = ['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'];
  const tokens = {
    body: pick('body', ['color', 'background-color', 'font-family', 'font-size', 'line-height']),
    h1: pick('h1', TYPE),
    h2: pick('h2', TYPE),
    h3: pick('h3', TYPE),
    p: pick('p', ['color', 'font-family', 'font-size', 'line-height']),
    a: pick('a', ['color', 'text-decoration-line']),
    // The primary CTA = the biggest visible button-like element (not the first, which
    // is usually a utility/toolbar button). This is where the true brand accent lives.
    button: pickBiggest('a[class*="button" i], [class*="button" i], a[class*="btn" i], [class*="btn" i], [class*="cta" i], [role="button"], button, input[type="submit"]',
      ['color', 'background-color', 'border-radius', 'padding', 'font-family', 'font-size', 'font-weight', 'border']),
    nav: pick('nav, header nav', ['background-color', 'color', 'font-family', 'font-size']),
    header: pick('header', ['background-color', 'color', 'box-shadow']),
    footer: pick('footer', ['background-color', 'color']),
    card: pickBiggest('[class*="card" i]', ['background-color', 'border-radius', 'box-shadow', 'border', 'padding']),
    input: pick('input, textarea, select', ['background-color', 'color', 'border', 'border-radius', 'padding', 'font-size']),
  };
  // Colour census — the most robust accent signal. Component *selectors* are
  // unreliable on page-builder sites (Elementor/Webflow/Wix), but the brand accent is
  // the most-repeated SATURATED colour across the rendered page, weighted by area.
  // This is measured, not guessed — it catches the true brand hue even when no clean
  // `.btn`/`.card` selector exists.
  const toRgb = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, al = 1] = m[1].split(',').map(Number);
    return { r, g, b, a: al };
  };
  const isSaturated = (c) => {
    if (!c || c.a < 0.5) return false;
    const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b);
    if (mx > 245 && mn > 235) return false;   // near-white
    if (mx < 24) return false;                // near-black
    return (mx - mn) > 28;                     // has real chroma (not a grey)
  };
  const census = new Map();
  for (const el of [...document.querySelectorAll('body *')].slice(0, 4000)) {
    const r = el.getBoundingClientRect();
    const a = r.width * r.height;
    if (a < 120) continue;
    const cs = getComputedStyle(el);
    for (const prop of ['background-color', 'color', 'border-top-color']) {
      const c = toRgb(cs.getPropertyValue(prop));
      if (isSaturated(c)) {
        const key = `rgb(${c.r}, ${c.g}, ${c.b})`;
        census.set(key, (census.get(key) || 0) + Math.min(a, 200000));
      }
    }
  }
  const accents = [...census.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  const abs = (u) => { try { return new URL(u, document.baseURI).href; } catch { return u; } };
  const fonts = [...document.querySelectorAll('link[href*="font" i], link[href*="fonts.googleapis" i], link[href*="typekit" i]')]
    .map((l) => abs(l.getAttribute('href') || '')).filter(Boolean);
  const logoEl = document.querySelector('img[class*="logo" i], header img, [class*="logo" i] img, a[href="/"] img');
  const logo = logoEl ? { src: abs(logoEl.currentSrc || logoEl.getAttribute('src') || ''), alt: (logoEl.getAttribute('alt') || '').trim() } : null;
  const container = (() => {
    const el = document.querySelector('main, [class*="container" i], [class*="wrapper" i]') || document.body;
    const cs = getComputedStyle(el);
    return { maxWidth: cs.maxWidth, paddingInline: cs.paddingLeft };
  })();
  return JSON.stringify({ url: location.href, title: document.title, accents, tokens, fonts, logo, container }, null, 2);
})()
