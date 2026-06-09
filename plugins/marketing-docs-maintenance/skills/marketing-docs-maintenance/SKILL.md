---
name: marketing-docs-maintenance
description: "Keep the Diolog marketing/feature documentation set in docs/marketing/ current when a feature ships, a Linear ticket lands, or an area goes stale. Use this skill whenever the user asks to update, sync, refresh, or maintain the marketing docs / feature guide / product docs / feature documentation — e.g. 'update the marketing docs for DIO-1234', 'document this feature in the feature guide', 'the inbox docs are out of date', 'sync the product docs with what shipped', 'add this to existing-features.md', 'keep the feature documentation current' — or after implementing/changing a user-facing feature when the docs should follow. It updates the four-file set per area (features-build/final/XX-*.md + existing-features.md section 2.XX for technical detail; features-build/plain/XX-*.md + product-feature-guide.md section XX for plain language), plus outbound-contact-surfaces.md when a new contact/sharing/delivery surface is added. Enforces the content standards (technical files carry component names / routes / GraphQL ops / exact copy and NO opinions; plain files carry zero technical terms, second person, sentence case, no em dashes, no emojis), the four-file consistency rule, the supersede-don't-accumulate currency rule, and the live-app > source > ticket source-of-truth hierarchy. The canonical in-repo guide is docs/marketing/MAINTENANCE.md — this skill operationalises it. Trigger even if the user doesn't say 'marketing docs' explicitly; any 'reflect this shipped feature in the documentation' request for docs/marketing qualifies."
allowed-tools:
  - "Read"
  - "Write"
  - "Edit"
  - "Grep"
  - "Glob"
  - "Bash"
  - "ToolSearch"
  - "Agent"
  - "TaskCreate"
  - "TaskUpdate"
---

# Marketing Docs Maintenance (Diolog)

<role>
You maintain the Diolog marketing/feature documentation in `docs/marketing/`. When a feature ships or a Linear ticket lands, you bring the docs back into agreement with what the app actually does — editing the right area files, at the right detail level, with zero leakage between the technical and plain-language registers. The docs are a **record that follows the code**, never a specification that leads it.
</role>

> **Canonical source:** `docs/marketing/MAINTENANCE.md` in the target repo is the authoritative guide. **Read it first** every run — it may have evolved since this skill was written. This skill operationalises it; if the two disagree, MAINTENANCE.md wins and you should mention the drift.

---

## The documentation set

Five maintained surfaces under `docs/marketing/`:

| File | Audience | Detail level |
|------|----------|-------------|
| `existing-features.md` | Engineers, AI agents, technical reviewers | **Full technical detail** — component names, GraphQL ops, route paths, state models, field names, validation rules, exact error/toast copy |
| `features-build/final/XX-*.md` | Same as above (per-area working source) | **Full technical detail** — one file per area (01–19) |
| `product-feature-guide.md` | PMs, customers, non-technical stakeholders | **Zero technical detail** — plain English: what users see and do |
| `features-build/plain/XX-*.md` | Same as above (per-area working source) | **Zero technical detail** — one file per area (01–19) |
| `outbound-contact-surfaces.md` | Product/design | Medium structured inventory of contact-input methods, delivery channels, options per surface |

The `final/` and `plain/` per-area files are the **working source**; `existing-features.md` (section `2.XX`) and `product-feature-guide.md` (section `XX`) are the assembled documents. Both members of each pair must agree.

### Area map (01–19) — `final/` and `plain/` share this numbering

| # | Area | Covers |
|---|------|--------|
| 01 | Auth | Login, sign-in, company picker, access denied |
| 02 | Dashboard | Home screen, quick tools, regulatory updates, key metrics |
| 03 | Chat | Conversations, agents, prompts, document picker, compliance canvas |
| 04 | Inbox | Smart inbox, conversations, reply composer, approval flow |
| 05 | Documents | Library, templates, editor, publishing, delivery metrics |
| 06 | Calendar | Setup wizard, live view, calendar settings |
| 07 | Disclosure | Disclosure consistency checker |
| 08 | Perception | Perception studies |
| 09 | Sentiment | Sentiment analyses |
| 10 | Social | Monitoring (Investors tab, Competitors tab) |
| 11 | Surveys | Survey creation, editor, publish, distribution, results |
| 12 | Workflows | Library, intro page, run detail, step types |
| 13 | Widgets | Admin studio, FAQ hub, embeddable widgets |
| 14 | Portals | Public and private investor portals |
| 15 | Settings | Settings modal (all 8 panes) |
| 16 | Profile | User profile page |
| 17 | Help | Help and support |
| 18 | Admin | Admin console |
| 19 | Cross-cutting | Behaviours spanning multiple areas |

---

## Inputs & intake

Establish what changed and which area(s) it touches. If unclear, ask.

- **A Linear ticket** (the common case) — e.g. `DIO-4761`. Read it via the Linear MCP (load `mcp__linear__get_issue` and `mcp__linear__list_comments` through `ToolSearch`). Read the **description AND the comments**, especially any implementation-complete comment — that describes what actually shipped (which may differ from what was requested).
- **A described feature change** with no ticket — work from the description + the live app + source.
- **A "this area is stale" request** — re-derive the area from the live app and source and reconcile.

Map the change to one or more areas (01–19). A change can span several areas (and area 19 captures cross-cutting behaviour).

---

## Source-of-truth hierarchy

When sources conflict, trust in this order:

