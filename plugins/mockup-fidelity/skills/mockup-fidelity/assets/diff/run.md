# `analyze.js` — the single-script analyzer + differ (the new path)

`analyze.js` REPLACES the three-file two-step pipeline (`extract-mock.js` → `diff.mjs` +
`structure-diff.mjs`). It is ONE self-contained, eval-injectable **browser** IIFE — no Node, no
imports — that runs via `playwright-cli eval` and returns a **JSON string**. The agent's logic
acts on the returned JSON directly; there is no intermediate Node diff step and no JSON
round-trip between scripts.

> The old three files are kept for ONE version as a **deprecated fallback** (each carries a
> deprecation header). Nothing in-flight breaks, but new work uses `analyze.js`.

> ## ➜ v2.5.0: the `capture.mjs` HARNESS — the RASTER + CDP-rendered-font layer
>
> For web↔web, **prefer the `capture.mjs` harness over the raw `playwright-cli eval` flow below.** It is a
> Node orchestrator (`playwright-core` + `odiff-bin`) that injects THIS `analyze.js` verbatim (MODE A on the
> reference, MODE B on the target — the injectable contract is **unchanged**) AND adds the three RENDERED
> signals a `getComputedStyle` dump structurally cannot give you:
> 1. **CDP rendered-font** — per visible text node it calls `CSS.getPlatformFontsForNode` and records the
>    *genuinely-rendered* typeface (`familyName` + `isCustomFont`). Live can resolve to its loaded web font
>    (`Inter Medium`, custom) while the target falls back to the system face (`Helvetica`, not custom) even
>    though `getComputedStyle` font-family lists Inter first on BOTH sides. **This is the trustworthy font
>    signal** — `analyze.js`'s DOM-span probe approximates it, CDP measures it.
> 2. **element-scoped raster diff (odiff)** — a full-page screenshot per side; each PAIRED element is cropped
>    by its bbox and the two crops run through `odiff`. A same-size box with a high pixel-diff and no other
>    finding is a *rendering anomaly* — a **missing decorative child** (a trailing → svg, a divider, an icon),
>    an occlusion, or a paint difference the DOM passes are blind to.
> 3. **IoU text-less pairing** — after text/structure pairing, remaining text-less nodes (bare svg/icon/
>    decorative div) are paired across sides by bbox Intersection-over-Union ≥ 0.9, so an arrow/icon becomes a
>    raster-checkable pair.
>
> ```bash
> npm install            # in assets/diff — installs odiff-bin@4.3.8 + playwright-core@1.61.1 (no browser DL,
>                        # reuses the host ms-playwright chromium cache; clean & fast, no node-gyp)
> node capture.mjs --ref https://diolog.app/ --target http://diolog.site/ --out ./mf-home --width 1280 --height 2000
> #   → ./mf-home/target.findings.json  — the analyze.js findings ENRICHED with renderedFont + raster blocks
> #     and summary.layers; plus reference.analysis.json, {reference,target}.fonts.json, *.full.png, raster/*.png
> ```
>
> Read the enriched findings exactly like the MODE-B shape below, plus the new `class:"font"
> property:"cdp-rendered-font"` and `class:"raster" property:"element-raster-diff"` rows and `summary.layers`.
> Full flag list + classification + the font-hinting note are in [§ v2.5.0](#v250--raster-layer--cdp-rendered-font--iou-text-less-pairing--systematic-pseudo).
> The raw `playwright-cli eval` flow below still works and remains correct for the responsive multi-width
> capture and for RN-adjacent cases the harness doesn't cover; the harness is the web↔web default because the
> CDP font path and a real headless screenshot are unreachable through the `playwright-cli` wrapper.

## The architecture

> *A script injected into the page performs a full analysis AND diff; the skill's logic uses the
> output to determine what to change.*

`analyze.js` has two MODES, selected by whether a reference analysis is present on `globalThis`:

- **MODE A** (`globalThis.__MF_REFERENCE__` absent / null): capture and RETURN the full
  **analysis** of the current page — the union of everything `extract-mock.js` captured plus
  every per-element field the detectors need (`comp`, `glyph`, `wrap`, `hardBreak`, `lines`,
  `bgLayer`, `fullBleedMedia`, `divider`, `hasSvgChild`, `fontRn`, `pseudoContent`, `anims`,
  `fid`, `rect`, …). Shape: `{ title, frame:{w,h,contentH}, fonts, nodes:[…] }`. **Run this on
  the LIVE reference first.**

- **MODE B** (`globalThis.__MF_REFERENCE__` = a MODE-A analysis object): capture the current
  (TARGET) page analysis, then compute the **full diff in-page** across ALL detector classes
  (everything `diff.mjs` + `structure-diff.mjs` did — pairing by stable key/path then geometry
  fallback, repeated-text disambiguation, the non-text container pass, the v1.16 detectors, the
  structure-diff layout/missing/extra pass), and RETURN a structured, prioritised, **actionable**
  result.

### MODE B return shape

```jsonc
{
  "summary": {
    "score": 20,                // 0–100, DISCRIMINATING (v2.0.1): 100·e^(−penalty/900), penalty
                                // weighted high=5 med=2 low=0.5. Never hard-floors to 0 on a full page,
                                // so it ranks pages / tracks progress (near-clean≈85, ~400 findings≈30).
    "totalFindings": 519,
    "bySeverity": { "high": 165, "med": 292, "low": 62 },
    "byClass": { "border": 30, "font": 57, "container-bg": 20, "gradient": 2, "structure": 112,
                 "geometry": 84, "rhythm": 2, "spacing": 69, "media": 1, "icon": 6, "wrap": 32,
                 "shadow": 2, "value": 2, "transform": 1, "pseudo": 4, "animation": 2, "extra": 60,
                 "interaction": 12, "responsive": 21 },          // ← v2.0.0 classes
    "frame": { "reference": {…}, "target": {…}, "sameViewport": true, "geometry": true }
  },
  "findings": [
    {
      "id": "mf1",
      "locator": "text \"Book a demo\"  ·  a.framer-xxx  ·  @540,17 97×40",  // human + best-effort CSS/text locator for the TARGET element
      "section": "Compliance coverage",      // nearest section eyebrow/heading
      "class": "gradient",                   // geometry|font|container-bg|border|shadow|gradient|layout|structure|rhythm|value|transform|pseudo|animation|wrap|icon|spacing|media|fonts|screen-bg|extra|interaction|responsive|position
      "property": "bg-media-layer",
      "target": "none",
      "reference": "img",
      "deltaPx": 17,                          // present where a pixel delta is meaningful
      "severity": "high",                     // high|med|low
      "suggestedChange": "add the full-bleed img gradient/media layer to this container (FLAT on target)"
    }
  ],
  "noiseExcluded": {                                  // confident NOISE kept OUT of findings/total/score
    "repeatedTextMispairs": [ { "text": "diolog", "chosenY": 23, "otherCount": 1 } ],
    "illustrationInternals": [ … ],
    "unpairedSameText":   [ { "side": "target", "text": "…", "tag": "div", "y": 412 } ],  // v2.0.1
    "crossDomStructure":  [ { "detector": "layout", "candidates": 40, "paired": 0, "unpaired": 40 } ]  // v2.0.1
  },
  "analysis": { /* the full TARGET analysis (so you can re-diff or inspect without re-measuring) */ }
}
```

Findings are **sorted** high→low severity, then by `deltaPx`. Repeated-text mispairs and unpaired
illustration internals are kept OUT of `findings` (in `noiseExcluded`); a single repeating root
cause (e.g. every `<li>` missing the same `•`) is deduped to a few rows plus one `[×N elements]`
summary finding.

## Options (`globalThis.__MF_OPTS__`)

```jsonc
{
  "frameSelector": "#screen .scr",   // a CSS selector for the frame root (a React/StyleX screen root)
  "frameTitle": "Discover · home",   // OR a figcaption substring (HTML gallery)
  "frameIndex": 13,                  // OR a 1-based gallery ordinal
  "frameContainer": "figure, .frame", "captionSelector": "figcaption, .cap",
  "chromeSelector": "__none__",      // WEB↔WEB: set to "__none__" so the app nav/header IS measured (it is content on both sides). Default skip-list is RN native chrome.
  "geom": true,                      // force geometry on/off (auto-on when frames match within 5%)
  "geomTolCenter": 6, "geomTolSize": 10, "geomTolHeight": 2
}
```

## The flow

```bash
# (1) MODE A on the LIVE reference → reference.json
playwright-cli open "https://diolog.app/"               # the LIVE rendered site, NOT a re-served scrape
playwright-cli resize 1280 2000                          # same viewport both sides
playwright-cli eval "() => { globalThis.__MF_OPTS__ = { chromeSelector: '__none__' }; globalThis.__MF_REFERENCE__ = null; return 'a'; }"
playwright-cli eval "$(cat analyze.js)" --filename reference.json   # returns the analysis (a double-encoded JSON string)

# (2) On the TARGET: set window.__MF_REFERENCE__ = <reference.json>, then eval analyze.js → findings
#     reference.json holds a (double-encoded) JSON string — un-double-encode before injecting.
node -e 'const fs=require("fs");let v=JSON.parse(fs.readFileSync("reference.json","utf8"));if(typeof v==="string")v=JSON.parse(v);fs.writeFileSync("__setref.js","() => { globalThis.__MF_OPTS__ = { chromeSelector: \"__none__\" }; globalThis.__MF_REFERENCE__ = "+JSON.stringify(v)+"; return \"r\"; }")'
playwright-cli open "http://diolog.site/"
playwright-cli resize 1280 2000
playwright-cli eval "$(cat __setref.js)"                 # injects the reference object
playwright-cli eval "$(cat analyze.js)" --filename findings.json   # MODE B → the actionable findings

# (3) The agent reads findings.json and applies each finding's suggestedChange.
node -e 'let v=JSON.parse(require("fs").readFileSync("findings.json","utf8"));if(typeof v==="string")v=JSON.parse(v);console.log("score",v.summary.score,"·",v.summary.totalFindings,"findings");v.findings.filter(f=>f.severity==="high").slice(0,40).forEach(f=>console.log("["+f.severity+"] "+f.class+"/"+f.property+" @ "+(f.section||"-")+" :: "+f.suggestedChange))'
```

Helper scripts `run-mode-a.sh <url> <out.json>` and `run-mode-b.sh <target-url> <ref.json>
<out.json>` (used to validate) wrap exactly these steps.

## v2.0.0 — INTERACTION STATES + RESPONSIVE

`analyze.js` v2.0.0 adds two detector classes. **Both are automatic** — no new flags for
interaction; one extra global pair for responsive.

### `interaction` — `:hover` / `:focus` / `:focus-visible` / `:active`

MODE A now reads `document.styleSheets` for every interactive element (`a, button, input, select,
textarea, summary, [role=button|link|tab|menuitem], [tabindex], [onclick]`, or `cursor:pointer`),
finds the rules whose `selectorText` carries an interaction pseudo, strips the pseudo, runs
`element.matches(base)`, and folds the matching rules' VISUAL declarations (background/color/
border/box-shadow/outline/opacity/transform/text-decoration/filter) into an override-set per
state — captured on the node as `istates`. MODE B pairs interactive elements (text+tag → nearest
geometry) and diffs the hover/focus override-sets → findings `interaction/hover-bg`,
`interaction/hover-color`, `interaction/hover-underline`, `interaction/focus-outline`, … and an
`interaction/<state>-state` row when one side has a state effect the other wholly lacks. A
repeating identical defect (every nav link missing the same hover) dedups to **3 rows + a
`[×N elements]` summary**.

