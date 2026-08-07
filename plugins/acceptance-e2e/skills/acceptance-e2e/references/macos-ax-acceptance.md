# macOS acceptance via the Accessibility API

The lane for a **macOS app you cannot drive with XCUITest** — most often a SwiftPM package with no
`.xcodeproj`, where the XCUITest target is structurally unavailable rather than merely unwritten.
The runner is the app's own **Accessibility tree**, read through System Events or `AXUIElement`.

Everything here was paid for on a real app. The traps are not hypothetical; each one cost a
debugging session, and several produced *confidently wrong* diagnoses first.

## Why AX and not vision

Practitioner consensus through 2025–26 is semantic-first: drive the accessibility tree, fall back to
screenshots and synthetic input only for the gap. `AXUIElement` is the correct primitive for driving
arbitrary macOS apps — it enumerates roles, labels, values, children, bounds, **supported actions**,
and resolves an element at a screen position
([Apple: AXUIElementCopyAttributeValue](https://developer.apple.com/documentation/applicationservices/1462085-axuielementcopyattributevalue),
[AXUIElementPerformAction](https://developer.apple.com/documentation/applicationservices/1462091-axuielementperformaction)).
Peekaboo's May 2026 release moved its controls to accessibility-action-first with synthetic input as
fallback, which is the same conclusion reached independently.

**Where XCUITest IS available, prefer it for the committed regression layer.** Actions execute
independently of the app and wait for completion synchronously, and Xcode 26 added recording,
post-failure element inspection and Automation Explorer
([WWDC25 344](https://developer.apple.com/videos/play/wwdc2025/344/)). The AX lane is for
exploration, and for apps XCUITest cannot reach.

## The load-bearing caveat

> The accessibility tree is **not identical to the visual view tree.**

Apple states plainly that accessibility supplies type, label, value, identifier and frame, and that
what it exposes is *not necessarily one-to-one* with what a sighted user sees
([Accessibility for AppKit](https://developer.apple.com/documentation/appkit/accessibility-for-appkit)).
Two consequences the AC suite must encode:

- **A green AX walk is not a render check.** It proves the semantic tree; it does not prove anything
  drew. Rendered quality stays with the fidelity/design-review layer.
- **SwiftUI grouping merges and hides nodes.** "Missing or merged semantic nodes" is the single most
  cited native-agent failure mode, and the mitigation is to fix accessibility *in product code*, not
  to reach for coordinates.

## Assert ACTIONS, not just identifiers

The mistake that motivates this section. A real suite asserted that 13 sidebar identifiers resolved
— and all 13 did. But the element carrying `sidebar.spend` was an **`AXStaticText` with an empty
actions list**: the identifier sat on the row's *label*, not on the control that owns the tap. Every
assistive client could locate every destination and activate none.

The identifier assertion passed. The product was broken for exactly the users the API exists for.

```applescript
-- not enough
value of attribute "AXIdentifier" of e

-- what actually closes the gap
name of every action of e   -- must contain "AXPress" for anything interactive
```

Where an in-process test pins the panel enum (`MainPanel.allCases`), note in the suite that it
**structurally cannot see this** — it never renders — so it does not close the item.

## Determinism: fixtures, not clicking

Uncontrolled data is a top-tier flake source; the mitigation is a hermetic fixture mode with frozen
inputs. On macOS that means a **launch argument that seeds display state**, e.g.
`--ui-preview-fixture <absolute path>` rendering the real scene graph while skipping service startup.

Two properties make it worth building:

1. **It reaches surfaces without stealing focus.** If the fixture can also name the landing panel,
   the walk shoots any surface with no synthetic input and no Accessibility *press* grant — so a
   test run never takes the foreground from whoever is at the machine. This is usually the answer to
   "can tests run without the app getting in my way?"
2. **It makes states reachable that no click can produce** — degraded, partial, stale, error.

**Check whether the mechanism already exists before building it.** On the app this reference came
from, both the fixture loader *and* a `mainWindowPanel` field were already implemented, documented,
and unused — the field's own doc comment described this exact use case. Two sessions were spent
re-deriving capabilities already in the codebase.

### The fixture must resemble a real user's data

The highest-value lesson here, and it generalises past macOS.

A spend panel shipped charting `costUsd`. Every fixture had non-zero costs, so every check passed.
The live ledger held **69,441 rows, 100% of them subscription traffic where `costUsd` is correctly
`0`** — so the panel rendered a flat `$0` forever for the entire user base, while the informative
figure ($1,843.67 of avoided cost) sat on every row, unrendered.

No gate could catch it, because every fixture described a user who does not exist.

> When you build a fixture, check its shape against the **real production data**, not against what
> makes the surface look good. If the dominant real-world case renders empty, that is the case the
> fixture must cover — and the resulting red test is the finding.

## The counter-position, stated fairly

One research backend argues the opposite of this whole document:

> **Hand-rolling macOS `AXUIElement` parsers is now technical debt.** Tools like `macOS-MCP`,
> `mcp-server-macos-use`, and Apple's `xcrun mcpbridge` (Xcode 26.3) provide standardized LLM
> interfaces for desktop control.

and recommends replacing "a custom accessibility dumper and screencapture tool" with an off-the-shelf
MCP server to "eliminate the maintenance burden of the proprietary harness".

Take it seriously, and note three things before acting on it:

1. **It answers a different question.** Those MCP servers give an *agent* hands to drive arbitrary
   apps. An acceptance harness needs a repeatable pass/fail gate with stable exit codes — an agent
   exploring a UI is not a CI check, and the industry pattern both backends describe is to *convert*
   agent exploration into cheap deterministic assertions. Use an MCP server to explore; keep a
   deterministic runner for the gate.
2. **Its `mcpbridge` claim is contested by better sourcing.** A second backend reviewed Apple's own
   documentation and reported that it does **not** establish arbitrary AX-tree inspection or GUI
   actions through `mcpbridge` — the UI-driving features documented remain XCUIAutomation. That
   backend cites `developer.apple.com` primary docs; the technical-debt claim's chain leans on a
   vendor blog, which was also its single largest domain.
3. **Neither claim was corroborated.** Across a three-backend panel on this exact question, **zero
   claims were made by more than one backend** and source overlap was 5%. Every position here,
   including this document's, is one backend's reading.

The honest split: **if you need an agent to drive a Mac app, reach for an existing MCP server first.
If you need a gate, own the runner.** A ~200-line shell script plus a small `AXUIElement` walker is
not a platform, and the traps below are paid for once.

## The traps, each measured

**Kill any previous instance BEFORE deleting its bundle.** A harness that does
`rm -rf "$WORK"` while a prior copy still runs deletes the bundle out from under a live process; the
copy is recreated at the same path, and `open` then finds the **bundle id already registered** and
activates the *zombie* instead of launching the new copy. No new window appears, every assertion
fails as "window never appeared", and the failure points squarely at the app. This produced a
full session of red runs and two confident misdiagnoses before the ordering was spotted.

**Bind `entire contents` to a variable before iterating.** Iterating it inline yields **zero**
identifiers where the bound form yields **41** on the same window, measured A/B back to back. Both
forms look correct; one silently returns nothing.

```applescript
set c to entire contents of w   -- bind first
repeat with e in c
```

Nested `if`s with explicit `as text` are also required: `v is not missing value and v is not ""`
evaluates *both* operands, throws on `missing value`, and an outer `try` swallows it.

**Copy the bundle somewhere outside `$TMPDIR`.** A copy launched from `/var/folders/...` reads
**zero** AX elements where the identical copy under `~/Library/Caches` reads **118** — App
Translocation makes the translocated app's tree opaque. `xattr -dr com.apple.quarantine` alone does
not fix it.

**Give the copy a distinct bundle identifier and re-sign ad hoc.** Sharing the primary's bundle id
makes LaunchServices activate the *primary* instance, so the harness silently tests the running
production app.

**Preflight the Accessibility permission and exit non-zero without it.** Every AX query returns
empty when the grant is missing, which is **indistinguishable from a missing identifier**. A suite
without this preflight reports N false "missing identifier" failures instead of one honest
"no permission".

**Guard the zero-count case.** If the walk resolves zero elements, fail **once** with "tree
unreadable" rather than emitting one failure per expected identifier. N false failures read as a
broken app; one reads as a broken harness.

**Expect a non-activating panel to appear first.** A background/companion `NSPanel` registers as
`AXSystemDialog` and can be enumerated *before* the main window exists, so "a window exists" is true
too early. Poll for the window whose subrole is `AXStandardWindow`, then settle.

**Never suppress stderr on a probe whose emptiness you will treat as evidence.** Three separate
wrong conclusions in one session traced to this: a module that could not be imported, a glob that
errored into the output file, and a capture flag that captured the wrong thing — each read as "the
thing is not there". If empty output means "absent" in your logic, stderr must be visible.

## Shape of a suite

```bash
preflight   # AX permission -> exit 2 if absent; bundle exists?
            # kill any stale preview FIRST
copy        # -> ~/Library/Caches/<name>.app, distinct bundle id, ad-hoc re-sign
launch      # open <copy> --args --ui-preview-fixture <abs path> --ui-preview-appearance <light|dark>
poll        # for subrole AXStandardWindow, then settle
walk        # bind `entire contents`; collect identifier + ACTIONS per element
assert      # identifier present AND AXPress present for interactives
            # per fixture x per surface x both appearances
```

Coverage axes for the Phase 0 declaration: **surface × forced state × appearance (light/dark) ×
Dynamic Type**. A suite green on one surface in one appearance is a declared sample of one cell — say
so, rather than letting the assertion count imply breadth. One real suite sat green at 14 assertions
covering a single panel while an eight-tab settings surface had never been opened.

## Also worth knowing

- **`performAccessibilityAudit()`** is the cheapest a11y gate where XCUITest *is* available:
  contrast, Dynamic Type, clipped text, missing labels, hit regions ≥ 44pt.
- **Xcode 26.3** exposes Xcode's own tools to external agents via `xcrun mcpbridge` — build, test,
  docs, fix. It is **not** a general Mac GUI-driving framework, and reviewed Apple documentation does
  not establish arbitrary AX-tree access through it. Do not plan a suite around that assumption.
- **Cost.** One backend put agent-driven runs at **$15–30 each**, which rules them out as a
  blocking CI gate. Treat agent exploration as a *finding* tool and convert what it finds into
  cheap deterministic assertions — the pattern the whole industry converged on.
