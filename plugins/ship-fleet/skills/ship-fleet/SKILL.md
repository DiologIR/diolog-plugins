---
name: ship-fleet
description: Backlog-wide feature-delivery orchestrator — surveys ALL remaining feature work in a repo and ships it. Reads the pipeline artifacts (LEDGER.md, specs, plans, untriaged briefs, mocks, deep research, DESIGN md) and in-progress worktrees, writes ORCHESTRATOR.md (plan + ledger) and orchestrator-hierarchy.html BEFORE any work starts, then runs ship-feature per feature: dependency-ordered, up to 8 concurrent Opus runners, merges serialized. Use when someone wants EVERYTHING remaining shipped — "orchestrate the remaining work", "ship everything left in the backlog", "survey what's left and set up the plan", "create an orchestrator / ledger for all remaining features", "work through the backlog N features at a time", "resume the orchestrator", "run the fleet" — even if they never say "orchestrator". Also use for "what work remains / is deferred / is blocked" across the pipeline — the survey + ORCHESTRATOR.md IS that answer. NOT for a single feature (use ship-feature) or a single stage (use that stage's skill).
---

# Ship Fleet — backlog-wide feature orchestrator

Take **everything that remains** in a product repo's feature pipeline and drive it to merged, tested, production code. You are the **orchestrator**: you survey the pipeline, build one durable plan-and-ledger (`ORCHESTRATOR.md`), and then conduct up to **8 concurrent** `ship-feature` runs in dependency order — verifying, merging, and updating the ledger as each lands. One feature = one `ship-feature` run; your job is everything *between* the runs.

```
preflight        check/repair the repo's pipeline conventions (with the user)
  → survey       classify every piece of remaining/deferred/untriaged work + dependencies
  → hygiene      review existing worktrees & ai/* branches (resume / finalize / clean)
  → artifacts    write ORCHESTRATOR.md + orchestrator-hierarchy.html   ← BEFORE any execution
  → pre-triage   serially triage untriaged briefs (LEDGER id allocation is a shared write)
  → fleet        dependency-ordered ship-feature runs, ≤8 slots, Opus runners,
                 lane-routed subagents + external coding lanes (codex gpt-5.6-sol
                 medium, else composer-2.5 / glm-5.2), out-of-family codex max
                 review gates, serialized merges, ledger updated after every event
```

Everything is **discovered inside the project — never hardcode absolute paths**. The conventional layout (the common case, e.g. a repo set up like motif-studio):

| Artifact | Conventional location | If not there |
|---|---|---|
| Spec ledger | `docs/features-to-triage/LEDGER.md` (older repos: `docs/feature-specs/LEDGER.md`) | Glob `**/LEDGER.md`, ignore worktrees/node_modules |
| Triaged specs | `docs/specs/spec-<ID>.md` | Glob `**/spec-*.md` |
| Implementation plans | `docs/plans/plan-<ID>.md` | Glob `**/plan-*.md` |
| Untriaged feature briefs | `docs/features-to-triage/*.md` (excluding LEDGER.md) | Preflight offers to gather strays here |
| Refined HTML mocks | `design/mocks/html/` | Glob for standalone mock `*.html` under `design/` |
| Deep research | `docs/deep-research/*.md` | — |
| Design language | `DESIGN*.md` in the **project root** | — |
| Best practices | `docs/CODING_PRACTICES.md`, `docs/NEW_PROJECT_BEST_PRACTICES.md` | Preflight offers to copy from diolog-team-files |
| Worktrees | `.worktrees/<ID>` on branches `ai/<id>` | `git worktree list` is authoritative |

## Operating discipline

- **You stay in-session, on the session model.** The orchestrating context (you) holds the whole map. Runner agents get Opus at `effort: 'high'` — launched ONLY through the verified single-agent-Workflow lane in `references/scheduling-and-concurrency.md` ("Launching runners — verified model routing"), never as direct background Agent calls, whose model override has been observed not to stick and whose effort defaults to xhigh. Below the runner top level, subagents route per the lane table in "Model routing" (runners propagate it downward); the external coding lanes are Codex `gpt-5.6-sol` at `medium` (the default), then Cursor `composer-2.5` and `glm-5.2` via the zero CLI, and three review gates route out of family to Codex at `max`. Never hand the *orchestration itself* to a subagent.
- **`ORCHESTRATOR.md` is the memory, not the transcript.** Update it after every state change (run started, run landed, merge done, item blocked, new deferred child discovered). A fresh session must be able to resume the whole fleet from that file alone. If your context is compacted, re-read `ORCHESTRATOR.md`, the root DESIGN md, and the ledger before doing anything else.
- **Plan before execution.** `ORCHESTRATOR.md` and `orchestrator-hierarchy.html` are written, shown to the user, and committed **before** the first fleet slot starts.
- **Dependencies rule the schedule.** An item never starts before the items it depends on have **merged** (not merely finished). Distinguish *internal* dependencies (on other queued items — these order the DAG) from *external* ones (a person, credential, or third-party service — these flag the item and skip it, they never stall the rest of the fleet).
- **Never destroy unmerged work.** Worktree/branch cleanup only removes what is provably merged or empty; anything with unique commits is queued for resume or surfaced to the user.
- **Report thinly; keep the artifacts terse.** One line before a phase starts saying what you're about to do, an update only when something material lands or the plan changes, outcome first at the close — not a narration of a fleet the user is already watching. `ORCHESTRATOR.md` is a resumable state file (rows, statuses, dependencies), never prose, and the same length discipline binds every spec, plan, and progress note the fleet produces (`feature-spec-pipeline/skills/work/references/model-and-effort.md` §7).

## Phase 0 — Preflight: check and repair the conventions (with the user)

Before surveying, verify the repo is actually *set up* for this pipeline. This phase is interactive — report what's missing and **ask before changing anything** (AskUserQuestion works well here). Read `references/preflight.md` for the full checklist and repair offers. In brief:

1. **Structure check.** Confirm each row of the table above resolves to something real. Report every missing directory/file plainly, and offer to create the missing skeleton (`docs/specs/`, `docs/plans/`, `docs/features-to-triage/` + a fresh LEDGER.md, `design/mocks/html/`, `docs/deep-research/`).
2. **Best-practices docs.** If `docs/CODING_PRACTICES.md` or `docs/NEW_PROJECT_BEST_PRACTICES.md` is missing, offer to clone `https://github.com/Diolog26/diolog-team-files` to `~/Dev/diolog-team-files` (or `git pull` if already cloned) and copy those two files into the project's `docs/`. Copy **only** those files — never seed `docs/specs/` or `docs/plans/` from anywhere; those directories belong to the triage and plan skills.
3. **Stray feature briefs.** Feature-shaped markdown lying around the repo (root, `docs/`, `notes/` …) that isn't a spec, plan, or other pipeline artifact: list what you found and why it looks like a feature brief, and offer to move it into `docs/features-to-triage/`.
4. **Monolith layout check.** Read the project-layout section of the repo's own `docs/NEW_PROJECT_BEST_PRACTICES.md` (§3 single-app layout; §17 if it's a monorepo) and verify the codebase conforms. Report deviations; only restructure if the user asks.

