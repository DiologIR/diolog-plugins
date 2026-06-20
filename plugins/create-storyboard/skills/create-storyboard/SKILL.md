---
name: create-storyboard
description: "Generate an interactive UI storyboard as a StyleX + Storybook project from a product specification and a user-supplied DESIGN.md — for a single feature, a whole project, or an update to an existing storyboard. The DESIGN.md (the product's own brand/design system: palette, type, density, shape, motion, voice) drives the look — this skill is NOT locked to a macOS aesthetic and produces UIs in whatever visual identity the DESIGN.md specifies. It still reads the bundled HIG library as the interaction, behaviour, and accessibility backbone (layout structure, master–detail/list/table grammar, modality, feedback, focus/keyboard model, motion, empty/loading/error/status handling, writing) — broadly-applicable UX wisdom, applied through the brand's skin rather than copying Apple's look — and uses the design-craft and frontend-design skills for distinctive, accessible, AI-slop-resistant direction. It derives the user flows and screens, builds a reusable StyleX design system (tokens → elements → composites) from the DESIGN.md, scaffolds the project via `npx @stylexjs/create … --framework storybook`, and implements every screen as Storybook stories across the happy, empty, loading, error, and AI states — at production fidelity, matching the information density and per-surface detail of any reference the user points to rather than sketching a thin wireframe of it — plus an MDX flow-overview that sequences the screens into journeys. Use this skill whenever the user asks to create / build / generate a storyboard, storyboard the user flows for a feature or project, show the happy / empty / loading / error / AI states for a UI, build a StyleX or Storybook UI / design system from a brand spec, prototype screens for a spec, or update an existing storyboard. For a UI that must specifically look macOS-native, use the macos-storyboard skill instead — this skill generates a brand-driven StyleX/Storybook storyboard from a specification + a DESIGN.md in any visual identity."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, Skill
---

# create-storyboard — build a brand-driven StyleX + Storybook storyboard

You turn a product specification into an **interactive storyboard**: a **StyleX + Storybook** project whose stories show each screen of each user flow across the **happy, empty, loading, error, and AI** states, built from a **reusable design system derived from the user's `DESIGN.md`**. The rendered Storybook *is* the storyboard — there is no separate static HTML artifact.

Two inputs work together, and keeping them in their lanes is the whole game:

- **The user's `DESIGN.md`** — the product's own design system (palette, typography, spacing, shape/radii, materials, elevation, motion personality, density, voice, component contracts). **This drives the look.** The storyboard must read unmistakably as *this product*, in *its* visual identity — not a stock Mac app, not a generic AI-template look.
- **The bundled HIG library** (`${CLAUDE_PLUGIN_ROOT}/reference/hig/`) — the **interaction, behaviour, structure, and accessibility backbone**. It is Apple's macOS HIG, but you read it for *how surfaces should behave and be organised and stay usable* (layout zones, master–detail/list/table grammar, modality, feedback, focus/keyboard model, motion-as-communication, empty/loading/error/status handling, writing) — broadly-applicable UX principles — **not** to copy the macOS *aesthetic*. When the HIG prescribes a platform-specific look (13pt body, Liquid Glass, traffic-light chrome, the system accent), defer to the `DESIGN.md` for the actual appearance.

Crucially, every screen must reach **production fidelity** — the information density and detail of a real, populated product surface, matching any reference the user points to, not a thin sketch of it (see Step 3).

Supporting reference (read it for the StyleX/Storybook mechanics, the state taxonomy, the DESIGN.md→token mapping, and the project structure): `${CLAUDE_PLUGIN_ROOT}/skills/create-storyboard/references/stylex-storybook-guide.md`.

## Step 1 — Secure the DESIGN.md, then load the HIG (mandatory, before anything else)

**1a. The DESIGN.md is required — it is what makes the UI bespoke.** Locate the product's design system before you design or write a line of code:

