---
name: deck-craft
description: Build, review, or convert any slide deck — self-contained HTML presentations, lecturn.deck/1 JSON (and .pptx through it), or Diolog investor decks assembled from the 140-template slide library. Use whenever the user wants a deck, presentation, slides, pitch, keynote, investor update, board pack, results presentation, roadshow deck, or PPT — whether they say "make me a deck", "turn this doc into slides", "10 slides for the exec team", "build the FY26 results presentation", "convert this pptx", "review my deck", or just hand over a brief and a slide count. Also use for deck review and repair ("why does this deck look AI-generated", "the slides overflow", "fix the hierarchy on slide 4") and for choosing a deck's visual direction from the template libraries on this machine. Prefer it over a general design skill whenever the artifact is slides. Self-contained — needs no other skill installed. NOT for a single poster or infographic, a print document or one-pager, or a live web page.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion
---

# Deck Craft

A deck is not a document with page breaks and not a web page with sections. It is **fixed-size content, read at distance, on someone else's clock** — the reader can't zoom, can't scroll back mid-sentence, and gives each slide a few seconds before the speaker moves on. Every rule below descends from those three constraints.

You produce decks in three formats. They share the craft and the narrative discipline; they differ only in what you emit. Pick the target first — building an HTML shell when the user needed a `.pptx` is the expensive mistake, and it isn't recoverable by editing.

## 1. Route to a target

| The user wants | Target | Read |
|---|---|---|
| A deck to present, share as a link, or open in a browser; "slides", "presentation", "pitch deck", no file format named | **HTML** — one self-contained file, fixed 16:9 stage | `references/html-deck.md` |
| A `.pptx`, an editable PowerPoint/Keynote handoff, or a deck that must round-trip through Office; or an existing `.pptx` to read, diff, or edit | **lecturn.deck/1 JSON** → `.pptx` via the converter | `references/lecturn-json.md` |
| A deck assembled from the bundled template library — investor artifacts (results, 4C, AGM, board pack, roadshow, capital raising, IPO, investor day, ESG, M&A, site visit) or the business/product/engineering decks the additions cover | **lecturn.deck/1 JSON built from `{templateId, slots}`** | `references/diolog-templates.md` |

Ambiguous? The tell is the *destination*, not the content. "Send it to the board" → they open it in Office, so `.pptx`. "Put it on the site" / "share a link" → HTML. Inside the Diolog product's deck pipeline → always the third row. If two readings are live and produce different work, ask once; otherwise pick and say which you picked.

**Read only the reference for your target.** Each one is self-contained. Reading all three costs tokens and produces a deck confused about its own format.

## 2. Before any slide: the discovery round

Ask once, in one consolidated round (`AskUserQuestion` where available), then execute. What actually changes the deck:

- **Audience and their prior knowledge.** Board vs engineers vs prospects changes density, jargon, and how much argument you must show rather than assert.
- **Speaking or reading deck.** A speaker-led deck carries one idea per slide, huge type, 1–3 bullets — the speaker is the narrative. A reading deck (emailed, never presented) must survive alone, so it carries more text and its own connective tissue. Getting this wrong is the single most common deck failure: a reading deck built speaker-style is a stack of cryptic fragments; a speaker deck built reading-style is a wall of text the audience reads instead of listening.
- **Slide count and time budget.** ~1 slide/minute speaking. A named count is a contract (see §6).
- **Brand / design system / DESIGN.md.** Always confirm. If none exists, commit a direction (§3) before drawing.
- **Source material.** A PRD, a results release, an annual report — read it in full before sketching. A deck is a *compression* of source material; you cannot compress what you haven't read.
- **Speaker notes.** Off by default; they change how much text belongs on the slides.

If the brief already answers these ("9-slide investor update for ALFABS from these filings, ASX audience"), skip the round and build. Front-loading the whole brief and running is the shape this works best in — discovering scope slide by slide is how slide 9 contradicts slide 2.

## 3. Commit a direction, don't default to one

**`references/visual-craft.md` is the design layer — read it on any deck you are building rather than only reviewing.** It carries how to consume a supplied `DESIGN.md` or token file, how to author a direction when no brand exists, and the type / colour / hierarchy / anti-slop rules that decide whether the deck looks designed. Everything below is the deck-specific summary of it.

