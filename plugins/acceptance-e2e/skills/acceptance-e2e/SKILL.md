---
name: acceptance-e2e
description: Use this skill whenever the user wants end-to-end UI tests for a web feature derived from its requirements — e.g. "write e2e tests for TICKET-123", "create a Playwright test suite for the presentations page from the ticket and plan", "test the calendar feature at <url> against its acceptance criteria", "the chart element looks broken, are we testing for that", "add e2e coverage for this feature and run it", or any request that combines a requirements source (an issue/ticket, a spec or plan*.md, or a written description) with a live/local app and "create tests", "test coverage", "e2e", "acceptance tests", "verify the feature works". It turns a spec (the requirements + the running app) into an acceptance-criteria-traceable Playwright UI suite in the project's OWN e2e harness, runs it, and fixes the tractable product bugs it surfaces. The skill is project-agnostic: it discovers the repo's existing harness, auth, tenant/context model, run command, and base URL rather than assuming any one stack. Reach for it even when the user only names the issue or the URL and not "e2e" explicitly — if they want a feature verified against what it's supposed to do, this is the skill.
tools: Read, Grep, Glob, Bash, Edit, Write, Agent, ToolSearch
---

# Acceptance-criteria E2E tests

Turn a feature's **requirements** into an end-to-end UI test suite that proves the
feature does what its spec says — then run it, and fix the small bugs it finds. The
method is **project-agnostic**: it grounds itself in whatever repo it's run in,
using that project's own harness, auth, run command, and conventions.

The inputs are three views of the same feature:
- a **requirements source** — an issue/ticket (and its comments) from whatever tracker
  the project uses, a **spec / plan `*.md`**, or a written description. This is the
  authoritative acceptance criteria.
- an **implementation plan / gap-analysis doc**, when one exists — what was actually
  built and what's knowingly partial.
- the **live webpage** — the feature running at a URL you can reach (a local dev
  server, a docker host, or a deployed environment).

The single most important idea: **tests are derived from the acceptance criteria,
not from poking the UI to see what renders.** The AC list is the source of truth;
the live page is how you discover real selectors and verify, not what you test
*for*. And you assert **content/render correctness** — that a chart actually draws
a chart, that a figure is actually sourced — not just that an element exists.

This skill assumes **Playwright** as the default runner (adapt if the repo already
uses another). It does **not** assume any particular app: **Phase 0 discovers** the
project's harness, auth model, tenant/context model, run command, and base URL. The
portable method + full pattern catalogue lives in **`references/e2e-playbook.md`** —
read it before writing specs. If you happen to be in the Diolog web repo, the
optional **`references/diolog-e2e-harness.md`** carries the exact recipes and two
worked examples for that specific stack.

## Operating discipline — four habits that keep the suite honest

- **Think before writing (AC-first).** Build the AC-traceability matrix *before* you
  touch the UI. If an acceptance criterion is ambiguous or has two readings, say so
  and pick the reading you'll test out loud — don't silently test one interpretation
  and call the AC covered.
- **Goal-driven, outcome-asserting.** Each test's success criterion is the AC's
  promised *outcome* ("a chart renders" → the chart *draws* geometry), not chrome
  ("an element exists"). When a real bug turns an assertion red, that red **is** the
  reproduction — confirm it, fix, re-run the same assertion, verify green. Then run
  the whole suite **twice** (flakes and isolation breaks only show on run two).
- **Simplicity — match, don't build.** Mirror the project's existing harness 1:1;
  don't invent a parallel fixture framework or speculative test infrastructure it
  doesn't have. Scale coverage to the feature — cover every AC, not every pixel.
- **Surgical fixes.** When you fix a product bug the suite caught, change only the
  lines that fix it — no drive-by refactor of the code you're touching, match the
  existing style. Every changed line traces to the bug.

## The method

Work the phases in order. Phase 0 grounds you in the project; phases 1–2 are about
the *requirements*; phase 3 is where the live page enters; phases 4–6 are
build/run/fix. Don't skip ahead to clicking around the UI — you'll write shallow
"the button exists" tests instead of "the feature satisfies AC-7" tests.

### 0. Discover the project's conventions — never assume a stack

Before anything else, learn how *this* repo does e2e, so you extend it rather than
impose a foreign shape:
- **Requirements source:** how are requirements tracked here — an issue tracker
  (Linear/Jira/GitHub issues, via its MCP or CLI), local `docs/specs` + `docs/plans`
  markdown, or just the description the user handed you? Identify it and pull it in
  full (Phase 1).
