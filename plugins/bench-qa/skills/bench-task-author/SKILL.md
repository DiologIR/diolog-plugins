---
name: bench-task-author
description: Author new diolog-swe-bench benchmark tasks - backend/frontend/tool-use behavioural tasks and ui design tasks (cards, full surfaces, investor decks) - to the deepswe-task-author bar, hard-gated so nothing under-specified, over-fit, or saturated enters the bench. Use whenever someone asks to create, add, write, or generate a benchmark task or test for the bench ("author a task for X", "we need coverage of Y", "add a ui deck task", "deepen this saturated task", "turn this dAIolog module into a bench task"), including SCALE-UP and HARDEN-BRIEF follow-ups from a task review. Runs from the diolog-swe-bench repo root; ends with the measured mini-cull verdict, not with files written. Do NOT use for judging or fixing an existing task's verifier (bench-task-judge) or re-reviewing the corpus (bench-corpus-review); not for building Diolog product features.
---

# bench-task-author

Author one benchmark task and shepherd it through every gate. The task is DONE when the
measured mini-cull says it discriminates — never when the files look good. This ordering
exists because this corpus has repeatedly shipped tasks that read as hard and measured as
saturated or false-floored; authoring intuition about difficulty has been wrong often
enough that it is banned as a stop condition.

Required reading before authoring (in the diolog-swe-bench repo):
1. `personas/deepswe-task-author.md` — the authoring law: the difficulty levers, the
   measured bar (best peer model 0.4-0.7), the five over-fit traps, the oracle rules.
2. `docs/authoring-tasks.md` — anatomy, conventions, the self-test gate, ui/judged rules.
3. `personas/context/LLM-BENCHMARK-CONTEXT.md` — the real Diolog stack the task must be
   grounded in.
4. The most recent `docs/internal/TASK-REVIEW-*.md` summary — what already saturates,
   what is redundant, where coverage gaps are.

## Step 1 — source and redundancy check

Map the coverage request to a source: a real dAIolog slice at the pinned commit
(preferred; `pnpm fixture:vendor`), a stack OSS import (check the public-patch
contamination risk), or synthetic only for floor/smoke tasks. THEN grep the corpus for
sibling tasks testing the same skill — the ui set once accumulated five near-duplicate
deck tasks; a redundant task costs run budget forever. If a sibling exists, deepen it
(SCALE-UP) instead of authoring a twin.

## Step 2 — author

Follow the persona. The non-negotiables that past batches got wrong, restated:

- **Scale is the difficulty lever.** Multi-file, exploration-taxing fixtures; a
  single-function fixture cannot be frontier regardless of cleverness.
- **Orthogonal `[[scoring.verifier_groups]]` from the start** — one group per independent
  concern, each passing on the reference IN ISOLATION and failing on the stub. Never ship
  20+ assertions in one group: the binary AND turns partial competence into a false
  floor (this single defect accounted for two thirds of the last review's FIX-VERIFIER
  band).
- **The prompt is the contract.** State every value the verifier checks; hand over
  nothing else (no file lists, no decomposition). Target < ~2,500 chars.
- **Fair oracle**: behaviour through the public API; tolerant matchers where several
  correct answers exist; never log wording, internal keys, unpinned order, or anything
  whose only justification is "that's what the reference does".
- Add a `scoring.regression_command` when the fixture has an existing contract to
  protect. Fresh `canary_guid`. No em/en dashes.

For a **ui design task**: ground the brief in real IR product requirements + DESIGN.md
tokens; pin the checkable specifics (sections, copy, data values, states); include a
reference image; write a behavioural gate (jsdom/vitest — build-only gates saturate);
declare multi-state `[scoring.render]` captures for every state the gate exercises
(the judge cannot grade states it never sees); for decks, declare the `slides` render
and pin slide count/structure. Confirm with `pnpm render:smoke <id>`.

## Step 3 — mechanical gates

```
pnpm canary:embed && pnpm validate:prompts && pnpm validate:tasks && pnpm validate:fixtures
pnpm --filter @diolog/swe-bench-harness selftest --task <id>   # reference passes per group, stub fails, baseline green
pnpm reasoning:index
```

Then the persona's adversarial self-test on your OWN reference (permute unordered arrays,
reword error messages, add an incidental key, rewrite one query equivalently — re-run the
verifier per mutation). Fix anything a mutation kills before proceeding; it is cheaper
now than after the judge bounces it.

## Step 4 — the judge gate (independent, cross-family)

Run **bench-task-judge** on the new task in its pre-run mode (zero decided runs → stages
1-2 only; the verdict speaks to fairness/structure, never difficulty) — ideally executed
by a DIFFERENT model family than the author (`pnpm persona:review -- --provider
antigravity` for the fairness pass, or run the judge skill via codex). Author-judged
oracles are how the last over-fit family shipped. FIX-VERIFIER or TIGHTEN-PROMPT findings
loop back to step 2; two failed loops → park the task (`parked` tag) rather than eroding
the verifier to pass.

## Step 5 — the measured mini-cull (the only real difficulty test)

```
pnpm bench --provider codex  --model gpt-5.5 --effort xhigh --task <id> --runs 3
pnpm bench --provider claude --model opus    --effort xhigh --task <id> --runs 3
pnpm bench --provider claude --model sonnet  --effort max   --task <id> --runs 3
```

(The peer trio's canonical definition lives in `personas/deepswe-task-author.md` §5 — if
these commands and the persona ever diverge, the persona wins; update this copy.)

Keep the task only if BOTH hold: best peer lands **0.4-0.7**, AND the peers genuinely
diverge (read WHICH verifier group each dropped — all dropping the same group means that
group may be over-fit: audit it before shipping). All three pass → saturated: cull or
scale up. All three fail at the same partial score → false floor: back to step 4's
evidence, do not ship. Record predicted-vs-measured difficulty in REASONING.md — the gap
is the corpus's calibration data on its own authors.

## Step 6 — admit

Only now: `pnpm db:import`, `pnpm calibrate`, `pnpm gen:site`. Write the final
review.json (verdict KEEP) next to the task so the corpus review can carry it forward.
Report to the user: source, the mini-cull numbers, and anything parked along the way.
