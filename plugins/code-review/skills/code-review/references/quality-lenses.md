# Quality Lenses — Performance, Tests, Dead Code, Tech Debt, Dependencies, DX

Adapted from the `improve` skill's audit playbook (shadcn, MIT), reframed for code review: each lens emits **candidates in the standard candidate schema** (see `SKILL.md` / `output-format.md`) with severity + confidence — findings, not implementation plans. There is no "executor"; the developer reads the report and applies fixes themselves.

These lenses are **default-on at `deep` depth**, and individually selectable at any depth via lens keywords (`perf`, `tests`, `dead-code`, `debt`, `deps`, `dx`). At `quick`/`standard` depth they only run when explicitly requested.

A finding is only a finding with evidence. "Probably has N+1 queries somewhere" is not a candidate; `orders/api.ts:142 issues one query per order item inside a loop` is.

---

## Contents

- [Scope rules per lens](#scope-rules-per-lens)
- [Lens: perf — Performance](#lens-perf--performance)
- [Lens: tests — Test Coverage](#lens-tests--test-coverage)
- [Lens: dead-code — Dead Code](#lens-dead-code--dead-code)
- [Lens: debt — Tech Debt & Architecture](#lens-debt--tech-debt--architecture)
- [Lens: deps — Dependencies & Migrations](#lens-deps--dependencies--migrations)
- [Lens: dx — DX & Tooling](#lens-dx--dx--tooling)
- [Severity calibration for lens findings](#severity-calibration-for-lens-findings)

---

## Scope rules per lens

Mandate #3 (stay scoped to the diff) applies, with per-lens extensions — some lenses are meaningless on a diff hunk alone:

| Lens | Scope |
| --- | --- |
| `perf`, `tests` | Changed files + the call sites of changed exports. |
| `dead-code` | Changed files, plus a repo-wide `Grep` for each symbol the diff **removes the last caller of** or **exports without any importer**. |
| `debt` | Changed files; duplication checks may grep the repo for near-identical siblings of code the diff adds. |
| `deps` | The manifests the diff touches (`package.json`, lockfiles); at `deep` depth, the whole manifest. |
| `dx` | Repo-level config only when the diff touches it (CI files, lint config, scripts) — plus one repo-level candidate if there is no working verification command at all. |

When the user names an **area** (e.g. `frontend dead-code`), scope = that area's files regardless of the diff — the user is asking for a targeted sweep, not a diff review. Say in the report which scope was used.

---

## Lens: perf — Performance

Algorithmic and architectural wins, not micro-optimizations.

- **N+1 patterns**: query/fetch per item inside loops or per list-row rendering; missing batching or dataloader.
- **Wrong complexity**: nested scans over the same collection; repeated `find`/`filter` inside hot loops where a Map-keyed lookup belongs.
- **Caching gaps**: identical expensive computations or fetches repeated per request/render; missing memoization at clear function boundaries.
- **Payload size**: over-fetching (select-*, full objects where IDs suffice), missing pagination on unbounded lists, large JSON shipped to clients.
- **Frontend**: heavyweight deps for trivial use, missing code-splitting on rarely-hit routes, unoptimized images/fonts, client-side fetching for data available at render time, render waterfalls.
- **Backend**: synchronous work that belongs in a queue; missing indexes implied by query patterns (flag as needs-info — don't claim without schema evidence); connection-per-request where pooling exists.

## Lens: tests — Test Coverage

The goal is not a percentage — it's *which untested changed code is dangerous*.

- Changed critical-path code (money, auth, data mutation, tenant scoping) with zero or trivial coverage.
- Changed modules with high churn (`git log --oneline -- <file> | wc -l`) and no tests — top regression risk.
- Tests the diff adds that assert nothing meaningful, mock so heavily they test the mocks, or use flaky patterns (real timers, real network, order dependence).
- Tests the diff **weakens**: assertions removed, `.skip` added, tolerances loosened without explanation.
- Missing test-layer fit: a pure function change tested only via slow E2E, or an API contract change with no integration test.

## Lens: dead-code — Dead Code

- Symbols the diff orphans: the last caller of a function/component was removed but the definition remains.
- Exports with no importer anywhere in the repo (grep before claiming; exclude public-package entry points and framework-magic files like Next.js `page.tsx`/`route.ts`, NestJS module registrations, RN screens registered by navigation config).
- Feature flags fully rolled out (always-true/always-false) but still branching.
- Commented-out code blocks the diff adds or leaves behind, with no explanation.
- Dependencies in the manifest no longer imported anywhere.
- Unreachable branches: conditions that types or earlier guards make impossible.

## Lens: debt — Tech Debt & Architecture

- **Duplication**: the diff re-implements logic that already exists (grep for near-identical functions/components before writing the candidate — cite both locations); divergent copies that have drifted.
- **Layering violations**: UI importing data-layer internals, new circular dependencies, additions to a "utils" junk-drawer module with high fan-in.
- **God objects**: the diff grows a file already an order of magnitude larger than the repo median; functions gaining double-digit parameters or deeper conditional nesting.
- **Inconsistent patterns**: the diff introduces a third way of doing data fetching / error handling / styling when the repo has a converged pattern — cite the exemplar file the diff should have followed.
- **Abstraction mismatches**: a premature abstraction with a single implementation, or a change that had to touch N files in lockstep because an abstraction is missing.

## Lens: deps — Dependencies & Migrations

- New dependencies duplicating one already in the manifest (two date libs, two HTTP clients).
- Abandoned dependencies (archived repo, no release in years) newly added on critical paths.
- Deprecated APIs in use that have announced removal timelines.
- Major-version lag on core framework/runtime **only when it has a real cost** (EOL, security-fix cutoff, blocks another finding's fix) — not every minor bump.
- Lockfile/manifest drift; version-pinning inconsistencies across a monorepo.
- Run the ecosystem audit read-only (`npm audit`, `pnpm audit`) at `deep` depth; report only critical/high advisories affecting reachable runtime code.

## Lens: dx — DX & Tooling

- Missing or broken typecheck script, lint config, formatter — when the diff's own quality suffered visibly for it.
- Setup drift the diff introduces: new required env var with no `.env.example` entry, README steps now wrong.
- Logging regressions: structured logging replaced with bare `console.log` on a service, error swallowed where a correlation ID used to flow.
- Slow-feedback additions: a new test suite with no watch mode, CI steps without caching.

---

## Severity calibration for lens findings

Lens findings skew lower-severity than correctness/security — calibrate accordingly and respect `output-format.md`:

| Finding class | Ceiling |
| --- | --- |
| Perf bug under expected production load | HIGH (CRITICAL only if guaranteed unbounded on user input) |
| Missing tests on changed critical path | MEDIUM (never HIGH by itself) |
| Dead code, duplication, layering, inconsistency | MEDIUM |
| Commented-out code, minor DX friction | LOW |
| Vulnerable dependency (critical advisory, reachable) | HIGH |

If a lens sweep produces more than ~5 LOW candidates, consolidate them into one multi-instance candidate per lens (Mandate #4) — lens noise is the fastest way to bury the real CRITICAL.
