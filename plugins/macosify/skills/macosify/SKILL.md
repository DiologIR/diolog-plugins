---
name: macosify
description: "Refit an existing UI so it feels authentically native to macOS 26 (Tahoe / Liquid Glass): real window chrome, 13pt SF Pro body, accent-bound semantic colour, Liquid Glass only on floating chrome, concentric corners, native lists/tables over card grids, the menu bar as the complete command surface, and the macOS keyboard/pointer model. Leans to TRUE AppKit-native macOS, correcting iOS-derived looks (Mac Catalyst, 'Designed for iPad' on Apple Silicon) toward AppKit idioms. Use this skill whenever the user asks to 'macosify' something, 'make this feel like a native Mac app', 'this looks like a web app / an iOS app — nativise it for macOS', 'refit/redesign X to macOS conventions', 'fix what's not native about this Mac UI', or to make a built surface match the Mac platform. Grounded in the bundled macOS 26 HIG library, token-level DESIGN.md, and real-screenshot learnings. To analyse a static screenshot into a structured report (rather than refit live code), use the macos-ui-analyst skill instead."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# macosify — refit a UI to feel natively macOS 26

You refit an existing UI so it reads as an authentic **macOS 26 "Tahoe" / Liquid Glass** app. You do not bolt macOS styling onto a web/iOS layout — you rework the surface to the platform's grammar. **The target is always true AppKit-native macOS.** Many "Mac" apps are actually iOS-derived (Mac Catalyst, or "Designed for iPad" running on Apple Silicon, or SwiftUI with iOS metrics leaking through) and read iOS-like on the desktop; treat that as a non-native condition to correct, not a style to preserve.

## Knowledge sources — load these first

**Read all three sources below in full, into context, before you touch the target surface** — don't cherry-pick. All bundled paths are under `${CLAUDE_PLUGIN_ROOT}`:

1. **The entire HIG library — read ALL of `reference/hig/` (every one of the 37 `.md` files) into context before you begin.** Start with `reference/hig/index.md` (it maps every component to its file), then read every other file in the directory. Each carries the rules **and** a "Common non-native mistakes" section; together they are your complete native-feel checklist for whatever the target surface turns out to contain.
2. **`reference/DESIGN.md`** — the token-level system: semantic colours + label tiers, SF Pro named text styles (Body = **13pt**), the 8pt grid, Liquid Glass material ramp, elevation, motion, radii, and per-component contracts. Use its tokens; do not invent values. It ends with a **"Native-feel checklist"** and **"The hard HIG numbers"** table — apply both.
3. **`learnings/macos-ui-learnings.md`** — durable patterns distilled from real macOS screenshots by the `macos-ui-analyst` skill, including framework-origin tells and their native corrections. Prefer a high-confidence learning here over a guess.

**Precedence when sources differ:** observed evidence in the target → HIG → DESIGN.md → learnings file. Never let the learnings file or a guess override an explicit HIG rule or a DESIGN.md token.

## Procedure

### 1. Locate and read the target
Find the surface to refit (component/page/screenshot the user named). Read the actual source — markup, styles, component tree — so the refit changes real code, not a description of it. If the user pointed at a running surface, capture how it currently looks (screenshot if you have a browser/screenshot path).

### 2. Diagnose the lineage (native vs iOS-derived vs web)
Before changing anything, classify what you're looking at and name its non-native tells:

- **Already AppKit-native?** 13pt body, compact 28/20pt controls, real menu bar, source-list sidebar with inset rounded selection, Liquid Glass floating chrome, concentric corners → light touch only.
- **iOS-derived (Catalyst / "Designed for iPad" on Apple Silicon / iOS-metric SwiftUI)?** Oversized 44pt touch controls everywhere, ~17pt body, iOS switch/segmented styling, an iOS tab bar (top or bottom), iOS-style nav bars / back chevrons, full-screen modal sheets, a thin or auto-generated menu bar. **Convert these toward AppKit-native** (see the correction table below).
- **Web/Electron?** Card grids, per-item buttons, the `cursor: pointer` hand, tracked-uppercase section headers, 16px web body, centered modals, always-on chunky scrollbars, fake/absent menu bar. These are the loudest non-native tells — rework them.

State the diagnosis and the top tells before you start editing.

### 3. Plan a holistic refit (not per-element patches)
Look at the whole surface and choose the native structure, per `reference/hig/layout.md`, `windows.md`, `split-views.md`, `sidebars.md`:

- **Three-zone window**: toolbar (~50–52pt, draggable, holds title + actions + trailing search + the one prominent primary action) · sidebar/source-list (200–260pt, full-height, inset rounded selection, system-font sentence-case headers — **not** tracked uppercase) + content area · optional bottom bar (never critical actions).
- **Native lists/tables over card grids.** Prefer Activity-Monitor / Mail / Shortcuts-style lists and multi-column tables with hover + selection + sortable headers to a grid of cards with per-item buttons. Reach for a collection only when items vary widely in size or are image-dominant. (`lists-and-tables.md`)
- **Real chrome.** Real traffic lights + native title bar (`titleBarStyle: hiddenInset` in Electron); never fake a window frame, traffic lights, or a decorative desktop backdrop. The menu bar is the complete command surface — every toolbar action also a menu command (`the-menu-bar.md`, `toolbars.md`).
- **Liquid Glass only on floating chrome** (toolbar, sidebar, menus, popovers, sheets, inspectors) — never on content/lists/scroll areas, never glass-on-glass, tint only the one primary action, concentric corners; use a scroll-edge effect (not a hard bar) where content meets chrome (`materials-and-liquid-glass.md`, `scroll-views.md`).

### 4. Apply the native system
Refit to these, pulling exact values from `DESIGN.md`:

- **Type:** the `-apple-system` stack; **13pt body** (not 16px web / 17pt iOS); named text styles; Semibold (not Bold) emphasis; never bundle SF fonts.
- **Colour:** dynamic semantic tokens + the four/six label tiers (primary label is ~85% black, not `#000`); bind the accent to the system accent; status colour **plus** a label/icon, never colour alone; author light and dark independently (don't invert).
- **Controls:** compact visible heights (~22–28pt) padded to the hit target; one prominent default per view (Return-triggered), destructive never default; pop-up vs pull-down used correctly; switch vs checkbox by emphasis; segmented controls for in-view switching (not a tab bar); the **default arrow cursor**, not the web hand; `user-select: none` on chrome.
- **Shape & depth:** concentric corners (capsule = height/2; child radius = parent radius − padding); depth from a 0.5px edge + soft shadow, not heavy borders.
- **Motion:** transform/opacity only (never layout properties); ~150/250/400ms with a spring on entrances; glass morph/materialize; honour Reduce Motion.
- **Keyboard & a11y:** standard shortcuts (⌘N/W/S/Z/F/,…), Esc dismisses, Return confirms, a visible `:focus-visible` accent ring, logical tab order; Settings is a real window via ⌘, not an in-app route; respect Reduce Transparency / Increase Contrast / Reduce Motion.

### 5. iOS-derived → AppKit-native corrections
When the lineage diagnosis (step 2) found an iOS-on-macOS look, convert — don't preserve it:

| iOS-derived tell (Catalyst / iOS-on-Mac) | AppKit-native correction |
|---|---|
| ~17pt body text | macOS **13pt** body (named text styles) |
| 44pt touch controls everywhere | compact **28/20pt** controls, padded to a 44pt hit region |
| iOS bottom/top **tab bar** for primary nav | **source-list sidebar** (or a real toolbar) |
| iOS-style nav bar + back chevron | macOS toolbar with leading back/sidebar + title |
| Full-screen modal **sheet** | **window-anchored sheet** (rounded card over its parent) |
| iOS switch/segmented/picker styling | AppKit switch, segmented control, pop-up/pull-down |
| Thin / auto-generated menu bar | full menu bar as the complete command surface |
| Grouped "inset" iOS table cards | macOS list/table rows with inset rounded selection |
| Touch-only affordances, no pointer precision | hover states, right-click context menus, arrow cursor |

If a learning in `learnings/macos-ui-learnings.md` records a more specific correction, prefer it.

### 6. Verify before declaring done
- If you can render the surface, **screenshot it in light and dark** and list, concretely, what is still not native in each before calling it finished (mirror the user's "tell me what's not native about each" expectation).
- Run an **AI-slop / polish pass**: check hierarchy, spacing rhythm on the 8pt grid, interaction states, contrast (4.5:1 / 3:1), concentric corners, and that nothing reads as a web/iOS template. For a large or high-stakes surface, fan out one `Agent` per pane/region to review independently, then reconcile.
- Walk the **`DESIGN.md` "Native-feel checklist"** (real chrome · system font · dynamic colour · glass only on chrome · one default action · toolbar · sidebar · keyboard/focus · motion · accessibility) and fix every miss.

## Complementary skills
- If the **`macos-ui-analyst`** skill has analysed comparable screens, its output in `learnings/macos-ui-learnings.md` is your sharpest source — read it.
- If the **`design-craft`** plugin is installed, you may use it for the visual-craft / variation / polish passes — but this skill is self-contained and does not require it.

## Do not
- Do not preserve an iOS-on-macOS look because it "already runs on Mac" — nativise it.
- Do not put Liquid Glass on content, stack glass on glass, or tint every control.
- Do not drop web density (16px body, web spacing, card grids, per-item buttons, the hand cursor) onto the desktop.
- Do not fake window chrome/traffic lights, invent colour hex instead of using tokens, or use colour as the only state cue.
- Do not declare done without the light+dark non-native pass and the slop/polish review.
