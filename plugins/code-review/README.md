# code-review

A Claude Code skill for **high-signal code review** across NestJS APIs, Next.js (App Router) + React 19, frontend HTML/CSS/React, and React Native mobile code — with selectable depth, area targeting, focus lenses, and a token-light pre-push gate.

Built by synthesizing patterns from:

- **everything-claude-code** (`affaan-m`) — the >80% confidence threshold, "silent on trivia" suppression, multi-pass review loop, and reviewer-as-read-only-tool architecture.
- **`improve`** (shadcn, MIT) — the quality-lens audit taxonomy (performance, test coverage, dead code, tech debt, dependencies, DX), secrets-handling and prompt-injection hard rules. Reframed here as review findings — no executor, no plan files.
- **awesome-copilot** (`github`) — the canonical NestJS instructions file.
- **awesome-cursorrules** (`PatrickJS`) — the Next.js 15 + React 19 + Vercel AI cursor rule, plus typescript-nestjs-best-practices.
- **bobmatnyc/ai-code-review** — the severity taxonomy and JSON-shaped finding schema.
- **Arbiter** (Mason, 2026) — the empirical case for modular flat prompts over monoliths.
- **2025–26 AppSec industry research** — mitigating-controls auto-discovery and learned suppressions (Corgea), reachability analysis (Aikido), multi-stage validation before alerting (ZeroPath), and the AI-generated-code risk profile (disproportionate CSRF/SSRF/headers omissions).
- **Official docs** — NestJS, Next.js, React 19, React Native.

## What it does

1. **Parses the invocation** — mode (`review`/`prepush`), depth (`quick`/`standard`/`deep`), areas (frontend, next, nest, mobile, or paths), lenses (bugs, security, perf, tests, components, a11y, dead-code, debt, deps, dx).
2. **Gathers context** — diff + whole files, plus a **mitigating-controls map** (global validation pipes, auth guards, middleware, CSRF/headers config) so candidates a global control already covers are never raised.
3. **Routes** — loads only the checklists matching the diff's file paths and the lens selection.
4. **Finds** — walks checklists plus a cross-file source→sink flow pass; shards across parallel agents when the diff is large (thresholds scale with depth).
5. **Verifies** — independent Sonnet verifier fan-out (batched per file at `standard`), five gates: API existence, version compatibility, mitigation-elsewhere, proportionality, reachability. `quick` self-verifies inline with zero agents.
6. **Learns** — durable refutations (by-design / globally-mitigated) persist to `.code-review/suppressions.jsonl`, so repeat runs on the same branch stop re-litigating settled findings.
7. **Reports** — CRITICAL/HIGH/MEDIUM/LOW findings with file:line, quote, fix snippet, verdict (BLOCK / WARNING / APPROVE / LGTM).

## Modes & cost control

| Invocation | What you get |
| --- | --- |
| `quick review of my changes` | Single-context, no subagents, no artifacts, inline-only report. Cheapest. |
| `review my changes` (standard) | Sharding ≥30 files, batched Sonnet verifiers, report file. |
| `deep review` | Sharding ≥15 files, all quality lenses on, solo verifiers for CRITICALs, tsc gate. |
| `pre-push check` / `can I push this?` | Blocker scan of unpushed commits only: secrets, debug leftovers, accidental files, broken contracts, auth regressions, destructive migrations. Verdict: PUSH / PUSH WITH CARE / DO NOT PUSH. |
| `quick security review of the frontend` | Areas × lenses compose — one focused run instead of a full pass. |
| `dead-code pass on apps/mobile` | An explicit area+lens request sweeps that area, not just the diff. |

## Files

```
plugins/code-review/
├── .claude-plugin/plugin.json
├── README.md
├── LICENSE
└── skills/code-review/
    ├── SKILL.md                          # Invocation grammar, mandate, depth-scaled pipeline
    └── references/
        ├── process.md                    # Full pipeline: context → routing → sharding → verify → report
        ├── output-format.md              # Severity taxonomy + finding schema + verdicts
        ├── verification-loop.md          # Stage-2 grounding (build/types/tests)
        ├── prepush.md                    # Pre-push gate: outgoing-diff blocker scan
        ├── quality-lenses.md             # perf / tests / dead-code / debt / deps / dx (from improve, MIT)
        ├── nextjs-checklist.md           # App Router, Server Actions, RSC boundary, caching, hydration
        ├── nestjs-checklist.md           # DI, modules, scopes, pipes/guards/interceptors, validation
        ├── frontend-web-checklist.md     # Component quality, hooks, a11y, CSS/layout, forms
        ├── react-native-checklist.md     # Lists/virtualization, navigation lifecycle, platform divergence, native config
        ├── typescript-checklist.md       # Strict mode, exhaustiveness, unknown vs any, boundary types
        ├── security-checklist.md         # OWASP-aligned: secrets, IDOR, injection, authn/authz
        └── logic-bugs-checklist.md       # Data integrity, multi-tenancy, LLM-output validation, idempotency
```

## Install

```
/plugin marketplace add DiologIR/claude-plugins
/plugin install code-review@diolog-plugins
```

## Use

- "Review the staged changes" — standard depth, auto-routed.
- "Quick review of this diff" — cheapest full review.
- "Deep review of the PR, security and perf" — thorough, lens-focused.
- "Component quality pass on the frontend" — area + lens.
- "Can I push this?" — prepush gate.

## License

MIT. `quality-lenses.md` adapts the audit playbook from shadcn's `improve` skill (MIT).
