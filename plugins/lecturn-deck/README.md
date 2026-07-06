# lecturn-deck

Convert **PowerPoint (`.pptx`) ⇄ the `lecturn.deck/1` JSON slide schema**, and
author/validate that JSON — with a bundled normative spec and a **stdlib-only**
Python two-way converter.

`lecturn.deck/1` is one canonical structure for a slide deck — `presentation →
slides → positioned elements` (a discriminated union: text, stat, chart, image,
line, shape, table, group, widget, embed) over a fixed 1280×720 canvas. It is the
format an AI can author reliably, an editor reads and writes, and this converter
round-trips to and from PowerPoint.

## What's in the box

| Piece | Purpose |
|---|---|
| **`skills/lecturn-deck/`** | The skill: schema essentials, the converter invocation, and the workflow discipline. Reads the bundled spec on demand. |
| **`skills/lecturn-deck/references/deck-schema.md`** | The full normative spec: every field, the core/fidelity/carry field tiers, the colour/fill/stroke/rich-text/table models, validation rules, and the **complete PPTX → schema crosswalk**. |
| **`skills/lecturn-deck/references/example-deck.json`** | A worked two-slide deck to crib from. |
| **`agents/lecturn-deck-specialist.md`** | A specialist agent for multi-step convert-validate-verify loops. |
| **`converter/`** | `deckconv` — the Python converter (`from-pptx` / `to-pptx` / `validate` / `inspect`). No third-party dependency. |

## Quick start

```bash
export PYTHONPATH=plugins/lecturn-deck/converter/src

# import a presentation to editable JSON (media → ./assets, fidelity report printed)
python3 -m deckconv from-pptx deck.pptx -o deck.json

# author or edit deck.json, then validate and build a .pptx
python3 -m deckconv validate deck.json
python3 -m deckconv to-pptx  deck.json -o deck.pptx
```

## Design principles

- **One schema, three field tiers.** A lean `core` the AI authors, an optional
  `fidelity` layer that PPTX import populates for exact reproduction, and an opaque
  `carry` escape hatch for the long tail.
- **No silent loss.** Every PowerPoint construct is native (F0), carried verbatim
  (F1/F2), or flagged in the import report (F3) — never dropped. Native-only
  Lecturn elements (stat/widget/embed) export as an honest static projection.
- **Zero install, hardened input.** Standard library only; the XML parser refuses
  DTD/entity declarations (XXE / billion-laughs) and caps decompression (zip bombs).
- **Honest verification.** The converter guarantees a structurally valid package
  and a stable round-trip; it never claims "opens in PowerPoint" without PowerPoint.

## License

MIT © DiologIR. See [LICENSE](./LICENSE).
