---
version: alpha
name: Diolog Proposal Deck
description: >-
  Design system for building investor-grade, 1920×1080 proposal / pitch decks in
  the Diolog house style — an institutional editorial look (Playfair serif on
  near-white paper) with a single disciplined red accent. Tokens are raw values so
  any consumer (HTML/CSS export, Figma, Tailwind, Keynote) can read them directly.

colors:
  # Canvas & mat
  canvas:            "#ffffff"   # interior slide background
  canvas-cover:      "#f5f7fb"   # cover / section-divider background
  page-mat:          "#dfe3ea"   # viewport behind the slide canvas
  # Ink (serif headings & primary text)
  ink:               "#0a1733"   # headings, wordmark, primary emphasis
  ink-alt:           "#13224a"   # secondary heading ink, dark labels
  body:              "#3c4660"   # default body text
  body-soft:         "#48526a"   # body inside cards / sub-paragraphs
  muted:             "#8a95ab"   # section labels, table headers
  faint:             "#b3bcca"   # running header, footer micro-labels
  # Surfaces
  surface:           "#f4f6f9"   # soft grey card fill
  surface-bar:       "#f1f3f8"   # full-width note / bottom-line bar
  # Emphasis panel (the recurring navy card)
  panel:             "#0e1c3c"   # navy card / stat panel fill
  on-panel:          "#ffffff"   # text on panel
  on-panel-body:     "#cdd4e4"   # body text on panel
  on-panel-muted:    "#9aa6c2"   # labels / secondary text on panel
  panel-hairline:    "#28365a"   # dividers inside panel
  accent-on-panel:   "#f0a99f"   # salmon — kicker labels on panel
  # Accent & status
  accent:            "#d62b1f"   # editorial red — the ONE accent
  success:           "#1e9e6a"   # savings / positive figures
  gold:              "#e59e29"   # "RECOMMENDED" badge fill
  link:              "#1f3fa6"   # CTA pill dot
  # Lines
  divider:           "#d9dee5"   # cover / structural rules
  hairline:          "#e4e7ee"   # 1px separators (also #e2e7ee, #e6eaf0)
  card-hairline:     "#e0e4ec"   # in-card dividers

typography:
  wordmark:      { fontFamily: "'Newsreader', serif",        fontWeight: 500, fontSize: "60px",  letterSpacing: "-2px" }
  display-hero:  { fontFamily: "'Playfair Display', serif",  fontWeight: 500, fontSize: "104px", lineHeight: "112px" }
  display-xl:    { fontFamily: "'Playfair Display', serif",  fontWeight: 500, fontSize: "84px",  lineHeight: "1.0" }
  display-title: { fontFamily: "'Playfair Display', serif",  fontWeight: 500, fontSize: "60px",  lineHeight: "66px" }
  display-stat:  { fontFamily: "'Playfair Display', serif",  fontWeight: 500, fontSize: "56px",  lineHeight: "1.0" }
  serif-lead:    { fontFamily: "'Playfair Display', serif",  fontWeight: 600, fontSize: "31px",  lineHeight: "38px" }
  serif-quote:   { fontFamily: "'Playfair Display', serif",  fontWeight: 600, fontSize: "25px",  lineHeight: "35px" }
  deck-sub:      { fontFamily: "'Inter', sans-serif",        fontWeight: 400, fontSize: "20px",  lineHeight: "28px" }
  card-title:    { fontFamily: "'Inter', sans-serif",        fontWeight: 600, fontSize: "21px",  lineHeight: "28px" }
  body:          { fontFamily: "'Inter', sans-serif",        fontWeight: 400, fontSize: "17px",  lineHeight: "1.5" }
  body-lg:       { fontFamily: "'Inter', sans-serif",        fontWeight: 400, fontSize: "20px",  lineHeight: "1.6" }
  eyebrow:       { fontFamily: "'Inter', sans-serif",        fontWeight: 600, fontSize: "12px",  letterSpacing: "1.4px" }
  micro-label:   { fontFamily: "'Inter', sans-serif",        fontWeight: 500, fontSize: "11px",  letterSpacing: "1.6px" }
  caption:       { fontFamily: "'Inter', sans-serif",        fontWeight: 400, fontSize: "14px",  lineHeight: "19px" }

