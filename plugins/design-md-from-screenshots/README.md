# DESIGN.md from Screenshots

A Claude Code plugin that reverse-engineers a product's visual design system from one or more website/app screenshots and writes a single authoritative **`DESIGN.md`** — a semantic, token-based spec (palette, typography, spacing, shape, motion, component inventory, voice, do/don't) that another AI (Stitch, Claude, v0, Cursor, AI Elements) can consume to generate new screens that unmistakably belong to the same product.

## What it produces

A `DESIGN.md` file with these sections, in this order:

1. **Vibe** — one-sentence identity, adjective set, reference peers, anti-patterns
2. **Brand voice & UI copy** — tone, density, capitalisation, micro-examples
3. **Colour system** — semantic-role table with hex codes and provenance
4. **Typography** — typeface, type scale, hierarchy strategy
5. **Spacing, layout & grid** — base unit, scale, container, rhythm
6. **Shape & elevation** — radii, borders, shadows, depth philosophy
7. **Iconography & imagery** — icon set, illustration style, photography treatment
8. **Motion** — ease, duration, choreography
9. **Component inventory** — buttons, inputs, cards, nav, modal, toast, states
10. **Accessibility** — contrast, focus ring, touch targets
11. **Do / Don't** — concrete guidance for downstream generators
12. **Open questions** — what a static screenshot couldn't tell

Every token is expressed as a raw value (hex, px, rem) so any framework (Tailwind, Chakra, shadcn, CSS vars, iOS, Figma) can consume it without translation. Every token is marked `(confirmed)`, `(inferred)`, or `(assumed)` so a human knows what to trust.

## Why it works

- **Framework-agnostic** — raw values, not Tailwind class names or Chakra prop names.
- **Provenance on every token** — downstream users can tell confirmed evidence from single-screenshot inference.
- **Observation before naming** — the operator protocol forces a silent analysis pass before labelling anything, which stops adjective-salad DESIGN.md files.
- **Vibe-first, tokens-second** — a one-sentence peer-reference analogy is the north star; the tokens hang off it.
- **Self-critique pass** — before delivery, the skill asks *"Could another designer reproduce the system from this file alone?"* and revises.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install design-md-from-screenshots@diolog-plugins
```

## Example invocations

```text
[attaches screenshot of landing page]
Turn this into a DESIGN.md I can hand to v0.
```

```text
[attaches 3 screenshots: hero, dashboard, form]
Extract the design system from these.
```

```text
[attaches screenshot]
What's the vibe here? I want Cursor to match it when I build the next page.
```

```text
[attaches Figma export]
Make a DESIGN.md — save it as ./docs/design-system.md.
```

## What it won't do

- Implement a specific component from the screenshot (that's a coding task).
- Translate to a specific framework's config file — though it will offer to do that as a follow-up once the DESIGN.md exists.
- Invent tokens it can't see — unseen values go into **§12 Open questions** rather than being guessed.

## License

MIT
