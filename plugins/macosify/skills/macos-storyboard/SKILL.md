---
name: macos-storyboard
description: "Generate an interactive, macOS-native UI storyboard as a StyleX + Storybook project from a product specification — a single feature, a whole project, or an update to an existing storyboard. Before starting, it reads the ENTIRE bundled macOS 26 (Liquid Glass) HIG library, the token-level DESIGN.md, and the accumulated macos-ui-learnings into context (optionally plus a product/brand DESIGN.md-like spec the user supplies to make the UI bespoke), then uses the design-craft and frontend-design skills for distinctive, accessible, AI-slop-resistant design direction. It derives the user flows and screens, builds a reusable StyleX design system (tokens → elements → composites) following design-system best practices, scaffolds the project via `npx @stylexjs/create … --framework storybook`, and implements every screen as Storybook stories across the happy, empty, loading, error, and AI states, plus an MDX flow-overview that sequences the screens into journeys. Use this skill whenever the user asks to create / build / generate a storyboard, storyboard the user flows for a feature or project, show the happy / empty / loading / error / AI states for a UI, build a StyleX or Storybook UI / design system, prototype screens for a spec, or update an existing storyboard. To refit an existing live UI to macOS conventions use the macosify skill, and to analyse a static screenshot into a native spec use the macos-ui-analyst skill — this skill generates a NEW StyleX/Storybook storyboard from a specification."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, Skill
---

# macos-storyboard — build a macOS-native StyleX + Storybook storyboard

You turn a product specification into an **interactive storyboard**: a **StyleX + Storybook** project whose stories show each screen of each user flow across the **happy, empty, loading, error, and AI** states, built from a **reusable, macOS-native design system**. The rendered Storybook *is* the storyboard — there is no separate static HTML artifact. Every screen is grounded in authentic macOS 26 (Liquid Glass) conventions, made distinctive and bespoke via the design-craft / frontend-design skills and any brand context the user supplies.

Supporting reference (read it for the StyleX/Storybook mechanics, the state taxonomy, the token mapping, and the project structure): `${CLAUDE_PLUGIN_ROOT}/skills/macos-storyboard/references/stylex-storybook-guide.md`.

## Step 1 — Load the full macOS corpus FIRST (mandatory, before anything else)

Read all of this into context before you design or write a line of code — do not cherry-pick:

1. **The entire HIG library** — every one of the 37 `.md` files in `${CLAUDE_PLUGIN_ROOT}/reference/hig/`: read `index.md` first, then the remaining 36.
2. **`${CLAUDE_PLUGIN_ROOT}/reference/DESIGN.md`** — the token-level macOS design system (semantic colours + label tiers, SF Pro named text styles with **Body = 13pt**, 8pt grid, Liquid Glass material ramp, elevation, motion, radii, per-component contracts, the "Native-feel checklist", and "The hard HIG numbers").
3. **`${CLAUDE_PLUGIN_ROOT}/learnings/macos-ui-learnings.md`** — durable, real-screenshot-derived patterns (incl. framework-origin tells + their AppKit-native corrections). Prefer a high-confidence learning here over a guess.
4. **Optional bespoke context** — if the user supplies an additional DESIGN.md-like spec (a product/brand design system, tokens, voice, screenshots), read it. It **layers on top of** the macOS base: macOS-native grammar is the foundation; the brand spec supplies identity (accent, type personality, density, voice) to make the UI feel bespoke rather than a stock Mac app.

**Precedence:** the user's spec + brand context (for product/brand decisions) → macOS HIG (for native grammar/behaviour) → DESIGN.md tokens → learnings. Never let brand styling break native behaviour (real chrome, glass only on floating chrome, 13pt body, accent binding, keyboard/a11y).

## Step 2 — Understand the spec, derive the flows

- The user gives a **specification**: a single feature, an entire project, or **"update an existing storyboard."**
- **If updating:** locate the existing StyleX/Storybook project, read its current tokens/elements/composites/stories/flows, and plan a *reconciling* change — extend and refactor shared parts, don't duplicate or fork the design system.
- Derive: the **user flows** (the journeys a user takes), the **screens** in each flow, and the **components** each screen needs. Capture them as a short plan (flows → screens → components). A single feature needs no scope check — proceed; for a whole project or an ambiguous spec, confirm scope with the user and prioritise the primary flows first.
- For **each screen**, decide which of the **5 states** apply and what each shows (see the guide for precise definitions): **happy** (populated/success), **empty** (no data / first run), **loading** (skeletons/placeholders), **error** (failure + recovery path), **AI** (AI-generated / streaming / assistant state). Not every screen has all five — cover the ones that genuinely apply, and never omit error/empty where the flow can reach them.

