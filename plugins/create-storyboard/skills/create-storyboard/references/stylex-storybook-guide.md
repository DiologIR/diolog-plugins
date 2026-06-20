# StyleX + Storybook storyboard guide

The mechanics behind the `create-storyboard` skill: the state taxonomy, StyleX essentials, the `DESIGN.md`→StyleX token mapping, and the Storybook project structure. **Source of truth for StyleX API is the live docs (https://stylexjs.com/docs) and the scaffolded starter's own example files — verify against them; don't guess an API.**

Two lanes, kept separate throughout: the **`DESIGN.md` drives the look** (every token value below comes from it), and the **bundled HIG (`${CLAUDE_PLUGIN_ROOT}/reference/hig/`) drives interaction, structure, and accessibility** (the "grounding" column in the state table, the focus/keyboard model, the layout zones). Take values from the brand; take behaviour from the HIG.

## The 5 states (cover the ones that genuinely apply per screen)

| State | What it shows | Interaction grounding (from the HIG corpus) |
|---|---|---|
| **Happy** | The normal, populated, successful path — real content. The default story. | Content layer is the star; chrome stays sparse. |
| **Empty** | No data yet — first run, zero results, cleared filters. *Not* an error. | Centred icon + one line + one CTA; hide filters/secondary UI until there's content (`layout.md` empty states). |
| **Loading** | Work in progress > ~1–2s — **skeleton placeholders** for content, determinate progress where measurable. | Prefer a **determinate** indicator; keep it moving; no spinner-flash on sub-second work (`progress-and-status-indicators.md`). |
| **Error** | A failure the user must see + a recovery path (Retry / fix). | Show it **inline near the problem and say how to fix it** (`writing.md`); reserve alerts for critical/destructive (`sheets-and-alerts.md`). |
| **AI** | AI-generated / streaming / assistant content — the "thinking/streaming" sub-state and the settled result, with provenance + accept/regenerate affordances. | Make the transient/streaming state legible and the result's provenance + accept/regenerate clear (`feedback.md`, `motion.md`); style it in the brand's own idiom from the `DESIGN.md`. |

Build each as a **reusable composite** (`EmptyState`, `LoadingState`, `ErrorState`, `AIState`) so every screen's states are consistent, then surface them as **story variants** per screen.

## StyleX essentials (verify against the docs + scaffold)

- Import: `import * as stylex from '@stylexjs/stylex'`.
- Define + apply styles:
  ```ts
  const styles = stylex.create({ row: { display: 'flex', gap: 8 } })
  // <div {...stylex.props(styles.row, isSelected && styles.selected)} />
  ```
- **Design tokens** live in a `*.stylex.ts` file via `stylex.defineVars` (the filename MUST end `.stylex.ts`). Reference the returned vars inside `stylex.create`.
- **Themes**: `stylex.createTheme(vars, { … })` produces a theme you apply by spreading `stylex.props(theme)` on a wrapper — use this for the Storybook **light/dark toolbar toggle**. For automatic appearance, `defineVars` values can also carry a `default` + `@media (prefers-color-scheme: dark)` conditional.
- Variants/props drive state; never duplicate a component to restyle it.

## `DESIGN.md` → StyleX tokens (shape; fill EVERY value from the user's `DESIGN.md`)

The values below are **placeholders to show the token shape** — replace each one with the corresponding value from the user's `DESIGN.md`. Do not ship these defaults; they exist only so the structure is clear. If the `DESIGN.md` doesn't specify a given token, derive it from a sibling token in the same family rather than inventing an off-brand value, and note the gap.

```ts
// tokens.stylex.ts  — light defaults + dark via prefers-color-scheme (author both, never invert)
import * as stylex from '@stylexjs/stylex'

export const color = stylex.defineVars({
  // ← every value from DESIGN.md's palette + label/text tiers
  windowBg:       { default: '<bg>',          '@media (prefers-color-scheme: dark)': '<bg-dark>' },
  surface:        { default: '<surface>',      '@media (prefers-color-scheme: dark)': '<surface-dark>' },
  label:          { default: '<text>',         '@media (prefers-color-scheme: dark)': '<text-dark>' },
  labelSecondary: { default: '<text-2>',       '@media (prefers-color-scheme: dark)': '<text-2-dark>' },
  separator:      { default: '<hairline>',     '@media (prefers-color-scheme: dark)': '<hairline-dark>' },
  accent:         { default: '<brand-accent>', '@media (prefers-color-scheme: dark)': '<brand-accent-dark>' },
})
export const space  = stylex.defineVars({ /* the DESIGN.md spacing scale, e.g. */ xxs: '4px', xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' })
export const radius = stylex.defineVars({ /* the DESIGN.md shape/radii scale */    sm: '<r-sm>', md: '<r-md>', lg: '<r-lg>', xl: '<r-xl>', pill: '9999px' })
export const font   = stylex.defineVars({
  // ← the DESIGN.md type families + scale. Use the brand's body size (NOT a hardcoded 13/16/17px).
  sans: '<brand-sans-stack>', mono: '<brand-mono-stack>',
  body: '<body-size>', title3: '<…>', title2: '<…>', title1: '<…>', largeTitle: '<…>',
})
// materials/elevation — ONLY if the DESIGN.md specifies translucency/blur or a shadow ramp
export const material = stylex.defineVars({
  regular: { default: '<material>', '@media (prefers-color-scheme: dark)': '<material-dark>' },
})
```

Honour the contracts **the `DESIGN.md` encodes** — its body size, control sizing, corner/shape language, accent binding, and (only if specified) its material/translucency rules. The HIG adds the interaction floor on top: pad small controls to a comfortable hit target, keep one prominent/default action per surface, and keep selection/primary bound to the brand accent.

## Storybook structure

```
src/
  tokens.stylex.ts                 // defineVars from the user's DESIGN.md
  theme.ts                         // createTheme light/dark for the toolbar toggle
  elements/                        // atoms — each with a .stories.tsx
    Button.tsx  TextField.tsx  ListRow.tsx  SidebarItem.tsx  Toolbar.tsx  Icon.tsx  Surface.tsx ...
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

- **One source of truth** for tokens (`*.stylex.ts`, derived from the `DESIGN.md`); screens never hardcode colours/sizes.
- **Layer**: tokens → elements (atoms) → composites (molecules/organisms) → screens. New need ⇒ add to the system, never a one-off inline style.
- **Variants via props**, not duplicated components; the 5 states are variants/args, not copies.
- **Accessible by default**: focus ring, real roles/labels, keyboard operability, 4.5:1 / 3:1 contrast, honour reduced-motion/transparency/contrast.
- **Every piece is a story** (elements, composites, and screens) so the system is browsable and reviewable.
- **Light + dark authored independently**; verify both via the toolbar toggle.
