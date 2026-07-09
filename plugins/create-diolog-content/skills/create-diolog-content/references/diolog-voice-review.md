# Diolog Voice - Review Ledger

Reviewer corrections on real shipped output are the highest-grade evidence this package has: each one is a live example of the voice failing, generalised to the failure class it exemplifies. This file is the durable record. When a reviewer (Amy, Luke, counsel) flags a line, add an entry here, state the rule in the file that owns the class (`diolog-voice.md` for register-crossing rules, the persona file for register-specific ones), encode any never-say phrase in `scripts/voice-lint.json`, and rewrite any worked example that demonstrates the old behaviour. This mirrors the maintenance loop that made the Amy package accurate.

Entry format: **instance** (what was flagged, quoted) → **class** (the general failure) → **rule** (what now prevents it) → **encoded in** (file/section).

## Review: Amy on the 30-investor-questions guide (2026-07)

The first full review of AI-drafted company-voice long-form. ~40 items on a 20-page A4 guide; the copy-relevant ones distilled below (design-layer items live with `create-diolog-guides`).

1. **Instance:** "answer bank" as the guide's organising name - the guide contains questions and guidance, not answers. Also "families" for question groups (they're categories) and "refusals" for declining to answer (they're objections).
   **Class:** committing to a wrong conceptual frame on page one and propagating it document-wide; names that don't survive a literal reading.
   **Rule:** name the artifact and its parts in the dullest accurate words before drafting; every name must survive a literal reading.
   **Encoded in:** diolog-voice.md core principle 1; personas/guide.md.

2. **Instance:** "the executives who sign" flagged as "very AI-generated and unnatural"; "Why these 30" as weak copywriting; "Everyone or no one", "Grounded or silent", "The future is qualified", "The last 5% is judgement" as "too abstract and AI-generated"; "refuse the content, never the person" and its paragraph as "very AI-generated".
   **Class:** compressed abstraction where information was needed - epigrams and gnomic headings in place of plain statements.
   **Rule:** headings carry the message, not the wit; the skim test; epigram budget of one landing line per page/section; plain English for anything a reader must act on.
   **Encoded in:** diolog-voice.md principles 2-3; ai-writing-signs.md §1.7.

3. **Instance:** "I want to be able to skim this page and immediately understand the message"; subtext "needs to be shorter and clearer".
   **Class:** copy optimised for reading aloud, not for skimming.
   **Rule:** the skim test - headings, labels and lead-ins alone must carry the argument.
   **Encoded in:** diolog-voice.md principle 2; personas/guide.md.

4. **Instance:** liked the "why they ask / good answer / the trap" breakdown per question; asked for the labels to be clearer and bigger, and entries to start capitalised.
   **Class:** (positive evidence) repeated functional scaffolding helps this reader - uniformity of structure is not the AI tell; uniformity of rhetorical texture is.
   **Rule:** repeat the scaffold, vary the texture; never "fix" consistent labelled structure.
   **Encoded in:** diolog-voice.md fingerprint; ai-writing-signs.md §6.4.

5. **Instance:** mockup captions cut ("an impression of pre-send review, not the product"; "the prior words retrieved with their source before the reply goes out"); asked instead for "how a company would use Diolog to answer or prepare for this question".
   **Class:** self-narrating artifact captions - describing the image instead of bridging it to the reader's job.
   **Rule:** captions answer "what do I do with this", never "what am I looking at"; production framing (impression-not-replica) never ships.
   **Encoded in:** diolog-voice.md mechanics + scope; personas/guide.md.

6. **Instance:** frame line corrected from the invented hybrid "Diolog is the governance-first workspace for investor communications" to her tested line "Diolog is the workspace for everything investor-facing".
   **Class:** remixing evidenced positioning into unapproved hybrids.
   **Rule:** reuse positioning beats verbatim from the library; never fuse two beats into a new line.
   **Encoded in:** diolog-voice.md principle 8 + beats library.

7. **Instance:** "retirement rule", "approval route", "who owns the bank" unclear on the worksheet; page 19 (sources/verification register) cut entirely; "a digital version of this worksheet is available from the Diolog team" cut as an offer that doesn't exist.
   **Class:** internal apparatus and invented offers leaking into the reader-facing artifact.
   **Rule:** internal tags, checklists and process labels never ship; every reader-facing label passes the first-time-reader test; CTAs come from the standard library only.
   **Encoded in:** diolog-voice.md scope; personas/guide.md.

8. **Instance:** "I do not like language like 'everyone' or 'no one'. It needs to feel more professional and measured."
   **Class:** punchy absolutes reading as performance rather than competence for a governance audience.
   **Rule:** professional and measured beats punchy; calm precision is the register.
   **Encoded in:** diolog-voice.md principle 3.

9. **Instance:** CTA corrected to link Book a Demo.
   **Class:** bespoke CTA routing.
   **Rule:** CTAs route to the standard actions (Book a demo / free disclosure-consistency report / Get the app).
   **Encoded in:** diolog-voice.md beats library.

## Adding the next review

Copy the entry format above. Date the section, quote the reviewer's words as the instance (their phrasing is the evidence), and resist fixing only the draft: a correction that doesn't land in a rule file and the lint will be made again by the next session.
