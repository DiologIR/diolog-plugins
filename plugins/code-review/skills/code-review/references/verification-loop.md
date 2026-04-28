# Verification Loop (Independent Verifier Fan-Out)

This file defines what every verifier agent does when invoked by Phase 4 of the pipeline. Each candidate finding from Phase 3 (Find) gets its own verifier — a fresh agent context with no memory of why the candidate was raised. The verifier's job is to **actively refute** the finding; confirmation is what's left when refutation fails.

The procedure is adapted from the everything-claude-code `verification-loop` skill and the Chain-of-Verification (CoV) pattern, restructured around two corrections that emerged from real review postmortems:

1. **Verification is done by a different agent than the one that found the candidate.** The same agent that pattern-matched the bug is the wrong agent to ask "is this real?" — confirmation bias is the dominant failure mode. A separate verifier with no priors can refute findings the finder couldn't see past.
2. **The confidence threshold (Gate 0) runs *after* the verifier, not before.** Surfacing a borderline candidate during Find costs almost nothing if a verifier later refutes it. Silently dropping a real bug during Find cannot be recovered.

---

## What the verifier does

The verifier receives one candidate (a single JSON line from `candidates.jsonl`) and runs gates 1–4 in order. The first gate that fails determines the verdict; if all four pass, the verdict is `confirmed`.

### Gate 1 — API existence

If the candidate's proposed `fix` names any of the following, verify it exists in the project:

- A function or method (e.g. `revalidateTag`, `useActionState`, `Test.createTestingModule`).
- A type or interface.
- A hook.
- An import path (e.g. `'next/cache'`, `'@nestjs/common'`).
- A decorator.
- A package.

How:

```bash
# 1. Does the symbol appear in the project source?
Grep -rn "<symbolName>" --glob "**/*.{ts,tsx}"

# 2. Is the package present in package.json?
Read package.json   # check both dependencies and devDependencies
```

If the grep returns no in-project usage AND the symbol is not exported by a declared dependency, the symbol probably doesn't exist for this project. Verdict: `refuted` with `evidence: "Proposed fix names <symbol>; grep returned 0 hits and not in package.json."`

### Gate 2 — Version compatibility

If the candidate's `claim` cites a version-sensitive framework behavior (e.g. "Server Actions must `await cookies()`"), confirm the project's installed version supports that behavior.

```bash
Read package.json   # find the framework's version range
```

| Claim | Required version |
| --- | --- |
| `await cookies()`, `await headers()`, `await params` is mandatory | Next.js ≥ 15 |
| `useActionState` replaces `useFormState` | React ≥ 19 |
| `forwardRef` is no longer needed; `ref` is a regular prop | React ≥ 19 |
| `middleware.ts` should be renamed `proxy.ts` | Next.js ≥ 16 |
| `GET` Route Handlers default to dynamic | Next.js ≥ 15 |
| Default `fetch()` is no longer cached | Next.js ≥ 15 |
| `app.enableShutdownHooks()` is required for `onModuleDestroy` to fire | NestJS ≥ 8 (always) |
| `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })` | NestJS ≥ 6 (always) |

If the version doesn't match, refute or downgrade `final_confidence`.

### Gate 3 — Out-of-hunk satisfaction

If the candidate's `claim` is "X is missing", **read the entire file** at `<file>`, not just the cited lines. The thing the finder thought was missing is frequently:

- Already imported at the top of the file.
- Already declared 30 lines above the cited range.
- Provided by a global setup (`main.ts` for NestJS, a layout for Next.js, a `withAuth` HOC).
- Provided by a base class the changed class extends.
- Provided by a decorator higher up in the controller/route hierarchy.
- Provided by middleware higher up the chain.

Specific checks worth running before refuting:

- **NestJS:** is the missing guard / pipe / interceptor registered globally in `main.ts` or via `APP_GUARD` / `APP_PIPE` / `APP_INTERCEPTOR` in a module's providers? If yes, refute.
- **NestJS controllers:** is the missing decorator applied at the controller class level instead of the method level? `@UseGuards(AuthGuard)` on the class covers all methods.
- **Next.js:** is the missing auth check happening in a `proxy.ts` (or `middleware.ts`) for the matching route? If yes, *consider* whether to still confirm (the [Server Functions docs](https://nextjs.org/docs/app/getting-started/mutating-data) explicitly warn that proxy coverage is fragile and authn must also be inside the action — confirm at MEDIUM, not refute).
- **Next.js:** is the missing `'server-only'` import provided by a barrel file?

### Gate 4 — Proportionality

If the proposed `fix` is dramatically larger than the change being reviewed:

- Introduces a new abstraction the project doesn't have (e.g., "extract a `BaseAuthenticatedController`").
- Renames or moves multiple files.
- Changes >50 lines for a 10-line diff.
- Requires a new dependency in `package.json`.

…then either:

- **Downgrade** `final_severity` to MEDIUM/LOW and shorten the `fix` to the smallest incremental step that addresses the immediate symptom.
- **Write the shorter fix into `fix_rewritten`** (optional string field). The report generator will prefer `fix_rewritten` over the candidate's original `fix` when present. Leave `fix_verified: true` — the finding itself is real, only the original fix was too big.

These options combine: you can both downgrade `final_severity` and write a `fix_rewritten`.

Do **not** refute on Gate 4 alone — the underlying issue may still be real. Refute only when one of Gates 1–3 fails.

---

## Active refutation, not passive confirmation

The verifier should approach each candidate trying to find a reason it's wrong. Look for:

- The validation 30 lines up.
- The guard one decorator level higher.
- The import that already exists at the top of the file.
- The constraint enforced by the schema layer above this code.
- The middleware that already runs on this route.

Confirmation is the answer when you have actively looked for the refutation and failed to find it. A verifier that confirms every candidate is doing the same thing as having no verifier — confirmation bias just shifted to a different model.

---

## Verifier output

**Reply discipline.** Skip throat-clearing — no "Let me read…", "Now I'll check…", "The finding looks…" between tool calls. Go straight to the next tool. Do **not** restate the candidate's claim or recap what you found before printing the JSON. The JSON is the artifact, not your prose. The `evidence` field is the one place full sentences belong (1–3, citing `file:line`); the orchestrator surfaces it verbatim in the report, so terseness there hurts the human reader. Compress narration, not the JSON.

The verifier's final reply must contain exactly one JSON line, on its own line, in this shape:

```json
{
  "id": "<id from input>",
  "status": "confirmed|refuted|needs-info",
  "evidence": "<1-3 sentences, cite file:line of what you checked>",
  "final_severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "final_confidence": <0-100>,
  "fix_verified": <true|false>,
  "fix_rewritten": "<optional — smaller/corrected fix when Gate 4 rewrote it, otherwise omit>"
}
```

`fix_rewritten` is OPTIONAL — omit the key entirely when the original `fix` is fine. When present, Phase 6 (Report) uses it instead of the candidate's original `fix`. `fix_verified` now indicates whether the original OR the rewritten fix is accurate, which for a confirmed finding is always true.

Use `needs-info` only when confirmation/refutation depends on knowledge outside the repo (e.g. "depends on Resend's per-account rate limit"). Do not use it as a hedge for "I'm not sure" — the next-best alternative is `confirmed` with low `final_confidence`, which Phase 5 will filter appropriately.

`final_confidence` should reflect what the verifier learned, not what the finder estimated. The finder's confidence is a starting point; the verifier should raise or lower it based on the evidence found.

---

## Stage-2 build/test gate

Stage-2 runs after Phase 5 (Gate 0) and before Phase 6 (Report). It exists to ground findings in whether the branch actually builds. It is:

- **Required for large diffs** — `fileCount ≥ 30` OR `locDelta ≥ 2000`.
- **Optional for small diffs** — the type-checker's wall-clock cost dwarfs the per-finding signal when only a handful of files changed.
- **Always skipped** for doc-only diffs (`.md` / `.mdx` / `.txt` with no source changes).

The orchestrator, not per-verifier, runs this once against the diff's head commit.

```bash
# Detect package manager
ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null

# Type-check (always)
npx tsc --noEmit
# or
npx tsc -b   # if monorepo with project references

# Lint
pnpm lint --silent || npm run lint --silent || yarn lint --silent
```

If the repo uses project references (`tsconfig.json` has `references: [...]`), prefer `npx tsc -b --pretty false` which only re-checks projects reachable from changed files. For a flat `tsconfig.json`, use `npx tsc --noEmit --pretty false`.

If type-check fails because of the diff:
- Add ONE `HIGH` finding titled "TypeScript errors introduced by the diff" listing up to 5 representative `file:line: error` tuples and the total error count.
- Do NOT try to fix the errors in the report. The report is read-only.

If lint fails but type-check passes: add one `MEDIUM` finding with the same shape.

If failures are pre-existing breakage on `main` unrelated to the diff: do NOT add a finding. Instead, suffix the report's verification stats line with `(pre-existing CI red)` per `output-format.md`. Confirm pre-existence with `git stash && npx tsc -b --pretty false` against base before flagging diff-introduced.

---

## Anti-patterns in verification

- **Verifying by re-asking the same model.** Each verifier must run as a *separate* `Agent` call — not in the orchestrator's working memory. The whole reason verification works is the fresh context.
- **Skipping verification for "obvious" findings.** The most common hallucinations are about things that *seem* obvious. Verify everything.
- **Reporting the verification process to the user.** The user does not need to see "verifier 7 ran gate 3 and found…" — only the final, surviving findings (plus the one-line verification stats header).
- **Padding the verdict with verification metadata.** The verdict is one of four lines. Stop there.
- **Using `needs-info` as a hedge.** Reserve it for "depends on production config / an external system Claude cannot inspect". Otherwise pick `confirmed` (with appropriate `final_confidence`) or `refuted`.
