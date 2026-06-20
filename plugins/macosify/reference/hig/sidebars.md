---
title: Sidebars
hig: sidebars
role: layout
---
# Sidebars (macOS)

**Purpose.** A sidebar appears on the **leading side** of a view and lets people **navigate between areas of the app or top-level collections of content** — folders, mailboxes, playlists. [HIG] It is the macOS **source list**. A sidebar needs a large amount of vertical and horizontal space; when space is limited, a more compact control such as a **tab bar** may give a better navigation experience (and for many apps you don't have to choose — an adaptable tab-bar style can provide both). [HIG] The governing idea: **a sidebar is for navigation, not for housing content or tools.**

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/components/navigation-and-search/sidebars

## When to use

- The app has **several top-level or peer destinations** and benefits from constant, one-click access to them.
- The structure is **branching** but shallow — in general, show **no more than two levels of hierarchy** in a sidebar. [HIG] When the hierarchy is deeper, use a **split view with a content list** between the sidebar and the detail view. [HIG]

**Sidebar vs tab bar:** Apple recommends **considering a tab bar first** — it leaves more room for content. Use a sidebar when you have many areas and/or hierarchy that needs persistent navigation; the tab bar's convertible sidebar appearance can expose less-frequently-used content. They are alternatives, not layers. [HIG]

## Anatomy

- **Rows** — one per destination: a leading symbol + label, optional trailing count/badge.
- **Section headers / group titles** — group related rows. If you include two levels of hierarchy, **title each group with succinct, descriptive labels** and omit unnecessary words. [HIG]
- **Disclosure groups (optional)** — group hierarchy with **disclosure controls** to keep vertical space manageable when there's a lot of content. [HIG] See [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md).
- **Selection highlight** — a single persistent highlight on the active row.

## Behavior & states

- **Single selection** drives the rest of the split view; the highlight persists while you work elsewhere.
- **When possible, let people customize the sidebar's contents** — which areas appear and in what order — since people know best which areas matter most to them. [HIG]
- **Consider letting people hide the sidebar** to make room for detail or reduce distraction, using the platform interactions they already know — in macOS, a **show/hide button** and **Show Sidebar / Hide Sidebar** commands in the **View menu**. **Avoid hiding the sidebar by default** so it stays discoverable. [HIG]
- **Consider auto-hiding/revealing on window resize.** [HIG] Reducing the size of a viewer window can automatically collapse the sidebar to give content more room (e.g. Mail).
- **Size setting:** a sidebar's **row height, text size, and glyph size depend on its overall size — small, medium, or large.** You can set it programmatically, but **people can also change it** in General settings, so don't hard-pin one row height. [HIG]
- **Expansion tooltips:** when a row's label is truncated, hovering reveals the full text [convention].

## Metrics & layout

- **Section headers / group titles use the SYSTEM FONT — semibold weight, secondary colour, sentence case** [HIG-spirit / convention]. They are **NOT** tracked/letter-spaced uppercase. This is the single most common non-native sidebar mistake; fix it everywhere.
- **Row height, text, and glyph size scale with the small/medium/large size setting** [HIG] — never one hard-coded height.
- **Rounded-corner selection highlight** [convention] — the active row's highlight is a **rounded rectangle inset from the pane edges**, not a full-bleed bar to the window edge.
- **Flat selection grammar** [convention, era]: a **subtle filled rounded rect** (a tinted/`--chrome-sel`-style fill with accent-coloured text/glyph), **not a raised, glossy, full-saturation accent capsule**. Selection should read as "this row is chosen," not as a button.
- **Sidebar icons use the app's (system) accent colour by default** [HIG] — and people can change the system accent, so make sure your icons honour their choice. Use **fixed colours sparingly** and only to clarify meaning or draw attention (e.g. Mail's yellow VIP icon).
- **Avoid putting critical information or actions at the bottom of a sidebar** — people often move a window so its bottom edge is hidden. [HIG]
- **8pt grid** for insets and the leading glyph gutter [convention].
- **Liquid Glass (macOS 26):** sidebars can **float above content in the Liquid Glass layer.** [HIG] To reinforce the separation you can **extend visually rich content beneath the sidebar** — let it scroll horizontally under, or apply a **background extension effect** that mirrors adjacent content to look stretched under the sidebar. The *content column* stays opaque.

## Native macOS conventions

- **Default arrow cursor** on rows — **never** the web hand pointer.
- `user-select: none` on the entire sidebar (it's chrome, not selectable text).
- Sidebar holds **navigation only** — no forms, no editors, no dense control panels. Tools belong in the content area or an inspector.
- **Consider familiar SF Symbols** for row glyphs; if you need a custom icon, make a **custom symbol** rather than a bitmap. [HIG] Align glyphs in a consistent leading gutter.
- Section headers are quiet, secondary, sentence-case — they label, they don't shout.

## Common non-native mistakes

- **Tracked uppercase section headers** (`PROJECTS`, letter-spaced, tiny) — the classic web/Bootstrap tell. Use semibold system font, secondary colour, sentence case.
- **Full-bleed selection bar** to the pane edges instead of an inset **rounded-corner** highlight.
- **Solid bright-accent capsule** for the selected row (looks like a pressed button) instead of the subtle flat fill.
- **Icons that ignore the system accent colour**, or fixed colours used everywhere instead of sparingly.
- **More than two levels of hierarchy** crammed into the sidebar instead of a split view with a content list.
- **Hand cursor** on rows; underline-on-hover; selectable header text.
- **One fixed row height** that ignores the small/medium/large size setting.
- **Hiding the sidebar by default** (it becomes undiscoverable) or putting critical actions at its bottom edge.
- **Stuffing content or controls** into the sidebar (it's navigation, not a workspace).

## Accessibility

- Each row is a focusable, VoiceOver-labelled navigation element; the selected row's state is announced.
- **Keyboard navigation:** arrow keys move the selection, Enter/Space activates; the show/hide command is reachable from the View menu with a shortcut.
- Honour **Larger Text** and the sidebar size setting — rows grow without clipping glyph or label.
- Selection must not rely on colour alone — the highlight fill **plus** the persisted-selection state communicate the active row.

## Related
- [split-views.md](split-views.md) — the sidebar as the primary pane; reveal/collapse affordances.
- [lists-and-tables.md](lists-and-tables.md) — the content list the sidebar drives; flat selection grammar shared.
- [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md) — disclosure groups and deeper hierarchy.
- [tab-views-and-boxes.md](tab-views-and-boxes.md) — sidebar vs tab bar; in-window peer switching.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
