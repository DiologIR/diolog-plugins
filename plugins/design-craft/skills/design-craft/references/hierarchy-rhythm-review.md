# Hierarchy and Rhythm Review

Review the current design for visual hierarchy and rhythm — the two qualities that most distinguish "intentional" from "AI-generated." Fix issues found.

**Hierarchy guides the eye:** what gets looked at first, second, third.
**Rhythm makes the design feel intentional:** repetition with strategic variation.

When hierarchy and rhythm are right, the design feels effortless to scan. When they're wrong, even well-intentioned content feels confusing or boring.

## Phase 1: Identify the surface

Find what to review, in order: (1) the HTML/CSS file the user just edited or asked about; (2) the most recently modified design file in the session; (3) if unclear, ask. Read the file and the styles it references. Note the medium (slide / page / mobile / dashboard) — hierarchy and rhythm rules vary by context.

## Phase 2: Launch two review agents in parallel

Use the **`Agent`** tool to launch both agents concurrently in a single message. Instruct both agents explicitly: **report every issue found, including uncertain and low-severity ones, with a confidence and severity estimate.** Coverage is the agent's job; filtering happens at aggregation (Phase 3).

### Agent 1: Hierarchy review

Hierarchy is built from **five vectors**, not size alone: scale, weight, spacing (more breathing room = more importance), tracking (tighter = faster, wider = ceremonial), and alignment (breaking the grid signals importance). The dominant element needs **at least two vectors working in the same direction**; size-only hierarchy is fragile — any layout constraint that collapses the size contrast destroys it.

For every screen, slide, or major section:

1. **Identify the primary, secondary, and tertiary elements.** What is the user supposed to look at first? Second? Third? If you can't tell, the hierarchy is broken. One dominant entry point per visual region — not two. Diagnose which of the **two failure modes** you're in: **flat** (everything at similar visual weight — scale steps under 1.25× between levels with no compensating weight or spacing jump; fix by increasing contrast on ≥2 vectors) or **noise** (several elements competing as co-primaries — everything bold, large, or accented; fix by promoting one deliberately and demoting the rest, including things that feel important — hierarchy is relative).
2. **Check size differentiation.** Headings should be visibly larger than body text. The primary CTA should be larger than secondary actions. Flag similar content at very different sizes (inconsistent), and different-importance content at similar sizes (flat hierarchy).
3. **Check color hierarchy.** Primary actions in a saturated brand color; secondary in neutral; disabled/de-emphasized in light gray. Flag everything-the-same-color (no signal) or unimportant elements in the brightest color (wrong signal).
4. **Check weight hierarchy.** Well-crafted UIs use exactly three weights: **Read** (400/450) for body, **Emphasize** (510/550) for UI text, labels, and nav, **Announce** (590/600) for headlines and buttons. 700+ is rarely needed — bold used for "emphasis on emphasis" means weight discipline failed elsewhere. Weight should *jump* between levels, not step (a regular→medium→semibold→bold ladder reads as a default scale, not authored hierarchy). Flag everything-bold (nothing stands out) or everything-regular (no emphasis).
5. **Check position.** In LTR languages, eyes start top-left. The most important content (logo, primary headline, primary CTA) should be in the prime real estate. Flag layouts where the primary element is buried bottom-right.
6. **Check density signals.** Loose spacing around important elements signals "pay attention"; tight spacing signals "supporting." Flag cases where the most important content is crammed and unimportant content has lots of breathing room — that's reversed.
7. **Verify "the 5-second test."** A first-time user should understand what to look at and what to do within 5 seconds. If you can't, the eye doesn't have a clear path through the design.

### Agent 2: Rhythm review

For the document as a whole:

