# Polish Pass: End-of-Design Quality Gate

Run a comprehensive quality check before a design is shown to stakeholders or shipped. **A polished design and an unpolished design are the same idea executed at different levels of care — and the gap is what people actually see.**

This skill is the umbrella for the five narrower review procedures. Use it as the final gate before delivery.

## Phase 1: Confirm scope

Determine what to polish: (1) the HTML file the user just finished or asked about; (2) the current main deliverable in the project; (3) if unclear, ask. Read the file and note the medium (slide / page / mobile / dashboard / animation), the deployment context (internal review / customer-facing / marketing), and any user-stated constraints or scope boundaries.

If the design is clearly mid-flight (broken layout, missing sections, placeholder content the user is still iterating on), say so and ask whether they really want a polish pass now or after the structure is settled.

## Phase 2: Launch five review agents in parallel

Use the **`Agent`** tool to launch all five agents concurrently in a single message. Each agent runs the equivalent of one of the standalone review procedures, scoped to this file.

Instruct every agent explicitly: **report every issue found, including uncertain and low-severity ones, with a confidence and severity estimate for each.** Coverage is the agent's job; filtering and prioritization happen in Phase 3. An agent that self-censors "minor" findings silently lowers recall.

**Jury rules** — these keep the panel honest instead of theatrical:

- **Strict non-overlapping scopes.** Each reviewer scores only its own axis; a reviewer commenting outside its lane duplicates another's work and inflates agreement.
- **Every reviewer declares at least one must-fix per non-final round.** A reviewer with zero must-fixes on round 1 isn't reviewing, it's rubber-stamping.
- **Unanimity is a smell.** If all reviewers agree on every axis, the critique was too shallow — require at least two reviewers to genuinely diverge somewhere, and interrogate the disagreement; that's where the real judgment call lives.

### Agent 1: Accessibility audit

Run the full `accessibility-audit.md` review: contrast and color (WCAG AA minimums, color-only signaling, problematic combinations, pure white/black flags); semantic HTML and structure (headings, button vs div, labels, alt text, ARIA discipline); keyboard navigation and focus (reachability, tab order, visible focus, skip links); motion, forms, and miscellany (`prefers-reduced-motion`, flash limits, error specificity, hit-target size). Report findings as a categorized list.

### Agent 2: AI slop check + interface copy

Run the full `ai-slop-check.md` review: aggressive gradients; emoji-as-decoration; rounded corners with left-border accent (used as default); hand-drawn SVG illustrations; overused fonts as defaults (Inter, Roboto, Arial, Fraunces, bare system stacks); the three AI-default looks as silent defaults (warm-editorial, dark + acid accent, broadsheet); pure white and pure black; random invented colors; random spacing values. Then review every visible string against SKILL.md ch.12 (interface copy): system-vocabulary leaking into labels, controls that don't name their action, an action's name mutating across its flow (button "Publish" → toast "Saved"), vague or apologetic errors, empty states with no next action, Title Case/sentence-case inconsistency. Report findings.

### Agent 3: Hierarchy and rhythm review

Run the full `hierarchy-rhythm-review.md`: hierarchy (primary/secondary/tertiary differentiation, size, color, weight, position, density, 5-second test); rhythm (spacing scale discipline, type scale discipline, repetition, strategic variation, color palette discipline, section structure, alignment). Report findings.

### Agent 4: Interaction states pass

Run the full `interaction-states-pass.md`: inventory of interactive elements; for each — default, hover, active, disabled, focus, loading; transitions (0.15–0.3s for state changes, longer for entry/exit, `prefers-reduced-motion` respected); feedback for actions (success/error confirmation, state visibility). Report findings.

### Agent 5: Layout integrity and responsive

Run the full `visual-verification.md` Phase 1 in a real browser (serve over HTTP): the viewport matrix (375 / 768 / 1280 / 1920 plus in-between widths), overflow (including the programmatic probe), overlap, text clipping, alignment drift, load stability (CLS/FOUT), z-order, media aspect ratios — and collect console errors on every load. Follow the Phase 2 screenshot playbook for evidence. Report findings with viewport + severity.

## Phase 3: Aggregate, deduplicate, prioritize

Wait for all five agents. Aggregate findings into one list.

