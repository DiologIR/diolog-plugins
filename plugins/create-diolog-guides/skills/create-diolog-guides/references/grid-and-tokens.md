# Step 0: the design layer, before any page exists

Twenty pages of ad-hoc spacing is not a design. It is twenty accidents that happen to share a font.

Every layout defect in the guide that motivated this skill traced to the same root: **no spacing
scale and no column grid existed**, so every margin, gap, and column width was invented at the moment
it was needed. Rebuilding the whole design layer on a real grid took about twenty minutes once the
tokens existed. Finding and patching the symptoms one at a time had already taken hours.

Write this token block first. Do not open a page.

## The tokens

```css
:root {
  /* Spacing scale. Every margin, padding and gap in the document comes from here. */
  --s0: 2px;    /* the ONE documented half-step: tabular density. Justify it or delete it. */
  --s1: 4px;  --s2: 8px;   --s3: 12px;  --s4: 16px;
  --s5: 24px; --s6: 32px;  --s7: 48px;  --s8: 64px;

  /* Column grid */
  --colnum: 88px;   /* the margin column: display numerals hang here */
  --gut: 24px;      /* gutter between margin column and text column */

  /* Optical nudges, measured from ink (see below). Never guessed. */
  --numnudge: 2.74px;
  --bandnudge: 2.57px;

  /* Type: sized for print first */
  --serif: "Newsreader", Georgia, serif;
  --sans:  "Inter", system-ui, sans-serif;
  --mono:  "JetBrains Mono", ui-monospace, monospace;

  /* Motion (see motion-layer.md) */
  --ease-out: cubic-bezier(.22,.61,.36,1);
  --dur-micro: 200ms;  --dur-reveal: 650ms;  --stagger: 70ms;
}
```

`guide-qa.mjs` reports every margin, padding, and gap that is not on `spacingScale` in
`qa.config.json`. Keep the two in sync. If you need a value that is not on the scale, either the
scale is wrong (change it, deliberately, once) or the value is wrong (much more likely).

## The page

A4 at 96dpi is **794 x 1123px**. One `.page` per sheet:

```css
@page { size: A4; margin: 0 }
.page { width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; position: relative }
.inner { padding: 16mm 18mm 0 }     /* ONE value, every page. This is the baseline. */
```

**The baseline is a promise.** The first content element on page 2 starts at the same `y` as the
first on page 19. A single `padding-top` override on one page (`.essay { padding-top: 6mm }`) puts its
content 37px above every other page's, and nobody can say why the document feels loose. `guide-qa.mjs`
calls it `baseline-drift` and it is HIGH.

**`overflow:hidden` on `.page` hides the page's own overflow.** A page-height check therefore passes
with total confidence while content collides at the bottom of the sheet. Always also measure
`inner.scrollHeight - inner.clientHeight` and the gap to the running footer. `page-fit.mjs` does both.

## Size the column to the glyph, not the other way round

The margin column holds display numerals. Size `--colnum` to the **widest glyph run you will ever put
in it, at its real font size**. Get it wrong and a 64px `01` renders 73px wide, overflows a 62px
column, and you "fix" it by shrinking the type - which is how a document ends up with three sizes of
the same numeral.

And on those numerals:

```css
.qnum { line-height: 1; text-align: right; transform: translateY(var(--numnudge)) }
```

- **`line-height: 1`**, never `.8`. Below ~0.95 the box is shorter than the glyph, so centring and
  vertical alignment lie about where the ink is.
- **`text-align: right`** on every glyph in the margin column. This is what makes the optical gutter
  constant. Left-align them and a `9` sits 40px further from its text than a `28` does, on the same
  page, and the eye reads the numerals as stranded. `guide-qa.mjs` calls it `optical-gutter`.
- **`transform: translateY()`** for the optical nudge, never `margin`. A transform does not disturb
  the box model, so it cannot knock a value off the spacing scale.

## Measure ink, not boxes

`getBoundingClientRect()` returns the box. The glyph sits somewhere inside it, and where depends on
`line-height`, the font's metrics, and the character. Aligning boxes does not align what a reader
sees.

```js
// cap-height of the first line, in viewport coords
const probe = document.createElement('span');
probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
el.insertBefore(probe, el.firstChild);
const baselineY = probe.getBoundingClientRect().top;
probe.remove();
ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
const inkTop = baselineY - ctx.measureText(el.textContent.trim()).actualBoundingBoxAscent;
```

Derive `--numnudge` from that measurement once, at the real font size, and freeze it. Never eyeball
an optical nudge; you will be wrong by 2-3px, which is exactly the range in which a reader senses
something is off but cannot say what.

Two traps when you measure this from the DOM:

