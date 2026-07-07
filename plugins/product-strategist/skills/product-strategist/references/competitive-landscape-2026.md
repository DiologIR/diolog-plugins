# Competitive, Market & Regulatory Landscape — AI-Assisted IR Software

**As-of date: July 2026** (deep-research pass, 7 July 2026). **This file supersedes the regulatory dates and tool-ecosystem descriptions in `ir-workflows-research.md` and `roadmap-research.md` wherever they conflict.** If the current date is more than ~6 months past the as-of date, flag potential staleness — especially the regulatory table and vendor ship-dates — and recommend a refresh before using them for sequencing decisions.

## Contents

- §1 Vendor teardown: what shipped Jan 2024 – Jul 2026
- §2 Competitive capability matrix
- §3 Practitioner sentiment & the human-in-the-loop boundary
- §4 Adoption data 2025–26
- §5 Regulatory obligation table (ENACTED / PENDING / GUIDANCE)
- §6 Underserved gaps — the sub-200 segment
- §7 AI-native roadmap economics
- §8 Moat re-map: what the market evidence changes

---

## §1 Vendor Teardown: What Shipped Jan 2024 – Jul 2026

**Q4 Inc.** — enterprise moat via proprietary data gravity. Acquired Virtua Research (late 2024) for collaborative consensus analytics and financial modelling. Shipped (10 Jun 2026) "Knowledge Base": a grounding layer letting IR teams upload org charts, strategy docs, and perception studies so its "Q" AI agent retains cross-session context — a direct fix for prompt fatigue and generic outputs. Also shipped EU data residency, European shareholder-surveillance tooling, and a 100k-contact EU refresh. Positioning: strictly enterprise (ASX 50 / S&P 500 scale), SOC 2. **Read-across: grounded knowledge-base ingestion is now the enterprise table-stake for credible IR AI.**

**FactSet / Irwin** — Irwin acquired by FactSet 5 Nov 2024 (net US$120.2M); by Feb 2025 the combined client base reached 8,645 entities / 219k users. FactSet shipped "Mercury" (agentic conversational knowledge engine at terminal level), "Pitch Creator" (Q2 2025 — automates model-analysis extraction into presentations), and GenAI Data Packages / conversational APIs. Deeply defensible, but indexed toward buy-/sell-side institutional workflows, not corporate compliance. **Read-across: the mid-market IR CRM (old Irwin) has been absorbed upmarket — its former segment is loosening.**

**Nasdaq IR Insight / Corporate Solutions** — by end-2025: generative peer-event summaries, market-dynamics monitoring, automated earnings prep. ESG suite ("Metrio", "Sustainable Lens") benchmarks disclosures against 9,000+ companies across regulatory frameworks. **Read-across: summarisation and peer benchmarking are now parity, not differentiation.**

**Notified** — invented a new category: Answer Engine Optimization (AEO). Its May 2026 study of 8,000+ GlobeNewswire releases found 99.3% were cited by foundation models (ChatGPT/Claude), average time-to-first-citation 8 hours. Shipped "AI Press Release Optimizer" (mid-2026) scoring drafts against its SOAR framework; optimised structure lifted citation volume ~15% without changing the narrative. **Read-across: how AI models read and cite disclosures is itself now an IR outcome — an open feature space for announcement-drafting products.**

**EQS Group** — EU RegTech consolidator: acquired Daato (sustainability software) and OneTrust's Ethics & Compliance division (Dec 2024). Shipped an AI Risk Management module (23 Mar 2026), Compliance Cockpit analytics (24 Mar 2026), and "Q by EQS" agentic compliance workflows incl. whistleblower Integrity Line (22 Jun 2026). Defensible in EU compliance. **Read-across: compliance-native agentic AI is being validated as a product category in an adjacent jurisdiction.**

**InvestorHub** (Melbourne; ASX + LSE mid/small-cap) — rebranded from Fresh Equities; ~$9M Series A closed with a $4M extension mid-2024 (EVP, Archangel, Flying Fox). Thesis: 99% of retail investors are "unintentionally ignored" by intermediary-centric IR. Expanded ML through 2025–26: prediction modelling, direct-to-investor campaign efficiency, automated insights. **Read-across: the most direct ASX-native competitor for the sub-200 segment; its moat is retail engagement, not compliance intelligence.**

