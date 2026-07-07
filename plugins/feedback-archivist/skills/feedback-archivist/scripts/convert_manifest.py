#!/usr/bin/env python3
"""Phase 1 — convert every .docx (and .txt) under the source dirs to verbatim Markdown in a staging
   dir, and emit manifest.json with per-file metadata (date, title, attendee emails, word count, a
   normalised content hash for dedup, and dup detection). Pandoc must be installed.

Usage:
  python convert_manifest.py --source DIR [DIR ...] --staging STAGING_DIR
                             [--exclude "ISMS,Audit,test,Meeting started"]

Notes:
  - Reads .docx via `pandoc --wrap=none`, and .txt as-is. PDFs are NOT handled here (pandoc can't read
    them) — convert those separately (e.g. a different tool) and add them to the archive by hand.
  - `--exclude` is a comma-separated list of case-insensitive filename substrings to flag as excluded
    (security/ISO/audit governance, internal tests, empty auto-recordings). Excluded files are still
    listed in the manifest (with excluded=true) so nothing is silently dropped.
"""
import argparse, os, re, json, hashlib, subprocess

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def clean(md: str) -> str:
    """Lossless-ish cleanup of pandoc artifacts: keep link text+targets, drop .underline styling and
    the \\' / \\" escapes pandoc emits, so the body reads as plain verbatim Markdown."""
    md = md.replace("\\'", "'").replace('\\"', '"')
    md = re.sub(r"\[\[([^\]]*?)\]\{\.underline\}\]\(#[^)]*\)", r"\1", md)                         # internal anchors -> text
    md = re.sub(r"\[\[([^\]]*?)\]\{\.underline\}\]\((mailto:[^)]*|https?://[^)]*)\)", r"[\1](\2)", md)  # ext links kept
    md = re.sub(r"\[([^\]]*?)\]\{\.underline\}", r"\1", md)                                       # bare underline spans
    md = re.sub(r"\{\.underline\}", "", md)
    return re.sub(r"\n{3,}", "\n\n", md).strip()


def pandoc(path: str) -> str:
    try:
        r = subprocess.run(["pandoc", path, "-t", "markdown", "--wrap=none"],
                           capture_output=True, text=True, timeout=120)
        return r.stdout
    except Exception as e:
        return f"__ERROR__ {e}"


def slug(s: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:80]


def date_from_name(name: str) -> str:
    m = re.search(r"(20\d{2})[_-](\d{2})[_-](\d{2})", name)
    return f"{m.group(1)}-{m.group(2)}-{m.group(3)}" if m else ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", nargs="+", required=True)
    ap.add_argument("--staging", required=True)
    ap.add_argument("--exclude", default="")
    a = ap.parse_args()
    os.makedirs(a.staging, exist_ok=True)
    excl = [x.strip().lower() for x in a.exclude.split(",") if x.strip()]

    records = []
    for src in a.source:
        for root, _, files in os.walk(src):
            for fn in files:
                low = fn.lower()
                if not (low.endswith(".docx") or low.endswith(".txt")):
                    continue
                full = os.path.join(root, fn)
                raw = pandoc(full) if low.endswith(".docx") else open(full, errors="replace").read()
                text = clean(raw) if not raw.startswith("__ERROR__") else ""
                emails = sorted({e.lower() for e in EMAIL_RE.findall(text)})
                mt = re.search(r"^#+\s+(.+)$", text, re.M)
                title = mt.group(1).strip() if mt else re.sub(r"\.(docx|txt)$", "", fn, flags=re.I)
                norm = re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", text.lower())).strip()
                chash = hashlib.md5(norm.encode()).hexdigest()[:12] if norm else "empty"
                base = slug(fn); stage = os.path.join(a.staging, base + ".md"); i = 1
                while os.path.exists(stage):
                    stage = os.path.join(a.staging, f"{base}-{i}.md"); i += 1
                open(stage, "w").write(text)
                # try the file's mtime as a probable-date proxy (Drive-modified date)
                try:
                    mtime = subprocess.run(["stat", "-f", "%Sm", "-t", "%Y-%m-%d", full],
                                           capture_output=True, text=True).stdout.strip()
                except Exception:
                    mtime = ""
                records.append({
                    "orig": full, "orig_name": fn, "src_root": src,
                    "date": date_from_name(fn), "mtime": mtime, "title": title,
                    "wc": len(text.split()), "emails": emails, "domains": sorted({e.split('@')[1] for e in emails}),
                    "chash": chash, "excluded": any(x in low for x in excl),
                    "stage": os.path.basename(stage),
                })
    # dup groups by content hash
    from collections import defaultdict
    byhash = defaultdict(list)
    for r in records:
        byhash[r["chash"]].append(r["orig_name"])
    for r in records:
        r["dup_of"] = [n for n in byhash[r["chash"]] if n != r["orig_name"]]

    out = os.path.join(a.staging, "manifest.json")
    json.dump(records, open(out, "w"), indent=1)
    inscope = [r for r in records if not r["excluded"]]
    print(f"converted {len(records)} files  ({len(inscope)} in-scope, {sum(1 for r in records if r['excluded'])} excluded, "
          f"{len(byhash)} unique content hashes)  -> {out}")
    print("\nin-scope, by date:")
    for r in sorted(inscope, key=lambda x: (x["date"] or 'zz', x["orig_name"])):
        dup = f"  DUP={r['dup_of']}" if r["dup_of"] else ""
        print(f"  {r['date'] or '????-??-??'} | wc={r['wc']:>5} | {r['orig_name'][:52]:52} | {r['domains']}{dup}")


if __name__ == "__main__":
    main()
