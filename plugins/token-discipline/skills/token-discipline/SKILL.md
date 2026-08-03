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
| **The block** | ~110 words (736 bytes, v3) injected into the request's `system` field at session start | `references/injected-block.md` — verbatim, byte-stable |
| **This file** | Why the block says what it says, what was rejected, and what is measured vs assumed | Read when editing the block or debugging a session |
| **`references/vs-caveman.md`** | Why we expect this to beat a prose-compression skill, where caveman is straightforwardly better, and the four-arm eval that would settle it | Read before assuming the two compete, or before benchmarking |

The block is not this file compressed. It is a separate, versioned, size-pinned literal.

**Retain every literal you have ever shipped.** If your harness pins the block per conversation and
replays exact bytes — and it should, or the block becomes a cache-miss generator — a conversation
opened before v3 keeps emitting v1 for the rest of its life. v1 (1,029 bytes) is kept verbatim for
that. Deleting or tidying a retired literal re-mints every conversation still pinned to it at full
price.

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

Ordered by how many tokens it actually moves. Every clause has to do something Claude Code's own
system prompt does **not** already do — scope discipline and correction narration ship near-verbatim
in that prompt, so v3 omits both rather than paying prefix bytes to repeat them.

**1. Delegation default.** Opus 5 delegates to subagents more readily than prior models, and each hop
pays a *fresh prefix* — system prompt plus every tool definition. A delegated one-line lookup can
cost more than the answer. So the block states a default with a named exception rather than a ban: a
hard prohibition would be worse than the delegation, because a genuinely parallel six-file
investigation kept in-thread blows the context window and costs far more than the hops saved. The
exception has to be evaluable by the model — "large, genuinely independent", not "is big". The
clause also names one thing not to delegate: verification, which is the most expensive kind of
delegation because the sub-agent pays a fresh prefix to re-derive context the main thread already
holds.

**2. Read width.** Search first, open narrowly. Opening a whole file to find one fact is a real and
avoidable *input* cost, and input is where 96% of the spend is. v1 called it "the largest avoidable
cost in a session"; that superlative is unmeasured and often false — tool schemas (~55k tokens for a
typical multi-server setup), a subagent's fresh prefix, and a single cache miss on a large
conversation are each routinely bigger. v3 keeps the instruction and drops the ranking, because the
instruction is what does the work.

