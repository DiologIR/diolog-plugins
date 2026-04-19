# Security Checklist (OWASP-aligned)

Loaded when the diff touches authentication, sessions, cookies, JWT, password handling, env vars, SQL/ORM queries with user input, file uploads, deserialization, redirects, public POST endpoints, headers, CSP, or CORS.

Most items are **CRITICAL** or **HIGH** by default — security findings have asymmetric cost (a missed CRITICAL can be a CVE; a false positive costs the developer 30 seconds). When in doubt, lean toward flagging on this checklist (still respecting the >85% confidence rule).

Items are organized by OWASP Top 10:2021 category, with NestJS / Next.js–specific overlay.

---

## A01:2021 — Broken Access Control

### A01.1 Missing authorization on a state-mutating operation — `CRITICAL`

The endpoint authenticates the user (knows *who*) but doesn't check authorization (whether *this user* may act on *this resource*). Insecure Direct Object Reference (IDOR).

Look for: any `db.X.update/delete/findUnique({ where: { id: input.id } })` where `id` came from the request and ownership of the row is not verified before the operation.

```ts
// Required pattern:
const row = await db.x.findUnique({ where: { id: input.id } })
if (!row || row.ownerId !== session.user.id) throw new ForbiddenException()
```

### A01.2 Missing authentication on a state-mutating endpoint — `CRITICAL`

Public-write endpoints. Server Actions, NestJS controllers, and Next.js Route Handlers all default to *no* auth — explicit checks must exist.

### A01.3 Authorization in middleware/proxy as the *only* check — `HIGH`

Per the Next.js docs: *"A matcher change or a refactor that moves a Server Function to a different route can silently remove Proxy coverage. Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone."* Same in NestJS — global guards can be bypassed by `@Public()` accidentally applied at the controller level. Belt and braces.

### A01.4 Auth not deny-by-default — `HIGH`

The codebase opts routes *into* auth (e.g. `@UseGuards(JwtAuthGuard)` per controller). One missed guard = open route. Recommend deny-by-default with `@Public()` opt-out for the rare public route.

### A01.5 Unrestricted file upload — `HIGH`

File upload handlers must constrain: MIME type, file size, file extension, scan-for-virus if user-facing. Additionally: **never use the client-supplied filename for the on-disk path** — sanitize, or rename to a server-generated UUID. A path like `../../../etc/passwd` in `req.file.originalname` followed by `fs.writeFile(path.join(uploadDir, originalname), ...)` is path traversal and can overwrite arbitrary files the process can write.

### A01.7 Mass assignment / over-posting — `HIGH` (often `CRITICAL`)

Passing the entire parsed body straight into a model write lets the attacker set fields they're not supposed to control:

```ts
// BAD — attacker sets role: 'admin', isVerified: true, balance: 999999
prisma.user.update({ where: { id }, data: req.body })

// BAD — same problem
Object.assign(user, req.body); await user.save()
```

Required pattern: explicit allowlist of mutable fields, or a class-validator DTO with `whitelist: true, forbidNonWhitelisted: true`, or `pick`/`omit` projection at the ORM layer. Severity is `CRITICAL` when one of the over-postable fields is privilege-bearing (`role`, `isAdmin`, `tenantId`).

### A01.6 Open redirect — `HIGH` (or `CRITICAL` post-auth)

Redirecting to a destination URL pulled directly from the request (e.g. `Response.redirect(searchParams.get('next'))`) lets an attacker bounce through your domain to a malicious one. Allowlist redirect targets or restrict to relative paths.

Severity escalates to `CRITICAL` when the redirect happens **after** authentication or as part of an OAuth callback — those flows can leak the OAuth code/token via the malicious redirect target and lead directly to account takeover. Pre-auth open redirects are `HIGH`.

---

## A02:2021 — Cryptographic Failures

### A02.1 Plain-text password storage — `CRITICAL`

Entity has `password` not `passwordHash`. Must hash with **argon2id (preferred)** or bcrypt with a current cost factor.

