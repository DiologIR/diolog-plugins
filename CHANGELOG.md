# Changelog

Notable changes to the plugins in this marketplace. Newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); each plugin carries its own version in its `plugin.json`, and this file records what moved and why.

## 2026-08-15

### The Obscura migration — every browser-driving skill

Playwright, `playwright-cli`, `agent-browser` and the Chrome MCP are gone from the machine; [Obscura](https://github.com/h4ckf0r0day/obscura) is the only browser lane. Each skill below was rewritten against what Obscura actually does, not against a find-and-replace of the command name — including, where it applies, what the swap **costs**, because a capability quietly lost is worse than one that was never claimed.

Three engine facts drive most of the rewrites: localhost is blocked unless `--allow-private-network` precedes the subcommand (otherwise every local navigation fails as an SSRF block that reads like a broken app); every `obscura fetch` is a fresh render, so state set in one call is gone by the next; and Obscura loads no web fonts and resolves `padding` / `margin` / `borderRadius` shorthands to `0px`, so any measurement takes the longhands and any typeface question goes to a real browser.

- **acceptance-e2e 1.5.0 → 1.6.0.** Default runner moves off `@playwright/test` to `node:test` driving Obscura over CDP. `references/e2e-playbook.md` §9 now stands a harness up in one `e2e/harness.mjs` (a raw `WebSocket` CDP client, `Target.createTarget` → `attachToTarget` → per-verb helpers) with nothing to `npm i`. The a11y gate injects `axe-core` directly — verified firing on a seeded fixture — with the two rules that fail quiet named: `color-contrast` lands in `incomplete` and never in `violations`, and CSS animations never execute, so "settle before sampling" is unenforceable. Flake discipline becomes explicit polling with a deadline, and the conversion cost is stated plainly: no fixtures, no auto-retry, no parallel workers, no HTML reporter, no trace viewer. The Diolog harness reference describes the on-disk Playwright suite as what it is — predating the migration, unconverted, safe to read and extend.
- **mockup-fidelity 2.5.3 → 2.6.0.** `capture.mjs` re-platformed onto `obscura serve` over CDP; `playwright-core` dropped, leaving `odiff-bin` as the only dependency (differ package 2.5.0 → 2.6.0). The element-scoped raster and IoU text-less layers stand. The CDP rendered-font layer does not: `CSS.getPlatformFontsForNode` returns `{}`, `DOM.requestNode` is unimplemented, and with no web fonts both sides agree by construction — so the harness records `summary.layers.cdpRenderedFont = { available:false, reason }` rather than zero divergences, because a silent zero reads as "the fonts match", the exact defect the layer existed to catch. Same treatment for the font-feature rasteriser probe. New `assets/diff/mfeval.mjs` evaluates with `awaitPromise:true`, which `obscura fetch --eval` and the MCP `browser_evaluate` do not.
- **design-md-from-website 1.0.1 → 1.1.0.** `references/playwright-probe.md` replaced by `references/obscura-probe.md`, and a new `assets/capture-page.mjs` does the page capture over CDP — full-page screenshots are unreachable from `obscura fetch`, which renders the viewport only and silently drops everything below the fold. Type is now labelled as **declared** rather than rendered, since the engine never loads the site's fonts. Screenshot artifacts no longer have to live under the repo root.
- **email-mockups 1.6.0 → 1.7.0.** Live mock-reading moves to the `obscura mcp` session lane (a click has to survive to the next call); per-artboard capture becomes measure-then-crop, or a CDP `clip`. The parallel-agent rule is re-derived rather than inherited: `fetch` runs cannot collide, but the MCP session can, so captures still serialise.
- **create-company-deck 1.3.1 → 1.4.0.** `run_gates.sh` rewritten to drive the viewport matrix over CDP — `obscura fetch` renders at a fixed 1280×720, and a single viewport is what the script exists to refuse. Console capture is a page-side hook installed before navigation, because Obscura emits no `Runtime.consoleAPICalled`. PDF checks are explicitly sent to a real browser.
- **diolog-tasks-pipeline 2.4.0 → 2.4.1**, **ship-feature 1.5.3 → 1.5.4**, **company-overview-from-website 1.0.0 → 1.0.1** — verification and crawl lanes restated for Obscura, including the private-network flag.

### deck-craft 1.9.0 → 1.10.0

- **Preflight is mandatory and self-scoring.** `scripts/run-preflight.sh` now evaluates the summary itself and exits non-zero on any blocker, in `python3` rather than `node` so a machine without node cannot report a gate that never ran as a clean deck. The skill runs it on every build and revision without being asked.
- **No synthetic AI portraits of real named people** — directors, executives, key personnel. Structured typographic credential cards, company logos or authentic facility photography instead.
- **Two honest chart constructions, and the one that fails.** Declared HTML bars (`data-chart="bars"` + `data-value` + an inline `height:NN.NN%`) are measured exactly; inline SVG falls back to a strict detector and counts as *unverified* rather than passing. The construction that actually breaks is a flex column with an indefinite height. `gap: 0` so per-column baselines abut into one continuous axis; a value label travels with its own fill and is never pinned to the far end of the track.
- **Three classes of false finding, each measured.** A scaled stage measures in two unit systems at once, so an overflow constant per container class and identical on every instance is arithmetic, not a defect. A rasterizer that is not packaged Chrome drops whole text runs while the layout underneath is perfect — the DOM probe that separates the two ships with the reference, and glyph rendering then goes in *not checked* rather than *looked at*. And a fix can starve its neighbour: space in a fixed stage is conserved, so re-run the whole gate, not the region you touched.
- Non-IFRS measures the source publishes without reconciling: what to state, and the two things it does not license.

### design-craft 1.15.0 → 1.16.0, ux-craft 1.6.0 → 1.7.0

- **design-craft:** the browser-verification lane is Obscura; `references/visual-verification.md` gains the scaled-surface unit-system law and the dropped-glyph law (both measured, both with the probe); `references/data-viz.md` gains the value-travels-with-its-mark rule, one baseline under a bar group, and counting accent *marks* rather than accent text.
- **ux-craft:** a derived figure the surface cannot reconcile — adjusted, underlying, pro-forma, EBITDA — sits between "from the record" and "illustrative" and needs its own label; plus two checklist rows (fixed-width columns sized from the longest real string in the face that column uses, and every value sitting with the mark it describes).

### Housekeeping

`marketplace.json` re-synced from every `plugin.json` — it had drifted two versions behind on `deck-craft` and one on `create-company-deck`, and carried a stale `deck-craft` description.

## 2026-08-14

### deck-craft 1.8.0 → 1.9.0

Integrates deep research findings from multi-model expert panels on Investor Relations, retail investor comprehension, and empirical slide presentation engineering:

- **Added Dedicated Investor Relations Guide (`references/investor-relations.md`)**:
  - **Mathematical Typography Derivation (ISO 9241-303 & AVIXA DISCAS)**: Closed-form formula $\text{font\_px} = \frac{\text{arcmin} \times \text{VR}}{2.228}$ governing the $24\text{px}$ reading floor ($\text{VR} \approx 3$), $\ge 44\text{px}$ projection floor ($\text{VR} = 6$), and the quantitative defense of the $96\text{px}$ hero metric ($\text{VR} = 10$).
  - **Rennekamp (JAR 2012) Fluency Safeguards**: Codified structural visual truth requirements to counter the risk of visual fluency inducing unwarranted retail investor sentiment without true comprehension.
  - **IBCS Financial Chart Standards**: Strict zero-baseline mandate (citing Long & Kay 2024 proving baseline truncation distortion cannot be mitigated by footnotes), shared-scale horizontal comparison bars for asymmetric ROI/cost-benefit, and cash flow waterfall bounds (20–25 bars).
  - **Regulatory Disclosures**: Codified ASX Listing Rule 3.1 & GN14 (separate lodgement order), ASIC RG 230 non-IFRS reconciliation rules, and SEC Reg FD / Reg G equal-or-greater prominence requirements.
- **Added IR Deck Recipes (`references/recipes.md`)**:
  - `quarterly-operational-strategic`: 12-slide uncompressed quarterly update spine.
  - `capital-allocation-dividend`: 8-slide capital allocation framework and dividend reinstatement scorecard.
- **Calibrated Preflight & Verification Gate (`scripts/deck-preflight.js` & `references/deck-review.md`)**:
  - Two-tier `isAccessory` check allowing $18\text{px} - 20\text{px}$ auxiliary metadata (eyebrows, table cells, footnotes) while strictly enforcing $\ge 24\text{px}$ on primary body copy.
  - Inlined percentage style extraction for exact DECLARED chart honesty checks.
  - Floating navigation chrome exclusions preventing false collision alarms.
- **Codified Asymmetric Editorial Splits & Brand Signatures (`references/visual-craft.md` & `references/html-deck.md`)**:
  - Standardised $1.06\text{fr} : 0.94\text{fr}$ full-height photo splits with soft gradient scrims.
  - Added authored CSS polygon chevron list bullets (`.chevlist li::before`), $8\text{px}$ structural grounding beams (`.rule`), and angled footer divider seams (`.chev-band`).

### deck-craft 1.7.0 → 1.8.0

Hardens first-pass presentation deck generation against common design-review failure modes identified during ASX quarterly and strategic deck audits:

- **Added pure deterministic SVG charts by default**: Replaced reliance on external JS/CDN chart libraries (`Chart.js`) with responsive inline SVG bar and trend line templates. Eliminates canvas initialization failures, network latency, and blank card rendering in offline, sandboxed, and `file://` presentation contexts.
- **Added Image Downsampling & Base64 Inlining Pipeline**: Automated downsampling (1600px width @ 80–85% JPEG) and Base64 Data URI embedding (`data:image/jpeg;base64,...`) for AI-generated photography (e.g. from `media-gen-pro`), ensuring 100% single-file portability.
- **Enforced Dual-Theme Dark Band Contrast Discipline**: Defined explicit lifted accent tokens (`--color-primary-on-dark: #FF5A5F`), translucent badge pills with high-contrast text (`#4ADE80`, `#60A5FA`), and solid primary backgrounds with white text for badges positioned over photographic scrims.
- **Enforced Card Semantic Purity**: Strictly banned `border-left: 4px solid` on quote cards, metrics, and generic containers, reserving left accent borders exclusively for system warnings and semantic alert banners.
- **Standardised Native IntersectionObserver Navigation**: Replaced scroll-offset arithmetic with `IntersectionObserver` active-slide tracking, 9-dot stepper sync, and `scroll-margin-top` guards against sticky header occlusion.
- **Integrated Accessibility Floor**: Universal `:focus-visible` ring, `@media (prefers-reduced-motion)` overrides, and slide `role="region" aria-roledescription="slide"` attributes baked directly into the default HTML template.

## 2026-08-10

### create-company-deck 1.0.0 → 1.1.0

Composition, from a fair question on review: the skill named four sibling skills and invoked none of them. Every reference was a signpost pointing away, which left the pipeline unable to start without inputs it could have produced itself, and finishing on gates that by construction can only find defects someone has already met.

- **Added** step 0. A missing company overview is now crawled with `company-overview-from-website`, which emits the same `<COMPANY>-Company-Overview.md` contract the portal generator reads — so it is the same artifact rather than a similar one. A missing `DESIGN.md` is measured off the same site with `design-md-from-website`, which reads computed CSS; a guessed brand colour is the most visible failure a branded deck has, and nothing in this skill's own gates can catch it, because the deck is internally consistent around the wrong red. A company URL plus a source document is now enough to start, and only the source document is genuinely irreplaceable.
- **Added** `deck-craft` as a dependency rather than only a destination: its direction round for the case where there is no design system to measure, and its `deck-review.md` for the delivery pass.
- **Added** step 8, `design-review` over the served deck before completion. The bundled gates are deterministic and prove four known defects have not returned; they say nothing about whether a slide's hierarchy works or whether the deck reads as one designed object. This is also where the review's worklist matters — every slide a row, every stage a column, `check` exiting non-zero while any cell is open — so a partial review stops being indistinguishable from a complete one. Several of the bundled gates are findings from exactly that run, promoted into code. The delegation cap was scoped to slide-building so it does not suppress the review's own passes.
- **Changed** the closing report's middle line from what was looked at to the review's coverage and findings.

### create-company-deck 1.0.0 — new

Extracted from the session that built, reviewed and shipped an ASX quarterly deck, and from the handover written out of it (`~/Dev/dAIolog/docs/HANDOVER-2026-08-06-investor-surfaces.md`). `deck-craft` already absorbed that session's craft learnings; what it does not carry is the *materials* — the shell and layouts that were debugged in production, and the scripts for the parts of a company deck that are the same every time.

- **Added** `assets/deck-shell.html` and fifteen slide layouts in `assets/slides/`, lifted from the shipped deck and generalised onto tokens. Each layout's header comment states what it is for and what breaks if its structure changes, because all four of this family's failure modes render perfectly: a grid-centred stage is start-aligned rather than centred and throws 120px of every slide off one edge; `position: static` on the stage in print re-anchors every photograph and footer onto page 1; an `inset: 0` photograph paints above static siblings and deletes the slide's entire text; and the wrapper-collapse guard turns a pinned footer into a 1080px box that renders along the top edge.
- **Added** `scripts/theme_from_design.py` — a company `DESIGN.md` to the deck's `:root` block, mapping palette roles by synonym and deriving the deck type ramp from the system's own body size by one ratio, so the steps keep their relationships at 1920×1080. Resolves 31 of 33 tokens on a real design system and names every fallback, because a token that silently defaults is a value the company never chose sitting in their deck. Two tokens a web system has no reason to define (`--brand-on-dark`, `--on-dark-body`) are now first-class: the second exists because the reference build wrote the same off-white as a literal hex on thirteen slides, which is how an 8-colour palette became 12.
- **Added** `scripts/build_deck.py`, which derives ids, screen labels and footer page numbers from slide order on every build and refuses to build with an unfilled `{{SLOT}}`. Numbering by hand is silent when it is wrong.
- **Added** `scripts/gates.js` and `run_gates.sh` — placement measured against the band the stage is given, collision with the pinned footer checked separately from overflow, paint order checked with `elementFromPoint`, and every count printed with its denominator. Contrast is split into two populations that are never merged: CSS-resolvable, and deferred to pixel measurement wherever the backdrop is an absolutely-positioned sibling, which is where ancestor-walking reported 1.08:1 against rendered pixels of 17:1.
- **Added** `references/grounding.md` — the three inputs and what each is authority for, the figure ledger, and the chart rules that are a compliance layer rather than a style: axes from zero, the caption saying so, the delta in text when the geometry cannot show it, and the unflattering series at the same weight as the flattering one.
- **Added** `references/imagery.md` — media-gen-pro prompt craft, the reference-image grade lock that made five generated photographs one film rather than five, the never-a-real-person rule with the template that replaces it, and disclosure in the back matter.
- **Written for Opus 5 runners:** one checkpoint rather than per-slide check-ins, an explicit cap on delegation (twelve slides look parallel and share a type ramp, a rail and an argument), explicit length calibration for the closing report, and no verification scaffolding — the gates are external deterministic checks, and the mutation test that proves a gate can fail is scoped to when a new gate is written rather than to every run.

## 2026-08-09

A pass over six weeks of session transcripts — 25,917 files, 1,669 sessions using a plugin skill — reading the human messages that followed each invocation. The largest single finding: **Mobbin appeared nowhere in this repo**, despite 63 unique variations of *"did you use mobbin mcp for inspo?"*, which arrived attached to the same verdicts every time — "the layouts are terrible", "boring and uninspiring", "it doesn't feel like a marketing website".

### design-craft 1.13.0 → 1.14.0

- **Added** `references/mobbin-trawl.md`: real shipped UI as structural evidence before a direction is committed. Query craft (one screen per search, name the app to scope it, platform in the parameter not the string), what to extract (density, the surfaces nobody specs, what carries brand with the logo off screen, what is deliberately plain), competitor diagnosis as a measurement rather than a taste report, divergence work, and the TOOK/LEFT ledger that distinguishes a trawl from a claim about one. `LEFT` is the line between reference and imitation.
- **Changed** step 2 of the workflow and `frontend-aesthetic-direction.md` to trawl alongside subject-mining. The two answer different questions: subject-mining supplies the world, the trawl supplies the mechanics, and a direction built on one of them is half-derived.
- **Added** seven skeleton checks to `interaction-states-pass.md`, each a defect a reviewer caught rather than this pass: skeletons that do not match the resolved element's size or shape, that sit on a global grey instead of the surface they cover, that never move, that linger under content already painted, that stack with no gap, and that get applied to elements which were never waiting on data. Plus per-action coverage — *"nothing shows when I record an asset"*.
- **Added** an open-the-artifact note to the environment section, covering the deliverables that aren't obviously "a design": audit sheets, reports, print documents, README banners.

### ux-craft 1.4.0 → 1.5.0

- **Added** `search_flows` to the flow-shaping step. Real shipped flows carry the steps a from-scratch flow reliably omits — the resume path, the partial state, the step that exists only to set an expectation.
- **Added** loading-state specifics to non-negotiable 3 and build-mode step 4: a skeleton is judged against the content it replaces, and a static element that never awaits data needs no loading state at all.

### mac-design-studio 1.6.0 → 1.7.0

- **Added** a reference trawl for the content area and any companion surface, with the honest caveat that Mobbin indexes iOS and web but no macOS — the corpus still leads on native chrome.
- **Added** to the fallback icon path: the audit sheet is the deliverable this pipeline drops, so confirm the four artefacts on disk and open the sheet. Plus the 48px row and the one-silhouette rule.

### deck-craft 1.5.0 → 1.6.0

- **Added** a `search_sections` trawl before the direction shortlist, for the slides that have a shipped web equivalent — pricing tables, hero sections, comparison blocks, data surfaces are exactly the ones that come out generic.

### diolog-site-builder 1.0.0 → 1.1.0

- **Added** per-tenant composition variance to the structure step. Two portals differing only in accent hue are the same page twice — *"the leadership page looks almost identical for every company"*. Block selection, order and density are the levers; a library that cannot express a difference is itself the finding.
- **Added** an open-the-captures rule over `render_preview`'s crops, with the header given its own look at every width. Shared chrome is the component this pipeline has shipped broken across every tenant at once, because a per-page review reads it as the frame rather than as the subject.

### email-mockups 1.5.3 → 1.6.0

- **Changed** the verify step: capturing is not seeing. A shot that succeeded against a 404 looks exactly like one that succeeded against the artboard, and only opening the image tells them apart.

### customer-deck-builder 1.2.2 → 1.3.0

- **Changed** "if useful, open `deck.html` to eyeball it" into a requirement covering every slide and the PDF export. Token counts prove the build ran; they say nothing about a headline that wrapped to three lines or a chart overlapping its legend.

### Repository

- **Fixed** `marketplace.json` drift that predated this pass: `acceptance-e2e`, `create-disclosure-consistency-page` and `create-investor-portal-free` each had a `plugin.json` ahead of its marketplace row, and `company-overview-from-website`, `generate-investor-portal` and `token-discipline` had rows carrying no version key at all. All 49 entries now match on version and description.
