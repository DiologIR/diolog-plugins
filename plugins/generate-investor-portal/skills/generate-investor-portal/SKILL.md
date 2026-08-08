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
- **The accent in a TEXT role, on the LIGHT ground as well as the dark one.** `primaryOnDark`
  covers half of this and the other half goes unwritten because the reference accent clears AA
  on paper by luck. Measured on a listed company's own brand orange: `#E65400` at **3.37:1** as a
  13px §-eyebrow, **3.72:1** as the current-page nav link, and **3.72:1** under the white ink its
  own DESIGN.md *stated*, on the header CTA and the brand monogram. Role-aware, or it rejects
  correct usage: 4.5:1 for body-size text, 3:1 for large text and non-text — the accent stays raw
  as a fill and as a display word. And **a stated token is not a waiver**: a stated `onPrimary`
  that fails on the accent is replaced exactly as an absent one is, and the repair is recorded.

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

**Then keep that filter to the one question it answers.** The same list, reused to decide
which PDFs reach the document shelves, dropped four **Modern Slavery Statements** filed under
the Modern Slavery Act 2018 (Cth) — statutory disclosures, published in the same folder as the
annual report. For the phrase "modern slavery" the two questions have opposite answers:

| Question | "modern slavery" |
|---|---|
| *Is this a thing the company does?* — a business-unit heading | no, exclude |
| *Does this document belong on a shelf?* — a PDF title | **yes, it is a disclosure** |

One predicate cannot answer both. Split it — a heading filter and a document-title filter,
where the second carves out exactly the statutory phrases — and guard the split with a case
that **names the four documents and their hrefs**, because "4 documents mentioning slavery"
passes on four copies of a policy about the topic.

**The same split governs whether a PAGE is placed at all, and the mandated pages are LEVIED.**
An evidence threshold is the right way to decide whether a company gets a `projectRail`. It is
the wrong way to decide whether it gets a governance surface. Measured on production
2026-08-08: **`temple-and-webster-group-ltd` has no `/corporate-governance` page and no
`governanceSnapshot` section** — no route from the portal to any governance material at all —
while the other five portals carry, in the platform's own copy, the sentence *"Listing Rule
4.10.3 lets the governance statement live at a URL, and that URL is lodged with ASX under
4.7.4."* The platform states the obligation on five portals and ships a sixth without it.

A mandated surface with no evidence behind it is not an absent page. It is a page that says
**`unavailable`** — which is a provenance state this contract already has, and which exists
for exactly this:

> We do not currently hold Temple & Webster's governance documents. The company's governance
> statement is lodged with ASX under Listing Rule 4.7.4.

The distinction to carry: *does the company do this?* is a bid, and no evidence means no
section. *Is the company obliged to publish this?* is a levy, and no evidence means an honest
"not held" — never silence. Governance, the registry block and the disclosure index are levies.

> **The tell that the split was already needed, visible without rendering anything.** The
> generator's own shelf map carried a `modern slavery` term in the rule that files a document
> under "Sustainability and ESG" — so there was a shelf named for a document class the filter
> guaranteed could never reach it. **A codebase that contains a category nothing can be
> assigned to is telling you a predicate is answering the wrong question.** Grep for that
> shape before trusting any exclusion list.
>
> Still open on this pipeline, recorded so it is not lost: `whistle` sits in the same list
> while `policy` is in the governance-title pattern, so a **Whistleblower Policy** — a core
> ASX governance document, listed in the reference company's own footer — is dropped from
> every tenant's governance page by the same mechanism.

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

**Where the source gives you no short claim, RE-SLOT — do not cut.** Cutting is what produced
the mid-clause headings in the first place, so the fix is not a shorter cut. The reference
build's shape is eyebrow = the name, heading = a *claim*: "Fabrication" over *"Heavy structural
steel, detailed pipe and duct work."* Eight words. A crawled overview rarely opens a section
with eight words, so:

- if the source states a claim under ~96 characters, it heads the section and the name is the
  eyebrow — the reference's own shape;
- otherwise **the unit's NAME heads the section** and the sentence goes where prose goes;
- and drop the eyebrow whenever it would repeat the heading.

