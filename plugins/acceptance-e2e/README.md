# acceptance-e2e

Turn **any** web feature's **requirements** into an acceptance-criteria-traceable
Playwright end-to-end UI suite — then run it, and fix the small bugs it surfaces. The
method is project-agnostic: it grounds itself in whatever repo it's run in.

## What it does

Given three views of one feature —

- a **requirements source** — an issue/ticket (+ comments) from whatever tracker the
  project uses, a **spec / plan\*.md**, or a written description — the authoritative
  acceptance criteria,
- an **implementation plan / gap-analysis doc**, when one exists — what was built + what's
  knowingly partial,
- the **live page** at a URL you can reach (a local dev server, a container host, or a
  deployed environment) — the feature actually running,

the skill:

0. **discovers the project's conventions** — the e2e harness, auth model,
   tenant/context model, run command, and base URL — so it extends the repo rather than
   imposing a foreign stack;
1. reads all the requirements (issue, plan, and the implemented code) and **enumerates
   every acceptance criterion** into a traceability matrix (✓ covered · ◑ partial · ✗ gap);
2. **grounds selectors and data shapes against the running app** (its real auth + the
   right tenant/account context) instead of guessing them;
3. **authors specs in the project's own harness** that assert *content/render
   correctness* — a chart actually draws a chart, a figure is actually sourced, the
   exported request carries the right payload — not just that an element exists;
4. keeps the suite **isolated and re-runnable** (disposable test data, no mutation of
   seeded records, any console-error guard intact);
5. **runs the suite twice**, stabilises it, and where a failure exposes a **tractable
   product bug** (a missing default, a secure-context API throwing on plain HTTP),
   **fixes the product code surgically** — and encodes deeper bugs as regression guards;
6. goes **proactive** — seven sweeps beyond the ACs (state-matrix forcing, fault
   injection, interaction-integrity + reactivity, keyboard + axe, data-shape stress,
   security surface, multi-user/realtime), each driven-and-asserted;
7. hands **rendered quality to `/design-review`** (deterministic WCAG/layout gates +
   judged craft/state/flow passes on real renders) and mock agreement to the
   fidelity layer — behaviour in specs, judgment in the review;
8. **promotes every sweep into a permanent guard** — wired to a named script or CI
   step ("a gate must be invoked by something"), with new surfaces inheriting by
   enumeration.

Beyond browser apps it carries **lanes** for native apps (Maestro deep-link-first +
XCUITest + `performAccessibilityAudit`), MCP servers (acceptance = driving the built
server through a real MCP client, not the hermetic vitest tier), and marketing sites
(route × viewport loads, link/heading/meta audits, claim-grounding invariants).

The organising principle is that tests are derived from the acceptance criteria, not
from poking the UI to see what renders. The AC matrix is the deliverable's spine.

## When it triggers

Any request that combines a requirements source (an issue/ticket, a plan, or a feature
URL) with "create tests", "e2e coverage", "acceptance tests", "verify the feature works"
— e.g. *"write e2e tests for TICKET-123 from the ticket and plan"*, *"test the calendar
feature at &lt;url&gt; against its ACs"*, *"the chart element looks broken, are we testing
for that"*.

## Layout

```
acceptance-e2e/
├── .claude-plugin/plugin.json
└── skills/acceptance-e2e/
    ├── SKILL.md                          # the project-agnostic six-phase method + principles
    └── references/
        ├── e2e-playbook.md               # PORTABLE: selector traps, isolation, outcome-
        │                                 # assertion patterns, recurring bug classes,
        │                                 # AC-matrix template, run-twice discipline
        ├── proactive-sweeps.md           # the seven sweeps' detection mechanics +
        │                                 # guard-promotion rules (Phases 6 and 9)
        └── diolog-e2e-harness.md         # OPTIONAL Diolog-specific worked example
                                          # (exact recipes + presentations/quorum builds)
```

## Portability

The skill assumes **Playwright** as the default runner and otherwise assumes nothing —
Phase 0 discovers each project's own harness, auth, tenant model, run command, and base
URL. The reusable wisdom (selector-trap catalogue, isolation patterns, outcome
assertions, the recurring real-bug classes, the run-twice discipline) is written
generically in `e2e-playbook.md` and applies to any web app. The Diolog harness file is a
purely optional worked example for one specific repo.
