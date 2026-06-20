---
title: Progress & Status Indicators
hig: progress-indicators
role: status
---
# Progress & Status Indicators (macOS)

**Purpose.** Show that work is happening and — wherever possible — how much is left, the macOS way. Covers determinate vs indeterminate progress, when a spinner vs a bar is right, gauges and level indicators, rating indicators, the rule about never repurposing Activity Rings, and labels-as-status.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/progress-indicators · https://developer.apple.com/design/human-interface-guidelines/gauges · https://developer.apple.com/design/human-interface-guidelines/rating-indicators · https://developer.apple.com/design/human-interface-guidelines/activity-rings

## When to use

- Progress indicators are **transient** — they appear only while an operation is ongoing and disappear when it completes. [HIG]
- **Show a progress indicator only for an operation longer than ~1–2 seconds.** Sub-second work feels instantaneous — a spinner that flashes and vanishes reads as a glitch, not feedback. [convention — Apple describes "lengthy operations"; the 1–2 s figure is convention]
- **When possible, use a determinate progress indicator.** An indeterminate indicator shows that a process is occurring but doesn't help people estimate duration; a determinate one *"can help people decide whether to do something else while waiting for the task to complete, restart the task at a different time, or abandon the task."* [HIG]
- Use an **indeterminate** indicator only for unquantifiable tasks (loading, synchronizing complex data). On macOS this can be a **spinner or an indeterminate bar**. [HIG]
- **Prefer a spinner for a background operation or when space is constrained** — spinners are small and unobtrusive, good for asynchronous work (retrieving messages) or progress within a small area like a text field or next to a button. [HIG]

## Behavior

- **Determinate** fills a bar from **leading to trailing**, or a circular track **clockwise**, tracking real progress 0→100%. [HIG]
- **Be as accurate as possible.** Consider evening out the pace of advancement — *"Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes can make people wonder if your app is still working and can even feel deceptive."* [HIG]
- **Keep the indicator moving** so people know something is still happening — a stationary indicator reads as a stalled process or a frozen app. If a process actually stalls, give feedback on the problem and what to do about it. [HIG]
- **Switch indeterminate → determinate** once you can estimate duration. **Don't switch circular ↔ bar** — they're different shapes/sizes and transitioning between them disrupts the interface and confuses people. [HIG]
- **Avoid labeling a spinner** — a spinner usually appears when people initiate a process, so a label is normally unnecessary. For a determinate task, an *accurate, succinct* description can help, but avoid vague terms like "loading" or "authenticating." [HIG]
- **Display the indicator in a consistent location** so people reliably find status across screens and apps. [HIG]
- **Let people halt processing where feasible** — include a **Cancel** button when interrupting has no negative side effects; add a **Pause** button too if cancelling would lose progress. **Warn (with an alert)** when cancelling has a negative consequence. [HIG]
- **Gauge** — displays a *current value within a range* (a steady-state reading like disk used, temperature, signal), not task progress. Write succinct labels for the value and both endpoints; consider a gradient fill that communicates the range. [HIG]
- **Level indicator** (macOS, in addition to gauges) — conveys **capacity** (continuous fill or discrete equal segments), **rating**, or — rarely — **relevance**. Prefer the continuous style for large ranges; you may change the fill colour (default green) at significant levels. [HIG]
- **Rating indicator** — horizontally arranged symbols (stars by default) for a ranking. It rounds to **whole symbols** (no partials); let people adjust a rank **inline** without a separate screen; if you replace the star, make the meaning clear. [HIG]

## Metrics / values

- **Threshold to show progress: > ~1–2 s.** [convention — HIG says "lengthy operations"]
- Circular determinate fills **clockwise**; bars fill **leading → trailing**. [HIG]
- Hit target for an interactive rating / Cancel / Pause control: **44×44pt** minimum. [HIG]
- No canonical Apple ms for spinner rotation — use the system control; don't invent a number. [convention]

## Native macOS conventions

- Use the system controls (`NSProgressIndicator` / SwiftUI `ProgressView`; `NSLevelIndicator` / SwiftUI `Gauge`) so they pick up appearance, accent, Reduce Motion, and the vibrant-on-glass look; in Electron, mirror their geometry and motion.
- Bar/spinner tint follows the user's **accent colour**, not a brand colour.
- For a queue of operations, prefer **one aggregate determinate bar** over a swarm of spinners.
- A long background task belongs somewhere the user can leave and return to (a progress row / activity area), not a modal that traps them.

## Common non-native mistakes

- **Defaulting to an indeterminate spinner** when the work is measurable — the most common miss.
- **Switching circular ↔ bar mid-operation**, or swapping indicators on every state change. [HIG]
- **A frozen / stuttering "indeterminate" spinner** that has actually hung — indistinguishable from a crash.
- **Long op with no Cancel**, or cancelling that silently loses progress with no warning. [HIG]
- **Spinner-flash** on sub-second work (showing then instantly hiding a spinner).
- **Labelling a spinner** with "Loading…"/"Authenticating…" — vague and usually unnecessary. [HIG]
- **Repurposing Apple's Activity Rings** (Move/Exercise/Stand concentric rings) for generic progress, goals, or completion. Apple: *"Use Activity rings only to show Move, Exercise, and Stand information… Don't replicate or modify Activity rings for other purposes."* They are **Fitness/Health-only**, must never be recoloured, used for branding/decoration, used in an app icon, or shown for more than one person. Use a normal determinate bar/circle instead. [HIG]
- **A badge that shows progress or a non-count** — badges are for **unread counts only** (see [feedback.md](feedback.md)).

## Labels as status

- A **label** is a small coloured, selectable text/colour tag for categorisation and triage (the Finder-tag idiom). Use a small, fixed palette and **always pair colour with text** so the meaning survives colour-blindness and grayscale.
- A practical **4-tier status mapping** using the **system status hues**: green = success/done, yellow/orange = warning/in-progress, red = error/blocked, neutral grey = idle/unknown (see [color] in foundations).
- Labels must be keyboard-selectable and exposed to assistive tech as their text, not just their colour.

## Accessibility

- **Honour Reduce Motion:** the system spinner already complies; don't add a looping animation that ignores it.
- Determinate indicators expose their **value + total** to VoiceOver (e.g. "Exporting, 60 percent"); never communicate progress by motion alone. Gauges read their **visible labels** to VoiceOver. [HIG]
- Status colour is **never the sole signal** — every coloured label/dot carries text or an icon and ≥3:1 contrast for the mark.
- Provide an accessible label for the operation ("Syncing vault") so a determinate indicator isn't anonymous.

## Related
- [feedback.md](feedback.md) — when an indicator vs an alert vs inline feedback is right; badges = unread counts only.
- [keyboard-and-pointing.md](keyboard-and-pointing.md) — Cancel reachable from the keyboard; interactive ratings settable without a pointer.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
