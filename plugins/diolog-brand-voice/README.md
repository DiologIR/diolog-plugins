# Diolog Brand Voice

A Claude Code plugin that writes publish-ready content in **Diolog's brand voice** — an Australian investor-communication company ("the workspace for everything investor-facing", tagline *"Disclosure, without doubt."*). One bundled brand-voice persona drives three surface-specific skills, and one deterministic voice-lint gates every draft.

It's the opposite of a generic "write me some copy" pass. Two things make it work: **voice fidelity** (it must read as Diolog, not as a capable stranger) and **grounding** (the substance comes from supplied research, never from invention). This is the *brand* voice, not a person's; posts in Luke Rhodes' personal voice live in `create-luke-content`.

## The three skills

| Skill | Surface | Use it for |
|-------|---------|-----------|
| **create-diolog-article** | Long-form | Blog posts, articles, thought-leadership, investor-education explainers, announcements. Registers: investor-education (retail), IR best practice (IR pros / boards / company secretaries), thought leadership, announcements. |
| **create-diolog-marketing-copy** | Short-form conversion | Website / landing copy (heroes, feature-to-"so what" sections, twin CTAs) and marketing emails (subject + preview + body + one CTA). The "marketing text" surface. |
| **create-diolog-business-case** | Buyer document | ROI / justification / business-case documents for the CFO, Company Secretary, or board: status-quo cost → what changes → proof / security / compliance posture → measurable outcomes → next step. |

Each skill loads the shared persona in full, then adds only its surface-specific structure on top.

## What makes the voice right

The skills share a bundled brand-voice persona (`shared/diolog-brand-voice-writer-persona.md`) synthesised from Diolog's live website copy, its published articles, and the internal voice guide. The defining rules every skill enforces:

- **Precise, measured confidence** — own the strong true claims; never over-claim. Compliance confidence is capped at 95% because judgement stays human. Honesty is a feature.
- **Respectful of an expert audience** — explain how Diolog helps, not what continuous disclosure is. Critique the old way of doing IR, never the reader.
- **No em dashes and no en dashes** — a spaced hyphen ( - ), comma, semicolon, or full stop. Both dashes are the #1 AI tell and neither exists in Diolog's writing. This is the hardest-watched rule.
- **Australian English**; sentence-case headings (except product feature names like Compliance Guardian, Smart Inbox).
- **Every statistic carries an inline (Source, Year)** from the supplied research; nothing is fabricated. Missing figure or stance → ask and hold, never invent.
- **The Diolog narrative arc** — status-quo tension → cited evidence → reframe → Diolog as the resolution → problem-callback CTA (never a bare "Sign up").
- No financial or investment advice, no guaranteed outcomes; no hype or AI clichés.

A shared `shared/diolog_voice_lint.py` hard-fails on any em/en dash or banned/AI-tell phrase and advises on American spellings, over-claim / guarantee language, and citation coverage, so "I checked" actually means checked.

## How each skill works

1. **Gather inputs** — batches any missing question (surface, audience/register, offer, research/stance) in one message; holds for what it can't invent.
2. **Load the persona** — the authoritative voice, house style, registers, decision frameworks, and constraints.
3. **Absorb the source material** — extracts the facts/figures it will actually use, each with a source; marks solid vs speculative.
4. **Draft** — the surface-specific structure, the Diolog voice on every line, the right register.
5. **Self-check + lint** — the "does this sound like Diolog?" read, then the deterministic `diolog_voice_lint.py` gate.
6. **Deliver** — the finished content plus a short note (what it wrote to, what it held, the lint result).

## Where this fits

Consistent with, and the fuller counterpart to, the two deployed generation prompts in the main Diolog repo (`apps/website/personas/diolog-content-writer-system-prompt.md` and `diolog-linkedin-writer-system-prompt.md`). This plugin covers brand **blog / web / email / business-case**; LinkedIn / social brand posts remain the domain of the deployed `diolog-linkedin-writer` prompt, and posts in Luke's personal voice the domain of `create-luke-content`.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install diolog-brand-voice@diolog-plugins
```

## Example invocations

```text
Write a Diolog blog post for the IR-best-practice audience on why disclosure
consistency across the results pack matters. Research attached; our take is
that most contradictions are caught by the market before the company.
```

```text
Draft the hero and three feature sections for the Diolog Smart Inbox landing
page. Audience: heads of IR. Offer: book a demo / first free report.
```

```text
Write a business case for Diolog aimed at a company secretary at a mid-cap
ASX issuer. They spend heavily on external counsel for disclosure review and
run five disconnected tools. Figures attached.
```

## What this plugin does not do

- Does not invent facts, figures, quotes, or a stance — missing grounding is flagged or framed as opinion, never fabricated.
- Does not guarantee outcomes or claim 100% compliance; compliance confidence caps at 95%.
- Does not publish anything; it produces drafts for a human to review and publish.
- Does not write LinkedIn/social brand posts (use the deployed `diolog-linkedin-writer` prompt) or personal-voice posts (use `create-luke-content`).

## Bundled resources

- `shared/diolog-brand-voice-writer-persona.md` — the full brand-voice persona (identity, voice principles, house style, registers, decision frameworks, constraints), shared by all three skills.
- `shared/diolog_voice_lint.py` — em/en-dash + banned-phrase hard gate, with AU-spelling, over-claim and citation-coverage advisories.
- `skills/create-diolog-article/SKILL.md` — long-form articles / blog posts.
- `skills/create-diolog-marketing-copy/SKILL.md` — website + email marketing copy.
- `skills/create-diolog-business-case/SKILL.md` — buyer ROI / justification documents.

## License

MIT
