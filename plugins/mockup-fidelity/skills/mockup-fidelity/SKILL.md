---
name: mockup-fidelity
description: "Validate that an implemented React or React Native UI faithfully reproduces a reference mockup, then update the code to close every gap — by measuring, never eyeballing. Use whenever someone wants to compare, align, pixel-match, audit, or verify a built page/screen/component against a design: 'does this match the mock?', 'align the app to the figma/html mockup', 'pixel-match this screen', 'why doesn't it look like the design?', 'verify the migration didn't drift', 'audit the UI fidelity', 'what's missing vs the mock?', 'make the react-native app match the prototype'. Treats the mock as the source of truth; builds a COMPLETE screen/frame inventory and never silently drops a frame; renders both sides; inverts the burden of proof (a visible difference is a defect until a citation proves it intentional); diffs structure first, then per-property computed styles; produces a per-screen present/divergent/absent ledger AND a functional-gaps document for newly-added UI that is only visual. For React Native it can drive the app with Maestro (navigate + screenshot a simulator) and/or run it under react-native-web to read getComputedStyle (stubbing native-only modules when the web boot is blocked), and knows RN has no CSS cascade so a component's StyleSheet resolved against its tokens IS its computed style when RNW can't boot. Asks the user when unsure, on a full-comparison and a per-screen basis. Generic and framework-agnostic. Trigger even when told 'it should already match' or 'it uses the same design system'."
allowed-tools:
  - "Read"
  - "Write"
  - "Edit"
  - "Bash"
  - "Grep"
  - "Glob"
  - "Agent"
  - "ToolSearch"
  - "TaskCreate"
  - "TaskUpdate"
  - "AskUserQuestion"
---

# Mockup Fidelity

<role>
You bring an implemented UI into faithful agreement with its reference design, and you prove it. You do two jobs in one pass: you **validate** (find every place the build diverges from the mock, with rendered evidence) and you **update** (fix each gap by measuring, then re-verify). You are adversarial toward your own conclusions — you assume the implementation has drifted until evidence shows it hasn't, you never certify a match from source code or a commit message, and you never let "the app is probably ahead here" excuse a difference you didn't investigate. The reference is the source of truth; when honoring it would mean removing real functionality or you genuinely can't tell what's intended, you ask rather than guess.
</role>

## The mock is the source of truth — and when to ask

Treat the reference design as authoritative. Where the implementation diverges, the **default action is to change the code to match the mock**, not to rationalize the difference. This is the single most important stance, because the failure that ships drift is the reviewer who sees a real difference and reaches for a reason it's fine.

But "source of truth" is a stance, not a licence to act blindly. **Ask the user — using `AskUserQuestion` — at two scopes:**

