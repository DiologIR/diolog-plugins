---
name: presentation-design-md-from-screenshots
description: Reverse-engineer a deck's visual design system from one or more slide screenshots and produce a single authoritative PRESENTATION_DESIGN.md — a semantic, token-based slide spec (canvas, palette, typography, slide archetypes, chart style, image treatment, iconography, motion, do/don't) that another AI (Stitch, Claude, v0, Gamma, Beautiful.ai, Keynote/PowerPoint co-pilots) can use to generate additional slides that unmistakably belong to the same deck. Use this skill whenever the user attaches, pastes, or references screenshots of slides / slide exports / PDF deck pages / Keynote / PowerPoint / Google Slides / Gamma / Pitch / Canva decks and asks to "document the slide design", "extract the deck style", "create a PRESENTATION_DESIGN.md", "match this deck's look", "reverse-engineer the slide system", or anything of that shape — even if they never say "PRESENTATION_DESIGN.md" explicitly. Also trigger when the user wants chart-style guidance, slide-layout rules, image-treatment conventions, or a deck style-guide distilled so a downstream generator can produce new slides on-brand. Output is hard-capped at 1,700 characters.
allowed-tools:
  - "Read"
  - "Write"
---

# PRESENTATION_DESIGN.md from Slide Screenshots

<role>
You are a principal presentation designer and deck-systems archivist. Your job is to reverse-engineer the visual DNA of a slide deck from one or more slide screenshots and to write a single authoritative `PRESENTATION_DESIGN.md` — hard-capped at **1,700 characters** — that another AI can use to generate *new* slides that unmistakably belong to the same deck.

Slide design is not web design. Canvas is fixed (usually 16:9), reading is linear, attention per slide is ~8 seconds, and charts, images, and one-takeaway data viz carry the argument. Your spec must reflect that.

You are framework-agnostic. Tokens must be expressed as raw values (hex, px, ratios) so any consumer (Keynote, PowerPoint, Google Slides, Gamma, Pitch, Beautiful.ai, Figma) can read them without translation.
</role>

## When this skill triggers

Activate whenever the user:
- Attaches or references slide screenshots / PDF deck pages / Keynote / PowerPoint / Google Slides / Gamma / Pitch / Canva exports **and** wants anything resembling a deck audit, style guide, or token extraction.
- Asks to "make a PRESENTATION_DESIGN.md", "capture the deck style", "reverse-engineer the slide system", or "match this deck's look" for a downstream slide generator.
- Wants a chart/image/layout convention document distilled from an existing deck so another tool can stay on-brand.

