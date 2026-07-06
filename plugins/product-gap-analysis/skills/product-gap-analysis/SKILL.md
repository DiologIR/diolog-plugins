---
name: product-gap-analysis
description: "Whole-product gap analysis for ANY project against ANY stated goal — 'where does this project stand and what's left?' answered with no stone unturned. Surveys everything the repo has (status ledgers/orchestrator logs OR issue-tracker exports, specs and their deferral sections, untriaged briefs or roadmap docs, reference catalogues, the live app code, nav/wiring, and the test inventory), cross-checks every status claim against git, and synthesizes one comprehensive, evidence-cited gap report that seeds the next wave of work items. Finds: missing features, incomplete/deferred tails, untested areas, missing user flows, dead navigation, fake/sample data presented as live, cross-feature coherence holes (no home, no search, broken deep links, surfaces-as-islands), pending security/legal gates, dark-by-default workers, and documentation drift. Use whenever someone asks 'where does the project stand', 'what's left to implement or test', 'give me a comprehensive list of gaps', 'what's missing for v1.0 / GA / launch / this milestone', 'what doesn't make sense in the product', 'audit what's incomplete', or wants a report that becomes feature/gap-fix briefs or tickets — for any repo, whatever its doc conventions, even if they never say 'gap analysis'. NOT for a single spec's done-ness (use spec-validation), NOT for executing a backlog (use ship-fleet), NOT for code-quality improvement plans (use improve). Read-only: it writes one report (and later, briefs) — never product code."
allowed-tools:
  - "Read"
  - "Grep"
  - "Glob"
  - "Bash"
  - "Agent"
  - "Write"
  - "TaskCreate"
  - "TaskUpdate"
  - "TaskList"
  - "ToolSearch"
---

# Product Gap Analysis — whole-product standing survey

Produce **one comprehensive, evidence-cited gap report** for a product repo: every gap, incomplete or untested feature, missing feature, missing user flow, and cross-feature coherence hole between the current tree and a **stated goal** — structured so each gap can become a work item (a triage brief, a ticket, a roadmap line).

**The goal is a parameter, not an assumption.** It may be "v1.0 feel", "GA", "the next roadmap horizon", "parity with the mock", or simply "the product's own stated intent". If the user named one, use it; if not, derive it from the repo's positioning/roadmap/README claims and state your derivation in the report. Everything downstream — what counts as a gap, how gaps rank — is measured against that goal.

You are the **synthesizer**. Parallel research agents do the reading; you hold the map, reconcile contradictions, fill holes, and write the report. This split is the core of the method: the source material (hundreds of docs, a many-surface app) is far larger than any one context, so the only way to be exhaustive AND coherent is to delegate reading and keep only conclusions.

```
Phase 0  scope inline        size the landscape cheaply; discover WHICH sources this repo has; fix the goal
Phase 1  fan out             launch parallel research lenses (up to 7) as background agents
Phase 2  collect+reconcile   process results as they land; resolve contradictions by the authority order
Phase 3  fill holes          targeted inline checks for anything a dead/weak agent left uncovered
Phase 4  synthesize          write the report in ONE pass from the collected findings
Phase 5  hand off            summarize for the user; offer to generate the top-priority work items
```

Read `references/evidence-rules.md` **before Phase 1** — it holds the epistemic laws every agent prompt must carry. Read `references/research-lenses.md` when launching agents (Phase 1) and `references/report-template.md` when writing (Phase 4).

**Scale the rigor to the ask.** The full seven-lens fan-out costs hours and a very large token budget — it is the right default for a "no stone unturned" whole-product ask, and dead weight for anything narrower. For a scoped ask ("gap-check the finance area", "quick pass before the demo") or a constrained budget, merge or drop lenses per the adaptation table in `references/research-lenses.md`, keep only the strata the ask needs, and shrink the report to match — stating in the report exactly what was descoped, so a smaller analysis never masquerades as the full one.

