---
name: company-overview-from-website
description: >-
  Produce the `<COMPANY>-Company-Overview.md` that the investor-portal generator reads:
  a single markdown file capturing what a listed company does, who leads it, what it has
  lodged, and every image and PDF it publishes — crawled from the company's own site so
  every fact is attributable rather than authored. Use whenever someone needs a company
  overview, a company profile, a crawl of a company's site into markdown, or the source
  material for a portal, deck, business case or design system — including "make me an
  overview for ACME", "crawl alfabs.com.au into a markdown profile", "get me the source
  material for a portal", or "what does this company actually do, from their own site".
  Pairs with `design-md-from-website` (which measures the same site's design) to form the
  two inputs `generate-investor-portal` requires. NOT for writing marketing copy about a
  company (create-diolog-content), analysing disclosures for consistency
  (create-disclosure-consistency-page), or extracting a design system alone
  (design-md-from-website).
---

# Company overview, from the company's own site

You are producing **source material**, not prose. Everything downstream — the portal
generator, the deck builder, the business case — treats this file as the record of what
the company says about itself. A sentence you write rather than crawl becomes a fact
nobody can trace, on surfaces where traceability is the product.

```
company website
      │  crawl (playwright-cli / agent-browser)
      ▼
<COMPANY>-Company-Overview.md   ──►  generate-investor-portal
      ▲                                      ▲
      └── design-md-from-website ────────────┘
```

**Budget: under 10 minutes.** If you are past it you are almost certainly rewriting
what the site already says, which is the one thing this skill must not do.

## What the generator actually reads

This is a **contract**, not a suggestion. The portal generator parses this file, and
every rule below exists because breaking it silently produced a broken portal. Read
`references/output-contract.md` for the field-by-field detail; the load-bearing parts:

| Element | Form | Why it matters |
|---|---|---|
| Legal name | `Alfabs Australia Limited` in prose, repeatedly | The generator picks the listed entity by frequency **anchored to the domain**. A subsidiary or a peer named more often becomes the portal's name if the real one is absent. |
| Ticker | `ASX:AAL` / `NASDAQ:XYZ` | The exchange prefix is how the listing is identified at all. |
| Business sections | `##` or `###` heading + a paragraph over 60 characters | Both levels are read. A heading with no prose under it is dropped. |
| Leadership | `## Executive Leadership Team` then `Name` / `Title` lines, **or** `- ## Name` + `**_Title_**` | Both dialects are supported because real sites use both. |
| Documents | `- [Title](url.pdf)` — absolute **or** site-relative | A date in the path (`/2026/06/`) is what places it in a chronology. |
| Images | `![alt](https://…)` with real alt text | The alt text becomes the portal's alt text. A crawl that emits empty alts costs every image its description. |
| Contact | `### Contact Details` with address bullets | Becomes the registered-office and site list. |

**Never emit the crawler's own scaffolding.** `Source URL: https://…`, cart and login
pages, cookie banners and newsletter modals all arrive looking like content and are not.
A generator downstream cannot tell them from a service line — one run rendered a
company's **privacy policy** under "What the group actually does" because of exactly
this.

## Build

### 1. Crawl the pages that carry substance

Home, about, each service or product line, leadership, investor centre, corporate
governance, contact. Skip cart, checkout, account, search, and anything under
`/privacy`, `/terms`, `/cookies`.

`references/crawling.md` covers the mechanics and the pages worth the request.

### 2. Preserve structure, don't summarise it

The site's own heading hierarchy becomes the markdown hierarchy. Resist condensing a
five-unit business into a paragraph: the generator reads units from headings, so a
summary destroys the structure it depends on.

Keep the company's own wording. Its register is the register the portal will speak in.

### 3. Keep every image and document URL

Both are the portal's raw material — a crawled photograph of the real company beats a
generated one every time, and it removes a disclosure obligation rather than creating
one. Drop none of them for tidiness.

### 4. Mark what the site does not say

A company overview that quietly omits a leadership team looks identical to a company
with no published leadership. End the file with a short `## Not published` section
naming what you looked for and did not find.

## What this skill will not do

- **Write anything the site does not say.** No inferred revenue, no "leading provider",
  no filled-in biography. The overview is a crawl, not a profile.
- **Summarise a section into prose.** The structure IS the data.
- **Include boilerplate.** Privacy, terms, cookies and complaints procedures are legal
  furniture, and downstream they become fake business units.
- **Guess a ticker or a legal entity.** If the site never states them, say so under
  `## Not published` and let the operator supply them.

## Then

Hand the result, with the `DESIGN.md` from `design-md-from-website`, to
`generate-investor-portal`. Those two files are its entire input.
