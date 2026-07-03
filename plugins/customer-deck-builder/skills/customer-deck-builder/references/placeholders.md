# Placeholders, content map & intake questions

This file is the contract between the **content** the user gives you and the
**templated frames**. It lists every token you can fill via `deck.config.json`,
the copy that is *not* tokenised (reuse-or-override), and a bank of multichoice
questions for the details that are usually missing.

Diolog is the **fixed vendor**. Only the **client** and the **commercials** are
variable. Read `DESIGN.md` (tokens/vibe) and `BUILD-GUIDE.md` (per-slide geometry)
alongside this file.

---

## 1. Token table (goes in `deck.config.json` → `tokens`)

`Tier` tells you how hard to chase a value: **ask** = usually missing, ask the
user; **derive/known** = you can infer it or it comes free; **default-ok** =
the Alfabs-era default is a fine placeholder if unknown.

| Token | Meaning | Alfabs default | Tier |
|---|---|---|---|
| `CLIENT_NAME` | Full legal/brand name | `Alfabs Australia` | **ask** |
| `CLIENT_SHORT` | Short name used in prose | `Alfabs` | **ask** |
| `CLIENT_TICKER` | Ticker code | `AAL` | ask (if listed) |
| `CLIENT_EXCHANGE` | Exchange | `ASX` | ask (if listed) |
| `CLIENT_SECTOR` | Sector / industry | `Industrials` | ask |
| `CLIENT_DOMAIN` | Website domain (mock portal) | `alfabs.com.au` | derive/known |
| `PREPARED_FOR` | Cover eyebrow (UPPERCASE) | `PREPARED FOR THE ALFABS BOARD · CFO & CEO` | ask |
| `DECK_DATE` | Cover date (UPPERCASE) | `JULY 2026` | derive (today) |
| `PARTNER_FIRST` | Client-side IR partner, first name | `Becca` | **ask** |
| `PARTNER_NAME` | IR partner, full name | `Rebecca Culbertson` | ask |
| `PARTNER_ROLE` | IR partner role/firm | `Investor Relations, Fraction IR` | ask |
| `PARTNER_EMAIL` | IR partner email | `rebecca@fractionir.com` | ask |
| `PRESENTER_NAME` | Diolog presenter | `Amy Benson` | default-ok |
| `PRESENTER_TITLE` | Diolog presenter title | `Director, Diolog` | default-ok |
| `PRESENTER_CONTACT` | Diolog contact line | `amy@diolog.com.au   ·   0439 667 489   ·   diolog.app` | default-ok |
| `CTA_PRIMARY_LABEL` / `_URL` | Primary CTA | `BOOK A CHAT WITH AMY…` / Calendly | default-ok |
| `CTA_SECONDARY_LABEL` / `_URL` | Secondary CTA | `VIEW PERSONALISED DEMO` / demo link | ask (demo URL) |
| `CURRENCY` | Currency prefix | `A$` | derive |
| `PRICE_TIER1` | Base tier price/mo | `1,499` | **ask** |
| `PRICE_TIER2` | Recommended tier price/mo | `1,999` | **ask** |
| `HOURS_CYCLE` | Hours saved per cycle | `~50` | default-ok |
| `HOURS_YEAR` | Hours saved per year | `~110` | default-ok |
| `GO_LIVE` | Go-live time | `~2 weeks` | default-ok |

**Derived automatically by the build** (do not put in config unless overriding):
`CLIENT_NAME_UPPER`, `CLIENT_SHORT_UPPER`, `PARTNER_FIRST_UPPER`,
`PARTNER_NAME_UPPER`, `PRESENTER_NAME_UPPER`, `HOURS_YEAR_N` (the number without
`~`). Page numbers (`PAGE_N`, `PAGE_TOTAL`) and the section number (`SECTION_NUM`)
are computed from each slide's position — reordering or adding a slide renumbers
the whole deck, so never hand-edit a footer number.

**Config also carries:** `title`, `client_logo` (path/URL → embedded, or empty →
client name text fallback top-right of the cover), and `design.accent` /
`design.navy` (one-value rebrand — keep the *one-accent* discipline from DESIGN.md).

---

## 2. Content that is NOT tokenised — reuse or override on request

The whole point of "keep the IR spine": these bodies of copy are strong defaults
that already read as a Diolog IR proposal. Leave them as-is unless the user's
context or an explicit ask says otherwise. To change them, **edit the copied
frame file directly** (they are plain HTML) — there is no token for them.

- **Slide 2** — the three constraints and the left narrative (IR/design/disclosure
  pain). Re-point the entities; keep the argument unless told to.
