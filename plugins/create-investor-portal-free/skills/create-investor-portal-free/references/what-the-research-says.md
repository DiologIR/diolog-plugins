# What the research says a portal must carry

Condensed from a 35-source research run into what retail and professional investors need from
an ASX issuer's page when they arrive from a search result or an AI assistant rather than from
the company's own navigation. The full report, with citations and confidence qualifiers, is
`ir-landing-page-research.md`; read it when a decision here is contested or when you need the
primary source for a claim.

The findings below are ordered by how much they change the build.

## The share price is not what the page is for

A visitor referred by a search result, an AI answer or a broker app has usually already been
shown the price. What only the issuer can supply is the **dated fact set** and the
**announcement stream**. Convention puts a quote widget at the top of every IR page; the
evidence does not support giving it that position.

Consequence: lead with company facts, put disclosures second, and fold the quote and chart in
beneath the disclosures as context rather than as the headline.

The cold visitor's first questions, in order: what does this company actually do, in one
sentence; is this the official source; what stage is it at, and as at when; what happened most
recently; what happens next; who is accountable. Answer the first three above the fold.

## A dated, sourced, machine-readable fact block is the unserved gap

Shares on issue, cash, net debt, board, registry, financial year end. Highly structured facts
that Australian issuers publish almost exclusively inside PDFs, where nothing can read them.
No vendor in the market exposes them as dated, cited HTML on the landing page.

This is the class of fact where the issuer is the unarguable primary source. Build it as a
real table, give every row an "as at" date and the disclosure it came from, and let the whole
thing copy to the clipboard as plain text.

## Freshness is disproportionate in finance

Financial information shows the strongest recency bias of any category in AI citation
behaviour. Every fact, announcement and figure carries a date a person can read and a date a
machine can read (`<time datetime="…">`). An undated fact does not get quoted.

## The corporate governance page is effectively required furniture

Listing Rule 4.10.3 lets the governance statement live at a URL instead of in the annual
report; that URL is lodged with ASX under LR 4.7.4, and Guidance Note 9 asks for it on a
clearly signposted landing page reachable from primary navigation. It is the one page a listed
company effectively has to have, and the address cannot be quietly restructured later.

Give it a section, put it in the nav, state the statement's effective date, and list the
charters and the Appendix 4G.

## Factual density with citations is the evidenced lever; markup is not

Adding statistics, quotations and cited sources improves position-adjusted citation by 30-40%
(GEO, KDD 2024). No controlled study ties schema.org markup to citation rate.

So: emit `Corporation` markup because it is cheap and correct, not because it wins citations.
Use the spec form for the ticker, exchange MIC then a space then the code (`XASX AAL`). Do not
build the page around `FAQPage` (Google removed FAQ rich results on 7 May 2026) or `llms.txt`
(0.1% hit rate; no correlation with citation). The markup is harmless and stays; the strategy
is the sourced prose.

## Crawlability is the gate, and it is usually broken by accident

73% of sites carry technical barriers blocking AI crawler access, often from a firewall or
bot-management rule rather than a deliberate `robots.txt` decision. Blocking one removes the
domain from that engine's citation pool entirely, and cross-engine overlap is small (11%
between ChatGPT and Perplexity), so behaviour has to be allowed per engine.

Ship a `robots.txt` that allows `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot` and
`Google-Extended`.

## Three rules that constrain the build, not just the copy

- **Listing Rule 15.7.** Nothing may be released to any person before ASX acknowledges release
  to the market. The page is strictly downstream of the Market Announcements Platform, and a
  lodgement receipt is not the acknowledgement. Make that visible on each announcement rather
  than assuming it.
- **Section 769C, Corporations Act.** A representation about a future matter made without
  reasonable grounds is taken to be misleading. A disclaimer at the foot of the page does not
  cure it. Any forward-looking answer names the disclosure its grounds come from.
- **The issuer does not hold the register.** Holdings, payments and address changes go to the
  share registry. Explain HIN versus SRN, because that is the question existing shareholders
  actually arrive with, and it decides whether they go to the registry or to their broker.

## What the evidence does not support

There is **no independent evidence** that any specific IR-page element grows a shareholder
register or a subscriber list. Every figure published in this market traces back to a vendor
describing its own product.

Do not use a growth claim to justify including something, and do not interrupt a first-time
reader with a lead-capture modal on that basis. Offer a subscribe path; do not stage it.

Similarly, a free-text AI assistant answering questions about a listed company is a
selective-disclosure risk under LR 15.7. The safe version is constrained to already-released
material with a citation on every sentence, which is a build rather than a widget. Route
questions to a form and say plainly what the answer surface can and cannot draw on.

## Open questions the research could not settle

Worth stating in the deliverable rather than designing around silently:

- whether an issuer may display its own delayed price, and with what attribution: the ASX
  market-data licence terms were not obtained
- what competitors actually publish: the PDF-behind-a-widget pattern is inferred, not crawled
- which assistant cites whom: overlap is small enough that it has to be measured per engine
