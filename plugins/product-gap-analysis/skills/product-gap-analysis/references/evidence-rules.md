# Evidence rules — the epistemics of a gap analysis

These are the laws that keep a gap report true. They exist because every one of them was violated by source material in real runs: ledgers lied about what was open, catalogues denied shipped work in their headers, and UI chrome fabricated data in a product whose brand was honesty. Bake laws 1-4 into every agent prompt; apply 5-8 yourself at synthesis.

## 1. Git is authoritative; status documents lag by whole waves

In a fast-moving repo, the ledger, the orchestrator table, and the catalogue all go stale — typically the *headers and status columns* stale while *appended per-feature blocks* stay current, because appending is cheap and revising is not.

- For every "open / in progress / planned" claim → `git log --all --oneline | grep <ID>`: a merge commit means the row is stale, not the work missing.
- For every "shipped / merged" claim → find the merge commit or the live code. No commit and no code = the claim is the gap.
- The **genuinely-unbuilt list** is defined as: ids with no merge commit anywhere. In practice this list is far shorter than the ledger implies. Expect it; don't be fooled into reporting a hundred phantom gaps.

## 2. UI claims need file:line from the live tree — docs don't count

A catalogue saying "search is planned" and the tree containing an inert search button are different findings (the second is worse: a dangling affordance). Never report a UI gap on documentary evidence alone; the agent must have opened the component/route/config and cite `path:line`.

## 3. Prove absences by grep-zero, and quantify them

"No `(app)` page reads searchParams (verified: grep across all page.tsx)" is evidence. "Deep links seem unused" is not. The strongest findings in a gap report are **quantified absences**: "exactly one cross-surface entity link exists in the product — and it's broken." When an agent hands you a vague absence, either get the grep-zero proof or downgrade the claim.

## 4. Classify every deferred/incomplete item into DEF / SEC / ENV / REP

- **DEF** — honest deferral: named in the spec's Deferred section, no UI pretense. Working as designed; it's backlog, not a defect.
- **SEC** — shipped behind a "pending independent security review" (or legal) label. These aggregate into a **release-gate cluster** — commissioning the review is itself an unallocated work item; call that out.
- **ENV** — env/credential-gated honest 503. The feature exists but is dark without config. These aggregate into a **deploy configuration matrix** gap: which envs light which features is usually documented nowhere.
- **REP** — *represented*: the affordance renders, the producer is fake or absent. Honest only if labelled. An unlabelled REP is a defect.

## 5. Drift has two directions with opposite severities

- **False negative** (docs/markers describe shipped work as unbuilt): common, mild, a docs-debt item.
- **False positive** (the product presents unbuilt/synthetic things as real: sample data stamped `prov:"live"`, hardcoded badge counts, fake presence avatars, success toasts on no-ops): rare, severe — in an honesty-branded product, brand-critical. Always sweep for both; rank the false positives at the top and consider them **live defects**, not gaps.

## 6. The sharpest gaps come from the product's own claims

Read the positioning doc first and extract its identity claims as a test oracle. A gap that *falsifies the positioning* ("connected company" whose surfaces are islands; "governed from anywhere" with no mobile approval path) outranks any missing feature, because it means the product as shipped contradicts what it says it is. This is also what makes the executive summary writable in one paragraph.

## 7. Fixed authority order for reconciling contradictions

Agents will contradict each other and the docs will contradict themselves. Resolve with:

> live tree & git merge commits → orchestrator event log → ledger rows → catalogue docs → specs → briefs

A deliberate decision recorded in the orchestrator log (e.g. "id X voided — already shipped by Y") is a settled fact: report it, don't re-investigate it. **Record every reconciliation in the report appendix** — silent resolutions get re-litigated.

## 8. Respect the boundary of the exercise

- Read-only: no test runs (beyond a seconds-cheap check), no builds, no fixes, no catalogue/ledger edits. The report *recommends* the consolidation pass; it doesn't perform it.
- Don't chase known-red baselines as regressions; report them as standing debt with their provenance.
- Separate what you'd *fix now* (live defects found incidentally) from what you'd *triage* (everything else). Mixing them buries the bugs.
- Point-in-time: date-stamp the report; a re-run gets a new file, never a rewrite of history.
