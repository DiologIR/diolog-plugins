---
title: Keyboard & Pointing
hig: keyboards
role: pattern
---
# Keyboard & Pointing (macOS)

**Purpose.** Make the app fully keyboard-operable and pointer-correct — the two traits that most separate a real Mac app from a web page in a window. Covers Full Keyboard Access, respecting the standard shortcut set, modifier-key conventions, the macOS pointer (the **default arrow**, not the web hand) and its standard shapes, hover/right-click, hit areas, and trackpad gestures.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/keyboards · https://developer.apple.com/design/human-interface-guidelines/pointing-devices

## When to use

- **Always.** Mac users use a physical keyboard all the time and expect a precise pointer. Every task must be reachable from the keyboard, and every control must behave correctly under the pointer.

## Behavior — keyboard

- **Support Full Keyboard Access.** It lets people *"navigate and activate windows, menus, controls, and system features using only the keyboard."* Every interactive element must be reachable in a **logical Tab order** (Tab → next, ⇧Tab → previous) with a **visible focus ring** (`:focus-visible`, accent-coloured). [HIG]
- **Respect standard keyboard shortcuts.** People expect the shortcuts that work elsewhere to work the same in your app — *"don't repurpose standard keyboard shortcuts for custom actions."* Only redefine one if its action genuinely doesn't apply (e.g. ⌘I for Get Info in a non-text-editing app). [HIG]
- **Key semantics:** **Tab** moves focus, **Space** activates/toggles the focused control, **Return** confirms / triggers the **default** (accent) button, **Esc** (and **⌘.**) cancels the current action / dismisses the frontmost popover, sheet, or modal. Arrow keys move within a control or list (and drive ⌘K-style command lists).
- **Menu bar = the shortcut map.** Every shortcut should also exist as a menu item showing its key equivalent, so the menu bar is the discoverable index of what the keyboard can do.

## Behavior — pointer

- **Default arrow cursor on controls.** Buttons, tabs, rows, and toolbar items use the standard **Arrow** pointer — **not** the web `cursor: pointer` hand. Apple reserves the **Pointing hand** for *"a URL link to a webpage, document, or other item"* — so the hand on a button is a browser convention and an instant non-native tell. (`cursor: default` on controls in CSS.) [HIG]
- **Use the right standard pointer:** Arrow (select/interact), **I-beam** over editable text, **resize** cursors (left/right/up/down and diagonals) on edges, **open/closed hand** only for genuine grab-and-pan content, **crosshair** for precise rectangular selection, **contextual-menu** when Control is held, plus the drag operation pointers (copy / drag link / disappearing item / operation-not-allowed). [HIG]
- **Be consistent with system gestures** and **don't redefine systemwide trackpad gestures** — people expect "swipe between pages", revealing the Dock/Mission Control, etc. to behave the same everywhere, and they can customise them. [HIG]
- **Hover states:** controls respond to hover (subtle highlight) but hover **never** hides essential information or gates an action a keyboard user can't trigger.
- **Right-click / Control-click context menus** offer relevant commands on the item under the pointer — a *duplicate* of menu-bar/inline actions, never the *only* place an action lives.
- **Precise, generous hit areas:** the clickable region matches the visual control; pad small targets up to the minimum.

## Metrics / values

- **Minimum hit target: 44×44pt.** [HIG]
- Standard shortcuts [HIG / system]:

  | Action | Shortcut |
  |---|---|
  | New | ⌘N |
  | Open | ⌘O |
  | Save | ⌘S |
  | Close window | ⌘W |
  | Find | ⌘F |
  | Jump to the search field | ⌥⌘F |
  | Undo / Redo | ⌘Z / ⇧⌘Z |
  | Cancel an operation | ⌘. (or Esc) |
  | Settings | ⌘, |
  | Help menu | ⌘? |
  | Enter full screen | ⌃⌘F |
  | Quit | ⌘Q |
  | Command palette (app) | ⌘K [convention — not in Apple's standard table] |

- **Modifier-key conventions:** prefer **⌘** as the main modifier; **⇧** as a secondary modifier complementing a related shortcut; **⌥** sparingly for less-common/power commands; **avoid ⌃** (the system uses it widely). List modifiers in the order **Control, Option, Shift, Command.** Don't add a modifier to an existing shortcut for an *unrelated* command (e.g. ⇧⌘Z must stay redo-related). [HIG]
- **Don't repurpose a standard shortcut** for a non-standard meaning. [HIG]

## Native macOS conventions

- Use AppKit/SwiftUI controls (or faithfully mirror them) so they get focus ring, key equivalents, and accessibility roles for free.
- Reserve ⌘-letters for their conventional meanings; put app-specific verbs on ⌥/⌃ combos or the command palette. **Define custom shortcuts only for the most frequently used app-specific commands** — too many make the app hard to learn. [HIG]
- **Trackpad gestures** where natural and discoverable (two-finger swipe to scroll/navigate-back, pinch/smart-zoom) — but each must have a non-gesture equivalent, and systemwide gestures stay available. [HIG]
- The focus ring follows the user's **accent colour**; selection and default-button highlight do too.

## Common non-native mistakes

- **The web pointing-hand cursor (`cursor: pointer`)** on buttons/links/rows — the #1 "this is a web app" tell. Use the **default Arrow**; reserve the Pointing hand for actual URLs. [HIG]
- **No visible focus ring** / focus ring removed for aesthetics (`outline: none` with no replacement).
- **Mouse-only actions** — features reachable only by click/drag/hover with no keyboard path.
- **Illogical or trapped Tab order**; focus that can't escape a region.
- **Esc / ⌘. / Return doing nothing** in dialogs and popovers; no default button.
- **Overriding standard shortcuts** (⌘W not closing, ⌘, not opening Settings) or inventing conflicting ones; modifiers out of Control-Option-Shift-Command order.
- **Redefining systemwide gestures**, or gestures with no fallback.
- **Hover-only affordances** (an action that only appears on hover); **tiny hit targets** under 44×44pt.

## Accessibility

- **Full Keyboard Access is the baseline**, not an add-on: complete, logical, and visibly focused. [HIG]
- Expose roles, labels, and key equivalents to **VoiceOver**; the visible focus ring and the VoiceOver cursor should agree.
- Don't convey state through hover/pointer alone — keyboard and assistive-tech users must reach the same state.
- Honour **Reduce Motion** on focus/hover transitions and **Increase Contrast** on the focus ring.
- Keep targets ≥44×44pt for users with motor or precision limits.

## Related
- [searching-settings-and-undo.md](searching-settings-and-undo.md) — ⌘, Settings, ⌘Z/⇧⌘Z undo, ⌘F find / ⌥⌘F search field.
- [drag-and-drop.md](drag-and-drop.md) — the keyboard alternative to drag; cursor operation pointers (copy/link/no-drop).
- [feedback.md](feedback.md) — Return confirms / Esc cancels alerts.
- [launching-fullscreen-and-onboarding.md](launching-fullscreen-and-onboarding.md) — ⌃⌘F full screen; ⌘? Help; teaching 1–2 shortcuts.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
