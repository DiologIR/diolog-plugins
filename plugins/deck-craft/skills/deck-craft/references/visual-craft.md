# Visual craft for decks — direction, type, colour, hierarchy

Everything needed to make a deck look designed rather than generated. Self-contained: no other skill required.

## 1. Ground it in what exists before inventing anything

A deck rooted in real context beats one invented from taste. Before drawing, look for, in this order:

1. **A `DESIGN.md` / design-language spec** in the project root or supplied by the user. Binding, not inspiration. Build from its tokens; never guess a `var(--*)` name, because an unresolved custom property silently falls back and the slide renders in the wrong colour with no error.
2. **A token file** — `tokens.css`, `theme.ts`, `_variables.scss`, or a `theme.tokens` block in a deck JSON. Lift exact hex values, exact font stacks, exact radii and spacing steps. Approximating a brand colour by eye is the most visible failure a branded deck has.
3. **An existing codebase or product UI.** Read the source rather than a screenshot when both exist — you reproduce an interface far more faithfully from code.
4. **Prior decks from the same company.** Match the footer treatment, the section-break pattern, the chart style. A deck that looks like the last one is doing brand work.

Only when none of that exists do you author a direction from scratch (§2). If a brand plainly exists but wasn't supplied, ask for it rather than inventing one.

**Consuming a `DESIGN.md` well.** Take the palette roles (not just the hexes — which colour is *primary*, which is *accent*, which is background), the type ramp with its weights, the spacing scale, the radius scale, and any stated do/don'ts. Map them onto the deck's own scale: a web design system's 16px body becomes 34px on a 1920 canvas, but the *ratios* between its steps carry over. Where the system is silent (decks usually need display sizes a web system never defines), extend it in its own logic rather than importing a different system's values.

## 2. When there's no brand: commit a direction

Mocking a deck without committing to an aesthetic is the fastest path to template output. Pin down the subject, the audience, and the deck's single job — then mine the *subject's own world* for the design language. A mining company's deck can take its palette from ore and steel; a legal-tech deck from paper stock and rule lines. Subject-derived choices are where distinctiveness actually comes from; generic "modern, professional" is where it dies.

Commit on three axes and state them:

- **Scheme** — light paper / dark canvas. Not "dark because tools look cool dark". Write one sentence of physical scene: who is watching this, in what room, on what screen, at what time. If the sentence doesn't force the answer, add detail until it does.
- **Formality** — boardroom ↔ zine.
- **Density** — airy manifesto ↔ data-heavy working deck.

Then declare two things and hold them: **one signature element** (the thing the deck will be remembered by — a full-bleed section break, a recurring rule, a distinctive numeral treatment) and **one justified risk**. Spend the boldness there and keep everything around it quiet. Not taking a risk is itself a risk: "competent but anonymous" is the failure mode of every deck that got no complaints and changed no minds.

**The swap test.** Imagine a neighbouring brief — a different company in the same sector. Would your direction fit it unchanged? Any axis that transfers untouched is a default, not a choice. Revise that axis.

## 3. Typography

**One or two families.** Pair on a contrast axis — serif + sans, geometric + humanist, display + text — or use one family across several weights. Two similar-but-different sans faces read as a mistake, not a pairing.

**A scale, and only the scale.** Define display / title / subtitle / body / caption as tokens and use nothing else. Arbitrary sizes (`37px` beside a 34px body) are the clearest tell of a deck assembled slide by slide rather than designed.

**Sizes for distance.** On 1920×1080: body ≥24px and ideally 32px+; headlines 60–96px. Scale ~0.67 for 1280×720. A user naming a size means points — `px = pt × 1.333`.

**Track deliberately.** ALL-CAPS labels need `letter-spacing: 0.06–0.1em` or the counters collide. Display type ≥48px needs −0.02 to −0.03em, with a hard floor of −0.04em — tighter and letters touch, which reads cramped rather than designed. Body stays at 0. Untracked caps and untracked display are the two most reliable typographic tells.

**Leading and measure.** Display at line-height 1.0–1.2; body at 1.4–1.5 on slides (tighter than web, because lines are shorter and the reader is further away). Cap body lines at ~45–60 characters — a full-width line of 34px text on a 1920 canvas is unreadable at distance.

**Never letter-space or italicise Arabic or Hebrew** — neither script has an italic tradition and spacing breaks cursive joining.

**Avoid the attractors.** Space Grotesk, Inter, Roboto, Arial, bare system stacks, and the silent serif-display defaults (Fraunces, Playfair, Georgia-as-display). Each is fine when chosen; each is a tell when it arrives by gravity. The test: one sentence defending the choice that mentions this deck's subject.

## 4. Colour

**Extract when a brand exists** (§1). Otherwise build a small palette in `oklch()` so hues stay harmonically related:

```
--a: oklch(50% 0.15 250);  --b: oklch(50% 0.15 200);  --c: oklch(50% 0.15 280);
```

**Three to five colours across the whole deck**, plus tints. Limit backgrounds to 1–2; a section break may take a third.

**Pick a strategy, don't drift into one.** *Restrained* — tinted neutrals plus one accent under ~10% of pixels; the default for data decks. *Committed* — one saturated colour carrying 30–60% of the surface; identity decks. *Drenched* — the slide is the colour; covers and section breaks. Defaulting to Restrained without deciding is how timid, evenly-grey decks happen.

**Spend the accent once per slide.** One thing matters; give it the colour. An accent on four elements is decoration.

**Tone the neutrals.** `#FAFAFA` / `#1A1A1A` rather than pure `#FFFFFF` on `#000000` — pure black-on-white is harsh projected and reads unfinished.

**Never encode meaning in colour alone.** Pair with position, label, or shape. Roughly 8% of men have a colour-vision deficiency, and a projector's gamma will flatten your careful red/green distinction anyway.

**Contrast floor:** body text ≥4.5:1 against its background, large text (≥24px bold / ≥32px) ≥3:1. Projection loses contrast — a pairing that passes marginally on your monitor fails in a bright room. Check the muted roles specifically: mid-grey captions on a tinted near-white ground are the most common failure in generated decks.

## 5. Hierarchy and rhythm

**Hierarchy is built from five vectors, not size alone:** scale, weight, colour, spacing (more room = more important), and position. The dominant element needs at least two working the same direction — size-only hierarchy collapses the moment a long headline forces the size down.

Two failure modes, and their fixes: **flat** (everything at similar weight; steps under ~1.25× with no compensating jump) → increase contrast on two vectors. **Noise** (several elements competing as co-primaries; everything bold or accented) → promote one deliberately and demote the rest, including things that feel important. Hierarchy is relative; something has to lose.

**Three weights is plenty:** body (400/450), UI and labels (510/550), headlines (590/600). Weight should jump between levels, not step — a regular→medium→semibold→bold ladder reads as a default scale rather than an authored one.

**Rhythm is repetition with deliberate variation.** All spacing snaps to one scale (multiples of 8 at deck sizes). Repeated elements sit in identical positions slide to slide. Then break the pattern once or twice for emphasis — a page that varies every slide is chaos; one that never varies is a list.

**Value outranks label.** On a stat, "$48.2m" is larger and heavier than "Revenue". The label whispers; the number speaks.

**Cross-slide discipline.** Section headers look identical to each other. Card groups align across columns — titles at the same Y, footers pinned to the same line — because misaligned baselines across side-by-side cards read as broken rather than varied.

## 6. Anti-slop

Each rule leads with the move to make; the trailing clause names what to avoid.

- **Flat colour by default.** If a gradient is needed: two stops, low contrast, same hue family. Avoid rainbow, neon-on-neon, and 3+ stop gradients — and the purple-to-pink hero especially.
- **No emoji** unless the brand uses them or the emoji is functional. 🚀 📈 ✅ sprinkled for colour is the single fastest way to make a deck look generated.
- **Real photography, professional illustration, or an established icon set** (Feather, Material, Phosphor, Heroicons). Avoid hand-drawn SVG of people, scenes, or abstract concepts. With no asset, use an honest placeholder — a striped ground with a monospace label naming the asset and its dimensions. A placeholder shows intent; a weak illustration shows you didn't have the asset.
- **Backgrounds with intent.** A flat toned ground, one photograph, or one geometric device. Avoid the default corporate wash: blue-purple gradient, faint hex grid, floating translucent circles.
- **Card discipline.** Separate with a thin all-round border, a subtle shadow, or background contrast. Reserve `border-left: 4px solid` for real semantic emphasis — as a default card it reads as SaaS template.
- **Charts show the point.** Cut every series and column that doesn't support the slide's claim. Avoid 3D, avoid gratuitous legends where direct labels work, and never truncate a value axis on a comparison — that's a defect, not a style.

## 7. Accessibility floor

Not an add-on; on a projector it's just legibility. Contrast per §4. Never encode by colour alone. Keep interactive affordances (in an HTML deck: nav, links) keyboard-reachable with a visible focus ring — `:focus-visible { outline: 2px solid …; outline-offset: 2px }`, never `outline: none` with no replacement. Respect `prefers-reduced-motion`: under it, builds apply instantly but keep their click steps, because build order is content rather than decoration. Meaningful images get alt text; decorative ones get `alt=""`.

## 8. The last look

Before delivering, remove one thing. Review rounds accrete — a rule here, a badge there, a second accent that crept in. Find the element the deck doesn't need and cut it. If you genuinely can't find one, ship.
