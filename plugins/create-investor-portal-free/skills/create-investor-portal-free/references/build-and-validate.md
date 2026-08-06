# The build and validation loop

You are not the only skill that should touch this page. Three companions carry craft this skill
deliberately does not restate, and a page that skips them ships defects that are cheap to catch
and expensive to explain.

Load them by their real triggers, not as a ritual: `design-craft` before you draw, `ux-craft`
before you shape a flow or a form, `design-review` before you ship.

## Before drafting: design-craft and ux-craft

**`design-craft`** owns visual craft. Load it once the direction is settled and you are about
to write markup. It carries the anti-slop rules, hierarchy and rhythm, the type and colour
systems, interaction states, and its own deterministic lint:

```bash
python3 <design-craft>/scripts/design-lint.py <file>.html
```

Run that lint at the start of every round and fix critical and major findings before spending
any model judgement. Mechanical findings are cheaper than judged ones, and a clean lint means
*no known defect is present* - never that the page is verified. Those are two claims and they
get two sentences.

Within `design-craft`, three references earn their read on these pages specifically:

- `references/visitor-modes.md` - both surfaces are **Read** mode, which inverts several of
  that skill's Persuade-tuned defaults
- `references/unit-critique-gate.md` - the per-section draft, lint, critique, repair loop
- `references/data-viz.md` - whenever a chart, coverage bar or stat tile is present

**`ux-craft`** owns the UX layer, and both pages contain the things that trigger it: a contact
form, in-page navigation, disclosure widgets, and an AI-generated summary panel. Load
`references/flows-and-forms.md` before building the form and `references/ai-product-ux.md`
before building any surface that presents AI output. Its non-negotiables bind your visual
choices, not the other way round: a beautiful screen on a broken flow is polish spent on
brokenness, and the fluency makes the brokenness feel like betrayal.

If either skill is not installed, say so in your summary and apply its principles from memory
rather than skipping the pass silently.

## Before shipping: design-review, all stages

**`design-review`** is the last automated pass. Run it on the finished page and then resolve
what it finds. It is a grid, not a line: every stage runs per surface, and a stage skipped for
time is `open`, not done.

Fix the worklist at stage 0 before any capture:

```bash
python3 <design-review>/scripts/worklist.py init <workdir> --surfaces <page-name>
python3 <design-review>/scripts/worklist.py set  <workdir> --surface <page> --stage <stage> --value done
python3 <design-review>/scripts/worklist.py check <workdir>     # exits 1 while any cell is open
```

The stages, and what each finds that the others are blind to:

| # | Stage | Finds |
|---|---|---|
| 0 | Scope and worklist | The surface count, fixed up front so coverage is a number rather than a feeling |
| 1 | Static extraction | The probe and style data the later stages reason over |
| 2 | Gates | Contrast, focus, target size, motion anti-patterns, token validity, and the computable layout checks: column drift, rail alignment, zero gaps, text overlap, dead space, affordance |
| 3 | Structural render | Overflow, overlap, clipping, alignment drift, load stability, z-order, at 375 / 768 / 1280 / 1920 plus in-between widths |
| 4 | State matrix | Default, empty, loading, partial, error, success, disabled, overflow, and mid-flight motion frames. Shipping only the populated state is the most reliable failure in generated UI |
| 5 | Component inventory | The list that makes craft coverage countable, typically 40 to 90 types per page |
| 6 | Craft | Binary MET/UNMET judgements against named criteria, on crops at DPR 2 to 3, never on page thumbnails |
| 7 | Flow, forms, copy | Whether the reader realises they must act, can find the control, can predict the label, and knows it worked |
| 8 | Systematisation | Distinct type sizes, spacing values, colours, radii, shadows and durations; whether repeats are tokenised or inline |

Run `check` before writing anything up. If you must stop early, declare it with a resume point
rather than letting the report look finished.

## The loop

Rounds, not a single pass. Each round is: **lint → capture → look → fix the whole batch → recapture**.

- **Batch the fixes.** Capture desktop and mobile in the same round, take every crop together,
  apply the round's whole list, then recapture once. A screenshot trip per tweak is churn, not
  verification.
- **Score the repairs, do not re-hunt.** For each finding from the previous round, one line
  against the new capture: resolved, partial, or unresolved. A fix you cannot see in the
  recapture is unresolved however confident the edit felt. Then name at most three regressions
  the batch introduced, and stop.
- **Budget three rounds.** Each round's findings should be shorter than the last; a round
  producing more text than the previous one is churning. **Stop the moment a round resolves
  nothing** - the round after it will not either.
- **The disposition is computed, not felt.** `ship` only when nothing material is open, `fix`
  while findings remain, `rebuild` when the direction is contradicted across the page rather
  than in patches. Report the word the review produced, never a softer one.

On exhaustion, ship the best round and say plainly what stays open. A table with open findings
is never announced as a pass.

## The two questions

Ask each capture **"what is wrong with this?"** rather than "is this done?". The same pixels
answer those differently, and only the first is a review.

And rendering a screenshot is not seeing one. A capture enters your knowledge when you open it.
