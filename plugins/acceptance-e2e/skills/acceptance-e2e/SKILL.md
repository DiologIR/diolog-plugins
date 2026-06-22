---
name: acceptance-e2e
description: Use this skill whenever the user wants end-to-end UI tests for a Diolog web feature derived from its requirements — e.g. "write e2e tests for DIO-1234", "create a Playwright test suite for the presentations page from the ticket and plan", "test the calendar feature at http://diolog.ai/calendar against its acceptance criteria", "the chart element looks broken, are we testing for that", "add e2e coverage for this feature and run it", or any request that combines a Linear issue # / a plan*.md / a feature URL with "create tests", "test coverage", "e2e", "acceptance tests", "verify the feature works". It turns a spec (Linear issue + plan + the live page) into an acceptance-criteria-traceable Playwright UI suite in apps/web/e2e, runs it, and fixes tractable bugs it surfaces. Reach for it even when the user only names the issue or the URL and not "e2e" explicitly — if they want a feature verified against what it's supposed to do, this is the skill.
tools: Read, Grep, Glob, Bash, Edit, Write, Agent, ToolSearch
---

# Acceptance-criteria E2E tests (Diolog web)

Turn a feature's **requirements** into an end-to-end UI test suite that proves the
feature does what the ticket says — then run it, and fix the small bugs it finds.

The inputs are three views of the same feature:
- a **Linear issue #** (and its comments) — the authoritative acceptance criteria,
- a **plan*.md** / gap-analysis doc — the implementation plan + known gaps,
- the **live webpage** — the feature running at `http://diolog.ai/<route>`.

The single most important idea: **tests are derived from the acceptance criteria,
not from poking the UI to see what renders.** The AC list is the source of truth;
the live page is how you discover real selectors and verify, not what you test
*for*. And you assert **content/render correctness** — that a chart actually draws
a chart, that a figure is actually sourced — not just that an element exists.

This skill is Diolog-specific: it writes into the `apps/web/e2e` Playwright harness
and uses the dev-login + company-context conventions. Read
`references/diolog-e2e-harness.md` for the concrete harness facts, selector recipes,
and the worked `presentations` example before writing any spec.

---

## The method

Work the six phases in order. Phases 1–2 are about the *requirements*; phase 3 is
where the live page enters; phases 4–6 are build/run/fix. Don't skip ahead to
clicking around the UI — you'll write shallow "the button exists" tests instead of
"the feature satisfies AC-7" tests.

### 1. Gather the spec — read everything before writing anything

- Pull the Linear issue **in full**, plus its comments, with the `mcp__linear` tools
  (`get_issue`, `list_comments`). Issues often link addenda or sub-issues — follow
  them. Comments frequently record what shipped vs what's deferred.
- Read the **plan*.md** and any gap-analysis md the user points at (often under
  `docs/plans/` or the repo root). These tell you what was actually built and what
  is knowingly partial.
- Read the **implemented code** for the feature: the page/route, the components, the
  state store, and the BFF/API routes it calls. This is how you learn the *real*
  capabilities to test (the store actions, the element kinds, the endpoints) and
  distinguish "built" from "spec'd-but-deferred". Delegate the breadth-read to an
  `Explore`/`general-purpose` subagent when it spans many files — ask for exact
  file:line + selectors, not prose.

### 2. Build the AC-traceability matrix FIRST

Enumerate **every acceptance criterion** from every ticket (and the gap doc), and
map each to the test case(s) that will verify it, with a status: ✓ covered · ◑
partial · ✗ gap/deferred. This matrix is the plan and the deliverable's spine — it
goes at the top of the test-plan markdown. Writing it first forces complete AC
coverage and exposes the gaps (deferred features, multi-client flows, backend-only
ACs) honestly instead of letting "what's easy to click" drive coverage. See the
matrix template + worked example in the harness reference.

### 3. Ground selectors + data against the live page

Now open the running app to discover the *real* selectors and data shapes — never
guess them. Log in with the dev button, set the correct company/tenant context, go
to the feature route, and probe the actual interactive flows and the API payloads.
Use `playwright-cli` (preferred) or the Chrome MCP (`mcp__claude-in-chrome__*`). For
each AC, find the concrete affordance (role+name, a `data-ui`/`data-*` hook, the
real menu items, the persisted shape). Capture the traps the harness reference
documents (substring name collisions, overlap on canvas, async render). If a
required surface 404s, the feature flag/context is probably wrong — fix that first.

