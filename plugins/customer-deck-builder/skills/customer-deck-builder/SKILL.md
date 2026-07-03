---
name: customer-deck-builder
description: >-
  Build a branded, print-ready customer proposal / pitch deck from Diolog's
  9-slide template system — a fixed 1920×1080 investor-grade deck (cover, brief,
  summary, workspace, approach, value, governance, investment, next step) that
  outputs a single self-contained web page with pan/zoom (trackpad + controls,
  fit-deck / fit-slide / 100%) and prints to a vertical, paged PDF at native slide
  size. Diolog is the fixed vendor; the client company, contacts, pricing and
  numbers are fillable. Use this skill whenever the user wants to create, generate,
  build, spin up, or template a proposal deck / pitch deck / customer deck /
  investor deck / sales deck / board deck for a specific company (e.g. "make a
  Diolog proposal deck for Acme", "turn the Alfabs deck into one for Northgate",
  "new customer deck for a listed mining client", "build the pitch deck from the
  template"), or to modify one (change the client, pricing, accent colour, copy),
  add a new slide to it, or export/print it to PDF. Trigger even if they don't say
  "template" or name the files — any request to produce a Diolog-style multi-slide
  proposal/pitch deck for a customer belongs here. Do NOT use it for a single
  marketing graphic, an email mockup, or a design-system doc — but DO reach for it
  the moment the deliverable is a multi-slide customer deck.
---

# Customer Deck Builder

You produce a **customer proposal deck** in Diolog's house style: nine
fixed-size 1920×1080 slides, delivered as **one self-contained `deck.html`** that
pans/zooms like a canvas on screen and **prints to a vertical, paged PDF** (one
slide per page, native size). Diolog is always the vendor; the **client** and the
**commercials** are what you fill in.

This is a *template-fill and re-point* job, not a from-scratch design job. The
nine slides already carry a strong IR-proposal argument. Your work is to swap the
client-specific bits, gather the few numbers that are missing, apply any
preferences, and build. Keep the spine; change the entities — unless the user
explicitly asks to rewrite a slide's copy wholesale.

## The kit (bundled with this skill)

```
assets/templates/frames/       9 templated standalone HTML frames ({{TOKEN}}s inside)
assets/templates/deck.css      shared stylesheet (the design tokens)
assets/templates/deck.config.json  ready-to-go config (Alfabs defaults)
assets/shell/harness.html      the pan/zoom/print single-page shell
scripts/build_deck.py          assembles config + frames + shell → deck.html
references/placeholders.md      every token, the non-tokenised copy, the question bank
references/DESIGN.md            the visual system (palette, type, voice, do/don't)
references/BUILD-GUIDE.md       per-slide geometry + cross-slide consistency logic
```

**Read `references/placeholders.md` first** — it is the source of truth for what
is a variable, what is reusable copy, and what to ask. Consult `DESIGN.md` and
`BUILD-GUIDE.md` whenever you edit copy, rebrand, or add a slide.

## Workflow

### 1 — Scope the request
Work out which of these you're doing (they compose):
- **New deck** for a client → the main flow below.
- **Modify** an existing generated deck → edit its `deck.config.json` and/or the
  copied frame files, then rebuild.
- **Add a slide** beyond the nine → the *New screen* flow further down.
- **Export** → just the print-to-PDF guidance at the end.

### 2 — Set up an output workspace (never edit the bundled kit)
Create `./<client-short>-deck/` in the working directory and copy the frames +
config into it, so every edit is on a throwaway copy:

```bash
OUT="./acme-deck"                       # kebab of the client short name
mkdir -p "$OUT/frames"
cp <skill>/assets/templates/frames/*.html "$OUT/frames/"
cp <skill>/assets/templates/deck.config.json "$OUT/deck.config.json"
```

The pristine `assets/templates/…` is a template — leave it untouched so the next
deck starts clean.

### 3 — Gather content, ask only for real gaps
From the user's prompt and context, fill in what you know. For the **material**
tokens that are still missing (see `placeholders.md` §1, tier = **ask**), ask the
user with **multiple-choice questions** — batch up to four in one
`AskUserQuestion` call, recommended option first, and always leave room for their
own answer. Use the question bank in `placeholders.md` §3 (is the client listed?
sector? who's the IR partner? pricing tiers? brand accent? slide scope?). Also
invite free-form context — tone, audience, real numbers, anything to weave in.

Do not interrogate. Anything with a good default (Diolog presenter, go-live,
hours) can stay as-is unless the user cares. Never ask for what you can infer.

### 4 — Write the config
Put the gathered values into `<OUT>/deck.config.json` → `tokens`. Set `title`,
and if the user supplied a logo, `client_logo` (a file path gets embedded as a
data URI; a URL is used directly; empty falls back to the client name text on the
cover). Derived tokens (`*_UPPER`, `HOURS_YEAR_N`) and all page numbers are
computed by the build — don't add them.

### 5 — Re-point copy, and only rewrite when asked
The narrative copy is *not* tokenised (see `placeholders.md` §2). By default keep
it; the client-name and partner-name tokens already thread through the prose. When
the user's context makes a line wrong (e.g. the client isn't listed, so "answers
to the market like any ASX company" misfits), or they ask to change a slide,
**edit the copied frame file directly** — it's plain HTML. When you do:
- Route every new or changed line through the **Diolog brand voice** (see *Voice,
  mockups & design rules* below). No long dashes, ever.
- Honour `BUILD-GUIDE.md`: keep each block's coordinates; change only the text.
- These are fixed canvases, so **overflow is clipped, not reflowed**. If new copy
  is longer, shorten it or nudge the font-size/width per the block's recipe.
- Keep the one-accent discipline and the type/colour system from `DESIGN.md`.

### 6 — Rebrand (optional)
To adopt a client accent colour, set `design.accent` (and optionally
`design.navy`) in the config — one value re-tints the whole deck. Keep DESIGN.md's
rule: exactly one accent, used sparingly. Don't introduce a second hue.

### 7 — Build
```bash
python3 <skill>/scripts/build_deck.py --config "$OUT/deck.config.json" --out "$OUT/deck.html"
```
Exit code `0` means every token resolved. Exit `2` prints the unresolved tokens —
add them to the config and rebuild. The script scopes each slide's CSS, inlines
everything, and renumbers footers/section labels from slide order, so the output
is one portable file.

### 8 — Verify
Confirm the build reported `0` unresolved tokens and the expected slide count. If
useful, open `deck.html` in a browser to eyeball it. Sanity-check that no
`Alfabs`/`Becca` leaked where the client differs (grep the output), and that
longer copy didn't overflow any frame.

### 9 — Present & hand off
Tell the user where `deck.html` is and how to use it:
- **On screen:** the slides sit in a grid of ~2 rows (reading left-to-right) and
  open zoomed to fit the whole deck. Scroll/two-finger to pan, pinch or
  ⌘/Ctrl-scroll to zoom, drag to move; the control bar has **Fit deck**, **Fit
  slide**, **100%**, and zoom ±. Zoom snaps to a brief detent at 100% (keep
  zooming to push past it).
- **To PDF:** click **Print / PDF** (or ⌘P) → choose **Save as PDF**, set
  **Margins: None** and enable **Background graphics**. You get a vertical, paged
  PDF — one slide per page at native 1920×1080. Those two settings matter; call
  them out.

## New screen (beyond the original nine)

When the user wants a slide the template doesn't have (team, timeline, case study,
roadmap, org chart…), design it *into the system* so it's indistinguishable from
the original nine:

1. **Design with `/design-craft:design-craft`**, feeding it `references/DESIGN.md`
   (the visual system) and `references/BUILD-GUIDE.md` (exact geometry + the
   reusable component recipes and the shared chrome). If the new slide needs a
   **product mockup**, build it with the **`email-mockups`** skill (see *Voice,
   mockups & design rules*). Start from `assets/templates/_blank-frame.example.html`,
   which already carries the chrome + numbering tokens. The new frame must:
   - be a **1920×1080** `<div class="frame">` in a standalone HTML file with the
     same shape as the other frames (optional `<head><style>` for slide-local CSS,
     then `<body>` with just the frame);
   - carry the **shared chrome**: running header (`{{CLIENT_NAME_UPPER}} · DIOLOG
     PROPOSAL · {SECTION}`), the red kicker tick, section label
     (`{SECTION} · {{SECTION_NUM}}`), and footer (`{{CLIENT_SHORT_UPPER}} ·
     CONFIDENTIAL` + `{{PAGE_N}} / {{PAGE_TOTAL}}`) — use those tokens verbatim so
     numbering auto-updates;
   - reuse the tokens and component recipes (cards, navy panel, tables, chips…)
     from BUILD-GUIDE §5 rather than inventing new patterns; keep 110px margins,
     the type scale, and the one-accent rule.
2. Save it as `<OUT>/frames/NN-name.html`.
3. Insert it into `slides[]` at the desired position with a `label`. The build
   renumbers every slide's footer and section number automatically.
4. Rebuild and verify.

Removing or reordering slides is the same: edit `slides[]` and rebuild.

## Voice, mockups & design rules (whenever you write, rewrite, or design)

Apply these any time you produce new copy, change existing copy, or design a new
container / screen / mockup, so the deck stays unmistakably Diolog.

**Copy — always in the Diolog brand voice.** Before writing or editing any slide
copy, use the brand-voice skills in the **`diolog-brand-voice`** plugin:
- `create-diolog-marketing-copy` for punchy slide copy (headlines, kickers, card
  titles, bullets, CTAs);
- `create-diolog-business-case` for the buyer / ROI framing on the value and
  investment slides.
Obey their core rules even when you don't invoke them: **no em dashes (—)**
anywhere in the deck, and no en dashes (–) in sentence copy. Use a spaced hyphen
`-` as the connective and the middot `·` for label separators, exactly as the
templates already do. The deck's list-bullet glyph and numeric ranges (e.g.
`20-30 h`) are the only place an en dash is acceptable. Australian English;
plain, precise; no AI clichés.

