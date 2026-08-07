# Proactive sweeps — finding what nobody wrote an AC for

Phase 6 of the skill. The AC suite (Phases 2–5) proves the feature does what was asked. These
sweeps prove it survives what nobody asked about — the states, faults, inputs, and second users
that produce most field defects. Each sweep is **driven and asserted** (a repeatable spec or a
recorded probe, never an eyeball), each has a detection mechanism an agent can execute, and each
ends in Phase 9 as a permanent guard when it finds anything.

Method contract (adapted from the portfolio QA plan): **automate the finding, not just the
fixing** — a human is never the crawler; **measure the render, never the intent** — source tells
you what a component declares, not what rendered; **guard everything you fix** — a sweep that
found a defect becomes a CI/pre-push check so the class cannot silently return.

Scale to the feature: a copy tweak gets none of this; a new data surface gets 6a–6e; a
collaborative or permissioned surface gets all seven. Record which sweeps ran and which were
skipped-with-reason in the run report — a skipped sweep is a declared decision, not a silence.

## 6a — State-matrix sweep

Every data surface answers **empty · loading · error · partial · populated · over-full**
gracefully. Shipping only the populated state is the most reliable failure in AI-built UI.

- **Force each state; never wait for it to occur.** Empty: seed a user/tenant with no data, or
  intercept the list call and fulfil `[]`. Loading: delay the route
  (`page.route(url, r => setTimeout(() => r.continue(), 3000))`) and capture the loading paint.
  Error: fulfil with 500. Partial: fail ONE of the surface's several calls, leave the rest.
  Over-full: seed far past the design's assumption (10,000 rows in a list built for 50; a
  200-char name; a 999+ badge).
- **Assert the honest component, not the absence of a crash.** Empty states must expose the next
  action (not dead-end); errors must name what happened and offer retry (never blank, never
  blame); loading must be a skeleton or labelled spinner — **and never sample/placeholder data
  dressed as real** (capture the loading paint and grep it for recognisable sample markers; this
  is the loading-honesty gate).
- Where the repo's design language defines these states (a mock, DESIGN.md), the *behavioural*
  assertion lives here and the *visual* judgment belongs to the `/design-review` call (Phase 7)
  — its state-matrix stage covers nine states including offline/disabled/success; don't
  duplicate its judging, do give it the forced-state URLs/fixtures you built here.

## 6b — Fault-injection sweep

The UI's error paths are code too, and they ship untested by default because nothing exercises
them locally. Force them:

- **HTTP faults:** `page.route` per API route → fulfil 400/403/500, abort (`route.abort()`),
  and delay past the client timeout. Assert: honest error + retry affordance; retry actually
  re-fires the request (intercept-count it); no infinite spinner (bound every loading state
  with a timeout assertion); no blank screen; console stays clean of unhandled rejections.
- **Offline:** `context.setOffline(true)` mid-session → the app says so; actions attempted
  offline are queued-or-refused visibly, never silently lost; `setOffline(false)` recovers.
- **Slow network:** throttle and confirm the loading treatment appears (a sub-300ms flash
  suppressed; a long wait labelled) — this is where loading honesty (6a) is actually observable.
- **Double-submit:** click/tap the primary mutation twice rapidly; assert exactly one effect
  (intercept and count the POSTs). The classic state-machine failure: the button must disable
  on first activation.
- **Partial degradation:** on a dashboard of N widgets, fail one source; the other N−1 render
  and the failed one degrades honestly.

## 6c — Interaction-integrity + reactivity sweep

- **No dead controls.** Enumerate the surface's interactive elements from the accessibility
  tree (`getByRole('button'|'link'|'tab'|'menuitem'|…)` — or an aria snapshot of the surface),
  activate each, and assert an observable effect within a timeout: navigation, an overlay, a
  request fired, a state change, or a toast. An element with no effect is a defect, not a
  curiosity. (Cap the sweep sensibly on huge surfaces: every control in the primary task path +
  every control type once.)
- **Overlay lifecycle.** Every modal/sheet/dropdown/popover opens AND closes via its control,
  Esc, and backdrop; focus moves in on open and returns to the trigger on close; Tab cycles
  inside an open modal (trap) and never escapes to the page behind.
- **Reactivity (the classic "persists but doesn't reflect").** For each CRUD mutation the
  feature owns: perform it in the UI, then — **without reload** — assert the list/detail
  reflects it; then re-read via the API to confirm persistence; then reload once to confirm the
  server state renders the same. Delete completes the square (create/read/update/delete each
  get this treatment). Optimistic updates get the rollback case: fulfil the mutation with 500
  and assert the UI reverts visibly, never silently.

