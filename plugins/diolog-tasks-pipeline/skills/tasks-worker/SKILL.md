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

### Conformance checks (after Phase B and Phase C — not after every phase)

After **B** and after **C**, and **before** starting the next phase, check that phase's output against **BOTH**: (1) the implementation plan at `docs/plans/<id>.md`, and (2) the **original Tasks ticket** description + every comment (human corrections, the UI amendment). The question is narrow — did this phase drift from, drop, or half-build a stated requirement? — and it is answered with evidence (the clause, the `file:line`, the gate you actually ran), then fixed before advancing. Do **NOT** add re-read passes after A, E, or F: Phase A ends by producing its own checklist, Phase D *is* the comprehensive review, and Phase E re-verifies exactly the findings it fixed. Stacking further same-author re-reads adds cost without recall — current models self-check unprompted, and Anthropic's Opus 5 guidance is explicit that carried-over verification instructions cause over-verification. The tokens NOT spent re-reading here are what pay for the browser/measurement evidence Phase D requires. The oracle-vs-re-read line is drawn in the twin's `feature-spec-pipeline/skills/work/references/model-and-effort.md` §6.

**A green gate is necessary but not sufficient — never mistake it for "it works."** Typecheck plus a passing test suite do NOT prove a surface behaves: a test that stubs the unit under test hides exactly the runtime breakage it appears to cover. Treat every new critical seam — a persisted read/write round-trip, an auth/scope/visibility check, a sanitiser, an external adapter, a served page/endpoint — as unverified until the REAL (un-stubbed) path is exercised; if the only way to show it works is to run it, run it. Never report a gate as passed that you did not actually run.

### Phase A — Understand & specify (workflow)
Fan out parallel reader subagents — one per plan slice / subsystem (backend module, schemas, chat orchestrator, settings, UI, etc.). Each reads the relevant existing code in `WT`, the plan steps it owns, and the ticket requirements it must satisfy, and returns: exact files to create/modify, interfaces/contracts, the closest existing analogue, and the ticket acceptance checks it fulfils. Synthesize into ONE dependency-ordered build spec: the ordered slice list, each slice's **file set (disjoint across any slices run in parallel)**, and the requirements it covers. The spec must exist before any code is written.

**Produce the acceptance checklist up front, as part of the build spec — do NOT defer it to Phase D.** Enumerate, as an explicit numbered checklist, every requirement and constraint from the ticket + comments + plan (the Clause table, built now); and for every new user-facing capability, the UI→producer wire it must complete end-to-end (the Reachability table, built now). Assign each row to the slice that owns it. Building this list *before* code is what stops a requirement being silently dropped; carry the same checklist into Phase D and re-audit against it — do not regenerate a different one.

### Phase B — Implement (workflow)
Build from the spec in dependency order. Parallelize ONLY file-disjoint slices — **never two subagents editing the same file at once**. Order: backend schemas/module/service/resolver first; `pnpm graphql:codegen` after schema changes; BFF + frontend after the GraphQL/BFF contracts exist. After each wave, a gate subagent runs the scoped `pnpm typecheck` / `pnpm graphql:codegen` / `pnpm validate:graphql` and reports failures; the next wave does not start until the gate is green. Production code only — no mocks, stubs, placeholders, or fallbacks. Commit the implementation in `WT` (stage only files you created/modified — never `git add .`).

**Each slice self-certifies before it reports done — "I edited these files" is not done.** Every implementer subagent returns: the checklist row(s) it satisfied at `file:line`, the real (non-test) caller that reaches its new code, and — for any critical seam it touched — the real-path exercise it actually ran and the observed result. **Wire-through gate (with typecheck after the frontend/BFF wave):** for every new endpoint, exported client/BFF function, and action-seam field, grep the diff for a real, non-test caller — an API route with no BFF caller, a client fn referenced only by itself + a test, or an optional action-seam field (`actions?.x?.() ?? fallback`) the host never populates is **dead-on-arrival: fail the wave and wire it now**, don't defer to Phase D. Build surgically and simply (Karpathy): every changed line traces to a checklist row; no drive-by refactors, no speculative abstraction.

**Affected-test sweep (mandatory, mechanical — run it with the wire-through gate).** Grep the repo's test trees (`e2e/`, `*.spec.*`, `*.test.*`) for every route, component name, user-visible string, and behaviour this branch changes or **inverts**. Every hit is in scope for this ticket: update it to the new contract and RUN it. A spec that asserts the behaviour you are removing is part of your diff — leaving it red, or `fixme`'d asserting the old world, is shipping a broken test. For every behavioural requirement, produce the **regression-discrimination proof**: the updated/added test shown failing against the pre-change code (or with the fix reverted) and passing after — record both shas for the completion comment's Tests row.