**Diligent** (board governance) — shipped "Smart Risk Scanner" (auto-flags legal/operational risks in board materials pre-distribution) and "SmartPrep" (personalised strategic questions per director from historical patterns). Its Q4 2025 Business Risk Index: 60% of legal/compliance leaders rank technology & AI governance their top risk — above economic factors. **Read-across: board-level demand for AI-governance tooling is empirically the top-of-mind risk.**

**Ansarada → Drova** — Ansarada acquired by CapVest-backed Datasite (Aug 2024, A$2.50/share) for its data-room business; the ESG/GRC/Board products were carved out to founder Sam Riley for **A$0.5M** and relaunched as "Drova" (AI-driven risk/compliance/strategy execution). **Read-across: enterprise M&A tech has abandoned integrated GRC — a vacuum exists for an AI-first compliance platform serving the ASX.**

**Computershare/Georgeson & Sodali & Co** — Georgeson's 2026 Early Proxy Season Review: E&S proposals fell sharply while traditional governance proposals surged to 51% of submissions. Sodali now advises issuers that **proxy advisors are deploying AI to screen corporate disclosures**, pushing machine-readable reporting formats. **Read-across: the *readers* of disclosure are becoming machines — machine-legibility of announcements is an emerging requirement.**

## §2 Competitive Capability Matrix

| Vendor | AI Capability | Ship Date | Segment | Moat Class |
|---|---|---|---|---|
| Q4 Inc. | Knowledge Base grounding + EU residency | Jun 2026 | Enterprise | Defensible |
| Q4 Inc. | Q agent, earnings co-pilot, peer summaries | 2024 | Enterprise | Parity |
| FactSet/Irwin | Pitch Creator (model→deck automation) | Q2 2025 | Institutional/mid | Defensible |
| FactSet/Irwin | Mercury conversational engine | Early 2025 | Institutional | Differentiated |
| Nasdaq | Peer-event summaries, earnings prep, ESG benchmarking | 2025 | Enterprise | Parity |
| Notified | AI Press Release Optimizer (AEO/SOAR) | Mid-2026 | Mid/enterprise PR | Differentiated |
| EQS | Q by EQS agentic compliance + risk modules | Mar–Jun 2026 | EU RegTech | Differentiated |
| Diligent | SmartPrep, Smart Risk Scanner | 2025–26 | Enterprise boards | Parity |
| InvestorHub | Retail prediction modelling, D2I campaigns | 2024–25 | ASX sub-200 | Differentiated |
| Drova (ex-Ansarada GRC) | AI risk/compliance/strategy platform | 2025– | ASX/GRC | Emerging |

(Pricing across the set is opaque enterprise ACV — treat any specific figure as unverified.)

## §3 Practitioner Sentiment & the Human-in-the-Loop Boundary

- **The verification burden contradicts vendor time-saving claims.** Organic practitioner discourse (r/auscorp): *"It takes LONGER to debunk all the crap in it than it would have taken just for everyone to use their actual brains"* — ungrounded AI turns professionals into full-time fact-checkers. The named root cause: absence of grounded context ("If you don't know your own project scope, it doesn't know either").
- **Trust erosion is the sociological risk.** Advisory professionals report clients generating parallel AI answers mid-consultation; if AI outputs feel commoditised, the premium on the IR officer's judgment is threatened. Irwin's own line: *"AI will not replace the IRO… the programs that pull ahead hand the gathering to the machine and reserve the judgment for the practitioner."*
- **The hype cycle has matured.** G2 data: "AI hallucination" mentions in negative reviews fell from 35% (Mar 2025) to 8.3% (Oct 2025). Users now value AI matter-of-factly for removing friction from mundane tasks — not for grand strategy.
- **The market has drawn the autonomy line.** Vendors push toward Auto-Pilot (justifies premium pricing); practitioners demand Co-Pilot (assistive augmentation). In ASX context an autonomous unverified external communication is a continuous-disclosure breach. **Any feature concept that crosses from synthesis/drafting into autonomous external action is fighting both the regulator and the customer.**