- **Full-comparison scope (once, up front):** confirm the reference, the target, and the breadth. "Is `<mock>` the authority for *everything*, or only for the screens I name? Should I change code to match it everywhere it differs, or list differences for you to triage?" This sets whether you're auto-fixing or producing a reviewed plan.
- **Per-screen / per-decision scope (as they arise):** when honoring the mock on a specific screen would **remove or regress real working functionality** (the build has a richer, wired feature the mock's sample frame lacks), or when the mock's intent is genuinely ambiguous (a placeholder value, an obviously-illustrative ABN/email, a feature that needs a backend that may not exist), **stop and ask** rather than silently deleting the feature or fabricating data. Frame it concretely: "The app's Discover has live Editor's-Picks rails the mock doesn't show; the mock instead has Browse-by-sector and AI-search the app lacks. Keep both, replace one with the other, or build the missing ones?"

Asking is not weakness — it is how you avoid the two opposite mistakes: blindly stripping good functionality to match a sample frame, and blindly rationalizing missing features as "intentional." When in doubt, ask; otherwise, the mock wins.

---

## What goes wrong — the self-deceptions this skill defeats

Every one of these produces a verdict that *feels* rigorous and is wrong. Recognize them in yourself.

1. **Motivated classification ("app-wins / app-ahead / probably deferred").** You see a real difference and label it intentional *without a citation*. This is the #1 way drift ships. A difference is reclassified from DEFECT to intentional **only** with: a ticket/spec line scoping it out, a code comment that says so *and* matches reality, or an explicit recorded product decision. "Probably fine" is not a classification. (This skill was born from a review that wrote off a mock's "Ask in plain English" search and "Browse by sector/index" as "the app folds AI into the search bar" — a rationalization; those features were simply absent.)
2. **Silent frame dropping.** You curate the list of mock screens to compare and quietly omit some — and an omitted screen is a screen you never audited. Whole features (a Browse tab, an AI-search state, a spawned modal) vanish from the comparison because they were never in it. **Build the complete inventory first and log anything you exclude, with a reason.**
3. **Depth mistaken for breadth.** You measure one element's pixels exhaustively (a stat grid's padding, a 2px radius offset) and it *feels* thorough — but measuring what's present is not the same as cataloguing what's missing. Coverage is breadth (every screen × every affordance → present / divergent / **absent**) *before* depth (per-property measurement of what's present).
4. **Native-chrome-as-excuse.** When a real native implementation correctly uses native components (a native tab bar, native nav headers, native sheets), those *are* intentional and you don't recreate the mock's hand-drawn chrome. But "native wins" is about *chrome*, not *content* — it must never become a blanket reason to skip auditing the screen's body. Audit the content; respect the chrome.
5. **Shared-design-system illusion ("same components, so it matches").** Shared tokens ≠ shared primitives ≠ shared composites. Only a shared *composite* (the actual rendered screen component) guarantees a match; shared tokens guarantee only colours/scale. Verify which layer is actually shared before trusting any parity claim.
6. **Code-read / claim certification.** A commit ("aligned to mock"), a label ("presentation-only port"), or reading the component source cannot reveal a missing card, a missing divider, a relocated control, an absent editor, or an avatar that resolves empty. Those exist only at render. A "it matches" verdict is valid only when it cites two rendered surfaces.
7. **Spawned-surface blindness.** You audit the named screens and never the modals/drawers/sheets/popovers/pickers they open. An unlisted surface is an unaudited one. Named screens are seeds, not the ceiling.
8. **Un-wired variants & thin renders.** Sibling variants that should differ (urgent vs normal, each status colour, sizes) render identically because a prop isn't wired; an element exists but its content never reached the DOM. Both are invisible in a single happy-path screenshot.

---

## Inputs

1. **Reference (source of truth)** — an HTML+CSS mockup file or gallery, a served prototype URL, a Storybook story, a Figma export, or another rendered component set. If missing, ask.
2. **Target (to fix)** — the implemented React / React Native page/screen/component(s). If you can't locate it from a name, ask for the directory.
3. **Frameworks** — note both sides. The reference is almost always DOM (HTML/CSS, readable with `getComputedStyle`). The target is React (DOM, same) **or** React Native (no DOM by default — see `references/react-native.md`).

Run the full-comparison-scope ask (above) before starting.

---

## Method

Scale depth to the ask: a quick "does this screen match?" is Phases 0–3 on one screen; a full alignment is all phases across every screen, fanned out. Track multi-screen work with `TaskCreate`/`TaskUpdate`.

### Phase 0 — Inventory every screen. No silent drops.

Before comparing anything, enumerate **every** screen/frame the reference contains and map each to its target route/component. For an HTML mock gallery this is every phone frame / `figure`; for a prototype it's every route; for a Figma export every artboard.

- Produce an explicit inventory table: `reference frame → target route/component → in-scope? (reason if not)`. Auth/OS/disabled-feature frames may be legitimately out of scope — but they appear in the table marked excluded *with a reason*, never dropped in silence.
- Then expand it: every trigger on an in-scope screen that *opens* a new surface (modal, drawer, sheet, popover, picker, command palette) is itself a screen — add it. Build the list two ways and union them: at render (walk the controls, note what each opens) and in code (grep for `role="dialog"`, `<Dialog`/`<Drawer`/`<Sheet`/`<Modal`, `*Modal`/`*Picker`, conditional overlay mounts).

The inventory is the coverage contract. If a screen isn't in it, you will not audit it — so getting it complete is the whole game.

### Phase 1 — Establish the shared-layer truth (and the chrome boundary)

- Find the file that renders each reference surface and each target surface. Check whether the target *imports the reference's composite* or merely shares tokens/primitives. A provenance comment ("ported from / mirrors <mock>", "shell only") confesses a **parallel reimplementation** — assume a lot of drift and make the structural diff (Phase 3A) mandatory.
- **Token parity first.** Compare the foundation tokens literally — read the reference's `:root` CSS variables (or token file) and the target's token file side by side: colours, fonts, radii, spacing, shadows. If they're identical, divergence is composition-level (focus there). If they differ, note it — and watch for *systematic* offsets a single element hides (e.g. a radius scale uniformly 2px tighter), which are token-source decisions, not per-screen fixes: flag them for the user rather than editing a shared, generated token unilaterally.
- **Mark the chrome boundary.** Identify what is native chrome on the target (native tab bar, nav header, sheets, OS status bar) vs. content the app draws. Native chrome that diverges from the mock's hand-drawn chrome is intentional — record it once and don't refight it per screen. Everything inside the content area is in scope.

### Phase 2 — Render BOTH and capture each once

Open the reference and the target and put them next to each other — rendered, not reasoned-about. Capture each screen and each gated state (open every modal/drawer/expanded widget) into a workspace dir (`.mockup-fidelity/<screen>/ref.png|ref.json`, `target.png|target.json`). The reference is immutable for the whole pass — capture it once and reuse it everywhere; re-capture only the target after a fix.

- **Reference (DOM):** serve the HTML (`python3 -m http.server` if `file://` blocks scripts/fonts) and read it with a browser tool — `agent-browser`, `playwright-cli`, or the Chrome MCP. Extract `getComputedStyle` per element plus the structured snapshot. See `references/browser-measurement.md` for the tools, gotchas, and the **fidelity probe** (one `eval` that returns the structural skeleton + each control's containment anchor + region styles + thin/variant flags).
- **Target — React (DOM):** render its dev server, log in if protected, navigate to the real route, and measure the same way.
- **Target — React Native (no DOM):** you have three complementary options; read `references/react-native.md` for the full how-to. In short: **Maestro** drives a real simulator to navigate and screenshot each screen (the most accurate render); **react-native-web** runs the actual RN components in a browser so you *can* read `getComputedStyle` (apply the native-module stubs in the reference when the web boot is blocked — and know some apps using native-only UI primitives can't boot on web at all); and because **RN has no CSS cascade**, a component's applied style is just its `StyleSheet` literals resolved against its token constants — so when RNW can't boot, the source-resolved values *are* the computed style, and `mock getComputedStyle vs app source-resolved values` is an exact, authoritative diff.

### Phase 3 — Validate with the burden of proof inverted

For each in-scope screen, work from the captured snapshot (don't re-open the page per check). **A visible difference is a DEFECT until a cited decision proves it intentional.**

#### 3A — Breadth before depth: the present / divergent / ABSENT ledger

For **every** affordance the reference screen shows (every section, card, row, control, label, badge, chart, input, CTA), mark its state in the target: **present** (and matching), **divergent** (present but wrong place/style/content), or **absent** (the reference has it, the app doesn't). This forced enumeration is what catches missing *features* — the class that "measure the present elements" structurally cannot find. Fill it in for every screen before measuring any pixels.

#### 3B — Structure before styling

Diff the **skeleton** (the ordered, nested tree of regions and the controls in each) before any colour/spacing. Match each control across sides by stable identity (`aria-label`/text/`testID`), then compare its **container path and position within that container** — never absolute coordinates (the surrounding chrome differs, so absolute `x` is meaningless). A control that is present and pixel-correct but in the *wrong container* (a menu in a top-right strip vs inline with the title) is caught only here. For a parallel reimplementation, diffing the two render functions in code is the cheapest catch — a relocated control is a one-node source difference and a near-invisible pixel difference. Reconcile the skeletons before 3C.

#### 3C — Then per-property computed-style measurement

For each element that *is* present and structurally correct, diff the resolved styles property-by-property with full, untruncated values: font-size/weight/line-height/color/letter-spacing, padding/margin/gap, border (per side), border-radius, background (incl. gradients), and **box-shadow** and **`::placeholder` colour** (the two most often silently wrong). A ✓ requires both values printed and matching — `#9CA0AC` vs `#5E6A82` is a miss even when it "looks close". Include spacing-accumulation (total gap between a heading and its first content, via bounding-rect deltas, not just one margin) and sibling-adjacency gap checks.

For React/HTML, both sides are `getComputedStyle`. For React Native, the reference is `getComputedStyle` and the target is RNW `getComputedStyle` *or* source-resolved StyleSheet+token values (both exact — see `references/react-native.md`). RN allows one shadow per view, so a two-layer CSS box-shadow can't be fully reproduced — note the approximation rather than chasing it.

### Phase 4 — Hunt scaffold / deferral tells

After rendering, grep the target for the tells that a feature was stubbed or deferred — `TODO`/`FIXME`/`later`/`coming soon`/`placeholder`/`fallback`, a comment naming a feature whose code renders only part of it, a slot that defaults to a plain renderer (`editor ?? <Plain>`), commented-out JSX for a feature the reference shows. Each is a candidate defect, confirmed against the render. A cosmetic affordance that *looks* like a feature (e.g. an "AI" badge on a search bar that does plain substring search) is a classic — note it.

### Phase 5 — The two deliverables

**(a) The fidelity ledger** — one row per confirmed gap, rendered evidence on both sides, classification `DEFECT` (default) / `INTENTIONAL — <citation>` / `APP-WINS — <recorded decision>`. Lead with the one-sentence root cause, then the ledger. No row is "probably fine".

**(b) The functional-gaps document (always produce this).** Any UI you align or add to the implementation that the app didn't previously have is, by default, **visual only** — the wiring behind it likely doesn't exist. When you bring a screen up to the mock, write a document (e.g. `docs/<surface>-functional-gaps.md`) listing, per added/aligned affordance, the functional work it implies: missing backend endpoints, GraphQL fields / queries / mutations, data sources, navigation targets, permission checks, empty/loading/error states, and anything that currently renders but isn't wired to real data. The template and rationale are in `references/functional-gaps.md`. This exists because a pixel-perfect screen wired to nothing reads as "done" and is the most expensive kind of false-done.

### Phase 6 — Update the code, then re-verify

For each DEFECT: structural fixes (add the missing region/control/editor, move the control, wire absent data) you implement directly; stylistic fixes (radius/shadow/colour/spacing drift) you measure-and-align. After any change, **re-render only what you changed** (reuse the captured reference — never re-render it) and re-diff. Don't close a row on a code change alone. For RN, reloading via Fast Refresh + a fresh Maestro/simctl screenshot confirms the fix on the real device. Verify each fixed component classifies clean (renders, content present, sibling variants differ) before declaring done.

For a large surface, fan out one sub-agent per screen/region via `Agent` (keep waves ≈5). Hand each the already-captured reference artifacts so no agent re-renders the reference; each renders only its target region. **A sub-agent that returns a code-read verdict has failed the audit it was asked to run** — require rendered evidence. Caution: for React Native, the simulator is a *serial* resource (one screen at a time) — sub-agents can read screenshots and edit disjoint files in parallel, but the navigation/screenshotting itself is serialized by the orchestrator. Serialize edits to shared primitives/tokens.

---

## Framework specifics — read the matching reference

- **React Native target** (Maestro, react-native-web + native-module stubbing, the no-cascade source-resolved diff, native chrome): `references/react-native.md`.
- **Browser measurement** (agent-browser / playwright-cli / Chrome MCP, the gotchas, and the fidelity probe `eval`): `references/browser-measurement.md`.
- **Functional-gaps document** (why, when, and the template): `references/functional-gaps.md`.

---

## Done criteria

You are done only when:
- the **full screen inventory** exists and every reference frame is either audited or explicitly excluded with a reason — nothing dropped silently;
- the **present / divergent / absent ledger** is filled for every in-scope screen (breadth), before any per-property measurement (depth);
- the shared-layer truth and token-parity are stated; the chrome boundary is recorded;
- every in-scope screen (including gated and spawned surfaces) was **rendered** on both sides; every ledger row carries rendered evidence on both sides and a classification that is `DEFECT` or carries an explicit citation — no "probably fine", no "app-ahead" without a recorded decision;
- structure was diffed before styling; per-property computed-style diffs are printed with both full values for every fixed element;
- every confirmed gap is fixed (or queued with an owner) and re-verified at render — not closed on a code change;
- the **functional-gaps document** is written for every aligned/added surface;
- where honoring the mock would remove working functionality or the intent was ambiguous, you **asked** rather than guessed.

A verdict of "it matches" is permitted only when the rendered side-by-side shows it.

---

## Example invocations

```
align our React Native investor app's Discover, Company and Profile screens to docs/ui-mockups/redesign.html — it's the source of truth; ask me before removing anything the app already does
```
```
does the settings page actually match the prototype at http://localhost:6007? it's supposed to use the same design system but looks off — verify and fix
```
```
we ported the dashboard from the figma export; audit fidelity, fix the drift, and tell me what backend work the new UI now needs
```
```
pixel-match the checkout modal to ~/Downloads/Checkout.html and list any feature in the mock we haven't actually built
```
