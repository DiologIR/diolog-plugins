# Marketing Docs Maintenance

A Claude Code plugin that keeps the Diolog **marketing / feature documentation** in `docs/marketing/` current when a feature ships, a Linear ticket lands, or an area goes stale. It operationalises `docs/marketing/MAINTENANCE.md`.

## What it does

Given a feature change (usually a Linear ticket), it:

1. **Reads what actually shipped** — the ticket description plus comments (especially implementation-complete comments), verified against the live app and source, following the source-of-truth hierarchy (live app > source > ticket comments > ticket description > the docs themselves).
2. **Maps the change to one or more areas** (01–19: Auth, Dashboard, Chat, Inbox, Documents, Calendar, Disclosure, Perception, Sentiment, Social, Surveys, Workflows, Widgets, Portals, Settings, Profile, Help, Admin, Cross-cutting).
3. **Updates the four-file set** for each affected area:
   - `features-build/final/XX-*.md` and `existing-features.md` §2.XX — **full technical detail** (component names, routes, GraphQL ops, exact copy, validation, states, permissions).
   - `features-build/plain/XX-*.md` and `product-feature-guide.md` §XX — **zero technical detail** (plain English, second person, sentence-case headings).
   - plus `outbound-contact-surfaces.md` when a new contact/sharing/delivery surface is added.
4. **Enforces the standards** — no register leaks (no code terms in plain files, no opinions in technical files), four-file consistency (counts and names match across pairs), and the supersede-don't-accumulate currency rule (replace outdated content, never append `UPDATE:` blocks).

## Why it works

- **Two registers, no leakage** — technical and plain-language files are held to opposite, explicit inclusion/exclusion lists.
- **Code-follows, never leads** — documents the present state from what actually shipped, not the ticket's request.
- **Consistency by construction** — every area edit touches both members of each pair and reconciles counts and names across them.
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
document the new survey distribution surface in the product docs (and outbound-contact-surfaces.md)
```

See `skills/marketing-docs-maintenance/SKILL.md` for the full method, and `docs/marketing/MAINTENANCE.md` in the product repo for the canonical guide.

## License

MIT
