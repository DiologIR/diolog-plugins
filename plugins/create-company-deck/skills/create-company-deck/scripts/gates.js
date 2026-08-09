// Deck gates — run in the page, against the rendered deck.
//
// Every check here exists because a plausible-looking verification passed while
// the defect was live. The two that reached production:
//
//   · an element screenshot of `.stage` renders the element's OWN box, so a
//     stage pushed 120px past the right edge of the window screenshots as a
//     flawless slide on every viewport. Placement needs measuring, not looking.
//   · `width / height === 1.778` stayed true throughout, because the box was
//     the right SIZE in the wrong PLACE. A ratio assertion is not a placement
//     assertion.
//
// Every result carries its denominator. `failures: 0` is not a result;
// `examined: 41, failures: 0` is, and `examined: 0` is a gate that never ran.
//
// Usage:  playwright-cli eval "$(cat gates.js)"
() => {
  const deck = document.getElementById('deck');
  const slides = [...document.querySelectorAll('.slide')];
  if (!deck || !slides.length) return { error: 'no #deck / .slide found — wrong page?' };

  const deckBox = deck.getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
  const wasActive = slides.findIndex((s) => s.hasAttribute('data-active'));
  const TEXT_SEL = 'h1,h2,h3,p,li,td,th,figcaption,span.val,span.lab';

  const report = {
    viewport: { w: innerWidth, h: innerHeight },
    scale: +scale.toFixed(4),
    denominators: { slides: slides.length, textNodes: 0, imageSlides: 0, paintProbes: 0 },
    placement: [],       // stage clipped by the window
    overflow: [],        // content past the stage bounds
    collision: [],       // content running into the pinned footer
    paintOrder: [],      // copy invisible under a full-bleed image
    contrastCSS: [],     // resolvable from CSS
    contrastDeferred: [], // text over an absolute sibling — CSS cannot resolve it
    tokens: { fontSizes: {}, colors: {} },
  };

  // --- helpers -------------------------------------------------------------
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const rgb = (s) => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  const ratio = (fg, bg) => {
    const a = lum(fg[0], fg[1], fg[2]), b = lum(bg[0], bg[1], bg[2]);
    return +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05))).toFixed(2);
  };
  // Walk ancestors for a painted background. This is exactly the method that
  // reported 1.08:1 where the rendered pixels were 17:1, because the visible
  // backdrop was an absolutely-positioned sibling scrim, not an ancestor. So
  // any node with such a sibling is deferred to pixel measurement instead.
  const backdrop = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = rgb(getComputedStyle(n).backgroundColor);
      if (bg && (bg[3] === undefined || bg[3] > 0.5)) return bg;
      n = n.parentElement;
    }
    return [255, 255, 255];
  };
  const overAbsoluteSibling = (el, stage) => {
    const r = el.getBoundingClientRect();
    return [...stage.querySelectorAll('.photo,.scrim')].some((s) => {
      const q = s.getBoundingClientRect();
      return r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top;
    });
  };

  // --- per slide -----------------------------------------------------------
  slides.forEach((slide, idx) => {
    slides.forEach((s, k) => s.toggleAttribute('data-active', k === idx));
    const label = slide.dataset.screenLabel || slide.id || `slide ${idx + 1}`;
    const stage = slide.querySelector('.stage');
    if (!stage) { report.placement.push({ slide: label, error: 'no .stage' }); return; }

    // 1. Placement — is the stage entirely inside the band reserved for it?
    //    Measured against #deck, not the viewport, because #deck is what the
    //    scale is computed from and what the control bar leaves free.
    const r = stage.getBoundingClientRect();
    const clip = {
      L: Math.round(Math.max(0, deckBox.left - r.left)),
      R: Math.round(Math.max(0, r.right - deckBox.right)),
      T: Math.round(Math.max(0, deckBox.top - r.top)),
      B: Math.round(Math.max(0, r.bottom - deckBox.bottom)),
    };
    if (clip.L || clip.R || clip.T || clip.B) report.placement.push({ slide: label, clip });

    // 2. Overflow — content outside the stage's own bounds, in stage px.
    [...stage.querySelectorAll('*')].forEach((el) => {
      const q = el.getBoundingClientRect();
      if (!q.width && !q.height) return;
      const out = {
        l: Math.round((r.left - q.left) / scale), rt: Math.round((q.right - r.right) / scale),
        t: Math.round((r.top - q.top) / scale), b: Math.round((q.bottom - r.bottom) / scale),
      };
      const worst = Math.max(out.l, out.rt, out.t, out.b);
      if (worst > 1) {
        report.overflow.push({ slide: label, el: el.className || el.tagName, px: worst });
      }
    });

    // 3. Collision — "nothing past the stage bounds" is silent about content
    //    running INTO the footer, which sits inside those bounds. One slide of
    //    the reference deck passed every overflow check while its closing
    //    paragraph printed through the footer rule by 66px.
    const foot = stage.querySelector('.foot');
    if (foot) {
      const footTop = foot.getBoundingClientRect().top;
      [...stage.querySelectorAll('p,li,td,figure,table,h1,h2,h3,ul')].forEach((el) => {
        if (foot.contains(el)) return;
        const over = Math.round((el.getBoundingClientRect().bottom - footTop) / scale);
        if (over > 0) report.collision.push({ slide: label, el: el.className || el.tagName, px: over });
      });
    }

    // 4. Paint order — an inset:0 photograph and its scrim paint ABOVE every
    //    static in-flow sibling whatever the source order, so a copy wrapper
    //    missing `position:relative` loses the entire text of the slide while
    //    its layout stays perfect: real boxes, real sizes, correct fonts. Every
    //    overflow, collision, contrast and inventory check passes.
    if (stage.querySelector('.photo')) {
      report.denominators.imageSlides++;
      [...stage.querySelectorAll('h1,h2,.title,.display,.eyebrow,.body,.lead')].forEach((el) => {
        const q = el.getBoundingClientRect();
        if (q.width < 4 || q.height < 4) return;
        report.denominators.paintProbes++;
        const hit = document.elementFromPoint(q.left + 10, q.top + 10);
        if (!hit || (!el.contains(hit) && !hit.contains(el))) {
          report.paintOrder.push({
            slide: label, el: el.className || el.tagName,
            hitBy: hit ? (hit.className || hit.tagName) : 'nothing',
          });
        }
      });
    }

    // 5. Token census — a second value 2px off the token reads as almost-right
    //    and is therefore wrong. Near-misses are the clearest signal of a deck
    //    assembled slide-by-slide rather than designed, so count them.
    [...stage.querySelectorAll(TEXT_SEL)].forEach((el) => {
      if (!el.textContent.trim()) return;
      report.denominators.textNodes++;
      const cs = getComputedStyle(el);
      report.tokens.fontSizes[cs.fontSize] = (report.tokens.fontSizes[cs.fontSize] || 0) + 1;
      report.tokens.colors[cs.color] = (report.tokens.colors[cs.color] || 0) + 1;

      const fg = rgb(cs.color);
      if (!fg) return;
      const size = parseFloat(cs.fontSize) * scale;
      const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
      const floor = large ? 3 : 4.5;
      if (overAbsoluteSibling(el, stage)) {
        report.contrastDeferred.push({ slide: label, el: el.className || el.tagName });
        return;
      }
      const cr = ratio(fg, backdrop(el));
      if (cr < floor) {
        report.contrastCSS.push({ slide: label, el: el.className || el.tagName, ratio: cr, floor });
      }
    });
  });

  slides.forEach((s, k) => s.toggleAttribute('data-active', k === (wasActive < 0 ? 0 : wasActive)));

  // Collapse the census into the thing worth reading: how many distinct values,
  // and which are rare (a value used once or twice is almost always a stray).
  const census = (m) => {
    const e = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return { distinct: e.length, values: e.map(([v, n]) => `${v} x${n}`) };
  };
  report.tokens.fontSizes = census(report.tokens.fontSizes);
  report.tokens.colors = census(report.tokens.colors);

  report.summary = {
    slides: report.denominators.slides,
    placementFailures: report.placement.length,
    overflowFailures: report.overflow.length,
    collisionFailures: report.collision.length,
    paintOrderFailures: `${report.paintOrder.length} of ${report.denominators.paintProbes} probes on ${report.denominators.imageSlides} image slides`,
    contrastCSS: `${report.contrastCSS.length} failures of ${report.denominators.textNodes} text nodes examined`,
    contrastDeferred: `${report.contrastDeferred.length} nodes sit over a photo or scrim — CSS cannot resolve their backdrop; measure those from pixels`,
    distinctFontSizes: report.tokens.fontSizes.distinct,
    distinctTextColors: report.tokens.colors.distinct,
  };
  return report;
}