**3. Report deltas, not restatements.** The first clause and the largest one by expected saving:
don't re-emit plans, diffs, conclusions or explanations that are already in the conversation. v1
justified this with a mechanism ("everything already in this conversation is cached and cheap to
keep"), which reads well but is overbroad — only an exact byte prefix through a *reachable*
breakpoint is a cache read, and "repetition costs, not length" is false as an absolute, since length
still consumes context and cache-read headroom. v3 states the rule and names its escape hatches
(restate when asked, or to correct) rather than teaching a mechanism it would have to qualify.

**4. Progress narration, bounded.** One sentence before the first tool call, updates only on a
finding, a change of direction, or a blocker, outcome first in the final message. This is the clause
Anthropic's own Opus 5 guidance most directly supports: the model narrates more than its
predecessors by default, and it responds to explicit guidance on *how* to communicate rather than
just how much.

**5. The quality floor.** "Cut restatement, never reasoning." Without this line the block is a
quality regression with a good metric: told only to be brief, a model prunes caveats and *why* first,
because those are the cheapest tokens to cut and the hardest absence to notice until something ships
wrong. v3 enumerates what survives — uncertainty, caveats, security warnings, destructive-action
confirmations, required verification — because those five are exactly what a token metric rewards
dropping.

## What v3 changed, and why

v3 replaced a 1,029-byte v1 whose clause 4 was actively harmful. v1 said:

> One artifact, once. No trailing verification pass — you already check your own work, and a second
> one spends tokens without changing the answer.

`CLAUDE.md` requires the **CP §7 self-review** before reporting a change done, and CP §7's own
heading is "Agent self-review (run before reporting the change done)". Same trigger point, opposite
instruction. Skipping the review is cheaper, so **every token metric improves when the security gate
stops running** — a regression no dashboard can see.

The rationale v1 carried was sound and the literal did not implement it. Anthropic's Opus 5 guidance
asks you to **remove your verification instructions** because the model already verifies; v1 removed
nothing and added a prohibition instead. v3 drops the clause and, in the quality floor, names
required verification as something that stays. A test asserts the block does not re-acquire that
shape.

Also removed: `Session defaults.` (an inert 17-byte heading with no behavioural effect), and the two
overbroad claims described in items 2 and 3 above.

**No general conciseness clause was added, and none should be.** Anthropic's Opus 5 guide does
recommend keeping disclaimers and caveats short, but measured evidence says brevity instructions cost
accuracy: Giskard's Phare benchmark found hallucination resistance dropping sharply under a
"be concise" system prompt (84%→64% on Gemini 1.5 Pro, 74%→63% on GPT-4o), and Renze & Guven
(arXiv:2401.05618) measured a 27.69% math-accuracy penalty under Concise CoT. Cutting *presentation*
is safe; cutting *hedging* is not, because the hedge is the confidence signal.

## Register: declarative, never imperative

Every line in the block is a statement about how the session already works, with an escape hatch, so
the model has somewhere to go other than over-complying.

The usual justification for this is that "Anthropic's guidance says aggressive phrasing
(`CRITICAL:`, `You MUST`) now causes over-triggering". That is sourced but **narrower than it is
normally quoted as**: `claude-prompting-best-practices` says it of **Opus 4.5 and 4.6**, and
specifically about prompts written to reduce **undertriggering on tools or skills** — not about every
instruction on every model. The direction still holds for this block, whose whole job is to be a
default rather than a demand, but do not cite it as a general law of current models; a test enforces
the register directly, which is the honest guardrail.

This also avoids a self-defeating loop the adversarial pass caught: a block that says "confirm you
are following these token-saving rules" spends output tokens auditing compliance with an instruction
whose entire purpose was spending fewer output tokens. The savings fund their own audit. The block
therefore never asks the model to verify, confirm, or report that it followed the block.

## What was considered and rejected

These look like the obvious wins. Each is a trap, and the reason matters more than the verdict —
someone will propose all four again.

| Rejected | Why it is a trap |
| --- | --- |
| **Strip tool definitions for unused servers** (~55k tokens of definitions is real money) | The tool array is *in the cached prefix*. Mutating it mid-conversation converts a paid-once cost into a paid-repeatedly one, and silently removes capability the model may need next turn. **Narrower than it used to be:** the API now has two cache-preserving paths — tool search appends discovered schemas rather than swapping them, and `mid-conversation-tool-changes-2026-07-01` (Opus 5 onward) adds/removes tools via `tool_addition`/`tool_removal` blocks without invalidating the prefix. Ordinary tool-array mutation from a proxy is still the trap; "you can never change the tool set" is no longer true. |
| **Proxy diffs and truncates the resent prefix on the wire** | Truncating history the model needs is a correctness bug wearing a savings costume, and it rewrites the prefix by construction. |
| **Local response cache keyed on request hash** | Byte-identical requests essentially do not occur in agentic sessions — every turn appends. A stale replay is a correctness bug. |
| **Make the model echo a version hash for debuggability** | The proxy already knows the version and can log it for free. Making the model carry it spends prefix bytes to learn something already recorded. |
| **A "be concise" instruction** | It prunes reasoning and caveats first, with measured accuracy cost. See the quality floor and *What v3 changed, and why*. |
| **Caveman-style compressed register** | Measured ~65% output-token cut, and output is the smallest axis. It also buys that cut in the register the user least wants and at some decode cost. Terse, not comic. |
| **Telling the model to skip a verification pass** | v1 did this and it contradicted the repo's own CP §7 gate. Remove *your* verification instructions instead; do not add a prohibition. |

## Honesty about the numbers

Anyone maintaining this should know which claims rest on what.

**Measured, with source:**
- 96% reused input across 3.77B tokens in one workspace-day — the practitioner corpus behind the
  15-rule writeup this skill draws on. Not measured on Perch's own traffic.
- ~65% output-token reduction for caveman-style compression — measured by that skill's own benchmarks.
- ~55k tokens of tool definitions for a typical multi-server setup — Anthropic's published figure.
- Accuracy cost of brevity instructions — Giskard Phare (hallucination resistance 84%→64% on Gemini
  1.5 Pro, 74%→63% on GPT-4o under a "be concise" system prompt) and Renze & Guven,
  arXiv:2401.05618 (27.69% math-accuracy penalty under Concise CoT). Neither was run on Claude Opus
  5; they are the reason the block has no general conciseness clause, not a measurement of one.
- Opus 5's specific over-behaviors (longer default responses, ready delegation, self-verification,
  scope expansion, correction narration) — Anthropic's Opus 5 prompting guide.

