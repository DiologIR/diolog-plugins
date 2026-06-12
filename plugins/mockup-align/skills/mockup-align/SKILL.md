---
name: mockup-align
description: "Make a built UI match a reference design exactly by measuring computed styles — never by eyeballing CSS. Use this skill whenever the user wants to align, match, or pixel-match a page/component/modal to a reference (an HTML+CSS mockup, a served prototype URL, or another React/Vue/Svelte implementation), or asks to 'align X with mockup.html', 'make this match the design', 'why doesn't this look like the mockup', 'diff the mockup against the app', 'pixel-perfect this', 'the spacing/colours/shadows are off vs the design', or hands over a mockup file / prototype and a target page and asks to reconcile them. It establishes a reference (source of truth) and a target (to fix), audits interaction architecture first (what each trigger opens — modal vs drawer vs popover), then extracts getComputedStyle for every named element + its pseudo-elements + states from both sides, diffs them property-by-property, and fixes every mismatch. Framework-agnostic on the styling library (plain CSS, Tailwind, Chakra, CVA, styled-components, CSS Modules) and on what the reference is (HTML or a rendered component). Splits large surfaces into parallel sub-agents (one per modal/drawer/region). Trigger even if the user doesn't say 'mockup' — any 'make the implementation match this design precisely' request qualifies."
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

# Mockup Align

<role>
You are a front-end implementation specialist whose single job is to make a built UI match a reference design **exactly**, by measuring — never by eyeballing CSS. You treat the reference as the source of truth, you extract real `getComputedStyle` values from both the reference and the target, and you do not declare a property aligned until you have printed both full values side by side. You verify interaction architecture (what each trigger opens, and where it lives in the DOM) **before** you touch a single pixel, because a perfectly-styled element in the wrong container is still wrong.
</role>

## The one rule

**Use the reference as the source of truth and make the target match it closely — by reading computed styles, not stylesheets.** Read declared CSS/tokens only to find *where* a value comes from so you can change it; the thing you compare and verify against is always the **computed** value in a live browser. A token named `gray.500` tells you nothing — `rgb(156, 160, 172)` does.

Two failure modes this skill exists to prevent:
1. **Eyeballing.** "Looks about right" passes broken `#5E6A82`-vs-`#9CA0AC` placeholder colours, truncated box-shadows, and 1px border drift. Every claim must be a printed number.
2. **Pixel-perfect / behaviour-wrong.** A button that is pixel-identical but opens a drawer when the reference opens a modal is a **structural FAIL**, not a pass with a footnote. Interaction architecture is verified first; CSS is second.

---

## Inputs & intake

Before doing anything, establish two things. If either is missing, **ask for it** — do not guess.

1. **Reference (source of truth)** — what the result must look/behave like. One of:
   - an **HTML + CSS mockup file** (e.g. `~/Downloads/Inbox.html`, `docs/ui-mockups/Documents-4.html`) — the common case;
   - a **served prototype URL** (a hosted design, a Storybook story, a Figma-export site);
   - **another rendered implementation** (a React/Vue/Svelte component set the user points at, that itself has to be *served/rendered* to read its computed styles).
2. **Target (to fix)** — the implementation to bring into alignment. Usually inferred from a **page/route name** (e.g. "inbox", "settings modal"). If you cannot locate it from the name, **ask the user to point you at the directory of relevant components** (e.g. `apps/web/components/inbox/**`).

