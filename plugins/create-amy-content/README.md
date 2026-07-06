# create-amy-content

Ghostwrite as **Amy Benson** — Founder, Cofounder & CEO of Diolog — in any format, through the persona variant that fits the destination. Built with the `create-voice-persona` factory from ~5,000 words of her verbatim writing and speech.

## Variants

| Variant | Covers |
|---|---|
| **linkedin-post** | Thought leadership on IR, AI-in-IR, and startup life; question-led hooks, sourced stats, Diolog as context not pitch |
| **long-form-article** | Blog posts, LinkedIn articles, guest columns (~800–1,500 words): her post patterns at essay length, frameworks lived through stories; extrapolations marked [Inference] pending a real published article |
| **marketing-content** | Announcements, launch/landing copy, campaign emails, release notes - grounded in the diolog.app copy she curated (contrast headlines, time-anchored benefits, relief lists, zero hype adjectives) |
| **outreach-email** | Her strongest register: cold intros (pain-first, ~60–90 words, "Worth a quick look?"), warm/congratulatory outreach, consultative follow-ups with numbered options, non-defensive objection handling, gracious declines |
| **investor-update** | Diolog's investor newsletter: milestones with exact numbers, candour about misses, suggestions genuinely invited |
| **chat-informal** | Slack/WhatsApp: "Goood morning" energy, FYI bullet updates, candour-with-a-plan, care-taking directness — deliberately un-polished |
| **short-form** | Comments, quick replies, bios, dry one-liners |
| **speaking-notes** | Panel/podcast/pitch talk tracks in her spoken register: "Yeah, definitely…" openings, frameworks lived through stories |

## What keeps it sounding like Amy

- **`references/amy-voice.md`** — the evidence-anchored base layer: every rule cites her corpus; 7 verbatim sample anchors; the spaced-hyphen habit (never em dashes, essentially never semicolons); warm-first/sharp-underneath principles.
- **Bundled redacted corpus** (`references/research/`) — her actual emails, LinkedIn quotes, Slack messages, interview excerpts, and the diolog.app marketing copy she curated (home + all menu pages; client names, PII and third-party companies redacted). Style ground truth, never fact sources.
- **Deterministic lint** — `scripts/voice_lint.py` + `voice-lint.json` with her measured stylometric fingerprint (mean sentence 21.3 words with SD 17.1, ~0 semicolons, moderate nominalizations): hard-fails on em dashes, AI clichés and chat leakage; advisories when a draft drifts from her rhythm.
- **Compliance gate** — public/investor-facing pieces carry the IR-sector guardrails (no MNPI, no forward-looking promises, no unsubstantiated claims).

## Usage

"Write a LinkedIn post as Amy about the Nasdaq IR report", "Draft Amy's follow-up email after the demo with the notes attached", "Reply to this Slack thread as Amy", "Draft the Q3 investor update from these milestones", "Prep Amy's panel answers on founder-led sales".

Not for Luke's voice (`create-luke-content`) or the Diolog company voice (`diolog-brand-voice`).
