---
name: marketing-docs-maintenance
description: "Keep the Diolog marketing/feature documentation set in the diolog-team-files repo (~/Dev/diolog-team-files/web) current when a feature ships, a Linear ticket lands, or an area goes stale. Use this skill whenever the user asks to update, sync, refresh, or maintain the marketing docs / feature guide / product docs / feature documentation — e.g. 'update the marketing docs for DIO-1234', 'document this feature in the feature guide', 'the inbox docs are out of date', 'sync the product docs with what shipped', 'add this to the technical/marketing features doc', 'keep the feature documentation current' — or after implementing/changing a user-facing feature when the docs should follow. It updates the two assembled published docs — existing-features-technical.md (full technical detail) and exhisting-features-marketing.md (plain, non-technical) — plus the per-area detail files under existing-features-references/ (final/ and plain/ numbered per area 01-22, backed by the live/ and raw/ capture layers), and the auxiliary surfaces outbound-contact-surfaces.md (contact/delivery inventory), ui-interaction-details.md (micro-interaction/motion/console reference), and INCORPORATED.md (the Linear-ticket reconciliation ledger). Enforces the content standards (technical files carry component names / routes / GraphQL ops / exact copy and NO opinions; plain files carry zero technical terms, second person, sentence case, no em dashes, no emojis), the pair-consistency rule (each assembled doc must agree with its per-area source), the supersede-don't-accumulate currency rule, and the live-app > source > ticket source-of-truth hierarchy. The canonical standards guide is docs/marketing/MAINTENANCE.md in the Diolog app repo — this skill operationalises it, but the published docs now live in diolog-team-files/web (paths below), which supersedes the in-repo file locations MAINTENANCE.md lists. Trigger even if the user doesn't say 'marketing docs' explicitly; any 'reflect this shipped feature in the documentation' request for the Diolog feature docs qualifies."
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
You maintain the Diolog marketing/feature documentation in the **`diolog-team-files`** repo, under `~/Dev/diolog-team-files/web`. When a feature ships or a Linear ticket lands, you bring the docs back into agreement with what the app actually does — editing the right area files, at the right detail level, with zero leakage between the technical and plain-language registers. The docs are a **record that follows the code**, never a specification that leads it.
</role>

> **Doc home:** `~/Dev/diolog-team-files/web` (the `diolog-team-files` git repo, `web/` directory). This is where the published docs live and where every edit lands. If the repo is cloned elsewhere on the machine, resolve it from there, but the canonical path is `~/Dev/diolog-team-files/web`.
>
> **Canonical standards:** `docs/marketing/MAINTENANCE.md` in the **Diolog app repo** is the authoritative guide for the content standards, the area map, the quality checks, and the source-of-truth hierarchy. Read it first if it's available — it may have evolved. This skill embeds those standards and is self-sufficient without it; where the two disagree on **standards**, MAINTENANCE.md wins and you should mention the drift. But MAINTENANCE.md still describes the *old in-repo file locations* (`docs/marketing/existing-features.md`, `product-feature-guide.md`, `features-build/…`); those are **superseded** by the `diolog-team-files/web` paths below, which are the live home.

---

## The documentation set

Everything lives under `~/Dev/diolog-team-files/web`. There are **two assembled published documents** and **one references tree** with four layers.

### Assembled documents (the deliverables)

| File | Audience | Register | Section heading |
|------|----------|----------|-----------------|
| `existing-features-technical.md` | Engineers, AI agents, technical reviewers | **Full technical detail** — component names, GraphQL ops, route paths, state models, field names, validation rules, exact error/toast copy | `### 2.XX` (a top-level `## 2. Feature & Interface Specification (PRD)` holds `### 2.1`–`### 2.22`) |
| `exhisting-features-marketing.md` | PMs, customers, non-technical stakeholders | **Zero technical detail** — plain English: what users see and do | `## X.` (`## 1.`–`## 22.`) |

> `exhisting-features-marketing.md` is spelt with that exact (mis)spelling on disk — **match the filename verbatim**, do not "correct" it to `existing-`.

### References tree — `existing-features-references/`

The per-area detail. Four layers:

