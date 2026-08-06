---
name: create-disclosure-consistency-page
description: >-
  Turn a Diolog web-app disclosure-consistency report into a standalone, on-brand HTML artifact
  a Disclosure Committee can read, print and circulate before an announcement is released.
  Takes the saved HTML of the app's consistency-check page plus the subject company's DESIGN.md
  and produces one self-contained file: decision first, the items to resolve, an honest coverage
  bar, every tested statement, the supporting record and the anticipated questions. Use this
  whenever someone hands over a disclosure consistency report, a consistency check, a
  pre-release disclosure audit or an "AI compliance check" and wants it as a shareable or
  printable page, wants the app's report turned into a document, wants the Alfabs consistency
  audit rebuilt for another company or another quarter, or asks for a consistency report
  restyled in a company's brand - even if they only say "make this report look good" or "turn
  this export into something I can send the board". Treats the app HTML as the sole source of
  truth and invents nothing: no report IDs, owners, due dates or attributions the source does
  not carry. Reframes the app's misleading pass-rate as checked-versus-not-checked coverage,
  because a statement nobody could check has not been found inconsistent. Not for building an
  investor portal (use create-investor-portal-free) or for running the consistency analysis
  itself.
---

# Create a disclosure consistency page

The app's report is a working surface: tabs, filter chips, acknowledge buttons, a left rail of
workspace navigation. What a Disclosure Committee needs is a document, and what a prospect
should see is a piece of work that reads as considered rather than exported.

Your job is to restructure that report around the decision it supports, in the subject
company's design tokens, while inventing nothing.

## The two rules that matter most

**The app HTML is the sole source of truth.** Every figure, quotation, date, status, count and
name in your output traces to it. This is a compliance artifact about a pre-release
announcement: a fabricated detail in it is worse than a missing one, and a reader has no way to
tell which is which.

Things that get invented if you are not deliberate, each of which was caught in review of a
real build: report IDs, `Owner` and `Blocks release` metadata, "corroborated statement 07"
attributions, "indexed set as at" framing, and timing labels on the next steps. None of it
appeared in the source. If the source does not say it, the page does not either.

**Restructure freely; that is the work.** Section order, headings, grouping, chip design,
progressive disclosure and copy that carries the source's meaning in plainer words are all
yours. The constraint is on facts, not on form.

## Read as you go

- `references/report-structure.md` - the section order and what each carries
- `references/source-audit.md` - how to extract the source and prove both directions
- `references/rendering-traps.md` - defects that survive a source read
- `references/build-and-validate.md` - the companion skills to load, and the round-based
  validation loop that closes the build

## Inputs

1. **The saved app HTML** of the consistency report.
2. **The subject company's DESIGN.md** for tokens. Without one, `design-md-from-website` builds
   it from a live site.
3. **Whether this is confidential and pre-release.** It usually is, and it changes the masthead
   badge and the footer line. Ask rather than assume.

## Build

### 1. Extract the source to text first

Strip scripts, styles and SVG, then reduce tags to newlines. You are looking for: the target
document and the comparison documents with their dates and sizes, the headline metrics, the
executive analysis, the key findings, the detected inconsistencies with their severity and
category, every verification-matrix row with status and severity, the semantic-drift items, the
forward-looking statements, the track record, the anticipated questions, and the next steps.

`references/source-audit.md` has the extraction and the checks. Do this before writing markup:
working from the rendered app page rather than its text is how invented detail creeps in.

### 2. Fix the framing the app gets wrong

The app reports a **pass rate** - "17%, 3/18 statements". Carried over literally, that reads as
*the draft is 83% wrong*. It is not what it means. Most of those statements were never checked
against anything, because the documents needed to check them were not indexed.

Replace it with a coverage bar that shows the three outcomes at their true proportions:

```
checked and consistent  |  checked and inconsistent  |  not checked
```

Hatch the not-checked segment rather than filling it: a solid grey block reads as a measured
result, and hatching reads as absence of data, which is what it is. State the point in words
directly under it:

> Not checked is not a finding against the draft. It means nothing was indexed to check it
> against.

Keep the app's own metrics as well, including the pass rate and confidence score, in an
executive-analysis strip. They are in the source, so removing them would be its own distortion.
The coverage bar is the honest headline; the metrics are the record.

### 3. Lead with the decision

The report opens on a verdict panel: what the reader must do, the items blocking release as
links, and the coverage bar. Everything after it is evidence for that panel.

The app orders findings by its own analysis categories. Order yours by what a person has to
act on, then by what is kept for the file. `report-structure.md` has the sections.

### 4. Give recurring items one identity

A single issue usually surfaces in four places: a detected inconsistency, a matrix row, a
drift entry, and an anticipated question. Left unlabelled, a reader counts four problems.

Give it a stable ID, show that ID everywhere it appears, and on the item itself list the other
surfaces. This is the difference between "there are two things to fix" and "there are eleven
findings", and only one of those is true.

Do this here even though the portal skill forbids it: a Disclosure Committee cross-references
between sections, and the IDs are working apparatus for exactly that.

### 5. Separate status from severity

Fourteen rows reading `NOT CHECKED · MEDIUM` in one grey pill is a wall in which the single
HIGH is invisible. Status and severity answer different questions and want different
treatments: a neutral pill for status, a coloured mono word for severity.

### 6. Print is a first-class output

This gets circulated as a PDF. Read the print notes in `rendering-traps.md` - colour is
stripped unless the page asks for it, `break-inside: avoid` on whole sections produces
near-blank pages, and a print override only wins if it sits after the rule it overrides. Force
every `<details>` open for print and restore state after.

Render the PDF and open the first pages. A badge that is legible on a dark masthead can print
as one colour on itself.

### 7. Verify in rounds, with the companion skills

Read `references/build-and-validate.md` and follow it. In short: `design-craft` before you draw,
and its deterministic lint at the start of every round; `ux-craft` before the disclosure widgets
and the AI-summary panel, since this page presents AI output to a reader making a compliance
decision; then `design-review` across all of its stages on the finished page.

Run the review's fix loop to convergence rather than once: lint, capture, look, fix the whole
batch, recapture, and score each previous finding as resolved, partial or unresolved against
what the new capture actually shows. Stop when a round resolves nothing.

Serve over HTTP. Capture 375, 768, 1280, 1920 and the PDF in one batched round, and open every
capture asking *"what is wrong with this?"* rather than *"is this done?"*. Run the overflow
probe rather than trusting the eye.

## Voice

The subject company's tokens carry the page; Diolog appears only as a footer credit with its
droplet mark and lowercase wordmark.

Write the prose plainly and in Australian English, with no em or en dashes. The app's own
language is often clause-heavy compliance register; you may say the same fact in fewer words,
but you may not say a different fact. When compressing, check the shortened sentence against
the source rather than against your memory of it.

Two framings worth keeping consistent throughout, because they are the report's actual
meaning: **not checked is not a finding**, and **a semantic drift is not a contradiction**.
