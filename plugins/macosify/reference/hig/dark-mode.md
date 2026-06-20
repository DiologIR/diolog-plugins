---
title: Dark Mode
hig: https://developer.apple.com/design/human-interface-guidelines/dark-mode
role: foundation
---

# Dark Mode (macOS)

**Purpose.** Treat Dark Mode as a systemwide appearance people often choose as their default — and expect every app to respect. Apple: in Dark Mode "the system uses a dark color palette for all screens, views, menus, and controls, and may also use greater perceptual contrast to make foreground content stand out against the darker backgrounds." Authored with semantic colours, most of it is automatic.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/dark-mode

## Key principles

- **Don't offer an app-specific appearance setting.** [HIG] It's extra work for people and may look broken when the app ignores their systemwide choice. Follow the system appearance.
- **Look good in both modes — including Auto.** [HIG] People can pick Auto, which switches light↔dark as conditions change *while your app is running*; ensure both appearances work.
- **Dark colours aren't simple inversions.** [HIG] "It's important to realize that these colors aren't necessarily inversions of their light counterparts: while many colors are inverted, some are not." Author dark values; don't negate the light theme.
- **Embrace colours that adapt.** [HIG] Semantic colours (`labelColor`, `controlColor` on macOS; `separator` on iOS) adapt to the current appearance automatically. For a custom colour, add a Color Set with bright + dim variants; avoid hard-coded values that don't adapt.
- **Aim for sufficient contrast in all appearances.** [HIG] Minimum **4.5:1** between foreground and background; for custom foreground/background pairs strive for **7:1, especially in small text**.
- **Use SF Symbols and system views.** [HIG] Symbols adapt to Dark Mode automatically (with dynamic colours or vibrancy); system text fields/views make text look right with or without vibrancy — prefer them to drawing text yourself.
- **Soften white backgrounds.** [HIG] If a content image has a white background, slightly darken it so it doesn't glow in the surrounding dark context.

## Metrics & values

Dark appearance values [macOS 27 UI Kit — reference for an unreleased OS; verify before shipping]:

- **Window background** #1E1E1E (light counterpart #FFFFFF).
- **Material/elevated base** ≈ #2C2C2C — the brighter background for foreground/elevated surfaces. Convention for this app's graphite chrome: sidebar #1A1F1F, toolbar #23282C.
- **Labels (white @ alpha):** primary 1.0 / secondary 0.55 / tertiary 0.25 / quaternary 0.10 / quinary 0.05 / seximal 0.03. (Light is `#000` @ 0.85/0.50/0.25/0.10/0.05/0.03 — dark primary is full-opacity white, light primary is 85% black.)
- **systemGray** base #98989D (dark) vs #8E8E93 (light).
- **System palette** runs *slightly brighter* in dark (blue #0091FF vs #0088FF, green #30D158 vs #34C759, red #FF4245 vs #FF383C) to hold contrast on the dark window. Full table in [color.md](color.md).
- **Separator** #3C3C43 @ 0.29 (same token, reads as a light hairline on dark).
- **Contrast targets** [HIG]: 4.5:1 minimum; 7:1 for custom small text.

> The **base vs elevated** depth model (dimmer base recedes, brighter elevated advances for popovers/sheets/foreground windows) is documented by Apple under **iOS/iPadOS**. macOS conveys layering primarily through its own dynamic backgrounds + desktop tinting (below); apply the base→elevated *idea* (lighten foreground surfaces, never darken them) as a cross-platform convention, not a macOS-specified rule.

## Native macOS conventions

- **Desktop tinting (graphite accent).** [HIG] When the user chooses the **graphite** accent in General settings, macOS makes window backgrounds pick up colour from the current desktop picture — a subtle effect that blends windows with their surroundings.
- **Add transparency to custom backgrounds when appropriate.** [HIG] Transparency lets custom components pick up the window-background colour when desktop tinting is active, keeping visual harmony as the desktop picture changes. Add it only to a custom component that has a visible background/bezel, and only in a *neutral* state — not when the component is in a coloured state (its colour would fluctuate as the background shifts).
- Use the macOS dynamic system colours so light↔dark is automatic (`labelColor`, `controlColor`, `windowBackgroundColor`, `separatorColor`, …); see [color.md](color.md).
- Drive appearance with a single root attribute / media query: `@media (prefers-color-scheme: dark)` and/or `[data-theme="dark"]`; redefine the semantic tokens there, not the components. This app's `theme-store` toggles `data-theme`.
- Liquid Glass / vibrancy chrome uses the dark material tokens with a specular top edge; content layers stay opaque (this app: glass for floating chrome, opaque `--chrome-*` for primary chrome).
- No pure black — macOS dark uses dark grays (#1E1E1E window) so depth and shadows stay visible.
- **Dark-only is rare but valid.** [HIG] An immersive media app may use a permanently dark appearance so the UI recedes (Stocks does). Don't do it just for style.

## Common non-native mistakes

- **Offering an in-app light/dark toggle** that ignores the system setting (Apple says don't), or **forcing one appearance** without an immersive-media reason.
- **Inverting the light theme** (`filter: invert()`, colour negation) instead of authoring dark values — some colours are *not* inversions.
- **Hardcoded light-only colours** that don't flip, leaving stranded white panels or black-on-dark text.
- **Pure black backgrounds (`#000`)** — kills depth and hides shadows; macOS dark is #1E1E1E and grays.
- **Adding transparency to a coloured-state component**, causing its colour to fluctuate under desktop tinting.
- **White-background content images that glow** in dark context (darken them slightly).
- **Only testing default dark** — skipping Increase Contrast + Reduce Transparency (separately and together), where dark text on dark backgrounds can drop below legible contrast.

## Accessibility

- Test **both appearances** plus **Increase Contrast** and **Reduce Transparency**, separately and together. [HIG] Increase Contrast in Dark Mode can *reduce* the visible contrast between dark text and a dark background — verify legibility there specifically.
- Keep ≥ 4.5:1 (custom small text 7:1); using system-defined colours helps achieve a good ratio. [HIG]
- SF Symbols + system views adapt automatically — prefer them over hand-drawn equivalents. [HIG]
- Design separate light/dark interface icons where one asset doesn't read in both (e.g. a moon icon that needs a dark outline on light backgrounds). [HIG]
- **Dark Mode is supported on iOS/iPadOS/macOS/tvOS only — not visionOS or watchOS.** [HIG] No additional considerations for tvOS.

## Related

- [color.md](color.md) — the semantic tokens & palette that adapt per appearance
- [typography.md](typography.md) — label colours/weights across appearances
- [index.md](index.md)
- [../DESIGN.md](../DESIGN.md)
