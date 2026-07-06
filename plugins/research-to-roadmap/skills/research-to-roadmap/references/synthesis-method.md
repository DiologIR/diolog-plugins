# Synthesis Method — from research reports to roadmap decisions

The reasoning that turns returned reports into a roadmap. Applies to R3 (one report → v1) and R6 (many reports → v2); G4 applies §1, §2 and §5 in their general form. Read all of it before writing either roadmap document.

## Contents
- §1 Reading protocol and the verdict ledger
- §2 The evidence hierarchy (how to rank features)
- §3 Sequencing logic (waves, gates, dependencies)
- §4 Going beyond the research (where your judgment must add)
- §5 Red-team discipline (what to distrust)
- §6 The strategic reframe test
- §7 Completeness checks before you ship the document

---

## §1 Reading protocol and the verdict ledger

**Read every report yourself, in full, sequentially.** Do not delegate reading to sub-agents and do not skim executive summaries only — the synthesis quality depends on holding every finding in one context so cross-report contradictions and reinforcements surface. Batch two reports per read step for efficiency.

As you read, maintain a **verdict ledger** — one entry per report:

| Field | What to capture |
|---|---|
| Verdict | The report's recommendation in its own vocabulary: build / skip / partner / enter / defer / go-with-controls / build-on-free-data / license / per-jurisdiction split |
| Load-bearing findings | 3–5 findings *with their numbers* (prices, thresholds, dates, percentages). A finding without its number can't be ranked later. |
| Named gates | Everything the report says must happen before building: counsel review, partnership, POC, certification, design-partner validation, feasibility spike |
| Whitespace confirmed | Capabilities the report confirms NO vendor provides (these are your differentiators) |
| Contradictions | Anything conflicting with another report or with your product knowledge — resolve explicitly, never silently pick one |
| Suspect claims | Load-bearing numbers with weak/unverifiable citations → carry into the risks section as "verify before committing" |

Also re-read the current roadmap and R1 grounding notes *after* the reports — you will now see them differently.

## §2 The evidence hierarchy

When ranking features, evidence type beats enthusiasm, always. From strongest to weakest:

1. **Statutory deadline with a penalty** — enacted regulation, dated phase-in, named enforcement. Creates *budgeted, non-discretionary* demand. (Compliance spend overrides discretionary budgets.) Highest priority almost regardless of build cost.
2. **Deal-blocking table-stakes gap** — a capability whose absence loses otherwise-winnable deals against a named competitor. Verify it's genuinely blocking (customer quotes, lost-deal evidence), not merely present in competitor matrices.
3. **Evidenced pain + confirmed whitespace** — direct customer quotes describing a manual/broken workflow AND research confirming no vendor solves it. The differentiator class; the best of these are *structurally* defensible (see §4.3).
4. **Competitor shipping signal** — an incumbent shipped/announced it and early reception is positive. This is parity pressure, not opportunity; weight by whether the incumbent's version actually works (their reviews say) and whether you have a structural angle.
5. **Emerging-shift positioning** — evidenced trend, pre-competitive window. Time it: differentiating now, table stakes in ~2 years means build early but don't bet the wave on it.
6. **`<INFERENCE>`-tagged reasoning** — allowed into the backlog, never into a wave headline, until validated by design partners.

Two modifiers cut across the hierarchy:
- **Strategic-prize adjustment**: a feature's value includes what it converts to later (a pre-IPO module's real prize is the listed-tenant subscription at IPO; a data-spine feature is worth more than its direct demand because other pillars stand on it).
- **Margin realism**: any feature dependent on licensed data must clear redistribution-terms + unit-economics checks *first*. "Build on free/regulatory data for v1, license selectively later per quote" is the default posture when the research shows vendor terms hostile to SaaS redistribution.

## §3 Sequencing logic

1. **Identify the platform primitives** — capabilities multiple pillars consume (a linking engine, an ingestion spine, an entitlement system, a metering layer). These go in the earliest wave even if their direct demand evidence is weaker, because everything behind them stalls otherwise. Say so explicitly in the document ("load-bearing").
2. **Recalibrate to the real constraint.** Ask (or infer from the user) what the delivery cadence actually is. If AI-accelerated delivery makes engineering fast, the schedule constraint becomes **external gates**: counsel opinions, partnerships/API access, certifications, design-partner validation, feasibility spikes. Then:
   - Collect every gate from the verdict ledger into a **gates track** that starts in wave 1, all threads in parallel, regardless of when the gated feature ships.
   - Declare waves **re-orderable**: "a feature ships the moment its gates clear; pull forward anything whose dependencies resolve early."
