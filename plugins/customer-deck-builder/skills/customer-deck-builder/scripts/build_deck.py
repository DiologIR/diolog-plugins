#!/usr/bin/env python3
"""
build_deck.py - assemble a self-contained, pan/zoom/print deck.html from a
config + the templated frames + the harness shell.

What it does, per slide (in the order given by the config):
  1. reads the standalone template frame, pulls out the <div class="frame">…</div>
     and any per-slide <style> block;
  2. scopes that per-slide CSS to the slide (so slide styles never collide when
     all frames live in one page);
  3. substitutes global tokens (client identity, contacts, pricing…) and
     per-slide tokens (PAGE_N / PAGE_TOTAL / SECTION_NUM - computed from position,
     so adding or reordering slides renumbers everything automatically);
  4. embeds the client logo (as a data URI for a local file) or a text fallback;
  5. wraps the frame in a labelled <section> and drops it into the harness.

The shared deck.css is inlined once; an optional accent/navy override is appended
so a client rebrand is a one-value change. The output is one portable .html file.

Usage:
  python build_deck.py --config deck.config.json [--out deck.html]
                       [--frames DIR] [--shell harness.html] [--css deck.css]

Only --config is required; everything else resolves to sensible defaults
(the frames next to the config if present, otherwise the bundled template kit).
"""
import argparse, base64, json, mimetypes, re, sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent
DEF_SHELL  = SKILL_ROOT / "assets" / "shell" / "harness.html"
DEF_CSS    = SKILL_ROOT / "assets" / "templates" / "deck.css"
DEF_FRAMES = SKILL_ROOT / "assets" / "templates" / "frames"

UPPER_FROM = {                      # derived UPPERCASE tokens
    "CLIENT_NAME_UPPER":    "CLIENT_NAME",
    "CLIENT_SHORT_UPPER":   "CLIENT_SHORT",
    "PARTNER_FIRST_UPPER":  "PARTNER_FIRST",
    "PARTNER_NAME_UPPER":   "PARTNER_NAME",
    "PRESENTER_NAME_UPPER": "PRESENTER_NAME",
}


def die(msg):
    sys.stderr.write("build_deck: " + msg + "\n")
    sys.exit(1)


