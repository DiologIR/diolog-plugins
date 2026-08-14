---
name: acceptance-e2e
description: >-
  Use this skill whenever the user wants end-to-end UI tests for a web feature derived from its requirements — e.g. "write e2e tests for TICKET-123", "create an e2e test suite for the presentations page from the ticket and plan", "test the calendar feature at <url> against its acceptance criteria", "the chart element looks broken, are we testing for that", "add e2e coverage for this feature and run it", or any request that combines a requirements source (an issue/ticket, a spec or plan*.md, or a written description) with a live/local app and "create tests", "test coverage", "e2e", "acceptance tests", "verify the feature works". Turns the requirements + the running app into an acceptance-criteria-traceable suite in the project's OWN e2e harness, runs it, then goes PROACTIVE — state-matrix forcing, fault injection, interaction-integrity, keyboard+axe, data-shape stress, security-surface and multi-user sweeps — hands rendered quality to /design-review, fixes the tractable bugs, and promotes every sweep into a permanent guard. Carries lanes for native apps (Maestro/XCUITest), MCP servers (agent-driven acceptance), and marketing sites. Project-agnostic: discovers the repo's harness, auth, run command, and base URL. Reach for it even when the user only names the issue or the URL and not "e2e" explicitly.
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

This skill assumes **`node:test` driving Obscura over CDP** as the default runner
(adapt if the repo already uses another). It does **not** assume any particular app:
**Phase 0 discovers** the project's harness, auth model, tenant/context model, run
command, and base URL. The
portable method + full pattern catalogue lives in **`references/e2e-playbook.md`** —
read it before writing specs. If you happen to be in the Diolog web repo, the
optional **`references/diolog-e2e-harness.md`** carries the exact recipes and two
worked examples for that specific stack.

## Operating discipline — five habits that keep the suite honest

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
- **Name the axes you did not vary.** Coverage is a cross-product, and an assertion
  count hides which axes were held constant. One product's generator suite ran **524
  assertions over 13 tenants** and never opened a route other than `/`, a viewport
  under 1280px, or a build other than the reference one — so it stayed green for
  months while every *generated* tenant shipped with no header, no navigation and no
  footer, five pages measuring zero internal links and a single tab stop. Put the axes
  in the AC matrix (which record/tenant, which route, which viewport, which role), and
  where you deliberately held one fixed, say so in the report rather than letting the
  assertion count imply a breadth it does not have.

## The method

Work the phases in order. Phase 0 grounds you in the project; phases 1–2 are about
the *requirements*; phase 3 is where the live page enters; phases 4–5 build and run
the AC suite; **phases 6–7 are the proactive layer** — the sweeps that find what no
AC named, and the rendered-quality handoff; phase 8 fixes; phase 9 makes it stick.
Don't skip ahead to clicking around the UI — you'll write shallow "the button
exists" tests instead of "the feature satisfies AC-7" tests. And don't stop at
phase 5: an AC suite proves the feature does what was asked; the sweeps prove it
survives what nobody asked about, which is where most field defects live.

| # | Phase | Output |
|---|---|---|
| 0 | Discover conventions + coverage axes | the facts + the declared sample |
| 1 | Gather the spec | requirements in full |
| 2 | AC-traceability matrix | the suite's spine |
| 3 | Live grounding + data seeding | real selectors, shapes, edge seeds |
| 4 | Author the specs | the AC suite |
| 5 | Run + stabilize + assertion-strength gate | green-twice, honest |
| 6 | **Proactive sweeps** (`references/proactive-sweeps.md`) | defects no AC named |
| 7 | **Rendered-quality handoff** — `/design-review` | judged visual/a11y findings |
| 8 | Catch bugs — fix the tractable | fixes + regression guards |
| 9 | **Guard promotion** | sweeps → permanent CI/pre-push gates |

### 0. Discover the project's conventions — never assume a stack

