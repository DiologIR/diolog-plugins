# Diolog `apps/web/e2e` harness — facts, recipes, worked example

Concrete details for authoring acceptance-criteria e2e suites in the Diolog web
repo. Read the section you need; you don't need all of it at once.

## Contents
1. Harness layout + run commands
2. Auth + tenant (company) context
3. Selector conventions + the trap catalogue
4. The zero-console-errors guard + scoped allowlists
5. Isolation: disposable clones, cleanup, no shared-data mutation
6. Content-render correctness — assertion patterns
7. AC-traceability matrix template
8. Worked example: the `presentations` suite (and the bugs it caught)
9. Environment gotchas worth knowing

---

## 1. Harness layout + run commands

- **Base URL:** `http://diolog.ai` (Docker reverse proxy on :80) — never
  `localhost:3000`. The app must be up (`./scripts/dev-docker.sh status`).
- **Framework:** Playwright (`@playwright/test`). Single config:
  `apps/web/e2e/playwright.config.ts` with multiple *projects*.
- **Layout:**
  ```
  apps/web/e2e/
  ├── playwright.config.ts        # projects: setup, chromium, anonymous, + feature projects
  ├── setup/*.setup.ts            # produce storageState (auth) — one per tenant context
  ├── fixtures/
  │   ├── test.ts                 # extended `test`/`expect` — import this, NOT @playwright/test
  │   ├── console-guard.ts        # KNOWN_CONSOLE_ERROR_ALLOWLIST + captureConsole
  │   ├── selectors.ts            # shared role/name anchors
  │   └── <area>.ts               # per-area helpers (API helpers, clone-isolation, allowlists)
  ├── tests/<area>/<area>.spec.ts # one describe per area; titles carry stable IDs (AREA-012)
  └── test-plan/<area>.md         # human-readable plan — LEAD with the AC matrix
  ```
- **Specs import the extended fixtures:** `import { test, expect } from '../../fixtures/test';`
  (gets the console guard + outbound mocks + runId for free).
- **Run:** from `apps/web/` — `pnpm test:e2e` (all), or scope to a project:
  `pnpm exec playwright test -c e2e/playwright.config.ts --project=<area>`. Add a
  convenience script `test:e2e:<area>` for the feature. Use `-g "AREA-001 "` to run
  one case, `--workers=N --reporter=list`. The shared Atlas backend + AI gateway
  flake above ~2-3 workers — pin feature projects to `--workers=2`.
- **Typecheck a spec standalone** (the e2e tsconfig has a broken self-exclude):
  `npx tsc --noEmit --skipLibCheck --strict --moduleResolution bundler --module esnext --target es2022 --types node e2e/tests/<area>/*.spec.ts e2e/fixtures/<area>.ts 2>&1 | grep "error TS" | grep -v "Cannot find module"`.

## 2. Auth + tenant (company) context

- **Dev login:** browse to `/login`, click **"Log in as Luke (dev)"**
  (`getByRole('button', { name: /Log in as Luke/i })`). Lands on `/dashboard` (or
  `/select-company` for a multi-company user) and sets httpOnly cookies
  (`diologAccessToken`, `diologCompanyId`, `diologUserId`, `diologExpiresAt`).
- **storageState, not in-session switching.** Company visibility is scoped to the
  `diologCompanyId` cookie. To test a feature in a specific company, add a **setup
  project** that dev-logs-in, selects that company on `/select-company`, asserts the
  expected `diologCompanyId`, and saves `context.storageState({ path })`. Then add a
  feature project that depends on it and pins `storageState`. Do NOT switch companies
  mid-test (session-fragile). `testIgnore` the feature's tests from the default
  `chromium` (NH3) project so they only run in the tenant project.
- **Default company = NH3** (`696311310c0a6af07874e39a`). The presentations suite uses
  **Telstra** (`6971c5335c36590cc0ccd836`) — verified live via `GET /api/presentations`.
- **playwright-cli for live discovery** (not for persisting auth): `playwright-cli open …`
  resets context — use `goto` for in-session nav. `--raw snapshot` → the role/name
  tree; `--raw eval "<js>"` → run JS / fetch APIs (`fetch(url,{credentials:'include'})`).

