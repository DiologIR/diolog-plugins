# Phases 6–7 — Acceptance E2E (local) and Finalize (merge, push, cleanup)

## Phase 6 — Acceptance E2E against the feature branch, locally

Invoke **`/acceptance-e2e`**. That skill turns a feature's requirements into an AC-traceability-driven Playwright suite in `apps/web/e2e`, asserts *content/render correctness* (a chart actually draws — not "an element exists"), runs isolation-safe, and fixes the tractable product bugs it surfaces. Your job as conductor is to feed it the right inputs and adapt the one assumption that doesn't hold pre-merge.

### Feed it the complete requirements
The suite is only as complete as its inputs. Hand `/acceptance-e2e` **all** of:
- the original **feature description**,
- `docs/specs/spec-<ID>.md` **and every child spec** from Phase 4b,
- `docs/plans/plan-<ID>.md` **and every child plan**,
- the **design-system mock UI** / UI inventory from Phase 1 (the surfaces × states × menus the suite must cover).

"Comprehensive" here means: every user flow, every action, every interaction, and every menu the feature exposes — across its states — traced to an AC in the matrix. A menu the mock UI shows but the AC list omits is still a flow to cover; use the mock as the coverage checklist, the ACs as the assertions.

### Adapt: run against the branch's app locally, not production
`/acceptance-e2e` discovers its target from the repo, and for a released feature that's often the deployed/production URL — but this feature **isn't merged yet**, so production doesn't have it. The suite must run against **the app served from the feature branch's worktree**:
- Serve the app (e.g. `apps/web`) from `.worktrees/<ID>` (the branch `ai/<id>`) — the repo's dev/serve command — and point the harness's base URL at that local instance (an env override / Playwright `baseURL`, per the harness reference). Keep the repo's dev-login + tenant/context conventions.
- Author the e2e specs **on the feature branch** (in the worktree's `apps/web/e2e`) so they commit with `ai/<id>` and merge with the feature.
- Everything else the skill mandates still holds: assert outcomes not chrome, operate on disposable-clone data, tag `@read-only`/`@mutating`, and **run the full suite green twice** (flakes and isolation breaks only surface on the second run).

### Fix what it catches
A content/AC assertion failing on a **real defect** is the suite doing its job — and the red assertion *is* the reproduction, so you don't need a second repro step: confirm the defect, fix the branch code minimally (only the lines that fix it — no drive-by refactor of the product code you're touching), re-run the same assertion, and watch it go green. Encode a deep/risky bug as a documented regression guard only if it genuinely can't be fixed in this pass — and surface it in the finalize report rather than hiding it. Confirm at the API level before calling something a product bug (don't mislabel a test artifact as a bug, or a bug as a test artifact).

Phase 6 is done when the suite covers every flow/action/menu (matrix shows no silently-uncovered AC), is green **twice**, and the bugs it found are fixed (or explicitly, visibly deferred with a reason).

## Phase 7 — Finalize: the fail-closed pre-merge gate, then merge → push → cleanup

The merge + push is the one **irreversible** step in the run. Full-auto means *auto-merge a genuinely green, verified feature* — never *merge whatever's on the branch*. So it runs behind a hard gate.

### The pre-merge gate — ALL must be true (fail closed)
Verify each by **actually checking**, not by recalling that an earlier phase "passed":
- [ ] **All build gates green, actually run now:** the repo's own validate / codegen / typecheck / lint commands (e.g. `pnpm validate:all`, `pnpm validate:graphql`, `pnpm typecheck`, `pnpm lint`), scoped sensibly, in the worktree. A gate you couldn't run is a **blocker**, not an implied pass.
- [ ] **No unresolved Critical / High / Medium** findings from `/work`'s acceptance review or `/gap-fix` — only optional, documented Low items may remain.
- [ ] **e2e green twice**, covering every flow/action/menu, with surfaced bugs fixed.
- [ ] **Reachability + clause tables** on the spec show every capability wired and every clause satisfied (no `✗`, no unresolved `partial`).
- [ ] **One branch:** all parent + deferred + child work is on `ai/<id>`; no stray child worktree/branch remains.

If **any** box is unchecked or unverifiable → **STOP before the merge.** Append a blocker note to the spec, leave the branch local (exactly where `/work` would leave it), and report precisely what blocks the merge. This is a correct, safe outcome — a stopped run beats a broken push.

### Merge mechanics (gate passed)
Work in the worktree `WT = .worktrees/<ID>`; `INT` is the integration branch you detected (`origin/staging`, else the repo default).

1. **Commit anything outstanding** on `ai/<id>` (stage only files you created/modified — never `git add .`). Use the pipeline's commit convention: `<type>(<scope>): <summary>`, a `Resolves <ID>` line (list child ids too), and the `Co-Authored-By` trailer.
2. **Final rebase onto the fresh tip of `INT`:** `git -C "$WT" fetch origin`, then rebase `ai/<id>` onto `INT`, resolving every conflict faithfully (integrate both sides — never drop `INT`'s work or the feature's). Mandatory even if it looks clean: a stale base silently duplicates work that landed on `INT` meanwhile.
3. **Re-run the build gates** after the rebase — the integration must compile. Any red here re-closes the gate: stop.
4. **Merge into `INT` directly (no PR)** and **push:**
   ```
   git fetch origin
   git switch <INT-local>            # the local integration branch tracking INT (e.g. staging / main)
   git merge --no-ff ai/<id>         # keep the feature as a discernible unit; resolve nothing new if the rebase was clean
   git push origin <INT-local>
   ```
   (Use `--no-ff` so the feature is a legible merge; a fast-forward is fine if the team prefers a linear history. Push to the same integration branch you rebased on.)
5. **Clean up:** remove the worktree(s) and delete the now-merged local branch(es):
   ```
   git worktree remove .worktrees/<ID>
   git branch -d ai/<id>
   ```
   Do the same for any child worktree/branch that Phase 4b's fallback path created. `git worktree prune` to tidy stale entries.

### Record the outcome
- Set the spec header `Status: Done` (Merged), refresh `Last updated`, and add a one-line merge note (the merge commit sha + date + `INT`). Do the same on child specs.
- Update the ledger row(s) to `Done`.
- Report: what merged, onto which branch, the commit sha, the e2e pass counts + AC coverage, findings resolved, gates run, and the worktrees/branches removed.

Remember the docs (`spec`/`plan`/`LEDGER`) live in the **main working tree** and are **not** committed onto the feature branch — they don't ride the merge; only the code (including the design-system mock UI carried in Phase 1) does.

## If you stopped instead of merging
That's a first-class outcome, not a failure. Leave the branch committed + rebased in its worktree (the same state `/work`/`/gap-fix` leave), keep the spec at `In Review`, and hand the human a precise blocker list. They can fix + re-enter at the failed phase, or merge manually. Never push to clear a blocker.
