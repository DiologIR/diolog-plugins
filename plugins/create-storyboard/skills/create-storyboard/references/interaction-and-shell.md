# Interactive depth, shell regions & verification

The three lessons that separate a storyboard that *looks* finished from one that *is*: (1) every surface
must **behave**, not just render; (2) a surface's navigation must live in the **right shell region** —
especially the shared sidebar — not be duplicated; and (3) you must **prove** both by driving the UI, not
by trusting the build. Fidelity (density/realism — see the main guide) is necessary but not sufficient.

---

## 1. Interactive depth — the bar every surface must clear

A populated screenshot is half the job. The other half is that the screen *works*. For each surface:

1. **Master/detail** — selecting a row/card/item updates a **real detail pane** (not a static panel).
2. **Sub-tabs / scope switchers / view toggles switch REAL, distinct content** — never decorative tabs
   that show the same thing. (The #1 fake: a `<Segmented value="X" />` with no state behind it.)
3. **Toggles & filters are wired to visible state** — unread, keep-offline, grid↔list, show-archived,
   conversational↔email — flipping one changes what's on screen.
4. **New / ＋ / primary action buttons open the right DEEP flow** — a real modal/sheet/wizard with fields
   and actions, **never a stub or a bare alert**. Wire a single delegated handler so *every* button
   responds (see the action-bus pattern below), then give the important ones bespoke flows.
5. **The spec's SPECIFIC named sub-features are present.** A surface isn't done when its primary flow
   renders — it's done when its *secondary* sub-features are there too (e.g. an inbox isn't "triage list +
   reading pane"; it's also the unified all-channels view, the unread filter, the daily-briefing entry,
   the drafts mailbox). Mine the spec/mock for every affordance and build them.
6. **Honest grammar throughout** — provenance flags, "propose, a human approves," gated/attributed egress,
   honest empty/degraded states, real status. Don't fake certainty the product wouldn't have.
7. **The feature's PRIMARY surface is present and in the right region** — this is a *positive* check, not a
   defect check, and it's the one automated gates miss. Ask: *what is this feature fundamentally for, and is
   that the star of the screen?* A mail surface's star is a **scannable message list** (in the content,
   master of a master/detail) — not a bare reading pane with the list buried in the 232px rail. A files
   surface's star is the file grid; a board's is the board. A surface that jumps straight to a *detail* with
   no way to browse the collection is **incomplete**, even if everything on it works and nothing is
   duplicated. Check it against the mock's content layout, not just against "does it behave."
8. **Every secondary mode/tab/state is fully built, not just the primary one.** A mode switcher
   (Overview/Conversations/Knowledge/Front) whose *content* branches exist can still have an **empty nav
   region** for its secondary modes (e.g. a rail that only builds rows for two of four tabs). Drive into
   *each* mode and each of the 5 states — the secondary ones are where the stubs hide.

**When *updating* an existing storyboard, this is the whole job:** go surface by surface and deepen each
to the full depth of its mock + spec — every sub-tab, toggle, and named sub-feature — not just the happy
primary flow. Re-read the mock/spec *in full* per surface (they're large); a quick skim under-builds.

---

## 2. Shell regions & shared chrome — put navigation where it belongs

A real app shell is a set of **shared regions**, each with a job: an icon rail, a **source-list sidebar**
(the "middle sidebar"), a toolbar (leading/center/trailing), a tab strip, a command palette, a
notifications affordance, a status bar, a floating assistant. **Before building a surface, decide which
shared region is the natural home for that surface's primary navigation — and put it there.** The failure
mode is building each surface as an island that crams its own nav into the content area while a shared
region sits half-empty next to it.

**The middle-sidebar rule (the load-bearing one).** If a surface's primary navigation *is* a
sidebar-shaped thing — a **file/folder tree** (Finder), a **mailbox/folder list** (Mail), a **conversation
list** (chat), a **document/notes list** (a wiki), an **item list** (a vault) — that navigation belongs in
the source-list sidebar, and the content area gets the **detail/preview**. Do **not** render a generic
"All / Recent / Starred" filler in the sidebar while drawing the real tree/list as a second column in the
content. That produces two competing nav columns and a wasted sidebar — the tell-tale sign the surface was
built without thinking about the shell.

**So the shell must support a surface *owning* a shared region.** Give the shell's `SourceList` (or
equivalent) a **slot/rail prop**, and let the shell **suppress its generic content for areas that own
their sidebar**:

```tsx
// in the AppShell: areas whose surface renders its own sidebar nav
const OWNS_SIDEBAR = new Set(['drive', 'inbox', 'wiki', 'claude' /* … */])
// …
{!OWNS_SIDEBAR.has(areaId) && <SourceList app={app} area={area} … />}
// the surface then fills the whole row with [its own rail | content]
```