## §4 Adoption Data 2025–26

| Finding | Source | Note |
|---|---|---|
| 78% of Australasian IR pros have enterprise AI access (Copilot dominant); 64% "Emerging" maturity, 35% "Developing", 1% "Advanced" | AIRA Benchmarking Survey, Sep 2025 | Baseline for ANZ |
| Only 3% have an IR-specific AI policy; 82% no policy at all | AIRA, Sep 2025 | The single biggest quantified gap in the market |
| 51% of global IR professionals had formally embedded AI agents/systems in workflows by early 2026 (up from 30% in early 2024); only 2% have no plans | Nasdaq IR Intelligence 7th Global Issuer Pulse, Q4 2025 (~700 respondents) | Resistance has evaporated; the question is governance, not adoption |
| Strongest current use cases: drafting Q&A docs, CEO scripts, sentiment monitoring, initial earnings-announcement drafts | AIRA 2025 | Matches the "administrative compression first" thesis |
| IR remit is expanding (finance alignment + sustainability reporting) while resources stay lean | Nasdaq/NIRI 2025–26 | AI is a necessity response, not a luxury |

## §5 Regulatory Obligation Table

All items flag-and-escalate; this is regulatory mapping, not legal advice.

| Obligation | Status | Effective | Affected | Exposure |
|---|---|---|---|---|
| **AASB S2 / CRFD Group 1** (audited sustainability report with annual financials) | ENACTED | FY from 1 Jan 2025 | Consol. revenue >$500M | Up to $15M or 10% turnover (civil); director liability. 259 first-wave reports lodged by May 2026; ASIC observes wide quality variability and demands stronger links between climate data and capital-allocation decisions |
| **AASB S2 Group 2** | **ENACTED — live now** | FY from **1 Jul 2026** | Revenue $200–500M | Same penalty regime. Directors have a 3-year modified-liability window (regulator-only enforcement) for Scope 3, scenario analysis, forward-looking transition plans |
| **AASB S2 Group 3** | ENACTED (phase-in) | FY from 1 Jul 2027 | Revenue >$50M | Same; smaller entities = template-based product opportunity |
| **ASX LR 17.5 amendment** | ENACTED | Jan/Feb 2026 | All listed | Late sustainability report no longer auto-suspends securities (decoupled from late financials) |
| **Privacy Act — ADM disclosure** | ENACTED (grace ends) | Enforceable **11 Dec 2026** | All Privacy-Act-captured entities | Privacy policies must disclose automated/AI-influenced decisions about individuals; statutory tort for serious invasions now exists |
| **Privacy Act Tranche 2** (incl. small-business exemption removal) | PENDING | In consultation | Small businesses | Will pull sub-scale customers into full APP compliance |
| **ASIC AI/cyber resilience open letter** | GUIDANCE | 8 May 2026 | AFS licensees / market participants | Baseline controls + third-party AI sub-processor risk; AI-governance failure framed as breach of the "efficiently, honestly and fairly" (EHF) licensing standard → direct enforcement (cf. FIIG Securities $2.5M). Aligns with APRA CPS 230 (Apr 2026 directives) |
| **ASX Group inquiry final report** | ENACTED (findings) | 31 Mar 2026 | ASX / market infra | ASX found to have compromised infrastructure resilience for shareholder returns; $150M capital charge. Read-across for vendors: extreme regulatory hostility to infrastructure failure — Tier-1 uptime is now a due-diligence gate |
| **LR 3.1 + AI trading** | GUIDANCE | Current | All listed | Legal consensus: AI/bot-driven price moves do not alter the "reasonable person" materiality standard; a bot hallucinating data ≠ new material information requiring response |

**Sequencing implication:** Group 2 is no longer a roadmap deadline — it is *in force*. The live opportunities are (a) Group 2 first-cycle execution pain (happening now), (b) Group 3 preparation (deadline Jul 2027 — genuine Tier-1 Cost-of-Delay item), (c) ADM disclosure readiness before 11 Dec 2026 for any AI feature making decisions about individuals, and (d) EHF-standard AI governance as a continuous obligation.

