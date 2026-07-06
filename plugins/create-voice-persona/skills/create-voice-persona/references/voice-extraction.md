# Voice Extraction — Mining a Writing Corpus into a Voice Profile

How to turn a person's raw writing samples into the base-voice file of their persona package. This is the step everything else depends on: the variants are register deltas on top of the base voice, and the base voice is only as true as the extraction. The proven pattern (from the Luke Rhodes package this skill generalises) is **raw samples as ground truth** — where any synthesised guidance conflicts with a quoted sample, the sample wins, and the base-voice file says so explicitly.

## 1. Corpus intake

Ask for everything the person can give, then work with what arrives. Grade the corpus in **words**, not documents — stylometric research puts the thresholds there (see `voice-replication-research.md`): basic patterns emerge at ~300–500 words, function-word and syntax distributions stabilize around ~2,000.

- **Ideal corpus:** 2,000+ words across 10+ samples spanning at least three registers (e.g. LinkedIn posts AND work chat AND a doc or email), including some pre-2023 writing if it exists (guaranteed human, per the AI-signs guide's dating logic).
- **Workable corpus:** ~800–2,000 words in one or two registers. Extract what's evidenced; mark register gaps `[Uncertain]` and interview the person to fill them (see §5).
- **Thin corpus:** under ~800 words. Say so plainly, extract only what repeats, and lean heavily on the interview. Do not pad the profile by inventing traits — a wrong voice profile is worse than a sparse one, because every piece the persona ever writes inherits the error.

Registers are not equally hard: replication measurably succeeds on structured writing and fails hardest on **casual voice** (chat, social, short-form). Demand the most corpus evidence for exactly the registers that look most throwaway, and say in the delivery note which variants rest on thin evidence.

Also collect **identity context**: who the person is, role, company, audience, topics they post about, and any self-declared rules ("I never use emojis", "I hate em dashes"). Self-declared rules count as evidence even with zero corpus occurrences.

Provenance check: ask whether any sample was itself AI-assisted. AI-flavoured samples poison the extraction (you'd be cloning ChatGPT back at the person); prefer samples they wrote unaided, and if a sample shows heavy tell-density from `ai-writing-signs.md`, quietly down-weight it and confirm with the person.

## 2. What to extract (the observation grid)

Read every sample twice: once for what the person says, once for how. Fill this grid with **quoted evidence**:

| Dimension | What to look for |
|---|---|
| **Syntactic fingerprint** | The subconscious layer — the strongest authorship markers per the stylometry research: sentence-length spread (humans are spiky; note their short/long extremes, not just the average), active vs passive habits, clause complexity, how often sentences open with And/But/So, participial-clause and nominalization appetite (most people use far fewer "-tion/-ment/-ness" abstractions than an LLM defaults to) |
| **Mechanics** | Punctuation habits (dash use, semicolons, ellipses, exclamation marks), spelling variety (AU/UK/US), capitalisation, paragraph length, list style, emoji use and where |
| **Lexicon** | Openers and connectors they actually use, softeners on asks/critiques, hedges, plain-ownership phrasing, signature words/phrases, contraction density |
| **Structure** | How they open (straight in? context first?), how they close (question? plain landing? sign-off?), how they sequence an argument, where examples land relative to claims |
| **Stance & temperament** | How opinions are delivered (blunt? stated-then-softened? question-shaped?), how disagreement is handled, how praise is given, warmth level, formality range |
| **Humour** | Type (dry, silly, absent), frequency, targets it never touches |
| **Evidence style** | Numbers exact or rounded, anecdotes vs data, whether they cite/link, "e.g." habits, edge-case handling (footnotes? "Note:" lines? parentheses?) |
| **Anti-patterns** | Things conspicuously absent from the corpus that generic writing would include (hype adjectives, exclamation marks, emoji, corporate phrasing) — absence across a decent corpus is evidence of a rule |

## 3. Evidence discipline

- **Two-occurrence rule.** A habit becomes a stated rule when it appears in 2+ independent samples, or once plus the person's confirmation. A single striking instance is recorded as a *sample anchor*, not a rule.
- **Provenance markers.** Every non-obvious claim in the base-voice file carries `[Source: <sample>]`, `[Inference]`, or `[Uncertain]` — same discipline as the create-persona framework. The person reviewing their own profile can then verify at a glance.
- **Person-tells vs AI-tells.** The person's authentic habits may overlap the AI-signs list (a human who genuinely loves em dashes, or writes `**bold:**` bullet lists). The corpus wins for their *personal* habits — but note it in the profile ("uses em dashes naturally; lint set to advisory, not hard-fail, and never in the spaced punchy-parallelism pattern") so drafts don't drift from "their occasional dash" into "ChatGPT dash density". Where the corpus is silent, default to the human-signs side of `ai-writing-signs.md` §4.
- **Don't inherit Luke.** The reference implementation (Luke's package) bans em dashes, uses AU spelling, and softens asks. Those are *his* extracted facts, not defaults. Every rule in a new package must trace to this person's corpus or interview.

## 4. Sample anchors

Select 5–8 verbatim quotes across registers and put them in the base-voice file under "pattern-match against these". Choose quotes that *demonstrate* the extracted rules (the softener in action, the actual dash habit, the way they close). These anchors are the highest-value part of the profile: exemplars measurably beat descriptions for style transfer, and the effect saturates around five exemplars — so past that count, spend selections on **diversity** (different registers, moods, lengths), not more of the same. The anchors are also the reviewer's ground truth. Never edit the quotes, including their typos.

**Anchors are style ground truth, never fact sources.** Models demonstrably leak exemplar *content* into new pieces (style–content entanglement); the generated package must state that facts, anecdotes, and names inside the anchors never migrate into new drafts.

## 5. The gap interview

After extraction, list what the corpus couldn't tell you and ask in **one batched message**. Typical gaps:

- Registers with no samples ("I have your LinkedIn voice; how do you write to your team on Slack — same warmth, or looser?")
- The stance dimension ("When you disagree publicly, do you name the person/idea directly or argue the abstract point?")
- Hard rules ("Anything you never do — emoji, exclamation marks, em dashes, hashtags?")
- Topics/opinions territory ("Any topics off-limits? Any hills you'll always die on?")
- Compliance context (public company? regulated industry? founder posting under their own name?) — this drives whether the generated package needs a compliance gate like the reference package's.

## 6. Synthesis into the base-voice file

Write the base-voice file per the template in `package-blueprint.md`. Order matters: identity context first (so the voice has a centre), the voice in one breath, core principles (5–8, each traceable), lexicon, mechanics (the lintable rules live here), corpus habits, sample anchors, and the final "would [Name] send this?" test framed around how *they* would react to a wrong line.

The one-breath summary is worth real effort: one sentence a stranger could hold in mind while writing ("Calm, direct, technically fluent without showing off, quietly witty, genuinely considerate of the reader's time" is the reference example). If you can't write it, the extraction isn't done.

Quality bar before moving on to variants:

- Every rule evidenced or marked; zero rules copied from the reference package without corpus support.
- Sample anchors present and verbatim; the anchors-are-not-facts rule stated.
- The person's anti-patterns (never-does list) captured, not just their does-list.
- The syntactic fingerprint captured — run `python3 scripts/voice_lint.py --extract-fingerprint <corpus files…>` to compute it mechanically (sentence-length spread, contraction rate, punctuation densities, nominalization rate) and paste the emitted block into `voice-lint.json`; describe the same habits in prose in the base voice.
- Every trait encoded as a mechanical rule or a quoted example — an adjective on its own ("casual", "witty") is a null instruction that invites the model's own priors.
- Mechanics section concrete enough to generate the `voice-lint.json` from it mechanically.
- Read the profile back as the person would: if any line would make them say "I don't do that", fix it now — it's about to be multiplied across every variant. Remember this read-back catches *defects*, not certifies fidelity: a model's own "sounds like them" judgment is empirically uncalibrated (see `voice-replication-research.md`), so fidelity rests on the anchors, the lint, and the person's review.
