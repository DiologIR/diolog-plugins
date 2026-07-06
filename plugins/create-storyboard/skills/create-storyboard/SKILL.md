---
name: create-storyboard
description: "Generate an interactive UI storyboard as a StyleX + Storybook project from a product spec plus a user-supplied DESIGN.md. The DESIGN.md drives the look (NOT locked to a macOS aesthetic); the bundled HIG library supplies the interaction, behaviour, and accessibility backbone. Builds a reusable StyleX design system (tokens → elements → composites), implements every screen as Storybook stories across the happy, empty, loading, error, and AI states at production fidelity and full interactive depth, plus an MDX flow overview and a standalone pan/zoom wall of every screen. Use whenever the user asks to create / build / generate a storyboard, storyboard the user flows for a feature or project, show the happy / empty / loading / error / AI states for a UI, build a StyleX or Storybook UI or design system from a brand spec, prototype screens for a spec, or update an existing storyboard. For a UI that must look macOS-native, use macos-storyboard instead."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, Skill, Workflow
---

# create-storyboard — build a brand-driven StyleX + Storybook storyboard

You turn a product specification into an **interactive storyboard**: a **StyleX + Storybook** project whose stories show each screen of each user flow across the **happy, empty, loading, error, and AI** states, built from a **reusable design system derived from the user's `DESIGN.md`**. The rendered Storybook *is* the storyboard — there is no separate static HTML artifact.

Two inputs work together, and keeping them in their lanes is the whole game:

- **The user's `DESIGN.md`** — the product's own design system (palette, typography, spacing, shape/radii, materials, elevation, motion personality, density, voice, component contracts). **This drives the look.** The storyboard must read unmistakably as *this product*, in *its* visual identity — not a stock Mac app, not a generic AI-template look.
- **The bundled HIG library** (`${CLAUDE_PLUGIN_ROOT}/reference/hig/`) — the **interaction, behaviour, structure, and accessibility backbone**. It is Apple's macOS HIG, but you read it for *how surfaces should behave and be organised and stay usable* (layout zones, master–detail/list/table grammar, modality, feedback, focus/keyboard model, motion-as-communication, empty/loading/error/status handling, writing) — broadly-applicable UX principles — **not** to copy the macOS *aesthetic*. When the HIG prescribes a platform-specific look (13pt body, Liquid Glass, traffic-light chrome, the system accent), defer to the `DESIGN.md` for the actual appearance.

Crucially, every screen must reach **production fidelity** — the information density and detail of a real, populated product surface, matching any reference the user points to, not a thin sketch of it (see Step 3) — **and full interactive depth**: it must *behave*, not just render (Step 3b), with its navigation in the right shell region (Step 6b).

Supporting references — read these for the mechanics:
- `${CLAUDE_PLUGIN_ROOT}/skills/create-storyboard/references/stylex-storybook-guide.md` — StyleX/Storybook mechanics, the 5-state taxonomy, the `DESIGN.md`→token mapping, project structure.
- `${CLAUDE_PLUGIN_ROOT}/skills/create-storyboard/references/interaction-and-shell.md` — the interactive-depth bar, the shell-region / "surface owns the middle sidebar" pattern + a reusable `SidebarLayout`, the self-handling-control / action-bus model, and the build≠render≠interaction verification harness (`interact.mjs`) with its gotchas.
- `${CLAUDE_PLUGIN_ROOT}/skills/create-storyboard/assets/wall/` — copy-and-adapt source for the required full-page pan/zoom **wall** (`Wall.tsx` + `wall-main.tsx` + `index.html` + `vite.wall.config.ts` + a README).
- `${CLAUDE_PLUGIN_ROOT}/skills/create-storyboard/references/orchestration-and-ledger.md` — when coverage is large, how to give every surface/screen the *same* quality of consideration: the coverage-ledger schema, the per-agent full-context contract, and the `Workflow` fan-out patterns.

