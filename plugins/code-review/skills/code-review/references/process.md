# Process — Multi-Pass Review Pipeline

This is the full, expanded definition of the six-phase pipeline that the main `SKILL.md` summarizes. The phases are ordered. Do not skip ahead. Each phase has a defined exit condition.

The pipeline is adapted from the everything-claude-code `code-reviewer` agent (8-phase orchestration) and the verification-loop skill, with two structural changes that have been validated against real review postmortems:

1. **Sharding** (Phase 2.5) for large diffs, because single-context coverage degrades sharply past ~20 files.
2. **Independent verifier fan-out** (Phase 4), because the same agent that pattern-matched a candidate is the wrong agent to evaluate whether it's real (confirmation bias).

---

## Phase 1 — Context Gathering

**Goal:** Understand what changed, why, and how it integrates with the rest of the codebase.

### Steps

1. **Identify the diff.**
   - PR mode: `gh pr view <ref> --json title,body,files,baseRefName,headRefName,mergeStateStatus,statusCheckRollup` then `gh pr diff <ref>`.
   - Local mode: `git status`, `git diff --staged`, `git diff`. Combine staged + unstaged.
   - Branch-range mode: if the user names a base (e.g. "review feature-x against main"), use `git diff main...HEAD`.

2. **Capture diff size signals** that drive Phase 2.5.
   - `fileCount` — `git diff --name-only <range> | wc -l`.
   - `locDelta` — sum of insertions + deletions from `git diff --shortstat <range>`.

3. **Check CI is green** (PR mode only). If `mergeStateStatus` is `BLOCKED` due to failing required checks, surface this and ask the user whether to proceed.

4. **Read whole files.** For every file with non-trivial changes (>5 lines or any structural change), use `Read` to load the entire file. (In sharded mode this work is delegated to the shard agents — but the main context still needs to read 1–2 representative files to ground the routing decision.)

5. **Trace usages of changed exports.** For every modified exported symbol, run `Grep` for its name across the repo. Three patterns to watch:
   - **Behavioral break:** a call site relies on the old behavior of a changed function.
   - **Type break:** a call site relies on the old return type / parameter shape.
   - **New caller of a scope-incomplete helper:** see `logic-bugs-checklist.md` §2.2.

6. **Confirm test coverage exists.** `Glob` for sibling test files (`*.spec.ts`, `*.test.ts`, `*.e2e-spec.ts`).

7. **Read repo-level conventions.** `Read CLAUDE.md` (or `AGENTS.md`, `CONVENTIONS.md`, `.cursorrules`) at repo root if present. Adapt your standards to match the project.

8. **Read `package.json`** to determine framework versions.

### Exit condition

You can answer, for each modified file *area*, what changed and why. You have `fileCount` and `locDelta` for the routing decision. You haven't yet committed to either single-context or sharded execution.

---

## Phase 2 — Routing

**Goal:** Load **only the checklists that match the diff**, to avoid the "interference patterns" observed in monolithic prompts (Arbiter, Mason 2026).

### Routing matrix

```
File pattern                                              → Reference to load
────────────────────────────────────────────────────────────────────────────────
*.controller.ts | *.service.ts | *.module.ts |          → nestjs-checklist.md
  *.guard.ts | *.pipe.ts | *.interceptor.ts |
  *.filter.ts | *.dto.ts | *.entity.ts |
  app.module.ts | main.ts                                   (NestJS)

app/**/*.{ts,tsx} | pages/**/*.{ts,tsx} |               → nextjs-checklist.md
  middleware.ts | proxy.ts | route.ts |
  files containing 'use server' or 'use client' |
  next.config.{js,mjs,ts}                                   (Next.js + React)

Any *.ts | *.tsx                                         → typescript-checklist.md
                                                            (always-on cross-cutting)

Touches auth, sessions, cookies, JWT, bcrypt/argon2,    → security-checklist.md
  env vars, SQL/ORM queries with user input,
  file uploads, deserialization, redirects,
  public POST endpoints, headers, CSP, CORS

Any backend service / controller that mutates state,    → logic-bugs-checklist.md
  consumes LLM output, runs in cron / queue worker,         (default-on for backend)
  performs per-tenant queries, coordinates external syncs

Always                                                   → output-format.md
                                                            (taxonomy + schema)
```

