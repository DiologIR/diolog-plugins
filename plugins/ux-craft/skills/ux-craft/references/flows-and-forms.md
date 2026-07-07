# Flows, Forms, States & Navigation

The working patterns for structuring web/desktop experiences. Mobile-specific grammar lives in `mobile-ux.md`; the words live in `ux-writing.md`.

## Flow architecture

A flow is a promise: "do these steps and you'll get X." Design the promise first.

1. **Name the goal and the completion signal.** What does the user have when they're done, and how do they *know*? Flows that end with a silent redirect fail the peak–end rule at the moment that matters most — the end is what users remember.
2. **One decision per step** (GDS "one thing per page", validated across millions of government transactions). A "thing" is a conceptual unit, not a field — first+last name is one thing; shipping address is one thing. Bend it for expert tools and editing contexts (speed beats guidance there); never bend it for checkout, registration, or anything on mobile where drop-off costs money.
3. **Show position and size**: step indicator for 3+ steps ("Step 2 of 4 — Payment"), with meaningful step names. Progress accelerates completion near the goal (goal-gradient) — but only earned progress; fake head starts fail the ethics gate.
4. **Map every exit before building the happy path**: Back (preserves entered data — losing form data on Back is a High finding), Cancel (with a named consequence if data is lost), Abandon (auto-save drafts on anything long), and Resume (return the user to where they left off, with context re-displayed — recognition over recall).
5. **Eliminate excise** (Cooper): every step that serves the system rather than the user's goal — forced account creation before value, re-entering known data, confirmation of non-destructive actions — is excise. Cut it or absorb it (Tesler: complexity someone must pay; make the system pay).
6. **Guest paths and progressive commitment**: ask for information at the moment it's needed and justified ("we need your email to send the receipt"), not upfront. Each early field costs conversions and must earn its place.

### Flow-level review questions
- Could any step be removed, merged, defaulted, or deferred?
- Is anything asked twice? (WCAG 2.2 redundant-entry is now a formal criterion.)
- What happens on failure at each step — is the user's prior work preserved?
- Does the final screen say what happened *and what happens next*?

### Interrupted journeys (save, resume, re-enter)

Users don't finish flows in one sitting — they get interrupted, switch devices, come back tomorrow. Design the interruption as a first-class path: auto-save progress (not "did you remember to save?"); define and state the expiration policy for drafts and abandoned carts; and design **re-entry** deliberately — a returning user needs recognition of prior progress, a summary of previous choices re-displayed (never quizzed from memory), one tap to resume, and the option to start over. Cross-device: deep links and magic links restore the exact state, and re-engagement messages go to the device the user is likely on *now*, not the one they abandoned.

### First-run and onboarding

The first encounter has the least context, the least investment, and the lowest friction tolerance. Value first: show what the product does (populated sample data, a preview of the outcome) before demanding setup — sample data doubles as a mental model of what "full" looks like. Teach by doing with just-in-time guidance at the moment a feature becomes relevant — never a 5-slide tour (universally skipped) or mandatory profile completion before any value. The first task should deliver a real win, and reveal complexity only as the user demonstrates readiness.

## Forms

Forms are where users exchange value with the product; every needless field is friction taxed against the goal.

**Fields**
- The best field is no field: infer (country from locale), default (date = today, quantity = 1), or compute (totals, comparisons) instead of asking.
- Visible label above every field — never placeholder-as-label (disappears on focus, low contrast, breaks autofill and screen readers). Placeholders are for format examples only ("DD/MM/YYYY").
- Single column (Penzo 2006 eye-tracking; Baymard). Group related fields with fieldset/legend; the gap inside a group must be smaller than the gap between groups or grouping collapses.
- Mark required fields; better, cut optional ones. If a form has 20 fields but 6 matter for this user, conditionally show 6.
- Right input type per field (`email`, `tel`, `number`, `date`) — drives mobile keyboards and autofill (`autocomplete` attributes are an accessibility criterion in 2.2).

