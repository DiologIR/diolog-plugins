---
title: Menus & Context Menus
hig: menus / context-menus / edit-menus
role: menus
---
# Menus & Context Menus (macOS)

**Purpose.** The rules for menu *content* — how items are labelled, organised, toggled, and made unavailable — and how a **context (right-click) menu** and **edit menu** differ from a full menu. Apple: opening a menu "reveals one or more menu items, each of which represents a command, option, or state that affects the current selection or context." A menu-bar / pull-down menu is the authoritative list for a scope; a **context menu** offers the small number of frequently used commands relevant to the current view or task. The standard **Edit** menu is the canonical example and must match expectations exactly.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/menus · https://developer.apple.com/design/human-interface-guidelines/context-menus · https://developer.apple.com/design/human-interface-guidelines/edit-menus

## When to use

- **Menus** (menu bar, pull-down buttons): the authoritative list of commands for a scope. See [the-menu-bar.md](the-menu-bar.md).
- **Context menus**: convenient access to functionality directly related to an item. "A context menu isn't for providing advanced or rarely used items; instead, it helps people quickly access the commands they're most likely to need." Hidden by default — support them **consistently** so people learn where they exist, and **always make the same items available in the main interface too** (in macOS the menu bar lists all commands). [HIG]
- **Edit menus**: prefer the **system-provided** edit menu — recreating it with the same commands "is redundant and likely to be confusing." [HIG]

## Anatomy — menu items (labels)

- Write a label that **clearly and succinctly** describes the item; for an action, use a **verb or verb phrase** (*View*, *Close*, *Select*). [HIG]
- Use **title-style capitalization** to be consistent with the platform. **Remove articles** (a/an/the) to save space. [HIG]
- **Append an ellipsis (…)** only when the action "requires more information before it can complete" — i.e. it opens another view to gather input. An immediate command gets **no** ellipsis. [HIG]
- **Use icons sparingly and with purpose**; represent common actions (Share, Print, Copy, Delete) with the **standard system icons**. Apply a **uniform treatment per group** — icons for all items in a group, or none. [HIG]
- **Separators** group logically related items (a horizontal line or short gap). Keep related commands in the same group even if they differ in importance (e.g. *Paste and Match Style* sits with *Paste*). [HIG]

## Organization & toggling

- **List important/frequently used items first** — people scan from the top. [HIG]
- **Be mindful of menu length**; split a long menu or use a submenu. Exception: user-defined/dynamic content (History, Bookmarks) may be long and scroll. [HIG]
- **Toggled items**: prefer one item with a **changeable label** (*Show Map* ⇄ *Hide Map*) over two items; add a verb if the state isn't clear (*Turn HDR On*). Use a **checkmark** to show an attribute in effect; consider a *Plain*-style item to clear several toggles at once. [HIG]
- **Submenus** (a chevron after the label): use **sparingly**, **one level deep only**, ~5 items max before promoting to a new menu. **Prefer a submenu to indenting** items. Keep a submenu available even when its items aren't. [HIG]

## Behavior & states

- **Full menus: show unavailable items, dimmed.** "An unavailable menu item often appears dimmed and doesn't respond to interactions." If every item is unavailable the menu itself stays available so people can open it and learn what it contains. [HIG]
- **Menus don't require confirmation** — they act immediately — so support **undo/redo** for recovery (edit menus especially). [HIG]
- A context menu appears at the pointer/selection on ⌃-click, secondary (trackpad) click, or touch-and-hold, and dismisses on selection, Escape, or an outside click. [HIG]

## Context menus — the key differences

- **Curate, don't mirror.** Show only the commands most likely to be needed for the clicked item — not the whole menu bar. Aim for a **small number** of items. [HIG]
- **Hide unavailable items — do NOT dim them.** This is the *opposite* of a full menu: "a context menu displays only the actions that are relevant to the currently selected view or content." In macOS the exceptions are **Cut/Copy/Paste**, which may appear unavailable. [HIG]
- **No keyboard-shortcut hints in context menus.** "Context menus already provide a shortcut to task-specific commands, so it's redundant to display keyboard shortcuts too." Show shortcuts in the app's main menus. [HIG]
- **Most-likely items where the pointer is.** People read from where they revealed the menu; a menu opening upward near the bottom edge may need its order **reversed**. [HIG]
- **Separators / groups** — generally **no more than ~3 groups**. Submenus, if any, one level deep. [HIG]
- A context menu **seldom has a title**; add one only if it clarifies the effect (e.g. "3 messages selected"). [HIG]

