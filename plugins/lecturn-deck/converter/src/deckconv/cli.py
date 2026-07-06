"""deckconv CLI: ``from-pptx`` | ``to-pptx`` | ``validate`` | ``inspect``.

Exit codes: 0 success, 1 invalid input / operation error, 2 usage error. Errors
go to stderr as plain diagnostics, never tracebacks.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import TextIO


def _load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _cmd_from_pptx(args, out: TextIO, err: TextIO) -> int:
    from .frompptx import pptx_to_deck
    deck, assets = pptx_to_deck(args.input)

    assets_dir = args.assets or os.path.join(os.path.dirname(os.path.abspath(args.output)), "assets")
    if assets:
        os.makedirs(assets_dir, exist_ok=True)
        for name, data in assets.items():
            with open(os.path.join(assets_dir, name), "wb") as fh:
                fh.write(data)
    with open(args.output, "w", encoding="utf-8") as fh:
        json.dump(deck, fh, indent=2, ensure_ascii=False)

    # self-check: emitted deck must validate
    from .validate import validate_deck
    problems = validate_deck(deck)
    rep = deck.get("import", {})
    counts = rep.get("counts", {})
    print(f"wrote {args.output} — {len(deck.get('slides', []))} slides, "
          f"{len(assets)} asset(s) → {assets_dir}", file=err)
    print(f"  fidelity: F0={counts.get('F0', 0)} F1={counts.get('F1', 0)} "
          f"F2={counts.get('F2', 0)} F3={counts.get('F3', 0)}", file=err)
    for note in rep.get("notes", []):
        if note.get("class") in ("F2", "F3"):
            print(f"  [{note['class']}] {note.get('construct')}: {note.get('message')}", file=err)
    if problems:
        print("  WARNING: emitted deck did not fully validate:", file=err)
        for p in problems[:20]:
            print(f"    {p}", file=err)
        return 1
    return 0


def _cmd_to_pptx(args, out: TextIO, err: TextIO) -> int:
    deck = _load_json(args.input)
    from .validate import validate_deck
    problems = validate_deck(deck)
    if problems:
        print("error: input deck is not valid lecturn.deck/1:", file=err)
        for p in problems:
            print(f"  {p}", file=err)
        return 1
    assets_base = args.assets or os.path.dirname(os.path.abspath(args.input))
    from .topptx import deck_to_pptx
    report = deck_to_pptx(deck, args.output, assets_base)
    size = os.path.getsize(args.output)
    print(f"wrote {args.output} ({size} bytes, {len(deck.get('slides', []))} slides)", file=err)
    for line in report:
        print(f"  note: {line}", file=err)
    return 0


def _cmd_validate(args, out: TextIO, err: TextIO) -> int:
    deck = _load_json(args.input)
    from .validate import validate_deck
    problems = validate_deck(deck)
    if problems:
        for p in problems:
            print(f"error: {p}", file=err)
        return 1
    print(f"ok: {args.input} is valid lecturn.deck/1 "
          f"({len(deck.get('slides', []))} slides)", file=err)
    return 0


def _cmd_inspect(args, out: TextIO, err: TextIO) -> int:
    path = args.input
    if path.lower().endswith(".pptx"):
        from .frompptx import pptx_to_deck
        deck, _ = pptx_to_deck(path)
    else:
        deck = _load_json(path)
    summary = {
        "title": deck.get("title"),
        "canvas": deck.get("canvas"),
        "slides": len(deck.get("slides", [])),
        "elementTypes": {},
        "import": deck.get("import", {}).get("counts"),
    }
    for slide in deck.get("slides", []):
        for el in slide.get("elements", []):
            t = el.get("type", "?")
            summary["elementTypes"][t] = summary["elementTypes"].get(t, 0) + 1
    out.write(json.dumps(summary, indent=2, ensure_ascii=False) + "\n")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="deckconv",
        description="Convert PowerPoint (.pptx) ⇄ lecturn.deck/1 JSON.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("from-pptx", help="convert a .pptx into a deck JSON")
    p.add_argument("input")
    p.add_argument("-o", "--output", required=True)
    p.add_argument("--assets", help="directory for extracted media (default: <output-dir>/assets)")

    p = sub.add_parser("to-pptx", help="build a .pptx from a deck JSON")
    p.add_argument("input")
    p.add_argument("-o", "--output", required=True)
    p.add_argument("--assets", help="base dir for resolving image paths (default: input dir)")

    p = sub.add_parser("validate", help="validate a deck JSON against lecturn.deck/1")
    p.add_argument("input")

    p = sub.add_parser("inspect", help="print a summary of a .pptx or deck JSON")
    p.add_argument("input")

    args = parser.parse_args(argv)
    handlers = {"from-pptx": _cmd_from_pptx, "to-pptx": _cmd_to_pptx,
                "validate": _cmd_validate, "inspect": _cmd_inspect}
    try:
        return handlers[args.cmd](args, sys.stdout, sys.stderr)
    except FileNotFoundError as exc:
        print(f"error: file not found: {exc.filename}", file=sys.stderr)
        return 1
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
