# Native Foundation — the platform floor every design stands on

Distilled from Apple's macOS 27 UI kit (deconstructed from its Sketch JSON — values marked `(specified)` are exact kit data) and the macosify-derived native grammar. Use these values directly when building; deeper detail lives in the macosify plugin's `reference/hig/` and `reference/DESIGN.md`.

## Control metrics `(specified)`

One height ladder for all control families:

| Tier | Height | Use |
|---|---|---|
| Mini | 16 | dense inspectors |
| Small | 20 | compact panels |
| **Regular** | **24** | default everywhere |
| Large | 28 | emphasized contexts |
| **XL** | **36** | toolbars |

- Push button: label inset 16px per side; bezel reads capsule in the Liquid Glass era. Styles: Bordered / Bordered Default (the one accent-filled) / Bordered Tinted / Bordered Destructive / Borderless / Toggle.
- Fields: default 120w; text inset 6px (Rg); bezel radius ladder ~2.5 (Mn) → 6.5 (XL); focus ring radius 4/5/6/7/9 by tier. Search fields are capsules.
- Switches 44×20 (Sm) – 80×36 (XL), capsule; checkboxes/radios 14–18pt (Mn/Sm) and by-meaning: checkbox = independent setting, radio = exclusive set, switch = emphasized group toggle only.
- Scrollbar 12pt gutter, capsule thumb. Steppers pair with an editable field, always.

## Type `(specified)` — SF Pro (`-apple-system` stack; never bundle fonts)

| Role | Size | LH | Emphasized |
|---|---|---|---|
| LargeTitle | 26 | 32 | Bold |
| Title1 / Title2 / Title3 | 22 / 17 / 15 | 26 / 22 / 20 | Bold / Bold / Semibold |
| Headline | 13 (Bold) | 16 | Heavy |
| **Body** | **13** | **16** | Semibold |
| Callout / Subheadline | 12 / 11 | 15 / 14 | Semibold |
| Footnote / Caption | 10 | 13 | Semibold |

Loose leading = +2pt, tight = −2pt. Emphasis via Semibold, not Bold. 13pt body is the loudest native-vs-iOS/web discriminator — 17pt or 16px body means it isn't a mac app.

## Colour `(specified)`

- **Label tiers (light):** primary `#000` @85% · secondary @50% · tertiary @25% · quaternary @10%. (Dark: `#FFF` @100/55/25/10%.) Primary is never pure black.
- **Fills (bezels/tracks):** black/white @10/8/5/3/2%.
- **System hues (light / dark):** Red `#FF383C/#FF4245` · Orange `#FF8D28/#FF9230` · Yellow `#FFCC00/#FFD600` · Green `#34C759/#30D158` · Mint `#00C8B3/#00DAC3` · Teal `#00C3D0/#00D2E0` · Cyan `#00C0E8/#3CD3FE` · Blue `#0088FF/#0091FF` · Indigo `#6155F5/#6D7CFF` · Purple `#CB30E0/#DB34F2` · Pink `#FF2D55/#FF375F` · Brown `#AC7F5E/#B78A66`.
- Window backgrounds: `#FFFFFF` light / `#1E1E1E` dark; dark chrome is graphite (~`#2C2C2E`–`#3A3A3C` surfaces), never pure black; author dark independently, never invert.
- Bind selection/focus/primary-action to ONE accent (the user's, conceptually); per-item identity colours come from the 12-hue palette and are separate; status colour always pairs with a glyph/label.

## Chrome anatomy `(specified)`

| Element | Value |
|---|---|
| Titlebar | 33pt; traffic-light cluster 68×14 at (9, 9.5); inset scales with bar height (concentric ratio) |
| Unified toolbar | 52pt (8 + 36 XL controls + 8) · compact 40pt (Rg controls) · expanded 77pt |
| Sidebar | 256pt wide; rows 24/32/40 (S/M/L); selection = inset rounded fill, radius 8, 4px side insets |
| Menus | items 19/22/24 (Mini/Small/Regular); selection radius 8; inner padding 12–14 |
| Popover radius | 20 · Alert buttons 228×28 stacked · Tooltip min 98×19 |
| Scroll edge effect | content slides under glass chrome with a translucent fade — include it wherever content meets a floating toolbar |

Concentric corners: child radius = parent − padding; capsule = height/2. Window radius is era-fragmented — pick one and keep every nested radius concentric to it.

## The native grammar (10 rules to design by)

1. Selection = flat inset rounded fill + accent text/glyph — never full-bleed bars or glossy capsules.
2. Sidebar/section headers: system font, semibold, secondary colour, sentence case — never tracked uppercase.
3. Liquid Glass only on floating chrome (toolbar/sidebar/menus/popovers/sheets); content opaque; no glass-on-glass; a flat opaque window is legitimately native.
4. One prominent (accent-filled) action per view, trailing; Cancel leading; destructive never default; "…" = opens a further view; disabled dims, never disappears.
5. Density: 13pt body, 24pt controls, 24–28pt rows; hierarchy via label tiers and weight, not size inflation.
6. Pop-up (double chevron, shows value) ≠ pull-down (single chevron, static title). Control by meaning (checkbox/radio/switch/segmented rules above); segmented controls switch views in-place — never main navigation.
7. Toolbar: borderless monochrome SF Symbols, ≤3 groups, one trailing primary; window title useful, not the app name.
8. Forms: right-aligned colon labels + left-aligned controls on a shared edge, flat on one surface — no stacked labels, no iOS grouped cards.
9. Real chrome: genuine traffic-light geometry, arrow cursor, focus states; menu bar is the complete command surface (note it in specs even if unrendered).
10. Motion (when specified): transform/opacity only, ~150/250/400ms, honour Reduce Motion.

## Delivery audits

**Native-tells audit (10 checks — all pass unless a named deliberate deviation):** lineage reads native · glass discipline · selection grammar · header casing · density · accent binding · action singularity · concentric corners · toolbar grammar · real chrome.

**Quality rubric (14 checks, from the digest skill's knowledge base):** 8pt grid adherence · 12-col/edge alignment · proximity grouping (between-group > within-group) · ≤6 font sizes on a modular scale · line-height inverse to size · ~65ch measure · de-emphasis hierarchy · one saturated primary per region · 4.5:1 text contrast · 3:1 UI contrast · target minimums (24px floor; 44px for touch-adjacent) · input heights ≥ Rg tier · label proximity · focus appearance (2px ring, 3:1 shift).

Report both scores honestly with every delivered design; fix or disclose misses.
