---
name: tasks-worker
description: Implement a planned Diolog Tasks issue end-to-end in an isolated git worktree using dynamic ultracode workflows — understand & specify, implement (file-disjoint fan-out + typecheck gates), rebase onto origin/staging resolving conflicts, acceptance-review the implemented code against the original ticket description + comments (findings at all severity levels), and resolve every finding. Commits locally and posts a Tasks completion comment; it does NOT push or open a remote PR — the branch stays local for human review. Formerly linear-worker. Use when the user says "work DIO-1234", "implement DIO-1234", "run the worker on DIO-1234", or asks to build out a Diolog Tasks issue that already has a plan. Runs in the current session (diolog-tasks MCP + Read/Write/Edit/Glob/Grep/Bash + the Workflow tool) — no Agent SDK, so usage draws from your interactive allowance, not the Agent SDK credit.
---

# Tasks Issue Worker

Implement a planned Diolog Tasks issue inside an isolated git worktree, driven by **dynamic ultracode workflows**, and leave the branch **local** for human review — no remote PR.

You run **in your current session** as the orchestrator, using the **diolog-tasks MCP**, `Read`/`Write`/`Edit`/`Glob`/`Grep`/`Bash`, and the `Workflow` tool. You do not invoke any Agent SDK script.

## Diolog Tasks MCP notes

- Tools are named `mcp__diolog-tasks__<tool>` and are usually deferred — load them via `ToolSearch` (e.g. `select:mcp__diolog-tasks__get_issue,mcp__diolog-tasks__list_comments,mcp__diolog-tasks__create_comment,mcp__diolog-tasks__update_issue,mcp__diolog-tasks__list_workflow_states,mcp__diolog-tasks__search_issues`) before the first call.
- Statuses are **workflow states referenced by ID**. Resolve `Developer Review` (and any other names you need) to state IDs via `mcp__diolog-tasks__list_workflow_states` once per run. If a named state doesn't exist on the board, say so in the completion summary and leave the status unchanged.
- Issues carry `KEY-123` identifiers; resolve `DIO-1234` to the issue ID via `mcp__diolog-tasks__search_issues` / `list_issues` when a tool needs the ID.

## Inputs

- An issue id (`DIO-1234`). It should already have an implementation plan at `docs/plans/<id>.md` in the repo (produced by `tasks-plan`). If the plan file is missing, work from the issue description + comments and flag the absence in the final comment.

## Setup (do this before any phase)

1. From the target repo root, create the worktree and branch:
   ```
   git fetch origin staging
   git worktree add .worktrees/<ID> -b ai/<id> origin/staging
   ```
   (If `.worktrees/<ID>` already exists, reuse it.) Let `WT` = the absolute path to that worktree.
