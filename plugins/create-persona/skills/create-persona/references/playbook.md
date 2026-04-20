# Persona Engineering Playbook — empirical evidence base

> This file is the evidence layer behind the protocols in `SKILL.md`. The architect should not need to read it during normal use — consult it when the user asks *why* a rule exists, when defending a recommendation against pushback, or when porting the output to an API workflow or non-Claude model.
>
> Sources synthesised: Anthropic "Prompting best practices" and "Migration guide" (Opus 4.7, Jan 2026); "Claude Prompt Engineering" reference (compressed); "Prompt Generation Research Summary" (compressed); "AI Persona Generation: A Comprehensive Analysis of Prompt Engineering Best Practices for March–June 2025."

## Executive summary (load-bearing claims)

- **(High Confidence) Structured persona frameworks materially outperform ad-hoc role prompting.** Organisations deploying engineered persona frameworks report ~67% productivity improvements on AI-enabled processes vs minimal gains from unstructured prompting. In customer support the delta is 84% improvement in first-contact resolution and 52% higher CSAT. These are not marginal.
- **(High Confidence) "Persona stacking" — layering expertise level, domain focus, personality, voice, and motivation — produces materially more consistent behaviour than single-attribute role prompts** ("You are a UX researcher with 10 years specialising in mobile" vs "You are a UX researcher"). This is why §1 Identity kernel has *three* fields, not just a role title.
- **(High Confidence) Safety-aligned models default to emotional flatness.** The EmoCharacter benchmark (NAACL 2025) shows existing role-playing prompts can *reduce* emotional fidelity because RLHF penalises negativity. A persona defined only as "empathetic" produces neutral, agreeable interactions that fail the believability test. Counter via few-shot examples that demonstrate dynamic emotional and decisional range.
- **(High Confidence) Implicit bias survives explicit fairness instructions.** The LABE benchmark (ACL 2025) shows LLMs assign less language agency to women and racial minorities even when instructed "do not be biased." Intersectional identities receive the lowest agency scores. Prompt-level "don't be biased" instructions are unstable and sometimes *exacerbate* bias — the fix is systematic evaluation and diverse in-context examples, not platitudes.
- **(High Confidence) Claude Opus 4.7 interprets prompts more literally than Opus 4.6.** It will not silently generalise an instruction from §1 to §7. Every rule must explicitly state its scope ("apply this to every section, not just the first").
- **(Medium Confidence) Over-specification degrades output.** Past a threshold, additional micro-constraints (paragraph word counts, exhaustive negative constraints) deplete the attention budget and cause the model to disregard core directives in favour of peripheral formatting rules. Rigid macroscopic skeleton + loose microscopic prose is the empirically-supported shape.

## Why the four-input clarification step exists

The four inputs (Level, Primary challenge, Integration priority, Stage) are not bureaucratic scaffolding. Each one materially changes the output:

- **Role level** drives the cognitive-model line in §1, the decision framework in §2.3, and the maturity model in §3.1. An IC Platform Engineer and an Executive VP of Platform produce structurally different personas — shared tools, wildly different decisions. Without the level, the output regresses to a blended "senior-ish" default.
- **Primary challenge** anchors the capability heat map (§3.3) and seeds the §3.2 selection matrix. It's the "Analysis Lens" from the 2025 research — telling the model *how* to think about findings, not just *what* to find.
- **Integration priority** drives §3.4 (dependency graph) and the communication protocol in §2.4. An engineering-heavy Data Scientist lives in Slack with engineers; a sales-heavy one lives in Gong and Salesforce with AEs. The responsibilities overlap; the integration patterns do not.
- **Organisational stage** drives §4.1 metric targets and §2.3 decision cadences. Startup metric targets ("get first 10 enterprise logos") do not translate to enterprise metric targets ("maintain 99.9% uptime across 14 regions"). The stage is the reality check on the numbers.

The clarification step also prevents the single most expensive failure mode: generating a full persona for the wrong scope, then having to regenerate from scratch.

## Why classification tags matter (the four-tag taxonomy)