Before anything else, learn how *this* repo does e2e, so you extend it rather than
impose a foreign shape:
- **Requirements source:** how are requirements tracked here — an issue tracker
  (Diolog Tasks/Jira/GitHub issues, via its MCP or CLI), local `docs/specs` + `docs/plans`
  markdown, or just the description the user handed you? Identify it and pull it in
  full (Phase 1).
- **The e2e harness:** find the existing test setup — the runner, its config, the
  fixtures, the existing specs, and the **run command** (search `package.json` scripts,
  a `Makefile`, CI config). Match its layout and conventions exactly. If the repo has
  **no** e2e harness yet, set up a minimal `node:test` + Obscura one following its
  structure (playbook §9) and say so in your report — don't over-build it.
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

**Then enumerate the coverage axes and declare the sample.** A feature's correctness
space is a cross-product — surface × state (empty/loading/error/partial/populated/
over-full) × viewport × theme × role × user-count × data shape × input modality ×
network condition — and full coverage is infinite, so sampling is inevitable; *silent*
sampling is the failure. At Phase 0, list the axes this feature genuinely varies on,
pick the cells you will cover (each axis once + the high-risk intersections: dark ×
mobile, long-data × narrow column, error × modal, viewer-role × write surface), and
write the choice into the test plan. A declared sample is a finished plan for those
cells; an undeclared one is an unfinished plan for all of them. These axes feed the
matrix columns (Phase 2), the seeds (Phase 3), and the sweeps (Phase 6).

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

### 3. Ground selectors + data against the live page — and seed the shapes

Now open the running app to discover the *real* selectors and data shapes — never
guess them. Authenticate the way this project does (Phase 0), set the correct
tenant/account context, go to the feature route, and probe the actual interactive
flows and the API payloads. Use `obscura serve --port 9222` over CDP (preferred), or `obscura mcp` when you need a
session that survives a click. A local app needs the global `--allow-private-network`
flag *before* the subcommand, or every navigation fails as an SSRF block. For each AC, find the concrete affordance (role+name, a
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

**Seed the data-shape axis now, via the API — never the UI.** The Phase 0 axes named
the shapes the feature must survive (long, many, zero, unicode/emoji, null-optional,
malformed); create them here as stamped, cleanable fixtures so Phase 4's specs and
Phase 6e's stress sweep have something real to run against. Fixtures are predicates,
not proper nouns — "a record with a 200-char name", created if absent (playbook §3).

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
- **Three oracles, deliberately.** Behavioural assertions carry the ACs; a **scoped
  aria snapshot** (`toMatchAriaSnapshot` on the component/region, never the page)
  pins semantic structure where the AC is structural; a pixel screenshot only where
  the AC is genuinely visual and the environment is pinned. Time-dependent UI uses
  `page.clock` instead of waiting; forced states ride request interception. Vision-
  model judgment never gates — that lens belongs to Phase 7's `/design-review` call.

### 5. Run + stabilize

Run with the repo's own command (whatever Phase 0 found — e.g. a `test:e2e:<area>`
script, or `node --test e2e/<area>/`). Iterate on failures: fix
selector/timing issues; reframe assertions that are *environment*-fragile (not
bug-fragile) to the robust signal (e.g. assert the immediate UI/canvas effect rather
than a state a known local-only sync quirk corrupts); scope-allow genuinely
pre-existing app-shell console noise to the suite (never weaken a global
zero-console-errors guard, if the harness has one). A green run must mean the ACs
hold, not that the asserts were watered down. **Run the full suite TWICE** — flakes
(optimistic-id timing, parallel-load 5xx, leftover state) only surface on the second
run, and green-twice also proves isolation. Flake discipline is now yours to wire
rather than a runner flag: **poll for a condition, never sleep** — every wait is a
`while` loop over a `Runtime.evaluate` with a deadline, and a bare `setTimeout` in a
spec is the thing to ban in review. `node --test` gives no retries and no
`--fail-on-flaky-tests`, so a flaky spec is a spec to fix or delete, not to quarantine;
run the suite twice in CI and treat any disagreement between the two runs as the flake
signal the runner used to give you.

