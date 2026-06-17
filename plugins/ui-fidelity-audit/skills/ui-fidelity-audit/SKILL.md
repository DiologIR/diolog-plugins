---
name: ui-fidelity-audit
description: "Verify that a built UI actually reproduces its reference design — and find out WHY it doesn't — instead of trusting that it does. Use this skill whenever you need to confirm, or you doubt, that an implemented page/component/screen/modal faithfully matches a mockup, prototype, or design system: 'does this page actually match the mock?', 'verify the X migration didn't drift from the design', 'why does this look off even though it uses the same components / same design system', 'audit the fidelity of this UI', 'is this really aligned to the reference', 'the implementation diverged from the design', 'QA this design-system migration', or any time someone CLAIMS a UI matches and you want the claim checked. It exists to defeat the specific traps that hide divergence and produce confident-but-wrong 'it matches' verdicts: the shared-components / same-design-system illusion (shared tokens ≠ shared composites ≠ matching render), certifying parity by reading source code or trusting a commit message / 'presentation-only port' label instead of rendering, explaining real defects away as 'intentional / deferred / app-wins', and scaffolds that look complete in code but ship stubbed or deferred pieces. It renders BOTH surfaces, inverts the burden of proof (a visible difference is a defect until a cited decision proves it intentional), greps the implementation for deferral tells, and produces a defect ledger — then hands every confirmed gap to the mockup-align skill to measure and fix. Trigger even if the user insists 'it should already match' or 'they use the same components' — that belief is exactly the failure this skill catches."
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
---

# UI Fidelity Audit

<role>
You verify whether a built UI faithfully reproduces its reference design, and when it doesn't, you explain exactly why. You are adversarial toward your own conclusions: you assume the implementation has drifted until rendered evidence proves it hasn't, and you never certify parity from anything other than two surfaces rendered side by side. Your output is a defect ledger with rendered evidence, a root-cause explanation, and a hand-off to the tool that fixes it. You are the step that should have run before someone said "it matches."
</role>

## Why this skill exists

A team builds a UI from a reference (a mockup, a prototype, a "design system"), and later someone — often confidently — says it matches. It doesn't. The divergence survives because **the way people check is structurally blind to it**:

- they reason about *source code* instead of looking at *rendered pixels*;
- they trust that two surfaces match because they "use the same components" or "the same design system";
- they read a commit that says "aligned to mock" and believe the claim;
- they see a real difference and reach for a reason it's *fine* ("that's deferred", "the app leads the mock here").

Every one of those produces a verdict that *feels* rigorous and is wrong. This skill is the antidote: it forces rendered comparison, it kills the shared-components assumption, it inverts the burden of proof, and it hunts the places implementations quietly stub things out.

> Relationship to **mockup-align**: that skill *fixes* a UI by measuring `getComputedStyle` per element and aligning every property. This skill runs *first* — it establishes whether there's even drift, finds it, proves it, and explains it. When you have confirmed gaps, hand them to **mockup-align** to measure and fix. Don't reimplement its per-property measurement here; do establish the truth it needs.

---

## The two beliefs you must destroy before auditing

These are the assumptions that make people skip the audit entirely. Test them first, out loud, with evidence — because if either is false (it usually is), everything downstream is suspect.

### Belief 1 — "They use the same components / same design system, so they match."

This is almost always a misread of the architecture. There are three *different* things that can be "shared", and only the last guarantees matching output:

1. **Shared tokens** — both surfaces pull the same hex/spacing/radius values (e.g. a Tailwind config, a `tokens.ts`). This guarantees *colours and scale*, nothing about *structure or composition*.
2. **Shared primitives** — both import the same `Button`, `Card`, `Input`. This guarantees those atoms, nothing about how they're *assembled*.
3. **Shared composites** — both render the *same component* for the surface in question (the actual `IssueDetail`, `Sidebar`, `Modal`). Only this guarantees the surface matches.

The classic failure: a reference mockup and a production app **share tokens and primitives but are parallel, independently-authored reimplementations of every composite.** The mockup defines its own `QIssueDetail`/`FormatToolbar`/`PropRow`; the app defines its own `IssueDetail`/`PropertiesPanel`. They drift the moment one is edited and the other isn't — and "same design system" makes everyone *assume* they can't.

**Establish which layer is actually shared before you trust any parity claim.** Concretely:
- Find the file that renders the reference surface and the file that renders the target surface.
- Check whether the target *imports the reference's composite*, or merely imports shared primitives/tokens. `grep` the target for an import of the reference module; if it isn't there, they are **parallel implementations** and must be diffed by rendering — the "same components" claim is false at the composite level.
- A code comment in the implementation like *"this is the SHELL only"* or *"ported from <mock> / mirrors <mock>"* is a confession that it's a **separate reimplementation**, not the same component.

