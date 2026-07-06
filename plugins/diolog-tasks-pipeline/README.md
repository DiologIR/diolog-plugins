# diolog-tasks-pipeline

Three native Claude Code skills that run the Diolog Tasks issue pipeline — **triage → plan → worker** — entirely inside your interactive session. Formerly `linear-issue-pipeline`; the pipeline now targets the **diolog-tasks MCP** (Diolog's own Tasks product) instead of Linear.

| Skill | What it does |
|-------|--------------|
| **tasks-triage** | Codebase grounding + a Specification Sentinel product/UX/compliance review of a Diolog Tasks issue (or all `Todo` issues). Posts a short, non-technical "Ready for Implementation Plan" comment (with a UI & logic preview + Assumptions block) or — only for genuinely essential gaps — an Essential Questions comment, and sets status. Never writes an implementation spec. |
| **tasks-plan** | Classifies a plan-size tier (Trivial/Small/Standard/Large), investigates the codebase (fanning out via the Workflow tool for big tickets), writes the plan to `docs/plans/<id>.md`, then **comments the repository-relative path** to that file (it does **not** upload/attach the file) and moves the issue to `Ready for AI`. |
| **tasks-worker** | Implements a planned issue in an isolated git worktree via **dynamic ultracode workflows** (understand → implement → rebase onto `origin/staging` → acceptance-review vs the original ticket → resolve every finding → finalize). Commits locally and comments completion; **no remote PR** — the branch stays local for human review. |

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

The pipeline order is triage → plan → worker, but each skill stands alone.
