"""Self-contained structural validator for ``lecturn.deck/1`` JSON.

No third-party dependency. Enforces the invariants a downstream renderer relies
on (§10 of the schema): the schema tag, required deck/slide/element fields, the
element-type discriminant, per-type required content, unique ids, and the
"non-empty renderable elements" predicate (a group counts only with ≥1
non-hidden child). Returns a list of human-readable error strings; empty == valid.
"""

from __future__ import annotations

from typing import Any

ELEMENT_TYPES = {"text", "stat", "chart", "image", "line",
                 "shape", "table", "group", "widget", "embed"}
SHAPE_KINDS = {"rect", "round-rect", "ellipse", "ring", "triangle", "line-arrow",
               "preset", "custom"}


def validate_deck(deck: Any) -> list[str]:
    errors: list[str] = []

    def err(path: str, msg: str):
        errors.append(f"{path}: {msg}")

    if not isinstance(deck, dict):
        return ["<root>: deck must be a JSON object"]
    if deck.get("schema") != "lecturn.deck/1":
        err("schema", f'must be "lecturn.deck/1" (got {deck.get("schema")!r})')
    for key in ("id", "title"):
        if not isinstance(deck.get(key), str) or not deck.get(key):
            err(key, "required non-empty string")
    canvas = deck.get("canvas")
    if not isinstance(canvas, dict) or not _num(canvas.get("w")) or not _num(canvas.get("h")):
        err("canvas", "required {w:number, h:number}")
    theme = deck.get("theme")
    if not isinstance(theme, dict) or "tokens" not in theme:
        err("theme", "required object with a tokens snapshot")

    slides = deck.get("slides")
    if not isinstance(slides, list) or not slides:
        err("slides", "required non-empty array")
        return errors

    seen_slide_ids: set[str] = set()
    seen_el_ids: set[str] = set()
    for si, slide in enumerate(slides):
        sp = f"slides[{si}]"
        if not isinstance(slide, dict):
            err(sp, "slide must be an object")
            continue
        sid = slide.get("id")
        if not isinstance(sid, str) or not sid:
            err(f"{sp}.id", "required non-empty string")
        elif sid in seen_slide_ids:
            err(f"{sp}.id", f"duplicate slide id {sid!r}")
        else:
            seen_slide_ids.add(sid)

        els = slide.get("elements")
        if not isinstance(els, list):
            err(f"{sp}.elements", "required array")
            continue
        group_ids = {e.get("id") for e in els if isinstance(e, dict) and e.get("type") == "group"}
        for ei, el in enumerate(els):
            _validate_element(el, f"{sp}.elements[{ei}]", err, seen_el_ids, group_ids)
        if not _has_renderable(els):
            err(f"{sp}.elements", "must contain at least one renderable element "
                "(a group counts only with ≥1 non-hidden child)")
    return errors


def _validate_element(el, path, err, seen_ids, group_ids):
    if not isinstance(el, dict):
        err(path, "element must be an object")
        return
    eid = el.get("id")
    if not isinstance(eid, str) or not eid:
        err(f"{path}.id", "required non-empty string")
    elif eid in seen_ids:
        err(f"{path}.id", f"duplicate element id {eid!r}")
    else:
        seen_ids.add(eid)

    t = el.get("type")
    if t not in ELEMENT_TYPES:
        err(f"{path}.type", f"unknown element type {t!r}")
        return

    layout = el.get("layout")
    if not isinstance(layout, dict):
        err(f"{path}.layout", "required object")
    else:
        for k in ("x", "y", "w", "h", "z"):
            if not _num(layout.get(k)):
                err(f"{path}.layout.{k}", "required number")

    gid = el.get("groupId")
    if gid is not None and gid not in group_ids:
        err(f"{path}.groupId", f"references missing group {gid!r}")

    # per-type content requirements
    if t == "text":
        if not isinstance(el.get("text"), str) and not isinstance(el.get("rich"), dict):
            err(f"{path}", "text element needs a `text` string or a `rich` body")
    elif t == "shape":
        if el.get("shape") not in SHAPE_KINDS:
            err(f"{path}.shape", f"invalid shape kind {el.get('shape')!r}")
        if el.get("shape") == "preset" and not el.get("preset"):
            err(f"{path}.preset", "shape:'preset' requires a `preset` name")
    elif t == "table":
        if not isinstance(el.get("rows"), list):
            err(f"{path}.rows", "table needs a rows array")
    elif t == "image":
        if not (el.get("url") or el.get("assetId") or el.get("imageRequest")):
            err(f"{path}", "image needs a url, assetId, or a transient imageRequest")
    elif t == "stat":
        if el.get("value") in (None, ""):
            err(f"{path}.value", "stat needs a value")
    elif t == "chart":
        if not isinstance(el.get("series"), list):
            err(f"{path}.series", "chart needs a series array")
    elif t == "widget":
        if not el.get("widget"):
            err(f"{path}.widget", "widget needs a kind")
    elif t == "embed":
        if not el.get("src"):
            err(f"{path}.src", "embed needs a src")


def _has_renderable(els) -> bool:
    children_by_group: dict[str, list] = {}
    for e in els:
        if isinstance(e, dict) and e.get("groupId"):
            children_by_group.setdefault(e["groupId"], []).append(e)
    for e in els:
        if not isinstance(e, dict) or e.get("hidden"):
            continue
        if e.get("type") == "group":
            kids = children_by_group.get(e.get("id"), [])
            if any(isinstance(k, dict) and not k.get("hidden") for k in kids):
                return True
        elif e.get("type") in ELEMENT_TYPES:
            return True
    return False


def _num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)
