# Deep Research Prompt Creator

A Claude Code plugin that turns a vague research need into a single copy-paste-ready **Google Gemini 3.1 Pro Deep Research** prompt — plus the wrap-around Operator Notes (Plan Review pause, decomposition, adversarial audit) that empirical evaluations show matter as much as the prompt itself.

## What it produces

1. **One complete Gemini Deep Research prompt** with:
   - Pseudo-XML scaffolding (`<role>`, `<core_directive>`, `<research_questions>`, `<source_discipline>`, `<epistemic_bounding>`, `<citation_protocol>`, `<output_format>`)
   - Archetype-specific overrides for the five supported task classes
   - Inline citation mandate (defeats Gemini's source-stripping failure mode)
   - `<core_directive>` repeated top-and-tail as the anti-drift anchor
2. **Operator Notes** — a short coaching section covering Plan Review, pre-scoping queries, decomposition for oversized briefs, adversarial audit via Claude, cross-lingual retrieval, and Workspace hierarchy-of-truth

## Supported task archetypes

| Archetype | Use for |
|---|---|
| Technical deep-dive | Software stacks, APIs, model architectures, hardware infrastructure |
| Competitive and market | GTM strategy, positioning, threat assessment, market sizing |
| Regulatory and compliance | Jurisdictional risk, policy mapping, audit prep, cross-border compliance |
| Academic literature synthesis | Post-graduate research, gap analysis, systematic methodology review |
| Forecasting and trend | Strategic planning, capital allocation, macroeconomic modelling |

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install deep-research-prompt-creator@diolog-plugins
```

## Example invocations

```text
I need to understand the ASX continuous-disclosure landscape for dual-listed
tech companies. Help me build a Deep Research prompt.
```

```text
Draft me a Gemini Deep Research brief for competitive intel on investor-
relations SaaS vendors in APAC.
```

## Why this skill exists

Empirical evaluations of Gemini 3.1 Pro Deep Research (HLE 46.44%, DeepSearchQA 66.1%, ResearchRubrics ~67.7%) show prompt quality compounds with operator workflow — zero-shot autonomous execution under-performs the prompt-plus-workflow approach by a meaningful margin. This plugin bakes that full loop into a single invocation.

The skill's `references/playbook.md` contains the evidence base (benchmarks, DEFT failure taxonomy, the Over-Specification Paradox, citation-stripping behaviour, the "Debate Club" multi-model pattern) for every protocol the architect applies.

## License

MIT
