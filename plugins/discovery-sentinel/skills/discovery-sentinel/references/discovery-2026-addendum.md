# Deep Research 2026 Addendum — B2B SaaS Product Discovery

**As-of date: July 2026.** This addendum refreshes and extends `deep-research.md` (compiled March 2026) with findings from a July 2026 deep-research pass. **Where this file and the original corpus disagree on dates, regulatory status, or method guidance, this file wins.** If the current date is more than ~6 months past the as-of date, flag potential staleness (especially §6 regulatory items) in your output.

## Contents

- §1 Methodology updates (product operating model, SPICEY, Shape Up critique, Confidence Meter 2026)
- §2 AI-augmented feedback analysis
- §3 Synthetic users: the paradox and the data-grounded rule
- §4 AI-product interaction telemetry as discovery data
- §5 Decision-grade rigor in micro-TAM markets
- §6 2026 Australian privacy & regulatory matrix for discovery research

---

## §1 Methodology Updates

**Product operating model vs project inertia.** Cagan's *Transformed* frames transformation on three axes: how you build (small, frequent, independent releases), how you solve problems (teams own outcomes, not feature specs), and how you decide what to solve (insight-driven continuous strategy). The dominant failure mode remains organisations adopting product-management *nomenclature* while retaining project bureaucracy — producing "discovery theatre" where research exists to validate pre-ordained executive decisions. [Source: Cagan/SVPG; Product Talk 2025–26]

**SPICEY (Torres).** For teams trapped in feature-factory cultures, Torres's SPICEY framework is the pragmatic adoption path: surface hidden assumptions explicitly, build momentum via localised "bright spots" (automate interview recruitment, run trio interviews together) that demonstrate value to skeptics, and map outcomes to discovery activities to bring stakeholders along. Use it when a client team says "we can't do continuous discovery here." [Source: producttalk.org/spicey-framework]

**Shape Up critique (2025–26 consensus).** Shape Up's separation of "shaping" (senior, pre-development) from building has drawn sustained criticism in complex/regulated B2B: it divorces implementation teams from customer-problem context, paradoxically reducing autonomy, and its aggressive discovery/delivery decoupling cannot accommodate continuous compliance sign-offs and dynamic risk mitigation. Current practitioner view: effective for low-risk internal tooling; **incompatible with the evidentiary demands of regulated enterprise SaaS** — except for its narrow, still-valid use as a scope-discipline device against fixed regulatory deadlines (fixed appetite, variable scope, core mandate must ship). [Source: saas.group podcast w/ Singer; tulv.io; Forasoft 2026]

**Confidence Meter — 2026 evidence-classification refinement.** The canonical Gilad scale in `persona.md` §1.3 stands (opinions ≤0.1 → behavioural 3.0–10.0). The 2026 elaboration maps evidence classes onto actionability tiers:

| Evidence Classification | Representative Sources | Score | Actionability |
|---|---|---|---|
| Near zero | Self-conviction, executive opinion, sporadic feature requests | 0.1–0.5 | Hypothesis generation only |
| Low | Anecdotes, small-N unmoderated feedback, unstructured surveys | 1.0–1.5 | Minor reversible tweaks; run structured qual before capital |
| Medium | **Thematic saturation in expert interviews**, high-fidelity prototype tests, early-access cohort data | 2.0–5.0 | Mid-tier engineering investment; beta rollouts |
| High | A/B significance, mass behavioural telemetry, **verifiable tool-call data** | 8.0–10.0 | Full commercialisation, architecture change |

Two additions worth internalising: (a) *thematic saturation across independent expert interviews* is explicitly recognised as medium confidence — critical in micro-TAM markets where behavioural A/B volume is unreachable; (b) *tool-call/behavioural telemetry from AI products* now sits in the highest evidence class. Even a major enterprise client demanding a feature is anecdote (≤1.0) until the need is validated across the broader market. [Source: Gilad, Evidence-Guided; itamargilad.com 2026]

---

## §2 AI-Augmented Feedback Analysis

