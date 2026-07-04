# Scheduling & concurrency — survey fan-out, the DAG, the 8-slot fleet, shared surfaces

## Survey fan-out (Phase 1)

The survey is read-heavy and embarrassingly parallel — use the Workflow tool with structured-output schemas so results come back as data, not prose. Typical shape:

- **Ledger reader** — parse LEDGER.md rows → id, title, status, deferred/next-tier notes.
- **Spec readers** — pipeline over `docs/specs/spec-*.md` (batch ~10 specs per agent): status line, deferred/progress sections, explicit dependency mentions ("depends on / blocked by / after / child of <ID>"), UI-surface keywords (for mock matching).
- **Briefs reader** — `docs/features-to-triage/*.md` minus LEDGER.md: title, one-line summary, dependency hints, whether a spec already covers it (title/topic match against the ledger).
- **Research indexer** — one agent lists `docs/deep-research/*.md` with a one-line topic each; you (orchestrator) do the item↔research matching from that index. Match generously on topic overlap — a billing feature should get "Accounting Software Feature Research.md" even without an exact name hit.
- **Mock comparators** — per mock in `design/mocks/html/`: which feature is this, and is it *more refined than* the design-system app preview's current representation (open both; compare surfaces, states, density — not pixel equality). More refined → a `design-refresh` item (or an input to the feature's pending run).

Reduce everything into the single item list yourself. You own dedup (a brief that duplicates an existing spec merges into that spec's item; two briefs describing one feature merge with a note).

## Building the DAG and waves

- Nodes: every non-Done item. Edges: internal dependencies only (item → item). External dependencies (a human decision, a credential, a third-party service) mark the item `holding-pen` instead of creating edges.
- Prefer explicit textual dependencies; add inferred edges (same subsystem, same files, parent/child) conservatively — a false edge costs parallelism, a missed edge costs a merge conflict; when torn, note it as a "soft" edge and let the merge-serialization absorb the risk.
- Topological sort → waves (Wave N = everything whose deps are all in Waves <N). A cycle means the items are really one unit: either combine them into a single ship-feature run or ask the user how to split.
- Within a wave, order by: unblocks-the-most-items first, then resumable items (their worktrees are perishable — rebases get harder daily), then user-stated priority.

## The 8-slot fleet (Phase 5)

Slot-refill beats wave-barriers: when a runner lands, anything newly unblocked starts immediately. Sketch (Workflow tool — the script owns the loop, agents do the work):

```js
// ready-queue + slot refill; items/deps come in via args
const done = new Set(args.alreadyMerged), running = new Map()
const ready = () => args.items.filter(i => !done.has(i.id) && !running.has(i.id)
  && i.deps.every(d => done.has(d)))
while (done.size < args.items.length) {
  for (const item of ready().slice(0, 8 - running.size))
    running.set(item.id, agent(runnerPrompt(item), {label: item.id, model: 'opus'})
      .then(report => ({item, report})))
  const {item, report} = await Promise.race(running.values())
  running.delete(item.id)
  // hand ready-to-merge back to the MAIN session between workflow rounds if you
  // prefer to finalize there; either way: ONE merge at a time, ledger updated first
}
```

In practice you may prefer batches: run one workflow per "as many slots as are ready", return the ready-to-merge reports, finalize serially in-session, update ORCHESTRATOR.md, then launch the next workflow. That trades a little parallelism for much simpler state — fine. What is not fine: exceeding 8 concurrent runners, starting an item whose deps haven't merged, or two merges at once.

## The runner prompt (base template)

Every runner is an Opus agent (`model: 'opus'`, full tool access so it can invoke skills). Base prompt — fill the ⟨⟩:

```
You are a feature runner in an orchestrated fleet. Deliver ONE feature by invoking the
ship-feature skill (Skill tool: "ship-feature:ship-feature") on it, from the repo root.

Feature: ⟨ID · title⟩
Sources — read all that exist, in full, before starting:
  brief: ⟨docs/features-to-triage/….md⟩ · spec: ⟨docs/specs/spec-ID.md⟩ · plan: ⟨docs/plans/plan-ID.md⟩
Design context: ⟨root DESIGN md path⟩ — authoritative for all UI decisions.
Best practices: docs/CODING_PRACTICES.md and docs/NEW_PROJECT_BEST_PRACTICES.md — binding.
Deep research: ⟨matched docs/deep-research/ files, or "none matched"⟩ — when present, read the
  ENTIRE document before design/plan decisions, and pass it to ship-feature as context.
Mock input: ⟨design/mocks/html/… or "none"⟩ — hand to ship-feature's design stage as the mock.
Resume state: ⟨"fresh" | "resume in .worktrees/ID on ai/id — do NOT create a new worktree"⟩

Rules that override ship-feature's defaults:
- STOP BEFORE MERGE. Run every stage through acceptance-e2e green, commit on the branch,
  but do not rebase-merge-push-clean; the orchestrator serializes finalization.
- Propagate the context contract: every subagent you or ship-feature spawns gets the same
  source/design/practices/research paths above. ⟨+ composer lane block when enabled — see
  cursor-composer.md⟩
- LEDGER.md writes (child-spec triage) only under the ledger lock rule: ⟨rule⟩.
- Keep design-system changes feature-scoped; do not edit shared tokens/base elements —
  if a shared change seems required, report it instead of making it.
- After ANY context compaction, re-read brief/spec/plan and the DESIGN md before continuing.

Final message = a report: status (ready-to-merge | blocked | failed), branch + worktree,
gate evidence (typecheck/tests/e2e results verbatim), deferred children discovered
(title + suggested deps), shared-surface changes you wanted but skipped, questions for the user.
```

## Shared-surface rules (the ones that corrupt repos when violated)

| Surface | Rule |
|---|---|
| Integration-branch merges | Orchestrator only, strictly one at a time, gate before merge |
| `LEDGER.md` id allocation | Serial pre-triage covers the bulk. Mid-fleet child triage: create `docs/features-to-triage/.ledger.lock` (content: item id) before read-modify-write, delete after; if the lock exists, wait and retry; if it's held >10 min, the orchestrator arbitrates. After writing, re-read to verify your row survived |
| `ORCHESTRATOR.md` / hierarchy HTML | Orchestrator is the **sole writer**; runners report, never edit |
| Design-system shared files (tokens, base elements) | Runners never edit; feature-scoped composites/pages only; wanted-but-skipped shared edits go in the report and become orchestrator-scheduled items |
| `docs/specs/`, `docs/plans/` | Per-feature files only — a runner touches only its own `<ID>`'s (and its children's) files |

## Failure handling

- Runner failed with a diagnosable cause → restart the slot with the failure appended to the prompt (max 2 restarts, then park).
- Runner's worktree half-done → the item becomes `resumable`; next attempt resumes there.
- A merge conflict during your serialized finalize → resolve it yourself in the worktree (you have the map of what else landed); if it's semantic (two features fighting over behaviour), park the later item and note the collision as a dependency you missed.
- User interruption / session death → ORCHESTRATOR.md is current by construction; the resume path in SKILL.md takes over.
