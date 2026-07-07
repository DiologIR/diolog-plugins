#!/usr/bin/env python3
"""Phase 7 — remove Google/Gemini auto-generated Summary / Details / Suggested-next-steps sections, but
   ONLY from files that contain a real embedded transcript (### 00: timestamp turns). The transcript is
   the source of truth, so its AI summary is redundant. Files with NO transcript KEEP their summary — it
   is their only record. Also removes the "A summary wasn't produced…" boilerplate from transcript files.
   Human-authored Slack recaps (## Slack …) are never touched. No files are deleted.

Usage: python strip_gemini_summaries.py --out ARCHIVE_DIR
"""
import argparse, os, re

GEM_HEAD = re.compile(r"^#{2,3}\s*(Summary|Details|Suggested next steps)\s*$", re.I)
L2 = re.compile(r"^##\s")          # a level-2 heading = the transcript title or a Slack recap = stop here
HR = re.compile(r"^---\s*$")
BOILER = re.compile(r"A summary wasn.t produced for this meeting.*?troubleshooting information[^\n]*", re.S | re.I)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    stripped = kept = 0
    for s in sorted(d for d in os.listdir(a.out) if d[:2].isdigit()):
        base = os.path.join(a.out, s)
        if not os.path.isdir(base):
            continue
        for fn in sorted(os.listdir(base)):
            if not fn.endswith(".md"):
                continue
            path = os.path.join(base, fn)
            text = open(path).read()
            if "### 00:" not in text:          # no transcript -> keep the summary
                kept += 1; continue
            lines = text.split("\n"); out = []; i = 0; did = False
            while i < len(lines):
                if GEM_HEAD.match(lines[i]):
                    j = i + 1
                    while j < len(lines) and not L2.match(lines[j]) and not HR.match(lines[j]):
                        j += 1
                    i = j; did = True; continue   # drop [Gemini-head .. next L2/HR/EOF)
                out.append(lines[i]); i += 1
            new = BOILER.sub("", "\n".join(out))
            new = re.sub(r"\n{3,}", "\n\n", new).rstrip() + "\n"
            if did or new != text:
                open(path, "w").write(new); stripped += 1
            else:
                kept += 1
    print(f"stripped Gemini summaries from {stripped} transcript-bearing files; kept {kept} files untouched")


if __name__ == "__main__":
    main()
