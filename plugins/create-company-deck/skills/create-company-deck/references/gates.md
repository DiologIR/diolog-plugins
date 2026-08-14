# Gates, and the honest report

Two of the reference build's own checks were structurally incapable of failing.
Both looked like diligence, and one of them let a defect reach production that
clipped a quarter of every slide off the right edge of the window.

That is what this file is about: not the checks, which are scripted, but why
checks that pass mean nothing until you know they could have failed.

## Run them

```bash
python3 -m http.server 8000 --directory build     # serve, never file://
./scripts/run_gates.sh http://localhost:8000/deck.html
```

Five viewports, deliberately spanning wider and narrower than 16:9, because the
scale is bounded by whichever axis runs out first and a defect that is invisible
at 1280×1024 clips 120px at 1680×1050. Serve over HTTP: module scripts, fetches
and some fonts fail silently from a file URL, so a deck that "works locally"
from `file://` has not been tested.

The report covers placement, overflow, footer collision, paint order, a CSS
contrast pass, and a token census. What it deliberately does not cover is listed
at the end of its own output.

## Why each gate exists

**Placement, not ratio.** `getBoundingClientRect().width / .height === 1.778`
stayed true throughout the production defect, because the box was the right
*size* in the wrong *place*. Placement needs its own predicate: the four clip
distances against the band the stage is supposed to occupy, all of which must be
zero.

**Measured, not screenshotted.** An element capture — a `Page.captureScreenshot`
whose `clip` came from the stage's own `getBoundingClientRect()` — renders the
element's **own box**, so it is blind to
the entire class of defects about where that box sits — clipped past the window
edge, shifted off-centre, hidden under sticky chrome. A stage pushed 120px past
the right edge element-screenshots as a flawless slide, on every viewport, every
time. That is exactly how the defect reached production with all twelve slides
"verified". Element captures are for cropping a component you have already
located; they can never establish that the deck fits its window.

**Collision is not overflow.** "Nothing past the stage bounds" is silent about
content running *into* the footer, because the footer is inside those bounds.
One slide of the reference deck passed every overflow check while its closing
paragraph printed through the footer rule by 66px.

**Paint order needs `elementFromPoint`.** A copy wrapper missing `position:
relative` under a full-bleed photograph loses the entire text of the slide —
while its layout is perfect: real boxes, real sizes, correct fonts. Overflow,
collision, contrast and inventory checks all pass. One hit test is the only
thing that sees it.

## The contrast caveat, stated plainly

The script reports two populations and never merges them.

`contrastCSS` walks ancestors for a painted background. That method is simply
wrong wherever the visible backdrop is an **absolutely-positioned sibling** — a
scrim over a photograph, a colour band, a `::before` overlay. On the reference
build it reported white-on-near-white at **1.08:1** where the rendered pixels
were **17:1**.

So every node sitting over a `.photo` or `.scrim` is reported as
`contrastDeferred` instead of being scored wrongly. Measure those from pixels:
crop the text's line box out of a screenshot and take the **median** luminance,
because glyph ink is a minority of the box and the median is robust to
antialiasing and gives you what the reader actually sees behind the text.

```python
px = list(img.crop(box).getdata()); px.sort(key=luminance)
bg = px[len(px) // 2]                      # median = backdrop, not ink
```

The reference build finished with 0 real contrast failures across 200 text
nodes — a number that only meant something once the two populations were kept
apart.

## Prove a gate can fail before trusting it passing

The first gate sweep on the reference build filtered a contrast probe's output
on `x.fail` — a field the probe never sets. It returned **twelve clean surfaces
that meant nothing.**

- **Print the denominator.** `examined=41 failures=0` is a result; `failures=0`
  is not, and `examined=0` is a gate that never ran. Every summary line in
  `gates.js` carries its denominator for this reason.
- **Assert against the probe's actual return shape.** Log one raw record and
  read it before writing a filter over it.
- **Uniform zeros across many surfaces are the signature.** Real surfaces vary.
- **Break something on purpose the first time you write a gate** — not on every
  run, which buys nothing. Remove a `position: relative`, or set the stage to
  `left: 0`, and confirm the gate catches it. The bundled gates have been through
  this: the deliberate break reproduces `clip.R: 120` at 1680×1050, which is the
  production defect exactly. A gate you add yourself has not.

## Print is not a page count

A 12-page PDF whose page 1 composites twelve slides still counts twelve pages.
Open page 1, one photo-bearing slide from the middle, and the last, and confirm
each carries the right content, the right image and the right page number.

The signature of the containing-block collapse — the stage set to `position:
static` for print — is **page 1 rendering the last slide's photograph under the
last slide's footer**, with pages 2+ looking perfect. The shell uses `position:
relative` and resets `top`/`left`/`margin` instead, which is the fix.

## Report three claims separately

```
Gates:       0 placement · 0 overflow · 0 collision · 0 paint-order (3 probes/1 image slide)
             0 CSS contrast failures of 22 nodes · 3 deferred to pixel measurement
             7 distinct font sizes · 7 distinct text colours
Looked at:   12 slide captures at 1440 and 1920, cover and section breaks at 2x
Not checked: the PDF export, Safari and Firefox, screen-reader output
```

Line 1 is what a machine asserted, with its denominators. Line 2 is what *you*
assert, and it is true only for captures you actually opened. Line 3 is never
empty — if you think it is, you have confused the scope of your checks with the
scope of the artifact.

## The last pass is subtractive

Read the finished deck against the direction contract in its head comment,
promise by promise. Then remove one element the deck does not need. On the
reference build that was a redundant company-name chip on the cover.