### A02.2 Weak password hashing parameters — `HIGH`

- `md5`, `sha1`, `sha256` are general-purpose hashes, **not password hashes**. They're trivially crackable at modern GPU speeds.
- bcrypt: cost factor `≥ 12` (current OWASP guidance; 10 is the historical floor and is now insufficient on commodity GPUs). Bump to 13–14 if the auth latency budget allows.
- argon2: prefer `argon2id` variant; `node-argon2` defaults are reasonable starting points but verify `memoryCost`, `timeCost`, `parallelism` against current OWASP cheat-sheet recommendations.
- `crypto.scrypt`: acceptable but only with explicit `cost`/`blockSize`/`parallelization` parameters; default Node config is too weak for password hashing.

### A02.3 Predictable token generation — `HIGH`

`Math.random()` for password reset tokens, session IDs, or invite codes. Use `crypto.randomBytes(32).toString('hex')` or `crypto.randomUUID()`.

### A02.4 JWT signed with `none` algorithm — `CRITICAL`

`algorithm: 'none'` in JWT signing options — never permitted. Reject in code review on sight.

### A02.4b JWT algorithm confusion (HS256 / RS256 key confusion) — `HIGH`

If the verifier is asymmetric (RS256/ES256) but doesn't pin `algorithms` on `jwt.verify`, an attacker can sign a token with HS256 using the *public key* as the HMAC secret, and the verifier will accept it (because it'll try HS256 with the public key as the key). Always pin:

```ts
jwt.verify(token, publicKey, { algorithms: ['RS256'] })
```

For NestJS `@nestjs/jwt`, set `signOptions.algorithm` AND `verifyOptions.algorithms`:

```ts
JwtModule.register({
  publicKey, privateKey,
  signOptions: { algorithm: 'RS256' },
  verifyOptions: { algorithms: ['RS256'] },
})
```

### A02.5 JWT secret committed to source — `CRITICAL`

`{ secret: 'shh-is-secret' }` literal in code. Read from `ConfigService` / `process.env` and ensure the key is rotated.

### A02.6 JWT with no `expiresIn` — `HIGH`

Missing `signOptions.expiresIn` = tokens never expire. 60m–24h is typical for access tokens.

### A02.7 Symmetric algorithm where asymmetric is needed — `MEDIUM`

If multiple services verify the JWT but only one signs it, RS256/ES256 is correct; HS256 means the verification service must hold the signing secret.

### A02.8 Cookies without `httpOnly`, `secure`, `sameSite` — `HIGH` for session cookies

```ts
res.cookies.set('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
})
```

### A02.9 `secure: false` in cookies / cookie config — `CRITICAL` in production

OK in dev. Flag any literal `secure: false`. Recommend gating on `NODE_ENV === 'production'`.

### A02.10 Secret in client bundle — `CRITICAL`

Any `process.env.<NON_NEXT_PUBLIC_*>` referenced from a `'use client'` file (or transitively imported by one) leaks. Fix with `import 'server-only'` at the top of the secret-bearing file.

### A02.11 Non-constant-time comparison of secret material — `HIGH`

`if (token === expectedToken)` (or `===` on password reset codes, API keys, hand-rolled webhook signatures) is timing-attack-vulnerable in principle. Real-world exploitability is debated, but the fix is one line:

```ts
import { timingSafeEqual } from 'node:crypto'
if (a.length !== b.length) return false
if (!timingSafeEqual(Buffer.from(a), Buffer.from(b))) return false
```

Required for: API key validation, password reset / email verification token comparison, hand-rolled HMAC signature verification, MFA code comparison.

---

## A03:2021 — Injection

### A03.1 Raw SQL with template-literal interpolation — `CRITICAL`

Building a SQL string with `${userId}` interpolated into the query body is SQL injection. Always use parameter binding:

```ts
queryRunner.query('SELECT * FROM users WHERE id = $1', [userId])
```

### A03.2 Prisma `$queryRawUnsafe` with user input — `CRITICAL`