If the diff touches none of the patterns above, you are likely outside the skill's scope (e.g., a pure config/CI/markdown change). Confirm with the user whether to proceed.

### Exit condition

The exact set of reference files you have loaded matches the file patterns in the diff. No reference files are loaded "for completeness".

---

## Phase 2.5 — Sharding

**Goal:** When a diff is too large for one context to walk faithfully, split the Find work across parallel agents that each own a manageable subset of the diff.

### Trigger condition

Skip this phase if the diff is small. Single-context Find (Phase 3) is faster and simpler when it fits.

```
fileCount  ≥ 30   OR  locDelta ≥ 2000   →   shard
otherwise                                →   skip Phase 2.5, go to Phase 3
```

These thresholds are calibrated against real reviews — the failure mode being avoided is what the postmortem after the staging-vs-main review showed: a 200-file / 25k-LoC diff produced only 2 of ~10+ real findings because most files were never read.

### Bucketing

Group the changed files into 3–8 buckets. Each bucket should be:

- **Small enough** for one shard agent to walk: ~10–25 files, ideally < 5k LoC.
- **Cohesive enough** that the agent can reason across the bucket without needing files from other buckets.

Recommended axes (in order of preference):

1. **Domain.** Group by product feature: `auth`, `oauth-and-calendar`, `surveys`, `regulatory`, `inbox`, `ai-and-llm-handling`, `cron-and-queues`, `bff-routes`. Best for product-feature diffs.
2. **Layer.** Group by `apps/api/*`, `apps/web/*`, `libs/*`. Best when the diff touches an even slice across many features (e.g. a refactor or framework upgrade).
3. **Risk class.** `auth-touching`, `state-mutating`, `read-only`, `pure-config`. Best when one PR mixes obvious-low-risk refactors (rename, formatting) with a small high-risk change.

### Balance

Target ~15 files per bucket when file count permits. After initial grouping, if any bucket is ≥ 2× the median bucket size, split it along a secondary axis (e.g. a `surveys` bucket of 25 splits into `surveys-backend` / `surveys-frontend`). Conversely, merge any bucket with fewer than 3 files into the closest neighbor. Wall-clock is determined by the slowest shard — balance matters more than minimizing bucket count.

### Working directory

Pick a stable run id (`date +%Y%m%d-%H%M%S` or the PR number). The orchestrator (you) creates `${CLAUDE_PROJECT_DIR}/.code-review/<run-id>/` **once, before dispatching any shards**, via `Bash mkdir -p`. Shard agents must NOT re-`mkdir` — the directory already exists when they run, and a duplicate `mkdir -p` inside each shard prompt burns permission prompts. The shard prompt template below deliberately omits any `mkdir` instruction.

The directory stores:

> **One-time setup:** the first run after plugin install will prompt for `Write` (and potentially `Bash(mkdir -p ...)`) permissions. Tell the user to add `"Write(.code-review/**)"` and `"Bash(mkdir -p .code-review/**)"` to `.claude/settings.local.json` (and add `.code-review/` to `.gitignore`) so subsequent runs don't re-prompt. See SKILL.md → "First-run setup".


- `candidates-<bucket>.jsonl` — one file **per shard**, written exclusively by that shard's agent. This is how concurrent-write races are avoided: see the "Why per-shard files" note below.
- `candidates.jsonl` — produced by the orchestrator after all shards return, by concatenating the per-shard files. This is the input to Phase 4.
- `verifications.jsonl` — written by the orchestrator from verifier replies (verifiers do not touch disk; they return one JSON line per reply).
- `buckets.json` — the bucket-to-files mapping for traceability.

#### Why per-shard files (CRITICAL — do not skip)

