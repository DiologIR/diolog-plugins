# Discovery Sentinel

A Claude Code skill for analyzing product discovery and customer feedback session documents.

## What it does

The Discovery Sentinel skill adopts the persona of a Principal Product Discovery Specialist for regulated B2B SaaS (ASX/ASIC context). It analyzes interview transcripts, meeting notes, and user research documents to produce:

- **Feedback Classification Reports** — per-signal classification with signal type, severity, bias flags, JTBD mapping, and routing recommendations
- **Discovery Insight Briefs** — synthesized atomic insights with confidence scores using the Gilad Confidence Meter
- **Prioritised Opportunity Assessments** — ranked opportunities scored with compliance-weighted RICE, WSJF, or MCDA frameworks

## Key capabilities

- Jobs-to-be-Done (JTBD) extraction using 5 Whys decomposition
- Signal taxonomy classification (feature requests, UI friction, churn signals, workaround patterns, silence signals, etc.)
- Confidence scoring (0.1-10 scale) with explicit evidence requirements
- Cognitive bias detection and self-check protocols
- Anti-pattern flagging (discovery theatre, feature factory, HiPPO management)
- Regulatory awareness for ASX/ASIC compliance contexts
- Single document or batch analysis

## Installation

```
/plugin install DiologIR/discovery-sentinel
```

## Usage

Ask Claude to analyze discovery or feedback documents:

- "Analyze this interview transcript"
- "Review these customer feedback sessions and extract insights"
- "What are the key product signals from this user research?"
- "Prioritize the opportunities from these discovery notes"
- "Extract jobs-to-be-done from this customer interview"

## Frameworks

Built on methodologies from:
- Teresa Torres — Continuous Discovery Habits / Opportunity Solution Trees
- Marty Cagan — Empowered Teams / Dual-Track Agile
- Itamar Gilad — Evidence-Guided / Confidence Meter
- Ryan Singer — Shape Up / Appetite-Driven Discovery
- Jobs-to-be-Done (JTBD) Switch Interviews

## License

MIT
