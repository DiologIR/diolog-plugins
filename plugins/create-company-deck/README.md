# create-company-deck

Turn a company overview, a `DESIGN.md`, and a source document into a
self-contained HTML deck in that company's own design system — 1920×1080 slides
that scale to any window, every figure traceable, photography generated through
media-gen-pro.

```
/create-company-deck
```

## What it is for

A deck for a *named company*, built from *their* brand and *a* source document.
That case has a fixed shape, and the shape is what makes it fast: there is no
direction round when the design system is supplied, no layout invention when the
library already covers the slide, and no numbering by hand when the build script
derives it.

Route elsewhere for a `.pptx` handoff (`deck-craft` → lecturn JSON), a scrolling
web page (`design-craft`), an investor portal (`create-investor-portal-free`), or
a deck with no brand and no source (`deck-craft`'s direction round first).

## The three inputs

| Input | Authority over |
|---|---|
| Company overview | who the company is — name, ticker, divisions, sites, leadership, its own About paragraph |
| Source document or prompt | every number, date, status and quotation |
| `DESIGN.md` / tokens | every colour, size, radius and space |

Crossing those is the failure no craft recovers, because the deck looks right and
says something the company did not say.

Only the source document is irreplaceable. A missing overview is crawled from the
company's site with `company-overview-from-website`; a missing `DESIGN.md` is
measured off the same site with `design-md-from-website`, which reads computed
CSS rather than guessing a hex from a screenshot. A company URL plus a source
document is enough to start.

## What it composes with

`company-overview-from-website` and `design-md-from-website` supply the missing
inputs. `deck-craft` owns the craft layer — its direction round when there is no
design system to measure, its `deck-review.md` for the delivery pass, and its
lecturn JSON target when the ask is really a `.pptx`. `design-review` runs over
the built deck before it is called done: the bundled gates prove four known
defects have not returned, and cannot see the ones nobody has met yet.
`media-gen-pro` generates the photography; `playwright-cli` drives the gates.


## What's bundled

- **`assets/deck-shell.html`** — the scaling shell: fixed stage, keyboard and
  click navigation, auto-retiring controls in their own reserved band, a print
  block that un-stacks to one slide per landscape page, and the full component
  CSS the templates draw on.
- **`assets/slides/*.html`** — fifteen layouts (covers, stat row, list + quotes,
  the mirrored chart/photo pair, two table styles, cost-against-benefit, copy +
  chart, credential cards, section break, agenda, statement, back matter), each
  with a header comment saying what it is for and what breaks if you change it.
- **`assets/reference-build.html`** — a complete 12-slide deck that shipped, as a
  worked example.
- **`scripts/theme_from_design.py`** — `DESIGN.md` → the deck's `:root` block.
  Maps palette roles by synonym, derives the deck type ramp from the system's own
  body size by one ratio, and reports every token that fell back so nothing
  silently defaults.
- **`scripts/build_deck.py`** — shell + theme + slides → one file, renumbering
  ids, screen labels and footer page numbers from slide order, and refusing to
  build while a `{{SLOT}}` is unfilled.
- **`scripts/gates.js` + `run_gates.sh`** — the measured gates, across five
  viewports, every count printed with its denominator.
- **`scripts/optimise_images.sh`** — 27 MB of generated photography → under 2 MB,
  originals kept.

## The four invisible failures it already handles

Each of these renders perfectly, passes overflow and contrast checks, and is
wrong. Each reached production at least once.

1. A grid- or flex-centred stage wider than its container is **start-aligned,
   not centred** — scaling then throws 120px of every slide off one edge.
2. `position: static` on the stage in print removes it as the containing block,
   and every slide's photograph and footer **piles onto page 1**.
3. An `inset: 0` photograph paints above static siblings, so a copy wrapper
   without `position: relative` **loses the entire text of the slide**.
4. The wrapper-collapse guard applies `height: 100%` to a pinned footer, making a
   1080px box that **renders its content along the top edge**.

## Provenance

Built from the session that produced and reviewed a shipped ASX quarterly deck,
and from the handover written out of it
(`~/Dev/dAIolog/docs/HANDOVER-2026-08-06-investor-surfaces.md`). The craft layer —
direction contracts, type and colour discipline, the review passes — lives in
`deck-craft`, which this skill assumes rather than repeats.
