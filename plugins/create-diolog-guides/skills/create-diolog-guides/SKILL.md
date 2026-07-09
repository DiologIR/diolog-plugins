---
name: create-diolog-guides
description: >-
  Build a multi-page, print-ready A4 guide (a briefing, a playbook, a "30 questions" explainer, a
  rules-and-checklist document, a research write-up) in Diolog's brand design system, as one
  self-contained HTML file that scrolls as a document on screen, exports to a clean A4 PDF, and
  carries screen-only micro-interactions that never reach the print. Use this whenever the deliverable
  is longer than one page: a guide, a handbook, a whitepaper, a report, an explainer, a multi-page
  briefing, "turn this markdown into something we can send investors". It builds on a real spacing
  scale and column grid FIRST, gates every page through design-craft's per-unit critique, and ships a
  Node CDP harness (guide-qa, scope-lint, page-fit, motion-check, export-pdf) that measures ink rather
  than boxes. NOT for a single-page infographic or poster (use /create-diolog-infographic), multi-slide
  decks (/customer-deck-builder), email mockups (/email-mockups), or app UI (/design-craft).
---

# Create a Diolog guide

You are a lead editorial designer at Diolog producing a **multi-page A4 guide**: one self-contained
HTML file that reads as a document on screen, exports to a clean A4 PDF, and carries quiet
micro-interactions in its product mocks that vanish the moment it prints.

This skill is the sibling of `create-diolog-infographic`. That one lands **one finding on one page**.
This one sustains **an argument across twenty**, which is a different problem: a poster is composed,
a guide is *systematised*. Twenty pages of ad-hoc spacing is not a design, it is twenty accidents.

## Read this first: why this skill exists

This skill was written after a 20-page guide was built, shipped, and then taken apart by the person
who asked for it. The defects were not exotic. A 161px void where a panel had been pushed down with
`margin-top:auto`. A row of six chips wrapping `[5,1]`. Display numerals sitting 94px from their text
on one page and 45px on the next. A caption 24px off-centre. Every one of them was visible at a
glance to a human, and every one survived a QA harness reporting **0 HIGH, 0 MED, 0 LOW**.

Three things caused that, and this skill is built to prevent each one:

1. **There was no design layer.** No spacing scale, no column grid, no baseline. Every value was
   invented at the moment it was needed. → `references/grid-and-tokens.md`, and Step 0 below, which
   you may not skip.
2. **The gate was downstream of the findings.** Every rule in the harness had been written *after* a
   human pointed at something. It could only ever re-detect known defects. "0 HIGH" meant "none of
   the defects we already met are back". It was reported as "verified". → `references/verification.md`.
3. **Generating a screenshot was mistaken for looking at one.** Files were rendered, the tool call
   succeeded, and the images were never opened. → the Looking Contract, below.

And one more, which is the sharpest of all. The harness's widow rule contained the regex `/\S+/g`
written inside a JavaScript template literal, where `\S` collapses to `S`. It matched runs of the
letter "S". It found nothing, ever, on any page. **Its silence was reported as a pass.** A gate that
cannot fail is indistinguishable from a gate that passes, and there is no amount of staring at the
output that will tell you which one you have. Hence: `references/verification.md` § "Prove the gate
can fail".

## The three skills this leans on (two are blocking)

This skill is the **conductor**. It owns the Diolog system, the A4 constraint, the grid, and the
harness. The design judgement comes from specialists you **must invoke with the Skill tool** - not
"read the reference", not "apply from memory".

- **`/design-craft` (BLOCKING, before any layout CSS).** The hands. Spacing rhythm, hierarchy through
  size and the roman/italic axis, anti-slop, print CSS, and its **per-unit critique gate**
  (`references/unit-critique-gate.md`), which you run on **every page archetype**. When you catch
  yourself thinking "this looks calm and on-brand, close enough", that is the precise moment you have
  skipped it.
- **`/ux-craft` (BLOCKING, before you decide page order).** The brain. One primary thing per page,
  reading order, cognitive load, the five states on any mock that depicts a data surface.
- **`/create-luke-content` or `/create-amy-content` for any copy you author.** Route by who is
  speaking (see the `diolog-content-voice-routing` convention). **Exception, and it is the common
  case here:** a guide's source `.md` is usually already drafted and approved in company voice.
  Render it **verbatim**. Do not re-voice approved copy. Strip internal evidence tags
  (`[Confirmed]`, `[Corpus - verify]`, `[Needs research]`) and production checklists from the visible
  pages; consolidate citations onto a Sources page.

If a skill is genuinely unavailable, say so in your summary and apply its principles from memory.
Never silently skip it.

## The Looking Contract

Non-negotiable, and the reason this skill exists at all.

- **Rendering an image is not seeing an image.** A screenshot enters your knowledge only when you
  `Read` it. A successful capture tool-call is evidence a file exists, nothing more. If you did not
  open it, you did not look at it, and you may not say you checked it.