## 6d — Keyboard + accessibility sweep

- **Keyboard-only journey** through the primary flow: Tab order is logical, focus is always
  visible, Enter/Space activate, Esc dismisses, arrow keys work in menus/lists/tabs, and there
  is no trap outside intentional modal traps.
- **Automated a11y gate:** run axe (`@axe-core/playwright`) per surface — and per forced state
  from 6a, since an error banner or empty state can introduce its own violations. Bar: **zero
  serious/critical** per surface; scoped, documented exclusions only for known third-party debt.
  Never sample mid-animation — settle the page first (drain animations / wait for idle), or the
  contrast numbers are confidently wrong.
- Native lane: `performAccessibilityAudit()` per screen (XCUITest) is the equivalent gate —
  contrast, Dynamic Type, clipped text, labels, hit-region ≥44pt (see the native lane in
  SKILL.md).
- The deeper judged passes (semantic structure, screen-reader flow, WCAG 2.2 specifics) belong
  to `/design-review`'s accessibility gates — this sweep is the fast deterministic floor the
  suite re-runs forever.

## 6e — Data-shape stress sweep

Seed via the API/store (never the UI) the shapes real data will take, then re-run the surface's
render + key assertions over them: **long** (200-char titles, 35%-expanded locale text),
**many** (pagination boundary and past it), **zero/negative/huge numbers**, **unicode + emoji +
RTL fragments**, **null/missing optional fields**, and one or two **malformed** rows if the
store permits. Assert: no crash, no `undefined`/`NaN`/raw-ISO-date leaking into copy, truncation
is ellipsised not clipped, virtualised lists actually virtualise (DOM node count stays bounded),
and the layout survives (defer *how it looks* to Phase 7; assert here that content is present
and the page has no horizontal document scroll — `documentElement.scrollWidth <= clientWidth`).
Fixtures are predicates, not proper nouns — select "a record with a 200-char name" by property,
creating it if absent, and stamp created records for cleanup (the isolation rules in
`e2e-playbook.md` §3 apply to every seed this sweep makes).

## 6f — Security-surface sweep

UI-adjacent authz is where "hidden ≠ enforced" ships. All of these are cheap to drive from the
existing authed contexts:

- **Forged privileged action:** replay a privileged mutation (captured via interception) from a
  lower-role/other-tenant session's `request` context; assert the **server** rejects it. A
  hidden button is not enforcement.
- **IDOR probe:** take every resource id visible in URLs/payloads and request it from the other
  tenant's context; assert 403/404, not data.
- **Realtime channel authz:** a subscription/SSE/WS channel is an object read — subscribe to a
  foreign resource's channel from the second context and assert refusal (an authorized channel
  is the same class of check as the REST read).
- **Secrets/PII scan:** grep the rendered DOM, console output, and URL query strings of every
  visited surface for tokens, keys, emails-not-owned-by-the-viewer, and internal ids that
  shouldn't leak.
- **Injection smoke:** write a script/HTML payload into one user-content field end-to-end and
  assert it renders inert everywhere it is displayed (list, detail, notification, export).
- Role matrix: for each role the feature distinguishes, one pass asserting the *affordances*
  differ AND the server enforces the difference (the two claims are separate assertions).

## 6g — Multi-user / realtime sweep (collaborative surfaces only)

Two authenticated contexts (A + B; different roles where relevant), asserting **live, without
refresh**: A's mutation appears for B; presence/typing indicators show; A shares → B gains
access; A revokes → B loses it (drive the actual revocation path); a permission change reflects
in B's affordances without relaunch; notifications route to the right user. On native, two
Simulators (or Simulator + device). Where maker≠checker exists, drive it across the two real
sessions — self-approval must fail server-side (this pairs with 6f).

## 6h — Agentic exploratory pass (optional, never a gate)

