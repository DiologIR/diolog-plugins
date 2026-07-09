# Visual Verification: Layout Integrity and the Screenshot Playbook

The procedure for *seeing* a design the way a user will — structural layout checks across viewports, plus the screenshot discipline that makes verifier subagents fast and their evidence trustworthy. Use it three ways: as the **fifth review axis** in `polish-pass.md` (layout integrity & responsive), as the **standing playbook** handed to any verifier subagent checking rendered output, and as the **per-unit micro-check** inside `unit-critique-gate.md` — after each unit drafts, load just that unit at 375px and 1280px, run the overflow probe, and collect console errors, rather than saving all layout verification for the end.

**When no browser automation exists** in the environment (a headless sandbox, no Playwright/Chrome), degrade honestly: run the static checks you can — the lint script, the overflow-prone patterns (missing `min-width: 0`, absent `max-width`, fixed widths in fluid containers), explicit image dimensions — and state in your summary that rendered verification did not happen. Never imply a page was seen.

**The other reviews judge the design; this one checks whether it survives contact with a browser.** Broken overflow, overlapping elements, and a layout that shatters at 375px are invisible in source and fatal on screen — and they're the failure class that hierarchy/slop/a11y reviews aren't looking for.

## Phase 0: The verification contract

Everything below this section is technique. This section is why the technique is usually wasted. It comes from a real 20-page build that shipped with a 161px void, an orphaned chip row, and stranded display numerals — all three obvious to a human in seconds, all three surviving a QA harness that reported **0 HIGH, 0 MED, 0 LOW**.

**1. Rendering an image is not seeing an image.** A capture tool-call returning success proves a file exists. The image enters your knowledge only when you *open* it. Screenshots were generated in that build and never read; "I verified with screenshots" was false, and the word for what actually happened is "I rendered screenshots." If you did not open it, you did not look at it, and you may not say you checked it.

**2. The question you bring to an image determines what you see in it.** Handed a screenshot and asked *"do you see anything wrong with this?"*, you find the defect in seconds. Looking at your own render, the implicit question is *"is this done?"*, and the answer comes back yes. Same pixels, same eyes, opposite result. So fix the protocol: for every capture, ask literally **"what is wrong with this?"** Answering "nothing" requires first naming the three most likely failure modes for that component (a void, a wrap, a misalignment, a contrast miss, an overlapping label) and ruling each out by pointing at pixels. If you can't name three, you don't know the component well enough to clear it.

**3. A gate is downstream of the findings that motivated it.** Every rule in a lint was written *after* someone pointed at a defect. It can prove a defect you have already met has not come back. It is structurally incapable of finding the one nobody has met yet. **"0 findings" means "no known defect is present." It never means "verified."** Report the two claims separately and in these words: *"the lint passed"* and *"I opened captures X, Y, Z and looked for A, B, C."* Merging them into "verified" is the specific dishonesty that hands the reviewing labour back to the person the work was meant to save.

**4. Prove your rules can fail.** That harness's widow rule was `/\S+/g` written inside a JavaScript template literal, where `\S` is not a valid escape and collapses to `S`. It shipped as `/S+/g`, matched runs of the letter S, found nothing on any page, ever — and its silence was reported as a pass. Nothing in the output distinguishes silent-because-clean from silent-because-broken. Two cheap defences: **serialize a real function** into the page (`fn.toString()`) rather than building a code string, so escapes mean what they say; and **run every new rule against the artifact that motivated it, watch it fire, and only then fix the artifact.** A rule only ever observed passing is a rule you have not written.

**5. Coverage is silent.** A rule whose selector matches nothing does not warn you. It passes. When you add a component that uses a checked pattern, add it to the config in the same edit. When the gate is clean, spend one moment asking which components no rule mentions.

**6. Inspect crops, not pages.** A full page scaled into a review is a resolution at which a 161px void reads as "generous whitespace" and an orphaned chip is a few ragged pixels. Judging from thumbnails is looking at an image in which the defects cannot exist and concluding there are none. Crop to the component and zoom (DPR 2–3). See Phase 2.

**7. Measure ink, not boxes.** `getBoundingClientRect()` returns the box; where the glyph sits inside it depends on `line-height`, the font's metrics, and the character. Two boxes with identical `top` can show their ink 8px apart — which is how "the CSS is correct" and "it looks wrong" are both true at once. For cap-height, probe the baseline and add the font's real ascent:

```js
const probe = document.createElement('span');
probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
el.insertBefore(probe, el.firstChild);
const baselineY = probe.getBoundingClientRect().top;   // the first line's baseline
probe.remove();
ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
const inkTop = baselineY - ctx.measureText(text).actualBoundingBoxAscent;
```

Corollary: `line-height` below ~0.95 of the font size makes the box **shorter than the glyph**, so centring lies and a 64px numeral renders 73px wide. And correct optical alignment with `transform: translateY()`, never `margin` — a transform doesn't disturb the box model, so it can't knock a value off the spacing scale.

**8. Static checks are structurally blind to motion.** Every rule above reads the DOM at rest, where an entrance has finished and a transient overlay is `opacity: 0`. A "Checking…" overlay that painted *underneath* its own chip's inline text passed every static rule in that harness; the only artifact containing the bug was a frame captured 200ms in. If a deliverable moves, capture mid-flight frames and open them — restart the animation deterministically with `el.classList.remove(c); void el.offsetWidth; el.classList.add(c)`.

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
- **The crop is the evidence; the full page is only the index.** A whole page scaled to fit a review shows you composition and nothing else. Every defect that survives to delivery lives at component scale. Produce one crop per component and open each — a page capture you skimmed is not coverage for the twelve components inside it.
- **Wait for the page to be actually done:** network idle plus an explicit wait for async renderers — charts and canvas need 2–4s after networkidle. A screenshot of a half-rendered chart generates a false finding.
- **`deviceScaleFactor` by purpose, not by habit.** Use **1** when the question is "what does a user see at 100% zoom" (that's what Phase 1 asks). Use **2–3** when the question is "is this component defective" — spacing, alignment, ink, hairlines and 1px drift are not resolvable at DPR 1, and a defect you cannot resolve is a defect you will clear. (Use 2+ for delivery assets too, per `make-an-animation.md`.)
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

Close with three lines, in this shape, because the last one is what keeps the first two honest:

```
Gates:       lint clean · overflow probe clean · 0 console errors
Looked at:   12 component crops @2x, hover + focus states, 375/1280
Not checked: 1920px, the print stylesheet, the chart's empty state
```

The first line is what a machine asserts. The second is what *you* assert, and it is only true for captures you opened. The third is never empty — if you believe it is, you have confused the scope of your rules with the scope of the artifact.
