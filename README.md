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
| **linear-issue-pipeline** | Three native skills — `linear-triage`, `linear-plan`, `linear-worker` — that run the Diolog Linear issue pipeline (triage → plan → worker) inside your interactive Claude Code session, with no Agent SDK (so usage draws from your interactive allowance, not the separate Agent SDK credit). Triage posts a non-technical readiness comment; plan writes `docs/plans/<id>.md` and comments its repo-relative path (no upload); worker implements a planned issue in an isolated worktree via dynamic ultracode workflows (understand → implement → rebase → acceptance review → resolve), leaving a local branch (no remote PR). |
| **mockup-fidelity** | Validate that an implemented React or React Native UI faithfully reproduces a reference mockup (HTML+CSS, served prototype, Figma export, or another rendered component set), then update the code to close every gap — by measuring, never eyeballing. Treats the mock as the source of truth and asks (full-comparison + per-screen) before removing working functionality; builds a complete screen/frame inventory and never silently drops a frame; renders both sides; inverts the burden of proof (a visible difference is a defect until a citation proves it intentional); diffs structure first then per-property `getComputedStyle`; produces a per-screen present/divergent/absent ledger AND a functional-gaps document for newly-added UI that is only visual. For React Native it drives the app with Maestro (navigate + screenshot a simulator) and/or react-native-web (real `getComputedStyle`, stubbing native-only modules), and knows RN has no CSS cascade so a component's StyleSheet resolved against its tokens IS its computed style. Merges and replaces the former `mockup-align` + `ui-fidelity-audit` plugins. |
| **marketing-docs-maintenance** | Keep the Diolog marketing/feature documentation in `docs/marketing/` current when a feature ships or a Linear ticket lands. Updates the four-file set per area (`features-build/final/XX-*.md` + `existing-features.md` §2.XX for technical detail; `features-build/plain/XX-*.md` + `product-feature-guide.md` §XX for plain language), plus `outbound-contact-surfaces.md` for new contact/delivery surfaces. Enforces the two registers (technical files carry component names/routes/GraphQL ops/exact copy and no opinions; plain files carry zero technical terms, second person, sentence case, no em dashes/emojis), four-file consistency, the supersede-don't-accumulate currency rule, and the live-app > source > ticket source-of-truth hierarchy. Operationalises `docs/marketing/MAINTENANCE.md`. |
| **spec-validation** | Validate whether a specification, build plan, or Definition of Done is GENUINELY implemented in a large codebase — not just rendered, schema-valid, and passing tests. Classifies every claimed-done data field as REAL (a producer computes it from the filesystem / git / source scan / AI / a live API), AUTHORED (persisted but only ever written by a UI round-trip or a seed — nothing computes it), or MOCK (only ever a fallback constant), each with file:line evidence. Fans out across parallel investigators, adversarially verifies the headline findings, and writes a ranked, date-stamped living gap report that doubles as the resolution backlog. Catches demo-data-dressed-as-done and re-validates after a prior "100% complete" claim. |
| **design-craft** | Turn Claude into an opinionated, accessibility-aware, AI-slop-resistant design collaborator that produces intentional artifacts in plain HTML/CSS/SVG/JS — landing pages, app screens, dashboards, interactive prototypes, slide decks, wireframes, hi-fi variations, design-token files, and component inventories. A router skill carries the full design philosophy (content discipline, purposeful aesthetics that reject AI-template tropes, visual hierarchy and rhythm, typography and color systems, WCAG accessibility, interaction states, system thinking) and routes to 14 phased procedures: `discovery-questions`, `frontend-aesthetic-direction`, `wireframe`, `make-a-deck`, `make-a-prototype`, `make-tweakable`, `generate-variations`, `design-system-extract`, `component-extract`, `accessibility-audit`, `ai-slop-check`, `hierarchy-rhythm-review`, `interaction-states-pass`, `polish-pass`. Built for Claude Code: `AskUserQuestion` kickoff rounds, `Agent`-tool verifier fan-out, and self-contained deck-scaling / device-frame / tweak-panel code that runs as standalone files with no external dependencies. |
| **create-luke-content** | Write ANY content in Luke Rhodes' authentic voice (Diolog CTO and co-founder), conditionally routed through the right persona variant for the content type: LinkedIn posts and long-form blog articles (engagement-optimised, with a Diolog graphic concept), marketing content (announcements, release notes, landing copy, campaign emails), code reviews (severity-calibrated candour), informal-but-professional Slack messages, short-form content (tweets, comments, bios), and ADHD-targetted / book-audience writing (the conversational brilliant-colleague register). One non-negotiable base voice (calm, direct, technically fluent, quietly witty, **no em dashes**, no AI clichés) synthesised from Luke's raw writing corpus, five persona deltas layered on top, and a deterministic `voice_lint.py` that hard-fails on em dashes and AI-tell phrases in every format, with per-format advisory checks. Formerly `create-luke-article`. |

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
/plugin install linear-issue-pipeline@diolog-plugins
/plugin install mockup-fidelity@diolog-plugins
/plugin install marketing-docs-maintenance@diolog-plugins
/plugin install spec-validation@diolog-plugins
/plugin install design-craft@diolog-plugins
/plugin install create-luke-content@diolog-plugins
```

## Contributing

To add a new plugin, create a directory under `plugins/` following the standard Claude Code plugin structure, then add an entry to `.claude-plugin/marketplace.json`.

## License

MIT