Where an agent-browser lane exists (Playwright's bundled CLI+Skills/MCP, claude-in-chrome),
one unscripted agent pass over the feature — "accomplish <the user's goal> and report
anything broken, dishonest, or confusing" — finds goal-level defects the scripted suite
can't express. Use it as Slack Engineering's 2026 study places it: **an exploratory top
layer, not a CI gate** ("tests enforce journeys; agents verify goals") — agent runs are
1-2 orders of magnitude slower and costlier than deterministic replays and are
non-deterministic by construction. Two disciplines make it safe: every agent finding is
**converted to a deterministic spec** (or a filed bug) before it counts — an agent
transcript is a lead, not coverage; and self-healing/generated selectors ship only
through a human-reviewed diff — of Playwright's official agents, independent review
endorses the healer; treat planner/generator output as drafts requiring the Phase 5
assertion-strength gate like anything else.

## Current-practice notes (researched 2026-08, panel-corroborated)

Findings from a six-backend research panel (Feb–Aug 2026 window) that shape how the
sweeps are implemented today. Re-verify when the toolchain moves:

- **Three complementary UI oracles, not one:** behavioural assertions for ACs (the
  suite's core) · **scoped aria snapshots** (`toMatchAriaSnapshot`) as the structural/
  semantic oracle — keep them scoped to a component/region; page-wide snapshots are
  unreviewable · pixel comparison (`toHaveScreenshot` in a pinned Docker image, or an
  external service) reserved for genuinely visual surfaces. **Vision-LLM review is
  triage/advisory only — never a merge-blocking oracle** (no rigorous CI case study
  exists; the /design-review call is the sanctioned judged layer).
- **A11y floor specifics:** `@axe-core/playwright` + Playwright's native ARIA
  assertions (`toHaveAccessibleName`, `toHaveRole`, `toHaveAccessibleErrorMessage`);
  `page.accessibility` is removed. Automated rules ≠ WCAG conformance — `target-size`
  is effectively the only automated WCAG 2.2 rule; the judged criteria stay human/
  design-review territory.
- **Flake discipline is now checkable:** web-first assertions only; lint-ban
  `waitForTimeout` and `networkidle` (eslint-plugin-playwright / Biome ship the
  rules); CI runs `retries: 1–2` + `--fail-on-flaky-tests`; quarantine carries a
  fix-or-delete SLA; `retryStrategy: 'isolated'` separates app flake from parallel
  collisions; `--only-changed` gives cheap test-impact selection on PRs. Per-worker
  identities (`test.info().parallelIndex`-keyed accounts) are the official answer to
  shared mutable backends.
- **Deeper isolation when the stack allows:** Postgres → DB-branch-per-PR
  (Neon-style copy-on-write); MongoDB has no native branching → Testcontainers
  single-node replica set (`?directConnection=true`; transactions + change streams
  work); otherwise the per-worker-tenancy + stamped-fixture rules in the playbook.
- **Contract layer to stabilise UI suites:** MSW for browser/Node request mocking in
  component-level and state-forcing work; WireMock for stateful third-party
  simulation and failure modes; Pact only where independently deployed consumers make
  consumer-driven contracts worth their ceremony. A schema check is not proof a real
  consumer sends valid requests.
- **Generative techniques, scoped:** fast-check model-based/property tests for
  critical client state machines; Schemathesis fuzzing where an OpenAPI/GraphQL
  schema exists (feeds 6b/6e with generated hostile inputs); mutation testing
  (Stryker) validates unit/component suites — too expensive to gate E2E.
- **Native lane specifics:** Maestro is the Expo-era default (EAS Workflows carries a
  `maestro` job; its `assertWithAI` defaults to non-blocking — copy that hedge: AI
  assertions advise, deterministic ones gate); XCUITest + `performAccessibilityAudit`
  remains the SwiftUI/macOS path. Durable-artifact pattern: an agent may author the
  YAML; CI replays it deterministically.

## Phase 9 — Guard promotion (every sweep becomes a gate)

A sweep run once is a snapshot; the value is the permanent check. At the end of the engagement:

1. **Promote by default.** Every sweep assertion that found a defect becomes a tagged spec
   (`@sweep`) in the suite. The starter set even when nothing was found: no horizontal document
   overflow per route · loading paint contains no sample data · a create reflects without
   reload · overlay opens+closes+restores focus · axe zero serious/critical · forced-500 shows
   an honest error · console+network clean per route · (collaborative) cross-account reflection
   · (permissioned) forged-action rejection.
2. **A gate the branch adds must be invoked by something.** A spec, script, or checker with no
   `package.json` script, CI step, or pre-push hook running it is documentation, not a gate —
   point at the line that runs it, or wire it in on this branch (ship-feature's pre-merge gate
   enforces the same rule).
3. **New surfaces inherit by enumeration.** Where possible the guard iterates the router/route
   manifest rather than a hand-list, so the next surface is covered the day it exists.
4. Record the promotion in the run report: which sweeps → which specs → invoked by what.
