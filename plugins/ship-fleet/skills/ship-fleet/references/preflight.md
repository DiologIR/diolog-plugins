# Preflight — check and repair the project's pipeline conventions

Run this before the survey, interactively. The point is that ship-fleet (and the skills it conducts) rely on a conventional layout; a repo that half-has it produces a half-blind survey. Check everything, report plainly, **offer** repairs — never restructure silently.

## 1. Structure check

Resolve each expected artifact **inside the project** (Glob; exclude `.worktrees/`, `node_modules/`):

| Check | Expected | Missing → offer |
|---|---|---|
| Ledger | `docs/features-to-triage/LEDGER.md` (or legacy `docs/feature-specs/LEDGER.md`) | Create `docs/features-to-triage/` + a fresh LEDGER.md: ask the user for a 3-letter project code, write the `Project code` / `Last allocated: 0` header + empty table (match the triage skill's format) |
| Specs dir | `docs/specs/` | Create empty dir |
| Plans dir | `docs/plans/` | Create empty dir |
| Briefs dir | `docs/features-to-triage/` | Create empty dir |
| Mocks | `design/mocks/html/` | Create empty dir; note the survey will have no design-refresh lane |
| Deep research | `docs/deep-research/` | Create empty dir; note runs proceed without research context |
| Design language | `DESIGN*.md` at project root | Ask the user for one (or point at design-md-from-website / design-md-from-screenshots skills); UI stages degrade without it |
| Best practices | `docs/CODING_PRACTICES.md` + `docs/NEW_PROJECT_BEST_PRACTICES.md` | See §2 |
| Git | repo root is a git repo with a detectable integration branch | Hard requirement — stop and sort this with the user |

Present one consolidated report (found ✓ / missing ✗ / degraded consequence), then a single AskUserQuestion for the repairs rather than one prompt per item.

## 2. Best-practices docs from diolog-team-files

If either practices doc is missing from `docs/`:

1. If `~/Dev/diolog-team-files` exists → `git -C ~/Dev/diolog-team-files pull`; else offer to `git clone https://github.com/Diolog26/diolog-team-files ~/Dev/diolog-team-files`.
2. Copy **only** `CODING_PRACTICES.md` and `NEW_PROJECT_BEST_PRACTICES.md` into the project's `docs/`.
3. Never copy anything into `docs/specs/` or `docs/plans/` — those directories are written exclusively by the triage and plan skills; seeding them from outside corrupts the pipeline's id/state assumptions.

If the clone fails (no network, no access), say so and continue — the fleet still runs, agents just lose the practices context.

## 3. Gather stray feature briefs

Feature ideas tend to accumulate as loose markdown. Scan the repo root, `docs/` (top level), and note-ish directories (`notes/`, `ideas/`, `drafts/`) for markdown that reads like a **feature description** — a product capability someone wants — rather than:

- specs (`spec-*.md`) or plans (`plan-*.md`) — pipeline-owned, leave them,
- architecture/ops/README/marketing/testing docs,
- research reports (those belong in `docs/deep-research/`).

For each candidate, show the user the filename + first heading/opening line and what makes it feature-shaped. Offer to `git mv` the confirmed ones into `docs/features-to-triage/`. Moved briefs become Untriaged items in the survey.

## 4. Monolith layout check

Read the **project-layout section of the repo's own copy** of `docs/NEW_PROJECT_BEST_PRACTICES.md` — §3 (single-app layout: `app/`, `components/`, `lib/` with server-only boundary, `scripts/`, `public/`) or §17 (pnpm-workspaces/Turborepo monorepo: `apps/*`, `packages/*`) if the repo is multi-app. The doc is the source of truth, not this file — it evolves; compare against what it *currently* says.

Report deviations (missing `lib/` server-only boundary, route handlers outside `app/api/`, apps outside `apps/`, phantom top-level dirs) as a short list with severity. **Only restructure if the user asks** — the fleet can run on a non-conforming repo; the check exists so new code from the fleet doesn't inherit a broken shape, and so the user can choose to fix structure first as its own work item (queue it in the ledger if they do).
