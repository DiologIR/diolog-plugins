---
title: Lists and Tables
hig: lists-and-tables
role: layout
---
# Lists and Tables (macOS)

**Purpose.** Lists and tables present **data in one or more columns of rows.** [HIG] A **list** is a single-column sequence of rows (often the content pane next to a sidebar); a **table** adds **multiple sortable columns** for complex data. Many apps use lists to express an information hierarchy and help people navigate it, and several apps — Mail in iPadOS and macOS, for example — use a **table within a split view**. [HIG] The governing idea: rows are **selectable, navigable records** with native hover/selection feedback — not styled `<tr>`s with no states.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/lists-and-tables

## When to use

- **Prefer displaying text in a list or table** — the row-based format is especially well suited to making text easy to scan and read. [HIG] If items **vary widely in size** or you need to display **many images**, consider a **collection** instead. [HIG]
- **Table** — records with **several comparable attributes** the user wants to scan, sort, or compare across columns (a file list with Name/Date/Size/Kind).
- For **hierarchy**, use an **outline view** (a table with disclosure triangles), not a hand-rolled indented list. [HIG] See [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md).

## Anatomy

- **Rows** — choose a **row style that fits the content** [HIG]: e.g. a small leading image followed by a brief label.
- **Columns (tables)** — each with a **heading**; resizable, reorderable, optionally hideable.
- **Column headings** — clickable for sort, showing the current sort column + direction.
- **Selection** — single or multi-select highlight.
- **Empty state** — a calm placeholder when there are no rows.

## Behavior & states

- **Provide appropriate feedback on selection.** [HIG] A table that helps people **navigate a hierarchy persistently highlights** the selected row to clarify the path; a table that **lists options** often highlights a row only briefly before adding an indicator such as a **checkmark**. [HIG]
- **Hover feedback.** Rows show a subtle hover highlight as the pointer moves over them [convention] — a Mac table is not static; the missing hover state is a frequent non-native tell.
- **Let people edit a table when it makes sense.** [HIG] People appreciate being able to **reorder** a list even when they can't add or remove items.
- **Sortable columns.** When it provides value, **let people click a column heading to sort** by that column; clicking an already-sorted column **re-sorts in the opposite direction.** [HIG] Show the sort indicator in the active heading.
- **Let people resize columns** — table data varies in width, and resizing helps people focus or reveal clipped data. [HIG]
- **Keyboard navigation.** ↑/↓ move selection, ←/→ collapse/expand in outlines, **Return** opens/renames, **Space** quick-look/preview, type-ahead jumps to a matching row [convention].
- **Empty state.** Show a centred, secondary-coloured message (and an action if relevant), never a blank pane or a fake "0 rows" header [convention].

## Metrics & layout

- **Use descriptive column headings.** Apple's text: **nouns or short noun phrases with title-style capitalization, and no ending punctuation.** [HIG] The critical native fix is that headings are **quiet, secondary-coloured labels — NOT tracked/letter-spaced UPPERCASE** (`Date Modified`, not `DATE MODIFIED`). If you don't include a heading in a single-column table, provide a label or header for context. [HIG]
- **Keep item text succinct** so rows are comfortable to read; short text minimises truncation and wrapping. [HIG] If each item is large, list titles only and reveal the rest in a detail view.
- **Preserve readability of clipped text** — a **centred ellipsis** can be more recognisable than an end-truncation because it preserves both the start and end of the value. [HIG]
- **Generous, comfortable row height** with a **44pt minimum interactive target** including padding [convention]; size on the **8pt grid**.
- **Rounded-corner selection highlight** [convention], **inset** from the table edges — matching the sidebar's flat selection grammar (subtle fill, accent text), not a full-bleed bright bar.
- **Choose a style that coordinates with your data and platform.** macOS defines a **bordered style that uses alternating row backgrounds** to make large tables easier to use. [HIG] **Consider alternating row colours in a multicolumn table** — they help people **track values across columns**, especially in a wide table [HIG]; a single-column list usually doesn't need them.

## Native macOS conventions

- **Default arrow cursor** on rows and headings — **never** the web hand pointer.
- `user-select: none` on headings and row chrome; the underlying record opens/renames rather than letting the user drag-select label text.
- **Type-ahead** to jump to a row; **Space** for Quick Look-style preview where applicable.
- Persist column widths/order, sort column + direction, and selection across launches [convention].
- Right-click a row for a **context menu** mirroring the relevant actions.

## Common non-native mistakes

- **Tracked uppercase column headings** (`NAME · STATUS · OWNER`, letter-spaced) — the web/admin-dashboard tell. Use the system font, secondary colour, title-style caps, no end punctuation.
- **No hover state** and/or **no selection state** — rows that don't react read as a static HTML table, not a Mac list.
- **Full-bleed / bright-accent selection bar** instead of the inset rounded-corner subtle fill.
- **Hand cursor** on rows; underline-on-hover links inside cells.
- **No sort affordance** on sortable columns, or a sort with no direction indicator; **non-resizable columns**.
- **Modal rename dialogs** instead of inline editing where rows are user-named.
- **Blank empty state** (just an empty pane) instead of an informative placeholder.
- **Heavy gridlines everywhere** turning a content list into a spreadsheet.
- **Keyboard-dead rows** — no arrow navigation, no type-ahead, no ⌘A.

## Accessibility

- Each row is a VoiceOver element with a meaningful label; selection and (in tables) the row's column values are announced.
- **Full keyboard operation**: arrow navigation, range/toggle multi-select, Return to open/rename, sortable headings reachable and operable by keyboard.
- Selection and sort state must **not rely on colour alone** — pair the highlight with focus state, and the sort with a direction arrow glyph.
- Honour **Larger Text**: rows grow and reflow without clipping; maintain the 44pt target as text scales.

## Related
- [sidebars.md](sidebars.md) — the source list that drives the content list; shared flat selection grammar.
- [split-views.md](split-views.md) — the table/list as the secondary content pane.
- [disclosure-outline-and-column-views.md](disclosure-outline-and-column-views.md) — tables that add hierarchy (outline) or browser columns.
- [tab-views-and-boxes.md](tab-views-and-boxes.md) — labels and the colour hierarchy used inside cells.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