**Validation timing** — get this wrong and validation becomes harassment:
- Validate **on blur**, not on keystroke (inline validation improves completion only when it waits for the user to finish — Wroblewski 2009).
- After a field first errors, re-validate **on change** so the error clears the moment it's fixed.
- Real-time only when the user is building toward a visible goal: password strength, character count, username availability.
- Cross-field rules ("end date after start date") on submit; on a failed submit, focus the first invalid field and, for multiple errors, show a summary at top with anchor links (WCAG).

**Error messages**: what went wrong + how to fix it, adjacent to the field, `aria-describedby`-linked, never color-only, never blaming. See ux-writing.md for tone.

**Smart defaults ethics**: a default is good if ~80% of users would pick it anyway; it's manipulation if it primarily benefits the business (pre-checked marketing consent, pre-selected premium tier). GDPR makes prechecked consent illegal, not just rude.

## The state machine

Every component and screen exists in more states than the ideal one. Enumerating them before building prevents the most common class of UX bug: the state nobody designed.

**Component states**: default → hover (never load-bearing — no touch equivalent) → focus-visible (distinct from hover; keyboard users live here) → active/pressed (feedback within ~100ms) → disabled (with a reason available — unexplained disabled buttons are a top frustration) → loading (button disables + spinner; the double-submit bug is a state-machine failure).

