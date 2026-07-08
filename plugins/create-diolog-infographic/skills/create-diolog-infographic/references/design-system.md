# Diolog design system - infographic distillation

The source of truth is `~/Dev/diolog-team-files/website/DESIGN-Website.md`; read it first (it may have
evolved). This file is the subset an A4 infographic actually needs, as ready-to-paste tokens.

## Tokens (paste into `:root`)

```css
:root{
  /* grounds - light-first; navy is a surface, used once */
  --canvas:#FFFFFF; --wash:#F5F7FB; --soft:#F1F4F9;
  --navy:#0A1733; --navy-deep:#050B1F;
  /* ink */
  --fg:#0F1A2E; --fg2:#3D4A66; --muted:#5E6A82; --faint:#9CA0AC;
  --on-dark:#E8EEF8; --on-dark-muted:#9AA8C4;
  /* the one blue */
  --accent:#1F3FA6; --accent-deep:#142A78; --accent-soft:#E6EEF9;
  --accent-bright:#6E8EF5;            /* ON NAVY DATA ONLY */
  /* hairlines */
  --hair:rgba(15,26,46,.10); --hair-strong:rgba(15,26,46,.18); --hair-dark:rgba(255,255,255,.12);
  /* semantic - always with a dot/label/sign, never colour alone */
  --ok:#1F8A5B; --ok-dot:#22C55E; --warn:#A56A11; --danger:#C2362A;
  /* type */
  --serif:"Newsreader",ui-serif,Georgia,serif;
  --sans:"Inter",-apple-system,system-ui,sans-serif;
  --mono:"JetBrains Mono",ui-monospace,monospace;
}
```

Rules that are easy to get wrong:
- `--accent-bright` appears **only** on the navy band (live data). Never on light, never a button fill,
  never body text.
- Pure `#FFFFFF` canvas is the real brand token - keep it (do not "tone" it away; it is deliberate).
- One grey temperature (cool). Semantic colour always carries a second signal.

## Type scale (print px, since A4 is fixed-size not responsive)

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Headline (H1) | Newsreader | 34-46px | 400 | one italic accent phrase; ends in a full stop; `text-wrap:balance` |
| Section head | Newsreader | 20-24px | 400 | italic accent optional |
| Focal numeral (hero stat) | Newsreader | 80-120px | 400 | the one big number; `line-height:.82` |
| Standfirst / lead | Inter | 13-15px | 400 | one sentence; `line-height:1.55` |
| Body | Inter | 11-12.5px | 400/600 | short |
| Eyebrow | JetBrains Mono | 10-11px | 400 | UPPERCASE, `letter-spacing:.14-.2em` |
| Mono label / ticker / stat value | JetBrains Mono | 8.5-11px | 400/500 | UPPERCASE for chrome; tabular for numbers |

Hierarchy is **size + roman/italic**, never bold on a headline. Put `font-variant-numeric:tabular-nums`
on anything with digits that align.

## Component grammar (what the template implements)

- **Masthead.** Left: the droplet mark (`assets/diolog-icon.svg`, light-bg variant) + `diolog` wordmark
  in Newsreader. Right: a mono meta line (e.g. `ENGINEERING BENCHMARK / <topic> · <Month Year>`).
  Hairline under.
- **Ticker rail.** A single mono line of the finding's key facts separated by `·`, hairline top+bottom.
  A recurring Diolog fixture; `overflow:hidden` (it may clip at the edge, that is fine - it reads as a
  live rail).
- **Headline block.** Mono eyebrow, then the Newsreader headline with its one italic accent, then a
  one-sentence Inter standfirst.
- **Hero band (the one navy moment).** A radial navy ground + a faint mono grid (market-depth texture).
  Carries the **focal numeral** and the **one honest chart**. This is the single focal point.
- **Broadsheet columns.** Two (or three) columns divided by a hairline, each a small supporting point:
  an optional oversized serif numeral marker (only if the points are a real sequence), a mono eyebrow, a
  Newsreader sub-head with an italic accent, a short line, and a small honest viz or an "x vs y" table.
- **Verdict.** A hairline, then a single confident Newsreader line (the conclusion), with one italic
  accent. Keep it standalone; resist tacking on caveats.
- **Footer.** Hairline, then the methodology in small muted Inter on the left, and the `diolog` lockup
  (droplet + wordmark) with the italic tagline on the right.

## The droplet logo

`assets/diolog-icon.svg` is the light-background mark: two interlocking droplets, navy `#011837` +
off-white `#ededf0` (a "dialogue" glyph). On a white ground the navy droplet carries the read and the
off-white one is a subtle counterform - that is correct, not a bug. On a navy ground you would instead
use the off-white-primary variant, but an infographic is light-first so the light mark is the default.
Never place the logo in a box; the wordmark is lowercase `diolog` in Newsreader.