def scope_css(css, sel):
    """Prefix every rule's selector(s) with `sel `, so per-slide CSS is isolated."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)          # strip comments
    out = []
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css, flags=re.S):
        selectors, body = m.group(1).strip(), m.group(2).strip()
        if not selectors:
            continue
        if selectors.startswith("@"):                        # leave at-rules alone
            out.append(selectors + " {" + body + "}")
            continue
        scoped = ", ".join(sel + " " + s.strip() for s in selectors.split(","))
        out.append(scoped + " { " + body + " }")
    return "\n".join(out)


def logo_element(cfg, tokens):
    """Return the cover logo markup: an <img> (data URI for local files) or a
    text fallback of the client name so the top-right never renders empty."""
    src = (cfg.get("client_logo") or "").strip()
    style = ("left:1540px; top:52px; width:270px; height:110px; "
             "object-fit:contain; border-radius:6px;")
    if src:
        p = Path(src)
        if p.is_file():                                       # inline local file
            mime = mimetypes.guess_type(p.name)[0] or "image/png"
            data = base64.b64encode(p.read_bytes()).decode("ascii")
            src = "data:%s;base64,%s" % (mime, data)
        alt = tokens.get("CLIENT_NAME", "")
        return '<img class="abs" src="%s" alt="%s" style="%s">' % (src, alt, style)
    # graceful fallback - client name, right-aligned in the same box
    name = tokens.get("CLIENT_NAME", "")
    return ('<p class="abs display" style="left:1240px; top:96px; width:570px; '
            'text-align:right; font-size:38px; line-height:1; color:var(--navy);">'
            + name + "</p>")


def sub_tokens(text, tokens):
    return re.sub(r"\{\{([A-Z0-9_]+)\}\}",
                  lambda m: tokens.get(m.group(1), m.group(0)), text)


def build_slide(cfg_slide, idx, total, frames_dir, tokens, cfg):
    path = frames_dir / cfg_slide["file"]
    if not path.is_file():
        die("frame not found: %s" % path)
    html = path.read_text(encoding="utf-8")

    body = re.search(r"<body[^>]*>(.*)</body>", html, flags=re.S)
    if not body:
        die("no <body> in %s" % path.name)
    frame = body.group(1)

    style_m = re.search(r"<style[^>]*>(.*?)</style>", html, flags=re.S)
    local_style = style_m.group(1) if style_m else ""

    slide_id = "slide-%d" % idx
    n2, tot2 = "%02d" % idx, "%02d" % total
    per_slide = dict(tokens, PAGE_N=n2, PAGE_TOTAL=tot2, SECTION_NUM=n2)

    frame = sub_tokens(frame, per_slide)
    frame = re.sub(r"<!--CLIENT_LOGO[^>]*-->", lambda _: logo_element(cfg, tokens), frame)

    label = cfg_slide.get("label", path.stem)
    section = ('  <section class="slide-wrap" id="%s">\n'
               '    <p class="slide-label"><b>%s</b>%s</p>\n'
               '    %s\n  </section>\n') % (slide_id, n2, label, frame.strip())

    scoped = scope_css(local_style, "#" + slide_id) if local_style.strip() else ""
    return section, scoped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--out")
    ap.add_argument("--frames")
    ap.add_argument("--shell", default=str(DEF_SHELL))
    ap.add_argument("--css",   default=str(DEF_CSS))
    args = ap.parse_args()

    cfg_path = Path(args.config).resolve()
    if not cfg_path.is_file():
        die("config not found: %s" % cfg_path)
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))

    frames_dir = Path(args.frames).resolve() if args.frames else None
    if frames_dir is None:
        cand = cfg_path.parent / "frames"
        frames_dir = cand if cand.is_dir() else DEF_FRAMES
    out_path = Path(args.out).resolve() if args.out else cfg_path.parent / "deck.html"

    # ---- assemble token table (config + derived) ----
    tokens = dict(cfg.get("tokens", {}))
    for up, base in UPPER_FROM.items():
        tokens.setdefault(up, tokens.get(base, "").upper())
    if "HOURS_YEAR" in tokens:
        tokens.setdefault("HOURS_YEAR_N", tokens["HOURS_YEAR"].replace("~", "").strip())

    slides = cfg.get("slides", [])
    if not slides:
        die("config has no slides[]")
    total = len(slides)

    sections, styles = [], []
    for i, s in enumerate(slides, start=1):
        sec, st = build_slide(s, i, total, frames_dir, tokens, cfg)
        sections.append(sec)
        if st:
            styles.append("/* %s */\n%s" % (s["file"], st))

    # ---- inline shared css + optional rebrand override + per-slide scoped css ----
    deck_css = Path(args.css).read_text(encoding="utf-8")
    design = cfg.get("design", {}) or {}
    override = ""
    if design.get("accent") or design.get("navy"):
        parts = []
        if design.get("accent"): parts.append("--accent:%s;" % design["accent"])
        if design.get("navy"):   parts.append("--navy:%s;" % design["navy"])
        override = "\n:root{ %s }" % " ".join(parts)

    # On-screen grid: lay the slides out in `rows` rows (default 2), reading
    # left-to-right. Print collapses this back to one vertical column.
    rows = max(1, int((cfg.get("view") or {}).get("rows", 2)))
    cols = max(1, -(-total // rows))                       # ceil(total / rows)
    override += "\n:root{ --deck-cols: %d; }" % cols

    full_css = deck_css + override + "\n\n" + "\n\n".join(styles)

    title = sub_tokens(cfg.get("title") or (tokens.get("CLIENT_NAME", "Deck") + " · Diolog Proposal"), tokens)

    shell = Path(args.shell).read_text(encoding="utf-8")
    shell = shell.replace("{{DECK_TITLE}}", title)
    shell = shell.replace("/*__DECK_CSS__*/", full_css)
    shell = shell.replace("<!--__DECK_SLIDES__-->", "".join(sections))

    # ---- report any unresolved tokens (helps catch a missing config value) ----
    leftover = sorted(set(re.findall(r"\{\{([A-Z0-9_]+)\}\}", shell)))
    out_path.write_text(shell, encoding="utf-8")

    print("built %s - %d slides" % (out_path, total))
    if leftover:
        print("WARNING: unresolved tokens (add to config.tokens): "
              + ", ".join(leftover))
        sys.exit(2)


if __name__ == "__main__":
    main()
