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
mock (served HTML / React / StyleX)  --extract-mock.js (getComputedStyle)-->  mock.<screen>.json
target — React/DOM (web↔web)          --extract-mock.js (getComputedStyle)-->  app.<screen>.json
target — React Native (no DOM)        --rn-harness (assets/rn-harness)------>  _latest.json (app dump)
                                       │
                       diff.mjs --mock … --app … [--anchor "Title" — RN only]
                                       ▼
                       report.md  (❌ mismatches · ⚠︎ unmatched · ◆ app-extra · ✓ ok)
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
# pick the frame ONE of three ways:
playwright-cli eval "() => { window.MF_FRAME_SELECTOR = '#screen .scr'; }"  # any CSS selector (a React/StyleX screen root)
playwright-cli eval "() => { window.MF_FRAME_TITLE = 'Discover · home'; }"  # caption substring (gallery)
playwright-cli eval "() => { window.MF_FRAME_INDEX = 13; }"                 # 1-based ordinal (gallery, when captions aren't unique)
playwright-cli eval "$(cat extract-mock.js)" --filename mock.discover.json
```

**Multi-frame galleries come in two markups and the extractor handles BOTH** out of
the box: `<figure><figcaption>` (one mock) and `<div class="frame">…<div class="cap">`
(another — e.g. each `.frame` holds a `.device > .screen` plus a `.cap` title).
`MF_FRAME_TITLE` searches the union `figure, .frame` for a container whose
`figcaption, .cap` text includes the title, then takes the inner `.scr/.screen` as
the frame root. Override either set with `window.MF_FRAME_CONTAINER` /
`window.MF_CAPTION_SELECTOR` for a third markup, or use `MF_FRAME_INDEX` (Nth
container) when captions repeat. The **differ** (`diff.mjs`) is format-agnostic — it
consumes the extracted JSON, so nothing downstream changes per markup.

Native chrome (`.sb .island .tabbar .homebar .nav`) is skipped — the app renders
that itself. Override the chrome set with `window.MF_CHROME_SELECTOR`.

**Now also captured (backward compatible):** each node carries the **layout props**
`structure-diff.mjs` consumes — `gridTemplateColumns`/`gridTemplateRows`/`gridAutoFlow`,
`gap`/`columnGap`/`rowGap`, `flexDirection`, `flexWrap`, `position` — and a **`fid`** read
from `data-fid` / `data-fidelity-id` / `data-testid`. `diff.mjs` ignores both; the
companion differs (below) use them. Put the same `data-fid="x"` on the matching ref +
target nodes to make a region's matching exact (kills text-collision mispairs).

## 2. Capture the target's RENDERED tree

- **React Native:** use the in-app probe in `../rn-harness` (it POSTs the rendered
  tree — structure + geometry + resolved style + `placeholderTextColor` — to a
  local collector). The RN harness keeps tabs + pushed screens mounted, so pass
  `--anchor "<a title text on the screen>"` to scope the dump to one screen.
- **React / DOM target (web↔web — first-class):** run the **same** `extract-mock.js`
  against the live route and pass that file as `--app`. Both sides then flow through
  one extractor and one differ. Notes:
  - **No `--anchor`.** It scopes a multi-screen RN dump; a DOM extract is already
    scoped to the one `MF_FRAME_SELECTOR` root, so omit it.
  - **Same viewport on both sides.** Render reference and target at the identical
    size; the differ prefers a DOM dump's extracted `frame.w` (symmetric with the
    mock), so insets compare like-for-like and the `scrolled` guard correctly skips a
    horizontally-overflowing region (kanban/tab strip).
  - **Override the chrome skip-list** with `MF_CHROME_SELECTOR='__none__'` — on the web
    the app sidebar/header/nav is content on both sides, not native chrome.
  - The box-level diff (background/radius/shadow/padding) reads the app's nearest
    styled-ancestor via `n.id ?? n.i` — extract-mock dumps key nodes by `i` (no `id`),
    so this fallback is what makes the ▸box rows resolve to real values instead of
    `undefined`. Full playbook: `../../references/react-web.md`.

## 3. Diff → report

```bash
node diff.mjs --mock mock.discover.json --app _latest.json --anchor "Discover" --out report.discover.md
```

Per matched element it diffs: font size / weight / colour / **line-height** /
**typeface kind (serif·sans·mono)** / **text-align**, and on its box — the text's
**own** styled element if it sits directly on one (a button/badge label), else its
nearest styled ancestor — the background / radius / shadow-presence / **padding
(left, top, bottom)**. It also diffs the **screen background** as a top-level check (the
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

**Rendered geometry (📐, web↔web / same-viewport).** The gutter-inset checks are deliberately
frame-width-agnostic (left-inset for left-anchored, right-inset for right-pinned), so they are
BLIND to an element that is the *right type in the wrong place/size*: a CENTRED element translated
sideways (a nav link grouped hard-left vs centred — its 350px shift fired no inset), or a box
rendered taller/shorter (a heading wrapping to 3 lines vs 2). When both sides are DOM at the SAME
viewport, absolute `x/w/h` ARE comparable, so the differ adds **center-x + width for CENTRED
elements** (the precise gap the inset model can't cover; left/right-anchored stay on insets, and a
left-block's width is container-vs-content noise) and **height for all** (wrap-count / box growth).
Auto-ON when frames match within 5%; force `--geom`, disable `--no-geom`, tune `--geom-tol-center`
(6px) / `--geom-tol-size` (10px). CAVEAT: geometry inherits the differ's text-matching confounds —
a **repeated-text mispair** (nav "diolog" paired with the 112px footer wordmark) or a
**wrapper-vs-bare-text pairing** (a button+icon vs the mock's text span) inflates a delta; confirm
the pairing before treating a 📐 row as a defect. (A reliable kill for both: put a matching
`data-fid` on the two real nodes — `extract-mock.js` reads it as the primary match key.)

Three checks that close the **non-text box-model class** (icon size, content-box height, tight
line-height) — the defects a text-property diff structurally can't see:
- **Icon glyph size (📐 icon-glyph-w/h).** A bare `<svg>` has no text, so the probe loop never
  measures it, and even its element box can match while the *drawn* glyph differs (a 12px box holds a
  6×3 OR an 8×4 chevron). `extract-mock.js` captures each svg's **visible glyph extent** (union path
  bbox in rendered px, not the element box); the differ pairs icons by POSITION (same viewport) and
  diffs glyph w/h. A genuinely-absent icon stays unpaired (a real signal), not matched to a distant one.
- **`line-height: normal` is resolved, not skipped.** The mock's value is frequently the keyword
  `normal`, which `px()` can't parse → the line-height check used to be skipped entirely, so a target
  forcing a tight `line-height: 1` (a 14px content box where the mock renders ~17px → a 3px-short button)
  passed silently. `normal` now resolves to ~1.2×font-size for the comparison.
- **Height has its own tight tolerance (2px), separate from width (10px).** Height is a discrete layout
  dimension (line-count, box height) where a 3px delta is a real defect; width is content-driven and
  noisy. Override with `--geom-tol-height`.

The report has five sections:
- **❌ Mismatches** — element · property · target vs mock. Fix every row.
- **⚠︎⚠︎ WRONG STATE** — a mock probe unmatched on the measured screen but present
  ELSEWHERE in the full app dump. It is NOT missing — you measured the wrong state
  (surface unopened, or `--anchor` scoped to the wrong screen) so its geometry/style
  was never checked. Re-measure the populated state before trusting the report. (This
  is how the Invest "Example brokers" inset first hid — diffed against the wrong tab.)
- **⚠︎ In mock, not matched in target** — a genuinely missing element OR an
  intentional swap (real data replacing a placeholder; a Material-icon ligature name
  like `auto_awesome` the app renders as an SVG). The human classifies each.
- **◆ App-EXTRA** — text the APP renders that the mock does NOT. "Mock wins" removes
  these (an extra badge/line/wrapper) — but the bucket also lists legitimate extra
  DATA (more rows than the mock's sample, live prices/names), so it's a SCAN AID:
  confirm each is real data, else remove or cite it.
- **✓ Matched & within tolerance.**

Geometry per matched probe: **left-inset** whenever the element is left-anchored —
INCLUDING when it also spans wide (a list-row title flexes to fill its row, so its
text node is left- AND right-anchored; the old build skipped it as "flex-spanning"
and so missed an 84-vs-66 title inset). **right-inset** only for genuinely
right-pinned elements (right-anchored and not left-anchored). Plus **row-left-inset
/ row-right-inset** — the leftmost / rightmost content node sharing the probe's
vertical band — which catch a row pushed in by a leading TILE/ICON/AVATAR or a
displaced trailing icon/badge (non-text elements that are never probed directly).
A horizontally-scrolled row (a tab strip, content off-screen) is detected and its
geometry skipped, so scroll position never reads as a gutter mismatch. The mock's
frame width ≠ the device's, so only insets (not absolute x) are compared.

## ⚠️ Reference the LIVE rendered site, not a re-served static scrape

The single biggest source of "I matched the mock exactly but it still looks wrong": a
**runtime-hydrated site (Framer, most page builders, any SPA) does NOT render the same when
its scraped HTML is re-served from localhost.** The scrape freezes the markup + every
breakpoint variant's CSS, but the framework's JS resolves the *final* desktop layout at
runtime — and re-served off-origin (with its `framerusercontent`/`gstatic` fetches broken)
that JS doesn't re-execute, so the page falls back to a *different variant*. Real divergences
this caused (all where the scraped CSS literally contained BOTH values): a nav gap that was
**10px in the served scrape but 16px on live**; a hero gradient that exists **only as an
`<img>` on live** (gone from the scrape); `text-wrap`/font resolution that differed. Every one
of those made the differ report "identical" against the wrong target.

**So: extract the mock from the LIVE URL** (`extract-mock.js` runs fine against `https://…` via
the same browser), not from a localhost-served scrape. Keep the scrape only for content/copy.
If you can only get a scrape, treat its resolved geometry as *suspect* and spot-check key
values against the live site.

