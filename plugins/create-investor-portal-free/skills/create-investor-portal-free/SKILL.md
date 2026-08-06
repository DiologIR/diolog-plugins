---
name: create-investor-portal-free
description: >-
  Build a complete, single-page public investor portal for a listed company from its DESIGN.md
  design-token file and a company overview markdown file, branded entirely in that company's own
  tokens with a Diolog banner, app band and footer credit layered on top. Use this whenever
  someone wants an investor portal, investor page, investor relations page, IR site, shareholder
  page or "investor hub" built for a specific company, wants the Alfabs investor portal rebuilt
  for a different issuer, hands over a DESIGN.md plus a company overview and asks for a site or
  landing page from them, or asks for an investor-facing page that search engines and AI
  assistants can cite - even if they only say "make ACME an investor page from these two files"
  or "do what we did for Alfabs but for this company". Orders the page on research into what
  search-referred and LLM-referred investors actually need (dated sourced company facts first,
  disclosures second, share price demoted beneath both, governance as required ASX furniture),
  emits Corporation structured data and a crawler-permissive robots.txt, and carries the ASX
  Listing Rule 15.7, Listing Rule 4.10.3 and section 769C constraints that shape the build. Not
  for a disclosure-consistency audit page (use create-disclosure-consistency-page), a Diolog-brand
  marketing page (design-craft), or a DESIGN.md extracted from a site (design-md-from-website).
---

# Create an investor portal

You are building the page a retail or professional investor lands on when a search result or an
AI assistant sends them to a listed company, rather than when they navigate the company's own
site. That referral path is the whole design brief, and it inverts the convention: they already
have the share price, and what they cannot get anywhere else is the company's own dated,
sourced fact set.

The output is a **portal record** — theme tokens, imagery, an ordered section list and a motion
preset per section — written to `investor_portals` as a draft. A single generic Next.js project
resolves the company from the hostname and renders it. It should look like the company's page
with a tool credited, never like a Diolog template with a logo swapped, and that difference lives
entirely in the record.

The earlier version of this skill produced a standalone HTML file. `assets/reference-build.html`
is still the visual reference; it is no longer the deliverable.

## Read first

**`references/generated-not-authored.md` — read this before anything else.** The deliverable is a
validated portal *record* written to the database, not a hand-authored HTML file. One generic
Next.js project renders every company from that record. Most of the code you would have written
already exists; getting that wrong means building the wrong artifact from the first line.

Then two files that change what the record contains, both short:

- `references/binding-decisions.md` - review outcomes that **take precedence** over anything
  inferred elsewhere, including this file. Read it before drafting.
- `references/what-the-research-says.md` - the evidence behind the page order, condensed from a
  35-source run. The full report with citations is `references/ir-landing-page-research.md`;
  open it when a decision is contested or you need the primary source for a claim.

Then, as the build reaches them:

- `references/page-structure.md` - the section order, what each section contains, and why
- `references/diolog-layer.md` - the three Diolog placements, their tokens, copy and mark
- `references/rendering-traps.md` - defects that cost real bugs and are invisible in source
- `references/build-and-validate.md` - the companion skills to load, and the round-based
  validation loop that closes the build

## Inputs

Ask for whichever is missing rather than guessing:

1. **A DESIGN.md** carrying the company's tokens: colours, type, spacing, radii, elevation,
   motion. This becomes the swappable layer.
2. **A company overview markdown** with what the company does, its business units, sites,
   leadership, listing history and any figures. This is the only source of company facts.
3. **Whether the figures are real or illustrative.** Determines the footer disclosure and
   whether the page ships `noindex`. Ask if it is not stated; do not assume.

If a DESIGN.md does not exist and a live site does, `design-md-from-website` produces one from
measured computed styles. That is a better starting point than inventing tokens.

## Build

### 1. Lift the tokens verbatim

Put every company token in a single `:root` block, fenced by comments, at the very top:

```css
/* ═══ SWAPPABLE LAYER - the subject company's DESIGN.md. Replace this block
   to re-skin every company section. Source: <path> ═══ */
:root{ … }
/* ═══ END SWAPPABLE LAYER ═══ */
```

