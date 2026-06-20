---
title: Search Fields, Token Fields, Path Controls & Tab Bars
hig: https://developer.apple.com/design/human-interface-guidelines/search-fields
role: input
---

# Search Fields, Token Fields, Path Controls & Tab Bars (macOS)

**Purpose.** Four navigation/search-adjacent controls. A **search field** lets people search a collection of content for terms they enter — an editable field with a Search icon, a Clear button, and placeholder text [HIG]. A **token field** converts text into tokens that are easy to select and manipulate [HIG]. A **path control** shows the file-system path of a selected file or folder [HIG]. A **tab bar** lets people navigate between **top-level sections** of an app [HIG]. The native rules: hint *what's searchable*, place search conventionally, and use a tab bar for navigation rather than actions.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/search-fields · https://developer.apple.com/design/human-interface-guidelines/token-fields · https://developer.apple.com/design/human-interface-guidelines/path-controls · https://developer.apple.com/design/human-interface-guidelines/tab-bars

## When to use

- **Search field** — to search/filter a collection of content [HIG]. Can use a **scope bar** and **tokens** to refine the search [HIG].
- **Token field** — when entered values should become **discrete, manipulable terms** (e.g. Mail's recipient address fields), selectable, draggable, and reorderable as units [HIG].
- **Path control** — to show and navigate a **file-system location** (the Finder's path bar is the model) [HIG]. Use it in the **window body, not in a toolbar or status bar** [HIG].
- **Tab bar** — to **navigate among top-level sections** of the app while preserving each section's navigation state [HIG]. **Use it for navigation, not actions** — for controls that act on the current view, use a toolbar instead [HIG]. For a complex information structure, consider a **sidebar** (or a tab bar that adapts to a sidebar) [HIG].

## Anatomy

- **Search field** — a **Search icon**, an editable region with **placeholder text**, and a **Clear button**; optionally a scope bar and tokens [HIG].
- **Token field** — a text field whose committed entries render as tokens; an individual token can carry a **contextual menu** with token info and editing options (in Mail: edit name, mark VIP, view contact card) [HIG].
- **Path control** — two styles: **Standard**, a linear list of root disk → parent folders → selected item, each with icon and name (names between first and last collapse when too long); and **Pop up**, a pop-up-button-like control showing the selected item that opens a menu of the path [HIG].
- **Tab bar** — a row of tabs, each with an **icon and a label** (a single word where possible); the active tab is highlighted, and a tab can carry a **badge** for critical new information [HIG].

## Behavior & states

- Search: **start searching immediately as people type** where possible, so results refine continuously [HIG]. **Show suggested terms** — recent searches before search begins, predictive suggestions as people type [HIG]. **Simplify and prioritize results**, categorizing them where helpful [HIG]. Let people **filter results**, e.g. with a scope bar [HIG]; default to a **broader scope** and let people narrow it [HIG].
- Token field: by default text becomes a token whenever people type a **comma**; you can add shortcuts such as **Return** [HIG]. Suggestions appear immediately by default — consider tuning the **delay** so they don't distract while typing [HIG].
- Path control: clicking a segment navigates to that level; if editable, people can **drag an item onto the control** to select it, and the pop-up style adds a Choose command [HIG].
- Tab bar: selecting a tab swaps the section immediately; **keep the tab bar visible** as people navigate (except under a temporary modal) [HIG]; **don't disable or hide tab buttons even when content is unavailable** — explain instead [HIG].
- States: focused (accent ring), empty/filled, disabled; tabs selected/unselected.

## Metrics & layout

- **Placeholder text helps people know what they can search for** [HIG] — hint the scope or type of content ("Artists, Songs, Lyrics, and More"); a bare "Search" conveys nothing about what's searchable. Placeholder is **sentence case, no end punctuation**.
- **macOS search placement** [HIG]: put the field at the **trailing side of the toolbar** for many common uses (great for split views, like Mail/Notes); **at the top of the sidebar** when filtering content/navigation there; or **as a dedicated item in the sidebar or tab bar** when search needs space for suggestions/discovery [HIG].
- In a **dedicated search area**, consider **immediately focusing the field** when people navigate there [HIG]. Account for **window resizing** in the field's placement [HIG].
- **Native Find is ⌘F**; a **⌘K command palette is a product convention, not a HIG rule** — don't present ⌘K as the system Find. (This app uses ⌘K as a deliberate convention.)
- **Use the appropriate number of tabs**; it's easier to navigate among fewer, and **avoid overflow tabs** (a "More" tab hides content) [HIG]. Path-control and token-field chrome use system styling.

## Native macOS conventions

- Keep search where Mac users look for it: **toolbar-trailing**, **top-of-sidebar**, or a **dedicated sidebar/tab item** [HIG]; word the placeholder as a hint to what's searchable.
- Tokens behave like a single object — selectable, draggable, reorderable, deletable — and **add value with a context menu** [HIG].
- Path control mirrors Finder breadcrumbs (standard or pop-up style), used in the **window body** [HIG].
- Use a tab bar for **top-level navigation**, and a **sidebar** for a complex hierarchy [HIG]; **use SF Symbols** and **include tab labels** [HIG].
- Default **arrow cursor**; single accent focus ring; Esc dismisses/clears.

## Common non-native mistakes

- **A placeholder of just "Search"** with no hint about what's searchable, or **title-casing / punctuating** the placeholder.
- **Putting search leading/centered** instead of trailing in the toolbar (or top-of-sidebar / dedicated area) [HIG].
- **Presenting ⌘K as "Find"** / overriding ⌘F — ⌘F is the native Find; ⌘K command palette is an additive product convention.
- **Tokens rendered as plain styled text** that can't be selected/dragged/deleted as a unit [HIG].
- **A tab bar carrying actions** instead of navigation [HIG], or **disabling/hiding tabs** when content is unavailable [HIG].
- **Overflow ("More") tabs** that bury content [HIG].
- **A custom path widget** instead of a Finder-style path control, or a path control in a toolbar/status bar [HIG].

## Accessibility

- Expose the search field's role and its **placeholder as a hint, not the name**; provide an accessible label.
- Tokens, path segments, and tabs must be **individually keyboard-focusable and labeled**, with selected/active state announced (not colour-only).
- Provide a keyboard path to clear search (Esc) and to delete/edit tokens (Delete / Return).
- Honor `prefers-contrast` for the field border, token capsules, and active-tab indicator; honor `prefers-reduced-motion` for tab/path transitions.

## Related

- [text-fields-and-combo-boxes.md](text-fields-and-combo-boxes.md) — the editable field search/token fields build on
- [segmented-controls-and-sliders.md](segmented-controls-and-sliders.md) — segmented controls vs tab bars (in-view options vs peer panes)
- [pickers-and-wells.md](pickers-and-wells.md) — pickers for constrained value sets
- [index.md](index.md)
- [../DESIGN.md](../DESIGN.md)
