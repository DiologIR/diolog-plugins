# The output contract

The portal generator parses this file. Every rule here exists because breaking it
produced a broken portal on a real run, and the failures were silent — the generator
reported success and rendered something wrong.

## Legal name

State it in prose, more than once, exactly as the company writes it.

```markdown
Alfabs Australia Limited is a diversified industrial services group…
```

**The failure this prevents.** The generator picks the listed entity by counting
`X Limited` matches, anchored to the portal's own domain. On a mining company's overview
the most-mentioned entity was a *neighbouring listed miner* — peers, JV partners and
adjacent tenements are named constantly in that sector. Naming another listed company as
the subject of an investor portal is the worst output the pipeline can produce.

Two consequences:

- A `Pty Ltd` is a **proprietary** company and cannot be listed. The generator excludes
  them, so a subsidiary named in passing never becomes the portal's identity.
- The name must share a word with the company's own domain or the crawl produces an
  overview whose subject cannot be verified.

## Ticker and exchange

```markdown
ASX:AAL      NASDAQ:XYZ      NYSE:ABC
```

The exchange prefix is load-bearing. A bare four-letter code is not identifiable.

## Business sections

Either heading level, each followed by a paragraph of more than 60 characters:

```markdown
## Mining Equipment
We are a leading supplier of quality mining equipment, products, services…

### Protective Coatings
Alfabs blasts and coats a wide range of materials in our purpose-built…
```

**Both levels are read**, because real sites use both. Requiring one level found a
privacy policy on one company and nothing at all on another.

**A figure needs a unit.** `4,500km2` becomes a headline figure; a bare `100 %` renders
as a meaningless `100 · %` above the unit. Keep the units the site states.

## Leadership

Two dialects, both supported, because real sites use both:

```markdown
## Executive Leadership Team

Matthew Torrance

Chief Executive Officer
```

```markdown
# Board & Management

- ## Michael Walshe

**_Managing Director & CEO_**
```

**No portraits.** Names and titles only. A generated likeness of a named director is a
fabricated image of a real person; even a real photograph is not something this pipeline
republishes.

## Documents

```markdown
- [FY25 Annual Report](https://company.com/assets/2025/09/annual-report.pdf)
- [Board Charter](/s/301a10_95d47381.pdf)
```

Absolute or site-relative, `-` or `*` bullets. Requiring absolute URLs under `*` bullets
found **zero** documents in a file containing twenty-six.

A `/YYYY/MM/` path segment places the document in a dated chronology. Without one it can
still be listed, but never positioned in a timeline — and the generator states that in
the record's `omitted[]` rather than dropping it silently.

## Images

```markdown
![Steel fabrication workshop interior with plate girders under a gantry crane](https://…jpg)
```

The alt text becomes the portal's alt text, so an empty alt costs that image its
description on the rendered page. Keep every URL: found photographs are always preferable
to generated ones.

## Contact

```markdown
### Contact Details

*   [Head Office
    152 Mitchell Avenue Kurri Kurri NSW 2327](https://maps…)
```

Becomes the registered office and the site list.

## What must NOT appear

| Excluded | Why |
|---|---|
| `Source URL: https://…` | Crawler scaffolding. Reads as a business unit heading. |
| Privacy, terms, cookies, complaints, whistleblower | Legal furniture. One run rendered **"How Do We Collect Personal Information?"** and **"Complaints Resolution"** under *"What the group actually does"*. |
| Cart, checkout, login, account, search | Site machinery, not company facts. |
| Headings phrased as questions | A business unit is a thing a company does, not a question it answers. |
| Newsletter and cookie modal copy | Arrives in the crawl looking like content. |

## Closing section

```markdown
## Not published

- No leadership team is published on the site.
- No ticker or listing is stated.
- No lodged documents were found.
```

An overview that quietly omits something looks identical to a company that publishes
nothing. Naming the gap is what lets the generator disable a section honestly instead of
rendering an empty one.
