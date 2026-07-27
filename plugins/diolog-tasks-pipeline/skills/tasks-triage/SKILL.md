---
name: tasks-triage
description: Triage a Diolog Tasks issue (or all "Todo" issues) for implementation-readiness — runs a codebase grounding pass plus a Specification Sentinel product/UX/compliance review, then posts a short non-technical "Ready for Implementation Plan" comment (with a UI & logic preview and an Assumptions block) or, only for genuinely essential gaps, an Essential Questions comment, and sets the issue status accordingly. Formerly linear-triage. Use when the user says "triage DIO-1234", "triage the Todo issues", "is this ticket ready for the planner", "review this Tasks issue before planning", or points at a Diolog Tasks issue/issues that need a readiness check. Runs entirely in the current session (uses the diolog-tasks MCP + Read/Glob/Grep + the Workflow tool for fan-out) — it does NOT run the Agent SDK script, so usage counts against your interactive Claude Code allowance, not the Agent SDK credit.
---

# Tasks Issue Triage

Triage one or more Diolog Tasks issues for implementation-readiness. The output is a short, **non-technical** product comment plus a status change — never an implementation spec (that's the `tasks-plan` skill's job).

This skill runs **in your current session** using the **diolog-tasks MCP**, `Read`/`Glob`/`Grep`, and the `Workflow` tool. It does not invoke any Agent SDK script.

## Diolog Tasks MCP notes

- Tools are named `mcp__diolog-tasks__<tool>` and are usually deferred — load them via `ToolSearch` (e.g. `select:mcp__diolog-tasks__get_issue,mcp__diolog-tasks__list_issues,mcp__diolog-tasks__list_comments,mcp__diolog-tasks__create_comment,mcp__diolog-tasks__update_issue,mcp__diolog-tasks__list_workflow_states`) before the first call.
- Statuses are **workflow states referenced by ID**, not by name. Once per run, call `mcp__diolog-tasks__list_workflow_states` and map the names you need (`Todo`, `Needs More Info`) to their state IDs. If a named state doesn't exist on the board, list the available states in your final message and make no status change for that issue.
- Issues carry `KEY-123` identifiers (project key + number). When the user gives `DIO-1234` and a tool needs the issue ID, resolve it via `mcp__diolog-tasks__search_issues` or `list_issues`.

## Inputs

- A specific issue (`DIO-1234`), a comma list (`DIO-1, DIO-2`), or "all Todo issues".
- Optional `--dry-run` intent: investigate and report what you'd post, but make no Tasks writes.

## Procedure

1. **Resolve the issue set.** If the user named issues, use them. If they said "Todo issues", resolve the `Todo` state ID via `mcp__diolog-tasks__list_workflow_states`, then list issues in that state via `mcp__diolog-tasks__list_issues` (`stateId` filter).

2. **Fan out (Workflow).** For more than one issue, or for a single large issue, use the `Workflow` tool to triage in parallel — one subagent per issue, and within a heavy issue, parallel readers for (a) codebase grounding and (b) the Sentinel lens scan. Synthesize each issue's verdict from its subagents. For a single small issue, do it inline. This is the "ultracode" speed-up; keep waves small.

3. **Per issue, gather context.** Fetch the full description via `mcp__diolog-tasks__get_issue` and **all** comments via `mcp__diolog-tasks__list_comments`. Read the thread: prior `— Claude (AI Assistant)` triage comments are earlier passes; human replies to them are **authoritative answers** — never re-ask an answered question.

4. **Ground in the codebase (mandatory).** Use `Glob`/`Grep`/`Read` to locate every component, page, service, route, or feature the ticket references. Detect ambiguous matches (one name → multiple locations) and naming mismatches (UI label vs route/component name). Map the affected files. Do your technical reasoning internally — it informs the comment but never appears in it.

5. **Run the Specification Sentinel review.** Classify a strictness tier (S0–S3), run the five-lens scan, the architectural red-flag scan, and assign severities. Default to **stating assumptions, not asking questions**. See `references/sentinel-review.md` for the full framework.

