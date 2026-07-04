---
name: ship-fleet
description: Backlog-wide feature-delivery orchestrator — surveys ALL remaining feature work in a product repo and ships it. It reads the feature-spec pipeline artifacts (LEDGER.md, docs/specs/spec-*.md, docs/plans/plan-*.md, untriaged briefs in docs/features-to-triage/, refined HTML mocks in design/mocks/html, deep research in docs/deep-research/, the root DESIGN md), reviews and reconciles any in-progress worktrees, then writes ORCHESTRATOR.md (a combined plan + ledger for everything left) and orchestrator-hierarchy.html (a visual dependency hierarchy) BEFORE any work starts — and then drives the backlog to done by running the ship-feature skill per feature, dependency-ordered, up to 8 concurrent runner agents (runners on Opus, mechanical coding optionally delegated to Cursor CLI composer-2.5 with Opus verifying, the orchestrating session staying on its own model). Use this whenever someone wants to work through EVERYTHING remaining rather than one feature — "orchestrate the remaining work", "ship everything left in the backlog", "survey what's left and set up the plan", "create an orchestrator / ledger for all remaining features", "work through the backlog N features at a time", "resume the orchestrator", "run the fleet" — even if they never say the word "orchestrator". Also use it when asked what work remains / is deferred / is blocked across the spec pipeline, since the survey + ORCHESTRATOR.md IS that answer. For a single feature, use ship-feature directly instead; for a single pipeline stage, use that stage's skill.
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
                 optional Cursor composer-2.5 coding lane, serialized merges,
                 ledger updated after every event
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

- **You stay in-session, on the session model.** The orchestrating context (you) holds the whole map. Runner agents get Opus (`model: 'opus'`); the optional coding lane gets Cursor `composer-2.5`. Never hand the *orchestration itself* to a subagent.
- **`ORCHESTRATOR.md` is the memory, not the transcript.** Update it after every state change (run started, run landed, merge done, item blocked, new deferred child discovered). A fresh session must be able to resume the whole fleet from that file alone. If your context is compacted, re-read `ORCHESTRATOR.md`, the root DESIGN md, and the ledger before doing anything else.
- **Plan before execution.** `ORCHESTRATOR.md` and `orchestrator-hierarchy.html` are written, shown to the user, and committed **before** the first fleet slot starts.
- **Dependencies rule the schedule.** An item never starts before the items it depends on have **merged** (not merely finished). Distinguish *internal* dependencies (on other queued items — these order the DAG) from *external* ones (a person, credential, or third-party service — these flag the item and skip it, they never stall the rest of the fleet).
- **Never destroy unmerged work.** Worktree/branch cleanup only removes what is provably merged or empty; anything with unique commits is queued for resume or surfaced to the user.

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

**Each slot = one runner agent (Opus)** whose prompt tells it to invoke the `ship-feature` skill on its item and hand back a structured report. The runner prompt template (verbatim base, in the scheduling reference) always includes:

- The item: its brief/spec/plan paths, resume state (existing worktree/branch if any), and the matched mock path as `ship-feature`'s mock input.
- **The context contract** (below) — including the instruction that when relevant deep research exists for the feature, the agent must read the **entire** deep-research document, not skim it.
- **Stop before merge.** Runners run `ship-feature` through acceptance-e2e-green but do **not** finalize. They report *ready-to-merge* (branch, worktree, gates evidence, deferred children discovered). **You** serialize finalization: one branch at a time — rebase onto the integration branch, run the pre-merge gate, merge, push per repo convention, clean up the worktree, update `ORCHESTRATOR.md` and the hierarchy HTML. Two simultaneous merges into one integration branch is how fleets corrupt repos.
- **Shared-surface rules** (ledger lock, design-system shared files, docs tree) — see the scheduling reference.

After every runner event (started, ready-to-merge, merged, failed, blocked): update `ORCHESTRATOR.md` first, then act. On a runner failure, read its report and the on-disk artifacts, decide — retry with sharper instructions, resume in its worktree, or park as blocked with a reason in the ledger. Newly discovered deferred children join the DAG and the ledger; they run on the parent's branch per `ship-feature`'s own rules if the parent is still open, else as new items.

At the end: every item merged / parked-with-reason, `ORCHESTRATOR.md` statuses final, hierarchy HTML refreshed, needs-input items presented to the user as a single consolidated question list.

## Model routing

| Role | Model | Why |
|---|---|---|
| Orchestrator (this session) | the session model | Holds the map; makes judgment calls; cheap per-token share |
| Fleet runners + everything `ship-feature` spawns | **Opus** (`model: 'opus'`) | The heavy build/verify reasoning |
| Mechanical plan-scoped coding (optional lane) | **Cursor CLI `composer-2.5`** | Much cheaper per token than Opus; Opus verifies + fixes |

The composer lane is an *optimization, never a requirement*: use it only where it plausibly saves Opus tokens net of verification (well-specified, file-scoped edits the plan already decided). Rules, delegation criteria, the verify-fix loop, and graceful fallback when `cursor-agent` isn't installed are in `references/cursor-composer.md`. If in doubt, Opus writes the code.

## The context contract (every agent, every lane)

Every agent that touches a feature — Opus runners, every subagent `ship-feature` fans out, and every `composer-2.5` invocation — must be given, by path, and told to read:

1. The feature's **brief** (its `docs/features-to-triage/*.md` file, when it has one) and **`docs/specs/spec-<ID>.md>`** and **`docs/plans/plan-<ID>.md`** (as they come to exist).
2. The **root DESIGN md** — the design language authority for anything UI.
3. **`docs/CODING_PRACTICES.md`** and **`docs/NEW_PROJECT_BEST_PRACTICES.md`** — the engineering rules.
4. The item's matched **deep-research doc(s)** from `docs/deep-research/` — read **in full**, start to finish; they exist precisely to inform this feature's decisions.

**Compaction rule (bake it into every prompt):** after any context compaction/summarization, re-read the brief, `spec-<ID>.md`, `plan-<ID>.md`, and the root DESIGN md before continuing — the on-disk artifacts are the memory, not the conversation. This matters doubly for `composer-2.5`, whose 200k window compacts far sooner than Opus's; every composer prompt carries the re-read instruction explicitly.

## Resuming

If `ORCHESTRATOR.md` already exists: **do not re-survey from scratch and never write a second orchestrator file.** Read it, reconcile it against reality (ledger/spec statuses, `git worktree list`, merged branches — things move while you're away), correct drifted rows, then continue at Phase 5 (or the earliest phase whose output is missing). Preflight repairs re-run only if the structure check fails.

## Guardrails

- Respect `ship-feature`'s own gates — you never merge a branch whose pre-merge gate hasn't passed, and you follow the repo's push convention (some repos keep `main` local-only).
- Budget honestly: 8 concurrent `ship-feature` runs is a very large amount of work. Confirm the fleet size and the go-ahead with the user after presenting `ORCHESTRATOR.md`, before the first slot starts.
- Report failures as failures in the ledger — a parked item with a reason beats a fake green.
