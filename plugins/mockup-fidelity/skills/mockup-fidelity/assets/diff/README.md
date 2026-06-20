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

## 1. Extract the mock's COMPUTED styles — never hand-read the CSS

`extract-mock.js` runs in the browser against the **served** mock and emits, per
element, the resolved `getComputedStyle` subset + a frame-relative rect. This is
non-negotiable: a class like `.ai-card` may declare no `box-shadow`, yet an
element `class="card ai-card"` still HAS one (inherited from `.card`). Reading the
class rules by hand misses it; `getComputedStyle` is the only truth.

```bash
playwright-cli open "http://localhost:8770/<mock>.html"
# pick the frame — a CSS selector, or a figcaption substring for multi-frame HTML mocks:
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

The report has three sections:
- **❌ Mismatches** — element · property · target vs mock. Fix every row.
- **⚠︎ In mock, not matched in target** — a missing element OR an intentional swap
  (real data replacing a placeholder; a Material-icon ligature name like
  `auto_awesome` that the app renders as an SVG). The human classifies each.
- **✓ Matched & within tolerance.**

Geometry is compared **only on the gutter an element is anchored to** (left-inset
for left-anchored, right-inset for right-anchored) because the mock's frame width
≠ the device's; flex-spanning elements (anchored to both edges) skip geometry.

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