The `Write` tool has **overwrite semantics**, not append semantics. If N parallel shard agents all `Write` to the same `candidates.jsonl`, whichever shard writes last wins and every earlier shard's findings are silently destroyed. This has happened in a live review — 5 of 8 shards' candidates vanished, with the shard agents still reporting success. Per-shard files eliminate the race by construction: each shard is the sole writer to its own path, so overwrite is harmless.

Do **not** work around this by telling shards to `Bash cat >>` the shared file. `>>` does append, but interleaved multi-line writes can still corrupt individual JSONL records when two agents are mid-write simultaneously. Per-shard files + single-threaded concatenation is the only reliable pattern.

### Shard agent prompt template

Use verbatim per shard. Dispatch via `Agent` with `subagent_type: "general-purpose"` (Write access is required to produce the per-shard JSONL; Explore is read-only).

> You are the `<bucket-name>` shard of a code-review Find pass.
>
> **Files (read each in full):**
> ```
> <absolute paths>
> ```
>
> **Diff context:**
> ```bash
> git diff <base>..<head> -- <files>
> ```
>
> **Checklists (Read each and walk every item against the files above):**
> ```
> <absolute paths to references/*.md files that match this bucket>
> ```
>
> **Output path (you are the SOLE writer — use `Write` directly, no `mkdir`):**
> `${RUN_DIR}/candidates-<bucket-name>.jsonl`
>
> The output directory already exists — the orchestrator created it before dispatching you. **Do not run `mkdir`, `ls`, or `test -d` on the output directory.** Go straight to `Write`. Running `Bash mkdir` or directory checks triggers extra permission prompts for no reason.
>
> **Candidate schema** (one JSON object per line):
> ```json
> {"id":"<bucket>-<nnn>","file":"<path>","lines":"<range>","title":"<imperative>","severity":"CRITICAL|HIGH|MEDIUM|LOW","confidence":<0-100>,"rule":"<checklist rule>","claim":"<2-3 sentences with quoted code>","fix":"<smallest diff>","shard":"<bucket>"}
> ```
>
> **Rules:**
> - Coverage mode — surface every candidate, including uncertain ones. Phase 4 filters.
> - No stylistic findings (formatting, naming case, anything ESLint/Prettier handles).
> - Consolidate identical violations across N locations into one candidate listing all N.
> - Grep to verify any symbol your `fix` names exists in the project. Findings whose fix names a nonexistent symbol get dropped at Verify.
> - No `mkdir`, no directory probing. Write directly to the path above.
>
> When done, reply with exactly: `Shard <bucket-name>: <N> candidates written to <path>`. No other prose.

### Parallel dispatch

Launch all shard agents in **a single message** containing one `Agent` tool call per bucket, each with `subagent_type: "general-purpose"`. `general-purpose` is required because shards must `Write` their per-shard JSONL; Explore is read-only. They run concurrently. Each is given a distinct `candidates-<bucket>.jsonl` path. Wait for all to return before proceeding to Merge.

### Merge

Once all shards have returned, the orchestrator assembles the shared `candidates.jsonl` by concatenating the per-shard files — single-threaded, no race:

```bash
cat .code-review/<run-id>/candidates-*.jsonl \
  > .code-review/<run-id>/candidates.jsonl
```

### Dedupe (required, before Phase 4)

Collapse candidates that violate the same rule in the same file into one consolidated candidate. Run exactly this:

```bash
jq -s '
  group_by(.file + "|" + .rule)
  | map(
      if length == 1 then .[0]
      else (.[0] + { lines: (map(.lines) | join(", ")), consolidated_from: [.[].id] })
      end
    )
  | .[]
' "${RUN_DIR}/candidates.jsonl" | jq -c . > "${RUN_DIR}/candidates.deduped.jsonl"
mv "${RUN_DIR}/candidates.deduped.jsonl" "${RUN_DIR}/candidates.jsonl"
```

Dedup is NOT optional — skipping it inflates the verification budget and produces reports with near-duplicate adjacent findings. If two shards independently found the same bug, this merge is where they collapse.

### Sanity check (do not skip)

For each shard, compare the agent's reply count against the line count of its per-shard file:

```bash
wc -l .code-review/<run-id>/candidates-*.jsonl
```

