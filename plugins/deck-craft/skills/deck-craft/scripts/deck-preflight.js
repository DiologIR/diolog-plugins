/*
 * deck-preflight — the computable half of the deck gate.
 *
 * An in-page IIFE returning a JSON string. It runs the checks that do not need
 * an eye, so the looking you do afterwards is spent on judgment rather than on
 * finding a collision a rectangle comparison finds in 30ms.
 *
 * Drive it with `scripts/run-preflight.sh <url>`, or paste it into any
 * evaluate-JS channel:
 *
 *   obscura --allow-private-network fetch "$URL" --wait 3 \
 *     --eval "$(cat deck-preflight.js)"
 *
 * The whole file is ONE expression on purpose. Several evaluate-JS channels
 * (Obscura's `--eval` among them) return the value of the *first* statement,
 * so a payload of `window.cfg = {...}; (() => {…})()` silently evaluates to
 * null — a gate that looks like it ran and reported nothing. Configure it by
 * passing an object instead: the runner emits
 *   (function(){ var __DECKCFG = {…}; return <this file>; })()
 * and a bare paste falls back to window.__deckPreflight, then to defaults.
 *   { slideSelector, canvasW, canvasH, accent, regulated, bodyFloor }
 *
 * What it CANNOT tell you, and why the looking still happens afterwards:
 * every rule here was written after someone met the defect it catches, so it
 * is structurally blind to the one nobody has met yet. A clean run means no
 * known computable defect is present. It never means the deck is good.
 */
