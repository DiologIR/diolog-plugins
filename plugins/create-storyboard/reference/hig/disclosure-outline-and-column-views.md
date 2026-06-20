---
title: Disclosure, Outline, and Column Views
hig: disclosure-controls + outline-views + column-views
role: layout
---
# Disclosure, Outline, and Column Views (macOS)

**Purpose.** Three related ways to reveal **hierarchical or optional** content without overwhelming people: **disclosure controls** reveal and hide information/functionality related to specific controls or views; an **outline view** presents hierarchical data in a scrolling list of cells organized into columns and rows; a **column (browser) view** lets people navigate a data hierarchy through a series of vertical columns. [HIG] The governing idea: **progressive disclosure** — show what matters now, let people reveal the rest on demand.

**Apple HIG:**
- Disclosure controls — https://developer.apple.com/design/human-interface-guidelines/disclosure-controls
- Outline views — https://developer.apple.com/design/human-interface-guidelines/outline-views
- Column views — https://developer.apple.com/design/human-interface-guidelines/column-views

## When to use each

- **Disclosure control (general)** — **hide details until they're relevant.** Keep the controls people are most likely to use at the top of the hierarchy so they're always visible, with advanced functionality hidden by default. [HIG]
- **Disclosure triangle** — show/hide information or functionality associated with a **view or a list of items** (e.g. advanced export options in Keynote; progressively revealing folder hierarchy in Finder list view). [HIG]
- **Disclosure button** — show/hide functionality associated with a **specific control** (e.g. the macOS Save sheet's button next to "Save As" that expands the navigation options). [HIG]
- **Outline view** — present **hierarchical, text-based data in a single scrolling pane** (a file tree, a nav tree); often on the **leading side of a split view** with related content opposite. **Use a table instead for non-hierarchical data.** [HIG]
- **Column (browser) view** — navigate a **deep hierarchy where people move back and forth between levels frequently** and you don't need a list/table's sorting (Finder's column view). [HIG]

## Anatomy

- **Disclosure triangle** — points **inward from the leading edge when collapsed, and down when expanded.** [HIG] Clicking toggles it and the view expands/collapses to fit the content.
- **Disclosure button** — points **down when its content is hidden, and up when its content is visible.** [HIG] (Note: the **opposite** convention from the triangle.)
- **Outline view** — at least one column of **primary hierarchical data**; parent containers carry disclosure triangles that expand to reveal children. Extra columns show supplementary attributes (sizes, modification dates). [HIG]
- **Column view** — each column is one level of the hierarchy; a parent with children is marked with a **triangle**; selecting a parent populates the next column to the right. [HIG]

## Behavior & states

- **Provide a descriptive label** for a disclosure triangle so it indicates what is disclosed or hidden (e.g. "Advanced Options"). [HIG]
- **Place a disclosure button near the content it shows/hides**, and **use no more than one disclosure button in a single view** — multiple buttons add confusing complexity. [HIG]
- **Make expanding/collapsing easy.** In an outline, clicking a triangle expands only that container; **Option-clicking expands all of its subfolders.** [HIG]
- **Retain people's expansion choices** — store the expanded/collapsed state so people return to where they were. [HIG]
- **Outline editing:** people expect to **single-click a cell to edit** its contents; a cell can respond differently to a double-click (e.g. single-click a filename to rename, double-click to open). You can also let people reorder, add, and remove rows. [HIG]
- **Column view:** **show the root level in the first column** so people can scroll back to start over; when a selected item has **no children, show information/preview about it** (Finder shows a preview plus dates, type, size). [HIG]
- **Keyboard:** in outlines, **→ expands / ← collapses** the focused row; ↑/↓ move selection; type-ahead jumps [convention]. In column views, ←/→ move between columns, ↑/↓ within a column [convention].

## Metrics & layout

- **Use descriptive column headings** in multi-column outlines: **nouns or short noun phrases with title-style capitalization and no punctuation** (avoid a trailing colon). Always provide headings in a multi-column outline; in a single-column outline, provide a label or other context. [HIG]
- **Expose data hierarchy in the first column only**; other columns display attributes of the hierarchical data. [HIG]
- **Consider letting people click headings to sort** an outline (the primary column sorts at each hierarchy level); clicking an already-sorted heading re-sorts in the opposite direction. [HIG]
- **Let people resize columns** in both outline and column views — names and data often exceed the default width. [HIG]
- **Consider a centred ellipsis** to truncate cell text instead of clipping — it preserves the start and end of the value. [HIG]
- **Consider a search field** (in the toolbar) for a lengthy outline. [HIG]
- **Consider alternating row colours** in multi-column outlines to help track values across columns. [HIG]
- **Indentation per level** is consistent (a fixed step per depth) so hierarchy is legible [convention; 8pt grid].
- **Triangle hit area** must reach the **44pt minimum** including padding even though the glyph is tiny [convention] — pad the target, not the triangle.
- **Outline rows** share the row metrics, hover, and **rounded-corner inset selection** of [lists-and-tables.md](lists-and-tables.md).
- **Liquid Glass / scroll-edge** behaviour applies to these panes like any scrolling content (macOS 26).

## Native macOS conventions

- The **disclosure triangle** points **right=collapsed, down=expanded**; a **disclosure button** points **down=collapsed, up=expanded** — don't invent a +/− box or a custom icon for either.
- **Default arrow cursor** on rows and on the triangle — never the web hand pointer.
- `user-select: none` on the row/triangle chrome; the node opens/selects rather than letting the label text be drag-selected.
- Disclosure controls **change the layout in place** — surrounding content reflows; don't push the whole window or animate layout properties harshly.
- Reuse outline rows' selection/hover grammar from tables; don't restyle them differently.

## Common non-native mistakes

- **A `+`/`−` box, a rotating ">" chevron, or a custom icon** instead of the system disclosure triangle for an outline.
- **Triangle that doesn't rotate** (or rotates the wrong way) so collapsed/expanded state is ambiguous; a disclosure **button using the triangle's direction convention** (it's the opposite).
- **More than one disclosure button** in a single view, or a button placed far from the content it controls.
- **Triangle hit target too small** — a 10px glyph with no padding, impossible to click.
- **Everything expanded by default**, defeating progressive disclosure; or **not retaining** expansion state.
- **Tracked-uppercase outline headings** or headings with a trailing colon — should be title-style, no punctuation.
- **Hand cursor**, hover underlines, or web-tree styling on outline rows.
- **Keyboard-dead outlines** — no ←/→ expand-collapse, no type-ahead.
- **Faking a column view with nested accordions**, or a browser whose first column isn't the root / that doesn't preview a childless selection.

## Accessibility

- Disclosure controls expose an **expanded/collapsed state** to VoiceOver and are operable by keyboard (Space/→/←).
- Outline rows announce their **depth/level** and expanded state; column views announce the navigation path.
- Don't rely on the triangle's orientation alone — the accessible state must also be set.
- Honour **Larger Text**: triangles, indentation, and row heights scale without clipping; keep the 44pt target.

## Related
- [lists-and-tables.md](lists-and-tables.md) — an outline view is a table plus disclosure; shared row grammar.
- [sidebars.md](sidebars.md) — disclosure **groups** inside a source list.
- [split-views.md](split-views.md) — outline/column views as a pane.
- [tab-views-and-boxes.md](tab-views-and-boxes.md) — disclosure vs tabs vs boxes for organising controls.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