**Screen states — the full nine**: default (with *normal* data — decide what normal means), **empty**, **loading**, **partial** (some loaded, some pending, one widget failed — the most overlooked state and one of the most common in real use; design the messy middle), **error**, **success**, **offline** (what's cached, what degrades, how the user knows, what happens to actions attempted offline — queued or lost?), **disabled**, **overflow** (10,000 items in a list designed for 50; a 200-character name; 999+ badges). For each state answer three questions: what does the user see, what can they do, how do they recover or progress.

**Stress-test prompts** — run these against every screen before calling it done:
- *Content*: 3-character title? 300? Emoji-only? A name that's "O" or 40 characters? RTL text? A URL pasted into a text field? Completely empty?
- *Volume*: 0, 1, 3, 50, 10,000 items? Every badge at 999+? All sections expanded at once?
- *Time*: API answers in 200ms? 5s? 30s? Never? User leaves mid-flow and returns next month? Session expires mid-step?
- *Network*: drop mid-upload? mid-payment? 2G? Intermittent (10s up, 5s down)?
- *Behavior*: double-click? Browser Back mid-flow? Same flow open in two tabs? Paste instead of type? Shared link to an auth-required state?

**Graduated waiting**: under ~500ms, nothing — it reads as instant; 0.5–3s, spinner or skeleton; 3–10s, determinate progress where possible; 10–30s, add context ("taking longer than usual…"); 30s+, offer alternatives ("we'll email you when it's ready"). Never an indefinite spinner with no information — and **never fake progress**: an honest spinner beats a progress bar that lies, and a fabricated percentage is a sincerity violation users eventually catch.

**Spatial consistency**: no layout shift after load, no auto-rearranging content "for" the user, muscle memory respected (controls stay where they were), meaningful states have URLs (bookmarkable, shareable), and state survives refresh. Undo lives at the *data* layer — soft-delete by default — not just as a UI toast; "Are you sure?" is not a substitute for undo.

- **Empty states are the product's first impression** and most products waste them. Formula: what this area is for (education) + how to create the first item (action) + why it's worth it (motivation). "No data" is a defect. Distinguish first-use empty, cleared-by-user empty, and no-search-results (offer recovery: check spelling, broaden, popular items).
- **Loading**: skeleton screens that match the real layout for content surfaces (>300ms); spinners with context ("Uploading your file…") only for short indeterminate waits; determinate progress + time estimate for long operations. Reserve layout space — content jumping (CLS) is a UX defect, not just a metric.
- **Error**: what happened, is my data safe, what do I do now. Retry buttons for transient failures; never a dead end.
- **Optimistic UI** for low-stakes high-success actions (favorite, reorder, send message) — update immediately, reconcile with the server, and design the rollback ("Couldn't send — tap to retry"), never silently revert. Never optimistic for money, destructive actions, or anything affecting other users.
- **Perceived speed is a design material** (web implementation patterns): stream the page shell fast and let expensive widgets load inside their own boundaries — perceived latency drops without changing a single query; during heavy filtering, keep the input responsive and dim stale results (~0.7 opacity) instead of blocking; preload the next screen on hover/focus intent; never lazy-load above-the-fold or accessibility-critical content; set image dimensions and self-host fonts so nothing jumps after first paint (layout shift *is* a UX defect); load the saved theme synchronously before first paint — a flash of the wrong theme is a polish defect users notice.
- **Symptom catalog for reviews**: an input that loses focus on every keystroke, an animation that restarts, or scroll position that resets mid-interaction usually means a component is being re-created on each render — file it as the user-facing defect it is and route the code fix to code-review. A stray literal "0" rendered in the UI is the `count && …` falsy-render bug.

## Undo & destructive actions

Undo is a safety net that makes every other interaction feel lighter (forgiveness, Lidwell).

- **Don't confirm reversible actions.** Routine "Are you sure?" trains click-through blindness and devalues the confirmations that matter. Provide undo instead: toast with a 5–10s window ("Archived — Undo") for quick actions; history/versions for documents; trash-with-schedule ("empties after 30 days") for deletion.
- **Friction proportional to blast radius** for the genuinely destructive:
  1. Visual distinction (danger styling, spatially separated from safe actions)
  2. Confirmation naming the consequence ("Delete this project and all 47 files in it?") — generic "Are you sure?" carries no information
  3. Type-to-confirm for severe, rare actions (GitHub repo deletion)
  4. Cooling period for the gravest ("Account deletes in 14 days; cancel anytime before")
- Always name what will be lost, show it when possible, and offer the lighter alternative ("Archive instead?").

## Navigation & IA essentials

(Deep IA work — taxonomy design, card sorts, tree tests — belongs to `intent-layer`; this is what you need while building/reviewing.)

- **Wayfinding trio** at every moment: orientation (where am I — highlighted nav item, page title, breadcrumbs at 3+ levels), route decision (labels informative enough to choose without clicking — information scent), closure (the landing page's title matches the link that promised it; a "Privacy Settings" link landing on "Account Management" is a closure failure).
- **Pattern fit**: hierarchical trees for clearly categorical content (≤3–4 levels; a growing "Other" category means the taxonomy failed); hub-and-spoke for independent task areas; flat+search/filter for homogeneous sets; faceted for multi-attribute browsing (design the zero-results combinations); dashboards that link to action, not widget dumps.
- Navigation reflects **user mental models, not the org chart**. Labels use the user's words (card-sort evidence beats stakeholder preference).
- **State preservation**: Back restores scroll position, filters, and input. Breaking Back is breaking the user's most-trusted button.
- Current location always visibly marked; primary nav placement identical on every page.
- **Test labels cheaply**: 5-second test (show the nav; can users predict what's under each label?) and cloze test (show the contents; can they guess the label?). Format labels ("Resources", "Hub", "Library") describe containers, not contents — they force click-and-check. And mine the search logs: high-volume searches for things that should be browsable mean the IA failed; zero-result searches mean the labels don't speak the user's language.
- **Zero results is a design problem, not an edge case**: spelling suggestions, broaden-filter offers, popular items, and a path to browse. New users browse (they lack the vocabulary to search); experts search — support both and their combinations.

## Hierarchy tactics while implementing (Refactoring UI, UX-relevant core)

- Hierarchy via **weight and color before size**: dark ink for primary, medium gray for secondary, light gray for tertiary — three levels, not a font-size zoo. (But keep body ≥4.5:1 — "de-emphasized" never means "fails contrast".)
- **De-emphasize the neighbors instead of emphasizing the star** — often the cleaner fix for a competing element.
- **Labels are a last resort**: format data so it self-describes ("12 left in stock" beats "Quantity: 12"); when labels are needed, they're the de-emphasized part.
- **Actions carry hierarchy**: one solid high-contrast primary; secondary as outline/ghost; destructive as text-level unless it's the page's purpose. Three buttons of equal weight = no decision made.
- **Design for the real content distribution**: 1 item, 40 items, a 60-character name, a missing avatar. If the layout only works with the demo data, it doesn't work.
