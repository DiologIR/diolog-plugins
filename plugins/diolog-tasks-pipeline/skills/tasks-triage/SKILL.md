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

6. **Decide the outcome and post.** See `references/comment-format.md` for the exact comment shapes, the non-technical language rules, and worked examples.
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
- Default to assumptions; reserve questions for the essential bar in `references/sentinel-review.md` §4.
- End your final message with `READY` or `NEEDS IMPROVEMENT` per issue so the result is unambiguous.
