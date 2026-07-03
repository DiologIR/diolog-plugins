# Build guidance — single-page business case

How to fill and finish the A4 template so it lands right the **first** time. The
original Alfabs build needed dozens of manual spacing/layout tweaks; every one of
those decisions is already baked into `assets/business-case.template.html`. Your
job is to reproduce that tuned destination with the client's content, not to
re-derive the layout. Read `references/DESIGN.md` for the full visual system.

## 1. Placeholder map

Each `{{PLACEHOLDER}}` and where its content comes from. Facts, figures, prices
and names come from the **client's customer deck** (the runtime content source),
never from any example. Write every line in the Diolog brand voice (see §4).

| Placeholder(s) | What goes there |
|---|---|
| `CLIENT_LEGAL_NAME`, `CLIENT_EXCHANGE`, `CLIENT_TICKER` | Header meta line. Drop the exchange/ticker if the client is private. |
| `CLIENT_SHORT` | Short client name (used in "Recommended plan for …"). |
| `HEADLINE` | 01 The case: the promise, one short serif declarative ending in a full stop. |
| `STANDFIRST` | One-sentence standfirst: the whole argument in a line. |
| `PROBLEM_HEADING` + `PROBLEM_1..3_TITLE` / `_BODY` | Exactly three constraints (bold lead-in + one line). |
| `SOLUTION_HEADING`, `SOLUTION_BODY`, `SOLUTION_CAP_1..4` | The navy solution card: what Diolog is + 4 capability checks. |
| `VALUE_HEADING`, `VALUE_1..4_TAG` / `_TITLE` / `_BODY` | Four value shifts. Tags are one word, UPPERCASE (e.g. Risk / Voice / Time / Presence). |
| `OUTCOME_HEADING` + `OUT_1..4_ACTIVITY/TODAY/WITH/SAVED` + `OUT_TOTAL_*` | Before/with/saved table. Ranges written with "to" (`20 to 30h`). |
| `REPLACES_HEADING` + `REP_1..5_LABEL/VALUE` + `REP_TOTAL_VALUE` | Cost line-items Diolog replaces + estimated annual savings. |
| `PLAN_NAME`, `PRICE`, `PRICE_CADENCE`, `INV_FEAT_1..4` | Investment card. Price in Newsreader, cadence in muted Inter. |
| `NEXT_STEPS_COPY` | One sentence, the specific ask. |
| `PARTNER_NAME`, `PARTNER_ORG`, `PARTNER_EMAIL` | The client-side IR partner/adviser contact (left footer). |

**Baked-in Diolog defaults (do not templatise, keep unless told):** the `diolog`
wordmark, the presenter contact `Amy Benson · Diolog · amy@diolog.com.au ·
diolog.app`, the CTA linking to `https://calendly.com/amyfromdiolog/intro`, and
the tagline `Disclosure, without doubt.` Diolog is the fixed vendor.

The placeholders are the **minimum**. Using `/design-craft` and DESIGN.md you may
rewrite copy, merge or re-order content, change a table's rows, or adjust the
layout to fit the client's argument, provided you keep the eight-section arc, the
two-card rhythm, and the one-page fit.

## 2. The tuned layout (already in the template, keep it)

- **Canvas:** `794 x 1123px` (A4 @96dpi), `padding: 26px 40px 20px`, `display:flex;
  flex-direction:column; justify-content:space-between; overflow:hidden`, fixed
  `height` (never `min-height`). Space-between is what distributes the sections
  evenly down the page.
- **Even section rhythm:** stacked sections use `margin-top:14px` (value,
  investment) and `12px` (outcome). Grid gutters: 18px (problem/solution), 22px
  (outcome/replaces), 16px (value strip / investment features). Keep these even;
  uneven gaps were the single most-tweaked thing in the original.
- **Cards:** the one navy card `padding:14px 16px; border-radius:10px`; wash cards
  `padding:9px 16px; border-radius:10px`. Internal padding is symmetric top/bottom.
- **Pills:** the two highlight rows ("Total per cycle", "Estimated annual
  savings") are `background:#F5F7FB; border-radius:6px; padding:7px 8px`, with the
  saved figure in accent. Round the outer corners only.

## 3. Learnings — mistakes NOT to repeat

These were all corrected during the original build. The template already reflects
the fixes; do not regress to them.

- **Section order is fixed:** the **solution** is the bold navy card on the right,
  next to the problem. The **investment** is a light wash card, NOT navy (only one
  dark card per page). Section 8 is **Next steps** (not "Recommendations").
- **The value strip is horizontal and standalone**, not beside another section.
- **One dark card only.** More than one navy block dilutes the anchor.
- **Focus value on outcomes, not features.** Say what the client gets, not a
  feature list.
- **Remove template scaffolding labels** that do not earn their place: no "POWERED
  BY", "PREPARED BY", "HALF-YEAR CYCLE", "Choose your subscription", "Indicative
  Australian market…" or profile/eligibility filler. If a label or section does
  not change the decision, cut it.
- **Even spacing across the whole document**; symmetric card padding; rounded
  highlight pills; a bit of breathing space above a pill after a divider.
- **No drag artifacts:** never ship `position:absolute` offsets, fixed pixel
  widths/heights on flex children, negative `top`, or `box-shadow` on the print
  canvas. Those caused the "top cut off in print" bug. The template is clean; keep
  it clean.

## 4. Voice (use the diolog-brand-voice skill)

Route every line through the **diolog-brand-voice** plugin, specifically
**`create-diolog-business-case`** (it is purpose-built for buyer/CFO business
cases). Its rules, which you must hold even if you write the copy directly:

- **No em dashes or en dashes anywhere.** Ranges use "to" (`A$25k to 46k`,
  `20 to 30h`). Grep the finished file for `—` and `–` and remove all of them.
- Australian English (organise, colour, licence); **A$** for money.
- Measured confidence, not hype; concrete over abstract; sentence case headings.
- Label estimates as indicative and show the basis (blended rate, comparables).

## 5. One page + print (the hard constraint)

The output MUST be one A4 canvas that prints to exactly one A4 page.

- The template wraps the A4 canvas in a **pan/zoom viewer** (`#bc-stage` /
  `#bc-canvas` / `#bc-controls` + a script): Fit / 100% / zoom, mouse wheel and
  trackpad, drag to pan, with a slight lock/detent at 100%. **Edit only the
  `.bc-page` content**; leave the viewer harness and print CSS alone.
- Print collapses the viewer (`@media print` hides the controls and resets the
  transform) and outputs one clean A4 page. Keep the canvas at fixed
  `794 x 1123px`; keep the `@media print` block intact (`@page { size: 794px
  1123px; margin: 0 }` + `print-color-adjust: exact`).
- `print-color-adjust: exact` is mandatory or the navy card and blue pills print
  grey/white.
- After filling, **render it and confirm nothing overflows or clips** and the
  section gaps are even top-to-bottom. If content is too tall, compress copy (it
  is a one-pager, not a report) rather than shrink below 9px body.
- Export via Save-as-PDF, A4, margins None. One clean page.

## 6. Method

1. Read the client's customer deck; extract the argument: what they lose today,
   what Diolog changes, the quantified payoff (time + money), the price, the ask.
2. Quantify twice (time saved table + money saved list); highlight both totals.
3. Compress ruthlessly to three problems and four value shifts.
4. Keep numbers defensible; mark estimates indicative with their basis.
5. End on one specific ask with one CTA.
