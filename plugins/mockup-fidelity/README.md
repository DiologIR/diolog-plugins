# Mockup Fidelity

A Claude Code plugin that **validates** whether an implemented React or React Native UI faithfully reproduces a reference mockup, and then **updates** the code to close every gap — by measuring, never by eyeballing.

It merges and replaces two earlier plugins (`ui-fidelity-audit` and `mockup-align`) into one end-to-end workflow, and adds first-class React Native support.

## What it does

Given a **reference** (the source of truth) and a **target** (the implementation to fix), it:

1. **Inventories every screen** in the reference and maps each to its target route/component — and never silently drops a frame. The inventory is the coverage contract.
2. **Establishes the shared-layer truth** (shared tokens ≠ shared composites), checks token parity, and marks the native-chrome boundary.
3. **Measures both sides into on-disk artifacts** — structure (the rendered tree) and resolved style, captured to JSON, with the ledger generated *from those files*. For the web that's `getComputedStyle` + the DOM; for React Native it's structural/accessibility extraction (`axe describe-ui` / Maestro hierarchy) plus resolved style props over the Metro CDP connection (rozenite / agent-cdp). Screenshots are supplementary, not evidence — frontier vision models catch under half of fine-grained UI differences, so "the screenshots match" is never the verdict.
4. **Validates with the burden of proof inverted** — a visible difference is a defect until a citation proves it intentional. Breadth first (a per-screen present / divergent / **absent** ledger), then structure, then per-property computed-style diffs.
5. **Updates the code** to match the mock and re-verifies at render.
6. **Writes a functional-gaps document** — because new UI added to match a mock is visual-only by default, and the wiring (backend, data, endpoints, navigation) it now needs has to be written down.

## What makes it different

- **Mock is the source of truth — but it asks.** It changes code to match the mock by default, and uses `AskUserQuestion` (full-comparison and per-screen) when honoring the mock would remove working functionality or the intent is ambiguous.
- **Measured, not eyeballed — and the measurement is forced.** Every claim is a printed number drawn from an extracted artifact; `#9CA0AC` vs `#5E6A82` is a miss even when it "looks close". A screen with no artifact on disk is *unaudited*, a completeness-critic rejects any verdict that rests on a screenshot or a source read, and a seeded-defect eval proves the skill still catches planted gaps. (This is the fix for the failure that prompted v1.1.0: an agent that grades from reasoning and screenshots while *feeling* rigorous — prose can't stop it, an artifact gate can.)
- **Breadth before depth** — it catches *missing features*, not just mis-styled present ones, by forcing a present/divergent/absent ledger for every screen, built from the extracted structure trees, before measuring any pixels.
- **React Native native** — the real native-measurement path (`axe describe-ui` for structure + Metro-CDP resolved-style extraction), Maestro for nav/screenshots, react-native-web and source-resolution as explicitly-labelled *fallbacks* (source-reading verifies intent, never what rendered), and that some native-SwiftUI apps simply can't boot on web (so it falls back, or reports a blocker, rather than yak-shaving or eyeballing).
- **Names its own failure modes** — motivated classification ("app-wins"), silent frame dropping, depth-mistaken-for-breadth, native-chrome-as-excuse — the exact self-deceptions that ship drift.
- **Single-script analyzer + differ, with interaction-state and responsive coverage (v2.0.0).** For a web target the whole comparison is one browser-injectable script (`assets/diff/analyze.js`): MODE A captures the full rendered analysis on the LIVE reference, MODE B captures the target and computes the entire diff in-page, returning a prioritised, actionable `{ summary, findings:[{…, suggestedChange}] }`. Beyond resting-state computed style it now also measures the two classes a static, single-viewport dump is blind to — **interaction states** (`:hover`/`:focus`/`:focus-visible`/`:active` overrides resolved from `document.styleSheets`, with cross-origin sheets recorded honestly as `unreadable` rather than a false "matches") and **responsive** (extract both sides at 390/768/1280, then flag where the desktop→mobile layout TRANSITION diverges — a grid that should collapse to 1-col but doesn't, a flex row that stacks on only one side, a nav that becomes a hamburger on only one side). See `assets/diff/run.md`.

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
