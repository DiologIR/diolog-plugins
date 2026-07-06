# improve-prompt

Review and rewrite prompts, system prompts, agent instructions, CLAUDE.md files, and Claude Code skills — grounded in Anthropic's prompt-engineering documentation and the Karpathy coding-behaviour principles.

## What it does

Give it any prompt artifact (pasted text, a file path, or the name of a skill in a plugins repo) and it:

1. **Classifies** the artifact and its deployment context (model, latency/cost sensitivity, adversarial exposure, output-format requirements).
2. **Diagnoses** it against a structured rubric — clarity, motivation/why, examples, XML structure, role, output format, hallucination guards, consistency, guardrails, token weight; plus skill-specific checks (trigger-description quality, progressive disclosure, imperative voice, explain-why over ALL-CAPS MUSTs).
3. **Rewrites** it surgically — preserving intent, variables, and voice; changing only what a diagnosed finding justifies.
4. **Reports** every change with the principle behind it, so improvements are auditable rather than vibes.

## Grounding material (bundled in `references/`)

- **Anthropic docs**: Claude prompting best practices, Prompting Claude Opus 4.8, Console prompting tools, and the guardrail guides (reduce hallucinations, increase consistency, mitigate jailbreaks & prompt injections, reduce prompt leak, reduce latency), plus four production use-case guides (content moderation, customer support, ticket routing, legal summarization) as worked examples. Snapshotted July 2026 from platform.claude.com.
- **Karpathy guidelines**: the four principles (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution) and their worked examples, from [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (MIT).

## Usage

```
/improve-prompt <paste a prompt>
/improve-prompt path/to/system-prompt.md
/improve-prompt plugins/code-review   (improves that skill's SKILL.md)
```

Or just ask: "improve this prompt", "review my system prompt", "harden this skill", "why does my prompt hallucinate / leak / drift".