96 is the reference's own longest lead plus room, chosen so the reference build does not move.
On one run this split eight units 5 name-headed / 3 claim-headed — which is the honest ratio
for crawled material, and it is not a failure.

**A crawler artefact is not a fact about the company.** "12 photographs taken from the company's
own site" was shipped as one of three headline facts in a hero. It is a count of what the crawler
found. So are page counts, link counts, and anything phrased about the *record* rather than about
the business.

> **This rule is written above, and five of five generated tenants broke it anyway.** Measured
> on production 2026-08-08: every generated portal's hero evidence panel opens with
> *"N dated documents held, each linking its published PDF"* — 245 for Telstra, 388 for JB
> Hi-Fi, 46 for Temple & Webster, where it is **one of only two items**, so half the hero's
> evidence is about the CMS. The phrasing gives it away: *held* is something the portal does,
> not something the company does.
>
> A rule this file states and production breaks five times out of five is a rule that needs a
> gate, not more prose. The gate is a regex over the emitted hero props, and it belongs in
> `acceptance-generate.mjs`:
>
> ```js
> const ARTEFACT = /\b(documents?|pages?|links?|images?|photographs?|records?|files?)\s+(held|found|crawled|mirrored|indexed|captured)\b/i;
> ```
>
> …plus a literal ban on "each linking its published PDF". If a hero has nothing to say about
> the company, it says less — the record already has `enabled: false` for that.

**A section's masthead may not repeat the section under it, and the HERO is where this bites.**
Measured on the same five tenants: the hero's eyebrow pill and its H1 are the **same string**,
the company's legal name, one above the other in two sizes — *"Telstra Group Limited"* over
*"Telstra Group Limited"*. The largest type on the page carries nothing the wordmark 300px above
it did not already say, and a screen-reader user hears the legal entity name three times before
reaching content.

The rule already exists one section down — *"drop the eyebrow whenever it would repeat the
heading"*, written for `unitList`. It is not a `unitList` rule. Apply it everywhere, and
give the hero eyebrow the job the reference build gives it: **status, not identity.** Alfabs'
reads *"ASX listed since June 2024 · Updated 5 August 2026"*.

**And the H1 is a claim the company makes, not the name on the share register.** *"The H1 comes
from the company's own website language"* (see Voice) is right and has been over-read into
*"the H1 is the legal entity name"*: five of six live portals open with `<h1>Telstra Group
Limited</h1>`, `<h1>BHP Group Limited</h1>`, `<h1>JB Hi-Fi Limited</h1>`. The reference build
opens with *"Design to delivery, from the Hunter Valley to your site."* Both are the company's
own language; only one of them says anything. Take the H1 from a sentence the company writes
**about what it does** — its own site's hero, its overview's opening claim — and put the legal
name where it belongs, in the identity badge and the `<title>`.

**A page's section index must read 1..n with no gaps.** The `§01 · …` ordinal is rendered, in
the eyebrow, and it is a claim about completeness on a surface whose entire subject is
completeness. Measured on production: **four of six tenants** ship a gapped index —
`§01 §02 §03 §05 §06` on three of them, and `§01 §02 §03 §06` on Temple & Webster, which also
has no governance page. A reader counts that and concludes the portal is hiding section 04.

The mechanism is worth knowing because it is a shape that recurs: the renumbering pass was
written for the archetype that **reorders**, and lives inside its `if`. The gaps come from
section **omission**, which happens under every archetype — including the one whose layout
table is `null` and which therefore skips the block entirely. **A repair coupled to the
condition that first revealed the defect will miss every other condition that causes it.**
Renumber unconditionally, after every step that can drop a section, and assert the ordinals
are contiguous per page.

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

> **The favicon cannot be a file in `public/`,** and reaching for one is the reflex to unlearn:
> `public/` is not tenant-aware, and one deployment serves every company on the platform, so a
> file there is *the last tenant to ship one*, wearing every other tenant's address. Resolve the
> tenant from the hostname the way every other pixel on the page is resolved, and draw the
> record's own monogram on its own accent. Three constraints ride with that, because it is the
> one place record data becomes **markup**: escape the monogram (a database row is not a trusted
> source of SVG), validate the colours as hex rather than interpolating them, and give a host
> that resolves to no tenant the *platform's* mark — never the last one that resolved.

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