**Mockups — use the `email-mockups` skill.** The product-UI mockups (the slide-4
browser / app device frames, or any new mock) are built with the **`email-mockups`**
skill, which produces impression-not-replica product vignettes in the Diolog
system. Use the mock recipes in `BUILD-GUIDE.md` §6 for structure, and drive the
visual build through `email-mockups`. Keep every mock accent on `var(--accent)` so
a rebrand carries through automatically.

**Containers — never a rounded box with a one-sided border.** A rounded container
with a border on only one side (e.g. a left accent stripe) is banned; it reads as
unfinished. When a container needs edge emphasis, use ONE of:
- a subtle **colour-to-white horizontal gradient** fill (accent or navy → white),
  no border; or
- a **white fill with a coloured dashed border all the way round** (all four
  sides, one radius).
Otherwise use the established flat fills (`#f4f6f9` or navy `#0e1c3c`) with the
single soft shadow, per `DESIGN.md`.

## Consistency rules (from BUILD-GUIDE.md — keep the deck coherent)

- Every content slide repeats the same chrome scaffold; the cover is the only
  frame without it.
- Page numbers and section numbers are derived from order — never hand-type
  `07 / 09`; let the build compute it.
- One editorial accent, sparingly. One navy emphasis panel per slide, at most.
- Slides are fixed 1920×1080; content is placed by coordinate and clipped on
  overflow. Match a block's recipe when you touch it.
- Diolog is the vendor: the `diolog` wordmark, the product facts (AES-256, Claude,
  ap-southeast-2), and the presenter default stay Diolog unless overridden.

## Guardrails
- Work on copies in `<OUT>/`; never mutate `assets/templates/`.
- If `build_deck.py` exits non-zero, read the message. It is almost always a
  missing token or a renamed frame file.
- Don't fabricate client financials for the mock UIs (slide 4). Keep the
  illustrative defaults unless the user gives real figures.
- No long dashes anywhere in the deck, and never a rounded one-sided-border
  container (see *Voice, mockups & design rules*).
- Keep it honest: this is Diolog's proposal to a client; don't invent claims the
  user didn't authorise.
