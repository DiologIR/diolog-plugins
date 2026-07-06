# Research Prompt Patterns

How to author the three prompt types this pipeline uses. §1 is the shared framework (use it directly if the `deep-research-prompt-creator` skill is unavailable; if it IS available, invoke it and apply the overrides in §2–§4 on top). §2–§4 are the pipeline-specific prompt shapes with worked skeletons.

## Contents
- §1 Shared framework — the prompt skeleton every research prompt uses
- §2 The strategic roadmap prompt (R2)
- §3 The high-volume ideation prompt (R4)
- §4 Drill-down prompts + INDEX (R5; G3 uses the per-prompt structure and INDEX conventions)
- §5 Operator Notes — what to coach after every prompt

---

## §1 Shared framework

Every prompt is one self-contained block Gemini Deep Research executes in a single ~30-minute background run. Pseudo-XML tags are load-bearing (they survive Gemini's plan-compression step better than markdown headings). The skeleton, in order:

```
<role>            senior analyst + who the output is for + what decision it informs
<context>         2–4 sentences MAX (~150 words). Who, why, segment, constraints. Context bloat degrades output.
<core_directive>  ONE sentence. The anti-drift anchor. REPEATED VERBATIM at the very end of the prompt.
<research_questions>  1 primary (restates the directive) + 3–7 secondary. Numbered. >8 causes context rot.
<scope_and_boundaries>  <include> / <exclude> / <time_horizon>
<source_discipline>     <prioritise> / <deprioritise> / <criteria_match_validator>
<depth_requirements>    quantitative data, named sources, confidence qualifier (High/Medium/Low) on every claim
<analysis_lens>         HOW to think about findings — the force multiplier section, invest here
<epistemic_bounding>    the tag set: <MISSING_DATA> <INSUFFICIENT_EVIDENCE> <CONFLICTING_EVIDENCE> <CONFIDENCE:LOW> <INFERENCE>
<citation_protocol>     inline <cite url="..."> at the point of every claim; UNVERIFIED form; never a bibliography-only
<output_format>         exact section list incl. Executive Summary (confidence-led bullets), Evidence Table, Knowledge Gaps, Next Steps
<constraints>           no fabricated citations; present both sides of conflicts; no filler
<core_directive>        REPEAT verbatim — re-anchors attention during synthesis after 30 min of searching
```

Rules that matter most (they exist because of observed Gemini failure modes):

- **Rigid macro-skeleton, loose micro-prose.** Specify headings, table columns, tag taxonomies — never per-paragraph word counts. Over-specification degrades output.
- **Positive framing** except the SEO/aggregator exclusion, which is a load-bearing negative constraint: deprioritise listicles/vendor comparison pages, label as `[SECONDARY: promotional]`, corroborate with primary sources.
- **Inline citations only.** End-of-report bibliographies are where citation-stripping hides.
- **Never allow estimation without bounds.** "Estimate if unavailable" invites hallucinated statistics; the epistemic tags are the pressure valve.
- **Archetype overrides**: competitive/market → filed financials + organic review mining (G2/Capterra/Reddit) + direct customer quotes contrasted with vendor positioning + "at least two underserved gaps"; technical deep-dive → official docs, patents, GitHub issues, engineering blogs, exact limits/latency/pricing verbatim, comparison table; regulatory → primary legal texts only, every finding tagged `<ENACTED>`/`<PENDING>`/`<GUIDANCE>`/`<PROPOSED>`, end with `<REGULATORY_MAPPING_ONLY>` disclaimer. Pick ONE archetype per prompt; two-archetype scope means two prompts.

## §2 The strategic roadmap prompt (R2)

Archetype: competitive/market. One prompt, one run. The distinctive elements beyond the shared framework:

1. **The exclusion block is a first-class tag.** Add `<existing_product_surface>` (or embed in scope `<exclude>`) listing every shipped area from R1 grounding, prefixed: *"do NOT recommend building these; treat them as the baseline and only recommend meaningful extensions or genuinely new capabilities."*
2. **Internal docs win conflicts.** Constraint: *"The <existing_product_surface> inventory is authoritative about what the product has built; if public web sources describe it differently, the inventory wins."* Without this Gemini overwrites your ground truth with stale public data.
3. **Name the competitor set concretely** (6–8 vendors) in a research question, not just "competitors" — otherwise the plan generalises to "IR software vendors" and returns mush.
4. **Analysis lenses to include** (adapt wording to the product):
   - *Differentiation over parity* — weight moat-extending features above catch-up; flag genuinely deal-blocking table stakes.
   - *Team-size feasibility* — the buildable-per-quarter reality; prefer few high-conviction recommendations.
   - *Willingness to pay by segment.*
   - *Two-sided leverage* — features serving the buyer while enriching the end-user surface compound.
   - *Regulatory catalysts* — dated, budgeted obligations create purchasable demand.
   - *≥2 underserved gaps no vendor provides.*
5. **Output format additions**: a Competitor Feature Matrix (capability × vendor, cells shipped/announced/absent/unknown, evidence URL column) and a Prioritised Roadmap Recommendations table (max ~10 rows: rank, feature, evidence basis, segment, differentiating-vs-table-stakes, confidence) followed by a reasoning paragraph per row with suggested sequencing.

## §3 The high-volume ideation prompt (R4)

Same archetype, different objective: **volume of evidenced ideas**, not one ranked answer. Differences from §2:

1. **Core directive names a floor**: *"Produce a catalogue of at least 40 distinct, evidence-backed new feature ideas…"* A floor pushes padding, so pair it with:
2. **The `<INFERENCE>` safety valve**: *"Ideas supported only by reasoning are acceptable in the catalogue but MUST carry the <INFERENCE> tag with the reasoning chain shown."* Constraint: *"Every catalogue row needs real evidence or an explicit <INFERENCE> tag — an idea with neither should be cut."* And: *"Ideas must be distinct: a capability and its obvious sub-features are one row, not five."*
3. **The exclusion block doubles**: existing surface + committed roadmap items, in a dedicated `<existing_surface_do_not_repropose>` tag.
4. **Research questions widen the aperture** — these four branches are the ones Gemini most often collapses; each must be its own numbered question:
   - **JTBD mining**: what do the personas still do OUTSIDE any platform — Excel, email, PowerPoint, consultants, agencies? (List candidate jobs in the question itself: board reporting, roadshow logistics, earnings prep, guidance management, IPO readiness…)
   - **Competitor shipping signals**: changelogs, release notes, help centers, webinars, and **job postings** (they reveal what vendors are building).
   - **Adjacent-category transfer**: name the adjacent vendors explicitly (governance portals, reporting suites, market-intelligence tools, registries, AGM providers, plus horizontal patterns like sales-engagement sequences applied to the domain).
   - **End-user complaints**: what do the customer's customers complain about (app-store reviews, forums) that the platform could solve?
   - Plus: **emerging shifts** that open categories no vendor serves yet.
5. **Analysis lenses**: *evolution adjacency* (every idea names which existing area it extends, or NEW-PILLAR), *AI-first reimagination* ("where incumbents offer a manual or managed-service workflow, the 10x agentic version is the idea — not feature parity"), *team-of-one economics*, *fast-iteration fit* (flag long-lead data/partnership dependencies), *whitespace* (≥5 capabilities NO vendor in the full set provides).
6. **Output format**: the catalogue table grouped into 6–10 theme clusters — columns: # / Idea / What it does (1–2 sentences) / Evidence of demand / Evolves (area or NEW-PILLAR) / Segment / Differentiating-or-table-stakes / Buildable fast? / Confidence — plus "Top 15 Deep-Dives" (a paragraph each) and "Whitespace Findings".

## §4 Drill-down prompts + INDEX (R5 and G3)

Each drill-down answers ONE decision. Scoping discipline is everything: a prompt that spans two archetypes or two decisions returns shallow mush.

**Derivation checklist** (run against the ideation report):
- [ ] One prompt per theme cluster large enough to become a module/pillar → competitive/market archetype; core directive shaped as *"Determine whether <product> should build X, and if so exactly which capability set wins against <named incumbents>"*.
- [ ] One per whitespace finding whose open question is feasibility → technical deep-dive (architecture, security, cost envelopes) or regulatory mapping (legal plumbing), NOT more market evidence.
- [ ] One per tagged knowledge gap that gates spend → usually technical/data-landscape (vendor coverage, API capability, **redistribution terms** — the gate for any data-powered feature — and indicative cost; expect `<MISSING_DATA>` on pricing and say a tagged gap is the correct output).
- [ ] One pricing/packaging prompt if the strategy implies consolidation/new modules → stack-cost evidence (filed financials of public vendors are the underused source), packaging mechanics of incumbents, consolidation precedents from other verticals (name candidates: HubSpot, Rippling), AI-capability pricing practice.

**Per-prompt structure** (each its own md file, `deep-research-prompts/NN-slug.md`):
1. A one-paragraph header note above the fence: what question this answers, which ideation theme/whitespace/gap it drills into, the archetype, "paste the code block into Gemini Deep Research verbatim".
2. The fenced prompt (full §1 skeleton — every drill-down is self-contained; never reference "the previous report" because Gemini won't have it).
3. Operator Notes below the fence (§5), including run-specific plan-review checks — name the specific branch Gemini is most likely to drop for THIS prompt.

**Cross-cutting details that make the set coherent:**
- Exclusion blocks now say "evaluate only the delta" over both existing surface and committed items.
- **Beachhead sequencing lens** for anything two-jurisdiction: instruct the research to treat jurisdictions as separate feasibility verdicts and identify the smallest lawful/viable first version.
- **Coverage-boundary mapping lens** for adjacent-category prompts: "for each incumbent, state precisely where its responsibility ends — the product lives in those seams."
- Ask for an explicit **verdict** in the executive summary (build/skip/partner; go/go-with-controls/no-go; enter/defer; per-domain build/license/skip) — the synthesis phase (R6/G4) consumes verdicts.

**INDEX.md** contains: a table (# / file / question it answers / archetype / what it feeds), a suggested run order in waves by decision-urgency (biggest strategic calls first), **cross-run reconciliation warnings** (e.g. three prompts touching the same data vendors → reconcile licensing findings before any vendor conversation; a prompt whose partner meetings overlap an in-flight partnership → combine the asks), and the after-each-run instruction: paste the report back for (1) citation red-team, (2) codebase-grounded feasibility scoring.

## §5 Operator Notes — coach these after every prompt

1–3 sentences each, only what applies:
- **Plan Review pause** — always. When Gemini shows its research plan, pause and edit: prune tangents, re-split branches it merged. Name the branch most at risk for this specific prompt (ideation prompts: JTBD/adjacent/end-user branches collapse into "analyse competitors"; regulatory prompts: jurisdiction split collapses into one; pricing prompts: filed-financials branch dropped).
- **Adversarial audit** — for anything gating real spend: paste the report back to Claude to verify citations exist at the cited URLs, check matrix cells against vendor docs, stress-test confidence qualifiers. Gemini's known failure modes (aggregator reliance, fabricated customer quotes, PROPOSED→ENACTED upgrades) are invisible to Gemini itself.
- **Volume-vs-evidence warning** for floor-count prompts: untagged, uncited rows are suspect.
- **Decomposition** — if a branch comes back thin, run a second narrow pass with the same role/context and a new core directive; never widen the original prompt.
- **What this run can't see** — internal usage data, codebase reality; name the inside-out pass that pairs with the outside-in report.
