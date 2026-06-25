# Every miss → its mechanical check

A field log from a long Framer→StyleX clone. Each row is a real difference a human eye caught
that the differ (or the agent driving it) had reported as "matching". The rule the user set:
**the diff script is the objective measure — make it find every difference, no matter how complex.**
Every row below is now a check in `assets/diff/` (or a documented method), so the class can't recur.

| # | What the human saw | Why the differ missed it | The mechanical check (where) |
|---|---|---|---|
| 1 | "Product" nav link ~350px off-centre | only gutter-INSET was checked (frame-width-agnostic); a centred element's absolute position was never compared | **📐 center-x / width** for centred elements — `diff.mjs` geometry block (v1.14.2) |
| 2 | wordmark looked too bold | computed `font-weight` matched (500); the *rendered width* differed (60 vs 58) | **📐 width / height** rendered geometry — `diff.mjs` (v1.14.2) |
| 3 | CTA button 3px short | mock used `line-height: normal` → `px()` returned null → the check was **skipped** | resolve `normal` → ~1.2×font-size before comparing — `diff.mjs` (v1.14.3) |
| 4 | Product chevron too small | a bare `<svg>` has no text → text-probe loop never measured it; its box matched while the drawn glyph differed | **📐 icon-glyph-w/h** — `extract-mock.js` captures the path bbox; `diff.mjs` pairs icons by position (v1.14.3) |
| 5 | heading "for" wrapped wrong | `text-wrap: balance` rebalances lines so a word wraps even when it FITS — geometry can't see it | **text-wrap** extracted + diffed (v1.14.5) |
| 6 | nav gap 10px, live's is 16px | I measured a **re-served static scrape**, not LIVE — Framer resolves the variant at runtime, so the scrape rendered a different value | **Reference the LIVE URL, not a scrape** (method, v1.14.5). `extract-mock.js` runs against `https://…` directly. |
| 7 | "See the platform" pill read as plain text | I measured the inner **text node** (h=20) not the styled **button** (h=42) | pair to the styled box, not the text node (box-walk already does this; method note) |
| 8 | "One workspace.**\<br\>**Four…" wrapped wrong | `textContent` collapses `<br>` to a space → the strings matched | **hard-break(\<br\>) + line-count** extracted + diffed (v1.14.7) |
| 9 | card border `#e5e9f0` "missing" | border was on the **`::after` pseudo-element** (`content:""; border:1px var(--border-color)`) — `getComputedStyle(el)` can't see pseudos | fold a rendering `::after`/`::before` border/shadow into the element's effective values — `extract-mock.js` (v1.14.6) |
| 10 | hero gradient "missing" | the gradient is a full-bleed **`<img>`/SVG layer**, invisible to a `background-image` check | **bg-media-layer** — `extract-mock.js` captures a near-full-size media child; `diff.mjs` compares it (v1.14.7) |
| 11 | icon→label gap 14 vs 22; card gap 24 vs 20 | per-box padding was checked, but the **gap BETWEEN siblings** (and a non-text leading icon-row) was not | **gap→next-sibling / gap←prev-sibling** — `diff.mjs` (v1.14.7) |
| 12 | bullet text "wrong size" | `letter-spacing` IS checked, but the mock's text node bundled the dash (`"-  ASX…"`) vs mine (`"ASX…"`) → width compared different strings | letter-spacing already checked; **compare the same content** — measure a sliced sub-string, never a whole node whose boundary differs (method) |
| 13 | Inter text blurry on Retina (serif sharp) | one `@font-face Inter { font-weight: 100 900; src: <one static-500 file> }` → the browser **faux-weight-synthesizes** weight 400 → blur. No computed-style difference (both weight 400, family Inter) | **weight-range-synthesis-risk + family-not-loaded** — `extract-mock.js` captures `document.fonts` (loaded faces); `diff.mjs` flags a range-weight face where the reference uses discrete statics (v1.14.7) |
| 14 | nav background + hairline divider "missing" | the `<nav>` container has no text → the text-probe differ never reached it | **container styling** — the per-box check + `structure-diff.mjs` match containers by path/fid; the screen-background top-level check exists. (Container-level bg/border/`bgLayer` comparison is the one still best run via `structure-diff.mjs` node-pairing.) |
| 15 | footer ~100px dead space below content | the footer used symmetric `paddingBlock`; live is top-only. The box pad-bottom IS checked — but only when the container pairs | pad-bottom already checked; **gap→next-sibling** + the box pad checks catch it once the footer box is paired (v1.14.7) |

## The standing principles these encode

1. **Reference the LIVE rendered site, never a re-served scrape** (#6). A runtime-hydrated framework resolves a different variant off-origin. This alone caused several "I matched it exactly but it's wrong".
2. **`getComputedStyle(element)` is blind to pseudo-elements and to non-CSS layers** (#9, #10). Fold pseudo borders/shadows; capture media-layer children.
3. **Computed style can match while the RENDER differs** — wrong glyph variant (cv11), variable-vs-static synthesis (#13), font-version width (#2), wrap balance (#5). Always carry **rendered geometry** (w/h/center-x), **glyph extent**, **line-count**, and **loaded faces** as ground truth, not just declared properties.
4. **Compare the SAME content on the SAME element type** (#7, #12). A node-boundary mismatch (dash-in-text, text-node-vs-button) makes a width/size comparison meaningless — pair to the styled box and slice to the same string.
5. **Gaps live between elements, not only inside boxes** (#11, #15). Check sibling gaps and spacing accumulation, not just each box's own padding.
6. **When the human eye and a measurement disagree, the eye wins — go LOOK / inspect the live element** (#9 was solved by the user reading `--border-color` in devtools). A confident wrong number is worse than no number; the fix is a better measurement, on the right node.
