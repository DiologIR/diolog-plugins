# StyleX + Storybook storyboard guide

The mechanics behind the `macos-storyboard` skill: the state taxonomy, StyleX essentials, the DESIGN.md→StyleX token mapping, and the Storybook project structure. **Source of truth for StyleX API is the live docs (https://stylexjs.com/docs) and the scaffolded starter's own example files — verify against them; don't guess an API.**

## The 5 states (cover the ones that genuinely apply per screen)

| State | What it shows | macOS grounding (from the HIG corpus) |
|---|---|---|
| **Happy** | The normal, populated, successful path — real content. The default story. | Content layer is the star; chrome stays sparse. |
| **Empty** | No data yet — first run, zero results, cleared filters. *Not* an error. | Centred icon + one line + one CTA; hide filters/secondary UI until there's content (`layout.md` empty states). |
| **Loading** | Work in progress > ~1–2s — **skeleton placeholders** for content, determinate progress where measurable. | Prefer a **determinate** indicator; keep it moving; no spinner-flash on sub-second work (`progress-and-status-indicators.md`). |
| **Error** | A failure the user must see + a recovery path (Retry / fix). | Show it **inline near the problem and say how to fix it** (`writing.md`); reserve alerts for critical/destructive (`sheets-and-alerts.md`). |
| **AI** | AI-generated / streaming / assistant content — the "thinking/streaming" sub-state and the settled result, with provenance + accept/regenerate affordances. | A transient content-layer control may take a **Liquid Glass** appearance *while activating* (`materials-and-liquid-glass.md`); otherwise content stays opaque. |

Build each as a **reusable composite** (`EmptyState`, `LoadingState`, `ErrorState`, `AIState`) so every screen's states are consistent, then surface them as **story variants** per screen.

## StyleX essentials (verify against the docs + scaffold)

- Import: `import * as stylex from '@stylexjs/stylex'`.
- Define + apply styles:
  ```ts
  const styles = stylex.create({ row: { display: 'flex', gap: 8, fontSize: 13 } })
  // <div {...stylex.props(styles.row, isSelected && styles.selected)} />
  ```
- **Design tokens** live in a `*.stylex.ts` file via `stylex.defineVars` (the filename MUST end `.stylex.ts`). Reference the returned vars inside `stylex.create`.
- **Themes**: `stylex.createTheme(vars, { … })` produces a theme you apply by spreading `stylex.props(theme)` on a wrapper — use this for the Storybook **light/dark toolbar toggle**. For automatic appearance, `defineVars` values can also carry a `default` + `@media (prefers-color-scheme: dark)` conditional.
- Variants/props drive state; never duplicate a component to restyle it.

## DESIGN.md → StyleX tokens (shape; fill values from `reference/DESIGN.md`)

```ts
// tokens.stylex.ts  — light defaults + dark via prefers-color-scheme (author both, never invert)
import * as stylex from '@stylexjs/stylex'

export const color = stylex.defineVars({
  windowBg:   { default: '#ECECEC', '@media (prefers-color-scheme: dark)': '#1E1E1E' },
  surface:    { default: '#FFFFFF', '@media (prefers-color-scheme: dark)': '#2C2C2E' },
  label:      { default: 'rgba(0,0,0,0.85)', '@media (prefers-color-scheme: dark)': 'rgba(255,255,255,1)' },
  labelSecondary: { default: 'rgba(0,0,0,0.5)', '@media (prefers-color-scheme: dark)': 'rgba(255,255,255,0.55)' },
  separator:  { default: 'rgba(60,60,67,0.29)', '@media (prefers-color-scheme: dark)': 'rgba(255,255,255,0.15)' },
  accent:     { default: '#0088FF', '@media (prefers-color-scheme: dark)': '#0091FF' }, // bind to brand accent if supplied
})
export const space = stylex.defineVars({ xxs: '4px', xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' })
export const radius = stylex.defineVars({ sm: '6px', md: '8px', lg: '12px', xl: '16px', pill: '9999px' })
export const font = stylex.defineVars({
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  body: '13px', title3: '15px', title2: '17px', title1: '22px', largeTitle: '26px',
})
// materials (glass) — floating chrome only; content stays opaque
export const material = stylex.defineVars({
  regular: { default: 'rgba(236,236,236,0.63)', '@media (prefers-color-scheme: dark)': 'rgba(44,44,44,0.61)' },
})
// A bespoke brand spec, if supplied, overrides accent/type/density here — layered ON the macOS base.
```

Honour the macOS contracts the tokens encode: **13pt body**, ~**28/20pt** control sizing (padded to the hit target), **concentric corners** (capsule = h/2; child = parent − padding), glass only on floating chrome, accent-bound selection/primary.

## Storybook structure

```
src/
  tokens.stylex.ts                 // defineVars from DESIGN.md (+ brand)
  theme.ts                         // createTheme light/dark for the toolbar toggle
  elements/                        // atoms — each with a .stories.tsx
    Button.tsx  TextField.tsx  ListRow.tsx  SidebarItem.tsx  Toolbar.tsx  Icon.tsx  GlassSurface.tsx ...
  composites/                      // molecules/organisms incl. the state composites
    Sidebar.tsx  SplitView.tsx  Sheet.tsx  EmptyState.tsx  LoadingState.tsx  ErrorState.tsx  AIState.tsx ...
  flows/<FlowName>/
    <Screen>.tsx                   // composed from elements + composites
    <Screen>.stories.tsx           // ONE story per applicable state (Happy/Empty/Loading/Error/AI)
    <FlowName>.mdx                 // flow-overview: screens in sequence + state notes + links
```

Storybook sidebar hierarchy: `Design System/Elements/*`, `Design System/Composites/*`, `Flows/<FlowName>/<Screen>`, `Flows/<FlowName>` (the MDX overview).

**Story-per-state (CSF) shape:**
```tsx
const meta = { title: 'Flows/Onboarding/ProjectList', component: ProjectList }
export default meta
export const Happy   = { args: { projects: sample } }
export const Empty   = { args: { projects: [] } }
export const Loading = { args: { loading: true } }
export const Error   = { args: { error: 'Couldn’t load projects' } }   // include the recovery action
export const AI      = { args: { ai: { streaming: true, suggestion: '…' } } }
```

**Flow-overview MDX** lays the screens out in journey order (frames left→right or top→down), annotates which states each screen has, and links to the stories — this is the storyboard view of the user flow.

## Design-system best practices to enforce

- **One source of truth** for tokens (`*.stylex.ts`); screens never hardcode colours/sizes.
- **Layer**: tokens → elements (atoms) → composites (molecules/organisms) → screens. New need ⇒ add to the system, never a one-off inline style.
- **Variants via props**, not duplicated components; the 5 states are variants/args, not copies.
- **Accessible by default**: focus ring, real roles/labels, keyboard operability, 4.5:1 / 3:1 contrast, honour reduced-motion/transparency/contrast.
- **Every piece is a story** (elements, composites, and screens) so the system is browsable and reviewable.
- **Light + dark authored independently**; verify both via the toolbar toggle.
