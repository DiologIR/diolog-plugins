---
version: alpha
name: Diolog — Business Case Document System
description: >-
  Diolog's institutional-IR visual language tuned for single-page A4 business
  case documents: Newsreader serif headings, Inter body, JetBrains Mono
  labels/figures, one royal blue on a navy-and-white workspace. Derived from the
  live diolog.app design system and the Alfabs business case build, with a type
  scale and component set sized for dense, print-clean one-pagers.
colors:
  # Surfaces
  canvas: "#FFFFFF"          # page background, cards
  wash: "#F5F7FB"            # light fill: investment / next-steps cards, pill rows
  soft: "#F1F4F9"            # chips, inner wells
  navy: "#0A1733"            # the one dark card (solution hero), footers, dark bands
  navy-deep: "#050B1F"       # deepest layered navy
  # Ink
  ink: "#0F1A2E"             # headings and primary text on light
  secondary: "#3D4A66"       # default body ink
  muted: "#5E6A82"           # supporting / caption text, mono labels on light
  faint: "#9CA0AC"           # faint meta
  on-dark: "#E8EEF8"         # text on navy
  on-dark-muted: "#C9D3E4"   # body/eyebrow on navy
  on-dark-faint: "#9AA8C4"   # faint meta on navy
  # Accent — the single Diolog blue, used for intent only (≤10% of surface)
  accent: "#1F3FA6"          # kickers, links, key figures, CTA fill, top-borders
  accent-deep: "#142A78"     # CTA hover
  accent-soft: "#E6EEF9"     # blue tint fills, icon tiles
  accent-on-dark: "#8FA9EE"  # accent legible on navy (checks, kicker on dark card)
  # Lines
  hairline: "#ECEDEE"        # row dividers on white ≈ rgba(15,26,46,.08); see prose
  border-subtle: "#E3E5EA"   # occasional card outline
  # Semantic (inferred from product)
  success: "#1F8A5B"
  warning: "#A56A11"
  danger: "#C2362A"
typography:
  # Sizes below are tuned for a dense single-page A4 (794×1123px) document.
  # For web/marketing surfaces, scale display/heading roles up per the prose note.
  wordmark:
    fontFamily: Newsreader
    fontSize: 34px
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: -0.025em
  display:                   # H1 — the promise line
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.022em
  heading-lg:                # section H2 on the dark card / larger sections
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.014em
  heading-md:                # standard section H2
    fontFamily: Newsreader
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: -0.014em
  price:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -0.02em
  tagline:
    fontFamily: Newsreader
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.01em
  lead:                      # standfirst under H1
    fontFamily: Inter
    fontSize: 10.5px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 9.5px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.011em
  body-sm:
    fontFamily: Inter
    fontSize: 9px
    fontWeight: 400
    lineHeight: 1.45
  label-strong:              # bold lead-ins in lists / value claims
    fontFamily: Inter
    fontSize: 9.5px
    fontWeight: 600
    lineHeight: 1.3
  kicker:                    # section eyebrow "NN / Title", accent blue
    fontFamily: JetBrains Mono
    fontSize: 8.5px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.04em
  label-caps:                # column labels, table headers — UPPERCASE
    fontFamily: JetBrains Mono
    fontSize: 8px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.08em
  mono-value:                # numeric table cells, prices, ranges
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: 500
    lineHeight: 1.4
  meta:                      # header meta line, footer contacts
    fontFamily: JetBrains Mono
    fontSize: 7.5px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.14em
