# Create Persona

A Claude Code plugin that generates dense, agent-ready persona definitions from a target role. An AI agent can load the output as operating context; a human can verify it at a glance.

Tuned for **Claude Opus 4.7**: literal instruction following, adaptive thinking, positive framing, and the empirical findings from 2025 persona-engineering research (EmoCharacter, LABE, PPA, CPER, the Over-Specification Paradox).

## What it produces

A complete persona framework with:

1. **Identity kernel** — role, level, mission, cognitive model
2. **Operational framework** — responsibility matrix (8–12 rows, tagged), technical proficiency, 3–5 recurring decisions, communication protocol
3. **Strategic synthesis** — four analytical frames:
   - Maturity model (Novice → Expert)
   - Feature selection matrix (goals × optimal solutions)
   - Capability heat map (criticality × business impact)
   - Integration dependency graph (5–8 adjacent roles)
4. **Performance indicators** — quantitative metrics (measurable targets) + qualitative indicators
5. **Knowledge management** — weekly active/passive learning allocation with *named* platforms, not generic categories
6. **Constraints and boundaries** — tagged do-not-do list, including transparency/disclosure requirements for user-facing deployments
7. **Two interaction examples** — realistic scenarios, at least one showing tension or a decisional trade-off (counters the emotional-flatness failure mode safety-aligned models default to)

Every responsibility, skill, metric, and decision carries exactly one classification tag — `[CRITICAL]`, `[WORKFLOW]`, `[POWER-USER]`, or `[GOLDEN-NUGGET]` — so a consuming agent can prioritise correctly under load.

## How it works

Seven-step workflow the skill runs on your behalf:

1. **Input validation** — refuses non-persona requests cleanly
2. **Clarification** — batches four targeted questions (role level, primary challenge, integration priority, org stage) in a single message; skips if you've already supplied them
3. **Knowledge assessment** — silently checks whether it has enough grounding to avoid fabricating
4. **Research request** — if gaps exist, offers you specific copy-pasteable search queries or a "proceed with baseline" option that flags uncertain sections
5. **Generate** — produces the full framework in one response
6. **Self-check** — verifies no placeholders, every item tagged, all four synthesis frames populated, at least one interaction example with real tension
7. **Deliver** — appends a usage-notes block covering agent consumption, human verification, customisation points, and refresh cadence

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install create-persona@diolog-plugins
```

## Example invocations

```text
Create a persona for a Staff Platform Engineer at an ASX-listed fintech scaleup.
```

```text
I need an AI operating context for a Head of Investor Relations role.
Research attached.
```

```text
Turn this job description into an agent-ready persona I can load
as a system prompt for a Claude Code subagent.
```

## Why this skill exists

Three findings from the 2025 persona-engineering research drove the design:

1. **Structured persona frameworks materially outperform ad-hoc role prompting.** Production deployments of engineered personas report ~67% productivity improvements on AI-enabled processes vs. minimal gains from "act as a [role]" prompting. A persona is a system configuration file, not a one-liner.
2. **Safety-aligned models default to emotional flatness.** The EmoCharacter benchmark (NAACL 2025) shows that role-playing prompts can *reduce* emotional fidelity because RLHF penalises negativity. The skill's self-check explicitly requires at least one interaction example showing tension — otherwise the output ships as a polite, agreeable default.
3. **Implicit bias survives explicit instructions.** LABE (ACL 2025) shows "don't be biased" instructions are unstable and sometimes exacerbate bias. The skill counteracts through diverse in-context examples and an explicit boundaries section — not platitudes.

Full evidence base in `skills/create-persona/references/playbook.md`, including Claude Opus 4.7 specifics (literalism, effort calibration, adaptive thinking) and recommended API configuration for porting the workflow outside Claude Code.

## What this skill does not do

- Does not generate user-research (customer/buyer) personas — it produces *operator* personas.
- Does not impersonate real named people without explicit consent context.
- Does not fabricate to fill knowledge gaps — missing data is flagged, never invented.
- Does not generate multi-persona systems in one pass — produce them one at a time so each gets full synthesis.

## License

MIT