rounded:
  sm:   "6px"     # badges, chip inner
  md:   "8px"     # filter chips
  lg:   "12px"    # mockup cards, note bars
  xl:   "14px"    # standard content cards
  2xl:  "16px"    # navy stat panel
  pill: "18px"    # CTA pills (½ of 36px height)
  tick: "3px"     # accent rule cap
  full: "9999px"  # dots, circular badge

spacing:
  xs:  "4px"
  sm:  "8px"
  md:  "12px"
  lg:  "16px"
  xl:  "24px"
  2xl: "32px"    # card inner padding ≈ 36–40px
  3xl: "48px"
  4xl: "64px"

components:
  slide:
    width: "1920px"
    height: "1080px"
    margin: "110px"          # symmetric left/right side margin
    contentWidth: "1700px"   # x:110 → x:1810
    headlineTop: "196px"
    footerTop: "1000px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "36px 40px"
    shadow: "0 10px 30px 0 rgba(10,23,51,.10)"
  cardEmphasis:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.on-panel}"
    rounded: "{rounded.2xl}"
  accentTick:
    backgroundColor: "{colors.accent}"
    width: "40px"
    height: "4px"
  chip:
    backgroundColor: "{colors.canvas}"
    borderColor: "#d7dce6"
    rounded: "{rounded.md}"
    height: "34px"
  ctaPill:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.pill}"
    height: "36px"
  badge:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.on-panel}"
    rounded: "{rounded.sm}"
---

# DESIGN.md — Diolog Proposal Deck

> **Vibe:** Institutional editorial gravitas — a Playfair serif voice on near-white paper, ordered on an invisible grid, with a single disciplined red accent. Think a top-tier bank's IR deck rebuilt with *The Economist's* typographic seriousness and Linear's restraint.
>
> Last generated from 9 screenshots + the exported HTML/CSS on 2026-07-03.

## 1. Overview

A fixed-canvas, print-grade B2B **proposal / pitch deck**. Every slide is a **1920 × 1080** frame with elements placed at exact coordinates (a design-tool export, not a responsive web page) — so this system is about *composition and restraint*, not breakpoints. Interior slides are white; the cover and any section divider use a barely-there off-white (`canvas-cover`). The whole slide floats on a cool grey mat (`page-mat`).

- **Adjective set:** editorial, institutional, restrained, confident, precise.
- **Reference peers:** *The Economist* / FT (serif authority), a listed-company results deck (structure, disclosure tone), Linear & Stripe decks (whitespace discipline) — *why:* the audience is a board/CFO; the deck must read as credible and calm, never "startup loud."
- **Anti-patterns:** gradients on content, drop-shadows stacked more than one level, more than one accent hue per slide, filled coloured backgrounds behind body copy, decorative icons, centre-aligned body text, emoji, full-bleed photography.
- **Voice:** terse, senior, numbers-forward. Sentence case for headlines and card titles; UPPERCASE + wide tracking only for eyebrows, labels, running header/footer. Australian spelling. Prefer a spaced hyphen/en-dash as the connective dash ( `-` ), and lead with a figure (`~50 hours`, `~110 hrs / yr`, `A$1,499 / month`). CTA labels are imperative and underlined (`BOOK A CHAT WITH AMY`). *(confirmed across all 9 slides)*

## 2. Colors

The palette is a near-monochrome navy-on-white scholarly base, one editorial **red** used at ≤5% of any slide, a recurring **navy panel** for emphasis, and two figure colours (green for savings, gold for a single badge).

