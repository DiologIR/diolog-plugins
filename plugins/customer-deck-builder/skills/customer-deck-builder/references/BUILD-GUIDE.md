# BUILD-GUIDE.md — Diolog Proposal Deck (Reproduction Blueprint)

> Companion to **DESIGN.md**. DESIGN.md tells you *what the system is* (tokens, type, palette, voice). This document tells you *exactly how each slide is built* — coordinates, dimensions, paddings, shadows, and component recipes — so a designer with **only the written content** (headlines, body copy, numbers) can reproduce all 9 frames pixel-for-pixel with no access to the original HTML/CSS.
>
> Source analysed: `deck.css` + `01…09*.html` (9 frames) + `assets/`. Generated 2026-07-03.

---

## Contents

- [0. How to read this document](#0-how-to-read-this-document)
- [1. Technical substrate (global, from `deck.css`)](#1-technical-substrate-global-from-deckcss)
- [2. The invisible grid (measure once, reuse everywhere)](#2-the-invisible-grid-measure-once-reuse-everywhere)
- [3. Shared chrome (build once, drop onto every content slide 02–09)](#3-shared-chrome-build-once-drop-onto-every-content-slide-0209)
- [4. Common measurements — the cheat sheet](#4-common-measurements-the-cheat-sheet)
- [5. Reusable component recipes](#5-reusable-component-recipes)
- [6. Product-mock construction guide (slide 04)](#6-product-mock-construction-guide-slide-04)
- [7. Per-slide blueprints](#7-per-slide-blueprints)
- [8. Assets](#8-assets)
- [9. Reproduction checklist & gotchas](#9-reproduction-checklist-gotchas)

## 0. How to read this document

- **Coordinate system.** Every frame is a **1920 × 1080** box. Origin `(0,0)` is the **top-left corner**. All positions are `position:absolute` with `left`/`top` in **pixels** measured from that origin. There is **no responsive layout, no flexbox flow** — each element is placed by hand at an exact coordinate (a 1:1 mirror of a Figma export).
- **Notation.** `(x, y) w×h` means `left:x; top:y; width:w; height:h`. Colours are given as hex or as the CSS var from DESIGN.md. "display" = Playfair Display 500; "body" = Inter 400; "eyebrow" = Inter 500/600 uppercase.
- **Sub-pixel values are real.** Some values are fractional (e.g. card height `165.21px`, number size `31.771px`). These come straight from Figma auto-layout. Round to the nearest px if rebuilding by hand — the fractional precision is not load-bearing.
- **Build order per slide:** (1) frame, (2) shared chrome, (3) headline + sub, (4) content blocks, (5) footer. Follow §3 for chrome and §5 for components, then the per-slide map in §7.

---

## 1. Technical substrate (global, from `deck.css`)

Everything below is shared across all frames. Reproduce this once.

### 1.1 Fonts (Google Fonts, one `@import`)
```
Inter            — weights 400, 500, 600, 700   → all UI, body, labels, tables
Newsreader       — weights 400, 500, 600        → the "diolog" wordmark ONLY
Playfair Display — weights 400, 500, 600, 700    → all headlines, big numbers, serif leads
```
`font-family` fallback stack for Inter: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`.
Rendering hints on `html, body`: `-webkit-font-smoothing: antialiased; text-rendering: geometricPrecision;`

### 1.2 Global reset & page
```
*            { margin:0; padding:0; box-sizing:border-box; }
html, body   { background:#dfe3ea; }            /* cool grey mat behind the slide */
```

### 1.3 The frame
```
.frame        { position:relative; width:1920px; height:1080px;
                background:#ffffff; overflow:hidden; margin:0 auto; }
.frame--cover { background:#f5f7fb; }            /* cover + any section-divider slide */
.abs          { position:absolute; }             /* every child carries this */
```

### 1.4 Shared type helper classes
| Class | Rule |
|---|---|
| `.wordmark` | Newsreader, weight 500, colour `#0a1733` |
| `.display` | Playfair Display, weight 500, colour `#0a1733` |
| `.eyebrow` | Inter, weight 500, `text-transform:uppercase` |

---

## 2. The invisible grid (measure once, reuse everywhere)

These are the constants every slide obeys. **Commit them to memory before placing anything.**

| Constant | Value | Notes |
|---|---|---|
| Canvas | 1920 × 1080 | fixed, 16:9 |
| Left margin (structural) | **110px** | rules, cards, labels, footer all start at x:110 |
| Left margin (headlines) | **106–108px** | display headlines nudge 2–4px left of the grid; big one-word titles use 106 |
| Right edge | **1810px** | content band ends here → right margin also 110px |
| **Content band width** | **1700px** | x:110 → x:1810 (footer rule width confirms) |
| Header tick | (110, 150) 40×4 | red accent bar |
| Section label | (110, 165) | eyebrow |
| Running header | top:60, right:1810 | right-aligned |
| **Headline baseline** | **top:196** | standard slides (60–62px display) |
| Headline baseline (hero titles) | top:186–188 | slides 08/09 (84px display) |
| Sub-paragraph | top:296–316 | when present, colour `#48526a` |
| Content region | top:330–920 | cards / tables / rows live here |
| Footer rule | **top:1000**, (110) 1700×1 | colour `#e4e7ee` |
| Footer text | top:1018 | left + right micro-labels |

### 2.1 Column systems
| System | Used on | Card width | X positions | Gutter |
|---|---|---|---|---|
| **3-col (tight)** | Summary (03), Investment (08) | 540px | 110 / 690 / 1270 | 40px |
| **3-col (workspace)** | Workspace (04) | 540px | 110 / 703 / 1296 | ~53px |
| **2-col split** | Approach (05) | 800px | 110 / 1010 | 100px (64px `+` badge straddles centre at x:928) |
| **Asymmetric** | Value (06) | 1130px table + 480px panel | 110 / 1330 | ~90px |

### 2.2 The right-align trick (used repeatedly)
To right-align text to an edge `E`: set `left:E; width:W; text-align:right; transform:translateX(-100%);`. This anchors the element's right edge to `E`. Used by the running header, footer-right, cover date, and the summary card "value" figures.

---

## 3. Shared chrome (build once, drop onto every content slide 02–09)

The cover (01) is the **only** slide that omits this chrome (it uses the wordmark + client logo instead — see §7.1).

```
/* Running header — top-right, right-aligned */
.top-label   { top:60px; left:1810px; transform:translateX(-100%);
               width:700px; text-align:right;
               font:500 11px Inter; letter-spacing:1.6px;
               color:#b3bcca; text-transform:uppercase; }

/* Red accent tick */
.kicker-tick { left:110px; top:150px; width:40px; height:4px; background:#d62b1f; }
               /* EXCEPTION slide 05: width:30px; height:3px */

/* Section label */
.section-label{ left:110px; top:165px; width:900px;
               font:500 12px Inter; letter-spacing:2px;
               color:#8a95ab; text-transform:uppercase; }

/* Footer */
.footer-rule { left:110px; top:1000px; width:1700px; height:1px; background:#e4e7ee; }
.footer-left { left:110px;  top:1018px; width:800px;
               font:500 11px Inter; letter-spacing:1.6px;
               color:#b3bcca; text-transform:uppercase; }
.footer-right{ left:1810px; top:1018px; width:700px; text-align:right;
               transform:translateX(-100%);
               font:500 11px Inter; letter-spacing:1.6px;
               color:#b3bcca; text-transform:uppercase; }
```

**Chrome content pattern (per slide):**
- Running header: `ALFABS AUSTRALIA · DIOLOG PROPOSAL · {SECTION}` (slide 09 shortens to just `ALFABS AUSTRALIA · DIOLOG PROPOSAL`).
- Section label: `{SECTION} · 0N` (e.g. `THE BRIEF · 02`).
- Footer-left: `ALFABS · CONFIDENTIAL`. Footer-right: `0N / 09`.
- Middot separator is ` · ` (space-middot-space); word connectors in copy use a spaced hyphen `-`; numeric ranges use an en-dash `–` (`20–30 h`, `A$25–46k`).

---

## 4. Common measurements — the cheat sheet

Everything a rebuild needs at a glance. When a value varies, the **most common** is bolded.

| Property | Values observed | Use |
|---|---|---|
| **Card fill (light)** | `#f4f6f9` (**default**), `#f1f3f8` (bottom-bar) | soft cards, panels |
| **Card fill (dark)** | `#0e1c3c` | emphasis / featured / stat panels |
| **Card radius** | 10, 10.59, **12**, **14**, 16 | small→large: summary 10, brief 10.59, mock/bar 12, main cards 14, value panel 16 |
| **Card shadow** | `0 10px 30px 0 rgba(10,23,51,.10)` | *the only* card elevation, universal |
| **Circle badge shadow** | `0 6px 18px rgba(10,23,51,.12)` | the `+` badge only |
| **Card inner padding** | **36–40px** | summary 36, investment 40, brief ~33 |
| **In-card divider** | 1px, `#e0e4ec` (light) / `#2a3552`,`#2a3a5c`,`#28365a` (dark) | under card titles |
| **Structural hairline** | 1px, `#e4e7ee` | footer rule, table rules, definition rules |
| **Mock border** | 1px, `#e2e7ee` | product-mock cards & inner elements |
| **Table header rule** | 1px, `#d9deea` | slightly darker than body rules |
| **List row rhythm** | **56px** (approach), **36px** (pricing bullets), 104px (governance defn rows) | vertical step between items |
| **Dash bullet** | en-dash `–`, item indented **+24px** from dash | list marker |
| **Eyebrow tracking** | 1.0–2.4px (bigger tracking on smaller text) | uppercase labels |
| **Accent usage** | tick, section numbers, "SAVED" column, kicker labels, chart accent bar | never a fill behind text |

### 4.1 Full colour ledger (every hex that appears, with role)
```
#ffffff  slide bg (interior), card text on dark, mock canvas
#f5f7fb  cover bg (--bg)
#dfe3ea  page mat (html/body)
#f4f6f9  soft card fill / mock chips
#f1f3f8  bottom-line bar fill
#f8f9fc  mock sidebar fill
#edf1f6  mock titlebar fill
#fafbfd / #fefefe  mock URL bar / CTA pill fill
#0a1733  --navy  headings, wordmark
#0e1c3c  dark card fill, chart bars, portal hero band
#13224a  --ink-alt  secondary heading ink, dark list dashes, gov labels
#3c4660  --body  body text
#48526a  body inside cards / sub-paragraphs
#4f5a70  brief card body
#6b7689  muted body (value note, gov body)
#6b7a99  summary kicker
#8a95ab  --muted  section labels, table heads
#b3bcca  --light  running header, footer, cover date
#d9dee5  --divider  cover rules
#d9deea  table header rule
#e4e7ee  footer & table rules
#e0e4ec  in-card dividers (light)
#e2e7ee  mock borders
#e3e7ee  summary card rule
#e6eaf0  --card-line  circle-badge border
#d7dce6  chip border
#d62b1f  --accent  red
#f0a99f  salmon (kicker on dark panel)
#1e9e6a  success green (savings)
#e59e29 / #E69E29  gold/amber (badge, compliance flag)
#feedc9  amber highlight fill (compliance mock)
#9e6b0a / #9e6b0a  amber text (mock flag count)
#1f3fa6  CTA dot blue
#2a3552 / #2a3a5c / #28365a  dark-panel dividers
#8893b0 / #9aa6c2  muted text on dark panel
#cdd4e4 / #d7dceb  body text on dark panel
#8ea0c8  dark-panel list dash
#e7ebf5  panel serif quote
#9eadcc / #b2c2db / #6bdb99  portal mock (labels / body / positive)
#FC5E57 #FCBD2E #29C740  mac traffic-light dots
#ccd4e0 / #e0e5ed  skeleton bar greys (mock)
```

---

## 5. Reusable component recipes

Copy-paste geometry. Fill in content per slide.

### 5.1 Soft card
```
(x, 380) 540×470   background:#f4f6f9; border-radius:10–14px;
                   box-shadow:0 10px 30px 0 rgba(10,23,51,.10);
```
Content sits at `x+36`. Optional title divider = 1px `#e0e4ec` full inner-width.

### 5.2 Navy emphasis panel
```
(x, y) W×H   background:#0e1c3c; border-radius:14–16px;
Text: heading #fff · body #cdd4e4 · label #9aa6c2 (uppercase, tracked 1.6px)
      kicker #f0a99f · divider #28365a
```

### 5.3 Numbered constraint row (slide 02)
```
Card:   (910, y) 879×165.21   #f4f6f9  radius 10.59
Number: (943.89, y+32) display 31.77px  colour #d62b1f       e.g. "01"
Title:  (1026, y+32) Inter 600 19px  #0a1733
Body:   (1026, y+68) Inter 400 18px/1.5  #4f5a70   width ~705–730
Vertical step between cards: 184.27px (tops 364 / 548.27 / 732.54)
```

### 5.4 Data table (slide 06)
```
Header row (top:360):  Inter 500 12px  #8a95ab uppercase, tracking 1.2px
Header rule (top:392): 1px #d9deea
Body row label:  Inter 600 16.5px  #0a1733   (left 110, w580)
Body row cells:  Inter 400 17px  #48526a      (cols at 720 / 900)
Delta cell:      Inter 700 16px  #d62b1f       (col at 1100)  "SAVED"
Row rule after each: 1px #e4e7ee
Total row: labels + cells weight 700, cells 16px #0a1733 (no rule beneath)
Row pitch ≈ 72px (row top → next row top): 410 / 482 / 554 / 626 / 698
```

### 5.5 Stat panel (slide 06 right)
```
Panel:  (1330, 330) 480×590  #0e1c3c radius 16
Label:  Inter 500 11px #9aa6c2 uppercase tracking 1.6px
Number: Playfair 500 56px #fff  (white-space:nowrap)
Unit:   Inter 400 17px #9aa6c2 (baseline-aligned right of number)
Divider:1px #28365a, full inner width (400)
Closer: Playfair 600 25px/35 #e7ebf5  (pull-quote)
Stack pitch ≈ 152px between stat blocks (labels at 374 / 526 / 678)
```

### 5.6 Pricing card (slide 08)
```
Card:   (x, 393) 540×576  radius 14  shadow as §4
Name:   Playfair 500 31px  (146 from card-left, top 476–482)
Price:  Inter 600 27px  (top 593)
Sub (optional): Inter 400 11.5px #8893b0 (top 631)  "Annual licence, billed quarterly"
Divider:1px (top 665)  #e0e4ec light / #2a3a5c dark
Bullets: dash "–" at card-left+40; item +24 more; Inter 400 17px/21
         row pitch 36px (tops 691 / 727 / 763 / 799 / 835)
Featured (navy) card adds a gold badge above:
  Badge:  (728, 427) 200×28  #e59e29  radius 6
  Badge txt: Inter 600 10.5px #fff, tracking 1px  "RECOMMENDED FOR ALFABS"
```

### 5.7 Filter chip (slide 07)
```
Chip:  (x, 372) W×34  #fff  border 1px #d7dce6  radius 8
Dot:   (x+18, 386) 6×6  #d62b1f  radius 2
Text:  (x+32, 382) Inter 600 11px  #0a1733  tracking .6px  uppercase (nowrap)
Chip width = fit text; observed 249 / 267 / 186; gap between chips ~14–24px
```

### 5.8 Definition row (slide 07)
```
Label: (110, y) Inter 500 12px #13224a uppercase tracking 1.2px  (w280)
Title: (430, y-2) Inter 600 18px #0a1733
Body:  (430, y+28) Inter 400 17px/22 #6b7689  (w1320)
Rule:  (110, y+84) 1px #e4e7ee full band (1700) — omit after last row
Row pitch = 104px (label tops 460 / 564 / 668 / 772 / 876)
```

### 5.9 Split-compare block (slide 05)
```
Left card:  (110, 384) 800×468  #f4f6f9 radius 14
Right card: (1010, 384) 800×468 #0e1c3c radius 14
Each card: kicker (48/48 inset) Inter 600 12px tracking 1.4 — left #d62b1f, right #f0a99f
           title Inter 600 25px/32 — left #0a1733, right #fff
           divider (inset) 1px — left #e0e4ec, right #2a3552
           dash list: dash + item(+26) Inter 400 16.5px/24, step 56px
Centre badge: (928, 586) 64×64  #fff  border 1px #e6eaf0  radius 50%
              shadow 0 6px 18px rgba(10,23,51,.12); glyph "+" accent 34px centred
Bottom bar: (110, 884) 1700×78  #f1f3f8 radius 12
            label (150, 917) Inter 600 12px #d62b1f tracking 1.4  "THE BOTTOM LINE"
            text  (430, 911) Inter 600 17px/24 #0a1733
```

### 5.10 CTA pill (slide 09)
```
Pill: (x, y) W×36  #fefefe  border 1px #e4e7ee  radius 18
Dot:  (x+14, y+14) 8×8  #1f3fa6  radius 4
Text: (x+30, y+10) Inter 500 12px #0a1733 tracking .6px UNDERLINE (nowrap), wraps an <a>
Pill width = fit label; stack pills 52px apart (tops 516 / 568)
```

### 5.11 Summary tile (slide 03)
```
Card:  (x, 380) 540×470  #f4f6f9 radius 10  shadow as §4
Kicker:(x+36, 416) Inter 600 12px tracking 1.4 #6b7a99; leading number in #d62b1f  e.g. "01 — THE APPROACH"
Title: (x+36, 454) Inter 600 21px/28 #0a1733
Body:  (x+36, 548) Inter 400 17px/23 #48526a  (w468)
Rule:  (x+36, 772) 1px #e3e7ee (w468)
Foot label: (x+36, 798) Inter 500 11px #8a95ab uppercase tracking 1.4
Foot value: right-aligned to card-right (x+540), 798, Inter 600 11px #0a1733 uppercase
```

---

## 6. Product-mock construction guide (slide 04)

The three "product screenshots" are **pure CSS skeletons** — no images except one sparkline SVG. This is the deck's signature move for showing product without a real screenshot. Master this recipe; it is reusable for any future feature.

**Which surfaces to show, and how they should look.** The three mocks are chosen per client from the discovery interview (SKILL.md §3b) against the Diolog feature catalog (`.../web/exhisting-features-marketing.md`). Design each mock's *content* — the sidebar, cards, chips, tables, KPI tiles and the specific screen it depicts — from the real web-app design system (`.../web/DESIGN-WebApp.md` + `DESIGN-WebApp Showcase.html`), and use the `email-mockups` skill for guidance on impression-not-replica vignettes. But keep everything **within this frame, scale and style**: the 540×300 browser-chrome card and the skeleton sizes/coordinates below. Borrow the app's layout and components, not its palette — the mock's accent stays `var(--accent)` and its dark bands stay the deck navy, never the web app's blue.

### 6.1 The mock shell (`.mk`)
```
.mk  { (x, 611) 540×300  background:#fff; border:1px solid #e2e7ee;
       border-radius:12px; overflow:hidden; box-shadow:0 10px 30px 0 rgba(10,23,51,.10); }
```
All children are absolutely positioned **relative to the mock's top-left** (not the frame). Helper classes inside: `.b` (a block), `.dot` (radius 50%), `.sb`/`.md`/`.rg` = Inter weight 600/500/400. Text is `white-space:nowrap; line-height:normal`.

### 6.2 Window chrome (identical on all three)
```
Titlebar:  (-1,-1) 540×30  #edf1f6           (bleeds 1px past the border)
Hairline:  (-1, 29) 540×1  #e2e7ee
Traffic lights (8×8, top 10): (11)#FC5E57  (25)#FCBD2E  (39)#29C740
Window title: (65, 9) Inter 600 9px #0a1733
```

### 6.3 Skeleton primitives (the vocabulary of a fake UI)
| Primitive | Recipe |
|---|---|
| Heading bar | height 4–6px, `#ccd4e0`, radius 2 |
| Text line | height 3–4px, `#e0e5ed`, radius 1.5 |
| Real label | actual Inter text 6–9px in `#8a95ab`/`#3c4660`/`#0a1733` |
| Chart bar | width 15px, `#0e1c3c`; the *one* highlight bar is `#d62b1f`; radius 2 |
| Primary button | red `#d62b1f`, radius 6, white 8px label |
| Dark button | `#0e1c3c`, radius 6, white label ("Review") |
| Pill tag | small rounded rect `#f4f6f9`, radius 7 |
| Amber highlight | fill `#feedc9` behind an `#e59e29` bar = a "flagged" line |
| Doc/file icon | 11×13 `#f4f6f9` box, border `#e2e7ee`, radius 2, 7×1.5 red tab |

### 6.4 Mock 1 — "Presentation Studio" (x:110)
- Titlebar right side: theme pill `(461,7) 62×14 #f4f6f9 r7` + label "Alfabs theme" 7px muted.
- **Left rail** `(-1,30) 116×269 #f8f9fc` + 1px divider at x:115. Label "SLIDES" 6px.
- **4 slide thumbnails** `92×48`, radius 4, at tops 57/115/173/231. Thumb 1 is *selected*: border `1.5px #d62b1f`; others `1px #e2e7ee`. Each has a heading bar (`#ccd4e0`) + 3 text lines (`#e0e5ed`) + a page number.
- **Main canvas** `(131,43) 392×206 #fff border #e2e7ee r6`:
  - red rule `(149,61) 44×5 #d62b1f r2`
  - title "FY26 Full-Year Results" 13px navy `(149,73)`
  - sub "Alfabs Australia · ASX: AAL" 8px muted `(149,94)`
  - divider `(149,113) 356×1`
  - **bar chart** 5 bars w15 at x 151/177/203/229/255; heights 24/32/29/42/50; last bar red `#d62b1f`, rest navy; baseline at top≈223
  - caption "Revenue by half ($m)" 7px `(149,229)`
  - **KPI column** at x:359 — "REVENUE" 7px / "$142.6m" 15px navy / "EBITDA" 7px / "$28.4m" 15px navy / "NPAT · $11.2m" 8px
- **Thumb tabs** row: 4× `26×18 #f4f6f9` at top 261 (x 131/163/195/227).
- **Generate button** `(451,259) 72×22 #d62b1f r6` + white "Generate" 8px.

### 6.5 Mock 2 — "Compliance Guardian" (x:703)
- Titlebar right: amber flag pill `(477,6) 50×16 #feedc9 r8` + amber dot + "2 flags" 7px `#9e6b0a`.
- Section labels 7px muted: "CONSISTENCY CHECK · RESULTS PACK" `(15,41)`; "PRESENTATION" `(15,59)`; "ASX RELEASE" `(281,59)`.
- **Two side-by-side documents** `244×150 #fff border #e2e7ee r6` at x:13 and x:281 (top 73). Each: heading bar + 3 text lines, then an **amber-highlighted line** (`212×14 #feedc9 r3` with an `#e59e29` bar + a 50%-opacity `#e59e29` continuation), then more text lines. This visualises the "same figure, two documents" diff.
- Between the docs: an `↔` glyph 9px `#e59e29` at `(237,147)`.
- **Flag callout bar** `(13,237) 512×50 #f4f6f9 border #e2e7ee r8`: amber dot + bold navy line "'margin outlook' – phrasing differs across the deck and ASX release" 8px + muted subline "Forward-looking statement · align wording before lodgement" 7px + dark **Review** button `(451,251) 64×22 #0e1c3c r6`.

### 6.6 Mock 3 — "Investor Portal" (x:1296)
- Titlebar: URL bar `(109,7) 320×15 #fafbfd border #e2e7ee r7` + "alfabs.com.au/investors" 7px muted.
- **Nav row** `(-1,30) 540×28 #fff` + hairline at 58: brand "Alfabs Australia" 9px navy; links "Overview/Reports/Contact" 7px muted at x 299/351/397; ticker pill `(447,35) 80×18 #d62b1f r9` "AAL  $1.24" white 7px.
- **Hero band** `(-1,59) 540×76 #0e1c3c`: "INVESTOR CENTRE" 6px `#9eadcc` / "Alfabs Australia" 17px #fff / "ASX: AAL · Industrials" 7px `#b2c2db`; right side "SHARE PRICE" 6px / "$1.24" 18px #fff / "+2.4% today" 8px `#6bdb99`.
- **Three cards** `118px` band, top 147, `#fff border #e2e7ee r8`:
  - *Share price* (13, 147) 166×118: "Share price" + "$1.24" 13px + "+2.4%" green + **sparkline** `assets/sparkline.svg` `(25,199) 140×44` + "Last 30 days" 6px.
  - *Latest announcements* (195, 147) 166×118: heading + 3 items, each a bold navy title + muted date; first item has a red dot (price-sensitive).
  - *Reports & docs* (377, 147) 148×118: heading + 4 file rows, each a doc icon (11×13 with red tab) + label.

---

## 7. Per-slide blueprints

Each slide: node id, background, then every element as `content → (x, y) w×h · type · colour`. Chrome (§3) and footer are noted but not re-specified. **All copy is verbatim** so you can rebuild from content alone.

### 7.1 Slide 01 — Cover  (`frame--cover`, node 1:2)
**No standard chrome.** Background `#f5f7fb`.
| Element | Content | Placement |
|---|---|---|
| Wordmark | `diolog` | (108, 90) w947 · Newsreader 500 · **72.453px** · tracking −2.84 · navy |
| Client logo | `assets/alfabs-logo.png` | (1540, 52) 270×110 · object-fit contain · radius 6 |
| Eyebrow | `PREPARED FOR THE ALFABS BOARD · CFO & CEO` | (110, 254) w1200 · 12px · tracking 2.4 · `#8a95ab` |
| Headline | `Reclaim senior time and` / `de-risk disclosure, without growing the team.` (2 lines) | (108, 318) w1399 · display **104px/112** · navy |
| Accent rule | — | (112, 711) 120×6 · `#d62b1f` · radius 3 |
| Sub | `A plan to give AAL one governed workspace for every investor-facing deliverable - about 110 hours of senior time back a year, a disclosure check behind every number, and a more credible investor presence, all without new headcount.` | (108, 766) w1320 · Inter 400 22px/34 · `#3c4660` |
| Bottom divider | — | (110, 950) 1700×1 · `#d9dee5` |
| Date | `JULY 2026` | (1110, 970) w700 · right-aligned · 11px · tracking 1.8 · `#b3bcca` |

### 7.2 Slide 02 — The brief  (node 1:46)
Chrome: header `…· THE BRIEF, AS WE UNDERSTAND IT` · label `THE BRIEF · 02` · footer `02 / 09`.
- **Headline:** `Three constraints quietly taxing the team.` — (108, 196) w1500 · display 60/66.
- **Left narrative** (110, 364) w682 · Inter 400 20px/1.62 · `#48526a`:
  - ¶1 (margin-bottom 1.62em): "The challenge is that Alfabs does not have a large internal IR, design or communications function sitting behind that work. Investor presentations, website content, announcements and supporting materials still need to look polished, read clearly and stay aligned with continuous disclosure obligations - without creating unnecessary manual burden for the CFO, executive team or fractional IR partner."
  - ¶2 (**weight 700**): "The brief is clear: lift the professionalism of what investors see, reduce the time spent making materials look right, and create more confidence that every market-facing output is consistent, disclosure-aware and ready to go external."
- **3 numbered constraint cards** (recipe §5.3), tops 364 / 548.27 / 732.54:
  - `01` **Time lost to formatting & design.** — "Decks, announcements and the investor site eat hours that should go to strategy. No in-house design team - outside designers are slow, costly and inconsistent."
  - `02` **Full disclosure duties, a lean team to meet them.** — "Alfabs answers to the market like any ASX company, but without an in-house IR or legal function to backstop it. When the results deck, ASX release and presentation are reconciled by hand, one inconsistent figure becomes a corrective-disclosure risk."
  - `03` **Presented to the market below its true quality.** — "Mostly institutional and founder-owned, with limited liquidity. Alfabs wants to look credible to new institutions and HNW investors - without a louder announcement cadence."

### 7.3 Slide 03 — Summary  (node 1:17)
Chrome: header `… · THE SUMMARY` · label `SUMMARY · 03` · footer `03 / 09`.
- **Headline:** `A sharper, safer, better-resourced IR function.` — (108, 196) w1660 · display 62/70.
- **3 summary tiles** (recipe §5.11) at x 110 / 690 / 1270:
  - `01 — THE APPROACH` · **Becca + Diolog, as your IR function.** · "A private, governed workspace where Becca drafts, checks and publishes every investor-facing deliverable - announcements, results decks, the investor portal - with no new headcount." · TIME BACK → `~110 HRS / YR`
  - `02 — WHY NOW` · **Lean team, rising disclosure expectations.** · "Every reporting cycle still demands polished, consistent, compliant communication. Diolog removes the manual lift." · NEW HEADCOUNT → `NONE`
  - `03 — THE OUTCOME` · **Professional, protected, register-ready.** · "Sharper decks and a credible investor portal lift how the market sees Alfabs; continuous-disclosure checks reduce risk; built-in engagement supports engaging and growing the register." · GO LIVE → `~2 WEEKS`

### 7.4 Slide 04 — The workspace  (node 4:2)
Chrome: header `… · HOW DIOLOG SUPPORTS THE COMPANY` · label `THE WORKSPACE · 04` · footer `04 / 09`.
- **Headline:** `The workspace for everything investor-facing.` — (108, 196) w1660 · display 60/66.
- **3 columns** at x 110 / 703 / 1296, each: kicker number (top 351, Inter 600 13px, tracking 1, `#d62b1f`) · head (top 379, Inter 600 22px/29 navy, w515) · body (top 467, Inter 400 17px/22 `#48526a`, w510):
  - `01` **Investor-grade decks & documents, in your brand.** — "Generate results decks, ASX releases and FAQ packs from Alfabs' own knowledge base and brand theme. Becca drafts in minutes, not days - no external designer."
  - `02` **Continuous-disclosure checks on every draft.** — "Every document cross-checked against ASX continuous disclosure, ASIC guidelines, forward-looking guidance and Alfabs' prior disclosures. Numbers tied back to the financials."
  - `03` **A credible investor portal, published in minutes.** — "Point Diolog at the current website, it builds a fully-branded IR portal with disclosures and announcements auto-populated. Becca manages it end-to-end."
- **3 product mocks** (recipes §6.4–6.6) at x 110 / 703 / 1296, top 611.

### 7.5 Slide 05 — The approach  (node 6:53)
Chrome: header `… · THE APPROACH` · **tick override 30×3** · label `THE APPROACH · 05` · footer `05 / 09`.
- **Headline:** `Becca on strategy. Diolog on the doing.` — (108, 196) w1600 · display 60/66.
- **Sub:** `The approach behind this proposal - one fractional partner, supercharged, instead of building an in-house team.` — (110, 300) w1500 · Inter 400 19px/28 · `#48526a`.
- **Split-compare** (recipe §5.9):
  - Left `BECCA · STRATEGY & JUDGEMENT` / **The work that stays human.** — Investor, board and CFO counsel · Positioning and the equity narrative · Relationships, targeting and register strategy · The final call on what gets said, and when
  - Right `DIOLOG · THE HEAVY LIFTING` / **The production** — Drafts results decks, announcements & FAQ packs · Runs disclosure-consistency checks on every document · Builds and maintains the investor portal · Watches competitors, sector insights and sentiment analysis
  - Bottom bar `THE BOTTOM LINE` — "One fractional partner + Diolog delivers the output of a full IR, design and compliance team - with no new hire at Alfabs."

### 7.6 Slide 06 — Value  (node 6:2)
Chrome: header `… · THE VALUE CASE` · label `VALUE · 06` · footer `06 / 09`.
- **Headline:** `~50 hours back, every cycle.` — (108, 196) w1500 · display 62/70.
- **Table** (recipe §5.4), columns `ACTIVITY PER CYCLE | TODAY | WITH DIOLOG | SAVED`:
  | Activity | Today | With Diolog | Saved |
  |---|---|---|---|
  | Designing & formatting the results deck | 20–30 h | 4–6 h | ~20 h |
  | Drafting announcements & FAQ responses | 10–15 h | 3–5 h | ~9 h |
  | Cross-document consistency / disclosure checks | 8–12 h | 1–2 h | ~9 h |
  | Updating the investor website / portal | 10–15 h | <1 h | ~12 h |
  | **Total per period** | **48–72 h** | **9–14 h** | **~50 h** |
- **Source note** (110, 765) w1130 · 14px/19 · `#6b7689`: "Indicative figures for a lean ASX-listed industrial on a half-year reporting cycle; actuals measured against an Alfabs baseline in the first cycle."
- **Navy stat panel** (recipe §5.5): `PER CYCLE` → **~50** hours / per cycle · `ANNUALISED` → **~110** hours / year · `WHERE THE HOURS GO` → *"Register growth, investor targeting, strategic planning and board counsel."*

### 7.7 Slide 07 — Governance  (node 7:50)
Chrome: header `… · GOVERNANCE & SECURITY` · label `GOVERNANCE · 07` · footer `07 / 09`.
- **Headline:** `Disclosure-grade by default.` — (108, 196) w1500 · display 60/66.
- **Sub:** `Why this is safer than putting sensitive numbers - FY guidance, results, outlook - into Claude or Microsoft Copilot directly.` — (110, 296) w1500 · Inter 400 20px/26 · `#48526a`.
- **3 chips** (recipe §5.7) at top 372: `PRIVATE, SEGREGATED INSTANCE` (110,w249) · `NO MODEL TRAINING ON YOUR DATA` (373,w267) · `HOSTED IN AUSTRALIA` (654,w186).
- **5 definition rows** (recipe §5.8), label tops 460/564/668/772/876:
  - `DATA SEGREGATION` — **Your own private instance.** — "Alfabs data lives in a segregated instance - never in the same database as any other company, and never a shared public model."
  - `NO MODEL TRAINING` — **Your data never trains the model.** — "Back-training and model calls on your data are blocked at the infrastructure level. Nothing is stored or recalled by the model - unlike using Claude or Copilot directly."
  - `DATA RESIDENCY` — **Australian region.** — "All critical infrastructure and data hosted in Sydney (ap-southeast-2)."
  - `ENCRYPTION & ACCESS` — **Encrypted, access-controlled, fully audited.** — "AES-256 at rest, TLS in transit. Whitelisted provisioning and an immutable per-action audit trail."
  - `IP & MODELS` — **Alfabs retains all input and output.** — "Anthropic's Claude (Sonnet & Opus) under a private, governed deployment. No prompts or completions retained by upstream providers. Optional BYOK."

### 7.8 Slide 08 — Investment  (node 8:2)
Chrome: header `… · INVESTMENT` · label `INVESTMENT · 08` · footer `08 / 09`.
- **Headline (hero):** `Investment` — (106, 188) w1200 · display **84px**.
- **Sub:** `One annual subscription. No new headcount, no designers, no agencies - Diolog multiplies what Becca delivers.` — (110, 316) w1500 · Inter 400 20px/28 · `#48526a`.
- **3 pricing cards** (recipe §5.6) at x 106 / 688 / 1270:
  - **A · Listed Enterprise** (grey) · `A$1,499 / month` · Full Diolog product suite · Unlimited internal seats · Unlimited AI usage · Quarterly success review with Becca · Standard support · Hosted in AU region
  - **B · Listed Enterprise + Private Instance** (navy, badge `RECOMMENDED FOR ALFABS`) · `A$1,999 / month` · sub "Annual licence, billed quarterly" · Everything in Listed Enterprise · Private, segregated instance - your data isolated · Sole-tenant deployment · Priority support - 24 hour SLA · BYOK supported
  - **C · What you could save with Diolog** (grey, savings ledger — recipe below):
    - Rows (label left 1310 / value right-aligned): Investor website / IR portal design → `A$10-15k /yr` · Market data & chart widgets → `A$2-5k /yr` · External deck designers & agencies → `A$30-40k /yr` · Disconnected point tools → `A$5-10k /yr`
    - Divider (1310, 717) 460×1 `#e2e7ee`
    - `Displaced spend, year one` → `~A$50–70k` (accent `#d62b1f`, 14px 600)
    - `Est. Annual savings with Diolog` → `A$25–46k / year` (green `#1e9e6a`, 17px 700)
    - Micro note (right-aligned, 9px muted): `NOT INCL. SENIOR LEADERSHIP TIME SAVINGS`
    - Right-aligned plus-list (14px/19 navy, green `+`): `+ Reduced disclosure risk` · `+ Improved consistency` · `+ No new headcount`

### 7.9 Slide 09 — Next step  (node 8:56)
Chrome: header `ALFABS AUSTRALIA · DIOLOG PROPOSAL` (short) · label `NEXT STEP · 09` · footer `09 / 09`.
- **Headline (hero):** `Next step` — (106, 186) w1200 · display **84px**.
- **Lead:** `Let's get Alfabs live on Diolog.` — (110, 360) w1100 · Inter 600 30px · navy.
- **Body:** `From here it's simple - either book a longer demo so the Alfabs team can see it on their own data, or choose the subscription that fits and we'll have you live within 24 hours.` — (110, 416) w1080 · Inter 400 20px/29 · `#48526a`.
- **2 CTA pills** (recipe §5.10) at (106, 516) w347 → `BOOK A CHAT WITH AMY TO DISCUSS FURTHER` (→ Calendly) and (106, 568) w219 → `VIEW PERSONALISED DEMO` (→ screen.studio demo link).
- **Contacts** (left 110):
  - `REBECCA CULBERTSON` (743, 16px 700) / `Investor Relations, Fraction IR` (769, 17px 400 `#48526a`) / `rebecca@fractionir.com` (797, 14px 500 navy)
  - `AMY BENSON` (858, 16px 700) / `Director, Diolog` (884) / `amy@diolog.com.au   ·   0439 667 489   ·   diolog.app` (912, 14px 500 navy)
- **Wordmark:** `diolog` — (1641, 900) w300 · Newsreader 500 · 60px · tracking −2 · `#13224a` (bottom-right sign-off).

---

## 8. Assets

| File | Dimensions | Where used |
|---|---|---|
| `assets/alfabs-logo.png` | 270×110 (contain, radius 6) | cover top-right |
| `assets/sparkline.svg` | 140×44 | investor-portal mock (slide 04) |
| Google Fonts | — | Inter · Newsreader · Playfair Display (see §1.1) |

---

## 9. Reproduction checklist & gotchas

Build a slide, then verify against this list:

1. **Frame first.** 1920×1080, `overflow:hidden`, white (or `#f5f7fb` for the cover). Everything else is `position:absolute` off the frame.
2. **Chrome on 02–09 only.** Cover has none. The running header, tick, section label, and footer are identical machinery — only the text changes. Slide 09 shortens the header; slide 05 shrinks the tick to 30×3.
3. **Headlines break the grid by 2–4px.** Display text starts at x:106–108, not 110. Big one-word titles (08/09) sit ~10px higher (top ~186 vs 196).
4. **One accent, one panel per slide.** Red only as tick / numbers / SAVED column / kicker labels / a single chart bar. At most one `#0e1c3c` navy surface per slide (cards, stat panel, portal hero band, chart bars, dark buttons).
5. **Cards share one shadow** (`0 10px 30px rgba(10,23,51,.10)`) and radius 10–16. Never stack shadows or nest shadowed cards.
6. **Right-align by anchor.** Any figure or label flush-right uses `left:edge; text-align:right; transform:translateX(-100%)` — not a computed left. (Header, footer-right, summary values, cover date, savings values.)
7. **Dash lists:** literal en-dash `–` glyph as the bullet, item text indented +24px, row pitch 36px (pricing) or 56px (approach). Governance uses 104px definition rows.
8. **Numbers:** en-dash for ranges (`20–30 h`, `A$25–46k`), spaced hyphen for connective clauses (`- without…`), `~` prefix for approximations, `A$` for currency. Green only for money saved, red only for spend/savings-delta.
9. **Product mocks are CSS, not images.** Titlebar bleeds −1px past the border on all sides; traffic lights `#FC5E57/#FCBD2E/#29C740`; skeleton bars are `#ccd4e0` (headings) and `#e0e5ed` (text lines); one accent bar per chart; amber `#feedc9`+`#e59e29` = a "flag". Only real raster asset inside a mock is the sparkline SVG.
10. **Footer rule at y:1000, content ends by ~920.** Keep the lower ~80px for the footer, and leave cover/hero slides deliberately empty in the lower third.

<!-- Notes on gaps a content-only rebuild can't recover, and where this guide fills them:
  - Two "navies" are distinct and must not be merged: #0a1733 (heading ink / --navy) vs #0e1c3c (panel fill / chart bars). Documented in §4.1.
  - Column gutters differ (40px on 03/08, ~53px on 04) despite identical 540px cards — do not normalise; match per §2.1.
  - Fractional Figma values (165.21, 31.771, 72.453…) round safely to whole px.
  - No hover/focus/motion is recoverable from static frames; this is a print-canvas export. If made interactive, add a 2px accent focus ring on the CTA links.
  - Amber (#e59e29) and CTA blue (#1f3fa6) each appear once — treat as intentional accents, not a broader palette. -->
