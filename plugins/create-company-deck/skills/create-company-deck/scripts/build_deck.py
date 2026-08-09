#!/usr/bin/env python3
"""Assemble a deck from the shell, a generated theme block, and slide files.

Doing this by hand is where the mechanical errors live: a slide inserted in the
middle leaves every later footer showing the wrong page number, two slides end
up sharing an id, and a `{{PLACEHOLDER}}` ships to production because nobody
re-read slide 9. All three are silent — the deck renders perfectly.

So the numbering is derived, never typed: slide order in the argument list is
the deck's order, and ids, data-screen-labels and footer page numbers are all
rewritten from it on every build. Rebuilding after an edit is cheap and
idempotent; keeping the numbers in your head is not.

Usage
    python3 build_deck.py \
        --shell assets/deck-shell.html \
        --theme build/theme.css \
        --slides build/s01.html build/s02.html build/s03.html \
        -o public/deck.html

Slide files are the filled copies of assets/slides/*.html — one <section
class="slide"> each. Edit those, rebuild, and the numbering follows.
"""

import argparse
import re
import sys

THEME_BLOCK = re.compile(r'/\* ===== THEME ===== \*/.*?/\* ===== /THEME ===== \*/', re.S)
SLIDE_MARKER = '<!-- SLIDES -->'
SECTION = re.compile(r'<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>', re.I)
PLACEHOLDER = re.compile(r'\{\{[A-Z0-9_]+\}\}')
FOOT = re.compile(r'(<div class="foot[^"]*"[^>]*>.*?<span>)([^<]*)(</span>\s*</div>)', re.S)


def renumber(slide_html, n, total):
    """Rewrite one slide's id, screen label and footer page number from its index."""
    nn = '%02d' % n
    tag = SECTION.search(slide_html)
    if not tag:
        raise SystemExit('no <section class="slide"> found in a slide file')
    new_tag = tag.group(0)
    new_tag = re.sub(r'\bid="[^"]*"', 'id="s%d"' % n, new_tag)
    if 'id=' not in new_tag:
        new_tag = new_tag.replace('<section', '<section id="s%d"' % n, 1)
    # Keep the human-written label, replace only its leading number.
    label = re.search(r'data-screen-label="([^"]*)"', new_tag)
    if label:
        text = re.sub(r'^\s*(?:\{\{NN\}\}|\d+)\s*', '', label.group(1)).strip()
        new_tag = new_tag.replace(label.group(0), 'data-screen-label="%s %s"' % (nn, text))
    else:
        new_tag = new_tag.replace('<section', '<section data-screen-label="%s Slide"' % nn, 1)
    slide_html = slide_html.replace(tag.group(0), new_tag, 1)

    # The footer's trailing <span> is the page number, wherever it sits.
    def foot_sub(m):
        return m.group(1) + nn + m.group(3)
    slide_html = FOOT.sub(foot_sub, slide_html)

    return (slide_html.replace('{{NN}}', nn)
                      .replace('{{N}}', str(n))
                      .replace('{{TOTAL}}', str(total)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--shell', required=True)
    ap.add_argument('--theme', help='CSS file holding the :root block (theme_from_design.py)')
    ap.add_argument('--slides', nargs='+', required=True, help='slide files, in deck order')
    ap.add_argument('-o', '--out', required=True)
    ap.add_argument('--allow-placeholders', action='store_true',
                    help='build anyway when {{SLOTS}} remain unfilled (drafts only)')
    args = ap.parse_args()

    shell = open(args.shell, encoding='utf-8').read()

    if args.theme:
        theme = open(args.theme, encoding='utf-8').read().strip()
        if not THEME_BLOCK.search(shell):
            raise SystemExit('shell has no /* ===== THEME ===== */ region to replace')
        shell = THEME_BLOCK.sub(
            lambda _: '/* ===== THEME ===== */\n%s\n/* ===== /THEME ===== */' % theme,
            shell, count=1)

    total = len(args.slides)
    body = []
    for i, path in enumerate(args.slides, start=1):
        raw = open(path, encoding='utf-8').read()
        body.append('<!-- %s · %s -->\n%s' % ('%02d' % i, path.split('/')[-1], renumber(raw, i, total)))
    deck = shell.replace(SLIDE_MARKER, '\n\n'.join(body))

    left = sorted(set(PLACEHOLDER.findall(deck)))
    if left:
        where = []
        for line_no, line in enumerate(deck.splitlines(), 1):
            for ph in PLACEHOLDER.findall(line):
                where.append('  line %d  %s' % (line_no, ph))
        msg = ('%d unfilled placeholder(s) remain:\n%s'
               % (len(where), '\n'.join(where[:40])))
        if not args.allow_placeholders:
            raise SystemExit(msg + '\n\nFill them, or pass --allow-placeholders for a draft build.')
        sys.stderr.write(msg + '\n\n')

    with open(args.out, 'w', encoding='utf-8') as fh:
        fh.write(deck)
    sys.stderr.write('built %s — %d slides, %d bytes\n' % (args.out, total, len(deck)))


if __name__ == '__main__':
    main()