rounded:
  sm: 6px                    # pill rows, highlighted table cells
  md: 10px                   # cards (solution, investment, next-steps)
  card: 14px                 # web-scale cards
  lg: 16px
  full: 999px               # buttons, tags
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  # Document-specific
  page-pad-y: 20px          # top/bottom page padding (top 26px)
  page-pad-x: 40px          # left/right page padding
  section-gap: 14px         # vertical gap between stacked sections
  grid-gutter: 18px         # gap in 2-col problem/solution grid (outcome grid 22px)
  card-pad: 14px            # inner padding of the dark solution card (16px x)
  page-w: 794px             # A4 width @96dpi
  page-h: 1123px            # A4 height @96dpi
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.full}"
    padding: 9px 16px
  button-primary-hover:
    backgroundColor: "{colors.accent-deep}"
  kicker:
    textColor: "{colors.accent}"
    typography: "{typography.kicker}"
  card-solution:            # the single dark hero card (problem's counterpart)
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-dark-muted}"
    rounded: "{rounded.md}"
    padding: 14px 16px
  card-wash:                # investment + next-steps cards
    backgroundColor: "{colors.wash}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: 9px 16px
    borderColor: "{colors.hairline}"
  pill-highlight:           # "Total per cycle" / "Estimated savings" rows
    backgroundColor: "{colors.wash}"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: 7px 8px
  value-column:             # the 4-up value strip cells
    borderColor: "{colors.accent}"
    typography: "{typography.label-strong}"
  table-figure:             # numeric table cell
    textColor: "{colors.accent}"
    typography: "{typography.mono-value}"
---

# DESIGN.md — Diolog Business Case Document System

> **Vibe:** Institutional IR seriousness rendered as an editorial broadsheet, compressed onto one A4 page. Newsreader headlines and monospace tickers over a navy-and-white workspace; The Economist's authority meets Linear's restraint. This variant is tuned for **single-page business case documents** — dense, print-clean, argument-first.
>
> Derived from the live diolog.app design system (computed-style extraction, 2026-07-02) and the Alfabs Australia business case build. Tokens above are normative; prose below is application guidance.

## Overview

A governed IR workspace brand, expressed as a serious financial broadsheet: large literary-serif headlines, monospace tickers and labels, one deep-royal blue, product surfaces as crisp white panels on navy. For business case documents this becomes a **one-page A4 leave-behind** pitched at a board / CFO / CEO reader — it must make a commercial argument (problem → solution → value → quantified outcome → investment → next step) and fit, legibly, on a single printed page.

- **Adjective set:** editorial, institutional, calm, precise, governed.
- **Reference peers:** The Economist (serif authority, restraint) · Linear (flat surfaces, single accent) · Stripe (product-as-hero, no stock photography). All earn trust through typographic hierarchy, not decoration.
- **Emotional target for a document:** a reader should feel the argument is *defensible and already handled* — quantified, sourced, unhurried. Confidence carried by the numbers, not the adjectives.
- **Anti-patterns:** quirky/condensed display serifs (this is Newsreader, not Instrument Serif), a second accent hue, gradient button fills, stock photography, illustration, emoji, exclamation marks, hype adjectives, and — in documents — filler content or "data slop" that does not change the reader's decision.

## Voice & Copy

*(Non-canonical section, preserved for document authoring. Governs every line of copy.)*

- **Tone:** confident but not loud; specific over vague; controlled calm. State the benefit plainly and let the figures carry it.
- **Density:** terse — 1–2 sentences per point, active voice. Rule of three (problems) and four (value shifts): if a point does not change the decision, cut it.
- **Capitalisation:** sentence case for headings and body; UPPERCASE (tracked) only for mono labels/eyebrows.
- **Headline rule:** short declaratives, usually ending in a full stop ("50 hours back every cycle.").
- **Punctuation:** **no em dashes or en dashes.** Use commas, full stops, or "to" for ranges (`A$25k to 46k`, `20 to 30h`). Grep the finished file for `—` and `–` and remove all of them.
- **Spelling & money:** Australian English (organise, colour, licence); **A$** for currency.
- **Honesty:** label estimates as indicative and show the basis (blended rate, market comparables). Credibility with a CFO comes from showing the working.
- **Vocabulary:** *workspace* (not platform), *governed*, *grounded*, *record* (not database), *investor-facing*, *confidence*, *disclosure*.
- **Sign-off:** the tagline "Disclosure, without doubt." set in Newsreader, quiet, footer-right.

## Colors

Rooted in high-contrast neutrals over a navy-and-white base, driven by a single blue accent.

