---
name: email-mockups
description: >-
  Build email-ready product-mockup graphics for one or more named Diolog features
  and place them on a Figma canvas, for product-update and marketing emails. Use
  this whenever someone wants product mockups, representations, graphics, or
  visuals of a feature for an email, newsletter, or product update — e.g. "create
  email mockups for the question composer", "I need a product-update email graphic
  for the disclosure consistency checker", "make a figma mockup of the smart inbox
  for the investor email", "mock up the new calendar feature for the companies
  email", or any "visual / graphic / representation of <feature> for an email"
  request — even if they don't say "mockup" or "Figma" explicitly. The skill reads
  the feature's real context (docs/marketing/product-feature-guide.md,
  features-build/plain, and the rendered mock UI read in a browser via playwright-cli
  — the served web / customer / investor design-system hosts), builds
  impression-not-replica graphics (a rich product-surface vignette by default, plus
  soft panel + peeking device, collage/overlap, phone bezel, and a website frame only
  when the feature is a public site) as titled, spaced artboards in one self-contained
  HTML file — designed and built via the design-craft skill (engaged from planning
  through build) on the live Diolog tokens — verifies the render, then recreates the
  layout in Figma via whatever write-capable Figma MCP is connected. If no Figma MCP
  is available, the HTML file is retained as the final deliverable.
---

# Email mockups

You turn a marketing manager's "make a graphic for the email about feature X" into
**email-ready product-mockup graphics on a Figma canvas** — Diolog-true, legible at
email scale, and faithful to how the feature actually looks.

The deliverable is impressions, not replicas: graphics that convey the idea/impact
of a feature at a glance, the way the little device graphic in the existing
product-update email does — not pixel-dense product shots. You build them on the
real Diolog design system, using the feature's real words and layout, then take
them into Figma.

## The pipeline

```
scope → gather context → design the set (plan + build the HTML, via design-craft)
      → verify the render → build in Figma → deliver
```

design-craft is engaged from the *planning* stage, not just handed a finished
plan to render — deciding what earns a graphic and which payoff to hero is design
judgment. This skill supplies the domain truth (the rendered mock UI, the feature's
real words) and the playbook constraints; design-craft supplies the craft.

Use a todo list to track these — the Figma step in particular is easy to drop.

---

## 1. Scope the request

Establish, from the user's message: **which feature(s)**, and **which audience(s)** —
web (companies / IR team), the IR-professional mobile app (customer-mobile), and/or
the investor mobile app. A feature can belong to more than one surface.

Most requests name the feature(s). If audience is unspecified, you'll resolve it in
step 2 from where the feature actually lives — don't ask yet. Only ask a
consolidated round of questions (use `AskUserQuestion`) if something material is
genuinely ambiguous: which feature is meant, how many graphics, or a treatment the
user clearly cares about. Otherwise pick sensible defaults and note them — a couple
of graphics per feature with a mix of treatments is a good default.

If you're not inside the dAIolog repo, find it or ask for its path — all the source
material lives there.

## 2. Gather the feature's real context

Read **`references/finding-feature-context.md`** and follow it. In short, for each
feature collect three things:

1. **The plain story** — `docs/marketing/product-feature-guide.md` (find the
   section) and `docs/marketing/features-build/plain/NN-*.md`. This gives you the
   real on-screen labels and the on-brand phrasing to put in the graphic.
2. **The real layout** — the **rendered** mock UI, read in a browser via
   `playwright-cli`: `http://web.diolog.mock/preview/preview.html` (web — click the
   sidebar item), `http://customer.diolog.mock/` and `http://investor.diolog.mock/`
   (mobile — switch to Storyboard). Lift the real structure, labels and hierarchy
   from the actual DOM, and grab a screenshot to hand design-craft. The `.tsx` source
   under `apps/web-design-system` and the two `apps/*-mobile` islands is the index for
   *which* screen a feature is — and the fallback if a host is down. ⚠️ The mobile
   apps use their **own** section numbering — match by meaning, never by assuming the
   guide's numbers carry over. `references/finding-feature-context.md` has the hosts,
   the playwright-cli commands and the numbering gotcha.