| Token | Hex | Role | Provenance |
|---|---|---|---|
| `canvas` | `#ffffff` | Interior slide background | confirmed |
| `canvas-cover` | `#f5f7fb` | Cover / section-divider bg | confirmed |
| `page-mat` | `#dfe3ea` | Mat behind the slide | confirmed |
| `ink` | `#0a1733` | Serif headings, wordmark, emphasis | confirmed |
| `ink-alt` | `#13224a` | Secondary heading ink, dark labels | confirmed |
| `body` | `#3c4660` | Default body text | confirmed |
| `body-soft` | `#48526a` | Body inside cards / sub-paragraphs | confirmed |
| `muted` | `#8a95ab` | Section labels, table headers | confirmed |
| `faint` | `#b3bcca` | Running header, footer micro-labels | confirmed |
| `surface` | `#f4f6f9` | Soft grey card fill | confirmed |
| `surface-bar` | `#f1f3f8` | Full-width note / bottom-line bar | confirmed |
| `panel` | `#0e1c3c` | Navy emphasis card / stat panel | confirmed |
| `on-panel` / `-body` / `-muted` | `#ffffff` / `#cdd4e4` / `#9aa6c2` | Text on the navy panel | confirmed |
| `accent-on-panel` | `#f0a99f` | Salmon kicker label on panel | confirmed |
| `accent` | `#d62b1f` | The single editorial red | confirmed |
| `success` | `#1e9e6a` | Savings / positive figures | confirmed |
| `gold` | `#e59e29` | "RECOMMENDED" badge only | inferred (one instance) |
| `link` | `#1f3fa6` | CTA pill dot | inferred (one instance) |
| `divider` / `hairline` | `#d9dee5` / `#e4e7ee` | 1px rules & separators | confirmed |

**Accent discipline:** `accent` appears *only* as the 40×4px kicker tick, section/list numbers (`01 02 03`), the cover rule, the table "SAVED" column, and small kicker labels. Never as a fill behind text. **Dark mode:** not a themeable system — the navy `panel` is an *emphasis surface used inside light slides*, not a dark theme. Do not invert the deck.

## 3. Typography

Three families, each with one job. Hierarchy is driven by **family + size**, not by heavy weights (nothing exceeds 700).

- **Playfair Display** (serif, 500) — every headline, big number, and pull-quote. This is the brand's voice.
- **Newsreader** (serif, 500) — the `diolog` wordmark only.
- **Inter** (sans, 400–700) — all body, labels, tables, UI, eyebrows.

| Role | Family / token | Size · line-height | Notes |
|---|---|---|---|
| Cover headline | Playfair 500 · `display-hero` | 104 / 112px | 2 lines max |
| Big one-word title | Playfair 500 · `display-xl` | 84px | e.g. "Investment", "Next step" |
| Slide headline | Playfair 500 · `display-title` | 60–62 / 66–70px | standard content slides |
| Big stat | Playfair 500 · `display-stat` | 56px | inside navy panels |
| Card serif lead | Playfair 600 · `serif-lead` | 31 / 38px | pricing-card names |
| Serif pull-quote | Playfair 600 · `serif-quote` | 25 / 35px | panel closing line |
| Deck sub-paragraph | Inter 400 · `deck-sub` | 20–22 / 28–34px | under the headline, `body` colour |
| Card title | Inter 600 · `card-title` | 18–21 / 28px | non-serif card headings |
| Body | Inter 400 · `body` | 17 / 1.5 | card & row copy, `body-soft` |
| Eyebrow / kicker | Inter 600 · `eyebrow` | 12px · +1.4–2.4px · UPPER | section & card kickers |
| Micro-label | Inter 500 · `micro-label` | 11px · +1.6px · UPPER | running header, footer, stat labels |
| Caption / footnote | Inter 400 · `caption` | 14 / 19px | table source notes, `muted` |

**Hierarchy note:** serif = concept, sans = detail. A slide has exactly one Playfair headline; everything explanatory is Inter. Negative tracking (−2 to −2.8px) is applied only to the large serif wordmark/hero. Uppercase text is *always* tracked ≥1.2px and never larger than 13px.

## 4. Layout

### Canvas & safe area
- **Frame:** 1920 × 1080, `overflow:hidden`. Absolute positioning against the frame origin.
- **Side margins:** 110px left & right → **content band 1700px wide** (x:110 → x:1810).
- **Vertical zones:** header chrome y:60–180 · headline baseline **y:196** · optional sub-paragraph y:296–316 · content region y:360–920 · footer rule **y:1000** · footer text y:1018. Keep content inside **y:150–1000**.

