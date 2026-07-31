# workflow-resume

Find recent dynamic workflow runs that lost agents to API errors, and resume or finish them
correctly.

## The problem

A workflow agent that hits a rate limit, usage limit, dropped connection or 5xx returns `null` with
zero retries. `parallel()` and `pipeline()` map that to `null` too, the generated script's closing
`.filter(Boolean)` drops it, and the run reports **`completed`**. The tokens are spent, the work is
gone, and nothing surfaces it.

Resuming often doesn't recover it either: the journal is filed under the *session* directory, and
auto-compaction mints a new session id that orphans it.

## Usage

```
/workflow-resume
```

Or just describe the situation — "resume the workflow that died overnight", "the fleet run says
completed but half the agents failed", "why did my resume re-run everything".

## What it does

1. **Scans** `~/.claude/projects` for recent runs, reading the journal and per-agent transcripts
   rather than the snapshot (a snapshot is written once at completion, so it is absent or stale for
   any live or resumed run).
2. **Separates live runs from finished ones.** A live run must not be relaunched, and its worktrees
   and pid-held locks must not be touched. It gets a standing instruction instead.
3. **Asks which to recover** when several qualify, leading with liveness and the done/failed split.
4. **Judges whether a resume is worth it** from the journal's `started`/`results` ratio, since the
   cache miss flag is sticky and replay is a prefix.
5. **Handles the session id**, including the `cp -R` relocation when it has changed.
6. **Reconciles cached results against git**, because runs have reported items merged whose
   branches were still tens of commits ahead of `main`.

## Contents

```
skills/workflow-resume/
├── SKILL.md
├── scripts/scan_workflows.py          stdlib only, read-only
└── references/
    ├── mechanics.md                   runtime behaviour, with the code it was read from
    └── handover-template.md           standing-instruction shape for a live run
```

## The scanner standalone

```bash
python3 scripts/scan_workflows.py --hours 48
python3 scripts/scan_workflows.py --project perch --hours 12
python3 scripts/scan_workflows.py --json
```

Reads only. Never writes, never resumes, never touches a repo.

## Provenance

Mechanics verified against the shipped `claude 2.1.220` bundle and reproduced against files on
disk, July 2026. Upstream issues: `anthropics/claude-code#65796` (open — resume cold-starts after
compaction) and `#63102` (closed `not planned` — the chained cache key).
