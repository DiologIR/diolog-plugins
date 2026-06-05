---
name: linear-plan
description: Produce a detailed, codebase-grounded implementation plan for a Diolog Linear issue, write it to docs/plans/<id>.md, then post a Linear comment containing the repository-relative path to that file (it does NOT upload/attach the file) and move the issue to "Ready for AI". Classifies a plan-size tier (Trivial/Small/Standard/Large) and keeps plan length proportional. Use when the user says "plan DIO-1234", "write the implementation plan for this issue", "run the planner on DIO-1234", or asks for a build plan for a triaged Linear ticket. Runs in the current session (Linear MCP + Read/Glob/Grep/Write + the Workflow tool for parallel investigation) — no Agent SDK, so usage draws from your interactive allowance, not the Agent SDK credit.
---

# Linear Issue Planner

Produce an implementation plan for a Linear issue by investigating the actual codebase, write it to a local markdown file, then leave a Linear comment **pointing at that file by repository-relative path** (no upload), and move the issue to `Ready for AI`.

Runs **in your current session** with Linear MCP, `Read`/`Glob`/`Grep`/`Write`, `Bash`, and the `Workflow` tool. It does not invoke any Agent SDK script.

## Inputs

- An issue id (`DIO-1234`). Optional `--dry-run` intent: write the plan file locally but make no Linear writes.

## Procedure

1. **Fetch the issue + all comments** via Linear MCP. Human replies are authoritative decisions; a prior triage **Assumptions** block is the default for anything the description didn't pin down (unless a human reply corrects it). Summarize intent — don't transcribe the ticket into the plan.

2. **Classify the plan-size tier** (Trivial / Small / Standard / Large) before writing — it sets the template and length budget. When in doubt, pick the smaller tier. See `references/plan-tiers.md`.

3. **Investigate the codebase at the tier's depth — fan out with the Workflow tool ("ultracode").** For Standard/Large tickets, spawn parallel reader subagents — one per element/subsystem the ticket references — each returning: the exact files to create/modify, the closest existing analogue, the interfaces/contracts, and any naming ambiguity. Synthesize their findings into the plan. For Trivial/Small tickets, investigate inline (a workflow is overkill). Trace data features UI → query/mutation → resolver → service → schema end-to-end. A plan grounded in real code is worth writing; a plan of assumptions is not.

4. **Write the plan file.** Use `Write` to save it at `docs/plans/<id>.md` (lowercase id) in the **target repository** (the repo you're working in — the same repo the worker will run against). Start with the shared header, then the tier's template. Follow `references/plan-tiers.md` for the exact templates, quality criteria, and the anti-over-engineering rules (a 10-line diff gets a ~30-line plan, not a 260-line one).

5. **Post the Linear comment with the repo-relative path (the key change — do NOT upload the file).** Via `mcp__linear__save_comment`, post:

   > Implementation plan written to `docs/plans/<id>.md` (in the repo). — Claude (AI Assistant)

   Do **not** base64-encode, do **not** call `mcp__linear__create_attachment`, do **not** attach the file. The comment carries only the repository-relative path so a developer (or the `linear-worker` skill) can open it from the repo. (Rationale: the file lives in the repo with the code and is read from there; an uploaded copy would immediately drift from the in-repo source of truth.)

6. **Move status** (skip in dry-run). Call `mcp__linear__save_issue` with `state: "Ready for AI"` and verify the response shows it. Skip only if the issue is already in `Ready for AI`, `Developer Review`, `In Progress`, or any further-downstream state — never downgrade.

7. Print a short summary (tier + the repo-relative plan path). In dry-run, say the file was written locally and no Linear writes were made.

## Workflow fan-out limits (avoid throttling)

When step 3 uses the `Workflow` tool to investigate in parallel:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 — firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. Chunk the items and `await` each small `parallel(...)` batch before the next; don't pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced readers that read many files often finish without emitting the structured output; have each return a fixed-shape markdown fragment and reserve any `schema` for the single synthesis step.

## Guidelines

- If the issue is ambiguous enough that planning would need multiple assumptions a human should make instead, don't invent a plan — flag what's missing, recommend a triage pass first, and end with `NEEDS TRIAGE`.
- Keep the plan scoped to the issue; don't extend to adjacent features or cleanup.
- Name specific file paths, functions, components, and analogues — but only where they're real (verify with Glob/Grep). A bad plan references files that don't exist or invents patterns not used in the codebase.
- When the change is trivial, a short plan is the correct output, not a failure.
