# Discovery Sentinel

A Claude Code skill for analyzing product discovery and customer feedback session documents.

## What it does

The Discovery Sentinel skill adopts the persona of a Principal Product Discovery Specialist for regulated B2B SaaS (ASX/ASIC context). It analyzes interview transcripts, meeting notes, and user research documents to produce:

- **Feedback Classification Reports** — a lean per-signal table (verbatim raw input with speaker/session/client attribution, signal type, confidence, next action); the full classification fields are worked internally
- **Discovery Insight Briefs** — synthesized atomic insights with confidence scores using the Gilad Confidence Meter
- **Prioritised Opportunity Assessments** — ranked readable list (theme, why-now, next step) backed by compliance-weighted RICE, WSJF, or MCDA scoring held internally
- **Action Checklist** — a flat numbered to-do list consolidating every recommended action
- **Sales Discovery Companion (v1.2)** — for sales-context sessions, a separate company-specific doc per client: their biggest pains in their own words, cost of the status quo (risk, displaced spend, time lost), no-brainer Diolog value mapping, objections, and proposal angle
- **Cross-Analysis Trend Report (v1.2)** — a trend-synthesis mode over previously generated analyses that escalates confidence only with recurrence across independent accounts

## Key capabilities

- **Session-purpose typing & client segmentation (v1.2)** — classifies each call by commercial purpose (discovery vs demo vs proposal — they carry different signals) and keeps distinct client companies segmented, so multi-client consultant conversations never blend into one incorrect pool
- **Recomposable single-session analyses (v1.2)** — each analysis carries a metadata block and stable signal IDs so isolated per-transcript runs roll up cleanly into later trend passes
- **Speaker attribution & concept reception (v1.1)** — attributes every signal to a speaker (internal team vs customer), classifies concept origin (customer-asked vs internally-pitched vs co-created), and scores reception valence (−2 rejection … +2 committed enthusiasm) with founder-presence and politeness-bias corrections. Tells you plainly whether the customer *liked* an idea, committed to it, politely deflected, or rejected it
- Jobs-to-be-Done (JTBD) extraction using 5 Whys decomposition
- Signal taxonomy classification (feature requests, UI friction, churn signals, workaround patterns, silence signals, concept reception, AI-interaction signals, etc.)
- AI-product telemetry mining (v1.1) — prompt logs, tool-call trajectories, regeneration/abandonment, per-message feedback as discovery data
- Micro-TAM rigor (v1.1) — thematic saturation thresholds, Delphi consensus, expert-interview weighting for small-N markets
- Confidence scoring (0.1-10 scale) with explicit evidence requirements; The Mom Test commitment-vs-compliment rule
- Cognitive bias detection and self-check protocols (incl. acquiescence, founder-presence inflation, positive-signal suppression)
- Anti-pattern flagging (discovery theatre, feature factory, HiPPO management)
- Regulatory awareness for ASX/ASIC compliance contexts, refreshed to the 2026 privacy regime (ADM disclosure, Bunnings precedent)
- Single document or batch analysis

## Installation

```
/plugin install DiologIR/discovery-sentinel
```

## Usage

Ask Claude to analyze discovery or feedback documents:

- "Analyze this interview transcript"
- "Review these customer feedback sessions and extract insights"
- "How did the customer react to the ideas we pitched on this call?"
- "Analyze this demo/sales call — what did they like and what fell flat?"
- "What are the key product signals from this user research?"
- "Prioritize the opportunities from these discovery notes"
- "Extract jobs-to-be-done from this customer interview"
- "Mine these chat logs / prompt data for product signals"
- "What does this client care about most — prep the insights for a proposal"
- "Run a trend pass across all the discovery analyses in this folder"

## Frameworks

Built on methodologies from:
- Teresa Torres — Continuous Discovery Habits / Opportunity Solution Trees / SPICEY
- Marty Cagan — Empowered Teams / Dual-Track Agile / Transformed
- Itamar Gilad — Evidence-Guided / Confidence Meter
- Rob Fitzpatrick — The Mom Test (compliments vs commitment)
- Ryan Singer — Shape Up / Appetite-Driven Discovery
- Jobs-to-be-Done (JTBD) Switch Interviews
- 2026 research addendum — AI-interaction telemetry, data-grounded synthetic-user guardrails, small-N saturation/Delphi rigor

## License

MIT
