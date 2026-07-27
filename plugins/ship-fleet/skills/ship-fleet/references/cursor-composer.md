# The external-executor coding lanes — Codex, Cursor composer-2.5 & GLM-5.2 (zero CLI)

An **optional cost optimization**: delegate mechanical, plan-scoped code writing to an external executor, and spend Opus only on verification and fixes. The rules below are shared by every lane; what differs is which binary you call.

**The default lane is Codex running `gpt-5.6-sol` at `medium` reasoning effort.** It is the one to reach for first: it carries the post-compaction re-context harness (a hook pair that re-injects the spec and plan verbatim after every compaction), so a long slice can't quietly drift off its requirements the way a summarised context does. Its invocation, prompt contract, and harness live in `feature-spec-pipeline/skills/work/references/codex-cli.md` (role R3) — read that, not this file, for the Codex mechanics; this file owns the *shared* delegation criteria, verify-fix loop, fallback, and accounting rules that bind all three lanes.

The two older lanes remain available for the same class of work: the Cursor CLI running **`composer-2.5`** (~$0.12/task) and the ZERO CLI running **`glm-5.2` at high reasoning effort** via the Vercel AI Gateway (~$0.35/task). (Sonnet is *not* a cheap lane — per task it lands around 80% of Opus's cost because it spends more tokens; choose Sonnet for capability-adequacy in the review lanes, never for savings.) A lane exists to save Opus tokens **net of verification** — if a delegation doesn't plausibly clear that bar, Opus writes the code directly. Never let a lane become a correctness risk: Opus (or the gates) always validates executor output before it counts.

Codex also serves a role that is **not** a cheap lane at all and does not follow these economics: at `max` effort, read-only, it is the pipeline's out-of-family reviewer for the triage spec review, the plan review gate, and work Phase D's completeness critic. Those are mandatory-where-available verification, exempt from the kill-switch below, and governed by `codex-cli.md` roles R1/R2 — don't apply this file's cost reasoning to them.

## Availability check (once, at fleet start, per lane)

```bash
command -v codex && codex --version                      # codex lane (also gates R1/R2)
command -v cursor-agent && cursor-agent --version        # composer lane
command -v zero || test -x ~/.local/bin/zero             # glm lane (binary also via $ZERO_BIN)
```

A missing lane → note it "unavailable" in ORCHESTRATOR.md and route its work to Opus. Don't install unprompted; offer: `npm i -g @openai/codex` + `codex login` (developers.openai.com/codex/cli), `curl https://cursor.com/install -fsS | bash` (cursor.com/docs/cli), or the zero release binary (github.com/gitlawb/zero). Flags below are verified as of writing — confirm against `codex exec --help` / `cursor-agent --help` / `zero exec --help` before first use, and prefer what `--help` says over this file.

## What to delegate (and what never to)

Delegate when ALL hold — the plan has already made the decisions, the executor just types:
- The plan/spec specifies the change at file level (new component per an existing pattern, a route handler matching a template, repetitive wiring, test scaffolding from existing examples).
- The files involved fit comfortably in a 200k-token window alongside the context contract.
- Success is mechanically checkable (typecheck/tests/lint or a straightforward Opus diff-read).

Never delegate: architectural or data-model decisions; security-sensitive code of any kind — auth, **secret custody / Credential-Broker code, webhook signature verification, tenancy/authz boundaries**, payment; **maker≠checker and atomic-claim idempotency logic**; **provenance-honesty judgment calls** (what counts as live vs sample, honest degradation); **contract/`CONTRACT_VERSION` changes**; cross-cutting refactors; merge-conflict resolution; e2e debugging; anything where the plan says "investigate". And never **design work** (page assembly, composites, anything aesthetic) — the executors' design ability is weak; design leaf work routes to sonnet, design direction to Opus (see ship-feature's `design-representation.md`). Two failed verify-fix cycles on a task → take it back to Opus and note it; executor thrash costs more than it saves.

## Invocation — codex lane (the default)

See `feature-spec-pipeline/skills/work/references/codex-cli.md` §R3 for the full recipe — the invocation, the prompt contract, and the mandatory re-context harness plus its self-test. The shape, for orientation only:

```bash
cd .worktrees/<ID> && codex exec -m gpt-5.6-sol -c model_reasoning_effort="medium" \
  -s workspace-write --dangerously-bypass-hook-trust -o .codex/last-<slice>.md "<prompt>" < /dev/null
```

(`-s workspace-write` confines writes to the worktree and leaves no network, so the gates are always the caller's job; `--dangerously-bypass-hook-trust` only skips the interactive hook-trust prompt that a non-interactive run cannot answer — it does not widen the sandbox; `< /dev/null` prevents it blocking on stdin; `-o` captures the final message. Pass `-m` and the effort **explicitly** — `~/.codex/config.toml` carries the user's own defaults and a lane that silently inherits them is not the lane you specified.)

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