Ground the deck in what exists before inventing: a `DESIGN.md`, a token file, the product's own UI, prior decks from the same company. A provided design system is binding — lift exact values, never approximate a brand colour by eye. Only when none of that exists do you author a direction from scratch.

Either way the deck commits on three axes. Name all three before drawing, and vary them deck to deck — the same instrument played twelve times is what "AI-generated" means in practice:

- **Scheme** — light paper / dark canvas.
- **Formality** — boardroom ↔ zine.
- **Density** — airy manifesto ↔ data-heavy working deck.

`references/direction-index.md` is the bundled index of 34 complete style systems, with the two further libraries on this machine and the progressive read rule. Shortlist from the index on formality and scheme; read one system's full `design.md` only after the choice. Never mix two systems in one deck.

When the user wants options, show **three title slides**: one restrained, one bold, one wildcard — as real title slides for *their* deck, never labelled "option A" or showing a template name. For board, regulatory, healthcare, or investor decks, make the restrained option genuinely restrained and the bold one authoritative rather than decorative.

**Watch the attractors.** The looks this model reaches for unprompted are warm-paper-plus-serif-display-plus-terracotta, near-black-plus-one-acid-accent, and — at the type level — Space Grotesk, Inter, and bare system stacks. Each is legitimate when the brief earns it and a tell when it arrives by gravity. The test: can you defend the choice in one sentence that mentions this deck's subject? If not, choose again. Then run the swap test in `visual-craft.md` §2 — if the direction would fit a neighbouring company unchanged, it's a default rather than a choice.

## 4. Write the title sequence before any slide

Titles are the deck's table of contents and its argument. Someone reading only the titles, in order, should follow the whole thing.

Pick **one** grammatical style and hold it: short topic noun-phrases ("Market position", "Capital and outlook") or brief declarative action titles ("Asia became our largest market"). Mixing them reads as two decks stapled together.

Then read the sequence back and cut the AI-isms that mark a deck as generated: punchline titles ("The magic moment"), verdict-delivering takeaways, manufactured tension ("It's not X. It's Y."), heavy-handed reframing, faux-insight. A title introduces its slide; it is not the speaker's punchline, and a deck whose every title lands a zinger has no hierarchy of importance left.

## 5. The craft that holds across all three targets

**One idea per slide, one focal point.** If a slide has two messages, it is two slides — or one slide and one cut. The focal point is what the eye lands on first; everything else is visibly subordinate. Two elements competing at equal weight means the slide hasn't decided what it's for.

**Type sized for distance, not for a browser.** On a 1920×1080 canvas: body never below 24px, ideally 32px+; headlines 60–96px. At 1280×720 scale by ~0.67. Web density (14–16px body) is the reflex to resist — it is unreadable from row four. When a user names a font size they mean **points**, the Keynote/PowerPoint unit: `px = pt × 1.333`.

**Terminate every font stack with a generic** — `Figtree, sans-serif`, not `Figtree`. A bare family that fails to load falls back to serif and the deck silently changes character.

**Spend the accent once per slide.** Pick the one thing that matters and give it the colour; everything else is neutral. An accent on four elements is a decoration, not a signal.

**Parallelism is the rhythm.** Repeated elements sit in the same position slide to slide; section headers look identical; the footer treatment never wanders. Then break the pattern deliberately, once or twice, for emphasis.

**Real content, real states.** No lorem ipsum, no invented figures, no "Company X". Every number traces to the source material; a figure you can't ground is a figure you don't put on a slide. In regulated investor contexts this is compliance, not preference — an unsourced number on a results slide is a defect regardless of how good the slide looks.

**Cut the filler slides.** "Why choose us", "About this deck", "Agenda" on a 6-slide deck, a thank-you slide with no contact details. Each costs the audience attention and returns nothing.

**Charts show the point, not the dataset.** Cut every series and column that doesn't support the slide's one idea. A chart nobody can read at distance is decoration with error bars.

**Animate rarely, and only when reveal order carries meaning** — building a list point by point, landing a number, walking a diagram. One or two animated slides in ten is right. Author each slide in its **final visible layout** and let the animation hide elements until their step, so print, thumbnails and screenshots all see the finished slide for free.

## 6. Deliver the whole count

A named slide count is a contract. Twelve slides means twelve, each gated. If you genuinely must stop early, say "8 of 12 complete, resuming at 9" — never silently compress twelve slides' content into eight, and never pad eight slides' content into twelve. Padding is the more common failure and the harder one to see: it produces a deck where three slides say what one slide said.

