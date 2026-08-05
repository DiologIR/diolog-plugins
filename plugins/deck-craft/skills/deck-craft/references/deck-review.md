# Deck review — the per-slide gate and the pre-delivery pass

Two loops. The **per-slide gate** runs while you build, because a mistake on slide 2 propagates into every slide that copies its layout. The **delivery pass** runs once at the end and owns what a per-slide gate can't see: consistency *between* slides, the argument as a whole, the export.

## The per-slide gate

After drafting each slide, before starting the next. Cheap checks first:

1. **Does it say one thing?** Name the slide's single claim out loud. If that takes two sentences joined by "and", it's two slides.
2. **Type on the scale.** Every size traces to a `--type-*` token (or the deck's declared ramp). Body at or above the distance minimum: ≥24px on a 1920 canvas, ideally 32px+.
3. **Does the text fit its box** at its stated size, with the longest real string rather than the sample one? In an absolute-geometry format nothing shrinks to fit; in HTML nothing warns you.
4. **Grounding.** Every figure and claim traces to the source material. A number you can't point at is a number that comes off the slide.
5. **Accent spent once.** One thing carries the colour.
6. **Parallel with its neighbours.** Repeated elements in the same position; section headers identical to each other.
7. **Look at it.** Render the slide and open the capture — see below.

## Looking is the part that gets skipped

Three rules make verification real rather than ceremonial:

**Rendering an image is not seeing one.** A screenshot tool returning success proves a file exists. The image enters your knowledge only when you *open* it. If you didn't open it, you didn't check it, and you may not say you did.

**The question you bring determines what you see.** Handed a capture and asked "do you see anything wrong with this?", you find the defect in seconds. Looking at your own render, the implicit question is "is this done?" and the answer comes back yes. Same pixels, opposite results. So ask literally: **"what is wrong with this?"** Answering "nothing" requires first naming the three most likely failure modes for that slide type — a void, a wrapped headline, a misalignment, an overlapping label, a contrast miss — and ruling each out by pointing at pixels.

**Inspect crops, not whole decks.** A full slide scaled into a review thumbnail is a resolution at which a 161px void reads as generous whitespace and an orphaned label is a few ragged pixels. Judging from thumbnails is looking at an image in which the defects cannot exist and concluding there are none. Crop to the region at DPR 2–3.

Do this yourself. A deck is a handful of tool calls to walk, and delegating it costs a whole context to learn what a crop would have told you.

## The delivery pass

Once, before handing over. Walk the whole deck.

**The argument.** Read the titles in sequence — do they carry the whole thing? Is the grammatical style consistent? Are there filler slides to cut? Does slide 9 restate what a listener needs from slide 3 rather than assuming they held it?

**The direction, promise by promise.** Inventory what the deck actually shows in your own words *first*, then reread the direction contract (`visual-craft.md` §2) and walk its five blocks — THESIS, OWN-WORLD, STORY, COVER, FORM. Doing it in that order matters: a review anchored on the contract inherits whatever the contract's abstraction already dropped. Classify each committed element **match / acceptable adaptation / missing / contradicted**. Two rows are mandatory:

- **TYPE** — the display lettering's character, width, weight and contrast against what OWN-WORLD committed to. A face of a different character is *contradicted* however well the slides are laid out.
- **MATERIAL** — a surface rendered as flat colour or a CSS gradient where the direction committed to a photograph, a texture, or a real asset is *contradicted* regardless of composition. The medium is part of the promise, and faked physicality (see `visual-craft.md` §6) counts as contradicted on its face.

An adaptation is intentional only when it cites the thing that forced it — a user answer, a brand constraint, a validator cap, a missing asset. An uncited deviation is a defect, and a missing signature element outranks every craft point below.

**Consistency between slides.** Palette drift (a second blue that's 5% off the first is worse than a clearly different colour — it reads as almost-right and therefore wrong), type-scale drift, spacing drift, a footer that wanders, section headers that don't match each other.

**Overflow and collision.** Nothing escaping its slide bounds; no unintended overlap; long words and URLs wrapped; ellipses appearing where truncation was designed. In HTML, check at several viewport sizes — the stage should letterbox, never re-layout. In an absolute-geometry format, check every element's box against the canvas: `x + w > canvas.w` is off-slide and `y > canvas.h` renders nothing at all, silently.

**Full-bleed integrity.** Backgrounds, hero images and colour panels reach all four edges. A blank strip below a cover image means a wrapper collapsed (see `html-deck.md` Phase 4).

**Navigation and state**, for HTML: keyboard (arrows, space), click/tap, the counter increments correctly, the deck reloads to where it was, nothing throws in the console. A clean-looking deck with an uncaught exception is not verified.

**Contrast**, at the projected end of the range rather than your monitor's. Muted captions on tinted grounds are where this fails.

**The export.** If a `.pptx` or PDF is the deliverable, produce it and open it. A deck that renders in a browser and breaks in PowerPoint has not been delivered.

**Composition, judged as slides not as web.** `align-items: flex-start` with open space in the bottom third is correct slide composition, not a defect. If you feel the urge to change `flex-start` to `center`, that's the web-layout reflex — resist it. The open space is intentional.

**The last look is subtractive.** Remove one element the deck doesn't need. Review rounds accrete; this is the counterweight.

## What a clean gate proves

A passing check means **no known defect is present**. It never means *verified*. Every rule in any gate was written after someone met the defect it catches — it is structurally incapable of finding the one nobody has met yet, and a rule whose selector matches nothing passes silently rather than warning you.

So report the two claims separately, in these words:

```
Gates:       validator clean · no overflow · 0 console errors
Looked at:   12 slide crops @2x, cover + section breaks, 1280 and 1920
Not checked: the PDF export, the chart's empty state
```

The first line is what a machine asserts. The second is what *you* assert, and it's true only for captures you opened. The third is never empty — if you think it is, you've confused the scope of your checks with the scope of the deck.

## Convergence and the disposition

Treat fix-then-recheck as rounds, up to three. Each round's findings should be shorter than the last; a round producing more text than the previous one is churning rather than converging. **Stop the moment a round resolves nothing** — the round after it won't either.

Close every review with one computed word, not a felt one:

- **`rebuild`** — the rebuild condition below fired.
- **`fix`** — findings remain open.
- **`ship`** — nothing material is open.

Report that word verbatim. A deck with open material findings is never announced as a pass, and never under a softer label than the review produced — softening it is the one move that turns a review into theatre. If round three still doesn't clear the bar, deliver the best version under an honest word: "ships with two open items: …".

**The rebuild condition.** When the direction is contradicted across the deck rather than on a slide or two — the wrong type character throughout, the committed material absent everywhere, the cover carrying a different world than the body — the first fix is a **rebuild directive** naming the slides to re-derive and the assets to produce, not a list of cosmetic repairs. A patch list against a deck that failed wholesale launders the rejection into an approval, and on a twelve-slide deck it costs more than the rebuild. Where a fix requires *producing* something — a real photograph, a texture, a drawn icon set — say so explicitly ("produce: cover photograph, site at scale"), never phrased as a style adjustment that will get answered with a gradient.

## The verdict pass — score the fixes, don't re-hunt

After a repair batch, the job is scoring, not finding. For each item from the previous round, one line: **resolved**, **partial**, or **unresolved**, tied to what the new capture visibly shows.

**Your account of what you fixed is not evidence.** A fix you cannot see in the recapture is unresolved however confident the edit felt — the same rule as "rendering an image is not seeing one", applied one step later. A fix answered mechanically, where the element moved but the quality the finding named is still absent, is partial at best.

Then name at most three regressions the batch itself introduced, and nothing else. No new checks, no reopened hunt. Recompute the disposition against what stays open: unresolved or partial material findings can never recompute to `ship`.

## The summary

Short. What the deck is, then: the disposition word, caveats (placeholder imagery still needed, figures the source didn't support), open decisions the user should sign off (the direction, an aggressive hierarchy call), and what you didn't check. Not a slide-by-slide recap of what they watched you build.
