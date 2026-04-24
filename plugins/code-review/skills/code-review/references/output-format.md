# Output Format

This file defines the **only** valid finding format and the **only** valid verdict line. Deviation from this format makes the report unparseable for downstream tooling and breaks the developer's ability to triage at speed.

The taxonomy is adapted from `bobmatnyc/ai-code-review` (HIGH/MEDIUM/LOW severity enum + structured finding schema), extended with a CRITICAL tier from the everything-claude-code reviewer agents for security-blocking issues.

---

## Severity taxonomy

| Tag | Meaning | Action |
| --- | --- | --- |
| `CRITICAL` | Security vulnerability, data loss, secret leak, or guaranteed crash on the happy path. The PR cannot be safely merged. | Block. |
| `HIGH` | Logic bug under realistic input, broken contract / breaking API change without migration, missing authn/authz on a sensitive operation, hydration mismatch guaranteed under SSR, NestJS DI scope leak that breaks under load, missing exhaustiveness check on a discriminated union that the diff just extended. | Request changes. Can sometimes merge with caution if there's an explicit follow-up. |
| `MEDIUM` | Architectural smell that will compound (e.g., new `forwardRef`, new `any`, business logic in a controller, secret read in a Client Component file but inside a function never imported by the client), missing test coverage on a non-trivial change, performance bug under expected load. | Approve with comments. |
| `LOW` | Minor optimization, micro-readability improvement that's beyond what a linter catches. **Use sparingly.** If you have more than two LOW findings in a single review you are over-reporting. | Optional. |

### Severity calibration rules

- **If in doubt between two tiers, use the lower one.** Over-tagging severity inflates fatigue.
- **Do not use CRITICAL for performance** unless the performance bug is a guaranteed denial-of-service (e.g., unbounded loop on user input).
- **Do not use HIGH for "missing test coverage"** by itself. That's MEDIUM. HIGH is for code that will misbehave at runtime, not for absent verification.
- **Stylistic preferences are not a tier.** They are not findings. Drop them.

---

## Finding format

Each finding must use exactly this structure (outer fence shown with `~~~` so the inner ` ```ts ` stays intact):

~~~
### [SEVERITY] One-sentence title in imperative mood

**File:** `path/to/file.ts:42` (or `:42-58` for a range)

**Issue:** Two- to three-sentence description. Quote the exact problematic code inline using backticks if it fits in one line. State which checklist rule was violated and *why* it matters in this specific context.

**Fix:**
```ts
// the smallest possible code change that resolves the issue
```

**Confidence:** 90 (numeric 0–100; this is the verifier's `final_confidence` after Phase 4 — Phase 5 (Gate 0) enforces the threshold)
~~~

### Worked example

~~~
### [HIGH] Server Action `deletePost` skips authorization

**File:** `app/actions/posts.ts:12-24`

**Issue:** The exported `deletePost` Server Action calls `db.post.delete({ where: { id: postId } })` without checking that the current session owns the post. Server Actions are reachable as direct POST endpoints, so any authenticated user can delete any post by invoking the action directly with another user's `postId` (IDOR).

**Fix:**
```ts
'use server'
import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post || post.authorId !== session.user.id) throw new Error('Forbidden')
  await db.post.delete({ where: { id: postId } })
}
```

**Confidence:** 95
~~~

### Multiple-instance consolidation

When the same rule is violated in multiple places, list them inside one finding:

~~~
### [MEDIUM] 4 controllers expose `@Body()` without DTO validation

**File:** Multiple — see locations below.

**Issue:** Four controllers accept request bodies typed as `any` or as a plain interface, bypassing the global `ValidationPipe` (which requires class-based DTOs with `class-validator` decorators).

- `src/users/users.controller.ts:34` — `@Body() body: any`
- `src/posts/posts.controller.ts:51` — `@Body() body: { title: string }`
- `src/comments/comments.controller.ts:28` — `@Body() body: CommentInput` (interface)
- `src/auth/auth.controller.ts:19` — `@Body() body: any`

**Fix:** Define a class-based DTO per endpoint with `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@MinLength()`, etc.) and replace the parameter type. The global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` will then auto-validate.

**Confidence:** 95
~~~

> **Why numeric (0–100) rather than a percentage tag?** Phase 3 (Find) generates candidates in coverage mode with a finder-estimated confidence; Phase 4 (Verify) refutes/confirms each one and adjusts confidence based on evidence; Phase 5 (Gate 0) filters on the verifier's `final_confidence`. The number that appears in the report is the verifier's, preserved verbatim so a downstream reviewer can see the model's calibration.

---

## Verdict line

The report **must** end with exactly one of these four lines, on its own line, no trailing prose. The conditions are mutually exclusive — pick the first one that matches in this order:

| Verdict | When to emit |
| --- | --- |
| `BLOCK` | At least one finding tagged `CRITICAL`. |
| `WARNING` | Zero `CRITICAL`, at least one `HIGH`. |
| `APPROVE` | Zero `CRITICAL`, zero `HIGH`, AND at least one `MEDIUM` or `LOW` finding. |
| `LGTM — no high-severity issues identified.` | Literally zero findings of any severity. |

> Do not add a "Summary" or "Closing Thoughts" or "Recommended next steps" paragraph after the verdict. The report ends at the verdict line.

---

## Header

For PR-mode reviews, emit this two-line header before the first finding:

```
# Code Review — PR #<num>: <title>

Base: <baseRef>  •  Head: <headRef>  •  Files changed: <count>  •  CI: <PASS|FAIL|PENDING>
```

For local reviews, omit the PR title block but always emit the next line.

### Verification stats line (always emit)

After any PR header, before the first finding, emit a single line summarizing the Find/Verify pass:

```
Find: <total> candidates · Verify: <X> confirmed · <Y> refuted · <Z> needs-info
```

For very small reviews where Phase 2.5 (Sharding) was skipped and Phase 4 (Verifier fan-out) ran in single-context mode, still emit this line — `<total>` is the candidate count from Find, and the verify counts come from running the gates in the orchestrator context.

If Stage-2 (build/lint/test) was run, append a second line:

```
Build: <PASS|FAIL>  ·  Lint: <PASS|FAIL>  ·  Tests: <PASS|FAIL>
```

Pre-existing CI breakage unrelated to the diff is suffixed `(pre-existing)` rather than treated as a finding.

---

## What NOT to include in the report

- A "Summary" or "Recap" at the top.
- A "Things I considered but didn't flag" section.
- Generic best-practice lectures unattached to specific lines.
- Suggestions to introduce a library/framework that isn't already in `package.json`.
- "Nice to have" suggestions for files not in the diff.
- Praise. ("Great error handling here!" is noise.)
- Markdown tables of findings — use the `### [SEVERITY]` headings instead, so each finding is grep-able.