- **Accent / Diolog blue (`#1F3FA6`):** the sole interaction and emphasis colour — section kickers, links, the figures that matter (hours saved, dollars saved), value-column top-borders, and the one CTA. Keep it to ≤10% of the surface; on white it reads ~8:1 (AA/AAA).
- **Navy (`#0A1733`):** the gravity well. In a document it appears as **exactly one dark card** — the solution hero — with a faint `rgba(31,63,166,.4)` radial glow top-right. More than one dark block dilutes the anchor.
- **Wash (`#F5F7FB`):** the quiet secondary surface — investment and next-steps cards, and the highlighted "total" pill rows in tables.
- **Ink (`#0F1A2E`)** for headings, **secondary (`#3D4A66`)** for body, **muted (`#5E6A82`)** for captions and mono labels on light.
- **On navy:** headings `on-dark #E8EEF8`, body `on-dark-muted #C9D3E4`, faint meta `on-dark-faint #9AA8C4`, checks/kicker `accent-on-dark #8FA9EE`.
- **Hairlines:** dividers are `rgba(15,26,46,.08)` in practice (the `hairline` token `#ECEDEE` is its flattened-on-white equivalent). Use the rgba form so lines sit correctly on any background.
- **Semantic** success/warning/danger are inferred from the product; use only if the document genuinely needs a status.

## Typography

Three families, hierarchy from size not weight. Sizes in the tokens are tuned for a dense one-page A4; keep body ≥9px so it survives print.

- **Newsreader (serif, weight 400 only):** the wordmark, every heading, the price, and the tagline. Never bold a headline; never substitute a quirky/condensed serif.
- **Inter (400/500/600):** all body copy, list lead-ins (600), and controls.
- **JetBrains Mono:** the brand signature — section kickers (`01 / The case`), column and table-header labels (UPPERCASE, tracked), every numeric cell, prices, ranges, the header meta line, and footer contacts. Reserve mono for anything "instrument-panel".

**Document scale (as tokenised):** H1 24px, section H2 15–16px, lead 10.5px, body 9–9.5px, kickers 8.5px, table labels 8px, figures 9px, meta 7.5px.
**Web/marketing scale:** the same roles run far larger on diolog.app (H1 64–68px, H2 44–50px, body 16px). Scale display/heading roles up for web surfaces; keep the mono roles' tracking.

**Numeric rule:** every figure sits in a mono cell, right-aligned, with `white-space:nowrap` so ranges (`20 to 30h`) never wrap.

## Layout

Business cases use a **fixed A4 canvas**, not a flowing web grid.

- **Page:** `794 × 1123px` (A4 @96dpi), `padding: 26px 40px 20px`, `display:flex; flex-direction:column; justify-content:space-between; overflow:hidden`. The fixed height plus space-between is what fills the page evenly, top to bottom, as one printed page. Use a fixed `height`, never `min-height`.
- **Spacing:** 4px base; scale 4, 8, 12, 16, 24. Section-to-section gap ~14px; 2-column problem/solution gutter 18px; outcome/replaces gutter 22px.
- **The eight-section arc (document skeleton):**
  1. **Header** — Newsreader wordmark left; mono meta line right ("Executive business case · Prepared for <Client> · ASX: <TICKER>"); thin bottom rule.
  2. **01 / The case** — serif H1 (the promise) + one-line standfirst.
  3. **02 / The problem + 03 / The solution** — two-column grid; problem is exactly three numbered constraints, solution is the dark card.
  4. **04 / The value** — standalone 4-up strip (mono kicker + bold claim + line), accent top-border on each.
  5. **05 / The outcome + 06 / What it replaces** — two-column grid; a before/after/saved table and a cost line-item list, each ending in a highlighted pill total.
  6. **07 / Investment** — wash card: plan name, price, cadence, 2-col feature checklist.
  7. **08 / Next steps** — wash card: one sentence + one CTA pill linking to the booking URL.
  8. **Footer** — two contacts left, tagline right, thin top rule.
- **Web layout (reference):** max-width ~1200px, 24→64px padding, ~96–128px between sections, loose 2-col card grids.

## Elevation & Depth

Flat surfaces with one honest layer of float.

- **In documents:** avoid shadows entirely on the printed page (they muddy print and were the source of a "top cut off" bug when combined with a drag offset). Depth comes from the **navy card vs wash card vs white page** tonal contrast, hairline dividers, and the accent top-borders on the value strip.
- **On screen / web:** cards rest on a soft shadow, not a border — `shadow/card 0 1px 5px rgba(0,0,0,.13)`; white product panels floated on navy use `0 8px 40px rgba(0,0,0,.35)`. Never stack shadows; depth reads at one layer.