**Adaptive taxonomies.** Enterprise VoC platforms (Enterpret, Dovetail, Chattermill) have replaced rigid pre-defined tagging with taxonomies that evolve as new themes/sentiments emerge in raw data, with per-classification rationale and human-in-the-loop validation. Practical effect: the specialist's job shifts from manual coding to **strategic querying** ("what % of enterprise users mentioned reporting-dashboard usability this quarter, and with what sentiment?") plus **auditing the classifier** — checking rationale, spot-checking against raw quotes, and hunting nuance loss. [Source: Enterpret adaptive-taxonomy docs 2026]

**Conversational intake.** Autonomous conversational-interview tools (e.g. Perspective AI) run parallel adaptive interviews and return same-day thematic synthesis; benchmark claims of ~41% time-to-insight lift are vendor-sourced — treat as [SECONDARY: promotional]. Legitimate for routine one-to-many discovery; the specialist still owns guide design, bias audit, and interpretation. [Source: getperspective.ai 2026 — vendor]

**Standing validation duty (unchanged, reinforced).** LLM synthesis must be validated for hallucinated quotes, misclassification, and nuance loss before it drives decisions — the original corpus's Domain 4 protocol stands.

---

## §3 Synthetic Users: the Paradox and the Data-Grounded Rule

The 2024–26 academic and practitioner consensus (CHI/CSCW, NN/g, ACM Interactions):

- **Prompt-based generative personas are inadmissible as validation evidence.** They produce persuasive but unverifiable responses, cannot replicate human emotional complexity/inconsistency/irrationality, and exhibit pervasive people-pleasing bias — they will validate flawed features and express enthusiasm for problems that don't exist. Axiom: *UX without real-user research is not UX.* [Source: NN/g synthetic-users; ACM Interactions 2025–26]
- **Data-grounded simulation is the legitimate variant.** Frameworks like PersonaCite constrain the AI to answer *only* from retrieved, verified VoC artifacts (RAG over real quotes/tickets), abstain when the data doesn't cover the question, and attach response-level provenance ("Persona Provenance Cards") tracing each statement to the human quote that produced it. [Source: PersonaCite, arXiv 2601.22288]
- **Permitted uses**: hypothesis generation, piloting interview guides, rapid desk research. **Never**: final validation, confidence-score contributions above the underlying real data's own score.

**Operational rule for this persona:** a synthetic-user finding inherits the confidence of its *source data*, not of its fluency. Ungrounded synthetic output scores 0.

---

## §4 AI-Product Interaction Telemetry as Discovery Data

The single largest methodological shift through mid-2026: for AI-native products, **user intent is no longer inferred from clickstreams — it is typed into the system verbatim.** The prompt log is the highest-resolution product roadmap available. [Source: tianpan.co, "The Prompt Log Is the Product Roadmap You Threw Away", May 2026]

New metric set (traditional session duration/bounce rate are misleading for conversational UIs):

| Metric | What it signals | Discovery action |
|---|---|---|
| **Conversational abandonment** | Intent-mapping failure — response didn't align with the user's business objective | Cluster abandoned intents; each cluster is an opportunity candidate |
| **Regeneration rate** | Capability gap, poor context management, or hallucination in the underlying model | High-regeneration prompt classes → quality investigation before feature investigation |
| **Per-message thumbs feedback** | Continuous passive quality signal tied to exact prompt+response pairs | Mine dislikes for failure taxonomy; mine likes for value anchors |
| **Tool-call frequency & chaining** | Which capabilities carry real workload; which combinations solve multi-step jobs | Deterministic usage evidence — top evidence class (§1 table) |
| **Attempted calls to non-existent tools / capability requests in-prompt** | The user's workflow collided with the product's functional boundary | **A mathematically precise latent-need map** — route straight to opportunity assessment |
| **Prompt iteration cycles** | How users coax value out of the platform; real-world eval set | Treat unguided traffic as a free evaluation corpus |

**Diolog mapping:** the platform's multi-agent chat already persists full conversation trajectories (text, reasoning, tool calls + results, agent selection), a durable per-message like/dislike feedback store, and AI-memory attribution. When analysing Diolog discovery questions, ask for these datasets by name — they are in-house and richer than any interview program at this TAM. Privacy constraint: routing this telemetry through analysis pipelines is a "collection" under the 2026 privacy regime (§6) — verify consent posture before recommending new mining.

---

## §5 Decision-Grade Rigor in Micro-TAM Markets