## Step 1 — Secure the DESIGN.md, then load the HIG (mandatory, before anything else)

**1a. The DESIGN.md is required — it is what makes the UI bespoke.** Locate the product's design system before you design or write a line of code:

- If the user supplied a `DESIGN.md` (or a design-token file, brand spec, style guide, or screenshots of the product), read it fully — palette, type scale, spacing/grid, radii/shape, materials, elevation, motion, density, voice, and any per-component contracts. This is the source of truth for *how it looks*.
- If none was supplied, **don't invent one silently and don't fall back to a generic look.** Resolve it first: ask the user where the design system lives; or, if they point at a reference (a live product, screenshots, a Figma export), derive a `DESIGN.md` from it (use the `design-md-from-screenshots` skill, or the `design-craft` *design-system-extract* procedure); or, for a greenfield spec with no brand yet, propose a small set of directions with `design-craft` *frontend-aesthetic-direction* and have the user pick before you build. A storyboard built on an un-grounded design system is the #1 cause of the generic "AI-mockup" look.

**1b. Load the HIG as the interaction backbone.** Read the bundled library — `index.md` first, then the component/foundation files relevant to the surfaces you're building (for a master–detail screen: `split-views` + `sidebars` + `lists-and-tables` + `toolbars`; always read `layout`, `accessibility`, `feedback`, `motion`, `writing`, and `progress-and-status-indicators` for the state work). Take **behaviour and structure** from it; ignore its macOS-specific *look* prescriptions in favour of the `DESIGN.md`.

**1c. Read the WHOLE project doc/spec tree, not just the file for the surface in front of you.** A storyboard is built from a *project's* context, and any one surface is shaped by decisions made elsewhere — shared conventions, the product's honesty/voice grammar, the sibling surfaces it links to, cross-surface workflows. Before building, enumerate every spec/md and mock (`find <project> -name '*.md' -not -path '*/node_modules/*'`, plus the mock-of-record dir) and read the relevant ones **in full**: the master feature catalogue, the spec(s) for the surfaces in scope, the mock of record for each, and any shared/sibling spec they reference. They are large; a skim under-builds (this is the same "re-read the mock/spec in full" discipline Step 3b demands, applied up front and project-wide). **This full grounding — the whole doc tree + the full HIG backbone (1b) + the design-craft passes — is exactly what every workflow agent must also load** when you fan the work out (see "Scale with a workflow + a coverage ledger"): you hand agents the *requirement to re-acquire this context*, never a thin summary.

**Precedence:** the user's spec + `DESIGN.md` (for all product/brand/visual decisions) → HIG (for interaction grammar, structure, behaviour, and accessibility) → design-craft / frontend-design (for distinctiveness and polish). Never let a HIG aesthetic detail override the brand, and never let brand styling break sound interaction (real focus ring, keyboard operability, honest hit targets, accessible roles, legible contrast).

## Step 2 — Understand the spec, derive the flows

- The user gives a **specification**: a single feature, an entire project, or **"update an existing storyboard."**
- **If updating:** locate the existing StyleX/Storybook project, read its current tokens/elements/composites/stories/flows, and plan a *reconciling* change — extend and refactor shared parts, don't duplicate or fork the design system.
- Derive: the **user flows** (the journeys a user takes), the **screens** in each flow, and the **components** each screen needs. Capture them as a short plan (flows → screens → components). A single feature needs no scope check — proceed; for a whole project or an ambiguous spec, confirm scope with the user and prioritise the primary flows first.
- For **each screen**, decide which of the **5 states** apply and what each shows (see the guide for precise definitions): **happy** (populated/success), **empty** (no data / first run), **loading** (skeletons/placeholders), **error** (failure + recovery path), **AI** (AI-generated / streaming / assistant state). Not every screen has all five — cover the ones that genuinely apply, and never omit error/empty where the flow can reach them.
- **Note any reference.** If the user names — or the repo/codebase contains — an existing mock, product UI, or live app for these surfaces, treat it as the **fidelity + layout reference** (Step 3), not just a source of brand tokens. Find it before you design (ask, or grep the repo for a `mock-ui`/design dir).

