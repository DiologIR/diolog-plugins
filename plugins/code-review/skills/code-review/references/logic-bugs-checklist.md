# Logic, Data-Integrity, and Multi-Tenancy Checklist

Loaded **always** for any backend service code (`*.service.ts`, `*.controller.ts`, anything that mutates persistent state, anything that consumes LLM output and persists it). The framework checklists (`nestjs-checklist.md`, `nextjs-checklist.md`) cover the *shape* of the code; this checklist covers the *behavior* of the code under realistic input, partial failure, and concurrent access.

This is the checklist that catches the bugs review agents most reliably miss because they are not anchored to a single API or framework convention — they only become visible when you read enough of the surrounding service to understand the data flow.

---

## 1. Data-integrity hazards

### 1.1 Mongo `$set` and `$unset` on overlapping paths in the same update — `HIGH`

```ts
// BAD — Mongo rejects this with "Updating the path 'x.y' would create a conflict at 'x.y'"
collection.updateOne(
  { _id },
  {
    $set: { 'externallySyncedBy.123.lastSyncedAt': new Date() },
    $unset: { 'externallySyncedBy.123.lastSyncError': '' },
  }
)
```

If `$set` and `$unset` operate on overlapping path prefixes in the same update document, Mongo throws `MongoServerError: Updating the path 'X' would create a conflict at 'X'` and the write fails silently in a `try/catch` swallow.

Fix: split into two sequential updates, or use a single `$set` that writes the desired final shape directly.

### 1.2 Multi-provider / multi-tenant state stored on a single field — `HIGH`

When a user can have *multiple* connected providers (Google + Microsoft, Slack + Teams, etc.) and the code stores the per-provider state on a *flat* field, the second provider's write overwrites the first.

```ts
// BAD — second provider overwrites the first
user.calendarOAuth = { accessToken, refreshToken, expiresAt }

// GOOD — keyed by provider
user.calendarOAuth.google = { accessToken, refreshToken, expiresAt }
user.calendarOAuth.microsoft = { accessToken, refreshToken, expiresAt }
```

The same shape applies to per-user external-event-id maps (`externallySyncedBy[userId] = { provider, externalEventId }`) — when one user has both Google and Microsoft connected, a per-user-only key collides between providers.

### 1.3 Find-then-write with no unique constraint or atomic upsert — `MEDIUM` (often `HIGH` for write paths under contention)

```ts
const existing = await Repo.findOne({ key })
if (!existing) await Repo.create({ key, value })  // race window — two concurrent calls both see no existing
```

Fix: declare a unique index on `key` and use `upsert: true` (Mongo) / `prisma.upsert` / `INSERT ... ON CONFLICT` (Postgres). Especially critical for OAuth callback "find-or-create user", invite-link "find-or-redeem", and webhook "find-or-process".

### 1.4 Off-by-N on time-window or offset filters — `HIGH`

A diff that introduces a "look-ahead window" of N days, or "reminder offset of N days before due date", is a near-guaranteed off-by-one or off-by-N source. Specifically check:

- The query's window covers exactly the offsets the *config* allows (e.g. if user can configure `offsetDays = 60` but the cron only loads obligations with `dueDate < now + 31 days`, reminders for offsets ≥ 32 are silently dropped).
- Inclusive vs exclusive endpoints (`$lt` vs `$lte`).
- Time-of-day boundaries when the schedule fires once per hour but offsets are computed in days.

### 1.5 Partial-failure idempotency in cron / queue processors — `HIGH`

When a cron loop processes N items and the first M succeed before item M+1 throws:

- **Did successful items get marked as processed before the throw?** If not, the next cron run re-sends notifications / re-charges cards / re-emails recipients.
- **Did the failure roll back the whole batch?** If yes, the M successful side-effects already happened in the world but the DB doesn't reflect them — same dup-send hazard on retry.

Fix: mark each item as processed immediately after its side-effect succeeds, inside the loop, not in a single batch update at the end.

### 1.6 `Date` parsed from external input without validation — `HIGH`

`new Date(input)` returns `Invalid Date` for malformed strings; persisting that to Mongo writes `null` or a sentinel that breaks every downstream comparison. Specifically dangerous when the input comes from:

- LLM tool calls (`createAgmDetectionPrompt({ detectedAgmDate: 'TBA' })`)
- User-uploaded CSV / spreadsheet imports
- Third-party APIs whose date formats drift between versions

Fix: validate with Zod (`z.string().datetime()`, `z.coerce.date()` with refine), or guard `if (Number.isNaN(d.getTime())) throw …` before persistence.

### 1.7 Regenerate / reset paths that silently overwrite user-edited records — `HIGH`

