# The cheap-executor coding lanes — Cursor composer-2.5 & GLM-5.2 (zero CLI)

An **optional cost optimization**: delegate mechanical, plan-scoped code writing to a cheap external executor, and spend Opus only on verification and fixes. Two lanes, same rules: the Cursor CLI running **`composer-2.5`** (~$0.12/task) and the ZERO CLI running **`glm-5.2` at high reasoning effort** via the Vercel AI Gateway (~$0.35/task). (Sonnet is *not* a cheap lane — per task it lands around 80% of Opus's cost because it spends more tokens; choose Sonnet for capability-adequacy in the review lanes, never for savings.) A lane exists to save Opus tokens **net of verification** — if a delegation doesn't plausibly clear that bar, Opus writes the code directly. Never let a lane become a correctness risk: Opus (or the gates) always validates executor output before it counts.

## Availability check (once, at fleet start, per lane)

```bash
command -v cursor-agent && cursor-agent --version        # composer lane
command -v zero || test -x ~/.local/bin/zero             # glm lane (binary also via $ZERO_BIN)
```

A missing lane → note it "unavailable" in ORCHESTRATOR.md and route its work to Opus. Don't install unprompted; offer: `curl https://cursor.com/install -fsS | bash` (cursor.com/docs/cli), or the zero release binary (github.com/gitlawb/zero). Flags below are verified as of writing — confirm against `cursor-agent --help` / `zero exec --help` before first use, and prefer what `--help` says over this file.

## What to delegate (and what never to)

Delegate when ALL hold — the plan has already made the decisions, the executor just types:
- The plan/spec specifies the change at file level (new component per an existing pattern, a route handler matching a template, repetitive wiring, test scaffolding from existing examples).
- The files involved fit comfortably in a 200k-token window alongside the context contract.
- Success is mechanically checkable (typecheck/tests/lint or a straightforward Opus diff-read).

Never delegate: architectural or data-model decisions; security-sensitive code of any kind — auth, **secret custody / Credential-Broker code, webhook signature verification, tenancy/authz boundaries**, payment; **maker≠checker and atomic-claim idempotency logic**; **provenance-honesty judgment calls** (what counts as live vs sample, honest degradation); **contract/`CONTRACT_VERSION` changes**; cross-cutting refactors; merge-conflict resolution; e2e debugging; anything where the plan says "investigate". And never **design work** (page assembly, composites, anything aesthetic) — the executors' design ability is weak; design leaf work routes to sonnet, design direction to Opus (see ship-feature's `design-representation.md`). Two failed verify-fix cycles on a task → take it back to Opus and note it; executor thrash costs more than it saves.

## Invocation — composer lane (Cursor CLI)

Run **inside the feature's worktree** so edits land on the branch. Non-interactive print mode (verified against cursor-agent 2026.07 and the diolog-swe-bench cursor adapter):

```bash
cd .worktrees/<ID> && cursor-agent -p --force --output-format json --model composer-2.5 "<prompt>"
```

(`-p/--print` = non-interactive; `--force` applies file edits/commands without confirmation — required in print mode; `--output-format json` emits one final object `{is_error, subtype, result, …}` — treat `is_error: false` / `subtype: "success"` as *completed*, never as *correct*. Auth: `CURSOR_API_KEY` env var, or a one-time `cursor-agent login`; `cursor-agent --list-models` confirms `composer-2.5` exists.)

## Invocation — glm lane (ZERO CLI, Vercel AI Gateway)

One-time provider profile (the gateway key lives in `~/Dev/diolog-swe-bench/env.local` as `VERCEL_AI_GATEWAY_API_KEY` — **source it into the environment; never copy the value into any file**):

```bash
set -a; source ~/Dev/diolog-swe-bench/env.local; set +a
zero setup custom-openai-compatible --name vercel-gateway \
  --base-url https://ai-gateway.vercel.sh/v1 \
  --api-key-env VERCEL_AI_GATEWAY_API_KEY --model zai/glm-5.2 --verify
```

Per task (mirrors the proven diolog-swe-bench zero adapter; binary on PATH, at `~/.local/bin/zero`, or via `$ZERO_BIN`):

```bash
ZERO_PROVIDER=vercel-gateway zero exec --cwd .worktrees/<ID> --model zai/glm-5.2 \
  --reasoning-effort high --auto high --skip-permissions-unsafe \
  --output-format stream-json --prompt "<prompt>"
```

(`--auto high` + `--skip-permissions-unsafe` run fully unattended. The stream-json JSONL carries a `run_start` event whose `model`/`apiModel` field is the **wire-level model check** — grep it; a `run_end` with `status` other than `success` (or `incomplete` with usable partial edits) is a lane failure, not a result.)

## The prompt contract (both lanes)

The prompt must contain, verbatim paths, every time (an executor starts cold — it shares no memory with the runner):

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

## The verify-fix loop (Opus's half — identical for both lanes)

After each executor invocation, the Opus runner:

1. `git diff` — read the whole diff. Out-of-scope files touched → revert those hunks.
2. Run the repo gates that cover the change (typecheck, affected tests, lint).
3. Judge against spec/plan/DESIGN/practices — correctness, not just compilation.
4. Small gaps → Opus fixes directly (don't round-trip trivia). Substantive gaps → one executor retry with the failure quoted. Second failure → Opus rewrites; log `composer: reverted` / `glm: reverted` for the task.
5. Commit with the runner's normal discipline once green.

## Fallback — any lane failure routes back to Opus, always

The cheap lanes are optimizations with an **Opus fallback, never a dependency the pipeline can stall on or silently skip work over**. If a lane isn't working for ANY reason — binary missing, gateway/key error, the wire-level model check fails (`WRONG-MODEL` / a `run_start` model mismatch), repeated CLI errors or timeouts, or the per-lane kill-switch below has tripped — the task goes **to Opus**: never to the *other* cheap lane (a lane that failed on quality doesn't get a sibling with the same review debt), and never dropped or deferred because the cheap path was down. Log the fallback (`composer: unavailable → opus` etc.) so the accounting stays honest.

## Accounting honesty (extends to every downgraded lane)

In each item's ledger Notes, record the lane outcome **per lane** (`composer: N tasks, M retries, K reverted` · `glm: N tasks, M retries, K reverted` — tracked separately, never pooled). If a repo's early items show a lane reverting more than roughly **1 task in 3**, stop using *that lane* for that repo (its work routes to Opus per the fallback rule) and note why in ORCHESTRATOR.md — the whole justification is token savings, and thrash erases it. This revert-rate accounting is the pipeline-wide **kill-switch for every downgraded lane**, not just these two: any haiku/sonnet lane whose output the reviewer above it keeps rewriting gets the same treatment — track it, and when it crosses the bar, promote that lane back to the stronger model and record the decision.
