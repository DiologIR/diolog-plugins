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
- **Deck aesthetic axes.** Beyond tone, a deck direction commits on three axes worth naming: **scheme** (light paper / dark canvas), **formality** (boardroom ↔ zine), and **density** (airy manifesto ↔ data-heavy working deck). Vary deck-to-deck — a dark editorial canvas with one hot accent, a warm-paper serif deck, a cobalt-grid corporate deck, and a raw-grid brutalist deck are four different instruments, not one template re-skinned. If a local deck-template library exists (on this user's machine: `~/Dev/open-design/design-templates/html-ppt-*/`, 30+ named styles with example.html), skim 2–3 matching styles for direction — but build in this file's shell; never mix layout vocabularies across styles.

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

**Write the full title sequence before any slide.** Titles are the deck's table of contents: a person reading only the titles should follow the whole argument. Pick ONE grammatical style — short topic noun-phrases ("Market Research", "Team Structure") or brief declarative action titles ("Asia is our largest market…") — and write every title in it. Read the sequence back; revise until it flows like chapter headings. Avoid the Claude-isms that mark a deck as AI-generated: punchline titles ("The magic moment"), verdict-delivering takeaways, manufactured tension ("It's not X. It's Y."), heavy-handed reframing, faux-insight. A title introduces the slide; it is not the speaker's punchline.

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

**Wrapper-collapse failure mode.** The shell sizes only the `<section>`; a wrapper `<div>` inside it is an ordinary block at `height: auto`. If that wrapper's children are all `position: absolute` (a full-bleed `inset: 0` image, a scrim) it collapses to zero height and the image vanishes; if they're in-flow it stops at content height, so a full-bleed background covers only the top band with blank space below. Add once to the base styles, so full-bleed art and vertically-centered content actually fill the slide:

```css
.slide > *:not(img):not(picture):not(video):not(svg):not(canvas) { height: 100%; box-sizing: border-box; }
```

Keep one in-flow wrapper per slide; a second top-level element (page number, corner mark) should be `position: absolute` with its own size so the rule doesn't stretch it.

## Phase 4: Commit the type scale, then build slide-by-slide

Before writing any slide, define the type scale and spacing as CSS custom properties in the base `<style>` block. This commits you to projection-appropriate sizing and stops you defaulting to web density (14–16px body, 48–72px padding — far too small for slides). A reasonable start at 1920×1080:

```css
:root { --type-title: 64px; --type-subtitle: 44px; --type-body: 34px; --type-small: 28px;
        --pad-top: 100px; --pad-bottom: 80px; --pad-x: 100px; --gap-title: 52px; --gap-item: 28px; }
```

At 1280×720, scale by ~0.67. Every font-size uses a `--type-*` variable; every padding/gap uses `--pad-*`/`--gap-*`. Keeping these in CSS (not JS constants) means one number re-sizes the whole deck and the markup stays static. The explicit `--pad-bottom` reserves breathing room at the base of every slide — that space is structural, not empty. If the values don't feel generous, they aren't. When the user asks for a specific font size, they mean **points** (the PowerPoint/Keynote unit), not pixels — convert with `px = pt × 1.333` ("make titles 36pt" → ~48px).

**Write slides as literal static HTML**, never React or script-generated DOM. Static markup is directly editable — the user (or a later agent) can retype any heading in place; content rendered from a JS array forces every tweak to round-trip through you. Two details keep it editable: each piece of text lives in its own leaf element (put "Revenue" in its own `<span>` inside the `<h2>`, don't mix text and a child span in one parent), and repeated structure is written out — three bullet `<li>`s in the markup, not one `<li>` looped from an array. The repetition is the point: it lets bullet two be edited without touching bullet one. Reach for script only when a slide genuinely needs behavior static markup can't express (a live chart, real state).

Build one slide at a time, in order. Show the user the file as soon as you have 1–2 slides — don't perfect 15 slides in private and then reveal. For each slide:

- **Type rules.** Body text never smaller than 24px on a 1920×1080 canvas; ideally 32px+. Headlines 60–96px+.
- **Hierarchy.** One primary message per slide. Supporting elements smaller, more muted.
- **Imagery.** When text-heavy, commit to imagery from the design system, or use honest placeholders (striped backgrounds with monospace labels). Don't pad with hand-drawn SVG illustrations. View each image and choose its treatment: full-bleed photos may aspect-fill; screenshots and diagrams must aspect-fit and are rarely overlaid; transparent/aspect-fit images sit on a contrasting background. Text on top of an image needs protection — a card, gradient, or blur — matched to how the brand does it elsewhere, not invented per slide.
- **No filler.** "Why choose us?" / "About this deck" / generic fluff slides cost the user attention. Cut them.
- **Charts and data.** Show what matters. Cut columns and data points that don't support the slide's point.
- **Parallelism.** Section headers look the same; repeated elements sit in the same position slide to slide.

Use the spacing and color tokens from the design system (or the Phase 2 aesthetic). Don't introduce new values inline.

**Build animations (rarely).** Most slides need none. Animate only when the order of reveal carries meaning — building a list point-by-point, landing a number, walking a diagram. One or two animated slides in a ten-slide deck is right; when in doubt, add none. Author each slide in its **final visible layout** — the CSS you write is the finished slide — and let the animation hide elements until their step, rather than authoring hidden states and animating toward them: print, thumbnails, and screenshots then all see the finished layout for free. Implement declaratively (e.g. `data-build` attributes the shell reveals on →, each keypress playing the next build before advancing the slide). Under `prefers-reduced-motion`, apply builds instantly but keep the click steps gating — build order is content, not decoration.

## Phase 5: Speaker notes (only if requested)

Off by default. When requested, put each slide's note as plain text in a `data-speaker-notes` attribute on its own `<section>` — the attribute travels with the slide on reorder/duplicate/delete, so nothing goes out of sync. (Never a positional JSON array in the head: one reorder silently misaligns every note after it.) Render the current slide's note in a presenter overlay (toggle on a key, e.g. `N`). Write full conversational scripts — what the presenter actually says out loud — not bullet outlines. Because the script now carries the narrative, strip text off the slides: lean on large figures, quotes, full-bleed images, and one-line headlines. A slide that is mostly text has the script on the slide instead of in the notes.

## Phase 6: Verify and deliver

Walk the deck top to bottom in a browser. Check: scaling works at multiple viewport sizes; the counter increments correctly; keyboard nav (arrows, space) works; no content overflows the slide bounds; type sizes meet the minimums (24px+ body); color contrast meets WCAG (quick check, or run `accessibility-audit.md` for thoroughness). For end-of-turn delivery, surface the final HTML file and dispatch a verifier subagent (the `Agent` tool) for the thorough pass — render, screenshot each slide, probe nav.

Review screenshots against **slide composition rules, not web-layout instincts**. `align-items: flex-start` with open space in the bottom third is correct slide composition, not a defect — if you feel the urge to change `flex-start` to `center`, that urge is the web-design reflex; resist it, the open space is intentional. Also verify: font sizes and frame padding match the `--type-*`/`--pad-*` scale (not web density); titles stay parallel across slides; full-bleed backgrounds, hero images, and color panels reach all four edges — a blank strip below a cover image or a panel that stops mid-slide means a slide wrapper collapsed (apply the wrapper-fill rule from Phase 3).

Summarize briefly: caveats (e.g. placeholder imagery still needed), next steps (real charts to swap in), and any decisions the user should sign off on.
