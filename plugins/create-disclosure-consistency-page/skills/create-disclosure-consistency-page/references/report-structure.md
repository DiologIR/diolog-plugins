# Report structure

The app orders findings by its own analysis categories. This orders them by what the reader has
to do, then by what is kept for the file.

## Masthead

Company photography with a scrim, or the company's own dark ground. The ticker chip, a
confidentiality marker if the source's language supports one, the title, a one-line subject,
and a mono meta strip: draft date, audit run timestamp, statements tested, documents indexed.

Every one of those comes from the source. The run timestamp especially: it is what tells a
reader whether they are looking at the current audit.

## Decision panel

Overlapping the masthead seam, split two ways.

**Left:** a flag stating what must happen, a headline naming the single most important finding
in plain words, a short paragraph, and the blocking items as links carrying their IDs.

The headline is the one sentence a reader will quote in a meeting. Make it the finding, not a
category label: "The document that anchors nearly every target has not been indexed" rather
than "Material omission detected".

**Right, on a tinted ground:** the coverage bar, its key, and the sentence that stops the
not-checked segment being read as a failure. Centre this column's content vertically, or a
shorter column beside a taller one leaves a void.

The coverage bar is three segments at true proportion, with the not-checked segment hatched
rather than filled. Give it `role="img"` and an `aria-label` stating the three counts.

## §00 Executive analysis

The app's headline metrics as a four-cell strip, then the executive-analysis prose, then the
key findings as a numbered list, then the closing recommendation line.

Colour only the metrics that carry alarm. Four red numbers in a row spends the accent on
counts that are neutral facts.

## §01 Resolve before release

One card per detected inconsistency, ordered by severity. Each card:

- ID, severity chip, category chip, and the title **on its own line** below the chips. A title
  sharing the chip row sits on a different baseline and reads as floating.
- A two-cell compare: **in this draft** on a tinted ground, **on the indexed record** on a
  neutral one, each with its source line and date.
- **Why it matters**, in prose.
- **What to do**, in a distinct block. From the source's suggestion, not from your own advice.
- If the item recurs elsewhere, the list of other surfaces, as ID links.

No owner, no due date, no "blocks release" flag unless the source carries them.

## §02 Audit coverage

**Documents indexed.** The target, then each comparison document with its date and the
subtitle the source gives it. Where the source's analysis characterises them (procedural,
administrative, off-topic), mark that visually - it is usually the reason the coverage is what
it is.

A callout under the list stating that reason plainly, if the source supports one.

**Statement results.** Every matrix row, grouped **checked** then **not checked**, each an
expandable `<details>`: number, statement, status chip, severity word, and the source's note
inside. An "Open all" control per group; a group without one, beside a group with one, reads
as a bug.

Status and severity are separate elements. A row that says `NOT CHECKED · MEDIUM` in one pill
hides the severity, and severity is the varying signal.

## §03 Supporting record

For the file. Nothing here is separately actionable, and the section says so.

- **Language drift**, each item a `<details>` with a then-and-now compare and the assessment.
  Carry an "acknowledged" state where the source has one, in a neutral chip: green means
  consistent everywhere else on the page.
- **Forward-looking statements**, each with its original guidance, date and assessment.
- **Track record**, the periods and outcomes as the source gives them. If every outcome reads
  unknown, keep the table and put the honest note beneath it. The table is the source's; the
  note is yours.

## §04 Release prep

The anticipated questions, each a `<details>`: severity, category, the question, and the
proposed answer. This is a different job at a different time from the rest of the report, and
the section intro should say so.

## §05 Next steps

The source's steps, in its order, numbered, with blocking ones visually distinct if the source
distinguishes them. No timing labels the source did not give.

Then the disclaimer, carrying the source's own AI-generated caveat, plus the framing that a
statement marked not checked has not been found inconsistent.

## Contents rail and footer

A sticky rail on the left from about 1080px, with a sliding marker, a scrollspy, and a compact
state block: run timestamp, items to resolve, coverage. It collapses to a chip row below that.

Footer: the report subject, the provenance block (run timestamp, document and statement counts,
audit trail), the Diolog credit with its droplet mark and lowercase wordmark, and the
confidentiality line.

## Interaction

Deep links open their target `<details>` and flash it, so a link from the decision panel lands
on an open card rather than a collapsed summary. "Open all" per group. Print forces every
`<details>` open and restores state afterwards.