- **The e2e harness:** find the existing test setup — the runner (Playwright/Cypress/…),
  its config, the fixtures, the existing specs, and the **run command** (search
  `package.json` scripts, a `Makefile`, CI config). Match its layout and conventions
  exactly. If the repo has **no** e2e harness yet, set up a minimal Playwright one
  following its structure and say so in your report — don't over-build it.
- **Auth + context:** how does a test authenticate — a dev-login button, a seeded
  test user, a saved `storageState`, an API token? Is there a **tenant/workspace/
  account context** that scopes what data is visible? Drive that context via a
  setup/storageState project, not in-session switching.
- **Base URL:** where does the app run for tests — a local dev server you start, a
  container host, or a deployed URL? For a feature **not yet released**, this is
  almost always a **local server built from the feature's branch**, not production
  (production doesn't have the feature yet).
- **Isolation model:** does the backend share a real database (so mutating tests must
  use disposable clones), or is it seeded/reset per run?

Capture these as the facts every later phase depends on. `references/e2e-playbook.md`
explains each concept generically; the Diolog file is one concrete instantiation.

### 1. Gather the spec — read everything before writing anything

- Pull the **requirements source in full**, plus any comments/addenda/sub-issues —
  they often record what shipped vs what's deferred. Use the tracker's MCP/CLI if
  it's an issue; read the file(s) if it's a spec/plan.
- Read the **plan / gap-analysis** doc the user points at (often under `docs/plans/`
  or the repo root). These tell you what was actually built and what is knowingly
  partial.
- Read the **implemented code** for the feature: the page/route, the components, the
  state store, and the API/BFF routes it calls. This is how you learn the *real*
  capabilities to test (the store actions, the element kinds, the endpoints) and
  distinguish "built" from "spec'd-but-deferred". Delegate the breadth-read to an
  `Explore`/`general-purpose` subagent when it spans many files — ask for exact
  file:line + selectors, not prose.

### 2. Build the AC-traceability matrix FIRST

Enumerate **every acceptance criterion** from every requirement source (and the gap
doc), and map each to the test case(s) that will verify it, with a status: ✓ covered ·
◑ partial · ✗ gap/deferred. This matrix is the plan and the deliverable's spine — it
goes at the top of the test-plan markdown. Writing it first forces complete AC
coverage and exposes the gaps (deferred features, multi-client flows, backend-only
ACs) honestly instead of letting "what's easy to click" drive coverage. Template +
worked example are in the playbook reference.

### 3. Ground selectors + data against the live page

Now open the running app to discover the *real* selectors and data shapes — never
guess them. Authenticate the way this project does (Phase 0), set the correct
tenant/account context, go to the feature route, and probe the actual interactive
flows and the API payloads. Use `playwright-cli` (preferred) or the Chrome MCP
(`mcp__claude-in-chrome__*`). For each AC, find the concrete affordance (role+name, a
`data-*` hook, the real menu items, the persisted shape) — and the **API/response
shape you'll assert against** (the field, its enum values over the wire, the mutation
that proves persistence). Capture the traps the playbook documents (substring +
repeated-affordance collisions, context-menu hover-flyouts, overlap on canvas, async
render, optimistic temp ids). If a required surface 404s, the feature flag/context is
probably wrong — fix that first; and find the **account that actually holds the seeded
data** (often not the default). Live grounding is session-fragile: refs go stale and
the session drops on idle — prefer raw DOM-eval queries, re-authenticate after gaps,
and confirm capabilities at the API level (a clean create/read via the API is your
source of truth).

### 4. Author the specs in the repo's harness — matching its conventions exactly

Write specs where this project keeps them (e.g. an `e2e/tests/<area>/` tree) and a
companion `test-plan/<area>.md` (led by the AC matrix). Match the existing harness
1:1 — fixtures, projects, any error/console guard, isolation. Key authoring rules
(full detail + worked patterns in `references/e2e-playbook.md`):

- **Selectors:** role + accessible name first; `data-*` where there's no name;
  `{ exact: true }` whenever a name is a substring of another ("Present" ⊂
  "Presentation actions…", "5 slides" ⊂ "15 slides"). Never ship brittle CSS/xpath
  from codegen.
- **Assert the requirement, deeply.** The AC is "a chart renders", so assert the
  chart *draws* (an svg/canvas with geometry) — not that a chart element exists.
  "Every figure sourced" → assert the source tag actually shows. Shallow
  "element added" checks pass while the feature is visibly broken; that's the gap
  the user cares about.
