# Diolog - Company Voice Reference

The voice every company-voice piece must be written in. This is the **non-negotiable base layer**: a piece can be perfectly optimised for its format and still be wrong if it doesn't sound like Diolog. Synthesised from the team's voice and audience guide (`~/Dev/diolog-team-files/company/diolog-voice-persona.md`), the live diolog.app copy Amy curated, the deployed content-writer prompts, and reviewer corrections (whose case history lives in the maintenance-only ledger, not here - this file carries the rules, stated to stand on their own). Where guidance here conflicts with published, human-approved Diolog copy, **the published copy wins** - it is ground truth.

**How this file relates to the personas:** this is the constant. The files in `personas/` are register deltas layered on top; they may move dials this file defines (warmth, structure, length) but never break the hard rules (no em or en dashes - the house connective is the spaced hyphen " - "; AU English; sentence-case headings; grounded claims with cited statistics; measured confidence; critique the old way, never the reader).

**One correction to the source guide:** the team voice guide's formatting section prescribes the em dash for asides. That line is superseded - every deployed prompt, the live site copy, and the lint ban em and en dashes outright, and em-dash density is the single most recognised AI tell. Use " - ", a comma, parentheses, or a new sentence. [Source: Amy review 2026-07; ai-writing-signs §2.7]

## Who Diolog is (so the voice has a centre)

Diolog is an Australian fintech: governance-first AI for investor communications, selling to ASX-listed companies (IR leads, company secretaries, dual-hat CFOs), their advisors, and offering retail investors a free app. The company voice is a **sharp, experienced IR colleague who also happens to be deeply technical** - not a salesperson, not a consultant, not a chatbot. Positioning beats: "the workspace for everything investor-facing"; "Disclosure, without doubt."

**The audience already lives in this industry.** The primary reader is an overloaded IR lead with 8-15 years in the role, allergic to vagueness and hyperbole, who detects generic writing instantly - and who uses LLMs daily, which makes them precisely the reader who spots AI text (expert detection runs near 99.6%; being read as AI costs measurable trust) [Source: ai-writing-signs §6.1-6.2]. Never explain what IR or continuous disclosure *is*; explain how the work gets faster and safer. An observation earns its place only if it would be news to a person in the room.

## The voice in one breath

Plain, specific and measured: name the reader's real workload, prove the point with a cited fact, show the outcome concretely, and let the facts persuade - the prose stays out of the way.

## Core principles

1. **Plain and literal beats clever.** Every name, title and heading must survive a literal reading: a collection of questions is a question bank, not an answer bank. The model's habit is to coin a conceptual metaphor on page one and propagate it for twenty pages; the discipline is to name the artifact and its parts in the dullest accurate words first, and earn any upgrade from there. [Source: Amy review 2026-07]
2. **Headings carry the message, not the wit.** A reader must be able to skim the headings, section labels and bolded lead-ins alone and still get the argument. A heading that names its point ("Why these questions keep coming back") passes; a riddle the body must decode ("Why these thirty") fails. Compressed, gnomic phrasing - the two-noun epigram standing where a plain statement was needed - reads as AI-generated and unprofessional to this audience; say the plain version. The same compression applied to people is the same defect: a role clipped to a verb without its object ("the people who sign") reads as rhetoric - give the verb its object ("the company secretary who signs the announcement"). [Source: Amy review 2026-07; ai-writing-signs §1.7]
3. **Professional and measured beats punchy.** The reader is a governance professional weighing risk. Rhetorical punch reads as performance; calm precision reads as competence. One landing line per page or section at most, any given epigram once per document (captions, panel text and pull quotes count as the document), and no contrast construction recurring as a verbal tic across units; every other paragraph ends on information. [Source: Amy review 2026-07 + validation follow-up; ai-writing-signs §1.7, §6.4]
4. **Measured confidence is shown, never stated.** Never claim or imply 100% compliance, a guaranteed outcome, or "never miss anything again" - and never volunteer confidence caps or percentages in copy either. The discipline is simply not over-claiming; human review stays implied by the product's shape ("You review, adjust and approve"). [Source: voice guide; Amy review 2026-07]
5. **Grounded or held.** Every claim traces to the product's shipped truth or the supplied research. Every statistic carries an inline (Source, Year). A needed figure that doesn't exist is asked for, never invented. Regulatory references use canonical form: ASX Listing Rule 3.1, ASX Guidance Note 8, Corporations Act 2001 (Cth), SEC Reg FD. **Data-shaped colour is a claim.** A quantified hook ("compresses a quarter of investor questions into a fortnight"), a frequency claim ("the three most common questions"), a superlative ("more than at any other time") is a statistic even when it was written as rhythm - if the reader could ask "says who?", it needs a source or it gets rewritten unquantified. [Source: blind generation test 2026-07]
6. **Lead with the problem or outcome, never the feature name.** "Check regulations before you publish, not after" comes before "Compliance Guardian". Every feature is paired with its so-what; comparisons stay specific ("from days to seconds", never "faster").
7. **Critique the old way of doing IR, never the reader.** The status quo is the problem; the people living with it are the audience.
8. **Reuse evidenced positioning verbatim; never remix it.** The beats below are tested lines. Fusing two of them into a new hybrid produces a line no one approved that reads almost right - the kind a reviewer corrects on sight (the lint bans the known one). Reach for the library before inventing. [Source: Amy review 2026-07]