**Sourced but narrower than usually quoted:**
- "Aggressive phrasing over-triggers on current models" — `claude-prompting-best-practices` says this
  of **Opus 4.5/4.6**, about prompts written to fix **tool/skill undertriggering**. Not a general law
  about all instructions on all models. See *Register* above.

**Assumed, not measured:**
- That this block's savings exceed its own cost on Perch's real traffic. It has not been A/B'd.
  The honest measurement is **total session tokens including cache misses**, never this-turn output
  length — a preamble can always be tuned to shrink visible output while forcing more turns, more
  tool calls or more delegation to finish the same task, and the per-turn number improves while total
  spend rises.
- **The instrument is buildable; the answer does not exist yet.** A three-arm experiment — no block /
  the retained v1 literal / the current literal — assigned per conversation from a domain-separated
  hash, pinned for that conversation's life, and stamped on every spend row it produces (arm, whether
  the experiment was live, the block version that actually reached the wire).
  It is enrolled at **0% by default**, so until an operator opts in nothing is measured and no traffic
  changes. Do not upgrade any sentence here to a claim of saving until rows exist to support one.
- **And that measurement is not available for every session.** Perch keys turns by
  *cache-conversation segment*: absent an `X-Perch-Session` header it fingerprints the first user
  turn, and `/compact` replaces that turn, so a long session splits into segments that are not
  summed. Perch supplies the header only to sessions it spawns itself (`perch run`, supervised
  workers); a `claude` you start in a terminal is not a Perch child and stays segment-scoped. So for
  the sessions most likely to run long enough to matter, the number above is a **per-segment** total.
  Every spend row records which it is (`session_joinable`), so an analysis can restrict to
  whole-session data instead of quietly summing segments — **a result from this experiment is
  segment-scoped and must not be reported as "total session tokens".**
  Measured constraint behind that: a per-invocation `ANTHROPIC_CUSTOM_HEADERS` in the child's
  environment is replaced wholesale by the project settings file Perch writes, so only the CLI's
  `--settings` scope can carry the id — and only where Perch does the launching.
- That v3's 736 bytes buy more than v1's 1,029 did. The size drop is arithmetic; the quality claim is
  not. What *is* argued rather than measured is that v1's clause 4 contradicted a mandatory gate,
  which is a correctness argument and does not depend on the byte count either way.

Do not let the measured numbers lend their credibility to the assumed ones.

## Editing the block

The block is size-pinned on purpose. An innocuous-looking tweak retroactively changes the cost of
every session started afterwards, so:

1. Edit `references/injected-block.md` **and** whatever literal your harness injects, together — a
   test should assert they do not drift (compare on collapsed whitespace, so the markdown may wrap
   differently).
2. Bump the version in the same commit, and **add the outgoing literal to the retained set before you
   overwrite it**. A version that is pinned but not retained fails open; a version retained wrong
   silently rewrites the front of every warm prefix that names it. Rows only ever get added.
3. Update the pinned byte count and digest; a size or wording change that does not bump the version
   should fail the gate rather than ship quietly.
4. Re-read the register and quality-floor tests. They are worded for the current text — the v3 edit
   broke `blockKeepsTheQualityFloor` because v3 capitalises "Cut restatement" where v1 had it
   mid-sentence, which is exactly the class of failure that looks like a regression and is not.
5. State in the commit what behaviour you expect to change. "Tightened wording" is not a reason to
   invalidate every cache window.

Adding a line is not free even when it reads as free. The ceiling exists so that cost is visible
before it ships rather than after someone notices the bill.
