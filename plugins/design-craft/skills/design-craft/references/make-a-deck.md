# Make a Deck: Slide Presentation in HTML

Build a slide presentation as a single self-contained HTML file with fixed-size slides that letterbox to any viewport. Use this when the user asks for a deck, presentation, slides, or pitch.

A deck is fixed-size content (typically 1920×1080, 16:9) that scales to fit any screen. Don't hand-roll ad-hoc scaling per slide — build the deck shell once (Phase 3) and let every slide live inside it.

## Phase 1: Discovery

Confirm before building:

- **Audience.** Engineers? Executives? Customers? Internal team? Determines tone and density.
- **Format.** Aspect ratio (16:9 default, 4:3 occasionally). Slide count (most decks land at 8–15).
- **Length / time budget.** A 10-minute deck is ~10 slides; a 30-minute deck ~20–25.
- **Tone.** Formal corporate, casual internal, marketing-bold, technical-detail.
- **Source content.** Is there a PRD, doc, or existing material? Read it before sketching.
- **Speaker notes.** Off by default. Only add when explicitly requested.
- **Brand / design system.** Always confirm. If none, run `frontend-aesthetic-direction.md` before drawing.

If the user gave enough context to skip the question round (e.g. "make a 5-slide deck for engineering all-hands from this PRD"), proceed.

## Phase 2: Plan the layout system

Before building any slide, commit to a layout system. Vocalize it as a comment block at the top of the file. A typical deck has 4–6 layout types:

- **Cover / title** — large title, optional subtitle, brand mark, date
- **Section header** — full-bleed background color or image, large section title
- **Content** — headline + supporting visuals (chart, image, or bullet list)
- **Quote / pull-out** — large quote, attribution, lots of breathing room
- **Comparison / two-column** — side-by-side content
- **Closing / CTA** — final ask, contact info, next steps

For each layout decide: background color/image style, headline size and position, body content area, footer treatment (page number, brand mark, none). Limit yourself to **1–2 background colors** across the deck; section headers may break to a third, no more.

## Phase 3: Build the deck shell (self-contained)

Build the scaling shell once. It holds every slide as a fixed 1920×1080 `<section>` and scales the stage to fit the viewport with letterboxing, handles keyboard/tap navigation, shows a slide counter, and persists the current slide to `localStorage`.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Deck</title>
  <style>
    :root { --slide-w: 1920px; --slide-h: 1080px; }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; background: #111; overflow: hidden; }
    #stage {
      position: absolute; top: 50%; left: 50%;
      width: var(--slide-w); height: var(--slide-h);
      transform-origin: center center;   /* JS sets transform: translate(-50%,-50%) scale(s) */
    }
    .slide {
      position: absolute; inset: 0; display: none;
      width: var(--slide-w); height: var(--slide-h);
      background: #FAFAFA; color: #1A1A1A;
    }
    .slide[data-active] { display: block; }
    #counter {
      position: fixed; bottom: 16px; right: 20px; z-index: 10;
      font: 500 14px/1 system-ui, sans-serif; color: #fff; opacity: .6;
    }
    @media print {
      html, body { overflow: visible; background: #fff; }
      #stage { position: static; transform: none !important; width: auto; height: auto; }
      .slide { display: block !important; page-break-after: always; }
      #counter { display: none; }
    }
  </style>
</head>
<body>
  <div id="stage">
    <section class="slide" data-screen-label="01 Title" data-active><!-- … --></section>
    <section class="slide" data-screen-label="02 Agenda"><!-- … --></section>
  </div>
  <div id="counter"></div>
  <script>
    const stage = document.getElementById('stage');
    const slides = [...stage.querySelectorAll('.slide')];
    const counter = document.getElementById('counter');
    const KEY = 'deck.slide';
    let i = Math.min(+(localStorage.getItem(KEY) || 0), slides.length - 1);

    function fit() {
      const s = Math.min(innerWidth / 1920, innerHeight / 1080);
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    }
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((sl, k) => sl.toggleAttribute('data-active', k === i));
      counter.textContent = `${i + 1} / ${slides.length}`;
      localStorage.setItem(KEY, i);
    }
    addEventListener('resize', fit);
    addEventListener('keydown', (e) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) show(i + 1);
      if (['ArrowLeft', 'PageUp'].includes(e.key)) show(i - 1);
    });
    addEventListener('click', (e) => show(i + (e.clientX > innerWidth / 2 ? 1 : -1)));
    fit(); show(i);
  </script>
</body>
</html>
```

Each slide is a direct child `<section class="slide">` of `#stage`. Add `data-screen-label` to each so the user can reference slides by name when commenting. **Labels are 1-indexed** to match the counter the user sees.

```html
<section class="slide" data-screen-label="01 Title">…</section>
<section class="slide" data-screen-label="02 Agenda">…</section>
```

Adapt freely (transitions, progress bar, a thumbnail overview on a key press) — but keep the core invariant: slides are authored at a fixed 1920×1080 and the stage scales to fit. Don't lock the deck to one screen size.

## Phase 4: Build slide-by-slide

Build one slide at a time, in order. Show the user the file as soon as you have 1–2 slides — don't perfect 15 slides in private and then reveal. For each slide:

- **Type rules.** Body text never smaller than 24px on a 1920×1080 canvas; ideally 32px+. Headlines 60–96px+.
- **Hierarchy.** One primary message per slide. Supporting elements smaller, more muted.
- **Imagery.** When text-heavy, commit to imagery from the design system, or use honest placeholders (striped backgrounds with monospace labels). Don't pad with hand-drawn SVG illustrations.
- **No filler.** "Why choose us?" / "About this deck" / generic fluff slides cost the user attention. Cut them.
- **Charts and data.** Show what matters. Cut columns and data points that don't support the slide's point.

Use the spacing and color tokens from the design system (or the Phase 2 aesthetic). Don't introduce new values inline.

## Phase 5: Speaker notes (only if requested)

Off by default. When requested, add a `<script type="application/json" id="speaker-notes">` array in the head — one entry per slide — and render the current slide's note in a presenter overlay (toggle on a key, e.g. `N`). Use full conversational scripts, not bullet outlines. Slides with speaker notes can carry less on-screen text.

## Phase 6: Verify and deliver

Walk the deck top to bottom in a browser. Check: scaling works at multiple viewport sizes; the counter increments correctly; keyboard nav (arrows, space) works; no content overflows the slide bounds; type sizes meet the minimums (24px+ body); color contrast meets WCAG (quick check, or run `accessibility-audit.md` for thoroughness). For end-of-turn delivery, surface the final HTML file and dispatch a verifier subagent (the `Agent` tool) for the thorough pass — render, screenshot each slide, probe nav.

Summarize briefly: caveats (e.g. placeholder imagery still needed), next steps (real charts to swap in), and any decisions the user should sign off on.
