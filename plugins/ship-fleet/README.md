# ship-fleet

Backlog-wide feature-delivery orchestrator. Where `ship-feature` takes **one** feature from idea to merged code, `ship-fleet` takes **everything that remains** in a repo's markdown feature-spec pipeline and drives it to done.

## What it does

1. **Preflight** — checks the repo's pipeline conventions (specs/plans/briefs/mocks/deep-research/DESIGN md/practices docs), offers to clone [diolog-team-files](https://github.com/Diolog26/diolog-team-files) for `CODING_PRACTICES.md` + `NEW_PROJECT_BEST_PRACTICES.md`, gathers stray feature briefs into `docs/features-to-triage/`, and validates the monolith layout against `NEW_PROJECT_BEST_PRACTICES.md`.
2. **Survey** — classifies every piece of remaining work: resumable worktrees, planned-not-built, spec'd-not-planned, untriaged briefs, deferred follow-ups mined from spec progress notes, and design-preview refreshes where `design/mocks/html/` mocks are ahead of the design-system app preview. Extracts inter-dependencies and matches each item to its `docs/deep-research/` docs and HTML mock.
3. **Hygiene** — reviews existing worktrees / `ai/*` branches: finalize, resume, or clean (never destroying unmerged work).
4. **Artifacts** — writes `ORCHESTRATOR.md` (combined plan + ledger; a fresh session can resume the whole fleet from it alone) and `orchestrator-hierarchy.html` (self-contained visual dependency hierarchy) **before any execution**.
5. **Fleet** — dependency-ordered `ship-feature` runs, up to **8 concurrent** Opus runner agents, runners stopping before merge so the orchestrator can serialize finalization. Optional cost lane: mechanical plan-scoped coding via Cursor CLI `composer-2.5`, verified and fixed by Opus.

Every agent — Opus runners, their subagents, and composer — gets the same context contract: the feature's brief/spec/plan, the root `DESIGN` md, both practices docs, and any matched deep-research doc **read in full**, with a re-read-after-compaction rule baked into every prompt.

## Skill

| Skill | Purpose |
|---|---|
| `ship-fleet` | Survey remaining work, build the orchestrator plan/ledger + hierarchy HTML, then conduct the fleet |

## Requirements

- The `ship-feature` plugin (and through it design-craft, feature-spec-pipeline, acceptance-e2e).
- A product repo using the markdown feature-spec pipeline conventions (the preflight helps set these up).
- Optional: the Cursor CLI (`cursor-agent`) for the composer-2.5 coding lane — the fleet runs fine without it.
