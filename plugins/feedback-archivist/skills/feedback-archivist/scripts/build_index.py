#!/usr/bin/env python3
"""Phase 9 — build INDEX.md from .placements.json + classification.json. Groups meetings into per-segment
   tables, lists research/other docs (scanned on-disk so subagent- and hand-written files are captured),
   and emits the who's-who, de-dup note, Gemini-summary rule, excluded list, media inventory, and
   provenance. Undated files show `≈ YYYY-MM` from their date_probable.

Usage: python build_index.py --out ARCHIVE_DIR --classification classification.json

Optional `index` block in classification.json:
  {"index": {"archive_title": "...", "intro": "...", "segment_blurbs": {"01-...": "..."},
             "media": ["path — note", ...], "sources": ["desc", ...]}}
"""
import argparse, os, json
from collections import defaultdict


def dcol(p):
    if p["date"] != "undated":
        return p["date"]
    return ("≈ " + p["date_probable"]) if p.get("date_probable") else "undated"


def dkey(p):
    if p["date"] != "undated":
        return p["date"]
    pd = p.get("date_probable") or "zzzz"
    return pd.replace("-Q1", "-02").replace("-Q2", "-05").replace("-H1", "-04").replace("-H2", "-10")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--classification", required=True)
    a = ap.parse_args()
    P = json.load(open(os.path.join(a.out, ".placements.json")))
    C = json.load(open(a.classification))
    idx = C.get("index", {})
    seg_labels = C.get("segment_labels", {})
    placed = [p for p in P["placed"]]
    excluded = P.get("excluded", [])
    rep = C.get("internal_rep", "the internal rep")
    blurb = C.get("internal_blurb", "")

    byfolder = defaultdict(list)
    for p in placed:
        byfolder[p["folder"]].append(p)
    order = sorted(byfolder, key=lambda f: (0 if f[:2].isdigit() else 1, f))
    if "research-and-personas" in order:
        order = [f for f in order if f != "research-and-personas"] + ["research-and-personas"]
    if "other" in order:
        order = [f for f in order if f != "other"] + ["other"]

    L = []
    w = L.append
    w(f"# {idx.get('archive_title', 'Customer feedback & product-discovery archive')}\n")
    w(idx.get("intro", f"Verbatim meeting transcripts, notes, and research captured as primary sources. {blurb}") + "\n")
    w(f"> **Who's who.** The internal voice is **{rep}**; the external party in each meeting file is named "
      f"in its front-matter (`external:`), identified by email domain / firm.\n")
    n_meet = sum(1 for p in placed if p.get("person"))
    w(f"**Contents:** {len(placed)} documents — {n_meet} meeting records + {len(placed)-n_meet} research/other "
      f"docs. {len(excluded)} recorded meetings were reviewed and excluded (listed at the bottom).\n")

    w("## How this is organised\n")
    w("Files are grouped by **buyer segment**, then dated. Naming: `YYYY-MM-DD-<person>-<company>"
      "[-transcript|-testimonial].md`; `undated-…` when no date is known; `≈ YYYY-MM` marks a **probable** "
      "date (basis in the file's front-matter). Each meeting file is the **verbatim** source with a "
      "front-matter + one-line context header.\n")
    w("**One record per meeting.** Where the same meeting appeared as a Gemini note, a raw transcript, and "
      "a Slack recap, it was consolidated to a single canonical file (the transcript is the source of "
      "truth; Slack recaps were merged in under a `## Slack recap` heading with a pointer left in the "
      "digest). A content-hash check confirms no meeting body appears in two files.\n")
    w("**Gemini summaries.** Google's *“Notes by Gemini”* auto Summary/Details/Suggested-next-steps were "
      "**removed from every file that has the verbatim transcript**; meetings with **no** transcript keep "
      "their Gemini summary as their only record.\n")

    w("## Segments\n")
    for f in order:
        items = byfolder[f]
        title = seg_labels.get(f, f)
        w(f"### {title}  ({len(items)})\n")
        if idx.get("segment_blurbs", {}).get(f):
            w(f"*{idx['segment_blurbs'][f]}*\n")
        meets = sorted([p for p in items if p.get("person")], key=lambda x: (dkey(x), x["path"]))
        if meets:
            w("| Date | External party | Company | Type | File |")
            w("|---|---|---|---|---|")
            for p in meets:
                w(f"| {dcol(p)} | {p['person']} | {p['company']} | {p['doc_type']} | `{os.path.basename(p['path'])}` |")
            w("")
        meet_files = {os.path.basename(p["path"]) for p in meets}
        fdir = os.path.join(a.out, f)
        docs = sorted(fn for fn in (os.listdir(fdir) if os.path.isdir(fdir) else []) if fn.endswith(".md") and fn not in meet_files)
        if docs:
            w("| Document | File |")
            w("|---|---|")
            for fn in docs:
                w(f"| {fn.replace('.md','').replace('-',' ')} | `{fn}` |")
            w("")

    if os.path.isdir(os.path.join(a.out, "slack")):
        w("### Slack  (`slack/`)\n")
        for fn in sorted(os.listdir(os.path.join(a.out, "slack"))):
            if fn.endswith(".md"):
                w(f"- `slack/{fn}`")
        w("\nCurated verbatim digests mined from internal Slack channels; bot/test/chatter dropped, "
          "authors resolved from `users.json`. Recaps of meetings that have a transcript are pointer-linked "
          "to the canonical file.\n")

    if excluded:
        w("## Excluded — reviewed but not product feedback\n")
        seen = set()
        for name, why in excluded:
            k = name.split(" - 20")[0]
            if k in seen:
                continue
            seen.add(k)
            w(f"- **{k.strip()}** — {why}")
        w("")
    if idx.get("media"):
        w("## Media not converted\n")
        for m in idx["media"]:
            w(f"- {m}")
        w("")
    if idx.get("sources"):
        w("## Sources\n")
        for s in idx["sources"]:
            w(f"- {s}")
        w("")

    open(os.path.join(a.out, "INDEX.md"), "w").write("\n".join(L) + "\n")
    print(f"wrote INDEX.md — {n_meet} meetings, {len(placed)-n_meet} docs, {len(excluded)} excluded, "
          f"folders: {', '.join(order)}")


if __name__ == "__main__":
    main()
