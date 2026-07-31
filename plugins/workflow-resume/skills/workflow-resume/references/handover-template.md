# Handover template — a live run

A live run can't be resumed, and its failed agents can't be retried in place. What helps is a
standing instruction the owning session can act on when the run lands: what is true now, what to
reconcile, what to redo. Write it as a file the user can paste, or hand it over directly.

Fill from the scan plus a git read. Cut any section that doesn't apply — a template followed to the
letter reads like a form, and the useful version is the one where every line is load-bearing.

---

## Shape

**Opening.** Name the run, say it is still running, and state the three things not to do:
relaunch it, resume it, or run git against its worktrees. Say why once — a second concurrent run
against the same worktrees corrupts work — and don't repeat it.

**Live state.** A table, one row per agent: item, agent id, state, and for failures the exact error
string. Say where it was read from and when, because the snapshot on disk may contradict it and
someone will check.

| Item | Agent | State |
|---|---|---|
| `merge:PH-004` | `aab2d4a92a9a` | done |
| `work:PH-013` | `a9708416bbe2` | **failed** — `Unable to connect to API (ConnectionRefused)` after 492 lines |
| `work:PH-009` | `aa09f6030392` | **running now** |

If the snapshot disagrees, say so explicitly and say which to believe. A stale snapshot reading
`completed, 8 error` next to a live resume is the single most confusing artefact in this whole
area.

**Surviving work.** For each failed agent whose branch is ahead of main: the branch, the commit
count, the worktree path, and the instruction to resume there rather than start over. This is the
section that saves the most, so make it concrete enough to act on without a follow-up question.

**When it completes.** Numbered, in order. Reconcile against git first, then merges one at a time
with a check that each landed, then the redo list, then cleanup last and only once the rest is
proven.

**Do not.** Short list, each with its reason: don't terminate the session (it orphans the journals),
don't retry a failed agent from `/workflows` (`r` only aborts a live controller), don't touch the
running agent's worktree.

---

## What earns its place

- **Exact strings.** `ai/ph-013 ahead=13 in .worktrees/PH-013 at c4442c8` is actionable;
  "some work survived" is not.
- **Provenance and a timestamp.** "Read from the run's agent transcripts at 18:42." The state moves,
  and a reader needs to know how stale the note is.
- **Blocked-on-a-human items called out separately.** If the repo's own history says an item is
  green but unratified, a session acting on a cached `merge:` result will merge it. Name it.
- **The reason beside each prohibition.** "Don't terminate the session" invites a workaround;
  "don't terminate the session, it orphans all 71 journals under this id" doesn't.
