# Prepush Mode — Fast Gate on the Outgoing Diff

The token-light variant of the skill. One question, answered fast: **is it safe to push the commits that are about to leave this machine?** Not a full review — a blocker scan. Target: a few minutes wall-clock, zero subagents, zero artifacts.

Triggered by: "pre-push check", "can I push this?", "check the diff before I push", "is this safe to push", a `prepush` keyword in the invocation, or invocation from a pre-push hook.

---

## Hard constraints (what makes this mode cheap)

- **No `Agent` calls.** No sharding, no verifier fan-out. The orchestrator finds *and* self-verifies inline.
- **No JSONL artifacts, no report file.** Verdict and blockers are emitted inline only. (If the user asks for a file, write one; never by default.)
- **No full checklist loads.** The blocker checklist below is the whole rulebook, plus `security-checklist.md` *only* if the diff touches auth/session/payment code.
- **Read budget.** Read in full only the files with blocker-suspicious hunks. For the rest, review from the diff text itself.
- **Depth keywords are ignored** — `prepush deep` is a contradiction; run a standard review instead and say so.

## Determining the outgoing diff

The unit under review is **unpushed commits**, not the working tree:

```bash
git diff @{push}..HEAD 2>/dev/null || git diff @{upstream}..HEAD 2>/dev/null || git diff origin/$(git symbolic-ref --short refs/remotes/origin/HEAD | sed 's|origin/||')...HEAD
git log @{push}..HEAD --oneline 2>/dev/null || git log @{upstream}..HEAD --oneline
```

- If there is no upstream at all, diff against the default branch merge-base and note that the whole branch is being gated.
- If there are **zero outgoing commits**, say so and stop — nothing to gate.
- If the working tree is **dirty**, note in one line that uncommitted changes are NOT covered by this check. Do not review them.

## Blocker checklist

Scan the outgoing diff for these, in order. Categories 1–6 produce blockers (CRITICAL/HIGH); 7–8 produce non-blocking notes.

1. **Secrets** — added lines containing API keys, tokens, private keys, connection strings, passwords; `.env`/`.env.*` or credential files newly tracked (`git diff --stat` + `git status` on the commit range). Never quote the secret value — cite file:line and type only, and note that a pushed secret must be rotated, not just removed.
2. **Debug leftovers** — `debugger` statements; `console.log` with dumped payloads on server code; test focus/skip markers (`.only`, `.skip`, `fdescribe`, `xit`) added; verbose/debug flags flipped on in config.
3. **Accidental payload** — large binaries or generated directories newly tracked; lockfile churn with no manifest change; editor/OS junk files; another branch's files swept in (commit list helps spot this).
4. **Broken contracts** — an exported symbol's signature/behavior changed in the range: grep its callers; any call site not updated in the same range is a blocker.
5. **Auth/validation regressions** — an endpoint, Server Action, or mutation touched in the range that lost (or never gained) its auth guard or input validation; tenant-scoping dropped from a query.
6. **Destructive migrations** — schema migrations in the range that drop/rename columns or tables without a guard or backfill note.
7. *(note)* **Markers** — TODO/FIXME/HACK/XXX added in the range; consolidated into one line.
8. *(note)* **Type safety** — if the repo typechecks in under ~30s (small project, or affected package only), run `tsc --noEmit` and report diff-introduced errors as a blocker; otherwise skip — do not burn minutes here.

Self-verification still applies in spirit: before reporting a blocker, apply Gate 3 (read enough of the file to confirm the guard isn't 30 lines above the hunk) yourself. A false DO-NOT-PUSH erodes trust in the gate faster than a missed LOW.

## Output format

No report file, no stats line. Emit exactly:

```
Prepush gate — <n> commit(s), <fileCount> file(s), +<ins>/−<del> vs <base-ref>

<### [SEVERITY] findings for blockers only, standard finding format, fix optional>

Notes (non-blocking): <one line per category-7/8 note, or omit section>

<verdict>
```

Verdict line — exactly one of:

- `DO NOT PUSH — <n> blocker(s).` — any CRITICAL or HIGH finding above.
- `PUSH WITH CARE — no blockers; <n> note(s) above.` — only non-blocking notes.
- `PUSH — outgoing diff is clean.` — nothing found.

MEDIUM/LOW-grade observations that would appear in a normal review are **out of scope** — cap yourself at the two most useful as Notes and drop the rest. If the outgoing diff genuinely warrants a full review (e.g. it's 3000 LoC of new auth code), say so in one sentence after the verdict and offer `standard`/`deep` — do not silently escalate.