Build a **reusable `SidebarLayout` composite** (a chrome-styled rail + a flexible content area) so every
sidebar-owning surface looks identical to the shell's own source list:

```tsx
export function SidebarLayout({ rail, children }) {
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <aside style={{ width: 232, flexShrink: 0, overflowY: 'auto',
        background: 'var(--chrome)', borderRight: '1px solid var(--separator)',
        display: 'flex', flexDirection: 'column' }}>{rail}</aside>
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  )
}
// + RailHead / RailSection / RailRow / RailFoot atoms styled like the shell's source list,
//   so the rail (folder tree, mailbox list, conversation list…) reads as the real middle sidebar.
```

The result is the canonical three-column app: **icon rail · source-list (the surface's real nav) ·
content (detail/preview)** — e.g. Finder (folders · files · preview), Mail (mailboxes · messages ·
reading), chat (conversations · thread). Match the rail's width/background/row styling to the shell's own
source list exactly, so a sidebar-owning surface is indistinguishable in chrome from a generic one.

**Generalise the same question to the other regions:** a surface's *scopes/filters* belong in the toolbar
(a segmented control) or the sidebar, **not** stacked as an extra in-content nav band; a global **view
toggle** (conversational↔email, grid↔list) belongs in the toolbar or the list header, not a third band; a
**list's own filter** (show-unread) belongs in that list's header. Don't pile three horizontal nav bands
above a master/detail when the sidebar + toolbar + list-header already have homes for them.

**Not every surface owns the sidebar.** Dashboards, canvases, editors, and multi-section settings keep the
generic source list (or a meaningful per-area scope list) + their content. Own the sidebar only when the
surface's primary nav genuinely *is* a list/tree — otherwise you just move the problem.

**Classify every surface A / B / C before you build (or when sweeping an existing storyboard).** This is
the concrete rubric behind the rule above — record each verdict (e.g. in the coverage ledger's "shell
class" column) so no surface is left half-converted and none is force-converted:

- **A — owns the middle sidebar.** Its primary nav *is* a list / tree / mailbox / conversation list, and
  today it's either generic filler in the sidebar **or** a list crammed into the content (a master-detail
  pane). → Convert: the real list fills the sidebar (`SidebarLayout`), the content becomes the
  detail/preview; add its id to `OWNS_SIDEBAR`. *Tell-tale:* a `TwoPane`/`Grid2` of `[list | detail]` sits
  in the content, or a content row drives a sibling pane.
- **B — keep generic, already correct.** The sidebar already shows the area's **real scopes** (its
  catalogue subtabs / mailboxes / filters), so it's a correct tabbed/3-column layout, not filler. Leave it
  — moving an already-correct sidebar just relocates the problem. **But VERIFY "B" before you grant it
  (this is where reviews lie to themselves):** the sidebar rows must be genuinely *wired* AND *not also
  rendered as a content tab strip*. A sidebar that merely **mirrors** the area's declared scopes (and a
  content `<Segmented>` of the same scopes) is **not** class B — it's the dead-duplicate bug below. If the
  rows don't drive anything, or the same set appears twice, it's an A (own the sidebar) or a C, never a B.
