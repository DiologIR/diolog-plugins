# create-storyboard

Build an interactive **UI storyboard** as a **StyleX + Storybook** project from a product specification and a **user-supplied `DESIGN.md`** — every screen of every user flow, rendered across the **happy / empty / loading / error / AI** states, from a reusable design system.

A brand-driven sibling of [`macosify`](../macosify)'s `macos-storyboard` skill. The difference: **`macos-storyboard` is locked to a macOS-native look**; **`create-storyboard` is not** — the product's own `DESIGN.md` drives the visual identity, so the storyboard comes out in *your* brand, not a stock Mac app.

## What it does

Given a spec (a single feature, a whole project, or "update an existing storyboard") and a `DESIGN.md`, the skill:

1. **Secures the `DESIGN.md`** — the product's design system (palette, type, spacing, shape, materials, motion, density, voice). This drives the look. If none is supplied, it resolves one first (asks, derives from a reference via `design-md-from-screenshots`, or proposes directions via `design-craft`) rather than defaulting to a generic look.
2. **Loads the bundled HIG** as the **interaction, behaviour, structure, and accessibility backbone** — broadly-applicable UX wisdom (layout zones, master–detail/list/table grammar, modality, feedback, focus/keyboard model, motion, empty/loading/error/status handling, writing) — applied through the brand's skin, *not* as a macOS look to copy.
3. **Derives the user flows, screens, and components**, and which of the 5 states each screen needs.
4. **Sets a production-fidelity bar** — matches the information density and per-surface detail of any reference (measured, not eyeballed), so screens read as the shipped product, not a wireframe.
5. **Uses `design-craft` + `frontend-design`** for distinctive, accessible, AI-slop-resistant direction within the brand.
6. **Scaffolds StyleX + Storybook** (`npx @stylexjs/create … --framework storybook`), builds a reusable design system (tokens → elements → composites) from the `DESIGN.md`, and implements every screen as **one story per applicable state** plus an **MDX flow-overview** per user flow.
7. **Verifies the render and the fidelity by eye**, then runs the accessibility / slop / polish passes.

> Triggers: "create / build / generate a storyboard", "storyboard the user flows for this feature/project", "show the happy / empty / loading / error / AI states", "build a StyleX or Storybook UI / design system from this brand spec", "prototype screens for this spec", "update the storyboard". For a UI that must specifically look macOS-native, use `macos-storyboard` instead.

## The two inputs, kept in their lanes

| Input | Role | Drives |
|---|---|---|
| **User's `DESIGN.md`** | The product's brand/design system | **The look** — palette, type, density, shape, materials, motion personality, voice |
| **Bundled HIG** (`reference/hig/`) | Interaction & UX backbone | **The behaviour** — structure, navigation grammar, modality, feedback, focus/keyboard, motion-as-communication, accessibility, writing |

Precedence: spec + `DESIGN.md` (look & product) → HIG (interaction, structure, accessibility) → `design-craft` / `frontend-design` (distinctiveness & polish). A HIG aesthetic detail never overrides the brand; brand styling never breaks the interaction floor (focus ring, keyboard, honest hit targets, contrast).

## Layout

```
create-storyboard/
├── reference/
│   └── hig/                         # HIG library — read as the interaction/UX/accessibility backbone (look comes from your DESIGN.md)
└── skills/
    └── create-storyboard/
        ├── SKILL.md
        └── references/
            └── stylex-storybook-guide.md   # StyleX/Storybook mechanics, the 5-state taxonomy, DESIGN.md→token mapping, project structure
```

## Notes

- The bundled HIG is a **point-in-time reference for an evolving OS**; it is used here for durable interaction/structure/accessibility principles, not pixel-exact macOS chrome. Visual specifics come from your `DESIGN.md`.
- Skills reference their bundled files via `${CLAUDE_PLUGIN_ROOT}` so they resolve wherever the plugin is installed.

## License

MIT
