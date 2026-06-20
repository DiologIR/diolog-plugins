---
title: HIG Reference Library — Index (interaction & UX backbone)
role: index
---

# HIG Reference Library — interaction, behaviour & accessibility backbone

A practical, build-oriented distillation of Apple's **Human Interface Guidelines
for macOS** (macOS 26 "Tahoe" / 27 era), mirroring the relevant sections of
the [HIG left sidebar](https://developer.apple.com/design/human-interface-guidelines/).

**In `create-storyboard`, this library is the *interaction* reference, not the
*look* reference.** Read it for how surfaces should **behave, be structured, and
stay accessible** — the layout zones, the master–detail and list/table grammar,
modality and feedback rules, the focus/keyboard model, motion-as-communication,
empty/loading/error/status handling, and the writing conventions. These are
broadly-applicable UX principles that hold regardless of brand skin. The
**visual identity** — palette, type scale, density, shape, material, motion
personality, voice — comes from the **user-supplied `DESIGN.md`**, not from here.
When a file prescribes a macOS-specific *aesthetic* (e.g. a 13pt body, Liquid
Glass material, traffic-light chrome, the system accent colour), treat that as
one platform's answer and **defer to the user's `DESIGN.md`** for the actual look.

**How to use it.** Building or reviewing a surface? Open the files for the
components it uses (e.g. a master–detail screen → `split-views` + `sidebars` +
`lists-and-tables` + `toolbars`). Take the *behaviour and structure* from the
HIG; take the *tokens* (concrete colour/type/material/spacing values) from the
user's `DESIGN.md`.

**Tagging convention.** Inside each file: **`[HIG]`** = Apple's stated guidance ·
**`[macOS 27 UI Kit]`** = a concrete macOS value from a vendored token export
(a *reference number* here — your `DESIGN.md` overrides identity values) ·
**convention / `[secondary]`** = a community-derived default to measure, not
assume (Apple doesn't publish most pixel/blur/timing numbers).

---

## Foundations — the system to build on

| File | What it covers |
|---|---|
| [designing-for-macos.md](designing-for-macos.md) | **Start here.** What makes an app feel native: large multi-windows, the menu bar as the *complete* command surface, drag-and-drop, pointer + keyboard precision, "match the system — don't fake it," fluid adaptation to resize/displays/appearance/a11y. |
| [layout.md](layout.md) | The three-zone window structure (toolbar / sidebar + content / optional bottom bar), the 8pt grid + 4pt subdivisions, layout guides & safe areas, readable content width, macOS control sizing (28/20pt, not iOS's 44pt), window sizing & state restoration. |
| [typography.md](typography.md) | SF Pro / SF Mono / New York; the macOS text-style scale (Body = **13pt**, not iOS 17); dynamic optical sizing; Semibold emphasis; size-specific tracking; never bundle SF — use `-apple-system`. |
| [color.md](color.md) | Dynamic **semantic** colour; the label-tier alphas; the macOS 27 system palette (note blue `#0091FF` dark / `#0088FF` light); bind the accent to `controlAccentColor`; contrast 4.5:1 / 3:1; colour never the sole signal. |
| [dark-mode.md](dark-mode.md) | Author each appearance **independently** (never invert); dark avoids pure black, spreads tonal levels, runs shadows heavier; base-vs-elevated depth; the dark token values. |
| [materials-and-liquid-glass.md](materials-and-liquid-glass.md) | **Liquid Glass**: Regular vs Clear, floating-chrome-only, no glass-on-glass, concentric corners, scroll-edge effect, tint sparingly; the system material ramp + alphas; the a11y solidify/firm/kill-morph responses. |
| [icons-and-sf-symbols.md](icons-and-sf-symbols.md) | SF Symbols (9 weights / 3 scales / 4 rendering modes; variants carry state); app icons (Icon Composer, layered glass, 1024², Mono/Tinted/Clear); the Electron "match-don't-reproduce" note. |
| [motion.md](motion.md) | Motion communicates, not decorates; Liquid Glass morph/materialize; animate transform/opacity (never layout); spring as the default; honour Reduce Motion. |
| [accessibility.md](accessibility.md) | Contrast, macOS control sizing (28/20pt), colour-never-alone, the system-setting → CSS-media-query map (Reduce Motion/Transparency, Increase Contrast), Full Keyboard Access + `:focus-visible`, VoiceOver, Dynamic Type. |
| [writing.md](writing.md) | Capitalization by element type (title vs sentence case), ellipsis rules, consistent terminology, error-message guidance (say the fix), notification copy. |
| [branding.md](branding.md) | Restrained branding *inside* native conventions; don't override system chrome/accent; express via content/accent/voice; app-icon note. |

## Layout & organization

| File | What it covers |
|---|---|
| [split-views.md](split-views.md) | Primary/secondary/tertiary panes; the 1pt divider; drag-to-resize with min/max; collapsible panes with multiple reveal affordances; one title for the whole split view. |
| [sidebars.md](sidebars.md) | The macOS **source list**: full-height, rounded selection highlight, system-font sentence-case section headers (not tracked uppercase), size scaling, expansion tooltips, sidebar vs tab bar, glass behaviour. |
| [lists-and-tables.md](lists-and-tables.md) | List vs table; generous rows with **hover + selection**; sentence-case/secondary column headers (**not** tracked uppercase); sorting, alternating rows, inline rename, keyboard nav. |
| [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md) | Disclosure triangles vs buttons; progressive disclosure; outline views; Finder-style column/browser views; when to use each. |
| [tab-views-and-boxes.md](tab-views-and-boxes.md) | In-window tab views (**not** a toolbar tab bar); boxes for grouping; labels and the four-tier colour hierarchy. |

## Menus & actions

| File | What it covers |
|---|---|
| [the-menu-bar.md](the-menu-bar.md) | The menu bar as the **complete command surface**; standard order; the App menu; Help search; shortcuts as symbols; the #1 thing Electron apps get wrong. |
| [menus-and-context-menus.md](menus-and-context-menus.md) | Ellipsis rules, title case, separators, 1-level submenus, disable-don't-remove, checkmarks; context menus (curated, no shortcut hints); the standard Edit menu. |
| [buttons-and-menu-buttons.md](buttons-and-menu-buttons.md) | One default/prominent button; destructive never default; sizes (capsule at large, macOS 26); verb-first labels; pop-up vs pull-down comparison. |
| [toolbars.md](toolbars.md) | Three regions (leading/center/trailing), ≤3 groups, one trailing primary action, borderless symbols, system overflow, glass toolbar, menu-bar parity; "a toolbar is not a tab bar." |

## Navigation & search

| File | What it covers |
|---|---|
| [sidebars.md](sidebars.md) | *(see Layout)* — the primary macOS navigation surface. |
| [search-and-token-fields.md](search-and-token-fields.md) | Search fields (hint placeholder, not bare "Search"; trailing-toolbar/sidebar-top placement; ⌘F vs the ⌘K product convention); token fields; path controls; tab bars. |

## Presentation & modality

| File | What it covers |
|---|---|
| [windows.md](windows.md) | Window types (Primary/Auxiliary), Key/Main vs Inactive states, traffic-light order, no custom frames, opt-in multi-window, system full-screen, state restoration, concentric corners. |
| [sheets-and-alerts.md](sheets-and-alerts.md) | Sheets (always-modal scoped cards, bottom-trailing dismiss); alerts (≤3 buttons, default-trailing/Cancel-leading, destructive never default, errors → alert, never at launch). |
| [popovers-and-panels.md](popovers-and-panels.md) | Transient arrow-anchored popovers (one at a time, no nesting, detachable); prefer an embedded trailing inspector over floating utility panels. |
| [scroll-views.md](scroll-views.md) | Overlay scrollbars (15/11pt), edge-peek, no nested same-orientation scrolls, content under the glass toolbar with the scroll-edge effect. |
| [modality.md](modality.md) | Use modality only when critical; minimize it; keep flat/brief; one at a time; close affordance in the content view. |

## Selection & input

| File | What it covers |
|---|---|
| [text-fields-and-combo-boxes.md](text-fields-and-combo-boxes.md) | Single/multi-line fields + combo boxes; label title-case+colon; placeholder sentence-case; validate near the field; recessed native look. |
| [toggles-checkboxes-and-steppers.md](toggles-checkboxes-and-steppers.md) | Switch vs checkbox decision; immediate-effect rule; steppers for small precise increments. |
| [segmented-controls-and-sliders.md](segmented-controls-and-sliders.md) | Segmented controls (≤5–7 equal-width, text OR icon, in-view switching — not a tab bar); sliders (continuous vs discrete, snap on release). |
| [pickers-and-wells.md](pickers-and-wells.md) | Pickers for known finite sets (most efficient style); color wells → the system color picker; image wells. |
| [search-and-token-fields.md](search-and-token-fields.md) | *(see Navigation & search)* |

## Status & feedback

| File | What it covers |
|---|---|
| [progress-and-status-indicators.md](progress-and-status-indicators.md) | Determinate (preferred) vs indeterminate; show only > ~1–2s; gauges & ratings; never repurpose Activity Rings; labels as status. |
| [feedback.md](feedback.md) | Immediate feedback for every action; alert vs notification vs inline (errors → alert); badges = unread counts; optimistic UI; toasts/haptics sparingly. |

## Patterns

| File | What it covers |
|---|---|
| [drag-and-drop.md](drag-and-drop.md) | Obvious draggable content; highlighted drop targets; drag image; Finder/cross-app interop; spring-loading; never the only path. |
| [keyboard-and-pointing.md](keyboard-and-pointing.md) | Full Keyboard Access + focus ring; the standard shortcut table; Esc/Return/Space; the **default arrow cursor** (not the web hand); context menus; trackpad gestures. |
| [searching-settings-and-undo.md](searching-settings-and-undo.md) | The searching pattern; the **Settings window** (⌘, — a real window, not an in-app route); undo/redo named in the Edit menu; entering data. |
| [launching-fullscreen-and-onboarding.md](launching-fullscreen-and-onboarding.md) | Restore state / no gratuitous splash; system full screen (⌃⌘F); minimal teach-by-doing onboarding; offering help. |

---

*36 files. Generated from the HIG + the macOS 27 UI Kit; a point-in-time reference,
not an Apple publication — confirm specifics against the macOS you ship on.*