A "regenerate from rules" or "reset to defaults" path that does `deleteMany({ source: 'SYSTEM' })` then `insertMany(rules)` will wipe any user edits made to system-sourced rows (a custom title, an extended due date, an additional reminder offset). Almost always a behavior surprise unless explicitly documented as part of the operation.

Fix: either preserve user-edited rows by checking a `userModifiedAt`/`isUserModified` flag, or surface the destructive scope in the API response (`{ regenerated: N, overwroteUserEdits: M }`) so the UI can warn before invoking it.

### 1.8 Regenerate / reset paths that skip downstream side-effects — `MEDIUM`

If `createObligation` triggers `externalCalendarSync.push(...)` but `regenerateSystemObligations` only calls `Repo.create(...)` directly, regenerated rows never propagate to external calendars. The two write paths for the same entity must invoke the same side-effect set.

---

## 2. Multi-tenancy (cross-tenant data leak) hazards

### 2.1 Query missing the `companyId` / `tenantId` filter — `CRITICAL`

```ts
// BAD — returns rows from every company
const docs = await DocsRepo.findOne({ sourceUrl: req.body.url })

// GOOD
const docs = await DocsRepo.findOne({ sourceUrl: req.body.url, companyId: ctx.companyId })
```

Specifically check:

- Existence checks before insert (`findOne({ sourceUrl })` to dedupe). Without `companyId` scope, company A's pre-existing doc blocks company B from importing the same URL — and B sees A's row.
- Background-job queries that don't have a request context (`findAll({ status: 'pending' })`) — these tend to load every tenant's pending rows together; verify the cron operates per-company or includes a tenant filter.
- Helper services that take a key (`findByEmail`, `findByName`, `findByExternalId`) and don't take `companyId` as a second argument — when a new caller invokes them from a per-tenant context, the missing scope leaks across tenants.

### 2.2 New caller of an existing scope-incomplete query amplifies the leak — `HIGH`

