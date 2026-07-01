---
name: work
description: Implement a planned feature spec end-to-end in an isolated git worktree using dynamic ultracode workflows, for the markdown feature-spec pipeline. Reads the plan (docs/plans/plan-DIO-0001.md) and spec (docs/specs/spec-DIO-0001.md), then runs understand and specify, implement (file-disjoint fan-out plus typecheck gates), rebase onto origin/staging resolving conflicts, acceptance-review the code against the original feature description plus the triage assumptions/answers (findings at all severity levels), and resolve every finding. Commits locally and appends a progress section to the spec, setting status to In Review; it does NOT push or open a remote PR — the branch stays local for human review. Use when the user says "work DIO-0001", "implement DIO-0001", "run the worker on DIO-0001", or asks to build out a feature spec that already has a plan. Runs in the current session (Read/Write/Edit/Glob/Grep/Bash plus the Workflow tool) — no Linear, no Agent SDK.
---

# Feature Spec Worker (markdown specs)

Implement a planned feature spec inside an isolated git worktree, driven by **dynamic ultracode workflows**, and leave the branch **local** for human review — no remote PR.

You run **in your current session** as the orchestrator, using `Read`/`Write`/`Edit`/`Glob`/`Grep`/`Bash` and the `Workflow` tool. You use no Linear MCP and invoke no Agent SDK script. The spec markdown file replaces the Linear issue + comment thread: it carries the original feature description and the triage assumptions/answers, and you append your completion progress to it at the end.

## Inputs

- A spec id (`DIO-0001`). It should already have an implementation plan at `docs/plans/plan-<ID>.md` and a spec at `docs/specs/spec-<ID>.md` (produced by `/triage` and `/plan`). If the plan file is missing, work from the spec's feature description + triage answers and flag the absence in the final progress section.

Throughout: `<ID>` is the uppercase id (e.g. `DIO-0001`, used in file names and the commit `Resolves` line); `<id>` is its lowercase form (e.g. `dio-0001`, used in the branch name).

## Setup (do this before any phase)

1. From the target repo root, create the worktree and branch:
   ```
   git fetch origin staging
   git worktree add .worktrees/<ID> -b ai/<id> origin/staging
   ```
   (If `.worktrees/<ID>` already exists, reuse it.) Let `WT` = the absolute path to that worktree.
