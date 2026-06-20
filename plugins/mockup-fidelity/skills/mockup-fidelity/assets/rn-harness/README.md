# RN fidelity harness — drop-in extractor

A dev-only **in-app probe** (`measure.js`) + a **local collector** (`collector.js`) that
extract the *rendered* React Native tree — structure + geometry + resolved style +
native nav/tab config — to JSON files for the mockup-fidelity audit. **No CDP, no
rozenite, no Fusebox handshake** — it runs inside the app and POSTs out, which is the
only reliable way to get this on the New Architecture (see "why" below).

## Drop it in (4 steps)

1. Copy `measure.js` → `<app>/.audit/measure.js`, and gitignore `.audit/`.
2. Add ONE dev-only line at the top of the app root (e.g. `app/_layout.tsx`):
   ```js
   if (__DEV__) { try { require('../.audit/measure'); } catch {} }
   ```
   (Optionally set the collector URL first: `global.__MF_COLLECTOR = 'http://localhost:8799/dump'`.)
3. Run the collector from your audit workspace: `node collector.js /abs/workspace 8799`
   (the iOS sim shares the host network, so `localhost` works).
4. Run the app on the sim (dev build, Metro up) and navigate with Maestro. The probe
   auto-dumps every 1.5 s to `_latest.json`; after each navigation, copy `_latest.json`
   to `<screen>/target.snapshot.json` — or call `global.__auditDump('<screen>')` to have
   the collector file it per-screen. **Remove `.audit/` + the require when the audit ends.**

The foreground screen is isolated by `scr` seq (RN keeps tabs + pushed screens mounted) —
filter the dump to the `scr` of an anchor node on the screen you navigated to.

## What it captures (per node) — leave-no-stone-unturned for a single dump

- **structure** — `id`/`parent`/`depth` (nested tree) + `owner` (component name)
- **geometry** — `rect{x,y,w,h}` sub-pixel, via the real render
- **layout** — `flexDir`/`align`/`justify`
- **style** — full flattened StyleSheet (padding\*, margin\*, **shadow\*/elevation**, border\*, radius, bg, transform, position, zIndex)
- **text** — content + **effective *inherited* text style** + `numberOfLines`/`ellipsizeMode` + **`fontLoaded`** (declared-vs-loaded)
- **visibility** — `effOpacity` (ancestor-chain) · **inputs** — `placeholder` + `placeholderTextColor`
- **identity** — **icon `name` + `iconColor`**, image `source` + `resizeMode`, **SVG `fill`/`stroke`/`d` internals**, `gradient` colour stops
- **native chrome config** — `cfg` on `RNSScreenStackHeaderConfig`/`RNSTabs*` (title, `largeTitle`, tint, tab label/icon/badge) — the JS-controlled part of the native nav bar & tab bar
- **a11y** — `a11y` label / `role` / `a11yState`, `pointerEvents`, `press` (interactivity)

## Known blind spots (need a screenshot or an extra dump — don't pretend otherwise)

- **Final native PIXEL render** — the system blur/glass, and the native font metrics of
  the native large title / tab bar. The harness has the *config*; the *pixels* need a screenshot.
- **Non-SVG canvas / Skia / GL internals** — an opaque host node (SVG internals *are* covered).
- **Animation / transition timing & easing** — the dump is a static frame.
- **Interaction states / dark mode / data variants / below-fold** — trigger the state (or
  scroll), then re-dump (`__auditDump`). One dump = one state.
- **Release build** — no `__REACT_DEVTOOLS_GLOBAL_HOOK__`; the walk can't run.
- **Mock(web)-vs-app(native) rendering** — identical resolved values can still render with
  different font metrics / `letterSpacing`; the fixed HTML phone frame ≠ a real device's
  safe areas / Dynamic Island.

## Why it's built this way (the hard-won bits)

- Walks `__REACT_DEVTOOLS_GLOBAL_HOOK__.getFiberRoots()`; only host nodes (`typeof type === 'string'`) emit.
- **Fabric/New-Arch:** `fiber.stateNode = {node, canonical}` — `measureInWindow` is *not* on
  `stateNode`. Geometry comes from `global.nativeFabricUIManager.measureInWindow(stateNode.node, cb)`.
- **Composite-only props** (onPress, `<Icon name/color>`, gradient stops) live on composite
  fibers, not host nodes — thread them down to descendants during the walk.
- **RN `<Text>` inherits** font/colour/size from ancestor `<Text>` — merge ancestor text
  style for the *effective* value, or a leaf's font looks "unset".
- **Foreground isolation:** tag each node with the seq of its nearest `RNSScreen`/`RNSTabsScreenIOS`.
- The CDP/rozenite path is gated by the Fusebox client-identification handshake and has no
  headless/file egress; the in-app POST sidesteps all of it.
