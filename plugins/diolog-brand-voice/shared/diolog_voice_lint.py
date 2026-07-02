#!/usr/bin/env python3
"""
diolog_voice_lint.py — deterministic guardrail for a Diolog brand-voice draft.

Why this exists: a few of Diolog's house rules are the exact things a language
model most reliably slips on, and "I checked" is not the same as checking. The
big one is dashes: Diolog's writing uses a spaced hyphen ( - ), never an em dash
(—) OR an en dash (–). Both are the #1 AI tell and neither exists in the brand's
copy or its published articles. This script hard-fails on either, plus on a list
of AI-cliche / banned marketing phrases the brand avoids, so the human review can
focus on the harder question of whether it actually sounds like Diolog.

It also surfaces ADVISORY signals that need judgement rather than a hard gate:
American spellings in AU content, over-claim / compliance-guarantee language
(Diolog caps compliance confidence at 95% and never guarantees outcomes), and a
citation-coverage reminder (every statistic should carry an inline "(Source,
Year)"). These warn but never fail the run on their own.

Usage:
    python3 diolog_voice_lint.py draft.md
    python3 diolog_voice_lint.py --format article       draft.md
    python3 diolog_voice_lint.py --format marketing     draft.md
    python3 diolog_voice_lint.py --format business-case draft.md
    cat draft.md | python3 diolog_voice_lint.py -

Exit code is non-zero if any em/en dash or banned phrase is found, so it can gate
delivery. Spelling, over-claim, citation and length notes are advisory only.
Dependency-free; runs anywhere python3 does.
"""

import argparse
import re
import sys

# --- HARD FAIL: dashes -------------------------------------------------------
# Em dash (U+2014), horizontal bar (U+2015), and en dash (U+2013). Unlike a
# personal-voice lint, Diolog bans the en dash TOO — spaced hyphen only, even in
# numeric ranges ("FY24 - FY26", "3 - 5 years"). No exceptions.
BANNED_DASHES = ["—", "―", "–"]

# --- HARD FAIL: AI-cliche / off-brand marketing phrases ----------------------
# Lowercase substring match on each line. These are the words the brand actively
# avoids (hype, consultant-speak, and generic AI tells). "easy" / "simple" /
# "just" are discouraged but too common in legitimate sentences to hard-fail, so
# they are advisory (see SOFT_WORDS) rather than listed here.
BANNED_PHRASES = [
    "revolutionary", "game-changing", "game changing", "game-changer",
    "game changer", "disrupting", "disrupt ", "disruptive",
    "automate your compliance", "never miss anything again",
    "cutting-edge", "cutting edge", "leverage", "synergy", "synergies",
    "paradigm", "paradigm shift", "data-driven insights", "seamless",
    "seamlessly", "delve", "unlock", "dynamic landscape",
    "let's break it down", "lets break it down", "in today's fast-paced",
    "in todays fast-paced", "fast-paced world", "ever-evolving",
    "ever evolving", "move the needle", "needle-moving", "best-in-class",
    "best in class", "thought leader", "circle back", "low-hanging fruit",
    "supercharge", "in conclusion,", "at the end of the day",
    "buckle up", "it's no secret that", "its no secret that",
]

# --- ADVISORY: American spellings in AU content ------------------------------
# word (as seen) -> suggested Australian form. Whole-word match, case-insensitive.
US_SPELLINGS = {
    "analyze": "analyse", "analyzed": "analysed", "analyzing": "analysing",
    "color": "colour", "colors": "colours", "colored": "coloured",
    "organize": "organise", "organized": "organised", "organizing": "organising",
    "organization": "organisation", "organizations": "organisations",
    "behavior": "behaviour", "behaviors": "behaviours",
    "center": "centre", "centers": "centres",
    "optimize": "optimise", "optimized": "optimised", "optimizing": "optimising",
    "prioritize": "prioritise", "prioritized": "prioritised",
    "recognize": "recognise", "recognized": "recognised",
    "customize": "customise", "customized": "customised",
    "favor": "favour", "favors": "favours", "favorite": "favourite",
    "fulfill": "fulfil", "enrollment": "enrolment",
    "license": "licence (noun)", "defense": "defence",
}

# --- ADVISORY: over-claim / compliance-guarantee language --------------------
# Diolog caps compliance confidence at 95% and never guarantees an outcome.
OVERCLAIM_PATTERNS = [
    r"100\s*%\s*compl", r"guarantee[ds]?\b", r"guaranteed\b",
    r"ensures?\s+compliance", r"fully\s+compliant", r"never\s+miss",
    r"eliminat\w*\s+risk", r"zero\s+risk", r"risk[- ]free",
    r"will\s+(?:increase|improve|boost|raise)\s+(?:your\s+)?(?:share\s+price|returns?)",
]

# --- ADVISORY: soft words (patronising / filler) -----------------------------
SOFT_WORDS = ["easy", "simple", "simply", "just ", "effortless", "hassle-free"]


