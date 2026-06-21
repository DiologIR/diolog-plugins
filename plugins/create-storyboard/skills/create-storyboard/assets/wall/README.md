# The whole-wall page (a REQUIRED deliverable, on top of Storybook)

Every storyboard ships **two** views of the same screens:

1. **Storybook** — one story per screen × state (the reviewable, state-by-state view).
2. **The whole wall** — *one standalone webpage* with **every screen on a single infinite pan/zoom
   canvas** (Figma-board style): drag to pan, ⌘/ctrl-scroll to zoom toward the cursor, plus +/−/Fit/100%.
   This is how a reviewer sees the *whole product at a glance* and judges consistency across surfaces.

**Build the wall for every storyboard.** A Storybook alone is not the finished deliverable.

## The files (copy these into your storyboard project, then adapt)

| File | Goes where | Adapt? |
|---|---|---|
| `Wall.tsx` | `src/stories/Wall.tsx` (next to your stories) | **Yes** — two spots, see below |
| `Wall.stories.tsx` | next to `Wall.tsx` | title only |
| `wall-main.tsx` | project root | the `styles.css` import path |
| `index.html` | project root | title + bg colour |
| `vite.wall.config.ts` | project root | usually none |

Add two `package.json` scripts:

```json
"wall:build": "vite build -c vite.wall.config.ts",
"wall:serve": "vite preview -c vite.wall.config.ts --outDir storyboard-wall --port 6010"
```

Then: `npm run wall:build` → `storyboard-wall/` (a standalone site). Serve it with any static server.

## The two things to adapt in `Wall.tsx`

1. **`layout()`** — emit one cell per screen, grouped into labelled bands, from *your* IA/catalogue.
2. **`<AreaScreen .../>`** — render one happy-state, fixed-height screen for a cell. Swap this import for
   your project's "render the full themed window for an area" entry — **the same one your flow stories
   use**, so the wall is byte-identical to Storybook (same tokens, components, data).

## Why it just works

`vite.wall.config.ts` reuses the **same StyleX pipeline as Storybook** — the React plugin runs your
`.babelrc.cjs` (StyleX babel transform) and Vite auto-loads `postcss.config.mjs` (StyleX PostCSS
extraction). No second styling setup; the wall renders exactly like the stories.

## Performance

The canvas transforms a single `world` div via a **ref** (not React state), so the 50+ screens render
**once** and never re-render while you pan/zoom — smooth at any surface count.