### The slide scaffold (repeat on every content slide, pages 2–9)
1. **Running header** — top-right, `micro-label` in `faint`: `CLIENT · DIOLOG PROPOSAL · {SECTION}`.
2. **Accent tick** — `accent` bar 40×4px at (110, 150).
3. **Section label** — `eyebrow` in `muted` at (110, 165): `SECTION · 0N`.
4. **Headline** — Playfair at (108, 196).
5. **Footer** — 1px `hairline` rule at y:1000; `ALFABS · CONFIDENTIAL` left, `0N / 09` right, both `micro-label` in `faint`.

### Grids (all cards float on the 1700px band)
- **3-column:** three 540px cards, 40px gutters at x = 110 / 690 / 1270. (Workspace variant: ~53px gutters at 110 / 703 / 1296.)
- **2-column split:** two 800px cards, 100px gutter at x = 110 / 1010, with a 64px circular badge straddling the gap.
- **Asymmetric (data + stat):** a wide left band (~1130px table) + a 480px navy stat panel on the right, ~90px apart.
- **Card padding:** 36–40px inside; in-card divider is a 1px `card-hairline` under the title.

**Rhythm:** editorial and airy. List rows step ~36px; definition rows ~100px; leave the lower third of divider/cover slides mostly empty.

## 5. Elevation & Depth

Flat, paper-like, single-level. Depth comes from *tint and hairlines*, not stacked shadows.

- **Floating card shadow (only elevation token):** `0 10px 30px 0 rgba(10,23,51,.10)`.
- **Circular badge shadow:** `0 6px 18px rgba(10,23,51,.12)`.
- **Hairlines:** 1px separators in `hairline` on light, `panel-hairline` (`#28365a`) on navy. In-card dividers use `card-hairline`.
- **Depth philosophy:** flat with one soft drop-shadow tier. Never nest a shadowed card inside another; the navy `panel` provides contrast without needing a heavier shadow. No glass, no glow, no inner shadows.

## 6. Shapes

- **Corner radii:** chips `md` 8px · badges `sm` 6px · mockup cards & bars `lg` 12px · standard cards `xl` 14px · stat panel `2xl` 16px · CTA pills `pill` 18px (fully rounded 36px height) · accent rule cap `tick` 3px · dots & the `+` badge `full`.
- **Line weights:** all rules and borders are **1px**; the accent tick is the only "thick" bar at 4px.
- **Geometry:** generous rounding on containers, hard edges nowhere. Icons are avoided — the recurring geometric marks are the red **tick**, the small **dot** (chip / CTA / list bullet), the en-dash **–** list marker, and a single circular **+** badge joining the two split cards.

## 7. Components

Build only from this inventory; each maps to tokens above. Skip what a given slide doesn't need — don't invent.

- **Cover / section divider** — `canvas-cover` bg; `diolog` Newsreader wordmark top-left + client logo top-right; `eyebrow` "PREPARED FOR…"; Playfair `display-hero` headline; 120×6px `accent` rule; `body-lg` sub-paragraph; bottom `divider` rule + right-aligned date.
- **Soft card** (`card`) — `surface` fill, `xl` radius, card shadow, 36–40px padding. The workhorse for summary tiles, constraint rows, pricing columns.
- **Navy emphasis panel** (`cardEmphasis`) — `panel` fill, `2xl` radius; `on-panel` headings, `on-panel-body` copy, `on-panel-muted` labels, `accent-on-panel` kicker; used for the "featured", "heavy-lifting", or big-stat block — one per slide, maximum.
- **Numbered constraint row** — a `surface` bar with a big Playfair `accent` number (01/02/03), Inter 600 title, `body-soft` supporting line.
- **Data table** — `micro-label`/`muted` uppercase column heads over a `divider` rule; rows separated by 1px `hairline`; the "SAVED"/delta column is bold `accent`; the total row is bold `ink`; a `caption` source note sits below in `muted`.
- **Stat panel** — inside a navy `panel`: `micro-label` kicker → giant Playfair `display-stat` number → small unit in `on-panel-muted`, repeated with `panel-hairline` dividers, closing on a Playfair `serif-quote`.
- **Pricing trio** — three `card`s: plain / **featured navy** (with gold `badge` "RECOMMENDED") / savings breakdown; serif `serif-lead` name, bold price, `card-hairline`, then en-dash bullet list; green `success` for savings figures.
- **Filter chip** (`chip`) — white pill, 1px border, red `accent` dot + tracked `eyebrow` label; used as a row of qualifiers.
- **Definition row** — left `micro-label` category (uppercase) / right Inter 600 title + `muted` body, separated by full-width `hairline` rules.
- **Split-compare** — a light `card` (human/strategy) + a navy `cardEmphasis` (production) with a central 64px circular `+` badge, closed by a full-width `surface-bar` "bottom line" strip.
- **CTA pill** (`ctaPill`) — white rounded pill, `link` dot, underlined tracked `eyebrow` label linking out.
- **Product-UI mockup card** — `lg`-radius white card with a browser/window chrome (grey titlebar + `#FC5E57 / #FCBD2E / #29C740` traffic-light dots) and a skeleton UI rendered in brand greys/navy/`accent`; used to *show* the product without a screenshot.

