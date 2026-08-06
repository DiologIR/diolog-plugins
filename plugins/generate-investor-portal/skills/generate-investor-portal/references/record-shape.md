# What you emit

The authority is `libs/shared/src/investor-portal/portal-contract.ts` in the dAIolog repo. Read
it — it is short, it is Zod, and it validates. This file is the orientation, not the spec.

```jsonc
{
  "companyId": "…", "slug": "acme-paid", "category": "paid",
  "title": "Acme Limited (ASX:ACM) - Investor portal",
  "status": "draft",

  "theme":  { /* lifted from DESIGN.md; see tokens-and-motion.md */ },
  "assets": [ { "id": "hero", "url": "…", "alt": "…", "origin": "crawl" } ],

  "chrome": { "header": {…}, "tickerTape": {…}, "footer": {…} },

  "pages": [{
    "pageId": "home", "path": "/", "title": "…",
    "seo": { "noindex": true },
    "sections": [{
      "id": "facts", "kind": "companyFacts", "enabled": true, "order": 1,
      "band": "canvas", "divider": false,
      "eyebrow": "§01 · Company facts", "heading": "…", "sub": "…",
      "motion": { "kind": "reveal" },
      "assetIds": [],
      "props": { /* this kind's own shape */ }
    }]
  }],

  "ledger":  [ /* every illustrative value, with its reason */ ],
  "omitted": [ /* what was left out rather than authored, and why */ ]
}
```

## The slug is not the subdomain

Two different identifiers, and conflating them collides two companies:

- **The subdomain label** derives from the company's legal name: `acme-limited`.
- **The portal slug** is `<label>-<category>`: `acme-paid`, `acme-free`. It is **globally
  unique across every company**, which is why the category is part of it.

## Sections switch off; they do not empty

`enabled: false` is the mechanism for "this company has no video". A section rendered with
nothing in it reads as broken; its absence reads as a company that does not publish video.

Corollary: a section must look right anywhere in the order, because with sections toggling you
cannot know its neighbours. Band alternation is derived at render time, so choose `band` for
meaning (`dark` for the company's own world, `sunken` for context) rather than for rhythm.

## Provenance, which the contract enforces

| `from` | carries | must not |
|---|---|---|
| `record` | `asAt`, `source`, `sourceHref` | — |
| `illustrative` | `why` (required), a `ledger[]` entry (required) | cite `sourceHref` |
| `unavailable` | nothing | carry a `value` at all |

**There is no default.** An omitted `from` is a validation error. It used to default to `record`,
which meant an omission silently made the strongest claim available — the single most dangerous
line in the first version of this contract.

Category rules the schema enforces, so you cannot ship past them:

- a **free** portal rejects any illustrative value outright — there is no third option on the
  record-only surface
- a **report** rejects them too; a fabricated detail in a compliance artifact is worse than a
  missing one
- a **paid** portal rejects an illustrative value that is not in `ledger[]`, because the
  "what is illustrative here" page is generated from that array
- a category may only place the section kinds it owns

## Precision is a claim

If the overview publishes month-and-year against a disclosure, emit month-and-year. Inventing a
lodgement day to make a timeline tidier fabricates specificity the record does not support, and
on a regulated surface a fabricated date is a fabricated fact. Say the precision you hold, in
words, in the section's `sub`.

Do not derive figures either. Market capitalisation from price × shares is arithmetic, not data;
if either input is unavailable, the output is `unavailable`, not approximate.
