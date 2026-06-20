---
version: alpha
name: macOS Native — Design System
description: >-
  A clean-room, app-agnostic design system for building desktop apps that feel
  native to macOS 26 (Tahoe). Grounded purely in Apple's Human Interface
  Guidelines and the macOS system values — SF Pro system type, dynamic semantic
  system colour, Liquid Glass materials, real window chrome, native controls, and
  native motion — with no dependency on any specific app's tokens. Concrete
  values (colours, label/fill alphas, separator, materials, type scale, Liquid
  Glass) are lifted from the vendored token export
  apple-macos-27-ui-kit.tokens.json in this folder, tagged [macOS 27 UI Kit];
  remaining render params are [secondary]; behavioural rules are [HIG].
  Frontmatter values are the LIGHT appearance (macOS default); the Colors section
  gives the dark equivalents. NB the kit is a next/unreleased, third-party
  export — a strong reference, but verify against the macOS you ship on.

colors:
  # --- Semantic backgrounds (LIGHT). Map each to its dynamic system colour. ---
  background: "#ececec"          # windowBackgroundColor — the window surface
  background-grouped: "#f2f2f7"  # underPageBackgroundColor — grouped/inset content
  surface: "#ffffff"             # controlBackgroundColor / textBackgroundColor
  surface-raised: "#ffffff"      # cards, popovers, sheets (lifted by shadow)
  # --- Label hierarchy (LIGHT) — Apple's four tiers, expressed as black alpha ---
  # Label tiers — authoritative alphas from the kit (primary is 85% black, NOT
  # 100%); 6 tiers exist (quinary/seximal for faint fills).         [macOS 27 UI Kit]
  label: "rgba(0, 0, 0, 0.85)"            # primary text
  label-secondary: "rgba(0, 0, 0, 0.5)"   # subheads, captions
  label-tertiary: "rgba(0, 0, 0, 0.25)"   # disabled / unavailable
  label-quaternary: "rgba(0, 0, 0, 0.1)"  # watermarks, faint hints
  label-quinary: "rgba(0, 0, 0, 0.05)"    # faintest fill text
  # --- Separators (LIGHT) ---
  separator: "rgba(60, 60, 67, 0.29)"   # #3C3C43 @29% — the macOS separator   [macOS 27 UI Kit]
  separator-opaque: "#c6c6c8"            # opaque divider                       [secondary]
  # --- Fills (LIGHT) — translucent control fills, thick→thin. Dark mode mirrors
  #     these with WHITE at the same alphas.                          [macOS 27 UI Kit]
  fill: "rgba(0, 0, 0, 0.1)"
  fill-secondary: "rgba(0, 0, 0, 0.08)"
  fill-tertiary: "rgba(0, 0, 0, 0.05)"
  fill-quaternary: "rgba(0, 0, 0, 0.03)"
  fill-quinary: "rgba(0, 0, 0, 0.02)"
  # --- Accent (LIGHT) — the default; bind to the user's controlAccentColor ---
  accent: "#0088ff"          # systemBlue (light, macOS 27)    [macOS 27 UI Kit]
  accent-pressed: "#0078f0"  # vibrant "plus darker" on press  [macOS 27 UI Kit]
  # --- System palette (LIGHT) — all 12 macOS 27 hues; tint/status/charts ---  [macOS 27 UI Kit]
  blue: "#0088ff"
  green: "#34c759"
  red: "#ff383c"
  orange: "#ff8d28"
  yellow: "#ffcc00"
  mint: "#00c8b3"
  teal: "#00c3d0"
  cyan: "#00c0e8"
  purple: "#cb30e0"
  pink: "#ff2d55"
  indigo: "#6155f5"
  brown: "#ac7f5e"
  # --- Gray ramp (LIGHT) — systemGray … systemGray6 ---
  gray: "#8e8e93"
  gray-2: "#aeaeb2"
  gray-3: "#c7c7cc"
  gray-4: "#d1d1d6"
  gray-5: "#e5e5ea"
  gray-6: "#f2f2f7"
  # --- Semantic status (alias the system palette; always pair with a label) ---
  success: "{colors.green}"
  warning: "{colors.orange}"
  error: "{colors.red}"
  info: "{colors.blue}"

typography:
  # macOS text styles (NOT iOS — macOS Body is 13pt). Bind to the named system
  # text styles so the OS supplies optical sizing + per-size tracking + leading.
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: -0.02em
  title-1:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: -0.015em
  title-2:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: -0.01em
  title-3:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: "0"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: "0"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0"
  callout:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 15px
    letterSpacing: "0"
  subheadline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 11px
    fontWeight: 400
    lineHeight: 14px
    letterSpacing: "0"
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 13px
    letterSpacing: "0"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text'"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 13px
    letterSpacing: "0"
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0"

spacing:
  # 8pt base grid with 4pt subdivisions.
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

rounded:
  xs: 4px       # small inner controls
  sm: 6px       # buttons, text fields (mini/small/medium = rounded rectangle)
  md: 8px       # cards, list rows
  lg: 12px      # popovers, sheets, grouped containers
  xl: 16px      # window corner (macOS 26, concentric)
  pill: 9999px  # capsule (large controls, chips, switches) — radius = height / 2

