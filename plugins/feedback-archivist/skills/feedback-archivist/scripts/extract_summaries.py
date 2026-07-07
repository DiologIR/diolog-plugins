#!/usr/bin/env python3
"""Phase 2 aid — print each in-scope doc's Summary paragraph + attendee domains, deduped by content
   hash. This single view is what you classify from: domain tells you the company/segment, the summary
   resolves the ambiguous ones. Pipe it to a file and read it, then author classification.json.

Usage: python extract_summaries.py --staging STAGING_DIR
"""
import argparse, os, re, json


def summary_of(md: str) -> str:
    m = re.search(r"^#+\s*Summary\s*$", md, re.M | re.I)
    if m:
        rest = md[m.end():]
        nxt = re.search(r"^#+\s", rest, re.M)
        chunk = rest[:nxt.start()] if nxt else rest
    else:
        chunk = md
    chunk = re.sub(r"\[\[([^\]]*?)\]\{\.underline\}\]\([^)]*\)", r"\1", chunk)
    return re.sub(r"\s+", " ", chunk).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--staging", required=True)
    a = ap.parse_args()
    recs = json.load(open(os.path.join(a.staging, "manifest.json")))
    seen = set()
    for r in sorted(recs, key=lambda x: (x["date"] or "zz", x["orig_name"])):
        if r["excluded"]:
            continue
        if r["chash"] in seen and r["chash"] != "empty":
            continue
        seen.add(r["chash"])
        md = open(os.path.join(a.staging, r["stage"])).read()
        print(f"\n### {r['date'] or '????'} | {r['orig_name']}")
        print(f"DOMAINS: {r['domains']}   (mtime {r.get('mtime','')})")
        print(f"SUMMARY: {summary_of(md)[:700]}")


if __name__ == "__main__":
    main()
