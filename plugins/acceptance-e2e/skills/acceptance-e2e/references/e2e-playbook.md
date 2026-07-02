# E2E playbook — portable patterns for acceptance-criteria UI suites

The project-agnostic method and pattern catalogue behind the skill. Read the section
you need; you don't need all of it at once. Everything here applies to any web app —
where a concrete example helps, it's marked *e.g.* and you should substitute your
project's equivalent. (For the Diolog web repo specifically, `diolog-e2e-harness.md`
is the same ideas instantiated with exact recipes and worked examples.)

## Contents
1. Grounding a new project (what to discover before writing)
2. Selector conventions + the trap catalogue
3. Isolation: disposable data, cleanup, no shared-data mutation
4. Content-render correctness — assertion patterns
5. The error/console guard concept + scoped allowlists
6. AC-traceability matrix template
7. Recurring real-bug classes — assert OUTCOMES to catch them
8. Run + stabilize discipline
9. If the project has no harness yet

---

## 1. Grounding a new project

Before writing a spec, answer these from the repo itself (never assume):
- **Runner + layout:** which test runner (Playwright/Cypress/…), where its config and
  fixtures live, and how existing specs are organised. Match it exactly.
- **Run command:** the real invocation — a `package.json`/`Makefile`/`Taskfile` script,
  or `npx playwright test …`. Find how to scope to one project/file/case.
- **Auth:** how a test becomes an authenticated user — a dev-login affordance, a seeded
  user + password, a saved `storageState`, an injected token. Persist it once (a setup
  project), don't log in per test.
- **Context/tenancy:** any workspace/account/company/org scope that filters visible
  data. Drive it via a dedicated setup → `storageState` project, never by switching
  in-session (session-fragile).
- **Base URL:** where the app runs for tests. For an unreleased feature this is usually
  a **local server built from the feature branch**, not a deployed environment.
- **Isolation model:** shared real DB (⇒ mutating tests need disposable clones) vs
  seeded/reset-per-run.
- **Typecheck path:** how to typecheck a spec standalone, if the e2e tsconfig is quirky.

## 2. Selector conventions + the trap catalogue

House style should be **role + accessible name** first; fall back to
`getByPlaceholder`/`getByText`, then a stable `data-*` hook, then other attributes.
Avoid brittle CSS/xpath from codegen — it breaks on the first re-render.

Traps that bite most suites:
- **Substring name collisions** → `{ exact: true }` (default name matching is
  case-insensitive substring). *e.g.* `Present` ⊂ `Presentation actions…`; `5 slides` ⊂
  `15 slides`; a nav `Back` vs a panel `Back`.
- **Case-sensitive regex** disambiguates what the default case-insensitive match can't:
  `/Actions/` (capital A) matches `⌘ Actions` but not `Column actions`.
- **Overlapping / canvas / absolutely-positioned elements:** a coordinate click lands on
  the *topmost* element at the point, not your locator. To hit a SPECIFIC node, dispatch
  the events on it directly:
  `await node.evaluate(el => { for (const t of ['pointerdown','mousedown','mouseup','click']) el.dispatchEvent(new MouseEvent(t,{bubbles:true})); })`
  (add `shiftKey:true` for multi-select). Prefer stable data hooks
  (*e.g.* `data-element-id`) for targeting.
- **Repeated affordances** — the SAME accessible name appears many times (a toolbar
  `New` AND a per-column `New`; multiple editor surfaces). `.first()`/`.last()` silently
  pick wrong. Ground the DOM order, then scope by container or a distinguishing text/icon
  (`.filter({ hasText })`). Tell: if you typed into the wrong composer, its submit stays
  disabled.
- **Native `prompt`/`confirm`:** `page.once('dialog', d => d.accept('…') /* or d.dismiss() */)`.
  Copy can carry curly quotes — match with a regex.
- **Dialogs in portals:** `getByRole('dialog', { name: /…/ })`; the trigger's name may be a
  substring of the dialog title.
- **Async render** (charts, dynamically-imported widgets): renders after a layout/resize
  tick — give a generous `toBeVisible({ timeout })`, and beware a render race against a
  re-sync.
- **Menus/submenus:** menu items expose `menuitem` role+name (the name may carry a shortcut
  suffix — match by prefix `/^Status/`); a submenu opens on `.hover()` of its trigger. A
  persistent off-screen menu can pollute a global `[role=menuitem]` query — assert by
  unique name, not index.