Classification tags (`[CRITICAL]`, `[WORKFLOW]`, `[POWER-USER]`, `[GOLDEN-NUGGET]`) are not cosmetic. They drive *prioritisation* when the persona is loaded as agent operating context. The compressed prompt-engineering research shows that agents consuming tagged context:

1. Treat `[CRITICAL]` items as non-overridable safety/compliance gates.
2. Execute `[WORKFLOW]` items as defaults — the recurring happy path.
3. Reach for `[POWER-USER]` items when a standard workflow is insufficient.
4. Preserve `[GOLDEN-NUGGET]` items across context compaction because they encode non-obvious domain knowledge that would otherwise be lost.

Untagged items drift to the bottom of the attention budget and are routinely ignored under load. Shipping a persona with any untagged responsibility or metric is an invitation for the agent to silently drop that item when things get busy.

One tag per item is non-negotiable. Multi-tagged items force the agent into a weighting decision it's not equipped to make and almost always collapse into the least-restrictive tag.

## The "Persona as System Configuration" paradigm

From the 2025 deep-research synthesis: the modern persona prompt is architected more like a system configuration file than a command. It contains:

- **Declarative section** — identity, traits, motivations (§1–2)
- **Executive section** — tasks, decisions, escalation paths (§2.3–2.4)
- **I/O specification** — communication protocol, output format (§2.4, §4)
- **Embedded subroutines** — few-shot interaction examples (§7)
- **Error handling** — constraints, boundaries, refusal rules (§6)

This is why the skill's output template is structurally rigid but leaves the prose loose — the structure encodes the agent contract; the prose encodes the domain specifics.

## The Over-Specification Paradox

Research into Universal Conditional Logic frameworks identifies a mathematical threshold (structural-overhead function) beyond which additional directives cause a precipitous drop in logical precision.

Practical consequence for persona generation:

- Rigid **macroscopic** skeleton helps: section hierarchy, table column headers, tag taxonomy, output template.
- Rigid **microscopic** constraints hurt: paragraph-level word counts, exhaustive negative constraints, contradictory formatting rules.

This is why SKILL.md specifies "8–12 rows" for the responsibility matrix rather than "exactly 10," and why the output template uses "3–5 decisions" rather than a fixed number. Flex at the margin preserves attention budget for the analysis.

## Emotional fidelity — the EmoCharacter finding (NAACL 2025)

Key findings that directly shaped the SKILL.md output template:

- Role-playing methods as practised in 2023–2024 can *reduce* emotional fidelity. Models given a role default to safe, neutral, or overly positive emotions — a side effect of RLHF penalising negativity.
- Larger/more capable models are not inherently better at emotional fidelity. It does not scale with parameter count.
- The most effective interventions are (a) supervised fine-tuning on emotionally rich dialogue, and (b) in-context learning with few-shot examples of dynamic emotional exchanges.

Since SKILL.md is a prompting skill and can't fine-tune, it leans on (b): the self-check explicitly requires at least one interaction example showing tension, disagreement, or a real decisional trade-off. Without this, the persona reverts to a polite-resolver default and fails the believability bar that 2025 benchmarks actually measure.

## Long-context consistency — PPA and CPER (ACL 2025)

Two framework-level findings that the skill doesn't directly implement but that the architect should understand when the user asks about multi-session deployment:

**Post Persona Alignment (PPA).** Reverses the conventional generation sequence:
1. Generate a generic, context-aware response based only on the current user input.
2. Use that response as a semantic query to retrieve relevant memories/attributes from the persona's external knowledge base.
3. Refine the response to align with retrieved persona info.

This "generate-then-refine" approach outperforms traditional "inject-persona-then-generate" in multi-session consistency. If the user is deploying the persona across long conversations, recommend they pair the persona output with a PPA-style retrieval layer.

**Conversational Preference Elicitation and Recommendation (CPER).** Empowers the model to recognise when it has a "persona knowledge gap" and actively ask clarifying questions rather than guess. Intrinsic uncertainty quantification drives the decision to ask vs. answer.

