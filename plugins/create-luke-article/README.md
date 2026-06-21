# Create Luke Article

A Claude Code plugin that writes a **LinkedIn post** or a **long-form blog article** in **Luke Rhodes'** authentic voice (Diolog CTO and co-founder), from three inputs: a topic, a topic-context document, and Luke's personal point of view on the subject.

It's the opposite of a generic "write me a post" pass. Two things make it work: **voice fidelity** (it must read as Luke, not as a capable stranger) and **grounding** (the substance comes from the supplied context, never from invention).

## What it produces

1. **The article**, ready to paste — a LinkedIn post (hook → body → one genuine question → 3–5 hashtags) or a long-form blog article (~1,500–2,200 words, headings, real conclusion).
2. **An on-brand graphic concept** — a Diolog-palette image concept built with the lead designer's obvious → abstract → bring-it-home ideation, a ready-to-paste image-model prompt, and alt text.
3. **A short note** — the stance it wrote to, anything kept as opinion because the source didn't support it as fact, and the voice-lint result.

## What makes the voice right

The skill bundles a self-contained voice spec synthesised from Luke's own profiles and raw writing samples. The defining traits:

- Calm, direct, technically fluent without showing off; quietly, dryly witty.
- Confident on substance, modest in delivery; opinions stated then softened.
- Protects the reader's time; brings a problem *and* a path.
- British/Australian spelling, contractions throughout.
- **No em dashes** — Luke's actual habit is a semicolon where most people reach for an em dash. This is the hardest-watched rule.
- No AI clichés, no hype, no salesy CTA.

A bundled `voice_lint.py` hard-fails on any em dash or AI-tell phrase and reports hook/length stats, so "I checked" actually means checked.

## How it works

1. **Confirm format and gather inputs** — batches any missing question (format, stance, context doc) in one message; holds for Luke's point of view because a topic without a stance produces generic mush.
2. **Load the references** — voice, engagement, graphic-concepting.
3. **Absorb the context document** — extracts the facts/quotes/figures it will actually use; marks what's solid vs speculative.
4. **Draft** — format-specific structure, Luke's voice on every line.
5. **Self-check + lint** — the "would Luke send this?" read, then the deterministic em-dash/cliché gate.
6. **Graphic concept** — Diolog palette and composition.
7. **Deliver** — article, graphic, short note.

## Inputs it expects

- **Format:** LinkedIn post or long-form blog article (the user specifies).
- **Topic** and **Luke's point of view** — non-negotiable.
- **Topic-context document** — strongly expected; it's how the skill avoids fabricating. If there genuinely isn't one, it writes from the stance and keeps anything unverifiable as clearly-marked opinion.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install create-luke-article@diolog-plugins
```

## Example invocations

```text
Write me a LinkedIn post about the CHESS replacement and what it means
for retail shareholder data. My take: it's a once-in-a-generation chance
to fix shareholder visibility, and most issuers aren't ready. Context doc
attached.
```

```text
Turn this research doc into a long-form blog article in my voice on why
AI coding agents finally earn a place in a small team's workflow — but only
if you get pickier about supervision, not less.
```

```text
Draft a LinkedIn post in Luke's voice on investor relations in 2026.
POV: IR is becoming a year-round conversation, not four announcements a year.
```

## What this skill does not do

- Does not invent facts, figures, quotes, or Luke's opinions — missing grounding is flagged or framed as opinion, never fabricated.
- Does not write a sales pitch or feature ad; it ends on a genuine question.
- Does not publish or post anything; it produces the draft for Luke to review and publish.
- Does not impersonate Luke without his consent — this is a consented, self-authored voice tool; the human Luke remains the author of record.

## Bundled resources

- `skills/create-luke-article/references/luke-voice.md` — the voice spec + authentic sample anchors.
- `skills/create-luke-article/references/linkedin-engagement.md` — distilled 2024–2025 LinkedIn engagement research.
- `skills/create-luke-article/references/graphic-concepting.md` — Diolog lead-designer ideation + palette.
- `skills/create-luke-article/scripts/voice_lint.py` — em-dash / AI-cliché / length guardrail.

## License

MIT