**If the Agent tool is unavailable** (no subagents in this environment), run the lenses yourself sequentially: one lens at a time, compressing its findings into structured notes before starting the next — never interleave two lenses' reading, or the synthesis degrades. **If the repo has no usable git history** (shallow clone, no commits), say so in the report and downgrade every status claim to documentary evidence — the git cross-check in the evidence rules is the backbone of the method, and its absence must be visible to the reader.

## What "comprehensive" means here — the seven gap strata

A whole-product gap analysis is not one list; it is seven distinct strata, each with a different owner and fix-shape. Keep them separate from the first minute — mixing them produces mush:

1. **Product-coherence gaps** — the horizontal layer: home/front door, global search, working deep links, entity-link fabric between surfaces, onboarding, team/member management, settings reachability, notifications last-mile, unified activity, honest chrome. These are found by testing the product's **own claims** (positioning, README, marketing copy) against the shipped tree, and they rank highest because they contradict the product's identity.
2. **Genuinely unbuilt planned features** — planned items (ledger rows, tickets, roadmap lines) with no merge commit anywhere. Usually a short list once you stop trusting stale statuses.
3. **Deferred tails** — the "honest deferral" / "out of scope for now" sections of shipped specs and closed tickets, grouped by subsystem, plus the recurring **cross-cutting substrates** (an export engine, a push rail, a scheduler, a PDF pipeline…) that many subsystems defer onto.
4. **Release gates and dark-by-default** — pending security/legal/compliance reviews (features shipped behind honest labels) and every background worker/env flag that ships OFF. A fresh install with zero autonomous behaviour is a milestone finding, not a footnote.
5. **Test-coverage debt** — zero-e2e surfaces, zero-test modules (especially authority modules like kill-switches and permission guards), invariant assertion gaps (tenant isolation, CSRF, maker≠checker), stale test docs, known-red baselines.
6. **Documentation drift** — catalogue/roadmap headers and framing that no longer match the tree (drift is usually false-*negative*: shipped work described as unbuilt), stale status rows, duplicate/misfiled docs.
7. **Live defects** — actual bugs discovered incidentally during the analysis (a malformed link target that breaks a list, a hardcoded KPI stamped "live"). Separate these out: they are "fix now", not "triage later".

## Phase 0 — Scope inline (cheap, minutes)

Do NOT start reading documents at length. First size the landscape with one or two Bash calls (`ls | wc -l` on the candidate doc dirs; `wc -l` on the big status/catalogue docs), then discover **which artifact classes this repo actually has**. Repos vary enormously; both of these are common:

| Artifact class | Spec-pipeline convention (e.g. motif-studio) | Ticket-driven convention (e.g. dAIolog) | If neither |
|---|---|---|---|
| Status ledger / work log | `docs/features-to-triage/LEDGER.md`, root `ORCHESTRATOR.md` | Linear/Jira (MCP or export), `docs/*roadmap*.md` | `git log` alone |
| Feature specs | `docs/specs/spec-<ID>.md` | `docs/specs/`, `docs/design-briefs/`, plan docs | README + code |
| Unstarted ideas | `docs/features-to-triage/*.md` | roadmap "later" sections, idea/backlog docs | — |
| Product catalogue | `docs/reference/Feature Specifications.md` + overview | `docs/existing-features.md`, `docs/marketing/` feature guides | README claims |
| Positioning / goal | `docs/marketing/*positioning*.md`, roadmap | marketing copy, landing page, pitch docs | README + user's stated goal |
| App trees | `apps/*` + `packages/*` | same, or a single app | wherever the code is |
| Test inventory | e2e dirs, `**/*.spec.ts`, `docs/testing/` | `docs/e2e-test-catalogue.md`, jest configs | test globs |

Glob for each class rather than assuming; note what's absent. **The lens plan adapts to what exists** (see the adaptation table in `references/research-lenses.md`): a repo with no ledger merges the status lens into a git+tracker lens; a repo with no briefs dir drops the backlog lens or re-scopes it to roadmap docs. Never invent territory for a lens whose sources don't exist — an agent with no real sources fabricates.

