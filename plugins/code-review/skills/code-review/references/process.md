# Process — Multi-Pass Review Pipeline

This is the full, expanded definition of the five-phase pipeline that the main `SKILL.md` summarizes. The phases are ordered. Do not skip ahead. Each phase has a defined exit condition.

The pipeline is adapted from the everything-claude-code `code-reviewer` agent (8-phase orchestration) and the verification-loop skill, condensed for the NestJS + Next.js scope.

---

## Phase 1 — Context Gathering

**Goal:** Understand what changed, why, and how it integrates with the rest of the codebase. A reviewer who only sees the hunks misses everything that *isn't* changing but is now wrong because of what changed.

### Steps

1. **Identify the diff.**
   - PR mode: `gh pr view <ref> --json title,body,files,baseRefName,headRefName,mergeStateStatus,statusCheckRollup` then `gh pr diff <ref>`.
   - Local mode: `git status`, `git diff --staged`, `git diff`. Combine staged + unstaged.
   - Branch-range mode: if the user names a base (e.g. "review feature-x against main"), use `git diff main...HEAD`.

2. **Check CI is green** (PR mode only). If `mergeStateStatus` is `BLOCKED` due to failing required checks, surface this and ask the user whether to proceed. A red build typically masks the real defects under noise.

3. **Read whole files.** For every file with non-trivial changes (>5 lines or any structural change), use `Read` to load the entire file. Diffs hide:
   - The function signature above the modified body.
   - Earlier validation/auth checks that the new code may already be covered by.
   - Imports that already provide a "missing" utility you might otherwise suggest adding.

4. **Trace usages of changed exports.** For every modified exported symbol, run `Grep` for its name across the repo (`Grep -n "<symbolName>" --glob "**/*.{ts,tsx}"`). Three patterns to specifically watch:
   - **Behavioral break:** a call site relies on the old behavior of a changed function.
   - **Type break:** a call site relies on the old return type / parameter shape.
   - **Coupling smell:** the symbol has many call sites, suggesting the change has wider blast radius than the diff implies.

5. **Confirm test coverage exists.** `Glob` for sibling test files (`*.spec.ts`, `*.test.ts`, `*.e2e-spec.ts`). If a critical change has no test coverage, that's a finding.

6. **Read repo-level conventions.** `Read CLAUDE.md` (or `AGENTS.md`, `CONVENTIONS.md`, `.cursorrules`) at repo root if present. Adapt your standards to match the project's stated style. Do not impose external conventions over established project ones.

7. **Read `package.json`** to determine framework versions. The review checklists in `nextjs-checklist.md` and `nestjs-checklist.md` are calibrated to specific major versions; you must know which apply.

### Exit condition

You can answer, for each modified file, *what changed and why*. If you can't, ask the user before proceeding.

---

## Phase 2 — Routing

**Goal:** Load **only the checklists that match the diff**, to avoid the "interference patterns" observed in monolithic prompts (Arbiter, Mason 2026). A monolithic prompt with all NestJS + Next.js + TypeScript + security rules loaded simultaneously degrades reasoning through scope-overlap and mandate-prohibition conflict.

### Routing matrix

```
File pattern                                              → Reference to load
────────────────────────────────────────────────────────────────────────────────
*.controller.ts | *.service.ts | *.module.ts |          → nestjs-checklist.md
  *.guard.ts | *.pipe.ts | *.interceptor.ts |
  *.filter.ts | *.dto.ts | *.entity.ts |
  app.module.ts | main.ts                                   (NestJS)

app/**/*.{ts,tsx} | pages/**/*.{ts,tsx} |               → nextjs-checklist.md
  middleware.ts | proxy.ts | route.ts |
  files containing 'use server' or 'use client' |
  next.config.{js,mjs,ts}                                   (Next.js + React)

Any *.ts | *.tsx                                         → typescript-checklist.md
                                                            (always-on cross-cutting)

Touches auth, sessions, cookies, JWT, bcrypt/argon2,    → security-checklist.md
  env vars, SQL/ORM queries with user input,
  file uploads, deserialization, redirects,
  public POST endpoints, headers, CSP, CORS

Always                                                   → output-format.md
                                                            (taxonomy + schema)
```

If the diff touches none of the patterns above, you are likely outside the skill's scope (e.g., a pure config/CI/markdown change). Confirm with the user whether to proceed; this skill's value is heavily concentrated in NestJS and Next.js code.

### Exit condition

