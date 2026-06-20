---
title: Typography
hig: https://developer.apple.com/design/human-interface-guidelines/typography
role: foundation
---

# Typography (macOS)

**Purpose.** Establish a single, system-native type system so the app reads as a real Mac app: one font family (SF Pro) at platform-correct sizes, the system's named text styles, and the weights/tracking AppKit renders. Apple frames typography as the tool that displays legible text, conveys an information hierarchy, communicates important content, and expresses your style. Getting the base size right is the highest-leverage native-feel fix.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/typography

## Key principles

- **Ensure legibility — follow the per-platform default & minimum sizes.** [HIG] People read at various distances and conditions; honour the recommended default and minimum for each platform, for custom *and* system fonts. On **macOS the default is 13pt and the minimum is 10pt** [HIG] (iOS/iPadOS default is 17pt — don't copy it onto the Mac). A thin custom weight needs to go larger than the recommendation to stay legible.
- **Avoid light font weights.** [HIG] With system fonts prefer Regular, Medium, Semibold, or Bold; avoid Ultralight, Thin, and Light, which are hard to see — especially at small sizes.
- **Convey hierarchy with weight, size, and colour.** [HIG] Adjust these to emphasise important information; keep the relative hierarchy and visual distinction when people change text size.
- **Minimise the number of typefaces.** [HIG] Mixing too many obscures hierarchy, hurts readability, and makes the interface feel inconsistent — even in a highly customised UI.
- **Use the system fonts; don't embed them.** [HIG] Apple ships SF (San Francisco — SF Pro/SF Compact/SF Mono + script variants) and New York (serif). Access them through the system font APIs / `Font.Design`; "don't embed system fonts in your app or game."
- **Prefer the built-in text styles.** [HIG] The system-defined styles (Body, Headline, Title2, …) give a consistent way to express hierarchy through size and weight, and carry accessibility scaling where the platform supports it. Modify them only via symbolic traits (e.g. the bold trait, leading adjustments) when needed.

## Metrics & values

macOS built-in text styles — SF Pro [HIG values, confirmed against the macOS table; weights/sizes also match the macOS 27 UI Kit]:

| Style | Size (pt) | Default weight | Line height (pt) | Emphasized weight |
|---|---|---|---|---|
| Large Title | 26 | Regular | 32 | Bold |
| Title 1 | 22 | Regular | 26 | Bold |
| Title 2 | 17 | Regular | 22 | Bold |
| Title 3 | 15 | Regular | 20 | Semibold |
| Headline | 13 | **Bold** | 16 | Heavy |
| Body | 13 | Regular | 16 | Semibold |
| Callout | 12 | Regular | 15 | Semibold |
| Subheadline | 11 | Regular | 14 | Semibold |
| Footnote | 10 | Regular | 13 | Semibold |
| Caption 1 | 10 | Regular | 13 | Medium |
| Caption 2 | 10 | Medium | 13 | Semibold |

- **Body = 13pt** [HIG] — the macOS default; explicitly *not* the iOS 17pt Body.
- **Emphasis = symbolic trait, not a hand-picked weight.** [HIG] Apply the bold trait (SwiftUI `bold()`, UIKit `traitBold`); emphasized weights are medium/semibold/bold/heavy as the table gives them (e.g. Body → Semibold, Headline → Heavy).
- **Tracking is dynamic and per-size.** [HIG] In a running app the system adjusts tracking at every point size automatically. You only set tracking in static *mockups* — and then per Apple's per-size Tracking table (e.g. macOS SF Pro: 10pt +0.12pt, 12pt 0.0, 13pt −0.08pt, 17pt −0.43pt). Never apply one global letter-spacing value.
- **Optical sizing is automatic.** [HIG] The variable system fonts use *dynamic* optical sizes that merge discrete Text/Display variants into one continuous design interpolated to the point size — you don't pick "SF Pro Display" vs "SF Pro Text" unless a design tool forces it.
- **Monospace digits** for tables/timers: SF Mono or SF Pro's tabular figures so numbers don't jitter (`font-variant-numeric: tabular-nums`).

## Native macOS conventions

- **SF Pro is the system font on macOS; NY is available via Mac Catalyst.** [HIG] **macOS does not support Dynamic Type** [HIG] — text doesn't scale to a user text-size setting the way iOS does, so accessibility scaling is not part of the Mac type model.
- **Match standard controls with dynamic system font variants.** [HIG] To look consistent with other Mac apps, use the AppKit variants for the right context: `controlContentFont`, `labelFont`, `menuFont`, `menuBarFont`, `messageFont`, `paletteFont`, `titleBarFont`, `toolTipsFont`, `userFont` (document), `userFixedPitchFont` (monospaced document), `systemFont`, `boldSystemFont`.
- CSS stack: `font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;` for UI; `ui-monospace, "SF Mono", monospace;` for code; `ui-serif, "New York", Georgia, serif;` for editorial serif. Baseline `font-size: 13px`; derive other roles from the table above, not from an invented modular scale.
- `-webkit-font-smoothing: antialiased;` on `body` matches AppKit (already set in this app's `theme.css`).
- Map CSS classes to the *named* styles (`.text-body`, `.text-headline`, `.text-title2`) so one table drives the system.
- Sentence case for almost everything (titles, buttons, menus); reserve Title Case for proper nouns and a few menu titles.

## Common non-native mistakes

- **Embedding the SF / San Francisco font files** instead of using the system font APIs (`-apple-system`) — Apple explicitly says don't embed system fonts.
- **Using iOS sizes on the Mac** (17pt Body, larger titles). macOS Body is 13pt, minimum 10pt.
- **Bolding everything for emphasis** instead of applying the bold symbolic trait per the style; or using Ultralight/Thin/Light for "elegance" (illegible at small sizes).
- **One global `letter-spacing`** across all sizes — Apple's tracking is per-size and applied dynamically by the running system.
- **Hand-picking "SF Pro Display" vs "SF Pro Text"** instead of letting dynamic optical sizing resolve by point size.
- **A from-scratch modular type scale** instead of the platform's actual style sizes.
- **Mixing many typefaces** — obscures hierarchy and reads as inconsistent.

## Accessibility

- **macOS has no Dynamic Type**, but legibility still rules: respect the 10pt minimum, avoid light weights, and keep contrast high. [HIG]
- Maintain Apple's text-contrast minimums: **4.5:1** for normal text, **3:1** for large/bold text. [HIG] Footnote/Caption over vibrancy/glass must stay legible — firm up the backing or weight when contrast is requested.
- Respect `prefers-reduced-transparency` / `prefers-contrast`.
- Maintain the relative hierarchy and visual distinction of text elements; prioritise important content. [HIG]

## Related

- [color.md](color.md) — semantic colour & label tiers that text colour binds to
- [dark-mode.md](dark-mode.md) — per-appearance authoring of text/label colours
- [index.md](index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
