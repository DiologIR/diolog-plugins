# diolog-tasks-pipeline

Four native Claude Code skills that run the Diolog Tasks issue pipeline — **triage → plan → worker → verify** — entirely inside your interactive session. Formerly `linear-issue-pipeline`; the pipeline now targets the **diolog-tasks MCP** (Diolog's own Tasks product) instead of Linear.

| Skill | What it does |
|-------|--------------|
| **tasks-triage** | Codebase grounding + a Specification Sentinel product/UX/compliance review of a Diolog Tasks issue (or all `Todo` issues). Posts a short, non-technical "Ready for Implementation Plan" comment (with a UI & logic preview + Assumptions block) or — only for genuinely essential gaps — an Essential Questions comment, and sets status. Never writes an implementation spec. |
| **tasks-plan** | Classifies a plan-size tier (Trivial/Small/Standard/Large), investigates the codebase (fanning out via the Workflow tool for big tickets), writes the plan to `docs/plans/<id>.md`, then **comments the repository-relative path** to that file (it does **not** upload/attach the file) and moves the issue to `Ready for AI`. |
| **tasks-worker** | Implements a planned issue in an isolated git worktree via **dynamic ultracode workflows** (understand → implement → rebase onto `origin/staging` → acceptance-review vs the original ticket → resolve every finding → finalize). Commits locally and comments completion; **no remote PR** — the branch stays local for human review. |
| **tasks-verify** | Independent acceptance, in a **fresh session** (never the one that built the ticket): re-derives the requirement list from the ticket + comments alone, then closes every requirement on typed behavioural evidence — browser measurements, exercised requests, stored-row counts, affected e2e specs actually run — and posts a per-requirement verdict comment. The worker reviews its own work as QA; this skill is the acceptance authority, because self-graded acceptance was the most common single cause in the 110-ticket WEB-4905 audit (46% of requirements delivered as specified). Audit-only. |

## Why native skills (not the old Agent SDK scripts)

These were migrated from standalone `@anthropic-ai/claude-agent-sdk` scripts (`npx tsx scripts/linear-issue-*.ts`). Running via the Agent SDK draws from the **separate monthly Agent SDK credit** (Pro $20 / Max $100–200), introduced **June 15, 2026**, or from pay-per-token API billing.

As **native skills**, the work runs in your **interactive Claude Code session**, so it draws from your **standard interactive usage allowance** instead — bypassing the Agent SDK credit and API billing. The tradeoff: heavy `Workflow` fan-out (especially `tasks-worker`) consumes the interactive allowance quickly, so it can pressure your weekly interactive limit. Route cheap fan-out stages to a smaller model where the Workflow tool allows a per-agent model override.

## Requirements

- **diolog-tasks MCP** connected — an HTTP MCP server, e.g.:
  ```
  claude mcp add --transport http diolog-tasks https://mcp.diolog.com.au/api/quorum/mcp \
    --header "Authorization: Bearer <your dlg_… token>" \
    --header "x-company-id: <your company id>"
  ```
  Tools surface as `mcp__diolog-tasks__<tool>` (`get_issue`, `list_issues`, `list_comments`, `create_comment`, `update_issue`, `list_workflow_states`, `search_issues`, …).
- The **Workflow** (dynamic workflows / ultracode) capability available — research preview; `tasks-plan` and `tasks-worker` use it to fan out parallel investigation. If unavailable, the skills still run, just without the parallel speed-up.
- Run from the **target repository root** (the repo whose code is being triaged/planned/built), which provides `CLAUDE.md`, `docs/plans/`, the codebase, and `origin/staging`.
- The Tasks board should have the workflow states the pipeline moves issues through (`Todo`, `Needs More Info`, `Ready for AI`, `Developer Review`); the skills resolve state names to IDs at runtime and flag any that are missing rather than guessing.

## Usage

Invoke by name or describe the task:

- `/tasks-triage DIO-1234` · "triage the Todo issues"
- `/tasks-plan DIO-1234` · "write the implementation plan for DIO-1234"
- `/tasks-worker DIO-1234` · "implement DIO-1234"

The pipeline order is triage → plan → worker → verify, and each skill stands alone — with one deliberate exception: tasks-verify must NOT run in the session that triaged/planned/built the ticket (its value is exactly that it does not share the builder's premises).
