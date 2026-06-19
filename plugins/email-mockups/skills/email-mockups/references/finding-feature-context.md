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

## Source 2 — the rendered mock UI (what it looks like + where it sits)

This is how the feature is actually laid out and styled. **Read the *rendered*
mock, not the raw `.tsx`.** Open the live design-system host in a browser with
`playwright-cli` (or `agent-browser` / the Chrome MCP) and lift the real
structure, copy and hierarchy from the actual DOM. The rendered HTML is the
truthful source — it shows the composed screen with real demo data, the actual
spacing, and the real hero element — whereas raw JSX makes you reconstruct the
layout in your head and miss what the screen really emphasises. You're learning
**what to ghost and what to make the hero**, not copying pixel-for-pixel.

The three surfaces are each served as a self-contained mock app behind the local
Caddy:

| Surface | Host | Reaching a feature |
|---|---|---|
| **Web** (companies / IR team) | `http://web.diolog.mock/preview/preview.html` | SPA with a left sidebar — Home, Conversations, Knowledge Base, Inbox, Tasks, Agents, Calendar, Workflows, Presentations, FAQs, Widgets, Surveys, Chatter, Investor Portal, Investor access, Settings, Admin. **Click the sidebar item** for your feature and wait for the re-render — routing is internal React state, so the URL never changes and there is no hash deep-link — then read the main content region. |
| **Customer mobile** (IR-pro app, `com.diolog.ir`) | `http://customer.diolog.mock/` | Two modes via a toggle at the top: **Interactive app** (a tap-through with a bottom tab bar — Home, Ask, Inbox, More, Search) and **Storyboard · N screens** (every screen rendered at once, grouped by section with a one-line lede each). |
| **Investor mobile** (investor app, `com.diolog.app`) | `http://investor.diolog.mock/` | Same two modes; the investor tabs are Discover, Following, Inbox, Profile. |

**For mobile, switch to Storyboard** — it renders every screen on one page, each
section labelled with its human lede ("Sentiment, perception and
disclosure-consistency analyses", "Disclosures, announcements and delivery
metrics", …), so you can find your feature's screen by meaning and read its real
composition in one shot. Use the Interactive app mode when you need a screen's
live state or to see how you arrive at it.

### Driving it with playwright-cli

`open` the host, drive the SPA to the feature, then pull what you need — the
rendered DOM (`snapshot` / `eval`) for structure and copy, and a `screenshot` for
a visual reference design-craft can build against:

```bash
# Web — open, find the nav item's ref, click it, then read the rendered page
playwright-cli open http://web.diolog.mock/preview/preview.html
playwright-cli snapshot                       # find the sidebar item's ref (e.g. e34 "Inbox")
playwright-cli click <ref-of-Inbox>           # switches the React view — wait a beat for re-render
playwright-cli snapshot                       # the rendered Inbox page: labels, structure, hierarchy
playwright-cli screenshot inbox.png           # a visual reference of the real surface

# Mobile — open, switch to Storyboard, screenshot the section you need
playwright-cli open http://customer.diolog.mock/
playwright-cli snapshot                        # find the "Storyboard · N screens" toggle ref
playwright-cli click <ref-of-Storyboard>
playwright-cli screenshot customer-storyboard.png
```

`playwright-cli eval "() => document.querySelector('main')?.innerText"` pulls the
real on-screen copy verbatim — the labels and microcopy your graphic should echo.
Prefer `--raw snapshot` / `--raw eval` when piping the output elsewhere.

### Capture two things the premium register needs

The new default treatment is the **product window** — the feature inside the *complete*
app shell — and its hero is a *substantive* interaction, not a generic placeholder (see
the playbook §4A and §2). So when you read the rendered mock, deliberately capture:

1. **The app-shell structure** — the real left-rail nav order (so you know which item is
   lit and which to ghost), the top-bar layout (company switcher, search/bell, avatar),
   and the route/URL (`app.diolog.com/<area>`). This is what makes the window read as the
   real product. You can pull exact structure and even computed spacing for a region with
   `playwright-cli eval` on the element's `outerHTML` / `getComputedStyle` if you want the
   rebuild structurally true — but you are still *rebuilding on the kit*, not scraping the
   DOM into the output.
2. **A real, specific example of the feature producing value** — an actual question and a
   smart answer, a real verdict with its reasoning, a real number with its source. Lift
   the *substance* (the kind of insight, the real document names, the real figures), then
   write the hero copy at that level of specificity. A graphic whose hero copy is generic
   ("Draft an announcement") wastes the best lever you have; one that shows the product
   being genuinely smart is what separates a good set from a best-in-class one.

### If a host isn't reachable

The mock hosts are the shared Docker design-system containers behind the local
Caddy (`*.diolog.mock`). If one 502s or won't load, check the containers are up
(`./scripts/dev-docker.sh status`); if you still can't reach it, fall back to
reading the `.tsx` source (paths below) and tell the user the live mock wasn't
reachable — but prefer the rendered HTML whenever it's up.

### Mapping a feature to its screen — and the source behind the render

Use the source tree to find *which* screen a feature is (especially on mobile,
where the storyboard sections need a name to match against) and as the fallback
when a host is down. The render is the truth for *layout*; these files are the
index and the back-up.

**Web app — `apps/web-design-system/`** (feature-named, no numbering puzzle):

- `pages/*.stories.tsx` — full page compositions: `dashboard`, `inbox`,
  `conversations`, `documents`, `social-monitoring`, `workflows`,
  `ai-configuration`. These are what the preview's sidebar renders.
- `patterns/*.tsx` — reusable composed structures: `page-header`,
  `card-with-tabs`, `chat-message`, `detection-banner`, `stat-card`,
  `empty-state`, `status-badge`, `search-field`, `chart-card`, `split-button`,
  `modal-shell`, `drawer-shell`.
- `primitives/` — buttons, badges, inputs.

**Mobile — two separate islands, each its own taxonomy:**

- **Customer mobile** (`com.diolog.ir`): `apps/customer-mobile/design-system/`
  and `apps/customer-mobile/design-system-web/`
- **Investor mobile** (`com.diolog.app`): `apps/investor-mobile/mobile/design-system/`
  and `apps/investor-mobile/mobile/design-system-web/`

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

#### ⚠️ The numbering gotcha — do NOT assume section numbers line up

The mobile screen IDs (`S4_1`, `S6_2`, …) are numbered by **that app's own
taxonomy**, which is *different* from the product-feature-guide's numbering and
*different between the two mobile apps*. For example, in customer-mobile,
section 4 is **"Alerts & monitoring"** and section 6 is **"Intelligence"** —
nothing to do with the guide's "4 Smart Inbox / 6 Calendar". The storyboard's
section ledes are the human-readable map; match your feature to a section by
**meaning**, then confirm the screens:

1. Read that app's `design-system-web/src/doc/sections.ts` — it maps each section
   number to a human name, headline and lede.
2. Read `registry.ts` (or list `design-system/screens/` and skim each file's
   `meta = { id, section, title, subtitle, register }`) to find the screens in
   that section.
3. The matching `screens/S*.tsx`'s `meta.register` (`light`/`dark`/`royal`) tells
   you the screen's ground — useful for choosing the board colour.

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
