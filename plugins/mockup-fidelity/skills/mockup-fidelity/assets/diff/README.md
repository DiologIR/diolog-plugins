# Computed-style differ — the mechanical analytic

Two scripts that turn "I diffed both sides" from an aspiration into a fact. They
exist because the failure mode that ships drift is **eyeballing the dumps** — even
with both sides measured to disk, scanning JSON by eye silently skips properties
(a muted-vs-dark section label, a 13-vs-16 input font, a 16-vs-20 gutter, an
inherited `.card.ai-card` shadow). A script that compares **every captured
property** per element cannot skip one. The agent reads the **report**, not the
raw dumps; screenshots are a later, visual-only confirmation.

## Pipeline

```
mock (served HTML)  --extract-mock.js (getComputedStyle)-->  mock.<screen>.json
target (RN device)  --rn-harness (assets/rn-harness)----->  _latest.json (app dump)
                                       │
                       diff.mjs --mock … --app … --anchor "Title"
                                       ▼
                       report.md  (❌ mismatches · ⚠︎ unmatched · ✓ ok)
```

## Works for HTML, React, and StyleX mocks (authoring-agnostic)

The extractor reads `getComputedStyle` from the **rendered DOM**, so the mock's
authoring tech doesn't matter — only that it renders in a browser:

- **HTML+CSS mockup** — served file, multi-frame gallery or single page.
- **React / Next prototype** — render the route and point at the screen root.
- **StyleX** — StyleX compiles to atomic CSS classes at build time, so computed
  styles resolve exactly like normal CSS; dev-vs-prod readable class names are
  irrelevant because we read the *computed value*, not the class. (Dynamic
  `stylex.create((v)=>…)` styles and `defineVars` CSS variables also resolve
  through `getComputedStyle`.)

## 1. Extract the mock's COMPUTED styles — never hand-read the CSS

`extract-mock.js` runs in the browser against the **served** mock and emits, per
element, the resolved `getComputedStyle` subset + a frame-relative rect. This is
non-negotiable: a class like `.ai-card` may declare no `box-shadow`, yet an
element `class="card ai-card"` still HAS one (inherited from `.card`); a StyleX
atomic class set resolves the same way. Reading the class rules by hand misses it;
`getComputedStyle` is the only truth.

```bash
playwright-cli open "http://localhost:8770/<mock>.html"   # or the React/StyleX route
# pick the frame root: any CSS selector (the screen root in a React/StyleX app),
# or a figcaption substring for multi-frame HTML mockup galleries:
playwright-cli eval "() => { window.MF_FRAME_SELECTOR = '#screen .scr'; }"   # or window.MF_FRAME_TITLE = 'Discover · home'
playwright-cli eval "$(cat extract-mock.js)" --filename mock.discover.json
```

Native chrome (`.sb .island .tabbar .homebar .nav`) is skipped — the app renders
that itself. Override the chrome set with `window.MF_CHROME_SELECTOR`.

## 2. Capture the target's RENDERED tree

- **React Native:** use the in-app probe in `../rn-harness` (it POSTs the rendered
  tree — structure + geometry + resolved style + `placeholderTextColor` — to a
  local collector). The RN harness keeps tabs + pushed screens mounted, so pass
  `--anchor "<a title text on the screen>"` to scope the dump to one screen.
- **React / DOM target:** run `extract-mock.js` against the live route too, and
  pass that file as `--app`. The differ reads the `comp` shape as a fallback.

## 3. Diff → report

```bash
node diff.mjs --mock mock.discover.json --app _latest.json --anchor "Discover" --out report.discover.md
```