def read_text(path):
    if path == "-":
        return sys.stdin.read()
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def main():
    ap = argparse.ArgumentParser(description="Lint a Diolog brand-voice draft.")
    ap.add_argument("path", help="Path to the draft, or - for stdin")
    ap.add_argument(
        "--format",
        choices=["article", "marketing", "business-case"],
        default=None,
        help="Add surface-specific length notes",
    )
    args = ap.parse_args()

    text = read_text(args.path)
    lines = text.splitlines()
    failures = 0

    # --- Dashes (hard fail) ---
    dash_hits = []
    for i, line in enumerate(lines, 1):
        if any(d in line for d in BANNED_DASHES):
            dash_hits.append((i, line.strip()))
    if dash_hits:
        failures += len(dash_hits)
        print("FAIL  em/en dash found (use a spaced hyphen ' - ', comma, semicolon, or full stop):")
        for i, line in dash_hits:
            print(f"      line {i}: {line}")
    else:
        print("ok    no em/en dashes")

    # --- Banned phrases (hard fail) ---
    phrase_hits = []
    for i, line in enumerate(lines, 1):
        low = line.lower()
        for p in BANNED_PHRASES:
            if p in low:
                phrase_hits.append((i, p.strip(), line.strip()))
    if phrase_hits:
        failures += len(phrase_hits)
        print("FAIL  banned / AI-tell phrase(s) found (rewrite in plain, specific language):")
        for i, p, line in phrase_hits:
            print(f'      line {i}: "{p}"  ->  {line}')
    else:
        print("ok    no banned / AI-tell phrases")

    # --- American spellings (advisory) ---
    spell_hits = []
    for i, line in enumerate(lines, 1):
        for m in re.finditer(r"[A-Za-z][A-Za-z'-]*", line):
            w = m.group(0).lower()
            if w in US_SPELLINGS:
                spell_hits.append((i, m.group(0), US_SPELLINGS[w]))
    if spell_hits:
        print("warn  American spelling in AU content (use the Australian form):")
        for i, seen, sugg in spell_hits:
            print(f'      line {i}: "{seen}" -> "{sugg}"')

    # --- Over-claim / compliance guarantees (advisory) ---
    over_hits = []
    for i, line in enumerate(lines, 1):
        low = line.lower()
        for pat in OVERCLAIM_PATTERNS:
            if re.search(pat, low):
                over_hits.append((i, line.strip()))
                break
    if over_hits:
        print("warn  possible over-claim / guarantee (Diolog caps compliance confidence at 95% and never guarantees outcomes; soften to can/could/may):")
        for i, line in over_hits:
            print(f"      line {i}: {line}")

    # --- Soft / patronising words (advisory) ---
    soft_hits = []
    for i, line in enumerate(lines, 1):
        low = line.lower()
        for w in SOFT_WORDS:
            if w in low:
                soft_hits.append((i, w.strip(), line.strip()))
                break
    if soft_hits:
        print("warn  patronising / filler word (this audience are experts; prefer precise verbs):")
        for i, w, line in soft_hits:
            print(f'      line {i}: "{w}"  ->  {line}')

    # --- Citation coverage (advisory info) ---
    citation_re = re.compile(r"\([^)]*\b(?:19|20)\d{2}\b[^)]*\)")
    citations = len(citation_re.findall(text))
    # Lines that assert a number worth sourcing: a %, a $ figure, or a bare
    # multi-digit / "45%"-style stat. Rough heuristic, deliberately generous.
    stat_line_re = re.compile(r"(\b\d+(?:\.\d+)?\s?%|\$\s?\d|\b\d{2,}\b|\bone in \w+\b)")
    stat_lines = sum(1 for ln in lines if stat_line_re.search(ln))
    print(f"info  {citations} inline (Source, Year)-style citation(s); ~{stat_lines} line(s) assert a figure")
    if stat_lines > citations:
        print("      reminder: every statistic needs an inline (Source, Year) from the supplied research; add a source or drop the number, never invent one")

    # --- Stats (advisory) ---
    words = len(re.findall(r"\b\w+\b", text))
    chars = len(text)
    print(f"info  {words} words, {chars} characters")
    heading_hits = [ln.strip() for ln in lines if ln.strip().startswith("#")]
    # Flag Title-Case headings (sentence case is house style, except product names).
    titlecase = []
    for h in heading_hits:
        htext = h.lstrip("#").strip()
        words_h = [w for w in re.findall(r"[A-Za-z][A-Za-z'-]*", htext)]
        caps = [w for w in words_h[1:] if w[:1].isupper()]
        if len(words_h) >= 3 and len(caps) >= max(2, (len(words_h) - 1) // 2):
            titlecase.append(h)
    if titlecase:
        print("warn  heading may be Title Case (house style is sentence case, except product feature names like 'Compliance Guardian'):")
        for h in titlecase:
            print(f"      {h}")

    hook = next((ln.strip() for ln in lines if ln.strip() and not ln.strip().startswith("#")), "")
    if hook:
        print(f"info  opening line: {hook[:200]}")

    if args.format == "article":
        if words < 500:
            print(f"warn  {words} words is short for an article (investor-education/IR pieces run ~700-1500+)")
    elif args.format == "marketing":
        if words > 600:
            print(f"warn  {words} words is long for marketing copy (hero + sections stay tight; emails ~120-250)")
    elif args.format == "business-case":
        if words < 400:
            print(f"warn  {words} words is short for a business case (needs status-quo cost, change, proof, outcomes, next step)")

    print()
    if failures:
        print(f"RESULT: {failures} hard issue(s) - fix before delivering.")
        sys.exit(1)
    print("RESULT: clean on the hard checks (em/en dashes + banned phrases). Review the advisories above with judgement.")
    sys.exit(0)


if __name__ == "__main__":
    main()
