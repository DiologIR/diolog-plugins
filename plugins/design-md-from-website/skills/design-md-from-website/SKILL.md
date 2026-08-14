---
name: design-md-from-website
description: >-
  Generate a spec-compliant DESIGN.md for any live website or company from its real
  pages — the browser-driven successor to design-md-from-screenshots. Give it a URL
  and it uses Obscura to capture MEASURED computed-CSS + HTML/layout +
  full-page screenshots of the key pages (home, about, product/services, contact,
  any investor hub/portal), then synthesises an authoritative DESIGN.md in the
  official google-labs design.md format with provenance labels, and refines it into
  an intentional, upgraded identity. Use whenever the user wants a DESIGN.md, design
  system, design tokens, style guide, or brand snapshot, or to "capture the design /
  vibe / visual language" of a website or company — even if they just paste a URL
  and say "make me a design system for this", "extract the tokens from example.com",
  or "document the brand of this site". Strongly prefer this over
  design-md-from-screenshots whenever a live URL is available: it MEASURES real
  computed styles instead of guessing hexes and fonts from a screenshot.
---

# DESIGN.md from a live website

Produce a single authoritative `DESIGN.md` for a real website by **measuring** its
design, not guessing it. This is the browser-driven, measure-first evolution of the
`design-md-from-screenshots` skill, plus the method behind Diolog's
admin DESIGN.md generator: probe the real pages with a headless browser, read the
**computed CSS** (the authoritative hexes / fonts / radii / spacing), pair it with
full-page screenshots for layout and vibe, synthesise a spec-compliant `DESIGN.md`,
then **refine** it into an intentional, upgraded identity.

**Why measure, not guess:** the single biggest failure mode of screenshot-only
design extraction is a fabricated brand colour or font — three runs produce three
different reds. `getComputedStyle` gives the exact value the site actually renders,
so the palette and type are correct by construction. Screenshots are for hierarchy,
rhythm, imagery and vibe — never for reading a colour a measurement can give you.

## Inputs

