# bench-qa

QA automation for the private `diolog-swe-bench` benchmark corpus. Three skills:

- **bench-task-judge** — judge one task: is it difficult enough, is the verifier fair,
  should it stay in the bench, what exactly to change, and whether the fix needs model
  re-runs or just a rescore.
- **bench-corpus-review** — regenerate the whole-corpus task review
  (`docs/internal/TASK-REVIEW-<date>.md`) with per-task verdicts and a delta against the
  previous review. Designed so a cheap model can run it: all judgement is binary checks
  and decision tables.
- **bench-task-author** — author new benchmark tasks (behavioural and ui design) to the
  deepswe-task-author bar, hard-gated by the judge skill and a measured mini-cull before
  the task may enter the bench.

All three run from the `diolog-swe-bench` repo root. The design rationale and the
verdict/re-run decision tables originate in
`diolog-swe-bench/docs/internal/TASK-REVIEW-2026-07-09.md` and
`docs/internal/TASK-QA-AUTOMATION-SPEC.md`.