> **Cross-origin honesty.** Each sheet's `.cssRules` access is `try/catch`ed (a cross-origin
> Framer/CDN `<link>` throws `SecurityError`). Same-origin inline `<style>` (how Framer ships
> diolog.app) IS readable. If EVERY sheet on the page is unreadable, the node records
> `istates.states === 'unreadable'` and the differ emits ONE low-severity
> `interaction/states-unreadable` finding (and no false state-diffs) — never a silent "matches".

The interaction pass needs **no extra runner steps**: it rides on the MODE-A capture and the
normal MODE-B diff above. Just make sure the reference is the LIVE same-origin URL so its
hover/focus rules are readable.

### `responsive` — per-width findings + desktop→mobile TRANSITION divergence

The runner extracts BOTH sides at **`WIDTHS=[390, 768, 1280]`** (MODE A each), then hands the
final MODE-B run the reference + target analyses keyed by width via two globals. `analyze.js`
then (a) computes, for KEY CONTAINERS (flex/grid boxes, `<nav>`/`<header>`, card grids), the
1280→390 layout TRANSITION per side (`display` / `flex-direction` / grid track-count) and flags
where the two sides' transitions DIVERGE — `responsive/grid-cols-transition`,
`responsive/flex-direction-transition`, `responsive/nav-hamburger-transition`; and (b) re-diffs
at 390 and 768 and surfaces the highest-signal mobile findings prefixed `responsive/390px-…` /
`responsive/768px-…` (capped per width so the 1280 set stays the centre of gravity).

