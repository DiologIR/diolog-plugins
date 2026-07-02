# ship-feature

One skill that takes a **feature** all the way — from a bare description to **merged, tested, production code** — by conducting the Diolog pipeline skills in order, in a single in-session flow. It's the "do the whole thing" layer on top of [`design-craft`](../design-craft), [`feature-spec-pipeline`](../feature-spec-pipeline) (`/triage`, `/plan`, `/work`, `/gap-fix`), and [`acceptance-e2e`](../acceptance-e2e).

```
feature (text / .md  [+ optional HTML/CSS/JS mock])
  → design-craft   represent the whole feature UI in the design system (elements/composites/mock pages)
  → triage         → docs/specs/spec-DIO-XXXX.md   (allocates the id)
  → plan           → docs/plans/plan-DIO-XXXX.md
  → work           implement in .worktrees/DIO-XXXX on branch ai/dio-xxxx
  → deferred loop  re-work / child triage+plan+work for extra phases — ON THE SAME BRANCH
  → gap-fix        close remaining spec gaps in code                    (same branch)
  → acceptance-e2e comprehensive Playwright suite, run vs the branch locally, bugs fixed
  → finalize       commit → rebase → MERGE into the integration branch → push → clean up worktree(s)
```

## What makes it a *conductor*, not a script

- **In-session, sequential across stages.** It invokes each stage-skill in the same session (Skill tool), so it keeps the accumulated understanding — feature intent, UI decisions, spec nuances, plan, what `/work` built, what it deferred — from first read to final merge. It does **not** delegate a whole stage to a subagent (that would lose the thread) and does **not** wrap the pipeline in one Workflow script (the seams need human-meaningful judgment).
- **Parallelism lives inside each stage.** Every sub-skill already fans out to subagents via the Workflow tool; those leaf agents re-read the persisted spec/plan/mock from disk, so they re-acquire grounding without the conductor losing it.
- **Memory is on disk → the run is resumable.** Each stage persists a durable artifact (design-system files, `spec-<ID>.md`, `plan-<ID>.md`, the `/work` progress note, the e2e specs). If the session is compacted or interrupted, re-enter at the first phase whose artifact is missing or not-yet-green.
- **One feature = one branch = one worktree.** `/work` owns `.worktrees/DIO-XXXX` on `ai/dio-xxxx`; the conductor stays in the main working tree (where the docs and design-craft live). Deferred work and any *child* specs land on the **parent's** branch — never a second worktree — so the feature merges as one unit.

## The merge is behind a fail-closed gate

The final merge + push is the one irreversible step. It runs **full-auto** — commit → rebase onto the fresh integration branch → merge directly (no PR) → push → remove the worktree(s) — but only when a hard pre-merge gate is genuinely green: all build gates actually run and passing, no unresolved Critical/High/Medium findings, the e2e suite green twice, every reachability/clause row satisfied, and all work on one branch. **Any red or unverifiable gate stops the run before the merge** and hands the human a precise blocker list — it never pushes broken or unproven code.

## Requirements

- The Diolog product repo as the target (run from its root): `CLAUDE.md`, the design system (`apps/web-design-system` + its `tokens/tokens.css`, plus an optional `DESIGN.md` design-language spec when one is provided or present), the `docs/` tree + `docs/feature-specs/LEDGER.md`, the e2e harness (`apps/web/e2e`), and an integration branch (`origin/staging`, else the repo default — detected, not hardcoded).
- The **Workflow** (dynamic workflows / ultracode) capability, which the sub-skills use to fan out.
- The sibling plugins installed: `design-craft`, `feature-spec-pipeline`, `acceptance-e2e`.

## Usage

Invoke by name or just describe the goal — reach for it whenever the aim is a *finished, merged* feature rather than a single stage:

- `/ship-feature ./features/smart-inbox.md`
- `/ship-feature "add an @-mention composer to the question thread, with an empty state and a keyboard menu"`
- "take this feature from description to merged", "design, spec, build, test and ship it", "run the full pipeline on <feature>"

For a single stage, use that skill directly (`/triage`, `/plan`, `/work`, `/gap-fix`, `/acceptance-e2e`, `/design-craft`). `ship-feature` is the layer that runs — and judges the seams between — all of them.
