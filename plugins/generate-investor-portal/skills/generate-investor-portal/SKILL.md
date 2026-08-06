---
name: generate-investor-portal
description: >-
  Generate a complete investor-portal record into the Diolog database from a company's DESIGN.md
  and company-overview markdown — theme tokens, section content, imagery and GSAP/three.js motion,
  all as validated structured output. One generic Next.js project then renders it for that
  company's subdomain, so a new company is a generated record rather than new code. Use this
  whenever someone wants an investor portal built, generated or refreshed for a listed company,
  wants a company onboarded onto the portal platform, hands over a DESIGN.md plus a company
  overview and asks for a portal from them, wants the free or paid tier produced for a ticker, or
  asks to regenerate a portal after a rebrand or a new set of disclosures — even if they only say
  "make ACME a portal" or "do what we did for Alfabs for this company". Emits `free`, `paid` or
  `report` category records against the contract in libs/shared/src/investor-portal, generates
  imagery through the AI Gateway only where no crawled photograph exists, and finishes by proving
  the result renders. Not for hand-building a one-off HTML page (create-investor-portal-free is
  the visual reference), running a disclosure-consistency analysis, or extracting a DESIGN.md from
  a site (design-md-from-website).
---

# Generate an investor portal

You are producing **data**, not a website. The website already exists: one generic Next.js
project (`diolog-investor-portal`) renders any company from a validated record. Your output is
that record.

Getting this wrong in the first five minutes is the expensive failure. If you find yourself
writing HTML or CSS, stop — you have misread the task.

```
DESIGN.md  +  company overview
        │
        ▼   structured output, validated against the contract
   PortalRecord  ──►  investor_portals   (status: draft)
        │
        ▼
   the generic renderer, resolved by hostname
```

**Budget: under 10 minutes excluding image generation.** If you are past that, you are almost
certainly authoring prose the overview already contains, or re-deriving tokens the DESIGN.md
states. Both are copying tasks, not writing tasks.

## Read first

- `references/record-shape.md` — what you emit, field by field, and the invariants the contract
  enforces rather than documents.
- `references/tokens-and-motion.md` — lifting a theme from a DESIGN.md, the one token most
  DESIGN.md files lack, and choosing motion presets from the company's own world.
- `references/imagery.md` — find before you generate; the AI Gateway path; what must never be
  generated.
- `references/validate-and-prove.md` — how to know it worked, which is a command rather than a
  judgement.

The **content decisions** — section order, what belongs on the page, what must never appear —
are not restated here. They live in `create-investor-portal-free`'s `binding-decisions.md`,
`what-the-research-says.md` and `page-structure.md`, and they still bind. Read them when you are
deciding *what* goes in a section; read this skill when you are deciding *how to emit it*.

## Inputs

Ask for whichever is missing rather than guessing:

1. **A DESIGN.md** with the company's tokens. If none exists and a live site does,
   `design-md-from-website` produces one from measured computed styles — a far better starting
   point than inventing tokens.
2. **A company-overview markdown** — what the company does, its units, sites, leadership,
   listing history, projects, disclosures. This is the only source of company facts.
3. **The category**: `free`, `paid` or `report`.
4. **The company id** in the Diolog database.

## Build

### 1. Read the overview end to end before emitting anything

Not skimmed. The overview is usually a site crawl of a few thousand lines, and the facts you
need are scattered: leadership on one page, projects on another, certifications inside a body
paragraph, the announcement list under Investor Information with real PDF URLs and real dates.

Inventory as you read: business units, named projects, leadership names and titles, site
addresses, certifications, the disclosure list, values, history, and **every image URL**.

### 2. Lift the theme verbatim

Exact hex values, exact font stacks, exact spacing steps. A near-miss on a brand colour is worse
than an obvious substitution, because nobody catches it.

**Then compute `primaryOnDark`**, which almost no DESIGN.md supplies. See
`references/tokens-and-motion.md` — this is the single most common accessibility failure in
generated portals and it is arithmetic, not judgement.

### 3. Emit sections, not markup

Each page is an ordered list of `{ id, kind, enabled, order, band, divider, motion, props }`.
`kind` comes from the contract's enumerated vocabulary. A kind the contract does not declare
cannot render, and the renderer throws rather than dropping it silently.

**A section with nothing behind it is switched off, not emptied.** A company that publishes no
video gets `enabled: false`, not a video band with a hole in it.

### 4. Mark every figure's provenance

This is the part the contract will reject you for, so do it as you emit rather than afterwards:

- `record` — from the overview or a document it links to. Carries `asAt` and `source`.
- `illustrative` — authored. **Must** carry `why`, **must not** carry `sourceHref`, and **must**
  appear in `ledger[]`.
- `unavailable` — not held. Carries no value at all.

There is no default. An omission is an error, not an assumption — because the assumption it used
to make was "this figure is real".

### 5. Imagery: find, then generate

Search the overview's image URLs first. A crawled photograph of the real company beats a
generated one every time and removes a disclosure obligation. Generate only for a genuine gap,
and follow `references/imagery.md` — particularly the rule that no portrait of a real named
person is ever generated.

### 6. Write it, then prove it

```bash
node scripts/seed-portal.mjs record.json     # writes as status: draft
npm start & node scripts/parity.mjs          # or the render check for a new company
```

`references/validate-and-prove.md` has the full gate. The short version: the record is validated
on the way into the database and again on the way out, so an invalid record never reaches a
reader — but *valid* is not *good*, and only rendering it tells you which you have.

## What this skill will not do

- **Publish.** Records are written as `draft`. Publishing is a human decision, and on an
  investor surface it is the decision that matters.
- **Invent a figure to fill a section.** A section with no data is disabled. That is the whole
  mechanism.
- **Generate a likeness of a real person**, or a photograph presented as depicting a real site,
  asset or employee.
- **Touch the renderer.** If a section cannot be expressed, the vocabulary needs extending in the
  contract — deliberately, in `libs/shared/src/investor-portal/portal-contract.ts` — not worked
  around in the record.

## Voice

Company sections use the company's own register, taken from its overview and its own site. The
H1 comes from the company's own website language, never a positioning line written for rhythm.

Diolog sections use Diolog's: no em or en dashes, Australian English, sentence case, plain
copulas, measured confidence. If `create-diolog-content` is installed, route new Diolog copy
through it.