2. **Read the plan and spec from the main repo** at the absolute `docs/plans/plan-<ID>.md` and `docs/specs/spec-<ID>.md` (the worktree is branched from `origin/staging` and won't contain the untracked docs — read them from the main working tree). The plan is the build source of truth; the spec's `## Feature description` + the latest `## Triage` section (Assumptions and any human answers/edits) are the requirement source of truth. Human answers are authoritative decisions.
3. **Mark the spec In Progress.** In the main working tree, set the spec header `Status: In Progress` (and `Last updated`), and update the ledger row's Status to `In Progress`.
4. Do all implementation file edits and git commands **inside the worktree** (`WT`) — use absolute paths or `git -C "$WT"`. When you spawn workflow subagents, give each the absolute worktree path and an explicit, **disjoint** file scope so their reads/writes/commands target this worktree and never collide. (The spec/plan/ledger docs are NOT code — leave them in the main working tree; don't commit them onto the feature branch.)

## How you must run this — ultracode dynamic workflows

You are the **orchestrator**, not a single-pass implementer. Drive the work as a sequence of dynamic workflows, staying in control between phases (read each phase's result, then launch the next). Fanning subagents across the slices of a large plan, with review-and-fix loops, is the whole point.

**A large, multi-slice plan is the expected input — decompose it across workflows and deliver it in full. Do NOT bail merely because the plan is large; size is what this approach exists to handle.** Stop only on genuine missing information that makes safe implementation impossible — then append a blocker note to the spec and stop. Never ship partial or stubbed work (CLAUDE.md guardrails).

### Workflow fan-out limits (avoid throttling) — apply to EVERY phase below

When you use the `Workflow` tool to fan out subagents:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 (e.g. process 14 slices as four waves; review 12 findings as three waves). Firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. In the workflow script, chunk the items and `await` each small `parallel(...)` batch before the next — do not pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real result or finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced agents that read many files often finish without emitting the structured output. Have each reader/reviewer return a fixed-shape **markdown** fragment, and reserve any `schema` for the single synthesis/aggregation step.

Run these phases **in order; none may be skipped**, and **carry the work all the way through to Phase F** — do not stop after implementation. Every phase A–F must actually run; the spec is not done until Phase F has completed.

### Per-phase verification gate (after EVERY phase, before the next)

At the end of each phase — A, B, C, D, E, and F — and **before** starting the next, verify that phase's output against **BOTH**: (1) the implementation plan at `docs/plans/plan-<ID>.md`, and (2) the **spec** (`docs/specs/spec-<ID>.md`) — the original feature description + every triage answer (human corrections, assumptions). Look for drift, missing requirements, regressions, and guardrail violations introduced in that phase. **Fix any issue you find before advancing**, then re-verify. Do NOT move to the next phase while the current phase's output diverges from the plan or the spec. (Phase D is the full, comprehensive acceptance review of the whole implementation; this gate is the lighter *incremental* check scoped to what the just-finished phase produced — both run. For a heavy phase you may run this gate as its own small reviewer workflow.)

**A green gate is necessary but not sufficient — never mistake it for "it works."** Typecheck plus a passing test suite do NOT prove a surface behaves correctly: a test that *stubs the unit under test* hides exactly the runtime breakage it appears to cover (this is the single most common way a broken feature ships past this review with an all-green gate). Therefore: (1) treat every new critical path — a persisted read/write round-trip, a sanitiser, an auth/scope/visibility check, an external adapter, a served page or endpoint — as **unverified until the REAL (un-stubbed) path is exercised**, whether by a test that runs the real code or a manual invocation; if the only way to show it works is to run it, run it. (2) A test that mocks the very thing it claims to verify does **not** count as coverage for that thing — flag it and add a real-path test. (3) Never report a gate as passed that you did not actually run; if you skip any gate, say so **prominently as a caveat**, not a footnote.

- After **A** — the build spec covers every plan step and every feature requirement (functional + UI) from the spec; nothing is silently dropped or pushed out of scope.
- After **B** — each implemented slice matches its plan step and the spec; the typecheck / codegen / validate gates are green.
- After **C** — the rebase preserved every requirement; no plan/spec behaviour was lost while resolving conflicts; gates still green.
- After **D** — findings are tagged at all severity levels and adversarially verified (this *is* the comprehensive check).
- After **E** — every confirmed finding is actually resolved and re-verified against the plan/spec; the fixes introduced no new drift.
- After **F** — the final state satisfies the full plan + spec; all gates pass.

### Phase A — Understand & specify (workflow)
Fan out parallel reader subagents — one per plan slice / subsystem (backend module, schemas, chat orchestrator, settings, UI, etc.). Each reads the relevant existing code in `WT`, the plan steps it owns, and the spec requirements it must satisfy, and returns: exact files to create/modify, interfaces/contracts, the closest existing analogue, and the feature acceptance checks it fulfils. Synthesize into ONE dependency-ordered build spec: the ordered slice list, each slice's **file set (disjoint across any slices run in parallel)**, and the requirements it covers. The build spec must exist before any code is written.

### Phase B — Implement (workflow)
Build from the spec in dependency order. Parallelize ONLY file-disjoint slices — **never two subagents editing the same file at once**. Order: backend schemas/module/service/resolver first; `pnpm graphql:codegen` after schema changes; BFF + frontend after the GraphQL/BFF contracts exist. After each wave, a gate subagent runs the scoped `pnpm typecheck` / `pnpm graphql:codegen` / `pnpm validate:graphql` and reports failures; the next wave does not start until the gate is green. Production code only — no mocks, stubs, placeholders, or fallbacks. Commit the implementation in `WT` (stage only files you created/modified — never `git add .`).

### Phase C — Rebase onto staging
`git -C "$WT" fetch origin staging`, then rebase `ai/<id>` onto `origin/staging` and **resolve every conflict faithfully** — integrate both sides, never drop existing staging work or your own. Re-run the typecheck/build gate to confirm the integration compiles. **Do NOT push.**

### Phase D — Acceptance review vs the spec (workflow)
Fan out parallel reviewer subagents auditing the implemented worktree code against the **spec's original feature description + every triage answer** (especially human corrections and any UI amendment), the plan, and any UI mocks. One reviewer per dimension: (1) **requirement completeness** — every functional + UI requirement is fully implemented, not partial or stubbed; (2) **correctness** — bugs, data flow, edge cases; (3) **guardrails** — no mocks/stubs/fallbacks, prompts in the `prompts` collection, AI via the gateway (no direct provider SDK), auth/BFF patterns, visibility/MNPI enforced at READ and WRITE; (4) **UI fidelity** — copy, badge labels, states, design rules vs the mocks; (5) **security** — visibility leakage, multi-company isolation, secrets, citation-tag stripping. Each reviewer returns findings tagged **Critical / High / Medium / Low** with `file:line` and the exact spec/plan/mock clause violated. Then **adversarially verify** each finding with independent subagents (confirm it's real against the actual code) to suppress false positives.

**Exercise, don't just read — the miss-classes that survive a code-read + an all-green gate.** These are the defects that repeatedly ship past this review because they type-check and pass a stubbed test suite. For each one the review must *exercise the real path* (call the endpoint, render the page, round-trip a real persisted doc, feed a hostile input), not merely read the code — or record the path as unverified in the findings. Check every one explicitly:
- **Compile-clean but runtime-broken** — a boundary that type-checks yet throws at runtime: a persisted-doc read parsed against a schema whose types don't match what the store actually returns (e.g. a DB `Date` vs a contract ISO string, an `ObjectId` vs a string), an env/config assumption, a "can't be null" that is. → Round-trip a real write→read and parse it; don't trust the types at the ORM/wire boundary.
- **Inert / not wired end-to-end** — a UI affordance with no working handler, a form/picker with no submit path, a backend module no caller reaches, a client still calling the OLD stub instead of the new endpoint (dead-on-arrival backend). → Trace every new user-facing capability from its UI entry point → BFF → API producer → back, and confirm a real caller reaches the new code; grep for a new symbol whose only callers are itself or tests.
- **Hardcoded / fabricated data behind a real-looking UI** — a component rendering a literal sample array, a success toast/return not backed by an actual call, a "ready/available/connected" state keyed off the wrong signal (an unrelated env var) instead of the real producer's presence. This is where the "no mocks/stubs/fallbacks" guardrail is most often violated *silently*. → Grep the diff for inline sample arrays in components, fabricated success returns, and honest-degradation gates tied to the wrong condition.
- **Untrusted-input surface not adversarially tested** — anything served to the public, rendering/sanitising untrusted or model-generated content, or crossing a trust boundary (auth/scope, SSRF, injection). Assume any regex-based sanitiser is bypassable. → Feed known payloads (XSS handler variants incl. slash-delimited `<svg/onload=…>`, CSS `@import`/`url(https://…)` beacons, `javascript:`/`data:` schemes, SSRF hosts, cross-tenant/scope-escalation) and confirm they are neutralised; prefer a **fail-closed** design (reject to a trusted default) over trusting the filter.
- **Wrong-zone / boundary-value logic** — time reasoned in UTC or the server-local zone instead of the participant's real IANA zone; DST gap/overlap; off-by-one; money/rounding; pagination/limit caps. → Test with a value that differs *across* the boundary (a non-UTC zone, a DST transition, an empty/oversized input), never just the happy path.
- **Decision-reversal without the guard** — a change that quietly reverses a locked spec decision (a zero-retention/read-only default, a visibility rule, a propose-never-apply gate) without the compensating opt-in/gate that decision requires.

Scale the review to the surface's trust level: public, security, persistence, and external-integration surfaces get more reviewers and a second verification pass. **Criticals cluster** — when the first pass finds *any* Critical, run another full audit round before trusting the result (a single shallow pass that reports "a handful of findings" on a large, high-trust surface is itself a red flag).

### Phase E — Resolve findings (workflow)
Fix **every confirmed finding at all severity levels** (Critical → Low). Parallelize file-disjoint fixes; serialize overlapping ones. Re-gate with typecheck / lint / validate. Loop Phase D → Phase E until an acceptance pass surfaces no confirmed Critical/High/Medium findings and only optional Low items remain; document any Low you intentionally defer.

### Phase F — Finalize
**Actually run** the full gates (`pnpm validate:all`, `pnpm validate:graphql`, `pnpm typecheck`, `pnpm lint`, scoped sensibly) — never infer a pass. If a gate genuinely cannot run in the environment, record it as an **explicit, prominent caveat** in the progress note (a skipped gate is a known risk, never an implied pass — "typecheck + 15 stubbed tests passed" is not a substitute for the full gate). Commit any outstanding fixes in `WT`. **Do NOT push and do NOT open a PR** — the branch stays local in the worktree for human review. Append a completion progress section to the **spec in the main working tree** (`docs/specs/spec-<ID>.md`):

```markdown
## Progress — <YYYY-MM-DD>

**Implementation Complete (local branch — no PR)**

**Summary:** <1-2 sentences on what was built>
**Branch:** `ai/<id>` (local, rebased on `origin/staging`, not pushed; worktree: .worktrees/<ID>)
**Built by slice:**
- <slice>: <files / what changed>
**Rebase:** <clean, or conflicts resolved in: file list>
**Acceptance review:** <N findings — Critical/High/Medium/Low counts> found and resolved.<any deferred Low items, with reason>
**Gates:** validate:all / validate:graphql / typecheck / lint — <pass/fail>
```

Then set the spec header `Status: In Review` (and `Last updated`), and update the ledger row's Status to `In Review`. (Skip the status change only if already `In Review` or further downstream.)

## Commit convention

`<type>(<scope>): <summary under 72 chars>` (types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`), a short body, a `Resolves <ID>` line, and `Co-Authored-By: Claude (AI Assistant) <noreply@anthropic.com>`. Stage only files you created or modified — never `git add .`.

## Guidelines

- Follow the target project's CLAUDE.md. Production-ready code only.
- **Do NOT push the branch and do NOT open a PR.** The work stays local in the worktree, committed and rebased on `origin/staging`, for human review. The only writes outside the worktree are the spec status + progress section and the ledger row, in the main working tree.
- Every phase (A–F) is mandatory and must run to completion through Phase F; do not skip the spec phase, the rebase, the acceptance review, or the fix-resolution loop. Do not finalize (Phase F) until A–E have each completed AND passed their per-phase plan+spec verification gate (above). After each phase, check the just-produced output against the plan and the spec and fix any issue before continuing — verification is continuous, not deferred to the end.
- Do NOT block on plan size — decompose and deliver. Block only on genuine missing information: append a blocker note to the spec, do NOT change status to `In Review`, and stop. Never ship partial or stubbed work to dodge a block.
- Cost note: heavy fan-out on Opus burns your interactive allowance fast. Route read/spec/review subagents to a cheaper model where the `Workflow` tool allows a per-agent model override, and reserve the strongest model for implementation and fixes.
