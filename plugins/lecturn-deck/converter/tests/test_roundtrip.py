"""Conformance tests for the deckconv converter.

Run with: ``PYTHONPATH=src python3 -m pytest`` (or the bundled runner
``PYTHONPATH=src python3 tests/test_roundtrip.py`` for a dependency-free check).

Three laws, mirroring the GridMD conformance discipline:
  1. A valid deck stays valid through ``to-pptx`` → ``from-pptx``.
  2. Every element family survives the round trip (native ones by type; native-only
     ones — stat/widget/embed — as their documented static projection).
  3. Malicious XML (DOCTYPE/ENTITY) and oversized parts are refused, not parsed.
"""

from __future__ import annotations

import base64
import io
import os
import sys
import tempfile
import zipfile
from xml.etree import ElementTree as ET

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from deckconv import pptx_to_deck, deck_to_pptx, validate_deck   # noqa: E402
from deckconv.ooxml import XmlSecurityError, safe_fromstring     # noqa: E402

RED_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")


def _deck():
    return {
        "schema": "lecturn.deck/1", "id": "d", "title": "T",
        "canvas": {"w": 1280, "h": 720},
        "theme": {"tokens": {"colors": {"accent1": "#1f3fa6", "text1": "#111111", "bg1": "#ffffff"}}},
        "slides": [
            {"id": "s1", "name": "One",
             "background": {"fill": {"type": "solid", "color": "bg1"}},
             "speakerNotes": "notes here",
             "elements": [
                 {"id": "t1", "type": "text", "layout": {"x": 96, "y": 96, "w": 800, "h": 100, "z": 1},
                  "text": "Hello", "size": 44, "color": "text1", "weight": "bold"},
                 {"id": "sh1", "type": "shape", "shape": "ellipse",
                  "layout": {"x": 100, "y": 300, "w": 200, "h": 200, "z": 2},
                  "fill": {"type": "solid", "color": "accent1"}},
                 {"id": "ln1", "type": "line", "variant": "line-arrow",
                  "layout": {"x": 400, "y": 400, "w": 300, "h": 0, "z": 3},
                  "stroke": {"color": "accent1", "width": 3}},
             ]},
            {"id": "s2", "name": "Two", "elements": [
                {"id": "g1", "type": "group", "layout": {"x": 80, "y": 80, "w": 500, "h": 200, "z": 1}},
                {"id": "st1", "type": "stat", "groupId": "g1",
                 "layout": {"x": 80, "y": 80, "w": 240, "h": 200, "z": 1}, "value": "$4M", "label": "Rev"},
                {"id": "tb1", "type": "table", "layout": {"x": 80, "y": 320, "w": 700, "h": 200, "z": 2},
                 "headerRow": True, "rows": [["A", "B"], ["1", "2"]]},
                {"id": "ch1", "type": "chart", "chart": "column",
                 "layout": {"x": 820, "y": 80, "w": 380, "h": 300, "z": 3},
                 "categories": ["Q1", "Q2"], "series": [{"name": "Rev", "values": [30, 42]}]},
            ]},
        ],
    }


def test_law1_valid_deck_survives_roundtrip():
    deck = _deck()
    assert validate_deck(deck) == []
    with tempfile.TemporaryDirectory() as d:
        pptx = os.path.join(d, "o.pptx")
        deck_to_pptx(deck, pptx, None)
        assert os.path.getsize(pptx) > 0
        back, _ = pptx_to_deck(pptx)
        assert validate_deck(back) == [], validate_deck(back)


def test_law1_package_is_valid_zip_and_wellformed_xml():
    with tempfile.TemporaryDirectory() as d:
        pptx = os.path.join(d, "o.pptx")
        deck_to_pptx(_deck(), pptx, None)
        z = zipfile.ZipFile(pptx)
        assert z.testzip() is None
        for n in z.namelist():
            if n.endswith((".xml", ".rels")):
                ET.fromstring(z.read(n))   # raises on malformed
        assert "[Content_Types].xml" in z.namelist()
        assert any(n.startswith("ppt/slides/slide") for n in z.namelist())