3. **The design spec + tokens** — `DESIGN.md` at the repo root is the canonical
   design authority (palette, type, the one-accent / two-blue rules, radii,
   shadows, component inventory, voice). Read the relevant parts so the mock obeys
   the system; the token *values* are already baked into the kit, but confirm
   nothing has drifted in `DESIGN.md` / `apps/web-design-system/tokens/tokens.css`.

Do these reads concurrently. The goal is that your graphic reads like the real
feature — real labels, the real hero element — without copying it pixel-for-pixel.

## 3. Plan the set — bring in design-craft

Read **`references/mockup-playbook.md`** — it's the brief. Deciding *what* each
graphic should be is design judgment, not just domain knowledge, so engage
**design-craft** (`design-craft:design-craft`) here, at the *thinking* stage —
not only to render a finished plan in step 4. Its content and quality principles
(every element earns its place; one clear idea; lead with the payoff, not the
plumbing; quality over quantity; anti-AI-slop) are exactly the lens for choosing
the set. Work the decisions below through that lens — they become the brief
design-craft builds from. Per feature:

- **Decide whether the feature even earns a graphic.** Not every feature has a visual
  "wow". Some — a what's-new panel, an install step, a settings toggle people already
  understand — are better described in the email copy than mocked. If a feature has no
  legible, impressive visual, skip it, merge it into a related graphic, or flag it to
  the user; don't pad the set with weak mockups. And don't over-scale a feature people
  already get (an admin console reads better as one small surface with a toggle than a
  full dashboard).
