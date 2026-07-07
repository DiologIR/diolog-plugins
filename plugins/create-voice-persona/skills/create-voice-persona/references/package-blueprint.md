# Package Blueprint — What a Generated Voice-Persona Package Contains

The output of this skill is a **voice persona package**: a base voice plus purpose-tailored variants plus a deterministic lint, shaped like the proven `create-luke-content` package. This file specifies the package layout, the variant menu, and the template for every generated file.

Two delivery shapes (choose in Step 1 of the workflow):

- **Plugin scaffold** (default when working inside a Claude Code plugins repo): a full plugin `create-<name>-content/` with `.claude-plugin/plugin.json`, `skills/create-<name>-content/SKILL.md`, `references/`, and `scripts/`. The person gets a self-routing skill they can invoke forever.
- **Docs folder** (default elsewhere, or on request): the same markdown files and lint in a plain directory (e.g. `<name>-voice-persona/`), usable as drop-in context for any AI tool.

Either way the content files are identical:

```
<package>/
├── SKILL.md (plugin shape only — the router; template below)
├── references/
│   ├── <name>-voice.md          ← base voice (always; built per voice-extraction.md)
│   ├── ai-writing-signs.md      ← COPY VERBATIM from this skill's references/
│   └── personas/
│       ├── linkedin-post.md     ← flagship variant (built with linkedin-post-craft.md + user research)
│       └── <other variants>.md
└── scripts/
    ├── voice_lint.py            ← COPY VERBATIM from this skill's scripts/
    └── voice-lint.json          ← generated per-person config
```

Copy `ai-writing-signs.md` and `voice_lint.py` into every package unmodified so the package stands alone — the person may use it outside this plugin ecosystem.

## The variant menu

