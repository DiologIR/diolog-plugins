---
title: Motion
hig: motion
role: foundation
---
# Motion (macOS)

**Purpose.** How a native Mac app should move. Apple's framing: beautiful, fluid motion brings the interface to life — **conveying status, providing feedback and instruction, and enriching the visual experience** — but it has to earn its place. Many system components already include consistent, familiar motion you get for free.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/motion

## When to use

Prefer the **system's** built-in motion wherever possible — it's familiar, consistent, and already adapts to accessibility settings and input method. Apple notes that **Liquid Glass responds to direct touch with greater emphasis** to reinforce a tactile feel, but produces a **more subdued effect when a person interacts with a trackpad** [HIG] — so on the Mac (a pointer/trackpad environment) system glass motion is already restrained for you. Design *custom* motion only when the system doesn't cover the interaction.

## Anatomy & best practices [HIG]

- **Add motion purposefully**, supporting the experience without overshadowing it. Don't add motion for the sake of it — gratuitous or excessive animation distracts people and can make them feel disconnected or physically uncomfortable.
- **Make motion optional.** Not everyone can or wants to experience motion, so never use it as the *only* way to communicate important information — supplement visual feedback with alternatives like **haptics and audio**.

### Providing feedback [HIG]

- **Strive for realistic feedback motion that follows people's gestures and expectations.** Accurate, realistic motion helps people understand how something works; motion that doesn't make sense disorients them. (If a view slides down from the top, people don't expect to dismiss it by sliding it to the side.)
- **Aim for brevity and precision** in feedback animations. Brief, precise motion feels lightweight and unobtrusive and often conveys information more effectively than prominent animation.
- **Generally avoid adding motion to UI interactions that occur frequently.** The system already provides subtle animations for standard elements; for a custom element, avoid making people pay attention to unnecessary motion every time they interact.
- **Let people cancel motion.** As much as possible, don't make people wait for an animation to complete before they can act — especially if they'd experience it more than once.
- **Consider animated symbols** where it makes sense (SF Symbols 5 or later).

## Behavior & states

- System components automatically include motion and may **adjust it in response to accessibility settings or input method** — lean on this rather than hand-rolling.
- Convention (not in this page): animate **`transform` and `opacity` only**, never layout properties (`width`/`height`/`top`/`left`/`margin`/`padding`/`font-size`) — animating layout causes reflow and a non-native stutter; use `transform: scale()` or the system's morph instead. [convention]
- Convention: Liquid Glass **morphs** between sizes/shapes and **materializes** in/out (menus, popovers, toolbars forming from and dissolving back into glass) — use those system transitions, don't stack a competing animation on a glass control. [convention]

## Metrics & layout

- **There is no canonical Apple duration table** — don't fabricate exact ms values as if Apple published them. Apple's own metrics are qualitative: *purposeful, brief, precise, cancellable.*
- Convention: spring is the de-facto default on Apple platforms; if you use fixed durations, three buckets work as a feel guide — ~150ms micro-feedback, ~250ms standard transitions, ~400ms larger/staged. Tune to feel, don't treat as law. [convention]

## Native macOS conventions

- Apple states there are **no additional motion considerations for iOS, iPadOS, macOS, or tvOS** beyond the cross-platform best practices above — so on the Mac, the rules are simply: purposeful, optional, realistic, brief, cancellable.
- Keep motion **subtle** in a precise, productivity-first pointer environment; system glass already does this on trackpad input.
- Tie motion to **direct manipulation** — things follow the pointer/drag, then settle.

## Common non-native mistakes

- **Decorative motion** that carries no meaning — spinners, fades, and slides added "to look modern." Apple: don't add motion for the sake of motion.
- **Motion as the only signal** for important information, with no haptic/audio/static alternative.
- **Feedback that contradicts the gesture** (dismiss direction differs from reveal direction) — disorienting.
- **Animating frequent interactions** or **non-cancellable** transitions the user must wait out.
- **Re-implementing glass effects in CSS** that fight the system morph/materialize, or stacking your own animation on a glass control. [convention]
- **Ignoring Reduce Motion** — the most common accessibility miss in web/Electron apps.

## Accessibility

Make motion **optional and supplementary** — Apple's core accessibility point here. Honour **Reduce Motion**: replace slides/zooms/morphs with cross-fades, drop spring/elastic overshoot, and kill parallax and looping/auto-playing motion. Never gate meaning behind motion; pair it with haptics, audio, or a static state. Also respect Reduce Transparency so motion and material stay legible together.

## Related
- [designing-for-macos.md](designing-for-macos.md) — where motion fits in the native experience.
- [layout.md](layout.md) — transitioning between layout states without animating layout *properties*.
- [branding.md](branding.md) — don't substitute branded motion for system transitions.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
