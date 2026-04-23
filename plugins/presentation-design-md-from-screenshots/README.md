# PRESENTATION_DESIGN.md from Slide Screenshots

A Claude Code plugin that reverse-engineers a deck's visual design system from one or more slide screenshots and writes a single authoritative **`PRESENTATION_DESIGN.md`** — hard-capped at **1,700 characters** — so another AI (Gamma, Beautiful.ai, Pitch, Keynote / PowerPoint co-pilots, Stitch, v0, Claude, Cursor) can generate new slides that unmistakably belong to the same deck.

Sibling to [`design-md-from-screenshots`](../design-md-from-screenshots), but tuned for slides rather than web / app UIs.

## What makes slide design different

Slide design is not web design:

- **Canvas is fixed** (usually 16:9) — no responsive breakpoints, no scroll.
- **Reading is linear** — slide N sets up slide N+1.
- **Attention per slide is short** — one idea per slide, one memorable element per slide.
- **Charts and images carry the argument** — chart data-ink discipline matters more than a web dashboard; image treatment (duotone, full-bleed, overlay) is a signature.
- **Positional grammar is real** — title TL, footer BR, page number convention, accent rule placement.

The spec reflects all of that.

## What it produces

A `PRESENTATION_DESIGN.md` file, ≤1,700 characters, with these sections:

1. **Header** — deck name, one-sentence vibe, slide count, date, provenance legend
2. **Canvas** — aspect, safe margin, grid, density, footer convention
3. **Palette** — bg / fg / muted / accent / rule, plus chart series order (hex, with inline `c`/`i`/`a` provenance)
4. **Type** — typeface, display / title / body / caption scale, hierarchy rule
5. **Archetypes** — 5–8 repeating slide archetypes (title / section / content / two-col / data / quote / full-bleed)
6. **Charts** — axes, bars, labels, legend, annotation convention, forbidden chart types
7. **Images** — treatment (duotone vs untreated), radius, overlay, crop
8. **Icons** — library, stroke, sizes, colour rule
9. **Do / Don't** — concrete guidance for downstream slide generators
10. **Open questions** — what static slides couldn't tell you

Every token is expressed as a raw value (hex, px, ratio) so any tool (Keynote, PowerPoint, Google Slides, Gamma, Pitch, Beautiful.ai, Figma) can consume it without translation. Every token is marked `c` (confirmed), `i` (inferred), or `a` (assumed) so a human knows what to trust.

## Why it works

- **Tool-agnostic** — raw hex / px values, not Gamma theme names or PowerPoint placeholder IDs.
- **Provenance on every token** — downstream users can tell confirmed evidence from single-slide inference.
- **Slide-native vocabulary** — archetypes, chart data-ink rules, image treatment, positional grammar — not web-page tokens.
- **Hard character cap** — the output *must* fit in 1,700 characters, which forces ruthless density and makes the file cheap to paste into any downstream AI's context window.
- **Self-critique pass** — before delivery, the skill asks *"Could another designer reproduce the deck from this file alone?"* and revises.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install presentation-design-md-from-screenshots@diolog-plugins
```

## Example invocations

```text
[attaches 5 slide screenshots: title, section, content, data, closing]
Turn this into a PRESENTATION_DESIGN.md I can hand to Gamma.
```

```text
[attaches PDF deck export]
Extract the slide design system from this.
```

```text
[attaches one data-slide screenshot]
What's the chart style here? Capture it so Beautiful.ai stays on-brand.
```

```text
[attaches Keynote export]
Make a PRESENTATION_DESIGN.md — save it as ./docs/deck-style.md.
```

## What it won't do

- Generate an actual new slide (that's a downstream task).
- Critique the pitch narrative or slide content (that's a storytelling task).
- Emit a Keynote theme file or PowerPoint `.potx` — though it will offer to do that as a follow-up once the PRESENTATION_DESIGN.md exists.
- Invent tokens it can't see — unseen values go into **Open questions** rather than being guessed.
- Process non-slide imagery (app UIs, dashboards, documents) — route those to `design-md-from-screenshots` or decline.

## License

MIT