Implication: a well-constructed §6 (constraints & boundaries) should include permission to express uncertainty and ask clarifying questions. A persona that never says "I need more information" will hallucinate under ambiguity.

## Bias mitigation — LABE, PST, explicit-vs-implicit (2025)

- **LABE** shows LLMs generate text with less *agency* language when describing women and minorities, regardless of fairness instructions. Prompt-level "don't be biased" is unstable and sometimes exacerbates bias. The proposed Mitigation via Selective Rewrite (MSR) method uses a separate classifier to identify and revise communally-biased sentences post-generation — not a prompt-level fix.
- **PST (Paired Stereotype Test)** shows image models exhibit gender-occupational biases even when single-subject prompts have been debiased — 74%+ of "CEO and assistant" outputs produce male-CEO / female-assistant pairs.
- **Explicit vs Implicit Bias study (ACL 2025)** shows alignment reduces *explicit* bias but not implicit associations. Models can pass direct bias questions while still generating biased content downstream. As model size grows, explicit bias decreases but implicit bias increases.

Implication for the persona skill:

- Do not rely on "be unbiased" instructions. They're null at best, counterproductive at worst.
- Vary names, pronouns, and demographic markers in §7 interaction examples where the role's profile is open.
- Flag to the user in the delivery summary that even a persona that "passes" explicit bias checks can generate implicitly biased content — behavioural testing beats declarative statements.

## Claude Opus 4.7 specifics (Jan 2026)

Deltas from Opus 4.6 that specifically shape this skill:

- **More literal instruction following.** Opus 4.7 will not silently generalise an instruction from §1 to §4. The skill explicitly states "apply to every section" in the operator calibration and in the operating principles. Without that, Opus 4.7 will satisfy the principle in the first section it encounters and drop it thereafter.
- **Response length calibration.** Opus 4.7 calibrates length to perceived complexity rather than defaulting to a fixed verbosity. The skill addresses this by specifying section-level structure (tables, bullet counts) rather than overall length targets — which Opus 4.7 respects.
- **Fewer tool calls by default.** Not directly relevant to this skill (it doesn't orchestrate many tools), but if a user embeds this persona in a tool-using agent, they may need to raise effort to `high` or `xhigh` to get the tool-use patterns shown in §2.1 activated.
- **Effort calibration matters more than for prior Opus.** Start at `high` for persona generation on known roles, `xhigh` for novel roles requiring deep research synthesis. `low` and `medium` on Opus 4.7 strictly scope work and will produce a thinner persona.
- **Adaptive thinking is off by default.** If the user is invoking the skill via API rather than Claude Code, they must explicitly set `thinking: {type: "adaptive"}` to get deliberative synthesis. See the recommended_api_config below.
- **Prefill is removed.** The skill never relied on prefill, but users porting this workflow to API calls should use structured outputs or system-prompt instructions instead.
- **Sampling parameters (temperature, top_p, top_k) are removed on Opus 4.7.** API payloads must omit them or they'll 400.

## Recommended API configuration for API-first deployment

If the user wants to run this persona-generation workflow via the Anthropic Messages API rather than through Claude Code:

```python
client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,  # 64000 if expecting persona + interaction examples in one response
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # "xhigh" for novel roles requiring deep synthesis
    system=PERSONA_CREATOR_SYSTEM_PROMPT,
    messages=[...],
)
```

Omit `temperature`, `top_p`, `top_k` — they 400 on Opus 4.7. Steer length and structure through the system prompt, not sampling parameters.

For very long persona corpora (multiple roles in one batch), use Opus 4.7's 1M-token context window and consider Batch Processing for cost savings.

## Framework precedents

The persona skill is indebted to three established frameworks:

- **CLEAR** (Concise, Logical, Explicit, Adapt, Reflect) — internal case studies report 37% accuracy improvement and 41% reduction in manual revision vs unstructured prompts. The skill's operating principles (verifiability, completeness, structured output, synthesis) are a domain-specific restatement of CLEAR.
- **RACE** (Role, Action, Context, Examples) — standard for strategic-analysis prompts. The skill's output template maps: §1 Identity = Role; §2 Operational framework = Action; §3 Strategic synthesis + knowledge of role = Context; §7 Interaction examples = Examples.
- **CREATE** (Character, Request, Examples, Adjustments, Tone, Extras) — standard for content-production prompts. Similar mapping; the skill adds the verifiability/tagging layer that CREATE does not specify.

None of these frameworks natively handle agent-ready output. The skill's tagging taxonomy (`[CRITICAL]`, `[WORKFLOW]`, `[POWER-USER]`, `[GOLDEN-NUGGET]`) is the persona-specific addition that makes the output *consumable* by an LLM, not just readable by a human.

## Cross-model portability

A persona prompt that produces a perfect character on Claude Opus 4.7 will not necessarily produce the same character on GPT-4o or Gemini. Known differences:

- **Claude (Anthropic)**: prefers XML/pseudo-XML tags. The skill uses `<example>` tags in §7 for this reason.
- **GPT (OpenAI) / Gemini (Google)**: perform well with Alpaca-style and Markdown formatting. The skill's markdown-first output template ports cleanly.
- **Llama / Mixtral**: prefer simpler paragraph styles. The tag-heavy structure may under-perform; advise the user to simplify or to fine-tune rather than persona-prompt for these.
- **Cohere**: prefers Markdown headers (`##`). Ports cleanly.

Implication: if the user wants the generated persona to work across models, the tag-stripping step falls on them. The skill's job is to produce the densest, most-verifiable output for Claude — which is generally the superset that other models can accept.

## PromptOps — the discipline, not the tooling

The 2025 research calls out the emergence of "PromptOps" — DevOps-style lifecycle management of prompts, including version control, automated evaluation, and continuous monitoring for "prompt drift" (quality degradation when the underlying model is updated).

Implication for generated personas:

- Recommend the user version-control the persona output alongside the code that consumes it.
- Recommend re-running the §7 interaction examples past the persona periodically as a regression test, especially after model upgrades (Opus 4.6 → 4.7 is one example where literalism changes flipped several behaviours).
- The delivery-summary "Refresh" note ("re-check tool lists and metrics quarterly; roles drift") is a PromptOps habit applied at the content level.

## Ethics, consent, and disclosure

Load-bearing constraints that the skill surfaces but doesn't directly enforce (the user must implement):

- **Undisclosed AI.** Users must be clearly informed when they're interacting with an AI persona. The skill's §6 requires at least one transparency constraint for user-facing personas because this is the strongest consensus position across 2025 ethics research.
- **Digital doppelgangers.** Creating a persona of a real named person without consent violates the proposed NO FAKES Act framework and causes documented psychological harm. The skill explicitly does not impersonate real people without explicit consent context.
- **PII and data governance.** A persona deployed in a regulated domain (GDPR, HIPAA, ASX continuous disclosure) must not expose training-data PII. The generated persona itself is not the risk — what the persona *accesses* downstream is. Flag to the user if they're deploying in a regulated domain.
- **Manipulation risk.** A persona engineered to exploit psychological vulnerabilities for commercial gain crosses ethical lines. The skill produces operator personas, not persuasion engines.

These are not artefacts the skill adds to the output — they're guardrails the skill surfaces when the user's framing touches them.

## Citation-quality caveat

Numbers in this playbook (67% productivity lift, 84% FCR, 73% content production reduction, 91% decision-support reliability, 45% cost reduction, 37% CLEAR accuracy lift, 41% revision reduction, etc.) are drawn from the 2025 deep-research synthesis and secondary industry reports compiled therein. They are directionally sound and were cited across multiple sources in that corpus, but specific vendor/study attributions were not preserved through the compression step.

Treat the numbers as corroboration of qualitative patterns, not as precision measurements. If the user challenges a specific figure, acknowledge the limitation and fall back to the qualitative finding (e.g. "structured frameworks materially outperform ad-hoc prompting" rather than "67% better").

The model-behaviour findings (EmoCharacter, LABE, PST, PPA, CPER, explicit-vs-implicit-bias) have clearer provenance (NAACL 2025, ACL 2025) and can be cited more confidently.
