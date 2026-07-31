# The injected block — v1

Everything between the fences is what Perch writes into the request's `system` field at session
start. It is a **literal**. No interpolation, no clock, no session id, no account name, no counter.

Byte count is pinned by a test. Changing the text means bumping the version and the pinned number in
the same commit — see `SKILL.md § Editing the block`.

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

## Notes for whoever maintains this

**Why there is no version string in the text.** It would be useful at 3am and it costs prefix bytes
to learn something the proxy already logs. Perch logs the block version per turn; the model does not
carry it.

**Why "Session defaults." and not "Perch session defaults."** The block should read as how the
session works, not as a third party issuing instructions. A named authority invites the model to
narrate compliance with it, which is exactly the output spend this is trying to avoid.

**Why no MUST, ALWAYS or CRITICAL.** Current models overtrigger on that register — Anthropic's
guidance says so directly. Every clause here is a default with an escape hatch.

**Why the delegation clause names the exception in evaluable terms.** "Needs its own context window"
is something the model can assess; "is a big task" is not. Without a recognisable exception the
clause overtriggers in the other direction and a genuinely parallel investigation gets crammed
in-thread, which costs far more than the hops saved.

**Why the last line exists.** Without it, a model told to spend fewer tokens prunes caveats and
reasoning first — cheapest to cut, most expensive to lose, and invisible in any per-turn metric.