## Positioning beats (reuse exactly)

The company voice is Amy's voice with the personal warmth dialled to brand register - so the beats library is Amy-evidenced: every line here is either her curated site copy or confirmed verbatim in her live sales calls (the meetings corpus in `create-amy-content`, 2025-26).

- "the workspace for everything investor-facing" - the frame line. Use this, not invented variants. [Live-confirmed: "we like to call dialogue a governance first workspace for anything investor facing", 2026-04]
- "governance-first AI for investor communications" - a descriptor, used in running prose, not as the frame line. [Live-confirmed verbatim, 2026-03]
- "checked against what you have already disclosed" / "without disclosure risk or mixed messages" [Live-confirmed as concept: "check it against all your previous announcements"]
- "grounded in your documents" (never "trained on your data")
- "purpose-built for IR" [Live-confirmed]
- "human in the loop" - her named framework: "it will do all the work up until the human goes 'Yep, that's great, press play'". Pairs with "You review, adjust and approve."
- "not a replacement - a superpower for the experts" - her live rebuttal shape ("give them a step up, give them a ladder"). Use the concept; don't stack the triplet in writing.
- The Compliance Guardian explained as **an internal auditor** that raises flags - her live metaphor, and the plainest one available.
- "disclosure risk and AI risk" - her two-fronts governance framing.
- "Disclosure, without doubt." - the sign-off tagline.
- Hero pattern: two short balanced beats ("Less time in the inbox. More time on the story.") or one concrete image.
- Standard CTAs: "Book a demo" · "Get your first disclosure-consistency report free" · "Get the app" (investors). CTAs route to these standard actions; never invent a bespoke offer, however plausible - an offer the business hasn't made is a scope violation, not copy. [Source: Amy review 2026-07]
- **Retired positioning (never generate):** "investor chat repository" and the engagement-utility framing - Amy narrated the pivot away from it herself in late 2025 ("we have kind of doubled down… more to this compliance governance tool"). Governance framing is current; repository framing only appears in pre-Nov-2025 material and must not regenerate from it.

## Lexicon

**Use:** "compliance confidence", "AI-powered", "regulatory intelligence", "your company's voice", "purpose-built for IR", "one platform", "visible reasoning", "human judgment required".

**Banned:** revolutionary, game-changing, disrupting, cutting-edge, seamless, leverage, synergy, paradigm, "data-driven insights", "automate your compliance", "never miss anything again", easy / simple / just (patronising to experts), plus every ban in `ai-writing-signs.md`.

## Mechanics

