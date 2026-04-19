# code-review

A Claude Code skill for **high-signal code review** of NestJS APIs and Next.js (App Router) + React 19 applications.

Built by synthesizing patterns from:

- **everything-claude-code** (`affaan-m`) — the >80% confidence threshold, "silent on trivia" suppression, multi-pass review loop, and reviewer-as-read-only-tool architecture.
- **awesome-copilot** (`github`) — the canonical NestJS instructions file.
- **awesome-cursorrules** (`PatrickJS`) — the Next.js 15 + React 19 + Vercel AI cursor rule, plus the typescript-nestjs-best-practices rule.
- **bobmatnyc/ai-code-review** — the standardized severity taxonomy (HIGH / MEDIUM / LOW) and JSON-shaped finding schema.
- **Arbiter** (Mason, 2026) — the empirical case for modular flat prompts over monoliths.
- **Official docs** — NestJS, Next.js, React 19.

## What it does

When invoked, the skill:

1. **Gathers context** — runs `git diff --staged && git diff` (or fetches the PR via `gh pr view --json files,...` if a PR ref is given), reads modified files, and traces critical imports with `Grep`/`Glob`.
2. **Routes** — inspects modified file paths to identify which framework checklists apply (NestJS, Next.js, TypeScript-only, security-only) and loads only those reference files into context. This avoids the "interference patterns" documented in the Arbiter paper.
3. **Reviews** — works through the loaded checklists, scoring each candidate finding against an explicit >85% confidence threshold. Skips formatting / naming / style nits (assumed handled by ESLint/Prettier).
4. **Verifies** — runs a Chain-of-Verification pass: `Grep`s the codebase to confirm any function/utility/import the review suggests actually exists. Discards hallucinated suggestions.
5. **Reports** — emits findings in a strict severity taxonomy (CRITICAL / HIGH / MEDIUM / LOW) with file:line, exact quote, fix snippet, and a final verdict (BLOCK / WARNING / APPROVE / LGTM).

## When the skill triggers

The skill description is calibrated to fire when the user asks for a code review, asks "review my changes", asks to look at a PR, asks for a security/quality/architecture pass on diff'd code, or asks to verify a NestJS / Next.js change. It will NOT fire for general "explain this code" questions.

## Files

```
plugins/code-review/
├── .claude-plugin/plugin.json
├── README.md
├── LICENSE
└── skills/code-review/
    ├── SKILL.md                          # Router + main reviewer prompt
    └── references/
        ├── process.md                    # Multi-pass pipeline (Context → Analysis → Verification → Output)
        ├── output-format.md              # Severity taxonomy + finding schema
        ├── verification-loop.md          # Stage-2 grounding (build/types/tests + grep-existence checks)
        ├── nextjs-checklist.md           # App Router, Server Actions, RSC boundary, async APIs, caching, hydration, route handlers, proxy
        ├── nestjs-checklist.md           # DI, modules, forwardRef, scope, pipes/guards/interceptors, validation, lifecycle, testing
        ├── typescript-checklist.md       # Strict mode, exhaustiveness checks, never type, unknown vs any, return types at boundaries
        └── security-checklist.md         # OWASP-aligned: secrets, IDOR, injection, authn/authz, rate limiting
```

## Recommended runtime

This skill is tuned for **Claude Opus 4.7** with **adaptive thinking** and **`effort: "xhigh"`** (or `"high"` for routine reviews). Background:

- Opus 4.7 follows "only report high-confidence" / "only report high-severity" instructions more strictly than Opus 4.6, which can suppress real bugs if the prompt structure puts the confidence filter in the analysis phase. This skill puts coverage in **Phase 3 (Analysis)** and the confidence threshold in **Phase 4 (Verification)** — see Anthropic's [code review harness guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#code-review-harnesses) for why.
- Opus 4.7's improved bug-finding (~11pp better recall on Anthropic's internal evals) is preserved by this two-stage pattern.
- Effort settings: `xhigh` is best for thorough reviews of non-trivial diffs; `high` is the minimum for intelligence-sensitive reviews; `medium` only for very small diffs (1–2 files, < 50 LOC); `low` is not recommended for code review.
- Earlier Opus and Sonnet generations also work — the structure is portable — but Opus 4.7 + xhigh is the calibration target.

## Install

```
/plugin marketplace add DiologIR/claude-plugins
/plugin install code-review@diolog-plugins
```

## Use

Just ask Claude:

- "Review the staged changes"
- "Code review this PR: <url>"
- "Run a security review on the API changes"
- "Look at the Server Action I just added"

The skill auto-triggers and returns findings inline.

## License

MIT
