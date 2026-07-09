# create-diolog-guides

A Claude Code skill that produces a **multi-page, print-ready A4 guide** in Diolog's brand design
system: one self-contained HTML file that reads as a document on screen, exports to a clean A4 PDF,
and carries quiet micro-interactions in its product mocks that vanish the moment it prints.

Sibling of `create-diolog-infographic`. That skill lands **one finding on one page**. This one
sustains **an argument across twenty**, which is a different problem: a poster is composed, a guide is
systematised.

## Use it when

The deliverable runs longer than one page: a guide, a briefing, a playbook, a handbook, a whitepaper,
an explainer, a report, "turn this markdown into something we can send investors".

Not for: a single-page infographic or poster (`create-diolog-infographic`), multi-slide decks
(`customer-deck-builder`), email mockups (`email-mockups`), or app UI (`design-craft`).

## What it does differently

- **Step 0 is mandatory.** A spacing scale, a column grid, one shared baseline, print-first type, and
  motion tokens exist *before any page does*. Twenty pages of ad-hoc spacing is not a design, it is
  twenty accidents that happen to share a font.
- **Three to five page archetypes, not twenty one-offs.** Build one of each, gate it, then reproduce.
- **The motion contract is one line:** *the resting style is the final style; the "from" state lives
  only in `@keyframes`.* Print safety and reduced-motion safety then come for free, by construction.
- **The harness measures ink, not boxes.** `getBoundingClientRect()` tells you where a box is; a
  baseline probe plus canvas `TextMetrics.actualBoundingBoxAscent` tells you where the reader sees
  the letter. Those differ by up to 8px, which is why "the CSS is correct" and "it looks wrong" are
  routinely both true.

## The verification stance

This skill exists because a 20-page guide shipped with a 161px void, an orphaned chip row, and
stranded numerals, all of which a human found in four seconds, while the QA harness reported
`0 HIGH, 0 MED, 0 LOW`.

Three things it now refuses to let you do, and `references/verification.md` explains each:

1. **Treat a clean gate as a verified document.** Every rule in a gate was written *after* someone
   pointed at a defect. A gate is downstream of its findings. "0 HIGH" means "no *known* defect is
   present". Report *"the gate passed"* and *"I opened crops X, Y, Z"* as separate claims.
2. **Mistake rendering a screenshot for looking at one.** An image enters your knowledge when you
   read it, not when the capture call succeeds.
3. **Trust a rule that has never been observed failing.** The harness that reported all-clear
   contained `/\S+/g` inside a JavaScript template literal, where `\S` collapses to `S`. The widow
   rule matched runs of the letter "S" and found nothing, ever. Its silence was reported as a pass.
   Hence: serialize real functions, never template-literal strings, and run every new rule against
   the artifact that motivated it before you fix that artifact.

## The harness

Zero npm dependencies (Node 22+ native `WebSocket` and `fetch`). Each script serves the file over
http, launches its **own** headless Chrome with its **own** temp profile, and kills only what it
started.

```bash
node scripts/page-fit.mjs    guide.html --out shots/    # A4 fit, hidden collisions, computed fonts
node scripts/guide-qa.mjs    guide.html --out crops/    # the compositional gate; exits 1 on any HIGH
node scripts/scope-lint.mjs  guide.html                 # CSS that escapes its component
node scripts/motion-check.mjs guide.html --out frames/  # print/reduced-motion safety + mid-flight frames
node scripts/export-pdf.mjs  guide.html --out guide.pdf # render the PDF, then verify the PDF
```

`assets/qa.config.json` names the selectors each rule inspects. **Edit it to match your guide.** A
rule whose selectors match nothing does not warn you; it passes.

## What's inside

- `skills/create-diolog-guides/SKILL.md` - the workflow, the Looking Contract, the done-when list.
- `.../assets/guide-skeleton.html` - the A4 multi-page skeleton: tokens, grid, baseline, five
  archetypes, print CSS, motion governor. Calibrated to 0.00px ink delta on every margin-column glyph.
- `.../assets/fonts.css` - Newsreader + Inter + JetBrains Mono, latin subset, base64 data URIs.
- `.../assets/qa.config.json` - the selector vocabulary the harness checks.
- `.../references/grid-and-tokens.md` - Step 0 in full: the scale, the grid, ink vs boxes, CSS scoping.
- `.../references/page-archetypes.md` - the five archetypes and what each is for.
- `.../references/verification.md` - what the harness can know, and what only you can.
- `.../references/motion-layer.md` - the resting-is-final contract, the governor, print safety.
- `.../scripts/` - the harness, plus `inline-fonts.py`.

## Dependencies

Invokes `design-craft` and `ux-craft` (both blocking), and `create-luke-content` /
`create-amy-content` when copy must be authored rather than rendered verbatim. Expects the Diolog
team-files repo at `~/Dev/diolog-team-files/` for the live design system
(`website/DESIGN-Website.md`), which outranks anything cached in this skill. The harness needs Node 22+
and a Chrome or Chromium binary (`CHROME_BIN` to override); `export-pdf.mjs` additionally uses poppler
(`pdfinfo`, `pdftotext`) and says so plainly when they are absent rather than reporting a pass.