State the finding explicitly: *"Reference and target share tokens + base primitives but the `<surface>` composite is a separate reimplementation — they will only match where someone reproduced it by hand."*

### Belief 2 — "The code says it matches / the commit says it's aligned / it's a presentation-only port."

Source code, commit messages, PR descriptions, and migration labels are **claims, not evidence**. You cannot see any of these from reading source:

- a missing background/card wrapper around a region;
- missing borders/dividers between rows;
- a control rendered in the wrong place (kebab top-right vs inline by the title);
- a missing editor / toolbar / affordance;
- an avatar/icon/badge that doesn't render because its data resolves empty;
- a gradient, shadow, or radius that's off.

These exist **only at render**. A verdict of "it matches" is valid only if it cites two rendered surfaces. Treat "the alignment commit fixed this" as a hypothesis to disprove by rendering, never as a reason to skip rendering.

---

## Method

Scale the depth to the ask: a quick "does this match?" is steps 1–3 on one surface; a full migration QA is all steps across every surface, fanned out.

### Step 1 — Establish reference, target, and the shared-layer truth

- **Reference (source of truth):** the mockup file, served prototype URL, Storybook story, or other rendered implementation. If not given, ask.
- **Target (under audit):** the built page/route/component. If you can't locate it from a name, ask for the component directory.
- Run the **Belief 1** check above and record whether the composite is shared or a parallel reimplementation. This single fact predicts how much drift to expect (parallel ⇒ assume a lot).

### Step 2 — Render BOTH. Never certify from source.

Open the reference and the target in a real browser and put them next to each other. This is non-negotiable — it is the entire point of the skill. Screenshot each surface and each gated state (open every modal/drawer/popover/expanded widget; a closed surface is unaudited).

Browser tooling (any that reads the DOM + screenshots works):
- **`agent-browser`** — drives SPAs on `http://localhost/` (not a public HSTS host). Use a viewport **≥ 1680px** so multi-column layouts don't collapse; wrap each `eval` in an IIFE; results come back double-JSON-encoded.
- **`playwright-cli`** — equivalent, with Playwright selector ergonomics; good for DOM/console/network inspection.
- **Chrome MCP** (`mcp__claude-in-chrome__*`) — load via `ToolSearch` first; good when a logged-in profile is already where you need it.
- Static mockup: open the HTML directly, or serve the folder (`python3 -m http.server`) if `file://` blocks its scripts/fonts.
- A protected app target usually needs its dev login first; render the actual surface (navigate to the real route with real-ish data) before judging.

If a surface genuinely cannot be rendered, say so and fall back to reading the reference's *rendered-output spec* (the HTML/JS it emits) against the target's emitted DOM — but never silently downgrade to "I read the components and they look equivalent." That is the failure this skill prevents.

### Step 3 — Audit with the burden of proof INVERTED

For each surface, walk it element by element and region by region. **A visible difference is a DEFECT until a cited decision proves it intentional.** This is the opposite of the natural reviewer instinct, and it is deliberate: the natural instinct ("that's probably deferred / app-wins") is precisely what let the drift ship.

A difference may be reclassified as **intentional** only with a *citation*:
- a ticket/spec line that explicitly scopes it out, **or**
- a code comment that says so **and** which you confirm reflects reality (a comment saying "summarize button" above code that renders no summarize button is evidence of an *omission*, not of intent), **or**
- an explicit, recorded product decision ("app-wins": the build deliberately leads the mock).

Without a citation, it stays a defect. "Probably fine" is not a classification.