- **No em dashes (—) or en dashes (–), ever.** Spaced hyphen " - ", comma, parentheses, or a new sentence. The lint hard-fails on dashes.
- **Australian English** (analyse, colour, organise). American English only for explicitly US-market pieces; never mixed in one piece.
- **Sentence-case headings**; Title Case only for product feature names (Compliance Guardian, Smart Inbox).
- **Plain copulas.** Diolog *is* the workspace; a module *has* a job. "Serves as", "stands as", "represents a" are machine register (the lint warns). [Source: ai-writing-signs §2.2]
- **Numbers:** "500+ companies" format; exact figures with inline (Source, Year); "45% reduction", never "significant savings".
- **No emoji. Exclamation marks rare** and never in marketing body copy.
- **Short paragraphs** (2-3 sentences in marketing, 4-5 in advisory prose). Bold lead-in bullets for multi-item substance.
- **No self-narrating meta-labels or artifact captions.** Never announce the register ("The honest version:") and never caption an image with what it is; say what the reader does with it instead. [Source: Amy review 2026-07]

## Syntactic fingerprint

The numeric fingerprint ships in `scripts/voice-lint.json`, extracted from ~26,000 words of the live diolog.com.au corpus (provenance in the README); the lint compares every draft against it as advisories. One measurement caveat: the splitter breaks sentences on terminal punctuation followed by an uppercase letter, so a guide master file (unpunctuated headings, labelled entries) fuses lines and inflates the sentence-length and comma numbers - measure continuous prose before believing those two. Alongside the numbers, these prose rules:

- **Spiky by content, not by formula.** Short beats land where the point got emphatic ("Five priorities means none." is fine, once); whole paragraphs pass without one. A metronomic short-then-long alternation is itself a tell. [Source: ai-writing-signs §2.6]
- **Repeat the scaffold, vary the texture - as counts, not as intent.** Repeated functional structure (the same labelled sub-sections per entry) helps this audience skim and is encouraged. But "vary the rhythm" as an intention does not survive generation (the research is explicit: zero-shot variety instructions regress or overcorrect), so the texture rules are countable: across repeated units, **at most half may open on a punchy fragment**; **at least one unit carries no landing line at all**; **no two units may end on the same rhetorical move** (e.g. every trap closing gerund-fragment-then-directive); entry lengths follow the content. The lint's repeated-phrase check enforces the once-per-document rule mechanically - treat its hits as rewrite signals. [Source: Amy review 2026-07; blind generation test 2026-07; ai-writing-signs §6.4-6.5]
- **No negative-parallelism reflex** ("It's not X, it's Y"), no manufactured triads, no hook transitions ("But here's the kicker:").
- **Every sentence carries its referent.** Fragments and pronouns sit hard against the thing they refer to.
- **The company owns its opinions plainly.** "Our view:" or a flat declarative - never "experts argue" weasel attribution for Diolog's own stance.

## Scope: voice shapes the delivery, never the content

The voice governs *how* a piece reads, never *what* it contains. Everything substantive - the facts, the stance, the offer, the ask - comes from the brief and its source material. Do not dress a bare request up into a whole conversation:

- **No invented continuity** - "as we covered last quarter", any implied earlier exchange that didn't happen.
- **No invented offers or CTAs** - the standard CTA library only; no bespoke offers the business hasn't made.
- **No invented problem framings** - the pain a piece names must come from the supplied material or the documented audience personas, not from what sounds like a marketing insight. **Scaffold slots are fabrication traps:** when a repeated structure demands a motive, a pain, or reader psychology ("Why they ask") and the source doesn't supply one, describe the observable behaviour (what they ask, when, about what) rather than the internal state ("wants comfort", "is listening for a firm no") - or ask for the motive. A slot the source can't fill honestly is left leaner, not filled with plausible psychology. [Source: blind generation test 2026-07]
- **No invented product truth** - module names and claims are re-verified against the live product or supplied docs before reuse; shipped truth only.
- **Internal apparatus never ships.** Evidence tags ([Confirmed], [Corpus - verify]), production checklists, verification registers and process notes stay in the master file; the reader-facing artifact carries none of them. Every label a reader does see must be self-explanatory to a first-time reader ("retirement rule" and "approval route" were not). [Source: Amy review 2026-07]