**What converting off `@playwright/test` costs, stated plainly:** no fixtures (shared
setup is a `before`/`after` in each spec file or a helper you import), no auto-retry of
a failing test, no parallel workers (`node --test` runs files concurrently but there is
no worker-scoped identity or sharding), no HTML reporter, and no trace viewer — a
failure gives you the assertion and whatever you screenshotted, not a timeline you can
scrub. Budget for more explicit screenshots at the point of failure, because there is
no trace to go back to.

**A committed spec carries its run record — "authored, not run locally" is a defect, not a caveat.** Never commit a spec file whose run output you have not captured: the commit (or the run report) must carry the pass/fail counts of an actual execution, and a suite committed unrun must be assumed red — one real suite shipped that way sat red for 14 days encoding the exact acceptance criterion a later fix needed, and nobody knew. Same discipline for `test.fixme`/`test.fail`: each carries a precise comment naming the bug/ticket and the un-fixme condition, and a fixme whose *assertion encodes a since-reversed requirement* must be rewritten or deleted, never left hiding — it reads as coverage while asserting the old world.

**Assertion-strength gate (after green-twice).** Stabilization is exactly where a
suite quietly goes hollow — each individual reframe is defensible, and the sum stops
proving anything. So once the suite is green twice, run one strong-model pass that
reads the FINAL suite (and its diff against the first authored version) and answers,
per test: does it assert the AC's promised **outcome** — data rendered, state
changed, effect delivered — or mere element presence/chrome? And **was any assertion
weakened during stabilization?** Every weakening requires a written justification in
the run report (what changed, why the original signal was environment-fragile, what
still proves the AC); a hollow assertion is strengthened and the suite re-run to
green-twice. A suite that's green because it asserts chrome is decoration, not
coverage.

**Model routing:** Phases 0–4 and 6 (discovery, the AC matrix, live grounding, spec
authoring, the sweeps) may run on a cheaper model; the Phase 5 stabilization judgment —
including this gate — and Phase 8 product-bug fixes stay on the strongest model.
The gate's reviewer must be at least as strong as whatever authored the specs. The
`/design-review` call (Phase 7) carries its own routing.

### 6. Proactive sweeps — find what nobody wrote an AC for

The AC suite proves the feature does what was asked; these sweeps prove it survives
what nobody asked about. Seven, each driven-and-asserted, each scaled to the feature
(a copy tweak gets none; a new data surface gets 6a–6e; anything collaborative or
permissioned gets all seven), each recorded as ran / skipped-with-reason:

- **6a State matrix** — force empty/loading/error/partial/over-full via interception
  and seeds; assert the honest component (guiding empty state, skeleton-not-sample
  loading, error-that-names-the-fix) and recovery.
- **6b Fault injection** — forced 4xx/5xx/aborts/delays/offline; retry works; no
  infinite spinner; partial failure degrades; double-submit fires once.
- **6c Interaction integrity + reactivity** — no dead controls (enumerate and
  activate every interactive element, assert an observable effect); overlay lifecycle
  (open/close/Esc/backdrop/focus-restore/trap); every CRUD mutation reflects live
  without reload, persists at the API, and rolls back visibly on server error.
- **6d Keyboard + a11y floor** — keyboard-only primary journey; axe zero
  serious/critical per surface *and per forced state*, measured on a settled page.
- **6e Data-shape stress** — re-run the surface over the Phase 3 edge seeds; no
  crash/NaN/raw-value leaks; ellipsised truncation; bounded DOM on big lists; no
  horizontal document scroll.
- **6f Security surface** — forged privileged action rejected server-side; IDOR
  probe; realtime-channel authorization; DOM/console/URL secrets scan; one
  injection payload rendered inert end-to-end.
- **6g Multi-user / realtime** — two authenticated contexts; live cross-account
  reflection, presence, share/revoke, permission changes — without refresh.

