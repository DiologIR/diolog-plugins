---
name: workflow-resume
description: >-
  Find recent dynamic workflow runs that lost agents to API errors, and resume or finish them correctly. Use whenever someone asks to resume, recover, restart or salvage a workflow, mentions a workflow that "completed" but lost agents, reports failed or dead agents in a fan-out, asks what happened to a wave or fleet run, hits a rate limit or usage limit or `ConnectionRefused` mid-run, or asks why a resume cold-started and re-ran work it had already done. Also use before relaunching any workflow the user believes failed, because a run that reports `completed` with failed agents and a run that is still live need opposite handling.
---

# Resuming a dynamic workflow

A workflow agent that hits an API error returns `null` with zero retries. `parallel()` and
`pipeline()` map that to `null` too, the script's closing `.filter(Boolean)` drops it, and the run
reports **`completed`**. Nothing surfaces the loss. So "the workflow finished" and "the work is
done" are unrelated claims, and the job here is to establish which one is true before touching
anything.

Two failure shapes dominate, and they need opposite handling:

- **A finished run with dead agents.** Recoverable by resume, or by finishing the lost items
  directly, depending on how much of the journal survives.
- **A live run.** Relaunching it starts a second concurrent run against the same worktrees. The
  cost of getting this wrong is corrupted work, so establish liveness first.

## 1. Scan

```bash
python3 scripts/scan_workflows.py --hours 48
python3 scripts/scan_workflows.py --project perch --hours 12
python3 scripts/scan_workflows.py --json          # for programmatic use
```

The scanner reads the journal and the per-agent transcripts rather than trusting the snapshot,
because a snapshot is written once at completion: a run that was resumed, or is still going, has a
snapshot that disagrees with reality. It flags that as `snapshot-STALE`, and `LIVE` when something
wrote in the last five minutes.

Per run it reports: run id, project, session id, whether that session is still alive, the script
path and args needed to resume, journal `started`/`results`/`pending`, and each agent's item,
state and error.

Its error detection is a substring match over transcripts, so an agent that merely discusses a rate
limit reads as failed. Treat the agent list as a map of where to look, and confirm anything
load-bearing against the transcript or git.

## 2. Live runs

`LIVE`, or agents written in the last few minutes, means leave it alone. Don't relaunch, don't
resume, don't run git commands against its worktrees, and don't unlock a worktree whose lock names
a pid that is still running — that lock is doing its job.

A failed agent inside a live run can't be retried from the `/workflows` view either. `r` aborts a
live `AbortController` to force a re-run; a failed agent no longer has one, and the script already
took its `null` and moved on. Those items get finished as ordinary work after the run ends.

What's useful here is a **standing instruction** the session can act on when the run lands: current
state, what to reconcile, what to redo. `references/handover-template.md` has the shape.

## 3. Which run, when there are several

More than one candidate is normal after a bad night. Ask, with the facts that decide it:

```
AskUserQuestion:
  "Three runs lost agents in the last 24h. Which do you want recovered?"
    wf_795d98f2-9cb · proofhouse-finish · LIVE now · 3 done, 1 failed (PH-013), 1 running
    wf_555148f0-add · Lane C · finished · 10 of 19 done, 9 lost to 529 + session limit
    wf_b7d92af6-47f · items 0275-0281 · finished · 3 done, 2 failed on 529
```

Lead each option with liveness, then the done/failed split, then the cause. Someone who wrote the
script recognises it from the item ids faster than from the run id. Offer "all of them" when the
runs are disjoint; when they touch the same repo, say so, because serialising the recovery matters
more than saving a round trip.

## 4. Is a resume worth it

`Workflow({scriptPath, resumeFromRunId})` replays cached `agent()` results. The cache key is a
sha256 chain over `(previous key, prompt, normalised opts)`, and the miss flag is **sticky**: after
the first miss nothing is consulted again, even a later call whose key would have matched. So
replay is a prefix, and a run that failed early recovers almost nothing.

Rough rule from `journal started=N results=M`:

- **M close to N, failures late** — resume. Most of the run replays free.
- **M well under N** — finish the outstanding items directly. Replay stops at the first miss
  anyway, so a resume pays nearly full price for the tail *and* re-asserts stale cached results.
- **No script path** (never snapshotted) — the script is still on disk at
  `<session>/workflows/scripts/`; match it by run id.

Failed agents are never journaled (only non-null results are), so a failure is never poisoned into
the cache. The cost of one is everything downstream of it, not the failure itself.

## 5. The session id decides whether resume works at all

The journal is filed under the session, not the run:

```
~/.claude/projects/<project>/<SESSION-UUID>/subagents/workflows/<wf_runId>/journal.jsonl
                             ^^^^^^^^^^^^^^ resolved fresh at resume time
```

Resume rebuilds that path from the *current* session id. A different session finds nothing and cold
starts, silently — `anthropics/claude-code#65796`, open. Auto-compaction mints a new session id, so
a long run can orphan its own journal mid-flight.

Three cases:

- **Session still open** (`session-alive`) — type into that window. Don't `claude --resume` a live
  session, and don't close it: closing costs the cache and buys nothing.
- **Session ended** — `claude --resume <session-id>` from the project directory. Same id, so the
  journal resolves.
- **Deliberately starting fresh** — relocate the run first, or the cache is invisible:

  ```bash
  cp -R <old-session>/subagents/workflows/<wf_runId> \
        <new-session>/subagents/workflows/
  ```

  Copy rather than move, so the original survives a second attempt.

## 6. Reconcile against git before trusting a cached result

Cached results are what an agent *said*, not what landed. Runs have reported items merged that were
never in `main` — in one case two items whose branches were 30 and 17 commits ahead, unmerged, while
the run's cached result read `MERGED`. Resuming on top of that carries the false claim forward and
builds the next wave on it.

Before acting on any cached merge or completion:

```bash
git -C <repo> log --oneline -10 main
git -C <repo> worktree list
git -C <repo> rev-list --count main..<branch>     # per branch
```

`git log --grep=<item-id>` doesn't settle it: ids appear in pipeline and spec commits whether or not
the work merged. An item is done when its commits are ancestors of the integration branch, or when
the project's own ledger says so.

Worktree state tells you what to do with a failed agent's work:

- **Branch ahead of main** — real work survived. Resume in that worktree on that branch. Starting
  over discards it and can conflict.
- **Branch at main's HEAD** — the agent died before committing. Clean re-run.
- **No worktree** — never started.

## 7. Then act

For a resume, hand back the exact call:

```
Workflow({
  scriptPath: "<from the scan>",
  resumeFromRunId: "<run id>"
})
```

with args when the scan reported them. For direct recovery, work the outstanding items in
dependency order, merging one at a time and confirming each landed before starting the next —
serialised, because two merges into one integration branch is how a fleet corrupts a repo.

Report per item: branch, commits ahead, gate evidence, merged or not. A parked item with a reason
is worth more than a green tick nobody checked.

## Reference

- `references/mechanics.md` — the runtime behaviour this rests on, with the code it was read from.
  Read it when something contradicts the guidance above, or to explain *why* to someone.
- `references/handover-template.md` — the standing-instruction shape for a live run.