# --- Beyond-spec token families (the DESIGN.md spec accepts extra keys) -------
# System materials (LIGHT). The 5-step ramp tint + alphas are authoritative from
# the kit — a single #ECECEC base at rising opacity. Dark mode uses a #2C2C2C
# base at 0.40 / 0.49 / 0.61 / 0.71 / 0.82. Apply blur via backdrop-filter on
# FLOATING CHROME only; content stays opaque. (blur/saturate are render params,
# not in the kit — [secondary], measure against real content.)   [macOS 27 UI Kit]
materials:
  blur: 30px                                # [secondary] render param
  saturate: 180%                            # [secondary] render param
  ultra-thin: "rgba(236, 236, 236, 0.38)"
  thin: "rgba(236, 236, 236, 0.5)"
  regular: "rgba(236, 236, 236, 0.63)"      # the default material
  thick: "rgba(236, 236, 236, 0.76)"
  chrome: "rgba(236, 236, 236, 0.88)"       # = the kit's "Ultra Thick"
  glass-hi: "rgba(255, 255, 255, 0.6)"      # specular top edge (light) [secondary]

elevation:
  # macOS layers a 0.5px edge-shadow with a soft drop shadow. [secondary]
  edge: "0 0 0 0.5px rgba(0, 0, 0, 0.08)"                                  # hairline edge definition
  e-1: "0 0 0 0.5px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)"          # cards / rows
  e-2: "0 0 0 0.5px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.1)"          # dropdowns / popovers
  e-3: "0 0 0 0.5px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.16)"        # sheets / panels
  e-4: "0 0 0 0.5px rgba(0,0,0,0.1), 0 24px 60px rgba(0,0,0,0.28)"         # floating windows

motion:
  # Apple publishes no canonical duration/easing table; spring is the de-facto
  # default for interactive motion. [secondary]
  dur-fast: 150ms     # hover / small state changes
  dur-normal: 250ms   # panels / expansions / popovers
  dur-slow: 400ms     # page-level transitions
  ease-out: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  ease-spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"  # slight overshoot — the macOS "pop"
  ease-smooth: "cubic-bezier(0.4, 0, 0.2, 1)"

zIndex:
  base: 0
  sticky: 50
  popover: 100
  modal: 200
  fullscreen: 300
  toast: 400

components:
  button:
    height: 28px                      # regular size (small/mini are shorter)
    backgroundColor: "{colors.fill-tertiary}"
    textColor: "{colors.label}"
    rounded: "{rounded.sm}"
    padding: 0 12px
    typography: "{typography.body}"
  button-primary:
    height: 28px
    backgroundColor: "{colors.accent}"   # the one default/prominent action
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 0 14px
    typography: "{typography.body}"
  button-large:
    height: 36px
    rounded: "{rounded.pill}"            # large bordered buttons → capsule (macOS 26)
    padding: 0 18px
  input:
    height: 22px                         # macOS text field — compact, recessed
    backgroundColor: "{colors.surface}"
    textColor: "{colors.label}"
    rounded: "{rounded.sm}"
    padding: 0 8px
    typography: "{typography.body}"
  search-field:
    height: 28px
    backgroundColor: "{colors.fill-tertiary}"
    rounded: "{rounded.pill}"
    padding: 0 8px
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  list-row:
    minHeight: 28px                      # generous; 44px interactive target via padding
    rounded: "{rounded.sm}"              # rounded selection highlight (source list)
    padding: 4px 8px
  switch:
    width: 38px
    height: 22px
    rounded: "{rounded.pill}"
  segmented-control:
    height: 28px
    rounded: "{rounded.sm}"
    backgroundColor: "{colors.fill-tertiary}"
  toolbar:
    height: 52px                         # ~50px; doubles as the window drag region
    backgroundColor: "{materials.regular}"
  sidebar:
    width: 220px                         # 200–260px, resizable
    backgroundColor: "{materials.thin}"
---

# macOS Native — Design System

A standalone, app-agnostic design system for building desktop applications that
feel **native to macOS 26 (Tahoe)**. It is derived entirely from Apple's Human
Interface Guidelines and the macOS system values — there is no dependency on any
particular product's tokens, so it can be adopted as-is or used as the baseline
for a brand layer on top.

How to read it:

- **The frontmatter is the machine-readable token set**, authored for the
  **light appearance** (macOS's default). The *Colors* section below gives the
  **dark** equivalents — author each appearance independently, never by inverting.
- **Rules & values are tagged.** **`[HIG]`** = Apple's stated guidance.
  **`[macOS 27 UI Kit]`** = a concrete value lifted from the vendored token
  export (`apple-macos-27-ui-kit.tokens.json`, in this folder) — the
  authoritative source for the colours, label/fill alphas, separator, materials,
  type scale, and Liquid Glass recipes. **`[secondary]`** = a community-derived
  number to treat as a *tunable default* (used only where neither of the above
  covers it; e.g. blur/saturate render params). Apple doesn't publish most
  pixel/blur/timing figures, so for those, **match native control defaults and
  measure**.
- **Caveat on the kit:** it's labelled **macOS *27*** (a next/unreleased
  release) and is a **third-party UI-kit export, not an official Apple spec** —
  so some values look like a forward refresh (e.g. blue `#0088FF`, 6-tier
  labels). Treat it as a strong sourced reference; **verify against the macOS you
  actually ship on**, and don't mistake `[macOS 27 UI Kit]` for `[HIG]`.
- **The cardinal rule: match the system, don't fake it.** `[HIG]` — *"Avoid
  creating custom window UI… don't try to replicate the system-provided
  appearance. Doing so without perfectly matching it can make your app feel
  broken."* Use the real window controls, the real menu bar, the real system
  font, dynamic system colours, and Liquid Glass for floating chrome. Only draw
  custom chrome where the platform genuinely leaves a gap — and then match its
  grammar exactly.

## Overview

