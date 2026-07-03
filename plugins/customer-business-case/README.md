# customer-business-case

Generate a **single printable A4-page executive business case** in Diolog's house
style from a customer's proposal deck.

One dense, elegant page pitched at a board / CFO / CEO, arguing a case from
problem to next step, on a fixed **794 x 1123px** A4 canvas that prints to
**exactly one page**. Built with the `/design-craft` skill against a bundled
single-page `DESIGN.md` and a templated version of the original Alfabs business
case, with every line written in the Diolog brand voice.

## Use it

Invoke `/customer-business-case:customer-business-case`, or ask:

- "Turn the Northgate proposal deck into a one-page business case."
- "Make an executive business case for Acme from this deck (PDF attached)."
- "Single A4 board leave-behind summarising the Diolog proposal for {client}."

Give it the **customer deck / proposal** (PDF, exported HTML, or doc) as the
content source. It compresses that to its argument and lays it out on one page.

## What's inside

```
skills/customer-business-case/
├── SKILL.md                                orchestration: read → design-craft → voice → verify
├── assets/business-case.template.html      the tuned A4 template (fill the {{placeholders}})
└── references/
    ├── DESIGN.md                           single-page visual system (normative)
    ├── document-structure.md               argument arc + guardrails (STRUCTURE only, de-identified)
    └── build-guidance.md                   placeholder map, tuned spacing, anti-tweak learnings
```

## How it works

- The **eight-section arc** (header, the case, problem + navy solution card, value
  strip, outcome table + savings, investment, next steps, footer) and all the
  fiddly spacing are baked into the template as the tuned destination.
- Copy comes from the client's deck, written through the Diolog brand voice
  (`create-diolog-business-case`): Australian English, A$, **no em/en dashes**.
- The fixed A4 canvas + `@media print` block (`@page { size:794px 1123px;
  margin:0 }` + `print-color-adjust:exact`) guarantee a single clean page.
- Print → Save as PDF, A4, Margins None, Background graphics on → one page.

Diolog is the fixed vendor; the client identity, content, figures and pricing come
from the deck.