Per matched element it diffs: font size / weight / colour / **line-height** /
**typeface kind (serif·sans·mono)** / **text-align**, and on the nearest
styled-ancestor box the background / radius / shadow-presence / **padding (left,
top, bottom)**. It also diffs the **screen background** as a top-level check (the
mock frame root vs the shallowest app-rendered backgrounded container) — that one
is NOT tied to a text probe, because screen text sits inside a card whose
background stops the ancestor-walk, so the screen root would otherwise never be
compared. Typeface-kind catches a serif-vs-sans swap the weight check is blind to;
text-align catches centred-vs-left. Line-height and vertical padding matter because
RN text left unset renders at the font default (≈1.2×) while a mock's CSS
line-height is commonly 1.5× — silently shrinking every card; a box with the right
pad-left but wrong pad-top reads as wrong vertical padding. (RN's single-layer
shadow can't equal a multi-layer CSS `box-shadow`, so shadow is a presence check —
match its *depth* by eye against a screenshot.)

The report has three sections:
- **❌ Mismatches** — element · property · target vs mock. Fix every row.
- **⚠︎ In mock, not matched in target** — a missing element OR an intentional swap
  (real data replacing a placeholder; a Material-icon ligature name like
  `auto_awesome` that the app renders as an SVG). The human classifies each.
- **✓ Matched & within tolerance.**

Geometry is compared **only on the gutter an element is anchored to** (left-inset
for left-anchored, right-inset for right-anchored) because the mock's frame width
≠ the device's; flex-spanning elements (anchored to both edges) skip geometry.

## Known remaining blind spots (verify these by eye / structurally)

The differ is **text-probe driven** — it diffs the styles of mock text nodes and
their ancestor boxes, plus the screen background. These classes are NOT caught and
still need a structural pass + a screenshot:

- **Non-text visual elements** with no associated text — a divider line, a
  standalone icon, an image, a decorative bar, a chart, an avatar. If it carries
  no text and isn't a text's ancestor box, it's never probed. (A *missing* divider
  or a wrong icon colour won't flag.)
- **App-EXTRA elements** — the differ iterates MOCK probes, so something the app
  renders that the mock doesn't is invisible to it (only the reverse is listed,
  under ⚠︎ unmatched).
- **Between-element spacing** — the gap/margin BETWEEN two siblings or sections
  (the differ checks an element's own padding + its gutter, not inter-element gaps).
- **Icon glyph correctness** — mock Material ligature vs app SVG are different
  representations; the differ can't confirm the app's icon is the right glyph
  (only that *something* is there). Wrong-but-present icons pass.
- **Element width/height** directly (line-height is a proxy for text-block height).
- **Nested inline `<Text>`** — the RN harness resolves a deeply-nested inline span's
  effStyle as null, so its size/weight/colour can't be compared (a harness limit).
- **letter-spacing / opacity / per-side border colour** — captured but not diffed
  (add if a screen needs them).

So: differ report → 0 unexplained is necessary, not sufficient. Always finish with
a structural present/absent pass (Phase 3A/3B) + a screenshot for the visual
classes above (shadow depth, icon glyphs, spacing rhythm, overlaps).

## Prior art — when to reach for an off-the-shelf tool instead

- **Web/DOM target:** **OverlayQA** / **Pixelay** (design-QA tools that extract
  computed CSS and diff a live page against a **Figma** spec) and Playwright's
  **`toHaveCSS`** (per-locator computed-style assertion) overlap with this differ.
  Prefer them when your source of truth is Figma and you're not in an agent/CI
  loop — but note `toHaveCSS` can't target `::placeholder`, the overlay tools are
  Figma-bound and AI-narrated rather than deterministic, and none scope an RN
  device dump.
- **Pixel/visual regression (Percy, Chromatic, BackstopJS, Applitools):** these
  diff an app against **its own** screenshot baseline, not against a design — and
  fine-grained-UI recall from vision is low. Complementary (catches overlap /
  z-order), not a substitute for the property diff.
- **React Native target:** there is **no** off-the-shelf equivalent.
  `react-test-renderer` / RNTL + `StyleSheet.flatten()` give *declared* styles in
  a node env, not the on-device *rendered* geometry — the exact "source ≠ render"
  trap this skill defeats. The RN harness + this differ fill that gap.