- **Required:** a URL (the company's website root, or a specific page).
- **Optional (sharpens the vibe + the refine pass):** product name, a one-line
  pitch, target audience, and — importantly — whether the company is **publicly
  listed / financial** (a stock ticker, investor tables). Infer any of these from
  the site if not supplied; state your confidence.
- **Mode flag:** `faithful-only` — stop after the faithful capture (skip the refine
  pass). Default is **capture-then-refine**.

## Prerequisites

- `obscura` on PATH (`obscura --version`). If it is missing, download the
  `aarch64-macos` release from <https://github.com/h4ckf0r0day/obscura> into
  `~/.local/bin` — it is a single static binary with nothing to install alongside it.
  Full probe-command details are in `references/obscura-probe.md`.
- A working directory for the screenshots + measured-CSS JSON. Anywhere writable is
  fine. Use a repo-relative dir like `.design-md/<host>/`. Keep the artifacts — cite
  where they are in your summary.

## Workflow

Follow these phases in order. Phases 3–4 are the design work; phases 1–2 are the
measurement that makes them correct.

### 1. Discover the key pages

Open one browser and find the pages worth measuring — you want the *representative*
surfaces, not every URL.

- `obscura fetch <url> --eval "<nav-link query>"` to list internal links (see
  `references/obscura-probe.md`).
- **Target set (cap at 6–8):** `home` (always), `about`/`company`, the main
  `product`/`services`/`solutions` page, `contact`, and **any investor hub/portal** —
  look for `investor`, `ir`, `shareholders`, or an `investors.`/`.ir.` subdomain. An
  existing investor hub is the highest-value surface for a financial brand; always
  include it if one exists.
- Pick the most representative page per role; skip near-duplicates and deep leaf
  pages. If a page is **behind a login wall**, note it and skip it (assume-public) —
  never fabricate what you can't see.

### 2. Probe the pages in parallel (≤4 concurrent agents, with backoff)

Spawn **one probe Agent per page**, **≤4 concurrent** — batch a larger set into
waves of ≤4 and await each wave before the next (firing many agents at once trips both
site rate-limits and the agent-API throttle). Obscura itself needs no isolation scheme:
each probe run starts and stops its own browser on its own port, so concurrent agents
cannot clobber each other. Each probe Agent:

- runs `assets/capture-page.mjs --url … --out-png … --out-json …`, which navigates,
  **scrolls to the bottom then back to top** (to trigger lazy-loaded content), and
  produces, in one call:
  1. a **full-page PNG screenshot** → `<workdir>/<slug>.png`. This has to go through
     CDP: `obscura fetch --screenshot` captures the **viewport only** and has no
     full-page flag, so it returns the hero and silently drops every section below the
     fold.
  2. the **measured design tokens** from the probe snippet (`assets/probe.js`) —
     `getComputedStyle` by role (body / h1–h3 / p / a / button / nav / header / footer
     / card / input) → JSON. **This is the authoritative source for every hex, radius,
     and spacing value** — read the spacing LONGHANDS, because Obscura resolves
     `padding`/`margin`/`borderRadius` shorthands to `0px` whatever the element sets.
  3. then one `obscura fetch --eval` for the trimmed **HTML/layout** of
     `header`/`main`/`footer` (structure, grid, spacing) + the font `<link>`s + the
     logo.
- returns a **fixed-shape markdown fragment**: `role`, `url`, screenshot path,
  the measured-CSS JSON, fonts, logo, and 2–3 layout notes.

**Backoff (two kinds):**
- *Website / navigation:* on a timeout, navigation error, or HTTP 429, retry with
  exponential backoff (≈2s → 4s → 8s, ≤3 tries). If it still fails, return a partial
  fragment that **says the page failed** — never invent tokens for it.
- *Agent-API:* if a probe agent's *result* is a "rate limited / temporarily limiting
  requests" string (not a page result), re-run that one in a later wave. Keeping
  waves ≤4 avoids this in the first place.

### 3. Synthesise the faithful DESIGN.md

Now do the design synthesis, following `references/extraction-protocol.md` (the
folded `design-md-from-screenshots` method):

- **Read the screenshots** (they're PNGs on disk — use `Read`) for hierarchy, rhythm,
  imagery, depth, and the one-sentence **vibe** (a peer-reference analogy, e.g.
  *"Komatsu-dealer industrial seriousness with a single safety-red accent"*).
- **Take every colour / size / radius / spacing from the MEASURED CSS JSON** —
  never estimate a value from a screenshot when a measurement exists. **Type is the
  exception:** Obscura loads no web fonts, so the family it renders is a generic
  fallback on every site. Take the type stack from the declared `font-family` string
  and the font `<link>`s, and label it as declared rather than rendered. Cross-reference
  across pages to promote a token's provenance: `(confirmed)` recurs across pages,
  `(inferred)` from a single instance, `(assumed)` you filled a gap.
- **The brand accent comes from the `accents` colour census** (the most-repeated
  saturated colours, measured across the whole page), corroborated by the link colour
  — NOT from the `button` token alone, which on page-builder sites (Elementor/Webflow/
  Wix) often measures a transparent utility element. The top census colour is the
  brand hue; a second distinct saturated colour is often an accidental/legacy accent
  the refine pass should reconcile.
- Emit the document in the **official google-labs design.md format**
  (`references/design-md-spec.md`): YAML frontmatter token maps + the 8 body sections
  + a trailing `<!-- self-critique: … -->`. No Markdown code fence around the whole
  document.

### 4. Refine into an intentional identity (default — skip on `faithful-only`)

Run the capture-then-refine pass per `references/refine-methodology.md`: evolve the
faithful capture into a sharper, intentional identity — converge on one true brand
colour with hover/pressed/tint states, replace accidental off-brand values, build a
warm/cool-consistent neutral ramp + semantic state colours, choose display + body
type deliberately (**add a data monospace if the company is listed/financial** — for
the ticker, investor tables, prices), and add motion / layered-elevation / dark-theme
tokens. Keep the spec format; label each token `(confirmed)` (a brand anchor carried
from the capture) or `(designed)` (an upgrade you introduced); end with a changelog +
self-critique comment. The goal is a guide that reads as an *intentional product*,
not a cleaned-up template.

### 5. Write, tidy, and report

- Write the result to the path the user named, else to **`<workdir>/DESIGN.md`** (next
  to the screenshots). Do **not** default to the repo-root `./DESIGN.md` — that would
  clobber a project's own DESIGN.md; if the user asks for `./DESIGN.md` and one already
  exists, confirm before overwriting. Output only the document — no wrapping code fence.
- Nothing to tidy — each probe run stops the browser it started. Keep the screenshots +
  measured-CSS JSON in the workdir.
- Summarise briefly (per `design-craft` delivery style — caveats + where things are,
  not a recap): the one-sentence vibe, the `DESIGN.md` path, the screenshots dir,
  and any page that was gated or failed to probe (so the human knows the evidence
  gap).

## References

Read the reference for the phase you're in:

- `references/obscura-probe.md` — the exact Obscura commands to discover pages,
  full-page screenshot, and measure computed CSS/HTML, which computed properties are
  trustworthy, plus the parallel-wave + backoff pattern. **Read before phase 1–2.**
- `references/extraction-protocol.md` — the measure-don't-guess synthesis method
  (folded `design-md-from-screenshots`): silent analysis, vibe, provenance, the
  component inventory, and the anti-slop rules. **Read before phase 3.**
- `references/design-md-spec.md` — the official google-labs design.md structure: the
  YAML frontmatter token schema, the token value types + `{token.ref}` syntax, and
  the 8 required sections. **The output contract — read before writing.**
- `references/refine-methodology.md` — the capture-then-refine upgrade rules. **Read
  before phase 4.**
- `assets/probe.js` — the `getComputedStyle`-by-role snippet.
- `assets/capture-page.mjs` — one page → a full-page PNG plus the probe JSON, over
  `obscura serve` + CDP. Full-page capture is unreachable from `obscura fetch`, which
  is why this exists.