((__CFG_IN) => {
 try {
  const CFG = Object.assign({
    slideSelector: null,     // auto-detected when null
    canvasW: 1920,
    canvasH: 1080,
    accent: null,            // e.g. '#D72229'; auto-detected when null
    regulated: false,        // true for investor / financial / health / compliance decks
    bodyFloor: 24,           // px on a 1920-wide canvas
    tinyFloor: 18,           // px on a 1920-wide canvas; below this is unreadable at distance
    deadBandPx: 120,         // empty band at a slide's foot worth reporting
    displayFloorPx: 96,      // a deck with no type this large has no display tier
    overlapMinPx2: 12,       // ignore sub-pixel kisses
  }, __CFG_IN || {});

  const out = {
    config: {}, slides: 0, stage: [], type: {}, overflow: [], collisions: [],
    textOverlap: [], paintOrder: [], charts: [], accent: [], deadSpace: [],
    textOverImage: [], provenance: null, notes: [],
    inkExtent: [], chromeReserve: [], hues: null, displayTier: null,
    externalRefs: [], leakedArithmetic: [],
    titleWrap: [], stageContentOverflow: [], stageBottomClearance: [],
    verticalSquish: [], cardOverflow: [],
  };

  // ── Locate the slides ────────────────────────────────────────────────────
  const CANDIDATES = ['.slide', '.slide-wrap', '.slide-stage', '.stage',
                      'section[data-screen-label]', '[data-slide]', '.deck-slide'];
  let sel = CFG.slideSelector;
  if (!sel) {
    let best = 0;
    for (const c of CANDIDATES) {
      const n = document.querySelectorAll(c).length;
      if (n > best) { best = n; sel = c; }
    }
  }
  const slides = [...document.querySelectorAll(sel || '.slide')];
  out.config = { slideSelector: sel, canvas: `${CFG.canvasW}x${CFG.canvasH}`,
                 regulated: CFG.regulated, bodyFloor: CFG.bodyFloor };
  out.slides = slides.length;
  if (!slides.length) {
    out.notes.push('No slides matched. Pass slideSelector via window.__deckPreflight — ' +
                   'a zero denominator is a gate that never ran, not a clean deck.');
    return JSON.stringify(out, null, 1);
  }

  const idOf = (el, i) => el.id || el.dataset.screenLabel || `#${i + 1}`;
  const vis = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05;
  };
  const rect = (el) => el.getBoundingClientRect();
  // A text leaf: carries text of its own rather than inheriting it from a
  // child. Wrappers must not count, or a full-height container reads as ink
  // reaching the slide's foot and the dead-space check reports nothing.
  const isLeafText = (el) => {
    const t = (el.textContent || '').trim();
    return !!t && ![...el.children].some((c) => (c.textContent || '').trim());
  };
  // Shared by the accent budget and the text-over-image list. Defined here
  // rather than inside one check, because a helper scoped to one step is a
  // ReferenceError in the next and the run reports that step as NOT RUN.
  const norm = (c) => {
    const m = String(c).match(/\d+/g);
    return m && m.length >= 3 ? `${+m[0]},${+m[1]},${+m[2]}` : null;
  };

  // The authored canvas may reach the viewport two different ways, and they
  // need opposite arithmetic. `getComputedStyle` reports font sizes BEFORE any
  // transform, so:
  //   • a stage scaled with transform:scale() already reports authored px —
  //     factor 1. Dividing by the scale here inflates a correct 104px display
  //     to 125px and invents a type scale the deck does not have.
  //   • a slide with no transform is a fluid box, and its type is only as
  //     large as it looks: normalise by how far its rendered height falls
  //     short of the authored canvas.
  const scaleFromTransform = (t) => {
    if (!t || t === 'none') return null;
    const n = t.match(/matrix3d\(([^)]+)\)/);
    if (n) { const v = n[1].split(',').map(Number); return v[0]; }
    const m = t.match(/matrix\(([^)]+)\)/);
    if (m) { const v = m[1].split(',').map(Number); return v[0]; }
    const s = t.match(/scale\(?\s*([\d.]+)/);
    return s ? parseFloat(s[1]) : null;
  };
  const transformScaleOf = (slide) => {
    const inner = slide.querySelector('.stage, [style*="scale"]') || slide;
    const s = scaleFromTransform(getComputedStyle(inner).transform);
    return (s && s > 0.01 && s < 3) ? s : null;
  };
  // px measured on screen → px on the authored canvas
  const toCanvasPx = (slide) => {
    const ts = transformScaleOf(slide);
    if (ts) return 1;                                  // already authored units
    const h = rect(slide).height;
    return h ? CFG.canvasH / h : 1;
  };
  // screen distances (gaps, overlaps, dead bands) → authored units
  const distFactor = (slide) => {
    const ts = transformScaleOf(slide);
    if (ts) return 1 / ts;
    const h = rect(slide).height;
    return h ? CFG.canvasH / h : 1;
  };
  const scaleOf = (slide) => 1 / distFactor(slide);

  // Each check runs inside this so a single engine gap degrades one section
  // rather than returning null for the whole gate. A gate that fails silently
  // is worse than no gate: its output is indistinguishable from a clean deck.
  const step = (name, fn) => {
    try { fn(); } catch (e) { out.notes.push(`check "${name}" failed: ${e && e.message} — treat as NOT RUN, not as clean`); }
  };

  // ── 1. Stage geometry ────────────────────────────────────────────────────
  step('Stage geometry', () => {
    // A deck is fixed-size content. A slide whose box is not the authored aspect
    // ratio is a web section wearing a slide's name: it reflowed instead of
    // letterboxing, so the presenter cannot predict what the audience sees.
    const wantAR = CFG.canvasW / CFG.canvasH;
    slides.forEach((s, i) => {
      const r = rect(s);
      if (!r.width || !r.height) return;
      const ar = r.width / r.height;
      const row = { slide: idOf(s, i), w: Math.round(r.width), h: Math.round(r.height),
                    aspect: +ar.toFixed(3), wantAspect: +wantAR.toFixed(3) };
      row.aspectOff = Math.abs(ar - wantAR) > 0.02;
      row.clipL = Math.max(0, Math.round(-r.left));
      row.clipR = Math.max(0, Math.round(r.right - innerWidth));
      if (row.aspectOff || row.clipL || row.clipR) out.stage.push(row);
    });

  });

  // ── 2. Type floor ────────────────────────────────────────────────────────
  step('Type floor', () => {
    // Web density (13–16px) is the reflex to resist: it is unreadable from row
    // four. Sizes are normalised to the authored canvas before comparison.
    // Two-tier floor: primary body/titles floor is bodyFloor (24px);
    // accessory text (eyebrows, fine footnotes, captions, stat notes, table data cells)
    // has a tinyFloor (18px) threshold.
    const sizes = {};
    const belowFloor = [];
    const isAccessory = (el, cls) => {
      const c = (cls || '').toLowerCase();
      const tag = el.tagName.toLowerCase();
      return (
        tag === 'th' || tag === 'td' || tag === 'figcaption' ||
        c.includes('eyebrow') || c.includes('fine') || c.includes('foot') ||
        c.includes('note') || c.includes('caption') || c.includes('chip') ||
        c.includes('lab') || c.includes('small') || c.includes('tip') ||
        c.includes('unit') || c.includes('xax') || el.hasAttribute('data-accessory') ||
        !!el.closest('.foot, footer, [class*="foot"], .fine, figcaption, [class*="note"], .xax, table')
      );
    };

    slides.forEach((s, i) => {
      const f = toCanvasPx(s);
      s.querySelectorAll('*').forEach((el) => {
        const t = (el.textContent || '').trim();
        if (!t || !vis(el)) return;
        if ([...el.children].some((c) => (c.textContent || '').trim())) return; // leaf text only
        const cs = getComputedStyle(el);
        const authored = Math.round(parseFloat(cs.fontSize) * f);
        sizes[authored] = (sizes[authored] || 0) + 1;
        const cls = String(el.className || '');
        const floor = isAccessory(el, cls) ? CFG.tinyFloor : CFG.bodyFloor;
        if (authored < floor) {
          belowFloor.push({ slide: idOf(s, i), px: authored,
                            cls: cls.slice(0, 40),
                            text: t.slice(0, 44) });
        }
      });
    });
    const scale = Object.keys(sizes).map(Number).sort((a, b) => a - b);
    out.type = {
      distinctSizes: scale.length,
      scale,
      medianPx: scale.length ? scale[Math.floor(scale.length / 2)] : null,
      largestPx: scale[scale.length - 1] || null,
      belowBodyFloor: belowFloor.length,
      belowTinyFloor: belowFloor.filter((b) => b.px < CFG.tinyFloor).length,
      samples: belowFloor.slice(0, 25),
    };

  });

  // ── 3. Overflow against the slide box ────────────────────────────────────
  step('Overflow against the slide box', () => {
    slides.forEach((s, i) => {
      if (s.scrollHeight > s.clientHeight + 2 || s.scrollWidth > s.clientWidth + 2) {
        out.overflow.push({ slide: idOf(s, i), kind: 'slide',
                            overflowY: s.scrollHeight - s.clientHeight,
                            overflowX: s.scrollWidth - s.clientWidth });
      }
      s.querySelectorAll('table, pre, .scroll, [class*="table"], [class*="grid"]').forEach((el) => {
        const p = el.parentElement; if (!p) return;
        if (el.scrollWidth > p.clientWidth + 2) {
          out.overflow.push({ slide: idOf(s, i), kind: el.tagName.toLowerCase(),
                              cls: String(el.className || '').slice(0, 40),
                              overflowX: el.scrollWidth - p.clientWidth });
        }
      });
    });

  });

  // ── 4. Collision with slide chrome ───────────────────────────────────────
  step('Collision with slide chrome', () => {
    // "Nothing past the stage bounds" is silent about content running INTO the
    // footer, the page number or a floating control dock — all inside the bounds.
    // Exclude global floating navigation rails/progress lines positioned outside slide bodies.
    const chromeSel = '.foot, .footer, [class*="foot"], [class*="dock"], [class*="controls"], ' +
                      '[class*="page-num"], [class*="slide-number"]';
    const docks = [...document.querySelectorAll(chromeSel)].filter((el) => {
      const cs = getComputedStyle(el);
      return vis(el) && (cs.position === 'fixed' || cs.position === 'absolute' || cs.position === 'sticky');
    });
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      docks.forEach((d) => {
        // A dock that lives inside ANOTHER slide is not this slide's chrome. On a
        // vertical scroll deck every slide coexists in the layout, so comparing
        // slide N's content against slide M's pinned footer manufactures
        // collisions that no viewer can ever see. Measured: 10 such phantoms on
        // a deck whose real collisions were 0.
        const owner = slides.find((x) => x.contains(d));
        if (owner && owner !== s) return;
        const dr = rect(d);
        if (!dr.height) return;
        s.querySelectorAll('p,li,td,th,h1,h2,h3,h4,figure,table').forEach((el) => {
          if (d.contains(el) || el.contains(d)) return;
          // Ignore full-bleed background images or scrims
          if (el.tagName === 'IMG' || el.classList.contains('photo') || el.classList.contains('scrim')) return;
          const r = rect(el);
          if (!r.width || !r.height || !vis(el)) return;
          const overlapY = Math.min(r.bottom, dr.bottom) - Math.max(r.top, dr.top);
          const overlapX = Math.min(r.right, dr.right) - Math.max(r.left, dr.left);
          if (overlapY > 4 && overlapX > 4) {
            out.collisions.push({ slide: idOf(s, i),
                                  chrome: String(d.className || d.tagName).slice(0, 30),
                                  text: (el.textContent || '').trim().slice(0, 40),
                                  byPx: Math.round(Math.min(overlapY, overlapX) / k) });
          }
        });
      });
    });

  });

  // ── 5. Text overlapping text ─────────────────────────────────────────────
  step('Text overlapping text', () => {
    // Two labels sharing pixels. The signature: a bar's "Complete" caption laid
    // over its "100%" value, or a three-line bullet running into the next one.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const leaves = [...s.querySelectorAll('*')].filter((el) => {
        const t = (el.textContent || '').trim();
        return t && vis(el) && ![...el.children].some((c) => (c.textContent || '').trim());
      }).slice(0, 400);
      for (let a = 0; a < leaves.length; a++) {
        for (let b = a + 1; b < leaves.length; b++) {
          const A = leaves[a], B = leaves[b];
          if (A.contains(B) || B.contains(A)) continue;
          const ra = rect(A), rb = rect(B);
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > 1 && oy > 1 && (ox * oy) / (k * k) > CFG.overlapMinPx2) {
            out.textOverlap.push({ slide: idOf(s, i),
                                   a: (A.textContent || '').trim().slice(0, 30),
                                   b: (B.textContent || '').trim().slice(0, 30),
                                   px2: Math.round((ox * oy) / (k * k)) });
          }
        }
      }
    });
    out.textOverlap = out.textOverlap.slice(0, 40);

  });

  // ── 6. Paint order over full-bleed imagery ───────────────────────────────
  step('Paint order over full-bleed imagery', () => {
    // A slide whose entire copy is invisible under its own photograph has
    // perfect layout: real boxes, real sizes, correct fonts. Overflow,
    // collision, contrast and inventory checks all pass. Only a hit test finds it.
    slides.forEach((s, i) => {
      const heads = [...s.querySelectorAll('h1,h2,h3,.title,[class*="title"],[class*="head"]')]
        .filter((el) => (el.textContent || '').trim() && vis(el)).slice(0, 3);
      heads.forEach((h) => {
        const r = rect(h);
        if (!r.width || !r.height) return;
        const hit = document.elementFromPoint(r.left + Math.min(8, r.width / 2), r.top + r.height / 2);
        if (hit && hit !== h && !h.contains(hit) && !hit.contains(h)) {
          out.paintOrder.push({ slide: idOf(s, i),
                                text: (h.textContent || '').trim().slice(0, 40),
                                coveredBy: String(hit.className || hit.tagName).slice(0, 40) });
        }
      });
    });

  });

  // ── 7. Chart integrity — the axis-honesty check ──────────────────────────
  step('Chart integrity — the axis-honesty check', () => {
    // Length is the encoding. If bar length is not proportional to value, the
    // chart overstates its own change; on a results slide that is compliance
    // exposure rather than a taste question. Within one bar group,
    // length / value must be constant. Where it is not, the implied baseline
    // is solved for, because "the axis starts at 71.4" is a fact someone can
    // act on in a way that "this chart looks off" is not.
    //
    // Two paths, and the declared one is the one to build against:
    //  • DECLARED — mark the group `data-chart="bars"` and each bar
    //    `data-value="81.4"`. Exact, no heuristics, and the deck documents
    //    its own charts.
    //  • DETECTED — for auditing a deck you did not write. Deliberately
    //    strict: a loose detector produces false positives, and a gate people
    //    learn to ignore is worse than no gate. Groups that fail the
    //    strictness tests are counted as UNVERIFIED rather than as passing,
    //    so the coverage gap stays visible.
    const num = (s) => {
      const m = String(s == null ? '' : s).replace(/[, ]/g, '').match(/-?\d+(?:\.\d+)?/);
      return m ? parseFloat(m[0]) : null;
    };
    let unverified = 0;

    const judge = (slideId, kind, bars, declaresAxis) => {
      const good = bars.filter((b) => b.value !== null && b.value > 0 && b.len > 0.5);
      if (good.length < 3) return false;              // 2-bar groups are where the noise is
      const vals = good.map((b) => b.value);
      if (Math.max(...vals) / Math.min(...vals) > 1000) return false;  // mixed units/years
      const ratios = good.map((b) => b.len / b.value);
      const lo = Math.min(...ratios), hi = Math.max(...ratios);
      const drift = (hi - lo) / hi;
      const row = { slide: slideId, kind, n: good.length, values: vals,
                    lengths: good.map((b) => Math.round(b.len)),
                    ratioDrift: +drift.toFixed(3), zeroBased: drift <= 0.02,
                    declaresAxis: !!declaresAxis };
      if (!row.zeroBased) {
        const [p, q] = [good[0], good[good.length - 1]];
        const denom = p.len - q.len;
        if (Math.abs(denom) > 0.001) {
          row.impliedBaseline = +(((p.len * q.value - q.len * p.value) / denom)).toFixed(1);
          const real = (Math.max(...vals) - Math.min(...vals)) / Math.max(...vals);
          const shown = (Math.max(...row.lengths) - Math.min(...row.lengths)) / Math.max(...row.lengths);
          row.realChangePct = +(real * 100).toFixed(1);
          row.shownChangePct = +(shown * 100).toFixed(1);
          row.exaggeration = real > 0 ? +(shown / real).toFixed(1) : null;
        }
      }
      out.charts.push(row);
      return true;
    };

    slides.forEach((s, i) => {
      const id = idOf(s, i);
      const declaresAxis = /axis (begins|starts)|begins at zero|zero-based|from zero/i
        .test(s.textContent || '');

      // (a) DECLARED groups
      s.querySelectorAll('[data-chart]').forEach((g) => {
        const bars = [...g.querySelectorAll('[data-value]')].map((b) => {
          const r = rect(b);
          const inline = b.getAttribute('style') || '';
          const pct = inline.match(/(?:height|width)\s*:\s*([\d.]+)%/);
          const len = pct ? parseFloat(pct[1]) : Math.max(r.height, r.width);
          return { len, value: num(b.dataset.value) };
        });
        if (!judge(id, 'declared:' + g.dataset.chart, bars, declaresAxis)) unverified++;
      });

      // (b) DETECTED — SVG columns on a shared baseline.
      // Labels are matched on the `x` ATTRIBUTE, not on a laid-out box: some
      // engines report a zero-width rect for <text>, which collapses every
      // horizontal distance to the same value and silently pairs all three
      // bars with the first label.
      s.querySelectorAll('svg').forEach((svg) => {
        if (svg.closest('[data-chart]')) return;
        const rects = [...svg.querySelectorAll('rect')]
          .filter((r) => parseFloat(r.getAttribute('height')) > 2 &&
                         parseFloat(r.getAttribute('width')) > 2);
        if (rects.length < 3) return;
        const baseline = rects.map((r) => parseFloat(r.getAttribute('y')) +
                                          parseFloat(r.getAttribute('height')));
        const sharesBase = Math.max(...baseline) - Math.min(...baseline) <= 2;
        const widths = rects.map((r) => parseFloat(r.getAttribute('width')));
        const sameWidth = Math.max(...widths) - Math.min(...widths) <= 2;
        if (!sharesBase || !sameWidth) { unverified++; return; }
        const texts = [...svg.querySelectorAll('text')]
          .filter((t) => /\d/.test(t.textContent || ''));
        const bars = rects.map((r) => {
          const cx = parseFloat(r.getAttribute('x')) + parseFloat(r.getAttribute('width')) / 2;
          const ry = parseFloat(r.getAttribute('y'));
          let best = null, bestD = 1e9;
          texts.forEach((t) => {
            const tx = parseFloat(t.getAttribute('x'));
            const ty = parseFloat(t.getAttribute('y'));
            if (!isFinite(tx) || !isFinite(ty)) return;
            if (ty > ry) return;                       // value labels sit above the bar
            const d = Math.abs(tx - cx);
            if (d < bestD) { bestD = d; best = t; }
          });
          return { len: parseFloat(r.getAttribute('height')),
                   value: best && bestD < widths[0] ? num(best.textContent) : null };
        });
        if (new Set(bars.map((b) => b.value)).size < bars.length) { unverified++; return; }
        if (!judge(id, 'svg-rect', bars, declaresAxis)) unverified++;
      });

      // (c) DETECTED — HTML columns: sibling cells, each holding one drawn bar
      // and one numeric label, all bars on a shared baseline and of equal
      // cross-width. Anything less strict matches card grids and date strings.
      s.querySelectorAll('*').forEach((p) => {
        if (p.closest('[data-chart]')) return;
        const kids = [...p.children].filter((c) => vis(c));
        if (kids.length < 3 || kids.length > 8) return;
        const cells = kids.map((c) => {
          const bar = c.querySelector('[class*="bar"],[class*="fill"],[style*="height:"],[style*="width:"]');
          if (!bar || bar === c) return null;
          const br = rect(bar);
          if (br.width < 4 || br.height < 4) return null;
          // Prefer the DECLARED length over the measured one. Percentage
          // heights are where rendering engines diverge: Obscura resolves
          // `height:84.0%` and `height:86.4%` to the same computed px and
          // returns a bounding rect that matches neither, which turns an
          // honest zero-based chart into a false axis-truncation finding.
          // A declared percentage is exact, engine-independent, and is the
          // number the author actually wrote.
          const inline = bar.getAttribute('style') || '';
          const pct = inline.match(/(?:height|width)\s*:\s*([\d.]+)%/);
          const labelEl = [...c.querySelectorAll('*')].find(
            (e) => e !== bar && !bar.contains(e) && !e.contains(bar) &&
                   isLeafText(e) && /\d/.test(e.textContent || ''));
          return { br, declared: pct ? parseFloat(pct[1]) : null,
                   value: num(labelEl && labelEl.textContent) };
        });
        if (cells.some((c) => !c)) return;
        const boxes = cells.map((c) => c.br);
        const vertical = boxes[0].height >= boxes[0].width;
        const base = boxes.map((b) => (vertical ? b.bottom : b.left));
        const cross = boxes.map((b) => (vertical ? b.width : b.height));
        if (Math.max(...base) - Math.min(...base) > 2) return;   // no shared baseline
        if (Math.max(...cross) - Math.min(...cross) > 2) return; // not uniform bars
        const lens = boxes.map((b) => (vertical ? b.height : b.width));
        if (new Set(lens.map(Math.round)).size < 2) return;      // all equal: not a chart
        // Declared lengths win where every bar has one; measurement is the
        // fallback for bars sized by the layout rather than by an author.
        const allDeclared = cells.every((c) => c.declared !== null);
        const bars = cells.map((c, n) => ({ len: allDeclared ? c.declared : lens[n],
                                            value: c.value }));
        if (allDeclared && new Set(bars.map((b) => b.len)).size < 2) return;
        if (new Set(bars.map((b) => b.value)).size < bars.length) { unverified++; return; }
        if (!judge(id, 'html-bar', bars, declaresAxis)) unverified++;
      });
    });

    // de-duplicate nested matches over the same value set
    const seen = new Set();
    out.charts = out.charts.filter((c) => {
      const k = c.slide + JSON.stringify(c.values);
      if (seen.has(k)) return false; seen.add(k); return true;
    });
    out.chartsUnverified = unverified;
  });

  // ── 8. Accent budget ─────────────────────────────────────────────────────
  step('Accent budget', () => {
    // One thing carries the colour. An accent on four elements is a decoration,
    // not a signal — the slide stopped saying which number matters.
    const norm2 = norm;
    let accent = CFG.accent ? norm2(CFG.accent.replace(/^#/, '').match(/../g)
      .map((h) => parseInt(h, 16)).join(',')) : null;
    if (!accent) {
      const tally = {};
      slides.forEach((s) => s.querySelectorAll('*').forEach((el) => {
        if (!vis(el)) return;
        const cs = getComputedStyle(el);
        [cs.color, cs.backgroundColor].forEach((c) => {
          const n = norm(c); if (!n) return;
          const [r, g, b] = n.split(',').map(Number);
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (mx - mn > 60 && mx > 80) tally[n] = (tally[n] || 0) + 1;   // saturated only
        });
      }));
      accent = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    }
    if (accent) {
      slides.forEach((s, i) => {
        let n = 0;
        s.querySelectorAll('*').forEach((el) => {
          if (!vis(el) || !(el.textContent || '').trim()) return;
          if ([...el.children].some((c) => (c.textContent || '').trim())) return;
          const cs = getComputedStyle(el);
          if (norm(cs.color) === accent || norm(cs.backgroundColor) === accent) n++;
        });
        if (n > 3) out.accent.push({ slide: idOf(s, i), accentRgb: accent, elements: n });
      });
    }

  });

  // ── 9. Dead space at the foot of a slide ─────────────────────────────────
  step('Dead space at the foot of a slide', () => {
    // Open space in a slide's bottom third is correct composition, not a defect.
    // What this reports is the band BELOW the lowest ink, which is where a
    // fluid section that stopped at content height gives itself away.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const sr = rect(s);
      let lowest = sr.top;
      s.querySelectorAll('*').forEach((el) => {
        if (!vis(el)) return;
        const isInk = isLeafText(el) ||
          el.matches('img,svg,canvas,video,hr,[class*="bar"],[class*="rule"]');
        if (!isInk) return;
        const r = rect(el);
        if (r.height && r.bottom > lowest && r.bottom <= sr.bottom + 1) lowest = r.bottom;
      });
      const band = Math.round((sr.bottom - lowest) / k);
      if (band > CFG.deadBandPx) {
        out.deadSpace.push({ slide: idOf(s, i), emptyFootPx: band,
                             pctOfCanvas: +((band / CFG.canvasH) * 100).toFixed(1) });
      }
    });

  });

  // ── 10. Text set over raster, with no protecting layer ───────────────────
  step('Text set over raster, with no protecting layer', () => {
    // Not a pass/fail — a look-here list. A DOM probe cannot sample the pixels
    // under a photograph, so this narrows where a human eye is actually needed.
    slides.forEach((s, i) => {
      const media = [...s.querySelectorAll('img, video, [style*="background-image"]')]
        .filter((m) => { const r = rect(m); return r.width > 200 && r.height > 200; });
      if (!media.length) return;
      s.querySelectorAll('*').forEach((el) => {
        const t = (el.textContent || '').trim();
        if (!t || !vis(el)) return;
        if ([...el.children].some((c) => (c.textContent || '').trim())) return;
        const r = rect(el);
        const over = media.some((m) => {
          const mr = rect(m);
          return r.left >= mr.left - 2 && r.right <= mr.right + 2 &&
                 r.top >= mr.top - 2 && r.bottom <= mr.bottom + 2;
        });
        if (!over) return;
        // a protecting layer = an ancestor between text and media carrying a
        // non-transparent background or a backdrop filter
        let guard = false, p = el;
        for (let d = 0; d < 4 && p && p !== s; d++, p = p.parentElement) {
          const cs = getComputedStyle(p);
          const a = norm(cs.backgroundColor) && !/,\s*0\)/.test(cs.backgroundColor);
          if ((a && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
              cs.backdropFilter !== 'none' || /gradient/.test(cs.backgroundImage)) { guard = true; break; }
        }
        if (!guard) {
          out.textOverImage.push({ slide: idOf(s, i), text: t.slice(0, 40),
                                   sizePx: Math.round(parseFloat(getComputedStyle(el).fontSize) / scaleOf(s)),
                                   colour: getComputedStyle(el).color });
        }
      });
    });
    out.textOverImage = out.textOverImage.slice(0, 30);

  });

  // ── 11. Provenance, for decks a reader will act on ───────────────────────
  step('Provenance, for decks a reader will act on', () => {
    // A figure with no stated provenance is not neutral: it reads as
    // authoritative, because that is the default a reader applies.
    if (CFG.regulated) {
      const body = document.body.innerText || '';
      const has = (re) => re.test(body);
      out.provenance = {
        auditQualifier: has(/unaudited|audited|not subject to (external )?(audit|review)/i),
        asAtDate: has(/as at|as of|for the (quarter|period|year) end/i),
        axisDisclosure: out.charts.length ? has(/axis (begins|starts)|from zero|zero-based/i) : null,
        illustrativeMarked: has(/illustrative|indicative|generated|placeholder|synthetic/i),
        disclaimer: has(/disclaimer|forward.looking|no reliance|authorised for release/i),
      };
      out.provenance.missing = Object.entries(out.provenance)
        .filter(([k, v]) => v === false).map(([k]) => k);
    }

  });

  // ── 11. Ink extent — the check `scrollHeight` structurally cannot make ───
  step('Ink extent past the slide box', () => {
    // Measured on a real deck, 15 Aug 2026: a slide whose table ran 85px past
    // its own bottom edge reported scrollHeight === clientHeight === 624, so
    // the scroll-extent check above scored it CLEAN while an entire table row
    // sat clipped under the floating chrome. A clipping ancestor (or
    // overflow:hidden) erases scrollHeight; it does not move the ink. So
    // measure where the ink actually is, in authored px, per slide.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const sr = rect(s);
      let worstB = 0, worstR = 0, whoB = '', whoR = '';
      s.querySelectorAll('*').forEach((el) => {
        const paints = isLeafText(el) || ['IMG', 'SVG', 'CANVAS', 'VIDEO'].includes(el.tagName);
        if (!paints || !vis(el)) return;
        const r = rect(el);
        if (!r.width || !r.height) return;
        const b = (r.bottom - sr.bottom) / k;
        const rt = (r.right - sr.right) / k;
        const label = ((el.textContent || '').trim() || el.tagName).slice(0, 34);
        if (b > worstB) { worstB = b; whoB = label; }
        if (rt > worstR) { worstR = rt; whoR = label; }
      });
      if (worstB > 2 || worstR > 2) {
        out.inkExtent.push({ slide: idOf(s, i),
                             pastBottomPx: Math.round(worstB), atBottom: whoB,
                             pastRightPx: Math.round(worstR), atRight: whoR });
      }
    });
  });

  // ── 12. Floating chrome against the slide BOX, not just its text ─────────
  step('Floating chrome reserve', () => {
    // A dock that clears the last line of text but sits over the slide's lower
    // edge still reads as chrome on top of the artwork, and it hides whatever
    // the next revision puts there. Measured: a controller overlapping the
    // stage on all 12 slides of one deck while the text-vs-dock check scored 0,
    // because the footer line happened to stop 17px short of it.
    const docks = [...document.querySelectorAll('*')].filter((el) => {
      if (!vis(el) || getComputedStyle(el).position !== 'fixed') return false;
      if (slides.some((s) => s.contains(el) || el.contains(s))) return false;
      const r = rect(el);
      return r.width > 40 && r.height > 16 && r.width < innerWidth * 0.92;
    });
    docks.forEach((d) => {
      const dr = rect(d);
      slides.forEach((s, i) => {
        const sr = rect(s);
        const oy = Math.min(sr.bottom, dr.bottom) - Math.max(sr.top, dr.top);
        const ox = Math.min(sr.right, dr.right) - Math.max(sr.left, dr.left);
        if (oy > 2 && ox > 2) {
          out.chromeReserve.push({ slide: idOf(s, i),
            chrome: String(d.className || d.id || d.tagName).slice(0, 24),
            overlapPx: Math.round(Math.min(oy, ox)) });
        }
      });
    });
  });

  // ── 13. Hue budget — one accent, counted across the whole deck ───────────
  step('Hue budget', () => {
    // "One accent, never two" is a rule every brand states and every generated
    // deck breaks the same way: status chips reach for green for done and blue
    // for in-progress, and the deck now carries three hues. Measured on two
    // decks from one brief and one DESIGN.md: 1 hue family against 3.
    const hueOf = (c) => {
      const m = String(c).match(/[\d.]+/g);
      if (!m || m.length < 3) return null;
      if (m.length > 3 && parseFloat(m[3]) < 0.06) return null;
      const v = m.slice(0, 3).map((x) => Number(x) / 255);
      const mx = Math.max.apply(null, v), mn = Math.min.apply(null, v), d = mx - mn;
      if (d < 0.10 || mx < 0.12) return 'neutral';
      let hh = 0;
      if (mx === v[0]) hh = 60 * (((v[1] - v[2]) / d) % 6);
      else if (mx === v[1]) hh = 60 * ((v[2] - v[0]) / d + 2);
      else hh = 60 * ((v[0] - v[1]) / d + 4);
      return Math.round(((hh + 360) % 360) / 30) * 30 % 360;
    };
    const fam = {};
    slides.forEach((s) => {
      s.querySelectorAll('*').forEach((el) => {
        if (!vis(el)) return;
        const r = rect(el); if (!r.width || !r.height) return;
        const cs = getComputedStyle(el);
        [isLeafText(el) ? cs.color : null, cs.backgroundColor].forEach((c) => {
          if (!c) return;
          const hv = hueOf(c);
          if (hv === null || hv === 'neutral') return;
          fam[hv] = (fam[hv] || 0) + 1;
        });
      });
    });
    // 3+ marks before a hue counts as a family: one stray swatch is not a palette.
    const fams = Object.keys(fam).filter((k) => fam[k] >= 3)
      .map((k) => ({ hue: Number(k), marks: fam[k] }))
      .sort((a, b) => b.marks - a.marks);
    out.hues = { families: fams, count: fams.length,
                 extra: fams.slice(1) };
  });

  // ── 14. Display tier ─────────────────────────────────────────────────────
  step('Display tier present', () => {
    // A deck whose largest type is 76px on a 1920 canvas has no display tier:
    // its cover reads as a web hero and every slide below inherits the flat
    // ramp. Measured across two decks from one brief: 132px against 76px, and
    // the smaller ramp carried 13 distinct sizes against 19.
    const mx = out.type && out.type.largestPx;
    if (mx && mx < CFG.displayFloorPx) {
      out.displayTier = { largestPx: mx, floorPx: CFG.displayFloorPx,
        note: 'no display tier: the deck\'s largest type is below the cover floor' };
    }
  });

  // ── 15. Single-file portability ──────────────────────────────────────────
  step('Single-file portability', () => {
    // A deck that <link>s a webfont opens in a different typeface offline, on a
    // plane, behind a strict CSP, and inside a sandboxed investor portal — the
    // four places a deck is most often actually read.
    out.externalRefs = [...document.querySelectorAll('link[href],script[src],img[src],source[src]')]
      .map((el) => el.getAttribute('href') || el.getAttribute('src') || '')
      .filter((u) => /^(https?:)?\/\//i.test(u))
      .slice(0, 12);
  });

  // ── 16. Checker arithmetic leaked into slide copy ────────────────────────
  step('Leaked gate arithmetic', () => {
    // A deck written to satisfy its own gate starts printing the gate's working
    // where the disclosure belongs. Measured: "Constant ratio 1.1765%" in the
    // chart note on three slides of one investor deck. The reader is owed the
    // axis disclosure and the as-at date; the author's proof of honesty is not
    // a disclosure and reads as one.
    const RX = /(constant ratio|ratio\s*[:=]\s*[\d.]+|scale factor\s*[:=]|zero-?based\s*[:=]\s*true|gate (passed|clean)|preflight)/i;
    slides.forEach((s, i) => {
      s.querySelectorAll('*').forEach((el) => {
        if (!isLeafText(el) || !vis(el)) return;
        const t = (el.textContent || '').trim();
        if (t && RX.test(t)) out.leakedArithmetic.push({ slide: idOf(s, i), text: t.slice(0, 72) });
      });
    });
  });

  // ── 17. Title line wrapping & heading explosion ───────────────────────────
  step('Title line wrapping and heading explosion', () => {
    // A headline wrapping onto 3+ lines (or cover title onto >2 lines) steals
    // 100-200px of vertical budget, forcing content downward into chrome or clipping.
    // Detects line count and awkward wrap explosions programmatically without screenshotting.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const titles = [...s.querySelectorAll('h1, h2, .slide-title, [class*="slide-title"], [class*="hero-title"]')].filter(vis);
      titles.forEach((h) => {
        const cs = getComputedStyle(h);
        const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.15);
        const r = rect(h);
        if (!r.width || !r.height) return;
        // Count lines from the box, NOT from getClientRects(). A heading is a
        // block, and getClientRects() on a block returns exactly ONE rect per
        // spec — its border box — so `clientRects.length` is 1 for a title
        // wrapping onto five lines, and reading it first made this check
        // unfireable. A predicate that always returns 1 reports every deck
        // clean, which is indistinguishable from a deck with no wrapped titles.
        //
        // Both operands must be in the same space: getBoundingClientRect is
        // POST-transform while computed line-height and padding are authored
        // values, so the height is divided back up by the stage scale first.
        // Measured on a title at 64px/70.4px wrapping to three lines inside a
        // stage at k=0.646: r.height 136 gives 136/70.4 = 2 lines (wrong, and
        // under the threshold), where (136/0.646)/70.4 = 3 (right).
        const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        const lines = Math.max(1, Math.round((r.height / (k || 1) - padY) / lh));
        // Computed font-size is ALREADY an authored value — an ancestor
        // transform scales the painted box, not the resolved CSS. Dividing it by
        // the stage scale inflated it by 1/k, which both mis-set the cover
        // threshold and printed a wrong number into the finding: a title
        // authored at 64px inside a stage at k=0.646 was reported as 99px.
        const authoredFontPx = parseFloat(cs.fontSize);
        const isCover = i === 0 || s.id === 'slide-1' || h.tagName.toLowerCase() === 'h1' || authoredFontPx >= CFG.displayFloorPx;
        const maxAllowed = isCover ? 2 : 3;
        if (lines > maxAllowed) {
          out.titleWrap.push({
            slide: idOf(s, i),
            text: (h.textContent || '').trim().slice(0, 48),
            lines,
            maxAllowed,
            fontSizePx: Math.round(authoredFontPx)
          });
        }
      });
    });
  });

  // ── 18. Internal stage & content overflow ──────────────────────────────────
  step('Internal stage content overflow', () => {
    // When a slide-wrapper has overflow:hidden and a scaled stage inside,
    // wrapper.scrollHeight matches clientHeight while stage content quietly overflows.
    // This probes the unscaled stage and its content boxes directly.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const sr = rect(s);
      const stage = s.querySelector('.slide-stage, .stage, [class*="stage"]') || s;
      if (stage !== s && (stage.scrollHeight > CFG.canvasH + 4 || stage.scrollWidth > CFG.canvasW + 4)) {
        out.stageContentOverflow.push({
          slide: idOf(s, i),
          overflowY: Math.max(0, stage.scrollHeight - CFG.canvasH),
          overflowX: Math.max(0, stage.scrollWidth - CFG.canvasW),
          container: String(stage.className || stage.tagName).slice(0, 30)
        });
      }
      const contents = s.querySelectorAll('.stage-content, .slide-content, [class*="content"]');
      contents.forEach((c) => {
        if (!vis(c)) return;
        const cr = rect(c);
        const authoredH = cr.height / k;
        if (authoredH > CFG.canvasH - 16) {
          const lastChild = c.lastElementChild;
          if (lastChild) {
            const lcr = rect(lastChild);
            const bottomAuthored = (lcr.bottom - sr.top) / k;
            if (bottomAuthored > CFG.canvasH + 2) {
              out.stageContentOverflow.push({
                slide: idOf(s, i),
                overflowY: Math.round(bottomAuthored - CFG.canvasH),
                container: String(c.className || c.tagName).slice(0, 30)
              });
            }
          }
        }
      });
    });
  });

  // ── 19. Stage bottom clearance floor ───────────────────────────────────────
  step('Stage bottom clearance floor', () => {
    // Content running within a few pixels of the stage bottom border looks squeezed
    // and collides with presentation docks or hardware bezel clipping.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const sr = rect(s);
      let lowestInk = sr.top;
      let hasFooter = false;
      let footerTop = sr.bottom;
      s.querySelectorAll('*').forEach((el) => {
        if (!vis(el)) return;
        if (el.matches('.foot, .footer, [class*="foot"], footer')) {
          hasFooter = true;
          const fr = rect(el);
          if (fr.top < footerTop) footerTop = fr.top;
          return;
        }
        const isInk = isLeafText(el) || el.matches('img,svg,canvas,video,hr,[class*="bar"],[class*="card"]');
        if (!isInk) return;
        const r = rect(el);
        if (r.height && r.bottom > lowestInk && r.bottom <= sr.bottom + 10) {
          lowestInk = r.bottom;
        }
      });
      const clearancePx = Math.round((sr.bottom - lowestInk) / k);
      if (!hasFooter && clearancePx < 16) {
        out.stageBottomClearance.push({
          slide: idOf(s, i),
          clearancePx,
          minRequiredPx: 20,
          note: 'content extends to canvas bottom edge with insufficient margin'
        });
      }
      if (hasFooter && footerTop > lowestInk) {
        const gapAboveFooter = Math.round((footerTop - lowestInk) / k);
        if (gapAboveFooter < 6) {
          out.stageBottomClearance.push({
            slide: idOf(s, i),
            clearancePx: gapAboveFooter,
            minRequiredPx: 10,
            note: 'content crowded against footer top edge'
          });
        }
      }
    });
  });

  // ── 20. Vertical block clearance ───────────────────────────────────────────
  step('Vertical block clearance', () => {
    // When elements in flex/grid are too large, vertical gaps collapse to 0,
    // squishing titles, card grids, highlight strips, and footers together.
    slides.forEach((s, i) => {
      const k = scaleOf(s);
      const stageContent = s.querySelector('.stage-content, .slide-content, .slide-stage, .stage') || s;
      const blocks = [...stageContent.children].filter((c) => vis(c) && !['IMG', 'VIDEO'].includes(c.tagName) && !c.classList.contains('stage-bg-image') && !c.classList.contains('stage-scrim-dark') && !c.classList.contains('scrim') && getComputedStyle(c).position !== 'absolute');
      for (let b = 0; b < blocks.length - 1; b++) {
        const topEl = blocks[b];
        const btmEl = blocks[b + 1];
        const rTop = rect(topEl);
        const rBtm = rect(btmEl);
        if (!rTop.height || !rBtm.height) continue;
        const gap = (rBtm.top - rTop.bottom) / k;
        if (gap < 2 && gap >= -2) {
          out.verticalSquish.push({
            slide: idOf(s, i),
            between: [String(topEl.className || topEl.tagName).slice(0, 24), String(btmEl.className || btmEl.tagName).slice(0, 24)],
            gapPx: Math.round(gap),
            minExpectedPx: 8
          });
        }
      }
    });
  });

  // ── 21. Card & panel container overflow ────────────────────────────────────
  step('Card & panel container overflow', () => {
    slides.forEach((s, i) => {
      s.querySelectorAll('.stat-card, .card-surface, [class*="card"], .chart-panel').forEach((card) => {
        if (!vis(card)) return;
        if (card.scrollHeight > card.clientHeight + 2 || card.scrollWidth > card.clientWidth + 2) {
          out.cardOverflow.push({
            slide: idOf(s, i),
            card: String(card.className || card.tagName).slice(0, 30),
            overflowY: Math.max(0, card.scrollHeight - card.clientHeight),
            overflowX: Math.max(0, card.scrollWidth - card.clientWidth)
          });
        }
      });
    });
  });

  // ── Summary ──────────────────────────────────────────────────────────────
  out.summary = {
    slidesExamined: slides.length,
    stageGeometry: out.stage.length,
    typeBelowFloor: out.type.belowBodyFloor,
    overflow: out.overflow.length,
    stageContentOverflow: out.stageContentOverflow.length,
    titleWrap: out.titleWrap.length,
    cardOverflow: out.cardOverflow.length,
    chromeCollisions: out.collisions.length,
    textOverlaps: out.textOverlap.length,
    invisibleText: out.paintOrder.length,
    chartsChecked: out.charts.length,
    chartsNotZeroBased: out.charts.filter((c) => !c.zeroBased).length,
    chartGroupsUnverified: out.chartsUnverified || 0,
    accentOverspent: out.accent.length,
    deadFootBands: out.deadSpace.length,
    stageBottomClearance: out.stageBottomClearance.length,
    verticalSquish: out.verticalSquish.length,
    unprotectedTextOverImage: out.textOverImage.length,
    provenanceMissing: out.provenance ? out.provenance.missing.length : null,
    inkPastSlide: out.inkExtent.length,
    chromeOverStage: out.chromeReserve.length,
    hueFamilies: out.hues ? out.hues.count : null,
    noDisplayTier: out.displayTier ? 1 : 0,
    externalRefs: out.externalRefs.length,
    leakedArithmetic: out.leakedArithmetic.length,
  };
  out.notes.push('Denominator: ' + slides.length + ' slides examined. A zero with no ' +
                 'denominator is not a result. This finds no known computable defect; ' +
                 'it does not find the defect nobody has met yet.');
  return JSON.stringify(out, null, 1);
 } catch (e) {
  // A gate that dies quietly is worse than no gate: its silence is
  // indistinguishable from a clean deck. Say so in the return value.
  return JSON.stringify({ error: String((e && e.stack) || e),
                          note: 'preflight did NOT run — this is not a pass' }, null, 1);
 }
})(typeof __DECKCFG !== 'undefined' ? __DECKCFG
   : (typeof window !== 'undefined' && window.__deckPreflight) || {})