If a required piece stays missing after the user declines the repair (no DESIGN md, no ledger), say clearly what that degrades and continue with what exists.

## Phase 1 — Survey: classify every piece of remaining work

Fan out with the Workflow tool (see `references/scheduling-and-concurrency.md` for the fan-out shape and prompts). The survey must answer, for the entire pipeline:

- **Done** — merged; nothing to do (audit trail only).
- **Resumable** — In Progress / In Review specs, especially those with a live worktree.
- **Ready for Work** — spec + plan exist, not built.
- **Ready for Plan** — spec exists, no plan. (`ship-feature` runs plan in-run; no separate pass needed.)
- **Untriaged** — briefs in `docs/features-to-triage/` with no spec, plus anything preflight gathered.
- **Deferred follow-ups** — mined from spec **progress/deferred sections** and ledger notes ("deferred", "Next tier", "follow-up", "phase 2"). Each becomes a child work item pointing at its parent spec.
- **Design-preview refresh** — for each mock in `design/mocks/html/`, compare against the design-system app preview's current representation of that feature. Mock more refined / divergent → a work item: feed the mock into the feature's `ship-feature` design stage if the feature is still unbuilt, or queue a standalone refresh task if the feature already shipped but the preview lags.
- **Needs input** — specs marked Needs More Info, or items with external dependencies. Record the question; don't block the fleet on it.

