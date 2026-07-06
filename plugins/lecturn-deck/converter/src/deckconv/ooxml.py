"""Low-level OOXML (.pptx) helpers shared by the reader and writer.

Stdlib only: ``zipfile`` + ``xml.etree.ElementTree``. No third-party dependency,
so the converter runs anywhere Python 3.11+ is on PATH.

This module owns the unit system (EMU/rotation/colour), the namespace table, the
zip package read/write, and small XML escaping helpers. The reader parses with
ElementTree; the writer builds XML from explicit prefixed string templates (the
most reliable way to emit files whose element/prefix shape matches what
PowerPoint expects).
"""

from __future__ import annotations

import re
import zipfile
from dataclasses import dataclass, field
from typing import Iterable
from xml.etree import ElementTree as ET

# --- Units -----------------------------------------------------------------

# --- XML safety (untrusted .pptx input) ------------------------------------
# Stdlib ElementTree is fed with attacker-controlled bytes here, so it must be
# hardened against entity-expansion (billion-laughs / quadratic-blowup) and
# external-entity (XXE) attacks. defusedxml would do this but is a third-party
# dependency that breaks the zero-install contract. Instead we exploit a fact:
# a well-formed OOXML part NEVER contains a DTD. Every entity-expansion and XXE
# attack requires a `<!DOCTYPE …>`/`<!ENTITY …>` declaration, and legitimate
# slide text carrying those literal characters is XML-escaped in the raw bytes.
# So refusing any part that declares a DOCTYPE/ENTITY closes the whole attack
# class with stdlib only. Zip-bomb decompression is capped separately below.

_DOCTYPE_RE = re.compile(rb"<!DOCTYPE", re.IGNORECASE)
_ENTITY_RE = re.compile(rb"<!ENTITY", re.IGNORECASE)

MAX_PART_BYTES = 200 * 1024 * 1024      # per-part uncompressed cap
MAX_TOTAL_BYTES = 600 * 1024 * 1024     # whole-package uncompressed cap


class XmlSecurityError(ValueError):
    """Raised when an XML part declares a DTD/entity or a zip part is oversized."""


def safe_fromstring(data: bytes | str) -> ET.Element:
    raw = data.encode("utf-8") if isinstance(data, str) else data
    if _DOCTYPE_RE.search(raw) or _ENTITY_RE.search(raw):
        raise XmlSecurityError(
            "XML part declares a DOCTYPE/ENTITY — refusing to parse "
            "(entity-expansion / XXE guard)"
        )
    return ET.fromstring(raw)


EMU_PER_PX = 9525          # 914400 EMU/inch ÷ 96 dpi
EMU_PER_PT = 12700         # 914400 ÷ 72
ROT_PER_DEG = 60000        # PPTX stores rotation in 60000ths of a degree
DEFAULT_CANVAS = (1280, 720)
DEFAULT_SLIDE_EMU = (12192000, 6858000)   # 13.333in × 7.5in (16:9)


def emu_to_px(emu: float | int | None) -> float:
    return 0.0 if emu is None else round(int(emu) / EMU_PER_PX, 2)


def px_to_emu(px: float | int | None) -> int:
    return 0 if px is None else int(round(float(px) * EMU_PER_PX))


def rot_to_deg(rot: str | int | None) -> float:
    if rot in (None, ""):
        return 0.0
    return round(int(rot) / ROT_PER_DEG, 2)


def deg_to_rot(deg: float | int | None) -> int:
    if not deg:
        return 0
    return int(round(float(deg) * ROT_PER_DEG)) % (360 * ROT_PER_DEG)


def pt_to_px(pt: float) -> float:
    return round(pt * 96 / 72, 2)


def px_to_pt(px: float) -> float:
    return round(px * 72 / 96, 2)


def emu_line_to_px(emu: float | int | None) -> float:
    # line widths are EMU too; 1px == 9525 EMU
    return emu_to_px(emu)