- **Isolation:** mutating cases operate on a **disposable clone** of seeded data (or
  self-clean via the same UI/API), never on shared/seeded records. The suite must be
  green on a re-run. Tag cases `@read-only` / `@mutating` / `@no-live` and serialize
  mutating describes.
- **Context:** drive the right tenant/account via a dedicated setup/storageState
  project, not in-session switching (it's session-fragile).
- **Case IDs carry the AC.** Title each test with a stable ID (`AREA-012`) and map
  it in the matrix, so a failure points straight back to the criterion it broke.

### 5. Run + stabilize

Run with the repo's own command (whatever Phase 0 found — e.g. a `test:e2e:<area>`
script, or `playwright test --project=<area>`). Iterate on failures: fix
selector/timing issues; reframe assertions that are *environment*-fragile (not
bug-fragile) to the robust signal (e.g. assert the immediate UI/canvas effect rather
than a state a known local-only sync quirk corrupts); scope-allow genuinely
pre-existing app-shell console noise to the suite (never weaken a global
zero-console-errors guard, if the harness has one). A green run must mean the ACs
hold, not that the asserts were watered down. **Run the full suite TWICE** — flakes
(optimistic-id timing, parallel-load 5xx, leftover state) only surface on the second
run, and green-twice also proves isolation.

### 6. Catch bugs — and fix the tractable ones

When a content/AC assertion fails on a **real defect**, that is the suite doing its
job — and the red assertion is the reproduction. Decide:
- **Tractable fix** (a one-liner, a missing default, a wrong env value, a missing
  feature-detect) → fix the product code minimally — only the lines that fix it, in
  the existing style — re-run, and let the guard go green.
- **Deep/risky bug** → encode it as a regression guard: `test.fail()` (documents +
  asserts the bug, stays green, auto-flags when fixed) or `test.fixme()` if the
  environment blocks reliable detection, each with a precise comment. Report it.

The playbook's **recurring real-bug classes** section catalogues the defects these
suites keep finding (enum name-vs-value, secure-context APIs on plain HTTP, a form
default captured before its data loads, an action wired to store state but not
mounted on the sub-route, a shortcut that mutates state without navigating,
header/contract mismatches) — read it, because each is invisible to an "element
exists" test. Crucial discipline: before calling something a product bug, **confirm
at the API level** (e.g. the same op via the API succeeds ⇒ the defect is the UI
path, not the backend). Don't mislabel a test artifact (optimistic-id timing, a stale
ref, a wrong locator) as a bug — or claim a fix you couldn't actually land.

Always end by reporting: the final pass/skip/fail counts, the AC coverage (what's
covered / partial / gap), every bug found (fixed vs open), and the file inventory.

---

## What "good" looks like

- The **AC matrix** is the centerpiece — a reviewer can see every criterion and how
  it's verified. No criterion is silently uncovered; gaps are named with a reason.
- Tests assert **outcomes**, not chrome. "Adding a chart draws a chart with data."
  "The deck's real text renders on the canvas." Not "a chart element is present."
- The suite is **re-runnable and isolated** — it never corrupts seeded data and is
  green twice in a row.
- Real bugs are **surfaced** (and the easy ones fixed, surgically), because a test
  that only ever passes is decorative. Catching the broken chart is the whole point.
- It reads as if it were **written by this project's team** — same harness, fixtures,
  selectors, and run command, not a bolt-on from another repo.

## Anti-patterns to avoid

- Driving coverage from the DOM ("I see a button, I'll test the button") instead of
  from the ACs. You'll miss requirements and over-test trivia.
- Asserting presence where the AC demands behaviour ("element exists" for "chart
  renders").
- Assuming a stack — hardcoding a base URL, a login flow, or a run command instead of
  discovering the project's own (Phase 0).
- Building a parallel test framework the repo doesn't have, or "improving" product
  code while fixing a bug. Match and stay surgical.
- Mutating seeded/shared data, or leaving test data behind — the next run goes red.
- Guessing selectors or pasting codegen CSS — they break on the first re-render.
- Watering down an assertion to make a red turn green when the red was a real bug.

When you need the concrete patterns — the selector-trap catalogue, the isolation/
clone helpers, the content-render assertion patterns, the AC-matrix template, the
recurring real-bug classes, and the run-twice discipline — read
**`references/e2e-playbook.md`**. For the Diolog web repo specifically, the optional
**`references/diolog-e2e-harness.md`** gives the exact harness facts, auth/tenant
recipe, and the worked `presentations` + `quorum` examples.
