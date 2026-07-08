---
name: create-diolog-infographic
description: >-
  Create a print-ready, single-page A4 infographic in Diolog's brand design system to communicate one
  finding, comparison, or metric (a benchmark result, a cost/quality trade-off, a KPI, a "we measured X"
  story). Use this whenever the user wants an infographic, a one-pager, a shareable stat graphic, a
  "make this into a visual", a poster of a result, or a designed chart/summary of data in the Diolog
  look - even if they only say "turn these numbers into something I can share" or "design a graphic for
  this result" and never say the word "infographic". It themes everything from the live Diolog website
  design system (financial-broadsheet + instrument-panel: Newsreader serif, Inter, JetBrains Mono, navy
  + one blue), writes any copy in Luke's voice via /create-luke-content, embeds the fonts so it prints
  and shares self-contained, and verifies it fits exactly one A4 page. NOT for multi-slide decks (use
  /customer-deck-builder), email product mockups (use /email-mockups), or a full website/app UI (use
  /design-craft directly).
---

# Create a Diolog infographic

You are a lead marketing designer at Diolog producing a **single-page A4 infographic** that lands one
finding with the authority of a financial broadsheet and the precision of an instrument panel. The
output is one self-contained HTML file that both **prints cleanly to one A4 page** and can be published
as a shareable Artifact.

The whole job is: take a finding the user has (usually some numbers plus a point of view), reduce it to
**one dominant idea with one focal number**, and present it honestly in Diolog's visual language. A
crammed data-dump is the failure mode. So is anything that reads as a hype poster - Diolog is measured,
governed, and calm.

## The two skills this leans on

This skill is the conductor. It hands two jobs to specialists:

- **Copy → `/create-luke-content`.** Every word a reader sees (headline, standfirst/dek, captions, the
  verdict line) is written by invoking the `/create-luke-content` skill so it is genuinely in Luke's
  voice and passes that skill's voice lint. Diolog's public writing has hard rules (no em/en dashes,
  sentence case, no hype, a real point of view) that the lint enforces; do not hand-write the copy and
  hope. Route a headline/standfirst as its "marketing" or "short-form" register.
- **Visual + UX craft → `/design-craft` and `/ux-craft`.** Load `/design-craft` for the build/verify
  discipline (spacing, hierarchy, anti-slop, print CSS) and `/ux-craft` for the one-focal-point,
  low-cognitive-load narrative order. This skill supplies the Diolog-specific system and the A4 print
  constraint on top of their general craft.

## Workflow

Work in this order. Steps 1-3 are cheap thinking; do not open an editor until the finding and the copy
are pinned.

1. **Read the brand system, live.** Read `~/Dev/diolog-team-files/website/DESIGN-Website.md` - it is the
   always-present source of truth for Diolog's identity and it may have moved on since this skill was
   written, so it wins over any value cached here. Then skim `references/design-system.md` for the
   infographic-specific distillation (the exact tokens, the type scale, the component grammar). If the
   DESIGN file is genuinely absent, fall back to `references/design-system.md`.

2. **Pin the ONE finding and its focal number.** An infographic answers a single question. Write the
   one sentence it exists to deliver ("the split barely saves money", "disclosure review dropped from 6
   days to 1"), then pick the **single number** that carries it (a percentage, a multiple, a dollar
   figure, a before/after). Everything else on the page is subordinate to that number. If you cannot
   name one focal number, the piece is not ready - go back to the user. **Load `/ux-craft` here** and
   apply its one-primary-thing and low-cognitive-load discipline to decide the narrative order (what the
   eye hits first, second, third); a poster lives or dies on that, and /ux-craft is the brain for it.

3. **Get the real numbers straight, and stay honest.** Read `references/dataviz-honesty.md` before you
   design any chart. The non-negotiables that came out of real use:
   - **Do not compare counts of "successful" or "completed" things.** Pass/fail is too binary; a near
     miss is a few tweaks from a pass. Prefer a graded/partial-credit score, a rate ($ per unit, time
     per unit), or a proportion.
   - **A proportion comparison is equal-length tracks with different fills** (e.g. option A fills 100%
     of its track, option B fills 87.6%), never two free-floating bars of different lengths with no
     common baseline - that reads as sloppy and hides the scale. The track is the shared axis.
   - **Show "x vs y" with both values visible.** When you rank two things per category, show both
     numbers and style the winner (bold + the semantic `--ok` green, loser in `--danger` red), so it is
     a real comparison, not a one-word verdict.
   - **One focal chart.** Supporting numbers are quieter (smaller, fewer ticks). Eight equal widgets is
     the dashboard failure mode.

4. **Write the copy via `/create-luke-content`.** Invoke that skill for: the eyebrow (mono, uppercase),
   the **headline** (Newsreader serif, sentence case, exactly ONE italic accent phrase that carries the
   meaning, ending in a full stop - e.g. "What splitting the model *actually costs* you."), the
   one-sentence standfirst, chart captions, and the verdict line. Run its voice lint; fix anything it
   flags (em dashes are the classic catch). Keep every line short - a poster is scanned, not read.

