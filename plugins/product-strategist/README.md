# Product Strategist

A Claude Code skill for generating validated product feature concepts and outcome-based roadmaps for AI-assisted IR/compliance/governance SaaS.

## What it does

The Product Strategist skill adopts the persona of a Senior Product Manager specializing in strategy and ideation for regulated B2B SaaS (ASX/ASIC context, investor relations platform). It generates:

- **Feature Concepts** — validated, scored concepts with OST chains, compliance gates, RICE-C scoring, persona segmentation, and competitive moat assessment
- **Product Roadmaps** — Now/Next/Later outcome-oriented roadmaps with compliance mandate tiers, protected technical capacity, dependency maps, and confidence decay labeling
- **Feature Evaluations** — individual concept assessments with full scoring breakdown
- **Delta Recommendations** — roadmap adjustment recommendations when new research, feedback, or regulatory signals are provided
- **Comparative Prioritization** — ranked feature tables with transparent RICE-C/WSJF scoring

## Key capabilities

- **Calibrated output registers (v1.1)** — Quick Take (judgment-first prose), Standard (decision-bearing sections only), or Full Artifact (complete templates). Frameworks always run at full rigor; how much machinery is shown matches the ask
- **Live competitive intelligence (v1.1)** — Jul-2026 vendor teardown (Q4, FactSet/Irwin, Nasdaq, Notified, EQS, InvestorHub, Diligent, Ansarada→Drova) grounding every moat assessment; practitioner-sentiment evidence for the Co-Pilot-not-Auto-Pilot boundary
- **Current regulatory table (v1.1)** — AASB S2 Groups 1–2 in force / Group 3 Jul 2027, Privacy Act ADM (Dec 2026), ASIC EHF standard, LR 17.5, ASX inquiry consequences — with ENACTED/PENDING/GUIDANCE tags
- **AI-native roadmap economics (v1.1)** — inference COGS in Effort estimates, consumption-pricing fit, eval-gated releases as build prerequisites
- Opportunity Solution Tree (OST) methodology for discovery-to-roadmap fidelity
- Multi-tiered prioritization hierarchy (compliance mandates > tech debt > strategic features > bets)
- RICE-C scoring with compliance multiplier
- WSJF / Cost of Delay sequencing for regulatory deadlines
- Compliance-by-Design gates (human-in-the-loop, audit trails, disclosure warnings)
- Persona segmentation (IR Manager, Company Secretary, Dual-Hat CFO, Corp Comms)
- Competitive moat assessment (Commodity / Parity / Differentiation / Defensible)
- Feature Opportunity Heat Map (pain level x automation readiness)
- Anti-pattern detection (feature factory, technology push, large-cap bias)
- Evidence tagging with confidence scoring ([VALIDATED], [INFERRED], [HYPOTHESIS])

## Required inputs

- **Existing-features context** — description of current platform capabilities (provided each invocation)
- **Discovery/feedback analysis** — processed feedback data, interview analysis, or discovery-sentinel output (required for feature ideation and roadmap modes)

## Installation

```
/plugin install DiologIR/product-strategist
```

## Usage

- "Generate feature ideas based on this discovery analysis and our current features"
- "Build a roadmap from these inputs"
- "Evaluate this feature concept against our compliance requirements"
- "Here is new ASIC guidance — how should this affect our roadmap?"
- "Compare and prioritize these five feature proposals"

## Frameworks

Built on methodologies from:
- Teresa Torres — Opportunity Solution Trees / Continuous Discovery
- Marty Cagan — Empowered Teams / Outcome-Driven Roadmaps
- SAFe — WSJF / Cost of Delay sequencing
- Intercom — RICE scoring (adapted as RICE-C with compliance multiplier)
- Kano Model — Basic Expectations for compliance isolation
- Now/Next/Later — ProdPad time-horizon format with confidence decay

## License

MIT
