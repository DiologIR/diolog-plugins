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

## Known gap

The lint config carries no stylometric `fingerprint` block yet. Generate one from the human-approved published corpus (the live blog articles and site copy in the main Diolog repo):

```bash
python3 scripts/voice_lint.py --extract-fingerprint <published corpus files...>
```

and paste the result into `scripts/voice-lint.json`. Until then, rhythm discipline rests on the prose rules in `diolog-voice.md`.
