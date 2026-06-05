# linear-issue-pipeline

Three native Claude Code skills that run the Diolog Linear issue pipeline — **triage → plan → worker** — entirely inside your interactive session.

| Skill | What it does |
|-------|--------------|
| **linear-triage** | Codebase grounding + a Specification Sentinel product/UX/compliance review of a Linear issue (or all `Todo` issues). Posts a short, non-technical "Ready for Implementation Plan" comment (with a UI & logic preview + Assumptions block) or — only for genuinely essential gaps — an Essential Questions comment, and sets status. Never writes an implementation spec. |
| **linear-plan** | Classifies a plan-size tier (Trivial/Small/Standard/Large), investigates the codebase (fanning out via the Workflow tool for big tickets), writes the plan to `docs/plans/<id>.md`, then **comments the repository-relative path** to that file (it does **not** upload/attach the file) and moves the issue to `Ready for AI`. |
| **linear-worker** | Implements a planned issue in an isolated git worktree via **dynamic ultracode workflows** (understand → implement → rebase onto `origin/staging` → acceptance-review vs the original ticket → resolve every finding → finalize). Commits locally and comments completion; **no remote PR** — the branch stays local for human review. |

## Why native skills (not the old Agent SDK scripts)

These were migrated from standalone `@anthropic-ai/claude-agent-sdk` scripts (`npx tsx scripts/linear-issue-*.ts`). Running via the Agent SDK draws from the **separate monthly Agent SDK credit** (Pro $20 / Max $100–200), introduced **June 15, 2026**, or from pay-per-token API billing.

As **native skills**, the work runs in your **interactive Claude Code session**, so it draws from your **standard interactive usage allowance** instead — bypassing the Agent SDK credit and API billing. The tradeoff: heavy `Workflow` fan-out (especially `linear-worker`) consumes the interactive allowance quickly, so it can pressure your weekly interactive limit. Route cheap fan-out stages to a smaller model where the Workflow tool allows a per-agent model override.

## Requirements

- **Linear MCP** connected (`claude mcp add --transport http linear https://mcp.linear.app/mcp`).
- The **Workflow** (dynamic workflows / ultracode) capability available — research preview; `linear-plan` and `linear-worker` use it to fan out parallel investigation. If unavailable, the skills still run, just without the parallel speed-up.
- Run from the **target repository root** (the repo whose code is being triaged/planned/built), which provides `CLAUDE.md`, `docs/plans/`, the codebase, and `origin/staging`.

## Usage

Invoke by name or describe the task:

- `/linear-triage DIO-1234` · "triage the Todo issues"
- `/linear-plan DIO-1234` · "write the implementation plan for DIO-1234"
- `/linear-worker DIO-1234` · "implement DIO-1234"

The pipeline order is triage → plan → worker, but each skill stands alone.