#### Exact runner commands

```bash
# ── (1) MODE A on BOTH sides at all three widths ───────────────────────────────
WIDTHS="390 768 1280"
mka () { # url out width
  playwright-cli open "$1"; playwright-cli resize "$3" 4000; sleep 1.5
  playwright-cli eval "() => { globalThis.__MF_OPTS__={chromeSelector:'__none__'};
    globalThis.__MF_REFERENCE__=null; globalThis.__MF_REFERENCE_BYWIDTH__=null;
    globalThis.__MF_TARGET_BYWIDTH__=null; return 'a'; }"
  playwright-cli eval "$(cat analyze.js)" --filename "$2"
}
for w in $WIDTHS; do
  mka "https://diolog.app/"  "home-ref-$w.json" "$w"     # LIVE reference
  mka "http://diolog.site/"  "home-tgt-$w.json" "$w"     # target
done

# ── (2) Inject the 6 captures, then MODE B at 1280 ─────────────────────────────
# The reference + bywidth maps are MULTI-MB → they EXCEED the 1MB argv cap (ARG_MAX), so they
# CANNOT be passed inline via "$(cat …)". Serve them over a CORS-enabled localhost file server
# and fetch() them in a small setref eval (the fetch fits in argv; the payload does not):
node mfserve.js "$PWD" 8799 &                              # tiny CORS static server (assets/diff/mfserve.js)
playwright-cli open "http://diolog.site/"; playwright-cli resize 1280 4000; sleep 1.5
playwright-cli eval "async () => {
  const B='http://localhost:8799/', S='home';
  const ld=async n=>{const r=await fetch(B+n);let v=await r.json();if(typeof v==='string')v=JSON.parse(v);return v;};
  const refBy={}, tgtBy={};
  for (const w of [390,768,1280]) { refBy[w]=await ld(S+'-ref-'+w+'.json'); tgtBy[w]=await ld(S+'-tgt-'+w+'.json'); }
  globalThis.__MF_OPTS__={chromeSelector:'__none__'};
  globalThis.__MF_REFERENCE__=refBy[1280];               // the 1280 single reference (drives the normal diff)
  globalThis.__MF_REFERENCE_BYWIDTH__=refBy;             // {390,768,1280} reference analyses
  globalThis.__MF_TARGET_BYWIDTH__=tgtBy;                // {390,768,1280} target analyses
  return 'set';
}"
playwright-cli eval "$(cat analyze.js)" --filename home-findings.json    # MODE B + interaction + responsive
```

> **Why the localhost fetch, not `$(cat …)`?** A single 1280 reference is already ~1MB and the
> three-width pair is ~6MB — both blow the shell's `ARG_MAX` (1 MB on macOS). `playwright-cli`
> errors with `argument list too long` if you pass the reference inline. The CORS server +
> in-page `fetch()` is the reliable injection path for any reference above a few hundred KB; it
> also keeps each MODE-A file double-encoded (`JSON.parse` twice) exactly as `--filename` wrote it.
> The bundled `mfserve.js` is a ~12-line zero-dep static server that sets
> `Access-Control-Allow-Origin: *`.

`run-mode-b.sh` accepts an optional `--bywidth <slug>` to drive the multi-width capture + fetch
injection automatically.

### Notes for v2.0.0

- **Same three widths on both sides.** `responsive` only runs when `__MF_REFERENCE_BYWIDTH__` AND
  `__MF_TARGET_BYWIDTH__` are both present and share at least the 390 + 1280 entries; otherwise the
  pass is skipped and only the normal 1280 diff (incl. `interaction`) is produced.
- **The per-width sub-diff is re-entrant-guarded** (`diff._inResponsive`) so the 390/768 re-diffs
  do not recursively re-run the responsive pass.
- `viewportW` is now recorded on every MODE-A analysis (the injection viewport), independent of the
  frame's own measured width, so the bywidth maps key cleanly even when a frame is narrower than the
  viewport.

## v2.0.1 — three false-positive FLOOD fixes + a discriminating score

An independent verify found three false-positive floods inflating full-page web↔web totals (home/persona/
legal ~653/792/471, ~25–30 % noise) and flooring the score at 0/100 so it couldn't rank pages. All three
are fixed diff-side (no capture-field change), and the score is rescaled to discriminate.

- **FIX 1 — `rendered-font` is now a CORROBORATED cross-side comparison.** The old per-node canvas
  heuristic (`rendering = wDeclared≠wFallback`) mislabelled ~92 % of target text nodes as "Inter declared,
  not applied" — its own `wNamed` differed from `wFallback` and `document.fonts.check` passed, yet it still
  fired. It now flags ONLY when the REFERENCE renders its named face but the TARGET genuinely falls back,
  **corroborated** by either `document.fonts.check === false` for the declared family OR the target's
  `wNamed ≈ wFallback` (named face has no distinct metrics) AND that metric distinctly ≠ the reference's
  `wNamed`. It is SUPPRESSED whenever the target's `wNamed` is distinct from the fallback (the face IS
  applied). `fonts.check` is used only as a positive corroborator (when false), never as a suppressor (it
  is unreliable both ways). Net: rendered-font flood 39/33/97 → 0 on these pages, while it still catches a
  genuine site-wide fallback (proven by unit cases B/C).
- **FIX 2 — backdrop comparison uses the EFFECTIVE backdrop on each side.** A section's full-bleed
  gradient/media may be a full-bleed `<img>` child (`fullBleedMedia`) **or** a CSS `background-image`
  (gradient / `url()`) on the element itself. `effectiveBackdrop(node)` returns whichever is present, so a
  `bg-media-layer absent` is emitted ONLY when one side has a backdrop and the other has NONE. When both
  sides have a backdrop but they differ (e.g. mock `img` vs target `css-gradient`), it emits a lower-severity
  `value/backdrop-differs` instead of a false "FLAT/absent". (Killed the false Hero `bg-media-layer absent`
  while RETAINING the genuine flat CTA-band gradient finding.)
- **FIX 3 — structure pairing phantoms.** A text string present on BOTH sides that the fid→text→path
  matcher failed to pair was reported as BOTH `missing` (mock) and `extra` (target). `buildMatch` now adds a
  **normalised-text fallback pairing IGNORING TAG, by nearest frame-normalised Y**, which pairs same-text
  nodes the path matcher missed. Any residual `missing`/`extra` whose text still exists on the other side is
  routed to `noiseExcluded.unpairedSameText` (NOT a real absence). Cross-DOM layout pairing health (the
  `layout` class pairs 0 of N wide containers across Framer↔StyleX) is logged to
  `noiseExcluded.crossDomStructure`. After the fix every remaining `missing`/`extra` is a CONFIDENT,
  genuine absence (0 same-text phantoms verified on home/persona/legal).