## 3. Selector conventions + the trap catalogue

House style is **role + accessible name** (the app has very few `data-testid`s; many
surfaces carry `data-ui="…"` hooks). Order of preference: `getByRole(name)` →
`getByPlaceholder`/`getByText` → `page.locator('[data-ui="…"]')` → other `data-*`.

Traps that bite every suite:
- **Substring name collisions** → `{ exact: true }`. Real examples: `Present` ⊂
  `Presentation actions for …`; `5 slides` ⊂ `15 slides`; `Design` ⊂ `DESIGN.md`
  (case-insensitive); `Back` (nav) vs the panel `Back`. Default name matching is
  case-insensitive substring.
- **Overlapping canvas/abs-positioned elements:** a coordinate `.click({force})`
  lands on the *topmost* element at the point, not your locator. To select a SPECIFIC
  node, dispatch the events on it directly:
  `await node.evaluate(el => { for (const t of ['pointerdown','mousedown','mouseup','click']) el.dispatchEvent(new MouseEvent(t,{bubbles:true})); })`
  (add `shiftKey:true` for multi-select). Elements often expose `data-element-id` /
  `data-element-type` — prefer those for targeting.
- **`window.prompt`/`window.confirm`:** handle with `page.once('dialog', d => d.accept('new'))`
  / `d.dismiss()`. Copy can carry curly quotes (`&rsquo;`, `&ldquo;`) — match with a
  regex (`/Couldn.t load/`, `/Delete .* This cannot be undone\./`).
- **Dialogs in portals:** title via `getByRole('dialog', { name: /…/ })`; the trigger
  button name may be a substring of the dialog title.
- **Async render (charts, heavy widgets):** recharts/dynamic-imported content renders
  after a ResizeObserver tick — give it a generous `toBeVisible({ timeout })`, and be
  aware it can lose a render race against a re-sync (see §9).
- Scope to a region (`page.locator('[aria-label="Properties"]')`) when a control name
  collides with app chrome.
- **Repeated affordances** — the SAME accessible name appears many times (a `New issue`
  in the toolbar AND in every column; three editor surfaces — description vs main
  composer vs an inline reply composer; a `Reply` affordance vs the `Reply` submit). `.first()`/`.last()`
  silently pick the wrong one. GROUND the DOM order, then scope: the visible-text
  toolbar button vs the icon-only column button (`.filter({ hasText: 'New issue' })`);
  the reply composer is the FIRST `.editor` *inside the thread* `data-ui`, the main
  composer is LAST. When unsure which element your text matched, you typed into the
  wrong one (the submit stays disabled — a tell).
- **Case-sensitive regex disambiguates substrings** the default case-insensitive match
  can't: `getByRole('button',{name:/Actions/})` (capital A) matches the bulk `⌘ Actions`
  but NOT `Column actions` (lowercase a).
- **Inline-rename headings render as `<h1 role="button">`** (not a heading role), so
  `getByRole('heading',{level:1})` misses them — locate the `<h1>` by text. And a
  detail body whose first markdown line is `# <same title>` renders a SECOND `<h1>`
  with identical text → `page.locator('h1',{hasText}).first()`.
- **Cascading Radix context menus** (right-click a card / a detail `⋯` "More actions"):
  the menu items expose role+name `menuitem` (the accessible name carries the shortcut
  suffix, e.g. `Status S`, `Favorite ⌥F` — match by prefix `/^Status/`). A submenu opens
  on **`.hover()`** of its trigger, and its options are the shared cmdk `role=option`
  list. A persistent off-screen menu (e.g. a company switcher) can pollute a global
  `[role=menuitem]` query — assert by unique name, not by index.
- **Floating flyout pickers** (bulk Actions sub-pickers) reposition every frame and
  never report "stable" → `.click({ force:true })`, or prefer a DIRECT command (one
  with no flyout) when the AC only needs "a bulk action applied to all selected".

## 4. The zero-console-errors guard + scoped allowlists