## §6 Underserved Gaps — the Sub-200 Segment (60%+ of ASX entities)

Practitioner-evidenced needs no vendor in the set serves well:

1. **Compliance-by-design disclosure protection.** Sub-200 CFOs/Company Secretaries measure IR success as "consistently zero" disclosure incidents (no LR 3.1B price-query letters) and a compressed cost-of-equity premium — not institutional fund-flow analytics. They want workflows that *prevent* incidents.
2. **Direct retail shareholder activation.** Retail is the liquidity base of small-cap equities, yet 99% of retail investors are ignored by intermediary-centric legacy processes. Only InvestorHub plays here.
3. **Out-of-the-box AI governance.** The 82% policy void + fear of regulatory liability + no internal legal resources ⇒ demand for a platform that *inherently enforces* governance: hardcoded permission architectures, automated redaction, locked audit trails, shipped policy templates. This converts ASIC's EHF pressure from a customer's problem into a vendor's feature.

## §7 AI-Native Roadmap Economics

- **Per-seat pricing decays under AI tokenomics.** AI COGS scales with token consumption, so flat per-seat pricing makes the most successful customers the least profitable. Packaging is shifting to hybrid consumption models with FinOps guardrails: monthly spend caps, per-agent budgets, auto-disable kill switches for runaway agentic loops. Enterprise multi-agent deployments run US$110k–550k/month at Fortune-500 scale; even re-embedding 10M vector chunks after a model upgrade is an immediate unrecoverable cost. **Feature-scoring implication: an AI feature's Effort estimate must include its ongoing inference COGS and pricing-model fit, not just build cost.**
- **Eval-gated releases.** AI-first teams gate every prompt change and model upgrade behind shadow-mode regression evals (LLM-as-judge over thousands of cases; faithfulness/relevancy axes), with a locked human-rated holdout set (~100 cases) to prevent Goodharting, and interpret score deltas through confidence intervals (a 2-point shift inside the 95% CI is a random walk, not progress). A ~2,000-case pre-deploy suite costs ~$100 in API fees — cheap insurance against shipping a 6% regression to regulated customers. **Roadmap implication: for any AI feature, the eval harness is a build prerequisite — sequence it as a dependency, and treat "model upgrade absorption" as recurring protected capacity alongside tech debt.**
- **Model uncertainty is a planning variable.** Capability improvements and provider changes arrive on external timelines; roadmap items that depend on frontier-model behaviour should carry an explicit model-dependency note and a degradation plan.

## §8 Moat Re-Map: What the Market Evidence Changes

Applying §1–§3 evidence to the persona's Competitive Moat Assessment (persona §4.3):

| Capability class | 2024 status | Mid-2026 status | Evidence |
|---|---|---|---|
| Generic AI drafting / summarisation / chat wrapper | Differentiation | **Commodity/Parity** | Q4, Nasdaq, Diligent all ship it; G2 sentiment treats it as matter-of-fact |
| Peer benchmarking, sentiment monitoring | Parity | Parity | Nasdaq ESG benchmarking vs 9k companies |
| Grounded proprietary-data ingestion (customer's own corpus feeding the AI) | Emerging | **Defensible table-stake** | Q4 Knowledge Base; the verification-burden complaint is exactly what grounding fixes |
| Compliance-by-design AI (hardcoded HITL, audit trails, redaction, governance templates) | Diolog thesis | **Defensible + regulator-tailwind** | EQS validates the category; ASIC EHF framing makes governance a licensing issue; 82% policy void |
| Machine-legible disclosure / AEO | Did not exist | **Differentiated open space** | Notified 99.3%/8hr citation data; proxy advisors screening disclosures with AI |
| Retail shareholder activation (sub-200) | Neglected | Differentiated, one player | InvestorHub |
| Integrated GRC for listed entities | Contested | **Vacuum** | Ansarada carve-out → Drova at A$0.5M |
| Multi-exchange regulatory intelligence engine | Diolog moat | Still defensible — no vendor in the set ships it | Absence across §1 |

**Citation convention when using this file:** `[Source: Competitive Landscape 2026 §N]`.
