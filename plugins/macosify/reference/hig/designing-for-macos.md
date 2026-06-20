---
title: Designing for macOS — The macOS Experience
hig: designing-for-macos / the-macos-experience
role: foundation
---
# Designing for macOS — The macOS Experience

**Purpose.** The framing document for this library: what actually makes an app feel *native* on the Mac, versus a web/Electron page wearing a macOS costume. Read this first; every other file is a deeper cut of a point made here.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/designing-for-macos

## When to use

Apply this baseline to any app you build for the Mac. Apple's framing: people rely on the Mac's **power, spaciousness, and flexibility** for in-depth productivity, media, and games — often running several apps at once [HIG]. Designing well means understanding the device characteristics that distinguish the macOS experience and letting them inform your decisions.

## Anatomy — the device characteristics Apple names [HIG]

- **Display.** Typically a large, high-resolution display; people can extend the workspace with additional displays, including an iPad.
- **Ergonomics.** People are usually stationary at a desk, with a viewing distance of roughly **1 to 3 feet**.
- **Inputs.** People expect to enter data and control the interface with any combination of input modes — physical keyboards, pointing devices, game controllers, and Siri.
- **App interactions.** Sessions range from a few minutes of quick tasks to several hours of deep concentration; people frequently have **multiple apps open at once** and expect smooth transitions between active and inactive states as they switch.
- **System features.** macOS provides familiar, consistent ways to interact: the **menu bar**, **file management**, **going full screen**, and **Dock menus**.

## Behavior & states — Apple's best practices [HIG]

- **Leverage large displays** to present more content in fewer nested levels, with less need for modality — while keeping a comfortable information density that doesn't make people strain.
- **Let people resize, hide, show, and move your windows** to fit their work style and device configuration, and **support full-screen mode** for a distraction-free context.
- **Use the menu bar** to give people easy access to all the commands they need to do things in your app.
- **Help people take advantage of high-precision input** to perform pixel-perfect selections and edits.
- **Handle keyboard shortcuts** to accelerate actions and support keyboard-only work styles.
- **Support personalization** — let people customize toolbars, configure windows to show the views they use most, and choose the colors and fonts they want in the interface.

## Metrics & layout

- Macs run on **large, high-resolution, often multi-display** workspaces — design for breadth, not a single fixed canvas.
- macOS **Body is 13pt** (not iOS 17pt); use named text styles, not raw pixels.
- In macOS 26, the toolbar/sidebar/menus/popovers/sheets are the floating **Liquid Glass** control layer; the content is opaque and is the star. The floating chrome is *Regular* glass by default, never glass-on-glass, with concentric corners and a scroll-edge transition. Details in [layout.md](layout.md).

## Native macOS conventions

- Use the **real** system chrome: real traffic-light close/minimize/zoom buttons, the real system menu bar, system controls, real vibrancy/Liquid Glass materials — never hand-painted equivalents.
- System font everywhere (`-apple-system` / SF Pro); use named text styles.
- The **default arrow cursor** on clickable controls (not the web "hand" `cursor: pointer`); I-beam on text, resize cursors on edges.
- `user-select: none` on chrome (toolbars, sidebars, labels); text content stays selectable.
- Standard shortcuts mean standard things: ⌘N new, ⌘W close window, ⌘, Settings, ⌘Q quit, ⌘Z / ⇧⌘Z undo/redo, ⌘F find.
- Menu-bar order: Apple → App → File → Edit → View → [app menus] → Window → Help.
- Settings open in their own window from the **App** menu (⌘,), not an in-page route.
- Restore window size/position/state on relaunch; many Mac apps are multi-window.

## Common non-native mistakes

- **Fake chrome.** Hand-drawn traffic lights, custom title bars, a decorative desktop/wallpaper behind the app, or an app-window frame nested inside the window. Use the real ones — fabricated chrome is the single loudest "this isn't native" tell.
- **No menu bar, or a stub menu bar.** Commands only exist as in-window buttons; File/Edit/View/Window/Help missing. Apple's guidance is the menu bar gives access to **all** commands.
- **The web hand cursor.** `cursor: pointer` on every button. Mac controls keep the **arrow**.
- **Single locked window.** Fixed size, can't resize/hide/move, can't go full screen, loses size/position on relaunch — the opposite of "let people resize, hide, show, and move your windows."
- **Deep nesting / heavy modality** on a big display instead of using the space to flatten levels.
- **Ignoring personalization, Dark Mode, or the user's accent color.**

## Accessibility

Native feel and accessibility are the same effort: full keyboard navigation + shortcuts, VoiceOver labels on every control, sufficient contrast, and live response to Reduce Motion / Reduce Transparency / Increase Contrast / Larger Text. Adopting the system controls earns most of this for free — another reason to use them rather than rebuild them.

## Related
- [layout.md](layout.md) — the window's structure, grid, safe areas, sizing.
- [motion.md](motion.md) — how things move, Liquid Glass, Reduce Motion.
- [branding.md](branding.md) — restrained branding inside native conventions; the app icon.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
