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
        a company URL
            │
   ┌────────┴────────┐
   ▼                 ▼
design-md-      company-overview-
from-website    from-website          ← both are skills; run them first
   │                 │
   └────────┬────────┘
            ▼   structured output, validated against the contract
      PortalRecord  ──►  investor_portals   (status: draft)
            │
            ▼
      the generic renderer, resolved by hostname
```

**The two inputs are themselves skills.** Given only a company URL, run
`design-md-from-website` for the measured tokens and `company-overview-from-website` for
the crawled facts, then generate from both. Neither is optional and neither should be
hand-written: a DESIGN.md guessed from a screenshot fabricates the brand colour, and an
overview written rather than crawled fabricates the company.

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

1. **A DESIGN.md** with the company's tokens. If none exists and a live site does, run
   **`design-md-from-website`** — it measures computed styles rather than guessing hexes.
   Two dialects are supported downstream (YAML front matter and a markdown token table),
   so either output form works.
2. **A company-overview markdown.** If none exists, run **`company-overview-from-website`**.
   Its `references/output-contract.md` is the shape this generator parses, and every rule
   in it exists because breaking it silently produced a broken portal.
3. **The category**: `free`, `paid` or `report`.
4. **The company id** in the Diolog database.

## Build

### 1. Read the overview end to end before emitting anything

Not skimmed. The overview is usually a site crawl of a few thousand lines, and the facts you
need are scattered: leadership on one page, projects on another, certifications inside a body
paragraph, the announcement list under Investor Information with real PDF URLs and real dates.

Inventory as you read: business units, named projects, leadership names and titles, site
addresses, certifications, the disclosure list, values, history, and **every image URL**.

### 2. Lift the theme verbatim, then COMPUTE what the brand forgot

Exact hex values, exact font stacks, exact spacing steps. A near-miss on a brand colour is worse
than an obvious substitution, because nobody catches it.

**Then compute what the DESIGN.md does not state.** The token a brand forgets is the token that
breaks, and the stylesheet's defaults are not neutral — they were authored for one theme, and
that theme belongs to another company:

- **`primaryOnDark`.** A brand colour chosen against white usually fails AA on a dark band.
  Arithmetic, not judgement.
- **The whole surface set, on a dark theme.** A DESIGN.md stating a dark canvas but no
  `surface-sunken` inherits a *light* default for it. On a real run this painted white bars with
  invisible text straight across a dark company's facts table. Derive missing surfaces — and the
  ink — from the canvas the brand did state.
- **Every remaining colour token, for a themed record.** Not just the surfaces. Measured on a
  live near-black portal: **12 of 25 colour tokens unset**, every one of them falling back to the
  reference company's light palette. `--primary-tint` resolved to a pale **pink** and painted an
  alert band with white text on it, unreadable; `--focus-ring` and `--link` resolved to the other
  company's red. A themed record that states `canvas` and omits the rest does not get a partial
  theme, it gets a hybrid of two brands.

See `references/tokens-and-motion.md`.

### 3. Emit the chrome — a record with none renders a portal with no way out

`chrome` is not optional furniture. A generator emitting a literal `chrome: {}` produced portals
with **no brand, no navigation and no footer** on every tenant it had ever built. Measured on one
of them: five pages with **zero internal links** and **one tab stop** — the skip link — and two
routes that resolved 200 with nothing on the site pointing at them.

None of it was visible to anything. The record validated, every page returned 200, the content
assertions passed, and a keyboard user landing on `/leadership` reached the end of the document
in one Tab.

So, as you emit:

- **Header, nav and footer come from the record**, built from `identity` and the pages the record
  actually declares. Nothing is defaulted to a company.
- **Every declared page is linked from at least one other.** A route nothing points at is a page
  nobody sees, and it is indistinguishable from a working one in every per-page check.
- **Nothing tenant-specific is hard-coded in a shared component.** A footer carrying one
  company's monogram, listing code and policy PDFs as literals publishes that company's
  constitution under every other tenant's address the moment chrome starts rendering.

### 4. Reject the boilerplate before it becomes content

A site crawl carries the company's privacy policy, terms, cookie notice and complaints
procedure under exactly the same heading levels as its service lines. Structure cannot
tell them apart, so subject matter must — one run rendered **"How Do We Collect Personal
Information?"** and **"Complaints Resolution"** under *"What the group actually does"*.

Exclude legal furniture, crawler scaffolding (`Source URL:`), and any heading phrased as
a question. A business unit is something the company does.

### 5. Emit sections, not markup

Each page is an ordered list of `{ id, kind, enabled, order, band, divider, motion, props }`.
`kind` comes from the contract's enumerated vocabulary. A kind the contract does not declare
cannot render, and the renderer throws rather than dropping it silently.

**A section with nothing behind it is switched off, not emptied.** A company that publishes no
video gets `enabled: false`, not a video band with a hole in it.

**Section COUNT is a function of how much the record holds.** A thin record must place *fewer*
bands, not the same bands thinner. Measured on a house-tier portal built for a company we hold
almost nothing for: four bands to convey three facts, at 36% / 48% / 61% ink fill against the
reference build's 49–62% rhythm, with 184px / 205px / 229px of dead gap between them — and the
payload was Legal name, Ticker and Exchange, **all three of which the page had already said in
its own badge and H1**. A 1150px table restating the headline. One band — identity, what we
hold, the claim CTA — is the whole page that record can honestly support.

**Every slot carries different information.** The four-slot band (eyebrow / heading / body / CTA)
invites the same string four times, and on a real run every one of seven business units did
exactly that: eyebrow = the unit's name, heading = a truncated blurb ending mid-clause, body =
that identical string again at 17px, CTA = the eyebrow again. Four slots, two pieces of
information, and the hierarchy inverted — the *name* in the eyebrow and a sentence fragment as
the 32px heading. If a slot has nothing of its own to say, leave it out; and **never truncate
into a heading.** A heading is written short, not cut short.

**A crawler artefact is not a fact about the company.** "12 photographs taken from the company's
own site" was shipped as one of three headline facts in a hero. It is a count of what the crawler
found. So are page counts, link counts, and anything phrased about the *record* rather than about
the business.

**`asAt` is when the fact was true, never `now()`.** A legal name from an exchange listing
stamped with today's date reads as a live measurement of something that has not changed in
decades, and it is the shape an em-dash fix over-corrects into. If the source does not carry a
date, the column says so or does not exist. Same for `source`: a citation the reader cannot
follow ("ASX listing", not a link) is a citation in appearance only.

**The browser chrome is part of the theme.** Two tokens most records forget, both one line:
a **favicon** (a branded investor portal showing the generic page icon in the tab strip is the
first thing anyone sees), and **`color-scheme`** matching the record's own canvas — a portal on
`#0A0A0A` declaring `color-scheme: light` gets light scrollbars, light form controls and a light
pre-paint flash.

