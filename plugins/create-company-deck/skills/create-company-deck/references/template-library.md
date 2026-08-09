# The template library

`assets/slides/` holds one file per layout. Each is a complete `<section
class="slide">` with `{{SLOT}}` placeholders and a header comment stating what
it is for and what will break if you change it.

Templates exist for speed and for safety in roughly equal measure. Speed,
because a deck assembled from proven layouts skips the slowest part of the
work — inventing and debugging a grid per slide. Safety, because four layout
failures in this family are invisible: the slide renders, its boxes are real,
its type is correct, and the content is gone or clipped. Those four are
already handled inside these files, and every one of them reached production
at least once before it was.

## Choosing the sequence

Pick the layouts from the story, not the story from the layouts. Write the
title sequence first — someone reading only the slide titles, in order, should
follow the whole argument — then choose a template per title.

| Job of the slide | Template |
|---|---|
| Open with the company's own world | `cover-photo` |
| Open with no honest photograph available | `cover-type` |
| Contents, on a deck of twelve or more | `agenda` |
| The period in four figures | `stat-row` |
| Commitments, pillars, strategy, with leadership voice | `list-quotes` |
| A division or segment: claim + chart + supporting points | `chart-photo` |
| The next division (mirrored, so the pair doesn't read as a repeat) | `photo-copy` |
| An inventory with a progress dimension | `data-table` |
| Progress against previously stated commitments | `status-table` |
| A change programme: what it cost against what it returns | `photo-list-compare` |
| Financial position: narrative + one chart | `copy-chart` |
| A person, an appointment, a capability | `credential-cards` |
| The hinge in a long deck | `section-break` |
| Outlook, or the one slide that should slow the reader down | `statement` |
| Contact, about, and every disclosure the deck owes | `back-matter` |

A 10–14 slide deck typically uses cover, stat-row, one list slide, two or three
divisional slides, one or two tables, a statement and back-matter. Reach past
that only when the content genuinely needs it.

**Alternate the mirrored pair.** `chart-photo` and `photo-copy` are the same
slide flipped. Two consecutive divisional reviews in the same orientation read
as one slide repeated; flipped, they read as a pair. Three in a row needs a
third treatment, not a third flip.

**One idea per slide.** If a slide is carrying two claims, split it and say so
rather than silently re-scoping the deck. The reference build went from 11
slides to 12 for exactly this reason.

## Filling a template

Copy the file into your build directory, fill the `{{SLOTS}}`, and let
`build_deck.py` handle numbering. It rewrites every `id`, `data-screen-label`
and footer page number from the slide's position in the argument list, so
inserting a slide in the middle costs nothing — and it refuses to build while
any `{{SLOT}}` remains, because an unfilled placeholder ships silently.

Three rules about how you fill them:

**Write every repeated element out literally.** Three `<li>`s in the markup,
not one generated from an array; every table row typed out. The repetition is
the point: it lets row two be edited without touching row one, by you or by
whoever opens the file next. A deck rendered from a JS array forces every later
tweak to round-trip through an agent.

**Keep each piece of text in its own leaf element.** The templates already do
this — `<span>` inside the heading rather than bare text mixed with a child
element. It is what makes the file directly editable.

**Author every slide in its final visible layout.** If the deck animates,
let the animation hide elements until their step rather than authoring them
hidden. Print, thumbnails and screenshots then all see the finished slide for
free; a slide authored in its pre-animation state exports as a blank.

## Extending the library

If the content needs a layout that isn't here, build it — but build it out of
the existing component classes (`.pad`, `.rule`, `.eyebrow`, `.title`,
`.bullets`, `.stat`, `.card`, `.chip`, `.chart`, `.foot`) and the type tokens,
and save the filled result back into `assets/slides/` if it is likely to recur.
Four constraints hold for any new layout:

1. **One in-flow wrapper per stage.** Every other top-level child is
   `position: absolute` *and* carries `.abs`, `.pinned` or `.foot` so it leaves
   the wrapper-collapse guard's selector. Positioning it absolutely is not
   enough on its own — the guard still applies `height: 100%`, which turns a
   footer pinned at `bottom: 44px` into a 1080px box growing upward with its
   content along the top edge of the slide.
2. **Copy over a full-bleed image needs `position: relative` on its wrapper.**
   An `inset: 0` photograph and its scrim paint above every static in-flow
   sibling whatever the source order. Miss it and the entire text of the slide
   is invisible while its layout stays perfect.
3. **Every size, colour and space is a token.** A `31px` beside a `29px` body is
   a near-miss, and near-misses are worse than clear differences: they read as
   almost-right and are the clearest signal of a deck assembled slide by slide.
4. **The footer sits at the same place on every slide.** When a layout needs the
   footer to stop short of a photo panel, give it an explicit width — don't move
   it.

## Shared rails drift when you tighten individual slides

The reference build's top rule measured 88px on four slides and 76, 72 and 68 on
others. Every deviation was a local fix for content that did not fit.

**Trim the content, not the rail.** A slide whose copy needs 20px more room is a
slide with 20px too much copy, and the reader sees the moved rail as sloppiness
long before they notice the extra sentence.
