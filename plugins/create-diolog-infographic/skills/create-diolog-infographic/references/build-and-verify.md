# Build, embed fonts, and verify one A4 page

The layout breaks in ways you cannot see from the source (a font silently falling back to Georgia, the
page running 150px over one sheet, a label glyph hidden under a fill). So rendering and measuring is
part of building, not an afterthought. This is the loop that made the difference.

## 1. Embed the fonts (do this before verifying)

The page must be self-contained: three families (Newsreader, Inter, JetBrains Mono) inlined as base64
woff2. A webfont `<link>` is blocked by the Artifact CSP and unreliable in print; a silent Georgia
fallback destroys the design.

- Fastest: paste the contents of `assets/fonts.css` into the template's `<style>/*__FONTS__*/</style>`
  marker (or `python3 scripts/inline-fonts.py --inject yourfile.html`).
- To regenerate (e.g. different weights): `python3 scripts/inline-fonts.py` writes a fresh `fonts.css`.

## 2. Serve over HTTP, never file://

Rendered assets and some fonts fail from `file://`. Serve the working directory:

```bash
cd <dir-with-the-html> && python3 -m http.server 8945   # any free port
```

## 3. Render with a cache-busting URL

Browsers aggressively cache; a stale page will report the OLD height and OLD content and you will chase
a ghost. Every render, use a **fresh port and a `?v=<something>` query**:

```
http://localhost:8945/infographic.html?v=check1
```

If you re-verify after edits, bump the query (`?v=check2`) or the port. When a verifier reports content
you know you changed, suspect the cache first.

## 4. Measure the page height - it must be <= one A4

A4 at 96dpi is 794 x 1123px. The content must fit **1123px** or it spills onto a second sheet. Measure:

```js
document.querySelector('.page').getBoundingClientRect().height   // target <= 1123
document.querySelector('.page').getBoundingClientRect().width    // expect ~794
```

If it is over, **trim spacing, not content** first: section margins, band paddings, the hero numeral
size, line-heights. Small, even reductions across the page beat gutting one section. Re-measure. The
template is tuned to land near 1123; adding a supporting column or a note will push it over, so budget
for a trim pass after any content addition.

## 5. Confirm the fonts actually loaded

The single most common silent failure. Check the computed family on the headline and a mono label:

```js
getComputedStyle(document.querySelector('h1')).fontFamily        // must start with "Newsreader"
document.fonts.check('48px "Newsreader"')                        // true
document.fonts.check('12px "JetBrains Mono"')                    // true
```

If it fell back to Georgia/Times, the inlined `@font-face` did not apply - re-check the marker was
replaced and the base64 is intact.

## 6. Check for overflow / clipping / overlap

- No horizontal page scroll (`documentElement.scrollWidth === clientWidth`), except the ticker rail
  which is intentionally `overflow:hidden` and may clip at the edge.
- No element past the page's right/bottom edge (other than the ticker).
- No label sitting on top of a fill where they share a colour (the "12%"→"2%" bug) - gap labels live
  fully inside the empty part of the track.

## 7. Delegate the render when you can

If you have subagents, hand the render+measure to a verifier and give it the exact checks above (height,
computed font-family, overflow list, and a screenshot read). Have it confirm it is looking at the
current version (the cache-bust) before trusting its numbers. Iterate until height <= 1123, fonts load,
and nothing clips.

## 8. Print / publish

`@page { size: A4 }` and print colour-adjust are already in the template. For a PDF, headless-Chrome
print the served URL. To publish as an Artifact, the inlined fonts already satisfy the strict CSP - just
pass the file.
