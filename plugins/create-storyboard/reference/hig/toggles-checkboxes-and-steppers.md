---
title: Toggles, Checkboxes & Steppers
hig: https://developer.apple.com/design/human-interface-guidelines/toggles
role: input
---

# Toggles, Checkboxes & Steppers (macOS)

**Purpose.** A **toggle** lets people choose between a pair of opposing states (on/off) using a different appearance for each state [HIG]; on macOS it takes the **switch** or **checkbox** style, and the platform also defines **radio buttons** for similar behaviour [HIG]. A **stepper** is a two-segment control to increase or decrease an incremental value [HIG]. The biggest native tells: using a switch and checkbox interchangeably, and using a bare stepper that displays no value.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/toggles · https://developer.apple.com/design/human-interface-guidelines/steppers

## When to use

- **Switch** — an emphasized setting. A switch has **more visual weight than a checkbox**, so prefer it for settings you want to emphasize or that control **more functionality** — for example turning a **whole group of settings** on/off [HIG].
- **Checkbox** — a minor setting, or to **present a hierarchy of settings**: the checkbox visual style aligns well and communicates grouping, with indentation showing dependencies (a parent governing subordinate checkboxes) [HIG]. **In general, don't replace a checkbox with a switch** — if you're already using a checkbox, keep it [HIG].
- **Radio buttons** — a set of **more than two mutually exclusive options**, typically shown in groups of two to five, each with a unique label [HIG]. Avoid more than about five; beyond that use a pop-up button [HIG]. For a single on/off, prefer a checkbox [HIG].
- **Stepper** — small, precise increments by a few clicks. Pair a stepper with a **text field** when large value changes are likely, so people can also enter specific values [HIG].
- A toggle always manages the **state** of something — for other actions (e.g. choosing from a list), use a different component such as a pop-up button [HIG].

## Anatomy

- **Switch** — a track with a sliding knob; on/off shown by knob position + a colour fill. On macOS you can also supply a label describing the state it controls [HIG].
- **Checkbox** — a small square button: **empty when off, a checkmark when on, and a dash when the state is mixed**; typically with a title on its trailing side (it can appear titleless in an editable checklist) [HIG].
- **Radio button** — a small circular button followed by a label; **filled when selected, empty when deselected** [HIG].
- **Stepper** — two joined up/down segments; it **doesn't display a value itself**, so it sits next to a field that shows the current value [HIG].

## Behavior & states

- **Make state changes obvious** — add/remove a colour fill, show/hide a background shape, or change inner detail (checkmark/dot). **Don't rely on colour alone**, since not everyone can perceive the difference [HIG].
- Checkboxes support a **mixed** state: a parent checkbox shows mixed when its subordinate checkboxes have different states (e.g. a "text style" parent over bold/italic/underline) [HIG].
- Stepper: clicking a segment changes the value by one increment; it **clamps at its range bounds**. The paired field validates typed entry back into range.
- States: switch on/off; checkbox on/off/mixed; radio selected/deselected; all can be focused (accent ring) or disabled (dimmed).

## Metrics & layout

- **Use switches, checkboxes, and radio buttons in the window body, not the window frame** — in particular avoid them in a toolbar or status bar [HIG].
- Within a grouped form, **use a mini switch** to keep row heights consistent (its height is similar to buttons and other controls); use a regular switch for a primary setting and **mini switches for subordinate rows** [HIG].
- **Make the stepper's affected value obvious** — because the stepper shows no value, people must know which value they're changing [HIG].
- Align checkboxes on their leading edge and indent to show dependency [HIG]. Use **consistent spacing** for horizontal radio buttons, sized to the longest label [HIG].
- The switch shape is the system control shape and isn't customizable; don't redraw it as a square or a pill of your own.

## Native macOS conventions

- Switch = "an emphasized / group-level setting"; checkbox = "a minor option or part of a hierarchy"; radio buttons = "a small mutually-exclusive set." Choose by meaning, then stay consistent app-wide.
- **For large stepper ranges, support Shift-click** to change the value by more than the default increment (e.g. 10× the default) [HIG].
- Consider a **label to introduce a group of checkboxes** if their relationship isn't clear; align the label's baseline with the first checkbox [HIG].
- Default **arrow cursor** over the controls; single accent focus ring.

## Common non-native mistakes

- **Putting switches/checkboxes/radio buttons in the toolbar or status bar** — they belong in the window body [HIG].
- **Swapping existing checkboxes for switches** (or vice-versa) — they signal different emphasis and grouping models [HIG].
- **Switches for a multi-select hierarchy** where checkboxes align and group better.
- **A bare stepper with no value display**, so people can't see what they're setting [HIG].
- **A stepper used for a large range** with no paired field for typed entry [HIG].
- **Multiple checkboxes for mutually-exclusive options** instead of radio buttons [HIG], or too many radio buttons where a pop-up button fits [HIG].
- **Conveying state by colour alone** [HIG].

## Accessibility

- Expose the correct **role/trait**: switch vs checkbox (and the checkbox's mixed state) so VoiceOver announces "on/off" vs "checked/unchecked/mixed" correctly; radio buttons as a single-selection group.
- Fully keyboard operable: Space toggles a focused switch/checkbox; arrows adjust a focused stepper; everything reachable via Tab.
- **Never convey on/off by colour alone** [HIG] — knob position / checkmark carries state; honor `prefers-contrast`.
- A stepper's paired field must accept typed entry as an accessible alternative to repeated clicking [HIG].

## Related

- [text-fields-and-combo-boxes.md](text-fields-and-combo-boxes.md) — the field a stepper pairs with
- [segmented-controls-and-sliders.md](segmented-controls-and-sliders.md) — sliders for continuous/approximate values
- [pickers-and-wells.md](pickers-and-wells.md) — pickers for a known finite set
- [index.md](index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
