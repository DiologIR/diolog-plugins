# Imagery

## Find before you generate

**A crawled photograph of the real company beats a generated one every time**, and it removes a
disclosure obligation. The company overview is a site crawl: it usually carries an image per
business unit, per named project, plus leadership and history shots. Extract every image URL as
you read.

On a real run this took a portal from four generated images to **zero** — every photograph on
the finished surface was the company's own, which removed an entire entry from its disclosure
ledger. That is a better outcome than a well-disclosed generated image, not merely a cheaper one.

Two things to check on a crawled image before placing it:

- **Baked-in furniture.** Source sites overlay caption bars and award badges. They collide with
  the card's own title. Crop them — detect a full-width band of the brand colour along the bottom
  and cut it.
- **Resolution against its slot.** A 900px source in a full-bleed hero upscales ~2× and goes
  soft. Acceptable behind a heavy scrim; not acceptable in a card.

## Generating the gap

Use the AI Gateway through the AI SDK, the same path `media-gen-pro` uses. Gemini and GPT image
models are both available; a photographic prompt routes best to the photoreal model.

What worked, on a run where four of four generated images were usable:

- **Pass an existing in-repo image as a reference** to lock the grade. Five images matched a
  portal's dark teal-charcoal documentary key purely because one existing photograph was the
  reference.
- **Front-load** subject → action → setting → style → composition → lighting, in prose,
  2–5 sentences. Not keyword tags.
- **Say what to include.** Put the exclusions in the context field: *"no logos, no readable text,
  no recognisable faces"*.
- **Use the company overview as the prompt's context** — its own vocabulary for what it does
  produces images that look like that company's work rather than like stock industry.

## What is never generated

- **A portrait of a real named person.** There is no acceptable version of this. Use initials in
  a monogram frame; it is honest and it reads as deliberate.
- **A photograph presented as depicting a real site, asset or employee.** A generated image
  depicts *the kind of work the company describes*, and the ledger says so in those words.

## Recording it

Every generated asset carries `origin: 'generated'`, its `prompt` and its `model`, so it can be
regenerated, and an entry in `ledger[]` so the surface discloses it. An asset with
`origin: 'crawl'` needs neither.

Compress before shipping. Generation output at 5–6 MB per image is normal; at 2400px wide and
WebP q82 that becomes 250–600 KB and is visually indistinguishable at any web slot. One real
portal shipped 20.3 MB of images into 528×396 slots before this was checked.

**Look at every generated image before placing it.** On the run above, one of five needed a
`object-position` adjustment because the background read as suburban housing rather than an
industrial site. Rendering an image is not seeing it.
