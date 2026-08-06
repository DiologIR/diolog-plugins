# The portal is generated data now, not a generated file

**Read this before `page-structure.md`.** It changes what you build, not just how.

The first version of this skill produced a hand-authored `index.html` for one company. That
artifact still exists as `assets/reference-build.html` and is still the visual reference. It is
no longer the deliverable.

The deliverable is a **portal record**: a validated JSON document holding the theme tokens, the
imagery, the section list and the motion. A single generic Next.js project reads it, resolves the
company from the hostname, and renders it. Two companies on the same deployment look nothing
alike because the record differs, not because the code does.

```
DESIGN.md + company overview
        │
        ▼  (you, via structured output)
   PortalRecord ──► investor_portals (status: draft)
        │
        ▼
   diolog-investor-portal  ──► every company, one codebase
```

## What this means for you

**You are writing data, not markup.** Section kinds, theme tokens, provenance and motion presets
are an enumerated vocabulary — you select from it, you do not invent HTML. A section kind the
contract does not declare cannot render, and the renderer throws rather than dropping it silently.

**The contract is the authority, and it validates.** `libs/shared/src/investor-portal/portal-contract.ts`
in the dAIolog repo. It is not documentation you can drift from — the record is parsed on the way
into the database and again on the way out, and an invalid record never reaches a reader.

**Most of the code is already written.** The section components, the stylesheet, the motion layer
and the chart all exist. Your job is the record. Reaching for markup means you have misread the
task.

## The invariants the contract now enforces for you

These used to be prose in this skill. They are schema errors now, so getting them wrong fails
loudly at generation time rather than quietly on a live page:

- **Provenance has no default.** Every figure declares `record`, `illustrative` or `unavailable`.
  Omitting it used to mean "real"; now it means invalid. This was the single most dangerous
  default in the first version of the contract — it let an omission silently make the strongest
  claim available.
- **An illustrative value must carry a reason** (`why`), because that reason is what the ledger
  prints, **and must not cite a source document** — a mocked figure never borrows a real source.
- **An unavailable value carries no value.** The surface renders its own "not available"; you do
  not supply a placeholder string for it.
- **A free portal and a disclosure report reject illustrative values outright.** Not a lint — the
  record will not parse. There is no third option on the free surface.
- **A paid portal rejects an illustrative value that is missing from its ledger.** The
  "what is illustrative here" page is generated from that array, so an unlisted value is an
  undisclosed one.
- **A category may only place the section kinds it owns.** A free portal cannot place an audit
  section; a paid portal cannot place a coverage bar.

## Choosing a theme

Lift exact values from the company's DESIGN.md. A near-miss on a brand colour is worse than an
obvious substitution, because nobody catches it.

**One token is not in most DESIGN.md files and you must supply it: `primaryOnDark`.** A brand
accent chosen for white surfaces will usually fail AA on a charcoal band. Measured on the
reference build: `#D72229` on `#2E2B2B` is **2.77:1** against a 4.5 floor — 35 failing nodes on
one page, including the hero headline and both hero CTAs. Compute the lifted variant and put it
in the record.

The same applies to muted text on dark. `rgba(255,255,255,.34)` measured 2.98:1; `.62` reaches
4.6:1. Do the arithmetic rather than picking a plausible alpha.

## Choosing motion

Motion is a named preset per section, not authored code:

`reveal` · `lineMask` · `parallax` · `countUp` · `lineDraw` · `clipUncover` · `railDrift` ·
`magnetic` · `marquee` · `webgl`

`webgl` additionally names a preset (`spaceFrame`, `pointField`, `strata`, `globe`), an opacity
and a mask. Pick from the company's own world — a fabricator gets the truss, a resources company
gets strata. **Two rules that are not stylistic:**

- Every layer is optional and CDN-loaded behind SRI. A section whose motion never arrives must
  still render complete. That is a property of the renderer, but it constrains you: never put
  content behind a motion preset.
- `marquee` needs an operable pause control — WCAG 2.2.2, Level A. `prefers-reduced-motion` is
  honoured but a media query is not a mechanism, and hover-to-pause is unavailable on touch.

## Choosing imagery

**A crawled photograph of the real company always beats a generated one**, and it removes a
disclosure obligation. Search the company overview's image URLs first; the crawl usually carries
one per business unit and per named project.

Generate only for a genuine gap. When you do:

- pass an existing in-repo image as a reference to lock the grade
- front-load subject → action → setting → style → composition → lighting, in prose
- say what to *include*; put "no logos, no readable text, no recognisable faces" in the context
- **never generate a portrait of a real named person** — use initials
- set `origin: 'generated'` and a `prompt` on the asset, so it can be regenerated and so the
  ledger can disclose it

Watch for baked-in furniture in crawled images: caption bars and award badges collide with the
card's own title. Crop them.

## Verifying a generated portal

The acceptance test is a command, not a judgement:

```bash
npm start & node scripts/parity.mjs      # in diolog-investor-portal
```

It compares design tokens, the band skeleton and the computed styles of every named landmark
against a reference deployment. The reference build reaches `checks=904 diffs=0`.

Two failures it caught that source review did not: a ticker rendered twice because the layout and
the page each thought they owned it, and a section split into its own band where the reference
nests it inside another. Neither is visible in source; both are one line in a skeleton diff.

## What has not changed

`binding-decisions.md`, `what-the-research-says.md` and `rendering-traps.md` are unchanged and
still bind. The page order is still facts → disclosures → price beneath both. The H1 still comes
from the company's own website language. There is still no "official company source" badge, no
broker list, no lead-capture modal, and no free-text assistant.

The research did not change. Only the artifact did.
