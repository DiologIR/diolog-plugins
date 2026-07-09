# create-diolog-infographic

A Claude Code skill that produces a **print-ready, single-page A4 infographic** in Diolog's brand design
system to communicate one finding, comparison, or metric.

It reads the live Diolog website design system
(`~/Dev/diolog-team-files/website/DESIGN-Website.md`), reduces the finding to one dominant idea with one
focal number, writes every word of copy in Luke's voice via the `create-luke-content` skill, builds the
page from a bundled A4 template with the three brand fonts inlined (so it prints and shares
self-contained), charts the finding honestly, and verifies it renders to exactly one A4 page.

## Use it when

You want an infographic / one-pager / shareable stat graphic / poster of a result / designed chart of
data in the Diolog look - even phrased as "turn these numbers into something I can share".

Not for: **multi-page guides, briefings or whitepapers (`create-diolog-guides`)**, multi-slide decks
(`customer-deck-builder`), email product mockups (`email-mockups`), or a full website/app UI
(`design-craft`).

A poster is composed; a document is systematised. The moment the deliverable runs past one sheet, the
sibling skill `create-diolog-guides` owns it - it carries the page archetypes, the shared baseline
across sheets, the screen-only motion layer, and a Node CDP harness that measures ink rather than boxes.

## What's inside

- `skills/create-diolog-infographic/SKILL.md` - the workflow.
- `.../assets/template.html` - the A4 Diolog skeleton (masthead / ticker / hero / columns / verdict /
  footer) with a font marker.
- `.../assets/fonts.css` - Newsreader + Inter + JetBrains Mono, latin subset, inlined as base64.
- `.../assets/diolog-icon.svg` - the light-background droplet mark.
- `.../scripts/inline-fonts.py` - regenerate `fonts.css` or inject fonts into an HTML file.
- `.../references/` - the Diolog design tokens, honest-charting rules, and the render/verify loop.

## Dependencies

Leans on the `create-luke-content`, `design-craft`, and `ux-craft` skills, and expects the Diolog
team-files repo at `~/Dev/diolog-team-files/` for the live design system.
