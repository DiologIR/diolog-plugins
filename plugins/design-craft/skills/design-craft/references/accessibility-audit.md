# Accessibility Audit: WCAG and Inclusive Design Review

Review the current design for accessibility issues across contrast, semantic structure, keyboard navigation, motion, and forms. Fix any issues found. **Good accessibility is good design — it benefits everyone.**

## Phase 1: Identify the surface to audit

Determine what to review, in order of preference:

1. The HTML file the user just edited or asked about.
2. The most recently modified design file in the project.
3. If unclear, ask the user which file to audit.

Read the file end-to-end. Note: the framework or component library in use, the accessibility level expected (WCAG AA is the standard default), and any user-stated constraints.

## Phase 2: Launch four review agents in parallel

Use the **`Agent`** tool to launch all four agents concurrently in a single message. Pass each agent the full file contents so it has complete context.

Instruct every agent explicitly: **report every issue found, including borderline and low-severity ones, with a confidence and severity estimate.** Coverage is the agent's job; filtering happens at aggregation (Phase 3).

### Agent 1: Contrast and Color

1. **Verify text contrast.** Normal text (under 18px) needs 4.5:1; large text (18px+ bold or 24px+) needs 3:1; UI components (buttons, icons, focus rings) need 3:1. Thresholds are **inclusive with no rounding**: exactly 4.5:1 passes, 4.499:1 fails — rounding up is not a permitted mechanism. Compute the actual ratio for any color pair you can resolve (resolved hex values, tokens followed back to their source). Flag every failing pair with the ratio and the required minimum. **Sweep the "muted" roles specifically** — placeholder text, secondary/tertiary text, captions: mid-gray tokens in the `#6b7380` neighborhood fail 4.5:1 on light backgrounds most of the time, and muted-gray-on-tinted-near-white is the single most common generated-design contrast failure.
2. **Check for color-only signaling.** Flag any state communicated by color alone — green/red without an icon, blue link with no underline, chart with no legend or text labels.
3. **Check for difficult color combinations.** Red+green (most common colorblindness), blue+yellow at similar lightness, light gray on white, colored text on colored backgrounds with similar brightness.
4. **Check whites and blacks.** Flag pure `#FFFFFF` on `#000000`. Subtly toned (e.g. `#FAFAFA` / `#1A1A1A`) is preferred — though this is style, not WCAG, so flag as a recommendation.

### Agent 2: Semantic HTML and Structure

