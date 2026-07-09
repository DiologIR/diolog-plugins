# Emphasis and Legibility — Evidence-Based Rules for Diolog Guides

Distilled from a July 2026 deep-research pass over legibility research, cognitive-load studies and the style guides of acclaimed B2B publishers (full report with citations: `research/typography-legibility-research.md`), plus Amy's review of the shipped 30-questions guide (2026-07), whose italics overload and hierarchy failures motivated this file. Where a guide's source `.md` carries design notes that conflict with these rules (the 30-questions master mandated italic micro-labels at 7.5pt), **these rules win** — name the conflict in your summary rather than silently obeying the master file.

The one-line thesis: **emphasis is a budgeted, zero-sum resource.** Emphasised text captures attention by taxing the reader; a page where several emphasis systems fire at once (an italic heading accent + an italic pull quote + ninety italic micro-labels) spends the whole budget on noise, and the hierarchy collapses. Multiple individually-reasonable rules compound — count the page total, not the rules.

## The emphasis ledger (what each style costs)

| Style | Measured effect | Diolog ruling |
|---|---|---|
| **Italics** | ~10.4% slower continuous reading (Tinker); significantly longer fixations for dyslexic readers (~10% of any professional audience), who overwhelmingly dislike it (Rello & Baeza-Yates 2016) | Display-only: the single italic accent phrase per heading, and pull quotes ≤20 words. **Never** for micro-labels, body emphasis, captions, or any multi-line run. |
| **Bold** | Least destructive; provides scanning anchors; disrupts deep reading only in excess | Sparingly in body: 1–2 short phrases per paragraph, max. Never to fabricate heading hierarchy. |
| **ALL CAPS** | 10–20% slower (destroys word shape); 13% longer on legal text; readers 55+ were 29% likelier to misunderstand it (Arbel & Toler 2020) | Mono eyebrows and labels only, ≤5 words, with tracking, at or above the 11px floor. Never a sentence, never body text. |
| **Underline** | Cuts through descenders; reads as a hyperlink | Never. |

## Hierarchy comes from size and space, not font style

Readers decode document structure from **spatial position and relative size** far more than from weight or case; a ~20% size step between levels is the strongest single cue (Williams & Spyridakis 1992). Butterick's rule: the best heading emphasis is white space above and below it. The OECD and the Australian Government Style Manual ban bold/italic/underline as fabricated hierarchy outright; McKinsey holds action titles to identical size and position on every page so navigation is frictionless.

For Diolog guides this is already the brand's stated design (hierarchy by size and the roman/italic axis, sentence case, no bold headlines) — the failure mode is drift: when a page feels flat, the temptation is another emphasis style instead of a bigger size step or more space. Resist it. And make section openers **unmistakable at arm's length**: a category divider must read as "new section", not as another content page (the 30-questions review flagged exactly this hierarchy flattening).

## Layout rules with hard evidence

- **Left-align everything; never justify, never centre body copy.** Justification makes rivers; centred text costs up to 30% reading speed (no stable left anchor for the return sweep).
- **Line length 45–75 characters** (the brand's 68ch measure sits correctly inside this).
- **Leading 120–150%** of font size (the brand's 1.55 body line-height is at the generous edge — keep it).
- **Sentence case headings** — preserves word shape; Title Case and caps measurably slow decoding.
- **Contrast:** WCAG 4.5:1 body, 3:1 large text — `guide-qa.mjs` already checks this; the rule is why.
- **Reading order is row-major.** A left-to-right reader scans grouped items across the row, then down. A 2×3 column-major chip grid reads A,D,B,E,C,F (a real defect from the review). Order grouped sequences across rows, or stack them vertically.
- **Running footers** stay smaller and lighter than body text, suppressed on the cover and section openers, and marked as pagination artifacts in the exported PDF (WCAG PDF14).

## Repetition, monotony and editorial furniture

- **Repeat the grid, vary the allocation.** A constant grid with constant content allocation across 20 pages induces fatigue; acclaimed publishers break rhythm by varying how content occupies the unchanged grid (a full-width panel spread after three text-dense pages, deliberate empty columns as breathing room). This is the design-side twin of the copy rule "repeat the scaffold, vary the texture".
- **Pull quotes are conflicted evidence:** they pull skimmers in, but eye-tracking (NNGroup 2020) shows inline ones knock deep readers out of continuous reading into scanning. Ruling: isolate them **outside the body flow** (margin column or a dedicated band between sections), 10–20 words, one per page at most — never breaking a paragraph.
- **Emphasis density is checkable.** No empirical threshold exists in the literature, so this is a house limit, not a law: flag any page where italicised or bolded words exceed **~5% of that page's body words**, and treat more than two emphasis systems active in one text block as a defect. (Candidate future `guide-qa.mjs` rule — measure ink, per page, across *all* emphasis systems, because the 30-questions failure was three defensible rules compounding.)

## What this changes in practice

1. Micro-labels (`WHY THEY ASK` and kin) are **mono roman at the 11px floor or above** — never italic, and sized to be read, not decoded (the review asked for bigger, clearer labels; the evidence agrees).
2. The italic budget for a page is the heading accent plus at most one isolated pull quote. If a third italic appears on a page, something is over budget.
3. A thin-feeling page gets a bigger size step, more white space, or a varied grid allocation — never another emphasis style and never stretched gaps (`stretch-void` remains the harness's name for that failure).
4. Grouped sequences (category chips, ToC entries) order row-major or stack vertically.
5. When the source master file's design notes contradict any of this, follow this file and say so.