### 6. Mark every figure's provenance

This is the part the contract will reject you for, so do it as you emit rather than afterwards:

- `record` — from the overview or a document it links to. Carries `asAt` and `source`.
- `illustrative` — authored. **Must** carry `why`, **must not** carry `sourceHref`, and **must**
  appear in `ledger[]`.
- `unavailable` — not held. Carries no value at all.

There is no default. An omission is an error, not an assumption — because the assumption it used
to make was "this figure is real".

### 7. Imagery: find, then generate

Search the overview's image URLs first. A crawled photograph of the real company beats a
generated one every time and removes a disclosure obligation. Generate only for a genuine gap,
and follow `references/imagery.md` — particularly the rule that no portrait of a real named
person is ever generated.

### 8. Write it, then LOOK AT IT

```bash
node scripts/seed-portal.mjs record.json     # writes as status: draft
npm start & node scripts/parity.mjs          # or the render check for a new company
```

`references/validate-and-prove.md` has the full gate. The record is validated on the way into the
database and again on the way out, so an invalid record never reaches a reader.

**Then open the page and look at it.** A 200 and a matching token value are not evidence that a
page is worth reading. On a real run those two checks passed while the portal carried a stray
rule floating in the hero, a table column that was an em-dash in every row, "0 of 3 rows are
illustrative" as a sentence about nothing, a one-row facts table, and business units taken from
the privacy policy. Every one of those was visible in the first screenshot and invisible in
everything that had been checked.

The specific trap: **a section that renders nothing still occupies its own margins.** "No
content" becomes two hundred pixels of dead space rather than an absence, so an empty container
must not be rendered at all. Scroll the page before judging it — a full-page screenshot taken at
load shows scroll-revealed content as blank and will make a working page look broken.

**Open it as the tenant, not as the reference.** Every oracle on this pipeline read the reference
company, on `/`, at 1280px, and every one of them was green while generated portals shipped with
no header. Open a *generated* tenant, on a page that is **not** the home page, at **375px**, and
walk it with the Tab key. Those three deviations found three blocking defects on their first run.

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

**A section's subject is the company, never the portal.** A generated Q&A page shipped three
questions and every one was about Diolog's plumbing — *"Where do these figures come from?" →
"From the company record, read at request time."* The reference company's eight are about the
company: how to buy the stock, whether it pays a dividend, how it is capitalised, when the AGM
is. An investor-relations Q&A whose subject is the CMS is a category error, and it is the deepest
a generated portal goes on that page. Where the record genuinely cannot answer an investor
question, the section is disabled — the same mechanism as everywhere else — not filled with
answers about the system.

Diolog sections use Diolog's: no em or en dashes, Australian English, sentence case, plain
copulas, measured confidence. If `create-diolog-content` is installed, route new Diolog copy
through it.
