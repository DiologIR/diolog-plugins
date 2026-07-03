---
name: customer-business-case
description: >-
  Generate a single printable A4-page executive business case in Diolog's house
  style from a customer's proposal deck. One dense, elegant page (problem →
  solution → value → quantified outcome → investment → next step) pitched at a
  board / CFO / CEO, on a fixed 794x1123 A4 canvas that prints to exactly one
  page. Built with the /design-craft skill against the bundled single-page
  DESIGN.md and a templated version of the original Alfabs business case, with all
  copy in the Diolog brand voice. Use this skill whenever the user wants to
  create, generate, build, or write a business case, executive business case,
  one-page business case, investment case, ROI / value one-pager, board leave-
  behind, or "why buy this" summary for a specific customer (e.g. "make a business
  case for Acme", "turn this proposal deck into a one-page business case",
  "single A4 business case from the Northgate deck", "executive summary one-pager
  for the board"). Trigger even if they don't say "one-pager" or "A4" — any
  request to distill a customer proposal into a single printable business-case
  page belongs here. Distinct from customer-deck-builder (a multi-slide deck) and
  from create-diolog-business-case (prose only): this produces the designed,
  print-ready single page.
---

# Customer Business Case (single printable A4 page)

You produce **one A4 page**: a print-clean executive business case in Diolog's
house style that argues a case from problem to next step, pitched at a board /
CFO / CEO reader. It fits on a single fixed A4 canvas (`794 x 1123px`) and prints
to exactly one page. You build it with the **`/design-craft`** skill against the
bundled DESIGN.md and template, and write every line through the Diolog brand
voice.

This is not a deck and not a report. If given a longer proposal deck, your job is
to **compress it to its argument** and lay it out on one page.

## The kit (bundled with this skill)

```
assets/business-case.template.html   the tuned A4 template (fill the {{placeholders}})
references/DESIGN.md                  the single-page visual system (normative)
references/document-structure.md      the argument arc + guardrails (STRUCTURE only)
references/build-guidance.md          placeholder map, tuned spacing, anti-tweak learnings
```

## Read these before writing a line (required)

1. **`references/build-guidance.md`** — the operational recipe, the placeholder
   map, and the specific mistakes not to repeat.
2. **`references/DESIGN.md`** — palette, type, spacing, print CSS, do/don't. Normative.
3. **`references/document-structure.md`** — the argument shape and messaging
   guardrails. **Treat this as STRUCTURE only, never content.** It is
   de-identified on purpose; do not let any prior client's data reach the page.
4. **`assets/business-case.template.html`** — the destination layout.

The **content** comes from the client's own material, not from any of the above
and not from the original Alfabs example.

## Inputs

- **Required — the customer deck / proposal** (a PDF, the exported HTML deck, or a
  doc): the source of truth for every claim, figure, plan and price. If the user
  hasn't provided one, ask for it before building.
- **Optional — a business-case content/structure doc** (e.g. a prior "Executive
  Business Case" PDF): use it to refine the section order / emphasis only. Same
  rule as the structure reference: mirror its skeleton, never copy its wording or
  another client's data.

For PDFs/DOCX, extract text with a script (pdf-parse for PDF; unzip + strip XML
for DOCX) before writing.

## Workflow

### 1 — Gather and read
Locate the customer deck; extract its text. Read the four bundled files above.
Know which input is structure, which is content, which is voice, which is style.

### 2 — Set up a working file
Copy `assets/business-case.template.html` to `./<client-short>-business-case.html`
in the working directory. Never edit the bundled template.

### 3 — Build with /design-craft
Invoke **`/design-craft:design-craft`**, feeding it `references/DESIGN.md`,
`references/build-guidance.md`, and the copied template, to design the client's
page. Fill every `{{placeholder}}` from the customer deck's real content and
adapt as the argument needs:
- Keep the **eight-section arc**, the **two-card rhythm** (exactly one navy card =
  the solution; wash cards for investment + next steps), and the **one accent
  blue**.
- The placeholders are the minimum. You may rewrite copy, merge/re-order content,
  change table rows, and adjust layout, provided the page still reads as this
  system and still fits one page.
- Extract the argument: what the client loses today, what Diolog changes, the
  quantified payoff (quantify twice: time saved + money saved), the price, the
  ask. Three problems, four value shifts. Compress ruthlessly.

### 4 — Write every line in the Diolog brand voice
Route all copy through the **`diolog-brand-voice`** plugin, specifically
**`create-diolog-business-case`** (purpose-built for CFO/buyer business cases).
Hold its rules even if you write copy directly:
- **No em dashes or en dashes anywhere.** Ranges use "to" (`A$25k to 46k`,
  `20 to 30h`). Grep the finished file for `—` and `–` and remove all of them.
- Australian English, **A$** for money, sentence-case headings, measured
  confidence, estimates labelled indicative with their basis.

### 5 — Enforce the one-page + print rules
- The canvas stays a fixed `794 x 1123px`; keep the `@media print` block intact
  (`@page { size:794px 1123px; margin:0 }` + `print-color-adjust:exact`).
- No `position:absolute` offsets, fixed px sizes on flex children, negative `top`,
  or box-shadow on the print canvas (those clip the page in print).

### 6 — Verify (do not skip)
Render the file in a browser and confirm:
- it is **one A4 page** with nothing overflowing or clipping, and the section gaps
  are even top to bottom;
- exactly one navy card; the accent used sparingly; figures right-aligned mono;
- **zero** `—` / `–` in the file;
- printing (Save as PDF, A4, margins None) yields a single clean page.

### 7 — Present
Tell the user where the file is and how to use it. **On screen** it opens as a
pan/zoom viewer (scroll or pinch to zoom, drag to pan, Fit / 100% controls, with a
slight detent at 100%). **To export:** click Print / PDF (or ⌘P) → Save as PDF, A4
size, **Margins: None**, **Background graphics on** → one clean A4 page. Only the
`.bc-page` content changes per client; the viewer harness stays fixed.

## Aesthetic reference (optional, deeper context)
The bundled single-page `DESIGN.md` is normative and sufficient. For the broader
Diolog web design system you may also consult, if present:
`/Users/lukerhodes/Dev/diolog-team-files/website/DESIGN-Website.md` and
`DESIGN-WebsiteShowcase.html`. Scale roles down to the document sizes in DESIGN.md.

## Guardrails
- **One A4 page is the hard constraint.** If it doesn't fit, cut copy; never spill
  to a second page or shrink body below 9px.
- **No leakage.** The structure reference and any example are STRUCTURE only. Never
  ship one client's figures, names or facts in another client's document.
- **Diolog is the fixed vendor** — keep the `diolog` wordmark, the Amy Benson /
  Diolog presenter contact, the Calendly CTA, and the "Disclosure, without doubt."
  tagline unless told otherwise.
- No long dashes; one dark card; one accent; no stock imagery, emoji, or hype.
