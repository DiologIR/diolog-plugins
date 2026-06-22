# acceptance-e2e

Turn a Diolog web feature's **requirements** into an acceptance-criteria-traceable
Playwright end-to-end UI suite — then run it, and fix the small bugs it surfaces.

## What it does

Given three views of one feature —

- a **Linear issue #** (+ comments) — the authoritative acceptance criteria,
- a **plan\*.md** / gap-analysis doc — the implementation plan + known gaps,
- the **live page** at `http://diolog.ai/<route>` — the feature actually running,

the skill:

1. reads all three (issue, plan, and the implemented code) and **enumerates every
   acceptance criterion** into a traceability matrix (✓ covered · ◑ partial · ✗ gap);
2. **grounds selectors and data shapes against the running app** (dev-login + the
   right company/tenant context) instead of guessing them;
3. **authors specs in the `apps/web/e2e` harness** that assert *content/render
   correctness* — a chart actually draws a chart, a figure is actually sourced, the
   exported request carries the right payload — not just that an element exists;
4. keeps the suite **isolated and re-runnable** (disposable-clone test data, no
   mutation of seeded records, the zero-console-errors guard intact);
5. **runs the suite**, stabilises it, and where a failure exposes a **tractable
   product bug** (a missing default, a secure-context API throwing on plain HTTP),
   **fixes the product code** — and encodes deeper bugs as regression guards.

The organising principle is that tests are derived from the acceptance criteria, not
from poking the UI to see what renders. The AC matrix is the deliverable's spine.

## When it triggers

Any request that combines an issue / plan / feature URL with "create tests", "e2e
coverage", "acceptance tests", "verify the feature works" — e.g. *"write e2e tests
for DIO-1234 from the ticket and plan"*, *"test the calendar feature at
diolog.ai/calendar against its ACs"*, *"the chart element looks broken, are we
testing for that"*.

## Layout

```
acceptance-e2e/
├── .claude-plugin/plugin.json
└── skills/acceptance-e2e/
    ├── SKILL.md                          # the six-phase method + principles
    └── references/diolog-e2e-harness.md  # harness facts, selector recipes,
                                          # AC-matrix template, worked example
```

## Reference build

The skill is generalised from the `presentations` e2e suite
(`apps/web/e2e/tests/presentations/`) — ~110 acceptance-traceable cases that caught
(and fixed) a `crypto.randomUUID()` plain-HTTP failure and a chart that drew nothing.
That suite is the canonical example to copy.
