# Create Luke Content

A Claude Code plugin that writes **any content in Luke Rhodes' authentic voice** (Diolog CTO and co-founder), conditionally routed through the right persona variant for the content type. Formerly `create-luke-article`; the LinkedIn/blog flow is unchanged and five new registers sit alongside it.

It's the opposite of a generic "write me some content" pass. Two things make it work: **voice fidelity** (it must read as Luke, not as a capable stranger) and **grounding** (the substance comes from the supplied context, never from invention).

## The persona variants

One base voice (`references/luke-voice.md`, non-negotiable) plus a register delta per content type:

| Variant | Used for | Reference |
|---|---|---|
| **LinkedIn / long-form blog** | Posts and articles for publication; engagement-optimised, ships with a Diolog graphic concept | `references/linkedin-engagement.md` + `references/graphic-concepting.md` |
| **Marketing content** | Product announcements, release notes, launch/landing copy, campaign emails; benefit-first, mechanics-precise, honestly caveated | `references/personas/marketing-content.md` |
| **Code review** | PR comments and review summaries; severity-calibrated candour (softened preferences, plain blockers, always a path) | `references/personas/code-review.md` |
| **Slack / informal** | Informal-but-professional messages; context → ask → a genuine out | `references/personas/slack-informal.md` |
| **Short-form** | Tweets/X, LinkedIn comments, bios, one-liners; one specific idea, delivered clean | `references/personas/short-form.md` |
| **ADHD / book audience** | Briefs, digests, book chapters, course prose; the conversational brilliant-colleague register (hooks, short segments, concrete-first, strategic repetition, one try-today action) | `references/personas/adhd-book.md` |

The skill routes by **destination**, loads only the persona it needs, drafts, self-checks ("would Luke send this?"), then gates on the deterministic lint.

## What makes the voice right

Synthesised from Luke's raw writing corpus: LinkedIn posts and comments, work messages, a shipped product-announcement blog post, a Statement of Work, a technical explainer doc, and raw discovery notes. The defining traits:

- Calm, direct, technically fluent without showing off; quietly, dryly witty.
- Confident on substance, modest in delivery; opinions stated then softened.
- Protects the reader's time; brings a problem *and* a path.
- Precision over roundness ("(up to) 30 users", "100 local parents"); a concrete "e.g." within a sentence of any abstract claim; edge cases as plain `Note:` callouts.
- Honest downside disclosure, even when selling.
- British/Australian spelling, contractions throughout.
- **No em dashes** — Luke's actual habit is a semicolon where most people reach for an em dash. This is the hardest-watched rule.
- No AI clichés, no hype, no salesy CTA.

A bundled `voice_lint.py` hard-fails on any em dash or AI-tell phrase in **every** format (including two-line Slack messages) and adds per-format advisory checks: exclamation density and hype adjectives (marketing), bare negations (review), message length (slack), word/char budgets (short), segment length and a try-today action (brief).

## Inputs it expects

- **The content type / destination** (or enough signal to route).
- **Topic / subject matter** and **source material** (a doc, a diff, a thread, notes) — the factual ground truth.
- **Luke's point of view** for anything public — non-negotiable; a topic without a stance produces generic mush.
- For reviews: the diff. For Slack: who it's to and the outcome needed. For ADHD/book: the audience and medium.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install create-luke-content@diolog-plugins
```

## Example invocations

```text
Write me a LinkedIn post about the CHESS replacement and what it means
for retail shareholder data. My take: it's a once-in-a-generation chance
to fix shareholder visibility, and most issuers aren't ready. Context doc attached.
```

```text
Draft the release notes for the new keyword-mute feature as me.
Notes on how it works attached.
```

```text
Review this PR as me. It's from a mid-level engineer; the retry logic
worries me but I haven't looked closely.
```

```text
Reply to Sarah's Slack thread as me: the deploy slipped to Thursday,
and I want to know if anything on her side absolutely needs Wednesday.
```

```text
Turn this research corpus into an ADHD-friendly Monday morning brief.
```

## What this skill does not do

- Does not invent facts, figures, quotes, code behaviour, or Luke's opinions — missing grounding is flagged or framed as opinion, never fabricated.
- Does not write sales pitches; marketing sells by demonstrating usefulness concretely.
- Does not publish, post, or send anything; it produces the draft for Luke to review.
- Does not impersonate Luke without his consent — this is a consented, self-authored voice tool; the human Luke remains the author of record.
- Diolog-brand (company-voice) content belongs to the `diolog-brand-voice` plugin; this one is Luke-personal.

## Bundled resources

- `skills/create-luke-content/references/luke-voice.md` — the base voice spec + authentic sample anchors (all registers).
- `skills/create-luke-content/references/personas/` — the five register deltas (marketing, code review, slack, short-form, ADHD/book).
- `skills/create-luke-content/references/linkedin-engagement.md` — distilled 2024–2025 LinkedIn engagement research.
- `skills/create-luke-content/references/graphic-concepting.md` — Diolog lead-designer ideation + palette.
- `skills/create-luke-content/scripts/voice_lint.py` — em-dash / AI-cliché guardrail + per-format advisories.

## License

MIT
