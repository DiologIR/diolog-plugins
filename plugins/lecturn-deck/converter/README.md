# deckconv

A two-way converter between **PowerPoint (`.pptx`)** and the **`lecturn.deck/1`**
JSON slide schema. Standard library only — Python 3.11+ on PATH, no third-party
dependency (uses `zipfile` + `xml.etree`).

```bash
export PYTHONPATH=src
python3 -m deckconv from-pptx deck.pptx -o deck.json   # import (+ ./assets media)
python3 -m deckconv to-pptx   deck.json -o deck.pptx   # export
python3 -m deckconv validate  deck.json                # strict structural validation
python3 -m deckconv inspect   deck.pptx | deck.json    # element census
```

Or install it: `pip install -e .` then use the `deckconv` command.

## What it does

- **`from-pptx`** walks the OOXML shape tree in document order and emits a
  `lecturn.deck/1` deck: text (plain + rich runs), shapes (preset + custom),
  images (extracted to `./assets`), tables (per-cell, spans, column/row sizes),
  groups (child transforms flattened to absolute canvas coordinates), connectors,
  slide backgrounds, speaker notes, the theme (colour scheme + fonts), document
  properties, and slide size. Inherited placeholder geometry (a title with no
  transform) is resolved from the slide's layout/master.
- **`to-pptx`** builds a structurally valid package (content-types, one
  master/layout, a theme derived from the deck tokens, per-slide shape trees,
  embedded media, native tables and charts, notes) and re-emits any carried source
  fragments verbatim for lossless round-trips.
- **`validate`** is a strict linter: schema tag, required deck/slide/element
  fields, the element-type discriminant, per-type content, unique ids, and the
  "every slide has ≥1 renderable element" predicate.

## Fidelity (no silent loss)

Every PowerPoint construct is classified **F0 native / F1 carried / F2 fallback /
F3 flagged**. F1–F3 attach a `carry` payload (exact XML and/or a rendered
fallback) and an `import.notes[]` entry — never a silent drop. Native-only Lecturn
elements (`stat`/`widget`/`embed`) have no PowerPoint primitive and are exported as
an honest static projection with a printed note.

## Security

The XML parser is hardened for untrusted uploads without a third-party dependency:
any part declaring a `DOCTYPE`/`ENTITY` is refused (closes XXE / billion-laughs /
quadratic-blowup, which all require a DTD), and per-part / whole-package
decompression size caps stop zip bombs.

## Verification stance

`to-pptx` guarantees a **structurally valid** package (valid zip, well-formed
parts, complete content-types and relationships) and a **stable round-trip**
(`from-pptx` of its output re-validates). It does **not** claim "opens in
PowerPoint" — that is only ever confirmed by opening it in PowerPoint.

## Tests

```bash
PYTHONPATH=src python3 tests/test_roundtrip.py     # dependency-free runner
PYTHONPATH=src python3 -m pytest                    # if pytest is installed
```

Three laws: a valid deck survives `to-pptx → from-pptx`; every element family is
preserved (native ones by type, native-only ones as their documented projection);
malicious/oversized XML is refused, not parsed.
