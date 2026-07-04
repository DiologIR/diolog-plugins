# The Cursor composer-2.5 coding lane

An **optional cost optimization**: delegate mechanical, plan-scoped code writing to the Cursor CLI running the `composer-2.5` model (an order of magnitude cheaper per token than Opus), and spend Opus only on verification and fixes. The lane exists to save Opus tokens **net of verification** — if a delegation doesn't plausibly clear that bar, Opus writes the code directly. Never let the lane become a correctness risk: Opus (or the gates) always validates composer output before it counts.

## Availability check (once, at fleet start)

```bash
command -v cursor-agent && cursor-agent --version
```

Missing → note "composer lane: unavailable" in ORCHESTRATOR.md and run everything on Opus. Don't install it unprompted; offer: `curl https://cursor.com/install -fsS | bash` (cursor.com/docs/cli). Flags below are current as of writing — confirm against `cursor-agent --help` before first use, and prefer what `--help` says over this file.

## What to delegate (and what never to)

Delegate when ALL hold — the plan has already made the decisions, composer just types:
- The plan/spec specifies the change at file level (new component per an existing pattern, a route handler matching a template, repetitive wiring, mock-page assembly from existing composites, test scaffolding from existing examples).
- The files involved fit comfortably in a 200k-token window alongside the context contract.
- Success is mechanically checkable (typecheck/tests/lint or a straightforward Opus diff-read).

Never delegate: architectural or data-model decisions, security-sensitive code (auth, webhooks, payment), cross-cutting refactors, merge-conflict resolution, e2e debugging, anything where the plan says "investigate". Two failed verify-fix cycles on a task → take it back to Opus and note it; composer thrash costs more than it saves.

## Invocation

Run **inside the feature's worktree** so edits land on the branch. Non-interactive print mode:

```bash
cd .worktrees/<ID> && cursor-agent -p "<prompt>" --model composer-2.5 --output-format text
```

(`-p/--print` = non-interactive; add the force/approval flag `--help` documents if file edits need it in print mode.)

The prompt must contain, verbatim paths, every time (composer starts cold — it shares no memory with the runner):

```
Read these files completely before writing any code:
  docs/specs/spec-<ID>.md, docs/plans/plan-<ID>.md, <brief path if any>,
  <root DESIGN md> (design authority), docs/CODING_PRACTICES.md,
  docs/NEW_PROJECT_BEST_PRACTICES.md, <matched deep-research doc(s) — read IN FULL>.
Task: <the specific plan step(s), file list, and acceptance criteria>.
Follow the practices docs exactly; match surrounding code style; do not touch files
outside the listed set; do not edit shared design-system tokens/base elements.
IMPORTANT — your context window is 200k tokens and will compact on long tasks: after any
compaction or summarization, STOP and re-read spec-<ID>.md, plan-<ID>.md, the brief, and
the DESIGN md before continuing. The on-disk files are your memory, not the conversation.
```

Keep each invocation to one coherent plan step (one component, one route, one test file group). Many small invocations beat one sprawling session — cheaper retries, cleaner verification, less compaction.

## The verify-fix loop (Opus's half)

After each composer invocation, the Opus runner:

1. `git diff` — read the whole diff. Out-of-scope files touched → revert those hunks.
2. Run the repo gates that cover the change (typecheck, affected tests, lint).
3. Judge against spec/plan/DESIGN/practices — correctness, not just compilation.
4. Small gaps → Opus fixes directly (don't round-trip trivia). Substantive gaps → one composer retry with the failure quoted. Second failure → Opus rewrites; log `composer: reverted` for the task.
5. Commit with the runner's normal discipline once green.

## Accounting honesty

In each item's ledger Notes, record the lane outcome (`composer: N tasks, M retries, K reverted`). If a repo's early items show composer reverting more than roughly 1 task in 3, stop using the lane for that repo and note why in ORCHESTRATOR.md — the whole justification is token savings, and thrash erases it.