The harness fails any otherwise-passing test if the page logged a console error
(`fixtures/test.ts` afterEach asserts `consoleGuard.errors` empty). To tolerate a
*genuinely pre-existing, not-your-feature* error, push a regex to
`KNOWN_CONSOLE_ERROR_ALLOWLIST` (from `console-guard.ts`) — but **scope it**:
- App-shell/dev-server noise that fires on every authed page (e.g. the Next RSC
  inline-`<script>` warning, a global ChakraProvider hydration mismatch) → a suite
  helper called in `beforeAll` (verify it also fires on `/dashboard` first, so you
  know it's not your feature).
- A deliberately-provoked error in ONE test (an injected 500, a shared-component
  warning) → a **restorable** push: `const restore = allow(/…/); try { … } finally { restore(); }`
  so it can't mask a real error in a later test. The guard filters at *capture* time,
  so restoring after the test body (before afterEach) is correct.

Never add hydration/feature errors to the *global* allowlist — that blinds every
other suite.

## 5. Isolation: disposable clones, cleanup, no shared-data mutation

The backend is the shared production-shaped Atlas DB. A mutating test must never
touch seeded/shared records and must leave nothing behind.
- **Clone pattern:** if the feature has a cheap duplicate endpoint (e.g.
  `POST /api/presentations/:id/duplicate`), clone a seeded record, mutate the clone,
  delete it in teardown. Resolve the source from a STABLE seed and **exclude the
  suite's own clones** from source-selection (titles matching `[E2E |Disposable |(copy)`),
  or a parallel test deleting its clone 404s yours.
- **Self-clean via the UI/BFF** otherwise: a `CleanupRegistry` that drains LIFO in
  `afterEach`, driving the same delete path the user would (never a raw DB write).
- Stamp created records with a greppable label (`[E2E <runId>]`) so leftovers are
  findable. Assert run-scoped uniqueness, not global counts (parallel tests change
  totals).
- API helpers run on `page.request` / the test `request` fixture (both carry the
  project's storageState cookies): `const res = await request.post('/api/graphql-proxy', { data: { query } })`.
- **Optimistic + durable-queue surfaces (local-first features).** When the UI applies a
  mutation optimistically with a `temp-…` id and flushes the real write asynchronously:
  - Verify persistence by **polling the API** (`expect.poll`) or by asserting the
    **immediate UI effect**, never a same-tick API read.
  - **Acting on a just-created entity by its optimistic temp id fails** — replying to a
    comment you just posted / reacting to it sends an unresolvable `parentId`/`commentId`
    ("… not found"). FIX: **seed the dependency via the API (real id) BEFORE opening the
    page**, so it renders with a server id — then drive the child action in the UI.
  - **`page.reload()` to force a real id can abort an in-flight background mutation** →
    a `Failed to fetch` console error that trips the zero-console guard. Prefer
    seed-before-open over reload.
- **Concurrent create id-allocation race.** Per-tenant auto-increment ids (e.g. issue
  `number`) aren't always atomic — parallel mutating specs collide on the unique index
  (`E11000 duplicate key`). Retry the create in the helper on `/E11000|duplicate key/`
  (an infra race, not an assertion failure).
- **No delete endpoint?** Some entities (e.g. a project) have create but no delete
  mutation — committing one pollutes the shared board permanently. Assert the create
  *affordance* (input appears → typed → confirm enabled) and Escape-cancel, or intercept
  the create mutation and assert the payload, rather than committing.

## 6. Content-render correctness — assertion patterns

Assert the *outcome the AC promises*, not surface presence. Patterns that worked:
- **Chart draws:** `expect(page.locator('[data-element-type="chart"] svg path, … rect, … line').count())` > 0 — a placeholder div has none.
- **Table has cells:** `table.locator('td, th, [role="cell"], [role="gridcell"]').count()` > 0.
- **Real content on the canvas:** fetch the record's actual text via the API, then
  `expect(page.getByText(snippet).first()).toBeVisible()` — proves it's not a blank surface.
- **Figure sourced:** select the element, assert its source-tag label text shows.
- **Style applied:** read `getComputedStyle` on the rendered node (or a descendant
  that actually carries the colour) and assert it changed.
- **Outbound/expensive actions** (export, generate, publish): intercept the POST with
  `page.route`, assert the *payload* (the right fileType / brief / documentIds), and
  fulfill a benign response — never run the real side effect. For one real
  end-to-end pass (e.g. capped AI generation), `test.slow()` + a bounded poll to a
  terminal state + cleanup.
- When the persisted state is corrupted by a known local-only sync quirk (see §9),
  assert the **immediate UI effect** (canvas element count +1, footer "N selected",
  a button flipping to "Unlock") instead of the post-settle API.
- **Capturing a just-created entity's id.** A create modal may NOT navigate to the new
  record, and you can't trust `page.on('response').json()`: Apollo BATCHES ops (array
  request/response) and the GraphQL proxy STREAMS the body, so the response reader is
  unreliable. Robust options: (a) **find by a unique stamped title via a paginated API
  query** (the new record can land on any page of a board-sorted list); (b) an in-page
  fetch spy injected with **`page.evaluate` AFTER load** (not `addInitScript` — the app
  may capture its own `fetch` ref) that records the id from a response clone; (c) just
  assert via the API.
- **A GraphQL helper that retries transient 5xx, not GraphQL errors.** The shared proxy
  502/503/504s under parallel load — retry those with backoff; let GraphQL-level errors
  (a real validation/auth failure) throw immediately so they surface.

## 7. AC-traceability matrix template

Lead `test-plan/<area>.md` with this. One row per acceptance criterion, per ticket.

```markdown
## Acceptance-criteria traceability
### <TICKET-ID> — <title>
| AC | Requirement | Tests | Status |
|---|---|---|---|
| 1 | <verbatim-ish criterion> | AREA-004, AREA-012 | ✓ |
| 2 | <criterion> | AREA-020 | ◑ <what's partial / server-side> |
| 3 | <criterion> | — | ✗ <gap/deferred + reason> |
```
Status key: ✓ covered · ◑ partial · ✗ gap/deferred. Below the matrix, keep per-area
case tables (ID · title · priority `@p0/@p1/@p2` · class `@read-only/@mutating` · AC).
End with an explicit "known gaps / deferred" list (multi-client CRDT, backend-only
ACs, flag-off paths, reduced-motion) so nothing is silently uncovered.

## 8. Worked example: the `presentations` suite

The reference build (DIO-4775/4777/4798/4820/4840 → `/presentations`). ~110 cases
across `apps/web/e2e/tests/presentations/{gallery,themes,editor,generate}.spec.ts`,
a dedicated `presentations` Playwright project on a `setup-telstra` storageState,
`fixtures/presentations.ts` (clone helpers + console-noise allowlists), and a plan
led by the AC matrix. Run: `pnpm test:e2e:presentations` (`--workers=2`). Studying
those files is the fastest way to copy the conventions exactly.

Bugs the suite caught (the point of asserting outcomes): **(fixed)**
`crypto.randomUUID()` throws on plain-HTTP `diolog.ai` (secure-context-only),
silently aborting every id-minting editor edit — fixed `editor-store.ts` `uid()`
with a `getRandomValues` fallback; **(fixed)** a Chart element drew nothing because
`defaultElementOf('chart')` shipped `series: []` — fixed to ship sample data;
**(open, documented)** editing a freshly-*duplicated* deck settles an empty Yjs
collab doc over its elements (the duplicate doesn't copy the collab doc).

A second reference build — the **Tasks (Quorum)** suite (`apps/web/e2e/tests/quorum/**`,
`fixtures/quorum.ts`, a `quorum` project on a `setup-diolog` storageState) — covers a
broad tracker (board / detail / context menu / property mutations / bulk / settings /
agents) entirely via API-verified outcomes, and surfaced **six** real product bugs:
a duplicate `content-type` header that 400'd every API call; a copy-gated button that
never enabled because clipboard is unavailable on plain-HTTP; agent back-links to a
non-existent route; a create modal that submitted an empty required `projectId` before
its data loaded (silent 400); a sub-issue modal never mounted on the detail route (a
no-op action); and a GraphQL-enum NAME-vs-value mismatch that broke an MNPI guardrail
both writing and reading. All are instances of §10.

## 9. Environment gotchas worth knowing

- **App must be up** at `diolog.ai`; a 404 on a feature route usually means a feature
  flag is off for the current company, not a routing bug — fix the context first.
- **Secure-context APIs** (`crypto.randomUUID`, clipboard) throw/await-reject on
  plain-HTTP `diolog.ai`. Code that uses them is silently broken locally — a great
  class of bug to catch, and often a tractable fix (feature-detect + fallback).
- **CRDT/collab decks:** editing a cloned/duplicated record can wipe its content a few
  seconds later (empty collab-doc settle) and async charts can lose the render race.
  Assert the immediate UI effect; for the render, prefer the lightest seed.
- **Parallel load on the shared backend** makes API-count assertions flaky; prefer
  immediate UI counts and run feature projects at `--workers=2` (CI uses
  `retries: 1`).
- **Console noise** that also appears on `/dashboard` is app-shell, not your feature —
  allowlist it suite-scoped (§4).
- **Dev-login JWT claims can be empty** (LocalAuth0): `currentUserId`/email may be
  blank, so "assign to me"-type features silently no-op locally (likely fine in prod).
  Prefer flows that don't depend on the current-user identity, and note the dev caveat.
- **Find the company that actually holds the seeded feature data** — it's often NOT the
  default (NH3). Discover it live (the seed migration names it; e.g. presentations →
  Telstra, Tasks → the internal "Diolog" company), then add a dedicated setup
  storageState project for it.
- **Live grounding (playwright-cli) is session-fragile:** element `ref`s go stale across
  navigations and the session drops after idle. Prefer `--raw eval` DOM queries
  (`getByRole` can't run there) over ref-clicks, and re-login after a gap. Drive
  controlled React inputs with real keystrokes (`pressSequentially`/`type`), not a
  direct `.value` set (which won't fire onChange).
- **Run the full suite TWICE.** Flakes only appear on the second run — optimistic-id
  timing, parallel-load 5xx, leftover state. A green-once suite isn't proven; green
  twice in a row is the bar (it also proves isolation).

## 10. Recurring real-bug classes — assert OUTCOMES to catch them

These are defects an "element exists" test sails past but an outcome-asserting test
(persisted via the API, content actually rendered) reliably catches. Each one below is
a real bug a suite found and a tractable product fix landed:

- **GraphQL enum NAME vs storage value.** A GraphQL enum serialises as its NAMES over
  the wire (`CORE_TEAM`), not the lowercase Mongo value (`core_team`). Web code that
  sends/compares the lowercase value breaks BOTH the write (mutation rejected) AND every
  read (a `=== 'core_team'` display check is always false). When asserting an enum field
  via the API, expect the NAME.
- **Secure-context-only APIs on plain-HTTP.** `crypto.randomUUID`, `navigator.clipboard`
  are undefined / reject on `http://diolog.ai`; without a feature-detect + fallback they
  silently break (a copy-gated button never enables; an id-mint aborts a create). You
  also can't *read* the clipboard in the test on http — assert the affordance, not the
  clipboard content.
- **Form default captured at mount, before its data loads.** A `useState(projects[0]?.id)`
  default seeds empty if the form opens before the query resolves, and never recovers →
  submitting sends an empty required field → silent server 400, nothing created, no
  error shown. Backfill on data arrival + gate submit on a resolved value.
- **An overlay/action wired to global store state but not mounted on the sub-route.** A
  button calls `openCreate()` (sets store overlay), but only the parent shell mounts the
  modal — on a child route that renders a leaf view directly, the action is a silent
  no-op. Mount the modal where the action lives.
- **A keyboard/store action that changes state without navigating.** A view-switch
  shortcut sets `store.view` but each view is its own route → nothing switches. Assert
  the *rendered* effect (selected tab) — and if it should navigate, that's the bug.
- **Header/middleware/contract mismatches** (e.g. a duplicate `content-type` comma-joined
  to an invalid value → upstream 400) that 500/400 a whole BFF route. Exercise the route
  end-to-end (real payload, real auth); a render-only test never calls it.

When such an assertion goes red on a real defect: fix the tractable one (a one-liner,
a missing fallback/default, a wrong header/enum) and re-run; `test.fixme`/`test.fail`
the deep one with a precise comment. Do NOT claim a "bug" for what is really a test
artifact (optimistic-id timing, a stale ref, a wrong locator) — confirm at the API
level first (e.g. the same op via the API succeeds ⇒ the defect is in the UI path, not
the backend).