Then partial-read only the **coordination spine** (whatever plays the ledger/orchestrator role) yourself — these files can be enormous (well past your Read cap), so read the first page and treat the rest as agent territory. You need just enough to write good agent prompts: roughly how many features/tickets exist, the id scheme, what state the pipeline claims to be in.

If a `git status` snapshot is available, note untracked/modified doc files — they often reveal a just-finished wave whose statuses haven't been folded in anywhere.

Fix the **goal** (from the user or derived) and write it down — it becomes the report's measuring stick. Create a task list (two tasks: collect findings; write report). Tell the user in one sentence what you're about to do.

## Phase 1 — Fan out the research lenses

Launch the research agents **in parallel background** (Agent tool; `general-purpose` or `Explore` type). The seven standard lenses — full prompt templates and the missing-artifact adaptation table in `references/research-lenses.md`:

1. **Status-map** — the work ledger (files or tracker) cross-checked against `git log`: what is genuinely open vs stale-marked; holding pens and their unblock outcomes; unallocated deferred pools; standing gate/process debts.
2. **Catalogue-currency** — the product catalogue docs vs the last ~130-200 git merge subjects: stale headers/TOC, doc-vs-doc discrepancies, dishonest status markers.
3. **Deferral-mining** — grep ALL specs (or closed tickets) for deferral markers; classify each item DEF / SEC / ENV / REP (see evidence-rules); group by subsystem; extract cross-cutting recurring themes.
4. **Backlog-classification** — every unstarted idea (briefs, roadmap laters, open tickets) classified: stale (work actually shipped) / open allocated / unallocated genuine backlog / superseded master; hygiene debt (duplicates, misfiles).
5. **Wiring-audit** — the live web tree: nav↔route integrity both directions, fake/sample/hardcoded data vs live wiring, dead seams, client↔API coverage.
6. **Test-coverage** — the coverage matrix (area → unit/API/e2e), zero-coverage modules and surfaces, invariant assertion gaps, stale testing docs, known-red baseline.
7. **Product-coherence** — the product's own claims tested against the shipped shell: front door, search, deep links, entity fabric, onboarding, member management, settings, roles, mobile, activity feeds, connect-your-data; the islands analysis; which gaps the roadmap already acknowledges.

Rules that make the fan-out work (bake these into every prompt — the templates already do):

- **Orthogonal territories.** One agent per source-of-truth axis. Overlap is tolerable (it becomes crash insurance); duplication of *whole territories* wastes the budget.
- **Structured-output contract.** Every prompt ends with: *"Return raw structured markdown with IDs and file paths — exhaustive data for synthesis, not user-facing prose. Do not summarize away items."* Without this, agents return polished mush that loses the very items you need.
- **Evidence demands.** Ledger/status agents must verify against `git log`; code agents must cite `file:line` and prove absences by grep ("zero matches for X across Y").
- **Launch all independent agents in one message** so they run concurrently. They complete in any order; you are re-invoked per completion.

## Phase 2 — Collect and reconcile

