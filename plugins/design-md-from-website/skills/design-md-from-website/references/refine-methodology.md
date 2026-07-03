# Capture-then-refine — evolving the faithful DESIGN.md

Default final pass (skip only on `faithful-only`). You have the **faithful DESIGN.md**
— an accurate, measured capture of the *existing* site. Produce a **refined
evolution**: same identity, sharper craft. This is the difference between a DESIGN.md
that mirrors a "competent WordPress build" and one that reads as an *intentional
product*.

Keep the official design.md format (YAML frontmatter + Overview / Colors / Typography
/ Layout / Elevation & Depth / Shapes / Components / Do's & Don'ts + a self-critique
comment). Refine, don't replace the brand:

- **Keep the load-bearing brand anchors** — the primary/accent hue family, the core
  neutrals, the display-type personality — but **de-mud them**: converge on ONE true
  brand colour with proper `hover` / `pressed` / `tint` steps, and replace accidental
  off-brand values (e.g. a stray magenta link the CMS introduced) with an AA-legible
  on-brand one.
- **Build a proper neutral RAMP** (warm/cool-consistent): `ink` / `ink-body` /
  `ink-muted` for text, `canvas` / `surface` / `surface-sunken` for backgrounds —
  instead of a few flat greys. Add **semantic state colours** (`success` / `warning` /
  `danger` / `info`), each with a "pair with an icon or label, never colour alone"
  rule.
- **Choose display + body type deliberately.** If the company is **publicly listed /
  financial** (a stock ticker, investor tables, prices, an investor hub), **add a
  DATA MONOSPACE token** (e.g. IBM Plex Mono) for figures — functionally justified by
  the numbers that must align in columns, never decorative. Reserve it for data.
- **Add MOTION tokens** (named easings + durations, and a `prefers-reduced-motion`
  stance), a **layered ELEVATION scale** (an ambient + key-light shadow pair per
  step), and a **DARK-THEME token mapping**.
- **Rationalise** the radius + spacing scales; drop artifact values (the odd `31px`
  radius a theme left behind).
- **Provenance on every token:** `(confirmed)` = a brand anchor carried from the
  measured capture; `(designed)` = an upgrade you are introducing. Be honest about
  which is which — a human needs to know what's observed vs proposed.
- **End with a changelog + self-critique** comment: list the v1-capture → refined
  changes, and flag anything that needs a real check before production (e.g. proposed
  dark-theme values need a contrast pass; a refined hue moved further from the exact
  current site than a screenshot-faithful spec would).

The north star: the refined DESIGN.md should read as **"intentional
industrial/enterprise product"**, not "cleaned-up template". Output only the refined
DESIGN.md markdown — no code fence around the whole document.

## Worked signal (why this matters)

A real example: the faithful capture of an ASX-listed heavy-industry site measured
`#C8202F` (a slightly-muddy CMS red), Montserrat/Open Sans, and flat greys. The
refined guide kept the industrial identity but converged the red to the true brand
`#D72229` with hover/pressed/tint, swapped to a deliberate black display face, **added
IBM Plex Mono** for the AAL ticker + investor tables (because it's listed), built a
warm neutral ramp, and added motion/elevation/dark tokens — labelling each token
`confirmed` (anchor) vs `designed` (upgrade). That is the calibre to aim for.
