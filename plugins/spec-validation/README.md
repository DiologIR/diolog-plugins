# Spec Validation

A Claude Code plugin that determines whether a specification, build plan, or Definition of Done is **genuinely** implemented in a large codebase — by tracing every claimed-done item to the code that **produces** its data, never by trusting that it renders, that its schema validates, or that the tests pass.

## Why it exists

Apps of a certain shape carry a fallback seam — `live.X ?? mock.X` — so a demo build, a backendless web mode, or an empty workspace renders from seeded data by design. That seam makes two very different things look identical:

- **graceful fallback** — there's a real producer, it just has no data yet (fine), and
- **no producer** — the feature was never wired and the seed is all anyone will ever see (the gap).

Tests make it worse, not better: a green suite that asserts a schema round-trip and a mock render validates the *plumbing*, not that real data is *computed*. So a feature can ship "100% complete", pass review, and demo perfectly while reading a hardcoded array. This plugin is the antidote.

## What it does

1. **Establishes the spec + the real path** — pins source-of-truth precedence, and (critically) how the real path differs from the demo/empty path where the mock fallback lives.
2. **Classifies every field** as **REAL** (a producer computes it — filesystem, git, source scan, AI, DB, live API), **AUTHORED** (persisted but only ever written by a UI round-trip or a seed — nothing computes it), or **MOCK** (only ever the fallback constant) — each with **file:line** evidence.
3. **Uses mechanical detection** — writer/reader-asymmetry greps, an audit of every `?? mock` seam, a fresh real-instance run (empty state flushes gaps), and a DoD "show me the producer" walk.
4. **Fans out across parallel investigators** — one sub-agent per subsystem/surface, each handed the exact rubric and returning a verdict table with evidence.
5. **Adversarially verifies** the highest-impact findings before reporting — parallel investigators overclaim, so the headline verdicts are spot-checked or sent to a refuter.
6. **Writes a ranked, living audit doc** — a date-stamped report with an `OPEN / RESOLVED / WONTFIX` issue register that doubles as the resolution backlog, plus a changelog as gaps are closed.

## What makes it different

- **Producer-first, not render-first** — "it renders / the schema validates / the tests pass" is never accepted as evidence of real.
- **Names the systemic reason** gaps slip (the `?? mock` seam + plumbing-validated-as-feature), which is usually the most useful sentence in the report.
- **Honest about fallback** — graceful degradation (a producer that templates/empties when unconfigured) is REAL, not a gap; only a missing producer on the real path counts.
- **Calibrated** — it lists what's genuinely REAL too, so a prior "validated" claim isn't over-corrected into "nothing works".
- **Closes the loop** — the report is the tracker: each gap moves to RESOLVED with its real producer recorded, and "resolved-scoped" cleanly separates closing the provenance gap from shipping deeper feature depth.

## Inputs

The user provides:
1. **The specification** — a build plan, product spec, Definition of Done, or feature list. If missing, the skill asks.
2. **The codebase + the real path** — and how it differs from the demo/empty path. If it can't tell, the skill asks.

## Installation

Add the marketplace and install:

```
/plugin marketplace add diolog-plugins
/plugin install spec-validation@diolog-plugins
```

Then invoke it by asking to validate a spec/plan/DoD against the code, audit data provenance, or check whether features are real or mocked.

## License

MIT