Two measurement disciplines that came from the same debugging:
- **Measure the STYLED element, not the inner text node.** A CTA's text node was `h=20`
  (read as "plain text link") while its button `<a>` was `h=42` (a pill). Pairing the text
  node's box led to deleting a real pill. Walk to the styled ancestor (the differ's box-walk
  already does this — trust it over a hand `find(text)`).
- **Backgrounds can be `<img>`/`<canvas>`/SVG layers invisible to a `background-image` scan.**
  A hero "gradient" was a full-bleed `<img>` (an SVG), so `getComputedStyle(...).backgroundImage`
  was `none`. When hunting a visual fill, scan for large `img`/`canvas`/`svg` children too.
- **Self-host the EXACT webfont the live site loads** (the specific Google `vNN` woff2), not a
  same-named package — `@fontsource/inter` renders ~2px wider per label than Google's Inter
  v20, shifting widths and wrap points. Glyph-width fidelity needs the byte-identical file.

## Known remaining blind spots (verify these by eye / structurally)

The differ is **text-probe driven** — it diffs the styles of mock text nodes and
their ancestor boxes, plus the screen background. These classes are NOT caught and
still need a structural pass + a screenshot:

- **Non-text visual elements** with no associated text — a divider line, a
  standalone icon, an image, a decorative bar, a chart, an avatar. If it carries no
  text and isn't a text's ancestor box, its presence/colour/glyph is never probed. (A
  *missing* divider or a wrong icon colour won't flag.) PARTIAL COVER: a leading
  tile/icon/avatar or trailing icon/badge that is mis-INSET is now caught via
  `row-left-inset`/`row-right-inset` (the row's leftmost/rightmost edge), so its
  horizontal position is checked even though its identity/colour still isn't.
- **App-EXTRA elements** — NOW LISTED in the `◆ App-EXTRA` bucket (app text with no
  mock match). Still text-only (an extra non-text badge/divider with no text isn't
  caught) and inherently noisy (legitimate extra data rows appear too) — a scan aid,
  not a hard fail.
- **Between-element spacing** — the gap/margin BETWEEN two siblings or sections
  (the differ checks an element's own padding + its gutter, not inter-element gaps).
- **Icon glyph correctness** — mock Material ligature vs app SVG are different
  representations; the differ can't confirm the app's icon is the right glyph
  (only that *something* is there). Wrong-but-present icons pass. **Actionable:**
  treat every ⚠︎-unmatched Material ligature (`arrow_upward`, `tune`, `add_circle`,
  `auto_awesome`) as a glyph to eye-check — it's a faithful SVG equivalent OR the
  wrong glyph. (Real misses caught this way: a paper-plane `send` where the mock is
  an up-arrow `↑`; a settings-gear where the mock is `tune`/sliders.)
- **Component-PRIMITIVE choice for an always-dynamic-text element** — when an
  element's text is *always* real data (a category badge, a status pill, a row
  title, a price), its text never equals a mock probe, so the differ **never
  style-compares it at all** — a wrong primitive is invisible. This is how a
  category rendered as a large title-case `Chip` survived where the mock uses a
  small uppercase `.badge`: the text never matched, so the 13/500-vs-10/600 gap was
  never seen. For every element whose text is dynamic, eye-check the *primitive*
  (chip vs badge vs row vs card) against the mock — the differ can't.
- **Element width/height** directly (line-height is a proxy for text-block height).
- **Nested inline `<Text>`** — the RN harness resolves a deeply-nested inline span's
  effStyle as null, so its size/weight/colour can't be compared (a harness limit).
  Symptom: a section lead-in you can SEE is bold (`**Business.**`) reports
  `font-weight: null` — confirm by eye, don't chase.
- **letter-spacing / opacity / per-side border colour** — captured but not diffed
  (add if a screen needs them).

So: differ report → 0 unexplained is necessary, not sufficient. Always finish with
a structural present/absent pass (Phase 3A/3B) + a screenshot for the visual
classes above (shadow depth, icon glyphs, spacing rhythm, overlaps).

## Companion differs & conversion — closing the structural blind spots

`diff.mjs` is text-probe + computed-style: it is blind to layout, missing/extra nodes,
content/data gaps, and standalone visuals (above). Four companion scripts close those —
**run the first three BEFORE `diff.mjs`** (structure before styling); a green `diff.mjs`
is not a section verdict until structure + content are also clean. Full playbook:
`../../references/structure-and-content-diff.md` and `../../references/mechanical-conversion.md`.

- **`structure-diff.mjs`** — the LAYOUT/STRUCTURE differ. Consumes two `extract-mock` dumps
  (same viewport); matches by `fid` → text+tag → structural path; writes `structure-report.md`
  + a `.json` sidecar with: **❌ layout mismatches** (grid-column **count**, flex-direction,
  gap, wrap, justify/align on matched containers), **◑ child-count diffs**, **⊖ MISSING**
  (in mock, absent in target — a missing icon/divider/badge/tile), **⊕ EXTRA** (target-only).
  `--anchor "<text>"` scopes to one section. This is the fix for a 2×2-rendered-1×4 grid, a
  row-vs-column flip, a missing icon — none of which `diff.mjs` can see.
  `node structure-diff.mjs --mock ref.json --app target.json [--anchor "…"] [--out structure-report.md]`
- **`content-diff.mjs`** — text/CONTENT diff (LCS over ordered visible text). Writes
  `content-report.md`: **◑ label-length mismatches** (same element, longer/shorter text — a
  DATA/derivation bug like SEO-titles-vs-short-labels), **⊖ mock-only** (missing copy), **⊕
  app-only** (extra copy). Separates content/data gaps (fix in the content pipeline/DB seed,
  not CSS) from presentation. `node content-diff.mjs --mock ref.json --app target.json [--out content-report.md]`
- **`overlay.mjs`** — zero-dep visual pixel-overlay. Reads two PNGs, writes a self-contained
  `overlay.html` with a `mix-blend-mode:difference` view (identical → black, divergence →
  bright edges), an opacity-fade slider, and side-by-side. Open it in a browser and screenshot
  it — the TRIGGER to go measure a region, never proof of a match.
  `node overlay.mjs --ref ref.png --app target.png [--out overlay.html]`
- **`capture-subtree.js` + `to-stylex.mjs`** — the "lift the HTML and render it in React" path
  for DECORATIVE/non-editable sections (a hero illustration, a stat panel) — pixel-exact + fast
  vs hand-rebuilding from a screenshot. `capture-subtree.js` (browser eval, `MF_CAPTURE_SELECTOR`)
  lifts a rendered subtree with computed styles inlined → `{html, tree}`. `to-stylex.mjs` emits
  EITHER `--mode embed` (renders the lifted HTML via `dangerouslySetInnerHTML` — pixel-exact,
  static/decorative only; the generated file carries a build-time-static security note) OR
  `--mode stylex` (a StyleX skeleton DRAFT, mapping values to tokens with `--tokens tokens.json`,
  flagging un-mapped values `/* TODO: no token */`). Choose by editability. Playbook:
  `../../references/mechanical-conversion.md`.

## Known false-positive patterns (over-reporting — recognise, don't chase)

The blind spots above are *under*-reporting (real defects the differ misses).
These are the opposite — rows the differ flags that are **not** defects. Recognise
them so you neither chase a phantom nor blanket-dismiss a real one:

- **Element-vs-container box (largely fixed; watch the residual).** When a mock
  label sits *directly* on a styled element (a `.btn`/`.badge` span whose
  directText IS the label), the box to compare is that element. The differ now
  checks the text node's own box first (self-before-parent) so a button compares
  against a button — but if you still see a box row reading *"target = the
  element's own bg/radius/pad, mock = a parent card (radius 12, pad 0)"*, that's a
  residual of this asymmetry: trust the matched **text** props and eye-check the
  element's box rather than "fixing" it to the card's values.
- **Repeated short text collides across roles.** The differ matches the first app
  node with the same text, so a short label that appears in several roles — e.g.
  `10-Q` as a *filter chip*, a *card badge*, AND a *glossary bold-span* — gets
  paired with the wrong sibling (mock badge ↔ app chip). **Tell:** ONE short
  repeated string producing a *burst* of font + box mismatches with wildly
  different values is a role collision, not N separate defects. Find the app
  element for the role the mock probe actually came from and verify that one by eye.
- **Text-inset behind a leading icon/affordance.** A label that sits *after* a
  leading icon (a badge, an icon-led row) is measured at the inner text's x (after
  the icon) on the app side, while the mock may carry the text on the container
  span and measure at the container edge. A `left-inset` off by ≈ icon-width + gap
  is this, not a gutter defect — the container starts at the same gutter on both.
- **Guardrail-honest divergence.** When the mock fabricates specifics the target's
  product guardrails forbid (a made-up "200 pages", "every figure traced to
  filings", a fabricated AI summary), the target *should* diverge to honest copy —
  this shows up as ⚠︎-unmatched mock text and is an **intentional** divergence, not
  a defect. (Classify it like real-data/native-chrome: a recorded product decision,
  not "probably fine".)

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