## Step 3 — Set the fidelity bar (match the reference; don't sketch it)

The most common failure of an AI-built storyboard is screens that are *on-brand but thin* — calm, sparse, templated, padded with placeholder content. **Restraint applies to chrome and decoration, never to content:** a real product surface is information-dense. Each screen must read as a **populated, working product surface** at the detail level of the reference — a screenshot of the shipped product, not a wireframe of it.

- **If a reference exists, it sets the bar.** When the user names one, or the repo contains an existing mock / product UI / live app for these surfaces, study it FIRST and match its **information density, per-surface layout, and real rendered content**. **Measure computed styles in a browser** (use the `mockup-fidelity` skill) — do not infer spacing, density, and detail from design tokens alone. A token/DESIGN.md spec defines *identity* (colour, type, voice), not the *amount of stuff* on each screen, so a faithful reading of the tokens will still under-build the UI. **And when the reference is a built mock (e.g. a per-surface `view-<surface>` + `data-<surface>`), PORT it, don't re-derive it** — open that surface's specific reference file, read it line by line, and carry its content, structure, sub-tabs, modals, and data shape across into the StyleX build (translating only the *look* to the DESIGN.md). Re-deriving from product-language specs when an 800–2,600-line reference already encodes the depth is the surest way to ship a thinner version of a surface that already exists.
- **Mine a depth manifest per surface (when a reference exists), before you build.** Convert "match the density" from a vibe into a **checkable bar**: for each surface, extract concrete counts from its reference — sub-tabs (and what each one shows) · primary table/list row count · detail-pane sections · modals/sheets/wizards · the spec's named sub-features · the data shape (the drill-down levels). That manifest is the surface's target, the thing the verify pass grades against, and — at scale — a column in the coverage ledger handed to each fan-out agent (see the orchestration reference). Agents told *here is the bar* clear it; agents told *go find the bar* under-build under context pressure.
- **Invest in realistic sample data — a first-class step, authored as its own module BEFORE the view.** Thin placeholder data is the #1 cause of the "AI-mockup" look. Author each surface's data as a separate, structured module (mirror a reference's `data-<surface>` where one exists) that is **layered for drill-down** — not just 8–15 flat rows, but rows that own detail and detail that owns sub-sections, so selecting an item reveals a real, populated detail that can itself drill further. Give cards real values, secondary metadata, counts, timestamps, and status; show multiple content regions per screen. The view then composes against real data instead of inventing placeholders inline — which is also what lets master/detail (Step 3b) be *real* rather than static.
- **The Looks-real checklist (every happy screen must pass):** ① populated primary content (not 2–3 stubs) · ② real secondary detail (metadata / counts / timestamps / sync or status) · ③ at least one genuinely dense region (a real table, canvas, inspector, graph, or multi-section list) · ④ **real rendered component instances** wherever the screen is *about* components/design (never coloured rectangles as stand-ins) · ⑤ believable copy and tabular numbers. If it would pass as a screenshot of the shipped product, it clears the bar.
- **Breadth never lowers the bar.** If coverage is large (many surfaces), keep each one at fidelity, or mark the lower-fi ones honestly — never let "cover everything" silently become "sketch everything."

## Step 3b — Interactive depth (every surface must behave, not just render)

Fidelity (Step 3) is half the bar; **depth is the other half**. A populated screenshot that doesn't *work*
is still a wireframe. For each surface, clear all six (full detail + the harness in `interaction-and-shell.md`):

1. **Master/detail** — selecting a row/item updates a **real** detail pane (not a static panel).
2. **Sub-tabs / scope switchers / view toggles switch REAL, distinct content.** The #1 fake is a
   decorative segmented control with no state behind it — every tab must change what's shown.