- **Discriminating score.** `score = round(100·e^(−penalty/900))` (penalty weighted high=5 med=2 low=0.5),
  replacing the `100 − penalty` cliff that hit 0 for any full page. Near-clean ≈ 85, a genuine ~400-finding
  page ≈ 30, a very-divergent page ≈ 9 — monotonic, never hard-floored, so it ranks pages and tracks fixes.

`noiseExcluded` now carries four buckets — `repeatedTextMispairs`, `illustrationInternals`,
`unpairedSameText`, `crossDomStructure` — all kept OUT of `findings` / `totalFindings` / `score` so the
headline reflects only CONFIDENT findings. Consumers can inspect each bucket separately (e.g. to eye-check a
same-text node the matcher couldn't confidently pair, or to see that the layout class is structurally
unreliable for this Framer↔StyleX pair). As of v2.3.0, `illustrationInternals` also collects the SUPPRESSED
placeholder-text entries for product-mockup internals (a different demo ticker/number) — only the differing
STRING is bucketed here; the internals' STYLE is still compared (see § *v2.3.0*).

Verified before→after (MODE B, ref=`https://diolog.app/`, target=`http://diolog.site/`): home 653→519
(score 0→20), persona 792→704 (0→12), legal 471→327 (0→36). Real high-severity findings retained:
flat hero/CTA gradient, flat-vs-rounded card radius, the responsive `flex-direction-transition`, missing
`•` bullets / `counter(list-item)` markers, the swapped-tint `value` rows, and all `interaction` hover/focus
rows. `node --check` clean.

## v2.0.2 — DOM-span rendered-font + glyph-based button-arrow (two unreliable detectors replaced)

Two detector checks were unreliable in opposite ways; both are replaced with a RENDERED-DOM measurement.

- **FIX 1 — `rendered-font` now uses a DOM-SPAN probe, not canvas.** The old check measured the probe
  string with `canvas.measureText`, which IGNORES `unicode-range` subsetting and does NOT reproduce the
  browser's real DOM font-matching cascade — so it over/under-fired and MISSED a genuine DOM-level
  fallback (a registered face the page never actually applies — the site-wide Inter-400 fallback class).
  MODE A's `capture()` now lays out a hidden `<span>` of the probe string TWICE per distinct
  `(firstFamily, weight, style, fontSize)` combo used by text nodes — once `font-family:'<Named>', monospace`
  and once `font-family:monospace`, then repeats against `serif` — and measures both widths.
  `width(named+fallback) === width(fallback)` for BOTH fallbacks ⇒ the named family is NOT applying (real
  DOM fallback); distinct from at least one ⇒ it applies. Each combo records `applies:true/false`; each
  text node is tagged with whether its declared family actually renders. `capture()` awaits
  `document.fonts.ready` first so it measures the FINAL faces. MODE B emits a high-severity
  `font/rendered-font` finding ONLY when the two sides DISAGREE — the REFERENCE applies its named family
  for a matched element's combo but the TARGET falls back (or vice-versa); both-apply / both-fall-back →
  no finding. This catches the Inter-400 fallback class and does NOT flood on correctly-rendered nodes
  (validated: a page where the named font genuinely applies → 0 findings; a controlled @font-face-not-loaded
  fallback → fires high on every affected text node).
- **FIX 2 — button-arrow is GLYPH-based, not svg-presence.** The old check flagged on the mere presence of
  an `<svg>` child, so a decorative/hidden svg read as a match while a genuinely VISIBLE arrow that one side
  lacked read as fine. `capture()` now records `arrowGlyph` on each button/link — the RENDERED union-path
  bbox (w&h in px) of its TRAILING svg (reusing the icon-glyph bbox technique; w>0 AND h>0 ⇒ a visible
  arrow is actually drawn; a hidden/empty/`display:none` svg yields null). MODE B (with the repeated-text
  disambiguation that pairs the cta-band button to its true counterpart) emits an `structure/button-arrow(glyph)`
  finding when one side draws a visible trailing arrow glyph the other does not — with the measured glyph
  size — plus an `icon/button-arrow-glyph-size` row when both draw an arrow but the glyph size differs.

Both fixes are capture-side + diff-side; `node --check` clean. Validated on controlled fixtures (font-applies
vs forced-fallback; arrow-present vs arrow-absent).

> **`capture()` is now async** (it awaits `document.fonts.ready`), so the injected IIFE is
> `(async function(){…})()` and resolves to the JSON string. `playwright-cli eval` awaits the returned
> promise transparently — no runner change needed.

## v2.1.0 — RENDERED-GLYPH-SHAPE / font-feature-effectiveness detector

A whole defect class survived every prior check: a requested OpenType feature (a `cvXX` character variant
like **cv11** single-story `a`, `ssXX`, `onum` old-style figures, …) that is DECLARED and whose family
APPLIES (not a fallback) but that has NO EFFECT because the self-hosted woff2 is a **SUBSET that STRIPPED
that feature's glyph**. The real homepage bug: body text declared `font-feature-settings:"cv11"` and
"applied" Inter 15px/400 IDENTICALLY to live, and the controlled DOM-span width was identical
(144.91 = 144.91) — yet the target rendered the **double-story** `a` while live rendered the **single-story**
`a`, because the subset Inter woff2 lacked the cv11 glyph. Single- vs double-story `a` are the **SAME WIDTH**,
so width / DOM-span / glyph-extent checks are structurally blind — only the rasterised glyph **SHAPE** sees it.

`analyze.js` `capture()` records each text node's requested `font-feature-settings` (`featReq`) and runs a
per-side SELF-CHECK: for each distinct `(family, weight, style, size, ffs)` combo, render a feature-sensitive
probe (`a g l 0 1 ffi`) TWICE in the element's exact computed font — once WITH the requested ffs, once with
`normal` — and test whether the GLYPH SHAPE differs (width is NOT enough; cv11 is same-width). **WITH==WITHOUT
(no pixel difference, ink present) ⇒ the requested feature is INEFFECTIVE (the font lacks the glyph).** MODE B
emits a high `font/feature-ineffective` finding for each ineffective requested feature on the target, and
ESCALATES (names the reference) when the REFERENCE's same feature IS effective but the target's is not.

### The rasterisation mechanism is TESTED, not assumed

`capture()` probes `'fontFeatureSettings' in ctx` (CanvasRenderingContext2D) at runtime:

- **canvas supported → fully IN-PAGE.** It draws both variants to a canvas with the loaded document font and
  compares `getImageData` pixel hashes; `featureCheck.combos[].effective` is resolved in the analysis itself,
  **no runner step**.
- **canvas NOT supported (current Chromium) → RUNNER-assisted.** An SVG-`<img>` rasteriser cannot see the
  page's loaded `@font-face` faces, so `capture()` instead mounts persistent on-screen probe-PAIR nodes
  (`data-mf-fprobe`, the requested-ffs row directly above the `normal` row, same family/size/weight, parked at
  the viewport origin and mounted AFTER the node walk so they never enter `analysis.nodes` / become `extra`
  findings) and records each pair's on/off rects in `analysis.featureCheck.probes`. You then **screenshot the
  page and pixel-diff the pairs**.

#### Exact runner commands (canvas-unsupported path)

```bash
# (1) MODE A on BOTH sides — capture() mounts the probe host; screenshot the page WHILE it is mounted.
mka_feat () { # url out png
  playwright-cli open "$1"; playwright-cli resize 1280 2000; sleep 1.5
  playwright-cli eval "() => { globalThis.__MF_OPTS__={chromeSelector:'__none__'}; globalThis.__MF_REFERENCE__=null; return 'a'; }"
  playwright-cli eval "$(cat analyze.js)" --raw > "$2"     # analysis JSON (has featureCheck.probes)
  playwright-cli screenshot --filename "$3"                # probe host still mounted → screenshot
}
mka_feat "https://diolog.app/"  reference.json  ref-page.png   # LIVE reference
mka_feat "http://diolog.site/"  target.json     tgt-page.png   # target

# (2) Pixel-diff each on/off probe pair → per-side { key, effective } verdicts.
node feature-check.mjs --analysis reference.json --png ref-page.png --out ref-featdiffs.json
node feature-check.mjs --analysis target.json    --png tgt-page.png --out tgt-featdiffs.json
#   effective:false  = the requested feature has NO effect (subset font lacks the glyph) — the defect.

# (3) Inject the verdicts (per side) and run MODE B — it folds them into featureCheck.combos[].effective
#     before diffing and emits the font/feature-ineffective finding (escalated when ref is effective).
node -e 'const fs=require("fs");let ref=JSON.parse(fs.readFileSync("reference.json","utf8"));if(typeof ref==="string")ref=JSON.parse(ref);
  const rFD=JSON.parse(fs.readFileSync("ref-featdiffs.json","utf8")), tFD=JSON.parse(fs.readFileSync("tgt-featdiffs.json","utf8"));
  const diffs={reference:rFD.map(v=>({key:v.key,effective:v.effective})), target:tFD.map(v=>({key:v.key,effective:v.effective}))};
  fs.writeFileSync("__setref.js","() => { globalThis.__MF_OPTS__={chromeSelector:\"__none__\"}; globalThis.__MF_REFERENCE__="+JSON.stringify(ref)+"; globalThis.__MF_FEATURE_DIFFS__="+JSON.stringify(diffs)+"; return \"r\"; }")'
playwright-cli open "http://diolog.site/"; playwright-cli resize 1280 2000; sleep 1.5
playwright-cli eval "$(cat __setref.js)"
playwright-cli eval "$(cat analyze.js)" --raw > findings.json     # MODE B with feature-effectiveness resolved
```

> **Honest "unresolved" note, never a silent pass.** If canvas is unsupported AND no
> `globalThis.__MF_FEATURE_DIFFS__` was injected, MODE B emits ONE low `font/feature-check-pending` row
> naming how many requested feature combos still need the runner pixel-diff — so an un-run self-check can't be
> mistaken for "all features effective". When canvas IS supported the whole check is in-page and this note
> never appears.

> **Same-viewport / same-DPR.** `feature-check.mjs` reads `featureCheck.dpr` (recorded at capture) and scales
> the probe rects to screenshot pixels; pass `--dpr N` to override. The probe pairs are tiny (a few 240×30px
> rows at the viewport origin), so the page screenshot already contains them.

### Notes

- **`playwright-cli eval` echoes the script source to stdout** — that's harmless noise. The real
  return value lands in the `--filename` file (a double-encoded JSON string; `JSON.parse` twice).
  **CAVEAT (some playwright-cli builds):** `--filename` may run the eval in a FRESH page context that
  LOSES globals set by a prior `eval` — so the MODE-B `__MF_REFERENCE__` injection is dropped and
  `analyze.js` falls back to MODE A. If your findings file comes out as a `{title,viewportW,…,nodes}`
  analysis (MODE A) instead of `{summary,findings,…}`, use `--raw` instead of `--filename` (it echoes the
  same double-encoded JSON to stdout AND preserves globals): `playwright-cli eval "$(cat analyze.js)" --raw > findings.json`.
- **Same viewport on both sides** so absolute geometry (center-x/width/height) compares
  like-for-like; geometry auto-enables when the two frames match within 5%.
- **Reference the LIVE URL, never a re-served scrape** — a runtime-hydrated framework (Framer,
  any SPA) resolves a different variant off-origin. `analyze.js` runs fine against `https://…`.
- **`data-fid` anchoring** still works: put the same `data-fid` (or `data-fidelity-id` /
  `data-testid`) on the matching reference + target nodes to make a region's pairing exact.

## v2.2.0 — FONT-METRIC / VERSION detector (rendered-width-ratio)

A class survived even the v2.1.0 glyph-shape check: a real homepage case-study body ("Beyond any single draft
or reply…") with IDENTICAL declared font props on both sides — Inter, 18px, weight 400, letter-spacing
−0.36px, line-height 27.9px, container width 507px — and the family APPLIES on both, yet LIVE wraps to 4 lines
(height 112) while the TARGET wraps to 3 lines (height 84). The cause: the exact text renders ~636px on live
vs ~625px on target — the target self-hosts a DIFFERENT VERSION of Inter (rsms v4, ≈1.8% NARROWER than live's
Google Inter v20) at the same size. The differ's (height-aware) line-count check flagged the SYMPTOM but never
the ROOT CAUSE: same family + size, consistently different rendered WIDTH ⇒ a different font version/metrics.

Unlike the cv11 case (#31, a same-WIDTH letterform), this IS a width difference, so it is measured directly
IN-PAGE — **no runner step**:

- `capture()` records each text node's `exactW` — the node's own text (capped ~80 chars) laid out nowrap in an
  offscreen span using the element's EXACT computed font (family, weight, style, size, letter-spacing,
  word-spacing, font-feature-settings).
- MODE B, per MATCHED text element where the SAME first font-family applies on BOTH sides, computes the width
  RATIO `target/reference` and accumulates it per family. A font-VERSION mismatch is UNIFORM (every element in
  that family shows ~the same ratio), so it aggregates per family — **median over ≥3 samples, with a
  ≥70%-same-direction consistency guard** — and emits ONE high `font/rendered-width-ratio` finding per family
  when the median deviates from 1.0 by more than `0.7%` (the real case is ~1.8%; a sub-pixel single-element diff
  does NOT fire). Deduped to per-family — **no per-element flood**.
- The finding's `suggestedChange`: self-host the SAME font VERSION the reference uses (e.g. Google Inter v20 ≈
  rsms Inter v3.19, NOT v4). The height-aware line-count finding (line-count differs AND box heights differ) is
  emitted as a confident HIGH row with the height `deltaPx` and points at this width-ratio root cause — it is a
  REAL wrap divergence, never bucketed into `noiseExcluded`.

