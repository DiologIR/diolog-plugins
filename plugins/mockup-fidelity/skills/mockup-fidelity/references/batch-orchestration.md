# Batch orchestration — sequential Workflow fan-out for large, serial-resource audits

Phase 6 of `SKILL.md` fans out one sub-agent per screen with the `Agent` tool, capped at ≈5 waves. That is right for a handful of screens on a web target where rendering is parallelisable. It is the **wrong** shape for two situations that recur:

- **A large inventory** — 30, 50, 66 mock frames — where you want *one fresh agent per frame, with no context bleed* (each re-reads the skill and owns one surface end-to-end: audit → fix → verify → commit), and you want the run to survive your own context compaction.
- **A React Native target**, where the simulator is a **serial resource** — exactly one screen can be navigated/screenshotted/measured at a time. Parallel agents would fight over the sim, the Metro connection, and the single `_latest.json` the harness POSTs. (`SKILL.md` Phase 6 already flags this; this doc is how you honour it at scale.)

The tool that fits both is **`Workflow` with a strictly sequential `for … await agent()` loop** — never `parallel()`/`pipeline()` across frames. The workflow runs in the background, awaits one agent at a time, survives compaction, and is **resumable** (cached completed agents on `resumeFromRunId`). This doc is the hard-won context for making that actually run — every item below is a trap that produced a silent no-op or a broken commit in a real run.