This fence is the product. Someone re-skinning for the next issuer should replace that block
and nothing else. Diolog's tokens go in a second block below it, labelled fixed.

Take exact hex values, exact font stacks, exact spacing steps. A near-miss on a brand colour is
worse than an obvious substitution, because nobody catches it.

### 2. Order the page by what the visitor came for

The full section list is in `page-structure.md`. The order, and the reason it is not
conventional:

**Company facts → disclosures (price and chart beneath) → what the business does → video →
governance → questions → contact → Diolog app band → footer.**

A quote widget at the top is the default in this market and the evidence does not support it.
The facts table is the thing no aggregator can serve, so it leads.

### 3. Date and source everything

Every fact carries an as-at date and the disclosure it came from. Every date is both readable
and machine-readable:

```html
<td class="c-date"><time datetime="2026-06-30">30 Jun 2026</time></td>
```

Financial information shows the strongest recency bias of any category in AI citation
behaviour. An undated fact does not get quoted, and a sourced claim is the one evidenced lever
for being cited at all.

### 4. Emit the markup that is cheap and correct

`Corporation` with `tickerSymbol` in spec form (`XASX AAL`), a `WebPage` with `dateModified`,
and `FAQPage` for the questions. Emit them because they are correct, not because they win
citations - no controlled study ties markup to citation rate, and FAQ rich results were retired
in May 2026. The strategy is the sourced prose; the markup is hygiene.

Ship a `robots.txt` allowing `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot` and
`Google-Extended`. Crawlability is the gate, and it is usually broken by a firewall rule nobody
chose.

### 5. Motion is progressive, never load-bearing

A CSS and IntersectionObserver baseline that is complete on its own, then GSAP and three.js
from CDN with SRI as an upgrade. Block each CDN in turn and confirm the page still reads: if a
blocked script leaves a section blank, the reveal was gating content rather than enhancing it.

Gate everything on `prefers-reduced-motion`, and gate pointer effects on
`(hover: hover) and (pointer: fine)`.

Note: three.js has no UMD build after r160. Pin `0.158.0` for a `<script src>` build, or use ES
modules.

### 6. Verify in rounds, with the companion skills

This build is not finished when it renders. Read `references/build-and-validate.md` and follow
it: `design-craft` before you draw and its deterministic lint every round, `ux-craft` before
the contact form and the AI-summary panel, then `design-review` across all of its stages on the
finished page, with the fix loop run to convergence.

Two things that file will tell you but are worth carrying into every round here:

Serve over HTTP, never `file://`. Capture 375, 768, 1280 and 1920 in one batched round, plus
the print PDF, and open every capture. Run the programmatic overflow probe rather than trusting
the eye.

Ask each capture *"what is wrong with this?"* - not *"is this done?"*. The same pixels answer
those two questions differently, and only the first one is a review.

`references/rendering-traps.md` lists the defects that survive a source read: inline spans that
were meant to stack, section-wide element selectors repainting nested components, `<use>` fills
that never apply, stretched SVG markers, `:last-child` that never matches, print dropping colour.

## Voice

Company sections use the company's register, taken from its overview and its own site.

Diolog sections use Diolog's, which is stricter: no em or en dashes anywhere, Australian
English, sentence case, plain copulas, measured confidence, one italic accent phrase per
headline. `diolog-layer.md` carries the full set. If `create-diolog-content` is installed,
route new Diolog copy through it.

## What not to build

Each of these was tried and cut, and the reasoning is worth keeping because they are all
things a reasonable person would add back:

- **A lead-capture modal.** No independent evidence exists that any investor-page element grows
  a register or a subscriber list; every published figure traces to a vendor describing its own
  product. That is not a basis for interrupting a first-time reader. Offer a subscribe path,
  do not stage one.
- **A free-text AI assistant.** Answering freely about a listed company is a selective-disclosure
  risk under Listing Rule 15.7. The safe version is constrained to released material with a
  citation on every sentence, which is a build rather than a widget.
- **Separate pages for announcements, reports, videos and the team.** A visitor arriving from
  an AI answer lands on one page and rarely visits a second. Answer them where they land.
- **A form that claims it sent something.** If nothing is wired, the success state says so.
  Telling a shareholder their question was received when it was not is the one failure on this
  page that causes real harm.
