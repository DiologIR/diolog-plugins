# Motion Design: UI Motion That Feels Engineered, Not Decorated

Give interfaces motion that carries meaning — and review motion that doesn't. Use this whenever a design includes animation beyond a bare hover transition: entrances, exits, layout changes, scroll effects, page transitions, celebratory moments. For cinematic timeline pieces (product videos, animated stories, anything with a scrubber), use `make-an-animation.md` instead; for interaction-state basics (hover/active/focus), `interaction-states-pass.md` covers the floor and this file covers the ceiling.

**Motion is the fastest way to make a design feel expensive — and the fastest way to make it feel like a template.** Agencies win on motion because they treat it as engineering: budgeted, choreographed, interruptible, and mostly invisible. Decoration-first motion (things wiggling to look "premium") is an AI-slop tell.

## Phase 1: Decide what earns motion

Animate only when the user moves through **space, time, or state**: navigation, container morphs, progress, gesture follow-through, appearing/disappearing content. Never animate to teach, to decorate, or to signal "premium" — research (Tversky 2002 meta-analysis) shows animation doesn't even beat static images for explaining things.

Budget by frequency of the action:

| Action frequency | Motion budget |
|---|---|
| 100+/day (keyboard shortcuts, command palette, typing feedback) | **None. Ever.** Never animate keyboard-initiated actions. |
| Tens/day (hover, list navigation, tab switches) | Remove or drastically reduce (≤150ms, subtle) |
| Occasional (modals, drawers, toasts, route changes) | Standard motion |
| Rare / first-time (onboarding, empty states, success celebration) | Delight allowed — this is where the budget goes |

One orchestrated moment beats scattered micro-interactions: **a single well-choreographed page load with staggered reveals creates more delight than twenty hover effects.** Spend the motion budget in one place, deliberately.

Motion *confirms* a state change; it never *performs* it. Update the UI optimistically, then let motion acknowledge it — don't make the user wait for a transition to finish before the app responds.

## Phase 2: Commit to a motion vocabulary (tokens, not vibes)

Define these once per project and use them everywhere — mixed durations and easings read as unintentional exactly like mixed border radii do:

```css
:root {
  /* Durations — UI stays under 300ms */
  --t-press: 120ms;      /* button press, toggles */
  --t-hover: 150ms;      /* hover, color, tooltips */
  --t-menu: 200ms;       /* dropdowns, popovers */
  --t-modal: 250ms;      /* modals, drawers (up to 500ms for full-screen) */
  --t-exit-scale: 0.7;   /* exits run ~70% of the entry duration */

  /* Easing — built-in keywords are too weak for polished motion */
  --ease-out:     cubic-bezier(0.23, 1, 0.32, 1);   /* entering elements */
  --ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1);  /* moving/morphing on screen */
  --ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);   /* sheets and drawers */
}
```

Easing decision order: **entering/exiting → ease-out; moving or morphing on screen → ease-in-out; hover/color → ease; constant motion (spinners, marquees) → linear.** Never `ease-in` on UI — it delays the exact moment the user is watching. Mobile runs ~20–30% shorter than desktop.

Springs (Framer Motion, WAAPI spring approximations) when motion should feel physical: `{ type: "spring", duration: 0.5, bounce: 0.2 }`. Keep bounce 0.1–0.3, reserve real bounce for gestures and drag — springs' killer feature is keeping velocity when interrupted.

## Phase 3: Physicality rules

