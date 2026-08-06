# Page structure

The order is the argument. Everything else is detail.

## The chrome

**Diolog banner**, 34px, sticky at `top:0`. See `diolog-layer.md`.

**Company header**, ~56px, sticky at `top:34px`. Brand lockup, the quote as ruled-off data
rather than a capsule, nav, one filled CTA. Total chrome stays under about 95px: three stacked
bars reads as three unrelated apps, and the ticker belongs below the hero, not in the stack.

The brand lockup is a mark, the company name, and a sub-label reading **INVESTOR PORTAL**
(never "hub"). Two proportions to check by measuring rather than eye: the sub-label must not
be wider than the name above it, and it needs `line-height:1` or its own leading reads as a
gap you did not set.

Exactly one filled button in the whole header stack. If Diolog's CTA and the company's CTA are
both pills, the page looks assembled.

**Ticker rail**, optional, a marquee of market codes. `aria-hidden`, pauses on hover and focus,
static under reduced motion. It sits under the hero.

## Hero

Company photography with a scrim, the eyebrow, the H1, a lead paragraph, two CTAs, and a
numbered four-line thesis in a second column.

The H1 comes from the company's own website language. See `binding-decisions.md`.

The thesis lines are the four things that make the business what it is, each one traceable to
the overview file, with a source line under them. Four is the count: at three it reads thin,
at six nobody finishes it.

## §01 Company facts

The reason the page exists. A real `<table>`:

| Fact | Value | As at | Source |

Rows: legal name, ASX code, ordinary shares on issue, net debt, dividend status, employees,
board, company secretary, registered office, share registry, financial year end. **Not** ABN
or unquoted securities; `binding-decisions.md` explains where those go.

Above the table, two or three lead figures at display size so the section has an entry point.
Thirteen equally weighted rows have no first thing to look at, and this is the strongest
content on the page. Colour the figures that carry alarm; leave status words in ink, because a
red "Suspended" reads as an alarm the fact does not warrant.

A copy-to-clipboard control that emits the whole table as plain text, each row with its date
and source. These facts currently live inside PDFs where nothing can read them; making them
liftable is the point.

Below 860px the table stacks into labelled blocks. A four-column grid does not survive 375px,
and hiding the header row while leaving the row layout intact produces an unreadable mess.

## §02 Latest disclosures

The most recent announcement in full: category and price-sensitive chips, a machine-readable
publication datetime, an excerpt, a plain-English summary marked as AI-generated with its
caveat attached and its source PDF linked, then file meta and a **"Released via ASX MAP"**
provenance marker.

That marker is Listing Rule 15.7 made visible: nothing appears here before the market has it,
and a lodgement receipt is not the acknowledgement. Carry it consistently or explain its
absence.

Then a short list of earlier items, each with a `<time datetime>`.

**Then the price**, folded in beneath: a compact quote block plus a chart with announcement
markers, at a fraction of the width. Delayed-data disclaimer visible. The referring surface
usually supplied the price already; here it is context for the announcements.

Chart notes: keep the default `preserveAspectRatio` and make the viewBox track rendered width,
or every marker renders as an ellipse. Give the markers `tabindex` and an `aria-label` so the
series is reachable without a pointer, and put the same figures in the facts table so the data
exists in a non-visual form.

## §03 What the business does

Business-unit tiles, each with the one number that describes its scale. Investors want the
business, not only the financials, and this is what a reader skims before deciding to keep
reading. Then a stats strip: people, sites, founded, listed.

## §04 Video

One featured piece with three smaller ones. Real thumbnails, each a distinct image: reusing
the hero photo under a different caption reads as stock substitution. A recorded-date line
under the featured item.

## §05 Corporate governance

Required furniture, not optional. Listing Rule 4.10.3 lets the governance statement live at a
URL; that URL is lodged with ASX under 4.7.4 and Guidance Note 9 wants it signposted from
primary navigation.

Charters and policies with dates, the Appendix 4G, the statement's effective date, and the
people who sign the disclosures.

## §06 Questions

Four or five `<details>`, each answer naming the disclosure it came from. Cover: how to buy
the shares, how the company is capitalised, the dividend position, where an existing holder
changes their details, and who to talk to.

The holder question is the one existing shareholders actually arrive with. Explain **HIN
versus SRN** and which one sends them to the registry rather than their broker, and link the
registry's investor centre from the answer itself, not only from a later section.

Any forward-looking answer names its source disclosure and the assumptions behind it. Section
769C makes a representation about a future matter misleading if made without reasonable
grounds, and a footer disclaimer does not cure that.

## §07 Contact

Two cards. A form that reaches investor relations, with the constraint on what can be answered
placed **under the field**, before the submit, not after it. And the registry details, with the
HIN caveat repeated so a reader landing here directly is not misdirected.

If nothing is wired, the success state says so plainly.

## Diolog app band, then footer

See `diolog-layer.md` for the band.

Footer: brand block, sitemap, corporate links, registered office **with the ABN**, share
registry, a disclaimer band, copyright, and the quiet Diolog credit.

If the figures are illustrative, the disclaimer says so in its first sentence, in plain words,
and the page carries `noindex` until they are real.
