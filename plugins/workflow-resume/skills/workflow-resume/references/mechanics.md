# Runtime mechanics

Read from the shipped `claude 2.1.220` bundle and confirmed against files on disk, July 2026. Names
are the minified ones so they can be found again. Behaviour may change between versions; the disk
layout is the part most worth re-checking first, since it is observable without a disassembly.

## An API error is terminal

```js
// after the stall-retry loop, in the local agent runner
if (It.apiError) {
  let yr = `[${te}] failed: ${It.apiError}`;
  return A.push(yr),
         r({type:"progress", toolUseID:"workflow_log", data:{type:"workflow_log", message:yr}}),
         null
}
```

Three retry mechanisms exist and none covers this path:

| Failure | Handling | Retries |
|---|---|---|
| No progress for `stallMs` (default 180 000 ms) | watchdog aborts, agent restarts from its original prompt | 5 |
| Throttled response (no `stop_reason`, <50 output tokens, ran > ½ `stallMs`) | sleep 45 s, retry | 1 |
| `StructuredOutput` validation failure | in-conversation nudge | 5 |
| **API error** (rate limit, usage limit, `ConnectionRefused`, 5xx) | `return null` | **0** |

A rate limit returns fast, so it fails the throttle gate (`durationMs > stallMs * 0.5`) and never
qualifies. The tool result does carry `<failures>`, `<agents_error>N</agents_error>` and a
`<diagnostics>` block with the resume call, but the status beside them reads `completed`.

## The journal path is built from the current session id

```js
function Ste(e) {                                     // e = the runId
  let t = dW() ?? tS(gn());                           // project dir
  return join(t, kt(), "subagents", "workflows", e);  // kt() = CURRENT session id
}
// journal:  join(Ste(runId), "journal.jsonl")
```

The run id is a leaf; the session id is a parent segment resolved fresh at resume time.
Auto-compaction changes it, so a resume lands in a directory that never held the run and cold
starts with no warning. Filed as `anthropics/claude-code#65796`, open, `bug` / `has repro`.

Snapshots live alongside at `<session>/workflows/<runId>.json`, written by `WSd()` at completion.
A live or resumed run therefore has a snapshot that is absent or stale.

## The cache key is a chain and the miss is sticky

```js
function zSd(e, t, r) {              // (prompt, opts, prevKey)
  let n = createHash("sha256")
    .update(r).update("\x00")        // previous key
    .update(e).update("\x00")        // prompt bytes
    .update(Jq_(t)).digest("hex");   // normalised opts
  return `v2:${n}`
}
// call site:  ge = zSd(promptStr, opts, T);  T = ge;
```

`Jq_()` normalises only `{schema, model, effort, isolation, agentType}` with keys sorted, so `label`
and `phase` don't affect the key — agents can be relabelled or regrouped without invalidating cache.

```js
let Ze = v ? undefined : l?.results.get(ge);
if (Ze !== undefined) return cached(Ze);
v = true;                            // never consults the cache again this run
```

After the first miss nothing is consulted again, including a later call whose key would have
matched. Replay is a prefix, not a set. Reported independently as `#63102`, closed `not planned`.

Only non-null results are journaled (`if (a && ge && Ze !== null)`), so a failed agent is never
poisoned into the cache.

## The TUI can't revive a dead agent

```js
n.update(e, (i) => {
  if (i.status !== "running") return i;          // gate
  let s = i.agentControllers?.get(t);
  if (s && !s.signal.aborted) s.abort(new DOMException(r, "AbortError")), o = true;
  return i })
```

`r` (retry) and `x` (skip) both abort a live `AbortController` so the stall-retry loop re-runs the
agent. A failed agent has no controller, and a finished run has none at all, so neither key reaches
it. Getting from a dead run back to a live one is a missing state transition, not a missing
keybinding.

## Disk layout

```
~/.claude/projects/<project>/
  <SESSION-UUID>/
    workflows/
      <runId>.json                      snapshot: status, workflowProgress, scriptPath, args
      scripts/<name>-<runId>.js         the script, persisted every invocation
    subagents/workflows/<runId>/
      journal.jsonl                     {type:"started"|"result", key, agentId, result}
      agent-<id>.jsonl                  per-agent transcript, current while live
      agent-<id>.meta.json
```

`started` is appended per *attempt*, so a `started`/`result` gap counts attempts, not lost agents.
The contrast between a run at parity and one at 107/55 is still meaningful.

## Field notes

- **Runs report merges that did not happen.** Observed: cached results reading `MERGED` for two
  items whose branches were 30 and 17 commits ahead of `main`, unmerged. A task is not succeeded
  because a process exited zero.
- **`ConnectionRefused` is usually local.** A proxy or gateway restarting under the run, not a model
  failure. The work is not suspect; the transport was.
- **A locked worktree naming a live pid is legitimate.** `git worktree list --porcelain` shows
  `locked claude agent <name> (pid N start ...)`. Check the pid before unlocking.
- **The scratchpad path carries the session id**, which is how to tell whether a session is alive:
  `/private/tmp/claude-<uid>/<project>/<SESSION-UUID>/scratchpad/`.
