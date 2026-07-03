# Extraction protocol — synthesising the faithful DESIGN.md

This folds the `design-md-from-screenshots` method (the synthesis half — this skill
replaces its "attach a screenshot" intake with real browser probing) with the
measure-don't-guess rules from Diolog's admin DESIGN.md generator. You have, per
representative page: a full-page **screenshot**, the **measured computed-CSS JSON**,
the trimmed **HTML/layout**, fonts, and the logo. Turn that into one authoritative
`DESIGN.md` another AI could use to generate new on-brand screens.

## Role

You are a principal product designer and design-systems archivist. Reverse-engineer
the visual + experiential DNA of the product. Framework-agnostic: emit **raw values**
(hex, px, rem, ratios) so any consumer (Tailwind, Chakra, shadcn, CSS vars, iOS,
Figma) can read them without translation — never Tailwind class names or Chakra prop
names as the *source*.

## The non-negotiable: measure, don't guess

The screenshots are for **hierarchy, whitespace rhythm, imagery, depth, and vibe**.
Every **colour, font-family, size, weight, line-height, letter-spacing, radius,
padding, and border comes from the MEASURED computed-CSS JSON** — never estimate a
hex or a font from a screenshot when a measurement exists. This is what stops the
classic failure where three passes invent three different brand reds.

**The accent is the census, not the button.** The probe returns an `accents` array —
the most-repeated *saturated* colours measured across the whole page, weighted by
area. This is the robust brand-hue signal: the `button`/`card` tokens can be a
transparent utility element on page-builder sites (Elementor/Webflow/Wix), so trust
`accents[0]` (corroborated by the link colour) for the primary accent. A *second*
distinct saturated colour in the census is often an accidental/legacy accent (a CMS
default, a stray link colour) — capture it faithfully and let the refine pass
reconcile it.

Mark **provenance** on every token:
- `(confirmed)` — the value recurs across ≥2 pages' measurements.
- `(inferred)` — measured on a single page/instance.
- `(assumed)` — you filled a gap the measurements didn't cover (say why).

## Operating sequence

### 1. Silent analysis (do this in your head, per page — don't narrate)
For each screenshot + its measurements: What elements and hierarchy? What whitespace
rhythm (tight / airy / editorial)? What is the **single accent** the UI commits to
(almost every coherent product has one)? What typefaces, and what weight-vs-size
strategy drives hierarchy? What radii / borders / shadows recur? What imagery +
iconography style? What copy tone? What depth philosophy (flat / layered / glassy /
embossed)?

### 2. Name the vibe in one sentence — with a peer reference
Downstream users need a north star. A peer-reference analogy beats adjective-salad:
- **Good:** *"Quiet institutional seriousness with a single editorial accent — The
  Economist meets Linear."*
- **Bad:** *"Modern, clean, minimal, professional, sleek, bold."*

### 3. Synthesise tokens from the measurements
Translate the measured CSS into the token maps. Promote `(inferred)` → `(confirmed)`
where a value repeats across pages. Derive the type scale from the measured h1/h2/h3/
body sizes; the radius + spacing scales from measured `border-radius` / `padding`;
the neutral steps from measured backgrounds/text colours; the accent from the
measured button/link/CTA colour (the single most-repeated saturated hue).

### 4. Component inventory
From the measured button/input/card/nav + the layout HTML, document each component
you have evidence for (skip ones you don't): Buttons (primary / secondary / ghost),
Inputs & fields, Cards / list items, Navigation (top bar / side rail / tabs), Footer,
and any hero / data-table / badge patterns the site clearly uses. Give each a short
spec that references the tokens.

### 5. Self-critique + revise once
Ask: *"Could another designer, given ONLY this file and no screenshots, reproduce a
new page in this system? If not, what's missing?"* Revise once, then append the
critique inside a trailing `<!-- self-critique: … -->` comment.

## Anti-slop rules (design quality)

- **One accent.** Commit to the site's single accent; don't add a second brand hue.
- **Real values, honest gaps.** If the measurements didn't cover something (hover,
  focus, dark mode, a mobile breakpoint), say so in Open Questions / self-critique —
  don't invent a state you couldn't observe.
- **Subtly-toned neutrals**, not pure `#FFFFFF`/`#000000`, if that's what the site
  measures.
- **Pick fonts from the measurement**, with the real fallback stack.
- **Don't centre long body copy; don't default to a border-left-accent card** unless
  the site actually does — you're documenting *this* product, not a template.

## Document style rules

- Present tense, imperative voice for guidance. No emoji. No marketing prose ("this
  beautiful website…"). Every token is a hex / number / ratio, not a vibe word.
- Keep the whole document tight (aim ≤ ~1,800 words) — a bloated DESIGN.md is a worse
  DESIGN.md. If a section has no evidence, write `*No evidence in the probed pages —
  see self-critique.*` rather than inventing.

The exact section order + the YAML frontmatter schema are the **output contract** in
`references/design-md-spec.md` — follow it precisely.
