---
title: Searching, Settings & Undo
hig: searching
role: pattern
---
# Searching, Settings & Undo (macOS)

**Purpose.** Three workhorse Mac patterns that are easy to get subtly wrong: **searching** (one clear location, visible scope, suggestions), the **Settings window** (a real window opened with ⌘, from the App menu — not an in-app route), and **undo/redo** (⌘Z / ⇧⌘Z, named in the Edit menu, supported throughout). Plus the basics of **entering data** without friction.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/searching · https://developer.apple.com/design/human-interface-guidelines/settings · https://developer.apple.com/design/human-interface-guidelines/undo-and-redo · https://developer.apple.com/design/human-interface-guidelines/entering-data

## Searching

**When:** to find content within an app, a document, or systemwide. People expect a **search field**.

**Behavior:**
- **If search is important, give it a primary position** (a toolbar field, a dedicated tab). [HIG]
- **Make content searchable through a single, clearly identified location** so people can find anything in one place; a local per-section search can still act as a filter on the current view. [HIG]
- **Clearly display the current scope** with descriptive placeholder text, a scope bar, or a title (Mail always shows which mailbox is being searched). [HIG]
- **Provide suggestions** — show recent searches before typing and predictive suggestions while typing to help people search faster and type less. [HIG]
- **Take privacy into account** before showing search history, and **give people a way to clear it.** [HIG]
- Make the field **clearable** (the ✕ in the field) and surface a clear **"no results"** state with a hint on how to broaden.
- Make content **indexable in Spotlight** so people can find it without opening the app. [HIG]

**Metrics:** ⌘F opens a Find window; **⌥⌘F jumps to the search field** [HIG]; the search field and its clear button meet **44×44pt** [HIG]. No fabricated debounce number — tune to feel [convention].

## Settings

**When:** for **general, infrequently changed** app-wide configuration.

**Behavior — this is the high-risk part:**
- **Settings open as a real, separate window** — *"When people choose the Settings item in your app's App menu, your custom settings window opens"* — **not** an in-app route or a full-screen page. Opened with **⌘,** [HIG].
- **Include a Settings item in the App menu**; *"avoid adding settings buttons to a window's toolbar"* (document-level options go in the File menu instead). [HIG]
- It's a **toolbar with tab panes** (General, Appearance, etc.). Use a **noncustomizable toolbar that stays visible and always indicates the active button**; the window **accommodates the size of the current pane**. [HIG]
- **Update the window title to the visible pane** (or use **"App Name Settings"** for a single pane), and **restore the most recently viewed pane** on reopen. **Dim the window's minimize/maximize buttons** (it's quick to reopen with ⌘,). [HIG]
- **Minimize the number of settings** — too many make the app feel less approachable and hard to navigate. **Aim for defaults that suit most people** so they may not need to change anything. [HIG]
- **Put task-specific options inline** in the view they affect, not in Settings, where they'd be disconnected from context. **Respect systemwide settings** — don't duplicate global OS options (appearance, scrolling, accessibility) in your own Settings. [HIG]

> This app's own convention: Settings opens as a real window (`app:open-settings-window`, singleton, ⌘,, in the app menu; renderer branches on `#window=settings`) — an in-app settings *route* would be the non-native mistake.

## Undo & Redo

**When:** for content-modifying actions. Undo is the Mac's safety net and the reason confirmations are rare; it also lets people *"explore and experiment safely."* [HIG]

**Behavior:**
- **Place Undo/Redo at the top of the Edit menu and support ⌘Z / ⇧⌘Z.** (⇧⌘Z is redo when undo and redo are separate commands rather than toggled on ⌘Z.) [HIG]
- **Help people predict the result** — modify the menu-item labels to name the action ("Undo Typing", "Redo Bold"). [HIG]
- **Show the result of an undo/redo** — if it affects offscreen content, scroll to reveal it so people don't think nothing happened and repeat the action. [HIG]
- **Let people undo multiple times** without arbitrary limits — they expect to undo everything since a logical step (opening or saving); consider reverting a batch of related changes at once. [HIG]
- **Provide Undo/Redo buttons only when necessary** — people expect the Edit menu and shortcuts; if you do add buttons, use the standard symbols in a toolbar. [HIG]
- An action with **no real undo** (an irreversible send, a hard delete) should **confirm** instead — the exception, not the rule.

## Entering data

**When:** any form, field, or data-capture flow.

**Behavior:**
- **Get information from the system whenever possible** — don't ask for what you can gather automatically or with permission (location, calendar). [HIG]
- **Be clear about the data you need** (a prompt like "username@company.com" or an introductory label) and **prefill reasonable defaults.** [HIG]
- **Offer choices over text entry** where it makes sense (picker, menu, stepper, toggle) — choosing is easier than typing — and let people **drag-and-drop or paste** data in. [HIG]
- **Validate dynamically** — verify values as people enter them and give feedback as soon as a problem is detected, **inline** next to the field, so they fix it right away (use a number formatter for numeric fields). [HIG]
- **Use a secure field for sensitive data and never prepopulate a password field**; ask for it or use biometric/keychain auth. [HIG]
- **Make required data clear** — e.g. enable Next/Continue only once the required fields are filled. [HIG]

## Metrics / values
- **⌘, → Settings; ⌘Z / ⇧⌘Z → Undo / Redo; ⌘F → Find; ⌥⌘F → search field.** [HIG]
- Controls and clear buttons: **44×44pt**. [HIG]

## Native macOS conventions
- The **menu bar** carries Find (Edit/View), Undo/Redo (Edit, named), and Settings (App menu) with their key equivalents — the discoverable index of these features.
- Settings uses the system settings-window idiom (a stable, noncustomizable toolbar of panes); search uses the system search field; an **expansion tooltip** can show clipped text in a small field. [HIG]

## Common non-native mistakes
- **Settings as an in-app route / full-screen page** instead of a real window opened by ⌘, from the App menu — the headline non-native mistake here. [HIG]
- **A settings button in the window toolbar**; ⌘, not mapped; no Settings… item in the App menu. [HIG]
- **Duplicating systemwide OS settings** inside the app. [HIG]
- **Undo missing or shallow** (single-level, or some actions silently un-undoable); a bare "Undo" with no action name; not showing the result of an undo. [HIG]
- **A confirmation dialog where undo would do**, or no undo for a reversible action.
- **Search with no clear scope, no suggestions, no result count / no-results state**, or scattered across many locations. [HIG]
- **Per-keystroke validation that fights the user** instead of timely feedback; errors shown far from the field or as a toast.
- **Over-long forms** with everything required and no defaults; prepopulating a password field. [HIG]

## Accessibility
- Search field, settings panes, and form fields are all **keyboard-reachable** with a visible focus ring and exposed to VoiceOver with labels.
- Inline validation errors are announced (live region) and never colour-only — pair with icon + text.
- Required/optional state is conveyed in text, not just colour.
- Honour **Reduce Motion** for search-results and settings-pane transitions.

## Related
- [keyboard-and-pointing.md](keyboard-and-pointing.md) — the standard shortcuts (⌘,/⌘Z/⌘F/⌥⌘F), Tab order, focus.
- [feedback.md](feedback.md) — undo over confirmation; inline validation feedback; in-app notification settings.
- [launching-fullscreen-and-onboarding.md](launching-fullscreen-and-onboarding.md) — Help menu and contextual tooltips.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
