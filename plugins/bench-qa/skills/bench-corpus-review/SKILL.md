---
name: bench-corpus-review
description: Re-run the whole-corpus quality review of diolog-swe-bench - judge every task in the corpus with bench-task-judge, assemble docs/internal/TASK-REVIEW-<date>.md (per-task verdicts, summary counts, re-run plan), and diff against the previous review. Use whenever someone asks to review/audit/re-analyse the whole benchmark, all tasks, or the corpus ("re-run the task review", "audit the corpus again", "how healthy is the benchmark now", "which tasks should we fix or retire", "regenerate the task review doc"), after a batch of new tasks lands, or on a schedule. Deliberately designed so a cheaper/lesser model can run it - all judgement is binary checks and decision tables from bench-task-judge; the assembly is mechanical. Runs from the diolog-swe-bench repo root. Do NOT use for a single task or a handful of named tasks (use bench-task-judge directly) or for authoring new tasks (bench-task-author).
---

# bench-corpus-review

Regenerate the corpus-wide task review that was first produced manually as
`docs/internal/TASK-REVIEW-2026-07-09.md`. That document is the format contract AND the
calibration gold standard — read its structure before starting (summary table →
re-run policy → per-dimension per-task tables → skill/persona sections are not
regenerated, only the review content is).

The reason a lesser model can run this: every per-task judgement is delegated to
`bench-task-judge` (binary checks, decision tables, mutation proofs), and everything at
the corpus level is counting, formatting, and diffing. Your job is orchestration and
honest assembly, not opinion.

## Procedure

### 1. Build the stats sheet (deterministic)

One sweep over the store (path: `~/Library/Application Support/Benchwarmer/benchwarmer.sqlite`
or `$BENCHWARMER_DB`; use `pnpm task:stats --json` per task if it exists):

```sql
SELECT taskId, dimension, COUNT(*) n,
  ROUND(1.0*SUM(status='passed')/COUNT(*),2) p,
  ROUND(1.0*SUM(CASE WHEN model='haiku' AND status='passed' THEN 1 ELSE 0 END)/NULLIF(SUM(model='haiku'),0),2) haiku_p,
  ROUND(1.0*SUM(CASE WHEN model IN ('opus','gpt-5.5') AND status='passed' THEN 1 ELSE 0 END)/NULLIF(SUM(model IN ('opus','gpt-5.5')),0),2) strong_p,
  ROUND(AVG(score),2) mean_score
FROM runs WHERE status IN ('passed','failed')
GROUP BY taskId ORDER BY dimension, taskId;
```

Save it to the scratchpad as CSV. Decided runs only — error/unscored/timeout rows never
count, and per-model cells built on fewer than 3 runs are noise (mark them, don't trust
them).

### 2. Fan out per-dimension judging

Slice the corpus into review batches of ~20-25 tasks (backend needs ~4 slices; frontend,
ui, and optimality+tool-use are one each). For each slice, spawn a subagent whose
instructions are: read the bench-task-judge skill (SKILL.md + references/rubric.md) and
apply it to each task in the slice, with the stats CSV path provided; return one
TASK-REVIEW-format block per task. Fixed slice sizes exist so a small-context model never
overflows — do not enlarge them to save subagent count. Cap fan-out at 4 concurrent
subagents (house pipeline convention); retry a failed slice once before reporting it as
a gap — never silently drop a slice, a review with holes reads as "covered everything".

**Paste the review.json canonical shape (rubric §7, including its enum vocabularies)
VERBATIM into every subagent prompt.** Pointing agents at the rubric file is not enough:
the 2026-07-09 pass showed parallel agents drift into ad-hoc variants (arrow verdicts,
compound rerun values, renamed fields) whenever the shape is merely referenced, and the
downstream requeue reader then skips their files. After the fan-out returns, run
`pnpm task:requeue` once as a smoke check — "N skipped (invalid)" greater than zero means
some agent drifted; normalise those files before assembling the document.

Two economies that keep this cheap without corrupting it:
- Stage-2 mutations are mandatory only for false-floor suspects and for stage-1 trap
  hits; certified-KEEP mutation sweeps are optional on a scheduled re-review.
- Tasks whose `review.json` already exists AND whose task version + stats band are
  unchanged since that review may be carried forward with verdict "unchanged" — cite the
  prior review.json instead of re-judging. Any changed file or band → full re-judge.

### 3. Assemble the document (mechanical)

Write `docs/internal/TASK-REVIEW-<YYYY-MM-DD>.md`:

1. Header: method note, stats key, verdict vocabulary (copy from the previous review).
2. **Corpus-level summary**: verdict counts table (count them — do not estimate) +
   headline findings (only patterns supported by >= 3 per-task rows).
3. **Re-run policy** section: copy verbatim from the previous review unless the policy
   itself changed.
4. Per-dimension sections with the per-task tables from the subagents, in corpus order.
If there is no previous review (first run in a fresh corpus), skip the delta section and
say so; everything else proceeds unchanged.

5. **Delta vs previous review** (this is what makes the re-run valuable):
   - verdict flips WITH a task change since last review → expected, list as "resolved" or
     "regressed";
   - verdict flips WITHOUT any task change → flag loudly: either sampling noise or judge
     drift, and both matter. Cite the stats that moved.
   - new tasks, retired tasks, coverage changes.

### 4. Emit the action list

From the fresh review.jsons (use `pnpm task:requeue` if it exists, else assemble by
hand from the re-run policy table):

```
rescore:     [ids]                  → pnpm rescore --write --task <ids>
rerun:       {model → [ids]}        → pnpm bench --provider ... --task <ids>
new-version: [ids]
retire:      [ids]
audit-queue: [ids] (replay before verdict)
```

Order of operations matters for spend: verifier fixes → one rescore sweep (back up the
store; re-sync after any later db:import) → re-run only prompt-changed tasks →
`pnpm calibrate --write` → `pnpm gen:site`.

## Calibration gate (first run with a new/cheaper model)

Before trusting a new reviewer model, run it over a 30-task gold sample drawn from the
most recent human-verified review (include every verdict class and >= 10 FIX-VERIFIER
tasks). Require: >= 80% verdict agreement AND zero missed mutation-provable traps. Below
the bar, tighten the rubric checks — do not simply swap to a bigger model; an ambiguous
check will eventually fail any model.
