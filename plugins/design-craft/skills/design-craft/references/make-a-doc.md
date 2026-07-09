# Make a Doc: Page-Style Documents That Print Perfectly

Build a document (resume, one-pager, memo, letter, report, proposal) as an HTML page that reads as paper on screen AND prints cleanly with zero tweaking. Use this when the deliverable is a *document* — something the user will print, save as PDF, or hand to someone — rather than a screen UI.

**A document has two renderings — screen and print — and both ship.** Most web-styled documents fall apart in the print dialog: backgrounds vanish, sections split mid-heading, animations freeze half-played. Design for both from the first line.

## Phase 1: Screen presentation — paper on a desk

- **Page container:** `max-width: 816px` (US Letter at 96dpi), centered (`margin: auto`), white background, 64–72px padding, subtle shadow (`0 2px 12px rgba(0,0,0,0.08)`), 2–4px border-radius. The size matters: 816px means what the user sees on screen is what lands on the printed page, so no layout surprises at print time.
- **Desk background:** the page sits on a muted neutral body background (e.g. `#F0EEE6`) so it reads as paper on a desk, not a web page.
- **Multi-page documents:** one `.page` container per page, with a visible gap between them — the user sees the page breaks before printing, instead of discovering them in the print preview.
- **Document typography, not web typography:** 14–16px body with a clear hierarchy, real inner margins, never edge-to-edge text. Restrained palette — documents are mostly ink on paper; color is for meaning (tags, accents), not decoration.

## Phase 2: Print CSS — the browser's Print must produce a clean document

Add `@media print` from the start, not as a retrofit:

- **Strip the desk:** remove the body background, the page shadow/border/radius, and any on-screen chrome (toolbars, buttons, tweak panels). The page container becomes `width: auto; margin: 0; padding: 0`.
- **Margins via `@page`:** set `@page { margin: 0.75in; }` and rely on it for outer margins — CSS padding inside the page would double up with printer margins.
- **Break control:** `break-inside: avoid` on sections, heading+first-paragraph groups, list items, and table rows, so nothing splits awkwardly; `break-after: page` between `.page` containers so each declared page is a real printed page.

```css
@media print {
  body { background: none; }
  .page { width: auto; margin: 0; padding: 0;
          box-shadow: none; border-radius: 0; break-after: page; }
  .toolbar, .tweaks { display: none; }
  section, li, tr { break-inside: avoid; }
}
@page { margin: 0.75in; }
```

- **Backgrounds:** `print-color-adjust: exact` **only** on elements whose background carries meaning (a resume's skill tags, a status chip); let purely decorative backgrounds drop — browsers strip them by default, and forcing them everywhere wastes ink and muddies the print.
- **Links print legibly** in body ink — never rely on hover styling to make a link findable on paper.

## Phase 3: Make print safety structural, not a patch

The failure this phase prevents: the PDF exports with blank rows where the animated content should be.

### When you own the CSS: invert the states (always prefer this)

> **The resting style IS the final style. The "from" state lives only inside `@keyframes`.**

```css
/* right — at rest the row is visible; the keyframes only say where it came from */
.row { opacity: 1; transform: none }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } }
.section.seen .row { animation: fadeUp 650ms var(--ease-out) both }

/* wrong — at rest the row is invisible. Kill the animation and the row is GONE. */
.row { opacity: 0 }
@keyframes fadeUp { to { opacity: 1 } }
```

Written this way, `animation: none` yields the settled design. Print, `prefers-reduced-motion`, and a JS-disabled fallback are then all correct **by construction**, and the neutraliser is one honest rule:

```css
@media print, (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important }
}
```

This also removes the whole class of "reveal-safety" bugs that `motion-design.md` Phase 8 flags on sight (content visibility gated on a class-triggered transition ships blank sections). The same inversion fixes both.

### When you don't own the CSS: skip to the last frame

For inherited stylesheets, third-party widgets, or a deck you're exporting rather than authoring, you cannot invert the states. Jump every animation to its finished frame instead:

```css
@media print {
  *, *::before, *::after {
    animation-delay: -99s !important; animation-duration: .001s !important;
    animation-iteration-count: 1 !important; animation-fill-mode: both !important;
    animation-play-state: running !important; transition-duration: 0s !important;
  }
}
```

The negative delay skips to the end; `fill-mode: both` holds the final keyframe. Treat it as the fallback it is: it depends on every keyframe's `100%` being the intended resting state, which is exactly the assumption you cannot check in code you didn't write.

### Verify it rather than assuming it

Emulate print, then list everything invisible **at rest** — opacity under 0.05, `visibility: hidden`, a near-zero transform scale, an SVG stroke left fully dashed out. Each entry is content that will be missing from the PDF. Do the same under `prefers-reduced-motion: reduce`. And check for transient overlay labels ("Checking…", "Loading…") that are visible at rest, because they will print.

Either way, be clear with the user: **animations do not play in a PDF** — the export shows each section's finished state.

## Phase 4: The `-print.html` variant (when the source isn't already a doc)

When exporting an existing design (a deck, a scrolling page) rather than authoring a document from scratch, write a print-ready copy: the source path with `-print` inserted before the extension — **same directory, same basename**. `slides/deck.html` → `slides/deck-print.html`.

- **Never change directory depth** and never write to the project root when the source is in a subdirectory: any change in depth breaks every relative URL (`@font-face src: url(...)`, `<img src>`, `<link href>`, CSS `background: url(...)`) and the print render shows missing images and system-font fallbacks.
- In the print copy: convert scroll-based or interactive layouts to static paged layouts; remove hover states and `overflow: hidden` clipping; apply the Phase 2 print CSS and Phase 3 animation freeze; drop JavaScript interactivity that makes no sense on paper; preserve all visual content.
- The `-print.html` is plumbing, not a deliverable — tell the user which file to print, but the styled original remains the artifact.

## Phase 5: PDF export via headless Chrome (when the user wants a file, not a dialog)

If the user wants an actual `.pdf` (to attach, email, or upload), render it with headless Chrome via Bash. Playwright is the reliable route:

```bash
npx playwright pdf --wait-for-timeout=1500 "file:///abs/path/doc-print.html" out.pdf
```

Or scripted for control over format and backgrounds:

```js
const page = await browser.newPage();
await page.goto('file:///abs/path/doc-print.html', { waitUntil: 'networkidle' });
await page.pdf({ path: 'out.pdf', format: 'Letter', printBackground: true });
```

Wait for fonts and any JS to settle before printing (`networkidle` plus a short delay) — a PDF snapped before webfonts load bakes in fallback fonts permanently.

## Phase 6: Verify the export

Open the resulting PDF (Read tool) and check page by page: no content split mid-section; no blank pages from stray `break-after`; meaningful backgrounds present, decorative ones dropped; correct fonts (not a system fallback); images loaded; page count matches the `.page` count. If anything is off, fix the print CSS in the source and re-export — never hand-edit the PDF.

## Summarize

Report: the screen file, the print file (if separate), the PDF (if exported); the page count; anything that was frozen or removed for print; anything you could not verify.
