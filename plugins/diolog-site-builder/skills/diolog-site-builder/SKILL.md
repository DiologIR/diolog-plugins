---
name: diolog-site-builder
description: >-
  Build or extend a company website or standalone investor centre by composing gate-tested HTML
  blocks, theming them from DESIGN.md, filling copy from VOICE.md, and wiring Diolog live-data
  markers. Use for a marketing site, investor portal, site artifact, site structure + design +
  voice conversion, or when adding pages, sections, images, and explicit custom workspace blocks.
  Prefer this over hand-writing whole pages because the shared chrome, responsive system, and stock
  blocks already pass the Studio gates. Triggers include "build the company site", "generate the
  investor centre", "scaffold a marketing site", "make a site from this DESIGN.md/VOICE.md", "add
  a pricing page", and "theme this template to the brand".
---

# Diolog Site Builder

Compose a company website — or a standalone investor centre — from a library of pre-built,
gate-tested HTML **blocks**. You do NOT write pages from scratch. You (1) choose the structure,
(2) generate a **theme** from the company DESIGN.md, (3) fill **content slots** in the company
VOICE.md, (4) write a **site spec** listing each page's blocks, (5) run the assembler, (6) do a
**live-value pass**, and (7) validate. Everything lives under this skill's `templates/`.

**Why blocks, not from-scratch pages:** the base design system, the chrome (header/footer/overlays),
the widget skeletons, the five states, mobile collapse, contrast, and the interaction JS are all
already correct and pass the studio gates. Writing pages from scratch re-solves those every time and
drifts. Composing from blocks makes a site in minutes and lands gate-clean by construction.

## When to use which mode

- **`full-site`** — a whole company website: marketing pages (home, about, services, contact, …)
  **plus** an investor portal section. One shared header nav links both. Header/footer variant `full`.
- **`investor-centre`** — a standalone investor centre hosted on its own subdomain
  (`investors.company.com`), linked back to the company's main site. Only investor pages. Header/
  footer variant `investor` (its own nav + a "← Company site" link via `COMPANY_SITE_URL`).
- **`two-page-portal`** — an exact Home + Investors build. Dynamic two-route chrome, photo-led
  editorial composition, value-native market surfaces, a real subscription form and no widget
  markers or omitted-route links.

Pick from the brief. If the company already has a marketing site and only needs IR, build
`investor-centre`. If it's a greenfield whole site, build `full-site`.
When the validated request is exactly Home + Investors, use `two-page-portal`; do not open both
broad presets or replace its compact chrome.

## The template library (read the manifest first)

`templates/manifest.json` is the machine-readable catalogue — **read it before composing**. It lists
every block with its content **slots** and the Diolog **widgets** it carries, a `widgetIndex`
(kind → blocks), the partials, and the presets. Structure:

```
templates/
  base.css            the design system (structure) — token-driven, DO NOT hand-theme it
  theme.default.css   the DEFAULT (plain) theme layer — the DESIGN.md hook (see references/theming.md)
  app.js              interactions (⌘K palette, subscribe modal, mobile nav, accordion, reveals)
  partials/           header.full · header.investor · footer.full · footer.investor · overlays · ticker
  blocks/marketing/   marketing section blocks (heroes, real-image grids, features, stats, pricing, news, …)
  blocks/investor/    legacy widget-frame blocks (do not ship in current zero-widget sites)
  blocks/investor-static/ value-native investor surfaces that current sites ship
  presets/            full-site.json · investor-centre.json · two-page-portal.json
  build.mjs           the assembler:  site-spec.json → out/<slug>.html  (self-contained pages)
  gen-manifest.mjs    regenerates manifest.json from the blocks (run after adding/editing a block)
```

The broad presets build a complete full site or investor centre. The bounded preset builds the
two-page portal without inventorying the library. **Start from the matching preset and adapt it** —
don't assemble a spec from nothing.

When the job manifest carries `siteSeedPath`, the runner has already materialised a validated,
editable `site.json`, `theme.css`, and every referenced custom block/partial into the workspace.
That workspace replaces the preset as the starting composition: preserve its complete route set,
adapt only what the current source/evidence requires, and never reconstruct it from prompt text.

## The workflow

### 1. Structure — decide the page set

