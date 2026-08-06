# Rendering traps

Every entry here cost a real, shipped bug on the pages this skill is derived from. None of
them is visible by reading the source: each needs a render, a computed-style probe, or a print
preview to catch. That is why they are written down rather than left to care.

## Styled spans in a stacked layout need `display:block`

The single most repeated defect. A component puts several `<span>`s inside a container and
styles each one, expecting them to stack. Spans are inline, so they run together into one
paragraph, and every carefully-set `margin-top` collapses to nothing.

```css
/* the parts of a stacked component declare their own box */
.tooltip > span{display:block}
```

It shipped three times on one page before the pattern was noticed: a list row's date and
title, a video card's category and title, and a chart tooltip's date, price, volume and
caption. If you write `.thing .part{font-size:…}` and expect `.part` on its own line, set
`display:block` in the same rule.

## An element+class selector beats your component class

```css
.band p{font-size:17px; line-height:1.65; color:var(--muted)}   /* 0,1,1 */
.phone__h{font-size:16px; color:var(--ink)}                      /* 0,1,0 - loses */
```

A section-wide `p` rule silently repaints every paragraph inside every component nested in
that section. The symptom is a component that renders as body copy: oversized, airy, washed
out, looking like a zoomed webpage rather than the thing you drew.

Scope section typography to a class (`.band__lede`), not to the element. If a nested
component must be immune, give it its own `font-size`/`line-height` on a container and let
its children inherit.

## `<use>` clones into a shadow tree

`<use href="#icon">` copies the symbol into shadow DOM. Selectors from the light DOM do not
match inside it, so `.icon .part{fill:…}` never applies. Inherited properties *do* cross the
boundary, and custom properties are inherited:

```html
<symbol id="mark"><path fill="var(--mark-a)" …/><path fill="var(--mark-b)" …/></symbol>
```
```css
.mark{--mark-a:#0A1733; --mark-b:#1F3FA6}
.mark--on-dark{--mark-a:#E8EEF8; --mark-b:#6E8EF5}
```

## A non-square viewBox with a square box squashes

`width:1em; height:1em` on a `viewBox="0 0 264 243"` mark distorts it. Size one axis and let
the other follow the ratio: `height:1em; width:1.086em`.

## `preserveAspectRatio="none"` turns circles into ellipses

Convenient for stretching a chart path across a container, fatal for any marker on it. Keep
the default and make the viewBox track the rendered width instead, redrawing on resize:

```js
var w = Math.round(svg.getBoundingClientRect().width);
if (w > 0 && w !== W) { W = w; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); }
```

## `:last-child` and `:last-of-type` are not "the last one of these"

A list of `.row` divs followed by a composer div: `.row:last-child` never matches, because
the composer is last. `:last-of-type` matches the last *div*, which is also the composer.
The result is a stray divider under the final row. Put the separator between siblings
instead, where the question is unambiguous:

```css
.row + .row{border-top:1px solid var(--border)}
```

## Print drops your colour, and your override may lose

Two separate failures, both invisible until you render a PDF.

Backgrounds and fills are stripped by default. When colour carries meaning (a status chip, a
coverage bar, a confidential badge) the page must ask for it:

```css
@media print{ body{-webkit-print-color-adjust:exact; print-color-adjust:exact} }
```

And a print override has the same specificity as the rule it is overriding, so it only wins
if it comes **later in the stylesheet**. A `@media print` block near the top cannot repaint a
component defined at the bottom. Put print overrides last.

## `break-inside: avoid` on a whole section prints near-blank pages

Applied to a tall section, it pushes the entire thing to the next page and leaves most of the
current one empty. Scope it to units that genuinely fit on a page: a card, a row, a table
row, a callout. Pair with `break-after: avoid` on headings so a heading never ends a page.

## Default mono leading reads as a gap you did not set

A 9.5px monospace label under a 21px display name looked mis-spaced at a 2px margin, because
the label's own line box added leading above the glyphs. Set `line-height:1` on tight
lockups and let margin do the spacing you can actually see.

## Two exhaustive lists and one open instruction

When a review gives you a viewport list and a state list but leaves "craft" open-ended, the
lists get walked and the craft gets improvised. Enumerate the components too, then work the
enumeration. Coverage you cannot count is coverage you cannot trust.

## Verification claims are two sentences, never one

"The lint found nothing" and "the page is correct" are different claims with different
evidence. A gate proves a known, computable defect is absent. It cannot see the defect nobody
has met yet. Report them separately, and ask each capture *"what is wrong with this?"* rather
than *"is this done?"* - the same pixels answer those two questions differently.
