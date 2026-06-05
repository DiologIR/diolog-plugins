---
name: linear-triage
description: Triage a Diolog Linear issue (or all "Todo" issues) for implementation-readiness — runs a codebase grounding pass plus a Specification Sentinel product/UX/compliance review, then posts a short non-technical "Ready for Implementation Plan" comment (with a UI & logic preview and an Assumptions block) or, only for genuinely essential gaps, an Essential Questions comment, and sets the issue status accordingly. Use when the user says "triage DIO-1234", "triage the Todo issues", "is this ticket ready for the planner", "review this Linear issue before planning", or points at a Linear issue/issues that need a readiness check. Runs entirely in the current session (uses Linear MCP + Read/Glob/Grep + the Workflow tool for fan-out) — it does NOT run the Agent SDK script, so usage counts against your interactive Claude Code allowance, not the Agent SDK credit.
---

# Linear Issue Triage

Triage one or more Diolog Linear issues for implementation-readiness. The output is a short, **non-technical** product comment plus a status change — never an implementation spec (that's the `linear-plan` skill's job).

This skill runs **in your current session** using Linear MCP, `Read`/`Glob`/`Grep`, and the `Workflow` tool. It does not invoke any Agent SDK script.

## Inputs

- A specific issue (`DIO-1234`), a comma list (`DIO-1, DIO-2`), or "all Todo issues".
- Optional `--dry-run` intent: investigate and report what you'd post, but make no Linear writes.

## Procedure

1. **Resolve the issue set.** If the user named issues, use them. If they said "Todo issues", list `Todo`-status issues via Linear MCP (`mcp__linear__list_issues`).

2. **Fan out (Workflow).** For more than one issue, or for a single large issue, use the `Workflow` tool to triage in parallel — one subagent per issue, and within a heavy issue, parallel readers for (a) codebase grounding and (b) the Sentinel lens scan. Synthesize each issue's verdict from its subagents. For a single small issue, do it inline. This is the "ultracode" speed-up; keep waves small.

3. **Per issue, gather context.** Via Linear MCP, fetch the full description and **all** comments. Read the thread: prior `— Claude (AI Assistant)` triage comments are earlier passes; human replies to them are **authoritative answers** — never re-ask an answered question.

4. **Ground in the codebase (mandatory).** Use `Glob`/`Grep`/`Read` to locate every component, page, service, route, or feature the ticket references. Detect ambiguous matches (one name → multiple locations) and naming mismatches (UI label vs route/component name). Map the affected files. Do your technical reasoning internally — it informs the comment but never appears in it.

5. **Run the Specification Sentinel review.** Classify a strictness tier (S0–S3), run the five-lens scan, the architectural red-flag scan, and assign severities. Default to **stating assumptions, not asking questions**. See `references/sentinel-review.md` for the full framework.

6. **Decide the outcome and post.** See `references/comment-format.md` for the exact comment shapes, the non-technical language rules, and worked examples.
   - **Ready** (every non-essential gap can be reasonably defaulted): post the "Ready for Implementation Plan" comment (Sentinel verdict + **UI & logic preview** + Assumptions block when any defaults were picked). Set status to `Todo` (ready for the planner) if it isn't already.
   - **Needs improvement** (≥1 essential gap per §4 of the framework, or any uncovered S3 gap, or a genuine contradiction only the author can resolve): post the Essential Questions comment (+ Assumptions block for the non-essential gaps). Set status to `Needs More Info`.
   - In **dry-run**, report the verdict and the comment you would post; make no Linear writes.

## Hard rules

- **Non-technical comments only.** No file paths, code identifiers, library/framework names, or architecture words (module, service, resolver, route, endpoint, schema, …) in any Linear comment. Translate to what the user sees or does. Full ban list + good/bad examples in `references/comment-format.md`.
- **Never write an implementation spec, suggested description, or file list** — the `linear-plan` skill owns that.
- **Never modify the original issue description.**
- Default to assumptions; reserve questions for the essential bar in `references/sentinel-review.md` §4.
- End your final message with `READY` or `NEEDS IMPROVEMENT` per issue so the result is unambiguous.