- **Slide 3** — the three summary cards (approach / why now / outcome).
- **Slide 4** — the three capability columns and the **product-UI mockups**.
  Default to Presentation Studio, Compliance Guardian, Investor Portal, but when a
  discovery interview is supplied, swap in the three product areas that best fit
  the client (SKILL.md §3b) and design their mocks from the real web-app system
  (see the Diolog references in SKILL.md). Keep them within the mock frame/scale of
  `BUILD-GUIDE.md` §6. Mock financials (`$142.6m`, share price `$1.24`, dates) are
  illustrative — swap only if the user gives real figures.
- **Slide 5** — the human/production split lists and the bottom line.
- **Slide 6** — the value table rows (activity / today / with Diolog / saved) and
  the note. Numbers are indicative; override with the client's real baseline if
  supplied, else keep.
- **Slide 7** — the five governance rows and the three chips. Region `Sydney
  (ap-southeast-2)` and `AES-256` are Diolog facts — keep.
- **Slide 8** — tier feature bullets and the savings breakdown (`A$10-15k /yr`
  etc.). Prices come from tokens; the line items are default-ok.

When you *do* override copy, respect `BUILD-GUIDE.md`: keep the coordinate/geometry
of the block, only change the text; watch that longer copy still fits the frame
(these are fixed 1920×1080 canvases — overflow is clipped, not reflowed).

---

## 3. Intake questions (multichoice — ask only for what's missing)

Ask in **one batch of ≤4 questions** where possible (the host renders them as
multiple-choice with an always-present "Other"). Only ask for **material** gaps
the user hasn't already given; never ask what you can infer. Offer a
recommended option first. Good starting questions:

**Q — Is the client listed?**
- Listed (has a ticker) · Private / pre-IPO · Not sure
→ gates whether you gather `CLIENT_TICKER` / `CLIENT_EXCHANGE` and how the mock
  investor portal reads.

**Q — Client sector?**
- (offer 3 likely sectors from context) · Other
→ `CLIENT_SECTOR`.

**Q — Who is the client-side IR partner (the "Becca" role)?**
- A named fractional IR partner · An in-house person · No partner — Diolog direct
→ `PARTNER_FIRST` / `PARTNER_NAME` / `PARTNER_ROLE` / `PARTNER_EMAIL`. If "no
  partner", soften slide 5 (the human/production split) so it doesn't imply one.

**Q — Pricing tiers?**
- Keep A$1,499 / A$1,999 · Two custom tiers · One tier only · Hide pricing
→ `PRICE_TIER1` / `PRICE_TIER2`; "one tier" or "hide" means adjusting slide 8's
  card layout (see BUILD-GUIDE §5.6 / §7.8).

**Q — Brand accent?**
- Keep Diolog red (`#d62b1f`) · Use the client's brand colour · Neutral navy only
→ `design.accent`. If client colour, keep the *single-accent* rule.

**Q — Deck scope / slides?**
- All 9 as-is · Drop some · Add a slide (e.g. team, timeline, case study)
→ edit `slides[]`; "add" triggers the new-screen flow (design-craft).

**Q — Which features matter most for this client?**
- Do you have a discovery interview / call notes I can use? · Use the default
  three modules · Let me pick the features
→ drives the slide-4 mocks + copy (SKILL.md §3b). With an interview, pick the three
  product areas from the feature catalog that best answer the client's stated
  pains; without one, keep the default three.

Always also invite **free-form context**: "Anything else about the offer, the
audience, tone, or specific numbers I should weave in?" Feed that into copy edits.

---

## 4. Quick reference — what lives on each slide

| # | File | Role | Key variable bits |
|---|---|---|---|
| 01 | `01-cover.html` | Cover | client name/logo, prepared-for, date, cover sub (hours/year) |
| 02 | `02-the-brief.html` | The brief | client-name in narrative ×; 3 constraints (copy) |
| 03 | `03-summary.html` | Summary | 3 cards; hours/year, go-live |
| 04 | `04-the-workspace.html` | Workspace | 3 columns + 3 product mockups (client name/ticker/domain) |
| 05 | `05-the-approach.html` | The approach | partner-first name; human/production split |
| 06 | `06-value.html` | Value case | headline hours/cycle; value table; navy stat panel |
| 07 | `07-governance.html` | Governance | 3 chips + 5 governance rows (Diolog facts) |
| 08 | `08-investment.html` | Investment | 2 price tiers + savings; recommended-for badge |
| 09 | `09-next-steps.html` | Next step | CTAs, IR-partner + Diolog contacts |