3. **Toggles & filters are wired to visible state** (unread, grid↔list, keep-offline, show-archived…).
4. **New / ＋ / action buttons open the right DEEP flow** — a real modal/sheet/wizard, never a stub or a
   bare alert. (Use a delegated action bus so *every* button responds; self-handling controls opt out — see
   the reference.)
5. **The spec's SPECIFIC named sub-features are present** — a surface is done when its *secondary*
   sub-features are built, not just its primary flow. Mine the spec/mock for every affordance.
6. **Honest grammar** — provenance, "propose → a human approves," gated/attributed egress, honest
   empty/degraded states.

**No generic content renderer.** A kind-templated fallback that draws the same handful of layouts with the
surface's label swapped in reads as "real" at a glance but is a **stub** — it cannot carry the surface's
specific content, sub-features, or data, so it caps the long tail at plausible-but-thin (the classic AI-mockup
tell at scale). Every surface needs its OWN renderer built to its depth manifest. A generic *shell* — where
the surface's nav sits (Step 6b) — is a separate, legitimate choice; generic *content* is not.

**When *updating* an existing storyboard this is the whole job:** go surface by surface, re-read each
mock/spec **in full** (they're large — a skim under-builds), and deepen each to match — every sub-tab,
toggle, and named sub-feature, not just the happy path.

## Step 4 — Design direction (use design-craft + frontend-design)

Establish a distinctive, intentional, accessible look that is **the DESIGN.md's identity at its core, made production-grade**:

- Invoke the **`frontend-design`** skill to set an aesthetic direction that avoids generic AI aesthetics and feels production-grade *within the brand*.
- Use the **`design-craft`** skill at the matching stages — its *frontend-aesthetic-direction* (look options, if the brand needs sharpening), *design-system-extract* (tokens/components), *accessibility-audit*, *ai-slop-check*, and *polish-pass* procedures.
- Fuse the inputs: the **`DESIGN.md` identity is the visual foundation** (accent, type personality, density, shape, motion, voice); the **HIG supplies the non-negotiable interaction/structure/accessibility floor**; design-craft/frontend-design make it intentional and bespoke. Resolve look conflicts toward the brand, and interaction conflicts toward sound, accessible behaviour.

## Step 5 — Scaffold the StyleX + Storybook project (run it end-to-end)

- Confirm a target directory and app name (default a sensible kebab-case name from the spec). Run the official starter:
  `npx @stylexjs/create <app-name> --framework storybook`
- Install dependencies and confirm the starter's Storybook builds/runs before you build on it. Treat the **scaffolded example files + the live docs at https://stylexjs.com/docs as the source of truth for StyleX API** — verify against them rather than guessing.
- Define **design tokens** with `stylex.defineVars` in a tokens file **derived from the user's `DESIGN.md`** (palette, label/text tiers, spacing, radii, type scale, materials/elevation, motion) — not from any bundled macOS values; author **light and dark** themes independently (via `stylex.createTheme`) — never invert. See the guide for the mapping.

## Step 6 — Build the reusable design system (tokens → elements → composites)

Follow design-system best practices: one source of truth for tokens, variants via props (not copy-paste), composition over duplication, accessible by default, each piece a Storybook story.

- **Elements** (atoms) — Button (default/prominent/destructive roles), TextField/SearchField, Toggle/Checkbox, SegmentedControl, ListRow, SidebarItem, ToolbarItem, Icon, Label (the brand's text-tier system), Surface/Card (and a Material/Glass surface only if the `DESIGN.md` calls for translucency), Spinner/ProgressBar, Badge, etc. Each honours **the brand's contracts from the `DESIGN.md`** (its body size, control sizing, corner/shape language, accent binding) **and the HIG's interaction contracts** (real focus ring, keyboard operability, honest hit targets — pad small controls to a comfortable target — accessible roles, default cursor on controls).
- **Composites** (molecules/organisms) — Sidebar (source list), Toolbar (leading/center/trailing regions), SplitView, Sheet/Modal, Popover, plus the **state composites**: `EmptyState`, `LoadingState` (skeletons), `ErrorState` (message + recovery), `AIState` (streaming/assistant) — reusable across screens so every screen's 5 states are consistent.
- **Screens** — compose elements + composites into each screen of each flow. The system is the **floor, not the ceiling**: when a surface genuinely needs a dense, bespoke organism (a real components canvas, a populated inspector, a data-rich table, a node graph), build it — then fold any reusable parts back into the system. "Compose from the system" must not flatten every screen into the same thin arrangement of a dozen atoms. Avoid one-off *inline* styling, but do build per-surface components when the screen demands them.

## Step 6b — Shell regions & shared chrome (place navigation where it belongs)

The app shell is a set of **shared regions** — an icon rail, a **source-list sidebar (the "middle
sidebar")**, a toolbar (leading/center/trailing), a tab strip, a command palette, a notifications
affordance, a status bar, a floating assistant. Before building a surface, ask **which shared region is the
natural home for this surface's primary navigation — and put it there.** The failure mode is building each
surface as an island that crams its own nav into the content area while a shared region sits half-empty.

- **The middle-sidebar rule.** If a surface's primary navigation *is* a sidebar-shaped thing — a
  **file/folder tree** (Finder), a **mailbox list** (Mail), a **conversation list** (chat), a **notes/docs
  list** (a wiki), an **item list** (a vault) — that nav belongs in the **source-list sidebar**, and the
  content area gets the **detail/preview**. Do **not** render generic "All / Recent / Starred" filler in
  the sidebar while drawing the real tree/list as a *second* column in the content — that's two competing
  nav columns and a wasted sidebar (the classic tell that the shell wasn't considered).
- **Let a surface OWN a shared region.** Give the shell's `SourceList` a **rail slot** and have the shell
  **suppress its generic content** for areas that own their sidebar (`OWNS_SIDEBAR`); the surface then fills
  the row with `[its own rail | content]` via a reusable **`SidebarLayout`** composite styled exactly like
  the shell's source list (`RailHead`/`RailSection`/`RailRow`/`RailFoot`). Result: the canonical
  three-column app — **icon rail · source list (the real nav) · content (detail)**. (Full pattern + code in
  `references/interaction-and-shell.md`.)
- **Generalise to the other regions.** A surface's *scopes* go in the toolbar (segmented) or sidebar; a
  global *view toggle* goes in the toolbar or list header; a *list filter* (show-unread) goes in that
  list's header — **not** stacked as extra in-content nav bands above a master/detail.
- **Not every surface owns the sidebar.** Dashboards, canvases, editors, and multi-section settings keep
  the generic source list (or a meaningful per-area scope list) + their content. Own the sidebar only when
  the surface's primary nav genuinely *is* a list/tree.

## Step 7 — Implement the storyboard in Storybook

- **One story file per screen, one story per applicable state** (Happy / Empty / Loading / Error / AI) driven by args/variants — so a reviewer flips a screen through all its states.
- **A flow-overview MDX page per user flow** that lays the screens out in sequence (the journey), annotates each state, and links to the individual stories. This is the "storyboard showing user flows."
- Storybook hierarchy: `Design System/Elements/*`, `Design System/Composites/*`, `Flows/<FlowName>/<Screen>` (+ the `Flows/<FlowName>` MDX overview). Provide a light/dark toolbar toggle so both appearances are reviewable.
- **Wire the interactions, not just the layout (Step 3b).** Make sub-tabs/toggles/rows drive real state and primary buttons open real flows. A delegated **action bus** (a window-level click handler that opens a working sheet for any button without `data-noaction`) makes *every* button respond cheaply; self-handling controls carry `data-noaction`, custom-onclick buttons `stopPropagation()`. (Reference has the pattern.)
- **The whole-wall page (REQUIRED — every storyboard ships it on top of Storybook).** A standalone webpage with **every screen on one infinite pan/zoom canvas** (drag to pan, ⌘/ctrl-scroll to zoom, +/−/Fit/100%). Copy `assets/wall/` (`Wall.tsx`, `Wall.stories.tsx`, `wall-main.tsx`, `index.html`, `vite.wall.config.ts`) into the project, adapt the two marked spots in `Wall.tsx` (your IA → cells; your "render a themed screen" entry), add the `wall:build`/`wall:serve` scripts, and `npm run wall:build`. It reuses the same StyleX pipeline, so it renders identically to the stories. See `assets/wall/README.md`.

## Step 8 — Verify it actually renders, then polish

- **Three gates — build ≠ render ≠ interaction; passing one does not pass the next.** (1) `build-storybook` compiles. (2) **Render** — load each story headlessly and assert the console is clean (a missing import/undefined ref throws here, not at build). (3) **Interaction** — **click every sub-tab, row, toggle, and action** and assert content changed + console stays clean; this is the gate everyone skips, and where click-only-path bugs (a modal, a tab branch, an overlay) hide. Drive it via `iframe.html?id=<storyId>&viewMode=story` (ids from `storybook-static/index.json`); use **exact-text** matching for nav (`getByText('Board')` substring-matches "Dashboards" and navigates away); wait on a content selector, not `networkidle`. Commit an **`interact.mjs`** that clicks across all surfaces with a targeted assertion each, and re-run it after every change. (Harness + gotchas in `references/interaction-and-shell.md`.)
- **Build the wall** — `npm run wall:build` must succeed, and the wall page must render every screen.
- **Fidelity pass — do this every time, by eye.** Screenshot the rendered screens (headless is fine) and compare each happy screen to the reference, or to the Step 3 Looks-real checklist. If it reads as a wireframe — placeholder boxes, 2–3-row stubs, empty regions, coloured-rectangle "previews" — it **fails**; raise its density and detail before shipping. Don't trust that it compiled; trust what the screen looks like.
- Run the **design-craft** *ai-slop-check*, *accessibility-audit*, and *polish-pass* over the rendered screens; confirm **the `DESIGN.md` is honoured** (the brand's palette/type/density/shape/motion/voice actually show through, not a generic default) and that the **HIG interaction floor holds** (sound structure, keyboard/focus, honest hit targets, contrast 4.5:1 / 3:1, motion communicates, reduced-motion/transparency/contrast honoured), and that each of the 5 states reads correctly and consistently.
- For a large storyboard, **do not build or review the long tail by hand in one fading context window** — orchestrate it so every surface gets equal scrutiny (see "Scale with a workflow + a coverage ledger" below), then reconcile.

## Scale with a workflow + a coverage ledger (when coverage is large)

A storyboard that covers many surfaces degrades in a predictable way: the first screens are dense, deep, and considered, and the long tail quietly becomes thin stubs — because each was built in a different context window against a different slice of the spec, with attention decaying as the list grew. Whenever coverage is more than a handful of screens (a whole project, a broad catalogue, a sweep of an existing storyboard), use two instruments so **every** feature/screen gets the **same** quality of consideration. Full schemas + script patterns are in `${CLAUDE_PLUGIN_ROOT}/skills/create-storyboard/references/orchestration-and-ledger.md`.

- **A coverage ledger** — a markdown file at the storyboard root, **one row per surface/screen**: its spec sources, its shell class (own-sidebar / generic / not-a-list, per `interaction-and-shell.md`), which of the 5 states are implemented, a fidelity rating (✅ dense / 🟡 thin / ❌ stub), the strongest verification that actually ran (build < render < interact < screenshot), and the specific remaining gap. It is the single source of truth; **a surface is finished only when its row is `✅ dense`, screenshot-verified, with no gaps.** The ledger makes every surface visible at once, so the 50th gets the same scrutiny as the 1st — and it's the artifact the reconcile pass diffs against the registry to prove 100% coverage.
- **A `Workflow` fan-out** — scout the surface list inline (from the registry / catalogue / spec index), then pipeline each surface through **decomposed stages that give depth its own budget — author-data → build → deepen-named-sub-features → fidelity-verify** (a single build-everything agent is what dilutes per-surface investment and produces the thin tail), handing each agent its surface's **depth manifest** (the per-surface counts mined from the reference up front) so it builds to a concrete bar, not a vibe — looping until every ledger row is green and a final completeness-critic finds nothing missing. **Embed the per-agent context contract verbatim in every agent prompt** so each agent re-acquires the *same* full grounding the lead has — it MUST, before writing any UI: (1) read the **whole project doc/spec tree** relevant to its surface, not just that surface's file (Step 1c); (2) read the **full HIG backbone** (Step 1b); (3) invoke the **`design-craft`** skill, measure computed styles against the reference, and — where a built reference exists for its surface — **PORT that file rather than re-derive it**; (4) build from the shared design system at the Step 3 fidelity + Step 3b depth bar (no generic content renderer), placing nav in the right shell region (Step 6b); and (5) update its ledger row honestly. An agent that skips 1–3 produces exactly the thin, context-blind screen this whole approach exists to prevent — make the contract a hard gate, not a suggestion.

Finish with one reconcile pass that proves 100% coverage (every registry id has a green ledger row with its spec sources filled) and runs the whole-project gates end to end — `build-storybook` → the `interact.mjs` harness with a per-surface assertion → `npm run wall:build` → a screenshot eyeball — not just the surfaces that changed. If any cap was hit (top-N, sampling, no-retry), record it in the ledger; silent truncation reads as "done" when it isn't.

## Do / Don't

- **Do** secure and read the user's `DESIGN.md` first (it drives the look), then read the HIG for interaction/structure/accessibility grounding; **find and match the reference's fidelity and information density** (realistic domain-true data, populated lists/tables, real component previews, multiple content regions per screen — measure it, don't infer from tokens); build a reusable system (tokens → elements → composites) from the `DESIGN.md` and implement screens from it while treating that system as a floor, not a ceiling; **take every surface to interactive depth** (master/detail, sub-tabs that switch real content, wired toggles/filters, deep action flows, the spec's named sub-features); **place each surface's nav in the right shell region** — let a file tree / mailbox list / conversation list OWN the source-list "middle sidebar"; cover the 5 states per screen where they apply; author light + dark independently; **ship the standalone pan/zoom wall on top of Storybook**; and **verify by CLICKING** (build ≠ render ≠ interaction), not just by eye.
- **Don't** invent a design system when none was supplied (resolve a real `DESIGN.md` first) or default to a generic/macOS look; don't copy the HIG's macOS *aesthetic* (13pt body, Liquid Glass, fake traffic-light chrome, the system accent) when the brand says otherwise — take *behaviour* from the HIG, *look* from the `DESIGN.md`; don't hand-roll one-off styles instead of tokens/components; don't let brand styling break the interaction floor (focus ring, keyboard, honest hit targets, contrast); don't ship *on-brand but thin* screens — coloured rectangles standing in for real component previews, a gradient box standing in for a real page, 2–3-row stubs standing in for populated tables, or empty filler regions; **don't trade per-surface fidelity for breadth of coverage**, and don't infer spacing/detail from tokens when a reference exists (measure it); **don't ship decorative tabs/toggles that don't switch real content, or action buttons that open nothing**; **don't cram a surface's primary nav into the content area beside a half-empty generic middle sidebar** (own the sidebar instead), or stack extra in-content nav bands when the toolbar / sidebar / list-header are the homes; **don't call a storyboard done without the wall page**; don't trust a green build as proof a screen renders or behaves — drive it; don't duplicate the design system when updating an existing storyboard.
