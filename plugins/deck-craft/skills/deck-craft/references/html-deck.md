# HTML deck — the self-contained fixed-stage target

One HTML file, no build step, no dependencies. Every slide is authored at a fixed 1920×1080 and the whole stage scales to fit the viewport, letterboxing rather than reflowing. That invariant is what makes a deck a deck: content that reflows for a phone is a web page, and the presenter can no longer predict what the audience sees.

## Phase 1: Build the shell once

Don't hand-roll scaling per slide. The shell holds every slide, scales the stage, handles keyboard/tap nav, shows a counter, and persists position to `localStorage` so a reload doesn't lose the presenter's place.

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

Each slide is a direct child `<section class="slide">` of `#stage`, carrying a 1-indexed `data-screen-label` so the user can say "fix slide 04" and you both mean the same slide.

Adapt freely — transitions, a progress bar, an ESC overview grid, wheel and swipe navigation. Keep the invariant: authored at fixed size, stage scales to fit, never re-layout for a narrow viewport.

**Slide visibility must not use `display`.** `.slide { display: none }` looks fine until a later layout rule sets `.slide-content { display: flex }` and every slide renders at once. Toggle with an attribute or class that controls `visibility` + `opacity` + `pointer-events`, or keep `display` toggling but assert nothing downstream overrides it. If `~/Dev/frontend-slides/viewport-base.css` is available, read it and inline its contents — it encodes this and the rest of the stage behaviour.

## Phase 2: Commit the type scale before the first slide

Define the scale as custom properties in the base `<style>`. This is what stops you defaulting to web density, and it means one number resizes the whole deck later.

```css
:root { --type-title: 64px; --type-subtitle: 44px; --type-body: 34px; --type-small: 28px;
        --pad-top: 100px; --pad-bottom: 80px; --pad-x: 100px; --gap-title: 52px; --gap-item: 28px; }
```

Every `font-size` uses a `--type-*`; every padding and gap uses `--pad-*`/`--gap-*`. The explicit `--pad-bottom` reserves breathing room at the base of every slide — that space is structural, not empty. If the values don't feel generous, they aren't.

## Phase 3: Write slides as literal static HTML

Never React, never a JS array rendered into the DOM. Static markup is directly editable: the user or a later agent can retype a heading in place, where content generated from an array forces every tweak to round-trip through you.

Two details keep it editable. Each piece of text lives in its own leaf element — put "Revenue" in its own `<span>` inside the `<h2>` rather than mixing text and a child span in one parent. And repeated structure is written out: three bullet `<li>`s in the markup, not one looped from an array. The repetition is the point — it lets bullet two be edited without touching bullet one.

Reach for script only when a slide needs behaviour static markup can't express: a live chart, real state.

Build one slide at a time, in order, and show the user the file after 1–2 slides rather than perfecting fifteen in private.

## Phase 4: The wrapper-collapse failure mode

The shell sizes only the `<section>`. A wrapper `<div>` inside it is an ordinary block at `height: auto`, so:

- if its children are all `position: absolute` (a full-bleed `inset: 0` image, a scrim), it collapses to zero height and the image vanishes;
- if they're in flow, it stops at content height, so a full-bleed background covers only the top band with blank space below.

Add once to the base styles:

```css
.slide > *:not(img):not(picture):not(video):not(svg):not(canvas) { height: 100%; box-sizing: border-box; }
```

Keep one in-flow wrapper per slide; a second top-level element (page number, corner mark) should be `position: absolute` with its own size so the rule doesn't stretch it.

**Never negate a CSS function directly.** `-clamp(...)`, `-min(...)`, `-max(...)` are silently ignored — the declaration does nothing and the layout is subtly wrong with no error. Use `calc(-1 * clamp(...))`.

## Phase 5: Imagery

View every image before placing it and choose its treatment deliberately. Full-bleed photographs may aspect-fill; screenshots and diagrams must aspect-fit and are rarely overlaid; transparent or aspect-fit images sit on a contrasting ground. Text over an image needs protection — a card, a gradient, a blur — matched to how the brand does it elsewhere rather than invented per slide.

With no real assets, use honest placeholders and say so: a striped background with a monospace label naming the asset and its dimensions. A placeholder shows intent; a hand-drawn SVG of a person or an abstract concept shows you didn't have the asset.

## Phase 6: Speaker notes (only when asked)

Off by default. When requested, put each note as plain text in a `data-speaker-notes` attribute on its own `<section>`, so it travels with the slide through reorder, duplicate and delete. Never a positional JSON array in the head — one reorder silently misaligns every note after it.

Render the current note in a presenter overlay behind a key toggle. Write full conversational scripts, what the presenter actually says, not bullet outlines. And once the script carries the narrative, strip text off the slides: lean on large figures, quotes, full-bleed images, one-line headlines. A slide that is mostly text has put the script on the slide instead of in the notes.

## Phase 7: Print and PDF

The `@media print` block in the shell is the floor: it un-scales the stage, forces every slide visible, and page-breaks between them. Verify by actually printing to PDF, because two things break silently — a background colour that doesn't print (`print-color-adjust: exact` on the elements that need it), and an animation frozen mid-play because the slide was authored in a hidden state. Authoring each slide in its final visible layout (SKILL.md §5) is what makes print free.

If a headless export is available (`~/Dev/frontend-slides/scripts/export-pdf.sh` is one), use it rather than asking the user to print by hand.

## Phase 8: Verify

Serve over HTTP, never `file://` — module scripts, fetches and some fonts fail silently from the filesystem. Then walk the deck per `references/deck-review.md`.
