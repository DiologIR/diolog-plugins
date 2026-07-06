# product-gap-analysis

Whole-product **gap analysis** for any project against any stated goal. Answers "where does the project stand and what's left?" with no stone left unturned — then turns the answer into the next wave of work items (triage briefs or tickets, whichever the repo uses).

The **goal is a parameter**: "v1.0 feel", "GA", "the next roadmap horizon", or simply the product's own stated intent (derived from its positioning/README when not given). Every gap is measured and ranked against it.

## What it does

1. **Scopes inline** — sizes the landscape and discovers **which artifact classes this repo has** (spec-pipeline ledgers vs issue-tracker state vs roadmap docs), adapting the lens plan to what exists rather than assuming one convention.
2. **Fans out up to 7 parallel research agents**, one per source-of-truth axis:
   - **Status-map** — the work ledger (files or tracker) vs `git log` (what's genuinely open vs stale-marked)
   - **Catalogue-currency** — product catalogues / feature guides / README claims vs recent merges (stale headers, dishonest markers)
   - **Deferral-mining** — every spec's (or closed ticket's) deferred/out-of-scope sections, classified DEF / SEC / ENV / REP
   - **Backlog-classification** — every unstarted idea: merged-stale / open / unallocated / superseded-master
   - **Wiring-audit** — dead nav, unreachable routes, fake/sample data vs live, client↔API holes
   - **Test-coverage** — zero-e2e surfaces, zero-test authority modules, invariant assertion gaps
   - **Product-coherence** — the product's own claims tested against the shipped shell (home, search, deep links, entity fabric, onboarding, member management, honest chrome)
3. **Reconciles** contradictions with a fixed authority order (live tree & git → work-log records → ledger/tracker rows → catalogues → specs → briefs), survives agent crashes via overlap + targeted inline fills.
4. **Synthesizes** one date-stamped, evidence-cited report (`docs/research/<topic>-gap-analysis-<date>.md`) stratified into seven gap layers, separating **live defects (fix now)** from **gaps (triage later)**, ending in a **P0/P1/P2 proposed-work-items table**.

## Key epistemics (why it finds what others miss)

- **Ledgers lie; git is authoritative** — every "open" claim is grep-verified for a merge commit; every "shipped" claim needs the commit or the live code.
- **UI claims need file:line from the live tree** — docs don't count; absences are proven by grep-zero and quantified.
- **Drift has two directions** — docs describing shipped work as unbuilt (mild) vs UI presenting synthetic things as real (severe, brand-critical in an honesty-branded product).
- **The sharpest gaps come from the product's own claims** — a "connected" product whose surfaces are islands outranks any missing feature.
- **An agent must never be given territory that doesn't exist** — lenses are merged/dropped per repo, because an agent prompted at absent files fabricates plausible findings.

## Boundaries

Read-only research: writes the report (and, on request, work items) — never product code, never catalogue/ledger edits, never test runs. For a single spec's done-ness use **spec-validation**; to execute the backlog use **ship-fleet**; for code-quality plans use **improve**.

## Layout

```
skills/product-gap-analysis/
├── SKILL.md                      # the method: goal parameter, phases, strata, operating discipline
└── references/
    ├── research-lenses.md        # the 7 agent prompt templates + the missing-artifact adaptation table
    ├── evidence-rules.md         # the epistemic laws (authority order, DEF/SEC/ENV/REP, drift directions)
    └── report-template.md        # exact report skeleton + ranking + writing rules
```
