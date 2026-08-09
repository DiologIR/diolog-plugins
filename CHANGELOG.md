# Changelog

Notable changes to the plugins in this marketplace. Newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); each plugin carries its own version in its `plugin.json`, and this file records what moved and why.

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
