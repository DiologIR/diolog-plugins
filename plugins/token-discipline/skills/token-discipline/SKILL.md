---
name: token-discipline
description: >
  Session-start operating defaults that cut token spend without cutting quality, tuned for Claude
  Opus 5. Injected by the Perch proxy into the cached system prefix at session start, so it is paid
  for once and read at cache-read price on every later turn. Use when someone asks to reduce token
  usage, stop hitting usage limits, make sessions cheaper, "why is this burning so many tokens",
  or asks about context/prompt-cache economics — and when authoring or editing the injected block
  itself. Not a prose-compression style: it targets repetition, delegation, and read width, which is
  where the tokens actually are.
license: MIT
---

# Token discipline

Most of what a session spends is not what anyone typed. Every turn resends the whole conversation
from the top — one practitioner measured 3.77B tokens through a workspace in a day, **96% of it
reused input**. So the lever is not shorter prose. It is *not resending, not re-reading, and not
re-opening a fresh prefix somewhere else.*

This skill is two things, and keeping them apart is the point:

| Artifact | What it is | Where it lives |
| --- | --- | --- |
| **The block** | ~160 words injected into the request's `system` field at session start | `references/injected-block.md` — verbatim, byte-stable |
| **This file** | Why the block says what it says, what was rejected, and what is measured vs assumed | Read when editing the block or debugging a session |
| **`references/vs-caveman.md`** | Why we expect this to beat a prose-compression skill, where caveman is straightforwardly better, and the four-arm eval that would settle it | Read before assuming the two compete, or before benchmarking |

The block is not this file compressed. It is a separate, versioned, size-pinned literal.

## Why placement decides everything

The prompt cache matches an **exact byte prefix**. That gives exactly two places to put a preamble,
with opposite economics:

- **In the cached prefix (the `system` field):** paid once per cache window, read cheap forever
  after. Any change invalidates the whole prefix and resends the conversation at full price.
- **After the last cache breakpoint:** costs 1.0× its own tokens *every turn, forever*, and never
  gets cheaper. Perch's existing `injectRecalledMemory` does this deliberately, for content that has
  to be fresh.

A token-saving preamble delivered the second way is a permanent tax that funds nothing. So the block
goes in the `system` field and is **byte-identical for the life of the session** — no timestamp, no
session id, no account name, no counter, no model-visible version string. The moment something in it
varies, it stops being a preamble and becomes a cache miss generator.

That constraint is unintuitive enough to state plainly: **the most expensive thing this feature could
do is edit itself.**

## What the block covers, and why each earns its bytes

Ordered by how many tokens it actually moves.

**1. Delegation default.** Opus 5 delegates to subagents more readily than prior models, and each hop
pays a *fresh prefix* — system prompt plus every tool definition. A delegated one-line lookup can
cost more than the answer. So the block states a default with a named exception rather than a ban: a
hard prohibition would be worse than the delegation, because a genuinely parallel six-file
investigation kept in-thread blows the context window and costs far more than the hops saved. The
exception has to be evaluable by the model — "needs its own context window", not "is big".

**2. Read width.** Search first, open narrowly. Opening a whole file to find one fact is the largest
avoidable *input* cost, and input is where 96% of the spend is. Output brevity is the least valuable
axis and gets the least space here.

**3. The read-only/read-write boundary.** The block tells the model something it otherwise cannot
know: earlier conversation is cached and cheap to keep; re-emitting or rewriting settled content is
the expensive operation. This is the one place the block explains a *mechanism* rather than stating a
rule — deliberately, because a rule with a mechanism generalises to cases the rule never enumerated,
and because it converts "don't rewrite for elegance" from an arbitrary style preference into an
obvious consequence.

**4. One artifact, once — and no trailing verification.** Opus 5 self-verifies without being asked.
Anthropic's own guidance is that carried-over "double-check your work" instructions cause
*over*-verification and waste tokens with no quality gain. This part of the block works by **removing**
an instruction most prompts still carry, which is why it is nearly free.

**5. The quality floor.** "Cut restatement, never reasoning." Without this line the block is a
quality regression with a good metric: told only to be brief, a model prunes caveats and *why* first,
because those are the cheapest tokens to cut and the hardest absence to notice until something ships
wrong.

## Register: declarative, never imperative

Anthropic's guidance is explicit that aggressive phrasing (`CRITICAL:`, `You MUST`) now causes
**over**triggering on current models — the opposite of the intent. Every line in the block is a
statement about how the session already works, with an escape hatch, so the model has somewhere to go
other than over-complying.

This also avoids a self-defeating loop the adversarial pass caught: a block that says "confirm you
are following these token-saving rules" spends output tokens auditing compliance with an instruction
whose entire purpose was spending fewer output tokens. The savings fund their own audit. The block
therefore never asks the model to verify, confirm, or report that it followed the block.

## What was considered and rejected

These look like the obvious wins. Each is a trap, and the reason matters more than the verdict —
someone will propose all four again.

| Rejected | Why it is a trap |
| --- | --- |
| **Strip tool definitions for unused servers** (~55k tokens of definitions is real money) | The tool array is *in the cached prefix*. Churning it converts a paid-once cost into a paid-repeatedly one, and silently removes capability the model may need next turn. |
| **Proxy diffs and truncates the resent prefix on the wire** | Truncating history the model needs is a correctness bug wearing a savings costume, and it rewrites the prefix by construction. |
| **Local response cache keyed on request hash** | Byte-identical requests essentially do not occur in agentic sessions — every turn appends. A stale replay is a correctness bug. |
| **Make the model echo a version hash for debuggability** | The proxy already knows the version and can log it for free. Making the model carry it spends prefix bytes to learn something already recorded. |
| **A "be concise" instruction** | It prunes reasoning and caveats first. See the quality floor above. |
| **Caveman-style compressed register** | Measured ~65% output-token cut, and output is the smallest axis. It also buys that cut in the register the user least wants and at some decode cost. Terse, not comic. The full argument, including where caveman wins, is in `references/vs-caveman.md` — the two are not exclusive and the honest recommendation is to test the pair. |

## Honesty about the numbers

Anyone maintaining this should know which claims rest on what.

**Measured, with source:**
- 96% reused input across 3.77B tokens in one workspace-day — the practitioner corpus behind the
  15-rule writeup this skill draws on. Not measured on Perch's own traffic.
- ~65% output-token reduction for caveman-style compression — measured by that skill's own benchmarks.
- ~55k tokens of tool definitions for a typical multi-server setup — Anthropic's published figure.
- Opus 5's specific over-behaviors (longer default responses, ready delegation, self-verification,
  scope expansion, correction narration) — Anthropic's Opus 5 prompting guide.

**Assumed, not measured:**
- That this block's savings exceed its own cost on Perch's real traffic. It has not been A/B'd.
  The honest measurement is **total session tokens including cache misses**, never this-turn output
  length — a preamble can always be tuned to shrink visible output while forcing more turns, more
  tool calls or more delegation to finish the same task, and the per-turn number improves while total
  spend rises.

Do not let the measured numbers lend their credibility to the assumed one.

## Editing the block

The block is size-pinned on purpose. An innocuous-looking tweak retroactively changes the cost of
every session started afterwards, so:

1. Edit `references/injected-block.md`.
2. Bump the version in the same commit.
3. Update the byte count in the pinning test; a size change that does not bump the version should
   fail the gate rather than ship quietly.
4. State in the commit what behaviour you expect to change. "Tightened wording" is not a reason to
   invalidate every cache window.

Adding a line is not free even when it reads as free. The ceiling exists so that cost is visible
before it ships rather than after someone notices the bill.
