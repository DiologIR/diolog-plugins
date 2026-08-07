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

## Company logo

The mark goes in the document PREAMBLE, above the first `##`, in exactly this
shape. The API emits it from `renderCompanyLogoBlock`
(`apps/api/src/modules/investor-portal/services/company-logo-overview-block.ts`),
pinned by `company-logo-overview-block.spec.ts`. Change one and you must change
the other — this literal IS the agreement between the two implementations.

```markdown
Company logo: https://…public-blob…/logo.png
- Alt text: Alfabs Group: Mining & Engineering Services in the Hunter Valley Region
- Source page: https://alfabs.com.au/contact-us/
- Original: https://alfabs.com.au/wp-content/uploads/…/Alfabs-logo_white_crop-….png
- Dimensions: 172x54
- Ground: dark
- Ground measured: rgb(0, 0, 0) via div
```

When there is no usable mark, one line and nothing else:

```markdown
Company logo: none found.
```

**Why the preamble and not a `## Company logo` heading.** Business units are read
from `##`/`###` headings with prose under them. A heading here renders the logo
note as a business unit — the same failure that put a privacy policy under *"what
the group actually does"*.

**Why a bare URL and not `![alt](url)`.** Image syntax puts a trademark in the
same sweep as the site's photographs, where a generator can drop it into a scene
slot.

Field by field:

| Field | Rule |
|---|---|
| `Company logo:` | The URL of the mark the page actually renders. Not a favicon, not an `og:image`, not an inline `<svg>` or `data:` URI (neither has a URL that resolves). |
| `Alt text:` | The company's own alt, verbatim. `(none published)` when the site publishes none — never invented. |
| `Source page:` | The page it was found on. This is what makes a wrong capture diagnosable. |
| `Original:` | Where the mark lives on the company's own server. Trademark provenance. |
| `Dimensions:` | `WIDTHxHEIGHT` of the DECODED asset, in real pixels. Not the CSS box it is scaled into — metalliuminc.com renders a 1202×188 mark in a 320×50 slot. |
| `Ground:` | `light`, `dark`, or `not determined`. Measured from what is painted behind the mark. |
| `Ground measured:` | The colour read, and what it was read from — or `indeterminate via <reason>`. |

**The ground is the field this block exists for.** Measured on real sites:
metalliuminc.com ships `logo_Metallium_INVERSE.png`, a white mark on a dark
Squarespace hero; alfabs.com.au ships BOTH `Alfabs-logo.png` and
`Alfabs-logo_white_crop.png` in one masthead. Walking the ancestor chain calls the
Metallium mark `light`, because its `position: fixed` header is transparent and
the walk lands on `body` — the paint stack behind the mark calls it `dark`, which
is what the page shows. Read the paint stack.

`not determined` is a legitimate answer and must be used rather than a guess.
alfabs.com.au's HOME page floats a transparent masthead over a photograph; its
`/contact-us/` page does not, and yields `dark` / `rgb(0, 0, 0)`. Across a whole
crawl, a page whose ground could be measured supersedes one whose ground could
not — a mark that cannot be placed is worth less than one that can.

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
| A favicon or `og:image` as the company logo | A favicon is an icon and an `og:image` is a share card. Either one rendered as a listed company's mark is worse than the two-letter monogram it replaced. |
| Headings phrased as questions | A business unit is a thing a company does, not a question it answers. |
| Newsletter and cookie modal copy | Arrives in the crawl looking like content. |

## Closing section

```markdown
## Not published

- No leadership team is published on the site.
- No ticker or listing is stated.
- No lodged documents were found.
- No usable company logo was found in the masthead.
```

An overview that quietly omits something looks identical to a company that publishes
nothing. Naming the gap is what lets the generator disable a section honestly instead of
rendering an empty one.