1. **Heading hierarchy.** Exactly one `<h1>`. No skipped levels (don't go from `<h2>` to `<h4>`). Headings describe content, not styled visual size.
2. **Right element for the role.** `<button>` not `<div onclick>`. `<a href>` not `<div>` styled as a link. `<label for="id">` linked to `<input id="id">`. `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>` for landmarks.
3. **Alt text on every meaningful image.** Decorative images use `alt=""` so screen readers skip them. Meaningful images describe what they convey, not what they are (`alt="Wireless headphones, side view"` not `alt="product"`).
4. **Form input labels.** Every input has an associated `<label>` (or `aria-label` if visually labelless). Placeholder text alone is not a label — it disappears when the user types.
5. **Avoid ARIA when semantic HTML works.** Flag `role="button"` on a `<div>` if it could just be a `<button>`. ARIA is a patch, not a default — pages using ARIA average *more* accessibility errors than pages without it, because deployment outpaces correctness. The decision order is strict: (1) native HTML element with the right semantics; (2) native element under custom visuals if restyling is the issue; (3) the ARIA APG pattern followed verbatim if no native element fits; (4) the closest APG pattern plus a documented deviation, as a last resort. **Never invent ARIA** — flag any role/attribute combination that doesn't appear in the APG.

### Agent 3: Keyboard Navigation and Focus

1. **Keyboard reachable.** Everything clickable must also be reachable with Tab. Hover-only menus, modals that don't open with keyboard, dropdowns that need mouse hover all fail.
2. **Logical tab order.** The Tab sequence should follow reading order. Flag explicit `tabindex` values greater than 0 (they distort the natural order).
3. **Keyboard interaction patterns.** Modals close on Escape. Dropdowns open with Enter/Space and navigate with arrows. Forms submit on Enter from a field. Note: a modal that traps focus until dismissed is **correct behavior**, not a keyboard-trap violation — don't flag it; the violation would be a trap with no Escape/close path.
4. **Visible focus rings.** Flag any `outline: none` without a replacement — removing the focus ring is a **triple violation** (1.4.11 Non-text Contrast, 2.4.7 Focus Visible, 2.4.13 Focus Appearance), not a style choice. The replacement should be visible and meet 3:1 contrast against the adjacent background. `:focus-visible` is preferred over `:focus`.
5. **Skip links.** For pages with significant repeated navigation, recommend a "Skip to main content" link as the first focusable element.
6. **Client-side route changes move focus.** In an SPA, a route change without a page load leaves focus (and the screen reader) stranded on the old page — move focus to the new main content region or its heading on navigation.

### Agent 4: Motion, Forms, and Misc

1. **`prefers-reduced-motion` respected.** Animations and transitions over a couple hundred milliseconds should have a `@media (prefers-reduced-motion: reduce)` block that shortens or removes them.
2. **No flashing content.** Anything flashing more than 3 times per second can trigger photosensitive epilepsy. Auto-playing videos, strobe effects, rapid loops — flag and require pause control.
3. **Form errors.** Every error message is specific ("Email address is invalid" not "Invalid"), tied to its field (visually adjacent and via `aria-describedby`), and announced to screen readers.
4. **Required fields.** Marked with text and/or icon plus the `required` attribute, not color alone.
5. **Input types and autocomplete.** `<input type="email">` for email, `type="tel"` for phone, `autocomplete` attributes for autofill. These improve mobile keyboard UX and accessibility.
6. **Hit-target size.** Recommend at least 44×44 CSS px for buttons, links, and tappable areas on touch surfaces — but cite it correctly: **24×24 CSS px is the AA floor (WCAG 2.5.8 Target Size Minimum); 44×44 is the AAA/craft bar (2.5.5)**. Flag anything under 24×24 as a failure and anything under 44×44 as a craft recommendation. Note the Spacing exception: an undersized target passes 2.5.8 if a 24px exclusion circle around it doesn't intersect its neighbors' — this is what dense icon toolbars legitimately rely on; don't use it to excuse undersized primary actions.
7. **Zoom, spacing, and pointer tolerance** — the commonly-skipped AA criteria. Content reflows at 200% zoom (and at 320px-wide viewport) without horizontal scrolling or clipped text (1.4.4 / 1.4.10); layouts survive user-forced text-spacing overrides — line-height 1.5×, paragraph 2×, letter 0.12em, word 0.16em — without clipping (1.4.12), which fixed-height text containers fail; content that appears on hover/focus (tooltips, previews) is dismissible without moving the pointer, hoverable itself, and persistent until dismissed (1.4.13); no irreversible action fires on pointer-*down* — commit on release so the user can slide off to cancel (2.5.2); and a control's accessible name contains its visible label text, or voice-control users can't invoke it (2.5.3).
8. **RTL and bidi readiness** (when the design may render right-to-left or mixes scripts). Use logical properties (`margin-inline-start`, `text-align: start`) instead of hardcoded `left`/`right`; pair `dir` with `lang` (`<html dir="rtl" lang="ar">` — `dir` alone misses font-stack and locale behavior); wrap intrinsically-LTR values like phone numbers and IBANs in `<bdi dir="ltr">` inside RTL paragraphs (bare `<bdi>` misdetects weak-character runs); **never letter-space Arabic** (it breaks cursive joining) and no italics on Arabic/Hebrew (neither script has an italic tradition); mirror directional arrows and non-media progress fills, but never clocks, media controls, or chart axes — those represent physical or mathematical direction, not reading direction.

## Phase 3: Aggregate and fix

Wait for all four agents to complete. Aggregate their findings into a single list, deduplicating where multiple agents flagged the same issue.

Fix each issue directly. For ambiguous cases (e.g. "this contrast is 4.4:1, very close to passing"), apply the fix anyway — accessibility is the floor, not the ceiling.

If a finding is a clear false positive or out-of-scope (e.g. the agent flagged a third-party embed you can't modify), note it and skip it. Don't argue with the finding — just move on.

When done, summarize:
- Issues found by category (contrast / semantic / keyboard / motion-forms)
- Issues fixed
- Any issues left for the user (third-party content, ambiguous cases, design decisions outside accessibility)