**The default executor for a plan-scoped slice is the Codex CLI — `gpt-5.6-sol` at `medium` reasoning effort — with the plan and ticket as its context.** The plan already made the decisions; the executor types. You stay the orchestrator and own every phase, gate, review, and judgment call.

```bash
codex exec -C "$WT" -m gpt-5.6-sol -c model_reasoning_effort="medium" \
  -s workspace-write --dangerously-bypass-hook-trust \
  -o "$WT/.codex/last-<slice>.md" "<prompt>" < /dev/null
```

Codex has no Tasks access, so **materialize the requirement source as files**: write the ticket description + the full comment thread (triage assumptions, human replies, any UI amendment) to a markdown file in the main tree alongside `docs/plans/<id>.md`, and name both in the prompt **as absolute paths**. That last part is load-bearing: those docs are untracked and live in the **main working tree**, so under `-C "$WT"` a relative `docs/plans/<id>.md` resolves inside the worktree, finds nothing, and Codex quietly builds from the task description alone — a run that looks successful and is grounded in nothing. (`workspace-write` confines *writes* to the worktree but does not restrict reads, so absolute main-tree paths work.) Have the run report one distinctive fact from the plan so you can confirm the read landed. Then, before the first invocation, **install and self-test the re-context harness** — a `PostCompact` hook that drops a flag plus a `PostToolUse` hook that re-emits those two documents **verbatim** as injected context, so a compaction can't dilute them (a summarised plan is how a long build drifts off its requirements). The generator, the wire format (the emitted field is **`hookEventName`**, camelCase — snake_case fails the payload silently), the self-test, the never-delegate list, and the verify-fix loop are all in the generalized twin's `feature-spec-pipeline/skills/work/references/codex-cli.md` (role R3) — read it before delegating; don't improvise the invocation. Keep `$WT/.codex/` out of the commit.

**Check the repo opt-out before every invocation** (`ANTHROPIC-ONLY` / `NO EXTERNAL MODEL CLIS` / `external-model-clis: off` in `CLAUDE.md`/`AGENTS.md`/`ORCHESTRATOR.md`) — delegating implementation is egress too: the executor ships the plan, the ticket and every file it opens to OpenAI. A hit means you write the code and log `codex: opted out (<file>) → claude`.

Codex typed it; that is not verified. `workspace-write` has no network, so **you** read the whole diff (reverting out-of-scope hunks), run the gates, and hold the slice to the self-certification bar above. One retry with the failure quoted; a second failure means you write the slice and log `codex: reverted`. Any lane failure routes the work back to Claude — never dropped, never deferred because the executor was down. Phase E fixes may use the same lane on the same terms, except that a finding whose *diagnosis* is the hard part, and anything on the never-delegate list (security, governance gates, identity/attribution, conflict resolution), you fix yourself.

### Phase C — Rebase onto staging
`git -C "$WT" fetch origin staging`, then rebase `ai/<id>` onto `origin/staging` and **resolve every conflict faithfully** — integrate both sides, never drop existing staging work or your own. Re-run the typecheck/build gate to confirm the integration compiles. **Do NOT push.**

### Phase D — Acceptance review vs the original ticket (workflow)

**Ground the review in two oracles BEFORE you fan out, and emit BOTH as tables — "I reviewed it" is not falsifiable; a filled table is.** Start from the acceptance checklist built in Phase A (do not regenerate a different list) and fill in each row's satisfying `file:line`:
- **Clause table** — every requirement/constraint/assumption row names the exact `file:line` that satisfies it, or files a finding at that clause's severity. Verify give-away words literally ("enforced **server-side**", "**Owner**-only", "de-duped **per list**") — these are the invariants an implementer most often half-builds.
- **Reachability table** — for EVERY new user-facing capability, trace `file:line` at each hop: UI entry → host action → BFF/client fn → API route → producer → back. A missing hop is an automatic **Critical** (a dead-on-arrival feature that type-checks), not a Medium.