def test_law2_element_families_preserved():
    with tempfile.TemporaryDirectory() as d:
        pptx = os.path.join(d, "o.pptx")
        deck_to_pptx(_deck(), pptx, None)
        back, _ = pptx_to_deck(pptx)
        types = {e["type"] for s in back["slides"] for e in s["elements"]}
        # native types survive as themselves; stat is projected to text (documented)
        for expected in ("text", "shape", "line", "group", "table", "chart"):
            assert expected in types, f"{expected} missing from {types}"
        # canvas + notes preserved
        assert back["canvas"]["w"] == 1280
        assert any(s.get("speakerNotes") for s in back["slides"])


def test_law2_image_embed_and_extract():
    with tempfile.TemporaryDirectory() as d:
        os.makedirs(os.path.join(d, "assets"))
        with open(os.path.join(d, "assets", "pic.png"), "wb") as fh:
            fh.write(RED_PNG)
        deck = {"schema": "lecturn.deck/1", "id": "d", "title": "I",
                "canvas": {"w": 1280, "h": 720}, "theme": {"tokens": {"colors": {}}},
                "slides": [{"id": "s1", "elements": [
                    {"id": "i1", "type": "image", "layout": {"x": 10, "y": 10, "w": 100, "h": 100, "z": 1},
                     "url": "assets/pic.png", "alt": "dot"}]}]}
        pptx = os.path.join(d, "o.pptx")
        deck_to_pptx(deck, pptx, d)
        assert any("media/image" in n for n in zipfile.ZipFile(pptx).namelist())
        back, assets = pptx_to_deck(pptx)
        assert assets, "expected an extracted image asset"
        img = [e for e in back["slides"][0]["elements"] if e["type"] == "image"]
        assert img and img[0].get("url", "").startswith("assets/")


def test_law3_rejects_doctype_entity():
    evil = b'<?xml version="1.0"?><!DOCTYPE x [<!ENTITY a "b">]><root/>'
    try:
        safe_fromstring(evil)
        assert False, "should have refused DOCTYPE"
    except XmlSecurityError:
        pass


def test_law3_rejects_zip_bomb_part():
    from deckconv.ooxml import read_package, MAX_PART_BYTES
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "bomb.pptx")
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            zi = zipfile.ZipInfo("ppt/big.xml")
            z.writestr(zi, b"A" * (MAX_PART_BYTES + 10))
        with open(p, "wb") as fh:
            fh.write(buf.getvalue())
        try:
            read_package(p)
            assert False, "should have refused oversized part"
        except XmlSecurityError:
            pass


def test_group_nesting_preserved():
    deck = {"schema": "lecturn.deck/1", "id": "d", "title": "G",
            "canvas": {"w": 1280, "h": 720}, "theme": {"tokens": {"colors": {}}},
            "slides": [{"id": "s1", "elements": [
                {"id": "outer", "type": "group", "layout": {"x": 0, "y": 0, "w": 600, "h": 400, "z": 1}},
                {"id": "inner", "type": "group", "groupId": "outer",
                 "layout": {"x": 50, "y": 50, "w": 300, "h": 200, "z": 1}},
                {"id": "leaf", "type": "text", "groupId": "inner",
                 "layout": {"x": 60, "y": 60, "w": 200, "h": 80, "z": 1}, "text": "deep"},
            ]}]}
    assert validate_deck(deck) == []
    with tempfile.TemporaryDirectory() as d:
        pptx = os.path.join(d, "o.pptx")
        deck_to_pptx(deck, pptx, None)
        back, _ = pptx_to_deck(pptx)
        leaves = [e for s in back["slides"] for e in s["elements"] if e.get("type") == "text"]
        assert any(e.get("groupId") for e in leaves), "nested child lost its group membership"


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    failed = 0
    for fn in fns:
        try:
            fn()
            print(f"PASS {fn.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL {fn.__name__}: {e}")
    print(f"\n{len(fns) - failed}/{len(fns)} passed")
    sys.exit(1 if failed else 0)
