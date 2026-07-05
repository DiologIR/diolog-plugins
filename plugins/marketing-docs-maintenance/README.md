# Marketing Docs Maintenance

A Claude Code plugin that keeps the Diolog **marketing / feature documentation** in the `diolog-team-files` repo (`~/Dev/diolog-team-files/web`) current when a feature ships, a Linear ticket lands, or an area goes stale. It operationalises `docs/marketing/MAINTENANCE.md` (the canonical standards guide in the app repo); the published docs now live in `diolog-team-files/web`.

## What it does

Given a feature change (usually a Linear ticket), it:

1. **Reads what actually shipped** — the ticket description plus comments (especially implementation-complete comments), verified against the live app and source, following the source-of-truth hierarchy (live app > source > ticket comments > ticket description > the docs themselves).
2. **Maps the change to one or more areas** (01–22: Auth, Dashboard, Chat, Inbox, Knowledge Base, Calendar, Disclosure, Perception, Sentiment, Social, Surveys, Workflows, Widgets, Portals, Settings, Profile, Help, Admin, Cross-cutting, AI Memory, Presentation Studio, Tasks/Quorum).
3. **Updates the two assembled published docs** plus their per-area sources under `existing-features-references/`:
   - `existing-features-references/final/XX-*.md` and `existing-features-technical.md` §2.XX — **full technical detail** (component names, routes, GraphQL ops, exact copy, validation, states, permissions).
   - `existing-features-references/plain/XX-*.md` and `exhisting-features-marketing.md` §X — **zero technical detail** (plain English, second person, sentence-case headings).
   - backed by the `live/<area>.md` (browser-verified observations) and `raw/<area>.md` (source-derived) capture layers, which feed the numbered files.
4. **Enforces the standards** — no register leaks (no code terms in plain files, no opinions in technical files), pair consistency (each assembled doc agrees with its per-area source; counts and names match across the technical/plain pair), and the supersede-don't-accumulate currency rule (replace outdated content, never append `UPDATE:` blocks).

## Why it works

- **Two registers, no leakage** — technical and plain-language files are held to opposite, explicit inclusion/exclusion lists.
- **Code-follows, never leads** — documents the present state from what actually shipped, not the ticket's request.
- **Consistency by construction** — every area edit touches both members of each pair and reconciles counts and names across them.
- **Evidence-backed** — a `raw/` (source) and `live/` (browser) capture layer per area feeds the reconciled `final/` and `plain/` files.
- **Parallel-safe** — multi-area changes fan out one sub-agent per area on disjoint files, with shared assembled-document edits serialised.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install marketing-docs-maintenance@diolog-plugins
```

## Example invocations

```text
update the marketing docs for DIO-4761
```
```text
the inbox approval flow changed — refresh the feature docs for area 04
```
```text
document the new presentation studio in the technical + marketing feature docs
```

See `skills/marketing-docs-maintenance/SKILL.md` for the full method, and `docs/marketing/MAINTENANCE.md` in the product repo for the canonical content standards.

## License

MIT