- **Inline-rename headings** may render as `<element role="button">` rather than a heading
  role — locate by text, not `getByRole('heading')`.
- **Controlled inputs:** drive with real keystrokes (`pressSequentially`/`type`), not a
  direct `.value` set (which won't fire `onChange`).

## 3. Isolation: disposable data, cleanup, no shared-data mutation

If the backend is a shared, production-shaped DB, a mutating test must never touch
seeded/shared records and must leave nothing behind.
- **Clone pattern:** if the feature has a cheap duplicate endpoint, clone a seeded record,
  mutate the clone, delete it in teardown. Resolve the source from a STABLE seed and
  **exclude the suite's own clones** from source-selection (match your `[E2E …]` stamp),
  or a parallel test deleting its clone 404s yours.
- **Self-clean otherwise:** a cleanup registry that drains LIFO in `afterEach`, driving the
  same delete path the user would — never a raw DB write.
- **Stamp** created records with a greppable, run-scoped label (*e.g.* `[E2E <runId>]`) so
  leftovers are findable; assert run-scoped uniqueness, not global counts (parallel tests
  change totals).
- **API helpers** run on the test `request`/`page.request` fixture (carries the project's
  auth) — a clean create/read via the API is your source-of-truth for "the capability
  works".
- **Optimistic / async-durable surfaces:** when the UI applies a mutation optimistically
  with a `temp-…` id and flushes the real write later — verify persistence by **polling the
  API** (`expect.poll`) or asserting the **immediate UI effect**, never a same-tick API read.
  Acting on a just-created entity by its optimistic id fails ("… not found"); **seed the
  dependency via the API (real id) BEFORE opening the page**, then drive the child action in
  the UI. A `page.reload()` to force a real id can abort an in-flight write → a fetch error;
  prefer seed-before-open.
- **Concurrent-create id races:** per-tenant auto-increment ids aren't always atomic —
  parallel specs collide on the unique index. Retry the create in the helper on the
  duplicate-key error (an infra race, not an assertion failure).
- **No delete endpoint?** Assert the create *affordance* (input appears → typed → confirm
  enabled) and cancel, or intercept the create and assert the payload, rather than
  committing a record you can't clean up.

## 4. Content-render correctness — assertion patterns

Assert the *outcome the AC promises*, not surface presence:
- **Chart draws:** count the geometry — `svg path/rect/line`, or canvas pixels > 0. A
  placeholder div has none.
- **Table has cells:** `td, th, [role="cell"], [role="gridcell"]` count > 0.
- **Real content rendered:** fetch the record's actual text via the API, then assert that
  snippet is visible on the page — proves it's not a blank surface.
- **Style applied:** read `getComputedStyle` on the node that actually carries the property
  and assert it changed.
- **Outbound / expensive actions** (export, publish, send, pay): intercept the request with
  `page.route`, assert the **payload** (the right ids/fileType/target), and fulfil a benign
  response — never run the real side effect. For one genuine end-to-end pass, bound it
  (`test.slow()` + a capped poll to a terminal state + cleanup).
- **Capturing a just-created id** when the create doesn't navigate and the response is
  batched/streamed (unreliable to read): find the record by its unique stamped title via a
  paginated API query, or inject an in-page fetch spy with `page.evaluate` *after* load, or
  just assert via the API.
- **A request helper that retries transient 5xx but not app-level errors:** retry
  502/503/504 with backoff; let a real validation/auth error throw so it surfaces.

## 5. The error/console guard concept + scoped allowlists

If the harness fails a test when the page logs a console error (a strong signal), keep it —
and when you must tolerate a *genuinely pre-existing, not-your-feature* error, **scope the
allowlist**, never globalise it:
- App-shell noise that fires on every authed page → allow it suite-scoped in `beforeAll`
  (first verify it also fires on a neutral page, so you know it's not your feature).
- A deliberately-provoked error in ONE test → a **restorable** push
  (`const restore = allow(/…/); try { … } finally { restore(); }`) so it can't mask a real
  error later.
If the harness has no such guard, consider adding a lightweight `page.on('console'|'pageerror')`
listener for your suite — a silent console error is often the bug.

## 6. AC-traceability matrix template

Lead the `test-plan/<area>.md` with this. One row per acceptance criterion, per requirement.

```markdown
## Acceptance-criteria traceability
### <REQUIREMENT-ID> — <title>
| AC | Requirement | Tests | Status |
|---|---|---|---|
| 1 | <verbatim-ish criterion> | AREA-004, AREA-012 | ✓ |
| 2 | <criterion> | AREA-020 | ◑ <what's partial / server-side> |
| 3 | <criterion> | — | ✗ <gap/deferred + reason> |
```
Status key: ✓ covered · ◑ partial · ✗ gap/deferred. Below the matrix, keep per-area case
tables (ID · title · priority `@p0/@p1/@p2` · class `@read-only/@mutating` · AC). End with an
explicit "known gaps / deferred" list (multi-client, backend-only ACs, flag-off paths,
reduced-motion) so nothing is silently uncovered.

## 7. Recurring real-bug classes — assert OUTCOMES to catch them

Defects an "element exists" test sails past but an outcome-asserting test (persisted via the
API, content actually rendered) reliably catches. Each generalises across stacks:
- **Enum name-vs-storage-value mismatch.** An enum serialised over the wire as its NAME
  (*e.g.* `CORE_TEAM`) but compared/sent by web code as a different stored value
  (`core_team`) breaks BOTH the write (rejected) and every read (`=== 'core_team'` always
  false). Assert the wire NAME.
- **Secure-context-only APIs on plain HTTP.** `crypto.randomUUID`, `navigator.clipboard` are
  undefined/reject on `http://…`; without a feature-detect + fallback they silently break (a
  copy-gated button never enables; an id-mint aborts a create). You also can't *read* the
  clipboard in-test on http — assert the affordance, not the clipboard content.
- **Form default captured at mount, before its data loads.** `useState(items[0]?.id)` seeds
  empty if the form opens before the query resolves and never recovers → submits an empty
  required field → silent server 400, nothing created, no error shown. Backfill on data
  arrival + gate submit on a resolved value.
- **An action wired to global store state but not mounted on the sub-route.** A button sets a
  store overlay flag, but only the parent shell mounts the modal — on a child route the
  action is a silent no-op. Mount the modal where the action lives.
- **A keyboard/store action that changes state without navigating.** A view-switch shortcut
  sets `store.view` but each view is its own route → nothing switches. Assert the *rendered*
  effect; if it should navigate, that's the bug.
- **Header/middleware/contract mismatch** (*e.g.* a duplicate `content-type` comma-joined to
  an invalid value) that 400/500s a whole route. Exercise the route end-to-end (real payload,
  real auth); a render-only test never calls it.

When such an assertion goes red on a real defect: fix the tractable one (a one-liner, a
missing fallback/default, a wrong header/enum) minimally and re-run; `test.fixme`/`test.fail`
the deep one with a precise comment. Do NOT claim a "bug" for a test artifact (optimistic-id
timing, a stale ref, a wrong locator) — confirm at the API level first (the same op via the
API succeeds ⇒ the defect is the UI path, not the backend).

## 8. Run + stabilize discipline

- **Run the full suite TWICE.** Flakes (optimistic-id timing, parallel-load 5xx, leftover
  state) only appear on the second run; green-twice also proves isolation. That's the bar.
- **Pin workers** if a shared backend flakes above a small concurrency; CI often adds one
  retry.
- **A 404 on a feature route** usually means a flag/context is off for the current account —
  fix the context first, it's not a routing bug.
- **Find the account that actually holds the seeded data** — often not the default; discover
  it live (the seed migration names it) and add a dedicated setup storageState for it.
- **Live grounding is session-fragile:** element refs go stale across navigations and the
  session drops on idle. Prefer raw DOM-eval queries over ref-clicks, and re-authenticate
  after a gap.
- A green run must mean the ACs hold — never water down an assertion to turn a real red green.

## 9. If the project has no harness yet

Set up the **minimum** Playwright harness that fits the repo — don't build a framework:
- `npm i -D @playwright/test && npx playwright install` (or the repo's package manager).
- A single `playwright.config.ts` with a `setup` project (auth → `storageState`) + one
  browser project; `baseURL` from an env var so it points at the local branch server.
- One extended `fixtures/test.ts` if you need a shared console guard or request helper —
  otherwise import `@playwright/test` directly.
- Add a run script to `package.json`.
Note in your report that you introduced the harness, and keep it small enough that the team
can see the whole thing at a glance. Simplicity first — grow it only when a real need appears.