3. **Wave themes, not strict phases.** Group by strategic story (e.g. "the relationship layer", "the governance land-grab") so each wave is marketable and coherent, roughly 6–8 weeks at high cadence.
4. **Order pillars by**: anchor-category strategic value → buyer-adjacency (same buyer as an existing module = cheaper land) → gate-readiness → validation status. A pillar whose verdict is "enter, no external dependencies" beats a bigger pillar gated on a partnership.
5. **Phase risky items behind their own POC gates** taken from the research's caveats (e.g. a simulator ships only after calibration back-testing; a US integration only after a feasibility spike on its single point of failure). Name the gate and the kill-condition in the feature entry.
6. **Two-sided and compounding features get a tie-break bump**: features that serve the buyer while enriching the end-user surface, and features that make *other* features better (memory, data core, workflow composer).

## §4 Going beyond the research

The research is outside-in. Four moves only you can make:

1. **Derive the implied feature.** A statistic that describes an adoption blocker implies a *product* that removes the blocker. (Worked example: "82% of teams have no AI policy; hallucination fear blocks adoption" → productise the platform's existing internal guardrails as a Governance & Trust Pack — audit ledger, approval gates, policy templates — because the underlying data already exists in the codebase. The research never named it; the roadmap led with it.)
2. **Pair complements the research treated separately.** If one finding fills a funnel (data ingestion) and another retains it (engagement surface), ship them the same wave and name the combined story — the sum is a wedge, the parts are features.
3. **Prefer structural defensibility.** For every differentiator ask: *what stops the incumbent copying this in a quarter?* Good answers: data the incumbent structurally lacks (registry truth vs 45-day filings), a legal/jurisdictional posture they can't adopt (sovereignty), owning both sides of a workflow, a trust architecture that IS the product (privilege quarantine, citation-gated refusal). Feature-race wins with no structural answer get demoted or reframed until they have one.
4. **Translate commercial findings into product workstreams.** Pricing/packaging research isn't just GTM: modular entitlements, usage metering, migration importers, and parallel-onboarding support are *engineering features* and must appear as numbered items with the same rigor.

And the standing constraint to bake into every agentic feature spec: **agents propose, humans publish.** Autonomy dials default conservative; approval gates on anything customer-visible or filed. Every research stream in regulated domains converges on this boundary — encode it rather than rediscovering it per feature.

## §5 Red-team discipline

Deep-research reports look authoritative and are partly wrong. Standing rules:

- **Citation skepticism**: fabricated-but-plausible customer quotes and URLs are a known failure mode. Any number that would change a build decision (a price, a threshold, an API's existence) gets flagged "verify before committing" in the risks section, and reports gating real spend get an explicit red-team recommendation.
- **Status-tag audits**: on regulatory reports, check every ENACTED claim against the primary text before treating a deadline as a catalyst. PROPOSED→ENACTED upgrading is the most dangerous single error, because the hierarchy in §2 puts statutory deadlines on top.
- **Empty-tag detection**: Gemini sometimes emits literally empty `<MISSING_DATA></MISSING_DATA>` tags — the gap existed but the content was dropped. Note the section it appears in; the gap is real even if unstated.
- **Vendor-authored evidence**: when a report's pain-point evidence traces mostly to one vendor's own blog (it happens — an entire corporate-access literature can be one company's content marketing), keep the findings but mark confidence down and say why.
- **Conflicts between reports**: resolve explicitly in the document (usually by scoping: "report A's verdict holds for AU, report B's for US"). Never average them.

## §6 The strategic reframe test

Before writing a v2, ask: **do the reports collectively support a bigger thesis than "extend the product"?** Signals that they do: multiple reports independently identify the same buyer consolidating multiple subscriptions; stack-cost evidence quantifies the consolidation prize; several verdicts share one structural moat (own-data, sovereignty); adjacent-category reports say the boundary between categories is the opportunity. If ≥3 signals, lead the document with the reframe, name it memorably, and enumerate the compounding moats. If not, keep the frame and say why you kept it — a forced reframe is worse than none.

## §7 Completeness checks before shipping the document

- [ ] Every verdict in the ledger landed somewhere: a feature, a deprioritised row with rationale, or a named risk. Nothing silently dropped.
- [ ] Every feature entry is triage-ready (see roadmap-template §3 for the field list) — a reader could write a spec from it without reopening the research.
- [ ] Platform primitives are in the earliest wave and marked load-bearing; dependents reference them by ID.
- [ ] The gates track exists, starts in wave 1, and every gate named in the ledger appears in it.
- [ ] Deprioritised table covers: hostile-economics items, legally-structural dead ends, build-vs-integrate rejections, autonomy boundaries, and anything from the previous roadmap being dropped.
- [ ] Risks include: gate slippage, the load-bearing unverified claims, single-point-of-failure spikes, absorption/adoption risk if the wave count is aggressive, and awake-incumbent risk with the structural-vs-race distinction.
- [ ] Immediate actions (this week) are concrete: which gate threads to open, which features to triage first (the load-bearing ones), which spikes to run.
- [ ] The closing summary to the user states the reframe, how each report landed, what you added beyond the research, and the first triage batch.
