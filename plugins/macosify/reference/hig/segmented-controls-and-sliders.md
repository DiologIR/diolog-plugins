---
title: Segmented Controls & Sliders
hig: https://developer.apple.com/design/human-interface-guidelines/segmented-controls
role: input
---

# Segmented Controls & Sliders (macOS)

**Purpose.** A **segmented control** is a linear set of two or more segments, each of which functions as a button [HIG]; on macOS it offers a single choice or multiple choices from a small, closely related set, scoped *inside* the current view. A **slider** is a horizontal track with a draggable **thumb** people adjust between a minimum and maximum value [HIG]. Both go wrong natively when overloaded — a segmented control standing in for main-window view switching, or a slider where a precise number is required.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/segmented-controls · https://developer.apple.com/design/human-interface-guidelines/sliders

## When to use

- **Segmented control** — to provide **closely related choices that affect an object, state, or view** [HIG]: choose one or, on macOS, **one or several** related options (e.g. Keynote's single-select alignment control vs its multi-select bold/italic/underline control), or a set of momentary action buttons that show no selection [HIG].
- **Keep control types consistent within one control** — don't mix action segments and selection segments in the same control [HIG].
- **For view switching in the main window area, use a tab view — not a segmented control** [HIG]; reserve segmented controls for switching views in a **toolbar or inspector pane** [HIG].
- **Slider** — to set an **approximate value across a range** where the range matters more than an exact number (opacity, size, brightness). Use a **circular slider** when values repeat or continue indefinitely (e.g. 0–360° rotation) [HIG].
- For precise numeric entry, **supplement the slider with a text field and stepper** rather than relying on the slider alone [HIG].

## Anatomy

- **Segmented control** — adjoined segments, usually **equal in width**; each segment can contain **text or images**, optionally with a text label beneath the segment or the whole control [HIG].
- **Slider** — a track with a draggable thumb between a **minimum** and **maximum**; the portion from the minimum to the thumb **fills with colour** [HIG]. macOS sliders can include **tick marks** to pinpoint values; a **linear** slider's thumb is a narrow lozenge and a **circular** slider's thumb is a small circle with tick marks as evenly spaced dots [HIG]. Optional left/right icons illustrate the min/max meaning [HIG].

## Behavior & states

- Segmented control: selecting a segment changes the choice; single-select deselects the rest, multi-select toggles each independently; momentary segments perform an action with no selection state. Left/Right arrows move selection when focused.
- States: each segment can be selected, unselected, or disabled; the whole control can be focused (accent ring).
- Slider: dragging the thumb (or clicking the track / arrow keys) changes the value. **Give live feedback as the value changes** — show results in real time (e.g. Dock icons scale as you drag the Size slider) [HIG].
- People expect familiar directions: **minimum on the leading side / bottom, maximum on the trailing side / top** [HIG].

## Metrics & layout

- **Limit the number of segments** — aim for **no more than about five to seven in a wide interface, and no more than about five on iPhone** [HIG]; beyond that, use a pop-up button or list.
- **Keep segment size consistent** — equal width feels balanced, and keep icon/title widths consistent too; use similar-size content per segment [HIG].
- **Prefer either text OR images — not a mix — in a single segmented control** [HIG]; mixing the two looks disconnected and confusing.
- Use **nouns or noun phrases with title-style capitalization** for segment labels; a text-labelled control needs no introductory text [HIG].
- **Use tick marks to increase clarity and accuracy** on a slider, and consider **labelling tick marks** — often labelling only the min and max is enough; label more only to reduce confusion [HIG].
- **Slider introductory labels use sentence-style capitalization and end with a colon** [HIG] — note this differs from the title-case-plus-colon used for most form-field labels.

## Native macOS conventions

- Segmented control = an in-view / toolbar / inspector option or mode switch; **tab view = main-window view switching** [HIG]; pop-up button = pick one from a longer closed list. Don't blur these roles.
- **Add a label below each segment** when segments use symbols, and **provide a tooltip per segment** if your app uses tooltips [HIG]. Consider **introductory text** to clarify the control's purpose [HIG].
- Consider **spring loading** so people can activate a segment by dragging items over it and force-clicking [HIG].
- **Give live feedback** as a slider changes, and **provide a tooltip showing the thumb's value** on hover [HIG].
- Default **arrow cursor** over both controls; single accent focus ring.

## Common non-native mistakes

- **A segmented control for main-window view switching** — use a tab view; keep segmented controls to toolbars/inspectors [HIG].
- **Too many segments** (well past ~7) or **inconsistent-width** segments [HIG].
- **Mixing text and icons in one segmented control**, or mixing selection segments with action segments [HIG].
- **A slider for a value the user must set exactly** (a price, a count, a date) instead of a field/stepper/date picker [HIG].
- **No live feedback** while dragging a slider [HIG].
- **Reversed min/max direction** that breaks people's leading-to-trailing expectation [HIG].
- **Title-casing a slider's introductory label** — slider labels are sentence case + colon [HIG].

## Accessibility

- Expose each segment as an individually selectable element with its label and selected state; the whole control as a single grouped control to assistive tech.
- Slider must announce **current value, min, max, and step**, and be adjustable with arrow keys (and larger jumps via modifier/page keys).
- Keep the selected segment / slider value distinguishable **without colour alone** (fill + position) [HIG]; honor `prefers-contrast` and `prefers-reduced-motion`.
- Ensure tick/segment labels meet contrast minimums.

## Related

- [toggles-checkboxes-and-steppers.md](toggles-checkboxes-and-steppers.md) — steppers/fields for precise numbers
- [pickers-and-wells.md](pickers-and-wells.md) — pickers for known finite value sets
- [search-and-token-fields.md](search-and-token-fields.md) — tab bars vs in-view option switches
- [index.md](index.md)
- [../DESIGN.md](../DESIGN.md)
