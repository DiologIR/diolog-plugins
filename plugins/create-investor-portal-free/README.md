# create-investor-portal-free

Builds a single-page public investor portal for a listed company from its `DESIGN.md` and a
company overview markdown file.

The page is branded entirely in the company's own tokens, fenced in one swappable `:root` block
so re-skinning for the next issuer means replacing that block and nothing else. Diolog appears
in three fixed places: a thin sticky banner, a navy app band above the footer, and a quiet
footer credit.

## Why the order is unconventional

The page is designed for the visitor who arrives from a search result or an AI assistant rather
than from the company's own navigation. That visitor already has the share price. What only the
issuer can supply is the dated, sourced fact set and the announcement stream, so those lead and
the price sits beneath them.

That call, and the Listing Rule and structured-data decisions around it, come from a 35-source
research run included as `references/ir-landing-page-research.md`.

## Inputs

- the company's `DESIGN.md` (or a live URL, via `design-md-from-website`)
- a company overview markdown
- whether the figures are real or illustrative

## Skill

`skills/create-investor-portal-free/SKILL.md`