# --- Namespaces ------------------------------------------------------------

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "c": "http://schemas.openxmlformats.org/drawingml/2006/chart",
    "ct": "http://schemas.openxmlformats.org/package/2006/content-types",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "ep": "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",
    "xsi": "http://www.w3.org/2001/XMLSchema-instance",
}

R_NS = NS["r"]


def q(prefix: str, local: str) -> str:
    """Qualified ``{uri}local`` name for ElementTree lookups."""
    return f"{{{NS[prefix]}}}{local}"


def findall(el: ET.Element | None, path: str) -> list[ET.Element]:
    return [] if el is None else el.findall(path, NS)


def find(el: ET.Element | None, path: str) -> ET.Element | None:
    return None if el is None else el.find(path, NS)


def rattr(el: ET.Element, local: str) -> str | None:
    """Read an ``r:``-namespaced attribute (e.g. r:embed, r:id)."""
    return el.get(f"{{{R_NS}}}{local}")


# --- Colour scheme mapping (Lecturn token <-> PPTX scheme value) -----------

TOKEN_TO_SCHEME = {
    "text1": "tx1", "text2": "tx2", "bg1": "bg1", "bg2": "bg2",
    "accent1": "accent1", "accent2": "accent2", "accent3": "accent3",
    "accent4": "accent4", "accent5": "accent5", "accent6": "accent6",
    "hyperlink": "hlink", "followedHyperlink": "folHlink",
}
SCHEME_TO_TOKEN = {v: k for k, v in TOKEN_TO_SCHEME.items()}
# clrMap aliases that appear in slide XML resolve back to the base slots:
SCHEME_TO_TOKEN.update({"dk1": "text1", "lt1": "bg1", "dk2": "text2", "lt2": "bg2"})

_TRANSFORM_TAGS = ("tint", "shade", "lumMod", "lumOff", "satMod", "satOff", "hueMod", "alpha")


def parse_color(container: ET.Element | None):
    """Read the first colour child of *container* into a Color (hex str or dict).

    Returns ``None`` when no colour is present (inherited).
    """
    if container is None:
        return None
    srgb = find(container, "a:srgbClr")
    if srgb is not None:
        transforms = _read_transforms(srgb)
        hexv = "#" + (srgb.get("val") or "000000").lower()
        if not transforms:
            return hexv
        # keep the resolved hex but record transforms via an explicit ThemeColor-free note
        return {"hex": hexv, "transforms": transforms}
    scheme = find(container, "a:schemeClr")
    if scheme is not None:
        val = scheme.get("val") or "tx1"
        token = SCHEME_TO_TOKEN.get(val, "text1")
        out = {"token": token}
        tr = _read_transforms(scheme)
        if tr:
            out["transforms"] = tr
        return out
    sysc = find(container, "a:sysClr")
    if sysc is not None:
        last = sysc.get("lastClr")
        return "#" + last.lower() if last else "#000000"
    return None


def _read_transforms(clr: ET.Element) -> list[dict]:
    out = []
    for tag in _TRANSFORM_TAGS:
        node = find(clr, f"a:{tag}")
        if node is not None and node.get("val") is not None:
            out.append({"kind": tag, "value": round(int(node.get("val")) / 1000, 3)})
    return out


def color_to_xml(color, *, tag: str = "a:solidFill") -> str:
    """Serialize a Color (hex string, token dict, or {hex,transforms}) to fill XML."""
    inner = _color_child_xml(color)
    if inner is None:
        return ""
    return f"<{tag}>{inner}</{tag}>"