| Layer | Path | Naming | Register | Role |
|-------|------|--------|----------|------|
| **final** | `existing-features-references/final/XX-*.md` | numbered `01`–`22` | full technical detail | Per-area **technical working source**. Each file carries its own `### 2.XX` section and is **assembled into `existing-features-technical.md`**. |
| **plain** | `existing-features-references/plain/XX-*.md` | numbered `01`–`22` | zero technical detail | Per-area **plain working source**. Each file carries its own `## X.` section and is **assembled into `exhisting-features-marketing.md`**. |
| **live** | `existing-features-references/live/<area>.md` | area-named, unnumbered | observation notes | **Browser-verified live-app capture** for an area (what the running app shows). Upstream evidence that informs `final/` + `plain/`. Partial coverage — write/refresh when you do a live pass. |
| **raw** | `existing-features-references/raw/<area>.md` | area-named, unnumbered | raw technical | **Source-derived raw technical capture** for an area (from reading the components). Upstream evidence that informs `final/`. Partial coverage — write/refresh when you do a source pass. |

**Flow:** `raw/` (from source) + `live/` (from the browser) reconcile into `final/` (technical) and `plain/` (plain); `final/` assembles into `existing-features-technical.md`, `plain/` assembles into `exhisting-features-marketing.md`.

The **maintained, always-complete, always-in-sync** set is: the two assembled docs + the numbered `final/` and `plain/` per-area files. `live/` and `raw/` are capture layers — they are evidence, not deliverables; keep them for the areas you actively re-verify, and let them feed the numbered files. Each assembled doc must agree with its per-area source (technical pair; plain pair), and the technical and plain descriptions of the same feature must agree in scope and counts.

### Auxiliary surfaces (top level of `web/`, alongside the two assembled docs)

Three further files at `~/Dev/diolog-team-files/web`. Not part of the per-area four-file sync; each is a standalone surface with its own trigger.

| File | What it is | When to update |
|------|-----------|----------------|
| `outbound-contact-surfaces.md` | Cross-cutting inventory of **every** surface where a user provides contact data (email addresses, CSVs, people picks) or triggers outbound delivery (email, push, in-app, SMS, link sharing), grouped by the surface that initiates the action, with the contact-input methods / delivery channels / options for each. Medium structured detail — uses field names for precision, no code. | Whenever a new contact-input or outbound-delivery surface is added, or an existing one's input methods / channels / options change. |
| `ui-interaction-details.md` | Focused **technical** reference for micro-interactions, motion, layout conventions, empty states, and the staff AI-configuration console that are easy to miss in the per-area files. Records exact labels (in quotes), layout, dimensions, and motion; component names for orientation only. **Auxiliary** — where it overlaps a per-area file, that per-area file remains the source of truth. | When a documented micro-interaction / motion / layout convention / console UI changes, or a new one worth recording lands. |
| `INCORPORATED.md` | Reconciliation **ledger** — a running record of which Linear issues have been folded into the doc set (Status · Disposition · Areas · notes). A maintenance aid only; **not** a product-detail surface. | Check it **first** on a maintenance pass to skip already-covered tickets; append a row for **every** ticket you process (including ones deliberately left out, with the reason). |

### Area map (01–22) — `final/` and `plain/` share this numbering