For every item also extract: **dependencies** (explicit "depends on / blocked by / after <ID>" mentions, parent↔child spec links, shared-subsystem overlap), matched **deep-research docs** (title/topic match against `docs/deep-research/` — record filenames per item), and matched **mock** (filename ↔ feature match).

## Phase 2 — Worktree & branch hygiene

`git worktree list` + `git branch --list 'ai/*'`. For each existing worktree/branch, in order:

1. Read its spec's progress section and `git log/diff` vs the integration branch.
2. **Complete and green** (spec says done, gates pass) → queue for **finalize only** (rebase → merge → clean up), serialized like all merges.
3. **Partial with real work** → mark the item *Resumable in `.worktrees/<ID>`* — its fleet run resumes in that worktree on that branch rather than starting fresh.
4. **Empty or fully merged** → remove the worktree, delete the branch only if `git branch --merged` proves it.
5. **Ambiguous** → surface to the user in the preflight/hygiene report; never guess-delete.

## Phase 3 — Write the orchestrator artifacts (before any execution)

Write, show to the user, and commit:

- **`ORCHESTRATOR.md`** at the project root — the combined plan + ledger. Format in `references/orchestrator-artifacts.md`: a header contract (how to resume, the routing/concurrency rules), the dependency-ordered **wave plan**, and the **ledger table** (one row per item: id, title, category, dependencies, deep-research docs, mock, model lane, status, worktree/branch, outcome). This file is the single source of truth for the fleet.
- **`orchestrator-hierarchy.html`** at the project root — a self-contained (no external assets) visual hierarchy of all remaining work: waves top-to-bottom, dependency edges, category and status colouring, lane annotations. Spec in the same reference. Refresh its status colouring at wave boundaries.

Compute waves from the internal-dependency DAG (topological order; cycles → merge the cycle into one combined run or ask the user). Items with only external dependencies go in a flagged holding pen, not a wave.

## Phase 4 — Serial pre-triage

Triage every untriaged item **serially, before the fleet fans out** (invoke the triage skill per brief, or let the first stage of its `ship-feature` run do it — but never two triages at once): id allocation in `LEDGER.md` is a read-modify-write on a shared file, and 8 concurrent runners racing it will corrupt the ledger. After pre-triage, every fleet item has a spec id. Runners that later create *child* specs (deferred-work loop) must follow the ledger lock rule in `references/scheduling-and-concurrency.md`.

## Phase 5 — Run the fleet

Up to **8 slots**. Fill a slot with the highest-value ready item (all internal deps merged); when a slot frees, refill immediately — don't barrier on whole waves when the DAG allows overlap. The Workflow-based slot scheduler (a ready-queue + `Promise.race` refill loop) is sketched in `references/scheduling-and-concurrency.md`.

**Each slot = one runner agent (Opus at high effort, via the verified workflow lane — see the scheduling reference; verify the model on the wire from each runner's transcript, don't trust the launch parameters)** whose prompt tells it to invoke the `ship-feature` skill on its item and hand back a structured report. The runner prompt template (verbatim base, in the scheduling reference) always includes a first-action model self-check and the lane-routing propagation block, plus:

- The item: its brief/spec/plan paths, resume state (existing worktree/branch if any), and the matched mock path as `ship-feature`'s mock input.
- **The context contract** (below) — including the instruction that when relevant deep research exists for the feature, the agent must read the **entire** deep-research document, not skim it.
- **Stop before merge.** Runners run `ship-feature` through acceptance-e2e-green but do **not** finalize. They report *ready-to-merge* (branch, worktree, gates evidence, deferred children discovered). **You** serialize finalization: one branch at a time — rebase onto the integration branch, run the pre-merge gate, merge, push per repo convention, clean up the worktree, update `ORCHESTRATOR.md` and the hierarchy HTML. Two simultaneous merges into one integration branch is how fleets corrupt repos.
- **Shared-surface rules** (ledger lock, design-system shared files, docs tree) — see the scheduling reference.

After every runner event (started, ready-to-merge, merged, failed, blocked): update `ORCHESTRATOR.md` first, then act. On a runner failure, read its report and the on-disk artifacts, decide — retry with sharper instructions, resume in its worktree, or park as blocked with a reason in the ledger. Newly discovered deferred children join the DAG and the ledger; they run on the parent's branch per `ship-feature`'s own rules if the parent is still open, else as new items.