**Deduplicate.** If two agents flagged the same issue (e.g. "focus ring removed" appears in both accessibility and interaction-states), merge into one entry.

**Prioritize.** Group findings into:

1. **Blockers** — accessibility failures (contrast under WCAG, missing keyboard support, removed focus rings, missing labels) and layout breakage (overflow, overlap, shattered mobile layout). These break the design for real users; fix all of them.
2. **Quality issues** — AI slop tropes, broken hierarchy, missing interaction states. These cheapen the design; fix all of them.
3. **Polish recommendations** — subtler improvements (suggested color tone shift, spacing-scale tightening). Apply when in scope; flag when out of scope.

## Phase 4: Fix

Fix every blocker and every quality issue directly. Apply polish recommendations when they don't conflict with the user's stated direction. For ambiguous fixes (e.g. "the design uses Inter but the user hasn't given a brand font preference"), pick a defensible default and note the choice in the summary so the user can override. For findings that are clearly false positives or outside scope (e.g. "the third-party embed has low contrast"), note them and skip.

**Engineering micro-details — sweep these while fixing.** They're cheap, and their absence is what separates "designed" from "generated":

- `…` not `...`; curly quotes `"` `"` not straight; loading labels end with `…` ("Saving…")
- Non-breaking spaces inside units and shortcuts: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- `font-variant-numeric: tabular-nums` on number columns and comparisons (digits align)
- `text-wrap: balance` on headings (kills widows)
- `min-width: 0` on flex children that must truncate (flex refuses to shrink text otherwise)
- URL reflects state — filters, tabs, pagination in query params, so refresh and share work
- Destructive actions get a confirmation or an undo window — never immediate
- `overscroll-behavior: contain` in modals/drawers (stops background scroll bleed)
- `touch-action: manipulation` on tappables (kills the double-tap zoom delay)
- `env(safe-area-inset-*)` on full-bleed mobile layouts
- `color-scheme` on `<html>` and a matching `<meta name="theme-color">` for dark themes
- `Intl.DateTimeFormat` / `Intl.NumberFormat`, never hardcoded date/number formats
- `translate="no"` on brand names and code tokens (prevents garbled auto-translation)
- Explicit `width`/`height` on every `<img>` (prevents layout shift)
- CSS specificity collisions — a generic `.section` rule silently overriding component padding/margins is a classic generated-CSS failure; keep selector depth consistent
- z-index values from a tokenized scale (`--z-dropdown: 100 … --z-toast: 500`), never ad-hoc `z-index: 9999`
- Virtualize lists over ~50 items
- `spellcheck="false"` on emails, codes, usernames
- Warn before navigation with unsaved changes (`beforeunload` or router guard)

## Phase 5: Re-verify

After fixes, do a quick re-check on the high-risk areas: Did the contrast fixes maintain the visual style, or wash out a brand color? Did the focus-ring additions overlap with neighboring content? Did the hierarchy adjustments make the primary CTA actually feel primary? If anything looks off, fix it. If you're unsure, flag it for the user's review.

**The last look is subtractive.** Before shipping, apply Chanel's rule: look once more and remove one accessory — the one element, effect, or decoration the design doesn't need. Review rounds accrete; this step is the counterweight. If you genuinely can't find anything to remove, ship.

**Convergence.** Treat fix-then-re-review as rounds, up to 3. Ship when the re-review scores clear your quality bar **and** zero must-fixes remain open — both conditions, not either. Each round's findings report should be shorter than the last; a round that produces more text than the previous one is churning, not converging. If round 3 still doesn't clear the bar, ship the best round and say so honestly ("ships with two open polish items: …") rather than iterating forever or quietly relabeling the bar.

## Phase 6: Final summary

Report concisely:

- **Verdict** — "Ready to ship" / "Ready after user reviews flagged decisions" / "Needs more iteration before polish makes sense"
- **Blockers fixed** — count by category (accessibility / AI slop / hierarchy / interaction)
- **Polish applied** — count by category
- **Open decisions** — judgment calls the user should sign off on (font choice, color tone shift, hierarchy emphasis level)
- **Out of scope** — anything you noticed but didn't touch (copy edits, content additions, new features)

Keep the summary short. The user can ask for detail if they want it. **Brief summaries — caveats and next steps only.**
