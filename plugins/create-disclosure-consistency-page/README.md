# create-disclosure-consistency-page

Turns a Diolog web-app disclosure-consistency report into a standalone, on-brand HTML artifact
a Disclosure Committee can read, print and circulate before an announcement goes out.

The app's report is a working surface with tabs, filters and acknowledge buttons. This produces
a document: decision first, the items to resolve, an honest coverage bar, every tested
statement, the supporting record and the anticipated questions.

## Two rules

**The app HTML is the sole source of truth.** No report IDs, owners, due dates or attributions
the source does not carry. This is a compliance artifact about a pre-release announcement, and
a fabricated detail in it is worse than a missing one.

**Restructure freely.** Order, headings, grouping and plainer phrasing of the same facts are
the work. The constraint is on facts, not form.

## The framing fix

The app reports a pass rate. Read literally, "17%, 3 of 18" says the draft is 83% wrong. It is
not: most statements were never checked, because the documents needed to check them were not
indexed. The page shows checked-consistent, checked-inconsistent and not-checked at their true
proportions, and says in words that not checked is not a finding.

## Inputs

- the saved app HTML of the consistency report
- the subject company's `DESIGN.md`
- whether it is confidential and pre-release

## Skill

`skills/create-disclosure-consistency-page/SKILL.md`
