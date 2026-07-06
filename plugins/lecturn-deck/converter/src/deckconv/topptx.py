"""``to-pptx``: build a valid .pptx package from a ``lecturn.deck/1`` JSON deck.

Emits a minimal-but-valid OOXML package (content-types, one master/layout, a
theme built from the deck tokens, per-slide shape trees, embedded media, tables,
groups, native charts, and notes). Carried source fragments (F1/F3) are re-emitted
verbatim for lossless round-trips. Lecturn-native elements with no PowerPoint
equivalent (stat/widget/embed) are rendered as an honest static projection and
noted in the export report — never silently dropped.

Structural validity is what this module guarantees (well-formed parts, correct
rels, content-type coverage). It does NOT claim "opens in PowerPoint" — that is
only ever verified by opening it in PowerPoint.
"""

from __future__ import annotations

import os
import posixpath
import re
from typing import Any

from .ooxml import (
    XML_DECL, esc, color_to_xml, px_to_emu, deg_to_rot, px_to_pt,
    _color_child_xml,
)

# --- default Office palette / fonts (used when a token is absent) ----------
_DEFAULT_SCHEME = {
    "text1": "000000", "bg1": "FFFFFF", "text2": "44546A", "bg2": "E7E6E6",
    "accent1": "4472C4", "accent2": "ED7D31", "accent3": "A5A5A5",
    "accent4": "FFC000", "accent5": "5B9BD5", "accent6": "70AD47",
    "hyperlink": "0563C1", "followedHyperlink": "954F72",
}
_KIND_PRST = {
    "rect": "rect", "round-rect": "roundRect", "ellipse": "ellipse",
    "triangle": "triangle", "ring": "donut", "line-arrow": "rightArrow",
}
_MEDIA_CT = {
    "png": "image/png", "jpeg": "image/jpeg", "jpg": "image/jpeg", "gif": "image/gif",
    "bmp": "image/bmp", "svg": "image/svg+xml", "tiff": "image/tiff",
    "emf": "image/x-emf", "wmf": "image/x-wmf",
}