### 4. Author the specs in the repo's harness — matching its conventions exactly

Write specs under `apps/web/e2e/tests/<area>/` and a companion
`test-plan/<area>.md` (led by the AC matrix). Match the existing harness 1:1 —
fixtures, projects, the console-error guard, isolation. Key authoring rules (full
detail + the worked patterns are in `references/diolog-e2e-harness.md`):

- **Selectors:** role + accessible name first; `data-ui`/`data-*` where there's no
  name; `{ exact: true }` whenever a name is a substring of another ("Present" ⊂
  "Presentation actions…", "5 slides" ⊂ "15 slides", "Design" ⊂ "DESIGN.md").
  Never ship brittle CSS/xpath from codegen.
- **Assert the requirement, deeply.** The AC is "a chart renders", so assert the
  chart *draws* (an svg/canvas with geometry) — not that a chart element exists.
  "Every figure sourced" → assert the source tag actually shows. Shallow
  "element added" checks pass while the feature is visibly broken; that's the gap
  the user cares about.
- **Isolation:** mutating cases operate on a **disposable clone** of seeded data (or
  self-clean via the same UI/BFF), never on shared/seeded records. The suite must be
  green on a re-run. Tag cases `@read-only` / `@mutating` / `@no-live` and serialize
  mutating describes.
- **Tenant context:** drive the right company via a dedicated setup/storageState
  project, not in-session switching (it's session-fragile).
- **Case IDs carry the AC.** Title each test with a stable ID (`AREA-012`) and map
  it in the matrix, so a failure points straight back to the criterion it broke.

### 5. Run + stabilize

Run with the repo's command (e.g. `pnpm test:e2e:<area>` from `apps/web/`, or
`--project=<area>`). Iterate on failures: fix selector/timing issues; reframe
assertions that are *environment*-fragile (not bug-fragile) to the robust signal
(e.g. assert the immediate UI/canvas effect rather than a state that a known
local-only sync quirk corrupts); scope-allow genuinely pre-existing app-shell
console noise to the suite (never weaken the global zero-console-errors guard). A
green run must mean the ACs hold, not that the asserts were watered down.

### 6. Catch bugs — and fix the tractable ones

When a content/AC assertion fails on a **real defect**, that is the suite doing its
job. Decide:
- **Tractable fix** (a one-liner, a missing default, a wrong env value) → fix the
  product code, re-run, and let the guard go green. (In the presentations run this
  was `crypto.randomUUID()` throwing on plain-HTTP — which silently broke every
  id-minting edit — and a chart default shipping `series: []` so charts drew
  nothing.) Keep the fix minimal and isolated.
- **Deep/risky bug** → encode it as a regression guard: `test.fail()` (documents +
  asserts the bug, stays green, auto-flags when fixed) or `test.fixme()` if the
  environment blocks reliable detection, each with a precise comment. Report it.

Always end by reporting: the final pass/skip/fail counts, the AC coverage (what's
covered / partial / gap), every bug found (fixed vs open), and the file inventory.

---

## What "good" looks like

- The **AC matrix** is the centerpiece — a reviewer can see every criterion and how
  it's verified. No criterion is silently uncovered; gaps are named with a reason.
- Tests assert **outcomes**, not chrome. "Adding a chart draws a chart with data."
  "The deck's real text renders on the canvas." "The exported request carries the
  right fileType." Not "a chart element is present."
- The suite is **re-runnable and isolated** — it never corrupts seeded data and is
  green twice in a row.
- Real bugs are **surfaced** (and the easy ones fixed), because a test that only ever
  passes is decorative. Catching the broken chart is the whole point.

## Anti-patterns to avoid

- Driving coverage from the DOM ("I see a button, I'll test the button") instead of
  from the ACs. You'll miss requirements and over-test trivia.
- Asserting presence where the AC demands behaviour ("element exists" for "chart
  renders").
- Mutating seeded/shared data, or leaving test data behind — the next run goes red.
- Guessing selectors or pasting codegen CSS — they break on the first re-render.
- Watering down an assertion to make a red turn green when the red was a real bug.
- Switching company/tenant in-session instead of via a setup storageState.

When you need the concrete harness layout, the dev-login + company-context recipe,
the selector-trap catalogue, the AC-matrix template, the isolation/clone helpers,
the content-render assertion patterns, and the worked `presentations` example, read
**`references/diolog-e2e-harness.md`**.
