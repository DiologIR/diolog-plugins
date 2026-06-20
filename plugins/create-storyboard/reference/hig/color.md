---
title: Color
hig: https://developer.apple.com/design/human-interface-guidelines/color
role: foundation
---

# Color (macOS)

**Purpose.** Use colour the macOS way: as a small set of *dynamic, semantic* system colours (named for purpose, adapting to appearance/vibrancy/contrast) plus a restrained use of the user's accent colour for emphasis. Apple: the system "defines colors that look good on various backgrounds and appearance modes, and can automatically adapt to vibrancy and accessibility settings." Using system colours is "a convenient way to make your experience feel at home on the device."

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/color

## Key principles

- **Don't hard-code system colour values.** [HIG] "Documented color values are for your reference during the app design process. The actual color values may fluctuate from release to release… Use APIs like Color to apply system colors." The hex tables below are reference only.
- **Don't reuse the same colour to mean different things.** [HIG] Use colour consistently — if your brand colour signals an interactive borderless button, don't use a similar colour to style non-interactive text.
- **Make every colour work in light, dark, and increased-contrast contexts.** [HIG] System colours already define all these variants; for a custom colour, supply light and dark variants *and* an increased-contrast option for each. "Even if your app ships in a single appearance mode, provide both light and dark colors to support Liquid Glass adaptivity."
- **Don't redefine the semantic meaning of dynamic colours.** [HIG] Each dynamic colour is defined by its purpose, not its appearance — "don't use the separator color as a text color, or secondary text label color as a background color."
- **Inclusive colour: never colour alone.** [HIG] "Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information." Add text labels or glyph shapes. Avoid low-contrast combinations colour-blind users can't distinguish, and consider cultural meaning (e.g. red is danger in some cultures, positive in others — Stocks shows red for gains in Chinese).
- **Apply colour to Liquid Glass sparingly.** [HIG] By default Liquid Glass has no inherent colour and picks up colour from content behind it. Reserve applied colour for elements that benefit from emphasis (status indicators, primary actions); to emphasise a primary action, colour the *background*, not the symbol/text — and don't colour multiple controls' backgrounds at once.

## Metrics & values

> Reference only — Apple says not to hard-code these. Values below carry [macOS 27 UI Kit] hexes; treat them as a third-party reference for an unreleased OS, verify before shipping, and apply via system colour APIs/tokens.

**Label tiers (text on backgrounds)** [macOS 27 UI Kit] — black/white at decreasing alpha:

| Tier | Light (`#000` @) | Dark (`#FFF` @) |
|---|---|---|
| Primary (label) | 0.85 | 1.0 |
| Secondary | 0.50 | 0.55 |
| Tertiary | 0.25 | 0.25 |
| Quaternary | 0.10 | 0.10 |
| Quinary | 0.05 | 0.05 |
| Seximal | 0.03 | 0.03 |

- **systemGray base** #8E8E93 (light) / #98989D (dark). [macOS 27 UI Kit]
- **Separator** #3C3C43 @ 0.29 (hairline rules/dividers). [macOS 27 UI Kit]
- **Window background** #FFFFFF (light) / #1E1E1E (dark). [macOS 27 UI Kit]

**System palette** (light / dark) [macOS 27 UI Kit]:

| Colour | Light | Dark |
|---|---|---|
| Blue (accent default) | #0088FF | #0091FF |
| Green | #34C759 | #30D158 |
| Red | #FF383C | #FF4245 |
| Orange | #FF8D28 | #FF9230 |
| Yellow | #FFCC00 | #FFD600 |
| Mint | #00C8B3 | #00DAC3 |
| Teal | #00C3D0 | #00D2E0 |
| Cyan | #00C0E8 | #3CD3FE |
| Purple | #CB30E0 | #DB34F2 |
| Pink | #FF2D55 | #FF375F |
| Indigo | #6155F5 | #6D7CFF |
| Brown | #AC7F5E | #B78A66 |

