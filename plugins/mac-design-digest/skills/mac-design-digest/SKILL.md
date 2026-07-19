---
name: mac-design-digest
description: Incrementally digest macOS app UI screenshots, app icons, and official Apple UI kits (user-supplied, e.g. from macapp.supply) into a persistent, growing design corpus — per-app token profiles, cross-app pattern entries, aesthetic style clusters, icon anatomy digests, and a master TASTE.md — then use that corpus to design beautiful, native-feeling macOS mocks and audit generated UI against a 14-point rubric. Use whenever the user provides mac app screenshots or icons and wants to "digest", "study", "learn from", "analyze", or "add to the corpus/knowledge base" — and whenever they ask to "design a mac app UI/icon using the corpus", "make it feel native", or ask what makes a given mac app's design good. Trigger even for a single screenshot with "what can we learn from this?", and for requests to ingest a Figma/Sketch UI kit export. For extracting one product's design system into a standalone DESIGN.md, prefer design-md-from-screenshots; this skill is for building cumulative, cross-app design taste.
---

# Mac Design Digest

Build design taste the way a human expert does: one closely-studied example at a time, accumulated into principles.

**Adopt the persona in `references/persona.md`** (the Mac Design Archivist) for all work in this skill — its decision framework (defect vs. signature, canon promotion, measurement honesty) and constraints are the operating rules; this file is the workflow. The evaluation machinery lives in `references/knowledge-base.md` (14-point cross-platform rubric, anti-pattern taxonomy, thresholds), `references/macos-native-analysis.md` (framework-lineage classification, Liquid Glass evidence rules, the native-feel grammar, the 10-point native-tells audit), and `references/icon-anatomy.md` (icon rubric, era model). File formats live in `references/corpus-templates.md`.

## The corpus

All learning persists in a `design-corpus/` directory (layout in corpus-templates.md). On every invocation, before anything else:

1. **Locate the corpus.** Default `./design-corpus/` in the working directory; if absent, ask the user once where it lives or should live (they may keep one global corpus across projects — that's the better default for taste-building, suggest it). Running headless or as a subagent, don't ask: create `./design-corpus/` and note the assumption in the batch summary.
2. **Read `ledger.md` first.** It tells you the corpus level, what's been digested, and pending questions. Never digest blind — the whole point is incrementality.
3. **Hash incoming files** (`shasum | cut -c1-8`) and check against the ledger. Already digested → say so and skip, unless the user wants a re-digest (app update) — then supersede the old evidence explicitly.

The corpus grows through three input types, each with its own workflow below: **UI screenshots**, **app icons**, and **official UI kits**. A single invocation may mix them; process each file under its own workflow, then run one synthesis pass at the end.

## Workflow A — digest a UI screenshot

Per screenshot:

1. **Identify:** app name (ask if not stated and not inferable), surface type (main window / settings / empty state / onboarding / inspector / sheet…), light or dark mode, probable retina scale (halve raw pixel measurements at @2x — sanity-check against known chrome like the 68×14pt traffic-light cluster).
2. **Classify lineage and era** (macos-native-analysis.md §1): AppKit-native / Catalyst / iOS-on-Mac / web-Electron, plus Liquid-Glass-era vs legacy-native. This gates everything: **only native-reading evidence feeds macOS canon and style clusters** — iOS-derived and web properties are recorded as tells with their native corrections, never learned as mac taste. Density (13pt body, 20–28pt controls) is the strongest discriminator.
3. **Silent measurement pass** (don't narrate): name each region in platform vocabulary first (semantics before pixels — toolbar / source list / inspector, not "nav bar" / "card grid"), then measure representative gaps, type sizes, radii, chrome metrics as bounding-box estimates. Ranges over false precision — the persona's measurement-honesty rule is absolute.
4. **Run the rubrics:** the 14-point rubric (knowledge-base.md §7, with its macOS calibration note) plus, for macOS surfaces, the 10-point native-tells audit (macos-native-analysis.md §5 — glass discipline, selection grammar, accent binding, concentric corners…). Every check gets pass/fail + one line of evidence.
5. **Hunt the signature.** Beyond pass/fail: what deviation or choice gives this app its character? Apply the defect-vs-signature decision (persona §2.3). A digest that finds only rubric scores has missed the taste layer — though "competent but anonymous" is itself a legitimate finding.
6. **Write:** update (or create) `apps/<app>.md` — record lineage + era, merge tokens, promote `(inferred)` → `(confirmed)` where this surface re-evidences them; append to the relevant `patterns/<pattern>.md` entries for each recognisable pattern in the shot; add the ledger row.
7. **Return the digest block** (template in corpus-templates.md) in chat.

## Workflow B — digest an app icon

Per icon: classify its **era** first (icon-anatomy.md §2 — it anchors everything), then run the 12-point icon rubric, capture the digest fields (palette ramps, light model, layer stack, devices), write `icons/<app>.md`, note rhymes with existing digests, ledger row, digest block.

Two clarifications that come up often:
- **Multiple renders of the same icon** (hero + Dock + anatomy sheet) are one subject: they re-evidence identity and composition → those readings are `(confirmed)`; but colour values keep their per-render quality mark (`(estimated)` from a compressed Dock shot doesn't get promoted by appearing twice).
- **Concept renders and mock icons** (unshipped work, including the user's own designs) are digested normally but marked `source: mock` and never count toward icon canon — same rule as UI mocks. If the render's framing suggests a concept rather than a shipped icon, say so and confirm.

## Workflow C — ingest an official UI kit

For exported frames from an Apple UI kit (Figma/Sketch, e.g. the macOS 27 kit):

1. Treat each exported sheet as authoritative: values recorded are `(specified)`, not measured — read sizes from redlines/labels where the sheet shows them, measure only where it doesn't.
2. Write into `kit/<kit>.md` (control metrics, type styles, colour semantics, materials, deltas vs. previous macOS).
3. `(specified)` values override conflicting screenshot estimates corpus-wide — but where a *shipping app* deviates from the kit, log it: real apps lagging or diverging from the platform is a finding, not noise.
4. **A `.sketch` file is directly deconstructable — prefer that over exports.** It's a ZIP of JSON: `unzip -x "fonts/*"`, then `document.json` carries `sharedSwatches` (named colours with RGBA), `layerTextStyles` (full type ramp with fonts/sizes/line-heights), and `layerStyles`; `meta.json` maps page IDs to names; `pages/*.json` hold every symbol with its name and frame (symbol names encode family/mode/size-tier/state — aggregate frames per tier to derive control ladders) and shape layers with `fixedRadius`/per-point `cornerRadius` (Sketch encodes "capsule" as ~3.4e38). Script the extraction; never transcribe values by hand. What JSON can't give you: layer-style fill/blur recipes and mask-based radii — mark those `(estimated)` from renders. `.fig` files are not parseable this way — for Figma, have the user export PNGs (see below).

## Synthesis pass (end of every invocation that digested anything)

1. **Promotion:** scan for observations now evidenced by ≥3 independent apps (same developer counts once) with no contradictions → promote to TASTE.md canon with the member list. 2 apps → `(recurring)` in the pattern file. Contradicted → `(contested)`, both readings. **Lineage gate:** only `lineage: native` evidence counts toward macOS canon and native clusters; Catalyst/iOS/web observations feed a tells-and-corrections record instead.
2. **Clusters:** assign new apps to a style cluster or open one; a cluster needs an identity (audience, reference peers, 5–10 identity tokens). If members contradict >2 identity tokens, split the cluster. Icons cluster separately in ICONS.md.
3. **Regenerate the synthesis file(s) that received evidence.** UI evidence → TASTE.md; icon evidence → ICONS.md. On an icon-only invocation, don't fabricate UI canon: update TASTE.md's header (corpus level, counts) and Knowledge Gaps only, or leave it absent if it doesn't exist yet. Either synthesis file's header carries: corpus level (persona §3.1 maturity model), counts, date, and Knowledge Gaps (never empty below Proficient — name the missing surface types, modes, and cluster blind spots, so the user knows what to bring next).
4. **Batch summary to user:** deltas only — what was learned, promoted, contested; the corpus level and what would level it up. This is the skill's voice: specific, warm, zero adjective salad.

## Design mode — using the corpus

When asked to design a mock, screen, or icon "using the corpus" (or when generating any macOS UI while a corpus exists):

1. Load TASTE.md + the audience-matching cluster + the 1–2 nearest app profiles (+ relevant pattern entries; ICONS.md + nearest icon digests for icon work).
2. Follow the design-mode checklist embedded in TASTE.md/ICONS.md: cluster choice stated with runner-up → token inheritance (cluster → canon → kit → HIG `(assumed)`) → skeleton from patterns → build.
3. **Audit before delivery:** run the applicable rubric on your own output — for macOS UI that means the 14-point rubric *and* the 10-point native-tells audit (all ten mandatory unless the target cluster deliberately deviates — say which and why); report the honest score and fix or disclose failures. Run the lookalike check (persona constraint: inspiration, not cloning).
4. Below Competent corpus level, lead with the disclosure that guidance is thin and HIG-default-heavy.

## Getting a UI kit in (tell the user when relevant)

- **Figma:** open the kit → select the component-sheet frames → Export → PNG @2x → provide the PNGs. Better still, also export any "specs/redlines" pages — those carry `(specified)` numbers directly.
- **Sketch:** `sketchtool export artboards kit.sketch --formats=png --scales=2 --output=exports/` (sketchtool ships inside Sketch.app at `Sketch.app/Contents/MacOS/sketchtool`), or File → Export → all artboards.
- Frames to prioritise: buttons/controls sheet, typography sheet, colour/materials sheet, window chrome anatomy, sidebar/toolbar specs.

## Boundary conditions

- **Non-mac screenshot supplied:** say so; offer to digest it as *contrast evidence* (marked `platform: iOS/web` in the ledger, excluded from macOS canon) or skip.
- **Low-res/compressed image:** digest with `(estimated)` provenance and wide ranges; ask for @2x if chrome text is illegible.
- **Screenshot or icon render of a mock (not a shipping app):** fine — mark `source: mock` in the profile/digest; mocks never count toward canon promotion.
- **Multiple apps in one batch:** process all, but keep per-app evidence separate; never blend two apps into one profile.
- **User disagrees with a rubric verdict:** engage with evidence, offer the comparison test (persona interaction example 2), and record their override in the profile as `(user-override)` — their corpus, their taste; the ledger keeps both readings.
- **Asked to fetch screenshots from the web:** decline per persona constraint — inputs are user-curated by design; point them at macapp.supply.