`$queryRawUnsafe(sql)` is unsafe by name. `$queryRaw` (the tagged template) is safe with parameter binding.

### A03.3 NoSQL injection (Mongo-style operators) — `HIGH`

Passing the parsed body of a request as a Mongo `where` filter (e.g. `db.collection.find({ user: req.body.user })`) lets an attacker substitute `{ $ne: null }` and match every row. Strip `$`-prefixed keys from user input or validate with a strict schema before constructing the filter.

### A03.4 Shell command built from user input via `child_process` — `CRITICAL`

Invoking `child_process.exec` (or `execSync`) with a command string that interpolates user input executes the user's input through `/bin/sh`. Use `execFile` / `execFileSync` (no shell) and pass arguments as an array — the OS will not interpret metacharacters.

### A03.5 LDAP / XPath / other query languages with concatenation — `HIGH`

Same family as A03.1 — never concatenate user input into a query string.

### A03.6 Unescaped HTML rendered via `dangerouslySetInnerHTML` — `HIGH`

If `dangerouslySetInnerHTML={{ __html: userBio }}` and `userBio` is not sanitized (e.g., DOMPurify), it's stored XSS.

### A03.7 Unsafe URL `javascript:` schemes — `HIGH`

Rendering a user-controlled string as the `href` of an `<a>` allows `javascript:alert(1)` and similar XSS vectors. Validate URL schemes (`http`, `https`, `mailto`, `tel`) before rendering.

### A03.8 Prototype pollution — `HIGH`

Recursive merges (`_.merge`, `_.set`, `_.defaultsDeep` from lodash, `deepmerge`, `Object.assign` chains in a recursive helper, `JSON.parse` of attacker-controlled JSON) applied to user input can set `__proto__`, `constructor`, or `prototype` on intermediate objects, polluting `Object.prototype` for the entire process. Symptoms: random properties appearing on every object, auth bypass via `isAdmin: true` showing up on objects created later.

Fix: use `Object.create(null)` for the merge target, freeze the prototype chain, or use a merge library that explicitly rejects `__proto__` keys (lodash ≥ 4.17.5 mitigated some of these; `safe-stable-stringify` and `defu` are safer alternatives).

---

## A04:2021 — Insecure Design

### A04.1 Missing rate limiting on auth/reset/email endpoints — `HIGH`

Login, password reset, MFA, "send invite", and email-sending endpoints need rate limiting. NestJS `@nestjs/throttler` or Vercel/Upstash for Next.js. Per the Turbostarter guide: 5 requests per 15 min for auth; 100 per 15 min for general.

### A04.2 No account lockout after N failed logins — `MEDIUM`

Either lockout, exponential backoff, or CAPTCHA after repeated failures.

### A04.3 Generic 500 leaks stack trace to client — `MEDIUM`

In production, exception filters / route handlers should not return raw error messages with stack traces. NestJS does this correctly by default for `HttpException`, but custom error handlers may leak.

---

## A05:2021 — Security Misconfiguration

