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
  — moving an already-correct sidebar just relocates the problem.
- **C — not a list surface.** A dashboard, canvas, editor, multi-section view, wizard, or approval-queue
  whose spine is *not* picking from a list. Keep the generic source list + content. *Tell-tale:* the spine
  is a canvas you manipulate, a metrics dashboard, a node graph, a diff viewer, or a feed of self-contained
  action cards; a secondary list inside it (an editor's layers, a deck's gate) is *chrome*, not nav.

Be judicious: the goal is to fix the *filler-sidebar + crammed-nav* surfaces and **confirm every other
surface is genuinely fine**, not to push every list into a rail. When a surface *does* own the sidebar and
has its own bottom-pinned composer (a chat), give that composer bottom clearance too, so any floating
assistant pill sits in the gap below it — never over its input.

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

- **Use EXACT-text matching for nav.** `getByText('Board')` substring-matches "Dashboards" and silently
  navigates away — your assertion then fails for the wrong reason. Anchor with `^…$` or `{ exact: true }`.
- **Wait on a content selector, not `networkidle`** — a live-reload/SSE socket never goes idle.
- Keep a committed **`interact.mjs`** that clicks across all surface stories (zero console errors) plus a
  targeted assertion per surface (`tab X → shows Y`, `click row R → detail shows D`). Re-run it after every
  change; extend it whenever you deepen a surface.
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
