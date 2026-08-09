# Imagery with media-gen-pro

Photography is what separates a deck that looks like the company from a deck
that looks like a template with the company's colours on it. It is also the
part with the most ways to go quietly wrong.

## Decide the medium before the treatment

What a region *shows* decides what it is made of, never what feels buildable in
a `<style>` block:

- A photograph, a site, machinery, a product in use, a human figure → **raster**.
- A named texture — concrete, brushed metal, ore, paper grain → **raster**.
- Rules, hairlines, flat shape systems, diagrams with countable elements →
  **authored SVG or CSS**.
- Anything with data in it — charts, labelled diagrams, tables, UI — **built in
  code and screenshotted**. Image models garble words and invent numbers, and
  re-prompting garbles them differently.

Writing a gradient where the direction promised a photograph is not a treatment
choice; it is the design quietly deleted. It is how a cover promising a mine
site ships as a blue wash.

## Generating

Call `mcp__media-gen-pro__generate_image`. What worked on the reference build:

**Lock the grade with a reference image.** Pass an existing in-repo image as
`referenceImages` and every new image comes back in the same key. The reference
build's five new photographs match the portal's dark teal-charcoal documentary
grade because one existing hero image was passed as the reference on all five.
Without it, five images generated from five prompts are five different films.

**Write the prompt as prose, front-loaded.** Subject → action or pose → setting
→ style → composition → lighting → key details, in 2–5 natural sentences, one
scene per prompt. Not keyword tags.

**Say what to include.** Put the exclusions in `context` rather than the prompt:
"no logos, no readable text, no recognisable faces".

**Let the server pick the model unless you have a reason.** It reads the prompt
and reports its choice; on photographic prompts for the reference build it chose
Recraft and that was right. Name a model only when you want something specific
(`svg: true` for a real SVG, `photoreal`, `gemini` for speed).

**Ground the prompt in the facts card, not the sector.** "Underground continuous
miner at the coal face in a rock-bolted heading" comes from knowing what the
company actually does. "Mining industry" comes from knowing nothing, and it
shows.

## Three rules that are not negotiable

**Never generate a portrait of a real named person.** There is no acceptable way
to synthesise the likeness of an actual director, and a stock face attached to a
real name is worse. Use `credential-cards` — facts in cards carry a biography
perfectly well, which is why that template exists.

**Disclose generated imagery on the artifact itself**, in the back matter:
*"Photography is illustrative and does not depict [Company]'s sites, assets or
personnel."* This is the reason the deck is allowed to carry generated
photography at all, and its absence is the one failure here a reader cannot
detect and is entitled to.

**Look at every image before placing it.** Two of the reference build's five
needed a judgement call — one read as suburban housing behind the crane, and was
mitigated with `object-position: center 22%` while staying first in line for
replacement by real photography. A generated image is a draft until someone has
looked at it.

## Alt text is not decoration

The `alt` on a full-bleed photograph is how the deck reads to a screen reader
*and* how a reviewer checks the image is the one that was commissioned. Describe
what is in the frame, specifically.

## Compress before shipping

Generation produces 5–6 MB per image. Five of them is a 27 MB deck.

```bash
./scripts/optimise_images.sh path/to/imgs        # 2400px wide, WebP q82
```

The reference build's five images went 27 MB → 1.9 MB and were visually
indistinguishable at the 1920px stage size. The script writes `.webp` beside the
source and leaves the original alone, because upscaling a compressed file back
is not a recovery. If quality is the priority, regenerate rather than reprocess.

## Check the composite, not the asset

A texture buried under a near-opaque colour wash ships the wash. An image at low
opacity behind other paint is a compliance token, not a material. Judge every
asset in the rendered capture beside what it was meant to be — and remember that
on any slide carrying a photograph, the copy's visibility is a separate question
that only `elementFromPoint` answers (see `gates.md`).

## When there are no assets and none can be generated

Use an honest placeholder and say so: a striped background with a monospace
label naming the asset and its dimensions. A placeholder shows intent. A
hand-drawn SVG of a person, or a gradient standing in for a photograph, shows
that the asset is missing while pretending otherwise — and it is the version
that ships.
