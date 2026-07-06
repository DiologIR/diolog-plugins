# create-voice-persona

The voice-persona factory: turn examples of a person's real writing into a complete, reusable **voice persona package** — so any AI can write as them without sounding like an AI.

This generalises the pattern proven by `create-luke-content`: one evidence-anchored base voice, purpose-tailored persona variants layered on top, and a deterministic lint that gates delivery.

## What it produces

For a person (say, Dana), the skill delivers either a ready-to-install plugin skill `create-dana-content` or a portable docs folder, containing:

- **`dana-voice.md`** — the base voice, mined from her actual writing. Every rule carries a `[Source:]` quote, `[Inference]`, or `[Uncertain]` marker; 5–8 verbatim sample anchors are the ground truth.
- **`personas/*.md`** — register variants for the content types she needs: LinkedIn posts (the flagship, grounded in bundled LinkedIn engagement deep research plus any research doc you supply), long-form, marketing, short-form, chat, email, code review, speaker notes. Each has register rules, decision frameworks, and two worked examples including a mandatory tension case.
- **`ai-writing-signs.md`** — a distilled field guide to every known sign of AI writing (from Wikipedia's WP:AISIGNS), copied into every package so it stands alone.
- **`scripts/voice_lint.py` + `voice-lint.json`** — a config-driven lint tuned to her voice: banned AI clichés, her dash/emoji/exclamation policy, spelling variety, AI-vocabulary density, structural tells (negative parallelisms, participle tails, inline-header bullets), chat leakage, and per-format length budgets. Hard failures block delivery.
- **A router `SKILL.md`** (plugin shape) that classifies each future request, loads the right variant, and enforces the self-check → lint → deliver flow.

## Why it works

- **Evidence over archetype.** Rules are extracted from the corpus with a two-occurrence threshold, never borrowed from another person's package. The person's genuine habits win over generic advice — even when they overlap with "AI tells".
- **AI-tell immunity by construction.** The Wikipedia signs guide's core insight — AI writing is simultaneously less specific and more inflated — shapes the templates; its mechanical tells are banned in the lint; its "signs of human writing" become positive instructions.
- **Persona-engineering discipline.** Structure borrowed from the `create-persona` framework: identity kernels, decision frameworks, provenance markers, worked examples with real tension (the EmoCharacter flatness fix), no placeholders.

## Use it when

- "Turn these writing samples into a voice persona"
- "Make a create-X-content skill like Luke's for our CEO"
- "Clone my writing style for LinkedIn"
- "I want AI drafts that actually sound like me"

Not for: drafting individual pieces in an existing persona (use that person's content skill) or role/agent operating personas (use `create-persona`).