> The macOS 27 system **blue is #0088FF**, brighter than the older #007AFF. Apple's own page ships colour swatches but documents no fixed hex (values "may fluctuate from release to release"), so these come from the kit — a reference, not canonical [HIG].

- **Contrast minimums** [HIG]: ensure colours don't make content hard to perceive (text vs background, colour-blind-safe combinations); pair with the dark-mode 4.5:1 / 7:1 guidance in [dark-mode.md](dark-mode.md).

## Native macOS conventions

- **Use macOS dynamic system colours.** [HIG] AppKit defines a large set, semantically named — including `controlAccentColor` (the accent the user picks in System Settings), `controlBackgroundColor`, `controlColor`, `controlTextColor`, `disabledControlTextColor`, `labelColor` / `secondaryLabelColor` / `tertiaryLabelColor` / `quaternaryLabelColor`, `linkColor`, `placeholderTextColor`, `separatorColor`, `gridColor`, `selectedContentBackgroundColor`, `selectedControlColor`, `selectedTextBackgroundColor`, `keyboardFocusIndicatorColor`, `windowBackgroundColor`, `underPageBackgroundColor`, and the `unemphasized…` variants for non-key windows.
- **App accent colours (macOS 11+).** [HIG] You can specify an accent for buttons, selection highlighting, and sidebar icons — applied when the user's General → Accent color is *multicolor*. If the user picks a specific accent, the system replaces yours with theirs (except a fixed-colour sidebar icon, whose meaning is preserved). So bind selection/focus/primary to the OS accent; never hard-code blue.
- Implement as CSS custom properties resolving per appearance (`--label`, `--label-secondary`, `--separator`, `--accent`, `--control-bg`), redefined under `[data-theme="dark"]` / `@media (prefers-color-scheme: dark)`.
- Status semantics: green = success/online, red = destructive/error, yellow/orange = warning, blue/accent = active/selected.
- Destructive actions: red *text/label*, not a giant red fill; heavy fills are reserved for the default/prominent button.
- Selection highlight uses an accent *tint/fill at low opacity* with accent-coloured text, not a saturated solid block (this app's `--chrome-sel`).
- Use system colour controls/pickers where available so users get a consistent picker and saved colours across apps. [HIG]

## Common non-native mistakes

- **Hard-coding system hex values** (the page's headline macOS warning) instead of resolving them through colour APIs/tokens.
- **Hardcoding blue (#007AFF / brand blue)** for selection/primary instead of binding to `controlAccentColor`.
- **Repurposing a dynamic colour** (separator as text, secondary label as a background) — breaks appearance adaptation.
- **Large accent fills** — coloured page backgrounds, full-bleed accent cards, accent-tinted toolbars. macOS keeps chrome neutral; accent is a small spotlight.
- **Colour as the only state cue** (red/green dots with no label/icon) — fails colour-blind users.
- **A custom brand palette substituted for system status hues**, so success/warning/error don't read as native.
- **Over-colouring Liquid Glass** — colouring multiple control backgrounds, or similar colours in control labels over a colourful background (prefer monochromatic toolbars/tab bars there).
- **Pure black text/`#000` at full opacity** for body — macOS primary label is ~85% black in light mode.

## Accessibility

- Honor **Increase Contrast**: system colours shift to far more apparent differences; for custom colours supply an increased-contrast variant with significantly higher differentiation. [HIG]
- Honor **Reduce Transparency**: solidify materials so coloured text on glass keeps its contrast.
- Never convey status/required/error by colour alone — add icon + text. [HIG]
- Test the colour scheme under varied lighting and on different devices/displays (True Tone, P3 vs sRGB); colours look darker/muted in bright light and brighter/saturated in the dark. [HIG]
- Apply colour profiles to images (sRGB is safe everywhere; use Display P3 16-bit for wide-colour displays). [HIG]

## Related

- [typography.md](typography.md) — text colour binds to the label tiers here
- [dark-mode.md](dark-mode.md) — per-appearance authoring of these tokens
- [index.md](index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
