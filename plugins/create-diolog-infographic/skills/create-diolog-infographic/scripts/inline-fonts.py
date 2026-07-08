#!/usr/bin/env python3
"""
Build a self-contained fonts.css for the Diolog infographic (Newsreader + Inter + JetBrains Mono,
latin subset, base64 woff2), or inject it into a template's font marker.

Why: the page must carry its fonts inline. A webfont <link> is blocked by the Artifact CSP and is
unreliable in print, and a silent Georgia fallback wrecks the whole broadsheet look.

Usage:
  python3 inline-fonts.py                 # write fonts.css next to this script (needs network)
  python3 inline-fonts.py --inject a.html # replace <style>/*__FONTS__*/</style> in a.html with the CSS
  python3 inline-fonts.py --out x.css      # write to a specific path

If a fonts.css already sits in ../assets/, --inject uses it without hitting the network.
"""
import base64
import os
import re
import sys
import urllib.request

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
# opsz axis on for Newsreader; the weights the template actually uses.
CSS_URL = ("https://fonts.googleapis.com/css2?"
           "family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400"
           "&family=Inter:wght@400;500;600"
           "&family=JetBrains+Mono:wght@400;500&display=swap")

HERE = os.path.dirname(os.path.abspath(__file__))
CACHED = os.path.normpath(os.path.join(HERE, "..", "assets", "fonts.css"))
MARKER = "/*__FONTS__*/"


def build_fonts_css() -> str:
    """Fetch the Google Fonts css2, keep only the latin subset, inline each woff2 as a data URI."""
    req = urllib.request.Request(CSS_URL, headers={"User-Agent": UA})
    css = urllib.request.urlopen(req, timeout=30).read().decode()
    blocks = re.findall(r"/\*\s*([a-z-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S)
    out = []
    for subset, block in blocks:
        if subset != "latin":
            continue
        m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if not m:
            continue
        url = m.group(1)
        data = urllib.request.urlopen(
            urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30).read()
        datauri = "data:font/woff2;base64," + base64.b64encode(data).decode()
        out.append(block.replace(url, datauri))
    if not out:
        raise SystemExit("no latin @font-face blocks found - the css2 API may have changed")
    return "\n".join(out) + "\n"


def get_fonts_css() -> str:
    """Prefer the cached assets/fonts.css; otherwise fetch fresh."""
    if os.path.exists(CACHED):
        return open(CACHED).read()
    return build_fonts_css()


def main() -> None:
    args = sys.argv[1:]
    if "--inject" in args:
        target = args[args.index("--inject") + 1]
        html = open(target).read()
        if MARKER not in html:
            raise SystemExit(f"marker {MARKER!r} not found in {target}")
        html = html.replace(MARKER, get_fonts_css())
        open(target, "w").write(html)
        print(f"injected fonts into {target} ({len(html)//1024}KB)")
        return
    # otherwise (re)build fonts.css
    out = CACHED
    if "--out" in args:
        out = args[args.index("--out") + 1]
    css = build_fonts_css()
    open(out, "w").write(css)
    print(f"wrote {out} ({len(css)//1024}KB, {css.count('@font-face')} faces)")


if __name__ == "__main__":
    main()