> This is an *orchestration* pattern, not a new audit method. Every agent still does the full `SKILL.md` method on its one frame — measure, never eyeball; mock wins; breadth (present/divergent/**absent** + app-extra) before depth; differ to zero unexplained. The orchestrator's only jobs are: serialise the sim, protect the harness from commits, checkpoint health, and keep the inventory current.

---

## The invariants (break one and the run silently fails)

### 1. `args` may arrive as a JSON *string* — parse defensively or the run is a silent no-op
The `Workflow` tool's `args` is supposed to reach the script as a parsed JSON value, but it can arrive **stringified**. If your script does `const FRAMES = Array.isArray(args) ? args : []`, a stringified array fails the `isArray` check, `FRAMES` is `[]`, and the workflow returns instantly (≈4 ms, 0 agents) having done **nothing** — and that looks like success. Always parse defensively and log what you got:

```js
let raw = args
if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch (e) { raw = [] } }
const FRAMES = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.frames) ? raw.frames : [])
log(`args typeof=${typeof args}; resolved ${FRAMES.length} frame(s)`)   // diagnoses the no-op instantly
if (!FRAMES.length) { log('No frames passed in args — nothing to do.'); return [] }
```

### 2. Workflow scripts have NO filesystem/Node access — the frame list MUST come through `args`
You cannot `readFileSync` a batch list, an inventory, or a config inside the script. Everything the script branches on comes through `args` (and the few globals: `log`, `agent`, `parallel`, `pipeline`, `budget`, `workflow`). So invariant #1 isn't optional polish — `args` is the *only* channel, and a stringified-args no-op means the batch never ran.

### 3. Strictly sequential — `for … await`, never `parallel()`
The sim is serial. The loop awaits each agent fully (including its commit) before starting the next:

```js
const results = []
for (const f of FRAMES) {
  log(`Frame ${f.n} — ${f.title} — starting (sole sim user)`)
  const ledger = await agent(brief(f.n, f.title), { label: `frame-${f.n}`, phase: 'Re-audit', agentType: 'general-purpose' })
  results.push({ n: f.n, title: f.title, ledger })
  log(`Frame ${f.n} — done`)
}
return results
```
The Workflow concurrency cap is irrelevant here — the discipline is the *await-one-at-a-time* loop, which guarantees two agents never touch the sim at once.

### 4. `agentType: 'general-purpose'` — the frame agent needs the full tool set
A per-frame agent drives the sim (`xcrun simctl`), runs Maestro, extracts the mock (`playwright-cli`), runs the differ (`node`), edits code (`Edit`/`Write`), runs `tsc`, and commits (`git`). The default workflow subagent may not carry all of that — pass `agentType: 'general-purpose'` (or another agent type that has Bash + Edit + Read) so it can.

### 5. Workflow agents can't call the `Skill` tool — point them at `SKILL.md` by absolute path, and embed THE LAW verbatim
A sub-agent typically has no `Skill` tool, so "invoke the mockup-fidelity skill" must mean **read and follow** `SKILL.md` at its absolute path (and its `references/`). Two more reasons to **also embed THE LAW (the ⛔ gate's five-plus rules) verbatim in the brief**: (a) the *installed marketplace* copy can be a stale version behind the *source* repo — embedding the law makes the agent enforce the current law regardless of which `SKILL.md` it reads; (b) it survives an agent that skims the skill under effort pressure.

---

## Protect the dev harness from every commit (the part that quietly corrupts the tree)

Each per-frame agent commits. The RN render harness (`assets/rn-harness/` — `.audit/measure.js` + a one-line `if (__DEV__) { try { require('../.audit/measure'); } catch {} }` in the app root, e.g. `app/_layout.tsx`) must **never** land in any of those commits. The `try/catch` guards *runtime*, but **Metro resolves `require` statically at build time**, so a committed harness line breaks a production bundle (it points at a git-excluded path). Protect it at the orchestrator level **once**, before launching any batch — don't rely on 50 agents each remembering not to stage it:

```bash
# 1. .audit/ never tracked (covers the probe file)
printf '\n# mockup-fidelity harness (never commit)\n/apps/<app>/.audit/\n' >> .git/info/exclude
# 1b. also exclude unrelated root untracked artifacts so a stray `git add -A` can't sweep them
for d in .design-review/ .email-mockups/ .mockup-shots/ ; do grep -qx "/$d" .git/info/exclude || echo "/$d" >> .git/info/exclude; done

# 2. hide the one-line dev edit in the TRACKED app root via skip-worktree
#    (gitignore is wrong here — the file is tracked; you only want to mask the local edit, not untrack it)
git update-index --skip-worktree apps/<app>/app/_layout.tsx
git ls-files -v apps/<app>/app/_layout.tsx   # → leading "S" confirms skip-worktree
git status --short | grep <app> || echo "harness invisible to git = good"
```

Now `git add -A` (if an agent ignores discipline) cannot include the harness. **Teardown** (after the last batch): `git update-index --no-skip-worktree apps/<app>/app/_layout.tsx`, remove the require line, `rm -rf apps/<app>/.audit`, and confirm the app boots clean.

**Per-frame git discipline (put it in the brief, verbatim):**
- Commit on the working branch (e.g. `staging`). **NEVER push** — the orchestrator/human decides when.
- **NEVER `git add -A` / `git add .` at the repo root** (it sweeps unrelated untracked files, and would catch the harness if protection ever lapses). Stage only the specific changed files under the app dir with explicit paths.
- **Never edit or stage the harnessed app root** (`app/_layout.tsx`). If a frame genuinely needs a root-layout change, the agent STOPS and reports — it does not commit it.
- Run the target's typecheck (`npx tsc --noEmit`) clean **before** committing.
- If a frame already matches (no divergences), make **no** commit — report "no changes".

---

## Checkpoint between batches — the sim wedges, and a long unattended run hides it

Run the inventory in **batches** (≈6 frames per `Workflow` invocation), not one 50-frame run, so you get a recovery point. Workflow scripts can't run shell, so the health check lives in the **orchestrator** (the main loop) between batches:

- **Probe the toolchain:** mock port, Metro port, collector port all answering; collector dump (`_latest-styles.json`) mtime is *fresh* (an agent navigating the sim refreshes it every ~1.5 s — a stale dump means the harness detached or the app crashed).
- **Recover if wedged:** relaunch the app (`xcrun simctl terminate … && xcrun simctl launch …`), confirm a fresh dump lands before the next batch. Confirm the sim still targets the right Metro (a plain RN debug build silently reconnects to `:8081`; pin `RCT_jsLocation`).
- **Confirm harness still protected** (skip-worktree flag still `S`; `.audit/` still excluded) and the tree is otherwise clean.
- **Update the inventory from the per-frame ledger files on disk** (next point), not from memory.

**Durability — write the ledger to disk AND return it.** A workflow's `return` value comes back only in the completion `<task-notification>`; have each agent ALSO write its ledger to `.mockup-fidelity/reaudit/frame-<n>.md`. Then results survive a lost notification, and the orchestrator updates the master inventory by reading those files. Validate the pipeline with a **small first batch (1–3 frames)** before scaling — confirm one agent really drove the sim, diffed, fixed, ran `tsc`, committed *without leaking the harness*, and returned a ledger.

**Resume a stalled batch** with `Workflow({ scriptPath, resumeFromRunId })` — completed `agent()` calls return cached results; only the failed/remaining frames re-run.

---

## The reusable script

`assets/orchestration/reaudit-batch.workflow.js` is the generalised version of the script that ran a 54-frame RN re-audit: a `CONFIG` block (sim UDID, ports, app dir, mock path, skill path, branch) you fill in, the defensive `args` parse from invariant #1, THE LAW embedded verbatim, the per-frame git/harness discipline, and the sequential `await` loop. Pass `args` as the batch's frame list: `[{ "n": 15, "title": "Search · AI-interpreted" }, …]`. Edit the `CONFIG` for your project; the LAW and discipline are reusable as-is.