At the end: every item merged / parked-with-reason, `ORCHESTRATOR.md` statuses final, hierarchy HTML refreshed, needs-input items presented to the user as a single consolidated question list.

## Model routing

The pipeline's verification is back-loaded (work Phase D/E, adversarial verify, completeness critic, double-dry loop, e2e green-twice, fail-closed merge), which makes mid-pipeline downgrades safe — so runners **propagate the lane table below** into everything they spawn instead of pinning everything to Opus. The runner *top level* stays Opus-at-high via the verified workflow lane, unchanged.

| Role / lane | Model | Why |
|---|---|---|
| Orchestrator (this session) | the session model | Holds the map; makes judgment calls; cheap per-token share |
| Fleet runners (top level) | **Opus** (`{model: 'opus', effort: 'high'}` via the workflow lane; self-check + transcript-verified) | The per-feature conductor judgment |
| Leaf readers + gate-runners (survey leaves, triage grounding, work Phase A readers, typecheck/lint gate subagents) | **Haiku** | Read-and-report work; the stronger synthesis/review above catches misses |
| Evidence lenses (work Phase D UI-fidelity / clause-table / reachability), adversarial finding-verifiers, e2e Phases 0–4, design-craft leaf verifiers + page assembly from existing composites, triage Sentinel verdict + Assumptions (with the assumptions gate), plan synthesis Trivial/Small | **Sonnet** | Structured, oracle-checked work under a stronger reviewer. Sonnet ≈ 80% of Opus cost per task (it spends more tokens) — pick it for adequacy, not savings |
| Mechanical work Phase B/E implementation slices meeting the delegation criteria | **codex `gpt-5.6-sol` at `medium`** (the default executor), else **composer-2.5** (Cursor CLI, ~$0.12/task) or **glm-5.2 high** (zero CLI, ~$0.35/task) | Executor lanes — always under the Opus verify-fix loop + per-lane kill-switch. Codex carries the post-compaction re-context harness, so long slices don't drift off the spec |
| **The three out-of-family gates: the triage spec review · the plan review gate · work Phase D's completeness critic** | **codex `gpt-5.6-sol` at `max`, read-only** | Sideways, not down: every other reviewer here is Claude auditing Claude, and an author-judged oracle is how a family's blind spot ships green |
| Plan synthesis, Standard tier | **Opus** (or glm-5.2-high + the plan skill's mandatory plan-review gate) | The plan is the pipeline's highest-leverage trusted-first-output artifact |
| Plan synthesis Large · work Phase A build-spec/checklist synthesis · Phase C rebase conflicts · security/guardrails/client-asserted-identity lenses · gap-fix audit over cheap-lane code · e2e Phase 5 stabilization judgment + Phase 6 product fixes · design-craft aesthetic direction + new composites · merge/finalize/conflict resolution · deferred-loop B-vs-C classification · fleet DAG/arbitration | **Opus — never downgrade** | Trusted-first-output or judgment work; a miss here amplifies downstream |

**Effort is the second dial, and the table above names only the first.** An agent spawned without an explicit `effort` runs at `high` — right for judgement, over-spent on a leaf reader. Per-lane levels, the "drop a review lane's effort rather than its model" rule, the `xhigh` + 64k-`max_tokens` pairing for long-horizon runners, and the hold-it-constant-per-agent cache rule are canonical in `feature-spec-pipeline/skills/work/references/model-and-effort.md`. Read it before routing, and propagate effort alongside model into every runner prompt.

Three invariants bind every lane: (1) **REVIEWER ≥ WRITER** — for every artifact the strongest reviewer is at least as strong as the strongest model that wrote it; (2) every downgraded lane carries the **per-lane revert-rate kill-switch** (`references/cursor-composer.md` §"Accounting honesty"); (3) every routed lane reuses the **wire-level model verification** — first-action self-check + transcript grep — because launch parameters have been observed not to stick (scheduling reference, rules 3–4).

The executor lanes are an *optimization with an Opus fallback, never a requirement or a dependency*: use one only where it plausibly saves Opus tokens net of verification (well-specified, file-scoped edits the plan already decided), and on ANY lane failure — binary missing, not logged in, key/gateway error, wrong model on the wire, repeated CLI errors, kill-switch tripped — the work routes back to Opus, never to a sibling cheap lane, never silently skipped. Rules, delegation criteria, exact invocations, the verify-fix loop, and the fallback rule are in `references/cursor-composer.md` (Codex's own mechanics, including the post-compaction re-context harness, are in `feature-spec-pipeline/skills/work/references/codex-cli.md`). If in doubt, Opus writes the code.

**The Codex `max` gate row is not a cost lane and does not follow those economics.** It buys *independence*, not savings: three checks — the triage spec review, the plan review gate, and work Phase D's completeness critic — route out of Claude's family precisely because a same-family reviewer shares the blind spot that let the defect through. They are **mandatory where Codex is available and the repo has not opted out**, exempt from the kill-switch (a reviewer that keeps finding real defects is working, not thrashing), and their fallback is a **logged downgrade in the artifact**, never a silent pass.

**Every Codex call is data egress, and that makes the lane opt-out-able per repo.** `-s read-only` restricts writes, not the network: the reviewer transmits the artifact and every source file it opens to OpenAI, which on a security feature is exactly the code you'd least want to send. The lane is therefore **on by default, off for any repo whose `CLAUDE.md` / `AGENTS.md` / `ORCHESTRATOR.md` carries `ANTHROPIC-ONLY`, `NO EXTERNAL MODEL CLIS`, or `external-model-clis: off`** — in which case every role runs in-family and logs `codex: opted out`, which is a **correct** run needing no escalation. Check the opt-out at fleet start (`references/preflight.md`), record it in ORCHESTRATOR.md, and instruct runners to **re-grep it before every single Codex call**: a fleet cannot message its own in-flight workflow agents, so that file is the only kill-switch reaching runners already in motion. Availability — a missing binary, no login, a usage or rate limit, an empty output file, a fired deadline — is the other licensed reason to fall back.

## The context contract (every agent, every lane)

Every agent that touches a feature — Opus runners, every subagent `ship-feature` fans out (whatever its lane), and every external-executor invocation (`codex` / `composer-2.5` / `glm-5.2`) — must be given, by path, and told to read:

1. The feature's **brief** (its `docs/features-to-triage/*.md` file, when it has one) and **`docs/specs/spec-<ID>.md`** and **`docs/plans/plan-<ID>.md`** (as they come to exist).
2. The **root DESIGN md** — the design language authority for anything UI.
3. **`docs/CODING_PRACTICES.md`** and **`docs/NEW_PROJECT_BEST_PRACTICES.md`** — the engineering rules.
4. The item's matched **deep-research doc(s)** from `docs/deep-research/` — read **in full**, start to finish; they exist precisely to inform this feature's decisions.

**Compaction rule (bake it into every prompt):** after any context compaction/summarization, re-read the brief, `spec-<ID>.md`, `plan-<ID>.md`, and the root DESIGN md before continuing — the on-disk artifacts are the memory, not the conversation. This matters doubly for the executors (`codex` / `composer-2.5` / `glm-5.2`), whose windows compact far sooner than Opus's; every executor prompt carries the re-read instruction explicitly.

For the **Codex executor the rule is enforced mechanically, not just asked for** — an instruction to re-read is only as good as the executor's willingness to obey it after its memory of the instruction has itself been summarised. A generated `PostCompact` + `PostToolUse` hook pair in the worktree re-injects `spec-<ID>.md` and `plan-<ID>.md` **verbatim** within one tool call of every compaction, so the authoritative text returns as context the model never had to choose to fetch. Install and self-test it before the first delegation; the generator and its wire-format gotcha are in `feature-spec-pipeline/skills/work/references/codex-cli.md` §"The re-context harness".

## Resuming

If `ORCHESTRATOR.md` already exists: **do not re-survey from scratch and never write a second orchestrator file.** Read it, reconcile it against reality (ledger/spec statuses, `git worktree list`, merged branches — things move while you're away), correct drifted rows, then continue at Phase 5 (or the earliest phase whose output is missing). Preflight repairs re-run only if the structure check fails.

## Guardrails

- Respect `ship-feature`'s own gates — you never merge a branch whose pre-merge gate hasn't passed, and you follow the repo's push convention (some repos keep `main` local-only).
- Budget honestly: 8 concurrent `ship-feature` runs is a very large amount of work. Confirm the fleet size and the go-ahead with the user after presenting `ORCHESTRATOR.md`, before the first slot starts.
- Report failures as failures in the ledger — a parked item with a reason beats a fake green.