- **Pick the wow** — the single most impactful element each graphic heroes: the
  *result* the feature produces, not its generic UI. When the wow is an effect on
  something else, plan to show that something and the feature acting on it (the
  playbook's golden rule has the detail).
- **Choose the register, then the treatment** (playbook §4). For any **hero web
  feature**, default to the **product window** — a clean browser window wrapping the
  *complete* app shell (rail + real wordmark + one lit nav item + company switcher +
  avatar) with a big, substantive hero. This is the premium register the best reference
  sets use: a thin sliver reads as a fragment, a full app reads as the product. For
  *secondary or genuinely thin* features (an install step, a toggle), drop to the
  **compact impression** (frameless vignette). Then layer the techniques: **soft panel +
  peeking device** to *announce*, **collage/overlap** to drop a finding tile onto the
  surface it acts on, a **phone bezel** (full, rich screen) for mobile, and a **public
  website frame** only when the thing literally is a public site (a generated investor
  portal — the tailored URL is the story).
- **Make the product look smart — the copy is the wow** (playbook §2). The hero must show
  a real, *specific* IR insight or result, not lorem chrome: the actual finding with real
  numbers and a real tension, an italic quote from the company's record, named source
  chips ("FY25 results · p.12"), the real assistant persona (Guardian). If the copy could
  be swapped onto any other SaaS unnoticed, it isn't done.
- **Pick the board** colour and **size it tight** to the content (the product window is
  large by design, ~900–1000 wide; compact impressions stay small — the playbook gives
  both registers' sizes).
- **Write the under-mock caption.** Evaluate what the feature *does for the customer* and
  distill a brief, non-technical benefit for **IR teams and the third-party IR agencies who
  serve them** — it becomes the `.dio-artboard__note` *under* the mock (a Figma sub-label),
  never copy on the product surface. Plain voice, sentence case, **no em/en-dashes** — draw it
  from the feature's plain story (`features-build/plain`). Playbook §2 has the rule.
- **Decide the format.** The default is a **clean product shot** (the registers above), each
  carrying its under-mock caption. When the user wants a *ready-to-drop hero image*, also offer
  the **email-hero (split)** — the same clean product surface beside a copy column (headline +
  one-line benefit) on the liquid-navy ground (playbook §4); there the benefit lives in the
  column, so no separate caption.

**Account for every feature, and scale to the ask.** For a multi-feature release, keep a
**coverage ledger** — map *each named feature* to mocked / folded-into-another /
described-in-copy, and check none is silently dropped (the flagships especially — it's easy to
lose one reasoning feature-by-feature). "One graphic per viable feature" lands ~15–18 for a big
release; "a curated hero set" lands ~8 — confirm which the user wants. For any set beyond a few
graphics, **read `references/building-and-verifying.md`**: it's the harness for the ledger, the
parallel doc-research + build fan-out, the assembly, and the verification lint.

Offer a small, deliberate mix rather than many near-duplicates, and keep one demo
identity (Flight Centre) across the set.

## 4. Build the HTML — continue with design-craft

The actual HTML artifact is built with the **design-craft** skill (the opinionated,
slop-resistant designer) you already engaged for the planning in step 3. Carry that
through to the build — hand design-craft a complete brief so it builds autonomously
without re-interviewing, and let it run its own workflow (skeleton → build → its
ai-slop / polish passes) over it:

- **The constraints** — point it at `references/mockup-playbook.md` (impressions not
  replicas, but rich not bare; lead with the wow/payoff; **for hero web features build the
  full product window — clean browser chrome + the complete app shell — §4A**; make the
  **copy substantive and specific — a real insight, an italic quote, named source chips —
  §2**; no marketing copy, explainers or disclaimers — only real product chrome text;
  collage a finding tile onto the surface it acts on; **no coloured left-only borders** (the
  AI-slop tell — semantic emphasis is a soft wash + an icon tile + a chip); **inline-SVG icons,
  never icon-font ligatures** (so the PNG export rasterises them); a brief **under-mock
  marketing caption** per clean shot (`.dio-artboard__note`, no em/en-dashes); the real Diolog
  logo; tokens; type; voice; framing hygiene; the two sizing registers) as non-negotiable.
- **The kit** — `assets/mock-kit.css` (Diolog tokens under `--dio-` names + the
  primitive classes: the `.dio-logo` lockup that uses the bundled real mark
  `assets/diolog-icon.svg` — never fake the logo with a letter box; the **`.dio-appshell`
  product-window shell** + `.dio-navitem` / `.dio-coswitch`; and the substance helpers
  `.dio-persona` / `.dio-quote` / `.dio-source` / `.dio-statbig`) and
  `assets/artboard-template.html` (the self-contained shell with the fonts `<link>` and
  worked examples — **example 0 is the product window**, the premium default). Tell it to
  **start from the template, inline the full mock-kit into the `<style>` block** (single
  self-contained file — there is no build step), and compose each mock from the kit
  classes.
- **The content** — the per-feature context you gathered in step 2 (real labels,
  on-brand phrases, the hero element, the layout to evoke and what to ghost).
- **The output shape** — one HTML file, one `<figure class="dio-artboard">` per
  graphic, each titled (the title becomes the Figma frame name) and captioned underneath
  with its `.dio-artboard__note`, laid out in the `.dio-canvas` grid. Save it to a sensible
  path (e.g. `email-mockups-<feature>.html` in the working directory, or a path the user gave).
- **At scale** — for a dozen-plus artboards, don't build them in one pass (one agent
  hand-writing 15+ artboards drifts and is slow). Per `references/building-and-verifying.md`:
  write one **master brief** all builders read, fan out **parallel builders that each write
  their own fragment file**, then **assemble** (template head + the full kit inlined + the
  fragments concatenated). Separate fragment files per agent avoid the shared-file write
  conflict; the one master brief keeps the fanned-out set cohesive.

design-craft brings the craft (hierarchy, rhythm, polish, its own verifier passes);
this skill supplies the system and the truth. Keep it inside the kit — this is
"recreate within an existing system", which is low-ambiguity, so design-craft should
not invent new tokens, shadows, or a second blue.

## 5. Verify the render

Open the HTML in a browser and screenshot it (use the `playwright-cli` or
`agent-browser` skill, or the Chrome MCP). This is design-craft's `ai-slop-check` /
`polish-pass` territory — if design-craft built it, let it run those — and then
check against the playbook's quality bar: the one idea is obvious at 50% size;
every colour is a `--dio-` token with no stray blues; the serif is never bolder
than 600; sentence case; no emoji; **no coloured left-only borders**; nothing important is
clipped by a panel's bottom edge; the copy is the feature's real, short, on-brand words; and
every clean shot carries a `.dio-artboard__note` with **no em/en-dashes**. A fast **source
lint** (grep the assembled file for emoji, banned puffery, `#007AFF`, serif-bold,
`border-left` stripes, em-dashes inside notes, and stray non-token hex) catches the mechanical
slop before the visual pass — `references/building-and-verifying.md` has the exact checks plus
the playwright-cli gotchas (serve over http, `--filename`, per-figure `nth-of-type` capture).
Fix drift before going to Figma.

## 6. Build in Figma

Read **`references/figma-build.md`** and follow it. In short: discover the connected
Figma MCP via `ToolSearch` (query `figma`), and check it can **write** (create
nodes), not just read. A write-capable bridge (the "Talk to Figma" family) drives
the open Figma document; the read-only Dev Mode / Framelink servers cannot create
frames and count as "no Figma MCP" here.

- **Write-capable MCP present** → recreate each artboard as a titled, spaced frame on
  the canvas, faithful to the HTML (exact fills, radii, shadows, fonts, text), **plus the
  under-mock marketing caption as a text node below each frame** (the `.dio-artboard__note`).
  Screenshot and reconcile.
- **No write-capable MCP** → stop the Figma step cleanly. Do not fake it.

## 7. Deliver

- **Figma build succeeded** → tell the user where the frames are (each exports a PNG
  for the email), then **delete the intermediate HTML file** — it was scaffolding.
- **No Figma MCP available (or the build couldn't complete)** → **retain the HTML
  file as the final deliverable.** Tell the user it's the output and that each
  artboard exports a PNG; mention that connecting a write-capable "Talk to Figma" MCP
  would let the skill build the canvas directly next time.

Either way, close with caveats and next steps only — these are visual references for
emails, not production email HTML.

---

## Bundled resources

- `references/finding-feature-context.md` — the served mock hosts (web / customer /
  investor) and how to read their rendered HTML via playwright-cli, where the feature
  docs and `.tsx` source live across web + the two mobile islands, and the
  section-numbering gotcha.
- `references/mockup-playbook.md` — the impressions-but-rich brief: lead with the wow,
  no marketing copy on the product surface, the brief under-mock caption (no em/en-dashes),
  no coloured left-only borders, inline-SVG icons, the framing treatments (product-surface
  default, soft panel, collage, phone, website-only browser, and the optional email-hero
  split), the real logo, tokens, type, voice, framing hygiene, and sizes. Hand this to design-craft.
- `references/building-and-verifying.md` — the harness for a *large* set: the feature
  coverage ledger, the parallel doc-research + build fan-out (one master brief → per-agent
  fragment files → assembly), the deterministic verification lint, and the playwright-cli
  gotchas. Read it whenever the set is more than a few graphics.
- `references/figma-build.md` — discovering a write-capable Figma MCP and building
  the canvas tool-agnostically.
- `assets/mock-kit.css` — Diolog tokens (`--dio-`) + mock primitives: the `.dio-logo`
  lockup, the `.dio-appshell` product window, the `.dio-collage` overlap helper, the
  wash-based `.dio-detect` verdict (no left stripe), the under-mock `.dio-artboard__note`,
  and the `.dio-emailhero` split. Inline into the output HTML.
- `assets/artboard-template.html` — self-contained starting shell with worked examples of
  the treatments (product window, vignette, soft panel, collage, website-only browser, and
  the email-hero split), each modelling the under-mock caption.
- `assets/diolog-icon.svg` — the real Diolog brand mark; the `.dio-logo` lockup
  references it. Never substitute a letter-in-a-box.