6. **Codex cross-family review of the drafted triage (mandatory where available) — before you post.** Draft the comment, then hand it plus the ticket to a reviewer **outside Claude's model family**: the Codex CLI running `gpt-5.6-sol` at **`max`** reasoning effort, read-only, grounded in the actual codebase. Everything else in this pipeline is Claude reviewing Claude, and this catches what that family is blind to — a readiness verdict whose logic doesn't close, or a "grounded" assumption that names code which doesn't behave the way the draft claims.

   Codex has no Tasks access, so give it files: write the ticket description, the full comment thread, and your drafted comment to a scratch markdown file, then name that file in the prompt.

   ```bash
   codex exec -C "<repo root>" -m gpt-5.6-sol -c model_reasoning_effort="max" \
     -s read-only -o /tmp/codex-review-<ID>.md "<prompt>" < /dev/null
   ```

   Full mechanics — the availability check, the verbatim prompt contract (R1), finding disposition, and the fallback — are in the generalized twin's `feature-spec-pipeline/skills/work/references/codex-cli.md`; follow it rather than re-deriving the invocation. `read-only` so the reviewer cannot edit what it reviews; pass `-m` and the effort **explicitly** (`~/.codex/config.toml` may default lower); `< /dev/null` or it waits on stdin.

   **Then act — running the review is not the gate; acting is.** Per finding: **accept** it and revise the draft; **reject** it with a stated reason (it contradicts a human's authoritative reply, it expands scope the ticket never asked for, or you checked the code and it's wrong); or **escalate** — a `Critical`/`High` finding exposing a genuine **external** dependency becomes an Essential Question and the issue goes to `Needs More Info`. Never post a `MATERIAL DEFECTS` draft unrevised. A finding adopted without checking is how a ticket acquires requirements nobody asked for. If the lane is genuinely unavailable (no binary, not logged in, usage/rate limit, repeated errors), fall back to a Claude strong-model one-shot review of the same prompt and **say so in your final summary** — availability is the only licensed skip.

   **The review is technical; the comment is not.** Codex will answer in file paths and identifiers — that is what makes it useful. Absorb its findings into the *substance* of the draft and keep the posted comment inside the non-technical language rules in `references/comment-format.md`; never paste its wording into a Tasks comment. The review is read-only, so it runs in **dry-run** too — report the verdict alongside the comment you would have posted.

7. **Decide the outcome and post.** See `references/comment-format.md` for the exact comment shapes, the non-technical language rules, and worked examples.
   - **Ready** (every non-essential gap can be reasonably defaulted): post the "Ready for Implementation Plan" comment via `mcp__diolog-tasks__create_comment` (Sentinel verdict + **UI & logic preview** + Assumptions block when any defaults were picked). Set status to `Todo` (ready for the planner) via `mcp__diolog-tasks__update_issue` with the resolved state ID, if it isn't already there.
   - **Needs improvement** (≥1 essential gap per §4 of the framework, or any uncovered S3 gap, or a genuine contradiction only the author can resolve): post the Essential Questions comment (+ Assumptions block for the non-essential gaps). Set status to `Needs More Info`.
   - In **dry-run**, report the verdict and the comment you would post; make no Tasks writes.

## Workflow fan-out limits (avoid throttling)

When step 2 uses the `Workflow` tool to triage issues / lenses in parallel:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 — firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. Chunk the items and `await` each small `parallel(...)` batch before the next; don't pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced subagents that read many files often finish without emitting the structured output; have each return a fixed-shape markdown fragment and reserve any `schema` for the single synthesis step.

## Hard rules

- **Non-technical comments only.** No file paths, code identifiers, library/framework names, or architecture words (module, service, resolver, route, endpoint, schema, …) in any Tasks comment. Translate to what the user sees or does. Full ban list + good/bad examples in `references/comment-format.md`.
- **Never write an implementation spec, suggested description, or file list** — the `tasks-plan` skill owns that.
- **Never modify the original issue description.**
- Default to assumptions; reserve questions for the essential bar in `references/sentinel-review.md` §4. **The bias is to push the issue through to ready.** A question is warranted only when the gap is a genuine **external (non-internal) dependency** — one you cannot resolve from the codebase, the closest analogue, the product's norms, or the safer default. Never send an issue to `Needs More Info` because it is large, complex, or loosely worded, or because a human *might* like to decide; those are internal and you resolve them with documented assumptions. When some gaps are essential but the core is buildable, still record the assumptions for the rest so re-triage after one answer can go straight to ready.
- End your final message with `READY` or `NEEDS IMPROVEMENT` per issue so the result is unambiguous.
