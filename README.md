# DiologIR Claude Code Plugins

A marketplace of Claude Code plugins by [DiologIR](https://github.com/DiologIR).

## Available Plugins

| Plugin | Description |
|--------|-------------|
| **discovery-sentinel** | Analyze product discovery and customer feedback documents using the Discovery Sentinel persona. Produces structured Feedback Classification Reports, Discovery Insight Briefs, and Prioritised Opportunity Assessments. |
| **product-strategist** | Generate validated, prioritized product feature concepts and outcome-based roadmaps for AI-assisted IR/compliance/governance SaaS. Supports feature ideation, roadmap construction, feature evaluation, data ingestion, and comparative prioritization. |
| **deep-research-prompt-creator** | Turns a vague research need into a single copy-paste-ready Gemini 3.1 Pro Deep Research prompt — with pseudo-XML scaffolding, archetype-specific overrides (technical / competitive / regulatory / academic / forecasting), epistemic bounding, inline citation protocol, and wrap-around Operator Notes (Plan Review, decomposition, adversarial audit). |
| **code-review** | High-signal code review for NestJS APIs and Next.js (App Router) + React 19 apps. Modular router skill that delegates to framework-specific checklists (NestJS, Next.js, TypeScript, OWASP security), enforces a >85% confidence threshold, and runs a Chain-of-Verification pass to suppress hallucinated findings. Reports in CRITICAL/HIGH/MEDIUM/LOW taxonomy with file:line and fix snippet. |
| **design-md-from-screenshots** | Reverse-engineer a product's visual design system from one or more website/app screenshots and produce a single authoritative `DESIGN.md` — a framework-agnostic, token-based spec (palette, typography, spacing, shape, motion, component inventory, voice, do/don't) with per-token provenance marks, so another AI (Stitch, Claude, v0, Cursor, AI Elements) can generate new screens that belong to the same product. |
| **presentation-design-md-from-screenshots** | Slide-deck sibling of `design-md-from-screenshots`. Reverse-engineer a deck's visual design system from slide screenshots and produce a single authoritative `PRESENTATION_DESIGN.md` — tool-agnostic, token-based spec (canvas, palette, typography, slide archetypes, chart style, image treatment, iconography, do/don't) hard-capped at 1,700 characters so another AI (Gamma, Beautiful.ai, Pitch, Keynote/PowerPoint co-pilots, Stitch, v0, Claude, Cursor) can generate new slides that belong to the same deck. |

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
/plugin install code-review@diolog-plugins
/plugin install design-md-from-screenshots@diolog-plugins
/plugin install presentation-design-md-from-screenshots@diolog-plugins
```

## Contributing

To add a new plugin, create a directory under `plugins/` following the standard Claude Code plugin structure, then add an entry to `.claude-plugin/marketplace.json`.

## License

MIT