Fan out parallel reviewer subagents auditing the implemented worktree code against the **original ticket description + every comment** (especially human corrections and any UI amendment), the plan, and any UI mocks. One reviewer per dimension: (1) **requirement completeness** — every functional + UI requirement is fully implemented, not partial or stubbed; (2) **correctness** — bugs, data flow, edge cases; (3) **guardrails** — no mocks/stubs/fallbacks, prompts in the `prompts` collection, AI via the gateway (no direct provider SDK), auth/BFF patterns, visibility/MNPI enforced at READ and WRITE **server-side, never on a client-supplied value**; (4) **UI fidelity** — copy, badge labels, states, design rules vs the mocks; (5) **security** — visibility leakage, multi-company isolation, secrets, citation-tag stripping, injection + untrusted input; (6) **simplicity & surgical diff (Karpathy)** — no speculative abstraction, dead scaffolding, or drive-by edits outside the slice's scope. Each reviewer returns findings tagged **Critical / High / Medium / Low** with `file:line` and the exact ticket/plan/mock clause violated. Then **adversarially verify — aimed, not blanket:** independent subagents confirm a finding against the actual code, which is a precision filter, so spend it on every Critical, every structural fix, and anything reversing a locked decision rather than 1:1 on Lows. Never brief a reviewer to be conservative or to report only serious findings — it is followed literally and lowers recall; report everything, filter here.

**Exercise, don't just read.** For the miss-classes that survive a code-read plus an all-green gate — compile-clean-but-runtime-broken boundaries, inert/not-wired-end-to-end affordances, mis-wired actions (a `schedule` that calls `publish`), optional-callback seams hiding unwired code, hardcoded data behind a real-looking UI, client-asserted identity/authority, wrong-target or silently-capped mutations, boundary-value logic — exercise the real path (call the endpoint, render the page, round-trip a persisted doc, feed a hostile input). **An unverified critical path is a BLOCKER, not a finding**: the status does not advance and no behavioural claim about that path may appear in any comment. Claiming verification is environmentally impossible requires (1) the exact failing command and its output, and (2) a **second, independent probe** agreeing — a `which <tool>` miss is not evidence of "no browser" while the app answers HTTP and browser tools sit in your tool list. Record the blocker WITH its dissolution condition ("blocked until the branch is served"), and re-test the moment the condition clears — merging to the served branch clears it. A blocker that survives a context compaction must be re-verified before it is restated: re-run the probe, don't repeat the claim. The full worked catalogue lives in the generalized twin (`feature-spec-pipeline/skills/work`, Phase D) — the two skills must stay in sync; when one Phase D evolves, port the change to the other.

**Substitute nothing for a measurement.** Any ticket item phrased as a *visual* defect ("wrong font", "goes off the boundary", "hidden behind", "overlaps") closes only on a `getComputedStyle` / `getBoundingClientRect` / `elementFromPoint` measurement from the rendered page, pasted into the evidence cell — never on a class string, a constant, or "in the code and typecheck clean". Never derive a rendered fact from source (a `tw-text-[20px]` class proves nothing about what wins the cascade), and never ship an estimated dimension where a measured one was declared unverifiable — measure or block. Any clause of the form "X is written / ingested / scheduled / sent" closes on the `spec-validation` skill's bar: name the producer at `file:line`, then show a stored row / fired job / received message from a real run — or classify it AUTHORED/MOCK and file the finding.

