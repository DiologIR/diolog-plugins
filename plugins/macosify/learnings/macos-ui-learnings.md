# macOS 26 UI — Accumulated Learnings

> **What this file is.** The single, growing knowledge base of durable, generalisable patterns extracted from analysing real macOS UI screenshots. The **`macos-ui-analyst`** skill writes here (merging, never blindly appending); the **`macosify`** skill reads here as a third knowledge source alongside the bundled HIG (`../reference/hig/`) and `../reference/DESIGN.md`. It starts empty of real learnings — every entry below the divider is added from observed evidence.

## How to use this file

- **`macos-ui-analyst` (writer):** after each screenshot analysis, distil only the *durable, reusable* findings (a pattern that will hold for the next screenshot — not a one-off fact about this image) and **merge** them into the matching category below. Merging means: find an existing entry with the same semantic key → if corroborated, raise its confidence and add the new evidence; if it conflicts, keep both and mark `⚠ conflict`; if genuinely new, add a new entry. Never duplicate an existing rule; never let the file grow unbounded with near-duplicates. Keep entries terse.
- **`macosify` (reader):** load this file and prefer a high-confidence learning here over a guessed value, but **never** over an explicit HIG rule or a `DESIGN.md` token — precedence is **observed evidence in the target → HIG → DESIGN.md → this file**.

## Entry format

Each learning is one bullet:

```
- **<short rule>** — <the detail / value>. `origin: native|catalyst|ios-on-mac|swiftui|any` · `confidence: High|Med|Low` · `evidence: <app/screenshot, N sightings>` · `updated: YYYY-MM-DD`
```

Use the `origin` tag to record **which framework lineage** the pattern belongs to, so a Catalyst/iOS-on-Mac tell is never mistaken for a true-native rule. Tag a rule `any` only when it holds across lineages.

## Framework-origin reference (lineages to tell apart)

The analyst classifies every screenshot's likely lineage; the gold standard for *generation* is always **AppKit-native**. Quick tells (refine these as evidence accrues):

| Lineage | What it is | Native-feel | Common visual tells |
|---|---|---|---|
| **AppKit-native** | True Mac app (AppKit / native SwiftUI for macOS) | ✅ the target | 13pt body, 28/20pt compact controls, real menu bar, source-list sidebar with inset rounded selection, Liquid Glass floating chrome, concentric corners, pop-up/pull-down buttons |
| **Mac Catalyst** | UIKit iPad app bridged to AppKit | ⚠ iOS-derived | Oversized controls + padding, ~17pt body, iOS switch/segmented styling, iOS-style nav bars/back chevrons, plain sheets, weaker/auto-generated menu bar |
| **iOS-on-Apple-Silicon** ("Designed for iPad") | Unmodified iOS/iPadOS app in a resizable window | ❌ least native | Touch-sized 44pt controls everywhere, iOS tab bar at bottom/top, no real menu-bar depth, modal full-screen sheets, no pointer-precise affordances |
| **SwiftUI multiplatform** | One SwiftUI codebase | ✅/⚠ depends | Native when macOS modifiers/styles are used; iOS-like when iOS metrics/components leak through |

**Standing preference:** lean to AppKit-native. When a screenshot reads as Catalyst or iOS-on-Mac, record the *iOS-derived tell* AND its *AppKit-native correction* so `macosify` can convert toward native (e.g. 17pt body → 13pt; 44pt control → 28/20pt; iOS bottom tab bar → source-list sidebar / toolbar; full-screen modal sheet → window-anchored sheet).

---

<!-- LEARNINGS BELOW — added by macos-ui-analyst. Keep them under the category headers; create a new heading only if no category fits. -->

## Window chrome & traffic lights
_(no learnings recorded yet)_

## Liquid Glass & materials
_(no learnings recorded yet)_

## Layout, spacing & geometry (grid, concentric corners)
_(no learnings recorded yet)_

## Typography (SF Pro, sizes, weights, tracking)
_(no learnings recorded yet)_

## Colour & tokens (label tiers, system palette, accent)
_(no learnings recorded yet)_

## Controls (buttons, fields, toggles, segmented, pickers, lists/tables, sidebars, toolbars)
_(no learnings recorded yet)_

## SF Symbols & iconography
_(no learnings recorded yet)_

## Navigation & information architecture
_(no learnings recorded yet)_

## Framework-origin tells & their native corrections (Catalyst / iOS-on-Mac → AppKit)
_(no learnings recorded yet)_

## Native tells & anti-patterns (the "this isn't native" signals)
_(no learnings recorded yet)_

## Open questions / conflicting evidence
_(no learnings recorded yet)_