1. **Check the spacing scale.** All padding, margin, and gap values should snap to a consistent scale (multiples of 4px or 8px). Flag every random value (`padding: 7px`, `margin: 18px`, `gap: 13px`). List the scale that's been *implicitly* used and identify outliers.
2. **Check the type scale.** Every font size should come from a defined scale. Flag arbitrary sizes (`font-size: 17px` or `23px` when the rest of the design uses 16/20/24). Max **3 type sizes above the fold** — more is a composition problem, not a hierarchy opportunity.
3. **Check letter-spacing.** The most-skipped rule in AI-generated design, no exceptions: body text (14–18px) `0`; small text (11–13px) `+0.01–0.02em`; UI labels and button text `+0.02em`; **ALL CAPS `+0.06–0.1em`, required** (tighter and the counters collide; wider and the word disintegrates); headings ≥32px `−0.01` to `−0.02em`; display ≥48px `−0.02` to `−0.03em`. Untracked caps look cramped and amateur; untracked display looks loose and weak — **these two are the most reliable AI tells in typography**.
4. **Check leading and measure.** Display/H1 (≥32px) at line-height 1.0–1.2; body at 1.5–1.6. Body copy capped at 50–75 characters per line (`max-width: 65ch`). **Never justify body text** — it creates rivers on the web; use `text-align: start` with a ragged edge.
5. **Check repetition.** Sections that should look like each other (cards in a grid, list items, feature blocks) should share padding, gap, font sizes, and structure. Flag near-duplicates that are subtly different — either they should be identical or deliberately different.
6. **Check strategic variation.** A long page or deck should break its pattern occasionally — a different background, a wider section, a centered CTA — to create rhythm. Flag pages that are completely uniform (monotonous) and pages that vary every section (chaotic).
7. **Check color palette discipline.** The design should use 3–5 colors (plus tints/shades) across all elements. Flag cases where 8+ distinct colors appear, or slightly-different blues/grays in different places.
8. **Check section structure.** Sections should be visually distinguishable (background change, divider, padding shift) but follow a consistent pattern. Flag sections with no visual separation (content blurs together) and sections with too many separation styles (no rhythm).
9. **Check alignment.** Elements should align to a grid. Flag elements off by a few pixels in a way that suggests inconsistent margins rather than intentional offset.

Two mechanical lint rules to run regardless of judgment: **no two adjacent hierarchy levels may share scale AND weight AND spacing** (if all three match, the levels are indistinguishable — change at least one); and **at least one section gap should be ≥1.5× the others** (uniform section spacing carries no pacing information — the page reads as a list of blocks).

## Phase 3: Aggregate and fix

Wait for both agents. Aggregate findings. For each issue:

- **Random spacing → snap to scale.** If the file already has a scale, snap to the nearest value. If not, define one (4px or 8px multiples) and update all spacing.
- **Random font sizes → snap to type scale.** Same approach.
- **Flat hierarchy → introduce contrast.** Make headlines bigger, primary CTAs more prominent, body text consistently neutral.
- **Reversed hierarchy → swap signals.** If the unimportant element is brightest, mute it. If the important element is buried, reposition.
- **Monotony → introduce a strategic break.** Change the background of one section, increase the padding of the CTA section, vary the layout of one card.
- **Chaos → consolidate.** Pick the strongest pattern and make others match it.

Apply fixes directly. For ambiguous cases, lean toward the more aggressive hierarchy — a too-strong hierarchy is easier to dial back than a too-weak one to dial up.

**Editorial surfaces** (long-form articles, magazine layouts, editorial landing pages) run hotter than SaaS: display headlines at 56–96px in **light or regular weight** with negative tracking (−0.02 to −0.05em) — bold display reads as billboard advertising; hierarchy is carried by scale and whitespace, not mass. Pull quotes are typographic interrupts at 28–40px, regular/light weight, **breaking the body column with no container** (a pull quote in a border-left callout box is a category error) — maximum 2 per article, or they stop interrupting. Bold in body copy: ≤2 phrases per 400 words. Section spacing alternates deliberately — dense section, spacious section, medium — because uniform pacing reads as a template.

## Phase 4: Summarize

Report: hierarchy issues found and fixed; rhythm issues found and fixed; any judgment calls the user should review (e.g. "I made the CTA significantly larger — adjust if too aggressive"); open recommendations (e.g. "Consider committing to a strict 8px spacing scale; current file mixes 4px and 8px increments").
