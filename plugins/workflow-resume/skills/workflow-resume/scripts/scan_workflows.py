#!/usr/bin/env python3
"""Scan ~/.claude/projects for dynamic-workflow runs and report their true state.

Snapshots lie in two directions, so this reads both sources and prefers the
newer one:

  <session>/workflows/<runId>.json                       snapshot, written at completion
  <session>/subagents/workflows/<runId>/journal.jsonl    append-only, current
  <session>/subagents/workflows/<runId>/agent-*.jsonl    per-agent transcripts, current

A run whose journal or transcripts are newer than its snapshot is either live or
was resumed after the snapshot was written; the snapshot's status and error
counts are stale in that case and are marked as such.

stdlib only. Read-only.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

PROJECTS = Path.home() / ".claude" / "projects"
LIVE_WINDOW = 300  # a file touched this recently means something is still writing


def _load(p: Path):
    try:
        return json.loads(p.read_text())
    except Exception:
        return None


def _mtime(p: Path) -> float:
    try:
        return p.stat().st_mtime
    except OSError:
        return 0.0


_LIVE_IDS: set[str] | None = None


def _live_session_ids() -> set[str]:
    """Session ids Claude Code currently has open, from its own registry.

    ~/.claude/sessions/<PID>.json carries {"pid", "sessionId", "cwd", "name", "status"} for
    each running session. Measured 2026-08-21 against 21 live sessions.

    The previous probe here grepped `ps` output for the session id and reported every one of
    those 21 as ended: the id is not in the top-level process's argv, only in the environment
    of its transient children. The scratchpad path is no better — it is named by a
    per-process id that stops matching the session id once a session has been resumed.
    """
    global _LIVE_IDS
    if _LIVE_IDS is None:
        _LIVE_IDS = set()
        try:
            out = subprocess.run(["ps", "-axo", "pid=,comm="], capture_output=True,
                                 text=True, timeout=15).stdout
        except Exception:
            out = ""
        pids = {}
        for line in out.splitlines():
            pid, _, comm = line.strip().partition(" ")
            if pid.isdigit():
                pids[int(pid)] = comm.strip()
        for f in (Path.home() / ".claude" / "sessions").glob("*.json"):
            rec = _load(f) or {}
            sid, pid = rec.get("sessionId"), rec.get("pid")
            # the registry file is named by pid, so a reused pid overwrites the record
            # rather than inheriting it; all that is left to rule out is a pid that now
            # belongs to something that is not Claude Code
            if sid and isinstance(pid, int) and "claude" in pids.get(pid, "").lower():
                _LIVE_IDS.add(sid)
    return _LIVE_IDS


def _session_alive(session_id: str) -> bool:
    return session_id in _live_session_ids()


def _journal_counts(journal: Path):
    started = results = 0
    keys_started, keys_done = [], set()
    try:
        for line in journal.read_text().splitlines():
            if not line.strip():
                continue
            try:
                e = json.loads(line)
            except Exception:
                continue
            if e.get("type") == "started":
                started += 1
                keys_started.append(e.get("key"))
            elif e.get("type") == "result":
                results += 1
                keys_done.add(e.get("key"))
    except OSError:
        pass
    pending = [k for k in dict.fromkeys(keys_started) if k not in keys_done]
    return started, results, pending


ITEM_RE = re.compile(r"\b([A-Z]{2,10}-\d{3,4})\b")
ERR_RE = re.compile(r"API Error[^\"]{0,60}")


def _agents(rundir: Path, now: float):
    """Per-agent state from the transcripts, which stay current while a run is live."""
    out = []
    for f in sorted(rundir.glob("agent-*.jsonl")):
        try:
            text = f.read_text(errors="ignore")
        except OSError:
            continue
        items = ITEM_RE.findall(text)
        item = max(set(items), key=items.count) if items else None
        errs = ERR_RE.findall(text)
        limit = "session limit" in text or "usage limit" in text
        mt = _mtime(f)
        out.append(
            {
                "agent": f.stem.replace("agent-", "")[:12],
                "item": item,
                "lines": text.count("\n"),
                "mtime": mt,
                "live": (now - mt) < LIVE_WINDOW,
                # Only an error the transcript actually *ends* on is that agent's error. The
                # previous substring match over the whole transcript turned an agent that
                # merely discussed a rate limit into a failure, and on 2026-08-21 that put a
                # "machine-wide usage limit" into a repository's event log. No such limit
                # occurred: the terminal had crashed.
                "error": errs[-1] if errs else None,
                "mentions_limit": bool(limit),
            }
        )
    return out


_SCRIPT_INDEX: dict[str, str] | None = None
_RUN_ID_RE = re.compile(r"-(wf_[0-9a-f-]{8,})\.js$")


def _script_index() -> dict[str, str]:
    """run id -> persisted script path, indexed once across every project directory.

    A snapshot is only written when a run completes, so `snapshot.scriptPath` is null for
    exactly the runs that need recovering. The script itself is persisted at launch and
    survives — but under the project directory of the *shell's* working directory at that
    moment, while the journal is filed under the project directory of the session's
    *original* cwd. Any session working in a subdirectory or worktree splits its own state
    across two project directories, so the script has to be looked up by run id rather than
    joined onto the journal's path.

    Measured 2026-08-21: a session whose journals sat under `-Users-x-Dev` had its scripts
    under `-Users-x-Dev-orderly`. Reporting "no script path" for those runs is what sent a
    recovery down the hand-authored path and lost three runners' context.
    """
    global _SCRIPT_INDEX
    if _SCRIPT_INDEX is None:
        _SCRIPT_INDEX = {}
        for path in glob.iglob(str(PROJECTS / "*" / "*" / "workflows" / "scripts" / "*.js")):
            m = _RUN_ID_RE.search(path)
            if not m:
                continue
            prev = _SCRIPT_INDEX.get(m.group(1))
            if prev is None or _mtime(Path(path)) > _mtime(Path(prev)):
                _SCRIPT_INDEX[m.group(1)] = path
    return _SCRIPT_INDEX


def scan(project_filter: str | None, hours: float):
    now = time.time()
    cutoff = now - hours * 3600
    runs = []

    for proj in sorted(PROJECTS.glob("*")):
        if not proj.is_dir() or proj.name == "memory":
            continue
        if project_filter and project_filter.lower() not in proj.name.lower():
            continue
        for rundir in sorted(proj.glob("*/subagents/workflows/wf_*")):
            run_id = rundir.name
            session_id = rundir.parts[-4]
            journal = rundir / "journal.jsonl"
            snap_path = proj / session_id / "workflows" / f"{run_id}.json"
            snap = _load(snap_path) or {}

            newest = max(
                [_mtime(journal)] + [_mtime(f) for f in rundir.glob("agent-*.jsonl")] or [0]
            )
            if newest < cutoff:
                continue

            started, results, pending = _journal_counts(journal)
            agents = _agents(rundir, now)
            snap_mtime = _mtime(snap_path)

            prog = [
                x
                for x in (snap.get("workflowProgress") or [])
                if x.get("type") == "workflow_agent"
            ]
            snap_err = [x for x in prog if x.get("state") == "error"]

            live_agents = [a for a in agents if a["live"]]
            stale_snapshot = bool(snap) and newest > snap_mtime + 5
            live = bool(live_agents) or (now - newest) < LIVE_WINDOW

            runs.append(
                {
                    "run_id": run_id,
                    "project": proj.name,
                    "session_id": session_id,
                    "session_alive": _session_alive(session_id),
                    "script_path": snap.get("scriptPath") or _script_index().get(run_id),
                    "script_from_disk": not snap.get("scriptPath")
                    and bool(_script_index().get(run_id)),
                    "args": snap.get("args"),
                    "title": (snap.get("title") or snap.get("summary") or "").strip(),
                    "snapshot_status": snap.get("status") if snap else None,
                    "snapshot_stale": stale_snapshot,
                    "snapshot_missing": not bool(snap),
                    "live": live,
                    "newest_activity": newest,
                    "journal": {"started": started, "results": results, "pending_keys": len(pending)},
                    "snapshot_errors": [
                        {"label": x.get("label"), "error": (x.get("error") or "")[:90]}
                        for x in snap_err
                    ],
                    "agents": agents,
                }
            )

    runs.sort(key=lambda r: r["newest_activity"], reverse=True)
    return runs


def _fmt(ts: float) -> str:
    return time.strftime("%d %b %H:%M", time.localtime(ts)) if ts else "-"


def render(runs):
    if not runs:
        print("No workflow runs in the window.")
        return
    for r in runs:
        failed = [a for a in r["agents"] if a["error"]]
        live_a = [a for a in r["agents"] if a["live"]]
        done = [a for a in r["agents"] if not a["error"] and not a["live"]]

        flags = []
        if r["live"]:
            flags.append("LIVE")
        if r["session_alive"]:
            flags.append("session-alive")
        else:
            flags.append("session-ended")
        if r["snapshot_missing"]:
            flags.append("no-snapshot")
        elif r["snapshot_stale"]:
            flags.append("snapshot-STALE")

        print(f"\n{'=' * 74}")
        print(f"{r['run_id']}   [{' · '.join(flags)}]")
        if r["title"]:
            print(f"  {r['title'][:100]}")
        print(f"  project     {r['project']}")
        print(f"  session     {r['session_id']}")
        print(f"  last write  {_fmt(r['newest_activity'])}")
        if r["snapshot_status"]:
            note = "  (stale, journal is ahead)" if r["snapshot_stale"] else ""
            print(f"  snapshot    {r['snapshot_status']}{note}")
        print(
            f"  journal     started={r['journal']['started']} "
            f"results={r['journal']['results']} pending={r['journal']['pending_keys']}"
        )
        if r["script_path"]:
            print(f"  script      {r['script_path']}")
        if r["args"] is not None:
            print(f"  args        {json.dumps(r['args'])[:120]}")

        if r["agents"]:
            print("  agents:")
            for a in r["agents"]:
                state = "LIVE" if a["live"] else ("FAILED" if a["error"] else "done")
                item = a["item"] or "?"
                extra = f"  {a['error']}" if a["error"] else ""
                print(
                    f"    {state:<7} {item:<12} {a['agent']}  "
                    f"lines={a['lines']:<5} {_fmt(a['mtime'])}{extra}"
                )
        if r["snapshot_errors"] and not r["agents"]:
            print("  snapshot errors:")
            for e in r["snapshot_errors"]:
                print(f"    FAILED  {e['label']}  {e['error']}")

        print(f"  summary     {len(done)} done · {len(failed)} failed · {len(live_a)} live")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--project", help="substring of the project dir name")
    ap.add_argument("--hours", type=float, default=48.0, help="lookback window (default 48)")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    a = ap.parse_args()

    runs = scan(a.project, a.hours)
    if a.json:
        json.dump(runs, sys.stdout, indent=1)
        print()
    else:
        render(runs)


if __name__ == "__main__":
    main()
