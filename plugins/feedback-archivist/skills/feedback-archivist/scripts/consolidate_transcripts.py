#!/usr/bin/env python3
"""Phase 3 — consolidate notes/transcript PAIRS to one file per meeting. Google "Notes by Gemini" docs
   embed the full transcript, so a separate standalone -transcript.md of the same meeting is redundant:
     - notes sibling already embeds the transcript  -> delete the redundant standalone -transcript.md
     - notes sibling is summary-only                 -> fold the transcript body into the notes, delete standalone
   Standalone transcripts with NO notes sibling (their sole record) are left alone. Updates .placements.json.

Usage: python consolidate_transcripts.py --out ARCHIVE_DIR
"""
import argparse, os, re, json


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    pf = os.path.join(a.out, ".placements.json")
    P = json.load(open(pf)); placed = P["placed"]
    actions = []
    for p in list(placed):
        path = p.get("path", "")
        if p.get("doc_type") != "Transcript" or not path.endswith("-transcript.md"):
            continue
        sib_rel = path[:-len("-transcript.md")] + ".md"
        sib = os.path.join(a.out, sib_rel)
        tp = os.path.join(a.out, path)
        if not os.path.exists(sib):
            actions.append((path, "kept (standalone — no notes sibling)")); continue
        nbody = open(sib).read()
        embeds = ("### 00:" in nbody) or bool(re.search(r"(?im)^#+\s.*transcript\s*$", nbody))
        if embeds:
            os.remove(tp); act = "deleted redundant (transcript already embedded in notes)"
        else:
            tb = open(tp).read()
            tb = re.sub(r"^---\n.*?\n---\n", "", tb, count=1, flags=re.S)   # drop front-matter
            tb = re.sub(r"^(?:>.*\n|\n)+", "", tb)                          # drop leading context blockquote
            open(sib, "a").write("\n\n---\n\n" + tb.strip() + "\n")
            os.remove(tp); act = "merged transcript into summary-only notes"
        placed.remove(p); actions.append((path, act + f"  -> {sib_rel}"))
    json.dump(P, open(pf, "w"), indent=1)
    for pth, act in actions:
        print(f"  {act:58} {pth}")


if __name__ == "__main__":
    main()
