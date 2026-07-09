# Page archetypes: five kinds of page, not twenty one-offs

A guide is a **system**, and the unit of the system is the archetype, not the page. Decide the
archetypes before you write markup, then build one instance of each and gate it (design-craft's
`unit-critique-gate.md`) before you reproduce it.

A page that does not fit an archetype means one of two things: the content is wrong, or you need one
more archetype. It never means this page gets bespoke CSS. Bespoke CSS on page 3 is how a document
ends up with three spacings, two baselines, and a void.

## 1. Cover

One job: say what this is, who it is from, and set the tone. It is a **composition**, not a page of
the grid, so it is the one place exempt from the spacing scale (`chromeExempt` in `qa.config.json`).

- Serif title, sentence case, one italic accent phrase, ending in a full stop.
- A standfirst of one sentence. A mono meta rail: date, author, `diolog.app` as a **real `<a>`**, so
  the link annotation survives into the PDF.
- No decorative numbers, no stat grid. If the cover needs numbers to be interesting, the title is
  weak.
- Optional: a WebGL or canvas ground, hidden in print (`@media print { #depth-canvas { display: none } }`).
  Position it `z-index: 0; pointer-events: none` behind the type, and give the type a solid ground so
  nothing depends on the canvas rendering.

## 2. Section opener (the band page)

Announces a family of content. The full-bleed navy band is the one navy surface on the page.

- Display letter or numeral in the margin column, mono eyebrow and serif title in the text column.
- The band **bleeds by exactly its own padding** so its interior lands on the page grid - see
  `grid-and-tokens.md`. `column-misalign` is HIGH precisely because this is easy to get subtly wrong.
- Gap under the band is one token (`--s6`), the same on every section opener. `band-gap-inconsistent`
  exists because it was not.
- Follow it immediately with content. A band with a lonely half-page under it is a stretch-void
  waiting to be invented.

## 3. Content run (the workhorse)

Most pages. Repeated blocks on one rhythm: a hanging display numeral in the margin column, a serif
question or heading in the text column, then labelled prose.

```css
.q { display: grid; grid-template-columns: var(--colnum) 1fr; gap: var(--gut);
     padding: var(--s5) 0; border-top: 1px solid var(--hair); align-items: start }
.q:first-child { border-top: 0; padding-top: 0 }
.qnum { font-family: var(--serif); font-size: 44pt; line-height: 1;
        text-align: right; transform: translateY(var(--numnudge)) }
```

- **Every block on this page has the same top padding.** Different padding because the content count
  changed is `rhythm-inconsistent`.
- **Right-align the numerals.** That is what makes the optical gutter constant across `9` and `28`.
- Two, three, or four blocks per page is fine. Whatever falls short of the bottom **stays** short of
  the bottom. Top-anchor and let it breathe.
- Labelled prose (`WHY THEY ASK`, `A GOOD ANSWER`, `THE TRAP`) uses mono inline labels at >= 11px.
  This is the instrument-panel register, and it is what stops a wall of serif reading as an essay.

## 4. Product slice

An impression of the product, not a replica. Built in **HTML and CSS**, never a raster screenshot:
sharper, self-contained, themeable, and it can carry the motion layer.

- One idea per slice. A record lookup. A consistency check. A pre-send state. Not a dashboard.
- Apply `/ux-craft`: if the slice depicts a data surface, it must be honest about its states. A slice
  showing only the happy path is a lie about the product.
- Caption it in serif italic, one line, centred **inside the card** - and beware: an ancestor
  `max-width` will clamp the caption's box and then `text-align:center` centres it inside the *clamped*
  box, not the card. That is `centre-drift`, and it is why `.prose > p` beats `.prose p`.
- Give it a `.slice` class so the motion governor finds it.
- Full width. A slice squeezed into a narrow column will wrap its pills, and `pill-wrap` is HIGH
  because a two-line pill is unmistakably broken.

## 5. Back matter

Sources, method, evidence, contact. The place where the internal apparatus lands.

- Strip evidence tags (`[Confirmed]`, `[Corpus - verify]`, `[Needs research]`) and production
  checklists from every visible page; consolidate real citations here.
- A CTA card, if there is one, is quiet: one line, one link, no exclamation mark.
- The back cover is a composition, like the front, and is exempt from the scale.

## The page map

Write it before any markup. For a 20-page question guide:

```
p01  cover
p02  content run   (introduction: prose, no numerals)
p03  content run   (how to use: steps + rules)
p04  product slice (consistency check)
p05  section opener A + content run
p06  content run
p07  content run
p08  content run + product slice (record lookup)
...
p19  back matter   (sources)
p20  back cover
```

Five archetypes, twenty pages, one rhythm. If the map needs a sixth archetype, add it deliberately,
build one, gate it, and add its selectors to `qa.config.json` in the same edit - a rule whose
selectors match nothing does not warn you, it passes.
