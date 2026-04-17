# DiologIR Claude Code Plugins

A marketplace of Claude Code plugins by [DiologIR](https://github.com/DiologIR).

## Available Plugins

| Plugin | Description |
|--------|-------------|
| **discovery-sentinel** | Analyze product discovery and customer feedback documents using the Discovery Sentinel persona. Produces structured Feedback Classification Reports, Discovery Insight Briefs, and Prioritised Opportunity Assessments. |
| **product-strategist** | Generate validated, prioritized product feature concepts and outcome-based roadmaps for AI-assisted IR/compliance/governance SaaS. Supports feature ideation, roadmap construction, feature evaluation, data ingestion, and comparative prioritization. |
| **deep-research-prompt-creator** | Turns a vague research need into a single copy-paste-ready Gemini 3.1 Pro Deep Research prompt — with pseudo-XML scaffolding, archetype-specific overrides (technical / competitive / regulatory / academic / forecasting), epistemic bounding, inline citation protocol, and wrap-around Operator Notes (Plan Review, decomposition, adversarial audit). |

## Installation

### 1. Register the marketplace

```
/plugin marketplace add DiologIR/claude-plugins
```

### 2. Install a plugin

```
/plugin install discovery-sentinel@diolog-plugins
/plugin install product-strategist@diolog-plugins
/plugin install deep-research-prompt-creator@diolog-plugins
```

## Contributing

To add a new plugin, create a directory under `plugins/` following the standard Claude Code plugin structure, then add an entry to `.claude-plugin/marketplace.json`.

## License

MIT