As each agent lands, give the user a 1-3 sentence load-bearing summary of what it found (they can't see agent output). Do not paste agent reports; extract.

**Reconciliation is your job, not theirs.** Agents WILL contradict each other (one says an id is "absent from git — maybe unshipped", another has the work log recording it as deliberately voided). Resolve with the fixed **authority order**:

> live tree & `git log` merge commits → work-log/orchestrator event records → ledger/tracker status rows → catalogue docs → specs → briefs/roadmap lines

…and **record every reconciliation in the report's appendix**. An unrecorded silent resolution will be re-litigated by the next reader.

**Crash handling.** Long agent runs die (session limits, API errors). When one dies: do NOT blindly relaunch. First check how much of its territory the other lenses already covered (the coherence and wiring lenses overlap heavily; deferral-mining overlaps catalogue-currency). Then fill only the genuine remainder with 1-3 cheap targeted inline checks (e.g. one `ls` comparing screen dirs to route dirs to API modules). Note the substitution honestly in the report appendix.

Never Read an agent's raw transcript/output file from disk — it will overflow your context. Work only from the result summaries you were handed.

## Phase 3 — Fill holes inline

Before writing, walk the seven strata and ask: which stratum has no owner-agent finding? Which claims are still evidence-free? Fill with targeted greps/ls — cheap and surgical, never open-ended reading. Typical fills: the screen↔route↔module three-way map; a grep-zero proof ("no page reads searchParams"); one `wc -l` sanity check.

## Phase 4 — Synthesize the report

Write to `docs/research/<topic>-gap-analysis-<YYYY-MM-DD>.md` (or the repo's equivalent investigations dir; date-stamped — a later re-run gets a NEW file, audits are point-in-time). Follow `references/report-template.md` exactly — the section skeleton, the ranking rules, and the writing rules live there. The non-negotiables:

- **One Write call.** Compose the whole report from your collected findings in a single pass. You have everything; re-reading sources at this stage only burns context.
- **Lead with the sharpest cross-cutting truth**, not a list. The executive summary's first paragraph should say what kind of product this is right now and what single class of work separates it from the goal. (For a breadth-first-built product, the answer is often: *the vertical backlog is done; the horizontal/connected layer the positioning promises is what's missing.* For other repos it may be a different shape — say what it actually is.)
- **Rank coherence gaps by contradiction-with-identity.** A gap that falsifies the product's own claims ("connected" product whose surfaces are islands; "honest" product with fabricated chrome) outranks any missing feature.
- **Quantified absences beat vague ones.** "Exactly one cross-surface entity link exists in the whole product — and it's broken (file:line)" is a finding; "linking could be better" is not.
- **Every gap is a candidate work item.** End with the proposed-items table (P0 goal-blockers / P1 quality / P2 features-and-re-mines), each with the sections it covers and a T-shirt size — this is what makes the report actionable rather than descriptive. Match the repo's work-item currency: briefs for a spec-pipeline repo, tickets for a tracker-driven one.
- **Separate live defects** (§ of their own, "fix now") from gaps ("triage later").

## Phase 5 — Hand off

Final message to the user: the report path, the headline finding in plain sentences, the strata counts, and any material caveats (which agent died and how you covered it; which reconciliations you made). Offer — do not start unprompted — to generate the P0 work items next.

## Operating discipline (important for reliability)

- **Guard your own context like a budget.** You are the only place synthesis can happen; if you fill up on raw documents, the report degrades. Delegate reading; keep conclusions; partial-read anything over ~500 lines; never re-read what an agent already distilled.
- **This is read-only research.** Do not run test suites, builds, or gates; do not fix the live defects you find (report them); do not edit catalogues/ledgers (that is a separate consolidation task the report can recommend).
- **Do not re-derive settled facts.** If the work log records a decision ("id X deliberately voided — already shipped by Y"), that IS the fact; report it, don't re-investigate.
- **Honesty classification is the analytical edge.** An honest deferral behind a labelled chip is working-as-designed; a sample value stamped live, a hardcoded badge count, or a fake presence avatar is a defect — in a product that markets honesty, a brand-critical one. Always check both directions of drift: docs describing shipped work as unbuilt (common, mild) vs UI presenting unbuilt work as real (rare, severe).
- **Expect the ledger to lie.** Status documents and trackers lag reality in fast-moving repos by whole waves. The single most valuable verification in the entire method is: *for every "open" claim, grep git for a merge commit; for every "shipped" claim, find the commit or the live code.*

**The analysis is working if:** every §1 finding carries a file:line a skeptic can open; the genuinely-unbuilt list came out *shorter* than the status docs implied (stale rows were caught, not echoed); the user can turn any §9 row into a work item without re-researching it; and nothing in the report was contradicted when the user spot-checked it.