Offer these; build the ones the user picks (LinkedIn post is the flagship and the default). Each variant is a **register delta** layered on the base voice: it may move dials the base voice defines (warmth, softener density, exclamation allowance, length) but never break the hard rules (the person's mechanics, the AI-signs bans, grounding).

| Variant | Purpose | Lint format key |
|---|---|---|
| **linkedin-post** | Feed posts and thought leadership; engagement-optimised per `linkedin-post-craft.md` + any user-supplied research | `linkedin` |
| **long-form** | Blog articles, LinkedIn articles, essays (~1,500–2,200 words) | `blog` |
| **marketing** | Product announcements, release notes, launch/landing copy, campaign emails | `marketing` |
| **short-form** | X posts, LinkedIn comments/replies, bios, one-liners | `short` |
| **chat-informal** | Slack/Teams/WhatsApp professional-informal messages | `slack` |
| **email** | Professional email: outreach, replies, internal updates | `email` |
| **code-review** | PR comments and review summaries (technical people only) | `review` |
| **speaker-notes** | Talk scripts, podcast prep, webinar notes (spoken register) | `brief` |

Custom variants are welcome (investor updates, board memos, newsletters) — derive them the same way: what changes vs the base voice, what the destination rewards, what the failure modes are.

## Template: base voice file (`<name>-voice.md`)

```markdown
# <Full Name> — Voice Reference

[One paragraph: what this file is, that it's the non-negotiable base layer under every
variant, what corpus it was synthesised from, and the ground-truth rule: where guidance
conflicts with a raw sample below, the raw samples win.]

**How this file relates to the personas:** this is the constant. The files in `personas/`
are register deltas layered on top; they may move dials this file defines but never break
the hard rules ([list THIS person's hard rules]).

## Who <Name> is (so the voice has a centre)
[Role, company, audience, what their credibility rests on, what they write from.]

## The voice in one breath
[One sentence a stranger could hold in mind while writing as them.]

## Core principles
[5–8 numbered principles, each traceable to the corpus or interview, each with the
why. Not Luke's principles — this person's.]

## Lexicon and phrasing
[Openers/connectors, softeners, hedges, ownership phrasing, signature phrases,
contraction habits — with [Source:] markers.]

## Mechanics
[The lintable layer: dash policy, spelling variety, exclamation/emoji rules,
paragraphing, list style, capitalisation. Concrete enough to generate voice-lint.json
mechanically. Include the AI-signs bans that apply to everyone plus this person's own.]

## Syntactic fingerprint
[The subconscious layer, stated as counter-rules to the LLM default: their
sentence-length spread (quote a short one and a long one; "vary like this, not
uniform mid-length"), active/passive habit, And/But/So openers, plain verbs vs
nominalizations, participial appetite. The numeric version lives in
voice-lint.json's fingerprint block; this section is the prose version drafts
are written against. Anchors here are style ground truth, never fact sources —
facts inside samples must never migrate into new drafts.]

## Scope: voice shapes the delivery, never the content
[VERBATIM in every package, adapted only for the person's name and personas' natural
shapes. The voice governs *how* a piece reads, never *what* it contains — facts,
opinions, anecdotes, and asks come only from the prompt and its source material.
State the failure mode plainly: don't dress a bare request up into a whole
conversation. If the task is "summarise X", the output is the summary in <Name>'s
voice and nothing more. Forbid, as a bulleted list: invented continuity ("since last
time", "as I mentioned", any implied earlier exchange that didn't happen); invented
first-person experience or endorsement (a verdict the person never gave on a thing
they weren't asked to judge); invented calls to action, offers, or asks (a closing
line the request never contained); invented recipient or relationship. Close with:
a persona's natural structure is a container for real content, not a reason to
generate filler to fill it — when the task supplies no ask, no stance, no backstory,
the piece has none.]

## Habits from the wider corpus
[Register-crossing habits worth naming: how they handle edge cases, examples,
numbers, downsides, trade-offs. Only what's evidenced.]

## Authentic sample anchors (pattern-match against these)
[5–8 verbatim quotes across registers, each with a one-line note on what it
demonstrates. Never edited.]

## The "would <Name> send this?" test
[Closing self-check framed around how THIS person would react to a wrong line.]
```

## Template: variant file (`personas/<variant>.md`)

Follows the create-persona structural discipline (identity kernel → rules → decisions → constraints → examples). Keep it 40–80 lines; a variant is a delta, not a second base voice.

```markdown
# Persona — <Name>: <Variant>

Layer this over `../<name>-voice.md` (the base voice always applies). Use for: [the
destinations this variant covers].

## 1. Identity kernel
- **Core identity:** [the same person, in this register | one line]
- **Primary mission:** [what a piece in this register must achieve, measurable]
- **Cognitive model:** [how this register differs — selection/compression/expansion]

## 2. Register rules
[Open with the variant's position on the four NNG tone dimensions — formal↔casual,
serious↔funny, respectful↔irreverent, matter-of-fact↔enthusiastic — each expressed
as the mechanical levers that produce it (contractions, lexical choices, sentence
openers), never as bare adjectives. Then 6–10 bullets: the dials this variant moves
and where they sit. Format conventions of the destination (from the research layer
for LinkedIn). Each rule carries its why. For long-form variants (articles, book
chapters), include the re-anchoring rule: persona adherence decays over long
generations, so re-read the sample anchors before each major section and lint per
section, not once at the end.]

## 3. Shapes that work
[A small table of piece-shapes with skeletons, grounded in the person's corpus
where possible.]

## 4. Decision framework
[2–4 recurring judgement calls in this register: trigger → action → why.
E.g. "is this worth posting at all", "reply vs own post", "how hard to push back".]

## 5. Constraints
[The variant's own bans and budgets, on top of the base voice. Include the lint
format key and any compliance gate the person's context requires. Always include
the scope guard: never manufacture the piece's premise — no invented prior
conversation, no opinion on the subject unless the person's stance was supplied,
no closing ask/offer/CTA unless the task called for one; convey exactly what you
were given. For any register whose natural shape carries an ask (chat, email,
short-form, outreach), state explicitly that the ask-shape applies only when the
task genuinely has an ask — a pure FYI/summary/status share ends when the content
ends, with no bolted-on question or offer to satisfy the template.]

## 6. Worked examples
[Exactly 2, in <example> tags with <scenario> and <output>: one ordinary case, one
TENSION case (disagreement, bad news, a hard trade-off). The tension case is
mandatory — safety-aligned models default to emotionally flat, politely-resolving
examples, and a persona built only from those produces mush (EmoCharacter, NAACL
2025). Write the outputs AS the person, obeying every rule in the package, and
run them through the lint before shipping the package.]
```

## Template: generated router `SKILL.md` (plugin shape only)

Mirror the create-luke-content router, substituting this person's facts:

- Frontmatter `name: create-<name>-content`; a pushy `description` listing every built variant and the person's signature voice traits, with "use whenever the target author is <Name> (or 'my voice' / 'as me' when the user is <Name>)".
- **Step 1 — Route**: table mapping request signals → variant file → lint format key. Always load the base voice; load only the matching variant.
- **Step 2 — Gather inputs**: topic + source material for all types; stance mandatory for public pieces ("a topic without a stance produces generic mush; hold until you have it — do not invent <Name>'s opinion"); destination-specific needs per variant.
- **Step 3 — Absorb the source**: facts vs speculation; the stance is the spine, facts are the evidence. Include the **scope check**: write only what was asked, grounded only in the prompt and source; the voice controls *how* it reads, never *what* it contains; no invented continuity, first-person experience, endorsement, CTA, offer, ask, or recipient framing; a summary request gets a summary and stops, and a persona's natural shape applies only when the task genuinely carries an ask.
- **Step 4 — Draft** in the routed variant; base voice applies to every line.
- **Step 5 — Self-check then lint**: the "would <Name> send this?" test, the variant's constraints, then `python3 scripts/voice_lint.py --config scripts/voice-lint.json --format <key> draft.md`; fix and re-run until clean.
- **Step 6 — Deliver**: the content + a 2–4 line note (variant routed, stance written to, anything kept as opinion, lint result).
- **Constraints (all formats)** section restating the hard rules, the grounding rule, the scope rule ("answer the brief; don't invent the conversation around it" — no fabricated continuity, backstory, experience, endorsement, CTA, offer, ask, or recipient framing the request didn't supply), and any compliance gate.

## Generating `voice-lint.json`

Derive from the base voice's Mechanics section. Schema (consumed by `scripts/voice_lint.py`):

```json
{
  "person": "Full Name (metadata only; the script doesn't read it)",
  "em_dash": "forbid" | "advisory",
  "banned_phrases": ["person-specific additions — the script always merges in its built-in DEFAULT_CLICHES"],
  "advisory_phrases": ["phrases to warn on, not fail — e.g. person-specific crutches to ration"],
  "ai_vocab_extra": ["additions to the built-in AI-vocabulary density check"],
  "spelling": "AU" | "US" | "none",
  "exclamations": "forbid" | "ration" | "allow",
  "emoji": "forbid" | "ration" | "allow",
  "formats": { "<key>": { "max_chars": 0, "warn_words": 0, "min_words": 0, "info_chars": 0, "max_segment_words": 0, "note": "" } },
  "fingerprint": {
    "mean_sentence_words": 0, "sd_sentence_words": 0, "contraction_per_100w": 0,
    "comma_per_sentence": 0, "semicolon_per_1000w": 0, "nominalization_per_1000w": 0,
    "mean_paragraph_sentences": 0
  }
}
```

Generate the `fingerprint` block mechanically: `python3 scripts/voice_lint.py --extract-fingerprint <corpus files…>` prints it ready to paste. The lint then reports a draft's stylometric deviation from the corpus as advisories (never hard failures — the fingerprint flags drift toward the uniform LLM register; the human judges whether the drift matters for this piece).

Format-spec keys are all optional per format: `max_chars` (warn above), `warn_words` (warn above), `min_words` (warn below; used for long-form), `info_chars` (info only; the X/Twitter budget), `max_segment_words` (spoken/brief registers), `note` (shown with the warning).

Rules for generating it:

- `em_dash` is `"forbid"` unless the corpus shows genuine, repeated em-dash use — then `"advisory"` (the script still warns on every em dash so density stays visible; the drafting checklist in `ai-writing-signs.md` covers the spaced punchy pattern).
- Start `banned_phrases` from the script's built-in default list; add person-specific never-says items from the interview. Never *remove* a universal AI cliché just because the corpus doesn't mention it.
- `formats` only needs entries for variants you built; the script has sensible built-ins per key.
- Set `spelling` from the corpus, not the person's country of residence.
- Chat-leakage phrases ("I hope this helps", "Certainly!", placeholders) hard-fail and are deliberately not configurable: they mark assistant correspondence pasted as content, which is fatal in ghostwriting regardless of register. If a person's genuine chat register collides with one (rare), handle it at review time rather than weakening the gate.

## Package self-check (before delivery)

- Every rule in every file traces to this person's corpus/interview or to `ai-writing-signs.md` — nothing inherited from Luke's package without evidence.
- The base voice carries the **Scope** section, the router's Step 3 + Constraints restate the scope rule, and every ask-shaped variant guards its ask-shape — so the persona can't fabricate continuity, experience, endorsements, or CTAs the request never supplied. Sanity-check it: a "summarise X" request through any variant should yield only the summary, with no invented opener, verdict, or closing offer.
- Zero placeholders anywhere; every template slot filled with real content.
- Each variant has its tension example, and every worked-example output passes the lint and the AI-signs drafting checklist.
- `ai-writing-signs.md` and `voice_lint.py` copied verbatim; `voice-lint.json` valid JSON (run the lint once against a sample anchor to prove the toolchain works — a sample anchor failing the lint means the config contradicts the corpus: reconcile before shipping).
- Consent: the voice being cloned belongs to the requester or someone who has clearly consented; the delivery note reminds the owner that they remain the author who reviews and publishes.
