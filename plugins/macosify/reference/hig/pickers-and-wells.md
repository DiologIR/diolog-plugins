---
title: Pickers, Color Wells & Image Wells
hig: https://developer.apple.com/design/human-interface-guidelines/pickers
role: input
---

# Pickers, Color Wells & Image Wells (macOS)

**Purpose.** Three controls for choosing from a constrained domain instead of typing free text. A **picker** displays one or more scrollable lists of **distinct values** to choose from [HIG]. A **color well** lets people adjust the colour of text, shapes, guides, and other onscreen elements, opening a color picker when clicked [HIG]. An **image well** is an editable version of an image view [HIG]. The native rule throughout: choose the **most efficient style for the data**, and reuse the system experience rather than reinventing it.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/pickers · https://developer.apple.com/design/human-interface-guidelines/color-wells · https://developer.apple.com/design/human-interface-guidelines/image-wells

## When to use

- **Picker** — for **medium-to-long lists of items** [HIG]. For a **short** list, prefer a **pull-down button** — a picker can add too much visual weight to a short list [HIG]. For a **very large** set, use a list or table (they adjust in height and tables can include an index) [HIG].
- **Color well** — anywhere people choose a colour for text, shapes, guides, fills, or strokes [HIG].
- **Image well** — a designated spot that shows an image and lets people **copy, paste, delete, or drag a new image in** without selecting it first [HIG].

## Anatomy

- **Picker** — style varies. On macOS a **date picker** comes in two styles: **textual** (compact, for specific date/time selections in limited space) and **graphical** (browse days in a calendar, select a date range, or show a clock face) [HIG]. List/wheel pickers present the value set to scroll and choose from.
- **Color well** — a small swatch showing the current colour; clicking it **highlights the well** for confirmation and opens a color picker, then the swatch updates to the chosen colour [HIG].
- **Image well** — a framed region showing the current image (or an empty placeholder) that accepts drag-and-drop and supports copy/paste/delete.

## Behavior & states

- **Use predictable, logically ordered values** [HIG] — because many of a picker's values are hidden until people interact, an ordering people can predict (e.g. an alphabetized country list) lets them move quickly.
- **Avoid switching views to show a picker** [HIG] — a picker works best displayed in context, below or near the field being edited (typically at the bottom of a window or in a popover) [HIG].
- For a minute list in a date picker, consider **less granularity** — you can increase the interval as long as it divides evenly into 60 (e.g. quarter-hour: 0, 15, 30, 45) [HIG].
- **Color well**: clicking highlights the well and opens a color picker; **color wells support drag and drop**, so people can drag colours between wells and from the color picker into a well [HIG].
- **Image well**: after selecting it, people can copy/paste or delete its image, and can drag a new image in without selecting first [HIG]. **Revert to a default image** if the well requires one and people clear it [HIG].
- States: enabled, focused (accent ring), selected/filled, empty (image-well placeholder), disabled, drag-over.

## Metrics & layout

- Date-picker style follows space and intent: **textual** for limited space and specific selections; **graphical** for browsing/ranges or a clock-face look [HIG].
- A color well is a compact swatch sized to read the colour clearly; an image well is sized to its content with a clear frame and an empty-state affordance.
- Label pickers/wells with **title-case-plus-colon** labels ("Accent Color:", "Start Date:") consistent with other form fields.
- Controls take the system control shape; shape isn't customizable.

## Native macOS conventions

- **Prefer the system-provided color picker** — it gives a consistent, familiar experience and lets people **save a set of colours accessible from any app** [HIG]. (A color well can present a custom picker, but the built-in one is the native default and the clearest non-native tell when replaced.)
- Choose date entry by efficiency: textual/graphical per the guidance above; don't make people spin through long ranges.
- Image wells should accept the gestures Finder users expect — **drag in, paste, drag out, Delete to clear** — and **keep the standard Copy/Paste menu items available** (people expect those menu items and shortcuts) [HIG].
- Default **arrow cursor**; single accent focus ring; previews update live.

## Common non-native mistakes

- **A bespoke colour dialog** instead of the system color picker — losing shared, cross-app saved swatches and the familiar experience [HIG].
- **A picker for a short list** that a pull-down button would serve better, or a picker for a very large set that should be a list/table [HIG].
- **Switching views to present a picker** instead of showing it in context [HIG].
- **An image well that ignores copy/paste/drag** or omits the standard Copy/Paste menu items [HIG].
- **No empty/placeholder, drag-over, or default-image revert state** on an image well [HIG].
- **Unpredictably ordered picker values** that force slow scanning [HIG].

## Accessibility

- Pickers must be **fully keyboard-operable** (arrow keys to move through values/dates, Return to commit) and announce the current value plus range.
- The color well must expose its current colour to assistive tech and be activatable from the keyboard; the system color picker is already accessible — another reason to use it.
- Image well: provide an accessible label/description of the current image, keyboard alternatives for drop (paste/choose), and focus + drag-over indication that isn't colour-only.
- Honor `prefers-contrast` for well borders and `prefers-reduced-motion` for picker transitions.

## Related

- [text-fields-and-combo-boxes.md](text-fields-and-combo-boxes.md) — free text / combo box vs a constrained picker
- [segmented-controls-and-sliders.md](segmented-controls-and-sliders.md) — sliders for approximate values
- [search-and-token-fields.md](search-and-token-fields.md) — search/token fields for filtering large sets
- [index.md](index.md)
- [../DESIGN.md](../DESIGN.md)
