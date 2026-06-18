# Finding a feature's real context

Before you draw anything, gather three kinds of source so the mockup is truthful —
the right copy, the right layout, the right place in the product. All paths are
relative to the **dAIolog repo root** (the skill runs from wherever the user
invokes it; if you're not in the repo, ask for the repo path or locate it).

The whole point of this step is that the graphic should look and *read* like the
real feature — real labels, real on-brand phrases, the real shape of the screen —
not an invented approximation. Pull words and structure from these sources; do
not make up capabilities the feature doesn't have.

---

## Source 1 — plain-English description (what the feature is, in words)

`docs/marketing/product-feature-guide.md` is the master guide, split into numbered
sections (1 Authentication, 2 Dashboard, 3 AI Chat, 4 Smart Inbox, 5 Documents,
6 Calendar, 7 Disclosure Consistency, 8 Perception Studies, 9 Sentiment, …).
Grep its headings to find the feature's section, then read it for the plain story.

`docs/marketing/features-build/plain/NN-*.md` carries the same areas in more
detail, one file per area:

```
01-auth  02-dashboard  03-chat  04-inbox  05-documents  06-calendar  07-disclosure
08-perception  09-sentiment  10-social  11-surveys  12-workflows  13-widgets
14-portals  15-settings  16-profile  17-help  18-admin  19-crosscutting
20-ai-memory  21-presentation-studio
```

These files give you: the exact on-screen labels ("Select a conversation",
"View archived", "Inbox clear"), the real states, and the on-brand phrasing
("on the record", "drafted reply", "consistent with record", "deserves a look").
Lift your mockup copy from here.

> The plain docs intentionally avoid jargon. For component/route detail you'd use
> `features-build/final/NN-*.md`, but for mockups the plain files are the better
> read — they're written the way the email should sound.

---

## Source 2 — the React mock UI (what it looks like + where it sits)

This is how the feature is actually laid out and styled. Read the relevant
mock(s) to see the real composition — what's the hero element, what surrounds it,
what the spacing and hierarchy are. You're not copying it pixel-for-pixel; you're
learning what to ghost and what to make the hero.

### Web app (companies / IR team) — `apps/web-design-system/`

Feature-named, no numbering puzzle:

- `pages/*.stories.tsx` — full page compositions: `dashboard`, `inbox`,
  `conversations`, `documents`, `social-monitoring`, `workflows`,
  `ai-configuration`. Start here for a web feature.
- `patterns/*.tsx` — reusable composed structures you'll reuse in the mock:
  `page-header`, `card-with-tabs`, `chat-message`, `detection-banner`,
  `stat-card`, `empty-state`, `status-badge`, `search-field`, `chart-card`,
  `split-button`, `modal-shell`, `drawer-shell`.
- `primitives/` — buttons, badges, inputs.

### Mobile — two separate apps, each its own island

- **Customer mobile** (the IR-professional / issuer-staff app, `com.diolog.ir`):
  `apps/customer-mobile/design-system/` and `apps/customer-mobile/design-system-web/`
- **Investor mobile** (the consumer investor app, `com.diolog.app`):
  `apps/investor-mobile/mobile/design-system/` and
  `apps/investor-mobile/mobile/design-system-web/`

Both share the same layout:

```
design-system/
  screens/      S<section>_<n>.tsx   — full phone screens, each exports `meta`
  composites/   AlertCard, AnalysisCard, InboxRow, TaskCard, VerdictCard, …
  elements/     Button, Card, SegmentedControl, SectionHeader, StatusDot, …
  chrome/       Screen, TabBar, StatusBar
  primitives/   Text, …
  tokens/       color / space (RN token objects)
design-system-web/src/
  doc/sections.ts   — the section taxonomy (number → name + headline + lede)
  registry.ts       — auto-generated list of every screen + its meta
  nav/graph.ts      — how screens connect
```

### ⚠️ The numbering gotcha — do NOT assume section numbers line up

The mobile screen IDs (`S4_1`, `S6_2`, …) are numbered by **that app's own
taxonomy**, which is *different* from the product-feature-guide's numbering and
*different between the two mobile apps*. For example, in customer-mobile,
section 4 is **"Alerts & monitoring"** and section 6 is **"Intelligence"** —
nothing to do with the guide's "4 Smart Inbox / 6 Calendar".

So to find a feature's screen(s) in a mobile app:

1. Read that app's `design-system-web/src/doc/sections.ts` — it maps each section
   number to a human name, headline and lede. Match your feature to a section by
   meaning, not by number.
2. Read `registry.ts` (or list `design-system/screens/` and skim each file's
   `meta = { id, section, title, subtitle, register }`) to find the screens in
   that section.
3. Open the matching `screens/S*.tsx` and the `composites/`/`elements/` it imports
   to see the real layout. `meta.register` (`light`/`dark`/`royal`) tells you the
   screen's ground — useful for choosing the board colour.

---

## Source 3 — the design spec + live tokens (the exact colours/type/shadows)

**`DESIGN.md` at the repo root is the canonical design authority** — the "vibe",
the palette, typography (Newsreader / Inter / JetBrains Mono), the one-accent and
two-blue rules, radii, shadows, the component inventory, and the voice. Read the
relevant parts before you build; it is the source of truth that the mockup must
not contradict. Treat `DESIGN.md` (and its companion `COMPONENTS.md`) as the spec
and everything else as an implementation of it.

`apps/web-design-system/tokens/tokens.css` holds the as-built token *values*. The
mock-kit (`assets/mock-kit.css`) already carries these values under `--dio-` names.
Before shipping, glance at `DESIGN.md` / the live tokens and confirm nothing has
drifted (especially the accent and the state colours for the feature you're
showing). If it has, update your generated copy — the kit values must stay equal
to the canonical ones.

The mobile apps carry their own `theme/flowTokens.ts` (generated from the same
`libs/design-tokens` source), so the hex values match the web tokens — you don't
need a second palette.

---

## Working out the audience

A feature can appear in one, two, or all three surfaces. Decide which to mock by
where the feature actually exists:

- In `apps/web-design-system/pages|patterns` → **web** (companies / IR team).
- In a `apps/customer-mobile` section → **IR pro on mobile**.
- In a `apps/investor-mobile` section → **investor mobile**.

If the user named the audience, honour it. If not, mock the surface(s) where the
feature lives, and lead with the one that best tells the story (the consumer
investor app for investor-facing features; the web app for IR-workbench features).
When in doubt between two, build one of each rather than guessing.
