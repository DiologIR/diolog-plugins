---
title: Launching, Full Screen & Onboarding
hig: launching
role: pattern
---
# Launching, Full Screen & Onboarding (macOS)

**Purpose.** Get the user productive fast and stay out of their way — the Mac expectation that an app opens straight into useful work. Covers launching (launch instantly, restore state, no needless splash), full screen (the system mechanism, ⌃⌘F, the user's choice), onboarding (minimal, teach by doing, optional), and offering help (tooltips / help tags + the Help menu via ⌘?).

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/launching · https://developer.apple.com/design/human-interface-guidelines/going-full-screen · https://developer.apple.com/design/human-interface-guidelines/onboarding · https://developer.apple.com/design/human-interface-guidelines/offering-help

## Launching

**When:** every app start. Launching ends when the first screen is ready; any onboarding comes *after.* [HIG]

**Behavior:**
- **Launch instantly.** People want to start interacting right away and *"don't want to wait more than a couple of seconds."* [HIG]
- **macOS doesn't require (or use) a launch screen** — only iOS/iPadOS/tvOS do. Don't fake one. [HIG]
- **Restore the previous state** so people continue where they left off — scroll position, window state and location, selection. *"Avoid making people retrace steps."* [HIG]
- **A splash screen is not a launch screen.** If you need one (a brief branded graphic), show it at the **start of an onboarding flow**, not on every launch — *"don't advertise"*, no logo timer. [HIG]
- Open into the **content**, with the toolbar and a usable window ready — not an empty shell that then loads.
- **Don't gate launch behind a modal sign-in wall** if you can avoid it; defer auth until an action genuinely needs it. (A local-first app opens straight into work and only prompts to connect for a collaborative/cloud feature.)

## Full screen

**When:** for a focused, distraction-free mode the user **opts into** — games, media, in-depth tasks. [HIG]

**Behavior:**
- **Use the system-provided full-screen experience** — it works in all contexts (e.g. it accommodates the camera housing at the top-center of some Macs). Don't fake it with a custom borderless window. [HIG]
- **Let people choose when to enter full screen** — via the window's **Enter Full Screen button**, the **View menu item**, or **⌃⌘F**. *"Avoid offering a custom menu of window modes."* Never force full screen. [HIG]
- **Let people choose when to leave** — don't end full screen automatically when they switch away. [HIG]
- **If you adjust the layout in full screen, don't programmatically resize the window**; keep adjustments subtle to avoid jarring transitions. [HIG]
- **Keep essential features and controls accessible** so people can finish a task without exiting; you may **temporarily hide toolbars/navigation** when content is the focus, but make them **restorable** (tap, swipe down, or move the cursor to the top of the screen). [HIG]
- **Let people reveal the Dock** in full screen (except in games, where you may defer the gesture). [HIG]

## Onboarding

**When:** only if the app can't be understood by simply using it; *"design a flow that's fast, fun, and optional."* [HIG]

**Behavior:**
- **Teach through interactivity** — people grasp and retain more by doing the task than by viewing instructions. Provide a safe place to test an action or feature. [HIG]
- **Prefer context-specific tips over one onboarding flow** — display instructions near the area they refer to, so people learn one action at a time as they make progress (TipKit). [HIG]
- **If you need a prerequisite flow, keep it brief and enjoyable** and don't make people memorise a lot; an over-stuffed flow overwhelms. [HIG]
- **Make a separate tutorial optional and skippable** — don't re-present it on later launches, but keep it findable in a help/account/settings area. [HIG]
- **Keep content focused on your experience** — don't teach the OS or device. **Postpone nonessential setup** and provide defaults so people can start immediately; **prefer letting people use the app before prompting for ratings or purchases.** [HIG]

## Offering help

**When:** available when reached for, never in the way; *"the most effective experiences are approachable and intuitive."* [HIG]

**Behavior:**
- Provide the standard **Help menu** with searchable help, opened via **⌘?**. [HIG / system]
- **Relate help to the precise task people are doing now** and make it easy to dismiss; **don't explain how standard components work** — describe what an element does *in your app.* [HIG]
- **Tooltips (help tags)** appear when the pointer rests on a control. **Explain the action**, often beginning with a verb ("Restore default settings"); **avoid repeating the control's name**; **be brief — 60–75 characters**; use **sentence case** (omit ending punctuation unless required). [HIG]
- **Tips** (TipKit) are short, actionable, and engaging — best for simple features (a feature needing more than ~three steps is too complex for a tip); use eligibility rules so they reach the right audience at a reasonable cadence. [HIG]
- Use **relevant, consistent, inclusive language** ("click"/"menu item" on Mac, not "tap"). [HIG]

## Metrics / values
- **⌃⌘F → full screen; ⌘? → Help menu.** [HIG / system]
- Tooltip content: **60–75 characters** max, sentence case. [HIG]
- Tip complexity: ~**3 steps** or fewer. [HIG]
- Controls/help affordances meet **44×44pt**. [HIG]

## Native macOS conventions
- Use system **state-restoration** so windows/documents reopen as left; no launch screen on macOS.
- Use the system **full-screen** mechanism and the standard window **Enter Full Screen** button / View-menu item / ⌃⌘F.
- Use the standard **Help menu** with searchable help, and native **tooltips / help tags** rather than custom hover popovers for simple labels.

## Common non-native mistakes
- **A gratuitous splash / logo timer** on every launch; a macOS launch screen (it doesn't use one). [HIG]
- **A blocking sign-in wall** before the user can see or use anything.
- **Not restoring state** — every launch dumps the user at a blank default. [HIG]
- **Faking full screen** with a custom borderless window, offering a custom window-mode menu, or **forcing** full screen / ending it automatically. [HIG]
- **Hiding toolbars in full screen with no way to get them back**; blocking the Dock outside a game. [HIG]
- **A long, mandatory, multi-screen onboarding carousel** before first use; teaching the OS rather than the app; re-showing a skipped tutorial. [HIG]
- **No Help menu / ⌘? unmapped**; tooltips that repeat the control name, run long, or explain standard components. [HIG]

## Accessibility
- Onboarding and help must be **keyboard-navigable and VoiceOver-readable**, and skippable.
- Tooltips **supplement, never replace** accessible labels — every control has an accessibility label regardless of its tooltip.
- Full-screen chrome that auto-hides must remain reachable by keyboard, not pointer-hover only.
- Honour **Reduce Motion** on launch / onboarding / full-screen transitions; don't gate help content behind motion.

## Related
- [keyboard-and-pointing.md](keyboard-and-pointing.md) — ⌃⌘F, ⌘?, teaching 1–2 shortcuts; tooltips and focus.
- [searching-settings-and-undo.md](searching-settings-and-undo.md) — searchable help mirrors the search pattern; the Settings window.
- [feedback.md](feedback.md) — empty states and inline guidance over interruptive prompts.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
