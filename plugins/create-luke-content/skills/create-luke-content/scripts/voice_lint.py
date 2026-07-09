#!/usr/bin/env python3
"""
voice_lint.py: deterministic guardrail for a Luke-voiced content draft.

Why this exists: the no-em-dash rule and the no-AI-cliche rule are the two
things a language model most reliably slips on, and "I checked" is not the same
as checking. Run this on the final draft (the content body only, without the
graphic-concept block) before delivering. It is fast, dependency-free, and
catches the mechanical failures so the human review can focus on whether it
actually sounds like Luke.

Usage:
    python3 voice_lint.py draft.md
    python3 voice_lint.py --format linkedin draft.md      # feed-post length checks
    python3 voice_lint.py --format blog draft.md          # long-form length checks
    python3 voice_lint.py --format marketing draft.md     # exclamation-density check
    python3 voice_lint.py --format review draft.md        # hype/exclamation checks
    python3 voice_lint.py --format slack draft.md         # message-length check
    python3 voice_lint.py --format short draft.md         # short-form budget checks
    python3 voice_lint.py --format brief draft.md         # segment-length check
    cat draft.md | python3 voice_lint.py -

Exit code is non-zero if any em dash or banned cliche is found, so it can gate
delivery. Format-specific notes are advisory and never fail the run on their own.
"""

import argparse
import re
import sys

# Em dash (U+2014) and the rarer horizontal bar (U+2015). En dash (U+2013) is
# allowed ONLY in numeric ranges (e.g. 200-400), so it is reported separately
# and only flagged when it sits between non-digits.
EM_DASHES = ["—", "―"]
EN_DASH = "–"

# AI-tell phrases Luke never uses. Lowercase substring match on a normalised line.
CLICHES = [
    "dynamic landscape", "let's dive in", "lets dive in", "let's break it down",
    "lets break it down", "in today's fast-paced", "in todays fast-paced",
    "fast-paced world", "game-changer", "game changer", "unlock the power",
    "unlock the potential", "delve into", "robust synergy", "synergy",
    "ever-evolving", "ever evolving", "navigate the complexities",
    "in conclusion,", "at the end of the day", "needle-moving", "move the needle",
    "leverage the power", "it's no secret that", "its no secret that",
    "buckle up", "the bottom line is", "paradigm shift", "best-in-class",
    "thought leader", "circle back", "low-hanging fruit", "supercharge",
    "long story short", "short version:", "the honest one:",
]


def read_text(path):
    if path == "-":
        return sys.stdin.read()
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def find_lines(text, needle_predicate):
    hits = []
    for i, line in enumerate(text.splitlines(), 1):
        for col, ch in enumerate(line):
            if needle_predicate(line, col, ch):
                hits.append((i, line.strip()))
                break
    return hits


