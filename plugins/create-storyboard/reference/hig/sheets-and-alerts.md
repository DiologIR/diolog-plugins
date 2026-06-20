---
title: Sheets & Alerts
hig: https://developer.apple.com/design/human-interface-guidelines/sheets
role: presentation
---

# Sheets & Alerts (macOS)

**Purpose.** Sheets and alerts are the two correct ways to present a modal, window-anchored task on macOS. A **sheet** helps people perform a scoped task closely related to their current context; an **alert** gives people critical information they need right away. Both replace the generic "centered dialog box" that makes an Electron app feel non-native.

**Apple HIG:** [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) · [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)

## When to use

- **Sheet** — request specific information or present a simple task people complete before returning to the parent view (supply info to complete an action, attach a file, choose a save location). In macOS a sheet is **always modal**. [HIG]
- **Alert** — reserve for genuinely **critical** moments: telling people about a problem, warning when an action might destroy data, confirming an important action they initiated. **Use alerts sparingly** and only when actionable. [HIG] An **error** is shown as an alert, not a passive notification ([HIG]: avoid using an alert merely to provide information — if it's only informative, communicate it in context).
- **For complex or prolonged flows, consider alternatives to sheets** [HIG] — open a new **window** or go full screen instead. A sheet that grows into a wizard is a window in disguise.
- **Use a panel instead of a sheet if people need to repeatedly provide input and observe results** [HIG] (e.g. find-and-replace).

## Anatomy

**Sheet** — in macOS a **card-like view with rounded corners** that floats on top of its parent window; the parent is **dimmed** while the sheet is onscreen. [HIG] Common buttons: **Cancel/Close** (dismiss without saving), **Done** (dismiss after completing or saving), and **Back** (move to a previous step — not a dismiss). [HIG]

**Alert** — a modal view with a **title**, **optional informative text**, and **up to three buttons** [HIG]. On macOS an alert automatically shows the **app icon** (you can supply an alternate icon/symbol) and may add a **suppression checkbox** (for repeating alerts), a **Help button**, an optional **text field**, and a custom **accessory view**. [HIG]

## Behavior & states

- **Display only one sheet at a time** from the main interface [HIG]. If something in a sheet would open another sheet, **close the first sheet before showing the new one** (you can re-show the first afterwards). Don't return people from one sheet to another.
- A sheet **dims and blocks its parent window only** — people **expect to interact with other app windows before dismissing a sheet**, so let them bring other windows forward. [HIG]
- **Provide an alternative to the Done button** [HIG] — always pair Done with a Cancel (clear way to dismiss without saving) or a Back button. Relying solely on Done implies completing the task is the only exit. **Avoid showing all three** — Cancel, Done, and Back — **together**. [HIG]
- An alert is modal and dismissed by choosing a button; it has no traffic-light close. Provide quick ways to cancel: **Escape** or **⌘-Period** cancels an alert. [HIG]

## Metrics & layout

- Alert **≤ 3 buttons**: **[HIG]**.
- **Button placement** [HIG] (updated Mar 2026): place the button people are **most likely to choose** on the **trailing (right)** side of a row (or at the top of a stack); **always place the default button on the trailing side / top**; **Cancel** goes on the **leading (left)** side of a row / bottom of a stack.
- A **destructive action is NEVER the default**, and a destructive alert **always includes a Cancel** button. [HIG] To make people actually read an alert, **avoid making any button the default** (so they don't auto-press Return). [HIG]
- Sheet shown at a **reasonable default size** suited to its content; support resizing where it helps. [HIG]

## Native macOS conventions

- A macOS sheet is **owned by its parent window** and brings that window (and its modeless document panels) to the front — it isn't a free-floating centered box. [HIG]
- **Write a title that clearly and succinctly describes the situation** [HIG] — be specific (what happened, the context, and why). Avoid useless titles like "Error" or "Error 329347 occurred", and avoid titles wrapping past two lines. Add informative text only if it adds value.
- **Create succinct, logical button titles** — one or two words, verbs/verb phrases tied to the alert text ("View All", "Reply", "Erase"). **Avoid "OK" as the default unless the alert is purely informational** (its meaning is ambiguous); avoid "Yes"/"No". Always title a cancel button **"Cancel"**. [HIG]
- **Use the destructive style** only for a destructive action people **didn't deliberately choose** [HIG] — if they explicitly invoked it (Empty Trash), the confirming button is *not* destructive-styled, so Return can confirm their intent.
- **Use a caution symbol** (e.g. exclamationmark.triangle) **sparingly** [HIG] — only when extra attention is needed (unexpected data loss), not for ordinary overwrite/delete.
- **Avoid showing an alert when your app starts** [HIG] — make important launch info discoverable instead (cached/placeholder data + a non-intrusive label).

## Common non-native mistakes

- ❌ A **generic centered modal** for tasks that should be a window-anchored sheet.
- ❌ **Button order reversed** (default on the left / Cancel on the right) — that's a Windows convention.
- ❌ A **destructive action set as the default** button, or destructive confirmation with **no Cancel**.
- ❌ Surfacing an **error as a toast/notification** instead of an alert; or using an alert merely to inform.
- ❌ **More than 3 buttons** in an alert, or rich/scrolling content shoehorned into an alert.
- ❌ A sheet showing **all three of Cancel/Done/Back**, or relying on Done alone.
- ❌ **Stacking** a second sheet over a sheet, or showing an alert *at launch*.
- ❌ **Vague titles** ("Error", "Are you sure?") and ambiguous **OK / Yes / No** verbs on consequential actions.

## Accessibility

- VoiceOver reads title → message → buttons; keep that order meaningful. Don't rely on red alone for destructive — the style + verb must convey risk.
- Default button responds to **Return**; **Escape** / **⌘-Period** cancels [HIG]. Ensure full keyboard navigation across all buttons.
- A suppression checkbox and Help button must be keyboard-reachable; honour `prefers-reduced-transparency` / `prefers-contrast` on the sheet material and alert chrome.

## Related

- [modality.md](./modality.md) — when modality is justified at all
- [popovers-and-panels.md](./popovers-and-panels.md) — the non-modal, transient alternative
- [windows.md](./windows.md) — use a window for complex multi-step flows
- [index.md](./index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