A native Mac app is **flexible, powerful, and at home on the desktop** `[HIG]`:
large resizable windows, deep keyboard support, the menu bar as the complete
command surface, multiple windows, drag-and-drop, and pointer precision. It
adapts fluidly to window resizing, multiple displays, light/dark appearance, and
the accessibility modifiers (Reduce Motion / Reduce Transparency / Increase
Contrast).

- **Feel:** calm, precise, deferential to content. The interface recedes; the
  user's work is the star.
- **Density:** desktop, not web. Use the macOS **13pt** body scale and compact
  controls — never drop 16px web body text and web spacing onto the Mac.
- **Restraint:** one accent (the user's system accent), colour only where it
  carries meaning, motion only where it communicates, glass only on floating
  chrome.
- **Anti-patterns:** fake window frames or traffic lights, decorative desktop
  backdrops, neon-on-black "hacker" themes, rainbow gradients, colour as the
  only signal, glass on everything, layout-animating transitions.

**Design for both appearances `[HIG]` `[secondary]`.** Light and dark are
*authored separately*, not inverted. Light mode can collapse similar backgrounds
(ambient light differentiates them); dark mode spreads its levels apart for
separation, **avoids pure black** (uses dark grays), and runs shadows heavier
(~2× opacity) to stay visible. Bind every colour to a semantic, dynamic token so
both appearances — plus Increase Contrast and vibrancy — resolve for free.

## Colors

Use **dynamic, semantic system colours** `[HIG]` that convey *purpose* not
appearance, so they auto-adapt across appearance, contrast, and vibrancy. The
frontmatter holds the light values; the dark equivalents:

**Semantic backgrounds & labels (light / dark)** `[macOS 27 UI Kit]` — label
alphas, separator, and the dark window background are authoritative from the kit
(note **primary label is 85% black, not 100%**, and there are 6 tiers):

| Token | Light | Dark |
|---|---|---|
| `background` (window) | `#ECECEC` | `#1E1E1E` |
| `background-grouped` | `#F2F2F7` | `#1C1C1E` |
| `surface` (control/content) | `#FFFFFF` | `#2C2C2E` |
| `surface-raised` | `#FFFFFF` | `#3A3A3C` |
| `label` | `rgba(0,0,0,0.85)` | `rgba(255,255,255,1)` |
| `label-secondary` | `rgba(0,0,0,0.5)` | `rgba(255,255,255,0.55)` |
| `label-tertiary` | `rgba(0,0,0,0.25)` | `rgba(255,255,255,0.25)` |
| `label-quaternary` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` |
| `label-quinary` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.05)` |
| `separator` | `rgba(60,60,67,0.29)` | `rgba(255,255,255,0.15)` |
| `separator-opaque` | `#C6C6C8` | `#38383A` |
| `fill` → `fill-quinary` | `#000` @ `.1/.08/.05/.03/.02` | `#FFF` @ same |

**System palette (light / dark)** `[macOS 27 UI Kit]` — all 12 hues; for tinting,
status, and charts; never as large background fills. (Note the macOS 27 blue is
`#0088FF`, a step up from the long-standing `#007AFF`.)

| | Light | Dark |
|---|---|---|
| blue (default accent) | `#0088FF` | `#0091FF` |
| green | `#34C759` | `#30D158` |
| red | `#FF383C` | `#FF4245` |
| orange | `#FF8D28` | `#FF9230` |
| yellow | `#FFCC00` | `#FFD600` |
| mint | `#00C8B3` | `#00DAC3` |
| teal | `#00C3D0` | `#00D2E0` |
| cyan | `#00C0E8` | `#3CD3FE` |
| purple | `#CB30E0` | `#DB34F2` |
| pink | `#FF2D55` | `#FF375F` |
| indigo | `#6155F5` | `#6D7CFF` |
| brown | `#AC7F5E` | `#B78A66` |
| gray (base) | `#8E8E93` | `#98989D` |

**Rules.**

- **Bind the accent to the user's choice `[HIG]`.** macOS offers 8 accents +
  Multicolor; pull `controlAccentColor` / CSS `accent-color` rather than
  hardcoding blue. The text-selection highlight is independently user-settable —
  tint `::selection` with the accent.
- **Accent is for emphasis only `[HIG]`:** primary actions, selected states,
  focus rings, toggles. **Never large background areas.** Put colour in the
  *content* layer, not the chrome.
- **Four-tier label hierarchy `[HIG]`:** primary → secondary → tertiary
  (disabled) → quaternary (watermarks). Use the semantic tier, not an arbitrary
  gray.
- **Contrast `[HIG]`:** **4.5:1 normal text, 3:1 large text** (large = ≥18pt
  regular or ≥14pt bold); Apple targets ~7:1 for its own body text. On
  glass/materials use the **vibrant** label/fill colours. Honour Increase
  Contrast.
- **Never colour-as-sole-signal `[HIG]`:** pair every status colour with text,
  shape, or an SF Symbol; underline links.

## Typography

The system font is **SF Pro** (UI sans), **SF Mono** (code), with **New York**
available as a serif. Reference it through the system stack — `-apple-system,
BlinkMacSystemFont, system-ui` — which resolves to **SF Pro Text** at body sizes
and **SF Pro Display** at large sizes automatically. **Never bundle/embed the SF
fonts** `[HIG]` — they're licensed for mocking up Apple-platform UIs only;
referencing the system stack is the correct way to *use* them.

**macOS text styles** `[macOS 27 UI Kit]` (use these, not iOS — macOS Body is
**13pt**, not 17pt; the kit confirms every size/weight/leading below):

| Style | Size (pt) | Weight | Emphasized |
|---|---|---|---|
| Large Title | 26 | Regular | Bold |
| Title 1 | 22 | Regular | Bold |
| Title 2 | 17 | Regular | Bold |
| Title 3 | 15 | Regular | Semibold |
| Headline | 13 | Bold | Heavy |
| **Body** | **13** | Regular | Semibold |
| Callout | 12 | Regular | Semibold |
| Subheadline | 11 | Regular | Semibold |
| Footnote | 10 | Regular | Semibold |
| Caption 1 / 2 | 10 | Regular / Medium | Medium / Semibold |

**Rules `[HIG]`.**

- **Use named text styles**, not hardcoded sizes — the OS supplies optical
  sizing, per-size tracking, and leading, and rescales for accessibility.
- **Don't hand-pick Text vs Display** — SF is a variable font with dynamic
  optical sizing; the crossover (~17–28pt) is automatic.
- **Emphasis is Semibold, not Bold,** for body. Use weight **and** size contrast
  between levels. Avoid Ultralight/Thin/Light for UI text (fails contrast).
- **Tracking is size-specific:** small sizes get looser (positive) tracking,
  large sizes tighter (negative). Don't reuse one tracking value across the
  scale.

## Layout

Lay out on an **8pt base grid with 4pt subdivisions** `[HIG-aligned]` — scale
`4 / 8 / 12 / 16 / 24 / 32 / 48`. Typical rhythm: 8pt between related items, 16pt
between form fields, 24–32pt between sections, 4pt from icon to label.

**Window structure** — the canonical macOS three-zone layout:

- **Top bar / toolbar** (~50–52pt, draggable, holds the title + actions + search).
- **Sidebar** (200–260pt, optional, resizable) **+ content area**.
- Optional **bottom bar** (never put critical actions there — users hide it).

**Rules `[HIG]`.**

- **The content area is the star** — keep the toolbar sparse; default to fewer
  chrome elements.
- **Layout guides + safe areas:** honour standard margins and a *readable content
  width* (long prose ≈ 45–75 chars, not the full window width). Honour safe areas
  (toolbars/sidebars, the notch).
- **Hit targets: 44×44pt minimum**, explicitly including macOS pointer use.
  Visible controls are compact (~22–28pt tall) — reach 44pt with **padding**.
- **Windows resize:** set a real `minSize` (and a sensible max) so layout never
  collapses or stretches unusable; the system restores window size/placement —
  don't fight it.
- **Empty states `[secondary]`:** centred, one icon + one line + one CTA; hide
  filters and secondary UI until there's content; reveal advanced options
  progressively.
- **Grids `[secondary]`:** ~2 columns (small windows) → 3 (medium) → 4–5 (large);
  12–16pt gaps; 16–24pt edge padding; ~8pt card radius.

## Windows & traffic lights

Use the **native window and the real window controls** `[HIG]`. Never draw a
fake window frame or fake traffic lights — *"don't try to replicate the
system-provided appearance."*

- **Window types:** *Primary* (full navigation + content) vs *Auxiliary* (one
  task, no cross-app navigation, close button). Always call it a "window".
- **States:** *Key/Main* windows show **colour** in the traffic lights and
  vibrancy; *Inactive* windows show **gray** lights and **drop vibrancy** — let
  the system render these.
- **Traffic lights:** leading→trailing = **close (red) · minimize (yellow) ·
  zoom/full-screen (green)**, vertically centred. **Disable (dim), don't
  remove** minimize/zoom when unavailable. `[secondary]` active colours red
  `#FF5F57` · yellow `#FEBC2E` · green `#28C840`; gray when inactive. **macOS 26
  increased their size + spacing** — budget extra leading inset for any custom
  title-bar content.
- **Multiple windows `[HIG]`:** good for multitasking, but *"avoid opening new
  windows as default behaviour"* — offer "open in new window" as an opt-in
  command, not the default action.
- **Full screen `[HIG]`:** use the *system* full-screen (green button / View
  menu / ⌃⌘F); always let people choose when to enter it; never programmatically
  resize.
- **macOS 26 window look `[secondary]`:** default corner radius ≈ **16pt**, but
  **concentric, not uniform** — a window with a glass toolbar gets a larger
  radius wrapping the toolbar, and it can change at runtime when a toolbar is
  added/removed. Content scrolls/peeks **under** the floating glass toolbar
  (edge-to-edge). Keep buttons and content off the rounded corner.

## Sidebars & source lists

A macOS sidebar (source list) provides quick navigation to top-level/peer
collections and helps **flatten the hierarchy** (several peer modes visible at
once).

**Rules `[HIG]`.**

- It **extends to the full height of the window** and uses a **rounded-corner
  highlight for the selected item**; **persistently highlight** the current
  selection in any pane that leads to detail.
- **Section headers are the system font** — semibold, secondary colour, sentence
  case — not a tracked uppercase label.
- **Sizes:** row height, text, and glyph scale with the user's sidebar-size
  setting (Small/Medium/Large in General settings) — respect it; Apple publishes
  no fixed per-size heights.
- **Collapse:** sidebars are collapsible — provide **multiple ways to reveal**
  (a toolbar button *and* a menu command with a shortcut).
- **Sidebar vs tab bar:** a sidebar suits deep/hierarchical or many-peer
  navigation but eats horizontal space; prefer a tab bar for flat peer
  navigation in compact space.
- **Truncation:** enable expansion tooltips so hovering a clipped row reveals its
  full label; prefer a centred ellipsis where truncation is forced.
- **Liquid Glass `[HIG]`:** the sidebar is "a pane of glass that floats above the
  window's content." **Large glass (sidebars, menus) adapts but does NOT
  light/dark-flip**; only small glass (navbars, small controls) flips with the
  background.

## Toolbars

A toolbar holds the current view's **title, navigation, and actions** — **not** a
tab bar `[HIG]` (don't put cross-context-switching segmented controls in it).

**Rules `[HIG]`.**

- **Three regions:** *leading* (show/hide-sidebar, back, then title — not
  customizable) · *center* (common controls; auto-collapse into the **system
  overflow menu** as the window narrows — don't build your own overflow) ·
  *trailing* (always-available items, the **search field**, and the **single
  primary action** with a `.prominent` style — trailing items stay visible at all
  widths).
- **Group logically; ≤ 3 groups; only ONE primary action** (trailing side).
- **Prefer borderless system symbols** over text labels; toolbar items have no
  bezel. Insert a fixed space between a text action and a symbol action so they
  don't read as one control.
- **macOS 26 glass toolbar `[HIG]`:** *"reduce the use of toolbar backgrounds and
  tinted controls"* — let the content layer inform the toolbar's appearance; use
  a **scroll edge effect** for separation as content scrolls under the floating
  glass. Standard items have corner radii concentric with the bar.
- **Titles:** give a useful title; **don't title with the app name**; keep it
  under ~15 characters.
- **Menu-bar parity:** every toolbar item must also be a menu-bar command (the
  toolbar is hideable/customizable, so it can't be the only home for any command).
- **Search placement:** conventionally trailing in the toolbar (global) or at the
  top of the sidebar (filtering). Native Find is **⌘F**; a ⌘K command palette is
  a product convention, not an Apple rule.

## Menus & actions

The **menu bar is the complete command surface** `[HIG]`.

**Menu bar.** Order: **Apple → App → File → Edit → View → [app-specific] →
Window → Help** (app-specific menus go between View and Window; Help carries a
search field at its top). Keep this structure regardless of material.

**Menus `[HIG]`.**

- **Ellipsis (…)** only when choosing an item needs more input / opens a dialog
  ("Save As…", "Export…", "Find…") — never on an immediate action ("Save").
- **Capitalization: title case** for menu titles and items.
- **Shortcuts:** assign to frequent items; enable the standard set
  (⌘C/⌘V/⌘X/⌘S/⌘P/⌘N/⌘Z…); show them right-aligned as **symbols** (⌘⌥⌃⇧).
- **Submenus: keep to ONE level.**
- **Disable, don't remove** unavailable items (gray, non-highlighting). Use
  **checkmarks** for the active/selected item; retitle dynamic items (Show/Hide).
- **Separators** group logically related commands.

**Context menus `[HIG]`.** Surface the most-likely commands **for the clicked
item** (not the full set). Most-used first; be ready to reverse order (the menu
may open above or below the cursor). **No keyboard-shortcut hints** in context or
Dock menus. Keep to ~5–9 items.

**Buttons `[HIG]`.**

- **One default (prominent) button** per window/dialog — the recommended action,
  tinted/filled, triggered by Return.
- **Destructive** uses the red destructive role, **never the default**, and pairs
  with confirmation for serious consequences.
- **Labels: title case, verb-first.** Standard sizes are regular / small / mini —
  most UI uses regular.
- `[secondary]` macOS 26 bordered buttons default to a **capsule** shape;
  mini/small/medium keep rounded-rectangle for density.

**Pop-up vs pull-down buttons `[HIG]`.**

| | **Pop-up button** | **Pull-down button** |
|---|---|---|
| Purpose | Choose **one** value/state from mutually-exclusive options | A menu of **actions** related to the button |
| Label | **Updates to show the current selection** | **Static title** |
| Indicator | Double (up/down) chevron | Single downward chevron |

## Inputs & selection

**Search fields `[HIG]`.** Magnifier glyph + clear button + a placeholder that
*hints what's searchable* ("Artists, Songs, Lyrics, and More" — avoid bare
"Search"). Render searchable terms/filters as capsule **tokens**. Favour better
results over a scope bar.

**Text fields `[HIG]`.** Single- or multi-line; a separate label is often
unnecessary when a placeholder is present. **Labels: title case, end with a
colon** ("Email:"). **Placeholders: sentence case, no terminal punctuation.**
Validate and report invalid input *near the field*. macOS fields are compact and
recessed (a subtle inner top shadow reads as "light falls in").

**Toggles `[HIG]`.** Use a **switch** for an emphasized setting or to toggle a
whole group; a **checkbox** for minor/multi-select settings in a list. A toggle
takes **immediate effect** — don't bury an immediate switch inside a Submit-gated
form.

**Segmented controls `[HIG]`.** ≈**5–7 segments max**, **equal width** (use
similar-length labels), each segment **text OR icon, not both**; single- or
multi-choice. macOS 26 gives them a capsule glass look (shape not customizable).
Use for view/option switching within a view — never as a toolbar tab bar.

**Sliders `[HIG]`.** Thumb between min/max; evenly spaced tick marks; discrete
sliders snap to the nearest tick on release. Don't use a slider where precise
numeric entry is required.

**Pickers `[HIG]`.** Scrollable lists of distinct values for a known finite set;
prefer the most efficient style (a calendar grid / direct entry beats a scroll
wheel for far-apart values).

**Color wells `[HIG]`.** Open the **system color picker** (palette, spectrum,
RGB/hex, opacity, swatches) — don't reinvent a custom colour UI.

## Presentation & modality

**Modality `[HIG]`.** Use only when it's critical to get attention, a task must
finish/abort first, or to save data. **Minimize modality.** Keep modals brief,
**no nested hierarchies** ("no app within an app"), **one at a time**; on macOS
the close affordance lives in the modal's content view.

**Sheets `[HIG]`.** On macOS a sheet is **always modal** — a rounded card
floating above its parent — for a scoped task tied to context (avoid for complex
multi-step flows; use a window). One sheet at a time, content-driven size, all
dismiss buttons **bottom-trailing** (Done/OK on the right). Confirm dismissal if
there are unsaved changes.

**Alerts `[HIG]`.** Title + optional message + **max 3 buttons**.
**Default/most-likely action on the trailing (right) side; Cancel on the left**
(default on top when stacked vertically). Destructive uses the destructive style
+ always a Cancel, and is never the default. Reserve alerts for destructive /
irreversible / critical situations. **Errors → an alert, not a notification.**
Specific 1–2-word titles ("Discard Draft?" not "Error"). Never alert on launch.

**Popovers `[HIG]`.** A transient view with an **arrow to its trigger**;
auto-dismisses on outside click. Use for a small amount of info or a few related
tasks — **not** for warnings (use an alert). **One at a time; never
nest/cascade** (only an alert may sit over one). Size to contents; never
full-screen. Save the user's work if a nonmodal popover auto-closes. macOS
popovers can be **detachable** (drag off → floating panel).

**Panels & inspectors `[HIG]`.** Prefer an **embedded inspector on the trailing
side of a split view** over a floating utility panel; disable inspector controls
when nothing is selected.

**Scroll views `[HIG]`.** Translucent **overlay** scrollbars that appear after
scrolling. Make scrollability apparent (peek edge content); **don't nest
same-orientation scroll views**. `[secondary]` scrollbar width 15pt regular /
11pt small. **macOS 26 scroll edge effect:** a gradient/blur where content meets
chrome so floating titles/toolbars stay legible as content scrolls under them —
styles `automatic` / `hard` (sharp line, typical for Mac toolbars) / `soft`
(diffused, immersive content).

## Elevation & Depth

Depth comes from **shadow + a translucent edge**, not heavy borders. macOS
layers a **`0 0 0 0.5px` edge-shadow** with a soft drop shadow so surfaces read
as lifted without a visible outline `[secondary]`. Dark mode runs shadows heavier
than light (~2× opacity).

- `{elevation.e-1}` cards / list rows · `{elevation.e-2}` dropdowns / popovers ·
  `{elevation.e-3}` sheets / panels · `{elevation.e-4}` floating windows.
- **Z-layers** are tokenised — stacked chrome must use them: `{zIndex.popover}`
  (100) < `{zIndex.modal}` (200) < `{zIndex.fullscreen}` (300) <
  `{zIndex.toast}` (400). (Apple doesn't define a z-scale; this is a practical
  ordering.)

### Liquid Glass materials (macOS 26)

Floating chrome is a **translucent material** — a tinted base over a blurred +
**saturated** backdrop, with a bright specular top edge and a hairline:

```css
background: var(--material-regular);          /* e.g. rgba(246,246,246,0.72) */
backdrop-filter: saturate(180%) blur(30px);   /* saturate prevents washout */
box-shadow: inset 0 1px 0 var(--glass-hi);    /* specular top edge */
```

The system material ramp runs **ultraThin → thin → regular (default) → thick →
ultraThick** — thicker = more contrast/separation, thinner = more background
shows through. Authoritative fills (`[macOS 27 UI Kit]`): **light** is a single
`#ECECEC` base at **0.38 / 0.5 / 0.63 / 0.76 / 0.88**; **dark** a `#2C2C2C` base
at **0.40 / 0.49 / 0.61 / 0.71 / 0.82**. The real **Liquid Glass** elements
(Dock, Menus, Notification, Regular Small→Large) are *multi-layer* fills with a
dedicated shadow stack (incl. the ±0.5px inner specular edges) — see the kit's
`Liquid Glass` group rather than approximating them by hand.

**Liquid Glass rules `[HIG]` (WWDC25 "Meet Liquid Glass").**

- **Glass is for the floating navigation/control layer only** — toolbars,
  sidebars, tab bars, menus, popovers, sheets, alerts, inspectors. **Never on the
  content layer** (lists, tables, media, scrolling/reading areas), full-screen
  backgrounds, scroll areas, or *every* element. Put colour in the content layer.
- **No glass on glass.** One glass surface per region; render on-glass controls
  with **fills / transparency / vibrancy**, not nested `backdrop-filter` layers.
- **Two variants, never mixed:** **Regular** (default — fully adaptive,
  guaranteed legibility, use almost everywhere) vs **Clear** (permanently more
  transparent, needs an explicit dimming layer, only for small controls over
  bold/bright media-rich content). **Default to Regular; treat Clear as
  specialised.**
- **Tint sparingly — only the one primary action.** *"When every element is
  tinted, nothing stands out."*
- **Concentricity:** glass controls nest into their container's rounded corners —
  **capsule radius = ½ container height**; **child radius = parent radius −
  padding** (shared centre).
- The system handles dark mode per-layer automatically — no manual override.

**Accessibility is non-negotiable** `[HIG]`: under **Reduce Transparency** make
glass frostier/opaque and drop the blur; under **Increase Contrast** firm the
hairlines; under **Reduce Motion** disable glass morph/elastic. `[secondary]`
render params to *measure* (the kit gives fills, not blur): `blur(~30px)
saturate(~180%)`; aim ~4.5:1 text-on-glass.

## Shapes

Corners are soft and **concentric**. Scale: `{rounded.xs}` (4px small inner
controls), `{rounded.sm}` (6px buttons/fields), `{rounded.md}` (8px cards/rows),
`{rounded.lg}` (12px popovers/sheets/grouped containers), `{rounded.xl}` (16px
window, concentric), `{rounded.pill}` (capsule).

**Rules `[HIG]`.** Maintain **concentric corners** — a control nested in a
container shares its centre, so `childRadius = parentRadius − padding`; a fully
rounded control is a **capsule** whose `radius = height / 2`. macOS control
shapes scale by size: **mini/small/medium = rounded rectangle** (density),
**large = capsule**. Match these so nested glass controls hug their container's
rounding.

## Components

Generic, HIG-aligned control contracts (sizes are *visible* heights; reach the
44pt interactive target with padding):

- **Buttons** — regular height ~28pt, `{rounded.sm}`; **large bordered → capsule**
  (macOS 26). One **prominent** default per window (tinted/filled, Return-trigger);
  destructive is red and never the default. Title-case verb-first labels. Default
  cursor (not pointer).
- **Text fields** — compact (~22pt), `surface` fill, recessed inner shadow;
  focus shows the accent ring. Search fields are capsule with a magnifier + clear.
- **Cards** — `surface-raised` + `{rounded.md}` + `{elevation.e-1}` + the 0.5px
  edge; no heavy border.
- **List rows** — generous min-height, **rounded selection highlight**, persistent
  selection state, hover feedback.
- **Switches & checkboxes** — switch (~38×22 capsule) for emphasized/group
  settings, checkbox for minor/multi-select; both take immediate effect.
- **Segmented controls** — ≤5–7 equal-width segments, text OR icon; selected
  segment lifts.
- **Chips/tokens & badges** — capsule; badges = **unread counts only**.
- **Status dots** — colour **plus** a label; a slow opacity pulse for "alive".

## Status & feedback

- **Progress `[HIG]`:** prefer a **determinate** indicator (bar / clockwise
  circle) for known durations; an **indeterminate** spinner only for
  unquantifiable work — and **keep it moving**. Show one only for operations over
  ~1–2s; switch indeterminate→determinate once the duration is known; **don't
  switch circular↔bar mid-operation**; pair long ops with Cancel.
- **Never repurpose Activity Rings `[HIG]`** — they're reserved for Fitness data.
  Build a distinct ring for any other gauge.
- **Labels `[HIG]`:** static, readable, **copyable**, not editable; make useful
  text (errors, IDs) **selectable**; use the 4-tier colour hierarchy.
- **Notifications `[HIG]`:** **errors → an alert, NOT a notification.** Title:
  short, title case, **no ending punctuation**; body: succinct, sentence case;
  omit the app name/icon (the system adds them); up to 4 short action buttons.
  **Badges = unread counts only** — clear when read; never fake one or rely on it
  alone.

## Icons & SF Symbols

Use **SF Symbols** for glyphs `[HIG]` — they integrate with SF Pro, baseline-
align with text, and respond to Dynamic Type + accessibility.

- **9 weights / 3 scales / 4 rendering modes** (monochrome · hierarchical ·
  palette · multicolor). **Match symbol weight to adjacent text weight**; use
  **scale, not weight,** to change emphasis. `[secondary]` default ~16px (20px
  prominent, 12px hints), monoline ~1.5–2px, `currentColor`.
- **Variants carry state:** outline (default), **fill**, **slash**
  (off/disabled), enclosed, badged — change the variant rather than recolouring.
- **macOS 26 / SF Symbols 7:** optional **gradient from a single source colour**
  and Draw animations.
- **App icon `[secondary]`:** macOS 26 icons are layered Liquid Glass with
  specular highlights, authored in **Icon Composer** (Default / Dark / Mono; the
  system derives Tinted/Clear) on a 1024×1024 canvas — don't bake fake gloss, and
  stay legible in Mono/Tinted.
- **Non-AppKit note:** you can't render true SF Symbols outside AppKit. To
  *match*, align icon weight to text weight, ship outline/fill/slash variants,
  support a hierarchical multi-opacity tint, and use `currentColor` so glyphs
  inherit the row's text colour (active = accent).

## Motion

Motion **communicates, it doesn't decorate** `[HIG]` — convey hierarchy and
continuity (morph, don't cut), keep it brief and **interruptible**, and never
block the user. **Animate transform and opacity only — never layout properties**
(width/height/top/left).

- **Durations `[secondary]`:** `{motion.dur-fast}` (150ms, hover/state) ·
  `{motion.dur-normal}` (250ms, panels/popovers) · `{motion.dur-slow}` (400ms,
  page transitions). Apple publishes no canonical table; spring is the de-facto
  default for interactive motion.
- **Easing:** `{motion.ease-out}` for entrances, `{motion.ease-smooth}` for state
  changes, `{motion.ease-spring}` (a slight overshoot) for the macOS "pop".
- **Liquid Glass motion `[HIG]`:** prefer **morph / materialization** (modulate
  the lensing/blur) over hard fades; lensing + specular highlights respond to
  motion.
- **Reduce Motion `[HIG]`:** replace slides/zooms/parallax with **cross-fades**;
  disable parallax/spring/elastic and glass morph; no autoplay/loop. Honour
  `prefers-reduced-motion`.

## Voice & UI copy

Plain, direct, second person. **Capitalization by element type `[HIG]`:** menu
titles/items and buttons use **title case** (verb-first for buttons); checkboxes,
radio buttons, help text, and box titles use **sentence case**. Prefer verbs over
nouns in actions. Use **ellipsis (…)** on any control that opens another view or
needs more input.

**Error messages `[HIG]`:** place them near the problem, don't blame the user,
and **say how to fix it** ("Choose a password with at least 8 characters" beats
"That password is too short"); prevent errors with good defaults + inline
validation.

## Accessibility

- **Focus `[HIG]`:** every task keyboard-reachable (Full Keyboard Access), in a
  logical order, with a **visible focus indicator** (~2pt accent ring) — only on
  keyboard focus, not pointer focus.
- **Honour system settings `[HIG]`:** **Reduce Motion** (`prefers-reduced-motion`
  — kill glass morph too), **Reduce Transparency** (`prefers-reduced-transparency`
  — solidify glass), **Increase Contrast** (`prefers-contrast: more` — firm
  hairlines), Differentiate Without Color, Bold Text.
- **Contrast `[HIG]`:** ≥ **4.5:1** body, ≥ **3:1** large/UI. Avoid
  Ultralight/Thin/Light.
- **Colour is never the sole signal `[HIG]`:** carry meaning with colour **and** a
  label or symbol; underline links.
- **Hit targets `[HIG]`:** ≥ **44×44pt** incl. pointer use.
- **VoiceOver `[HIG]`:** meaningful labels and correct traits on all interactive
  elements; prefer standard components.
- **macOS conventions:** **default cursor** (not pointer) on buttons; chrome is
  `user-select: none` while content stays selectable; slim overlay scrollbars;
  accent-tinted `::selection`.

## The hard HIG numbers (quick reference)

The few values Apple actually states `[HIG]` (everything else is adaptive —
match native control defaults, don't invent a figure):

| Rule | Value |
|---|---|
| Minimum hit target | **44×44pt** (incl. macOS pointer) |
| Text contrast (normal / large) | **4.5:1 / 3:1** (large = ≥18pt or ≥14pt bold) |
| Max alert buttons | **3** |
| Max notification action buttons | **4** |
| Split-view divider | **1pt** |
| Scrollbar width (regular / small) | **15pt / 11pt** |
| Window title length | **< ~15 characters** |
| Toolbar groups | **≤ 3** |
| Segmented-control segments | **≤ 5–7** |
| Menu submenu depth | **1 level** |
| SF Symbols | **9 weights / 3 scales / 4 rendering modes** |
| App-icon master canvas | **1024×1024px** |
| Spacing grid | **8pt base / 4pt subdivisions** |
| Body text size | **13pt** (macOS, not iOS 17pt) |
| Window corner radius (macOS 26) | **≈16pt, concentric** `[secondary]` |
| Capsule radius | **= height / 2** |
| Concentric child radius | **= parent radius − padding** |

## Native-feel checklist (do before shipping a surface)

1. **Real chrome:** real window controls + native title bar; no fake frame,
   fake traffic lights, or decorative desktop backdrop.
2. **System font:** `-apple-system` stack; macOS 13pt body scale; Semibold (not
   Bold) emphasis; no bundled SF fonts.
3. **Dynamic colour:** semantic tokens, both appearances authored independently;
   map the accent to the user's system accent; status colour + label, never
   colour alone.
4. **Glass only on chrome:** Regular variant; no glass on content/backgrounds/
   scroll areas; no glass on glass; tint only the one primary action; concentric
   corners; opaque under Reduce Transparency.
5. **One default action; one sheet/popover/alert/modal at a time;** alert ≤ 3
   buttons, default trailing / Cancel leading; destructive never default.
6. **Toolbar:** ≤ 3 groups, one trailing primary action, borderless symbols, a
   useful (non-app-name) title, scroll-edge separation; every item also a menu
   command.
7. **Sidebar:** full-height source list, persistent rounded selection,
   system-font section headers, collapsible with a shortcut, expansion tooltips.
8. **Keyboard + focus:** standard shortcuts (⌘N/F/W/S/Z/,…), Esc dismisses,
   Return confirms, a visible focus ring, logical tab order; every command in the
   menu bar.
9. **Motion:** transform/opacity only, ~150/250/400ms with the spring on
   entrances, collapsed under Reduce Motion.
10. **Accessibility:** ≥44pt targets, 4.5:1 / 3:1 contrast; verify under Reduce
    Transparency / Increase Contrast / Reduce Motion / dark + light.

## Do's and Don'ts

**Do**

- Match the system: real chrome, the system font, dynamic semantic colour,
  Liquid Glass for floating chrome, native menus/sheets/popovers/controls.
- Author light and dark independently; bind the accent to the user's choice.
- Use the macOS 13pt body scale and the 8pt grid; reach 44pt hit targets with
  padding; give every command a menu-bar home and a shortcut.
- Keep one prominent action per view; pair status colour with a label or symbol.
- Animate transform/opacity with the motion tokens; respect Reduce Motion,
  Reduce Transparency, and Increase Contrast.

**Don't**

- Fake window chrome or traffic lights; add a nested app-window frame or a
  decorative desktop backdrop.
- Hardcode a non-adapting colour, override the user's accent, or use colour as
  the only state cue.
- Put glass on content, backgrounds, scroll areas, or on glass; tint every
  element; nest popovers; stack two filled buttons; make a destructive action the
  default.
- Drop web density or 16px web body text onto the desktop; animate layout
  properties; show an error as a notification (use an alert); repurpose Activity
  Rings; bundle the SF fonts.