def main():
    ap = argparse.ArgumentParser(description="Lint a Luke-voiced draft.")
    ap.add_argument("path", help="Path to the draft, or - for stdin")
    ap.add_argument("--format",
                    choices=["linkedin", "blog", "marketing", "review",
                             "slack", "short", "brief"],
                    default=None,
                    help="Add format-specific advisory checks")
    args = ap.parse_args()

    text = read_text(args.path)
    failures = 0

    # --- Em dashes (hard fail) ---
    em_hits = []
    for i, line in enumerate(text.splitlines(), 1):
        if any(d in line for d in EM_DASHES):
            em_hits.append((i, line.strip()))
    if em_hits:
        failures += len(em_hits)
        print("FAIL  em dash found (use ; , . or parentheses, or restructure):")
        for i, line in em_hits:
            print(f"      line {i}: {line}")
    else:
        print("ok    no em dashes")

    # --- En dash outside numeric ranges (advisory) ---
    en_warn = []
    for i, line in enumerate(text.splitlines(), 1):
        for m in re.finditer(re.escape(EN_DASH), line):
            c = m.start()
            left = line[c - 1] if c > 0 else " "
            right = line[c + 1] if c + 1 < len(line) else " "
            if not (left.isdigit() and right.isdigit()):
                en_warn.append((i, line.strip()))
                break
    if en_warn:
        print("warn  en dash outside a numeric range (only 200-400-style ranges are ok):")
        for i, line in en_warn:
            print(f"      line {i}: {line}")

    # --- Cliches (hard fail) ---
    cliche_hits = []
    for i, line in enumerate(text.splitlines(), 1):
        low = line.lower()
        for c in CLICHES:
            if c in low:
                cliche_hits.append((i, c, line.strip()))
    if cliche_hits:
        failures += len(cliche_hits)
        print("FAIL  AI-tell phrase(s) found (rewrite in plain language):")
        for i, c, line in cliche_hits:
            print(f"      line {i}: \"{c}\"  ->  {line}")
    else:
        print("ok    no AI-tell phrases")

    # --- Stats (advisory) ---
    words = len(re.findall(r"\b\w+\b", text))
    chars = len(text)
    print(f"info  {words} words, {chars} characters")

    # First non-empty line as the hook proxy
    hook = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    visible = hook[:200]
    print(f"info  hook (first ~200 chars): {visible}")
    if len(hook) > 0:
        print(f"info  hook length: {len(hook)} chars (only ~140-200 show before 'see more')")

    if args.format == "linkedin":
        if chars > 3000:
            print(f"warn  {chars} chars exceeds LinkedIn's 3000-char post limit")
        if words > 450:
            print(f"warn  {words} words is long for a feed post (150-400 tends to over-perform)")
    elif args.format == "blog":
        if words < 1200:
            print(f"warn  {words} words is short for a long-form article (aim ~1500-2200)")
    elif args.format == "marketing":
        bangs = text.count("!")
        sections = max(1, len(re.findall(r"^#{1,3} ", text, re.M)))
        if bangs > sections:
            print(f"warn  {bangs} exclamation marks across {sections} section(s); "
                  "the register allows at most one per section")
        for adj in ("revolutionary", "seamless", "cutting-edge", "world-class",
                    "next-generation", "innovative"):
            if adj in text.lower():
                print(f"warn  hype adjective \"{adj}\"; demonstrate the benefit concretely instead")
    elif args.format == "review":
        if "!" in text:
            print("warn  exclamation mark in a review; published reviews stay calm "
                  "(caps/bangs live only in private notes)")
        for bare in ("this is wrong", "this is bad", "don't do this"):
            if bare in text.lower():
                print(f"warn  bare negation \"{bare}\"; add the failure scenario and a concrete path")
    elif args.format == "slack":
        if words > 120:
            print(f"warn  {words} words is long for a Slack message; split the topic "
                  "or suggest a doc/call")
        if re.search(r"^(hi|hey|hello)\b", text.strip().lower()) :
            print("warn  greeting opener; mid-thread Slack goes straight in")
    elif args.format == "short":
        if words > 90:
            print(f"warn  {words} words is past short-form ({'~80'} is the ceiling); "
                  "pick the single sharpest idea")
        if chars > 280:
            print(f"info  {chars} chars exceeds an X/Twitter post budget (280)")
    elif args.format == "brief":
        # Segment = a run of non-empty lines between headings/blank-line seams.
        seg_words, longest = 0, 0
        for line in text.splitlines():
            if not line.strip() or re.match(r"^#{1,6} ", line):
                longest = max(longest, seg_words)
                seg_words = 0
            else:
                seg_words += len(re.findall(r"\b\w+\b", line))
        longest = max(longest, seg_words)
        if longest > 450:
            print(f"warn  longest unbroken segment is ~{longest} words; "
                  "insert a seam (heading, example, transition) before ~450")
        if "try" not in text.lower() and "today" not in text.lower():
            print("warn  no visible 'try this today' action; ADHD/brief closes need one")

    print()
    if failures:
        print(f"RESULT: {failures} hard issue(s); fix before delivering.")
        sys.exit(1)
    print("RESULT: clean on the hard checks (em dashes + cliches).")
    sys.exit(0)


if __name__ == "__main__":
    main()
