# create-diolog-content

Diolog's company voice as a routed skill: one base voice layer, four register personas (guide copy, article, marketing copy, business case), a review ledger, and a deterministic voice lint.

Built on the `create-voice-persona` package architecture (the same pattern as `create-amy-content` and `create-luke-content`), from the team voice guide (`diolog-team-files/company/diolog-voice-persona.md`), the live diolog.app copy, and Amy's line-by-line review of the first shipped AI-drafted guide (2026-07). Supersedes the three `diolog-brand-voice` skills; that plugin remains installed only for backward compatibility and should be removed once this one has proven itself.

## Layout

- `skills/create-diolog-content/SKILL.md` - the router
- `references/diolog-voice.md` - the non-negotiable base layer
- `references/diolog-voice-review.md` - reviewer-correction ledger (instance → class → rule → encoded-in)
- `references/personas/` - guide, article, marketing-copy, business-case register deltas
- `references/ai-writing-signs.md` - the anti-AI field guide with the July 2026 empirical layer
- `references/research/ai-writing-markers-research.md` - the full deep-research report behind that layer
- `scripts/voice_lint.py` + `scripts/voice-lint.json` - the deterministic gate

## Fingerprint provenance

The `fingerprint` block in `scripts/voice-lint.json` was extracted 2026-07-09 from the live published corpus: ~26,000 words across 40 pages of diolog.com.au - the marketing pages (home, about, book-a-demo, contact, listed-companies, retail-investors, invite-your-investors), the 13 non-legal help-centre articles, and all 20 blog articles. Excluded: legal/terms pages, blog category indexes, and the two `/resources/` guides (AI-drafted in the July 2026 content run, so not human-baseline material). Boilerplate (nav, footers, repeated CTAs and teasers) was stripped before extraction.

Two notes from the extraction run:

- Single pages legitimately drift from the corpus-average bands (the fingerprint advisories are corpus-level signals, not per-page laws).
- The live site copy predates the current house rules and itself fails the lint in places (an em dash in the listed-companies page title; "Seamlessly organise" in its body). The gate is correct and that copy is stale - fix the site, don't weaken the lint.

To re-extract after a site refresh: `python3 scripts/voice_lint.py --extract-fingerprint <corpus files...>` and paste the block into `scripts/voice-lint.json`.
