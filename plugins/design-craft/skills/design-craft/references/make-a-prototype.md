# Make a Prototype: Interactive Clickable Prototype

Build a working interactive prototype — clickable, navigable, with real state and feedback. Use this when the user asks for a prototype, mockup, demo, or "make it interactive."

**Prototypes interact.** Static screenshots strung together with `<a>` tags don't count. The point is to test the flow with real interaction — clicking, typing, validating, succeeding, failing.

## Phase 1: Discovery

Confirm before building:

- **The flow.** What screens? Entry point? Goal state? Map it as a list.
- **Fidelity.** Hi-fi (real visuals, real components, real feel) or mid-fi (wireframe-level, focused on flow not polish)?
- **Device frame.** Desktop browser? iOS frame? Android frame? macOS window? (Phase 3 builds these directly.)
- **Variations.** One flow or several to compare?
- **Brand / design system.** Always confirm. If none, run `frontend-aesthetic-direction.md` first.
- **Sample data.** What real-looking content fills the screens? Avoid Lorem ipsum.

## Phase 2: Map screens and state

Before building, write down the flow and drop it into the file as a comment block at the top:

```
Screens:
  1. Welcome — "Get started" CTA → goes to 2
  2. Email entry — validate format → goes to 3 on valid, shows error on invalid
  3. Verification — "Check your email" + "Skip" → goes to 4
  4. Profile — name, photo upload → goes to 5
  5. Success — "You're in" + "Get started" → goes to 1 (loop demo)

State:
  - currentScreen: 1
  - email: ""
  - emailError: null
  - name: ""
```

## Phase 3: Build screen-by-screen (with a self-contained device frame)

Switch screens within a single page via display toggling (`hidden` attribute / `display:none↔block`) or framework state — not separate files. For each screen: hi-fi visuals matching the design system (real components, not generic boxes), real plausible sample content, one primary CTA (secondary actions smaller and de-emphasized).

When the user wants a device frame, build it directly — a fixed-size shell with the prototype mounted inside. A phone frame, for example:

```html
<div class="device" style="
  width: 390px; height: 844px;            /* iPhone-ish logical size */
  margin: 40px auto; border-radius: 48px;
  background: #000; padding: 12px;
  box-shadow: 0 30px 60px rgba(0,0,0,.25);">
  <div class="screen" style="
    width: 100%; height: 100%; border-radius: 38px; overflow: hidden;
    background: #FAFAFA; position: relative;">
    <!-- notch -->
    <div style="position:absolute; top:0; left:50%; transform:translateX(-50%);
                width:140px; height:28px; background:#000;
                border-radius:0 0 18px 18px; z-index:5;"></div>
    <!-- screens mount here; toggle [hidden] to switch -->
    <section data-screen="welcome"> … </section>
    <section data-screen="email" hidden> … </section>
  </div>
</div>
```

Adapt the frame to the target: a **browser window** (chrome bar with traffic-light dots + a fake URL field), a **macOS window** (title bar + traffic lights), an **Android** frame (squarer corners, status bar), or no frame for a full desktop layout. The frame stays fixed; the prototype lives inside it. Keep frames lightweight — they set context, they aren't the deliverable.

## Phase 4: Wire up interactions

A real prototype has **every interaction wired**, not just the happy path:

- **Navigation.** Primary CTA moves to the next screen. Back moves backward. State persists across screens.
- **Form validation.** Empty submission → inline error. Bad format → specific error tied to the field. Valid input → proceed.
- **Loading states.** Async actions show a loading indicator; buttons disable during the request to prevent double-submit.
- **Success feedback.** Toast, inline confirmation, or page transition confirming the action.
- **Error feedback.** Clear, tied to the field or action that caused it.
- **State changes.** Toggling, selecting, filtering — all update the UI immediately.

If the prototype is a small slice, fake the async work with `setTimeout` to simulate latency. Don't skip the loading state because the work is fake — the loading state is part of what the prototype is testing.

## Phase 5: Wire up sub-state

Many real flows have meaningful sub-state — selection (which item is selected in a list), filter/sort (how the data is arranged), modal/dropdown (open or closed), form (values, errors, dirty/pristine). Make these reactive: click a filter chip → list re-renders; open a modal → focus moves to it and Escape closes it.

## Phase 6: Persist what matters

Some state should survive a page reload — **current screen** (store in `localStorage`, restore on load), **form drafts** (if the user refreshes mid-flow, pick up where they left off), **tweak values** (see `make-tweakable.md`). Refreshing during iterative design is one of the most common user actions; state that doesn't survive reload makes the prototype feel broken.

## Phase 7: Verify

Walk the full flow in a browser: every CTA leads somewhere; every form validates; every error is clear and recoverable; every async action shows feedback; every state change is visible; keyboard navigation works (Tab through, Enter to submit, Escape to close modals); focus is visible. Dispatch a verifier subagent (the `Agent` tool) for the thorough pass. If you can't verify a behavior, say so explicitly in the summary rather than claiming success.

## Phase 8: Variations (if requested)

If the user asked for variations of the flow, layout, or visual treatment, expose them as **tweaks** (a floating panel — see `make-tweakable.md`), a **side-by-side canvas** (multiple variants in a CSS-grid of labeled cells — see the canvas snippet in `wireframe.md`), or **toggles** the user clicks between. Don't scatter `v1.html / v2.html / v3.html` across the project — one file, many variants.

Summarize briefly: what flows work, what's faked (e.g. "submit calls a setTimeout fake"), what's open for the user to decide.
