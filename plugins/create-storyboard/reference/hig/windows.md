---
title: Windows
hig: https://developer.apple.com/design/human-interface-guidelines/windows
role: presentation
---

# Windows (macOS)

**Purpose.** A window presents an app's UI views and content; on macOS it carries the frame (window controls + optional toolbar) and a body area, and helps define the visual boundaries of app content while enabling the multi-window, multi-app workflows people run all day. Getting window behaviour right is the single biggest contributor to an Electron app "feeling native".

**Apple HIG:** [Windows](https://developer.apple.com/design/human-interface-guidelines/windows) · [Going full screen](https://developer.apple.com/design/human-interface-guidelines/going-full-screen)

## When to use

- **Primary window** — presents the app's main navigation, content, and the actions associated with them. [HIG]
- **Auxiliary window** — dedicated to one specific task or area; it doesn't allow navigation to other app areas and typically includes a button to close it after the task is done. [HIG]
- **Choose the right moment to open a new window** [HIG] — a separate window is great for multitasking or preserving context (Mail opens a new window on Compose so the draft and the inbox stay visible). But **avoid opening new windows as default behaviour** unless it benefits the experience — excessive windows create clutter. [HIG]
- **Consider providing the option to view content in a new window** [HIG] via a File-menu or context-menu command, giving people the flexibility to view content in multiple ways. Prefer panels, sheets, and inspectors for transient or scoped tasks.

## Anatomy

- A macOS window consists of a **frame** (above the body) and a **body area**; people move it by dragging the frame and resize it by dragging its edges. [HIG]
- The frame can include **window controls** and a **toolbar** (Liquid Glass in macOS 26). The three real traffic-light controls — **close · minimize · zoom** — sit at the leading (left) edge of the title bar.
- In rare cases a window can show a **bottom bar** below the body content. [HIG]
- **Content area** fills the rest and scrolls under the floating toolbar with a scroll-edge effect (see `scroll-views.md`).

## Behavior & states

A macOS window has one of three states, given distinct system appearances so people can tell them apart [HIG]:

- **Main** — the frontmost window the person is viewing; there is **only one main window per app**. [HIG]
- **Key** (active) — the window that accepts input; **only one key window onscreen at a time**. Usually the front app's main window is key, but a floating panel can be key instead; some panels (Colors, Fonts) become key only when their title bar or a text field is clicked. [HIG]
- **Inactive** — any window not in the foreground. [HIG]

The key window shows **colour** in the close/minimize/zoom controls; inactive windows and non-key main windows use **gray**. Inactive windows **don't use vibrancy**, so they look subdued and visually farther away. [HIG] Mirror this in Electron: tie vibrancy + accent chrome to window focus events. **Zoom (green)** toggles an optimal content size — full screen is a separate system mode (below).

## Metrics & layout

- Make windows **adapt fluidly to different sizes** to support multitasking and multi-window workflows. [HIG]
- Restore window **size and placement** between launches (the system remembers them even when an app is closed). [HIG]
- macOS 26 **concentric corner radius**: windows with a glass toolbar use a larger radius that wraps concentrically; let the system draw the corners rather than hard-coding one radius for all states. [era]
- 44×44pt minimum hit target for any custom title-bar control — convention for clickable chrome.

## Native macOS conventions

- **Avoid creating custom window UI** [HIG] — system windows look and behave in a way people recognise; custom frames or controls that don't *perfectly* match the system look make an app feel broken. Use the real title bar + traffic lights (`titleBarStyle: "hiddenInset"` + `trafficLightPosition` in Electron).
- **Make sure custom windows use the system-defined appearances** for main/key/inactive [HIG] — system components update the background and button appearances automatically on state change; custom implementations must do that work themselves.
- **Use the system-provided full-screen experience** [HIG] (it accommodates a notch/camera housing). Entered via the green button, **View ▸ Enter Full Screen**, or **⌃⌘F**; **always let people choose when to enter and exit** it [HIG] — never resize the window programmatically to fake full screen, and avoid a custom menu of window modes.
- **Avoid putting critical information or actions in a bottom bar** [HIG] — people often relocate a window in a way that hides its bottom edge. A bottom bar should hold only a small amount of info about the window's contents or selection (Finder's status bar). For more, use an inspector on the trailing side of a split view. [HIG]
- **Use the term *window*** in user-facing content for every window type — terms like "scene" confuse people. [HIG]

## Common non-native mistakes

- ❌ Drawing a **custom window frame / custom traffic-light dots** instead of the system ones.
- ❌ Opening a **new window for every task** (settings, a wizard, a detail view) as default behaviour, instead of a sheet/panel/inspector.
- ❌ **Programmatically resizing** the window to fake full screen, or trapping the user out of system full screen.
- ❌ Custom windows that **don't update** their appearance across main/key/inactive (stale colour controls or vibrancy on an inactive window).
- ❌ Critical actions (Save/Delete/Continue) **stuck in a bottom bar**.
- ❌ Not restoring the previous **size/placement** on relaunch.
- ❌ Calling a window a "scene" or other non-standard term in user-facing copy.

## Accessibility

- Window title is read by VoiceOver — keep it meaningful.
- Don't rely on traffic-light colour alone; the glyphs (revealed on hover) and `prefers-contrast` carry meaning. Honour `prefers-reduced-transparency` by solidifying vibrant chrome.
- Full-screen mode: continue to provide access to essential features and controls so people can complete a task without exiting [HIG]; let people reveal the Dock; resume where they left off when they return. [HIG]
- Full keyboard reachability for any custom title-bar/toolbar control; 44×44pt targets.

## Related

- [sheets-and-alerts.md](./sheets-and-alerts.md) — scoped tasks tied to a window
- [popovers-and-panels.md](./popovers-and-panels.md) — inspectors and floating panels vs new windows
- [modality.md](./modality.md) — when a new window vs a modal is appropriate
- [scroll-views.md](./scroll-views.md) — content under the toolbar, scroll-edge effect
- [index.md](./index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
