---
title: Text Fields & Combo Boxes
hig: https://developer.apple.com/design/human-interface-guidelines/text-fields
role: input
---

# Text Fields & Combo Boxes (macOS)

**Purpose.** A **text field** is a rectangular area in which people enter or edit small, specific pieces of text [HIG]. A **combo box** combines a text field with a pull-down button in one control: people can type a custom value *or* click the button to pick from a list of predefined values [HIG]. Getting the size, label/placeholder casing, validation timing, and (for combo boxes) the type-or-pick model right is what makes an input read like AppKit rather than a generic web `<input>`.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/text-fields · https://developer.apple.com/design/human-interface-guidelines/combo-boxes

## When to use

- **Text field** — to request a **small amount of information**, such as a name or an email address [HIG]. For larger amounts of text, use a **text view** instead [HIG].
- **Secure text field** — to hide private data; always use a secure field when asking for sensitive data such as a password [HIG].
- **Combo box** — when you need to **pair text input with a list of choices** [HIG]: a value usually drawn from a known list, but where people may also supply a custom one. (A custom value the person types is **not** added to the list of choices [HIG].) If the set is small and closed, a pop-up button is better; if it's a list to *filter*, use a search field.

## Anatomy

- **Field body** — recessed editable region with a hairline border and a subtle inner top shadow (the native "carved-in" look), an insertion caret, and optional text.
- **Placeholder** — hint text such as "Email" or "Password" shown only when the field is empty; it disappears when people start typing [HIG].
- **Label** (optional but recommended) — a separate static caption describing the field, useful because the placeholder vanishes on input [HIG].
- **Combo box adds** a pull-down button that opens the list of predefined values; typing enters a custom value, clicking the button picks an existing one [HIG].
- **Clear / validation affordances** — inline validation messaging near the field; on iOS/iPadOS a trailing Clear button erases input [HIG] (less common on the Mac).

## Behavior & states

- States: enabled, focused (accent focus ring), filled, empty (placeholder visible), disabled (dimmed), invalid (error styling + message).
- **Validate fields when it makes sense** [HIG], and pick the right moment: an email address is best validated **when people switch to another field**, but a new user name or password should be validated **before** people leave the field [HIG].
- **Use a number formatter for numeric data** — it configures the field to accept only numeric values and can present them as a percentage, currency, or with set decimals; don't hard-code presentation, since formatting varies by locale [HIG].
- **Tabbing flows in a logical sequence** [HIG] — the system usually achieves this automatically; rarely customize it.
- Adjust line breaks to the field's needs: by default text beyond the bounds is clipped, but you can wrap (at character/word level) or **truncate with an ellipsis** at the start, middle, or end [HIG]. Consider an **expansion tooltip** to reveal clipped/truncated text on hover [HIG].
- Combo box: opening the list doesn't commit until the person picks or types; a typed custom value stays as entered and isn't added to the list [HIG].

## Metrics & layout

- **Match the field's size to the anticipated text** [HIG] — its width helps people gauge how much input to provide.
- **Evenly space multiple fields**; stack them vertically where possible and use **consistent widths** for an organized layout (e.g. first/last name one width, address/city another) [HIG].
- **Labels** use **title-style capitalization and end with a colon** ("Email:", "Display Name:") [HIG].
- **Placeholders** are **sentence case with no terminal punctuation** ("Search artists and albums") [HIG].
- Combo box: **keep list items no wider than the text field** — too-wide items get truncated and are hard to read [HIG]. Populate the field with a **meaningful default value** drawn from the list (it needn't be the first item) [HIG].
- Native field has a **recessed inner top shadow** + hairline border; controls in this era take the system Liquid Glass shape, which isn't customizable.

## Native macOS conventions

- Right-align labels in a column so colons line up and fields share a left edge (classic Mac form layout), or stack label-above-field for denser forms.
- Combo box vs pop-up button: **combo box = type-or-pick** (open set); **pop-up button = pick-only** (closed set).
- Provide **relevant choices** in a combo box — people value both entering a custom value and the convenience of likely choices [HIG].
- Default **arrow cursor** over the control; I-beam only over the editable text region. Single accent focus ring.
- Support standard editing: Cut/Copy/Paste, Undo, ⌘A select-all, services, and the system text-replacement/spelling where appropriate.

## Common non-native mistakes

- **Title-casing or punctuating placeholders** ("Enter Your Email Address.") — placeholders are sentence case with no period; only labels are title case + colon.
- **Using the placeholder as the only label** — it vanishes on input, so add a separate descriptive label [HIG].
- **A flat, borderless web input** with no recessed inner shadow — reads instantly as non-native.
- **A combo box for a tiny closed set** (use a pop-up button), or a free text field where a stepper/picker would be more accurate.
- **Combo-box list items wider than the field** (they truncate), or no meaningful default value.
- **Validation in a far-away toast or only on Submit**, instead of inline near the field at the right moment.
- **I-beam cursor over the whole control** (including its border/buttons) rather than just the text region.

## Accessibility

- Always provide a programmatic **accessible label** even when the visual label is omitted; the placeholder is a hint, not the name.
- Announce **validation errors** via the field's accessibility value/description and move focus or alert appropriately — never by colour alone.
- Full keyboard operability: logical Tab order, Esc to dismiss a combo list, Return to commit.
- Honor `prefers-contrast` (firm the field border/shadow) and ensure placeholder/label text meets contrast minimums (placeholder is dim — never put essential meaning only in it).

## Related

- [search-and-token-fields.md](search-and-token-fields.md) — search fields, token fields, scopes
- [pickers-and-wells.md](pickers-and-wells.md) — constrained pickers vs free text
- [toggles-checkboxes-and-steppers.md](toggles-checkboxes-and-steppers.md) — steppers paired with number fields
- [index.md](index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
