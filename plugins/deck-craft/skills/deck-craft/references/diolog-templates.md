# Template assembly — the bundled-library target

Build a `lecturn.deck/1` deck from the bundled library: **200 layouts in 27 families**, with **21 recipes** giving an ordered spine per occasion. Referencing a template costs ~80 output tokens where authoring the same slide's geometry costs ~800 — the pipeline expands `{templateId, slots}` into full geometry, z-order, element ids and theme bindings at apply time.

## Read order — and stop when you have what you need

The library is bundled. Two files, in this order:

1. **`recipes.md`** — 21 spines with when-to-use and signal words. Match the brief; take at most one.
2. **`template-catalogue.md`** — 200 layouts in 27 families with their jobs and slots. Read the families the deck needs.

`slot-contract.md` when a gate rejects something. That is the whole read set — author after it.

**No open-ended exploration.** No `ls -R`, no repo-wide grep, no reading a reference "to be sure", and no going after an external deck-schema specification: in a measured run that detour cost four extra tool calls, ~90 seconds, 17k tokens of prompt, and produced a deck with *less* content than the run that skipped it. If something seems missing, hand-author the slide — always permitted, and far cheaper than a discovery sweep.

The upstream generated tree (`scripts/generated/diolog-slide-templates-skill/` in the product repo, `/work/.claude/skills/diolog-slide-templates/` in the runner container) is the source these were folded from. Read it only to run its validator.

## Templates are a base structure, not a form

A recipe is an optional spine: add, drop, reorder, replace or ignore its steps. A template is a starting composition: bend it, or ignore the library and author the slide from nothing. Both are first-class and no gate penalises hand-authoring.

Emit either shape, mixed freely in one deck:

```json
{ "id": "sld_3", "templateId": "kpi-row-3up",
  "slots": {
    "title": "FY26 highlights",
    "kpi.1": { "label": "Revenue", "value": "$48.2m", "delta": "+12%" },
    "kpi.2": { "label": "EBITDA",  "value": "$7.1m" }
  } }
```

```json
{ "id": "sld_4", "elements": [ /* absolute-positioned elements */ ] }
```

Templates expand server-side at apply — never expand one yourself.

Match a template to the slide's **job**, not merely its shape. When the point of the slide needs a composition no template provides, hand-author it.

## The slot contract

Full contract and every validator rule: `slot-contract.md`. In brief — required `!` slots must be present, an unfilled optional slot removes its element and the layout closes up, `max N` caps are refused rather than overlapped, `SOURCE` templates need a `source` slot, `CAVEAT` templates carry a footnote you may reword but not remove, and templates carry no colour or font because the theme resolves those.

## Deck root and transport metadata

```json
{
  "schema": "lecturn.deck/1",
  "id": "…", "title": "…",
  "canvas": { "w": 1280, "h": 720 },
  "theme": { "tokens": { } },
  "slides": [ ],
  "x": { "diolog": {
    "recipeId": "fy-results",
    "structure": [
      { "id": "sld_1", "kind": "cover", "label": "FY26 results",
        "bullets": ["Company and reporting period", "The year's defining line"] }
    ]
  } }
}
```

Derive `theme.tokens` from the supplied design system — an authored palette wins over the derived one, and the apply step only fills what you leave absent. Terminate font stacks with a generic (`Figtree, sans-serif`).

`x.diolog.structure` carries exactly **one entry per slide, in the same order, with `id` equal to the slide's `id`**. `kind` is one of `cover | stat | chart | split | title`; `label` is the visible slide title; `bullets` holds 2–5 grounded outline beats. This lets the deterministic finalizer paint the live skeleton without a second model pass — a missing or misordered entry costs a whole extra pass.

## Element vocabulary that survives apply

`text` · `stat` · `table` · `image` · `shape` · `line` · `chart`.

Do **not** author `group`, `widget` or `embed` — they have no deck mapping and are dropped. Compose with absolute `layout` boxes instead.

## Hard rules the validator enforces

Per-element: `stat.value` ≤14 characters and figure-shaped; a stat must fit its box width or it wraps mid-figure; no fully empty table rows; text must fit its box at its stated `fontSize`; nothing past the 1280×720 frame; no two text-bearing elements overlapping by >20% of the smaller box.

Deck-level, and these exist only in the validator — an author working from the catalogue alone will not know them: a headline figure authored as `text` at ≥40px must be a `stat`; four or more slides on one ground fails; fewer than four distinct font sizes across the deck fails. Arithmetic and rationale in `slot-contract.md`.

## Finishing

Write the finished artifact once. Depending on how you were invoked:

- **Inside the deck producer**, finish with one by-reference call — `submit_artifact({artifact:{kind:"deck", deckPath:"deck.json"}})`. It reads the file, runs the strict template-union and deckconv gates, streams structure/status/content from the validated bytes, and persists exactly those bytes. Don't run or read the validator yourself.
- **Standalone**, run the bundled validator and fix every error it prints:
  ```bash
  node scripts/generated/diolog-slide-templates-skill/scripts/validate-deck.mjs deck.json
  ```

Either way a validation error is a real authoring error. Repair `deck.json` and retry; never bypass the gate, and never downgrade a slide to a weaker template merely to satisfy it — that trades the deck's content for a green check.

## Craft still applies

The template library decides composition, not quality. `references/visual-craft.md` governs the theme tokens, the accent budget, the type ramp and the anti-slop rules; SKILL.md §4 governs the title sequence; and the grounding rule bites hardest here — every figure on an investor slide traces to the supplied company material. An unsourced number is a defect regardless of how good the slide looks, and in this context it is compliance exposure rather than a style note.