class Writer:
    def __init__(self, deck: dict, assets_base: str | None):
        self.deck = deck
        self.assets_base = assets_base
        self.parts: dict[str, bytes] = {}
        self.report: list[str] = []
        self._cnvid = 1
        self._media_seq = 0
        self._chart_seq = 0

    def nid(self) -> int:
        self._cnvid += 1
        return self._cnvid

    # -- public -------------------------------------------------------------
    def build(self) -> tuple[dict[str, bytes], list[str]]:
        slides = self.deck.get("slides", [])
        canvas = self.deck.get("canvas", {"w": 1280, "h": 720})
        cx, cy = px_to_emu(canvas["w"]), px_to_emu(canvas["h"])

        media_exts: set[str] = set()
        chart_parts: list[str] = []
        note_slides: list[int] = []

        # slides + their notes
        for i, slide in enumerate(slides, 1):
            self._slide(i, slide, media_exts, chart_parts, note_slides)

        has_notes = bool(note_slides)
        self._skeleton(cx, cy, len(slides), has_notes, media_exts, chart_parts, note_slides)
        return self.parts, self.report

    # -- per-slide ----------------------------------------------------------
    def _slide(self, idx, slide, media_exts, chart_parts, note_slides):
        rels = ['<Relationship Id="rId1" '
                'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" '
                'Target="../slideLayouts/slideLayout1.xml"/>']
        rid = [1]

        def next_rid() -> str:
            rid[0] += 1
            return f"rId{rid[0]}"

        ctx = _SlideCtx(next_rid, rels, media_exts, chart_parts, self)
        elements = slide.get("elements", [])
        shapes = self._tree(elements, ctx)

        bg = self._background_xml(slide.get("background"))

        # notes
        notes = slide.get("speakerNotes")
        if notes:
            nrid = next_rid()
            self._notes_slide(idx, notes, nrid)
            rels.append(f'<Relationship Id="{nrid}" '
                        f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" '
                        f'Target="../notesSlides/notesSlide{idx}.xml"/>')
            note_slides.append(idx)

        xml = (
            f'{XML_DECL}<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            f'<p:cSld>{bg}<p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
            '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'
            f'{shapes}</p:spTree></p:cSld><p:clrMapOvr><a:overrideClrMapping/></p:clrMapOvr></p:sld>'
        )
        # a blank clrMapOvr override is invalid; use masterClrMapping instead
        xml = xml.replace('<a:overrideClrMapping/>', '<a:masterClrMapping/>')
        self.parts[f"ppt/slides/slide{idx}.xml"] = xml.encode("utf-8")
        self.parts[f"ppt/slides/_rels/slide{idx}.xml.rels"] = self._rels_doc(rels)

    def _tree(self, elements, ctx) -> str:
        """Rebuild the group hierarchy from flat elements + groupId, emit spTree XML."""
        by_id = {e["id"]: e for e in elements if "id" in e}
        children: dict[str, list] = {}
        roots = []
        for e in elements:
            gid = e.get("groupId")
            if gid and gid in by_id:
                children.setdefault(gid, []).append(e)
            else:
                roots.append(e)

        def zsort(lst):
            return sorted(lst, key=lambda e: e.get("layout", {}).get("z", 0))

        def emit(el) -> str:
            if el.get("type") == "group":
                kids = "".join(emit(c) for c in zsort(children.get(el["id"], [])))
                return self._group_xml(el, kids)
            return self._element_xml(el, ctx)

        return "".join(emit(e) for e in zsort(roots))

    # -- element dispatch ---------------------------------------------------
    def _element_xml(self, el, ctx) -> str:
        t = el.get("type")
        # verbatim re-emission of a carried raw shape (lossless round-trip)
        for c in el.get("carry", []) or []:
            if c.get("ooxml") and c.get("reason", "").startswith("p:"):
                return c["ooxml"]
        handler = {
            "text": self._text_xml, "shape": self._shape_xml, "image": self._image_xml,
            "line": self._line_xml, "table": self._table_xml, "stat": self._stat_xml,
            "chart": self._chart_xml, "widget": self._widget_xml, "embed": self._embed_xml,
        }.get(t)
        if not handler:
            self.report.append(f"skipped unknown element type: {t}")
            return ""
        return handler(el, ctx)

    # -- geometry -----------------------------------------------------------
    def _xfrm(self, layout: dict) -> str:
        x, y = px_to_emu(layout.get("x", 0)), px_to_emu(layout.get("y", 0))
        w, h = px_to_emu(layout.get("w", 100)), px_to_emu(layout.get("h", 100))
        attrs = ""
        if layout.get("rotation"):
            attrs += f' rot="{deg_to_rot(layout["rotation"])}"'
        if layout.get("flipH"):
            attrs += ' flipH="1"'
        if layout.get("flipV"):
            attrs += ' flipV="1"'
        return (f'<a:xfrm{attrs}><a:off x="{x}" y="{y}"/>'
                f'<a:ext cx="{w}" cy="{h}"/></a:xfrm>')

    # -- fills / strokes ----------------------------------------------------
    def _fill_xml(self, fill) -> str:
        if not fill:
            return ""
        t = fill.get("type")
        if t == "none":
            return "<a:noFill/>"
        if t == "solid":
            return color_to_xml(fill.get("color"), tag="a:solidFill") or ""
        if t == "gradient":
            g = fill["gradient"]
            stops = "".join(
                f'<a:gs pos="{int(s.get("pos", 0) * 1000)}">{_color_child_xml(s.get("color")) or ""}</a:gs>'
                for s in g.get("stops", []))
            ang = int((g.get("angle", 0) or 0) * 60000)
            return (f'<a:gradFill><a:gsLst>{stops}</a:gsLst>'
                    f'<a:lin ang="{ang}" scaled="1"/></a:gradFill>')
        if t == "pattern":
            p = fill["pattern"]
            fg = _color_child_xml(p.get("fg")) or '<a:srgbClr val="000000"/>'
            bg = _color_child_xml(p.get("bg")) or '<a:srgbClr val="FFFFFF"/>'
            return (f'<a:pattFill prst="{esc(p.get("preset", "pct50"))}">'
                    f'<a:fgClr>{fg}</a:fgClr><a:bgClr>{bg}</a:bgClr></a:pattFill>')
        return ""

    def _stroke_xml(self, stroke) -> str:
        if not stroke:
            return ""
        w = px_to_emu(stroke.get("width", 1))
        color = color_to_xml(stroke.get("color", "#000000"), tag="a:solidFill") or ""
        dash = ""
        if stroke.get("dash") and stroke["dash"] != "solid" and isinstance(stroke["dash"], str):
            dash = f'<a:prstDash val="{esc(stroke["dash"])}"/>'
        heads = ""
        for key, tag in (("headEnd", "a:headEnd"), ("tailEnd", "a:tailEnd")):
            if stroke.get(key):
                heads += f'<{tag} type="{esc(stroke[key].get("type", "triangle"))}"/>'
        return f'<a:ln w="{w}">{color}{dash}{heads}</a:ln>'

    # -- text ---------------------------------------------------------------
    def _paragraphs_xml(self, el) -> str:
        rich = el.get("rich")
        if rich and rich.get("paragraphs"):
            return "".join(self._para_xml(p, el) for p in rich["paragraphs"])
        text = el.get("text")
        if isinstance(text, dict):  # a RichText passed as `text`
            return "".join(self._para_xml(p, el) for p in text.get("paragraphs", []))
        lines = (text or "").split("\n") if text is not None else [""]
        return "".join(self._para_xml({"runs": [self._core_run(line, el)]}, el) for line in lines)

    def _core_run(self, line, el) -> dict:
        run = {"text": line}
        for k in ("size", "color", "font", "tracking"):
            if el.get(k) is not None:
                run[k] = el[k]
        if el.get("weight") in ("bold", "semibold", 700, 600) or el.get("weight") == "bold":
            run["bold"] = True
        return run

    def _para_xml(self, p, el) -> str:
        algn = {"left": "l", "center": "ctr", "right": "r",
                "justify": "just", "distributed": "dist"}.get(p.get("align") or el.get("align"))
        ppr = ""
        attrs = ""
        if algn:
            attrs += f' algn="{algn}"'
        if p.get("level"):
            attrs += f' lvl="{int(p["level"])}"'
        if attrs:
            ppr = f'<a:pPr{attrs}/>'
        runs = "".join(self._run_xml(r) for r in p.get("runs", []))
        if not runs:
            runs = '<a:endParaRPr lang="en-US"/>'
        return f'<a:p>{ppr}{runs}</a:p>'

    def _run_xml(self, r) -> str:
        if r.get("text") == "\n":
            return "<a:br/>"
        attrs = ' lang="en-US"'
        if r.get("bold"):
            attrs += ' b="1"'
        if r.get("italic"):
            attrs += ' i="1"'
        if r.get("underline") and r["underline"] != "none":
            attrs += f' u="{"dbl" if r["underline"] == "double" else "sng"}"'
        if r.get("strike") and r["strike"] != "none":
            attrs += ' strike="sngStrike"'
        if r.get("size"):
            attrs += f' sz="{int(round(px_to_pt(r["size"]) * 100))}"'
        if r.get("tracking"):
            attrs += f' spc="{int(round(r["tracking"] * 100))}"'
        inner = ""
        if r.get("color") is not None:
            inner += color_to_xml(r["color"], tag="a:solidFill") or ""
        if r.get("font"):
            inner += f'<a:latin typeface="{esc(r["font"])}"/>'
        rpr = f'<a:rPr{attrs}>{inner}</a:rPr>' if inner else f'<a:rPr{attrs}/>'
        return f'<a:r>{rpr}<a:t>{esc(r.get("text", ""))}</a:t></a:r>'

    def _body_pr(self, el) -> str:
        frame = el.get("frame", {})
        attrs = ' wrap="square" rtlCol="0"'
        anchor = {"top": "t", "middle": "ctr", "bottom": "b"}.get(frame.get("vAnchor"))
        if anchor:
            attrs += f' anchor="{anchor}"'
        ins = frame.get("insets", {})
        for k, a in (("l", "lIns"), ("t", "tIns"), ("r", "rIns"), ("b", "bIns")):
            if ins.get(k) is not None:
                attrs += f' {a}="{px_to_emu(ins[k])}"'
        autofit = {"shrink": "<a:normAutofit/>", "resize": "<a:spAutoFit/>",
                   "none": "<a:noAutofit/>"}.get(frame.get("autofit"), "<a:normAutofit/>")
        return f'<a:bodyPr{attrs}>{autofit}</a:bodyPr>'

    def _text_xml(self, el, ctx) -> str:
        nid = self.nid()
        return (
            f'<p:sp><p:nvSpPr><p:cNvPr id="{nid}" name="{esc(el.get("name", "Text"))}"/>'
            '<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr>{self._xfrm(el["layout"])}'
            '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
            f'{self._fill_xml(el.get("fill")) or "<a:noFill/>"}{self._stroke_xml(el.get("stroke"))}</p:spPr>'
            f'<p:txBody>{self._body_pr(el)}<a:lstStyle/>{self._paragraphs_xml(el)}</p:txBody></p:sp>'
        )

    # -- shapes -------------------------------------------------------------
    def _shape_xml(self, el, ctx) -> str:
        nid = self.nid()
        kind = el.get("shape", "rect")
        prst = _KIND_PRST.get(kind) or el.get("preset") or "rect"
        adj = ""
        if kind == "custom" and el.get("path"):
            self.report.append(f"custom geometry on {el['id']} approximated as rect")
        geom = f'<a:prstGeom prst="{esc(prst)}"><a:avLst/></a:prstGeom>'
        fill = self._fill_xml(el.get("fill"))
        if not fill:
            fill = "<a:noFill/>" if el.get("stroke") else '<a:solidFill><a:schemeClr val="accent1"/></a:solidFill>'
        stroke = self._stroke_xml(el.get("stroke"))
        txt = ""
        if el.get("text"):
            txt = (f'<p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/>'
                   f'{self._paragraphs_xml({"text": el["text"], "align": "center"})}</p:txBody>')
        else:
            txt = '<p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>'
        return (
            f'<p:sp><p:nvSpPr><p:cNvPr id="{nid}" name="{esc(el.get("name", "Shape"))}"/>'
            '<p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr>{self._xfrm(el["layout"])}{geom}{fill}{stroke}</p:spPr>{txt}</p:sp>'
        )

    def _line_xml(self, el, ctx) -> str:
        nid = self.nid()
        stroke = el.get("stroke") or {"width": 1, "color": "#000000"}
        if el.get("variant") == "line-arrow" and not stroke.get("tailEnd"):
            stroke = {**stroke, "tailEnd": {"type": "triangle"}}
        return (
            f'<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="{nid}" name="{esc(el.get("name", "Line"))}"/>'
            '<p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr>'
            f'<p:spPr>{self._xfrm(el["layout"])}'
            '<a:prstGeom prst="line"><a:avLst/></a:prstGeom>'
            f'{self._stroke_xml(stroke)}</p:spPr></p:cxnSp>'
        )

    # -- image --------------------------------------------------------------
    def _image_xml(self, el, ctx) -> str:
        nid = self.nid()
        data = self._load_asset(el)
        alt = esc(el.get("alt", "Image"))
        if data is None:
            # external URL → link relationship (never fetched); else honest placeholder
            url = el.get("url", "")
            if url.startswith("http://") or url.startswith("https://"):
                rid = ctx.add_external(url)
                blip = f'<a:blip r:link="{rid}"/>'
            else:
                self.report.append(f"image {el['id']}: no embeddable bytes ({url or 'no url'}); "
                                   "emitted as an outlined placeholder")
                return self._placeholder_box(el, alt)
        else:
            ext = self._ext_for(el)
            rid = ctx.add_media(data, ext)
            blip = f'<a:blip r:embed="{rid}"/>'
        crop = ""
        c = el.get("crop")
        if c:
            attrs = "".join(f' {k}="{int(c[k] * 1000)}"' for k in ("l", "t", "r", "b") if k in c)
            crop = f"<a:srcRect{attrs}/>"
        return (
            f'<p:pic><p:nvPicPr><p:cNvPr id="{nid}" name="{esc(el.get("name", "Picture"))}" descr="{alt}"/>'
            '<p:cNvPicPr/><p:nvPr/></p:nvPicPr>'
            f'<p:blipFill>{blip}{crop}<a:stretch><a:fillRect/></a:stretch></p:blipFill>'
            f'<p:spPr>{self._xfrm(el["layout"])}'
            '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>'
        )

    def _placeholder_box(self, el, alt) -> str:
        nid = self.nid()
        return (
            f'<p:sp><p:nvSpPr><p:cNvPr id="{nid}" name="Placeholder"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr>{self._xfrm(el["layout"])}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
            '<a:noFill/><a:ln><a:solidFill><a:srgbClr val="B0B0B0"/></a:solidFill>'
            '<a:prstDash val="dash"/></a:ln></p:spPr>'
            f'<p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/>'
            f'<a:r><a:rPr lang="en-US"/><a:t>{alt}</a:t></a:r></a:p></p:txBody></p:sp>'
        )

    def _load_asset(self, el) -> bytes | None:
        if not self.assets_base:
            return None
        for candidate in (el.get("url"), (el.get("asset") or {}).get("pathname")):
            if candidate and not candidate.startswith(("http://", "https://", "data:")):
                path = os.path.normpath(os.path.join(self.assets_base, candidate))
                base = os.path.normpath(self.assets_base)
                if os.path.commonpath([base, path]) == base and os.path.isfile(path):
                    with open(path, "rb") as fh:
                        return fh.read()
        return None

    @staticmethod
    def _ext_for(el) -> str:
        for candidate in (el.get("url"), (el.get("asset") or {}).get("pathname")):
            if candidate:
                ext = posixpath.splitext(candidate)[1].lstrip(".").lower()
                if ext:
                    return "jpeg" if ext == "jpg" else ext
        ct = (el.get("asset") or {}).get("contentType", "")
        return {"image/png": "png", "image/jpeg": "jpeg", "image/gif": "gif"}.get(ct, "png")

    # -- table --------------------------------------------------------------
    def _table_xml(self, el, ctx) -> str:
        nid = self.nid()
        rows = el.get("rows", [])
        ncols = max((len(r) for r in rows), default=1)
        layout = el["layout"]
        cols = el.get("columns")
        if cols and len(cols) == ncols:
            widths = [px_to_emu(c["w"]) for c in cols]
        else:
            widths = [px_to_emu(layout["w"] / ncols)] * ncols
        heights = el.get("rowHeights") or [px_to_emu(layout["h"] / max(len(rows), 1))] * len(rows)
        grid = "".join(f'<a:gridCol w="{w}"/>' for w in widths)
        first = ' firstRow="1"' if el.get("headerRow") else ""

        trs = ""
        for ri, row in enumerate(rows):
            h = heights[ri] if ri < len(heights) else px_to_emu(40)
            tcs = ""
            for cell in row:
                tcs += self._cell_xml(cell, el)
            trs += f'<a:tr h="{int(h)}">{tcs}</a:tr>'
        tbl = (f'<a:tbl><a:tblPr{first}/><a:tblGrid>{grid}</a:tblGrid>{trs}</a:tbl>')
        return (
            f'<p:graphicFrame><p:nvGraphicFramePr>'
            f'<p:cNvPr id="{nid}" name="{esc(el.get("name", "Table"))}"/>'
            '<p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr>'
            f'<p:xfrm><a:off x="{px_to_emu(layout["x"])}" y="{px_to_emu(layout["y"])}"/>'
            f'<a:ext cx="{px_to_emu(layout["w"])}" cy="{px_to_emu(layout["h"])}"/></p:xfrm>'
            '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">'
            f'{tbl}</a:graphicData></a:graphic></p:graphicFrame>'
        )

    def _cell_xml(self, cell, el) -> str:
        if isinstance(cell, dict) and cell.get("merged"):
            return '<a:tc hMerge="1"><a:txBody><a:bodyPr/><a:lstStyle/><a:p/></a:txBody><a:tcPr/></a:tc>'
        if isinstance(cell, str):
            cell = {"text": cell}
        span = ""
        if cell.get("colSpan"):
            span += f' gridSpan="{int(cell["colSpan"])}"'
        if cell.get("rowSpan"):
            span += f' rowSpan="{int(cell["rowSpan"])}"'
        body = self._paragraphs_xml({"rich": cell.get("rich"), "text": cell.get("text", ""),
                                     "color": el.get("textColor"), "size": el.get("fontSize")})
        fill = self._fill_xml(cell.get("fill")) or (
            f'<a:solidFill>{_color_child_xml(el.get("fill"))}</a:solidFill>' if el.get("fill") else "")
        tcpr = f'<a:tcPr>{fill}</a:tcPr>'
        return f'<a:tc{span}><a:txBody><a:bodyPr/><a:lstStyle/>{body}</a:txBody>{tcpr}</a:tc>'

    # -- stat / widget / embed (native → honest static projection) ----------
    def _stat_xml(self, el, ctx) -> str:
        self.report.append(f"stat {el['id']} rendered as static text (no PPTX KPI primitive)")
        parts = [{"runs": [{"text": el.get("value", ""), "bold": True,
                            "size": max(el.get("size", 44), 40), "color": el.get("accent") or el.get("color")}]}]
        if el.get("label"):
            parts.append({"runs": [{"text": el["label"], "size": 16}]})
        return self._text_xml({**el, "type": "text", "rich": {"paragraphs": parts}}, ctx)

    def _widget_xml(self, el, ctx) -> str:
        self.report.append(f"widget {el['id']} ({el.get('widget')}) rendered as static text; "
                           "interactivity is lost in PPTX")
        cfg = el.get("config", {})
        lines = [{"runs": [{"text": cfg.get("question") or cfg.get("label") or el.get("widget", "Widget"),
                            "bold": True, "size": 20}]}]
        for opt in cfg.get("options", []):
            lines.append({"runs": [{"text": f"• {opt}", "size": 16}]})
        return self._text_xml({**el, "type": "text", "rich": {"paragraphs": lines}}, ctx)

    def _embed_xml(self, el, ctx) -> str:
        self.report.append(f"embed {el['id']} ({el.get('embed')}) rendered as a static reference; "
                           "live embed is lost in PPTX")
        poster = el.get("poster") or {}
        if poster:
            data = self._load_asset({"url": poster.get("url"), "asset": {"pathname": poster.get("url")}})
            if data is not None:
                return self._image_xml({**el, "type": "image", "url": poster.get("url"),
                                        "alt": f"Embed: {el.get('src', '')}"}, ctx)
        return self._text_xml({**el, "type": "text",
                               "text": f"[{el.get('embed', 'embed')}] {el.get('src', '')}"}, ctx)

    # -- chart --------------------------------------------------------------
    def _chart_xml(self, el, ctx) -> str:
        self._chart_seq += 1
        n = self._chart_seq
        chart_xml = self._carried_chart(el) or self._native_chart(el)
        cpart = f"ppt/charts/chart{n}.xml"
        self.parts[cpart] = (XML_DECL + chart_xml).encode("utf-8")
        rid = ctx.add_chart(cpart)
        nid = self.nid()
        layout = el["layout"]
        return (
            f'<p:graphicFrame><p:nvGraphicFramePr>'
            f'<p:cNvPr id="{nid}" name="{esc(el.get("name", "Chart"))}"/>'
            '<p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr>'
            f'<p:xfrm><a:off x="{px_to_emu(layout["x"])}" y="{px_to_emu(layout["y"])}"/>'
            f'<a:ext cx="{px_to_emu(layout["w"])}" cy="{px_to_emu(layout["h"])}"/></p:xfrm>'
            '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">'
            f'<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
            f'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="{rid}"/>'
            '</a:graphicData></a:graphic></p:graphicFrame>'
        )

    def _carried_chart(self, el) -> str | None:
        for c in el.get("carry", []) or []:
            part = c.get("part") or {}
            if c.get("reason") == "chart" and part.get("data"):
                xml = part["data"]
                xml = re.sub(r"<\?xml[^>]*\?>\s*", "", xml)
                # strip the embedded-workbook rel so the chart is self-contained
                xml = re.sub(r"<c:externalData[\s\S]*?</c:externalData>", "", xml)
                xml = re.sub(r"<c:externalData[^>]*/>", "", xml)
                return xml
        return None

    def _native_chart(self, el) -> str:
        cats = el.get("categories") or (el.get("data") or {}).get("categories") or []
        series = el.get("series") or []
        kind = el.get("chart", "bar")
        plot_tag = {"bar": "barChart", "column": "barChart", "line": "lineChart",
                    "area": "areaChart", "pie": "pieChart", "donut": "doughnutChart"}.get(kind, "barChart")
        bardir = '<c:barDir val="col"/>' if kind == "column" else '<c:barDir val="bar"/>'
        grouping = '<c:grouping val="clustered"/>' if plot_tag == "barChart" else ""

        sers = ""
        for i, s in enumerate(series):
            vals = s.get("values") or s.get("points") or []
            cache = "".join(f'<c:pt idx="{j}"><c:v>{v}</c:v></c:pt>' for j, v in enumerate(vals) if v is not None)
            catcache = "".join(f'<c:pt idx="{j}"><c:v>{esc(str(c))}</c:v></c:pt>' for j, c in enumerate(cats))
            sers += (
                f'<c:ser><c:idx val="{i}"/><c:order val="{i}"/>'
                f'<c:tx><c:strRef><c:f>Sheet1!$B${i + 1}</c:f><c:strCache><c:ptCount val="1"/>'
                f'<c:pt idx="0"><c:v>{esc(s.get("name") or f"Series {i + 1}")}</c:v></c:pt></c:strCache></c:strRef></c:tx>'
                f'<c:cat><c:strRef><c:f>Sheet1!$A$1:$A${len(cats)}</c:f>'
                f'<c:strCache><c:ptCount val="{len(cats)}"/>{catcache}</c:strCache></c:strRef></c:cat>'
                f'<c:val><c:numRef><c:f>Sheet1!$B$1:$B${len(vals)}</c:f>'
                f'<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="{len(vals)}"/>{cache}</c:numCache>'
                '</c:numRef></c:val></c:ser>'
            )
        axes = ('<c:catAx><c:axId val="1"/><c:scaling><c:orientation val="minMax"/></c:scaling>'
                '<c:delete val="0"/><c:axPos val="b"/><c:crossAx val="2"/></c:catAx>'
                '<c:valAx><c:axId val="2"/><c:scaling><c:orientation val="minMax"/></c:scaling>'
                '<c:delete val="0"/><c:axPos val="l"/><c:crossAx val="1"/></c:valAx>')
        if plot_tag in ("pieChart", "doughnutChart"):
            axes = ""
            body = f'<c:{plot_tag}><c:varyColors val="1"/>{sers}</c:{plot_tag}>'
        else:
            body = f'<c:{plot_tag}>{bardir}{grouping}{sers}<c:axId val="1"/><c:axId val="2"/></c:{plot_tag}>'
        legend = '<c:legend><c:legendPos val="b"/></c:legend>' if el.get("options", {}).get("legend") != "none" else ""
        return (
            '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
            'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f'<c:chart><c:plotArea><c:layout/>{body}{axes}</c:plotArea>{legend}'
            '<c:plotVisOnly val="1"/></c:chart></c:chartSpace>'
        )

    # -- group / background / notes -----------------------------------------
    def _group_xml(self, el, kids) -> str:
        nid = self.nid()
        layout = el["layout"]
        x, y = px_to_emu(layout.get("x", 0)), px_to_emu(layout.get("y", 0))
        w, h = px_to_emu(layout.get("w", 0)) or 1, px_to_emu(layout.get("h", 0)) or 1
        # chOff/chExt == off/ext so nested children keep their absolute canvas coords
        return (
            f'<p:grpSp><p:nvGrpSpPr><p:cNvPr id="{nid}" name="{esc(el.get("name", "Group"))}"/>'
            '<p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            f'<p:grpSpPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/>'
            f'<a:chOff x="{x}" y="{y}"/><a:chExt cx="{w}" cy="{h}"/></a:xfrm></p:grpSpPr>'
            f'{kids}</p:grpSp>'
        )

    def _background_xml(self, background) -> str:
        if not background:
            return ""
        fill = self._fill_xml(background.get("fill"))
        return f'<p:bg><p:bgPr>{fill}<a:effectLst/></p:bgPr></p:bg>' if fill else ""

    def _notes_slide(self, idx, notes, nrid):
        body = self._paragraphs_xml(
            {"rich": notes} if isinstance(notes, dict) else {"text": notes})
        xml = (
            f'{XML_DECL}<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:cSld><p:spTree>'
            '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
            '<p:grpSpPr/>'
            '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder"/>'
            '<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>'
            '<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>'
            '<p:spPr/>'
            f'<p:txBody><a:bodyPr/><a:lstStyle/>{body}</p:txBody></p:sp>'
            '</p:spTree></p:cSld></p:notes>'
        )
        self.parts[f"ppt/notesSlides/notesSlide{idx}.xml"] = xml.encode("utf-8")
        self.parts[f"ppt/notesSlides/_rels/notesSlide{idx}.xml.rels"] = self._rels_doc([
            f'<Relationship Id="rId1" '
            f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" '
            f'Target="../notesMasters/notesMaster1.xml"/>',
            f'<Relationship Id="rId2" '
            f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" '
            f'Target="../slides/slide{idx}.xml"/>',
        ])

    # -- media registry helper ----------------------------------------------
    def add_media_part(self, data: bytes, ext: str) -> str:
        self._media_seq += 1
        name = f"ppt/media/image{self._media_seq}.{ext}"
        self.parts[name] = data
        return name

    @staticmethod
    def _rels_doc(rels: list[str]) -> bytes:
        return (XML_DECL +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                + "".join(rels) + "</Relationships>").encode("utf-8")

    # -- skeleton (content-types, master, layout, theme, presentation) ------
    def _skeleton(self, cx, cy, nslides, has_notes, media_exts, chart_parts, note_slides):
        self.parts["ppt/theme/theme1.xml"] = self._theme_xml().encode("utf-8")
        self.parts["ppt/slideMasters/slideMaster1.xml"] = _SLIDE_MASTER.encode("utf-8")
        self.parts["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = self._rels_doc([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>',
        ])
        self.parts["ppt/slideLayouts/slideLayout1.xml"] = _SLIDE_LAYOUT.encode("utf-8")
        self.parts["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = self._rels_doc([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>',
        ])
        self.parts["ppt/presProps.xml"] = (
            XML_DECL + '<p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>').encode("utf-8")

        if has_notes:
            self.parts["ppt/notesMasters/notesMaster1.xml"] = _NOTES_MASTER.encode("utf-8")
            self.parts["ppt/notesMasters/_rels/notesMaster1.xml.rels"] = self._rels_doc([
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>',
            ])

        self._presentation(cx, cy, nslides, has_notes)
        self._content_types(nslides, has_notes, media_exts, note_slides)
        self._doc_props()
        self.parts["_rels/.rels"] = self._rels_doc([
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>',
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>',
        ])

    def _presentation(self, cx, cy, nslides, has_notes):
        rels = ['<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>']
        sldids = ""
        rid = 1
        for i in range(1, nslides + 1):
            rid += 1
            rels.append(f'<Relationship Id="rId{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>')
            sldids += f'<p:sldId id="{255 + i}" r:id="rId{rid}"/>'
        notes_master_lst = ""
        if has_notes:
            rid += 1
            rels.append(f'<Relationship Id="rId{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>')
            notes_master_lst = f'<p:notesMasterIdLst><p:notesMasterId r:id="rId{rid}"/></p:notesMasterIdLst>'
        rid += 1
        rels.append(f'<Relationship Id="rId{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>')

        notes_sz = ' <p:notesSz cx="6858000" cy="9144000"/>'
        pres = (
            f'{XML_DECL}<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
            '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
            f'{notes_master_lst}'
            f'<p:sldIdLst>{sldids}</p:sldIdLst>'
            f'<p:sldSz cx="{cx}" cy="{cy}"/>{notes_sz}</p:presentation>'
        )
        self.parts["ppt/presentation.xml"] = pres.encode("utf-8")
        self.parts["ppt/_rels/presentation.xml.rels"] = self._rels_doc(rels)

    def _content_types(self, nslides, has_notes, media_exts, note_slides):
        defaults = [
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
            '<Default Extension="xml" ContentType="application/xml"/>',
        ]
        for ext in sorted(media_exts):
            ct = _MEDIA_CT.get(ext, "application/octet-stream")
            defaults.append(f'<Default Extension="{ext}" ContentType="{ct}"/>')
        overrides = [
            '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
            '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
            '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
            '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
            '<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>',
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
            '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
        ]
        for i in range(1, nslides + 1):
            overrides.append(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
        if has_notes:
            overrides.append('<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>')
            for i in note_slides:
                overrides.append(f'<Override PartName="/ppt/notesSlides/notesSlide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>')
        for part in sorted(p for p in self.parts if p.startswith("ppt/charts/") and p.endswith(".xml")):
            overrides.append(f'<Override PartName="/{part}" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>')
        body = "".join(defaults) + "".join(overrides)
        self.parts["[Content_Types].xml"] = (
            XML_DECL + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            + body + "</Types>").encode("utf-8")

    def _doc_props(self):
        meta = self.deck.get("meta", {})
        title = esc(self.deck.get("title", "Presentation"))
        core = (
            f'{XML_DECL}<cp:coreProperties '
            'xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
            'xmlns:dc="http://purl.org/dc/elements/1.1/" '
            'xmlns:dcterms="http://purl.org/dc/terms/" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            f'<dc:title>{title}</dc:title>'
            f'<dc:creator>{esc(meta.get("author", "Lecturn"))}</dc:creator>'
            '</cp:coreProperties>'
        )
        app = (
            f'{XML_DECL}<Properties '
            'xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">'
            f'<Application>{esc(meta.get("application", "Lecturn"))}</Application>'
            '</Properties>'
        )
        self.parts["docProps/core.xml"] = core.encode("utf-8")
        self.parts["docProps/app.xml"] = app.encode("utf-8")

    def _theme_xml(self) -> str:
        tokens = (self.deck.get("theme") or {}).get("tokens", {})
        colors = {**_DEFAULT_SCHEME, **(tokens.get("colors") or {})}

        def hexof(tok):
            v = colors.get(tok, _DEFAULT_SCHEME[tok])
            return v.lstrip("#").upper()[:6]

        typo = tokens.get("typography", {})
        major = (typo.get("heading") or {}).get("family", "Calibri Light")
        minor = (typo.get("body") or {}).get("family", "Calibri")
        t = _THEME_TEMPLATE
        for tok, slot in (("text1", "DK1"), ("bg1", "LT1"), ("text2", "DK2"), ("bg2", "LT2"),
                          ("accent1", "ACCENT1"), ("accent2", "ACCENT2"), ("accent3", "ACCENT3"),
                          ("accent4", "ACCENT4"), ("accent5", "ACCENT5"), ("accent6", "ACCENT6"),
                          ("hyperlink", "HLINK"), ("followedHyperlink", "FOLHLINK")):
            t = t.replace(f"__{slot}__", hexof(tok))
        t = t.replace("__MAJORFONT__", esc(major)).replace("__MINORFONT__", esc(minor))
        return t


class _SlideCtx:
    """Per-slide relationship accumulator (media, charts, external links)."""
    def __init__(self, next_rid, rels, media_exts, chart_parts, writer):
        self.next_rid = next_rid
        self.rels = rels
        self.media_exts = media_exts
        self.chart_parts = chart_parts
        self.writer = writer

    def add_media(self, data: bytes, ext: str) -> str:
        part = self.writer.add_media_part(data, ext)
        self.media_exts.add(ext)
        rid = self.next_rid()
        target = "../" + part.split("ppt/")[1]
        self.rels.append(f'<Relationship Id="{rid}" '
                         'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
                         f'Target="{target}"/>')
        return rid

    def add_external(self, url: str) -> str:
        rid = self.next_rid()
        self.rels.append(f'<Relationship Id="{rid}" '
                         'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
                         f'Target="{esc(url)}" TargetMode="External"/>')
        return rid

    def add_chart(self, cpart: str) -> str:
        rid = self.next_rid()
        target = "../" + cpart.split("ppt/")[1]
        self.rels.append(f'<Relationship Id="{rid}" '
                         'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" '
                         f'Target="{target}"/>')
        return rid


def deck_to_pptx(deck: dict, out_path: str, assets_base: str | None) -> list[str]:
    from .ooxml import write_package
    writer = Writer(deck, assets_base)
    parts, report = writer.build()
    write_package(out_path, parts)
    return report


# --- static skeleton templates ---------------------------------------------

_SLIDE_MASTER = (
    XML_DECL + '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
    '<p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg>'
    '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>'
    '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" '
    'accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
    '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
    '<p:txStyles><p:titleStyle><a:lvl1pPr><a:defRPr sz="4400"/></a:lvl1pPr></p:titleStyle>'
    '<p:bodyStyle><a:lvl1pPr><a:defRPr sz="1800"/></a:lvl1pPr></p:bodyStyle>'
    '<p:otherStyle><a:lvl1pPr><a:defRPr sz="1800"/></a:lvl1pPr></p:otherStyle></p:txStyles></p:sldMaster>'
)

_SLIDE_LAYOUT = (
    XML_DECL + '<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">'
    '<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>'
    '<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>'
    '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'
)

_NOTES_MASTER = (
    XML_DECL + '<p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">'
    '<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
    '<p:grpSpPr/></p:spTree></p:cSld>'
    '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" '
    'accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
    '</p:notesMaster>'
)

_THEME_TEMPLATE = (
    XML_DECL + '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Lecturn">'
    '<a:themeElements><a:clrScheme name="Lecturn">'
    '<a:dk1><a:srgbClr val="__DK1__"/></a:dk1><a:lt1><a:srgbClr val="__LT1__"/></a:lt1>'
    '<a:dk2><a:srgbClr val="__DK2__"/></a:dk2><a:lt2><a:srgbClr val="__LT2__"/></a:lt2>'
    '<a:accent1><a:srgbClr val="__ACCENT1__"/></a:accent1><a:accent2><a:srgbClr val="__ACCENT2__"/></a:accent2>'
    '<a:accent3><a:srgbClr val="__ACCENT3__"/></a:accent3><a:accent4><a:srgbClr val="__ACCENT4__"/></a:accent4>'
    '<a:accent5><a:srgbClr val="__ACCENT5__"/></a:accent5><a:accent6><a:srgbClr val="__ACCENT6__"/></a:accent6>'
    '<a:hlink><a:srgbClr val="__HLINK__"/></a:hlink><a:folHlink><a:srgbClr val="__FOLHLINK__"/></a:folHlink>'
    '</a:clrScheme><a:fontScheme name="Lecturn">'
    '<a:majorFont><a:latin typeface="__MAJORFONT__"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>'
    '<a:minorFont><a:latin typeface="__MINORFONT__"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>'
    '</a:fontScheme><a:fmtScheme name="Lecturn">'
    '<a:fillStyleLst>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:solidFill>'
    '</a:fillStyleLst>'
    '<a:lnStyleLst>'
    '<a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'
    '<a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'
    '<a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'
    '</a:lnStyleLst>'
    '<a:effectStyleLst>'
    '<a:effectStyle><a:effectLst/></a:effectStyle>'
    '<a:effectStyle><a:effectLst/></a:effectStyle>'
    '<a:effectStyle><a:effectLst/></a:effectStyle>'
    '</a:effectStyleLst>'
    '<a:bgFillStyleLst>'
    '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill>'
    '<a:solidFill><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/></a:schemeClr></a:solidFill>'
    '</a:bgFillStyleLst>'
    '</a:fmtScheme></a:themeElements></a:theme>'
)
