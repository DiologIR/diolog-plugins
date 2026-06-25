# `analyze.js` — the single-script analyzer + differ (the new path)

`analyze.js` REPLACES the three-file two-step pipeline (`extract-mock.js` → `diff.mjs` +
`structure-diff.mjs`). It is ONE self-contained, eval-injectable **browser** IIFE — no Node, no
imports — that runs via `playwright-cli eval` and returns a **JSON string**. The agent's logic
acts on the returned JSON directly; there is no intermediate Node diff step and no JSON
round-trip between scripts.

> The old three files are kept for ONE version as a **deprecated fallback** (each carries a
> deprecation header). Nothing in-flight breaks, but new work uses `analyze.js`.

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
      "class": "gradient",                   // geometry|font|container-bg|border|shadow|gradient|layout|structure|rhythm|value|transform|pseudo|animation|wrap|icon|spacing|media|fonts|screen-bg|extra|interaction|responsive
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
unreliable for this Framer↔StyleX pair).

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
**structure-diff** pass (grid-columns, child-count, MISSING in-mock, EXTRA target-only).