When the diff adds a new call site to an existing `findBy*` helper that *doesn't* take a `companyId`, and the new caller is in a per-tenant code path, the missing scope becomes exploitable in a way it wasn't before. Even if the helper pre-existed (and per Mandate #3 you wouldn't normally flag unchanged code), the new caller is in the diff — flag the new call site and recommend either (a) adding `companyId` to the helper signature or (b) post-filtering the result in the new caller.

### 2.3 Role / permission lookup matching across tenants — `CRITICAL`

```ts
// BAD — returns role assignments from all companies the user belongs to
user.companyRoles.find(cr => cr.role === 'admin')

// GOOD — match role within the active company
user.companyRoles.find(cr => cr.companyId === ctx.companyId && cr.role === 'admin')
```

A user who is `admin` in company A and `user` in company B will be granted admin access in company B if the lookup forgets to scope by company.

### 2.4 `x-company-id` header trusted without verifying user has access — `HIGH`

If middleware reads `req.headers['x-company-id']` and stamps it onto `req.companyId` without checking the value against the user's `companies[]`, any authenticated user can escalate to any company by setting the header. The check must be: `if (!user.companies.includes(headerCompanyId)) throw ForbiddenException`.

---

## 3. LLM output validation

### 3.1 LLM-emitted field persisted without schema validation — `HIGH`

When a tool call returns `{ detectedDate, classification, confidence, … }` and the service persists those fields directly, the LLM is one prompt-injection away from controlling the database. Always:

1. Validate the tool output with Zod (`z.object({ detectedDate: z.string().datetime(), classification: z.enum([...]) })`).
2. Coerce to the intended types (`z.coerce.date()`, `z.coerce.number().min(0).max(1)`).
3. Reject + log on parse failure rather than silently storing `null`.

### 3.2 Enum-valued LLM output not constrained to a known set — `HIGH`

If the model returns `classification: string` and downstream code does `switch (classification) { case 'X': … case 'Y': … }`, an unrecognized value (typo, hallucination, prompt-drift) silently falls through every branch and is stored verbatim. Use `z.enum(['X','Y','Z'])` for tool output, and add an exhaustiveness `default: assertNever(classification)` on the consuming switch.

### 3.3 Heuristic classifier replaced with LLM call but old enum mapping retained — `MEDIUM`

A common pattern: a deterministic classifier returned `'SEC_DEF14A'`, the LLM call returns `'PROXY_STATEMENT'`, and the enum mapping silently falls through to a default — breaking the downstream consumer that expected `'SEC_DEF14A'`. When the diff swaps a deterministic classifier for an LLM call, audit the consumers.

---

## 4. Default-value / channel / mode bypasses

### 4.1 Default value on a discriminator that bypasses validation — `HIGH`

When a request body has `channel: 'email' | 'inbox' | 'public-link'` and the schema sets a default of `'inbox'`, and the *only* path that requires `respondentEmail` is `channel === 'email'`, a client can claim `channel: 'inbox'` to bypass the email requirement. Validate the discriminator constraint *and* the corresponding required-field set together.

### 4.2 "Anonymous mode" survey / form leaks identity via correlation token — `HIGH`

A survey marked `isAnonymous: true` that still stores `recipientToken` on the response row, and that uses the same `recipientToken` to link back to the invite (which knows the email), can be re-identified by anyone with read access to both collections. Anonymous mode must either (a) not record any token on the response, or (b) hash the token with a per-survey salt before storing on the response.

### 4.3 Public mutation accepts a "trusted" claim from the client — `HIGH`

```ts
// BAD — client claims to be coming from the inbox channel, server believes it
@Mutation submitResponse(@Args('input') input: { channel: Channel, ... }) {
  if (input.channel === 'inbox') skipEmailValidation()
}
```

The channel must be derived from server-trusted state (the recipient token's row, the request's auth context, the route the request hit) — never from the client's claim.

---

## 5. Authorization edge cases the framework checklists don't cover

### 5.1 Public route accepts the same JWT/token the private route does — `HIGH`

If `RbacMiddleware` or a guard accepts an HS256 dev-impersonation token in production because the *algorithm check* passes (HS256 is allowed) but the *type check* (`payload.type === 'dev-impersonation'` → reject in prod) is missing or runs in a different layer, the impersonation token works in production. Verify both checks fire on the same code path.

### 5.2 Optional shared-secret check that fails open when the secret is unset — `CRITICAL` for production paths

```ts
// BAD — when DEV_LOGIN_SECRET is unset (e.g. someone forgot to configure it),
// the conditional skips entirely and the endpoint is unauthenticated.
if (process.env.DEV_LOGIN_SECRET) {
  if (req.headers['x-dev-login-secret'] !== process.env.DEV_LOGIN_SECRET) throw …
}
// (no else branch — endpoint proceeds with no auth)
```

Either the secret is *required* (throw if unset) or there is an alternative auth mechanism that always runs. Never gate auth on env-var presence.

### 5.3 Constant-time comparison missing on shared-secret auth — `HIGH`

`if (provided !== expected)` on a cron secret, dev-login secret, webhook signature, or API key. Use `timingSafeEqual` with a length-pre-check. (Also covered in `security-checklist.md` A02.11; flag here only when the violation is in non-classical-auth code that might not have triggered the security-checklist routing.)

---

## 6. Concurrency / claim hazards

### 6.1 Worker claim without a TTL-based stale-lock recovery — `MEDIUM`

A job-queue claim pattern (`findOneAndUpdate({ status: PENDING }, { status: SENDING, lockedBy, lockedAt })`) without a corresponding sweep that resets `SENDING` rows older than a TTL leaks the row forever when the worker crashes. Always pair the claim with a stale-lock sweep at the top of the cron.

### 6.2 In-flight state change between enqueue and send — `MEDIUM`

When an item is enqueued at T1 and processed at T2, the underlying entity (recipient unsubscribed, survey closed, company suspended) may have changed. The processor should re-check the entity's current state at T2, not trust the snapshot from T1.

---

## 7. Side-effect ordering

### 7.1 Side-effect *before* the durable write — `HIGH`

```ts
await emailSender.send(invite)         // side-effect in the world
await queue.markSent(invite.id, msgId) // record it succeeded — what if this throws?
```

If `markSent` throws, the email was sent but the queue still shows `PENDING` and re-sends on the next cron run. Either: (a) wrap in a transaction with the side-effect committing last, (b) make the recipient-side handler idempotent via a server-generated message-id, or (c) record `attempted` before the send and `succeeded` after, so retries are visible.

### 7.2 Side-effect *not skipped* when downstream ID is unavailable — `MEDIUM`

If sync to an external system requires both `accessToken` and `externalEventId` and one is missing, attempting the sync produces a confusing 4xx instead of a no-op. Guard the call with an explicit precondition check and a structured `lastSyncError` for diagnostics.

---

## 8. Sources

- Authorship pattern surveyed from real-world OWASP A01 (Broken Access Control) post-mortems where the bugs evaded framework-shaped review checklists because the violations were *behavioral*, not *structural*.
- Multi-tenancy section adapted from Tessl, Vercel, and Auth0 production-incident retrospectives.
- LLM-output section adapted from Anthropic's model-card guidance on tool-use validation and the prompt-injection threat model.
