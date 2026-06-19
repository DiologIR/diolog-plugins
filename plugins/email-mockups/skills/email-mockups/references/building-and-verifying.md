# Building the set at scale, and verifying it

The pipeline in `SKILL.md` is right for one or a few graphics. When the ask is a **whole
product-update set** (a dozen-plus features), three things decide whether it comes out
best-in-class or merely fine: you **account for every feature**, you **fan the build out**
without losing cohesion, and you **verify deterministically** before Figma. This file is the
mechanics for all three. None of it replaces the playbook judgment — it's the harness around it.

---

## 1. Account for every feature — the coverage ledger

The most damaging failure on a large set is a **silently dropped feature** — you plan 18
graphics, hand off, and only later notice a flagship (an investor portal, a notification
centre) never got one. It happens because you reason feature-by-feature and lose the list.

Before building, write an explicit **ledger** mapping *every named feature* to one of:

- **mocked** — gets its own artboard (name the treatment + register),
- **folded** — rolled into another graphic (say which, e.g. "Install to home screen → folded
  into the mobile app graphic"),
- **copy** — no graphic; better described in the email body (say why — a what's-new panel, a
  thumbs-up control, a generic onboarding screen rarely earns a legible wow).

Then check the count of named features = mocked + folded + copy, with **none unaccounted for**.
Pay special attention to the flagships — the features a reader would be surprised to *not* see.
Surface the ledger to the user when you confirm scope; it's also what you reconcile against at
the end ("18 named, 16 mocked, 1 folded, 5 copy").

A good default scale: "one graphic per *viable* feature" lands ~15–18 for a 22-feature release;
"a curated hero set" lands ~8. Ask which the user wants when the list is long (it changes the
whole job).

---

## 2. Gather real context with a fan-out — but keep the browser single-threaded

For a big set, extracting every feature's **real labels + a candidate smart-copy line + the
hero element + the layout to evoke** is the long pole. Fan it out:

- Spawn **parallel doc-research agents, clustered by feature area** (a dashboard cluster, an
  AI/chat cluster, a docs/disclosure cluster, …). Each reads only **docs + `.tsx` source**
  (`features-build/plain/NN-*.md`, `product-feature-guide.md`, the `*-design-system` stories)
  and returns a tight per-feature brief: verbatim on-screen labels, 2–3 candidate smart-copy
  lines grounded in Flight Centre, the hero element + what to ghost, the demo data.
- **Keep those agents off the browser.** `playwright-cli` (and `agent-browser`) drive a single
  shared browser instance — multiple agents driving it at once collide and corrupt each other's
  sessions. So: doc-research fans out wide; **all rendered-mock screenshots go through one
  driver, serially** (you, or a single dedicated capture agent). Capture the hero surfaces once
  (dashboard, conversations, the verdict/monitoring page, the mobile Home, …) and hand the PNGs
  to the build.

The rendered mock is the source of truth for the **exact words** — lift them verbatim. The live
dashboard verdict says "Worth a look", not an invented "Heads up"; the search footer says
"12 sources"; the KB pills say "Searchable" / "Sensitive". The `.tsx` tells you *which* screen a
feature is; the render tells you what it *says*.

---

## 3. Build the set — one master brief, parallel builders, then assemble

A single agent hand-writing 15+ artboards in one pass is slow and drifts. Split it, but anchor
it to one brief so the pieces cohere.

**3a. Write one master brief** (a working file, e.g. `.email-mockups/BRIEF.md`) the builders all
read. It carries: the non-negotiable constraints (point at `mockup-playbook.md`), the demo
identity, and — per artboard — `title · treatment · board · size · the verbatim hero copy · the
under-mock note · what to ghost · the demo data`. This brief, not the agents' improvisation, is
what keeps a fanned-out build looking like one set. (It's also where the coverage ledger lives.)

**3b. Stage the kit once.** Copy `assets/mock-kit.css`, `assets/artboard-template.html`, and
`assets/diolog-icon.svg` into the working dir so every builder reads the same kit + the same
worked examples (the template's examples are the gold standard — tell builders to match their
density and to lift the real logo SVG from there).

**3c. Fan out builders, each writing its OWN fragment file.** Cluster the artboards (~4 per
agent: the heavy product windows together, the collages together, …). Each agent builds only
its cluster and writes **only its `<figure class="dio-artboard">…</figure>` blocks** to a
distinct file (`frag-1.html`, `frag-2.html`, …) — *no* `<html>/<head>/<style>`. Separate files
per agent is what avoids the shared-file write conflict that otherwise loses all but one agent's
work. Give each builder its slice of the master brief + the self-check (the playbook quality bar).

**3d. Assemble** the final self-contained file: the template `<head>` (fonts link) → the **full
`mock-kit.css` inlined** into the `<style>` → the page scaffold → `<div class="dio-canvas">` →
**concatenate the fragments in reading order** → close. A tiny shell script does this (write
head, `cat KIT.css`, write scaffold + canvas-open, `cat frag-*.html`, write canvas-close + foot).
One file, no build step, fonts via the Google-Fonts `<link>`.

Lead the reading order with the premium product windows and close with mobile; group the rest by
register. The order is cosmetic (each artboard exports independently) — don't agonise over it.

---

## 4. Verify deterministically, then visually

Two passes, cheap first. The cheap one catches the mechanical slop; the visual one catches the
composition.

**4a. Source lint** (grep the assembled file — fast, objective, reusable):

- **emoji** → none (the geometric arrows `▲ ▼ → ↑ ↓` and `⌘` are real chrome, not emoji).
- **banned puffery** → `unlock|supercharge|seamless|effortless|revolutionary|AI-powered|
  game.chang|cutting.edge` = 0.
- **second blue** → `#007AFF` / `#0A84FF` = 0 (macOS selection blue never appears in a graphic).
- **serif weight** → no `.dio-display` / `.dio-num` carrying `font-weight:700|800|bold`.
- **left-only borders** → no `border-left:` stripe used as a card/row treatment (the AI-slop
  tell — see the playbook). Grep `border-left` and eyeball each hit.
- **stray hex** → list every `#rrggbb`; everything should be a kit token value, with the only
  sanctioned literal exceptions being the **liquid-navy** stops (`#16264B/#0C1838/#0A1430` + the
  royal lift) and the **persona-mark** stop (`#2A3F7A`).
- **captions** → every clean-shot `<figure>` has a `.dio-artboard__note`; **no `—`/`–` em/en-dash
  inside any note** (`grep -n 'dio-artboard__note' ... ` then check those lines for dashes).

**4b. Render and eyeball each artboard at full size.** Serve over HTTP and screenshot — this is
also design-craft's `ai-slop-check` / `polish-pass` territory; let it run those. Check the
playbook bar: the one idea reads at 50%; nothing important clipped; the copy is the real words.

### playwright-cli gotchas (they cost real time the first run)

- **`file://` is blocked.** Serve the file and open the `http://` URL:
  `python3 -m http.server 8823 --bind 127.0.0.1 &` then
  `playwright-cli open http://127.0.0.1:8823/<file>.html`. Kill the server when done.
- **`screenshot` takes `--filename`, not a positional path.** The positional arg is an *element
  target/selector*. Full page: `playwright-cli screenshot --filename out.png --full-page`.
- **Per-artboard capture** uses the figure as the selector:
  `playwright-cli screenshot ".dio-canvas > figure:nth-of-type(N) .dio-board" --filename ab-N.png`
  — clean, tight crops, one per graphic, ideal for review and for the eventual PNG export.
- **One browser.** Don't run parallel agents that each drive playwright; serialise captures.

If there's **no write-capable Figma MCP**, these per-artboard PNGs *are* the most useful next
deliverable — offer to export the lot (the email drops one PNG per feature).

---

## 5. Working directory & cleanup

Keep the scaffolding (the master brief, the staged kit, the fragments) in a dot-dir like
`.email-mockups/` so it's easy to regenerate or tweak. The **deliverable is the single assembled
HTML** at a sensible path. If Figma succeeds, delete the assembled HTML (it was scaffolding) per
the SKILL; if not, the HTML is the deliverable — keep it, and offer to clean up the dot-dir.