### A05.1 Missing security headers — `MEDIUM`

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: <strict policy>
```

For NestJS: use `helmet`. For Next.js: configure in `next.config.js` `headers()` or in proxy.

### A05.2 CORS misconfiguration — `HIGH`

Three common patterns to flag:

1. `Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Credentials: true` (browsers reject the combo, but the misconfig signals deeper problems).
2. **Origin reflection** — middleware that copies `req.headers.origin` straight back into `Access-Control-Allow-Origin` without an allowlist check. Common in default Express/Nest CORS setups; effectively allows every origin to send credentialed requests.
3. NestJS `app.enableCors()` called with no args (defaults to `*`) or with `{ origin: '*', credentials: true }`.

Required: explicit allowlist of origins (an array or a function that checks against a list).

### A05.3 Default / debug endpoint enabled in production — `HIGH`

Swagger / GraphQL Playground / `/health` with detailed info in production.

### A05.4 NestJS app missing `app.enableCors(...)` configuration when frontend is on a different origin — `MEDIUM`

Either misconfigured CORS or missing CORS — both warrant flagging. See also A05.2 for the wildcard / reflection variants.

---

## A06:2021 — Vulnerable and Outdated Components

### A06.1 New dependency without version pin — `HIGH`

Diff adds a dependency at `latest`, `^x.0.0`, or `*`. In production, dependencies should be pinned to an exact version (or a tight range with a corresponding lockfile commit) so a transitive update can't ship unverified code into the app.

### A06.2 Diff introduces a dependency with known HIGH/CRITICAL CVEs — `CRITICAL` or `HIGH`

If `npm audit` (or `pnpm audit`, `yarn audit`) reports HIGH/CRITICAL vulnerabilities introduced by a dependency added in the diff, flag it. Recommend a different package, an upstream fix, or — as a last resort — a documented compensating control.

### A06.3 Lockfile not updated alongside `package.json` — `HIGH`

If the diff modifies `package.json` but not the lockfile (`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb`), CI installs may resolve different versions than what was reviewed. Always commit lockfile + package.json together.

### A06.4 `--legacy-peer-deps` / `--force` workaround in install scripts — `MEDIUM`

If a `postinstall` script or CI script uses `npm install --legacy-peer-deps` / `--force`, a real peer-dep conflict is being silenced. Investigate the conflict instead.

---

## A07:2021 — Identification and Authentication Failures

### A07.1 Session fixation — `HIGH`

After a successful login, the session ID must be rotated. If the diff implements login but doesn't regenerate the session, flag it.

### A07.2 Long-lived refresh tokens without rotation — `MEDIUM`

Refresh tokens should rotate on use, with the old one invalidated.

### A07.3 No CSRF protection on state-mutating Route Handler — `HIGH`

Server Actions have built-in CSRF (automatic Origin/Host comparison). Route Handlers do not. Add a custom header check, double-submit cookie, or verify Origin manually.

Caveat for Server Actions deployed behind a reverse proxy or CDN that rewrites `Host`: the built-in check fails-closed unless `experimental.serverActions.allowedOrigins` is configured in `next.config.js` (see `nextjs-checklist.md` §1.7). Don't assume "Server Actions are safe by default" — they're safe by default *given correct deployment config*.

### A07.5 Race condition in find-or-create (account / token consumption) — `MEDIUM`

Two concurrent OAuth callbacks can create duplicate users for the same provider account if the lookup-then-insert isn't atomic. Same shape: a password reset token consumed by two requests racing, or an invite link redeemed twice. Fix with a unique constraint on the natural key plus an `INSERT ... ON CONFLICT` (Postgres) / `upsert` (Prisma `upsert`, TypeORM `save` with `@Unique`) — and surface the conflict as a single-success outcome.

### A07.4 Email-based login enumerates accounts — `MEDIUM`

"Email not found" vs "wrong password" responses leak which emails are registered. Return a generic "invalid credentials" message.

---

## A08:2021 — Software and Data Integrity Failures

### A08.1 Webhook handler doesn't verify signature — `CRITICAL`

Stripe / GitHub / Slack / Twilio webhook handlers must verify the provider's signature header before parsing the body. The Stripe SDK exposes `stripe.webhooks.constructEvent(rawBody, sig, secret)`.

**Critical detail (high false-negative risk):** the `body` passed to `constructEvent` MUST be the **raw request body** (Buffer or string), not the parsed JSON. Computing the HMAC over a re-serialized JSON object will silently produce the wrong digest and verification will fail (or, worse, pass against attacker-tampered payloads in some setups).

- **NestJS:** create the app with `NestFactory.create(AppModule, { rawBody: true })` AND exclude the webhook route from the global JSON body parser (or use `@RawBody()` on the controller method). The `req.body` inside the controller must be a Buffer.
- **Next.js Route Handler:** read the raw body with `await request.text()` and pass that string to `constructEvent`. Do NOT call `request.json()` first.

### A08.2 Insecure deserialization on user input — `CRITICAL`

`eval`, `Function(...)`, `vm.runInNewContext` applied to user-supplied strings. Almost always a bug. If the diff has it, very strong scrutiny.

### A08.3 Dependency from a registry without integrity check — `MEDIUM`

If `package.json` adds a new dependency, confirm `package-lock.json` is updated and pinned. Reject `latest` ranges in production.

---

## A09:2021 — Security Logging and Monitoring Failures

### A09.1 Logging sensitive data — `HIGH`

Logger calls that include passwords, tokens, full request bodies on auth endpoints, full session cookies, or PII without redaction. Specific anti-patterns to look for:

- `console.log(req.body)` on auth or payment endpoints.
- `logger.info(user)` where the user entity contains `passwordHash` / `mfaSecret` / refresh tokens.
- Pino / Winston configured without a `redact` allowlist (`redact: ['password', 'token', 'authorization', 'cookie', '*.passwordHash']`).
- Datadog / Sentry / Loggly clients that auto-capture request payloads without server-side scrubbing rules.

Don't false-fire on `logger.info('user logged in', { userId })` — flag only when the *value* is or transitively contains a credential, secret, or PII bundle.

### A09.2 Missing audit log for sensitive operations — `MEDIUM`

Account deletion, role change, refund, payout — these need an audit trail in addition to the operation succeeding.

---

## A10:2021 — Server-Side Request Forgery (SSRF)

### A10.1 `fetch(userProvidedUrl)` without allowlist — `HIGH`

The user can target internal services (`http://169.254.169.254/`, `http://localhost:5432/`). Allowlist hosts or block private/loopback ranges.