List the pages the brief/site-structure calls for, and for each, the ordered blocks. Use the preset
as the baseline, or use the materialised `site.json` when `siteSeedPath` is present. Map every source page/section to a target (its own page, merged, or dropped) — mirror
the site's real depth, don't flatten it. Read `references/authoring-guide.md` for the site-spec shape,
nav keys, and how to choose blocks for a structure. **For the investor overview page specifically,
compose to `references/investor-home-blueprint.md`** — the canonical section order and density
(hero + thesis rail, §-numbered snapshot/latest/video/utility sections, one contained dark AI block,
single subscribe) plus the anti-patterns that fail review.

### 2. Theme — DESIGN.md → a theme layer

Generate a `theme.css` that overrides ONLY the THEME-HOOK tokens in `base.css` (fonts, `--accent`,
the neutral ramp) from the company DESIGN.md, plus the on-dark overrides. Pass it to the build via
`spec.themeFile` (a path) or `spec.theme` (inline CSS). Also map DESIGN.md → the Diolog **PortalTheme**
so the server-rendered widgets match the site. **Full procedure: `references/theming.md`.**

### 3. Voice — VOICE.md → content slots

Every block has `{{slot|default}}` content slots (the `|default` is the plain-template copy). Fill the
primary slots (eyebrow, headline, body, CTA, stats, etc.) with copy written in the company's VOICE.md.
Keep facts grounded and verbatim; never fabricate a figure, price, %, or name — those belong in a live
widget, not copy. **Slot conventions + honesty rules: `references/authoring-guide.md`.**

### 4. Compose — write the site spec

Write `<work>/site.json`: `{ mode, brand, themeFile, pages:[{slug,title,nav,ticker,blocks:[…]}] }`.
Each stock block is `"category/name"` or `{"block":"category/name","content":{slot:value}}`.
A from-scratch workspace block is
`{"block":"custom/name","sourcePath":"blocks/name.html","content":{slot:value}}`;
`build_site` stages that declared file without modifying the baked skill. Brand tokens
(`COMPANY`, `MONO`, `TICKER`, `EXCHANGE`, `YEAR`, `COMPANY_SITE_URL`) come from `spec.brand`.
When the stock chrome cannot express the real page set, declare a workspace variant with
`customPartials:[{"kind":"header","variant":"custom-name","sourcePath":"partials/header.html"}]`
and set `header:"custom-name"` (the same shape supports a footer).

### 5. Build

Call the **`build_site` tool** with your composed spec — it runs the assembler for you:

```
build_site({ spec: <your site.json object> })
```

For a runner-materialised seed, build the exact editable file by reference:

```
build_site({ specPath: "site.json" })
```

It stamps `base.css` + theme + a header/footer variant + the page's blocks + overlays + `app.js` into
each self-contained `out/<slug>.html` (base + chrome byte-identical across pages, css-drift-safe) and
returns `{ built:[{slug,path,bytes}], count }` — the paths `render_preview`/`publish_page` consume.
**Do NOT hand-write a shell/awk assembler and do NOT run `node` yourself — it is unavailable in the
tool sandbox; `build_site` IS the assembler.** Pass the theme inline via `spec.theme` (preferred); a
`spec.themeFile` and every custom block `sourcePath` are read as workspace-relative paths. On a
missing block/partial/theme the tool returns `{ error }` naming it — fix the spec and call again
(never fall back to a hand assembler).

### 6. Live-value pass

Current site publication is value-native and emits **zero** `data-diolog-widget` markers. Compose
investor surfaces from `blocks/investor-static/*`: scalar facts use `data-diolog-value` spans and list
surfaces use a `data-diolog-value` container plus its `<template>`. The preset's overview already uses
the proven value-native composition; adapt its slots instead of replacing it. Use only value keys in
the job's AVAILABLE VALUE KEYS catalogue, keep an honest reader-facing fallback, and omit a surface
whose required source/value does not exist. The older `blocks/investor/*` files remain migration
reference for page shapes that do not yet have a static twin; never ship their widget markers.

### 7. Validate

In a repository/manual workflow, run the studio gate battery over the built site:

```bash
node <repo>/apps/studio/scripts/verify.mjs <work>        # design-lint + copy-lint + render-audit
```

