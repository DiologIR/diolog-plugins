# Pre-Ship Checklists

Condensed verification passes. Run the matching list before calling any build/mock done, and as the closing sweep of any review. These are floors, not reviews — a pass here doesn't replace the lens pass in review-playbook.md.

## Any screen (web or mobile)

- [ ] Trunk test: a cold visitor can tell what this is, where they are, and what to do next
- [ ] Exactly one primary action; secondaries visually subordinate
- [ ] All six screen states exist: empty, loading, ideal, partial, error, done
- [ ] All interactive states designed: hover (web), focus-visible, active, disabled (with reason), loading
- [ ] Errors: what + how-to-fix, adjacent, not color-only
- [ ] Nothing requires remembering an earlier step (recognition over recall)
- [ ] Real content tested: longest name, 0 items, 100 items, missing image
- [ ] Reversible actions have undo, not confirmation; destructive actions have proportional friction with named consequences
- [ ] Copy passes ux-writing rules: outcome-verb buttons, no jargon, front-loaded meaning, correct typography
- [ ] No dead ends anywhere the user can land: not-found/error routes are designed (a 404 that names the problem and offers search/home/key paths — the raw system page is a wayfinding failure), and every page offers a way onward
- [ ] Legally required links present and findable (privacy, terms; cookie consent where the jurisdiction demands it) — routinely forgotten in mocks, and a compliance issue, not a preference, in regulated contexts

## Flow

- [ ] Entry, steps, completion, and every exit (back/cancel/abandon/resume) mapped
- [ ] One decision per step; ≤4–7 fields visible per step; progress shown for 3+ steps
- [ ] Back preserves entered data; long flows auto-save
- [ ] Nothing asked twice; nothing asked before it's needed and justified
- [ ] Failure at each step preserves prior work and offers recovery
- [ ] Completion screen: what happened + what happens next (peak–end)

## Form

- [ ] Every removable field removed, defaulted, or inferred
- [ ] Visible labels (not placeholders); single column; related fields grouped tighter than groups
- [ ] Semantic input types + autocomplete/textContentType (right keyboard, autofill, WCAG 3.3.7/3.3.8)
- [ ] Validation on blur; clears on change after first error; submit failure focuses first invalid field; multi-error summary with anchors
- [ ] Defaults pass the 80% test; zero pre-checked consent
- [ ] Submit button disables + shows progress during async (no double-submit)

## Responsive / mobile quick pass

- [ ] No horizontal scroll at 360px; longest heading survives; body ≥16px (mobile web)
- [ ] Touch targets ≥44pt/48dp, ≥8px gaps; primaries in thumb reach; hit areas extended on small glyphs
- [ ] Safe areas respected; scroll content not hidden under fixed bars; `min-h-dvh` not `100vh`
- [ ] No hover-only functionality; gestures have visible alternatives; press feedback <100ms
- [ ] Back preserves scroll/filter/input state; key screens deep-linkable
- [ ] Dynamic Type / 200% font scale without truncation or overlap; dark mode contrast checked separately

## WCAG 2.2 quick pass (A/AA essentials)

Perceivable: text contrast ≥4.5:1 (large ≥3:1); UI components/focus indicators ≥3:1 non-text contrast; color never the only signal; informative images have alt (decorative `alt=""`); visual structure matches semantic structure (real headings, lists, tables); reflow to 320px without 2-D scrolling; text resizes 200%.
Operable: everything keyboard-operable, no traps; visible focus, not fully obscured by sticky UI (2.4.11); logical focus order matching visual order; skip link; descriptive titles/headings/links (no bare "learn more"); targets ≥24px minimum (2.5.8 — aim 44); dragging has a non-drag alternative (2.5.7); nothing flashes >3×/s; auto-moving content pausable; `prefers-reduced-motion` respected.
Understandable: `lang` set; no context change on focus/input; consistent nav and component identity across pages; errors identified in text with suggestions; labels/instructions present; no re-asking known info (3.3.7); auth without cognitive puzzles, paste allowed (3.3.8); high-stakes submissions reversible/confirmable.
Robust: custom controls have name/role/value; status messages announced via live regions without stealing focus; modals trap focus, restore it on close, background inert.

State honestly what a static/screenshot review cannot verify (screen reader output, keyboard flow, real AT behavior) — list those under "Needs verification", never claim conformance. Mechanical supplement for live pages: `npx @accesslint/cli` scan.

## Severity ladder (shared by all reviews)

- **Blocker** — a user group cannot complete the task
- **High** — likely task failure/drop-off, AA violation, dark pattern, trust breach
- **Medium** — real friction; completable but costly
- **Low** — polish

Calibration: use the full range; severity = user impact, not fix effort; multiple-lens agreement raises confidence, not severity; a report where everything is Medium hasn't decided anything.

## AI feature

- [ ] Scope of what the AI acts on is visible before it runs; autonomy level (suggest/ask/act) is explicit
- [ ] Preview-before-commit on anything that modifies user content; AI output marked until accepted; bulk runs sampled first (2–3 records verified before the rest)
- [ ] Friction matches blast radius: verification only for real loss (money/work/reputation/security); undo for the rest; "don't ask again" after first confirmed run
- [ ] Stop always available and in the same place; long tasks pause/resume, never force restart
- [ ] Empty state scaffolds the first prompt (3–6 contextual suggestions/templates; never a bare box on an empty state)
- [ ] AI involvement disclosed with verbs ("Summarized with AI"); AI content visually distinct; a human is reachable where it matters
- [ ] Claims cite sources with working references; missing sources declared, never filled
- [ ] Retrieved/connected content treated as untrusted: sources-in-play visible, tool actions gated on previews, per-source kill switch
- [ ] Memory visible, editable, deletable; save events announced; training/retention consents separate and opt-in
- [ ] Cost shown before long/bulk/chained runs
- [ ] Cancel/downgrade/opt-out paths no harder than their opposites (click-symmetry ≤ ~1×; >2× is a hard fail)

## Email

Use the pre-send checklist in `email-ux.md` — it's the complete list (subject/preheader, one CTA, images-off, dark mode, plain-text part, compliance footer, <100KB, register check).