**And open a SECOND tenant beside it.** This is the deviation that was still missing, and it is
where the largest defect of 2026-08 was hiding. Every gate on this pipeline is per-tenant;
sameness is not a property of a record, it is a property of a **pair**. Measured across the six
live portals: `metallium-ltd` and `telstra-group-limited` — a junior explorer and Australia's
largest telco — publish the same eight pages, with the same section kinds **in the same order on
every one of them**, under the same archetype. `jb-hi-fi-limited` matches Telstra on seven of
eight *and* carries a byte-identical WebGL vector, which the repo's own framebuffer probe scores
at a still-distance of **1.169 against a floor of 1.9**.

So before publishing, print the diff against the nearest published tenant:

```
page set           8 paths · IDENTICAL to telstra-paid
section order      8 of 8 pages IDENTICAL to telstra-paid
archetype          index (= telstra-paid)
motion vector      pointField/accentOnDark/1/planar/solid/standard/standard (= telstra-paid)
copy               5 of 5 `/` headings identical after name substitution
```

Five identical lines is not a portal for this company; it is the previous company's portal in a
new palette. `references/validate-and-prove.md` carries the three collision checks and where they
belong.

**An axis a reader cannot see is a database field, not a design device.**

The platform allocates prominence from a scarce budget: one emphasis-3 and two emphasis-2 per
page, bid for in citable currencies, so two companies with different evidence emphasise different
sections. Measured on production 2026-08-08 across four emphasis-aware tenants and eleven pages:
**the emphasis-3 rung had never once been won by a bid.** All four awards were the hero, taken as
the off-budget `pageOpener` levy. The mechanism was that the rung was offered to the top-ranked
bid *only* — if that bid had no audited dark rendering the rung was burned, and a dark-capable
section ranked #2 could never reach it. That is a bug, and it is fixed: the rung passes down the
ranking, and only a page where *nothing* can express it reports it unspent.

The review that found it proposed a second fix — emit `data-emphasis` on every `<section>` so a
rendered-layer gate can read the budget. **Do not take that one, and the reason generalises.**
Emphasis is not a device; it is a *ranking step* whose output is `band` and `divider`, and those
are already in the DOM and already gateable. Emitting the rank itself would put a database field
into the markup so a gate could confirm the database, which is a gate measuring its own input.
Worse, it would break a deliberate assertion — *nothing that renders a page reads `emphasis`* —
which is the entire proof that the feature cannot move the parity reference.

The measurement sharpens what the real defect is. At level 2 the budget maps to `band: 'surface'`,
which measures **1.08:1 against the canvas**. So after all of it, the visible difference between
two tenants' home pages is which of two sections carries a band 8% off white. **The defect is not
that emphasis is invisible to a gate. It is that emphasis is nearly invisible to a reader**, and
the fix for that is a wider set of audited dark-capable kinds and a louder level-2 treatment —
not an attribute. Gate what a section *renders*, never what a record *ranked*.

**Report the imagery, and never decide it silently.** Two of six live paid portals — Temple &
Webster and Telstra — ship with **zero images on every page**: a type-on-charcoal hero and
text-list business pages, for a paying listed company. Nothing was broken; every image the record
declared loaded, and there were none. `references/imagery.md`'s rule is find-before-you-generate,
and when finding yields nothing and generating is declined, that is a **decision** — so it belongs
in the generation report (`imagery: N crawled, M generated, K sections without`) and a
zero-imagery paid record is a publish-blocking warning a human clears, not a silent outcome.

## Ideas that look good and are not

These are not style preferences. Each one is an idea a capable author re-derives from the
same brand documents you are reading, so each is written with the mechanism that defeats it
rather than a verdict — a rule with no reason attached loses to the first person with an
argument, and the argument for all six is good.

**Three of them the contract now refuses outright**, so you will meet them as a validation
error rather than as advice. The reason is in `PlatformProhibitionSchema` in
`libs/shared/src/investor-portal/portal-contract.ts`; the short version:

| Refused | Why it is not a matter of taste |
|---|---|
| An excerpt of a lodged announcement (`announcementExcerpt`) | Quoting one sentence of a price-sensitive release is **selective emphasis**, and it changes what the release says even when every word is verbatim — the reader gets the fragment the portal chose in place of the document the company lodged. Bound three ways: the lodged-document field set is closed so an excerpt has nowhere to live, no string may be a fragment of a lodged title, and no string may be a lodged title with its case changed. Render the title whole and link to the PDF. |
| `countUp` over a stated figure (`lodgedFigureMotion`) | Ramping a numeral from zero turns a disclosure into emphasis. Over a mineral-resource or ore-reserve figure it detaches the number from the **competent-person statement** it is only ever valid alongside; over any other figure it detaches it from its as-at date and its source. `countUp` is still available over a number that is not a stated figure. |
| A measured grid value in the theme (`measuredGrid`) | `container` / `gutter` / `prose` read off a brand's site and passed through is a free-text style channel with a numeric keyboard: unbounded, cited to nothing, different on every tenant, and it re-breaks the parity oracle per tenant. Every DESIGN.md measured so far states the same 1200 / 24 / 68. If a brand genuinely differs, add the rung to `PLATFORM_GRID` **with the sentence that justifies it** — the same standard `WebglFigureSchema` holds its three values to. |

The general form of that last one: **a new tenant style axis is an enum or a bucketed value,
never a pass-through number.** A raw measured number is a free-text channel expressed
numerically — it ends the bounded vocabulary the same way a `styleOverrides` blob would, and
it does it without looking like one.

The remaining three are design decisions you make before any record exists, so they cannot
be a schema rule. Do not take them:

- **Composing the page from engagement telemetry.** Ordering or promoting sections by what
  readers click is self-echoing — the telemetry measures the layout that produced it, so the
  loop converges on whatever the first layout happened to surface. Worse on this surface
  specifically: it demotes exactly the content nobody clicks *and that is mandated anyway* —
  governance documents, the registry block, disclaimers, the illustrative-value ledger.
  Section order comes from what the record holds, which is the same input for every reader.
  Engagement evidence is not brand evidence.

- **Reader-density rungs with a HUD toggle** (a "summary / standard / full" switch). It varies
  what ONE reader sees; it does nothing about what distinguishes two companies, which is the
  problem the structural vocabulary exists for. And it multiplies the surface every
  computed-style oracle has to cover by the number of render states, on a platform whose gates
  are already the thing holding the tenant count up. If a portal is too dense, the record is
  placing too many bands — cut sections, not pixels.

- **A distinctiveness loop with no hard abort.** "Keep differentiating until the two tenants
  are far enough apart" runs out of honest input: once the second-ranked evidence in the
  DESIGN.md is used, the loop has nothing left and starts choosing by taste or by noise. That
  is variety from randomness, and it fails the derivability floor every axis on this platform
  is held to — **every option must be traceable to a sentence in the brand's own documents and
  must cite it.** A loop that cannot cite its next move must stop, and report that the brand's
  material supports N axes rather than inventing the N+1th.

## What this skill will not do

- **Publish.** Records are written as `draft`. Publishing is a human decision, and on an
  investor surface it is the decision that matters.

  **And regeneration is not an edit.** The upsert that writes a record is the place this rule
  actually lives, and the shape it fails in is specific: `$set: { record, updatedAt }` beside
  `$setOnInsert: { status: 'draft' }`, with a comment reading *"never demote a portal somebody
  has already published"*. What that does is replace the **entire record body** of a published
  portal while `status` stays `published` — so a regenerated portal nobody has looked at is live
  at the company's own address the instant the command returns, with no version bump, and the
  one line that could have said so (`status=published`) reads identically to the safe case.
  Regeneration re-derives every page from a fresh crawl; four classes of defect have shipped
  that way with every gate green.

  Absent or draft → write. **Published → refuse**, unless an explicit `--republish` is on the
  command line, which is the whole of the difference between an accident and a decision. Treat
  anything that is not literally `published` as overwritable, so a future review state is safe
  by default and an unrecognised one cannot become publishable.
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