Full detection mechanics, assertion patterns, and the scale rules are in
**`references/proactive-sweeps.md`** — read it before running the phase. Sweep
findings route into Phase 8 like any red assertion; sweep specs are Phase 9's input.

### 7. Rendered-quality handoff — call `/design-review`

The sweeps assert *behaviour*; they deliberately do not judge how the result *looks*.
When the feature has meaningful UI (any new or visibly changed surface), invoke the
**`/design-review`** skill on the primary surfaces — it runs its own worklist-contract
pipeline (deterministic WCAG/contrast/motion/layout-integrity gates, structural render
at the viewport matrix, the nine-state matrix, component inventory, craft, flow and
systematisation passes) and returns severity-ranked findings with evidence. Feed it:
the surface list (from Phase 0's axes), the auth recipe, and the forced-state
URLs/fixtures built in 6a so its state stage sees the states you can force. Where the
feature has a design-of-record (an HTML mock, DESIGN.md), also point it at the
parity/mock question (its `parity-oracle.md`) or run the `mockup-fidelity` skill —
agreement with the mock is measured on the rendered tree, never eyeballed.

Triage its findings like sweep reds: functional defects (a dead control it found, a
contrast gate, a state that dead-ends) go to Phase 8; judged visual findings ride the
report with their severity for the human. Do not re-litigate its gates here, and do
not duplicate its stages in specs — the suite asserts behaviour forever; the review
judges rendering at this milestone. If `/design-review` is unavailable, say so in the
report — its absence is a named coverage gap, not a silent skip.

### 8. Catch bugs — and fix the tractable ones

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

### 9. Guard promotion — every sweep becomes a permanent gate

A sweep run once is a snapshot; the value is the check that runs forever. Promote by
default: every sweep assertion that found a defect becomes a tagged spec in the
suite, plus the starter set (no horizontal document overflow per route · loading
paint contains no sample data · a create reflects without reload · overlay
opens/closes/restores focus · axe zero serious/critical · forced-500 shows an honest
error · console+network clean · cross-account reflection and forged-action rejection
where they apply). Two rules with teeth: **a gate the branch adds must be invoked by
something** — a spec or checker with no `package.json` script, CI step, or pre-push
hook running it is documentation, not a gate; point at the line that runs it or wire
it in now. And **new surfaces inherit by enumeration** — iterate the router/manifest,
not a hand-list, wherever possible. Details + the promotion record format:
`references/proactive-sweeps.md` §Phase 9.

Always end by reporting: the final pass/skip/fail counts, the AC coverage (what's
covered / partial / gap), **which sweeps ran and what they found (or skipped, with
reasons)**, the `/design-review` verdict + finding counts (or its absence, named),
every bug found (fixed vs open), the guards promoted and what invokes them, and the
file inventory.

---

## Project-type lanes — same method, different harness

The phases above assume a browser app. The portfolio this skill serves also ships
native apps, MCP servers, and content sites; the *method* (AC-first, drive-and-assert,
sweeps, guard promotion) transfers — the harness changes:

- **Native apps (Expo / SwiftUI — iOS, iPadOS, macOS).** The runner is **Maestro**
  (iOS Simulator; YAML flows against a DEBUG fixture build that boots signed-in and
  seeded) and **XCUITest** (macOS — Maestro cannot drive it; and everywhere
  `performAccessibilityAudit()` is the 6d gate: contrast, Dynamic Type, clipped text,
  labels, hit-region ≥44pt). **Navigate deep-link-first** — every `maestro test` pays
  a ~15–20s driver-startup tax, so reach screens via `xcrun simctl openurl <SIM>
  "<scheme>://<route>"` and reserve Maestro for assertions and the taps a deep link
  can't reach, batched into one flow. States and data shapes ride the fixture's
  launch flags; multi-user = two Simulators; structural facts come from the
  accessibility tree (`axe describe-ui` / Maestro hierarchy / `app.debugDescription`),
  since native has no `getComputedStyle`. A green flow asserts behaviour + geometry
  only — rendered quality still goes to the fidelity/design-review layer.
  **When XCUITest is structurally unavailable** — a SwiftPM app with no `.xcodeproj`
  has no target to put it in — the macOS runner is the app's own **Accessibility
  tree**, driven via System Events / `AXUIElement`, with a launch-flag fixture mode
  for determinism (it also reaches surfaces without stealing foreground focus).
  Read **`references/macos-ax-acceptance.md`** before writing one: it carries the
  assert-actions-not-just-identifiers rule (an identifier can sit on a *label*, so
  all 13 sidebar ids resolved while none could be activated), the fixture-must-match-
  real-data rule (a spend panel passed every gate while rendering `$0` for 100% of
  real traffic), and seven measured traps — zombie-instance activation, unbound
  `entire contents` reading zero, App Translocation zeroing the tree under `$TMPDIR`,
  and the rest — each of which produced a confident wrong diagnosis first.
- **MCP servers (FastMCP/TypeScript).** The hermetic vitest tier is unit testing, not
  acceptance. Acceptance = **drive the built server through a real MCP client** — the
  Claude Agent SDK or a scripted `claude` CLI session against the stdio binary — and
  assert: every tool is discoverable and callable from its description alone (the
  description IS the UI); schema round-trips hold on real payloads; confirm/dry-run
  gates actually block a spending or destructive call without `confirm:true`; spend
  ceilings and rate caps trip; error results are actionable prose, not stack traces;
  and prompt-injection hygiene holds (tool results carrying hostile instructions are
  wrapped/inert). The sweeps translate: 6b = kill the backend/expire the key
  mid-call; 6e = oversized and malformed tool inputs; 6f = the write-gating env flag
  off ⇒ writes refused.
- **Marketing/content sites.** These routinely have an e2e harness installed and
  unused — stand the lane up: every route × 4 viewports loads clean (console + network),
  links resolve, one h1 and sane heading order per page, meta/OG present, and the
  content-grounding invariant where the site makes claims (every figure/claim has a
  source row; unconfigured data renders an honest empty state, never an invented
  number). Then `/design-review` for the rendered quality. This whole lane is
  Phase 9 material — it should run on every deploy, not once.

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
- The report shows **what was swept, not just what was specced** — states forced,
  faults injected, controls enumerated, roles crossed — and which sweeps were
  skipped, with reasons. Proactivity you can audit.
- The engagement leaves **guards behind** — the sweeps that found something run on
  every push, invoked by a named script, and new surfaces inherit them by
  enumeration.

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
- Stopping at the AC suite — a green AC run over an unswept feature certifies the
  happy path and nothing else; the sweeps are the phase where the field defects are.
- Judging visual quality by eye inside specs (or duplicating /design-review's gates
  as assertions) — behaviour lives in the suite, rendered judgment in the review.
- Leaving the sweeps as a one-off — an unpromoted sweep is a snapshot that starts
  rotting the day the engagement ends.

When you need the concrete patterns — the selector-trap catalogue, the isolation/
clone helpers, the content-render assertion patterns, the AC-matrix template, the
recurring real-bug classes, and the run-twice discipline — read
**`references/e2e-playbook.md`**. For the proactive layer — the seven sweeps'
detection mechanics and the guard-promotion rules — read
**`references/proactive-sweeps.md`**. For the Diolog web repo specifically, the
optional **`references/diolog-e2e-harness.md`** gives the exact harness facts,
auth/tenant recipe, and the worked `presentations` + `quorum` examples. For a
**macOS app XCUITest cannot reach**, read
**`references/macos-ax-acceptance.md`** — the Accessibility-tree runner, the
fixture-mode determinism pattern (which also keeps a test run out of the
foreground), and the measured traps that make an AX harness report a broken app
when the harness is what is broken.