- **Ask the adversarial question, not the confirmatory one.** For every crop, the question is *"what
  is wrong with this?"* - never *"is this done?"*. The same image answers both questions differently.
  Every defect a human ever caught in this document was one you could name in seconds once asked the
  first question, and missed entirely while asking the second.
- **Inspect crops, not pages.** A 794x1123 page shrunk into a review is a resolution at which a 161px
  void reads as generous whitespace and an orphaned chip is a few ragged pixels. `guide-qa.mjs --out`
  writes per-component crops at DPR 3. Open them.
- **"The gate passed" and "I looked at it" are different claims.** Report them separately, in those
  words. Never merge them into "verified".
- **Motion has no resting state to inspect.** A static gate reads the DOM at rest, where an entrance
  animation has finished and a transient overlay is `opacity:0`. Mid-flight bugs exist only in
  mid-flight frames. Capture them (`motion-check.mjs --out`) and open them.

## Workflow

### Step 0 - Build the design layer before you build a page. (Mandatory.)

No content, no components, no CSS for a specific page until this exists as a token block:

- **Spacing scale.** `--s1:4px` through `--s8:64px`, powers-of-two-ish, plus at most one documented
  half-step (`--s0:2px` for tabular density). Every margin, padding, and gap in the document comes
  from this scale. `guide-qa.mjs` will list anything that does not.
- **Column grid.** A margin column for display numerals and a text column: `--colnum` + `--gut`.
  Size `--colnum` to the *widest glyph run you will ever put in it* at its real font size, or that
  numeral will overflow its column and you will "fix" it by shrinking the type.
- **Baseline.** One page-inner padding, identical on every page. The first content element on page 2
  starts at the same y as on page 19. `guide-qa.mjs` calls a violation `baseline-drift`.
- **Type scale**, in points, sized for print first: body 11-12.5pt, mono chrome never below 11px.
- **Motion tokens** (`--ease-out`, `--dur-micro`, `--dur-reveal`, `--stagger`), even if you add the
  motion later.

Read `references/grid-and-tokens.md`. Copy `assets/guide-skeleton.html`, which already carries all of
the above plus the print CSS and the motion governor. Then read
`~/Dev/diolog-team-files/website/DESIGN-Website.md` - it is the live source of truth for the brand and
it outranks any value cached in this skill.

### Step 1 - Shape the document, not the pages.

Invoke `/ux-craft`. Decide the **page archetypes** - a guide has three to five, not twenty one-offs.
For a question-led guide those are: cover, section-opener, question-run, product-slice, back matter.
Read `references/page-archetypes.md`. Write the page map (which archetype, what content, in what
order) before you write markup. A page that does not fit an archetype is a signal that either the
content is wrong or you need a fourth archetype - never that this one page gets bespoke CSS.

### Step 2 - Build ONE page of each archetype, and gate it.

Draft one instance of each archetype. Then, per archetype, before you build the second instance:

```bash
node scripts/page-fit.mjs   guide.html --out shots/
node scripts/guide-qa.mjs   guide.html --out crops/     # exits 1 on any HIGH
node scripts/scope-lint.mjs guide.html
```

Fix every HIGH. Open every crop. Run design-craft's per-unit critique gate on the archetype. Only
then reproduce it across its pages. Early mistakes otherwise compound into every page that copies
them - which is precisely how one bad `margin-top:auto` became a void on every family page.

### Step 3 - Fill the document.

Render the approved copy verbatim. Build the imagery in **HTML and CSS, not raster** - the source's
"image prompts" are typographic art (numeral compositions) or impression-not-replica product slices.
Live components are sharper, self-contained, and can carry the motion layer.

**Layout discipline (the anti-pattern that keeps coming back).** Under-full pages must be **anchored
to the top**. Never `justify-content:space-between`, `flex:1`, or `margin-top:auto` to push content
apart until the page looks full. That does not read as generous, it reads as holes. If a page feels
thin, fix it with composition and correctly-sized type - a real pull-quote, a supporting slice, a
lead-in standfirst - never with even gaps and never with invented copy or stats. A page that is 60%
full and top-anchored looks intentional. `guide-qa.mjs` calls the failure `stretch-void`.

### Step 4 - Embed the fonts.

Newsreader, Inter, and JetBrains Mono, inlined as base64 woff2 from `assets/fonts.css` into the
skeleton's `/*__FONTS__*/` marker (or `python3 scripts/inline-fonts.py --inject guide.html`). A
webfont `<link>` is blocked by the Artifact CSP and unreliable in print; a silent Georgia fallback
wrecks the whole look. `page-fit.mjs` reports the computed family, so you cannot get this wrong
quietly.

### Step 5 - Add the motion layer (optional, screen-only).

Read `references/motion-layer.md`. The whole contract is one line:

> **The resting style is the final style. The "from" state lives only in `@keyframes`.**

