---
name: triage
description: Triage a feature idea into a versioned spec doc for the markdown feature-spec pipeline. Given a feature as inline text or a markdown/text file (or an existing spec id like DIO-0001 to re-triage), it allocates a project id from docs/feature-specs/LEDGER.md, writes docs/specs/spec-DIO-0001.md capturing the original details, runs a codebase grounding pass plus a Specification Sentinel product/UX/compliance review, then appends a short non-technical readiness section (UI & logic preview + Assumptions) or an Essential Questions section and sets the spec status. Use when the user says "triage this feature", "triage DIO-0001", "turn this into a spec", "is this ready to plan", or hands over a feature description or notes file that needs a readiness check before planning. Runs in the current session using Read/Glob/Grep/Write/Edit plus the Workflow tool for fan-out — no Linear, no Agent SDK.
---

# Feature Triage (markdown specs)

Triage a feature idea for implementation-readiness and record it as a versioned spec document. The output is a short, **non-technical** product review appended to a spec markdown file plus a status change — never an implementation spec (that's the `/plan` skill's job).

This skill runs **in your current session** using `Read`/`Glob`/`Grep`/`Write`/`Edit` and the `Workflow` tool. It uses no Linear MCP and invokes no Agent SDK script — the spec markdown file is the single source of truth, replacing the Linear issue + comment thread.

## Inputs

- A **feature description** — inline text, or a path to a markdown/text file describing the feature; this becomes a brand-new spec.
- Or an **existing spec id** (`DIO-0001`) to **re-triage** — read `docs/specs/spec-DIO-0001.md` and incorporate any answers/edits the human added since the last pass.
- Optional `--dry-run` intent: investigate and report what you'd write, but make no file changes.

## Procedure

1. **Decide the mode.**
   - If the input is an id that resolves to an existing `docs/specs/spec-<ID>.md`, this is a **re-triage**: read that file in full — the original `## Feature description`, every prior `## Triage` section, and any answers/edits the human added. Human answers are **authoritative** — never re-ask an answered question.
   - Otherwise it's a **new feature**: the input (inline text, or the file you read) is the original feature description. Allocate an id and create the spec (step 2).

2. **Allocate an id and create the spec (new features only).** Follow the exact id-allocation algorithm in `references/spec-format.md` (read `docs/feature-specs/LEDGER.md`; if it's missing, **ask the user for the 3-letter project code** — suggest one derived from the project/folder name, e.g. *motif → MOT* — then create the ledger). Allocate the next zero-padded id (e.g. `DIO-0001`), update the ledger's counter and table, and write `docs/specs/spec-<ID>.md` using the spec scaffold in `references/spec-format.md` — its `## Feature description` section holds the **original details verbatim**. Set `Status: Triage`.

3. **Fan out (Workflow).** For a large feature, use the `Workflow` tool to parallelize the heavy reading — within a heavy spec, parallel readers for (a) codebase grounding and (b) the Sentinel lens scan. Synthesize the verdict from the subagents. For a small feature, do it inline. This is the "ultracode" speed-up; keep waves small (see limits below).

4. **Ground in the codebase (mandatory).** Use `Glob`/`Grep`/`Read` to locate every component, page, service, route, or feature the description references. Detect ambiguous matches (one name → multiple locations) and naming mismatches (UI label vs route/component name). Map the affected files. Do your technical reasoning internally — it informs the review but never appears in the non-technical section.

5. **Run the Specification Sentinel review.** Classify a strictness tier (S0–S3), run the five-lens scan, the architectural red-flag scan, and assign severities. Default to **stating assumptions, not asking questions**. See `references/sentinel-review.md` for the full framework.

6. **Decide the outcome and append the triage section to the spec.** See `references/spec-format.md` for the exact section shapes, the non-technical language rules, and worked examples.
   - **Ready** (every non-essential gap can be reasonably defaulted): append a "Ready for Implementation Plan" triage section (Sentinel verdict + **UI & logic preview** + Assumptions block when any defaults were picked). Set `Status: Ready for Plan` in the spec header and in the ledger row.
   - **Needs improvement** (≥1 essential gap per §4 of the framework, or any uncovered S3 gap, or a genuine contradiction only the author can resolve): append an Essential Questions triage section (+ Assumptions block for the non-essential gaps). Set `Status: Needs More Info` in the spec header and ledger row.
   - On **re-triage**, append a **new dated** triage section (don't overwrite prior ones); open it with a short "Resolved:" note summarizing what the human's answers settled, then the current verdict.
   - In **dry-run**, report the verdict and the section you would append; make no file changes.

## Workflow fan-out limits (avoid throttling)

When step 3 uses the `Workflow` tool to triage features / lenses in parallel:
- **Cap each wave at ≤4 concurrent agents.** Batch a larger fan-out into sequential waves of ≤4 — firing ~10+ agents at once trips a server-side rate limit ("temporarily limiting requests — not your usage limit") that fails most of the wave. Chunk the items and `await` each small `parallel(...)` batch before the next; don't pass all items to one `parallel()`.
- **Retry transient failures.** If an agent's result is an "API Error / Rate limited / temporarily limiting requests" string (or `null`), re-run it in a later small batch; never treat it as a real finding.
- **Prefer plain-text returns for long, file-reading subagents.** Schema-forced subagents that read many files often finish without emitting the structured output; have each return a fixed-shape markdown fragment and reserve any `schema` for the single synthesis step.

## Hard rules

- **Non-technical review sections only.** No file paths, code identifiers, library/framework names, or architecture words (module, service, resolver, route, endpoint, schema, …) in the triage review sections. Translate to what the user sees or does. The `## Feature description` section is the exception — it preserves whatever the author wrote, verbatim. Full ban list + good/bad examples in `references/spec-format.md`.
- **Never write an implementation spec, suggested rewrite, or file list** — the `/plan` skill owns that.
- **Never modify the original `## Feature description` section.** Append new triage sections; don't rewrite history.
- Default to assumptions; reserve questions for the essential bar in `references/sentinel-review.md` §4. **The bias is to push the feature through to `Ready for Plan`.** A question is warranted only when the gap is a genuine **external (non-internal) dependency** — one you cannot resolve from the codebase, the closest analogue, Diolog norms, or the safer default. Never send a spec to `Needs More Info` because it is large, complex, or loosely worded, or because a human *might* like to decide; those are internal and you resolve them with documented assumptions. When some gaps are essential but the core is buildable, still record the assumptions for the rest so re-triage after one answer can go straight to `Ready for Plan`.
- End your final message with `READY` or `NEEDS IMPROVEMENT` plus the spec id and path so the result is unambiguous.