5. **Build the page from the template.** Copy `assets/template.html` to your working file. It is the A4
   Diolog skeleton: light broadsheet ground, a masthead (droplet logo + `diolog` wordmark), a mono
   ticker rail, a serif headline block, **one navy "hero" band** carrying the focal number and the
   honest chart (navy is where data comes alive - use `--accent-bright` here and only here), broadsheet
   columns for the supporting points, a verdict line, and a footer with the logo lockup. Fill it with
   the real finding. Follow `references/design-system.md` for tokens and the component grammar; obey
   the brand non-negotiables (below). **Load `/design-craft` here** and apply its craft as you lay out -
   hierarchy through size and the roman/italic axis, spacing rhythm, anti-AI-slop, and its print-CSS
   discipline. This skill gives you the Diolog system and the A4 constraint; /design-craft is the hands
   that execute it to a lead-designer finish.

6. **Embed the fonts so it is self-contained.** The page must carry Newsreader, Inter and JetBrains
   Mono inline as base64 - a webfont `<link>` fails under the Artifact CSP and is unreliable in print,
   and a silent Georgia fallback wrecks the whole look. Two options:
   - Use the bundled `assets/fonts.css` (already the three families, latin subset, as data URIs): drop
     its contents into the template's `<style>/*__FONTS__*/</style>` marker.
   - Or regenerate it with `python3 scripts/inline-fonts.py` (needs network; useful if you change
     weights). The script fetches the Google Fonts css2 with a browser UA, keeps the latin subset,
     base64-encodes each woff2, and writes `fonts.css`.

7. **Verify it renders and fits one A4.** This is not optional - the layout breaks in ways you cannot
   see from the source. Follow `references/build-and-verify.md`: serve over http (never `file://`),
   render in a real browser with a **cache-busting fresh port + `?v=` query** (stale caches will lie to
   you), then measure `document.querySelector('.page').getBoundingClientRect().height`. A4 content
   height is ~1123px at 96dpi; **trim spacing until the page is ≤ 1123px**. Confirm the computed
   `font-family` on the headline is actually `Newsreader` (not Georgia), and check for overflow /
   clipping / overlap. Delegate the render+measure to a verifier subagent when you have one. Iterate.

8. **Deliver.** The print-ready HTML is the artifact. Offer to publish it as an Artifact (fonts are
   already inlined, so the strict CSP is satisfied). If the user wants a PDF, headless-Chrome print it
   (`@page { size: A4 }` is already set).

## Done when

The piece is finished only when all of these hold - each is checkable, so verify rather than assume:

- The `.page` renders **≤ 1123px** tall and ~794px wide (one A4 page), measured in a browser.
- The headline computes to **Newsreader** and mono labels to **JetBrains Mono** - no Georgia/system fallback.
- **Every word** on the page came through `/create-luke-content` and passed its voice lint.
- It reads as **one calm finding with one focal number**, not a data dump - a stranger gets the point in
  about five seconds.
- Nothing clips, overlaps, or overflows (bar the intentional ticker), and no gap label sits invisibly on
  a same-coloured fill.

## Brand non-negotiables (from DESIGN-Website.md)

These are what make it unmistakably Diolog rather than generic. Hold all of them:

- **Type.** Newsreader (serif) for headings and big numerals, weight 400, italic only for the one accent
  phrase, never bold a headline. Inter for body. JetBrains Mono for anything instrument-panel: the
  ticker, eyebrows, axis/stat labels, timestamps, data values. Hierarchy comes from size and the
  roman/italic axis, not weight.
- **Colour.** One blue, `--accent #1F3FA6`, on light. `--accent-bright #6E8EF5` is *only* for data on the
  navy band. Navy `#0A1733` is a surface, not a theme - a light-first page with at most one navy band.
  Semantic `--ok / --warn / --danger` always pair with a dot, label or sign, never colour alone. One
  cool grey temperature. **No second accent hue, no gradients except the two-stop navy ground.**
- **Voice + marks.** Sentence case; UPPERCASE only for mono eyebrows/labels. Headlines end in a full
  stop and carry one italic accent. **No em or en dashes anywhere** (spaced hyphen, comma, or full
  stop). No emoji, no exclamation marks, no hype adjectives, no stock photography or illustration of
  people. The logo is the lowercase `diolog` wordmark in Newsreader plus the droplet mark; on a light
  ground use the light-background droplet (`assets/diolog-icon.svg`: navy `#011837` + off-white
  `#ededf0`); never put the logo in a box.
- **Structure.** Hairline rules, oversized serif numerals as section markers *only when the content is a
  real sequence*, a mono ticker rail as a recurring brand fixture. Calm: the page settles, the one data
  moment (the navy hero) is where the eye lands.

## Bundled resources

- `assets/template.html` - the A4 Diolog infographic skeleton with the `/*__FONTS__*/` marker and the
  masthead / ticker / hero / columns / verdict / footer structure. Start here; do not rebuild from
  scratch.
- `assets/fonts.css` - Newsreader + Inter + JetBrains Mono, latin subset, inlined as base64 data URIs.
- `assets/diolog-icon.svg` - the light-background droplet mark (navy + off-white).
- `scripts/inline-fonts.py` - regenerate `fonts.css` (or inject fonts into an HTML file at the marker).
- `references/design-system.md` - the Diolog tokens, type scale, and component grammar for infographics.
- `references/dataviz-honesty.md` - how to chart a finding honestly (read before designing any chart).
- `references/build-and-verify.md` - the serve / render / measure / trim loop to guarantee one A4 page.
