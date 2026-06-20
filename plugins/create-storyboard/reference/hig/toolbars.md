---
title: Toolbars
hig: toolbars
role: menus
---
# Toolbars (macOS)

**Purpose.** Apple: "A toolbar provides convenient access to frequently used commands, controls, navigation, and search" — one or more sets of controls arranged horizontally and "grouped into logical sections." In a macOS app it resides in the frame at the top of a window, below or integrated with the title bar. Two rules dominate: **a toolbar is not a tab bar** ("a tab bar is specifically for navigating between areas of an app"), and **every toolbar item must also be a menu-bar command**.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/toolbars

## When to use

Use a toolbar for the handful of commands people reach for constantly in a window — it carries the **view title**, **navigation controls + search**, and **actions/bar items**. Choose items deliberately to avoid overcrowding; keep it curated. It complements the menu bar — and because people can customize or hide it, it can't be the only place a command lives.

## Anatomy — three item groupings (leading → trailing) [HIG]

1. **Leading edge (not customizable).** The elements that must always be reachable: **return-to-previous / show-or-hide sidebar**, then the **view title**, then an optional **document menu** (Duplicate, Rename, Move, Export… for the document as a whole). Pinned so they're always available.
2. **Center area (customizable, collapsible).** "Common, useful controls." On macOS/iPadOS people can add/remove/rearrange these (if you allow customization), and they **automatically collapse into the system-managed overflow menu when the window shrinks**.
3. **Trailing edge (always visible).** Important items that must stay put, **inspector** toggles, an optional **search field**, the **More menu** (overflow + customization), and the **one primary action** (e.g. *Done*) when one exists. These remain visible at all window sizes.

Position items by pinning them to leading/center/trailing and inserting space between them.

## Behavior & states

- **The system manages overflow.** "The system automatically adds an overflow menu in macOS or iPadOS when items no longer fit. **Don't add an overflow menu manually**, and avoid layouts that cause toolbar items to overflow by default." Add a **More menu** only for genuinely lower-priority actions; try to fit everything otherwise. [HIG]
- **Reduce toolbar backgrounds and tinted controls** (macOS 26 / Liquid Glass). Custom backgrounds "might overlay or interfere with background effects that the system provides." Let the content layer inform the toolbar's colour, and use a **ScrollEdgeEffectStyle** to distinguish the toolbar area from content. Avoid colouring item labels like the content layer's background; prefer the default **monochromatic** appearance. [HIG]
- Items show normal / hover / pressed / **disabled** (disable, don't remove, so layout stays stable) / focused states; standard components have **corner radii concentric with the bar's corners**. [HIG]
- Consider **temporarily hiding the toolbar** for a distraction-free view — contextually, with a reliable way to restore it. [HIG]
- Customize via Right-click ▸ *Customize Toolbar…* (center region only). [HIG]

## Metrics & layout

- **Aim for a maximum of three groups.** "Too many groups of controls can make a toolbar feel cluttered and confusing… In general, aim for a maximum of three." Group by **function and frequency of use**. [HIG]
- **Exactly one primary action**, styled **`.prominent`** (Done/Submit), on the **trailing** side — "Only specify one primary action, and put it on the trailing side of the toolbar." [HIG]
- **Title < 15 characters; never the app name.** "Don't title windows with your app name… keep the title under 15 characters long." You may leave the title empty if it'd be redundant. [HIG]
- **Hit region ≥ 44×44 pt** — pad compact toolbar glyphs to reach it. [HIG]
- **Default arrow cursor** on toolbar controls. [HIG era]
- **Keep text-labelled actions separate.** Placing a text action next to a symbol action "can create the illusion of a single action"; insert fixed space between them. [HIG]
- Prefer **system-provided symbols without borders** (the section already provides a visible container); use text for actions a symbol can't represent (e.g. *Edit*). [HIG]

## Native macOS conventions

- AppKit `NSToolbar` (`NSToolbarItem`, identifiers, customization) or SwiftUI `.toolbar { ToolbarItem(placement:) }` (`.navigation`/`.principal`/`.primaryAction`) — these map items to the leading/center/trailing regions and give system overflow + customization for free.
- **Menu-bar parity:** "Make every toolbar item available as a command in the menu bar. Because people can customize the toolbar or hide it, it can't be the only place that presents a command. In contrast, it doesn't make sense to provide a toolbar item for every menu item." See [the-menu-bar.md](the-menu-bar.md). [HIG]
- **Use the standard Back and Close buttons / symbols** — don't relabel them "Back"/"Close." [HIG]
- The toolbar lives in the title-bar region with the **real traffic lights** at the leading edge (`titleBarStyle: hiddenInset` in Electron) — toolbar items "don't include a bezel"; window titles can display inline with controls. Never hand-draw a toolbar over fake chrome. [HIG]
- Pop-up/pull-down buttons in a toolbar follow [buttons-and-menu-buttons.md](buttons-and-menu-buttons.md).
- Search lives as a **trailing search field**; bind ⌘F / the View or Edit ▸ Find command to it.

## Common non-native mistakes

- **A toolbar item with no menu-bar equivalent** — the action exists only on the toolbar, so keyboard/assistive/customizing users can't reach it.
- **Building your own overflow/hamburger** instead of the system overflow ("don't add an overflow menu manually").
- **Using the toolbar as a tab bar** — cross-context view-switching belongs in a tab bar, not the toolbar.
- **More than ~3 groups / multiple primary actions** — a cluttered bar with competing prominent buttons.
- **Tinted, boxed, opaque, custom-background controls** fighting the "reduce backgrounds and tinted controls" guidance.
- **The app name as the title**, or titles far over 15 characters.
- **Bordered toolbar symbols** where the section already provides a container; running text labels together with no fixed space.
- **The web hand cursor**, tiny un-padded glyph targets, or a custom-painted toolbar instead of `NSToolbar`/SwiftUI placements.

## Accessibility

Because every toolbar item is also a menu-bar command with a shortcut, keyboard and VoiceOver users always have a path even when an item collapses into overflow or the toolbar is hidden. Give each toolbar item a clear VoiceOver label (especially symbol-only buttons) and a tooltip. Honour Reduce Transparency (the glass solidifies) and Increase Contrast (firmer edges); maintain 44×44 pt targets and ≥ 4.5:1 label contrast as the bar adapts to Light/Dark and to the content beneath it.

## Related
- [the-menu-bar.md](the-menu-bar.md) — every toolbar item must also be a menu-bar command.
- [buttons-and-menu-buttons.md](buttons-and-menu-buttons.md) — the prominent primary action and toolbar pop-up/pull-down buttons.
- [menus-and-context-menus.md](menus-and-context-menus.md) — the overflow/More menu and toolbar-item menus.
- [layout.md](layout.md) — the toolbar zone, scroll-edge effect, and the floating glass control layer.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