## Step 3 — Design direction (use design-craft + frontend-design)

Establish a distinctive, intentional, accessible look that is macOS-native at its core:

- Invoke the **`frontend-design`** skill to set an aesthetic direction that avoids generic AI aesthetics and feels production-grade.
- Use the **`design-craft`** skill at the matching stages — its *frontend-aesthetic-direction* (look options), *design-system-extract* (tokens/components), *accessibility-audit*, *ai-slop-check*, and *polish-pass* procedures.
- Fuse the inputs: macOS-native conventions (HIG/DESIGN.md/learnings) are the non-negotiable foundation; design-craft/frontend-design make it intentional and bespoke; the optional brand spec supplies identity. Resolve conflicts toward native behaviour.

## Step 4 — Scaffold the StyleX + Storybook project (run it end-to-end)

- Confirm a target directory and app name (default a sensible kebab-case name from the spec). Run the official starter:
  `npx @stylexjs/create <app-name> --framework storybook`
- Install dependencies and confirm the starter's Storybook builds/runs before you build on it. Treat the **scaffolded example files + the live docs at https://stylexjs.com/docs as the source of truth for StyleX API** — verify against them rather than guessing.
- Define **design tokens** with `stylex.defineVars` in a tokens file derived from DESIGN.md (label tiers, system palette, materials, spacing, radii, type scale) plus any bespoke brand tokens; author **light and dark** themes independently (via `stylex.createTheme`) — never invert. See the guide for the mapping.

## Step 5 — Build the reusable design system (tokens → elements → composites)

Follow design-system best practices: one source of truth for tokens, variants via props (not copy-paste), composition over duplication, accessible by default, each piece a Storybook story.

- **Elements** (atoms) — Button (default/prominent/destructive roles), TextField/SearchField, Toggle/Checkbox, SegmentedControl, ListRow, SidebarItem, ToolbarItem, Icon (SF-Symbol-like, outline/fill/slash variants), Label (the tier system), Material/Glass surface, Spinner/ProgressBar, Badge, etc. Each honours the macOS contracts (13pt body, ~28/20pt control sizing padded to target, concentric corners, glass only on chrome, accent-bound selection/primary, default cursor, focus ring).
- **Composites** (molecules/organisms) — Sidebar (source list), Toolbar (leading/center/trailing regions), SplitView, Sheet, Popover, plus the **state composites**: `EmptyState`, `LoadingState` (skeletons), `ErrorState` (message + recovery), `AIState` (streaming/assistant) — reusable across screens so every screen's 5 states are consistent.
- **Screens** — compose elements + composites into each screen of each flow. No one-off inline styling; if a screen needs something new, add it to the system.

## Step 6 — Implement the storyboard in Storybook

- **One story file per screen, one story per applicable state** (Happy / Empty / Loading / Error / AI) driven by args/variants — so a reviewer flips a screen through all its states.
- **A flow-overview MDX page per user flow** that lays the screens out in sequence (the journey), annotates each state, and links to the individual stories. This is the "storyboard showing user flows."
- Storybook hierarchy: `Design System/Elements/*`, `Design System/Composites/*`, `Flows/<FlowName>/<Screen>` (+ the `Flows/<FlowName>` MDX overview). Provide a light/dark toolbar toggle so both appearances are reviewable.

## Step 7 — Verify it actually renders, then polish

- Build (or run) Storybook and confirm it **compiles and renders with no errors**; fix anything broken. A storyboard that doesn't render isn't done.
- Run the **design-craft** *ai-slop-check*, *accessibility-audit*, and *polish-pass* over the rendered screens; confirm the macOS **native-feel checklist** (real chrome grammar, system font + 13pt, dynamic colour + accent, glass only on chrome, one prominent action, keyboard/focus, motion, contrast) and that each of the 5 states reads correctly and consistently.
- For a large storyboard, fan out one `Agent` per flow to review its screens independently, then reconcile.

## Do / Don't

- **Do** read the entire HIG + DESIGN.md + learnings before designing; build a reusable system (tokens → elements → composites) and implement screens from it; cover the 5 states per screen where they apply; author light + dark independently; verify the render.
- **Don't** skip the macOS grounding or hand-roll one-off styles instead of tokens/components; don't let brand styling break native behaviour (glass on content, fake chrome, web 16px/iOS 17pt body, the hand cursor); don't ship without the render + slop/accessibility passes; don't duplicate the design system when updating an existing storyboard.
