# Mockup Fidelity

A Claude Code plugin that **validates** whether an implemented React or React Native UI faithfully reproduces a reference mockup, and then **updates** the code to close every gap — by measuring, never by eyeballing.

It merges and replaces two earlier plugins (`ui-fidelity-audit` and `mockup-align`) into one end-to-end workflow, and adds first-class React Native support.

## What it does

Given a **reference** (the source of truth) and a **target** (the implementation to fix), it:

1. **Inventories every screen** in the reference and maps each to its target route/component — and never silently drops a frame. The inventory is the coverage contract.
2. **Establishes the shared-layer truth** (shared tokens ≠ shared composites), checks token parity, and marks the native-chrome boundary.
3. **Renders both sides** and captures each once — for the web with `getComputedStyle`, for React Native with Maestro (simulator screenshots), react-native-web (real `getComputedStyle`, stubbing native-only modules), or source-resolved StyleSheet+token values (exact, because RN has no CSS cascade).
4. **Validates with the burden of proof inverted** — a visible difference is a defect until a citation proves it intentional. Breadth first (a per-screen present / divergent / **absent** ledger), then structure, then per-property computed-style diffs.
5. **Updates the code** to match the mock and re-verifies at render.
6. **Writes a functional-gaps document** — because new UI added to match a mock is visual-only by default, and the wiring (backend, data, endpoints, navigation) it now needs has to be written down.

## What makes it different

- **Mock is the source of truth — but it asks.** It changes code to match the mock by default, and uses `AskUserQuestion` (full-comparison and per-screen) when honoring the mock would remove working functionality or the intent is ambiguous.
- **Measured, not eyeballed** — every claim is a printed number; `#9CA0AC` vs `#5E6A82` is a miss even when it "looks close".
- **Breadth before depth** — it catches *missing features*, not just mis-styled present ones, by forcing a present/divergent/absent ledger for every screen before measuring any pixels.
- **React Native native** — knows Maestro, react-native-web with native-module stubbing, the no-cascade source-resolved diff, and that some native-SwiftUI apps simply can't boot on web (so it falls back rather than yak-shaving).
- **Names its own failure modes** — motivated classification ("app-wins"), silent frame dropping, depth-mistaken-for-breadth, native-chrome-as-excuse — the exact self-deceptions that ship drift.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install mockup-fidelity@diolog-plugins
```

## Example invocations

```text
align our React Native investor app's Discover, Company and Profile screens to docs/ui-mockups/redesign.html — it's the source of truth; ask me before removing anything the app already does
```
```text
does the settings page actually match the prototype at http://localhost:6007? it's supposed to use the same design system but looks off — verify and fix
```
```text
we ported the dashboard from the figma export; audit fidelity, fix the drift, and tell me what backend work the new UI now needs
```

See `skills/mockup-fidelity/SKILL.md` for the full method, and `references/` for React Native, browser measurement, and the functional-gaps template.

## License

MIT
