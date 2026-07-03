# The output contract — official google-labs design.md format

The DESIGN.md MUST conform to the google-labs design.md spec
(https://github.com/google-labs-code/design.md/blob/main/docs/spec.md): a **YAML
frontmatter** of design tokens, followed by prose **body sections**, ending with a
self-critique comment. Emit raw values; do **not** wrap the whole document in a
Markdown code fence.

## 1. YAML frontmatter (the machine-readable tokens)

Delimited by `---`. Required: `name`. Recommended: `version: alpha`, `description`,
and the token maps. Every value is a raw hex / px / rem / ratio / number. Token
**references** use dot-notation in curly braces: `{colors.primary}`, `{typography.body}`.

```yaml
---
version: alpha
name: <Product / brand name>
description: >-
  <one–two sentences: what this product is + the vibe, so a downstream generator has a north star>
colors:
  # at least `primary`. Any valid CSS colour string (hex / rgb / hsl / oklch / color-mix).
  primary: "#…"
  primary-hover: "#…"        # if refined (see refine-methodology)
  on-primary: "#…"
  ink: "#…"                  # strongest text
  ink-body: "#…"
  ink-muted: "#…"
  canvas: "#…"               # page background
  surface: "#…"              # cards / panels
  surface-sunken: "#…"
  border: "#…"
  success: "#…"
  warning: "#…"
  danger: "#…"
  info: "#…"
typography:
  # each token: fontFamily / fontSize / fontWeight / lineHeight / letterSpacing (+ optional fontFeature)
  display:   { fontFamily: "{typography.font-display}", fontSize: "48px", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }
  headline:  { fontFamily: "{typography.font-display}", fontSize: "32px", fontWeight: 700, lineHeight: 1.15 }
  body:      { fontFamily: "{typography.font-body}",    fontSize: "16px", fontWeight: 400, lineHeight: 1.6 }
  caption:   { fontFamily: "{typography.font-body}",    fontSize: "13px", fontWeight: 500, lineHeight: 1.5 }
  data:      { fontFamily: "{typography.font-mono}",    fontSize: "15px", fontWeight: 500, lineHeight: 1.4, fontFeature: "tnum" }  # for listed/financial brands
  font-display: "…, sans-serif"   # the real measured stack
  font-body: "…, sans-serif"
  font-mono: "…, monospace"
rounded:
  none: "0px"
  sm: "…px"
  md: "…px"
  lg: "…px"
  full: "9999px"
spacing:
  # a numeric scale (px). Derive from measured paddings / gaps.
  xs: 4
  sm: 8
  md: 16
  lg: 24
  xl: 32
  "2xl": 48
elevation:
  sm: "0 1px 2px rgba(0,0,0,.06)…"
  md: "…"
  lg: "…"
components:
  # reference the tokens above with {…} refs
  button-primary: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", rounded: "{rounded.full}", padding: "12px 24px", typography: "{typography.body}" }
  card:           { backgroundColor: "{colors.surface}", rounded: "{rounded.md}", elevation: "{elevation.md}" }
  input:          { backgroundColor: "{colors.surface}", border: "1px solid {colors.border}", rounded: "{rounded.sm}", padding: "12px 14px" }
---
```

Notes on the token types:
- **Colors** = any valid CSS colour string (hex, named, `rgb()`, `hsl()`, wide-gamut,
  `color-mix()`).
- **Dimension** = a string with a unit suffix (`px` / `em` / `rem`).
- **Typography** props: `fontFamily`, `fontSize`, `fontWeight` (number), `lineHeight`
  (dimension or unitless), `letterSpacing`, `fontFeature`, `fontVariation`.
- **Token references** must be wrapped in `{ }` with dot-notation.
- Include only tokens you have evidence for; a listed/financial brand should carry a
  `data`/mono token (see refine-methodology).

## 2. Body sections — IN THIS ORDER, with these headings

```markdown
## Overview
A holistic description of the product's look and feel + the one-sentence vibe (with a
peer-reference analogy). Who it's for, the personality.

## Colors
The palette with hex values + the role of each; provenance labels (confirmed / inferred
/ assumed). How the accent is rationed. Dark-mode mapping if observed/refined.

## Typography
Families (real measured stacks) + the type scale (size · weight · line-height ·
tracking · use). Note the hierarchy strategy. Reserve any mono for data that aligns in
columns.

## Layout
Container width, grid, gutters, the spacing scale + vertical rhythm, breakpoints.

## Elevation & Depth
The shadow tokens + the depth philosophy (flat / layered / glassy / embossed); when
each elevation level applies.

## Shapes
The corner-radius scale + form language (pills vs soft rects); what is never rounded
(e.g. full-bleed imagery).

## Components
Per component (buttons / inputs / cards / nav / footer / any hero, data-table, badge):
a short spec referencing the tokens. Skip components you have no evidence for.

## Do's and Don'ts
6–10 concrete, product-specific bullets for a downstream generator (e.g. "Do ration
the single accent to ≤10% of a view"; "Don't introduce a second brand hue").
```

## 3. Trailing self-critique

End with an HTML comment (doesn't render): could another designer reproduce a new
on-brand page from ONLY this file? List what's missing / any evidence gaps (states,
dark mode, mobile, gated pages you couldn't probe). On the refined output, this
becomes a changelog (v1 capture → refined) + the critique.

```markdown
<!-- self-critique: … / (refined) changelog: … -->
```

## Error-handling rule (from the spec)

Only a **duplicate section heading** is a hard error. Unknown sections / token names /
properties are preserved. So it's safe to add product-specific tokens or a
brand-specific section — just don't duplicate a heading.
