---
title: Writing
hig: https://developer.apple.com/design/human-interface-guidelines/writing
role: foundation
---

# Writing (macOS)

**Purpose.** The words you choose are an essential part of the experience — onboarding, alerts, labels, empty states, error messages, and accessibility descriptions all read better when you design through the lens of language. Apple's guidance is mostly about **voice, tone, clarity, consistency, and helping people avoid/recover from errors**; it's quietly load-bearing, because vague or inconsistent copy makes an app feel foreign even when it looks right.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/writing · (capitalization / ellipsis details live on the sibling pages — see Related).

> **Source note.** The scraped Writing page is the general voice-and-tone guide and ends with *"No additional considerations for … macOS."* It does **not** itself contain the by-element-type capitalization table or the ellipsis-usage rules — those live in the macOS component pages (menus, the menu bar, entering data, alerts). The capitalization/ellipsis guidance below is retained from those sibling pages and marked as such, not as text from this page.

## Key principles (from Apple's Best practices)

- **Determine your app's voice, then match tone to context.** Pick vocabulary your audience knows and a voice that reflects the app's values; vary the tone by situation (direct and serious for an error, light for a congratulation). [HIG]
- **Be clear, and write for everyone.** Choose easily-understood words, cut any word that isn't needed, read it aloud when in doubt; use plain language with accessibility and localization in mind — avoid jargon and gendered terminology. [HIG]
- **Be action-oriented.** Use active voice and verb-first labels for buttons/links — "Send" beats "Let's do it!", and a descriptive link ("Learn more about UX Writing") beats "Click here" (especially for screen-reader users). [HIG]
- **Build language patterns and apply capitalization consistently.** Consistency builds familiarity; choose a capitalization style per UI-element type (e.g. title case for all alerts, sentence case for all headlines) and use it throughout — title case reads formal, sentence case casual. [HIG]
- **Give clear guidance through multi-step flows** with consistent labels ("Get Started" → "Continue"/"Next" → "Done"). [HIG]
- **Use possessive pronouns sparingly** — "Favorites" says as much as "Your Favorites"; if you use *my/your*, stay consistent and don't switch perspective. **Avoid "we"** (unclear referent) — "Unable to load content" beats "We're having trouble loading this content." [HIG]
- **Write for how people use each device** — keep language consistent across devices but use the right gesture verb ("tap" on iPhone/iPad, "click" on Mac) and respect screen size/context (bigger and smaller screens both need brevity). [HIG]

## Metrics & values

There are no numeric values on this page — its guidance is qualitative. The component-specific *rules* below come from the sibling pages and are retained for the renderer:

**Capitalization by element type** [from the macOS menus / entering-data pages, not this page]:

| Title case (labels/commands) | Sentence case (options/prose) |
|---|---|
| Menu titles & menu items | Checkbox labels |
| Push buttons (verb-first) | Radio-button labels |
| Tab / segmented-control titles | Help tags / tooltips |
| Column headings, group-box titles | Alert/dialog *body* text |
| Pop-up menu items + collapsed value | Inline/explanatory text, field hints, captions |
| Window / dialog titles | Notification *body* |

- **Ellipsis = the real `…` character** (Option-`;`), never three periods `...` — assistive tech can't parse three periods. Use it when an action needs more input before completing (*Open…, Save As…, Export…*), opens a separate window/dialog (*Settings…, Customize Toolbar…*), or *always* warns of a dangerous outcome (*Restart…, Shut Down…, Log Out…*); **omit** it when the action completes immediately (*New, Save, Copy*) or only *occasionally* prompts (*Quit, Close*). The dialog title matches the command with the ellipsis removed. [macOS pages]
- **Title style:** capitalize every word except articles (*a, an, the*), coordinating conjunctions (*and, or*), and prepositions ≤4 letters — but always capitalize the first/last word and a short preposition that's part of a verb phrase ("Back Up Now"). **Sentence style:** capitalize only the first word + proper nouns. [macOS pages]

## macOS platform considerations

Apple's Writing page states *"No additional considerations for … macOS."* The voice/tone Best practices apply directly; for Mac-feeling copy, also follow the sibling-page conventions:

- **Use the system's terms** — macOS says **Settings** (not Preferences); align your vocabulary with the platform's.
- **Buttons are verb-first** and name the action ("Save Changes", "Move to Trash", "Don't Save") rather than a bare "OK".
- **Provide clear next steps on blank/empty screens** — guide people on what to do and give them a button/link; don't put crucial info in an empty state that will disappear. [HIG]
- **Write clear error messages:** prevent errors first; when one is needed, **display it as close to the problem as possible, avoid blame, and say how to fix it** — "Choose a password with at least 8 characters" beats "That password is too short"; skip "oops!/uh-oh" interjections. [HIG]
- **Choose the right delivery method** for a message based on urgency/importance/context (notification vs alert vs action sheet), with a tone fit for the situation. [HIG]
- **Keep settings labels clear and simple**; add a short explanation of what a setting does when on (people infer the off behaviour). Link directly to a setting rather than describing its location. [HIG]
- **Show hints in text fields** — label every field and give a placeholder that shows the format ("name@example.com") or describes the input ("Your name"); show errors next to the field and instruct ("Use only letters for your name") rather than scolding ("Invalid name"). [HIG]

## Common non-native mistakes

- **Generic, non-action labels** ("OK", "Let's do it!", "Click here") instead of verb-first, descriptive ones.
- **Inconsistent capitalization** across the same element type, or **mixed terminology** — "Delete" here, "Remove" there for one action.
- **Three periods `...`** instead of the real `…` — or an ellipsis on actions that complete immediately ("Save…").
- **Blame-y or robotic errors** ("You entered an invalid value", "Invalid name") with no fix, or **after-the-fact modal alerts** for things inline validation should have caught.
- **"We" in error copy**, or possessive pronouns used inconsistently.
- **The wrong gesture verb** for the device ("tap" on a Mac).
- **Empty screens with no next step;** **settings labels with no explanation.**
- **Cute/jargon copy** that prizes cleverness over clarity.

## Accessibility

- The real `…` character is announced correctly by VoiceOver; `...` is not — always use `…`.
- Error text placed *near* the problem (Apple: "as close to the problem as possible") supports screen-reader and low-vision users who can't scan the whole window at once.
- Clear, specific labels double as good accessibility labels — vague copy ("Submit", "Item") reads poorly to VoiceOver; descriptive links matter most for screen-reader users (Apple's own point).
- Write with localization and inclusion in mind (plain language, no jargon or gendered terms); don't encode required/error/status in copy *and* colour only — pair with an icon or text (see [accessibility.md](accessibility.md)).

## Related

- [menus-and-context-menus.md](menus-and-context-menus.md) · [the-menu-bar.md](the-menu-bar.md) — menu-item capitalization + ellipsis
- [sheets-and-alerts.md](sheets-and-alerts.md) — error-message + alert copy + delivery method
- [text-fields-and-combo-boxes.md](text-fields-and-combo-boxes.md) — inline validation + field hints
- [toggles-checkboxes-and-steppers.md](toggles-checkboxes-and-steppers.md) — checkbox/radio sentence case
- [accessibility.md](accessibility.md)
- [index.md](index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