- **Nothing enters from `scale(0)`.** Start `scale(0.95)` + `opacity: 0` — objects in the world don't materialize from a point.
- **Popovers, menus, and tooltips scale from their trigger** — set `transform-origin` to the trigger side. Modals are exempt (they're a new context; center is right).
- **Press feedback:** `transform: scale(0.97)` on `:active`, `--t-press` duration. Buttons that don't acknowledge the press feel dead.
- **Asymmetric timing:** enter ~200ms, exit ~140ms — exits should read decisive, not lingering. Deliberate destructive actions invert this: hold-to-delete runs slow and linear (~2s) so the user can bail.
- **Nothing accelerates into a wall.** A thing that flies off-screen eases out; a thing that lands eases into place.

## Phase 4: Choreography

- **Stagger** small groups (30–80ms per item, ≤6–8 items). Stagger is seasoning: a whole page staggering item-by-item blocks the user; a hero's headline → subhead → CTA cascade guides the eye. Never let stagger delay interactivity.
- **Direction tells a story.** Enter from where the thing conceptually comes from (drawer from its edge, toast from the corner it lives in, next-step content from the direction of travel). Random directions break the spatial model.
- **Accordion/expand:** animate `grid-template-rows: 0fr → 1fr` (content wrapper `min-height: 0; overflow: hidden`) — smooth height without measuring.
- **Keep exiting elements mounted** and toggle a class/attribute; React unmounts skip exit transitions. CSS `transition-behavior: allow-discrete` + `@starting-style` give JS-free entry/exit for `display: none` toggles.
- **Interruptibility is non-negotiable** for anything rapidly triggered (toasts, toggles, hover cards): CSS transitions retarget mid-flight; CSS keyframes restart from zero. Use transitions or springs, not keyframes, for interruptible motion.

## Phase 5: The modern web motion toolkit

Use the platform before reaching for a library — these are what make current agency work feel current:

- **Scroll-driven animations (CSS):** `animation-timeline: view()` / `scroll()` for reveals, parallax, progress bars — zero JS, compositor-run. Reveal pattern: `animation: rise linear both; animation-timeline: view(); animation-range: entry 0% entry 60%;`. Reserve for marketing/editorial surfaces; product UI scrolls quietly.
- **View Transitions API:** `document.startViewTransition()` for page/state morphs; tag shared elements with `view-transition-name` for magic-move continuity. **It does NOT respect `prefers-reduced-motion` automatically — gate it yourself.**
- **FLIP** for layout changes the platform can't yet morph (list reorders, grid → detail): measure First/Last, Invert with a transform, Play the transform to zero. Transform-only, so it's cheap.
- **WAAPI** (`element.animate()`) when you need JS control with CSS-level performance — runs off the main thread, unlike rAF loops.
- **Polish tricks:** ≤2px blur during a crossfade masks imperfect alignment; `clip-path: inset()` for reveals and tab-highlight slides; `translate` percentages are self-relative (how Sonner stacks toasts and Vaul nests drawers); a sticky header that hides on scroll-down and reveals on scroll-up returns the viewport to content without losing the nav (track scroll direction, toggle a transform class — never per-frame JS positioning).

**When the platform toolkit runs out, escalate to GSAP** (`gsap-motion.md`): multi-step choreographed timelines with runtime control, scrub-and-pin scroll storytelling, horizontal scroll journeys, per-line text reveals (SplitText), SVG draw/morph, drag with momentum. All GSAP plugins are free and CDN-loadable; the budgets and the review gate in this file still govern.

**Kinetic type** (heroes, decks, campaign pages only): animate words/lines, not letters, for readability (per-letter is a one-shot logo trick); split with spans, stagger 40–60ms; mask-reveal (overflow hidden line-boxes, text translates up into view) reads editorial; variable-font axis animation (weight/width on scroll or hover) is distinctive and cheap — one axis, subtle range. For production text splitting (font-load re-splits, built-in mask wrappers, aria handled), use GSAP SplitText per `gsap-motion.md` rather than hand-rolling spans.

## Phase 6: Gestures (when the prototype has them)

Dismiss on **velocity** (|distance|/ms > ~0.11), not distance thresholds — a fast short flick means "dismiss" more than a slow long drag. Add damping past boundaries (element follows at ~0.3× beyond the edge). Use pointer capture; ignore additional touches mid-gesture. Snap back with a spring that inherits release velocity.

## Phase 7: Performance and accessibility

- Animate **`transform` and `opacity` only**; `filter`/`clip-path` sparingly. Never animate layout properties (width/height/top/margin) outside the grid-rows trick; never `transition: all`.
- Framer Motion's `x`/`y`/`scale` shorthands are not hardware-accelerated — animate the full `transform` string when it matters. Don't drive many children's transforms from one parent CSS variable (style-recalc storm).
- `will-change` only on elements about to animate; remove after.
- Loops: carousels stop after 3–5 cycles; skeleton shimmer only while loading; reward animations play once; any motion >5s needs a pause control (WCAG 2.2.2); nothing flashes >3×/sec; cancel ambient motion on route change.
- **`prefers-reduced-motion` means fewer and gentler, not zero:** keep opacity/color crossfades, drop movement/scale/parallax, and jump timeline pieces to their end state. Deck builds apply instantly but click-gating stays (reveal order is content). Gate hover-triggered motion behind `@media (hover: hover) and (pointer: fine)`.

## Phase 8: Review procedure (run on any motion-bearing deliverable)

Flag on sight, in this order of severity: `transition: all` · animation on keyboard-initiated actions · `ease-in` on UI · `scale(0)` entrances · center-origin popovers · keyframes on interruptible elements (toasts/toggles) · layout-property animation · >300ms UI motion without justification · ungated hover motion · looping decoration · View Transitions without reduced-motion handling.

Fix with the remedial hierarchy — cheapest lever first: **1 delete the animation → 2 reduce duration/distance → 3 fix easing → 4 fix origin/physicality → 5 make it interruptible → 6 move it to transform/opacity → 7 asymmetric timing → 8 polish (blur, stagger) → 9 a11y and cohesion (tokens)**. Report findings as a Before / After / Why table and end with a verdict: ship, or the specific items that block.

Debug like an animator: slow everything 2–5× (DevTools animation panel), step frame-by-frame, test gestures on a real device, and look again the next day with fresh eyes.
