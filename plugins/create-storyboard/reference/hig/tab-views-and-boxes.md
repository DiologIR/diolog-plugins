---
title: Tab Views, Boxes, and Labels
hig: tab-views + boxes + labels
role: layout
---
# Tab Views, Boxes, and Labels (macOS)

**Purpose.** Three organisational primitives **within a window**: a **tab view** presents **multiple mutually exclusive panes of content in the same area**, switched by a tabbed control; a **box** creates a visually distinct group of logically related information and components; a **label** is static text people can read and often copy, but not edit. [HIG] These organise the *contents* of one window — they are **not** app-wide navigation and **not** the toolbar tab bar.

**Apple HIG:**
- Tab views — https://developer.apple.com/design/human-interface-guidelines/tab-views
- Boxes — https://developer.apple.com/design/human-interface-guidelines/boxes
- Labels — https://developer.apple.com/design/human-interface-guidelines/labels

## When to use

- **Tab view** — present **closely related areas of content** in the same region; the strong visual enclosure tells people each tab holds similar/related content. [HIG] Classic use: a settings/preferences window or a small inspector with a few modes. (Not supported on iOS/iPadOS/tvOS/visionOS — there, a **segmented control** is the analogue. [HIG])
- **Box** — group a handful of related controls so a dense panel reads as sections. Apple: **keep a box relatively small compared with its containing view** — as it approaches the window/screen size it stops communicating separation and crowds other content. [HIG]
- **Label** — display **static text**: a field caption, a value, a help line, a status string. Use a label for a **small amount of text people don't need to edit** (use a text field to edit, a text view for large text). [HIG]

**Tab view is NOT** a **toolbar tab bar** (the top-level browser-style sections of a whole app), **cross-app / primary navigation** (use a [sidebar](sidebars.md) or the toolbar tab bar), or a place for **many** tabs.

## Anatomy

- **Tab view** — the **tabbed control appears on the top edge of the content area**; exactly one tab active; its pane fills the region. The control can be **hidden** for programmatic switching, and the content area can be **borderless, bezeled, or line-bordered.** [HIG]
- **Box** — a container that uses a **visible border or background colour** to separate its contents, with an **optional title.** [HIG]
- **Label** — a text run with no border or background, styled by the label colour tiers.

## Behavior & states

- **Make each pane self-contained.** Controls within a pane must affect content **only in the same pane** — panes are mutually exclusive. [HIG]
- **Avoid using a pop-up button to switch tabs** — a tabbed control needs a single click and shows all choices at once. (A pop-up is a reasonable fallback **only** when there are too many panes for tabs.) [HIG]
- **Box** is purely structural — it groups; it has no selected/active behaviour. **Use padding and alignment** (not nested boxes) to communicate subgroups. [HIG]
- **Label** is static but **selectable/copyable** where the value is useful to copy — Apple: **make useful label text selectable** (an error message, a location, an IP address). [HIG]

## Metrics & layout

- **Provide a label for each tab** that describes its pane; **use nouns or short noun phrases** (a verb phrase sometimes), with **title-style capitalization.** [HIG]
- **Avoid more than six tabs** in a tab view — more becomes overwhelming and creates layout issues; if you need six or more, use another approach (e.g. a pop-up menu of view options). [HIG]
- **Inset the tab view**, leaving a margin of window-body area on all sides; extending a tab view to the window edges is unusual. [HIG]
- **Box title — sentence-style capitalization, no ending punctuation** [HIG] — *except* in a **settings pane**, where you **append a colon** to the title. [HIG] On macOS the box title is displayed **above** the box. [HIG] (`Account details`, not `Account Details.` and not `ACCOUNT DETAILS`.)
- **Label colour hierarchy — the four system tiers** [HIG]: **`labelColor`** (primary information), **`secondaryLabelColor`** (a subheading or supplemental text), **`tertiaryLabelColor`** (text describing an unavailable item/behaviour), **`quaternaryLabelColor`** (watermark text) — descending emphasis. Prefer **system fonts** and never hard-code grey hex when a tier applies.
- **8pt grid** for box insets and the gaps between grouped controls [convention]; group with the box + spacing, not heavy rules.
- **44pt minimum** hit target for each tab including padding [convention].
- **Liquid Glass / scroll-edge** applies to a tab view's scrolling pane like any content (macOS 26).

## Native macOS conventions

- Tabs use the **system tab control** on the top edge — not a row of custom pill buttons styled like a web nav.
- **Default arrow cursor** on tabs and label chrome — **never** the web hand pointer.
- `user-select: none` on tab labels and box titles (chrome); **value labels stay selectable** so the user can copy them.
- Labels are **readable**: sufficient contrast at every tier, never tiny tracked-uppercase captions; prefer system fonts and Dynamic Type.
- A box **groups**; it doesn't decorate — avoid drop shadows, gradients, or thick borders dressing up a simple group.

## Common non-native mistakes

- **Using a tab view as app navigation** instead of in-window peer switching — that's a sidebar / toolbar-tab-bar job.
- **More than six tabs** in one tab view (it should have stayed a sidebar or become a pop-up menu).
- **A pop-up button to switch a handful of tabs** (use the tab control), or **panes that reach outside themselves** (controls affecting another pane).
- **UPPERCASE or end-punctuated box titles** — should be sentence-style, no period (a colon **only** in a settings pane); **nested boxes** for subgroups instead of padding/alignment.
- **Web-style pill/segmented buttons** hand-rolled in place of the system tab control.
- **Hand cursor** on tabs; hover underlines; non-selectable value labels the user can't copy.
- **Flattening the colour hierarchy** — every label the same primary colour, or arbitrary greys instead of the four label tiers.
- **Boxes that over-decorate** (shadows/gradients/thick rules) or grow nearly as large as the window.

## Accessibility

- Tabs are keyboard-navigable (the tab control is a focusable group) and VoiceOver announces the selected tab + the count.
- A box **title** is associated with its grouped controls so VoiceOver conveys the grouping — Apple notes a title helps VoiceOver users predict the box's contents. [HIG]
- Label colour tiers must still meet contrast — don't push secondary/tertiary text below 4.5:1 (normal) / 3:1 (large); never convey meaning by tier/colour alone.
- Honour **Larger Text**: tabs, box titles, and labels scale and reflow without clipping; the tab hit target holds.

## Related
- [sidebars.md](sidebars.md) — sidebar vs tab bar vs tab view; what's navigation vs in-window switching.
- [split-views.md](split-views.md) — when to add a pane instead of a tab.
- [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md) — disclosure vs tabs vs boxes for organising controls.
- [lists-and-tables.md](lists-and-tables.md) — labels and the colour hierarchy inside rows/cells.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
