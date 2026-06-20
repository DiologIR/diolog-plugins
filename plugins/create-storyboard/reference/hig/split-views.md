---
title: Split Views
hig: split-views
role: layout
---
# Split Views (macOS)

**Purpose.** A split view manages the presentation of **multiple adjacent panes** of content, each of which can contain tables, collections, images, or custom views. The classic use is to show **multiple levels of the app's hierarchy at once** and support navigation between them: selecting an item in the **primary** pane displays its contents in the **secondary** pane, and — when secondary items contain more — an optional **tertiary** pane. The most common shape is a **sidebar for navigation** (leading pane = top-level items/collections) with secondary/tertiary panes for child collections and detail. [HIG]

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/split-views

## When to use

- The app navigates a **hierarchy** (collections → items → item detail) and benefits from seeing multiple levels at once. [HIG]
- You want a **persistent navigation sidebar** alongside content rather than pushing/popping full-screen views.
- You want panes that **supplement** the primary view — Keynote on macOS uses split-view panes for the slide navigator, presenter notes, and inspector that surround the main slide canvas. [HIG]

Don't use a split view to fake tabs or stack unrelated tools. Peer views that swap in place belong in a [tab view](tab-views-and-boxes.md), not a pane.

## Anatomy

- **Primary pane (leading)** — the sidebar / source list: top-level items or collections.
- **Secondary pane** — the list, collection, or canvas driven by the leading selection.
- **Tertiary pane (optional)** — detail or inspector, shown when secondary items carry additional content.
- **Dividers** — between panes; on macOS they can support **dragging to resize**. [HIG]
- **One window** — panes share a single window, title, and toolbar; they are not separate windows.

## Behavior & states

- **Persistently highlight the current selection** in each pane that leads to the detail view. [HIG] The selected appearance clarifies the relationship between panes and keeps people oriented.
- **Consider drag-and-drop between panes.** [HIG] Because a split view exposes multiple levels of hierarchy, dragging items between panes is a convenient way to move content.
- **Collapse / reveal a pane when it makes sense.** [HIG] If the app has an editing area, let people hide other panes to reduce distraction or make room — Keynote lets people hide the navigator and presenter-notes panes while editing slides.
- **Selection persists** in each leading pane while you work in a trailing pane.
- **State restoration.** Pane widths, which panes are collapsed, and each pane's selection restore on relaunch [convention].

## Metrics & layout

- **Prefer the thin divider style — 1pt wide.** [HIG] It gives maximum room for content while staying easy to use. Avoid thicker dividers unless you have a specific need (e.g. when strong linear elements on both sides would make a thin divider hard to distinguish).
- **Set reasonable minimum and maximum pane sizes.** [HIG] Choose sizes that keep the divider **visible** — if a pane gets too small the divider can seem to disappear and become hard to use. (A sidebar commonly holds ~150–250pt, an inspector ~220–320pt [convention].)
- **Arrange panes vertically, horizontally, or both.** [HIG] macOS supports vertical, horizontal, and multiple split arrangements.
- **Sidebar width tracks the user's sidebar-size setting** (Small/Medium/Large) — don't hard-pin one width (see [sidebars.md](sidebars.md)).
- **8pt grid** for pane content insets [convention].
- **Liquid Glass (macOS 26):** the sidebar is a floating glass pane; content can flow beneath it, and a **scroll-edge effect** separates floating chrome from scrolling content rather than a hard line. Keep adjacent panes' scroll-edge heights consistent so they align.

## Native macOS conventions

- **One window, one title, one toolbar** spanning the whole split view — not a title or toolbar per pane.
- The **leading pane is the navigation source**; selection there drives what the trailing panes show. [HIG]
- **Default arrow cursor** on rows in every pane — never the web hand pointer.
- `user-select: none` on pane chrome (rails, headers); only the actual content is selectable.
- Persist and restore divider positions; honour the green **zoom** to a useful layout, not arbitrary full-bleed.

## Common non-native mistakes

- **Thick / shaded / draggable-looking splitters** instead of the 1pt thin divider.
- **No min/max**, so a pane collapses to a sliver or the divider vanishes under content.
- **Only one way to reveal a collapsed pane** — Apple says to **provide multiple ways**: e.g. a toolbar button **and** a View-menu command **with a keyboard shortcut**. [HIG]
- **A title or toolbar per pane**, making the split view feel like three glued-together windows.
- **Losing selection** in the leading pane when you click into a trailing pane.
- **Hand cursor** on rows; web-style hover underlines; off-grid pane padding.
- **Not restoring** pane widths / collapse state / selection on relaunch.

## Accessibility

- Any pane-toggle must be reachable by **keyboard** (its View-menu command + shortcut) and by VoiceOver — not pointer-only.
- Dividers should be **VoiceOver-adjustable** (announced as a splitter the user can move).
- Honour **Larger Text**: panes reflow and dividers stay grabbable; never clip a pane's content when text scales.
- Maintain focus order leading → trailing; Tab and ⌃ navigation should move predictably across panes.

## Related
- [sidebars.md](sidebars.md) — the source list that is usually the primary pane.
- [lists-and-tables.md](lists-and-tables.md) — what fills the secondary content pane.
- [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md) — outline/column variants of a pane.
- [tab-views-and-boxes.md](tab-views-and-boxes.md) — swap peer views in place instead of adding a pane.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