## Shapes

- **Radius scale:** sm 6px (pill rows, highlighted table cells) · md 10px (all document cards) · card 14px / lg 16px (web cards) · full 999px (buttons, tags).
- **Document treatment:** cards use md (10px); the highlighted "total" pill rows and table corners use sm (6px). Round only the outer corners of a highlighted table row (first cell left, last cell right) so it reads as one pill.
- **Consistency:** do not mix sharp and rounded corners in one block.

## Components

- **Button (primary / CTA):** fully pill (`999px`), `accent` fill, white Inter 500 (~9.5–10px in-doc), padding ~9×16px, trailing `→`; hover → `accent-deep`. One CTA per document, in Next steps, `target="_blank"` to the booking URL.
- **Section kicker:** JetBrains Mono `NN / Title` in `accent`, sentence case, ~8.5px, opens every section.
- **Solution card (dark):** `navy` bg, `radius 10px`, `padding 14×16px`, radial `rgba(31,63,166,.4)` glow top-right; serif heading `on-dark`, body `on-dark-muted`, a check-list using `accent-on-dark` ticks (Phosphor `ph-check`). The document's single dark element.
- **Wash card:** `wash` bg, `radius 10px`, hairline border, `padding 9×16px` — investment and next-steps blocks.
- **Value column:** a cell in the 4-up strip — `1.5px solid accent` top-border, mono UPPERCASE kicker, bold Inter claim, muted supporting line.
- **Before/after table:** hairline row dividers; header row in mono UPPERCASE labels; body figures in right-aligned mono with `nowrap`; a spacer row then a `wash` pill "total" row with `accent` saved-figure and rounded outer corners.
- **Cost line-item list:** label left, mono value right, hairline between; closes with a `wash` pill "Estimated annual savings" row, `accent` figure.
- **Icons:** Phosphor regular (~1.5–2px stroke). On light: navy in an `accent-soft` tile; on the dark card: `accent-on-dark`. No illustration, no photography — the product is the imagery.
- **Header / footer:** wordmark `diolog` lowercase Newsreader, no logo tile; meta and contacts in mono; tagline in Newsreader.

## Document Format & Print

*(Non-canonical section, preserved for document authoring. Required for clean A4 export.)*

- Container sized to A4 in px (`794 × 1123`), `position:relative; margin:0 auto` on a white body. No drop shadow, no `position:absolute` drag offset, no grey desk background on the page element.
- Print CSS:
  ```css
  @media print{
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: 794px 1123px; margin: 0; }
    html, body { background:#fff !important; margin:0 !important; padding:0 !important; }
    div[style*="width: 794px"] { margin:0 !important; box-shadow:none !important; }
  }
  ```
- `print-color-adjust: exact` is mandatory — without it the navy card and blue pills print white/grey.
- Export via Save-as-PDF (A4, margins None) or the native-size PDF; both yield a clean single page.

## Do's and Don'ts

- **Do** set every heading in Newsreader 400 and let size, not weight, build hierarchy.
- **Do** keep one blue (`#1F3FA6`) for all intent: kickers, links, key figures, CTA.
- **Do** use JetBrains Mono for kickers, labels, tickers and every figure — it is the brand signature.
- **Do** use exactly one dark (navy) card per document as the anchor; wash cards for everything else.
- **Do** quantify twice (time saved and money saved) and highlight the two totals as pills.
- **Do** write in AU English, no em/en dashes, sentence case, measured confidence.
- **Do** size the page to A4 in px and include the print CSS so it exports as one clean page.
- **Don't** swap Newsreader for a condensed/quirky serif or push it above 600 weight.
- **Don't** introduce a second accent hue or gradient-fill the button.
- **Don't** use stock photography, illustration, emoji, exclamation marks, or hype.
- **Don't** stack shadows, or ship shadows/drag offsets on a page meant to print.
- **Don't** pad the page with filler sections or numbers that do not move the decision.
