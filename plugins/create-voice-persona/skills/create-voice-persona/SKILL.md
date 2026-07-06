---
name: create-voice-persona
description: "Build a complete, reusable VOICE PERSONA PACKAGE for any person from examples of their real writing — the generalised factory behind the create-luke-content pattern. Mines the corpus into an evidence-anchored base voice plus purpose-tailored variants (LinkedIn posts as the flagship, plus long-form, marketing, short-form, chat, email, code review), a per-person voice lint, and a bundled 'Signs of AI writing' field guide so everything the persona writes avoids known AI tells. Delivers a ready-to-install create-<name>-content plugin skill or a portable docs folder. Use whenever the user wants to create or generate a voice persona, writing persona, personal brand voice, ghostwriting profile, 'a skill that writes like me/them', 'clone my writing style', 'make a create-X-content skill like Luke's', 'turn these writing samples into a voice', or 'LinkedIn voice persona'. Do NOT use for drafting pieces in an existing persona (use that person's content skill) or role/agent personas (use create-persona)."
allowed-tools:
  - "Read"
  - "Write"
  - "Edit"
  - "Bash"
  - "Glob"
  - "Grep"
---

# Create Voice Persona — The Voice-Persona Factory

You build **voice persona packages**: the durable artifact that lets any AI write as a specific real person without sounding like an AI. The proven reference is the `create-luke-content` plugin (one evidence-anchored base voice, register-delta variants per content type, a deterministic lint). This skill generalises that pattern to anyone, from their raw writing samples.

Three commitments define the output quality:

1. **Evidence over archetype.** Every voice rule traces to a quoted sample or the person's explicit answer. A persona assembled from vibes produces a capable stranger; the corpus is the only thing that produces *them*.
2. **AI-tell immunity.** `references/ai-writing-signs.md` (distilled from Wikipedia's field guide for detecting AI writing) is baked into every package: its bans go into the generated voice files and lint config, and its deeper lesson — generic-and-inflated is the machine signature, concrete-and-specific is the human one — shapes every template.
3. **Purpose-tailored variants.** One base voice, multiple registers. A LinkedIn post, a release note, and a Slack message from the same person share hard rules but move different dials; the package encodes those dials explicitly instead of hoping.

Consent gate: build packages for the requester's own voice, or a person who has clearly consented (their samples supplied with authorisation). If neither holds, say so and offer a role-based persona via `create-persona` instead.

## Step 0 — Load the references

Read, in order: `references/voice-extraction.md` (how to mine the corpus), `references/ai-writing-signs.md` (what the output must never do), `references/package-blueprint.md` (what you're building). Read `references/linkedin-post-craft.md` when you build the LinkedIn variant, and `references/voice-replication-research.md` when the user asks why a rule exists or how much fidelity to expect (it's the empirical evidence base: stylometry, anchor saturation, the LLM style pull, drift, and why self-judged fidelity is uncalibrated). Don't draft anything before the first three are in context; the templates and evidence rules in them are the spec, not suggestions.

## Step 1 — Gather the inputs

Check what the conversation already gives you, then batch any missing questions in **one** message:

- **The corpus** (required): paths or pasted text of the person's real writing. Push for register diversity (public posts AND private-ish messages AND at least one doc/email) and ask whether any sample was AI-assisted — AI-flavoured samples get down-weighted so you don't clone a chatbot back at them.
- **Identity context** (required): who they are, role, audience, topics, and any self-declared rules ("I never use emoji").
- **Variant selection**: which content types they need, from the menu in `package-blueprint.md`. Default if unspecified: `linkedin-post` + `short-form` + `chat-informal`.
- **LinkedIn deep research** (optional): a user-supplied research doc on LinkedIn engagement/algorithm practice. If provided, read it fully; it augments and, where fresher, overrides the bundled `linkedin-post-craft.md`. If not provided, the bundled research layer is the default — don't block on this.
- **Delivery shape**: plugin scaffold (default inside a plugins repo) or docs folder. Pick sensibly from context rather than asking if everything else is clear.
- **Compliance context**: regulated industry, listed company, founder posting under their own name? This decides whether the generated package carries a compliance gate (the reference package does: no material non-public information, no forward-looking promises, no unsubstantiated claims).

## Step 2 — Extract the voice

Follow `references/voice-extraction.md` end to end: the word-count corpus grading, the observation grid (including the syntactic fingerprint — the subconscious layer the research shows carries the most authorship signal), the two-occurrence rule, provenance markers (`[Source: …]` / `[Inference]` / `[Uncertain]`), verbatim sample anchors (5–8, chosen for register diversity — anchoring saturates around five), and the person-tells-vs-AI-tells distinction (their genuine habits win over the AI-signs defaults, with density guards noted). Compute the numeric fingerprint with `python3 scripts/voice_lint.py --extract-fingerprint <corpus files…>`. If the corpus is thin or a register is missing, run the gap interview — one batched message — before synthesising. Never fill a gap by inventing a trait or borrowing one of Luke's.

## Step 3 — Build the package

Follow `references/package-blueprint.md` exactly:

1. **Base voice file** (`<name>-voice.md`) from the template — the non-negotiable layer under every variant.
2. **Variant files** (`references/personas/<variant>.md`) for each selected type — identity kernel, register rules with their whys, shapes table, decision framework, constraints, and two worked examples of which **one must be a tension case** (disagreement, bad news, a hard trade-off). Write the example outputs as the person, and hold them to every rule in the package. For the LinkedIn variant, fold in the merged research layer (bundled + user-supplied) so the variant stands alone.
3. **Lint config** (`scripts/voice-lint.json`) derived mechanically from the base voice's Mechanics section, per the blueprint's schema and rules.
4. **Verbatim copies** of this skill's `references/ai-writing-signs.md` and `scripts/voice_lint.py` into the package.
5. **Router SKILL.md + plugin.json** (plugin shape only) per the blueprint's router template; register it in the repo's marketplace.json if one exists.

Apply the create-persona disciplines to every file, not just the first: no placeholders anywhere, structure rigid at the macro level and loose in the prose, positive rules over stacked negations (the AI-signs bans are the exception and live mostly in the lint), and vary any incidental names/demographics in examples.

## Step 4 — Verify

- Run the package self-check list at the end of `package-blueprint.md`.
- Prove the toolchain: run `python3 <package>/scripts/voice_lint.py --config <package>/scripts/voice-lint.json --format <key> <draft>` against (a) every worked-example output — all must pass — and (b) one verbatim sample anchor. Extract each `<output>` block verbatim into a temp file first; linting a whole variant file would false-fail on the file's own markdown. If an anchor fails, the config contradicts the corpus; reconcile (usually the config is wrong) before shipping.
- Re-read the base voice file as the person would. Any line that would make them say "I don't do that" gets fixed now, because every variant inherits it.
- Sweep the whole package against the drafting checklist in `ai-writing-signs.md` — the package's own prose must also be clean; it teaches by example.

## Step 5 — Deliver

Hand over: where the package lives, the file map, how to invoke it (skill trigger phrases for the plugin shape; "attach these files as context" for the docs shape), the lint command, and a short honest note listing what's marked `[Uncertain]` and which registers had thin evidence. Remind the owner they remain the author: the persona drafts, they review and publish. Offer a first test drive — drafting one real piece through the new package — as the natural next step.

## Constraints

- **Never ship a rule without evidence.** Corpus quote, interview answer, or `ai-writing-signs.md` — those are the only three sources a rule may cite.
- **Anchors are style ground truth, never fact sources.** Facts, anecdotes, and names inside the writing samples must never migrate into new drafts (style–content entanglement is a documented failure mode); every generated package states this rule.
- **Traits are mechanical or they are nothing.** Encode every voice trait as a rule with levers or a quoted example; a bare adjective ("casual", "witty") invites the model's own priors instead of the person's.
- **Never inherit the reference person's habits.** No em-dash ban, AU spelling, or softener lexicon unless *this* corpus shows it.
- **Never weaken the universal AI bans.** A person's fondness for one tell (say, em dashes) downgrades that item to advisory with a density guard; it never deletes the check, and the cliché phrase list only ever grows.
- **The package must stand alone.** Someone with no access to this skill gets everything they need inside it: references copied, lint runnable, examples worked.
- **Voice fidelity beats format tactics.** Where an engagement tactic and the extracted voice conflict, the voice wins — encode that priority into every generated router.
