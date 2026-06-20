---
title: Popovers & Panels
hig: https://developer.apple.com/design/human-interface-guidelines/popovers
role: presentation
---

# Popovers & Panels (macOS)

**Purpose.** Popovers and panels present supplementary controls *without* the full weight of modality. A **popover** is a transient view that appears above other content when people click or tap a control or interactive area, exposing a small amount of info or a few quick tasks. A **panel** typically floats above other windows providing supplementary controls, options, or information related to the active window or current selection. Using these instead of ad-hoc dropdowns and floating divs is a major part of feeling native.

**Apple HIG:** [Popovers](https://developer.apple.com/design/human-interface-guidelines/popovers) · [Panels](https://developer.apple.com/design/human-interface-guidelines/panels)

## When to use

- **Popover** — **expose a small amount of information or functionality** [HIG]: a few related tasks triggered from a control or interactive region (a calendar event popover to change a date and move on). Consider popovers when you want more room than a sidebar/panel takes, and only need the content temporarily. [HIG]
- **Inspector** — show/edit details of the current selection, auto-updating when the selection changes. Present it as a **panel** or a **split-view pane**. [HIG] (For an *Info* window whose contents stay fixed regardless of selection, use a regular **window**, not a panel.)
- **Utility panel** — quick access to important controls related to the content being worked on; **prefer simple adjustment controls** like sliders and steppers over text entry. [HIG]
- ❌ **Avoid using a popover to show a warning** [HIG] — people can miss it or accidentally close it; use an **alert** (see `sheets-and-alerts.md`).

## Anatomy

- **Popover**: a content view with an **arrow** pointing at the control that revealed it; sized just big enough for its contents; appears above other content.
- **Inspector / panel**: a floating window with a less prominent appearance than the main window, carrying a **title bar** so people can position it. A **HUD-style panel** is a darker, translucent variant for media-oriented or immersive apps. [HIG]
- A split-view **inspector pane** docks to the trailing edge of the window and scrolls with its own header.

## Behavior & states

- **Position popovers appropriately** [HIG]: the arrow points as directly as possible at the element that revealed it, and the popover ideally doesn't cover that element or essential content.
- **Use a Close button for confirmation and guidance only** [HIG] — otherwise a popover **closes when people click outside it or select an item**. If multiple selections are possible, keep it open until people dismiss it or click outside.
- **Always save work when automatically closing a nonmodal popover** [HIG]; discard only on an explicit **Cancel** (people unintentionally dismiss popovers).
- **Show one popover at a time** [HIG] — never a **cascade or hierarchy** of popovers; close the open one before showing a new one. When possible, let people **close one popover and open another with a single click**. [HIG]
- **Don't show another view over a popover** — **except an alert**. [HIG] (This is the single allowed overlap.)
- **Provide a smooth transition when changing a popover's size** [HIG] — animate condensed↔expanded so it doesn't look like a new popover replaced the old one.
- **Show and hide panels appropriately** [HIG]: bring all open panels to the front when the app becomes active, and **hide all panels when the app is inactive**.

## Metrics & layout

- Popover **arrow anchored to its trigger**, **sized to contents** (the system may adjust the size to fit): **[HIG]**.
- **One popover at a time; no nesting**: **[HIG]**.
- **Don't make a popover too big** — only big enough for its contents and to point at its source: **[HIG]**.
- Inspector presented as a **panel or a split-view pane**: **[HIG]**.
- Save-on-auto-close for nonmodal popovers: **[HIG]**.

## Native macOS conventions

- **An alert may appear over a popover** — the single allowed overlap. [HIG]
- A macOS popover can be made **detachable** [HIG]: dragging it tears it off into a separate **panel** that stays visible while people interact elsewhere. **Make minimal appearance changes to a detached popover** so people keep context. [HIG]
- **Write a brief, noun-phrase title** for a panel (title-style capitalisation) so people recognise it — e.g. "Fonts", "Colors", "Inspector". [HIG] **Refer to panels by title** in menus ("Show Fonts", "Show Inspector") and help — don't use the word *panel*. [HIG]
- **In general, avoid making a panel's minimize button available** [HIG] — a panel shows only when needed and disappears when the app is inactive. **Avoid listing panels in the Window menu's documents list** (a Show/Hide command is fine). [HIG]
- **Prefer standard panels over HUDs** [HIG]; use a HUD only in media-oriented/immersive apps or when a standard panel would obscure essential content. Keep HUDs small, use colour sparingly, and maintain one panel style when switching modes. [HIG]
- Don't reimplement a popover as a custom absolutely-positioned `<div>` — match the arrow, material (Liquid Glass in macOS 26), and outside-click dismissal.

## Common non-native mistakes

- ❌ Using a popover for a **warning/destructive confirmation** (use an alert).
- ❌ **Cascading** popovers, or opening a second popover from inside one.
- ❌ Showing **any view over a popover** other than an alert.
- ❌ **Discarding** popover input on outside-click instead of saving it.
- ❌ A popover that's **too large** or doesn't point at its source; an abrupt resize that looks like a different popover.
- ❌ Panels that **keep a minimize button**, stay visible when the app is inactive, or appear in the Window menu's documents list.
- ❌ A custom dropdown/div with **no arrow, no outside-click dismiss, no native material**.

## Accessibility

- Moving focus into a popover and **restoring** focus to the trigger on close is essential for keyboard + VoiceOver users.
- **Escape** must always dismiss a non-modal popover/panel; arrow keys navigate list popovers.
- Honour `prefers-reduced-transparency` / `prefers-reduced-motion` on the popover material and its appear/dismiss animation.
- **Avoid using the word *popover* in help** [HIG]; refer to the specific task or selection instead.

## Related

- [sheets-and-alerts.md](./sheets-and-alerts.md) — use an alert for warnings, not a popover
- [windows.md](./windows.md) — detached panels vs new windows; an Info window vs a panel
- [modality.md](./modality.md) — popovers are the non-modal alternative
- [scroll-views.md](./scroll-views.md) — scrolling inside inspectors/panels
- [index.md](./index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