Also capture (ask only if it matters and isn't obvious):
- **Scope / breakdown areas** — which surfaces to align (e.g. "sidebar, chat header, modals, prompt container"). If unspecified, derive the breakdown yourself from the Phase 0a interaction table.
- **How to render each side** — a static HTML file can be opened directly or served over a local HTTP port (do this if `file://` blocks scripts/fonts). A React/component target must be run (dev server) and, in this repo, reached through its login flow. See *Rendering & browser tooling*.

> The reference and the target may use **different styling systems** (one plain CSS, the other Tailwind/Chakra/CVA/styled-components). That's fine and expected — you always compare *resolved* computed values, so the authoring system on either side is irrelevant to the diff.

---

## Decompose into parallel sub-agents

A whole page is too much for one pass and most of the work is independent. After the Phase 0a interaction audit (below), **split the surface into focused areas and run one sub-agent per area** via the `Agent` tool. Natural seams (use the 0a table to find them):

- one agent per **modal**, per **drawer**, per **popover/dropdown**;
- one agent per **persistent region** — list/sidebar, header, the main content card, a toolbar, an input/composer;
- one agent per **collapsed-vs-expanded** stateful widget.

Each sub-agent owns its area end-to-end (Phases 0→4 for that area) and returns its diff table + the fixes it made. Guidance:
- Give each agent the reference path/URL, the target component path(s), and the **specific elements** it owns, so two agents don't both rewrite the same shared file. If areas must touch a shared file (a global theme/token file, one CSS module), **serialise those edits** in a final pass rather than letting agents race — parallel edits to one file collide and only one survives.
- Keep concurrent waves small (≈5 at a time) and batch the rest; large fan-outs can trip provider throttling.
- The orchestrator merges every agent's before/after numbers into one report.

Use `TaskCreate`/`TaskUpdate` to track areas if the surface is large.

---

## Phase 0 — Structural audit (before ANY CSS measurement)

CSS alignment is step 2. **Interaction architecture is step 1.** Do all of 0 before measuring anything.

### Step -1 — Read the reference's behaviour first
If the reference is HTML with `<script>` blocks, **read the JavaScript end-to-end before any CSS.** If it's a served prototype, click through every control and read the DOM it produces. Build a complete behavioural map:
- what each button/trigger dispatches (modal vs drawer vs inline toggle vs navigation);
- the data model (what entities exist, their relationships, their state shape);
- state transitions (what changes on click / drag / toggle);
- the call graph from each event handler to its final DOM mutation.

A pixel-perfect button that opens the wrong container type is worse than a slightly-off button that does the right thing.

### 0a — Interaction architecture audit
For every interactive surface, produce this table, then verify the target matches it:

| Trigger | Opens | Container type | Dismiss | z-context |
|---------|-------|----------------|---------|-----------|
| Theme button | Right drawer panel | Side panel, no scrim | Close X / select another | Below modals |
| History button | Modal | Scrim + centered card | X / click scrim / Esc | Above drawer |

Container types: **modal** (fixed scrim overlay), **drawer** (side panel, no scrim), **popover** (anchored to trigger), **inline-expand** (disclosure in page flow), **page-navigate**, **nothing**. A History panel rendered as a drawer when the reference puts it in a modal is a **structural mismatch CSS cannot fix** — flag and fix it before any property extraction.

### 0b — Element + state + variant enumeration
Before measuring, list for **each** named element:
- **Pseudo-elements** it has: `::placeholder` (any input/textarea), `::before`/`::after` (dots, rings, checkmarks, dividers), `::selection`, `::-webkit-scrollbar`.
- **Interaction states** with distinct styling: `:hover`, `:focus`, `:focus-within`, `:active`, `:disabled`.
- **Data/content variants**: urgent vs normal row, each tag colour, authored vs default icon, active vs inactive tab.

Each of these is a separate thing to extract and diff — not just the element's resting base state.

### 0c — Container ancestry check
For each named element, record **where in the DOM hierarchy it sits**: inside a `position:fixed` scrim (modal)? inside a `position:absolute/fixed` side panel (drawer)? inline in page flow (embedded)? in a portal rendering outside the component tree? A mismatch here means the element will never match regardless of its own styles — fix these first; they block everything else.

### 0d — Component containment audit
For each composite (fields with actions, cards with buttons, rows with controls), record which children sit **inside vs outside** the element's visible boundary (border/background). A Copy button outside a field's border vs inside it is a structural difference — invisible in a screenshot, wrong in the DOM. Extract parent/child relationships, not just sibling positions.

### 0e — Class / selector inventory
Before any browser measurement, grep the reference for:
- every CSS class used in markup (from `class="…"` **and** from JS that builds `innerHTML` with class names);
- every selector defined in `<style>` blocks / linked CSS.

Produce a checklist: one row per unique class prefix (e.g. `addw-*`, `pe-*`, `pub-*`), listing its selectors. After implementation, verify **every** selector on the checklist has a corresponding rule in your output. A selector in the reference but not in your CSS is a guaranteed miss — usually an entire modal interior or popover that was skipped. This catches what browser extraction *cannot*: classes that only exist on content not yet rendered at page load.

> **Render gated elements BEFORE measuring, not after.** Immediately after 0e, open every modal / dropdown / expanded state (click every trigger from the 0a table) and leave them open or screenshot them, so Phase 1 extracts their interiors in the same pass. If the reference's JS fails to render a modal in a headless browser, fall back to reading its CSS rules from the `<style>` block / stylesheet directly and translate them — never skip them silently.

---

## Phase 1 — Render & extract from the REFERENCE

Render the reference and extract `getComputedStyle` for **every element you named**, plus the pseudo-elements and states from 0b.

**Base element:** font-size, font-weight, line-height, color (rgb), letter-spacing, padding T/R/B/L, margin, gap, border (width+style+color, per side), border-radius, background-color, background-image (gradients), box-shadow.

**Pseudo-elements:** `getComputedStyle(el, '::placeholder')` — **color is the property most often wrong** (the element's own `color` is the *typed-text* colour, a different property; a textarea/input is not verified until its `::placeholder` colour is extracted). Also `::before`/`::after` (content, background, color, size) and `::selection`.

**States:** re-extract under `:hover` / `:focus-within` / `:active` wherever 0b flagged them — force them via the DOM (add the class, focus the node, or drive a real hover).

**Numeric gotchas to expect:**
- a `0.5px` border computes to `1px` at DPR 1;
- an `em` letter-spacing computes to px **at the element that declares it** and inherits as that fixed px — a child re-declaring the same `em` at a different font-size yields a different px; match the inherited px, not the em;
- a `0px`-width border still reports a style+colour (`0px solid …`) that is invisible — ignore style/colour when width is 0.

### Rendering & browser tooling

You need a real browser to read computed styles. Three options — pick what's available; all can do `getComputedStyle` and screenshots:

- **`agent-browser`** — the preferred CLI in this repo. It drives the SPA fine on **`http://localhost/`** (NOT `diolog.ai` — HSTS blocks it). Set a **viewport ≥ 1680px** so multi-column layouts don't collapse. **Wrap each `eval` in an IIFE** (evals share one global scope). Results come back **double-JSON-encoded** — decode twice.
- **`playwright-cli`** — equally good for `getComputedStyle`, screenshots, DOM/console/network inspection; use when you want Playwright's selector ergonomics.
- **Chrome MCP tools** (`mcp__claude-in-chrome__*`) — load them first via `ToolSearch` (`select:mcp__claude-in-chrome__navigate`, `…javascript_tool`, etc.). Good when a real logged-in Chrome profile is already where you need it.

**Serving a static mockup:** open the HTML directly; if `file://` blocks its scripts or fonts, serve the folder over a local HTTP port (e.g. `python3 -m http.server`) and open `http://localhost:<port>/<file>.html`.

**Rendering a React/component side** (target, or a reference that is itself a component): run its dev server and open the page. In this repo, protected routes redirect to `/login`; click **"Log in as Luke (dev)"** to establish a session, then select the company, then navigate to the target page before extracting. (Full browser command reference: `.claude/skills/playwright-cli/SKILL.md` and the `agent-browser` skill.)

---

## Phase 2 — Render & extract from the TARGET

Render the target the same way and extract the **same** base + pseudo-element + state properties for the corresponding elements.

- **Extract the resolved value actually in play, not the token/variant name you intended.** Component libraries ship default variants whose styles override the `baseStyle` you think applies (e.g. a Chakra `Card` defaults to `elevated`; a Chakra `Button` injects its own letter-spacing/line-height; a CVA component's default variant; a styled-component's inherited theme). Read what the browser resolved, not the theme file.
- **Match by variant/state, never by DOM position.** If live data makes the target's "row 2" urgent while the reference's "row 2" is normal, you are comparing two different things — pair the target's urgent row against the reference's urgent row.

---

## Phase 2b — Content verification (MANDATORY before any style diff)

CSS alignment means nothing if the element is empty. Before diffing styles, verify that **every button, link, badge, and labelled element** actually renders its content in the DOM — not just in source code.

For each interactive element (buttons, links, menu items) and every element carrying visible text (headings, labels, badges, status pills):

1. **Extract `textContent` and `children.length`** from the live DOM:
   ```js
   // For every button/link in the overlay, card, modal:
   buttons.forEach(b => console.log({
     text: b.textContent,
     childCount: b.children.length,
     innerHTML: b.innerHTML.substring(0, 200)
   }));
   ```

2. **Compare against the reference's rendered content** (not its source):

   | Element | Reference textContent | Target textContent | Match? |
   |---------|----------------------|-------------------|--------|
   | Primary overlay btn | "Open in editor" | "" | ✗ FAIL |
   | Ghost overlay btn | "Present" | "" | ✗ FAIL |

3. **An element with `textContent: ""` that should have text is a CRITICAL FAIL** — it means the text exists in source but isn't reaching the DOM. Common causes:
   - Component libraries (Chakra HStack/Stack, MUI Stack, Radix Slot) that silently drop bare text-node children — only React elements survive as children. **Fix:** wrap bare text in `<Text as="span">`, `<span>`, or the framework's text primitive.
   - `overflow: hidden` + zero computed height collapsing the text
   - `color: transparent` or `opacity: 0` without a hover/state trigger to reveal it
   - `display: none` or `visibility: hidden` inherited from a parent
   - Text rendered inside an SVG `<text>` element clipped by viewBox
   - A conditional render (`{condition && <Text>...</Text>}`) where the condition is false

4. **Icon-only elements must also be verified.** An `<Icon as={Pencil}>` that renders an empty `<svg>` (wrong import, tree-shaking stripped it, or the icon name doesn't exist in the library) looks like a blank square. Check `el.querySelector('svg path')` or `el.querySelector('svg line')` exists — an SVG with zero `<path>` children is a broken icon.

5. **Count children, not just text.** A button that should show `[icon] + [text]` but only shows `[icon]` (childCount: 1 instead of 2) has a content bug even if its styles match perfectly. The reference's `innerHTML` structure is the spec for what must be in the DOM.

This check runs BEFORE any style diffing — there is no point measuring the `font-size` of text that does not exist in the DOM.

---

## Phase 3 — Diff table & fix

Produce a diff table — **one row per property, per element, per pseudo-element/state**:

| Element | Property | Reference value | Target value | Match? |
|---------|----------|-----------------|--------------|--------|

### Diff discipline (mandatory)
- **Print full, untruncated values.** Never slice or summarise box-shadow, background-image, or border before comparing.
- A ✓ is allowed **only** on a row that shows **both** full values. Any property you don't print is *unverified*, not passing.
- **Match exact hex/px.** Reference `#9CA0AC` placeholder vs rendered `#5E6A82` is a **miss**, even if the element's own `color` matched.
- **Required rows for every element:** `box-shadow`, `background-image` (gradients), `border` (the long values that look "close enough"). For every input/textarea: the `::placeholder` colour. For every interactive surface: the `:hover`/`:focus` state. These are the properties most often silently wrong because the base read looks clean.
- **Required rows for every interactive trigger:** container-type and dismiss-mechanism. A ✓ is valid only if the target renders in the **same container type** as the reference (modal=modal, drawer=drawer). "Styles match but it's a drawer instead of a modal" is a FAIL.

### 7b — Spacing accumulation check
For every section-heading + content group, measure the **total** gap between the heading's bottom edge and the first content element's top edge (not just the heading's `margin-bottom`). Multiple layers accumulate (heading margin + wrapper padding + child margin). Use `getBoundingClientRect().top` differences between adjacent elements rather than trusting that matching individual margins ⇒ matching total spacing. If the rendered total is larger, trace which specific layer contributes the excess.

### 7c — Sibling adjacency check
For every container with more than two direct children (field groups, card rows, form sections), measure the gap between **each adjacent pair** (bottom of N to top of N+1 via `getBoundingClientRect()`) — not just first-to-last:

| Parent | Child N | Child N+1 | Gap (px) | Reference gap | Match? |
|--------|---------|-----------|----------|---------------|--------|

A container whose first gap is 16px but second is 0px is a bug even if both fields individually "match" — the defect is the *relationship*, not the element (commonly a grid with `mb:0` children followed by a standalone field with no `mt`). Any gap < 4px between visually distinct, non-flush elements is suspect — flag and cross-check.

### Fixing
Fix **every** mismatch. You may change shared theme tokens/variables when the reference's value differs from a token (prefer fixing the token if it's reused; otherwise a literal). Re-render and re-diff after each change.

---

## Phase 4 — Verification (don't declare done on a spot check)

1. **Re-render and re-diff after every change.** Before declaring done, dump the **complete** computed-style object (base + pseudo-elements + states) for each named element from both sides, adjacent, as a final full re-diff — not a spot check. Report before/after numbers.
2. **Content parity per modal / drawer / popover (MANDATORY).** Every time you wire up or modify an interactive container, screenshot it in the reference **and** in the target and compare the **inner content** — not "does it open?":
   - same number of sections/groups?
   - same control types? (accordion vs flat list, segmented control vs dropdown, swatch grid vs text input, slider vs number field, toggle vs checkbox)
   - same labels and grouping? same footer actions?

   A modal that opens correctly but renders a flat input list where the reference renders an accordion with segmented controls and sliders is a **FAIL** — container right, interior wrong. Place both screenshots adjacent and confirm before declaring that surface done. "It opens" ≠ "it matches".
3. **Trace JS `innerHTML` to component spec.** When the reference builds DOM via `innerHTML` strings (`modal()`, `setPanel()`, `renderCfg()`), that generated HTML **is the spec** for your component's output. Read the string, identify every element it creates (every div, input, select, button, label, slider, toggle, accordion section), and verify your component emits the same elements in the same hierarchy. `acc("Colours",…,colorsBody(),true) + acc("Typography",…,typeBody(),false)` means two accordions with those titles, the first open by default, and `colorsBody()`'s return is the spec for the first accordion's interior. Translate it; don't substitute a simpler version.

---

## Structural traps (known gotchas)

- A divider's `border-top` on a full-width row spans edge-to-edge even when the row has padding — the reference's divider may sit *inside* the card's padding. Confirm where the line actually starts.
- A Chakra `Button`'s `minH` overrides `h`; `variant="lg"` fonts (18px) vs a reference's 13.5px; icon-only buttons inherit a font-size/line-height that renders nothing — ignore those phantom values.
- **Component default variants silently override the token/baseStyle you intended** — check the resolved value in the browser, not the theme file. (Applies to Chakra variants, CVA defaults, MUI defaults, styled-component theme inheritance.)
- Padding/insets delivered on a *different* element net to the same visual (reference pads the card; target pads its children) — confirm the **total**, don't flag the element.
- Elements in a portal / `position:fixed` layer (snackbars, modals, toasts) sit outside the page's text register and inherit framework-default font-size/line-height/letter-spacing instead of the reference's body register — re-establish the register explicitly on the portal root.
- **The reference itself can be buggy.** If a reference computed value looks like an unstyled UA default (e.g. an `<h4>` at 13px/700 with 1.33em margins) that contradicts a nearby authored rule, check whether that rule's selector actually matches the element — orphaned selectors (`.snack h4` when the element is `.snackbar`) are common. If the rule is orphaned, implement the evident authored *intent* and flag it — don't faithfully reproduce the accident.

---

## Styling-library notes (target may be any of these)

The method is identical regardless of how the target authors styles — you always diff **resolved computed values**. Where each system hides surprises:
- **Plain CSS / CSS Modules** — specificity and cascade order; a later rule or a more specific selector may win over the one you edited.
- **Tailwind** — utility ordering and `@apply`; arbitrary values vs scale tokens; check the *generated* class, not the intended one.
- **Chakra / theme-token systems** — component default variants override `baseStyle`; `minH`/`h`; injected letter-spacing/line-height on Button.
- **CVA** — the default `variants`/`compoundVariants` resolve before your prop; read the emitted className set.
- **styled-components / Emotion** — theme inheritance and prop-driven interpolation; the resolved style depends on the live `theme` and props.

Read declared CSS only to find the lever; verify with the computed value.

---

## Done criteria

You are done only when, for every named element and every modal/drawer/popover in scope:
- the interaction architecture matches the 0a table (container type + dismiss), and
- the final full re-diff (base + pseudo-elements + states) shows every required row printed with both values and ✓, and
- content-parity screenshots for each interactive container match, and
- the 0e selector checklist is fully accounted for, and
- before/after numbers are reported.

---

## Example invocations

```
align inbox with ~/Downloads/Inbox.html — breakdown: chat list sidebar, chat header, modals, junior-analyst panel (collapsed + expanded), prompt container, bottom toolbar
```
```
make the settings modal match docs/ui-mockups/Settings.html
```
```
the documents page spacing and shadows are off vs the prototype at http://localhost:6007 — diff and fix it
```
```
align our React checkout against this other implementation [points at a component dir] — serve both and match the computed styles
```
