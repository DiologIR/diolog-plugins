# token-discipline

Session-start operating defaults that cut token spend without cutting quality, tuned for Claude
Opus 5.

## The premise

Most of what a session costs is not what anyone typed. Every turn resends the whole conversation from
the top. In one practitioner's corpus — 3.77B tokens through a workspace in a day — **96% was reused
input**.

So the lever is not shorter prose. It is not resending, not re-reading, and not opening a fresh
prefix somewhere else.

## What it does

A ~1029-byte block, designed to sit at the front of the system prompt so it lands inside the cached
prefix — paid for once per cache window, read at cache-read price after. It covers, in order of how
many tokens each moves:

1. **Delegation default.** Each subagent hop pays a fresh prefix — system prompt plus every tool
   definition (~55k tokens for a typical multi-server setup, per Anthropic). A delegated one-line
   lookup can cost more than the answer. Opus 5 delegates readily, so this is the largest single
   behavioural lever a preamble has.
2. **Read width.** Search first, open narrow. Opening a whole file for one fact is the largest
   avoidable input cost, and input is the 96%.
3. **The read-only/read-write boundary.** Stated as a mechanism, not a rule: earlier conversation is
   cached and cheap to keep; re-emitting settled content is the expensive operation. A rule with a
   mechanism generalises to cases the rule never enumerated.
4. **One artifact, once — and no trailing verification pass.** This one works by *removing* an
   instruction most prompts still carry. Opus 5 self-verifies; carried-over "double-check your work"
   causes over-verification with no quality gain.
5. **The quality floor.** "Cut restatement, never reasoning." Without it the block is a quality
   regression with a good metric — told only to be brief, a model prunes caveats and *why* first.

## What it is not

Not a prose-compression skill. The register stays normal; output brevity is the least valuable axis
and gets the least space.

If you want the argument for that in full — including where prose compression is straightforwardly
better, and the four-arm benchmark that would settle it — see
`skills/token-discipline/references/vs-caveman.md`. The two are not exclusive, and the honest
recommendation is to test the pair rather than pick.

## Honesty

**Measured, with source:** the 96% reused-input figure; ~55k tokens of tool definitions (Anthropic);
Opus 5's specific over-behaviours — longer default responses, ready delegation, self-verification,
scope expansion, correction narration (Anthropic's Opus 5 prompting guide).

**Not measured:** whether this block saves more than it costs on real traffic. It has not been A/B'd.

The number that would settle it is **total session tokens including cache misses**, never per-turn
output length — a preamble can always be tuned to shrink visible output while forcing more turns,
more tool calls or more delegation to finish the same task, so the per-turn figure improves while
total spend rises.

## Design notes worth knowing before editing

The block is a **literal**. No interpolation, no clock, no session id, no account name, no counter,
no version string. The prompt cache matches an exact byte prefix, so anything that varies converts a
paid-once block into a cache-miss generator — and the miss re-sends the whole conversation at full
price. A test fails on any digit in the text, on the grounds that every session-varying value renders
with one.

Register is declarative throughout. No `MUST`, `ALWAYS` or `CRITICAL` — those now *over*-trigger on
current models, which is the opposite of the intent. Every clause is a default with an escape hatch.

The block never asks the model to confirm it followed the block. That would spend output tokens
auditing an instruction whose purpose was spending fewer output tokens.

**Rejected, with reasons**, because each will be proposed again: stripping tool definitions for
unused servers (the tool array is *in* the cached prefix — churning it converts a paid-once cost into
a repeated one, and silently removes capability), transport-layer prefix truncation, a response cache
keyed on request hash, and a plain "be concise" instruction. Full reasoning in `SKILL.md`.

## Use with Perch

Perch injects the block at session start behind a toggle in Settings (**Token discipline → Send
session defaults**), default on. The proxy-side dep defaults to off, so a build that wires nothing
forwards today's exact bytes; the shipping default lives in the app.

Standalone use works too — the skill is readable on its own, and the block is quoted verbatim in
`references/injected-block.md`.

## Licence

MIT.
