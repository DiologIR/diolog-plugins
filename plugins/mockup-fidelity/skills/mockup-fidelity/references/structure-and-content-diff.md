# Structure & content diff — the layout/missing-node defects the style differ can't see

The per-property style differ (`assets/diff/diff.mjs`) matches elements by **text** and
compares **computed style**. That makes it structurally blind to the *highest-frequency*
real defects — a 2×2 grid rendered 1×4, a card laid out `row` where the mock is `column`
(icon **beside** vs **above** its label), a missing icon/divider/badge node, a reordered
or app-extra child, dash-vs-check bullets. The words and colours match, so the style diff
scores those "close" while the layout is wrong — exactly the gap a human reads as "looks
very different". This is anti-pattern #9 (style-without-structure) made mechanical.

**So: structure-before-style is not optional.** Run `structure-diff.mjs` + `content-diff.mjs`
+ `overlay.mjs` **before** `diff.mjs`, and treat a clean `diff.mjs` report as *not a section
verdict* until `structure-diff.mjs` is also clean. The three close the blind spots that a
green `❌` list says nothing about.

## extract-mock.js — now carries layout props + a `data-fid` anchor

`extract-mock.js` is unchanged in how you run it (`references/react-web.md`), but it now
captures, per node, the **layout props** `structure-diff` consumes — `gridTemplateColumns`,
`gridTemplateRows`, `gridAutoFlow`, `gap`/`columnGap`/`rowGap`, `flexDirection`, `flexWrap`,
`position` — and a **`fid`** field read from `data-fid` / `data-fidelity-id` / `data-testid`.
Backward compatible: nothing downstream breaks if a node has no `fid` and the existing
`diff.mjs` ignores the new props. Run both sides at the **same viewport** so geometry and
grid tracks compare like-for-like.

### `data-fid` — kill text-collision mispairs

All three differs pair a mock node to a target node. Text matching mispairs when a short
string repeats across roles (nav "diolog" ↔ a footer wordmark; a card heading ↔ a nav link).
Put the **same** `data-fid="x"` on the matching ref **and** target nodes (the mock source and
the React composite) and the matcher uses it first — exact, layout-stable, text-independent.
Add it to any region where you see a role collision (`README.md` "repeated short text" tell).

## structure-diff.mjs — layout · missing · extra · child-count

```bash
node structure-diff.mjs --mock ref.json --app target.json [--anchor "<section text>"] \
  [--out .mockup-fidelity/diff/structure-report.md]
```

Consumes two `extract-mock` dumps; writes `structure-report.md` **and** a `.json` sidecar.
Matches nodes by **`fid` → normalized text+tag → structural tag-path**. `--anchor "<text>"`
scopes both trees to the section whose nearest container (climbs ≤4 parents) holds that text.
The report's four buckets:

- **❌ Layout mismatches** — on matched containers: `grid-columns` (column **count**, so
  `repeat(4,1fr)` rendered as a 2-col grid flags), `flex-direction`, `gap`/`columnGap`/`rowGap`,
  `flex-wrap`, `justify-content`, `align-items`. Gap/justify/align/wrap are only reported on a
  flex/grid container (ignored on a block). Each row = `container · property · target vs mock`.
- **◑ Child-count differences** — a matched container with a different number of children =
  a missing or extra row/icon/divider *inside* it.
- **⊖ MISSING** — a mock node (meaningful text, **or** a visual element: svg/img/hr, or a small
  empty box with a background/border) that never matched a target node. A missing icon, divider,
  badge, or tile. **Build these — mock wins.**
- **⊕ EXTRA** — a target node no mock node claimed. An app-extra badge/line/wrapper. **Remove,
  or cite why it stays** (anti-pattern #1: a citation is external evidence, not a reason you
  author now).

Read it like the differ report: every layout/missing/extra finding is a structural defect →
fix it, or attach an external citation.

## content-diff.mjs — separate the CONTENT/DATA gaps from CSS

```bash
node content-diff.mjs --mock ref.json --app target.json \
  [--out .mockup-fidelity/diff/content-report.md]
```

Some "looks different" gaps are not CSS — they are **content/data**: a footer rendering
SEO-long page titles where the mock shows the short nav label, a closing band stored `light`
when the mock is dark, a missing heading. A computed-style diff can never see these (it
compares how text is *painted*, not what it *says*). This script LCS-diffs the ordered visible
text of both dumps and reports:

- **◑ Label-length mismatches** — same element, one text **contains** the other (SEO title vs
  short label). A **derivation/DATA bug** — fix the content pipeline, not the stylesheet.
- **⊖ mock-only** — copy/headings in the mock, missing from the target (add via content).
- **⊕ app-only** — copy the app renders the mock doesn't (remove or cite).

Fix every finding in the **content store** (DB seed, nav/footer derivation, source JSON) — ideal
end-state is to seed the target's content *from* the reference text, so content parity holds by
construction and only presentation is variable. Don't chase these in CSS.

## overlay.mjs — the fast VISUAL trigger (not proof)

```bash
node overlay.mjs --ref ref.png --app target.png [--out .mockup-fidelity/diff/overlay.html]
playwright-cli open "file://$PWD/.mockup-fidelity/diff/overlay.html"   # then screenshot
```

Zero-dep: reads two PNGs, writes a self-contained `overlay.html` with three views — a
`mix-blend-mode:difference` overlay (identical pixels → **black**, any divergence → **bright
edges**, so a missing icon/shifted card lights up instantly), an opacity-fade slider, and
side-by-side. The agent opens it and screenshots it. Use it as the **TRIGGER** to go *measure*
a region — never as the proof of a match (frontier vision recall is too low; anti-pattern #11).

## The order, and the verdict rule

1. `structure-diff.mjs` → fix layout / missing / extra / child-count.
2. `content-diff.mjs` → fix content/data gaps in the content pipeline.
3. `overlay.mjs` → screenshot the difference view to catch the non-text visuals the differs
   miss (standalone icons, dividers, overlaps) and to trigger a hand-measure.
4. **Then** `diff.mjs` for the per-property computed-style pass.

A clean `diff.mjs` is **necessary, not sufficient**: it only style-checks elements present on
*both* sides, so a missing/substituted node never appears as `❌` — only as `⚠︎`-unmatched.
**A section's verdict is admissible only once `structure-diff.mjs` AND `content-diff.mjs` AND
`diff.mjs` are all clean (or every finding cited).** A green style report on its own is the
⛔-gate failure the SKILL warns about. Full differ blind-spot list: `../assets/diff/README.md`.
