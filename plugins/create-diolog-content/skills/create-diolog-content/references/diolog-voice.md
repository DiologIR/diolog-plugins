# Diolog - Company Voice Reference

The voice every company-voice piece must be written in. This is the **non-negotiable base layer**: a piece can be perfectly optimised for its format and still be wrong if it doesn't sound like Diolog. Synthesised from the team's voice and audience guide (`~/Dev/diolog-team-files/company/diolog-voice-persona.md`), the live diolog.app copy Amy curated, the deployed content-writer prompts, and Amy's line-by-line review of the shipped 30-questions guide (2026-07, logged in `diolog-voice-review.md`). Where guidance here conflicts with published, human-approved Diolog copy, **the published copy wins** - it is ground truth.

**How this file relates to the personas:** this is the constant. The files in `personas/` are register deltas layered on top; they may move dials this file defines (warmth, structure, length) but never break the hard rules (no em or en dashes - the house connective is the spaced hyphen " - "; AU English; sentence-case headings; grounded claims with cited statistics; measured confidence; critique the old way, never the reader).

**One correction to the source guide:** the team voice guide's formatting section prescribes the em dash for asides. That line is superseded - every deployed prompt, the live site copy, and the lint ban em and en dashes outright, and em-dash density is the single most recognised AI tell. Use " - ", a comma, parentheses, or a new sentence. [Source: Amy review 2026-07; ai-writing-signs §2.7]

## Who Diolog is (so the voice has a centre)

Diolog is an Australian fintech: governance-first AI for investor communications, selling to ASX-listed companies (IR leads, company secretaries, dual-hat CFOs), their advisors, and offering retail investors a free app. The company voice is a **sharp, experienced IR colleague who also happens to be deeply technical** - not a salesperson, not a consultant, not a chatbot. Positioning beats: "the workspace for everything investor-facing"; "Disclosure, without doubt."

**The audience already lives in this industry.** The primary reader is an overloaded IR lead with 8-15 years in the role, allergic to vagueness and hyperbole, who detects generic writing instantly - and who uses LLMs daily, which makes them precisely the reader who spots AI text (expert detection runs near 99.6%; being read as AI costs measurable trust) [Source: ai-writing-signs §6.1-6.2]. Never explain what IR or continuous disclosure *is*; explain how the work gets faster and safer. An observation earns its place only if it would be news to a person in the room.

## The voice in one breath

Plain, specific and measured: name the reader's real workload, prove the point with a cited fact, show the outcome concretely, and let the facts persuade - the prose stays out of the way.

## Core principles

1. **Plain and literal beats clever.** Every name, title and heading must survive a literal reading. A guide of questions is a question bank, not an "answer bank"; question groups are categories, not "families"; a reader declining to answer handles an objection, not a "refusal". The model's habit is to coin a conceptual metaphor on page one and propagate it for twenty pages; the discipline is to name the artifact and its parts in the dullest accurate words first, and earn any upgrade from there. [Source: Amy review 2026-07]
2. **Headings carry the message, not the wit.** A reader must be able to skim the headings, section labels and bolded lead-ins alone and still get the argument. "Why these 30 questions keep coming back" passes; "Why these thirty" fails. Compressed, gnomic phrasing ("Everyone or no one", "Grounded or silent") reads as AI-generated and unprofessional to this audience - say the plain version. [Source: Amy review 2026-07; ai-writing-signs §1.7]
3. **Professional and measured beats punchy.** The reader is a governance professional weighing risk. Rhetorical punch reads as performance; calm precision reads as competence. One landing line per page or section at most, any given epigram once per document (captions, panel text and pull quotes count as the document), and no contrast construction recurring as a verbal tic across units; every other paragraph ends on information. [Source: Amy review 2026-07 + validation follow-up; ai-writing-signs §1.7, §6.4]
4. **Measured confidence is shown, never stated.** Never claim or imply 100% compliance, a guaranteed outcome, or "never miss anything again" - and never volunteer confidence caps or percentages in copy either. The discipline is simply not over-claiming; human review stays implied by the product's shape ("You review, adjust and approve"). [Source: voice guide; Amy review 2026-07]
5. **Grounded or held.** Every claim traces to the product's shipped truth or the supplied research. Every statistic carries an inline (Source, Year). A needed figure that doesn't exist is asked for, never invented. Regulatory references use canonical form: ASX Listing Rule 3.1, ASX Guidance Note 8, Corporations Act 2001 (Cth), SEC Reg FD.
6. **Lead with the problem or outcome, never the feature name.** "Check regulations before you publish, not after" comes before "Compliance Guardian". Every feature is paired with its so-what; comparisons stay specific ("from days to seconds", never "faster").
7. **Critique the old way of doing IR, never the reader.** The status quo is the problem; the people living with it are the audience.
8. **Reuse evidenced positioning verbatim; never remix it.** The beats below are tested lines. Fusing two of them into a new hybrid ("the governance-first workspace for investor communications") produced a line Amy corrected on sight. Reach for the library before inventing. [Source: Amy review 2026-07]

