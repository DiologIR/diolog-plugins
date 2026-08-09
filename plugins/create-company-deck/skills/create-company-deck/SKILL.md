---
name: create-company-deck
description: >-
  Build a high-quality, self-contained HTML slide deck for a specific company
  from three inputs — its company overview, its DESIGN.md design tokens, and a
  source document or prompt — assembling slides from a bundled library of proven
  layout templates and generating photography with the media-gen-pro MCP. Use
  this whenever someone wants a deck, slides, a presentation, a pitch deck, a
  quarterly or results deck, an investor update, a board pack or a strategy deck
  built for a named company, especially when they hand over a company overview,
  a DESIGN.md or brand tokens, an announcement, a PDF or a brief and ask for
  slides from them — including phrasings like "make ACME a deck from this
  announcement", "turn this update into slides in their brand", "build the deck
  like we did for Alfabs but for this company", or "deck this document up".
  Prefer it over hand-rolling a deck whenever the company's own design system
  and overview exist, because it carries the layout templates, the theme
  generator, the figure and chart discipline a disclosure-derived deck needs,
  and the measured gates for four render failures that are invisible in a
  screenshot. When the overview or the DESIGN.md is missing it produces them
  first from the company's website via company-overview-from-website and
  design-md-from-website, so a company URL plus a source document is enough to
  start; it finishes by running design-review over the built deck. Not for a
  .pptx or an editable Office handoff (use deck-craft's lecturn JSON target),
  not for an investor portal page (create-investor-portal-free), and not for a
  deck with no brand and no source material, which is deck-craft's direction
  round.
---

# Create a company deck

You are turning three inputs into one self-contained HTML file: 1920×1080 slides
that scale to fit any window, in the company's own design system, every figure
traceable to a source document.

The speed comes from `assets/` — a shell and a library of slide layouts that are
already correct, so the work is content and judgement rather than CSS. The
quality comes from the disciplines below, each of which exists because something
shipped without it.

**Route away from here** when the ask is a `.pptx` or an editable Office handoff
(that is `deck-craft`'s lecturn JSON target), a scrolling web page rather than
slides (`design-craft`), or a deck for a company with no design system and no
source material — that last one needs `deck-craft`'s direction round first, and
you can come back here once a direction exists.

## How to work through this

Deliver the deck that was asked for, at the scope intended. Make the routine
judgement calls yourself and check in only where different readings would
produce materially different decks. There is one checkpoint in the pipeline — the
title sequence at step 3 — and it exists because a wrong storyline is expensive
to discover on slide twelve. Everything after it runs to completion.

**Build the slides yourself rather than delegating them.** Twelve slides looks
like twelve parallel tasks and is not: they share a type ramp, a footer, a rail
position and a running argument, and a fanned-out build produces twelve slides
that are individually fine and collectively a deck assembled by twelve different
people. Delegation earns its cost here in one situation — a genuinely separate
track such as researching an unfamiliar sector while you build — and one
subagent covers it. Image generation and the gates are tool calls, not agents.

**Match written length to the surface.** Slide copy is capped by its layout, so
when text does not fit, cut the text rather than shrinking type or moving a rail.
The closing report is the three-line shape in step 9, not a narrative of the
build. If you write any accompanying document, cover the substance and skip the
filler sections — a recap of what you just did, a restated plan, a closing
reflection.


## Inputs, and what each is authority for

| Input | Authority over | Never |
|---|---|---|
| Company overview (markdown, often a crawled site) | who the company is: legal name, ticker, divisions, sites, leadership, its own About paragraph, contact | any figure about the period |
| Source document or prompt (announcement, PDF, brief, notes) | every number, date, status and quotation | who the company is |
| `DESIGN.md` / brand tokens | every colour, size, radius, space | content |

Only the source document is irreplaceable. The other two describe a company that
has a website, so a missing one is an input to go and produce rather than a
reason to guess or to stop.

## 0 · Assemble the missing inputs

Do this before anything else, because both later phases read these files as
records rather than as drafts.

**No company overview** → invoke `company-overview-from-website` with the
company's URL. It crawls the site and emits `<COMPANY>-Company-Overview.md` in
the contract the Diolog portal generator already reads — legal name anchored to
the domain, ticker with its exchange prefix, business sections, leadership,
documents, images with real alt text. That contract is why the file is usable
here without re-reading the whole site: it is the same artifact, not a similar
one. Budget under ten minutes; past that it is rewriting what the site says.

**No `DESIGN.md`** → invoke `design-md-from-website` with the same URL. It drives
a browser and reads **computed CSS**, so the palette and type are correct by
construction. This matters more for a deck than for most surfaces: a guessed
brand colour is the most visible failure a branded deck has and no gate in this
skill will catch it, because the deck is internally consistent around the wrong
red. Screenshot-based extraction is the fallback only when no URL exists.

**No `DESIGN.md` and no URL** — the company has no measurable design system, so
run `deck-craft`'s direction round (`references/visual-craft.md` §2) to commit a
direction, and record it in the shell's FORM block as an authored direction
rather than a supplied system. That is the one case where this skill hands the
aesthetic decision back to `deck-craft`.

**No source document and no prompt** is the genuine block. Ask for it — there is
nothing to build a deck about.

If the company already has a deck built this way, use it as the template in
preference to the library. Matching the last deck is brand work.

## 1 · Ground

Read `references/grounding.md`.

Read the overview once and write a short **facts card** — legal name, ticker,
divisions, sites, leadership, the About paragraph verbatim, contact and registry
details. A crawled overview runs to thousands of lines; carrying it around costs
context on every later step, and the card is what you actually use. It also
grounds the image prompts, which is the difference between a photograph of this
company's world and a stock photograph of the sector.

Read the source document and write a **figure ledger**: every number that will
appear in the deck and where in the source it comes from. A number not in the
ledger does not appear in the deck.

Decide **reading deck or speaking deck** now — a portal-hosted deck must survive
alone and carries more text; a speaker-led deck carries large figures and short
headlines with the argument in the notes. Building the wrong one is the most
common deck failure there is, and it cannot be fixed by editing.

## 2 · Theme

Read `references/theming.md`.

```bash
python3 scripts/theme_from_design.py DESIGN.md --report    # read the fallbacks
python3 scripts/theme_from_design.py DESIGN.md > build/theme.css
```

The type ramp is derived from the system's own body size by a single ratio, so
the relationships between its steps survive onto a 1920px stage. Read the
fallback list and decide each one — typically only `--brand-on-dark` and
`--on-dark-body`, which web systems have no reason to define.

Copy `assets/deck-shell.html` to `build/shell.html` and fill its head: the
title, meta description, font links, storage key, and the **direction
contract** — THESIS, OWN-WORLD, STORY, COVER, FORM as an HTML comment. When a
complete design system was supplied, FORM says so; there is no direction round.
A direction that lives only in conversation drifts by slide 9.

## 3 · Storyline

Write the title sequence first. Someone reading only the titles, in order,
should follow the whole argument. Hold one grammatical style throughout — topic
noun-phrases *or* declarative action titles, never both.

Then choose a template per title from the table in
`references/template-library.md`. One idea per slide; if a slide is carrying two
claims, split it and say you did.

Show the user the title sequence and the chosen templates before building. This
is the pipeline's one checkpoint: a wrong storyline is cheap to fix here and
expensive to discover on slide twelve. Once it lands, build the rest through.

## 4 · Fill

Copy each chosen template from `assets/slides/` into `build/sNN.html` and fill
its `{{SLOTS}}`. Each file's header comment says what it is for and what breaks
if you change its structure.

Write repeated elements out literally — three `<li>`s in the markup, every table
row typed. The repetition is what makes the file editable afterwards by anyone,
including the user.

Every size, colour and space is a token. A `31px` beside a `29px` body is a
near-miss, and near-misses read as almost-right, which is worse than a clear
difference and is the clearest signal of a deck assembled slide by slide.

The chart rules in `references/grounding.md` are not stylistic on a
disclosure-derived deck: zero-based axes, the caption saying so, the delta in
text when the geometry cannot show it, and the unflattering series shown at the
same weight as the flattering one.

## 5 · Imagery

Read `references/imagery.md`.

Generate with `mcp__media-gen-pro__generate_image`, passing an existing image as
`referenceImages` so all of them share one grade. Prose prompts, front-loaded,
grounded in the facts card. Never a portrait of a real named person — use
`credential-cards` instead. Look at every image before placing it. Compress with
`scripts/optimise_images.sh` before shipping, and disclose generated photography
in the back matter.

## 6 · Build

```bash
python3 scripts/build_deck.py \
  --shell build/shell.html --theme build/theme.css \
  --slides build/s01.html build/s02.html build/s03.html … \
  -o public/deck.html
```

Slide order is the argument order. Ids, screen labels and footer page numbers
are all rewritten from it on every build, so inserting a slide costs nothing and
the numbering cannot go stale. The build refuses while any `{{SLOT}}` remains,
because an unfilled placeholder ships silently.

## 7 · Gate

Read `references/gates.md`.

```bash
python3 -m http.server 8000 --directory public     # never file://
./scripts/run_gates.sh http://localhost:8000/deck.html
```

Five viewports, because a defect invisible at one window size clips a quarter of
every slide at another. The script checks placement, overflow, footer collision,
paint order, CSS contrast and token drift, and prints every count with its
denominator.

Two things it cannot do, and you must:

- **Text over a photograph** is reported as `contrastDeferred`, not scored. CSS
  cannot resolve a backdrop painted by an absolutely-positioned sibling — the
  method reports 1.08:1 where the pixels are 17:1. Measure those from a
  screenshot, median luminance of the line box.
- **The printed PDF.** Open page 1, a middle photo-bearing slide, and the last
  one. A 12-page PDF whose page 1 composites all twelve slides still counts
  twelve pages.

Then read the finished deck against the direction contract promise by promise,
and remove one element the deck does not need.

## 8 · Review

Invoke `design-review` on the served deck before calling it done, and resolve
what it returns.

Step 7's gates are deterministic: they prove that four known defects have not
returned. They cannot find the defect nobody has met yet, and they say nothing
about whether slide 6's hierarchy works, whether the eye lands where the argument
needs it to, or whether the deck reads as one designed object. `design-review`'s
judged passes are where those live, and its worklist mechanism is what makes the
review finishable — every slide is a row, every stage a column, and
`worklist.py check` exits non-zero while any cell is open, so a partial review
stops being indistinguishable from a complete one. The reference deck went
through 13 surfaces × 7 stages, and several of this skill's bundled gates are
findings from that run, promoted into code.

Give it the deck's URL and its slide count as the surface list. It reviews rather
than fixes, so apply the findings yourself, then re-run step 7's gates over the
changes — a fix for a craft finding is exactly the kind of edit that reintroduces
a layout defect.

This is the one place in the pipeline where fan-out is appropriate: the review
skill runs its own passes, and the delegation cap above is about building slides,
not about reviewing them.

Also read `deck-craft`'s `references/deck-review.md` for the deck-specific
delivery pass — the per-slide gate and the audit of the finished deck against its
direction contract. It is the deck dialect of the same discipline and it is
shorter than repeating it here.

## 9 · Report

Three claims, kept apart:

```
Gates:       what the script asserted, each with its denominator
Reviewed:    design-review's coverage — surfaces × stages, and what it found
Not checked: never empty
```

`failures: 0` is not a result; `examined: 41, failures: 0` is. If "not checked"
looks empty, you have confused the scope of your checks with the scope of the
artifact — the browsers you didn't test, the screen-reader output, the mobile
reading experience all belong there.

## What goes wrong, when it goes wrong

Four failures in this family are invisible in a screenshot, and all four are
already handled in `assets/` — so the way to meet them is by editing the shell
or a template without reading its comments.

1. **A grid- or flex-centred stage is not centred** when it is wider than its
   container: CSS start-aligns the oversized item, and scaling about its own
   centre then throws half the overflow off one edge. Explicit half-size margins.
2. **`position: static` on the stage in print** removes it as the containing
   block, and every slide's photograph and footer piles onto page 1 while pages
   2+ look perfect. `relative`, with `top`/`left`/`margin` reset.
3. **An `inset: 0` photograph paints above static siblings**, so a copy wrapper
   without `position: relative` loses the entire text of the slide while its
   layout stays perfect.
4. **The wrapper-collapse guard stretches pinned chrome**: `height: 100%` on a
   footer pinned at `bottom: 44px` makes a 1080px box growing upward with its
   content along the slide's top edge. Absolute positioning alone does not save
   it — it has to leave the selector.

## Reference files

| File | Read it |
|---|---|
| `references/grounding.md` | before writing any slide — the three authorities, the figure ledger, chart and status rules, reading vs speaking |
| `references/theming.md` | at step 2 — generating tokens, the one-ratio type ramp, drift, citing a deviation |
| `references/template-library.md` | at step 3 — the catalogue, choosing a sequence, filling and extending safely |
| `references/imagery.md` | before generating anything — prompts, the grade lock, the three non-negotiables, compression |
| `references/gates.md` | at step 7 — why each gate exists, the contrast caveat, proving a gate can fail |

## Skills this composes with

| Skill | When |
|---|---|
| `company-overview-from-website` | step 0, when no overview was supplied and the company has a site |
| `design-md-from-website` | step 0, when no `DESIGN.md` was supplied — measured computed CSS, not a guessed hex |
| `deck-craft` | step 0 for its direction round when there is no design system to measure; step 8 for `references/deck-review.md`; and as the destination whenever the ask turns out to be a `.pptx` |
| `design-review` | step 8, on the served deck, before calling it done |
| `mcp__media-gen-pro__generate_image` | step 5 — a tool, not a skill |
| `playwright-cli` | step 7 — `run_gates.sh` drives it; the gates do not run without it |