Audit at least these, on every surface (this is where rendered drift hides):
- **Region containers** — does each region (description, sidebar, card) have the reference's background / border / radius / shadow wrapper, or is it bare?
- **Separators & dividers** — borders between list rows, property rows, sections.
- **Control placement & presence** — is every button/menu/toolbar/affordance present, and in the same position relative to its neighbours (not just "exists somewhere")?
- **Editors & rich affordances** — a reference rich-text editor / formatting toolbar / inline-edit that the target renders as static text is a defect, not a detail.
- **Data-driven elements** — avatars, badges, counts, status pills that render in the reference but resolve empty/absent in the target (often a data-resolution gap, not a CSS gap).
- **Extras the target added** — a control the target shows that the reference doesn't (e.g. a duplicate action in the wrong section) is also a defect.
- **Interaction architecture** — what each trigger opens (modal vs drawer vs popover) and where it lives in the DOM. A pixel-perfect element in the wrong container is still wrong. (mockup-align's Phase 0 covers this in depth once you hand off.)

### Step 4 — Hunt scaffold / deferral tells in the implementation

A surface can look complete in a structural code skim while shipping stubbed pieces. After rendering, `grep` the target's files for the tells that a feature was deferred or faked, and confirm each against the render:

- `TODO`, `FIXME`, `later wave`, `next pass`, `coming soon`, `not yet`, `stub`, `placeholder`, `fallback`, `temporary`;
- a comment naming a feature (e.g. "// send to agent + summarize") whose code renders only some of it;
- a slot/prop that defaults to a plain renderer (`editor ?? <MarkdownFallback>`), i.e. the real thing is optional and absent;
- commented-out JSX for a feature the reference shows.

Each tell is a candidate defect: the implementation itself is telling you what it left out. (For the deeper "is this data real or mocked/seeded" question — renders ≠ real producer — compose with the **spec-validation** skill.)

### Step 5 — Produce the fidelity ledger

One row per confirmed gap, with rendered evidence on both sides:

| Surface | What the reference shows | What the target renders | Evidence (ref vs target) | Classification |
|---------|--------------------------|--------------------------|--------------------------|----------------|

- **Evidence** = a screenshot pair and/or the `file:line` on each side (reference spec line ↔ target code line). Both sides, every row — a one-sided row is unverified.
- **Classification** = `DEFECT` (default) / `INTENTIONAL — <citation>` / `APP-WINS — <recorded decision>`. No row is "probably fine".
- Lead the report with the **root cause** in one or two sentences (almost always: *"the target is a parallel reimplementation that omitted/deferred N pieces of the reference; nobody rendered them side by side"*), then the ledger, then the hand-off.

For a large surface, fan out one sub-agent per region/modal via the `Agent` tool (keep waves ≈5; track with `TaskCreate`/`TaskUpdate`); the orchestrator merges every agent's ledger rows into one report. Each agent must render its region — an agent that returns a code-read verdict has failed the same way you're auditing against.

### Step 6 — Hand off to fix

For each `DEFECT` row, the fix is either structural (add the missing wrapper/control/editor, move the control, wire the absent data) or stylistic (radius/shadow/colour drift). Route the stylistic and per-element work to **mockup-align**, which will measure `getComputedStyle` on both sides and align every property. Structural rebuilds (a missing editor, a relocated control) you implement directly, then re-run mockup-align on the rebuilt region to lock the pixels. Re-render and re-audit after fixing — don't close a row on a code change alone.

---

## Failure-mode catalogue (the self-deceptions this skill names)

Recognise these in yourself and in others' "it matches" claims:

1. **Shared-design-system illusion** — "same components, so it matches." Shared tokens ≠ shared primitives ≠ shared composites. Verify the layer; render the surface.
2. **Code-read certification** — concluding parity from reading component source. You cannot see a missing card, a missing divider, a misplaced control, or an absent toolbar in source. Render.
3. **Claim trust** — believing a commit ("aligned to X"), a label ("presentation-only port"), or a teammate. A claim is a hypothesis to disprove, not evidence.
4. **Explaining-away / motivated classification** — labelling a real difference "deferred / app-wins / intentional" without a citation. Invert the burden of proof.
5. **Scaffold-as-done** — an implementation that ships `TODO`/`later wave`/`fallback` pieces reads as complete in a structural skim. Grep for the tells; confirm against the render.
6. **Closed-state blindness** — auditing only what's visible on load and never opening the modals/drawers/expanded states where most drift lives.
7. **"It opens" ≠ "it matches"** — a container that opens but renders a different interior (flat list vs accordion, static text vs editor) is a fail, not a pass with a footnote.

---

## Done criteria

You are done only when:
- the shared-layer truth is stated (shared composite vs parallel reimplementation), with the grep/import evidence;
- every surface in scope (including each gated modal/drawer/expanded state) was **rendered** on both sides;
- every ledger row carries rendered evidence on **both** sides and a classification that is `DEFECT` or carries an explicit citation — no "probably fine";
- the root cause is stated in one or two sentences;
- confirmed stylistic gaps are queued for **mockup-align** and structural gaps have an owner/plan.

A verdict of "it matches" is permitted only when the rendered side-by-side shows it — never on the strength of source, commits, or shared-component reasoning.

---

## Example invocations

```
does the quorum task-detail page actually match the mock at diolog.mock? it's supposed to use the same design system but it looks off
```
```
QA the fidelity of the settings migration — verify every modal matches docs/ui-mockups/Settings.html, don't trust that it was "aligned"
```
```
someone says the dashboard is a faithful port of the prototype at http://localhost:6007 — verify the claim and tell me where it diverges and why
```
```
the new checkout reuses our shared components so it should match the design — audit it and prove whether it does
```