### A10.2 URL fetched server-side and result returned — `HIGH`

If the response of an SSRF-vulnerable fetch is returned to the user, internal data exfiltration is possible.

---

## Cross-cutting items

### XC.1 Secrets in commit history — `CRITICAL`

If the diff contains `.env`, `.env.local`, `credentials.json`, `serviceAccount.json`, AWS keys, etc., flag immediately and recommend secret rotation + git filter-branch.

### XC.2 `console.log` of sensitive variables — `MEDIUM`

Do NOT flag plain debug logs like `console.log('debug')` or `console.log(count)` — those are noise. Flag only when the logged value is, or transitively contains, one of:

- A request body (`req.body`, `request.body`, the parsed body of a Route Handler).
- A request headers object (may contain `Authorization`, `Cookie`).
- A user / session / account object (likely contains `passwordHash`, `email`, `refreshToken`).
- A token, secret, API key, JWT, or OAuth code.
- A full env / config object.

On the server, this leaks to stdout / CloudWatch / Datadog. On the client side it leaks into the browser console where any extension can read it. Same severity (`MEDIUM`); same fix (remove the log, or replace with a structured log of just the safe identifiers).

### XC.3 Disabled SSL/TLS verification in HTTP client — `CRITICAL`

`new https.Agent({ rejectUnauthorized: false })`. Never in production.

### XC.4 Hardcoded admin credentials / default password — `CRITICAL`

Comparing a literal admin password (e.g. `password === 'admin'`) anywhere in auth code is a master-password backdoor.

### XC.5 Sensitive data in URL query string — split severity

URLs are logged everywhere (browser history, server logs, analytics, referrer headers). Calibrate by what's in the query:

- **Auth tokens, password reset tokens, OAuth codes, API keys, JWTs in `?query=` — `HIGH`.** These directly enable account takeover if logs leak.
- **PII (email, SSN, account number) in `?query=` — `MEDIUM`.** Logging exposure, not direct compromise. Move to `POST` body or path segment with proper auth.

---

## Sources

- OWASP — [Top 10:2021](https://owasp.org/Top10/), [ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/)
- Next.js — [Data Security guide](https://nextjs.org/docs/app/guides/data-security)
- NestJS — [Authentication](https://docs.nestjs.com/security/authentication), [Authorization](https://docs.nestjs.com/security/authorization)
- Turbostarter — [Next.js Security Guide 2025](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices)
- everything-claude-code — `agents/security-reviewer.md`, `skills/security-review/SKILL.md`