- **C — not a list surface.** A dashboard, canvas, editor, multi-section view, wizard, or approval-queue
  whose spine is *not* picking from a list. *Tell-tale:* the spine is a canvas you manipulate, a metrics
  dashboard, a node graph, a diff viewer, or a feed of self-contained action cards; a secondary list inside
  it (an editor's layers, a deck's gate) is *chrome*, not nav. **A class-C surface gets ONE of two shells:
  a MEANINGFUL scoped source list (real entities / filters that drive the content) OR — the usual answer —
  FULL-BLEED, with no source-list column at all.** It must NEVER fall through to the generic
  `All / Recent / Starred` (or any auto-derived) filler. **Full-bleed is a first-class shell shape, not a
  failure** — a dashboard, canvas, or editor filling the whole content row is correct; a dead filler column
  beside it is the bug. (Watch the shell's *fallback*, not just its mirror: an `if (subtabs) …; else
  [All/Recent/Starred]` source-list builder emits dead nav for every surface that has no real list — exactly
  the surfaces that should be full-bleed. Make the shell render a source list ONLY where one is real, and
  render none otherwise.)

Be judicious: the goal is to fix the *filler-sidebar + crammed-nav* surfaces and **confirm every other
surface is genuinely fine**, not to push every list into a rail. When a surface *does* own the sidebar and
has its own bottom-pinned composer (a chat), give that composer bottom clearance too, so any floating
assistant pill sits in the gap below it — never over its input.

### The dead-mirror trap — review the sidebar logic WITH the content, never apart

The single most common shell bug, and the hardest to see, is **duplicated/dead navigation**: the same scope
set rendered in BOTH the middle sidebar AND a content/toolbar tab strip — with the sidebar copy usually
**dead** (rows with no handler). It happens when the shell **auto-derives** the source list from a per-area
config (e.g. `if (area.subtabs) sidebar = area.subtabs.map(...)`) while each surface *also* renders those
same scopes as its own `<Segmented>`. It sails through every automated gate — it builds, it renders, the
interaction harness clicks the *content* tabs and passes — and a **content-only review never catches it**,
because you have to look at the sidebar and the content *of the same surface at the same time*.

Two hard gates (add them to the depth bar, and enforce them when sweeping an existing shell):
- **G — no duplicated nav.** A scope set lives in exactly ONE region. Never both sidebar and content tabs.
- **G — no dead sidebar rows.** Every source-list row must drive something (selection / view / navigation).
  A decorative mirror with no onClick is forbidden — it reads as nav and does nothing.

So the review is **holistic by construction**: for each surface, read *three things together* — (1) the
shell's source-list derivation code (how it builds rows for this area), (2) the surface's own content, and
(3) the feature spec — then decide. **A pass that deepens content while treating the shell as off-limits
will systematically miss this** (it's exactly how a whole catalogue of surfaces ends up double-naved).

**Resolution rubric — pick ONE home for the scopes by what they ARE:**
- **Section-spine** (the scopes *are* the feature's primary sections — Finance Overview/Ledger/…, a spec's
  Product/Technical/Changelog, a compliance Readiness/Controls/Evidence) → the surface **OWNS the sidebar**:
  the scopes become wired rail nav, the content shows the selected section, and you **delete the content tab
  strip**.
- **View-toggle** (≤3 peer views of ONE dataset — Canvas/List, Board/Timeline/List, Grid/Map) → keep it as
  a **single** toolbar/content-header toggle; the sidebar must show the feature's **real sub-entities**
  (families, projects, saved views, accounts), **never a mirror of the toggle**.
- **Item-list** (mailboxes, files, conversations, vault items) → the sidebar **is** the list; content is the
  detail (the canonical master-detail A case).

When you fan this out across agents, the shell file (the source-list derivation, the `OWNS_SIDEBAR` set) is
**shared** — so agents fix the *surface* side in their own file and **report** the shell change; the lead
applies the one central edit (see `orchestration-and-ledger.md` → "agents report, lead applies"). Kill the
auto-mirror at its source once, so the bug class can't recur.

### Author a navigation tier system (let the TIER pick the shape)

The dead-mirror trap is one instance of a deeper rule: across a multi-surface app the *same* logical nav job
(filter a list, switch a section, toggle a view, drill into a folder…) gets built with a *different shape* on
every surface, and the app stops feeling like one product. Cure: **author a navigation tier model in the
DESIGN.md and let a control's TIER — what it changes — fix its shape and its home.** Same job → same shape →
same place, everywhere. A reusable starting taxonomy (adapt the shapes to the brand; keep the
*one-shape-per-tier* discipline):

| Tier | Changes | Canonical shape | Home |
|---|---|---|---|
| Area | the feature | source-list rows | app rail |
| Object picker | which object you work on | source-list rows (or thumbnail strip / object tree) | the middle sidebar |
| Sections | the major sections of the object | segmented tabs | toolbar-centre (or sidebar rows if sections ARE the spine) |
| Scopes / filters | a subset of a list | **filter chips — a shape DISTINCT from segmented** | list/container header, left |
| View toggle / time range | the *rendering* of the same data | small segmented | toolbar / header, right |
| Container nav | one container's content | underline tabs | across that container |
| Location | hierarchical position | breadcrumb | content-header, left |

Two failure modes it kills: **shape overload** — one idiom (the segmented/tab) reused for sections AND
view-toggles AND filters AND time-ranges, so nothing is distinguishable (give *filters* a visibly different
shape from *switches*); and **placement drift** — the same tier living in the toolbar on one surface and
inside a container on another. Also classify the action buttons by what they target: object-create → sidebar
head, surface-primary → toolbar-right, container action → container header, **one primary per region**.

Apply it the right way round: **codify the rule in the DESIGN.md first, add any shared primitives the rule
names (e.g. an underline-tabs `ContainerTabs`, a `Breadcrumb`) centrally as a barrier, THEN fan out the
conformance** (orchestration-and-ledger.md). Fixing nav surface-by-surface ad hoc is how the inconsistency
arose in the first place — drive it from the system doc, not per screen.

### Self-handling controls vs. the action bus

A cheap way to make *every* button do something: a window-level click delegate that opens a working
sheet/flow for any `<button>`/`[role=button]` that hasn't opted out.

- Mark **self-handling controls** (segmented tabs, pill nav, toggles, list rows that drive selection)
  with `data-noaction` (or make them plain `<div onClick>` — non-buttons are ignored by the delegate).
- A **custom button with its own onClick** inside a surface must `e.stopPropagation()` so the bus doesn't
  *also* fire.
- Leave handler-free action buttons (New, Share, Export…) alone — the bus opens their deep flow by label.

---

## 3. Verification — build ≠ render ≠ interaction

Three distinct gates; passing one does not pass the next:

- **Build** — `npm run build-storybook` compiles. (Says nothing about whether a screen renders.)
- **Render** — load each story in a browser; assert the content mounted and the **console is clean**. A
  missing import or undefined ref on a render path throws here.
- **Interaction** — **click every tab, row, toggle, and action** and assert state changed + console stays
  clean. This is the gate everyone skips, and it's where the real bugs live: a click-only path (a modal, a
  tab branch, an overlay) can pass build *and* render and throw only on click.

**Drive it headlessly** against the static build (`storybook-static` served on a port). Load a story via
`iframe.html?id=<storyId>&viewMode=story` (ids come from `storybook-static/index.json`). Then:

```js
// pseudo-Playwright — commit this as interact.mjs and add assertions per surface
await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`)
await page.locator('button[role="tab"]', { hasText: new RegExp(`^${tab}$`) }).first().click()   // a sub-tab
await page.getByText(rowText, { exact: false }).first().click()                                  // a master row
// then assert the expected detail/branch text is now present, and no console errors fired
```

- **Use EXACT-text matching for nav, and beware content collisions.** `getByText('Board')` substring-matches
  "Dashboards" and silently navigates away. Worse, a nav label often collides with *content* text on the same
  screen (`getByText('Findings')` also matches "Filter findings" / "Review findings"; clicking `.first()` hits
  the wrong one and the step times out). Anchor nav clicks with `{ exact: true }`; for source-list rows where
  the exact label may not be a single text node, try exact first and fall back to substring
  (`const ex = getByText(label,{exact:true}); (await ex.count()? ex: getByText(label)).first().click()`).
- **Don't GUESS the target/expected text — verify it exists.** Write each assertion against text you've
  confirmed renders (probe the DOM, or read the surface's data/spec), not a value you assume. A guessed commit
  hash / row title makes the harness fail for a fake reason. (When unsure what a surface *should* show, the
  feature spec is the source of truth for content; the DESIGN.md is the source of truth for look.)
- **Wait on a content selector, not `networkidle`** — a live-reload/SSE socket never goes idle.
- Keep a committed **`interact.mjs`** that clicks across all surface stories (zero console errors) plus a
  targeted assertion per surface (`tab X → shows Y`, `click row R → detail shows D`). Re-run it after every
  change; extend it whenever you deepen a surface.
- **Drive every secondary mode/tab, not just the primary flow.** For a surface with a mode switcher, click
  *each* mode and assert (a) its content rendered AND (b) its nav region (rail/sidebar) isn't empty under it
  — empty-rail-under-a-tab and detail-with-no-list are invisible to a harness that only exercises the happy
  path. Add the assertion that would have caught the absent-primary-surface bug, not just the present-defect one.
- **Screenshot the CONFIRMED surfaces, not only the changed ones.** The screens you waved through as
  "already correct / exemplar" are exactly where a missing primary surface or empty secondary mode hides —
  a row that is "confirmed but not screenshot-eyeballed" is *yellow*, not green. Shoot it and look.
- **Verify the wall builds** (`npm run wall:build`) and screenshot a few happy screens by eye every pass.

---

## StyleX gotchas that bite during interaction work

- StyleX `style` props on element components accept **only compiled stylex styles or STRING CSS values** —
  a numeric (`flex: 1`, `marginBottom: 3`) passed through a component's `style` prop triggers a styleq
  warning. Put numeric layout on a **native `<div style={{}}>`** wrapper; pass only compiled styles/strings
  to component `style` props.
- `import { Fragment } from 'react'` and use `<Fragment>` — `React.Fragment` is **not** a runtime global in
  the scaffold and throws on interaction-only paths.
- Keep the `@stylex;` directive in the project's CSS sink; never `{...stylex.props(x)} className="y"` on the
  same element. Re-export a StyleX type with `export type {}`.