- If the user supplied a `DESIGN.md` (or a design-token file, brand spec, style guide, or screenshots of the product), read it fully — palette, type scale, spacing/grid, radii/shape, materials, elevation, motion, density, voice, and any per-component contracts. This is the source of truth for *how it looks*.
- If none was supplied, **don't invent one silently and don't fall back to a generic look.** Resolve it first: ask the user where the design system lives; or, if they point at a reference (a live product, screenshots, a Figma export), derive a `DESIGN.md` from it (use the `design-md-from-screenshots` skill, or the `design-craft` *design-system-extract* procedure); or, for a greenfield spec with no brand yet, propose a small set of directions with `design-craft` *frontend-aesthetic-direction* and have the user pick before you build. A storyboard built on an un-grounded design system is the #1 cause of the generic "AI-mockup" look.

**1b. Load the HIG as the interaction backbone.** Read the bundled library — `index.md` first, then the component/foundation files relevant to the surfaces you're building (for a master–detail screen: `split-views` + `sidebars` + `lists-and-tables` + `toolbars`; always read `layout`, `accessibility`, `feedback`, `motion`, `writing`, and `progress-and-status-indicators` for the state work). Take **behaviour and structure** from it; ignore its macOS-specific *look* prescriptions in favour of the `DESIGN.md`.

**Precedence:** the user's spec + `DESIGN.md` (for all product/brand/visual decisions) → HIG (for interaction grammar, structure, behaviour, and accessibility) → design-craft / frontend-design (for distinctiveness and polish). Never let a HIG aesthetic detail override the brand, and never let brand styling break sound interaction (real focus ring, keyboard operability, honest hit targets, accessible roles, legible contrast).

## Step 2 — Understand the spec, derive the flows

- The user gives a **specification**: a single feature, an entire project, or **"update an existing storyboard."**
- **If updating:** locate the existing StyleX/Storybook project, read its current tokens/elements/composites/stories/flows, and plan a *reconciling* change — extend and refactor shared parts, don't duplicate or fork the design system.
- Derive: the **user flows** (the journeys a user takes), the **screens** in each flow, and the **components** each screen needs. Capture them as a short plan (flows → screens → components). A single feature needs no scope check — proceed; for a whole project or an ambiguous spec, confirm scope with the user and prioritise the primary flows first.
- For **each screen**, decide which of the **5 states** apply and what each shows (see the guide for precise definitions): **happy** (populated/success), **empty** (no data / first run), **loading** (skeletons/placeholders), **error** (failure + recovery path), **AI** (AI-generated / streaming / assistant state). Not every screen has all five — cover the ones that genuinely apply, and never omit error/empty where the flow can reach them.
- **Note any reference.** If the user names — or the repo/codebase contains — an existing mock, product UI, or live app for these surfaces, treat it as the **fidelity + layout reference** (Step 3), not just a source of brand tokens. Find it before you design (ask, or grep the repo for a `mock-ui`/design dir).

## Step 3 — Set the fidelity bar (match the reference; don't sketch it)

The most common failure of an AI-built storyboard is screens that are *on-brand but thin* — calm, sparse, templated, padded with placeholder content. **Restraint applies to chrome and decoration, never to content:** a real product surface is information-dense. Each screen must read as a **populated, working product surface** at the detail level of the reference — a screenshot of the shipped product, not a wireframe of it.

- **If a reference exists, it sets the bar.** When the user names one, or the repo contains an existing mock / product UI / live app for these surfaces, study it FIRST and match its **information density, per-surface layout, and real rendered content**. **Measure computed styles in a browser** (use the `mockup-fidelity` skill) — do not infer spacing, density, and detail from design tokens alone. A token/DESIGN.md spec defines *identity* (colour, type, voice), not the *amount of stuff* on each screen, so a faithful reading of the tokens will still under-build the UI.
- **Invest in realistic sample data — a first-class step, not an afterthought.** Thin placeholder data is the #1 cause of the "AI-mockup" look. Populate lists/tables with 8–15 believable, domain-true rows; give cards real values, secondary metadata, counts, timestamps, and status; show multiple content regions per screen.
- **The Looks-real checklist (every happy screen must pass):** ① populated primary content (not 2–3 stubs) · ② real secondary detail (metadata / counts / timestamps / sync or status) · ③ at least one genuinely dense region (a real table, canvas, inspector, graph, or multi-section list) · ④ **real rendered component instances** wherever the screen is *about* components/design (never coloured rectangles as stand-ins) · ⑤ believable copy and tabular numbers. If it would pass as a screenshot of the shipped product, it clears the bar.
- **Breadth never lowers the bar.** If coverage is large (many surfaces), keep each one at fidelity, or mark the lower-fi ones honestly — never let "cover everything" silently become "sketch everything."

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

