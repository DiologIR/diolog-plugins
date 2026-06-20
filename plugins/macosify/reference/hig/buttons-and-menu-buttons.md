---
title: Buttons & Menu Buttons
hig: buttons / pop-up-buttons / pull-down-buttons
role: menus
---
# Buttons & Menu Buttons (macOS)

**Purpose.** Push buttons (the prominent/primary one, destructive ones, roles, sizes, labels) and the two menu-bearing buttons that confuse web developers most: **pop-up buttons** (a menu of mutually exclusive *options*) versus **pull-down buttons** (a menu of *actions* related to the button's purpose). Apple: "A button initiates an instantaneous action." All three are shortcuts to commands that should also live in the menu bar.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/buttons · https://developer.apple.com/design/human-interface-guidelines/pop-up-buttons · https://developer.apple.com/design/human-interface-guidelines/pull-down-buttons

## When to use

- **Push button** — perform an immediate action (Save, Cancel, Export…). The standard macOS type is a **push button**, which can act as the default button and be tinted.
- **Prominent / Primary button** — the action people are most likely to take; the system applies the **accent colour** to its background. "Keep the number of prominent buttons to one or two per view." [HIG]
- **Pop-up button** — "displays a menu of **mutually exclusive options**." After a choice the menu closes and the button can update to show the current selection. [HIG]
- **Pull-down button** — "displays a menu of items or **actions** that directly relate to the button's purpose" (an *Add* button choosing what to add, a *Sort* button choosing the attribute). [HIG]

## Anatomy

- **Push button** — a bordered control combining **style** (size/colour/shape), **content** (symbol, text label, or both), and a **role**. **Append a trailing ellipsis** when the button "opens another window, view, or app." [HIG]
- **Pop-up button** — the title can update to the **current selection**; provide a **useful default** and let people predict the options via an introductory or button label. [HIG]
- **Pull-down button** — content stays oriented to its **action**, not a value; a menu title is usually unnecessary because the button content plus descriptive items give enough context. [HIG]
- macOS-specific button types (use **in a view, not in the window frame** — for a toolbar, use a toolbar item): **square/gradient** buttons (symbol-only, table row add/remove), **help** buttons (circular "?", ≤1 per window), **image** buttons. [HIG]

## Behavior & states

- **Roles** [HIG]: **Normal** (no specific meaning), **Primary** (the default button — uses the accent colour, **responds to Return**, and auto-closes a sheet/alert), **Cancel** (cancels the action — maps to Escape), **Destructive** (uses the **system red** colour).
- **Never assign the Primary role to a destructive action**, "even if that action is the most likely choice." Because a prominent button is sometimes chosen without reading it, reserve the primary role for nondestructive buttons. [HIG]
- States must include a **press state** for custom buttons (without one a button "can feel unresponsive"), plus hover, **disabled** (dimmed — disable rather than hide a temporarily unavailable action), and focus. [HIG]
- A pop-up button **updates its title** to the chosen value; a pull-down button performs an action and its content **stays constant**. [HIG]

## Pop-up vs pull-down

| | **Pop-up button** | **Pull-down button** |
|---|---|---|
| Apple's definition | "menu of **mutually exclusive options**" | "menu of items or **actions** that directly relate to the button's purpose" |
| Use it for | Picking **one value/state** from a flat list | Triggering **a command** from a related menu |
| Title | Can show the **current selection** (changes) | Oriented to its **action** (constant) |
| Multiple selection / submenu | No — use a pull-down for actions, multi-select, or a submenu | (Pop-up explicitly defers these to pull-down) |
| Default / checkmark | Provide a useful **default**; checkmark on the active value | No "current value"; mark **destructive** items in red |
| Length | Space-efficient; fine for many options | Apple: prefer **≥3 items**; don't bury a view's primary actions here |
| Example | Font size, sort order, alignment | "Add ▾", "Sort ▾", a "More" (⋯) menu |

## Metrics & layout

- **Hit region ≥ 44×44 pt** — reach it with padding around a visually compact control, not by inflating the glyph. [HIG]
- **macOS 26 shape:** a bordered button is a **capsule at large size** and **rounded-rect at mini/small/medium**; standard components are **concentric** with their container. [HIG era]
- **One Primary/default button per view or dialog**; **Return → Primary, Escape → Cancel.** [HIG]
- **Default arrow cursor** on buttons — *not* the web hand (`cursor: pointer`). [HIG era]
- Dialog button order (trailing-aligned): the default/confirm button is **rightmost**; Cancel sits to its left. Help button (if any) in the lower corner opposite the dismissal buttons. [HIG]
- A tooltip appears on hover after a moment (macOS) — provide one for symbol-only buttons. [HIG]

## Native macOS conventions

- **Title-case, verb-first labels** ("Add to Cart", *Save*, *Move to Trash*) — start with a verb to convey the action; ellipsis only when more input follows. [HIG]
- Use a **prominent style — not a larger size** — to mark the preferred choice among same-size options. [HIG]
- Tint = the user's **accent colour**, applied by the system to the primary button — don't hard-code a brand colour onto it. Prefer the **default monochromatic** label appearance over colour that clashes with the content layer. [HIG]
- Pop-up/pull-down render real `NSMenu`s (`NSPopUpButton`, SwiftUI `Picker`/`Menu`); their commands should mirror menu-bar commands.
- Respect Light/Dark and Increase Contrast by using **system button styles**, not CSS-painted buttons.

## Common non-native mistakes

- **Multiple prominent/default buttons** in one view — two tinted buttons both look like "the answer."
- **A destructive button as the default** (red *and* Return-triggered) — accidental data loss.
- **The web hand cursor** on every button instead of the arrow.
- **Confusing pop-up and pull-down** — a value-picker styled as an action menu, or an actions menu that misleadingly shows a "current value." Pop-up is for mutually-exclusive *options*; pull-down is for *actions*.
- **Burying a view's primary actions in a pull-down** instead of surfacing them.
- **Tiny hit targets** (a 16 pt glyph with no surrounding padding).
- **"OK / Cancel"** where a real verb belongs ("Don't Save / Save"), or sentence-case labels.
- **Hard-coded brand tint** on the primary button; hand-built CSS buttons that ignore Dark Mode / contrast.
- **Square/help/image buttons placed in the toolbar** — those belong in a view; use a toolbar item in the window frame.

## Accessibility

Buttons are keyboard-reachable (Tab / Full Keyboard Access); the Primary fires on Return, Cancel on Escape, and the focus ring follows the accent colour. VoiceOver announces the label, role (button / pop-up / menu), and state (selected value, disabled) — so verb-first titles double as the accessibility label. Always include a press state and a tooltip for symbol-only buttons. Keep ≥ 4.5:1 text contrast on the prominent tint across Light/Dark, and respect Increase Contrast.

## Related
- [the-menu-bar.md](the-menu-bar.md) — buttons are shortcuts to menu-bar commands.
- [menus-and-context-menus.md](menus-and-context-menus.md) — the menus that pop-up/pull-down buttons present.
- [toolbars.md](toolbars.md) — the one primary action lives on the toolbar's trailing side, styled `.prominent`.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
