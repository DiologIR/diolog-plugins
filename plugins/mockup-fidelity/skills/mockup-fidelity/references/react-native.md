# React Native targets — how to render, measure, and respect native chrome

A React Native app has **no DOM**, so `getComputedStyle` doesn't exist the way it does for the reference. You have three complementary ways to get rigorous, measured comparisons. Use the cheapest one that answers the question; combine them.

## 1. The key insight: RN has no CSS cascade

In the browser, an element's *computed* style is the end of a long pipeline — inheritance, the cascade, specificity, `calc()`, `em`/`rem` resolution. You can't trust the authored CSS; you must read the computed value.

React Native has **none of that**. A component's applied style is exactly its `StyleSheet` object (plus inline style props), resolved against literal token constants. There is no inheritance (except a few text props), no cascade, no `calc`. So:

> **For RN, the source-resolved value IS the computed value.** Read the component's `StyleSheet.create({...})` and resolve any token references (`color.fgMuted`, `space.md`, `radius.lg`) to their literal values in the token file. That number is authoritative — it's what the device renders.

This means the rigorous diff is **`mock getComputedStyle` (browser, exact) vs `app source-resolved StyleSheet+token values` (exact)** — two exact numbers, no approximation. It's often faster and *more* reliable than booting react-native-web, because RNW itself only *approximates* native rendering (it maps RN styles to CSS; native shadows, blur/glass, fonts, and the native tab bar differ). Reach for RNW when you want a real `getComputedStyle` DOM to diff structurally or to confirm a resolved value; reach for source-resolution when RNW won't boot.

Watch for **systematic token offsets**: if every radius is 2px tighter or every spacing step differs, that's a single decision in the generated token source, not a per-screen bug. Flag it for the user; don't hand-edit a shared/generated token across the whole app to chase one mock.

## 2. Maestro — drive a real simulator (the most accurate render)

Maestro navigates the actual app on a real simulator/emulator and screenshots it. This is the **truest** render — native chrome, fonts, glass, shadows exactly as users see them.

- Flows are YAML (`appId`, then a list of `tapOn`/`inputText`/`assertVisible`/`takeScreenshot`). `takeScreenshot: /abs/path/name` captures the current screen mid-flow — use it to grab each screen into your workspace.
- The simulator is a **serial resource** — one screen at a time. Drive navigation yourself (the orchestrator); sub-agents can read the resulting screenshots and edit disjoint files in parallel, but can't each drive the sim.
- **Dev-client reconnect fatigue:** every flow's `launchApp` reloads the JS bundle on a dev build; running many flows back-to-back can make a later launch hang. Run flows **individually** (or restart Metro between batches); a release build with an embedded bundle is stable for batches. macOS has no `timeout` — wrap a flow in a background process with a kill-after-N-seconds guard if you need a per-flow ceiling.
- Capture raw screenshots without Maestro too: `xcrun simctl io <udid> screenshot out.png`. Screenshots are 3× on retina, so 1px ≈ 0.33pt — precise enough to measure spacing/positions when you can't get a DOM.
- A dev client connects to whatever Metro is at the host/port; if two apps share a Metro port you can load the wrong bundle. Point a dev client at a specific Metro with the dev-client deeplink, and use a **separate simulator + its own Metro port** when another app already holds the default.

## 3. react-native-web — run the app in a browser for real getComputedStyle

`react-native-web` renders RN components to actual DOM, so `getComputedStyle`/`getBoundingClientRect` work like the reference. Expo apps usually have an `expo start --web` path. This lets you do a CSS-to-CSS computed-style diff of the *component style definitions* against the HTML mock.

The catch: **native-only modules crash the web boot**, one at a time. Stub them in the metro web resolver, gated on `platform === 'web'` so native builds are untouched:

```js
// metro.config.js — inside config.resolver.resolveRequest, before the default return:
const WEB_STUBS = {
  'react-native-branch': path.resolve(__dirname, 'web-stubs/noop.js'),
  'react-native-maps': path.resolve(__dirname, 'web-stubs/maps.js'),
  'expo-secure-store': path.resolve(__dirname, 'web-stubs/secure-store.js'), // localStorage shim so auth can persist on web
  'expo-glass-effect': path.resolve(__dirname, 'web-stubs/glass.js'),        // passthrough View
  '@react-native-firebase/app': NOOP, '@react-native-firebase/messaging': NOOP,
  'expo-notifications': NOOP,
};
if (platform === 'web' && WEB_STUBS[moduleName]) {
  return { type: 'sourceFile', filePath: WEB_STUBS[moduleName] };
}
```

Stub shapes: a no-op is a `Proxy` whose every property is a no-op function (covers default + named imports); a native UI component (`react-native-maps`) stubs to a `View` passthrough; `expo-secure-store` stubs to a `localStorage`-backed `getItemAsync/setItemAsync/deleteItemAsync` so the login token can persist and you reach authenticated screens. Removing a genuinely-unused native dep outright (with the owner's OK) is cleaner than stubbing it.

**Boot is iterative:** the first crash hides the next. Fix one native module, rebuild, see the next, repeat. Set a viewport equal to the mock's frame (measure the mock's phone-frame width, e.g. 393×852) so layouts match. Clear the metro cache after a resolver change; the empty-cache web rebuild is slow (a minute+), and the browser may show a stale error overlay until the new bundle loads — hard-reload.

**Know when to stop.** Some apps build their UI on **native-only primitives** — e.g. native SwiftUI components (`@expo/ui/swift-ui`: `Host`, `VStack`, `BottomSheet`) for an iOS-native look. These have *no web rendering by design* and can't be stubbed without reimplementing a UI kit — the app is architecturally unbootable under RNW. That's not a failure to push through; it's a finding (it's *why* the native chrome wins), and it's the signal to fall back to **Maestro screenshots + source-resolved style values**, which are exact for RN anyway. Don't sink hours into a web boot that can't happen — the "additional fixes if necessary" stop at the point where the app's UI layer is fundamentally native.

## 4. Native chrome wins — for chrome, not content

When the implementation deliberately uses native components — a native bottom tab bar (e.g. `expo-router` `NativeTabs`), native nav headers with the OS back chevron and native bar-button items, native sheets/modals, native blur/glass — those are the intended, correct look and you do **not** recreate the mock's hand-drawn versions. Record the chrome boundary once (Phase 1) and don't refight it on every screen.

Two guardrails:
- This applies to **chrome**, never to **content**. Don't let "native wins" become a blanket excuse to skip auditing the screen body — that's the native-chrome-as-excuse anti-pattern.
- A real defect can still live *in* the chrome: a self-drawn title that overlaps the status bar (missing safe-area inset), a custom circular back button where the app should use the native chevron, a tab badge that shows when it shouldn't. "Use native chrome" also means *prefer the native affordance over a custom one* — flag custom-drawn back/nav buttons where a native header button is intended.

## Common RN defects this pass surfaces

These recur because they're invisible in source and only show at render:
- **Raw/unformatted numbers** — a market cap printed as `56252638047.35` instead of `56.25B` because a value went through a price formatter instead of a compact formatter. Grep for the formatter used at each numeric cell.
- **Duplicate React keys** — a `.map()` whose `key` is built only from non-unique fields (type+label+date) throws "two children with the same key" when the data has duplicates (common with corporate-action feeds). Fix by appending the array index. Audit every `.map()` in a changed file.
- **Status-bar / Dynamic-Island overlap** — a `headerShown:false` screen drawing its own large title with a fixed `paddingTop` instead of `insets.top + n` (use `useSafeAreaInsets`).
- **Cosmetic feature affordances** — an "AI" badge / mic / "Ask in plain English" that renders but does nothing, while the real interpretation/search isn't wired. These belong in the **functional-gaps document**.