```bash
# Validate every line is parseable JSON. Bash `while read -r line` mangles backslash-escaped
# characters in JSON strings and produces false "invalid" reports. Use jq as the single
# source of truth.
for f in "${RUN_DIR}"/candidates-*.jsonl; do
  jq -c . "$f" > /dev/null || { echo "Malformed JSON in $f"; exit 1; }
done
```

If `jq` is not installed, `python3 -c "import json; [json.loads(l) for l in open('file')]"` is the acceptable fallback — loop it over each per-shard file and fail on the first exception.

If a shard reported `N candidates written` but the file is missing or has fewer than `N` lines, re-dispatch just that shard. Common causes:
- The agent decided it was read-only and returned JSONL inline instead of writing the file. Re-dispatch with an explicit reminder that it has `Write` access to its per-shard path.
- The agent wrote malformed JSON. The `jq -c .` loop above is the single source of truth; any line that fails parse should be re-requested from the same shard.
- The merged `candidates.jsonl` line count does not equal the sum of per-shard line counts. This signals a silent truncation during `cat` (e.g., filename glob missed a file) — inspect and re-merge explicitly.

### Exit condition

`candidates.jsonl` exists, its line count equals the sum of per-shard counts reported by the shard agents (minus any dedup merges), and every line parses as JSON. The orchestrator (you) has not read any source files for the bucket contents — that work was delegated.

---

## Phase 3 — Find (single-context, only when Phase 2.5 was skipped)

**Goal:** Generate the complete candidate list directly, without sharding.

### Method

For each loaded checklist:

1. Search the diff for the patterns the checklist targets.
2. For every match — including uncertain ones — append a candidate row to `candidates.jsonl` using the schema in Phase 2.5.
3. Do not pre-filter on confidence. Phase 5 (Gate 0) is the dedicated filter; it runs after the verifier fan-out has had a chance to refute or confirm each candidate.

### Hard rules during Find

- **No stylistic findings.** Per Mandate #2.
- **No findings in unchanged code** unless covered by Mandate #3.
- **Consolidate.** Per Mandate #4.
- **One finding, one fix.** If the same line has three distinct problems, three findings — but each must have its own fix snippet.

### Exit condition

`candidates.jsonl` exists and contains every candidate. The list is on disk; nothing has been written to the user-facing report yet.

---

## Phase 4 — Verify (independent verifier fan-out)

**Goal:** Independently refute or confirm each candidate, without relying on the agent that proposed it. This is where hallucinated findings get caught.

### Method

Read `candidates.jsonl`. For each row, dispatch a separate `Agent` (general-purpose) with the prompt template below. Run in **batches of 5–8 concurrent verifiers** — multiple `Agent` tool uses in the same message — so subagent quota doesn't deadlock and so each batch's results are visible before the next batch launches.

### Verifier agent prompt template

Use this verbatim per candidate, filling in the bracketed fields:

> **You are a code-review verifier. Your job is to refute or confirm one specific finding, from a fresh context, with no prior knowledge of why it was raised.**
>
> **Candidate finding:**
> ```json
> <single JSON line from candidates.jsonl>
> ```
>
> **Procedure (run each gate in order; the first gate that fails determines your verdict):**
>
> 1. **Gate 1 — API existence.** If the proposed `fix` names a function, type, hook, decorator, import path, or package, `Grep` for it across the project. If it doesn't exist with the proposed signature in the project source or in a dependency declared in `package.json`, the fix is hallucinated — set `status: refuted` with `evidence` citing the failed grep.
> 2. **Gate 2 — Version compatibility.** If the `claim` cites framework behavior (e.g. "must `await cookies()`"), confirm `package.json` pins a version that supports it. If not, refute or downgrade.
> 3. **Gate 3 — Out-of-hunk satisfaction.** Use `Read` to load the entire file at `<file>`, not just the cited lines. The thing the finder thought was missing is frequently 30 lines above the hunk, in `main.ts`, in a parent layout, or on a base class. If the missing element is satisfied elsewhere, refute.
> 4. **Gate 4 — Proportionality.** If the proposed `fix` is dramatically larger than the change being reviewed (introduces a new abstraction, renames many files, requires a new dependency), downgrade `final_severity` and rewrite the fix smaller, but do not refute on this gate alone.
>
> **Active refutation, not passive confirmation.** Try to find a reason this finding is wrong. Look for the validation 30 lines up, the guard one decorator level up, the import that already exists. Confirmation is the answer when you have actively looked for the refutation and failed to find it.
>
> **Output one JSON line, exactly this shape, on a line by itself in your final reply:**
> ```json
> {
>   "id": "<id from input>",
>   "status": "confirmed|refuted|needs-info",
>   "evidence": "<1-3 sentences, cite file:line of what you checked>",
>   "final_severity": "CRITICAL|HIGH|MEDIUM|LOW",
>   "final_confidence": <0-100>,
>   "fix_verified": <true|false>
> }
> ```
>
> Use `needs-info` only when you cannot determine confirmation/refutation without knowledge outside the repo (e.g. "depends on what `RESEND_RATE_LIMIT` is set to in production"). Do not use it as a hedge.

### Batched verification (optional)

For related candidates in the same file (e.g. three findings in the same controller), a single verifier call may examine all of them at once, amortizing the file-read cost. When batching:

- Pass ALL candidate JSON lines in the verifier prompt (not just ids).
- The verifier MUST return one JSON line per candidate, in the same order, separated by newlines (valid NDJSON).
- The orchestrator appends all N lines to `verifications.jsonl` in order.
- Cap batch size at 4 candidates per verifier — larger batches lose the fresh-context benefit.

Do NOT batch candidates across different files, or candidates at different severity tiers — each verifier's "active refutation" mindset is calibrated per-candidate, and mixing contexts dilutes it.

### Result handling

Verifiers **return** their single JSON line in their reply; they do not write to disk. The **orchestrator** (you) collects each batch's replies and appends them to `verifications.jsonl` single-threaded — that way there is no concurrent-write race, unlike Phase 2.5 where the shard agents themselves write files. After all batches finish, merge `verifications.jsonl` back into `candidates.jsonl` (e.g. with a quick `jq` join keyed on `id`) so each candidate has its `status`, `final_severity`, `final_confidence`, and `evidence` fields.

### Exit condition

Every candidate has a corresponding verification row. No candidate is missing a verdict.

---

## Phase 5 — Final filter (Gate 0)

**Goal:** Apply the confidence threshold *after* verification has had its say.

### Method

For each candidate in the merged `candidates.jsonl`:

- **Drop** any with `status: refuted`.
- **Drop** any with `status: confirmed` but `final_confidence < 70` for `CRITICAL`/`HIGH`, or `final_confidence < 85` for `MEDIUM`/`LOW`.
- **Keep** `status: needs-info` only when `final_severity` is `CRITICAL` AND `final_confidence ≥ 60`. Surface as a single MEDIUM-severity "Verifier could not confirm" finding listing the relevant locations, so the human reviewer knows where to look.

This is the *only* place confidence filtering happens. Earlier filtering (during Find) caused real bugs to be silently dropped — the staging-vs-main review surfaced this failure mode directly.

### Exit condition

A list of survivors, ready for the report.

---

## Phase 6 — Report

**Goal:** Emit a structured report that a human can triage in under 60 seconds.

### Method

Use the exact format from `references/output-format.md`. Briefly:

1. Emit the optional PR header (PR mode only).
2. Emit the verification stats line:
   ```
   Find: <total> candidates · Verify: <confirmed> confirmed · <refuted> refuted · <needs-info> needs-info
   ```
3. Emit each surviving finding using the `### [SEVERITY] …` schema.
4. Order findings by severity, then by file path.
5. End with exactly one verdict line.

Do **not** add a Summary, Closing Thoughts, or Recommendations section after the verdict.

### Exit condition

The report is in the user-facing output. The intermediate `candidates.jsonl` / `verifications.jsonl` remain on disk for traceability and post-hoc analysis.
