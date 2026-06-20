---
title: Modality
hig: https://developer.apple.com/design/human-interface-guidelines/modality
role: presentation
---

# Modality (macOS)

**Purpose.** Modality is a design technique that **presents content in a separate, dedicated mode that prevents interaction with the parent view and requires an explicit action to dismiss**. It is powerful but expensive: it takes people out of their current context. This page sets the policy that governs sheets, alerts, and modal windows; this app currently over-uses centered modals and nested dialogs, which is the core non-native problem.

**Apple HIG:** [Modality](https://developer.apple.com/design/human-interface-guidelines/modality)

## When to use

Per the HIG, presenting content modally can:
- **Ensure people receive critical information** and, if necessary, act on it. [HIG]
- **Provide options to confirm or modify** their most recent action. [HIG]
- Help people **perform a distinct, narrowly scoped task without losing track** of their previous context. [HIG]
- Give an **immersive experience** or help people **concentrate on a complex task** (a full-screen modal style). [HIG]

**Present content modally only when there's a clear benefit** [HIG]. Otherwise prefer a non-modal approach — a popover, an inspector, an inline edit, or a separate window the user can switch away from.

## Anatomy

Modality is *expressed through* concrete components, not a thing of its own [HIG]:
- **Alert** — every platform can present an alert: a modal view delivering critical info / a finish-or-abort decision, and **errors**.
- **Sheet** — window-anchored modal for a distinct, scoped task (iOS/iPadOS/macOS).
- **Popover** — used (with sheets) to help people perform a distinct task.
- **Separate window** — iPadOS/macOS/visionOS may use a window instead of a sheet for a distinct task.
- **Full-screen modal** — for in-depth content (media) or a complex multi-step task (markup, photo editing).

## Behavior & states

- **Let people dismiss a modal view before presenting another one** [HIG] — multiple visible modals create clutter and cognitive load. **An alert can appear on top of all other content, including other modal views, but never show more than one alert at a time.** [HIG]
- **Aim to keep modal tasks simple, short, and streamlined** [HIG] — if a modal task is too complicated, people lose track of the suspended task, especially when the modal obscures the previous context.
- **Avoid a modal that feels like an app within your app** [HIG] — don't present a hierarchy of views inside a modal task. If subviews are unavoidable, **provide a single path through the hierarchy** and avoid buttons people might mistake for the dismiss button.
- The modal **blocks its owning scope** and nothing more — don't block the whole app for a window-scoped task.
- **z-order**: a modal sits above transient chrome (toolbars, popovers it owns) but should never block something the user needs to consult to complete the task. In this codebase, modals are `--z-modal: 200`, above the universal chat at `150`.

## Metrics & layout

- **One modal at a time**, no stacking (an alert may overlay one other modal): **[HIG]**.
- **No nested modal hierarchies**; a single path if subviews exist: **[HIG]**.
- **Always give an obvious way to dismiss** a modal view [HIG] — in **macOS** (and tvOS) people expect a **button in the main content view**; on iOS/iPadOS/watchOS, a top-toolbar button or swipe-down. So on macOS the exit lives in the modal's own content (Done/Cancel, or a sheet's trailing buttons), **not** a window-chrome close button.
- **Make it easy to identify the modal view's task** with a title (or descriptive text) so people keep their place: **[HIG]**.

## Native macOS conventions

- macOS expresses modality as a **sheet** (window-scoped) or **alert** (decision/error). Reach for a free-floating centered modal window only for a genuinely self-contained task — and even then a sheet is usually better.
- A modal's dismissal is a **button inside its content view** (Done/Cancel/OK); **Escape** maps to Cancel, **Return** to the default button.
- **When closing could lose user-generated content, confirm first** [HIG] — explain the situation and offer a way to resolve it (e.g. a save option) regardless of whether people used a gesture or a button.
- If a modal task grows complex, **promote it to a real window** the user can move, resize, and switch away from — or go full screen for in-depth content — rather than deepening the modal.

## Common non-native mistakes

- ❌ Using modality **by default** for routine tasks that could be inline, a popover, or a non-modal window.
- ❌ **Stacking modals** (a modal that opens another modal) or **nesting** a multi-step wizard inside one modal — *"an app within an app."*
- ❌ Showing **more than one alert** at a time.
- ❌ Putting the close affordance in **fake window chrome** instead of the modal's content view (on macOS).
- ❌ Blocking the **entire app** for a task that only concerns one window.
- ❌ Closing a modal that **silently discards** unsaved user content (no confirmation).
- ❌ A modal that **traps focus** without an Escape/Cancel route, or floats with the **wrong z-order** (below chrome it should cover, or above content the user must read to proceed).

## Accessibility

- Trap focus *within* the modal while open and **restore** focus to the invoking control on close (the codebase's `useFocusTrap` + dialog ARIA).
- **Escape** must always provide a way out; the default action on **Return**. Announce the modal with a dialog role + label so VoiceOver conveys the context switch.
- Honour `prefers-reduced-motion` on the present/dismiss transition and `prefers-reduced-transparency` on the modal material.

## Related

- [sheets-and-alerts.md](./sheets-and-alerts.md) — the concrete modal components and their button rules
- [popovers-and-panels.md](./popovers-and-panels.md) — the non-modal alternatives to reach for first
- [windows.md](./windows.md) — promote a complex modal task to a window
- [scroll-views.md](./scroll-views.md) — scrolling within a modal/sheet
- [index.md](./index.md)
- [../DESIGN.md](../DESIGN.md)