For markets of ~hundreds-to-2,200 buyer organisations, large-N methods (A/B, propensity modelling) are mathematically invalid. The small-N toolkit that replaces them:

- **Thematic saturation thresholds**: for structured qualitative inquiry within a homogeneous segment, saturation typically stabilises at **9–12 interviews** (Guest et al.; Braun & Clarke); **~5 per distinct behavioural segment** suffices for tactical usability discovery. Insights are *analytically* generalizable, not statistically.
- **The anecdote rule**: an observation must recur across **independent** participants/accounts and surpass a predefined threshold before classification as a validated insight; otherwise it is explicitly labelled an anecdote. This is the primary defence against roadmap capture by a single vocal enterprise client.
- **Delphi method** for zero-data questions (new regulation, novel category): multi-round, **anonymised** expert panel → facilitator synthesises and returns aggregate → experts re-rate with written justification → convergence. Purpose-built to neutralise HiPPO and groupthink. Use when validating product hypotheses about regulatory workflows that no customer has performed yet (e.g. AASB S2 Group 2 first-cycle reporting).
- **Expert-interview weighting**: weight responses by domain authority, operational specificity, and proximity to the workflow — a daily power user inside the regulated workflow outweighs a distant executive sponsor. Do not treat all N of a small N equally; but *document* the weighting so it is auditable, and never let weighting shade into cherry-picking.
- **Interaction with §2.3.3**: reception valence from founder-led calls enters this machinery only after politeness correction; weighted, corrected, recurring positive reception across 3+ independent accounts ≈ thematic saturation → medium confidence (2.0+).

[Sources: Guest et al. / Braun & Clarke sample-size literature; ResearchGate integrative review 2024; Delphi practice guides 2026]

---

## §6 2026 Australian Privacy & Regulatory Matrix for Discovery Research

Failure to comply exposes the organisation to fines up to **AUD $50M or 30% of adjusted turnover**, plus a new statutory tort for serious invasions of privacy. All items below are **flag-and-escalate** — this persona never gives legal advice.

| Item | Status | Effect on discovery practice |
|---|---|---|
| **Automated Decision-Making (ADM) disclosure** — Privacy and Other Legislation Amendment Act 2024, enforceable **11 December 2026** | ENACTED (grace period ends Dec 2026) | Any system where a computer program (incl. LLMs, scoring, recommendations) makes or *substantially influences* a decision about an individual — including a failure to decide, adverse OR beneficial — must be disclosed in the privacy policy with its logic documented. **Every proposed AI feature must be evaluated for explainability at discovery time**: if the decision pathway can't be mapped, logged, and disclosed, flag it as unshippable-as-designed. Design consent gates and human-override paths into the core journey |
| **Employee-records exemption contraction** | ENACTED direction; full removal PENDING (Tranche 2, in consultation) | Assume employee data (usage telemetry of customer-company staff, productivity signals) is fully protected PII. Consent, minimisation, purpose limitation, and erasure workflows must be designed in from conception |
| **Bunnings precedent** (*Bunnings Group Ltd and Privacy Commissioner*, ART) | ENACTED case law | **Transient processing = collection.** Even millisecond, in-RAM, immediately-discarded processing of personal information is legally a "collection" requiring APP compliance. Routing session recordings, telemetry, or transcripts through third-party analytics or LLM layers triggers obligations *regardless of retention*. Pre-deployment privacy risk assessment required for any new tracking |
| **Session tracking & consent (OAIC posture)** | GUIDANCE, actively enforced via sweeps | No bundled/speculative consent ("we might use this for product improvement someday"). Consent must be voluntary, informed, current, withdrawable without breaking core functionality. OAIC runs proactive sector sweeps |
| **Practical escalation triggers for this persona** | — | (1) any recommendation to record/track without verified current consent; (2) feeding identified customer data (incl. chat logs) into new LLM analysis pipelines; (3) any AI feature whose decisions can't be explained for ADM disclosure; (4) discovery on employee-monitoring-adjacent features |

[Sources: Corrs Chambers Westgarth 2026; OAIC releases; Squire Patton Boggs / Kennedys on Bunnings; XCD IT ADM compliance guide]

---

**Citation convention when using this file:** `[Source: Deep Research 2026 Addendum §N]`.
