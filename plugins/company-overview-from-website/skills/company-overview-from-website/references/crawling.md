# Crawling

**Prefer a stored crawl.** In the Diolog platform the crawl already exists — the crawl
worker writes every page plus a deterministic deduplicated `overviewMarkdown`, and
`startCompanyOverview` reads it whole. Run your own crawl only when there is no stored
one; then take every page, because the operation is a deduplication rather than a
selection.

## The pages worth a request, when you must crawl yourself

| Page | What it supplies |
|---|---|
| Home | The company's own one-sentence description — becomes the hero lede |
| About / Our Company | Legal name, history, listing date |
| Each service or product line | Business units. **The whole point.** One page per unit is common |
| Leadership / Board & Management | Names and titles |
| Investor centre / ASX announcements | Lodged PDFs with dates |
| Corporate governance | Charters and policies |
| Contact | Registered office and site list |
| Projects / Case studies | Named projects and their photographs |

## Fetch broadly; exclude at the OUTPUT

A distinction worth keeping straight, because collapsing it loses real content:

- **Fetching** is broad. The overview is a whole-company summary, so a page you never
  fetched is a fact the company published and the overview denies.
- **Emitting** is selective. `/privacy`, `/terms`, `/cookies`, `/complaints`,
  `/whistleblower`, cart, checkout, account, login and search pages are legal furniture
  and site machinery. They must not appear as business sections in the output.

These are not judgement calls at the output stage. Every one has arrived in a crawl
looking like a business section, and a downstream generator cannot tell the difference —
one run rendered a company's privacy policy under "What the group actually does".

## Mechanics

`obscura`, on PATH.

```bash
obscura fetch https://company.com/ --dump text
obscura fetch https://company.com/ --eval "(() => document.querySelector('main')?.innerText ?? document.body.innerText)()"
```

Two things worth knowing before you start:

**Read after the page settles.** Content behind a scroll reveal is `opacity: 0` at load
and `innerText` still returns it, but a *screenshot* will not show it. If you are
capturing images as well as text, scroll the page first.

**Collect image and PDF URLs from the DOM, not the text.** Markdown-ified body text
loses `src` attributes.

```bash
obscura fetch https://company.com/ --eval "(() => ({
  images: [...document.images].map(i => ({ src: i.currentSrc || i.src, alt: i.alt })).filter(i => i.alt),
  pdfs: [...document.querySelectorAll('a[href\$=\".pdf\"]')].map(a => ({ href: a.href, text: a.textContent.trim() })),
}))()" --output assets.json
```

## Placeholder images

Many sites lazy-load behind an inline SVG placeholder:

```
![Matthew Torrance](data:image/svg+xml,%3Csvg…)
```

`currentSrc` resolves the real file once loaded. A `data:` URI in the output is a
placeholder that will render as a blank box, so drop it rather than emit it — and if the
real image never resolves, the alt text alone is still worth keeping for the record.

## Verify before you hand it over

Check the file against the contract rather than assuming the crawl worked:

```bash
grep -cE '^#{2,3} ' overview.md                    # business sections
grep -cE '\]\(.*\.pdf\)' overview.md               # documents
grep -cE '^!\[.+\]\(https' overview.md             # images with alt text
grep -icE 'privacy|cookie|source url' overview.md  # should be ~0
grep -oE '\b(ASX|NASDAQ|NYSE):[A-Z]+' overview.md | head -1
```

The last two matter most. Boilerplate that survives becomes fake business units, and a
missing ticker means the portal cannot identify its own listing.
