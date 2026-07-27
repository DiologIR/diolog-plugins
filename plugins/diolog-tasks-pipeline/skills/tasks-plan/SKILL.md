---
name: tasks-plan
description: Produce a detailed, codebase-grounded implementation plan for a Diolog Tasks issue, write it to docs/plans/{id}.md, then post a Tasks comment containing the repository-relative path to that file (it does NOT upload/attach the file) and move the issue to "Ready for AI". Classifies a plan-size tier (Trivial/Small/Standard/Large) and keeps plan length proportional. Formerly linear-plan. Use when the user says "plan DIO-1234", "write the implementation plan for this issue", "run the planner on DIO-1234", or asks for a build plan for a triaged Diolog Tasks ticket. Runs in the current session (diolog-tasks MCP + Read/Glob/Grep/Write + the Workflow tool for parallel investigation) — no Agent SDK, so usage draws from your interactive allowance, not the Agent SDK credit.
---

# Tasks Issue Planner

Produce an implementation plan for a Diolog Tasks issue by investigating the actual codebase, write it to a local markdown file, then leave a Tasks comment **pointing at that file by repository-relative path** (no upload), and move the issue to `Ready for AI`.

Runs **in your current session** with the **diolog-tasks MCP**, `Read`/`Glob`/`Grep`/`Write`, `Bash`, and the `Workflow` tool. It does not invoke any Agent SDK script.

## Diolog Tasks MCP notes

- Tools are named `mcp__diolog-tasks__<tool>` and are usually deferred — load them via `ToolSearch` (e.g. `select:mcp__diolog-tasks__get_issue,mcp__diolog-tasks__list_comments,mcp__diolog-tasks__create_comment,mcp__diolog-tasks__update_issue,mcp__diolog-tasks__list_workflow_states,mcp__diolog-tasks__search_issues`) before the first call.
- Statuses are **workflow states referenced by ID**. Resolve names (`Ready for AI`, etc.) to state IDs via `mcp__diolog-tasks__list_workflow_states` once per run. If a named state doesn't exist on the board, say so in your summary and make no status change.
- Issues carry `KEY-123` identifiers; resolve `DIO-1234` to the issue ID via `mcp__diolog-tasks__search_issues` / `list_issues` when a tool needs the ID.

## Inputs

- An issue id (`DIO-1234`). Optional `--dry-run` intent: write the plan file locally but make no Tasks writes.

## Procedure

1. **Fetch the issue + all comments** (`mcp__diolog-tasks__get_issue` + `mcp__diolog-tasks__list_comments`). Human replies are authoritative decisions; a prior triage **Assumptions** block is the default for anything the description didn't pin down (unless a human reply corrects it). Summarize intent — don't transcribe the ticket into the plan.

2. **Classify the plan-size tier** (Trivial / Small / Standard / Large) before writing — it sets the template and length budget. When in doubt, pick the smaller tier. See `references/plan-tiers.md`.

3. **Investigate the codebase at the tier's depth — fan out with the Workflow tool ("ultracode").** For Standard/Large tickets, spawn parallel reader subagents — one per element/subsystem the ticket references — each returning: the exact files to create/modify, the closest existing analogue, the interfaces/contracts, and any naming ambiguity. Synthesize their findings into the plan. For Trivial/Small tickets, investigate inline (a workflow is overkill). Trace data features UI → query/mutation → resolver → service → schema end-to-end. A plan grounded in real code is worth writing; a plan of assumptions is not.

