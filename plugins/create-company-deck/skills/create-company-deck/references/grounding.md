# Grounding: the overview, the source, and the figures

Three inputs, and they are authorities over different things. Confusing them is
the failure that no amount of craft recovers, because the deck looks right and
says something the company did not say.

| Input | Authority over | Never the authority for |
|---|---|---|
| **Company overview** | who the company is — legal name, ticker, sector, divisions, sites, history, leadership, boilerplate About paragraph, contact and registry details | any figure about the period |
| **Source document or prompt** | every number, date, status and quotation in the deck | who the company is |
| **DESIGN.md** | every colour, type size, radius and space | content of any kind |

## Read the overview into a facts card first

A company overview is often a crawled site — the reference one ran 3,024 lines
across 40 pages. Do not carry it around. Read it once and write a short facts
card you can hold: legal name and short name, ticker and exchange, sector,
divisions and what each does, principal sites, founding, leadership names and
roles, the company's own About paragraph verbatim, registered office, contact,
website, identifiers.

That card fills the cover, the back matter, and — just as importantly — grounds
every image prompt. An image brief written from the overview shows the
company's actual world; one written from the sector shows a stock photograph of
somebody else's.

**Lift the About paragraph verbatim.** It is the company's own description of
itself, already approved. Rewriting it produces a subtly different company.

## Every figure traces to the source

Write a figure ledger before building slides: each number that will appear, and
where in the source document it comes from. A number that does not appear in the
ledger does not appear in the deck.

This matters more here than in ordinary work because a deck lends authority to
whatever it puts in large type. The reference build put twenty-odd figures on
twelve slides, and nothing else appeared — no computed ratios, no rounded
restatements, no "approximately" where the source gave a number.

Four rules that follow from it:

**Carry the audit status onto the cover.** When the source says its figures are
unaudited, that belongs on slide 1, not only in the back matter. It is the
source's own footnote and it changes how every later slide is read.

**Never invent precision the source doesn't have.** If the company publishes a
month, the deck shows a month. A day-level date invented for tidiness is a
fabricated fact about a real event.

**Restate rather than assume recall.** If slide 9 needs a figure from slide 3,
restate it. Nobody holds your numbers in working memory.

**A quotation is verbatim and attributed to whoever the source attributes it
to.** A paraphrase inside quotation marks is a fabricated quotation regardless
of how accurate it is.

## Charts: the compliance layer is the design layer

For a deck derived from a company disclosure, the chart rules are not stylistic.

**Never truncate a value axis on a comparison.** This is a defect, not a style
choice — and the awkward case is exactly the common one. The reference build's
quarterly moves were 76.2 → 80.7 → 81.4, and a zero-based axis makes them look
nearly flat. That flatness *is* the honest signal: "rates held and edged up" is
the actual claim. Resist the pull to truncate for drama.

**Say it on the slide.** Every chart carries "Axis begins at zero" in its
caption. One line, and it is the difference between a reader trusting the shape
and having to go and check.

**Put the delta in text, not in the geometry.** "+0.9% on the prior quarter and
7% on Q2 FY26" is where the movement lives when the bars can't show it.

**Build charts in code, never with an image model.** Image models garble numbers
and re-garble them on retry. The templates' charts are authored CSS: a fixed
plot box with bar heights as a percentage of a nominal max, so proportionality
from zero is structural rather than remembered.

CSS beats SVG here for a specific reason: SVG `<text>` sizes are attributes that
bypass the type scale, and a `viewBox` re-scales labels independently of the
deck's own scaling, so chart labels drift off the ramp. In CSS the labels are
real HTML on `--t-*` tokens and cannot.

**Show the point, not the dataset.** Cut every series and column that does not
support the slide's one claim.

**Show the unflattering series at the same weight.** The reference deck gave
Engineering's decline (15.4 → 11.6) the same chart treatment, the same axis
discipline and the same slide size as Mining's gain. A quarterly deck that
buries the soft division is the default; refusing that was the deck's thesis.

**Every chart carries an `aria-label` stating its values and the zero
baseline.** A CSS chart is an image to a screen reader, and the numbers must
survive that.

## Status is never encoded by colour alone

Every status chip carries a glyph and a word — `✓ Completed`, `→ On track` —
with colour as a second signal. About 8% of men have a colour-vision deficiency,
and a projector flattens the distinction for everyone else anyway.

## Reading deck or speaking deck

Decide this before writing a word, because it changes how much text every slide
carries, and getting it wrong is the most common deck failure there is.

A deck hosted on a portal or emailed as a link is a **reading deck**: it must
survive alone, so it carries more text and its own connective tissue. A deck
someone stands up and talks to is a **speaking deck**: large figures, short
headlines, the argument in the speaker notes.

A speaker-led deck built reading-style is a wall of text. A reading deck built
speaker-style is a stack of cryptic fragments. The tell is the destination, so
ask if it isn't obvious.

## Title sequence

Someone reading only the slide titles, in order, should follow the whole
argument. Pick one grammatical style — short topic noun-phrases, *or* brief
declarative action titles — and hold it for the whole deck. Mixing the two reads
as two decks stapled together. Noun-phrases are the safer register for a
disclosure-derived or board audience.
