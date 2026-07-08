# Charting a finding honestly

Read this before you draw any chart. These rules came out of real iterations where the first instinct
was wrong. The through-line: **the chart must be honest and legible at a glance, and it must not
overclaim.** A misleading-but-pretty chart is worse than a plain one, because polish makes a claim feel
more true.

## What to compare (and what not to)

- **Do not compare counts of "passed", "successful", or "completed" items.** Pass/fail is too
  black-and-white: a task that "failed" may be a few tweaks from passing, so counting successes
  overstates the difference and picks a fight the data cannot back. Reach instead for a graded /
  partial-credit score, a **rate** ($ per unit, seconds per unit, tokens per unit), or a **proportion**.
- **Prefer the metric that is defensible under scrutiny.** If someone fact-checks the graphic, the
  number should hold. Cost-per-unit and graded scores survive; "we did more" invites "more of what?".
- **State the honest conclusion even when it complicates the headline.** If a thing wins overall only
  because of how the sample is weighted, say so somewhere (a footnote, the methodology line). Diolog's
  credibility is the asset.

## How to draw a proportion comparison

You are usually showing "B is a bit cheaper / smaller / faster than A". The right form:

- **Equal-length tracks, different fills.** Give each option a full-width track (same length = the
  shared axis), and fill it to its value: A fills 100%, B fills its proportion (e.g. 87.6%). The tracks
  being equal is what makes the fills comparable; two free-floating bars of different lengths with no
  common track read as sloppy and hide the scale.
- Put the value **inside** the fill (a serif numeral), and label the remaining gap with what it means
  (e.g. "12% less") in a colour that contrasts against **both** the fill and the empty track - if the
  gap label sits over the fill edge and shares the fill's colour, its first glyph vanishes (a real bug
  that turned "12%" into "2%"). Use a pale tint, keep it fully inside the gap.
- The big focal numeral above the chart carries the punch (the "12%"); the bars show where it lives.

## How to show a per-category ranking ("x vs y")

When you rank two options across a few categories (backend vs frontend vs …), show **both numbers per
row**, not a one-word "A wins":

- Format each row as `<a> vs <b>` with both values visible.
- Style the winner: **bold + `--ok` green**; the other in `--danger` red. Colour is paired with the
  number's position and boldness, so it is not colour-alone.
- This is more honest than a green/red dot that hides the actual scores, and it lets the reader see when
  a "win" is really a wash (close numbers) versus a real gap.

## Composition

- **One focal chart.** The hero holds it. Supporting numbers in the columns are quieter - smaller, no
  heavy fills, fewer ticks. Resist turning the page into a dashboard of equal widgets.
- **Semantic colour needs a second signal** (dot, sign, label) - 8% of men are red/green colourblind and
  print/grayscale happens.
- **Numbers use tabular figures** (`font-variant-numeric:tabular-nums`) so columns align.
- **Annotate what the reader cannot infer** - the unit, the baseline, the "same budget" assumption.
