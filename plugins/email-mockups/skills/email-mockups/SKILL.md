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
  features-build/plain, and the React mock UI in apps/web-design-system and the
  customer-mobile / investor-mobile design systems), builds impression-not-replica
  graphics (a rich product-surface vignette by default, plus soft panel + peeking
  device, collage/overlap, phone bezel, and a website frame only when the feature is a
  public site) as titled, spaced artboards in one self-contained HTML file — built via
  the design-craft skill on the live Diolog tokens — verifies the render, then
  recreates the layout in Figma via whatever write-capable Figma MCP is connected.
  If no Figma MCP is available, the HTML file is retained as the final deliverable.
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
scope → gather context → plan the set → build the HTML (via design-craft)
      → verify the render → build in Figma → deliver
```

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
2. **The real layout** — the React mock UI: `apps/web-design-system/pages|patterns`
   for web; the `design-system/screens` + `design-system-web` registries for the two
   mobile islands. ⚠️ The mobile apps use their **own** section numbering — map a
   feature to screens via each app's `doc/sections.ts` and screen `meta`, never by
   assuming the guide's numbers carry over.
3. **The design spec + tokens** — `DESIGN.md` at the repo root is the canonical
   design authority (palette, type, the one-accent / two-blue rules, radii,
   shadows, component inventory, voice). Read the relevant parts so the mock obeys
   the system; the token *values* are already baked into the kit, but confirm
   nothing has drifted in `DESIGN.md` / `apps/web-design-system/tokens/tokens.css`.

Do these reads concurrently. The goal is that your graphic reads like the real
feature — real labels, the real hero element — without copying it pixel-for-pixel.

## 3. Plan the set

Read **`references/mockup-playbook.md`** — it's the brief. Then, per feature:

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
- **Choose the treatment.** Default to a **product-surface vignette** (the feature
  region itself, no browser chrome). Use the **soft panel + peeking device** to
  *announce* a feature, **collage/overlap** to drop a finding tile onto the surface it
  acts on, a **phone bezel** for mobile, and a **website frame** *only* when the thing
  literally is a public website (e.g. a generated investor portal). Avoid the browser
  frame as a generic "this is the web app" wrapper.
- **Pick the board** colour and **size it tight** to the content (the playbook gives the
  sizes that survive email downscaling).

Offer a small, deliberate mix rather than many near-duplicates, and keep one demo
identity (Flight Centre) across the set.

## 4. Build the HTML — via the design-craft skill

The actual HTML artifact is built with the **design-craft** skill (the opinionated,
slop-resistant designer). Invoke it (`design-craft:design-craft`) for the build,
and hand it a complete brief so it builds autonomously without re-interviewing:

- **The constraints** — point it at `references/mockup-playbook.md` (impressions not
  replicas, but rich not bare; lead with the wow/payoff; no marketing copy, explainers
  or disclaimers inside the graphic — only real product chrome text; product-surface by
  default, browser frame only for real public websites; collage a finding tile onto the
  surface it acts on; the real Diolog logo; tokens; type; voice; framing hygiene; sizes)
  as non-negotiable.
- **The kit** — `assets/mock-kit.css` (Diolog tokens under `--dio-` names + the
  primitive classes, including the `.dio-logo` lockup that uses the bundled real mark
  `assets/diolog-icon.svg` — never fake the logo with a letter box) and
  `assets/artboard-template.html` (the self-contained shell with the fonts `<link>`,
  worked examples of the treatments, and a placeholder to inline the kit). Tell it to
  **start from the template, inline the full mock-kit into the `<style>` block** (single
  self-contained file — there is no build step), and compose each mock from the kit
  classes.
- **The content** — the per-feature context you gathered in step 2 (real labels,
  on-brand phrases, the hero element, the layout to evoke and what to ghost).
- **The output shape** — one HTML file, one `<figure class="dio-artboard">` per
  graphic, each titled (the title becomes the Figma frame name), laid out in the
  `.dio-canvas` grid. Save it to a sensible path (e.g.
  `email-mockups-<feature>.html` in the working directory, or a path the user gave).

design-craft brings the craft (hierarchy, rhythm, polish, its own verifier passes);
this skill supplies the system and the truth. Keep it inside the kit — this is
"recreate within an existing system", which is low-ambiguity, so design-craft should
not invent new tokens, shadows, or a second blue.

## 5. Verify the render

Open the HTML in a browser and screenshot it (use the `playwright-cli` or
`agent-browser` skill, or the Chrome MCP). Check against the playbook's quality bar:
the one idea is obvious at 50% size; every colour is a `--dio-` token with no stray
blues; the serif is never bolder than 600; sentence case; no emoji; nothing
important is clipped by a panel's bottom edge; the copy is the feature's real,
short, on-brand words. Fix drift before going to Figma.

## 6. Build in Figma

Read **`references/figma-build.md`** and follow it. In short: discover the connected
Figma MCP via `ToolSearch` (query `figma`), and check it can **write** (create
nodes), not just read. A write-capable bridge (the "Talk to Figma" family) drives
the open Figma document; the read-only Dev Mode / Framelink servers cannot create
frames and count as "no Figma MCP" here.

- **Write-capable MCP present** → recreate each artboard as a titled, spaced frame on
  the canvas, faithful to the HTML (exact fills, radii, shadows, fonts, text). Screenshot
  and reconcile.
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

- `references/finding-feature-context.md` — where the feature docs and React mock UI
  live across web + the two mobile islands, and the section-numbering gotcha.
- `references/mockup-playbook.md` — the impressions-but-rich brief: lead with the wow,
  no marketing copy inside the graphic, the framing treatments (product-surface default,
  soft panel, collage, phone, website-only browser), the real logo, tokens, type, voice,
  framing hygiene, and sizes. Hand this to design-craft.
- `references/figma-build.md` — discovering a write-capable Figma MCP and building
  the canvas tool-agnostically.
- `assets/mock-kit.css` — Diolog tokens (`--dio-`) + mock primitives, including the
  `.dio-logo` lockup and a `.dio-collage` overlap helper. Inline into the output HTML.
- `assets/artboard-template.html` — self-contained starting shell with worked examples
  of the treatments (product-surface default, soft panel, collage, website-only browser).
- `assets/diolog-icon.svg` — the real Diolog brand mark; the `.dio-logo` lockup
  references it. Never substitute a letter-in-a-box.