| # | Area | Covers |
|---|------|--------|
| 01 | Auth | Login, sign-in, company picker, access denied |
| 02 | Dashboard | Home screen, quick tools, regulatory updates, key metrics |
| 03 | Chat | Conversations, agents, prompts, document picker, compliance canvas |
| 04 | Inbox | Smart inbox, conversations, reply composer, approval flow |
| 05 | Knowledge Base | Library, templates, editor, publishing, delivery metrics |
| 06 | Calendar | Setup wizard, live view, calendar settings |
| 07 | Disclosure | Disclosure consistency checker |
| 08 | Perception | Perception studies |
| 09 | Sentiment | Sentiment analyses |
| 10 | Social | Monitoring (Investors tab, Competitors tab) |
| 11 | Surveys | Survey creation, editor, publish, distribution, results |
| 12 | Workflows | Library, intro page, run detail, step types |
| 13 | Widgets | Admin studio, FAQ hub, embeddable widgets |
| 14 | Portals | Public and private investor portals |
| 15 | Settings | Settings modal (all panes) |
| 16 | Profile | User profile page |
| 17 | Help | Help and support |
| 18 | Admin | Admin console |
| 19 | Cross-cutting | Behaviours spanning multiple areas |
| 20 | AI Memory | Learned memories, chat learning cards, "Used N memories", suggestion rail, per-conversation opt-out, Settings AI-memory pane, background maintenance |
| 21 | Presentation Studio | Presentations home (AI hero + deck gallery + themes), full-window slide editor, present mode, in-chat deck generation, share/export (flag-gated `presentation_studio`) |
| 22 | Tasks (Quorum) | Built-in issue tracker sidebar page: Board / List / My Issues, projects + kanban columns, command palette, comments/reactions, live presence, MCP tools, "Send to agent" (flag-gated `quorum`) |

---

## Inputs & intake

Establish what changed and which area(s) it touches. If unclear, ask.

- **A Linear ticket** (the common case) — e.g. `DIO-4761`. Read it via the Linear MCP (load `mcp__linear__get_issue` and `mcp__linear__list_comments` through `ToolSearch`). Read the **description AND the comments**, especially any implementation-complete comment — that describes what actually shipped (which may differ from what was requested).
- **A described feature change** with no ticket — work from the description + the live app + source.
- **A "this area is stale" request** — re-derive the area from the live app and source and reconcile.

Map the change to one or more areas (01–22). A change can span several areas (and area 19 captures cross-cutting behaviour).

---

## Source-of-truth hierarchy

When sources conflict, trust in this order:

1. **Live app** (what the browser actually shows) — ultimate authority.
2. **Source code** (what the components render) — next authority.
3. **Implementation-complete comments** on the Linear ticket — what was built.
4. **Ticket description** — what was requested (may differ from what shipped).
5. **These docs** — a record, not a spec; they follow the code.

> The e2e test-plan files (`apps/web/e2e/test-plan/*.md`) are a separate, **older** source documenting an earlier build. Do **not** use them as the authority for what exists now; when they conflict with the marketing docs, the marketing docs are more current.

Verify against the live app where you can (dev login → target page) or by reading the rendering source; don't document from the ticket alone. When you do a live browser pass or a source pass for an area, record what you observe in `existing-features-references/live/<area>.md` or `.../raw/<area>.md` respectively — that capture is the evidence you reconcile into the numbered `final/` and `plain/` files.

---

## Update process

For each affected area, update the **four maintained files** (two pairs):

