# customer-deck-builder

Build a branded, print-ready **customer proposal / pitch deck** from Diolog's
9-slide template system.

The nine slides — cover, the brief, summary, the workspace, the approach, the
value case, governance, investment, next step — are company-agnostic templates.
This skill fills them with a specific client's identity, contacts, pricing and
numbers (asking multiple-choice questions for the details you don't provide),
keeps the IR-proposal argument, and can design **new** slides into the same
system via `design-craft`.

**Output:** one self-contained `deck.html` that

- opens zoomed to fit the whole deck and **pans/zooms** like a canvas — trackpad
  pinch & two-finger scroll, drag, plus **Fit deck / Fit slide / 100%** controls;
- **prints to a vertical, paged PDF** — one slide per page at native 1920×1080
  (Print → Save as PDF, Margins: None, Background graphics: on).

Diolog is the fixed vendor; the client company and the commercials are what you
fill in.

## Use it

Invoke `/customer-deck-builder:customer-deck-builder`, or just ask:

- "Make a Diolog proposal deck for **Northgate Minerals**."
- "Turn the Alfabs deck into one for a **private, pre-IPO SaaS** client."
- "Change the pricing to A$2,500 / A$3,200 and rebuild the deck."
- "Add a **team** slide to the deck."
- "Export the deck as a PDF."

## What's inside

```
skills/customer-deck-builder/
├── SKILL.md                      orchestration: intake → fill → build → present
├── assets/
│   ├── templates/frames/         9 templated 1920×1080 HTML frames
│   ├── templates/deck.css        shared design-token stylesheet
│   ├── templates/deck.config.json ready-to-go config (Alfabs defaults)
│   └── shell/harness.html        pan/zoom/print single-page shell
├── scripts/build_deck.py         config + frames + shell → self-contained deck.html
└── references/
    ├── placeholders.md           token table, content map, question bank
    ├── DESIGN.md                 the visual system (palette, type, voice)
    └── BUILD-GUIDE.md            per-slide geometry + cross-slide consistency
```

## Build directly

```bash
python3 scripts/build_deck.py --config <your-deck>/deck.config.json --out <your-deck>/deck.html
```

Exit `0` = all tokens resolved. Exit `2` lists any unresolved tokens to add to the
config. Page numbers and section labels are computed from slide order, so adding
or reordering a slide renumbers the whole deck automatically.
