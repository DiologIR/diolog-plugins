# Visual Verification: Layout Integrity and the Screenshot Playbook

The procedure for *seeing* a design the way a user will — structural layout checks across viewports, plus the screenshot discipline that makes verifier subagents fast and their evidence trustworthy. Use it two ways: as the **fifth review axis** in `polish-pass.md` (layout integrity & responsive), and as the **standing playbook** handed to any verifier subagent checking rendered output.

**The other reviews judge the design; this one checks whether it survives contact with a browser.** Broken overflow, overlapping elements, and a layout that shatters at 375px are invisible in source and fatal on screen — and they're the failure class that hierarchy/slop/a11y reviews aren't looking for.

## Phase 1: Layout integrity checklist

Serve over HTTP (never `file://`), load the page, and check — at minimum — at these widths:

| Viewport | Width | Watch for |
|---|---|---|
| Mobile | 375px | The layout's true stress test — most breakage lives here |
| Tablet | 768px | Awkward two-column intermediates, orphaned sidebars |
| Desktop | 1280px | The design as intended |
| Wide | 1920px | Missing `max-width` — content stretched to absurd measure |

Also pause at 2–3 in-between widths while resizing: breakpoint *transitions* break more often than breakpoints.

Per viewport, in severity order:

- **Overflow** — no unintended horizontal scrollbar; no content escaping its container; images inside their boxes; tables/code blocks scroll inside their own `overflow-x: auto` wrapper, not the page. Programmatic probe (run in the page console):

```js
[...document.querySelectorAll('*')].filter(el =>
  el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
).filter(el => getComputedStyle(el).overflow === 'visible')
 .forEach(el => console.log('overflow:', el.tagName, el.className));
if (document.documentElement.scrollWidth > innerWidth) console.warn('PAGE overflows horizontally');
```

- **Overlap** — nothing unintentionally covering anything: sticky headers over anchored content, badges over text, absolutely-positioned decor over CTAs. Check with real content lengths, not just the happy sample.
- **Text integrity** — no clipping or mid-word breaks; long words/URLs wrapped (`overflow-wrap: break-word`); ellipsis actually appearing where truncation is designed; italic descenders not clipped; no widowed CTA labels.
- **Alignment drift** — grid/flex items evenly distributed; icons vertically centered with their labels; form labels attached to their fields; nothing off-grid by a few accidental pixels.
- **Stability (CLS/FOUT)** — reload and watch: no layout jump when images load (explicit `width`/`height`), no font flash reflow, skeletons matching the layout they replace.
- **Z-order** — dropdowns above cards, modals above everything, toasts above modals. If z-index values look ad-hoc, tokenize the scale: `--z-dropdown: 100; --z-sticky: 200; --z-overlay: 300; --z-modal: 400; --z-toast: 500`.
- **Media** — aspect ratios held (`object-fit`), no stretched or squashed images, embeds/iframes contained.

## Phase 2: Screenshot playbook (for verifier subagents)

Screenshots are the evidence; take them so they're cheap to retake and honest to compare.

- **One tall raw capture, then crop.** Screenshot the full page once with a tall viewport (e.g. 1400×5000, `fullPage: true`), then slice regions from the image. Re-cropping is instant; re-screenshotting costs a browser launch and render wait. Don't fight per-element clip captures.
- **Wait for the page to be actually done:** network idle plus an explicit wait for async renderers — charts and canvas need 2–4s after networkidle. A screenshot of a half-rendered chart generates a false finding.
- **`deviceScaleFactor: 1`** so pixels match what a user sees at 100% zoom (use 2 only when supersampling for delivery assets, per `make-an-animation.md`).
- **Before/after pairs must match** — same viewport, same crop box, same states — or the comparison is worthless. Capture the *before* before editing; if you forgot, restore the prior version (`git stash` / `git checkout HEAD~1 -- <file>`), capture, then restore.
- **Interactive states need deliberate staging:** hover — hover the element, wait for the tooltip/transition, then capture; selected-without-hover — click, then move the pointer away (e.g. to a corner) before capturing, or the hover state contaminates the evidence. Capture each state at both mobile and desktop widths when the interaction differs.
- **Console is part of the capture.** Collect JS errors/warnings on every load — a clean-looking page with a thrown exception is not verified.

## Phase 3: Fix loop

- **One issue per fix, verify, then the next.** Batch-fixing layout issues hides which change broke what.
- Prefer the structural fix over the suppressive one: `min-width: 0` on the flex child, `repeat(auto-fit, minmax(250px, 1fr))` on the grid, a real `max-width` on the container — before reaching for `overflow: hidden`, which silences the symptom and clips content.
- After each fix, **re-check the neighbors**: the other viewports, and the sections above/below the change (spacing fixes leak). Watch for CSS specificity collisions — a generic `.section` rule silently overriding component spacing is a classic generated-CSS failure.
- **Three attempts per issue, then stop and report it** with the screenshot and the attempted fixes — an issue that survives three targeted fixes usually means the diagnosis is wrong, and that's a finding for the user, not a loop to hide in.

## Phase 4: Report

Findings as a table — *viewport · element · issue · severity (P0 breaks function / P1 degrades UX / P2 cosmetic) · fixed? · evidence screenshot*. Note anything observed but out of scope (third-party embeds, content edits). Never report "looks fine" without naming the viewports and states actually checked — an unchecked state is unverified, not passing.