Gate each slide as you finish it, before starting the next — a mistake on slide 2 otherwise propagates into every slide that copies its layout. The per-slide gate and the delivery review are in `references/deck-review.md`.

## 7. Working posture

**Narrate thinly.** One sentence before you start building. After that, write only when you find something or change direction. Lead the close with the outcome — what the deck is and what's open — not a slide-by-slide recap of what the user watched you build.

**Do the looking yourself.** Render the deck, screenshot slides, open every capture. A screenshot you generated but didn't open is not evidence, and looking costs less than reasoning about what you'd see. Delegation is for a genuinely wide review of a finished long deck, not for re-checking a slide you just wrote. Inside the Diolog deck producer this has a name — `render_deck`, mandatory, looped until it reports zero blockers; see `references/diolog-templates.md`.

**Hold the scope.** Build the deck asked for. If the brief looks wrong — nine slides for a topic that needs four, a chart with no underlying data — say so in a sentence and build what was asked. Don't quietly re-scope.

**Keep the summary short.** Caveats, open decisions, next steps. Placeholder imagery still needed, figures the source didn't support, a direction choice the user should sign off.

## 8. A deck is a flow, and the audience can't navigate it

No back button, no undo, no zoom, and the pace belongs to the speaker. That makes three usability rules sharper than they are on a web page, not softer:

- **The trunk test, per slide.** Dropped onto any slide cold, the audience should know where they are in the argument and what this slide claims. A slide that only parses if you saw the previous one is a hidden dependency — make it visible with a section marker, a running position, or a title that carries its own claim.
- **Recognition over recall.** If slide 9 needs a figure from slide 3, restate it. Nobody is holding your numbers in working memory while listening.
- **Persuasion yes, manipulation no.** A truncated axis, a scarcity claim with no verifiable referent, a peer comparison that omits the unflattering peer — defects, and in investor communications, compliance exposure. Polish makes an unverifiable claim *more* dangerous, because fluency reads as credibility.

Before laying out a decision deck (board pack, investment case, proposal), shape the argument first: what does the audience know at slide 1, what must be true before the ask lands, where can they get lost. Then lay out slides against that shape.

## 9. References

This skill is self-contained — it needs no other skill installed. Read only the reference for your target, plus the review file.

- `references/visual-craft.md` — **the design layer, read on every build**: consuming a `DESIGN.md` / token file, authoring a direction, type, colour, hierarchy and rhythm, anti-slop, the accessibility floor, the subtractive last look.
- `references/html-deck.md` — the HTML target: the scaling shell, type-scale tokens, static-markup discipline, the wrapper-collapse failure mode, speaker notes, print/PDF.
- `references/lecturn-json.md` — the `lecturn.deck/1` target: root shape, the element union, locating and driving the converter (`from-pptx` / `to-pptx` / `validate` / `inspect`), and the validator rules that bite.
- `references/diolog-templates.md` — the template-assembly target: read order, the `render_deck` loop, the job envelope, the theme type scale, `x.diolog.structure`, the deck producer handoff, and the read discipline that keeps a deck run from becoming a repository sweep.
- `references/template-catalogue.md` — **200 layouts in 27 families**, each with its job and typed slots. The bundled library.
- `references/layout-specs.md` — per-template geometry, hierarchy, type roles, accent placement, UX job and failure mode, fitted to the 1280×720 frame. Read a template's block before authoring with it; its `caps` override the catalogue.
- `references/recipes.md` — 21 deck spines by occasion (12 investor + 9 business/product/engineering), and how to adapt one.
- `references/slot-contract.md` — what a template expects and what the gate rejects, including three deck-level floors that exist nowhere else: a figure authored as text, four-plus slides on one ground, and fewer than four distinct font sizes.
- `references/direction-index.md` — 34 style systems for choosing a visual direction, with the progressive read rule.
- `references/template-additions.md` — the gap analysis behind the 60 additions, and the traps flagged but not built.
- `references/deck-review.md` — the per-slide gate and the pre-delivery review: what to check, what a clean gate does and doesn't prove, and the honest-report shape.

Nothing here waits on another skill. If the task reaches past slides — a full brand system, a product UX review, company-voice copy — say so and hand that part off; don't stretch a deck skill over it.