## The prompt contract (every lane)

The prompt must contain, verbatim paths, every time (an executor starts cold — it shares no memory with the runner):

```
Read these files completely before writing any code:
  docs/specs/spec-<ID>.md, docs/plans/plan-<ID>.md, <brief path if any>,
  <root DESIGN md> (design authority), docs/CODING_PRACTICES.md,
  docs/NEW_PROJECT_BEST_PRACTICES.md, <matched deep-research doc(s) — read IN FULL>.
Task: <the specific plan step(s), file list, and acceptance criteria>.
Follow the practices docs exactly; match surrounding code style; do not touch files
outside the listed set; do not edit shared design-system tokens/base elements.
IMPORTANT — your context window will compact on long tasks: after any compaction or
summarization, STOP and re-read spec-<ID>.md, plan-<ID>.md, the brief, and the DESIGN md
before continuing. The on-disk files are your memory, not the conversation.
```

On the composer and glm lanes that instruction is all you get, which is why it must be in every prompt — and why those lanes are the weaker choice for a long slice. An instruction to re-read is only as reliable as the executor's memory of the instruction, and that memory is exactly what compaction summarises away. **The codex lane keeps the instruction and adds a mechanical guarantee** — the hook pair in `codex-cli.md` §"The re-context harness" re-injects the spec and plan verbatim within one tool call of every compaction, so the documents come back whether or not the model chose to fetch them. Prefer it whenever a slice is long enough to compact.

Keep each invocation to one coherent plan step (one component, one route, one test file group). Many small invocations beat one sprawling session — cheaper retries, cleaner verification, less compaction.

## The verify-fix loop (Opus's half — identical for every lane)

After each executor invocation, the Opus runner:

1. `git diff` — read the whole diff. Out-of-scope files touched → revert those hunks.
2. Run the repo gates that cover the change (typecheck, affected tests, lint).
3. Judge against spec/plan/DESIGN/practices — correctness, not just compilation.
4. Small gaps → Opus fixes directly (don't round-trip trivia). Substantive gaps → one executor retry with the failure quoted. Second failure → Opus rewrites; log `codex: reverted` / `composer: reverted` / `glm: reverted` for the task.
5. Commit with the runner's normal discipline once green.

## Fallback — any lane failure routes back to Opus, always

The executor lanes are optimizations with an **Opus fallback, never a dependency the pipeline can stall on or silently skip work over**. If a lane isn't working for ANY reason — binary missing, not logged in, gateway/key error, a usage or rate limit, the wire-level model check failing (`WRONG-MODEL` / a `run_start` model mismatch), repeated CLI errors or timeouts, the codex re-context harness failing its own self-test, or the per-lane kill-switch below having tripped — the task goes **to Opus**: never to a *sibling* cheap lane (a lane that failed on quality doesn't get a stand-in carrying the same review debt), and never dropped or deferred because the cheap path was down. Log the fallback (`codex: unavailable → opus`, `composer: unavailable → opus`, etc.) so the accounting stays honest.

The same fallback discipline covers the **Codex `max` review gates**, with one difference in what it costs you: an unavailable executor lane costs tokens, but an unavailable *reviewer* costs evidence. Those gates fall back to their in-family Claude reviewers and the downgrade is recorded in the artifact and the ledger — an in-family review of in-family work is weaker proof, not equivalent proof, and an unlogged fallback is indistinguishable from a skipped gate.

## Accounting honesty (extends to every downgraded lane)

In each item's ledger Notes, record the lane outcome **per lane** (`codex: N tasks, M retries, K reverted` · `composer: N tasks, M retries, K reverted` · `glm: N tasks, M retries, K reverted` — tracked separately, never pooled), plus the gate line (`codex-review: <verdict> · N findings · A accepted / R rejected` · `codex-critic: N seed items`). If a repo's early items show an executor lane reverting more than roughly **1 task in 3**, stop using *that lane* for that repo (its work routes to Opus per the fallback rule) and note why in ORCHESTRATOR.md — the whole justification is token savings, and thrash erases it. This revert-rate accounting is the pipeline-wide **kill-switch for every downgraded lane**: any haiku/sonnet lane whose output the reviewer above it keeps rewriting gets the same treatment — track it, and when it crosses the bar, promote that lane back to the stronger model and record the decision.

The **review gates are exempt from the kill-switch** — a reviewer that keeps finding real defects is working, not thrashing, and there is no cost justification to erode. Track their *rejection* rate instead: a reviewer whose findings you reject far more often than you accept is either mis-prompted or being handed artifacts it can't ground, and both are worth fixing rather than tolerating.
