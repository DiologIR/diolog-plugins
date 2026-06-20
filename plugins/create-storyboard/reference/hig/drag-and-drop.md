---
title: Drag & Drop
hig: drag-and-drop
role: pattern
---
# Drag & Drop (macOS)

**Purpose.** Direct manipulation done the Mac way — moving or copying content within a view, between windows, and across to Finder, the desktop, and other apps. Covers obvious draggable content, clear drop feedback, the drag image, the move-vs-copy rule, multi-item drags and badges, spring-loading, Finder/inactive-window interop, and the rule that drag is never the *only* path.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/drag-and-drop

## When to use

- Drag and drop lets people **move or duplicate** selected content from a **source** to a **destination** — within one container, between containers, or between apps. [HIG]
- **The move-vs-copy rule:** dropping within the **same container moves**; dropping in a **different container copies**; **dragging between apps always copies.** [HIG]
- **As much as possible, support drag and drop throughout the app** — people are familiar with it and try it everywhere; system-provided text fields and views support it for free. [HIG]
- It's a natural macOS idiom — but a **shortcut, not the contract.** *"Offer alternative ways to accomplish drag-and-drop actions"* (menu commands to copy/move) because drag can be inconvenient or impossible and is inaccessible to keyboard/VoiceOver users. [HIG]

## Behavior

- **Display a drag image** as soon as people drag a selection **about three points.** Make it a **translucent** representation of the content — translucency distinguishes it from the original and lets people see destinations as they pass over. Keep it until they drop. [HIG]
- **Modify the drag image to predict the result if it adds clarity** (e.g. expand to the photo's default size in a document); use **drag flocking** to group multiple items and ungroup on drop — but avoid a constantly, radically changing drag image. [HIG]
- **Show whether a destination can accept the content:** an insertion point or highlight only over a valid target, and **no feedback — or an explicit "not allowed" (`circle.slash`)** — over an invalid one. Show the highlight **only while the content is over the destination**, removing it when the pointer leaves; with multiple targets, cue them **one at a time.** [HIG]
- **Feedback on a bad/failed drop:** the item moves back to its source, or scales up and fades out (evaporates) instead of appearing to land. [HIG]
- **Movement vs duplication & the Option key:** within a container a drag usually *moves*; **holding ⌥ (Option) forces a copy** — check the Option key **at drop time** (releasing Option before the drop reverts to a move). [HIG]
- **Multi-item drags:** let people drag a multi-selection as a group; macOS lets people select items from several apps and drag them together. **Consider a badge** — a small filled oval with the count — and update it if a destination accepts only a subset. [HIG]
- **Spring-loading:** dragging selected content **over a control auto-activates it** — on a Magic Trackpad by **force-clicking** while holding the content (Calendar drops an event over the day/week/month/year toolbar segments to re-date it). [HIG]
- **Prefer letting people undo a drop** (⌘Z) — people misdrop constantly; **confirm before a drop that can't be undone** (Finder confirms a drag into a write-only folder), or provide another way to reverse it. [HIG]
- **Maintain the selection state** of dropped content in the destination so people can act on it immediately; deselect in the source on a move (or on a same-container copy). [HIG]

## Metrics / values

- **Drag image appears after the pointer moves ~3 points** with the button held. [HIG]
- **⌥ (Option) at drop time = force copy.** [HIG]
- Drop-target / control hit area: **44×44pt** minimum. [HIG]
- Drag image: a **translucent** copy of the real content; multi-item drags show a **count badge** (filled oval). [HIG]
- Spring-load hover/force dwell is system-tuned — don't fabricate an exact ms. [convention]

## Native macOS conventions

- **Let people drag content into the Finder** in a format the app can reopen later (Calendar drags an event out as a `.ics`); text dropped on the Finder becomes a **clipping** (a temporary container, unrelated to the Clipboard). [HIG]
- **Drag from an inactive window without activating it** (a *background selection*, shown differently from the active selection); and drag an individual item from an inactive window without disturbing its existing background selection. [HIG]
- **Offer multiple fidelity versions of dragged content, highest first** (e.g. PDF → lossless PNG → lossy JPEG) so the destination picks the richest version it can accept; when accepting, pick the richest version you can. [HIG]
- **Change the pointer to signal the operation** — use the **copy**, **drag link** (alias), **disappearing item**, and **operation-not-allowed** pointers as appropriate; let the system set these rather than swapping in a custom hand. (See [keyboard-and-pointing.md](keyboard-and-pointing.md).) [HIG]
- **Select and drag in a single motion** where possible; **auto-scroll** a scrolling destination as the item is dragged over it. [HIG]
- **Provide progress feedback when a dropped transfer takes time** (and a placeholder at the drop location); show that a drop onto an action control (e.g. printing) has begun. [HIG]
- Pair drag with **copy/paste** (⌘C/⌘V) — they share the pasteboard model.

## Common non-native mistakes

- **Drag as the only way** to do something (no menu/button equivalent) — excludes keyboard and VoiceOver users. [HIG]
- **No drop feedback** — no insertion point/highlight over valid targets, no "not allowed" over invalid ones, or highlight that persists after the pointer leaves.
- **No drag image** (or a generic ghost) — they can't see *what* they're carrying; multi-drag shows no count badge.
- **Wrong/static cursor** — not showing copy / link / "no drop", or hijacking the cursor with a custom hand.
- **Wrong move/copy semantics** — copying within a container or moving across apps against expectation, risking data loss.
- **No interop** — a drag that only works inside one custom view and can't reach Finder, the desktop, or other apps.
- **Non-reversible drops with no undo or confirmation.** [HIG]
- **No spring-loading**, forcing drop → navigate → pick up → re-drag.

## Accessibility

- Because drag is inaccessible to many, **always provide a non-drag alternative** (Cut/Copy/Paste, a "Move to…" menu, reorder buttons, keyboard reorder) — the load-bearing accessibility requirement. [HIG]
- Expose drop targets and drag sources to **VoiceOver** with clear labels (AppKit/iPadOS accessible drag-and-drop descriptors are the native path). [HIG]
- Don't gate the operation behind fine motor precision; keep targets ≥44×44pt and offer spring-loading so a single sustained gesture isn't required.
- Honour **Reduce Motion** for lift / evaporate / settle animations.

## Related
- [keyboard-and-pointing.md](keyboard-and-pointing.md) — the non-drag keyboard path; cursor operation badges (copy/link/no-drop).
- [feedback.md](feedback.md) — drop-result confirmation; undo over confirmation; transfer progress.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