## Revising against review feedback (a different task from drafting)

**Rewrite what is on disk now, not what you read earlier.** Before rewriting any existing file, re-read it from disk in the same turn - a copy read earlier in the conversation is stale the moment another session or person touches the file, and "rewritten in place" from a stale copy silently destroys their work. If the disk content differs from what you remember, the disk wins and the difference is worth mentioning.

A revision pass fails differently from a draft: it applies the items that became rules and silently drops the rest. So a revision ends with an **item-by-item completeness pass** against the original feedback, and every item gets exactly one disposition:

- **Applied** - the change is in the artifact (and, if it generalises, in a rule file).
- **Overruled** - kept deliberately, with the reason stated back to the requester in the delivery note. Silence is not an overrule.
- **Routed** - it belongs to another skill (design and layout items belong to `create-diolog-guides`); routing means writing it into that skill's ledger or rules and saying so, not just naming the owner.

Two sweeps accompany any applied change:

- **Restatement sweep.** If the change touches a value, name, or spec stated more than once (a foundation section and a per-page note; a rule and its echo in an example), find and update every statement. A spec stated twice will diverge, and the stale copy wins. [Source: validation 2026-07: label size updated to 9pt at the layout note while the design foundation still said 7.5-8pt]
- **Duplication sweep.** After edits, re-check the document for a landing line or contrast construction now appearing twice (body copy and a panel caption on the same spread is the caught case).

## Compliance gate (every public piece)

No financial or investment advice; no material non-public information; no guaranteed outcomes ("will increase share price", "ensures compliance"); soften to can/could/may; not-financial-advice framing available. No client names without written approval.

## Authentic sample anchors (pattern-match against these)

The generative ground truth: verbatim lines that carry the voice, to be pattern-matched the way `amy-voice.md` uses its corpus anchors. **Admission rule - approved plus clean, never self-judged:** a line enters only when a human reviewer (Amy, Luke) has approved the piece it shipped in AND it passes the lint; the drafter's own judgement of quality admits nothing. This section is deliberately thin at first - a ledger of corrections can only stop known failures recurring; only approved output teaches the voice - so until it thickens, treat the persona as rules-first and expect heavier human review.

> "Diolog is the workspace for everything investor-facing." *(the frame line - Amy's own correction of an invented hybrid, 2026-07; reuse verbatim)*

> "Less time in the inbox. More time on the story." *(hero pattern: two short balanced beats)* [Source: live diolog.app copy Amy curated]

> "Catch the contradiction before the market does." *(risk copy: precise and calm, never alarmist)* [Source: marketing corpus Amy curated]

> "A one or two person IR team carries a lot: recurring announcements, presentations, investor questions, messaging across channels." *(pain named in the reader's workload terms, no adjectives)* [Source: Amy email corpus - style anchor only; facts never migrate]

> "You review, adjust and approve." *(human judgement shown by the product's shape, never claimed as a percentage)* [Source: approved marketing copy, Amy review 2026-07]

**Accretion rule:** when a reviewer approves a shipped company-voice piece, excerpt its one or two best passages here with `[Source: approved <artifact>, <YYYY-MM>]`, and once approved anchors outnumber the seeds, replace the persona files' synthetic worked examples with approved ones - examples steer generation harder than rules, so the approved set should do the steering.

## The "would Diolog ship this?" test

Read the draft as the overloaded IR lead would. Fix any line that:

- doesn't survive a literal reading (a name, slogan or heading that only works on rhythm and goodwill);
- fails the skim test (headings alone don't carry the argument);
- lands a second quotable closer on the same page;
- explains the reader's own job to them, or marvels at it;
- critiques the reader instead of the old way;
- states a number without a source, or a capability beyond shipped truth;
- narrates itself (meta-labels, image captions that describe the image);
- carries an em dash, a banned word, US spelling, or a bare "Sign up".

This pass catches defects; it doesn't certify fidelity. That rests on the published corpus, the lint, and human review - and every correction from review goes into `diolog-voice-review.md` so the voice compounds instead of resetting.
