# Why this is not caveman

`caveman` measured a ~65% output-token cut by rewriting the model's register. This skill does not do
that, and the difference is not taste — it is a claim about where the tokens are.

**None of what follows is measured.** It is the reasoning that produced the design. The eval is owed,
and the section at the bottom names the number that would settle it.

## The disagreement in one line

Caveman optimises the axis you can see. This optimises the axis you are billed for.

## The arithmetic behind that

Every turn resends the whole conversation from the top. One practitioner's corpus: 3.77B tokens
through a workspace in a day, **96% of it reused input**. Output is the remaining slice, and only the
newest sliver of that slice is what the model just wrote.

Cut 65% of output on a turn where output is 4% of the bill and you have cut ~2.6% of that turn. Real,
and worth having. But the same 65% cannot touch the 96%, and three of the behaviours below can.

That is the whole argument. Everything else follows from it.

## What each skill actually changes

| Lever | caveman | token-discipline |
| --- | --- | --- |
| Prose register | rewrites it (drops articles, fragments, short synonyms) | leaves it alone |
| Re-emitting settled content | not addressed | named as the expensive operation, with the mechanism |
| Delegation | not addressed | default in-thread; each hop pays a fresh prefix |
| Read width | not addressed | search first, open narrow |
| Trailing verification | not addressed | removed, because Opus 5 self-verifies |
| Where it lives | a skill the model invokes | bytes in the cached system prefix |

Four of those six rows are things caveman does not attempt. That is not a criticism of caveman —
it is a style skill and it does its job. It is a statement that a style skill and a context-economics
skill are different tools, and the second one was missing.

## Five specific reasons we expect this to do better

**1. Delegation is a bigger lever than prose, and neither skill's register touches it.** A subagent
hop pays a *fresh prefix* — system prompt plus every tool definition, which Anthropic put at ~55k
tokens for a typical multi-server setup. A delegated one-line lookup can cost more than the answer
would have. Opus 5 delegates more readily than prior models, so this is the single largest
behavioural lever a preamble has, and compressing the reply does nothing about it.

**2. Read width dominates output width.** Opening a whole file to find one fact is the largest
avoidable *input* cost in a session, and input is the 96%. A model that speaks tersely and still
dumps a 2,000-line file into context has saved the wrong thing.

**3. Caveman's own rules concede the ceiling.** From its SKILL.md: inventing abbreviations
(`cfg`/`impl`/`req`) saves **zero** tokens under the tokenizer and costs decode clarity; causal
arrows are their own token and save nothing. Those are honest notes, and they are also the shape of
the constraint — once the obvious compressions are known not to pay, what is left is grammar, and
grammar is a small and finite budget.

**4. The register is a cost, not just a preference.** The user's stated requirement here was terse
output that does not *sound* like a caveman. Beyond taste: dropped articles and fragments raise
ambiguity, which caveman itself handles with an Auto-Clarity escape hatch listing security warnings,
irreversible actions and multi-step sequences where omitted conjunctions risk misreading. That hatch
is the right call, and it is also an admission that the compression has a correctness cost the skill
has to spend rules defending against. This skill has no such hatch to maintain because it never
compresses meaning — it only declines to repeat what is already in context.

**5. Placement.** Caveman is invoked; this is injected into the cached prefix, so it is paid for once
per cache window rather than re-read. A skill body that the model consults costs something each time
it is consulted. ~1029 bytes sitting in the prefix does not.

## Where caveman is straightforwardly better

Being fair about this matters more than winning the comparison.

- **It has a number.** ~65% output reduction, measured by its own benchmarks. This skill has no
  measurement at all yet. A measured 2.6% beats an unmeasured hypothesis until the hypothesis is
  tested.
- **It works anywhere.** No proxy, no cache assumptions, no injection point. Install and go, across
  30+ agents.
- **On output-heavy work it wins outright.** Long explanatory answers, documentation generation,
  anything where the model talks far more than it reads — caveman is attacking the right axis and
  this skill barely helps.
- **The two are not exclusive.** Running both is coherent: caveman shrinks what is written, this
  shrinks what is re-sent, re-read and re-delegated. If anything the honest recommendation is to test
  the pair rather than pick.

## What would prove or kill this

The measurement is **total session tokens including cache misses**, across matched task cohorts, for
four arms: neither skill, caveman only, token-discipline only, both.

Do not use per-turn output length. A preamble can always be tuned to shrink visible output while
forcing more turns, more tool calls or more delegation to finish the same task — the per-turn number
improves while total spend rises, and that failure mode is invisible to exactly the metric people
reach for first.

Secondary readings worth capturing in the same run: cache read/write ratio (does the block ever
invalidate a prefix it should have ridden inside), subagent spawn count, and total bytes read from
disk. That last one is the input-side claim's direct evidence, and nobody has looked at it.

If the four-arm run shows this skill's arms indistinguishable from baseline on total tokens, the
argument above is wrong and the skill should be cut back to whatever survives.