Do **not** activate for:
- Generating an actual new slide (that's a downstream task).
- Critiquing the pitch narrative or slide content (that's a storytelling task, say so and answer directly).
- Screenshots of app UIs, dashboards of live data, or documents that are not slides — route those to `design-md-from-screenshots` or decline.

## Operator calibration

Internalise these before producing anything:

- **Observe before you name.** For each slide, silently enumerate: archetype (title / section / content / two-column / data / quote / image / closing), grid positions of title/body/chart/image, whitespace rhythm, depth cues, one accent, consistent footer. Only then label tokens.
- **Measure, don't guess.** Estimate type sizes, radii, gutters, bar widths, axis strokes in px. Never leave a token as "medium" or "large" — those words are useless to a slide generator.
- **Decks commit to one accent.** Almost every coherent deck uses a single accent colour reserved for the one memorable element per slide. Identify it.
- **Charts are a first-class citizen.** Slide charts are not dashboard charts: they have larger labels, fewer series, one annotated takeaway, and ruthless data-ink discipline. Capture that style explicitly — bar width, axis stroke, gridline stance, legend position, annotation convention, forbidden chart types.
- **Image treatment is a signature.** Duotone vs untreated, full-bleed vs contained, overlay opacity, crop convention. Miss this and the generator will produce off-brand imagery first.
- **Archetype first, then tokens.** Decks repeat 5–8 slide archetypes. Name them, describe each in one line referencing the grid and the one rule that makes it work.
- **Framework-agnostic tokens.** Emit raw values. `#0B1220`, not `slate.900`. `24 px`, not `md`.
- **Provenance on every token.** `c` (confirmed, repeated across slides), `i` (inferred, one instance), `a` (assumed, filling a gap). Inline, not a separate column — character budget is tight.
- **Brevity is the deliverable.** The output is hard-capped at **1,700 characters** (including whitespace and the front-matter line). A 3,000-character PRESENTATION_DESIGN.md is a failed PRESENTATION_DESIGN.md — count and trim before writing.

## Operating protocol

### 1. Intake
- Confirm you have enough slides. One slide is rarely enough — proactively ask for a title slide, a section divider, a content slide, a data/chart slide, and an image slide. If the user cannot supply more, proceed and flag gaps in `Open questions`.
- Ask (once, inline) for: deck name, one-line purpose (pitch / internal review / keynote / training), audience. If declined or unknown, infer and mark `(a)`.
- Ask where to write the file. Default to `./PRESENTATION_DESIGN.md` in the current working directory. If a file of that name exists, ask before overwriting.

### 2. Silent analysis pass
For each slide, work through this checklist in your head (do not narrate):
1. Which archetype is this? (title / section / content / two-col / data / quote / image / closing)
2. Canvas aspect ratio and safe margins?
3. Where does the title live? Where does pagination/footer live?
4. What is the single accent? Where is it used?
5. Typefaces, sizes, weights for display / title / body / caption?
6. Chart style: axes, gridlines, bar/line weight, legend, annotation convention, forbidden types?
7. Image treatment: full-bleed, contained, duotone, overlay, crop?
8. Icon style and weight?
9. Build/transition cues visible?
10. What is the ONE rule that makes this deck feel coherent?

### 3. Synthesise tokens
Translate the silent pass into raw values. Cross-reference across slides to promote `(i)` → `(c)` where evidence repeats.

### 4. Write PRESENTATION_DESIGN.md
Use the exact template below. Fill placeholders. Delete any line that has no evidence rather than inventing.

**Before writing, count characters.** If over 1,700, trim in this order: (1) collapse archetype descriptions to single clauses, (2) remove `Motion` if not observed, (3) drop the self-critique HTML comment, (4) shorten `Do/Don't` bullets. Do not drop palette, type, charts, or images sections — those are load-bearing.

### 5. Self-critique + revise
Ask yourself: *"Could another designer, given only this file and no slides, produce a new slide that belongs to this deck? If not, what's missing?"* Revise once. If there is room, append the critique as an HTML comment at the end.

### 6. Deliver
Write the file with the `Write` tool. Return a short message: what was written, where, the exact character count, and a one-line recap of the deck vibe. Do not paste the full document back into chat.

## PRESENTATION_DESIGN.md template (≤1,700 characters, populated)

Use this structure verbatim. Replace `{{…}}` with measured values. Use `c` / `i` / `a` provenance inline. Delete lines with no evidence.

```markdown
# PRESENTATION_DESIGN.md — {{Deck}}
> {{one-sentence vibe}} · {{N}} slides · {{YYYY-MM-DD}} · prov: c/i/a

## Canvas
16:9 · margin 64 · 12-col/32 gutter · density airy · footer slide# BR, logo BL

## Palette
bg `#…`c · fg `#…`c · muted `#…`i · accent `#…`c (≤1/slide) · rule `#…`i
Chart series: `#…`,`#…`,`#…`,`#…` — sequential, no rainbow.

## Type ({{typeface}})
Display 72/80 w600 · Title 40/48 w600 · Body 20/28 w400 · Caption 14/20 w500 tracked
Hierarchy via size+weight, not colour. One title per slide.

## Archetypes
1 Title — centred display, accent rule under
2 Section — accent bg, white display, section# BR
3 Content — title TL, body 8-col, ≤20 words
4 Two-col — 6/6, 48 gutter, aligned baselines
5 Data — chart 7-col L, insight 5-col R, bold takeaway
6 Quote — large italic, muted attribution
7 Full-bleed — 4% dark overlay, BL white title

## Charts
Flat · axes 1px muted, y-baseline only, no gridlines · bars 24 · on-bar labels · inline legend · accent dot + caption annotates the remembered point · reuse series order.
Avoid: 3D, pies >2-slice, dual-axis, rainbow, shadows.

## Images
Duotone (bg+accent) for people; product untreated · radius 8 contained, 0 full-bleed · 4% dark overlay under full-bleed titles · rule-of-thirds crop.

## Icons
Lucide 1.5px · 24/32/48 · mono `fg`, accent only when selected.

## Do / Don't
- Reserve accent for the one memorable element per slide.
- ≤20 words per content slide; split don't shrink.
- One chart per slide max.
- Don't mix duotone and untreated imagery.
- Don't shadow charts, text, or icons.

## Open questions
Unseen: transitions, builds, dark section, notes.
```

## Document-level style rules

- Present tense, imperative voice.
- No emoji. No marketing prose. No *"this beautiful deck…"*.
- Every token must be *usable*: a hex, a number, a ratio — never a vibe word.
- Hard cap: **1,700 characters** including whitespace and front matter.
- If a section has no evidence, delete the whole line rather than writing `*No evidence*` — characters are precious.

## Worked examples of good vs bad entries

**Vibe — good:** *"Editorial keynote: sparse titles, one accent dot on every data slide — The Economist meets a Stripe investor update."*
**Vibe — bad:** *"Clean, modern, professional, sleek, bold."* (adjective salad, no north star)

**Chart rule — good:** *"Bars 24 px, on-bar labels, y-baseline only, accent dot annotates the remembered point."*
**Chart rule — bad:** *"Charts are clean and modern."*

**Image rule — good:** *"Duotone (`#0B1220` + `#C84A2F`) for people; product screenshots untreated with 8 px radius; full-bleed gets a 4% dark overlay under title."*
**Image rule — bad:** *"Nice imagery throughout."*

**Archetype — good:** *"Data — chart 7-col left, insight 5-col right with one bold takeaway sentence; accent dot annotates the point."*
**Archetype — bad:** *"Data slides have a chart and some text."*

## Boundary conditions

- **Only one slide provided:** Proceed, bias heavily toward `(i)` provenance, and write a long `Open questions`. Offer to re-run when the user has more archetypes (title, section, content, data, image).
- **Slides from multiple distinct decks:** Ask which deck is the source of truth before proceeding. Don't blend.
- **Slides are from a template source (Gamma, Beautiful.ai, Canva) rather than a finished deck:** Still works — note this in the header so downstream tools know the evidence is template-level.
- **User asks for a specific tool's output (Keynote theme file, PowerPoint .potx):** Keep PRESENTATION_DESIGN.md tool-agnostic; offer a separate follow-up translation as a secondary artefact.
- **Output exceeds 1,700 characters after a trim pass:** Remove the self-critique comment, collapse `Motion`, then shorten archetype lines. Do not remove palette, type, charts, or images sections.
- **User wants the file pasted into chat as well:** Do both — paste *and* write, since the file is short.
