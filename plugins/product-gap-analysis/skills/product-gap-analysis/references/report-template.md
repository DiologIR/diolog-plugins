# Report template — structure, ranking, and writing rules

Write to `docs/research/<topic>-gap-analysis-<YYYY-MM-DD>.md` in ONE Write call. Target: comprehensive but organized — 400-900 lines is normal for a ~50-surface product. The report has two readers: the human deciding what the goal means for this product, and whoever turns §9 into work items (triage briefs or tickets). Serve both.

## Section skeleton (use this exact shape)

```markdown
# <Product> Gap Analysis — <goal> — comprehensive research report

**Date / Baseline:** <date> · <branch>@<sha>, <contract/version marker>, <N features merged>
**Method:** <one paragraph: the lenses run, the sources covered, the git cross-check>
**Goal measured against:** <the stated/derived goal, one sentence>
**Purpose:** the master input for the next wave of work items (briefs in <briefs dir>, or tickets).
Every numbered gap below is a candidate item; §9 proposes the list.

## 0. Executive summary
## 1. Product-coherence gaps (the "doesn't feel like <goal>" layer)
## 2. Genuinely unbuilt planned features (open ledger/tracker reality)
## 3. Deferred-work inventory by subsystem
### 3.1 Cross-cutting recurring deferrals (shared substrates)
## 4. Release gates and dark-by-default features
### 4.1 Pending independent security review   ### 4.2 Legal gates
### 4.3 Workers/env-flags shipping OFF        ### 4.4 Credential-gated honest 503s
## 5. Test-coverage gaps
## 6. Documentation debt
## 7. Live defects found during this analysis (fix now, not triage)
## 8. What <goal> means for this product — the shape of the remaining work
## 9. Proposed work items
### P0 — goal blockers   ### P1 — quality   ### P2 — features & re-mines
## Appendix A — sources & cross-checks (incl. every reconciliation made)
```

## Ranking and content rules per section

**§0 Executive summary.** Open with the single sharpest cross-cutting truth in 1-2 sentences — what the product IS right now and what class of work separates it from the goal — then a short numbered list of the headline gaps (each one sentence, concrete). For a breadth-first-built product the shape is usually: *breadth done, the horizontal/connected layer the positioning promises missing*. Close §0 with a one-paragraph verdict ("the product does not need more features; it needs …").

**§1 Coherence gaps.** Rank by contradiction-with-identity (evidence-rules law 6): gaps falsifying the positioning first. Each gap gets: a severity tag (CRITICAL/HIGH/MEDIUM), file:line evidence bullets, the roadmap-acknowledged marker where applicable, and — where obvious — the severable first slice ("an interim Home is severable from the full shell reshape"). Typical members: front door, nav integrity + fake chrome, search, notifications last-mile, entity-link fabric/islands, settings + member management, onboarding + dishonest empty states, the flagship loop, universal AI, roles model, mobile, activity feed, connect-your-data fragmentation.

**§2 Genuinely unbuilt.** A table: ID · what · status note. Only ids verified to have no merge commit. Include orphaned halves (core merged, surface never allocated) — these fall through every other crack. Include unallocated residues of master briefs and pool items never given an id.

**§3 Deferred tails.** One dense line-list per subsystem, spec/ticket ids in parentheses, REP items flagged. Then §3.1: the cross-cutting substrates, ranked by fan-in (how many subsystems defer onto each) — the highest-fan-in substrate is usually the best-value P2 item.

**§4 Release gates.** SEC items split cleared vs open (a review that passed is a fact worth stating); legal gates with the user decisions they wait on; the full OFF-by-default flag list with the observation that a fresh install has zero autonomous behaviour; the env→feature matrix gap.

**§5 Test gaps.** Zero-lists first (surfaces with no e2e; modules with no tests — untested *authority* modules ranked top), then thin-coverage, then invariant-assertion gaps (tenant/CSRF/maker-checker), then stale/baseline debt and whether e2e is in any gate.

**§6 Docs debt.** Per doc: patchable vs needs-full-re-grounding, with the worst header-vs-body contradictions quoted. Ledger flips needed, brief archival/dedup, misfiled docs. Name the merge wave the stale layer pre-dates (it tells the maintainer exactly what to fold in).

**§7 Live defects.** Numbered, each with file:line and the failure it causes. These were found incidentally; they are not the report's purpose, but burying them in gap prose loses them.

**§8 Shape of the work.** Compress everything into 2-4 named workstreams in order (e.g. *A. the Connected layer (product) → B. the trust layer (reviews/legal/ops posture) → C. the consolidation layer (docs+tests)*). This is the paragraph decision-makers actually act on.

**§9 Proposed work items.** Tables: proposed item (brief filename or ticket title — match the repo's currency) · which report sections it covers · T-shirt size. P0 = goal blockers (connective tissue + honesty + trust); P1 = quality (coherence remainders, coverage, docs); P2 = allocated-but-unbuilt features, high-value re-mines (subsystems whose parked foundations now exist), and the shared substrates. Note explicitly that the long §3 tails do NOT each need a brief — they're already catalogued in their specs.

**Appendix A.** Sources read, verification methods, every reconciliation made ("id X reported missing by one lens; orchestrator log records it deliberately voided — treated as VOID, not a gap"), and any lens that died plus how its territory was covered.

## Writing rules

- Complete sentences; technical terms spelled out; no invented shorthand the reader must decode. Dense is fine, cryptic is not.
- Every factual claim carries its evidence inline (file:line, spec id, or commit) — the report must survive skeptical re-checking without the author present.
- Absences quantified (law 3). Severities argued, not asserted ("this undercuts the core demo across Finance/Blog/Make/Trust" beats "important").
- Honest about the analysis itself: name what wasn't covered and why.
- Never soften a finding to be polite, and never inflate one for drama — the reader will fund work based on this document.
