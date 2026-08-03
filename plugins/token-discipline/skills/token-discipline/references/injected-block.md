# The injected block — v3

Everything between the fences is what Perch writes into the request's `system` field at session
start. It is a **literal**. No interpolation, no clock, no session id, no account name, no counter.

Byte count is pinned by a test (736). Changing the text means bumping the version and the pinned
number in the same commit — see `SKILL.md § Editing the block`.

```text
Report only deltas on plans, diffs, conclusions and explanations you have already shown; restate
them when asked, or to correct them.

Say in one sentence what you are about to do before the first tool call, then update only on a
finding, a change of direction, or a blocker. Lead the final message with the outcome.

Match a written file's length to what the task needs. No filler sections, no redundant summaries.

Keep direct lookups and sequential work in this thread. Delegate only large, genuinely independent
work; do not delegate verification.

Search first, then open the part you need.

Cut restatement, never reasoning. Uncertainty, caveats, security warnings, destructive-action
confirmations and required verification stay.
```

## Notes for whoever maintains this

**Why there is no version string in the text.** It would be useful at 3am and it costs prefix bytes
to learn something the proxy already logs. Perch logs the block version per turn; the model does not
carry it.

**Why no MUST, ALWAYS or CRITICAL.** Current models over-trigger on that register. The sourced form
of that claim is narrower than it is usually quoted as — Anthropic's prompting guide says it of Opus
4.5/4.6 and specifically about **tool and skill triggering**, not about every instruction on every
model — but the direction still holds for a block whose whole job is to be a default rather than a
demand. Every clause here is a statement about how the session works, with somewhere to go other
than over-complying.

**Why the delegation clause names the exception in evaluable terms.** "Large, genuinely independent"
is something the model can assess. Without a recognisable exception the clause over-triggers in the
other direction and a genuinely parallel investigation gets crammed in-thread, which costs far more
than the hops saved. `do not delegate verification` is there because delegated verification is the
expensive kind: it pays a fresh prefix to re-derive context the main thread already has.

**Why the last line enumerates what survives.** Without it, a model told to spend fewer tokens prunes
caveats and reasoning first — cheapest to cut, most expensive to lose, and invisible in any per-turn
metric. Naming security warnings, destructive-action confirmations and required verification is not
padding: those are the three a token metric actively rewards dropping.

**Why "required verification stay" and not "no verification pass".** See `SKILL.md § What v3 changed,
and why`. v1 told the model to skip the trailing check, which contradicts this repo's own mandatory
CP §7 self-review — and made every token metric improve when the security gate stopped running.

## v1 — retained for replay, not for use

A harness that pins the block per conversation replays the exact bytes that conversation started
with, so a conversation opened before v3 must keep emitting v1's 1,029 bytes for the rest of its
life. The literal below is retained verbatim for exactly that, and its digest should be pinned by a
test. **It is not the current block — do not edit it, and do not copy from it when editing v3.**

```text
Session defaults.

Everything already in this conversation is cached and cheap to keep. Re-emitting or rewriting
settled content is the expensive operation — repetition costs, not length. So point at what is
already in context rather than restating it, leave correct text alone unless a fact in it changed,
and don't re-summarise a plan or diff you have already shown.

Work stays in this thread unless a subtask genuinely needs its own context window, or is a wide
independent search whose intermediate output you don't need to see. Each delegation pays for a fresh
prefix, so a small hop can cost more than the answer.

Read narrowly: search first, then open the part you need. Opening a whole file to find one fact is
the largest avoidable cost in a session.

One artifact, once. No trailing verification pass — you already check your own work, and a second
one spends tokens without changing the answer.

When something has to go, cut restatement, never reasoning. The recap is disposable; the caveat and
the why are not.
```

**There is no v2.** It was drafted and never shipped, so no conversation was ever pinned at it. A
row naming `blockVersion: 2` is unreproducible and fails open to the caller's original bytes.