## The standard Edit menu

Match this exactly — users rely on it. Top-level items, in order [HIG]:

| Command | Shortcut | Notes |
|---|---|---|
| Undo / Redo | ⌘Z / ⇧⌘Z | Clarify the target — *Undo Paste and Match Style*, *Undo Typing* |
| Cut / Copy / Paste | ⌘X / ⌘C / ⌘V | *Cut* copies to the pasteboard before deleting; *Delete* doesn't |
| Paste and Match Style | ⌥⇧⌘V | Stays in the same group as Paste |
| Delete | ⌫ | Equivalent to the Delete key; name it *Delete*, not Erase/Clear; no ellipsis |
| Select All | ⌘A | |
| Find ▸ | — | Submenu: Find…, Find and Replace, Find Next, Find Previous, Use Selection for Find, Jump to Selection |
| Spelling and Grammar ▸ · Substitutions ▸ · Transformations ▸ · Speech ▸ | — | Standard submenus |
| Start Dictation · Emoji & Symbols | — | The **system** adds these at the bottom of Edit |

Offer commands relevant to context (don't show *Copy* with no selection or *Paste* with nothing to paste). List custom commands **near** the related system ones; don't overwhelm. Avoid duplicating edit-menu functions with other controls. [HIG]

## Metrics & layout

- **Submenu depth = 1** [HIG]
- Context menu: **small**, ~3 groups max [HIG]
- Full menu: disabled = **dimmed, non-responding** [HIG]; context menu: unavailable = **hidden** (except Cut/Copy/Paste) [HIG]
- Title-style capitalization throughout [HIG]

## Native macOS conventions

- AppKit `NSMenu` (context via `popUpContextMenu` / `NSView.menu`), SwiftUI `.contextMenu` / `Menu`; in **Electron** use `Menu.buildFromTemplate` with `role:` items (`'cut'`/`'copy'`/`'paste'`/`'selectAll'`/`'undo'`/`'redo'`) so titles, shortcuts, and enablement are system-correct, and `popup()` for context menus.
- The system renders checkmarks, separators, submenu arrows, and disabled state — don't hand-style menus.
- On a Mac a context menu is sometimes called a **contextual menu**. [HIG]
- Edit-menu commands route through the responder chain to the focused control, so Cut/Copy/Paste reach the right text view.

## Common non-native mistakes

- **Ellipsis misuse** — an ellipsis on an immediate command, or none on one that opens a dialog.
- **Context menu = the whole menu bar** — dumping every command in instead of curating.
- **Dimming unavailable context-menu items** instead of hiding them (the macOS rule is the reverse of full menus).
- **Keyboard-shortcut hints in a context menu** — they belong in the main menus only.
- **Sentence/lowercase titles**, custom-styled rows, or a hand-built web "dropdown" instead of a real `NSMenu`.
- **Deep submenus** (≥2 levels) or **indenting** instead of a submenu.
- **A non-standard Edit menu** — missing Redo, wrong shortcuts, no Select All, a custom re-implementation of the system edit menu.

## Accessibility

Menus are fully keyboard-navigable (arrow keys, type-ahead, Enter; Escape closes) and VoiceOver announces each item, its state (checked/dimmed), and submenu. Because context menus omit shortcut hints, ensure the same commands carry their shortcuts in the menu bar so keyboard users can still discover them. Show-unavailable-dimmed keeps full menus' structure stable for screen-reader users navigating by position; edit-menu actions are recoverable via undo/redo.

## Related
- [the-menu-bar.md](the-menu-bar.md) — the menu bar these items live in; standard menu order.
- [buttons-and-menu-buttons.md](buttons-and-menu-buttons.md) — pop-up/pull-down buttons that surface menus inside the window.
- [toolbars.md](toolbars.md) — toolbar overflow and toolbar-item menus.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