This rides the normal MODE-A/B flow — no new flags, no runner. Just capture both sides with the same analyze.js
(so both carry `exactW`); an OLD capture without `exactW` makes the detector a clean no-op.

> **Validation (controlled fixtures).** Render the case-study string under the SAME `'Inter'` @font-face name
> with two different font files: rsms Inter v4 vs Google/rsms Inter v3.19. Cross-version (v3.19 ref → v4 target)
> → median width ratio **0.980** (~2% narrower) across the matched body elements ⇒ ONE high
> `font/rendered-width-ratio` finding. Same-version (v3.19 → v3.19) → median **1.0000** ⇒ NO finding. On the
> now-fixed live home (v3.19 = Google Inter) the detector fires **0** times — no false positive.

## v2.3.0 — narrow the illustration-internal exclusion (suppress placeholder TEXT, still STYLE-check)

The illustration-internal exclusion (the principle behind #21) was TOO BROAD. It was meant to stop the differ
flooding on a product mockup's PLACEHOLDER CONTENT (fake tickers, demo numbers) — but it dropped illustration
internals ENTIRELY, so their real STYLING went uncompared and a real homepage defect went UNCHECKED. Inside the
ReadinessMockup "Morrow Vale Resources" product illustration, a row label ("Announcement drafts") had
`letter-spacing: normal` vs live's `-0.3px`, and the card had NO border vs live's `1px #e5e9f0` (drawn on the
card's `::after` fold). The exclusion conflated "placeholder TEXT content (legitimately differs)" with
"computed STYLE (real, checkable)". v2.3.0 SPLITS them — it rides the normal MODE-A/B flow, no new flags.

- **Illustration ROOT detection (MODE B).** Per side, an illustration root = a sizeable, styled, text-less-at-
  its-own-level mockup card (the SAME geometry heuristic the media-rel-y #21 pass uses for `isMockupCard`) OR a
  class-hinted container (`mockup`/`illustration`/`readiness`/`product`/`preview`/`device`/`screenshot`/`demo`/
  `placeholder`) of non-trivial size that is NOT full-bleed (a full-bleed section is a real section, not an
  illustration). Every DESCENDANT index is marked an illustration-internal; the ROOT itself is NOT (its own
  border/bg stays with the normal container pass).
- **Suppress the TEXT, keep the STYLE.** An illustration-internal TEXT node that the structure pass would report
  as `missing`/`extra` or the unmatched pass as `wrong-state` is routed to `noiseExcluded.illustrationInternals`
  instead of `findings` (a different demo ticker/number is not a finding). A VISUAL internal (icon/divider/tile,
  no text) is still kept — a missing illustration sub-shape IS a real structural defect.
- **Illustration-internal STYLE pass.** Pairs internals across sides BY POSITION/STRUCTURE (relative offset
  inside the root + tag — NOT text, which is placeholder and differs) and compares the COMPUTED STYLE: border
  (incl. the folded `::after`/`::before`), border-radius, box-shadow, background/text colour, letter-spacing,
  font-size/weight/family, padding, geometry → `border/illo-border-width`·`illo-border-color`·`illo-border-radius`,
  `shadow/illo-box-shadow`, `container-bg/illo-background`, `font/illo-color`·`illo-letter-spacing`·
  `illo-font-size`·`illo-font-weight`·`illo-font-family-kind`, `spacing/illo-pad-left`·`illo-pad-top`,
  `geometry/illo-width`·`illo-height`. DEDUPED — N identical mockup rows producing the same
  `(property|target|reference)` collapse to ≤3 rows + a `[×N illustration sub-elements]` summary, so the restored
  coverage does not flood.

> **Validation (controlled fixtures).** A broken recreate (ref card border `1px #e5e9f0` + row label `-0.3px`
> vs target border `0` + label `normal`, with placeholder ticker `ASX:MVR`→`ASX:XYZ` + different demo numbers)
> → fires BOTH the border finding AND the letter-spacing finding for the mockup sub-elements, and routes the
> placeholder ticker/numbers to `noiseExcluded.illustrationInternals` (NO content finding). A placeholder-content-
> only diff (`ASX:MVR` vs `ASX:XYZ`, different numbers, identical styling) → ZERO findings. The now-fixed
> identical site → ZERO illustration findings. A text-less internal sub-panel whose border is folded from
> `::after` → `illo-border-width` fires. An ordinary page with NO illustration roots is unaffected (normal font
> findings, zero illo activity). 10/10 controlled assertions pass. See references/issue-to-check-map.md #33.

## v2.4.0 — three detectors for the per-element-move, block-flow-gap, and sub-px line-height blind spots

An empirical recall test (a controlled ReadinessMockup + case-study fixture, ref vs broken) proved v2.3.0
MISSED a per-element move and a block-flow gap, and only weakly caught a sub-px line-height. v2.4.0 adds three
ADDITIVE, low-noise detectors. All ride the normal MODE-A/B flow — no new flags, no runner.

- **`position/rel-offset` — moved without resizing.** For each MATCHED element (shared fid→tag+text→path
  pairing), compute its top RELATIVE TO ITS DIRECT PARENT on each side; if the element's own width AND height
  match (a PURE move, not a reflow) but the relative-in-parent offset differs by > ~4px, emit
  `position/rel-offset {target, reference, deltaPx}`. This catches an element shifted by a flex
  `align-items`/`justify-content`/top-margin change without resizing (the "On track" status case) — a signal
  the parent's `layout/align-items` diff names only obliquely. GUARDS: both parents must themselves pair;
  DEDUP per `(parent|signed-delta)` so a whole column shifting by one delta is ONE finding + a `[×N elements
  in one parent]` summary.
- **`spacing/gap→next-sibling(block-flow)` — block-flow gap on NON-TEXT containers.** The existing
  `gap→/←-sibling` runs only on TEXT-PAIRED nodes; the layout detector only compares flex/grid `gap`. So
  block-flow MARGIN/PADDING spacing between block `<div>` containers (a divided point list, stacked cards)
  was invisible. This runs the SAME geometry-based gap (`next.top − this.bottom`, which INCLUDES margin /
  padding / margin-collapse) on PAIRED block containers and their next sibling, flagging a > ~3px delta —
  only when both boxes pair to the SAME pair on each side. DEDUP repeated identical gaps → ≤3 rows + a `[×N
  block-flow gaps]` summary.
- **Value-based line-height + illustration line-height.** The line-height check now compares the RESOLVED px
  VALUE (each `normal`→~1.2×fs) with a tight ~0.6px tolerance, replacing the `max(2, 0.12·fs)` height-proxy
  floor that swallowed a 0.75px label delta. AND the illustration-internal STYLE pass gained
  `font/illo-line-height` (same resolution + tolerance) so internal text rows are line-height-checked
  directly, not just incidentally via height.

> **Validation (controlled fixtures + real site).** Recreate ref-vs-broken (company letter-spacing, ticker
> line-height, "On track" `align-items` move, status line-height, row-label line-height 0.75px, case-study
> gap 38→33) and run the real MODE A→B flow: **all six fire** — #3 as a per-element `position/rel-offset`
> (d=16, not just the parent align-items), #5 as `font/illo-line-height` + a value-based `font/line-height`,
> #6 as `spacing/gap→next-sibling(block-flow)` (33 vs 38). The IDENTICAL site → **0** findings. On the
> now-fixed live home (`diolog.app`→`diolog.site`) the three checks add **0** `position/rel-offset`, **0**
> block-flow gap, and **5** genuine residual line-height rows (real 0.7–1px button/illustration drift the old
> 2px floor hid — not false positives), so they do NOT flood. `node --check` clean. See
> references/issue-to-check-map.md #34–#36.

## v2.5.0 — RASTER layer + CDP rendered-font + IoU text-less pairing + systematic pseudo

The prior detectors all read `getComputedStyle`. Four classes survive that — and three of them need a
RENDERED measurement a computed-style dump structurally cannot give:

- **The declared font matches but the RENDERED face differs.** `getComputedStyle` reports the same
  `font-family` (Inter first) on both sides, and `document.fonts.check` passes on both — yet live renders its
  loaded web font while the target silently falls back to the system face. The DOM-span probe (#20) is an
  approximation; the ground truth is what the engine actually rasterised.
- **A missing DECORATIVE CHILD passes the structure diff.** The structure pass matches an element when both
  boxes exist; a trailing → svg, a hairline divider, or an icon the target omits *inside* a matched element
  is invisible to it (the element pairs; only its missing child differs).
- **A text-less svg/icon/decorative div is never PAIRED.** `analyze.js` pairs by text + structural path; a
  bare arrow has no text, so it falls into the unpaired pool and is never presence/raster-checked.
- **A pseudo-DRAWN border/overlay that DIFFERS (not just folds).** The capture-side fold copies a pseudo's
  border into the element's `comp` *only when the element itself has none*, and the pseudo-CONTENT detector
  compares the content STRING — neither catches a `::after { border }` that differs across sides, or an
  overlay present on one side only, on an ordinary element.

### (1) The harness — `capture.mjs` (Node: `playwright-core` + `odiff-bin`)

`capture.mjs` is the orchestrator. It launches chromium **with `['--font-render-hinting=none']`** (see the
determinism note), injects `analyze.js` verbatim — MODE A on the reference, MODE B on the target, the
injectable contract **unchanged** — and layers on the three rendered signals, writing one enriched
`target.findings.json`.

```bash
npm install            # in assets/diff
node capture.mjs --ref <refURL|file> --target <targetURL|file> --out <dir> [flags]
```

| flag | default | meaning |
|---|---|---|
| `--ref` / `--target` | — (required) | reference (LIVE URL) and target — a URL or a local file path |
| `--out` | — (required) | artifact directory (created) |
| `--analyze` | `./analyze.js` | path to the analyzer to inject |
| `--width` / `--height` | `1280` / `2000` | viewport (same on both sides) |
| `--frame-selector` / `--frame-title` / `--frame-index` | — | forwarded to `analyze.js __MF_OPTS__` |
| `--chrome-selector` | `__none__` | forwarded — `__none__` so web app chrome IS measured |
| `--iou` | `0.9` | IoU threshold for text-less pairing |
| `--raster-min` | `64` | min element area (px²) to raster-diff (skips 1px slivers) |
| `--raster-max` | `600` | cap on paired elements raster-diffed (runtime guard) |
| `--no-raster` / `--no-fonts` | off | skip a layer |

Outputs in `--out`: `reference.analysis.json` (MODE A), **`target.findings.json`** (MODE B + the v2.5.0
layers), `{reference,target}.fonts.json` (per-text-node CDP fonts), `{reference,target}.full.png` (raster
sources), `raster/pair-N-diff.png` (diff crops for raster findings).

### (2) CDP rendered-font (the headline fix)

Per visible text node the harness gets the genuinely-rendered typeface via the **PROVEN CDP sequence** — the
two non-obvious gotchas are baked in: you can NOT get a usable CDP `objectId` from a Playwright JSHandle
(do the element lookup *inside* a `Runtime.evaluate`, `returnByValue:false`); and you MUST call
`DOM.getDocument` BEFORE `DOM.requestNode` or the `nodeId` is unresolvable. Then
`CSS.getPlatformFontsForNode({nodeId})` returns the actual `{familyName, isCustomFont, glyphCount}`. The font
layer pairs reference↔target nodes by `tag|text` (disambiguating repeated text by nearest bbox) and emits a
high `font/cdp-rendered-font` finding when the rendered `familyName` DIFFERS — **even when `getComputedStyle`
font-family agrees or is a generic**. Deduped per `(declaredFamily|renderedRef|renderedTgt)` — a site-wide
fallback is ONE root cause carrying the `affectedNodes` count. (Observed against the real sites: live's
"See the platform"/"Book a demo" buttons render `Inter Medium` (`isCustomFont:true`) while the target falls
back to `Helvetica`/`Inter`; `getComputedStyle` would have hidden it.)

### (3) Element-scoped raster diff (odiff)

The harness re-derives the MODE-B element pairing (fid → tag+text → structural path, then the IoU text-less
step), crops each paired element from both full-page PNGs by its bbox, and runs **`odiff`** (`compare(...,
{failOnLayoutDiff:false, antialiasing:true})`) on the two crops. Classification per the research:

- **odiff mismatch + same-size box (computed styles match) ⇒ a `raster/element-raster-diff` HIGH finding** —
  a rendering anomaly: a **missing decorative child** (a trailing → svg, a divider, an icon), an occlusion,
  or a paint/glyph difference the DOM passes did not catch. The diff crop path is in `raster.diffImage`.
- **odiff mismatch + size mismatch ⇒ a MED finding** that *corroborates* a geometry/wrap finding `analyze.js`
  already emitted (with the `bboxDelta`).

Only mismatches above a `12%` threshold are emitted (antialiased text edges are suppressed by
`antialiasing:true` and the threshold), so the raster layer does not flood. `odiff` ships prebuilt platform
binaries (incl. `odiff-macos-arm64`), no node-gyp; exit 0 = match, 22 = diff (the Node API returns
`{match, diffPercentage}`).

### (4) IoU bounding-box pairing for text-less nodes

After text/structure pairing, the harness pairs remaining **text-less** mock nodes to remaining text-less app
nodes by **bbox Intersection-over-Union ≥ `--iou` (0.9)** — so a bare arrow/icon/decorative div becomes a
paired candidate the raster + presence layers evaluate. `analyze.js` already captures `getBoundingClientRect`
(`node.rect`, frame-relative) for every node, which is what the IoU pairing consumes. The count surfaces in
`summary.layers.iouTextlessPairs`.

### (5) Systematic pseudo-element extraction (IN `analyze.js`)

`capture()` now records `pseudoStyle` per node — `getComputedStyle(el,'::before')` and `(el,'::after')`:
content, border-width/-color (top+bottom), background + background-image, box-shadow, position, border-radius
— for **every** element whose pseudo actually renders. A MODE-B pass compares it for **every paired element**
(not just illustrations, not only the fold), emitting `border/pseudo-after-border-width`,
`container-bg/pseudo-after-background`, `shadow/pseudo-after-box-shadow`,
`border/pseudo-before-presence`, … — so a pseudo-drawn border/overlay present-on-one-side or differing is
caught universally. Deduped (every card's `::after` border → ≤3 rows + a `[×N elements]` summary).

### Font-render-hinting determinism

The harness launches chromium with `['--font-render-hinting=none']` so glyph rasterisation is stable across
machines, which reduces font-edge false positives in the raster crops. **This does NOT make headless == a
real browser.** A headless renderer can still skew a width number or a raster %; the **CDP rendered-font
check — not any width and not the raster % — is the trustworthy signal for the FONT class.** Treat a raster
% as a TRIGGER to inspect the diff crop, and the rendered-font finding as the authority on whether the right
typeface is actually applied.

### Enriched JSON payload (the "diff-as-instruction" shape)

`target.findings.json` is the normal MODE-B shape with:
- new `findings[]` rows of `class:"font" property:"cdp-rendered-font"` (carrying a `renderedFont:{declaredFamily,
  reference:{familyName,isCustomFont}, target:{…}, affectedNodes}` block) and `class:"raster"
  property:"element-raster-diff"` (carrying `raster:{mismatchPct, classifiedAs, sizeMismatch, refRect, targetRect,
  diffImage}` + `bboxDelta`);
- `summary.layers = { analyze, cdpRenderedFont:{compared,divergent,distinctRootCauses,emitted}, raster:{pairsCompared,
  mismatches,emitted}, iouTextlessPairs }`;
- `renderedFontDetail[]` and `rasterDetail[]` (the full per-pair evidence) alongside `analysis`.

The score is re-computed over the merged set (same `100·e^(−penalty/900)` curve). `node --check` clean.

> **The target dir needs its own `node_modules`.** When the skill copies `assets/diff/*` into a project's
> `.mockup-fidelity/`, run `npm install` there too (the harness imports `playwright-core` + `odiff-bin`).

## Every ported detector (lose none)

`analyze.js` ports **all** of the prior pipeline's detectors. Per-element analysis (MODE A) and
the diff (MODE B):

geometry (center-x / width / height, left/right-inset, row-left/right-inset, button height/width),
`line-height: normal` resolution, **icon-glyph** (path-bbox, position-paired), **text-wrap**
(balance vs wrap), **pseudo-border/shadow fold** (`::after`/`::before` overlay → effective
border/shadow), **hard-break (`<br>`)**, **line-count**, **wrap-point (line-1 text)**,
**gap→/←-sibling**, the **non-text container pass** (bg / full-bleed gradient-media / divider /
border top+bottom / radius / shadow, structural path → tag-agnostic geometry fallback),
**repeated-text disambiguation** (nearest normalised-Y, mispairs → `noiseExcluded`),
**rendered-font** (canvas glyph-metric fallback detection), **media-geometry** (rel-Y vs section
anchor), **screen-background**, **font-faces** (weight-range-synthesis-risk + family-not-loaded),
and the **v1.16** detectors — **(1) layout-structure** (display/flex-direction/wrap/justify/align/
gaps/grid-track-count+ratio), **(2) vertical-rhythm** (doc-height + cumulative-top-drift +
contributors), **(3) value-precision** (shadow-value, gradient signature, precise bg/border colour
deltaE, 4-corner radius), **(4) transform/opacity/filter** (matrix decompose), **(5) pseudo-content**
(`•` / `counter()` / `→` / `url()`, deduped), **(6) animation/transition presence** — plus the
**structure-diff** pass (grid-columns, child-count, MISSING in-mock, EXTRA target-only) — and the **v2.0.0**
**interaction**-state + **responsive** detectors, and the **v2.1.0 rendered-glyph-shape /
font-feature-effectiveness** detector (`font/feature-ineffective` — a requested `cvXX`/`ssXX`/`onum` feature
that the subset webfont renders with NO effect, caught by a glyph-SHAPE pixel comparison, in-page via canvas
`fontFeatureSettings` where supported else via the `feature-check.mjs` runner step), and the **v2.2.0
font-metric / version** detector (`font/rendered-width-ratio` — the SAME family at the SAME size renders a
consistently different WIDTH because the two sides ship a different font VERSION; measured in-page via the
per-node `exactW` exact-text span, aggregated per family, deduped to one finding per family), and the
**v2.4.0** **per-element vertical-offset** (`position/rel-offset` — a matched element MOVED inside its parent
at the same size, deduped per parent), **block-flow gap** (`spacing/gap→next-sibling(block-flow)` — the
margin/padding gap between paired NON-TEXT block containers), and **value-based line-height** (a tight ~0.6px
VALUE comparison + `font/illo-line-height` in the illustration STYLE pass) detectors.
