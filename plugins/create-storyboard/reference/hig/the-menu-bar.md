---
title: The Menu Bar
hig: the-menu-bar
role: menus
---
# The Menu Bar (macOS)

**Purpose.** On a Mac, the menu bar at the top of the screen displays the top-level menus of the frontmost app. Apple's own words: Mac users "are very familiar with the macOS menu bar, and they rely on it to help them learn what an app does and find the commands they need." To feel at home in macOS it is "essential to provide a consistent menu bar experience." This is what Electron/web apps most often get wrong — they ship in-window buttons and an empty (or absent) menu bar. Get it right and the app immediately reads as native.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/the-menu-bar

## When to use

Always, while the app is frontmost. The menu bar includes both system-provided menus and any custom ones you add. Putting commands in the menu bar "makes them easier for people to find, lets you assign keyboard shortcuts to them, and makes them more accessible to people using Full Keyboard Access." Excluding commands — even infrequently used or advanced ones — "risks making them difficult for everyone to find." [HIG]

## Anatomy — standard menu order

When present, menus appear in this order [HIG]:

**🍎 Apple → YourAppName → File → Edit → Format → View → [app-specific menus] → Window → Help**

The Apple menu is always first on the leading side; **menu bar extras** sit on the trailing side. [HIG]

- **🍎 Apple menu** — system-defined items that are always available; you **can't modify or remove it**. Always the leading item. [HIG]
- **App menu** (the app's name, shown **bold** so people can identify the active app) — *About YourAppName* (first, in its own group; short name ≤16 chars, no version number), **Settings…** (⌘,, app-level settings only), optional app-config items, **Services**, **Hide YourAppName** (⌘H), **Hide Others** (⌥⌘H), **Show All**, **Quit YourAppName** (⌘Q). About/Settings/Quit live here — not in File, not in an in-window gear. [HIG]
- **File** — manage the files/documents the app supports: *New Item*, *Open* / *Open Recent*, *Close* (⌘W; ⌥ → *Close All*; tab windows show *Close Tab*), *Save* / *Save All*, *Duplicate* (⌥ → *Save As*; Apple prefers *Duplicate* over Save As/Export/Copy To), *Rename…*, *Move To…*, *Export As…*, *Revert To*, *Page Setup…*, *Print…* (⌘P). If the app handles no files you may rename or eliminate this menu. [HIG]
- **Edit** — changes to content + Clipboard commands; "useful even in apps that aren't document-based." Find items may instead belong in File if they search files/objects. See [menus-and-context-menus.md](menus-and-context-menus.md). [HIG]
- **Format** — text-formatting attributes (Font ▸, Text ▸). Exclude it if the app doesn't support formatted-text editing. [HIG]
- **View** — customize the **appearance** of all windows (Show/Hide Tab Bar, Show/Hide Toolbar, Customize Toolbar, Show/Hide Sidebar, Enter/Exit Full Screen). It does **not** navigate or manage specific windows. Provide a View menu even for a subset — e.g. just Enter/Exit Full Screen. [HIG]
- **[App-specific menus]** — custom commands, between View and Window. Reflect the app's hierarchy and list them most-general/commonly-used → least. [HIG]
- **Window** — navigate, organize, and manage windows: *Minimize* (⌘M; ⌥ → *Minimize All*), *Zoom* (don't use it to enter full screen), tab commands, *Bring All to Front*, and the list of open windows in **alphabetical** order. Provide it even with one window so Minimize/Zoom are keyboard-reachable. [HIG]
- **Help** — at the trailing end; with Help Book content macOS automatically adds a **search field** at the top. Keep the item count small. [HIG]

## Behavior & states

- **Always show the same set of items.** Keeping items visible "helps people learn what actions your app supports, even if they're unavailable in the current context. If a menu bar item isn't actionable, disable the action instead of hiding it from the menu." [HIG]
- **Support standard keyboard shortcuts.** People expect the shortcuts they know for Copy, Cut, Paste, Save, Print, etc.; define custom ones only when necessary. Shortcuts show right-aligned as symbol glyphs (⌘⌥⌃⇧). [HIG]
- **Dynamic menu items** change behaviour when a single modifier is held (e.g. *Minimize* → *Minimize All* with ⌥). They're hidden by default, so never make one the only way to do a task; require only a single modifier; use them mainly in menu-bar menus. [HIG]
- **Show/Hide items reflect current state** — *Show Toolbar* when hidden, *Hide Toolbar* when visible. [HIG]
- **Represent common actions with familiar/standard icons** (Copy, Share, Delete), used consistently. [HIG]
- **In full screen the menu bar hides** until the pointer reaches the top edge. [HIG]

## Metrics & layout

- **Submenu depth = 1 level** — Apple: "it's generally best to restrict them to a single level." [HIG]
- **Prefer short, one-word menu titles** — they take little space and scan easily; if multi-word, use title-style capitalization. [HIG]
- Group related commands with **separators**, not blank items. [HIG]
- The menu bar height is **24 pt**; when space is tight the system truncates titles before dropping menus. [HIG]
- App-menu *About* name and *Quit*/*Hide* use the same short app name. [HIG]

## Native macOS conventions

- Built with AppKit `NSMenu`/`NSApplication`, SwiftUI `commands`/`CommandMenu`; in **Electron**, populate the real menu bar via `Menu.setApplicationMenu` with `role:`-based items (`'about'`, `'quit'`, `'undo'`, `'cut'`, `'windowMenu'`, `'hide'`, `'services'`, …) so the system supplies correct titles, shortcuts, and behaviours per locale. [HIG era]
- Settings opens its own window from the **App** menu (⌘,) — for the dialog buttons inside it see [buttons-and-menu-buttons.md](buttons-and-menu-buttons.md).
- **Menu bar extras** (`NSStatusBar` / `MenuBarExtra`) sit on the trailing side, show a **menu, not a popover**, and are shown/hidden by the system — never rely on their presence or position. [HIG]
- The menu bar lives at the **top of the screen**, not inside the window. Never draw an in-window "menu bar" strip. [HIG]

## Common non-native mistakes

- **No menu bar, or a stub one** — only File/Edit with two items; commands exist solely as in-window buttons. The loudest non-native tell.
- **About/Settings/Quit in the wrong place** — a gear/hamburger in the window instead of the App menu (Settings = ⌘,).
- **Toolbar/gesture-only commands** absent from any menu (the menu bar must list "all the app's commands").
- **Hiding instead of disabling** an unavailable item, so the menu jumps around. (Note: context menus do the opposite — see siblings.)
- **Spelled-out shortcuts** ("Ctrl+Shift+N") instead of right-aligned symbol glyphs, or no shortcuts at all.
- **Building your own Help search** instead of letting the system add it.
- **Deep submenus** (≥2 levels).

## Accessibility

The menu bar is the backbone of keyboard and assistive access: full keyboard navigation (⌃F2 focuses it), VoiceOver reads every item and its shortcut, and **Full Keyboard Access** reaches every command — Apple specifically cites this as a reason to list commands in the menu bar. A command that exists *only* as a styled `<div>` button is invisible to all of it. Keep titles clear and verb-first so they read well aloud.

## Related
- [menus-and-context-menus.md](menus-and-context-menus.md) — menu item rules, the Edit menu, context menus.
- [buttons-and-menu-buttons.md](buttons-and-menu-buttons.md) — in-window buttons and pop-up/pull-down menus that shadow menu commands.
- [toolbars.md](toolbars.md) — every toolbar item must also be a menu-bar command.
- [designing-for-macos.md](designing-for-macos.md) — the menu bar as the complete command surface.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