`<work>` must contain `out/`. Fix every `error`. During a deployed Studio generation, do not run
this command: local Node/browser execution is unavailable in the tool sandbox. Use
`render_preview` and `review_page` for agent-side evidence. Preview includes the shared measured
overflow/image-geometry/proportion core and records full-page captures plus top/middle/bottom crops at
mobile and desktop widths. `review_page` consumes those exact pixels; it is not a source-only review.
The runner executes the broader battery independently as the final production gate. Blocks are
gate-clean by construction, so
failures are almost always in NEW content (a stray connective em-dash, a non-numeric stat, an
overflowing custom slot) — see `references/authoring-guide.md` § "Staying gate-clean".

**`design-lint` is the exception — run it yourself, per page, before you publish.** It is pure static
Python analysis with NO browser, so unlike `verify.mjs` as a whole it runs fine in the tool sandbox:

```bash
python3 /opt/diolog-runner/scripts/vendor/design-lint.py out/<slug>.html
```

Treat every `CRITICAL` and `MAJOR` as a mustFix; the runner runs the identical linter as a gate and
one MAJOR fails the whole run. This closes a real hole: the guidance above says "run `verify.mjs`",
the deployed rule says "don't", and the net effect was that design-lint never ran agent-side at all —
a portal run reached the terminal gate with render-audit and copy-lint both clean and died on a
single `[default-card] border-radius + border-left accent card` MAJOR that this one command would
have caught in seconds.

## Adding pages, sections, and images (cloning)

- **New page** — add a page entry to the spec composed from existing blocks. No new files needed.
- **New section variant during generation** — write the clone to the ordinary workspace, for example
  `blocks/market-hero.html`, then declare
  `{"block":"custom/market-hero","sourcePath":"blocks/market-hero.html"}` in the page spec. Keep the
  `<!-- BLOCK … -->` header + `{{slot|default}}` conventions. Do not write into the baked skill tree.
- **Custom chrome during generation** — write a header/footer partial in the ordinary workspace and
  declare it through `customPartials` with a `custom-*` variant. Use that variant on the page/spec.
  Never edit `skills/diolog-site-builder/templates/partials`.
- **Permanent library block** — add it under the committed `templates/blocks/<cat>/` source and run
  `gen-manifest.mjs`; this is repository maintenance, not a generation-time step.
- **Images** — every image slot is an honest labelled placeholder (`.ph-img` + a monospace descriptor of the
  intended asset + dimensions). To use a real image, replace the `.ph-img` div with an `<img>` and preserve
  the source's measured natural dimensions from `inputs/image-manifest.json`; never guess or hard-code them.
  Match the source orientation to the slot. Keep placeholders where no asset exists — they tell the next pass
  what belongs there. The local production runner materialises this manifest directly from the claimed job
  envelope before the model starts; do not rebuild it from `job.json` or probe image URLs yourself.
- Full procedure + the gate rules a new block must respect: `references/authoring-guide.md` § "Extending".

## Diolog widgets — the honest, server-rendered contract (never iframes)

Live investor data (price, chart, announcements, reports, team, capital, AI, subscribe, contact) is served
by Diolog **server-side**: `injectServerRenderedWidgets` replaces each `<div data-diolog-widget="KIND"
data-widget-variant="VARIANT">` marker's inner HTML with the widget rendered by `renderToStaticMarkup`,
themed from a PortalTheme. Your blocks ship the marker wrapped in a finished **skeleton frame** (heading +
sized shimmer skeleton + honest "live" note) — that is the pre-render/loading state, replaced on inject.
**Never fabricate a live figure in copy; never build a widget as an iframe.** `references/widgets.md` has the
full kind/variant catalogue and the marker rules.

## References

- `references/authoring-guide.md` — site-spec shape, nav keys, block selection, slots, honesty rules, staying gate-clean, extending.
- `references/investor-home-blueprint.md` — the investor overview page's canonical composition (section order, density, anti-patterns).
- `references/theming.md` — DESIGN.md → theme.css token overrides + the widget PortalTheme mapping.
- `references/widgets.md` — the widget render pipeline, the config-comment spec, and the full kind/variant catalogue.
- `templates/manifest.json` — the machine catalogue of blocks (slots + widgets) and presets.
- `examples/` — the two built demo sites (full-site, investor-centre) for reference.
