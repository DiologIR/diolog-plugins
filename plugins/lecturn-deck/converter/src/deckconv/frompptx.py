"""``from-pptx``: convert a .pptx package into a ``lecturn.deck/1`` JSON deck.

Handles the common construct set natively (text, shapes, images, tables, groups,
connectors, backgrounds, notes, theme, document properties, slide size) and
CARRIES the long tail verbatim with an honest ImportReport entry — never a silent
drop, never a fabricated element. Mirrors the GridMD F0–F3 fidelity discipline.
"""

from __future__ import annotations

import posixpath
from typing import Any
from xml.etree import ElementTree as ET

from . import ooxml
from .ooxml import (
    Package, emu_to_px, emu_line_to_px, rot_to_deg, pt_to_px, parse_color,
    find, findall, rattr, read_package, parse_rels, resolve_target,
)

TEXT_PH = {"title", "ctrTitle", "subTitle", "body"}
GEOM_KIND = {
    "rect": "rect", "roundRect": "round-rect", "ellipse": "ellipse",
    "triangle": "triangle", "isoscelesTriangle": "triangle",
}
DASH_MAP = {
    "solid": "solid", "dash": "dash", "dot": "dot", "dashDot": "dashDot",
    "lgDash": "lgDash", "sysDash": "sysDash", "sysDot": "dot",
}
MEDIA_CT = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".gif": "image/gif", ".bmp": "image/bmp", ".svg": "image/svg+xml",
    ".emf": "image/x-emf", ".wmf": "image/x-wmf", ".tiff": "image/tiff",
    ".mp4": "video/mp4", ".mov": "video/quicktime", ".m4v": "video/mp4",
}