1. `existing-features-references/final/XX-*.md` (technical detail)
2. `existing-features-technical.md` → section `2.XX` (technical detail; must agree with #1)
3. `existing-features-references/plain/XX-*.md` (plain language)
4. `exhisting-features-marketing.md` → section `X` (plain language; must agree with #3)

Plus refresh the capture layers when you re-verify an area:

5. `existing-features-references/live/<area>.md` — when you do a fresh **live browser** pass
6. `existing-features-references/raw/<area>.md` — when you do a fresh **source** pass

And update the auxiliary surfaces when they apply:

7. `outbound-contact-surfaces.md` — **only** if a new outbound / sharing / contact surface was added or an existing one's input methods / channels / options changed.
8. `ui-interaction-details.md` — **only** if a documented micro-interaction / motion / layout convention / console UI changed (or a new one worth recording landed).
9. `INCORPORATED.md` — when working from a Linear ticket: check it **first** to skip already-covered tickets, and append a row for the ticket you processed (Status · Disposition · Areas · notes).

Steps:
1. Read the ticket (description + comments). Check `INCORPORATED.md` — skip if already reconciled.
2. Identify affected area file(s).
3. Read the current content in those files.
4. Verify against the live app / source (per the hierarchy); record fresh observations in `live/`/`raw/` as needed.
5. **Replace** outdated content — do **not** append `UPDATE:` blocks, changelog entries, or "as of DIO-xxxx" notes. The docs describe the present state only.
6. Verify pair consistency: the technical file (`final/XX`) agrees with `existing-features-technical.md` §2.XX; the plain file (`plain/XX`) agrees with `exhisting-features-marketing.md` §X; counts and names match across the technical/plain pair.
7. Update `outbound-contact-surfaces.md` / `ui-interaction-details.md` if the change touched them, and append the ticket row to `INCORPORATED.md`.

When **multiple areas** are affected, you may fan out **one sub-agent per area** (via `Agent`) — but give each agent disjoint area files so they don't collide. The two assembled documents (`existing-features-technical.md`, `exhisting-features-marketing.md`) are shared: each area edits a different section (`2.XX` / `X`), so if agents race on the same assembled file, serialise those section edits in a final pass. Use `TaskCreate`/`TaskUpdate` to track areas.

---

## Content standards

### Technical register — `existing-features-technical.md` + `final/*.md`

**Include:** component names (e.g. `CompanyProfileForm`, `DocumentPicker`); route paths (e.g. `/workflows/[id]`, `?settings=profile`); GraphQL operation names (queries/mutations/subscriptions); field names and types; **exact** error/toast copy in quotes; validation rules (required fields, formats, limits); loading/empty/error states with exact copy; accessibility attributes (roles, aria labels); permission model (which guards, which roles); state machines (status enums, transitions); known behaviours and bugs (with root cause when known).

**Do NOT include:** implementation advice or recommendations; inline source-code blocks; speculative future features; opinions on quality or design.

**Structure per section:** Overview (what it is, who uses it, where it lives) · Pages and routes table · Features (bulleted, grouped) · Interfaces (modals/drawers/panels/menus with field-level detail) · Interactions and logic (what happens on click/submit, sequencing) · States and validation · Permissions and visibility · Data and queryability (what durable records are produced, what the chat agent can answer) · Known behaviours.

### Plain register — `exhisting-features-marketing.md` + `plain/*.md`

**Include:** what the user sees (headings, buttons, lists, cards described visually); what happens when they interact (click, type, toggle, drag); what feedback they get (confirmations, warnings, errors in plain terms); empty/loading states in user terms; who can use it (roles in plain language); known quirks as user-observable behaviour.

**Do NOT include:** component names, file paths, route paths; GraphQL operations or API endpoints; field types, schema names, database details; technical root causes of bugs; accessibility attributes or aria labels; state-machine terminology; any word a non-developer would need to look up.

**Style rules:** second person ("you see", "you click"); say "pane/section/card/button/link", not "component/resolver/mutation"; describe errors as "a message appears saying…", not "renders an Alert with status=error"; **no em dashes** (use commas, full stops, or colons); **no emojis**; **headings in sentence case**.

**Structure per section:** Brief intro (what it is, who uses it, where it lives) · subsections by page or major feature · each subsection: Purpose · What you see · What you can do · States and feedback.

---

## Quality checks (before a section is complete)

1. **Accuracy** — matches the live app / source. Planned-but-unreleased features are clearly marked as such.
2. **Completeness** — every interactive element, every state (loading/empty/error/success), every permission boundary.
3. **No leaks** — technical files carry no opinions; plain files carry no code terms.
4. **Consistency** — the same feature is described at the same scope across the technical and plain docs. If the technical file says "6 segment options", the plain file also says 6.
5. **Currency** — when a ticket supersedes an earlier one (e.g. DIO-4761 superseded DIO-4760 on workflows), the earlier description is **replaced, not accumulated** alongside.

---

## Done criteria

- The affected area's four maintained files are updated: `final/XX`, `existing-features-technical.md` §2.XX, `plain/XX`, `exhisting-features-marketing.md` §X (plus any `live/`/`raw/` capture you refreshed).
- The technical pair agrees; the plain pair agrees; counts and names match across the technical/plain pair.
- `outbound-contact-surfaces.md` and `ui-interaction-details.md` updated if the change touched them; `INCORPORATED.md` has a row for the ticket processed.
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
document the new presentation studio in the technical + marketing feature docs
```
```
sync existing-features-technical.md and the marketing guide with what shipped on workflows
```
```
document the new survey distribution surface (and outbound-contact-surfaces.md)
```
