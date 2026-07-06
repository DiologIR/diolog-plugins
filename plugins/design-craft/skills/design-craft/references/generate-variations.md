# Generate Variations: Produce 3+ Design Options

Produce multiple distinct design variations of a screen, component, or flow so the user can mix and match the strongest pieces. Use this when the user asks for options, alternatives, "different takes," or "show me a few."

**Variations are the cheapest path to good design.** A single design is one bet. Three variations let the user reject what they don't want and combine what they do.

## Phase 1: Establish the baseline

Confirm:

- **What is being varied.** A single screen, a component, a whole flow, a visual treatment? Scope determines how many variations are useful.
- **Existing design context.** Is there a UI kit, design system, or reference design? Variations should still root in that context unless explicitly asked to break free.
- **Number of variations.** Default to 3 if unspecified. 5–6 is a healthy ceiling — more than that and the user can't hold them all in mind.
- **Axis preference.** Does the user care most about visuals, interactions, layout, or copy/tone? You can vary on multiple axes, but knowing the priority helps you weight the explorations.

## Phase 2: Pick the axes

Common variation dimensions — pick 2–4 to vary across:

- **Visual treatment** — color tone (warm / cool / neutral), density, shadow style, border radius, type weight
- **Aesthetic family** — pull directions from different rows of the range map in `frontend-aesthetic-direction.md` (Swiss vs editorial vs neo-grotesque product vs brutalist…)
- **Layout** — centered vs asymmetric, single-column vs multi-column, full-bleed vs inset, grid-heavy vs flowing
- **Interaction model** — single page vs multi-step, modal vs inline, hover-revealed vs always-visible
- **Motion & depth** — quiet vs one orchestrated entrance vs scroll-driven; flat vs textured vs dimensional (`motion-design.md`, `depth-and-3d.md`)
- **Information hierarchy** — what's elevated, what's secondary
- **Tone** — minimal / formal / playful / expressive / editorial
- **Component style** — filled vs ghost buttons, cards with shadows vs flat, rounded vs sharp

Within a chosen brand, variations **remix the brand's own visual DNA**: play with scale, fills, texture, visual rhythm, layering, novel layouts, and type treatments built from the same tokens. The goal isn't the one perfect option — it's atomic variations the user can mix and match.

For each variation, write down which axis (or axes) you're flexing. This makes the comparison legible to the user.

## Phase 3: Build with intent — basic to bold

Order matters. Start with the most by-the-book, end with the most novel:

1. **Variation 1 — by the book.** Matches existing patterns and conventions. The "safe" option — the user knows it works because it looks like things that already work.
2. **Variation 2 — refined.** Takes the safe option and pushes one or two dimensions — bolder type, a more confident layout, a more expressive color choice. This is often the user's actual pick.
3. **Variation 3 — novel.** A genuinely different take — an unconventional layout, a strong visual metaphor, an unexpected interaction, a daring aesthetic. The user may not pick it, but it stretches the conversation and surfaces preferences they didn't know they had.
4. **Variation 4–6 (if requested).** Hybrid points along the spectrum, or a wildcard on a different axis.

**Cover both ends.** Three "safe" variations waste the user's time; three "wild" ones feel like you didn't take the brief seriously.

## Phase 4: Vary substantively, not cosmetically

A variation is not "the same design with a different color." Each should differ on something that actually matters:

✅ Differ in: layout, hierarchy, what's primary vs secondary, type system, density, interaction approach, copy strategy
❌ Same except: button color, accent shade, shadow opacity

If two variations are too close, drop one and replace it with a more substantive alternative. The user should be able to articulate the difference between any two variations in one sentence.

**Specify each variation concretely before building it** — distinct palette family, distinct type pairing, distinct layout skeleton, written down per variation. Variety must be designed, not hoped for: left unspecified, variations drift toward one default look (typically the warm-editorial house style). For the novel variation, deliberately pick something off-distribution and interesting.

## Phase 5: Present in a single file

Put all variations in **one file**, not scattered across `v1.html / v2.html / v3.html` — live comparison is far more useful. Two patterns:

- **Side-by-side canvas** for static variations — a single HTML page with a CSS-grid of labeled cells, one variation per cell (see the canvas snippet in `wireframe.md`). Good when the variations differ structurally.
- **Tweaks** when the variations share most of the structure and differ on a few axes (color, type, density, a layout toggle) — expose those axes in a floating panel so the user flips between them live. See `make-tweakable.md`.

For a flow or multi-screen variation, build each variation as a small storyboard within the canvas.

## Phase 6: Annotate

For each variation, add a short caption (one or two sentences):

```
Variation 1 — Conventional. Centered hero, single CTA, high contrast.
Variation 2 — Refined. Same structure, expressive headline type, warmer palette.
Variation 3 — Editorial. Asymmetric layout, large pull quote, slow scroll-driven reveals.
```

The captions are a thinking tool — they force you to articulate what makes each variation distinct. If you can't write a clear caption, the variation isn't distinct enough.

## Phase 7: Recommend

End with a clear recommendation. The user is the decider, but a designer offers an opinion:

- "Variation 2 is my pick — it keeps the safety of Variation 1 but adds visual confidence."
- "Variation 3 is the most interesting bet, but higher risk for a customer-facing landing page."
- "Variations 1 and 2 are close — pick based on whether you want neutral or warm."

Be direct. Don't hedge by saying all options are equally good. They aren't.

## Phase 8: Hand off

After the user picks (or asks for another round), suggest the next step: a single-direction iteration to refine the chosen variation; a second variation round on a different axis; `make-a-prototype` to take a chosen variation to interactive; or `polish-pass` if they're ready to ship the chosen variation.