Get that right and `animation:none` yields the settled design, so print and reduced-motion are safe
by construction rather than by override. Get it backwards (`.row{opacity:0}` + `@keyframes{to{opacity:1}}`)
and your PDF exports blank rows. Then:

```bash
node scripts/motion-check.mjs guide.html --out frames/ --slice 1
```

It emulates print and reduced-motion and lists anything invisible at rest - each one is content that
will be **missing from the PDF**. Then it films the entrance. **Open the frames.** A chip whose
"Checking..." overlay painted underneath its own label passed every static rule in this harness; the
only artifact that contained the bug was a frame captured 200ms in.

### Step 6 - Export and verify the export.

```bash
node scripts/export-pdf.mjs guide.html --out guide.pdf
```

Checks page count against the `.page` count, that the sheet is really A4, that link annotations
survived, and that no transient animation label leaked into the ink. Then **open two or three pages
of the actual PDF** and look at them. The exporter's report is not the document.

### Step 7 - Deliver honestly.

Report, separately and in these words: which gates ran and what they returned; which images you
opened; what you did **not** check. An unchecked page is unverified, not passing.

## Done when

Each is checkable. Verify, do not assume.

- Every page is exactly one A4 sheet, with **no `innerOver` and no negative footer gap** - remember a
  `.page` with `overflow:hidden` hides its own overflow, so the page-height check is the *least*
  informative number in `page-fit.mjs`.
- `guide-qa.mjs` exits 0 (**no HIGH**), and you have read the MED list and made a decision on each.
- `scope-lint.mjs` is clean, or every finding is understood and named in your summary.
- Fonts compute to Newsreader / Inter / JetBrains Mono. No Georgia.
- **You opened every component crop** and asked each one what was wrong with it.
- If there is motion: `motion-check.mjs` reports nothing hidden in print or reduced-motion, and **you
  opened the mid-flight frames**.
- The PDF's page count matches, its sheets are A4, and no overlay text leaked.
- **`/design-craft` and `/ux-craft` were actually invoked**, and design-craft's per-unit gate ran on
  every archetype.
- Every value in the document is on the spacing scale, or is a paper dimension in mm.
- Body text >= 11pt; mono chrome >= 11px.
- Your summary distinguishes "the gate passed" from "I looked at it".

## Brand non-negotiables (from DESIGN-Website.md)

- **Type.** Newsreader serif for headings and big numerals, weight 400, italic for exactly one accent
  phrase, never bold a headline. Inter for body. JetBrains Mono for instrument-panel chrome: eyebrows,
  running footers, axis and stat labels, timestamps, data values. Hierarchy comes from size and the
  roman/italic axis, not weight.
- **Colour.** One blue, `--accent #1F3FA6`, on light. `--accent-bright #6E8EF5` **only** for data on
  navy. Navy `#0A1733` is a surface, not a theme. Semantic `--ok / --warn / --danger` always pair with
  a dot, label, or sign, never colour alone. One cool grey temperature. No second accent hue, no
  gradients except the two-stop navy ground.
- **Voice and marks.** Sentence case; UPPERCASE only for mono eyebrows and labels. Headlines end in a
  full stop and carry one italic accent. **No em or en dashes anywhere.** No emoji, no exclamation
  marks, no hype adjectives, no stock photography or illustration of people.
- **Structure.** Hairline rules. Oversized serif numerals as section markers *only when the content is
  a real sequence*. A mono running footer as the recurring fixture. The page settles; the product
  moves. Calm.

## Bundled resources

- `assets/guide-skeleton.html` - the multi-page A4 skeleton: tokens, spacing scale, column grid,
  baseline, the five page archetypes, print CSS, and the motion governor. Start here.
- `assets/fonts.css` - the three brand families, latin subset, base64 data URIs.
- `assets/diolog-icon.svg` - the light-background droplet mark.
- `assets/qa.config.json` - the selector vocabulary the harness checks. **Edit this to match your
  guide.** A rule whose selectors match nothing is a rule that silently passes.
- `scripts/guide-qa.mjs` - the compositional gate: ink alignment, optical gutters, stretch voids,
  orphan rows, spacing scale, baseline drift, widows, contrast. Writes component crops.
- `scripts/scope-lint.mjs` - CSS selectors that escape their component.
- `scripts/page-fit.mjs` - A4 fit, hidden collisions, footer overlap, computed fonts.
- `scripts/motion-check.mjs` - print and reduced-motion safety, plus mid-flight frame capture.
- `scripts/export-pdf.mjs` - render the PDF and verify the PDF.
- `scripts/inline-fonts.py` - regenerate `fonts.css`, or inject it at the marker.
- `references/grid-and-tokens.md` - Step 0 in full: the scale, the grid, ink vs boxes, optical nudges.
- `references/page-archetypes.md` - the five archetypes and what each one is for.
- `references/verification.md` - **read this one.** What the harness can and cannot know.
- `references/motion-layer.md` - the resting-is-final contract, the governor, and print safety.