def _ln(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


class Reader:
    def __init__(self, pkg: Package):
        self.pkg = pkg
        self.assets: dict[str, bytes] = {}          # asset filename -> bytes
        self.notes: list[dict] = []                 # import report notes
        self.counts = {"F0": 0, "F1": 0, "F2": 0, "F3": 0}
        self._eid = 0
        self._sid = 0

    # -- ids / reporting ----------------------------------------------------
    def eid(self) -> str:
        self._eid += 1
        return f"el_{self._eid}"

    def report(self, cls: str, construct: str, message: str, slide_id=None, el_id=None):
        self.counts[cls] = self.counts.get(cls, 0) + 1
        self.notes.append({
            "class": cls, "construct": construct, "message": message,
            **({"slideId": slide_id} if slide_id else {}),
            **({"elementId": el_id} if el_id else {}),
        })

    # -- top level ----------------------------------------------------------
    def build(self) -> dict:
        pres = self.pkg.xml("ppt/presentation.xml")
        if pres is None:
            raise ValueError("not a PowerPoint package: ppt/presentation.xml missing")

        cx, cy = ooxml.DEFAULT_SLIDE_EMU
        sldsz = find(pres, "p:sldSz")
        if sldsz is not None:
            cx = int(sldsz.get("cx", cx)); cy = int(sldsz.get("cy", cy))
        canvas = {"w": emu_to_px(cx), "h": emu_to_px(cy)}
        ratio = self._ratio(canvas["w"], canvas["h"])

        deck: dict[str, Any] = {
            "schema": "lecturn.deck/1",
            "id": "dck_import",
            "title": self._title(),
            "canvas": canvas,
            "theme": self._theme(),
            "slides": [],
        }
        meta = self._meta()
        if meta:
            deck["meta"] = meta

        pres_rels = parse_rels(self.pkg, "ppt/presentation.xml")
        for sldId in findall(find(pres, "p:sldIdLst"), "p:sldId"):
            rid = rattr(sldId, "id")
            rel = pres_rels.get(rid)
            if not rel:
                continue
            part = resolve_target("ppt/presentation.xml", rel["target"])
            slide = self._slide(part)
            if slide:
                deck["slides"].append(slide)

        deck["import"] = {
            "source": {"kind": "pptx", "filename": None, "application": (meta or {}).get("application")},
            "originalSize": {"w": canvas["w"], "h": canvas["h"], "type": ratio},
            "emuPerPx": ooxml.EMU_PER_PX,
            "counts": self.counts,
            "notes": self.notes,
        }
        return deck

    @staticmethod
    def _ratio(w: float, h: float) -> str:
        if h and abs(w / h - 16 / 9) < 0.02:
            return "16:9"
        if h and abs(w / h - 4 / 3) < 0.02:
            return "4:3"
        return "custom"

    def _title(self) -> str:
        core = self.pkg.xml("docProps/core.xml")
        t = find(core, "dc:title") if core is not None else None
        if t is not None and t.text:
            return t.text
        return "Imported presentation"

    def _meta(self) -> dict:
        out: dict[str, Any] = {}
        core = self.pkg.xml("docProps/core.xml")
        if core is not None:
            for tag, key in (("dc:creator", "author"), ("dc:subject", "subject"),
                             ("dcterms:created", "created"), ("dcterms:modified", "modified")):
                n = find(core, tag)
                if n is not None and n.text:
                    out[key] = n.text
        app = self.pkg.xml("docProps/app.xml")
        if app is not None:
            a = find(app, "ep:Application")
            if a is not None and a.text:
                out["application"] = a.text
        return out

    # -- theme --------------------------------------------------------------
    def _theme(self) -> dict:
        theme_xml = self.pkg.xml("ppt/theme/theme1.xml")
        colors: dict[str, str] = {}
        typo: dict[str, Any] = {}
        if theme_xml is not None:
            scheme = find(theme_xml, ".//a:clrScheme")
            for child in (scheme or []):
                slot = _ln(child.tag)
                token = ooxml.SCHEME_TO_TOKEN.get(slot)
                col = parse_color(child)
                if token and isinstance(col, str):
                    colors[token] = col.lower()
            fonts = find(theme_xml, ".//a:fontScheme")
            major = find(fonts, "a:majorFont/a:latin") if fonts is not None else None
            minor = find(fonts, "a:minorFont/a:latin") if fonts is not None else None
            if major is not None and major.get("typeface"):
                typo["heading"] = {"family": major.get("typeface")}
            if minor is not None and minor.get("typeface"):
                typo["body"] = {"family": minor.get("typeface")}
        tokens = {"colors": colors, "typography": typo}
        design_md = self._design_md(colors, typo)
        return {"designMd": design_md, "tokens": tokens,
                "source": {"kind": "deck", "ref": "imported.pptx"}}

    @staticmethod
    def _design_md(colors: dict, typo: dict) -> str:
        lines = ["---", "name: Imported", "source: pptx", "colors:"]
        for k, v in colors.items():
            lines.append(f"  {k}: \"{v}\"")
        lines += ["---", "", "# Imported theme",
                  "", "Reverse-engineered from an imported PowerPoint theme."]
        if typo.get("heading"):
            lines.append(f"Heading font: {typo['heading']['family']}.")
        if typo.get("body"):
            lines.append(f"Body font: {typo['body']['family']}.")
        return "\n".join(lines)

    # -- slide --------------------------------------------------------------
    def _slide(self, part: str) -> dict | None:
        root = self.pkg.xml(part)
        if root is None:
            return None
        self._sid += 1
        sid = f"sld_{self._sid}"
        rels = parse_rels(self.pkg, part)
        ph_geom = self._layout_placeholders(part, rels)

        slide: dict[str, Any] = {"id": sid, "name": f"Slide {self._sid}", "elements": []}
        csld = find(root, "p:cSld")

        bg = self._background(find(csld, "p:bg"))
        if bg:
            slide["background"] = bg

        sptree = find(csld, "p:spTree")
        z = 0
        for child in (sptree or []):
            tag = _ln(child.tag)
            if tag in ("nvGrpSpPr", "grpSpPr"):
                continue
            z += 1
            els = self._element(child, tag, sid, part, rels, ph_geom, z, transform=None)
            slide["elements"].extend(els)

        notes = self._notes(part, rels)
        if notes:
            slide["speakerNotes"] = notes

        if not slide["elements"]:
            # A visually-empty slide is legal but must render; add nothing fake — report it.
            self.report("F0", "empty slide", "Slide had no shapes.", sid)
        return slide

    def _element(self, node, tag, sid, part, rels, ph_geom, z, transform):
        try:
            if tag == "sp":
                return self._sp(node, sid, ph_geom, z, transform)
            if tag == "pic":
                return self._pic(node, sid, part, rels, z, transform)
            if tag == "graphicFrame":
                return self._graphic_frame(node, sid, part, rels, z, transform)
            if tag == "grpSp":
                return self._group(node, sid, part, rels, ph_geom, z, transform)
            if tag == "cxnSp":
                return self._connector(node, sid, z, transform)
            # unknown top-level element — carry verbatim
            self.report("F3", tag, f"Unrecognized shape <p:{tag}> carried verbatim.", sid)
            return [{
                "id": self.eid(), "type": "image",
                "layout": self._apply(transform, {"x": 0, "y": 0, "w": 200, "h": 120, "z": z}),
                "alt": f"Unsupported PPTX element: {tag}",
                "carry": [{"class": "F3", "reason": f"p:{tag}",
                           "ooxml": ET.tostring(node, encoding="unicode")}],
            }]
        except ooxml.XmlSecurityError:
            raise
        except Exception as exc:  # never let one malformed shape abort the deck
            self.report("F3", tag, f"Failed to convert <p:{tag}>: {exc}", sid)
            return []

    # -- geometry -----------------------------------------------------------
    def _xfrm(self, spPr, ph_key=None, ph_geom=None) -> dict:
        xfrm = find(spPr, "a:xfrm") if spPr is not None else None
        if xfrm is None and ph_geom and ph_key in ph_geom:
            return dict(ph_geom[ph_key])
        if xfrm is None:
            return {"x": 0.0, "y": 0.0, "w": 200.0, "h": 100.0, "rotation": 0.0,
                    "flipH": False, "flipV": False}
        off = find(xfrm, "a:off"); ext = find(xfrm, "a:ext")
        out = {
            "x": emu_to_px(off.get("x")) if off is not None else 0.0,
            "y": emu_to_px(off.get("y")) if off is not None else 0.0,
            "w": emu_to_px(ext.get("cx")) if ext is not None else 100.0,
            "h": emu_to_px(ext.get("cy")) if ext is not None else 100.0,
        }
        rot = rot_to_deg(xfrm.get("rot"))
        if rot:
            out["rotation"] = rot
        if xfrm.get("flipH") in ("1", "true"):
            out["flipH"] = True
        if xfrm.get("flipV") in ("1", "true"):
            out["flipV"] = True
        return out

    @staticmethod
    def _apply(transform, layout: dict) -> dict:
        """Flatten a child layout through an accumulated group transform."""
        if not transform:
            return layout
        ox, oy, chx, chy, sx, sy = transform
        out = dict(layout)
        out["x"] = round(ox + (layout["x"] - chx) * sx, 2)
        out["y"] = round(oy + (layout["y"] - chy) * sy, 2)
        out["w"] = round(layout["w"] * sx, 2)
        out["h"] = round(layout["h"] * sy, 2)
        return out

    # -- shapes / text ------------------------------------------------------
    def _sp(self, sp, sid, ph_geom, z, transform):
        nv = find(sp, "p:nvSpPr")
        cnv = find(nv, "p:cNvSpPr")
        is_txbox = cnv is not None and cnv.get("txBox") == "1"
        ph = find(nv, "p:nvPr/p:ph")
        ph_type = ph.get("type") if ph is not None else None
        ph_idx = ph.get("idx") if ph is not None else None
        ph_key = (ph_type or "body", ph_idx)

        spPr = find(sp, "p:spPr")
        layout = self._apply(transform, {**self._xfrm(spPr, ph_key, ph_geom), "z": z})
        prst = None
        geom = find(spPr, "a:prstGeom")
        if geom is not None:
            prst = geom.get("prst")

        txBody = find(sp, "p:txBody")
        plain, rich = self._text(txBody) if txBody is not None else ("", [])
        fill = self._fill(spPr)
        stroke = self._stroke(spPr)

        base = {"id": self.eid(), "layout": layout}
        if ph_type:
            base["componentRole"] = ph_type
        link = self._hlink(cnv)
        if link:
            base["link"] = link

        text_like = is_txbox or ph_type in TEXT_PH
        shape_like = (prst and prst != "rect") or (fill and fill.get("type") != "none") or stroke

        if text_like or (plain and not shape_like):
            el = {**base, "type": "text", "text": plain}
            self._apply_text_core(el, rich)
            if rich:
                el["rich"] = {"paragraphs": rich}
            if fill:
                el["fill"] = fill
            if stroke:
                el["stroke"] = stroke
            self.counts["F0"] += 1
            return [el]

        kind = GEOM_KIND.get(prst, "preset" if prst else "rect")
        el = {**base, "type": "shape", "shape": kind}
        if kind == "preset":
            el["preset"] = prst
            self.counts["F1"] += 1
        else:
            self.counts["F0"] += 1
        if fill:
            el["fill"] = fill
        if stroke:
            el["stroke"] = stroke
        if plain:
            el["text"] = {"paragraphs": rich} if rich else plain
        return [el]

    def _apply_text_core(self, el, paragraphs):
        """Lift a few core fields off the first run/paragraph for lean editing."""
        if not paragraphs:
            return
        p0 = paragraphs[0]
        if p0.get("align"):
            el["align"] = p0["align"]
        runs = p0.get("runs") or []
        if runs:
            r0 = runs[0]
            for src, dst in (("size", "size"), ("color", "color"), ("font", "font"),
                             ("tracking", "tracking")):
                if r0.get(src) is not None:
                    el[dst] = r0[src]
            if r0.get("bold"):
                el["weight"] = "bold"

    def _text(self, txBody):
        paragraphs = []
        plain_lines = []
        for p in findall(txBody, "a:p"):
            pPr = find(p, "a:pPr")
            runs = []
            parts = []
            for child in p:
                t = _ln(child.tag)
                if t == "r":
                    run = self._run(child)
                    runs.append(run)
                    parts.append(run["text"])
                elif t == "br":
                    runs.append({"text": "\n"})
                    parts.append("\n")
                elif t == "fld":
                    tt = find(child, "a:t")
                    txt = (tt.text or "") if tt is not None else ""
                    runs.append({"text": txt})
                    parts.append(txt)
            para = {"runs": runs}
            if pPr is not None:
                algn = pPr.get("algn")
                para["align"] = {"l": "left", "ctr": "center", "r": "right",
                                 "just": "justify", "dist": "distributed"}.get(algn) or None
                if para["align"] is None:
                    del para["align"]
                if pPr.get("lvl"):
                    para["level"] = int(pPr.get("lvl"))
            paragraphs.append(para)
            plain_lines.append("".join(parts))
        return "\n".join(plain_lines), paragraphs

    def _run(self, r):
        rPr = find(r, "a:rPr")
        t = find(r, "a:t")
        run = {"text": (t.text or "") if t is not None else ""}
        if rPr is None:
            return run
        if rPr.get("b") in ("1", "true"):
            run["bold"] = True
        if rPr.get("i") in ("1", "true"):
            run["italic"] = True
        u = rPr.get("u")
        if u and u != "none":
            run["underline"] = "double" if u == "dbl" else "single"
        s = rPr.get("strike")
        if s and s != "noStrike":
            run["strike"] = "single"
        if rPr.get("sz"):
            run["size"] = pt_to_px(int(rPr.get("sz")) / 100)
        if rPr.get("spc"):
            run["tracking"] = round(int(rPr.get("spc")) / 100, 2)
        col = parse_color(find(rPr, "a:solidFill"))
        if col is not None:
            run["color"] = col
        latin = find(rPr, "a:latin")
        if latin is not None and latin.get("typeface"):
            run["font"] = latin.get("typeface")
        link = self._hlink_el(find(rPr, "a:hlinkClick"))
        if link:
            run["link"] = link
        return run

    # -- fills / strokes ----------------------------------------------------
    def _fill(self, spPr):
        if spPr is None:
            return None
        if find(spPr, "a:noFill") is not None:
            return {"type": "none"}
        sf = find(spPr, "a:solidFill")
        if sf is not None:
            return {"type": "solid", "color": parse_color(sf)}
        gf = find(spPr, "a:gradFill")
        if gf is not None:
            stops = []
            for gs in findall(gf, "a:gsLst/a:gs"):
                stops.append({"pos": round(int(gs.get("pos", "0")) / 1000, 2),
                              "color": parse_color(gs)})
            lin = find(gf, "a:lin")
            grad = {"kind": "linear", "stops": stops}
            if lin is not None and lin.get("ang"):
                grad["angle"] = rot_to_deg(lin.get("ang"))
            return {"type": "gradient", "gradient": grad}
        pf = find(spPr, "a:pattFill")
        if pf is not None:
            return {"type": "pattern", "pattern": {
                "preset": pf.get("prst", "pct50"),
                "fg": parse_color(find(pf, "a:fgClr")),
                "bg": parse_color(find(pf, "a:bgClr"))}}
        return None

    def _stroke(self, spPr):
        ln = find(spPr, "a:ln") if spPr is not None else None
        if ln is None:
            return None
        if find(ln, "a:noFill") is not None:
            return None
        stroke = {}
        if ln.get("w"):
            stroke["width"] = emu_line_to_px(ln.get("w"))
        col = parse_color(find(ln, "a:solidFill"))
        if col is not None:
            stroke["color"] = col
        dash = find(ln, "a:prstDash")
        if dash is not None and dash.get("val"):
            stroke["dash"] = DASH_MAP.get(dash.get("val"), "solid")
        for end, key in (("a:headEnd", "headEnd"), ("a:tailEnd", "tailEnd")):
            e = find(ln, end)
            if e is not None and e.get("type") and e.get("type") != "none":
                stroke[key] = {"type": {"triangle": "triangle", "arrow": "arrow",
                                        "stealth": "stealth", "diamond": "diamond",
                                        "oval": "oval"}.get(e.get("type"), "triangle")}
        return stroke or None

    # -- picture ------------------------------------------------------------
    def _pic(self, pic, sid, part, rels, z, transform):
        spPr = find(pic, "p:spPr")
        layout = self._apply(transform, {**self._xfrm(spPr), "z": z})
        blip = find(pic, "p:blipFill/a:blip")
        el = {"id": self.eid(), "type": "image", "layout": layout,
              "provenance": "imported:pptx", "imageKind": "imported"}
        nv = find(pic, "p:nvPicPr/p:cNvPr")
        if nv is not None and (nv.get("descr") or nv.get("title")):
            el["alt"] = nv.get("descr") or nv.get("title")

        rid = rattr(blip, "embed") if blip is not None else None
        rel = rels.get(rid) if rid else None
        if rel and rel.get("mode") != "External":
            tgt = resolve_target(part, rel["target"])
            data = self.pkg.parts.get(tgt)
            if data is not None:
                fname = posixpath.basename(tgt)
                ext = posixpath.splitext(fname)[1].lower()
                asset_name = f"{el['id']}{ext}"
                self.assets[asset_name] = data
                el["url"] = f"assets/{asset_name}"
                el["assetId"] = el["id"]
                el["asset"] = {"pathname": f"assets/{asset_name}",
                               "contentType": MEDIA_CT.get(ext, "application/octet-stream"),
                               "byteSize": len(data), "width": 0, "height": 0}
                self.counts["F0"] += 1
        elif rel and rel.get("mode") == "External":
            el["url"] = rel["target"]
            self.counts["F0"] += 1
        else:
            el["alt"] = el.get("alt", "Image (source not found)")
            self.report("F3", "picture", "Image blip had no resolvable source.", sid, el["id"])

        src = find(pic, "p:blipFill/a:srcRect")
        if src is not None:
            crop = {}
            for a, k in (("l", "l"), ("t", "t"), ("r", "r"), ("b", "b")):
                if src.get(a):
                    crop[k] = round(int(src.get(a)) / 1000, 2)
            if crop:
                el["crop"] = crop
        return [el]

    # -- graphic frame (table / chart / diagram / ole) ----------------------
    def _graphic_frame(self, gf, sid, part, rels, z, transform):
        xfrm = find(gf, "p:xfrm")
        layout = {"x": 0.0, "y": 0.0, "w": 400.0, "h": 300.0, "z": z}
        if xfrm is not None:
            off = find(xfrm, "a:off"); ext = find(xfrm, "a:ext")
            if off is not None:
                layout["x"] = emu_to_px(off.get("x")); layout["y"] = emu_to_px(off.get("y"))
            if ext is not None:
                layout["w"] = emu_to_px(ext.get("cx")); layout["h"] = emu_to_px(ext.get("cy"))
        layout = self._apply(transform, layout)
        data = find(gf, "a:graphic/a:graphicData")
        uri = data.get("uri") if data is not None else ""

        if uri and uri.endswith("/table"):
            return [self._table(find(data, "a:tbl"), layout)]
        if uri and uri.endswith("/chart"):
            return [self._chart(data, part, rels, layout, sid)]
        # SmartArt diagram / OLE / other → carry + honest placeholder
        construct = "SmartArt diagram" if uri.endswith("/diagram") else "embedded object"
        self.report("F3", construct,
                    f"{construct} carried for round-trip; not natively rendered.", sid)
        return [{"id": self.eid(), "type": "image", "layout": layout,
                 "alt": f"{construct} (not rendered)",
                 "carry": [{"class": "F3", "reason": uri,
                            "ooxml": ET.tostring(gf, encoding="unicode")}]}]

    def _table(self, tbl, layout):
        eid = self.eid()
        el = {"id": eid, "type": "table", "layout": layout, "rows": []}
        grid = [emu_to_px(gc.get("w")) for gc in findall(tbl, "a:tblGrid/a:gridCol")]
        if grid:
            el["columns"] = [{"w": w} for w in grid]
        tblPr = find(tbl, "a:tblPr")
        if tblPr is not None and tblPr.get("firstRow") in ("1", "true"):
            el["headerRow"] = True
        row_heights = []
        for tr in findall(tbl, "a:tr"):
            row_heights.append(emu_to_px(tr.get("h")))
            cells = []
            for tc in findall(tr, "a:tc"):
                if tc.get("hMerge") in ("1", "true") or tc.get("vMerge") in ("1", "true"):
                    cells.append({"merged": True})
                    continue
                plain, rich = self._text(find(tc, "a:txBody"))
                cell: dict[str, Any] = {}
                if rich and any(len(p.get("runs", [])) for p in rich):
                    cell["rich"] = {"paragraphs": rich}
                cell["text"] = plain
                if tc.get("gridSpan"):
                    cell["colSpan"] = int(tc.get("gridSpan"))
                if tc.get("rowSpan"):
                    cell["rowSpan"] = int(tc.get("rowSpan"))
                tcPr = find(tc, "a:tcPr")
                cfill = self._fill(tcPr) if tcPr is not None else None
                if cfill and cfill.get("type") == "solid":
                    cell["fill"] = cfill
                # collapse to a bare string when there is no styling
                if set(cell) <= {"text"}:
                    cells.append(plain)
                else:
                    cells.append(cell)
            el["rows"].append(cells)
        if any(row_heights):
            el["rowHeights"] = row_heights
        self.counts["F0"] += 1
        return el

    def _chart(self, data, part, rels, layout, sid):
        eid = self.eid()
        el = {"id": eid, "type": "chart", "chart": "bar", "series": [], "layout": layout}
        chart_ref = find(data, "c:chart")
        rid = rattr(chart_ref, "id") if chart_ref is not None else None
        rel = rels.get(rid) if rid else None
        if rel:
            cpart = resolve_target(part, rel["target"])
            croot = self.pkg.xml(cpart)
            if croot is not None:
                self._chart_data(croot, el)
                el["carry"] = [{"class": "F1", "reason": "chart",
                                "part": {"path": cpart, "encoding": "utf8",
                                         "data": self.pkg.text(cpart) or ""}}]
        self.report("F1", "chart",
                    "Chart data extracted; exact chart XML carried for lossless re-emit.", sid, eid)
        return el

    def _chart_data(self, croot, el):
        kind_map = {"barChart": "bar", "lineChart": "line", "pieChart": "pie",
                    "areaChart": "area", "scatterChart": "scatter", "doughnutChart": "donut"}
        for tag, kind in kind_map.items():
            plot = find(croot, f".//c:{tag}")
            if plot is not None:
                el["chart"] = kind
                bardir = find(plot, "c:barDir")
                if kind == "bar" and bardir is not None and bardir.get("val") == "col":
                    el["chart"] = "column"
                cats = []
                series = []
                for ser in findall(plot, "c:ser"):
                    name_el = find(ser, "c:tx//c:v")
                    vals = [float(v.text) for v in findall(ser, "c:val//c:pt/c:v") if v.text]
                    if not cats:
                        cats = [c.text or "" for c in findall(ser, "c:cat//c:pt/c:v")]
                    series.append({"name": name_el.text if name_el is not None else None,
                                   "values": vals})
                if cats:
                    el["categories"] = cats
                el["series"] = series
                data = {"categories": cats,
                        "series": [{"name": s["name"], "points": s["values"]} for s in series]}
                el["data"] = data
                return

    # -- group / connector --------------------------------------------------
    def _group(self, grp, sid, part, rels, ph_geom, z, transform):
        grpSpPr = find(grp, "p:grpSpPr")
        xfrm = find(grpSpPr, "a:xfrm")
        gbox = self._apply(transform, {**self._xfrm(grpSpPr), "z": z})
        eid = self.eid()
        group_el = {"id": eid, "type": "group", "layout": gbox}

        child_tf = transform
        choff = find(xfrm, "a:chOff") if xfrm is not None else None
        chext = find(xfrm, "a:chExt") if xfrm is not None else None
        off = find(xfrm, "a:off") if xfrm is not None else None
        ext = find(xfrm, "a:ext") if xfrm is not None else None
        if all(n is not None for n in (choff, chext, off, ext)):
            ox, oy = emu_to_px(off.get("x")), emu_to_px(off.get("y"))
            chx, chy = emu_to_px(choff.get("x")), emu_to_px(choff.get("y"))
            cw = emu_to_px(chext.get("cx")) or 1
            ch = emu_to_px(chext.get("cy")) or 1
            sx = (emu_to_px(ext.get("cx")) or cw) / cw
            sy = (emu_to_px(ext.get("cy")) or ch) / ch
            local = (ox, oy, chx, chy, sx, sy)
            child_tf = local if transform is None else self._compose(transform, local)
            group_el["groupTransform"] = {"childOffset": {"x": chx, "y": chy},
                                          "childExtent": {"w": cw, "h": ch}}

        out = [group_el]
        zc = 0
        for child in grp:
            t = _ln(child.tag)
            if t in ("nvGrpSpPr", "grpSpPr"):
                continue
            zc += 1
            for ce in self._element(child, t, sid, part, rels, ph_geom, zc, child_tf):
                ce.setdefault("groupId", eid)   # nested groups keep their innermost parent
                out.append(ce)
        self.counts["F0"] += 1
        return out

    @staticmethod
    def _compose(outer, inner):
        # apply inner (child-space→group px) then outer (group px→canvas px)
        ox2, oy2, chx2, chy2, sx2, sy2 = outer
        ox1, oy1, chx1, chy1, sx1, sy1 = inner

        # Represent composition as an equivalent single transform on a point p:
        #   inner: a = o1 + (p - ch1)*s1 ;  outer: b = o2 + (a - ch2)*s2
        # => b = (o2 + (o1 - ch2)*s2 - ch1*s1*s2) + p*s1*s2, matched to o + (p-ch)*s form
        sx, sy = sx1 * sx2, sy1 * sy2
        chx, chy = chx1, chy1
        ox = ox2 + (ox1 - chx2) * sx2
        oy = oy2 + (oy1 - chy2) * sy2
        return (ox, oy, chx, chy, sx, sy)

    def _connector(self, cxn, sid, z, transform):
        spPr = find(cxn, "p:spPr")
        layout = self._apply(transform, {**self._xfrm(spPr), "z": z})
        stroke = self._stroke(spPr) or {"width": 1}
        el = {"id": self.eid(), "type": "line", "layout": layout, "stroke": stroke}
        if stroke.get("headEnd") or stroke.get("tailEnd"):
            el["variant"] = "line-arrow"
        self.counts["F0"] += 1
        return [el]

    # -- background / notes / hyperlinks ------------------------------------
    def _background(self, bg):
        if bg is None:
            return None
        bgPr = find(bg, "p:bgPr")
        fill = self._fill(bgPr) if bgPr is not None else None
        if fill:
            return {"fill": fill}
        return None

    def _notes(self, part, rels):
        for rel in rels.values():
            if rel["type"].endswith("/notesSlide"):
                npart = resolve_target(part, rel["target"])
                nroot = self.pkg.xml(npart)
                if nroot is None:
                    continue
                for sp in findall(nroot, ".//p:sp"):
                    ph = find(sp, "p:nvSpPr/p:nvPr/p:ph")
                    if ph is not None and ph.get("type") == "body":
                        plain, rich = self._text(find(sp, "p:txBody"))
                        if plain.strip():
                            return {"paragraphs": rich} if rich else plain
        return None

    def _hlink(self, cnv):
        return self._hlink_el(find(cnv, "a:hlinkClick") if cnv is not None else None)

    def _hlink_el(self, h):
        if h is None:
            return None
        rid = rattr(h, "id")
        if rid:
            return {"action": {"kind": "url", "href": f"rel:{rid}"}}
        return None

    # -- inherited placeholder geometry -------------------------------------
    def _layout_placeholders(self, slide_part, rels):
        geom = {}
        layout_part = None
        for rel in rels.values():
            if rel["type"].endswith("/slideLayout"):
                layout_part = resolve_target(slide_part, rel["target"])
                break
        for src in (layout_part,) + self._masters(layout_part):
            if not src:
                continue
            root = self.pkg.xml(src)
            for sp in findall(root, ".//p:sp"):
                ph = find(sp, "p:nvSpPr/p:nvPr/p:ph")
                if ph is None:
                    continue
                key = (ph.get("type") or "body", ph.get("idx"))
                spPr = find(sp, "p:spPr")
                xfrm = find(spPr, "a:xfrm") if spPr is not None else None
                if xfrm is not None and key not in geom:
                    geom[key] = {k: v for k, v in self._xfrm(spPr).items()}
        return geom

    def _masters(self, layout_part):
        if not layout_part:
            return ()
        for rel in parse_rels(self.pkg, layout_part).values():
            if rel["type"].endswith("/slideMaster"):
                return (resolve_target(layout_part, rel["target"]),)
        return ()


def pptx_to_deck(path: str) -> tuple[dict, dict[str, bytes]]:
    """Return ``(deck_dict, {asset_filename: bytes})``."""
    reader = Reader(read_package(path))
    deck = reader.build()
    return deck, reader.assets