## Step 7 — Implement the storyboard in Storybook

- **One story file per screen, one story per applicable state** (Happy / Empty / Loading / Error / AI) driven by args/variants — so a reviewer flips a screen through all its states.
- **A flow-overview MDX page per user flow** that lays the screens out in sequence (the journey), annotates each state, and links to the individual stories. This is the "storyboard showing user flows."
- Storybook hierarchy: `Design System/Elements/*`, `Design System/Composites/*`, `Flows/<FlowName>/<Screen>` (+ the `Flows/<FlowName>` MDX overview). Provide a light/dark toolbar toggle so both appearances are reviewable.

## Step 8 — Verify it actually renders, then polish

- Build (or run) Storybook and confirm it **compiles and renders with no errors**; fix anything broken. A storyboard that doesn't render isn't done. (A clean *build* does not prove a clean *render* — load the screens.)
- **Fidelity pass — do this every time, by eye.** Screenshot the rendered screens (headless is fine) and compare each happy screen to the reference, or to the Step 3 Looks-real checklist. If it reads as a wireframe — placeholder boxes, 2–3-row stubs, empty regions, coloured-rectangle "previews" — it **fails**; raise its density and detail before shipping. Don't trust that it compiled; trust what the screen looks like.
- Run the **design-craft** *ai-slop-check*, *accessibility-audit*, and *polish-pass* over the rendered screens; confirm **the `DESIGN.md` is honoured** (the brand's palette/type/density/shape/motion/voice actually show through, not a generic default) and that the **HIG interaction floor holds** (sound structure, keyboard/focus, honest hit targets, contrast 4.5:1 / 3:1, motion communicates, reduced-motion/transparency/contrast honoured), and that each of the 5 states reads correctly and consistently.
- For a large storyboard, fan out one `Agent` per flow to review its screens independently against the fidelity bar, then reconcile.

## Do / Don't

- **Do** secure and read the user's `DESIGN.md` first (it drives the look), then read the HIG for interaction/structure/accessibility grounding; **find and match the reference's fidelity and information density** (realistic domain-true data, populated lists/tables, real component previews, multiple content regions per screen — measure it, don't infer from tokens); build a reusable system (tokens → elements → composites) from the `DESIGN.md` and implement screens from it while treating that system as a floor, not a ceiling; cover the 5 states per screen where they apply; author light + dark independently; verify the render *and* the fidelity by eye.
- **Don't** invent a design system when none was supplied (resolve a real `DESIGN.md` first) or default to a generic/macOS look; don't copy the HIG's macOS *aesthetic* (13pt body, Liquid Glass, fake traffic-light chrome, the system accent) when the brand says otherwise — take *behaviour* from the HIG, *look* from the `DESIGN.md`; don't hand-roll one-off styles instead of tokens/components; don't let brand styling break the interaction floor (focus ring, keyboard, honest hit targets, contrast); don't ship *on-brand but thin* screens — coloured rectangles standing in for real component previews, a gradient box standing in for a real page, 2–3-row stubs standing in for populated tables, or empty filler regions; **don't trade per-surface fidelity for breadth of coverage**, and don't infer spacing/detail from tokens when a reference exists (measure it); don't ship without the render + fidelity + slop/accessibility passes; don't duplicate the design system when updating an existing storyboard.