2. **Read the plan from the main repo** at the absolute `docs/plans/<id>.md` (the worktree is branched from `origin/staging` and won't contain the untracked plan — read it from the main working tree). It is the source of truth.
3. Fetch the issue (`mcp__diolog-tasks__get_issue`) + **all** comments (`mcp__diolog-tasks__list_comments`) — prior triage Assumptions, human replies, any UI amendment. Human replies are authoritative decisions.
4. Do all implementation file edits and git commands **inside the worktree** (`WT`) — use absolute paths or `git -C "$WT"`. When you spawn workflow subagents, give each the absolute worktree path and an explicit, **disjoint** file scope so their reads/writes/commands target this worktree and never collide.

## How you must run this — ultracode dynamic workflows

You are the **orchestrator**, not a single-pass implementer. Drive the work as a sequence of dynamic workflows, staying in control between phases (read each phase's result, then launch the next). Fanning subagents across the slices of a large plan, with review-and-fix loops, is the whole point.

**A large, multi-slice plan is the expected input — decompose it across workflows and deliver it in full. Do NOT bail merely because the plan is large; size is what this approach exists to handle.** Stop only on genuine missing information that makes safe implementation impossible — then post a Tasks blocker comment and stop. Never ship partial or stubbed work (CLAUDE.md guardrails).

### Workflow fan-out limits (avoid throttling) — apply to EVERY phase below

When you use the `Workflow` tool to fan out subagents:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 (e.g. process 14 slices as four waves; review 12 findings as three waves). Firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. In the workflow script, chunk the items and `await` each small `parallel(...)` batch before the next — do not pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real result or finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced agents that read many files often finish without emitting the structured output. Have each reader/reviewer return a fixed-shape **markdown** fragment, and reserve any `schema` for the single synthesis/aggregation step.

Run these phases **in order; none may be skipped**, and **carry the work all the way through to Phase F** — do not stop after implementation. Every phase A–F must actually run; the issue is not done until Phase F has completed.

### Per-phase verification gate (after EVERY phase, before the next)

At the end of each phase — A, B, C, D, E, and F — and **before** starting the next, verify that phase's output against **BOTH**: (1) the implementation plan at `docs/plans/<id>.md`, and (2) the **original Tasks ticket** description + every comment (human corrections, the UI amendment). Look for drift, missing requirements, regressions, and guardrail violations introduced in that phase. **Fix any issue you find before advancing**, then re-verify. Do NOT move to the next phase while the current phase's output diverges from the plan or the ticket. (Phase D is the full, comprehensive acceptance review of the whole implementation; this gate is the lighter *incremental* check scoped to what the just-finished phase produced — both run. For a heavy phase you may run this gate as its own small reviewer workflow.)

- After **A** — the build spec covers every plan step and every ticket functional + UI requirement; nothing is silently dropped or pushed out of scope.
- After **B** — each implemented slice matches its plan step and the ticket; the typecheck / codegen / validate gates are green.
- After **C** — the rebase preserved every requirement; no plan/ticket behaviour was lost while resolving conflicts; gates still green.
- After **D** — findings are tagged at all severity levels and adversarially verified (this *is* the comprehensive check).
- After **E** — every confirmed finding is actually resolved and re-verified against the plan/ticket; the fixes introduced no new drift.
- After **F** — the final state satisfies the full plan + ticket; all gates pass.

### Phase A — Understand & specify (workflow)
Fan out parallel reader subagents — one per plan slice / subsystem (backend module, schemas, chat orchestrator, settings, UI, etc.). Each reads the relevant existing code in `WT`, the plan steps it owns, and the ticket requirements it must satisfy, and returns: exact files to create/modify, interfaces/contracts, the closest existing analogue, and the ticket acceptance checks it fulfils. Synthesize into ONE dependency-ordered build spec: the ordered slice list, each slice's **file set (disjoint across any slices run in parallel)**, and the requirements it covers. The spec must exist before any code is written.

### Phase B — Implement (workflow)
Build from the spec in dependency order. Parallelize ONLY file-disjoint slices — **never two subagents editing the same file at once**. Order: backend schemas/module/service/resolver first; `pnpm graphql:codegen` after schema changes; BFF + frontend after the GraphQL/BFF contracts exist. After each wave, a gate subagent runs the scoped `pnpm typecheck` / `pnpm graphql:codegen` / `pnpm validate:graphql` and reports failures; the next wave does not start until the gate is green. Production code only — no mocks, stubs, placeholders, or fallbacks. Commit the implementation in `WT` (stage only files you created/modified — never `git add .`).

### Phase C — Rebase onto staging
`git -C "$WT" fetch origin staging`, then rebase `ai/<id>` onto `origin/staging` and **resolve every conflict faithfully** — integrate both sides, never drop existing staging work or your own. Re-run the typecheck/build gate to confirm the integration compiles. **Do NOT push.**

### Phase D — Acceptance review vs the original ticket (workflow)
Fan out parallel reviewer subagents auditing the implemented worktree code against the **original ticket description + every comment** (especially human corrections and any UI amendment), the plan, and any UI mocks. One reviewer per dimension: (1) **requirement completeness** — every functional + UI requirement is fully implemented, not partial or stubbed; (2) **correctness** — bugs, data flow, edge cases; (3) **guardrails** — no mocks/stubs/fallbacks, prompts in the `prompts` collection, AI via the gateway (no direct provider SDK), auth/BFF patterns, visibility/MNPI enforced at READ and WRITE; (4) **UI fidelity** — copy, badge labels, states, design rules vs the mocks; (5) **security** — visibility leakage, multi-company isolation, secrets, citation-tag stripping. Each reviewer returns findings tagged **Critical / High / Medium / Low** with `file:line` and the exact ticket/plan/mock clause violated. Then **adversarially verify** each finding with independent subagents (confirm it's real against the actual code) to suppress false positives.

### Phase E — Resolve findings (workflow)
Fix **every confirmed finding at all severity levels** (Critical → Low). Parallelize file-disjoint fixes; serialize overlapping ones. Re-gate with typecheck / lint / validate. Loop Phase D → Phase E until an acceptance pass surfaces no confirmed Critical/High/Medium findings and only optional Low items remain; document any Low you intentionally defer.

### Phase F — Finalize
Run the full gates (`pnpm validate:all`, `pnpm validate:graphql`, `pnpm typecheck`, `pnpm lint`, scoped sensibly) and commit any outstanding fixes in `WT`. **Do NOT push and do NOT open a PR** — the branch stays local in the worktree for human review. Post a completion comment on the issue via `mcp__diolog-tasks__create_comment`:

```
**Implementation Complete (local branch — no PR)**

**Summary:** <1-2 sentences on what was built>
**Branch:** `ai/<id>` (local, rebased on `origin/staging`, not pushed; worktree: .worktrees/<ID>)
**Built by slice:**
- <slice>: <files / what changed>
**Rebase:** <clean, or conflicts resolved in: file list>
**Acceptance review:** <N findings — Critical/High/Medium/Low counts> found and resolved.<any deferred Low items, with reason>
**Gates:** validate:all / validate:graphql / typecheck / lint — <pass/fail>

— Claude (AI Assistant)
```

Then move the issue to `Developer Review` via `mcp__diolog-tasks__update_issue` with the resolved state ID (skip only if already in `Developer Review`, `In Progress`, `In Review`, or further downstream).

## Commit convention

`<type>(<scope>): <summary under 72 chars>` (types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`), a short body, a `Resolves <ID>` line, and `Co-Authored-By: Claude (AI Assistant) <noreply@anthropic.com>`. Stage only files you created or modified — never `git add .`.

## Guidelines

- Follow the target project's CLAUDE.md. Production-ready code only.
- **Do NOT push the branch and do NOT open a PR.** The work stays local in the worktree, committed and rebased on `origin/staging`, for human review. The diolog-tasks MCP is for the completion comment and the status update only.
- Every phase (A–F) is mandatory and must run to completion through Phase F; do not skip the spec phase, the rebase, the acceptance review, or the fix-resolution loop. Do not finalize (Phase F) until A–E have each completed AND passed their per-phase plan+ticket verification gate (above). After each phase, check the just-produced output against the plan and the original ticket and fix any issue before continuing — verification is continuous, not deferred to the end.
- Do NOT block on plan size — decompose and deliver. Block only on genuine missing information: post a Tasks blocker comment, do NOT change status, and stop. Never ship partial or stubbed work to dodge a block.
- Cost note: heavy fan-out on Opus burns your interactive allowance fast. Route read/spec/review subagents to a cheaper model where the `Workflow` tool allows a per-agent model override, and reserve the strongest model for implementation and fixes.