*Empty / loading / error states: no evidence in supplied screenshots — see §8 open questions.*

## 8. Do's and Don'ts

- **Do** keep exactly one Playfair headline and at most one navy `panel` per slide.
- **Do** spend the red `accent` like currency — a tick, a number, a delta column, a small label; never a fill.
- **Do** carry the full running-header + accent-tick + footer chrome on every content slide so the deck reads as one governed set.
- **Do** lead lines and cards with a figure; right-align numeric columns; use `success` green only for money saved.
- **Do** hold 110px side margins and let the lower third breathe on cover/divider slides.
- **Do**, when a container needs edge emphasis, use *either* a colour-to-white **horizontal gradient** fill (accent or navy to white, no border) *or* a white fill with a **coloured dashed border on all four sides**. Never a rounded box bordered on only one side.
- **Do** write every line in the Diolog brand voice: Australian English, plain and precise, with **no em dashes** and no en dashes in sentence copy (use a spaced hyphen `-` and the middot `·`); the en-dash list-bullet glyph and numeric ranges are the sole exception.
- **Don't** introduce a second accent hue, put a decorative or interactive-surface gradient anywhere (the only sanctioned gradient is the colour-to-white container-emphasis fill above), or set coloured text on coloured fills.
- **Don't** nest shadowed cards, stack elevation, or use any shadow other than the two defined tokens.
- **Don't** set body copy in the serif, set headlines in Inter, or centre body text.
- **Don't** exceed 700 weight, or set uppercase text above 13px.
- **Don't** invert the palette into a dark theme — the navy panel is an accent surface, not a mode.

<!-- Open questions (what static frames can't show): (1) no hover/focus/interactive states — this is an export, so a live deck would need focus rings on the CTA links (suggest 2px accent, 2px offset). (2) No empty/loading/error or form components evidenced. (3) Motion/transitions unknown — if animated, default to a quiet 200–300ms ease-out fade/rise, honour prefers-reduced-motion. (4) `gold` badge and `link` blue each appear once, so marked inferred. (5) No mobile/responsive breakpoints — the format is a fixed 16:9 print canvas by design. -->

<!-- self-critique: Followed the official design.md structure (YAML token frontmatter + the 8 canonical ## sections in spec order) rather than the skill's 12-section layout, because the user explicitly required adherence to the design.md spec — folding slide-deck specifics (canvas, scaffold, grids) into H3s under Overview/Layout/Components to respect the "present sections must follow sequence" rule. Revised to (a) disambiguate the two navies (ink #0a1733 vs panel #0e1c3c), which a generator would otherwise conflate, and (b) foreground the fixed-canvas + repeating-scaffold model, since reproducing that chrome is what actually makes a new slide "belong." A downstream generator given only this file could lay out a new slide on the grid, apply the header/footer chrome, and pick correct type/colour tokens without seeing the originals. Kept inferred/one-instance tokens (gold, link) explicitly marked so they aren't over-trusted. -->
