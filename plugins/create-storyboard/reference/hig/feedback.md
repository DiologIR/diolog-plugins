---
title: Feedback
hig: feedback
role: status
---
# Feedback (macOS)

**Purpose.** Acknowledge every action and surface results at the right severity, the Mac way. Covers matching the significance of information to how it's delivered, choosing between an **alert**, a **notification**, and **inline** status feedback, confirming success only when it matters, notification interruption levels and permission, and badges.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/feedback · https://developer.apple.com/design/human-interface-guidelines/managing-notifications

## When to use

- **Match the significance of the information to the way it's delivered.** Status that people can view when they need it works well delivered passively; *"a warning about possible data loss needs to interrupt people so they have a chance to avoid the problem."* [HIG]
- **Integrate status feedback into the interface, near the items it describes,** so people get information without leaving their context (e.g. Mail shows the last-updated time and unread count in the mailbox toolbar). This **inline** feedback is the quietest and most native — reach for it before an alert or notification. [HIG]
- **Alert** — to deliver **critical and ideally actionable** information; especially **errors** and destructive confirmations. By design an alert disrupts the current context, so match the importance to the interruption — *"Alerts can lose their impact if you use them too often or to deliver unimportant information."* **Errors → an alert, never a notification.** [HIG]
- **Notification** — for **background / time-relevant** information the user may not be in the app for (a finished export, an incoming message, a scheduled event). Requires the user's **permission** and respects Focus/scheduled delivery. Never use it for an error the user is actively waiting on. [HIG]

## Behavior

- **Warn only about unexpected, irreversible data loss.** *"Don't warn people when data loss is the expected result of their action"* — the Finder doesn't confirm every time you throw away a file. [HIG]
- **Confirm a significant action only when it matters.** People expect actions to succeed, so reserve success confirmation for sufficiently important tasks (e.g. an Apple Pay transaction); otherwise *"they only need to know when it doesn't."* [HIG]
- **When a command can't be carried out, show it and explain why** (Maps tells you it can't route to and from the same place). [HIG]
- **Alerts** state the problem in the **title**, give context in the body, and offer **clear, verb-named buttons** ("Delete", "Discard", "Keep") — not "OK/Cancel" for a consequential choice. The default (accent) button is the safe/expected one; a destructive button is styled destructive and is **not** the default. Don't stack alerts. (See [sheets-and-alerts].)
- **Notification interruption levels** (set per noncommunication notification, so the system knows when to deliver): **Passive** (view at leisure), **Active** (the default — appreciated when it arrives), **Time Sensitive** (impacts the person, needs immediate attention; can break through Focus/scheduled delivery), **Critical** (urgent health/safety; rare, requires an entitlement, overrides the Ring/Silent switch). **Build trust by representing urgency accurately** — don't dress low-priority info as Time Sensitive. [HIG]
- **Confirmations / undo:** macOS leans on **undo over confirmation** — prefer a reversible action + an Edit-menu Undo to a "Are you sure?" dialog (see [searching-settings-and-undo.md](searching-settings-and-undo.md)). Transient toasts are not a native staple; use them sparingly and never for actions the user must catch in time.

## Metrics / values

- **Badges = unread counts only** — a small filled oval with a number on the app/source icon. Never a generic dot for "something changed", never progress, never a non-count. [HIG]
- Notifications require **permission** before sending and an **in-app settings screen** to change the choice; never send marketing/promotional notifications without explicit opt-in, and **never use Time Sensitive for marketing.** [HIG]
- Feedback latency: respond within **~100 ms / one or two frames**; anything slower needs a progress indicator (see [progress-and-status-indicators.md](progress-and-status-indicators.md)). [convention]
- Alert button hit target: **44×44pt**. [HIG]

## Native macOS conventions

- Use the **system alert** (`NSAlert` / SwiftUI `.alert`) so it inherits appearance, button layout, and Return = default / Esc = cancel.
- Route background completions through the **system Notification Center**, gated by the user's permission and **respecting Focus / scheduled delivery** — don't fake an in-app banner that ignores them. [HIG]
- **Provide feedback through multiple channels** (colour, text, sound, haptics) so people receive it whether they silence the device, look away, or use VoiceOver. [HIG]
- **Haptics (Force Touch trackpad):** light and meaningful only — a subtle alignment/snap or a Force-click detent. Don't buzz on ordinary clicks; most Macs have no haptic hardware, so haptics are an *enhancement*, never the only signal.
- The **menu-bar/dock badge** is the canonical "you have N unread" surface; keep your in-app count in sync.

## Common non-native mistakes

- **No feedback on action** — the click does something but nothing visibly changes.
- **An error shown as a toast/notification** instead of an alert — the user misses it, then loses data. [HIG]
- **A confirmation dialog for an expected, reversible action** instead of just doing it (+ Undo), or warning on routine deletes. [HIG]
- **Overusing alerts** for unimportant information — they lose their impact. [HIG]
- **Notification overuse** for in-app, in-the-moment status the user is already watching; **mis-rating urgency** (Time Sensitive for non-urgent info / marketing). [HIG]
- **Badges as decoration** — a red dot for "new", a count that never clears, progress in a badge.
- **Web-style giant toast stacks** sliding in for routine saves.
- **Heavy/constant haptics**, or relying on haptics as the *only* signal.

## Accessibility

- Feedback is **never colour-only** — pair status colour with text/icon/shape so it survives colour-blindness and grayscale; offering it through colour, text, sound, and haptics reaches more people. [HIG]
- Alerts and inline errors must be announced to **VoiceOver** (alerts get focus automatically; live inline messages need a live region / accessibility announcement).
- Don't gate critical information behind a transient toast that disappears before a screen-reader or a slow reader catches it — persist errors inline.
- Respect **Do Not Disturb / Focus** and the user's notification settings; honour **Reduce Motion** for any banner entrance.

## Related
- [progress-and-status-indicators.md](progress-and-status-indicators.md) — long-running feedback; badges = unread counts only.
- [searching-settings-and-undo.md](searching-settings-and-undo.md) — undo over confirmation; in-app notification settings; validation while entering data.
- [keyboard-and-pointing.md](keyboard-and-pointing.md) — Return confirms / Esc cancels an alert.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