## Positioning beats (reuse exactly)

- "the workspace for everything investor-facing" - the frame line. Use this, not invented variants.
- "governance-first AI for investor communications" - a descriptor, used in running prose, not as the frame line.
- "checked against what you have already disclosed" / "without disclosure risk or mixed messages"
- "grounded in your documents" (never "trained on your data")
- "Disclosure, without doubt." - the sign-off tagline.
- Hero pattern: two short balanced beats ("Less time in the inbox. More time on the story.") or one concrete image.
- Standard CTAs: "Book a demo" · "Get your first disclosure-consistency report free" · "Get the app" (investors). CTAs route to these standard actions; never invent a bespoke offer ("a digital version of this worksheet is available from the Diolog team" was invented, and cut). [Source: Amy review 2026-07]

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
- **No self-narrating meta-labels or artifact captions.** Never announce the register ("The honest version:") and never caption an image with what it is ("an impression of pre-send review, not the product"); say what the reader does with it instead. [Source: Amy review 2026-07]

## Syntactic fingerprint

No numeric fingerprint block ships yet - the honest baseline requires running `voice_lint.py --extract-fingerprint` over the human-approved published corpus (the live blog articles and site copy), which lives in the main Diolog repo. Until that's done, these prose rules stand in:

- **Spiky by content, not by formula.** Short beats land where the point got emphatic ("Five priorities means none." is fine, once); whole paragraphs pass without one. A metronomic short-then-long alternation is itself a tell. [Source: ai-writing-signs §2.6]
- **Repeat the scaffold, vary the texture.** Repeated functional structure (the same labelled sub-sections per entry) helps this audience skim and is encouraged. What must vary is the rhetoric: entry lengths follow how much there genuinely is to say, and the same contrast construction or aphoristic closer must not land in every unit. [Source: Amy review 2026-07; ai-writing-signs §6.4]
- **No negative-parallelism reflex** ("It's not X, it's Y"), no manufactured triads, no hook transitions ("But here's the kicker:").
- **Every sentence carries its referent.** Fragments and pronouns sit hard against the thing they refer to.
- **The company owns its opinions plainly.** "Our view:" or a flat declarative - never "experts argue" weasel attribution for Diolog's own stance.

## Scope: voice shapes the delivery, never the content

The voice governs *how* a piece reads, never *what* it contains. Everything substantive - the facts, the stance, the offer, the ask - comes from the brief and its source material. Do not dress a bare request up into a whole conversation:

- **No invented continuity** - "as we covered last quarter", any implied earlier exchange that didn't happen.
- **No invented offers or CTAs** - the standard CTA library only; no bespoke offers the business hasn't made.
- **No invented problem framings** - the pain a piece names must come from the supplied material or the documented audience personas, not from what sounds like a marketing insight.
- **No invented product truth** - module names and claims are re-verified against the live product or supplied docs before reuse; shipped truth only.
- **Internal apparatus never ships.** Evidence tags ([Confirmed], [Corpus - verify]), production checklists, verification registers and process notes stay in the master file; the reader-facing artifact carries none of them. Every label a reader does see must be self-explanatory to a first-time reader ("retirement rule" and "approval route" were not). [Source: Amy review 2026-07]

## Revising against review feedback (a different task from drafting)

A revision pass fails differently from a draft: it applies the items that became rules and silently drops the rest. So a revision ends with an **item-by-item completeness pass** against the original feedback, and every item gets exactly one disposition:

- **Applied** - the change is in the artifact (and, if it generalises, in a rule file).
- **Overruled** - kept deliberately, with the reason stated back to the requester in the delivery note. Silence is not an overrule.
- **Routed** - it belongs to another skill (design and layout items belong to `create-diolog-guides`); routing means writing it into that skill's ledger or rules and saying so, not just naming the owner.

Two sweeps accompany any applied change:

- **Restatement sweep.** If the change touches a value, name, or spec stated more than once (a foundation section and a per-page note; a rule and its echo in an example), find and update every statement. A spec stated twice will diverge, and the stale copy wins. [Source: validation 2026-07: label size updated to 9pt at the layout note while the design foundation still said 7.5-8pt]
- **Duplication sweep.** After edits, re-check the document for a landing line or contrast construction now appearing twice (body copy and a panel caption on the same spread is the caught case).

## Compliance gate (every public piece)

No financial or investment advice; no material non-public information; no guaranteed outcomes ("will increase share price", "ensures compliance"); soften to can/could/may; not-financial-advice framing available. No client names without written approval.

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