**Verification tooling (the repo provides it — use it, don't relitigate it).** The target repo's CLAUDE.md documents the browser lane: `playwright-cli` against the local stack (dev-login first), or the `claude-in-chrome` MCP. The recurring "worktree isn't served" blocker has a ladder — (i) serve the app from the worktree; (ii) if the branch has already merged to the served branch, verify on the merged stack **before** posting any behavioural claim; (iii) the browser MCP. Secure-context APIs (`navigator.clipboard`, `crypto.randomUUID`) are dead on plain-HTTP local origins — assert the affordance and the failure path there, and note the https caveat (see acceptance-e2e's `references/diolog-e2e-harness.md` §9 for the trap list).

**Run the completeness critic as the last reviewer — and run it OUT OF FAMILY, on the Codex CLI (`gpt-5.6-sol`, `max` effort, read-only).** It attacks the audit itself: which checklist rows were never matched to a `file:line` (or matched to one that doesn't actually satisfy the clause when read), which reachability hop was never traced, which critical seam was read but never exercised, which contract arm has no in-product producer, which dimension returned "nothing" on a surface too large for silence?

This is deliberately **not** a Claude subagent: every other Phase D reviewer is Claude auditing Claude's own build, and an author-judged oracle is how a family's blind spot ships green.

```bash
codex exec -C "$WT" -m gpt-5.6-sol -c model_reasoning_effort="max" \
  -s read-only -o /tmp/codex-critic-<ID>.md "<prompt>" < /dev/null
```

Codex has no Tasks access — write the ticket description + full comment thread, the plan, and the filled Clause/Reachability tables + findings to scratch files and name them in the prompt; it cannot critique an audit it cannot see. The verbatim prompt (R2), the availability check, and the fallback live in the generalized twin's `feature-spec-pipeline/skills/work/references/codex-cli.md`. Its output seeds the next audit round — every item goes back through the reviewers, never straight to "resolved". Bound the call (`perl -e 'alarm shift @ARGV; exec @ARGV' 600 codex exec …`), verify `reasoning effort: max` in the captured log, and treat an empty `-o` file as a lane failure rather than a pass. If the lane is unavailable (no binary, not logged in, usage/rate limit, empty output, deadline fired, repeated errors) **or the repo opted out** — an `ANTHROPIC-ONLY` / `NO EXTERNAL MODEL CLIS` / `external-model-clis: off` marker in `CLAUDE.md`/`AGENTS.md`/`ORCHESTRATOR.md`, re-checked **before every Codex call** because it is the only kill-switch reaching a run already in flight — fall back to a Claude strong-model critic with the same prompt and **record it** in the completion comment. Availability and the opt-out are the only licensed skips; the opt-out exists because `-s read-only` restricts writes, not egress, and every call ships the code it reads to OpenAI.

### Phase E — Resolve findings (workflow)
Fix **every confirmed finding at all severity levels** (Critical → Low), test-first where the finding is a bug (write the failing check that reproduces it, then make it pass) and **surgically** (the fix touches only what the finding names). Parallelize file-disjoint fixes; serialize overlapping ones. Re-gate with typecheck / lint / validate, and re-run the specific evidence checks (measurement / exercised request / test) for each fixed row. Then run **one** targeted re-audit pass over the fixed items plus the out-of-family critic's seed items — not a fresh full Phase D, and not a loop that runs until reviewers go quiet: repeated same-author audit rounds add cost without recall (see the conformance-check note above), and the budget belongs on the real-path evidence. Document any Low you intentionally defer.

### Phase F — Finalize
Run the full gates (`pnpm validate:all`, `pnpm validate:graphql`, `pnpm typecheck`, `pnpm lint`, scoped sensibly), run every test touched or added by the affected-test sweep, and commit any outstanding fixes in `WT`. **Do NOT push and do NOT open a PR** — the branch stays local in the worktree for human review. Post a completion comment on the issue via `mcp__diolog-tasks__create_comment`:

```
**Implementation Complete (local branch — no PR)**

**Summary:** <1-2 sentences on what was built>
**Branch:** `ai/<id>` (local, rebased on `origin/staging`, not pushed; worktree: .worktrees/<ID>)
**Built by slice:**
- <slice>: <files / what changed>
**Rebase:** <clean, or conflicts resolved in: file list>
**Reachability (every new capability reaches its producer):**
| Capability | UI entry | Host action | BFF/client | API route | Producer | Wired? |
|---|---|---|---|---|---|---|
| <capability> | `file:line` | `file:line` | `file:line` | `file:line` | `file:line` | ✅ / ✗ |
**Clause coverage:**
| Clause | Kind | Evidence | Status |
|---|---|---|---|
| <clause> | static / visual / behavioural | see evidence rule | ✅ / ✗ |
**Tests:** <spec ids updated/added — each red@<sha-before> → green@<sha-after>> · existing specs asserting the old behaviour: <none found (patterns searched: …) | list, all updated + run>
**Acceptance review:** <N findings — Critical/High/Medium/Low counts> found and resolved.<any deferred Low items, with reason>
**Implementation assumptions:** <ambiguity the plan/ticket didn't pin down that you resolved yourself, one line each with the call made — "none" if fully determined. Never bury a silent pick.>
**Dropped or changed vs plan/ticket:** <every promised mechanism NOT delivered or replaced — the promise, what shipped instead, why; "none" only if literally nothing. An undisclosed drop discovered later is a finding against this run.>
**Gates:** validate:all / validate:graphql / typecheck / lint / affected tests — <pass/fail (actually run)>
**Codex lane:** critic: <N seed items — M became confirmed findings> · exec: <N tasks, M retries, K reverted> — or `unavailable → claude` with the reason
**Reviewing models:** <the wire-verified model per review gate — so REVIEWER ≥ WRITER is checkable from the artifact>

— Claude (AI Assistant)
```

**The evidence rule (what a Clause row may cite):** a STATIC clause (naming, schema shape, copy in source, a config value) may close on `file:line`. A VISUAL clause closes only on a pasted measurement — `getComputedStyle` / `getBoundingClientRect` values, or a screenshot path — from the rendered page. A BEHAVIOURAL clause closes only on an exercised request→response (verbatim status + body fragment) or a named test shown red→green. "In the code and typecheck clean" is never evidence for a visual or behavioural clause. **There is no partial status**: a row without admissible evidence is ✗, and there is no "flagged rather than claimed" category — a row you cannot close is a blocker comment, not a caveat.

**Keep the comment to its shape** — tables, counts, assumptions, drops, gate results; not a narrative of the phases (twin's `model-and-effort.md` §7). **Caveats propagate**: every blocker/✗ in this comment must appear verbatim in any later merge/close comment — a closing comment may never carry a stronger claim than the evidence table beneath it.

**Gate on the tables:** do not move to `Developer Review` **while any Reachability or Clause row is not ✅.** A row you cannot close is a blocker comment naming the row, and the status stays put.

**If the operator instructs you to merge or push**, that instruction changes the destination, never the bar: first run ship-feature's fail-closed pre-merge gate (`ship-feature/skills/ship-feature/references/e2e-and-finalize.md` — every box actually checked NOW, not recalled), including: no non-✅ rows, affected tests run, behavioural evidence present for every UI claim. A merge instruction does not waive any box; a red or unverifiable box means STOP and report the exact blocker.

Then move the issue to `Developer Review` via `mcp__diolog-tasks__update_issue` with the resolved state ID (skip only if already in `Developer Review`, `In Progress`, `In Review`, or further downstream).

## Commit convention

`<type>(<scope>): <summary under 72 chars>` (types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`), a short body, a `Resolves <ID>` line, and `Co-Authored-By: Claude (AI Assistant) <noreply@anthropic.com>`. Stage only files you created or modified — never `git add .`.

## Guidelines

- Follow the target project's CLAUDE.md. Production-ready code only.
- **Deliver what was asked, at the scope intended.** Make routine judgment calls yourself; if the ticket seems mistaken or a better approach exists, say so in a sentence and continue with the task as asked rather than quietly narrowing, widening, or transforming it. A change that reaches beyond the ticket's surfaces (a shared component, a global utility) is disclosed as its own line item — and any follow-up task you recommend must be **created** (cite its id) or explicitly declined by the operator, never left as "recommend raising a separate task".
- **Do NOT push the branch and do NOT open a PR** unless the operator explicitly instructs it — and then only through the pre-merge gate in Phase F. The work stays local in the worktree, committed and rebased on `origin/staging`, for human review. The diolog-tasks MCP is for the completion comment and the status update only.
- Every phase (A–F) is mandatory and must run to completion through Phase F; do not skip the spec phase, the rebase, the acceptance review, or the fix-resolution pass. Do not finalize (Phase F) until A–E have completed, the B/C conformance checks passed, and every clause row carries admissible evidence.
- Do NOT block on plan size — decompose and deliver. Block only on genuine missing information: post a Tasks blocker comment, do NOT change status, and stop. Never ship partial or stubbed work to dodge a block.
- Effort is the second dial alongside model, canonical in the twin's `feature-spec-pipeline/skills/work/references/model-and-effort.md`: `low` for readers and gate-runners, `low`–`medium` for evidence lenses, `high` for synthesis and the judgement lenses; an agent spawned without an explicit effort runs at `high`. Step effort down before model down — a strong model at low effort stays in its capability class, so it keeps REVIEWER ≥ WRITER where a model downgrade would not.
- Cost note: heavy fan-out on Opus burns your interactive allowance fast. Route read/spec/review subagents to a cheaper model where the `Workflow` tool allows a per-agent model override, and reserve the strongest model for judgment work — Phase A synthesis, Phase C conflict resolution, and the security/guardrails/identity lenses. Mechanical Phase B/E slices go to the **Codex executor** (`gpt-5.6-sol` at `medium`, per Phase B) under your verify-fix loop; the **completeness critic** moves sideways rather than down, to Codex at `max` effort (Phase D). The invariant that keeps the downgrades safe is **REVIEWER ≥ WRITER**: for every artifact, the strongest reviewer is at least as strong as the strongest model that wrote it.
- Sync note: `feature-spec-pipeline/skills/work` is this skill's generalized twin and carries the canonical phase text, including the full Codex reference at `references/codex-cli.md` (the three roles, the prompt contracts, the re-context harness, the fallback and accounting rules). When a phase or the Codex lane evolves there, port the change here in its compact form — don't fork the reference.
