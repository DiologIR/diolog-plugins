# feature-spec-pipeline

Four native Claude Code skills that run a **markdown-doc** feature pipeline — **triage → plan → work → gap-fix** — entirely inside your interactive session, with **no Linear** anywhere. A doc-driven sibling of [`linear-issue-pipeline`](../linear-issue-pipeline): instead of a Linear issue + comment thread, the single source of truth for each feature is a versioned spec markdown file in the repo.

| Skill | What it does |
|-------|--------------|
| **/triage** | Turns a feature idea (inline text or a notes file) into a versioned spec. Allocates an id like `DIO-0001` from `docs/feature-specs/LEDGER.md`, writes `docs/specs/spec-DIO-0001.md` capturing the original details, runs a codebase grounding pass + a Specification Sentinel product/UX/compliance review, then appends a short, non-technical "Ready for Implementation Plan" section (UI & logic preview + Assumptions) or — only for genuinely essential gaps — an Essential Questions section, and sets the spec status. Never writes an implementation spec. |
| **/plan** | Classifies a plan-size tier (Trivial/Small/Standard/Large), investigates the codebase (fanning out via the Workflow tool for big specs), writes the plan to `docs/plans/plan-DIO-0001.md`, links it from the spec, and moves the spec to `Ready for Work`. |
| **/work** | Implements the plan in an isolated git worktree via **dynamic ultracode workflows** (understand → implement → rebase onto `origin/staging` → acceptance-review vs the spec → resolve every finding → finalize). Commits locally and appends a progress section to the spec; **no remote PR** — the branch stays local for human review. |
| **/gap-fix** | The post-`/work` **remediation** step. Re-enters the branch/worktree `/work` produced, **always re-audits the delivered code against the original spec** (requirement completeness, correctness, guardrails, UI fidelity, security) — merging in any gaps you hand it (inline, a file, a `## Gaps` section, or a human/QA review) — and **implements the fixes in code** (file-disjoint fan-out + typecheck gates), looping audit→fix until only optional Low items remain. Commits locally and appends a gap-fix progress note to the spec; **no remote PR**. Reuses `/work`'s acceptance-review muscle as a standalone finisher — distinct from `spec-validation` (audit-only, no fixes). |

## How it differs from linear-issue-pipeline

Same review depth, Sentinel framework, plan tiers, and worker phases — but the I/O moves from Linear MCP to markdown files:

| Linear pipeline | This pipeline |
|---|---|
| Linear issue (`DIO-1234`) | `docs/specs/spec-DIO-0001.md` (the spec) |
| Linear comment thread | Triage / Plan / Progress sections appended to the spec |
| Issue status (Todo → Ready for AI → Developer Review) | `Status:` field in the spec header + ledger (`Triage` → `Needs More Info` → `Ready for Plan` → `Ready for Work` → `In Progress` → `In Review`) |
| Human reply on a comment | Human edits the spec + re-runs `/triage` |
| Linear MCP required | No MCP — pure Read/Write/Edit/Glob/Grep/Bash |

## Id allocation

The first `/triage` run in a repo asks you for a 3-letter **project code** (e.g. *motif → MOT*, *diolog → DIO*) and creates `docs/feature-specs/LEDGER.md` to record it plus a counter. Each new spec increments the counter and is named `spec-<CODE>-NNNN.md` (4-digit, zero-padded). The code is reused for every later spec.

```
docs/
  feature-specs/
    LEDGER.md            # project code + counter + table
  specs/
    spec-DIO-0001.md     # one per feature (source of truth)
  plans/
    plan-DIO-0001.md     # written by /plan
```

## Requirements

- The **Workflow** (dynamic workflows / ultracode) capability available — research preview; `/plan` and `/work` use it to fan out parallel investigation. If unavailable, the skills still run, just without the parallel speed-up.
- Run from the **target repository root** (the repo whose code is being triaged/planned/built), which provides `CLAUDE.md`, the `docs/` tree, the codebase, and `origin/staging`.
- No Linear MCP needed.

## Usage

Invoke by name or describe the task:

- `/triage "add an empty state to the inbox"` · `/triage ./notes/feature.md` · `/triage DIO-0001` (re-triage)
- `/plan DIO-0001` · "write the implementation plan for DIO-0001"
- `/work DIO-0001` · "implement DIO-0001"
- `/gap-fix DIO-0001` (self-audit the build vs the spec + fix) · `/gap-fix DIO-0001 gaps: 1) the worker missed the mobile empty state` · `/gap-fix DIO-0001 ./qa-findings.md`

The pipeline order is triage → plan → work → gap-fix, but each skill stands alone. `/gap-fix` is optional — reach for it after `/work` when the built feature still falls short of its spec, or a QA/review pass lists what's missing, to finish the job in code before human review.
