# Verification Loop (Chain-of-Verification)

This file defines the verification gates that every candidate finding from Phase 3 **must** pass before it appears in the final report. The procedure is adapted from the everything-claude-code `verification-loop` skill and the Chain-of-Verification (CoV) pattern.

Two reasons this step exists:

1. **Hallucinations.** LLMs occasionally suggest plausible-but-nonexistent APIs, recommend functions that "should" exist, or cite imports from packages the project doesn't have. Every such finding burns developer trust.
2. **Confidence calibration.** Phase 3 (Analysis) deliberately runs in coverage mode and surfaces every candidate finding the model identifies, including borderline ones. Without an explicit filtering step, those borderlines would either be silently dropped during Analysis (losing real bugs) or all reported (drowning the developer). Gate 0 below is that explicit filter.

---

## Verification gates

A finding **must** pass every gate that applies to it. If a gate fails, either rewrite the finding's suggested fix to use what does exist, or **discard the finding silently.** Never report a finding that hasn't passed.

### Gate 0 — Confidence threshold

A candidate finding from Phase 3 survives only if **one** of these holds:

- **Confidence ≥ 85** (the standard bar — high-signal findings only), OR
- **Severity is CRITICAL or HIGH AND confidence ≥ 70** (asymmetric-cost bar — for serious findings, a false negative is much worse than a false positive, so the threshold drops).

Findings below both thresholds are dropped here, before any of the other gates run.

This gate is the dedicated location for confidence filtering. It exists here, not in Phase 3, on purpose: surfacing a borderline candidate during Analysis costs almost nothing if Gate 0 later drops it, but silently dropping a real bug during Analysis cannot be recovered. Keep the filter at the gate, not at the source.

### Gate 1 — API existence

If your suggested fix names any of the following, you must verify it exists:

- A function or method (e.g. `revalidateTag`, `useActionState`, `Test.createTestingModule`)
- A type or interface (e.g. `RequestHandler`, `CanActivate`)
- A hook (e.g. `useOptimistic`, `useFormStatus`)
- An import path (e.g. `'next/cache'`, `'@nestjs/common'`)
- A decorator (e.g. `@Injectable`, `@UseGuards`)
- A package/library

How to verify:

```bash
# 1. Does the symbol appear in the project source?
Grep -rn "<symbolName>" --glob "**/*.{ts,tsx}"

# 2. Is the package present in package.json?
Read package.json   # check both dependencies and devDependencies

# 3. If it's a framework API (Next.js / NestJS / React), check the installed version
#    matches the version that introduced this API.
```

If `Grep` returns no in-project usage AND the symbol is not exported by a declared dependency, **the symbol probably doesn't exist for this project.** Rewrite the suggestion or drop the finding.

### Gate 2 — Version compatibility

If the finding cites a framework behavior — for example, "Server Actions must use `await cookies()`" — you must confirm the project's installed version supports that behavior.

```bash
Read package.json   # find the framework's version range
```

Major-version-sensitive examples:

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

If the version doesn't match, either downgrade the finding's wording (e.g., "consider migrating when on v15") or drop it.

### Gate 3 — Out-of-hunk satisfaction

If the finding's claim is "X is missing", re-read the **entire file**, not just the hunk. The thing you think is missing is frequently:

- Already imported at the top of the file.
- Already declared 30 lines above the hunk.
- Provided by a global setup (`main.ts` for NestJS, a layout for Next.js, a `withAuth` HOC).
- Provided by a base class the changed class extends.
- Provided by a decorator higher up in the controller/route hierarchy.

Specifically check:

- For NestJS: is the missing guard / pipe / interceptor registered globally in `main.ts` or via `APP_GUARD` / `APP_PIPE` / `APP_INTERCEPTOR` in a module's providers? If yes, drop the finding.
- For NestJS controllers: is the missing decorator applied at the controller class level instead of the method level? `@UseGuards(AuthGuard)` on the class covers all methods.
- For Next.js: is the missing auth check happening in a `proxy.ts` (or `middleware.ts`) for the matching route? If yes, *consider* whether to still flag it (the [Server Functions docs](https://nextjs.org/docs/app/getting-started/mutating-data) explicitly warn that proxy coverage is fragile and authn must also be inside the action; you may still flag it as MEDIUM).
- For Next.js: is the missing `'server-only'` import provided by a barrel file the file imports?
- For React: is the missing key prop provided by `React.Children.map` or by a stable wrapper?

### Gate 4 — Proportionality

The fix you're suggesting should be proportional to the change being reviewed. Red flags:

- Your fix introduces a new abstraction the project doesn't have (e.g., "extract a `BaseAuthenticatedController`").
- Your fix renames or moves multiple existing files.
- Your fix changes >50 lines for a 10-line diff.
- Your fix requires adding a new dependency to `package.json`.

In these cases, either:

- Downgrade the finding to MEDIUM/LOW with a note that this is a "future cleanup" not a "fix this PR" item.
- Rewrite the suggestion as a smaller incremental fix that addresses just the immediate symptom.
- Drop the finding entirely if the original code is acceptable (just not optimal).

---

## Optional Stage-2 build/test gate

When the user explicitly asks for a *thorough* review (or you have access to run commands and the project is small enough), run the build/lint/test suite to ground findings further. This is the verification-loop pattern from the everything-claude-code skill.

```bash
# Detect package manager
ls package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null

# Type-check (always)
npx tsc --noEmit
# or
npx tsc -b   # if monorepo with project references

# Lint
npm run lint --silent || pnpm lint --silent || yarn lint --silent

# Unit tests on changed packages
npm test --silent || pnpm test --silent || yarn test --silent
```

If any of these fail in a way that's caused by the diff, **add a HIGH finding** referencing the failure. (If they fail due to pre-existing breakage unrelated to the diff, do not add a finding — but mention it once in the verdict context.)

Do **not** run this gate by default for large projects. Type-check alone on a large monorepo can take minutes and provides limited per-finding signal.

---

## Verification report (only if Stage-2 was run)

```
VERIFICATION
============
Type check:  [PASS|FAIL]  (n errors, m introduced by this diff)
Lint:        [PASS|FAIL]  (n warnings)
Tests:       [PASS|FAIL]  (n/m passed, k%s coverage)
```

Place this block immediately after any PR header and before the first finding. Omit if Stage-2 was skipped.

---

## Anti-patterns in verification

- **Verifying by re-asking the LLM.** Don't write "the API probably exists because it's standard"; actually `Grep` for it.
- **Skipping verification for "obvious" findings.** The most common hallucinations are about things that *seem* obvious. Verify everything.
- **Reporting the verification process.** The user does not need to see "I checked Gate 1, then Gate 2…" — only the final, surviving findings.
- **Padding the verdict with verification metadata.** The verdict is one of four lines. Stop there.
