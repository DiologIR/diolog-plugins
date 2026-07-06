---
name: plan
description: Produce a detailed, codebase-grounded implementation plan for a feature spec in the markdown feature-spec pipeline. Reads docs/specs/spec-DIO-0001.md (the original details plus the triage assumptions/answers), classifies a plan-size tier (Trivial/Small/Standard/Large), investigates the actual codebase (fanning out via the Workflow tool for big specs), writes the plan to docs/plans/plan-DIO-0001.md, links it from the spec, and sets the spec status to Ready for Work. Use when the user says "plan DIO-0001", "write the implementation plan for this spec", "run the planner on DIO-0001", or asks for a build plan for a triaged feature spec. For an issue tracked in Diolog Tasks, use tasks-plan instead. Runs in the current session (Read/Glob/Grep/Write/Edit plus the Workflow tool for parallel investigation) — no issue tracker, no Agent SDK.
---

# Feature Spec Planner (markdown specs)

Produce an implementation plan for a feature spec by investigating the actual codebase, write it to a local markdown file, then link it from the spec and move the spec to `Ready for Work`.

Runs **in your current session** with `Read`/`Glob`/`Grep`/`Write`/`Edit`, `Bash`, and the `Workflow` tool. It uses no issue-tracker MCP (Diolog Tasks or otherwise) and invokes no Agent SDK script. The spec markdown file replaces a tracker issue + comment thread.

## Inputs

- A spec id (`DIO-0001`). The plan reads `docs/specs/spec-<ID>.md`. Optional `--dry-run` intent: write the plan file locally but make no status/ledger updates.

## Procedure

1. **Read the spec** at `docs/specs/spec-<ID>.md`. The `## Feature description` section is the original intent; the latest `## Triage` section carries the **Assumptions** (the defaults for anything the description didn't pin down) and any answers/edits the human added (authoritative). Summarize intent — don't transcribe the spec into the plan. If the spec status is `Needs More Info`, first try to resolve the open questions the way triage should have — from the codebase, the closest analogue, and the safer default — and plan on those documented assumptions. Decline to plan **only** when the *core* intent genuinely cannot be planned without a real **external (non-internal) dependency** — a product / policy / brand decision only the human can make, or an external contract / credential / system you lack. Even then, plan every part that dependency does not block and name only the blocked slice; reserve `NEEDS TRIAGE` for when the whole feature hinges on the missing external answer.

2. **Classify the plan-size tier** (Trivial / Small / Standard / Large) before writing — it sets the template and length budget. When in doubt, pick the smaller tier. See `references/plan-tiers.md`.

3. **Investigate the codebase at the tier's depth — fan out with the Workflow tool ("ultracode").** For Standard/Large specs, spawn parallel reader subagents — one per element/subsystem the spec references — each returning: the exact files to create/modify, the closest existing analogue, the interfaces/contracts, and any naming ambiguity. Synthesize their findings into the plan. For Trivial/Small specs, investigate inline (a workflow is overkill). Trace data features UI → query/mutation → resolver → service → schema end-to-end. A plan grounded in real code is worth writing; a plan of assumptions is not.

4. **Write the plan file.** Use `Write` to save it at `docs/plans/plan-<ID>.md` (uppercase id, e.g. `docs/plans/plan-DIO-0001.md`) in the **target repository** (the same repo the worker will run against). Start with the shared header, then the tier's template. Follow `references/plan-tiers.md` for the exact templates, quality criteria, and the anti-over-engineering rules (a 10-line diff gets a ~30-line plan, not a 260-line one).

5. **Plan review gate — before the status flips (Standard and Large tiers; skip for Trivial/Small).** The plan is the pipeline's highest-leverage trusted-first-output artifact — everything downstream amplifies it — so it gets its own gate, run after the file is written and before step 6:
   - **Mechanical path check (a script/grep, not a model).** Every file path the plan references must exist: extract the backtick-quoted paths from `plan-<ID>.md` and check each (`ls` / `git ls-files`), exempting only paths the plan explicitly marks *to be created*. A referenced-but-missing path means the plan was grounded in assumption, not code — re-investigate and fix it.
   - **Strong-model one-shot review.** One reviewer — the strongest model, regardless of what synthesized the plan — reads the spec + plan cold and answers: Is every Acceptance Criterion *testable* (a checkable outcome, not a vibe)? Do the ACs cover **every spec clause, including every triage assumption**? Was any spec requirement or subfeature dropped or silently shrunk? Is every referenced analogue *real* — the named files actually do what the plan claims?

   Findings → fix the plan (and re-run the failed check) before flipping status. The gate costs one read; a plan defect costs the whole downstream pipeline.

6. **Link the plan from the spec and bump status** (skip in dry-run). Append a short pointer section to `docs/specs/spec-<ID>.md`:

   ```markdown
   ## Plan — <YYYY-MM-DD>

   Implementation plan: `docs/plans/plan-<ID>.md` (Plan size: [tier]).
   ```

   Then set the spec header `Status: Ready for Work` (and `Last updated`), and update the ledger row's Status to `Ready for Work`. Skip the status change only if the spec is already at `Ready for Work` or further downstream (`In Progress`, `In Review`) — never downgrade. The plan file lives in the repo with the code and is read from there; don't copy its contents into the spec — link by path so the two never drift.

7. Print a short summary (tier + the plan path + the gate outcome + the spec id). In dry-run, say the file was written locally and no spec/ledger updates were made.

## Workflow fan-out limits (avoid throttling)

When step 3 uses the `Workflow` tool to investigate in parallel:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 — firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. Chunk the items and `await` each small `parallel(...)` batch before the next; don't pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced readers that read many files often finish without emitting the structured output; have each return a fixed-shape markdown fragment and reserve any `schema` for the single synthesis step.

## Guidelines

- **Ambiguity is not a reason to bail.** Resolve it yourself from the codebase, the closest analogue, and the safer default, and record the picks as plan assumptions — a plan built on documented internal assumptions is the correct output, not a failure. Reserve `NEEDS TRIAGE` for a genuine **external (non-internal) dependency** you cannot resolve (a product/policy/brand decision that is the human's to make, or an external contract/credential/system you lack), and even then plan everything that dependency does not block and flag only the blocked slice. Never punt a whole spec over gaps you could settle yourself.
- **Plan every requirement and subfeature the spec asks for.** Do not drop, shrink, or push a subfeature "out of scope" or to a follow-up because it is large, fiddly, or lower priority — if it has no external dependency, it belongs in this plan. Size is handled by the tier + decomposition, not by cutting scope.
- Keep the plan scoped to the spec; don't extend to adjacent features or cleanup.
- Name specific file paths, functions, components, and analogues — but only where they're real (verify with Glob/Grep). A bad plan references files that don't exist or invents patterns not used in the codebase.
- When the change is trivial, a short plan is the correct output, not a failure.
- **Model routing by tier (REVIEWER ≥ WRITER).** Trivial/Small synthesis may run on a cheaper model (sonnet). Standard synthesis runs on the strongest model (opus) — or on glm-5.2-high via the zero CLI, in which case the step-5 gate is doubly mandatory. Large synthesis never downgrades. Whatever wrote the plan, the gate's reviewer must be at least as strong as the strongest model that wrote it.