1. **Live app** (what the browser actually shows) — ultimate authority.
2. **Source code** (what the components render) — next authority.
3. **Implementation-complete comments** on the Linear ticket — what was built.
4. **Ticket description** — what was requested (may differ from what shipped).
5. **These docs** — a record, not a spec; they follow the code.

> The e2e test-plan files (`apps/web/e2e/test-plan/*.md`) are a separate, **older** source documenting an earlier build. Do **not** use them as the authority for what exists now; when they conflict with the marketing docs, the marketing docs are more current.

Verify against the live app where you can (dev login → target page) or by reading the rendering source; don't document from the ticket alone.

---

## Update process

For each affected area, update **four files** (two pairs) — and a fifth when contact/outbound surfaces change:

1. `features-build/final/XX-*.md` (technical detail)
2. `existing-features.md` → section `2.XX` (technical detail; must agree with #1)
3. `features-build/plain/XX-*.md` (plain language)
4. `product-feature-guide.md` → section `XX` (plain language; must agree with #3)
5. `outbound-contact-surfaces.md` — **only** if a new outbound / sharing / contact surface was added (record contact-input methods, delivery channels, options)

Steps:
1. Read the ticket (description + comments).
2. Identify affected area file(s).
3. Read the current content in those files.
4. **Replace** outdated content — do **not** append `UPDATE:` blocks, changelog entries, or "as of DIO-xxxx" notes. The docs describe the present state only.
5. Verify four-file consistency (technical pair agrees; plain pair agrees; counts and names match across pairs).
6. Update `outbound-contact-surfaces.md` if relevant.

When **multiple areas** are affected, you may fan out **one sub-agent per area** (via `Agent`) — but give each agent disjoint area files so they don't collide, and run the shared assembled documents (`existing-features.md`, `product-feature-guide.md`) edits carefully (each area edits a different section `2.XX` / `XX`; if agents race on the same assembled file, serialise those section edits in a final pass). Use `TaskCreate`/`TaskUpdate` to track areas.

---

## Content standards

### Technical register — `existing-features.md` + `final/*.md`

**Include:** component names (e.g. `CompanyProfileForm`, `DocumentPicker`); route paths (e.g. `/workflows/[id]`, `?settings=profile`); GraphQL operation names (queries/mutations/subscriptions); field names and types; **exact** error/toast copy in quotes; validation rules (required fields, formats, limits); loading/empty/error states with exact copy; accessibility attributes (roles, aria labels); permission model (which guards, which roles); state machines (status enums, transitions); known behaviours and bugs (with root cause when known).

**Do NOT include:** implementation advice or recommendations; inline source-code blocks; speculative future features; opinions on quality or design.

**Structure per section:** Overview (what it is, who uses it, where it lives) · Pages and routes table · Features (bulleted, grouped) · Interfaces (modals/drawers/panels/menus with field-level detail) · Interactions and logic (what happens on click/submit, sequencing) · States and validation · Permissions and visibility · Data and queryability (what durable records are produced, what the chat agent can answer) · Known behaviours.

### Plain register — `product-feature-guide.md` + `plain/*.md`

**Include:** what the user sees (headings, buttons, lists, cards described visually); what happens when they interact (click, type, toggle, drag); what feedback they get (confirmations, warnings, errors in plain terms); empty/loading states in user terms; who can use it (roles in plain language); known quirks as user-observable behaviour.

**Do NOT include:** component names, file paths, route paths; GraphQL operations or API endpoints; field types, schema names, database details; technical root causes of bugs; accessibility attributes or aria labels; state-machine terminology; any word a non-developer would need to look up.

**Style rules:** second person ("you see", "you click"); say "pane/section/card/button/link", not "component/resolver/mutation"; describe errors as "a message appears saying…", not "renders an Alert with status=error"; **no em dashes** (use commas, full stops, or colons); **no emojis**; **headings in sentence case**.

**Structure per section:** Brief intro (what it is, who uses it, where it lives) · subsections by page or major feature · each subsection: Purpose · What you see · What you can do · States and feedback.

---

## Quality checks (before a section is complete)

1. **Accuracy** — matches the live app / source. Planned-but-unreleased features are clearly marked as such.
2. **Completeness** — every interactive element, every state (loading/empty/error/success), every permission boundary.
3. **No leaks** — technical files carry no opinions; plain files carry no code terms.
4. **Consistency** — the same feature is described at the same scope across all four files. If the technical file says "6 segment options", the plain file also says 6.
5. **Currency** — when a ticket supersedes an earlier one (e.g. DIO-4761 superseded DIO-4760 on workflows), the earlier description is **replaced, not accumulated** alongside.

---

## Done criteria

- The affected area's four files are updated (plus `outbound-contact-surfaces.md` if a contact/outbound surface changed).
- The technical pair agrees; the plain pair agrees; counts and names match across pairs.
- No `UPDATE:`/changelog residue; outdated content replaced.
- No register leaks (no code terms in plain files; no opinions in technical files).
- Plain files obey the style rules (second person, sentence-case headings, no em dashes, no emojis).
- Documentation reflects what actually shipped per the source-of-truth hierarchy, not just the ticket request.

---

## Example invocations

```
update the marketing docs for DIO-4761
```
```
the inbox approval flow changed — refresh the feature docs for area 04
```
```
document the new survey distribution surface in the product docs (and outbound-contact-surfaces.md)
```
```
sync existing-features.md and the plain guide with what shipped on workflows
```