def _color_child_xml(color) -> str | None:
    if color is None:
        return None
    if isinstance(color, str):
        s = color.strip()
        if s.startswith("#"):
            return f'<a:srgbClr val="{s[1:7].upper()}"/>'
        # bare token shorthand ("accent1" or "accent1/40")
        base, _, tint = s.partition("/")
        scheme = TOKEN_TO_SCHEME.get(base)
        if scheme:
            if tint:
                return f'<a:schemeClr val="{scheme}"><a:lumMod val="{int(float(tint) * 1000)}"/></a:schemeClr>'
            return f'<a:schemeClr val="{scheme}"/>'
        # last-ditch: treat as raw hex without '#'
        if re.fullmatch(r"[0-9A-Fa-f]{6}", s):
            return f'<a:srgbClr val="{s.upper()}"/>'
        return None
    if isinstance(color, dict):
        transforms = "".join(
            f'<a:{t["kind"]} val="{int(round(t["value"] * 1000))}"/>' for t in color.get("transforms", [])
        )
        if "token" in color:
            scheme = TOKEN_TO_SCHEME.get(color["token"], "tx1")
            return f'<a:schemeClr val="{scheme}">{transforms}</a:schemeClr>'
        if "hex" in color:
            h = color["hex"].lstrip("#")[:6].upper()
            return f'<a:srgbClr val="{h}">{transforms}</a:srgbClr>'
    return None


# --- XML text/attr escaping (writer) ---------------------------------------

def esc(text: str | None) -> str:
    if text is None:
        return ""
    return (
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        .replace('"', "&quot;")
    )


XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'


# --- Package (zip) I/O -----------------------------------------------------

@dataclass
class Package:
    """A parsed .pptx: part name (e.g. ``ppt/slides/slide1.xml``) -> raw bytes."""
    parts: dict[str, bytes] = field(default_factory=dict)

    def text(self, name: str) -> str | None:
        raw = self.parts.get(name)
        return None if raw is None else raw.decode("utf-8")

    def xml(self, name: str) -> ET.Element | None:
        raw = self.parts.get(name)
        return None if raw is None else safe_fromstring(raw)

    def names(self) -> Iterable[str]:
        return self.parts.keys()


def read_package(path: str) -> Package:
    pkg = Package()
    total = 0
    with zipfile.ZipFile(path, "r") as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            if info.file_size > MAX_PART_BYTES:
                raise XmlSecurityError(
                    f"part {info.filename} decompresses to {info.file_size} bytes "
                    f"(> {MAX_PART_BYTES}) — refusing (zip-bomb guard)"
                )
            total += info.file_size
            if total > MAX_TOTAL_BYTES:
                raise XmlSecurityError(
                    f"package decompresses to > {MAX_TOTAL_BYTES} bytes — refusing (zip-bomb guard)"
                )
            pkg.parts[info.filename] = zf.read(info.filename)
    return pkg


def write_package(path: str, parts: dict[str, bytes]) -> None:
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        # [Content_Types].xml must be present; order is not significant for readers.
        for name in sorted(parts):
            data = parts[name]
            if isinstance(data, str):
                data = data.encode("utf-8")
            zf.writestr(name, data)


# --- Relationship parsing --------------------------------------------------

def rels_path_for(part: str) -> str:
    """The .rels part path that describes *part*."""
    slash = part.rfind("/")
    if slash == -1:
        return f"_rels/{part}.rels"
    return f"{part[:slash]}/_rels/{part[slash + 1:]}.rels"


def parse_rels(pkg: Package, part: str) -> dict[str, dict]:
    """Return ``{rId: {"type":…, "target":…, "mode":…}}`` for *part*."""
    rp = rels_path_for(part)
    root = pkg.xml(rp)
    out: dict[str, dict] = {}
    if root is None:
        return out
    for rel in root:
        out[rel.get("Id")] = {
            "type": rel.get("Type", ""),
            "target": rel.get("Target", ""),
            "mode": rel.get("TargetMode", "Internal"),
        }
    return out


def resolve_target(part: str, target: str) -> str:
    """Resolve a relationship target (often ``../media/x.png``) against *part*'s dir."""
    if target.startswith("/"):
        return target.lstrip("/")
    base = part[: part.rfind("/")] if "/" in part else ""
    segments = (base.split("/") if base else []) + target.split("/")
    stack: list[str] = []
    for seg in segments:
        if seg in ("", "."):
            continue
        if seg == "..":
            if stack:
                stack.pop()
        else:
            stack.append(seg)
    return "/".join(stack)