4. **Write the plan file.** Use `Write` to save it at `docs/plans/<id>.md` (lowercase id) in the **target repository** (the repo you're working in — the same repo the worker will run against). Start with the shared header, then the tier's template. Follow `references/plan-tiers.md` for the exact templates, quality criteria, and the anti-over-engineering rules (a 10-line diff gets a ~30-line plan, not a 260-line one).

5. **Plan review gate — Codex cross-family review, before the status moves (Standard and Large tiers; skip for Trivial/Small).** The plan is the artifact every later stage amplifies, so its reviewer comes from **outside Claude's model family**. Run it after the file is written and before step 6:

   - **Mechanical path check first (a script/grep, not a model).** Every file path the plan references must exist: extract the backtick-quoted paths from `docs/plans/<id>.md` and check each (`ls` / `git ls-files`), exempting only paths the plan explicitly marks *to be created*. A referenced-but-missing path means the plan was grounded in assumption, not code — re-investigate and fix it.
   - **Cross-family one-shot review — the Codex CLI, `gpt-5.6-sol` at `max` effort (mandatory where available).** Read-only and grounded in the real codebase:

     ```bash
     codex exec -C "<repo root>" -m gpt-5.6-sol -c model_reasoning_effort="max" \
       -s read-only -o /tmp/codex-review-<id>.md "<prompt>" < /dev/null
     ```

     Codex has no Tasks access, so write the ticket description + the full comment thread to a scratch markdown file and name it in the prompt alongside `docs/plans/<id>.md`. Full mechanics — availability check, the verbatim prompt contract (R1), finding disposition, fallback — are in the generalized twin's `feature-spec-pipeline/skills/work/references/codex-cli.md`; follow it rather than re-deriving the invocation. `read-only` so the reviewer cannot "helpfully" fix the plan it reviews; pass `-m` and the effort **explicitly** (`~/.codex/config.toml` may default lower); `< /dev/null` or it waits on stdin.

     It reads the ticket + plan cold and answers: Is every Acceptance Criterion *testable* (a checkable outcome, not a vibe)? Do the ACs cover **every ticket requirement and every prior triage assumption**? Was any requirement or subfeature dropped or silently shrunk? Is every referenced analogue *real* — do the named files actually do what the plan claims (it opens them and checks)? Does the step ordering close — no circular dependency, no step that cannot follow the one before it?

   **Then evaluate and act — running the review is not the gate; acting is.** Per finding: **accept** it and fix the plan (then re-run the failed mechanical check); **reject** it with a stated reason (it contradicts a human's authoritative reply, it expands scope the ticket never asked for, or you verified the code and the finding is wrong); or **escalate** — a `Critical`/`High` finding exposing a genuine **external** dependency becomes `NEEDS TRIAGE` for the blocked slice only, per the guidelines below. Never move the status on `MATERIAL DEFECTS` without resolving them. **Egress + the repo opt-out.** `-s read-only` restricts writes, not the network: the plan and every source file the reviewer opens go to OpenAI. Before the call, grep `CLAUDE.md` / `AGENTS.md` / `ORCHESTRATOR.md` for `ANTHROPIC-ONLY`, `NO EXTERNAL MODEL CLIS`, or `external-model-clis: off` — a hit means the repo **opted out**: run in-family and log `codex: opted out (<file>) → claude` (a correct run, not a degraded one). Re-check per invocation; it is the only kill-switch that reaches a run already in flight. Also bound the call (`perl -e 'alarm shift @ARGV; exec @ARGV' 600 codex exec …`), verify `reasoning effort: max` in the captured log, and treat an empty `-o` file as a lane failure rather than a pass.

If the lane is unavailable instead (no binary, not logged in, usage/rate limit, empty output, deadline fired, repeated errors), fall back to a **Claude strong-model** one-shot review of the same prompt — the strongest model regardless of what synthesized the plan — and note the downgrade. Availability and the opt-out are the only licensed skips; a plan defect costs the whole downstream pipeline, so the gate itself is not optional.

6. **Post the Tasks comment with the repo-relative path (the key change — do NOT upload the file).** Via `mcp__diolog-tasks__create_comment`, post:

   > Implementation plan written to `docs/plans/<id>.md` (in the repo). — Claude (AI Assistant)

   Do **not** base64-encode, do **not** call `mcp__diolog-tasks__add_issue_link`, do **not** attach the file. The comment carries only the repository-relative path so a developer (or the `tasks-worker` skill) can open it from the repo. (Rationale: the file lives in the repo with the code and is read from there; an uploaded copy would immediately drift from the in-repo source of truth.)

7. **Move status** (skip in dry-run). Call `mcp__diolog-tasks__update_issue` with the `Ready for AI` state ID and verify the response shows it. Skip only if the issue is already in `Ready for AI`, `Developer Review`, `In Progress`, or any further-downstream state — never downgrade.

8. Print a short summary (tier + the repo-relative plan path + the review gate's verdict and accept/reject tally, or `codex: unavailable → claude`). In dry-run, say the file was written locally and no Tasks writes were made — the gate is read-only, so it still runs.

## Workflow fan-out limits (avoid throttling)

When step 3 uses the `Workflow` tool to investigate in parallel:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 — firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. Chunk the items and `await` each small `parallel(...)` batch before the next; don't pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced readers that read many files often finish without emitting the structured output; have each return a fixed-shape markdown fragment and reserve any `schema` for the single synthesis step.

## Guidelines

- **Ambiguity is not a reason to bail.** Resolve it yourself from the codebase, the closest analogue, and the safer default, and record the picks as plan assumptions — a plan built on documented internal assumptions is the correct output, not a failure. Reserve `NEEDS TRIAGE` for a genuine **external (non-internal) dependency** you cannot resolve (a product/policy/brand decision that is the human's to make, or an external contract/credential/system you lack), and even then plan everything that dependency does not block and flag only the blocked slice. Never punt a whole ticket over gaps you could settle yourself.
- **Plan every requirement and subfeature the ticket asks for.** Do not drop, shrink, or push a subfeature "out of scope" or to a follow-up because it is large, fiddly, or lower priority — if it has no external dependency, it belongs in this plan. Size is handled by the tier + decomposition, not by cutting scope.
- Keep the plan scoped to the issue; don't extend to adjacent features or cleanup.
- Name specific file paths, functions, components, and analogues — but only where they're real (verify with Glob/Grep). A bad plan references files that don't exist or invents patterns not used in the codebase.
- When the change is trivial, a short plan is the correct output, not a failure.