The exact set of reference files you have loaded matches the file patterns in the diff. No reference files are loaded "for completeness".

---

## Phase 3 — Analysis (coverage mode)

**Goal:** Generate the **complete** candidate list of findings by walking each loaded checklist against the diff. Coverage matters more than precision in this phase — the verification step in Phase 4 is the dedicated filter. A real bug silently dropped here cannot be recovered later; a false positive surfaced here is removed at almost no cost.

### Method

For each item in each loaded checklist:

1. Search the diff for the pattern the checklist item targets.
2. If found — even if you're uncertain — draft a candidate finding:
   - Quote the exact code line(s) from the diff.
   - State which checklist rule was violated, in plain language.
   - Estimate severity using `output-format.md` (CRITICAL / HIGH / MEDIUM / LOW).
   - Estimate confidence as a number 0–100. Be honest. **Do not drop the finding here for being below 85.** Phase 4 (Gate 0) applies the threshold.
3. Move to the next checklist item. Do not write the final report yet.

### Hard rules during analysis

- **No stylistic findings.** Pure formatting, quote style, semicolons, import ordering, snake-vs-camel naming, trailing commas — anything ESLint or Prettier would auto-fix — does not make it onto the candidate list at all. Anything that affects runtime behavior, type safety, security, performance, or business-logic correctness is *not* stylistic; surface it.
- **No findings in unchanged code** — *unless* a CRITICAL security issue exists in unchanged code that is now reachable because of a change in the diff (e.g. the diff exposes a previously-private function via a new route). Mark these clearly.
- **Consolidate.** If five controllers all violate the same rule, that is one finding ("5 controllers missing X validation, listed below") — not five.
- **One finding, one fix.** If the same line has three distinct problems, three findings — but each must have its own fix snippet.

### Exit condition

You have a candidate list of findings, each with: file, line(s), exact quote, rule violated, severity estimate, numeric confidence estimate. The list is held internally — nothing has been written to the user-facing report yet.

---

## Phase 4 — Verification (filtering pass)

**Goal:** Filter the Phase 3 candidate list down to the findings that are demonstrably real and worth reporting. This is the dedicated filtering step — confidence thresholds, API existence checks, and proportionality all live here, not earlier.

See `references/verification-loop.md` for the full procedure. Summary:

1. **Gate 0, confidence threshold.** A candidate survives only if confidence ≥ 85, OR severity is CRITICAL/HIGH and confidence ≥ 70 (asymmetric cost — false negatives on serious findings are far worse than false positives, so they get a lower bar).

2. **Gate 1, API existence.** If a finding's suggested fix names a function, type, hook, or import path, `Grep` for it. If it doesn't exist with the suggested signature in the project source or a declared dependency, **rewrite the suggestion to use what does exist, or drop the finding.**

3. **Gate 2, version compatibility.** If the finding cites framework behavior, confirm the framework version in `package.json` matches. Do not flag `await cookies()` as required on a Next.js 14 project.

4. **Gate 3, out-of-hunk satisfaction.** If the finding claims "X is missing", re-read the whole file (not just the hunk). The thing you think is missing is frequently 30 lines above the diff.

5. **Gate 4, proportionality.** If a candidate would force the developer to change >50 lines or introduce a new abstraction the project doesn't have, your finding might be too big for the diff being reviewed. Downgrade severity to MEDIUM/LOW with a "future cleanup" note, or rewrite the suggestion as a smaller incremental fix.

6. **Discard silently.** Findings dropped at any gate do not appear anywhere in the report. Do not write "I considered flagging X but verified it was fine" — that is noise.

### Exit condition

Every remaining finding has survived all five gates. Each is anchored to specific code that demonstrably exists.

---

## Phase 5 — Report

**Goal:** Emit a structured report that a human can triage in under 60 seconds.

Use the exact format from `references/output-format.md`. Briefly:

1. Order findings by severity, then by file path.
2. Each finding: severity tag, file:line, one-sentence description, one-line fix snippet (or short multi-line snippet if needed).
3. End with exactly one verdict line:
   - `BLOCK` — at least one CRITICAL finding.
   - `WARNING` — at least one HIGH finding, no CRITICAL.
   - `APPROVE` — zero CRITICAL, zero HIGH, at least one MEDIUM or LOW finding.
   - `LGTM — no high-severity issues identified.` — literally zero findings of any severity.

Do **not** add a Summary, Closing Thoughts, or Recommendations section after the verdict. The report ends at the verdict line.