- **`text-transform: uppercase` means the DOM text is not the rendered text.** A chip whose markup is
  `Strategy` renders `STRATEGY`, and `measureText("Strategy")` measures descenders (the `g`) that the
  reader never sees. Uppercase the string yourself before measuring, or scan the rendered glyphs.
- **`getComputedStyle` metrics differ between font families**, so a numeric probe that looks right for
  Newsreader can be 2px wrong for JetBrains Mono. When the numbers fight you, stop probing and crop the
  component at high zoom - the pixels are the ground truth, and this is a case where looking beats
  measuring.

## A larger initial beside smaller text: optically centre, do not baseline-align

When a **larger** glyph shares a line with **smaller** text - a serif family initial before a mono
label, a drop-cap, a big figure before a caption - baseline alignment makes the larger glyph's cap
stick up above the smaller cap while their feet share the baseline. On a thin-topped letter (`A`,
apex) the eye forgives it; on a heavy-topped one (`B E F`) or a round one that overshoots (`C`) it
reads as the letter riding high. Optically centre instead: nudge the larger glyph **down** by roughly
half its cap-height surplus, with `transform: translateY()`, so the extra height splits evenly above
and below the smaller cap band.

```css
.fchip b { font-size: 10pt; transform: translateY(1px) }   /* 10pt serif initial, centred on 8.25pt mono caps */
```

**`guide-qa.mjs`'s `cap-misalign` will NOT catch this**, and that is the point worth remembering: that
rule only checks the same-role margin-column pairs listed in `qa.config.json` (`.qnum` vs `.qq`, etc.).
A *decorative* mixed-size initial is a pair the gate was never told about, so the gate passes 0/0/0
while the chip is visibly off. It is a live example of the skill's own thesis - a gate sees only the
defects it was configured for - and it is why decorative initials get a deliberate eyes-on pass, not a
green exit code. If a component like this recurs, add its pair to `qa.config.json` so the next one is
covered.

## A full-bleed band must bleed by its own padding

A band with `padding: var(--s5)` inset by that padding puts its interior **off the page grid**: its
display letter no longer sits on the numeral column, its eyebrow no longer sits on the text column.
Bleed it back out:

```css
.secband {
  padding: var(--s5);
  margin: 0 calc(-1 * var(--s5)) var(--s6);     /* bleed by exactly its own padding */
  display: grid; grid-template-columns: var(--colnum) 1fr; gap: var(--gut);
}
```

Now the band's interior lands on the same two columns as the content below it. `guide-qa.mjs` asserts
this directly (`column-misalign`): it compares the band letter's left edge to the page's first numeral,
and the band eyebrow's to the first title. If the grid does not actually hold, it is HIGH.

## Do not stretch to fill

The single most common failure this system produces is an **under-full page stretched to look full**.
The wrong instinct is `flex:1` plus `justify-content:space-between`, or `margin-top:auto` on the last
panel. Big arbitrary voids open between blocks, the rhythm dies, and the eye falls through the holes.

- **Anchor to the top.** A page 60% full and top-anchored looks intentional. The same content
  stretched to 100% looks broken. Let the bottom breathe.
- **Fill honestly, or not at all.** Composition and correctly-sized type: a real pull-quote, a
  supporting product slice, a lead-in standfirst. Never even gaps. Never invented copy or stats.
- **One rhythm per page, and the same rhythm on every page.** Uniform inter-block spacing across a set
  is what makes a multi-page document feel designed rather than assembled.
- **Type sized for the medium, not to fit.** Set body to its readable print size (11-12.5pt) first,
  then solve fit by trimming or composition. Never shrink type to buy whitespace, never grow it to
  plug a hole.

`guide-qa.mjs` reports any margin over `maxVoidPx` (48px default) as `stretch-void`.

## Scope your CSS to the component that owns it

A page-level rule must never reach inside a self-contained component. Three real bugs, all invisible
in both the source and the screenshot, because the rule and the markup each looked correct alone:

- `.q { padding: 26px 0; border-top: 1px solid }` also matched `<span class="q">` inside a search-field
  mock. **Fix:** name components distinctly (`.sq`), and never use one- to three-character class names
  for anything that is not a global atom.
- `.prose p { max-width: 68ch }` clamped a caption inside a card to 555px in a 606px box; the caption,
  centred inside the *clamped* box, sat 24px off-centre. **Fix:** `.prose > p`. Child combinators are
  the cheapest scope you can buy.
- `.slice .st { margin: 0 0 10px }` was dead for its own component and still reached `.statuscard .st`
  nested inside it, contributing 10px of phantom height. **Fix:** delete dead rules, and note that
  dead-for-its-own-purpose is not the same as harmless.

`scope-lint.mjs` finds all three with one test: **does a component boundary sit strictly between the
selector's head and the element it matched?**
