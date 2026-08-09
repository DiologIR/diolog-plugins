#!/usr/bin/env python3
"""Derive a deck theme block from a company's DESIGN.md.

The deck and the company's other surfaces must not drift apart in silence, so
the deck's :root block is generated from the design system rather than
transcribed by eye. Approximating a brand colour is the most visible failure a
branded deck has, and it is invisible to every automated check.

The web ramp is mapped onto the deck ramp by ONE ratio, not by copying values:
a 17px web body is unreadable on a 1920x1080 stage read at distance, but the
ratios between the system's steps are the system, and they carry over intact.

Usage
    python3 theme_from_design.py DESIGN.md            > theme.css
    python3 theme_from_design.py DESIGN.md --body 32  > theme.css   # denser stage
    python3 theme_from_design.py DESIGN.md --report              # what it found

Reads a DESIGN.md whose token blocks are written as indented `key: value`
lines (the shape design-md-from-website emits). Anything it cannot resolve is
left at a documented fallback and named in the report, so a missing token is a
decision you take rather than one that happens to you.
"""

import argparse
import re
import sys

HEX = re.compile(r'#[0-9A-Fa-f]{3,8}')
KV = re.compile(r'^(\s*)([A-Za-z][\w.-]*)\s*:\s*(.*)$')
QUOTED = re.compile(r'^(["\'])(.*?)\1')


def clean(value):
    """Take the value off a `key: value  # note` line.

    A hex colour begins with the same character a comment does, so a naive
    comment strip silently deletes the entire palette and every colour falls
    back to a default that looks plausible. Quoted values are read to their
    closing quote; unquoted ones lose only a whitespace-separated trailing note.
    """
    value = value.strip()
    q = QUOTED.match(value)
    if q:
        return q.group(2)
    return re.sub(r'\s+#(?![0-9A-Fa-f]{3,8}\b).*$', '', value).strip()
PX = re.compile(r'(-?\d+(?:\.\d+)?)\s*px')

# Deck token <- design-system role. First name that resolves wins, so the list
# is ordered from the most explicit naming convention to the loosest.
COLOR_MAP = [
    ('--brand',         ['primary', 'brand', 'accent', 'brand-primary']),
    ('--brand-hover',   ['primary-hover', 'brand-hover', 'accent-hover']),
    ('--brand-pressed', ['primary-pressed', 'primary-active', 'brand-pressed']),
    ('--brand-tint',    ['primary-tint', 'brand-tint', 'accent-tint', 'primary-subtle']),
    ('--link',          ['link', 'primary-deep', 'link-color']),
    ('--ink',           ['ink', 'text', 'text-primary', 'foreground', 'heading']),
    ('--ink-body',      ['ink-body', 'text-body', 'text-secondary', 'body']),
    ('--ink-muted',     ['ink-muted', 'text-muted', 'muted', 'text-tertiary']),
    ('--canvas',        ['canvas', 'background', 'bg', 'page', 'surface-canvas']),
    ('--surface',       ['surface', 'card', 'surface-default', 'surface-raised']),
    ('--sunken',        ['surface-sunken', 'sunken', 'surface-subtle', 'muted-surface']),
    ('--dark',          ['surface-dark', 'dark', 'inverse', 'surface-inverse']),
    ('--dark-raised',   ['surface-dark-raised', 'dark-raised', 'inverse-raised']),
    ('--footer-bg',     ['surface-footer', 'footer', 'surface-darkest']),
    ('--scrim',         ['scrim', 'overlay', 'photo-overlay']),
    ('--on-dark',       ['on-dark', 'on-inverse', 'text-inverse', 'on-primary']),
    ('--on-dark-muted', ['on-dark-muted', 'on-inverse-muted', 'text-inverse-muted']),
    ('--border',        ['border', 'divider', 'hairline', 'outline']),
    ('--border-strong', ['border-strong', 'divider-strong', 'border-emphasis']),
]

# Deck ramp <- web ramp step. The deck needs display sizes a web system rarely
# defines; those are derived from the ratio ladder below instead.
TYPE_MAP = [
    ('--t-display', ['display', 'hero', 'headline-2xl', 'h1']),
    ('--t-title',   ['headline-xl', 'headline-lg', 'title', 'h2']),
    ('--t-sub',     ['headline-md', 'subtitle', 'h3']),
    ('--t-lead',    ['lead', 'body-lg', 'intro', 'subhead']),
    ('--t-body',    ['body', 'body-md', 'text', 'paragraph']),
    ('--t-small',   ['body-sm', 'small', 'caption-lg']),
    ('--t-fine',    ['caption', 'fine', 'body-xs', 'footnote']),
    ('--t-over',    ['overline', 'eyebrow', 'label', 'micro']),
]

# Fallback ladder as multiples of the deck body size, used for any step the
# design system does not define. Chosen to match the ramp of the reference
# build, which was itself derived from a real system.
LADDER = {
    '--t-display': 3.86, '--t-title': 2.48, '--t-sub': 1.45, '--t-lead': 1.17,
    '--t-body': 1.00, '--t-small': 0.83, '--t-fine': 0.76, '--t-over': 0.69,
    '--t-quote': 0.97, '--t-card': 0.90,
    '--t-stat': 3.59, '--t-stat-md': 2.07, '--t-stat-sm': 1.52, '--t-figure': 1.38,
}

FALLBACK_COLORS = {
    '--brand': '#D72229', '--brand-hover': '#B91D23', '--brand-pressed': '#9E1318',
    '--brand-tint': '#FBE9E9', '--link': '#C0202A',
    '--ink': '#1C1B1B', '--ink-body': '#3A3A3A', '--ink-muted': '#6E6968',
    '--canvas': '#F7F6F5', '--surface': '#FFFFFF', '--sunken': '#EFEDEC',
    '--dark': '#2E2B2B', '--dark-raised': '#3C3939', '--footer-bg': '#181717',
    '--scrim': '#000000DB', '--on-dark': '#FFFFFF', '--on-dark-muted': '#B7B2B1',
    '--border': '#E2DFDD', '--border-strong': '#C4C0BE',
}


def parse(path):
    """Collect every `key: value` line with its parent section and depth.

    Deliberately tolerant: design systems in this codebase are written as
    YAML-shaped markdown, sometimes inside a fenced block, sometimes not, and a
    strict parser fails on the first stray line of prose.
    """
    colors, types, scalars = {}, {}, {}
    section, block = None, None
    with open(path, encoding='utf-8') as fh:
        for raw in fh:
            line = raw.rstrip('\n')
            if not line.strip() or line.lstrip().startswith('#'):
                continue
            m = KV.match(line)
            if not m:
                continue
            indent, key, value = len(m.group(1)), m.group(2), clean(m.group(3))
            if indent == 0:
                section, block = key.lower(), None
                continue
            if section in ('colors', 'color', 'palette') and value:
                if HEX.search(value):
                    colors.setdefault(key.lower(), HEX.search(value).group(0))
                continue
            if section in ('typography', 'type', 'fonts'):
                if not value:                      # a nested style block opened
                    block = key.lower()
                    continue
                if key.lower().startswith('font-') and not PX.search(value):
                    scalars.setdefault(key.lower(), value)
                elif key.lower() in ('fontsize', 'font-size', 'size') and block:
                    px = PX.search(value)
                    if px:
                        types.setdefault(block, float(px.group(1)))
                continue
            if value and PX.search(value):
                scalars.setdefault('%s.%s' % (section, key.lower()), value)
    return colors, types, scalars


def resolve(names, table):
    for n in names:
        if n in table:
            return table[n], n
    return None, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('design_md')
    ap.add_argument('--body', type=int, default=29,
                    help='deck body size in px on a 1920x1080 stage (default 29)')
    ap.add_argument('--report', action='store_true',
                    help='print what resolved and what fell back, instead of CSS')
    args = ap.parse_args()

    colors, types, scalars = parse(args.design_md)
    found, missing = [], []

    out_colors = {}
    for token, names in COLOR_MAP:
        val, src = resolve(names, colors)
        if val:
            out_colors[token] = val
            found.append('%-16s <- colors.%s  %s' % (token, src, val))
        else:
            out_colors[token] = FALLBACK_COLORS[token]
            missing.append('%-16s no match in DESIGN.md, using %s' % (token, FALLBACK_COLORS[token]))

    # Derived colours the deck needs and a web system almost never states.
    out_colors.setdefault('--brand-on-dark', colors.get('primary-on-dark', ''))
    if not out_colors['--brand-on-dark']:
        out_colors['--brand-on-dark'] = '#FF6A6E'
        missing.append('--brand-on-dark   no match; using #FF6A6E. Check it clears '
                       '4.5:1 on --dark, or lighten the brand hue until it does.')
    out_colors['--on-dark-body'] = colors.get('on-dark-body') or '#DAD7D6'
    if 'on-dark-body' not in colors:
        missing.append('--on-dark-body    no match; using #DAD7D6 (body copy on dark '
                       'grounds). This token exists so on-dark body text is not '
                       'written as a literal hex on 13 separate slides.')

    # Type ramp. One ratio from the system's own body size to the deck's.
    web_body, body_src = resolve(TYPE_MAP[4][1], types)
    ratio = (args.body / web_body) if web_body else None
    if ratio:
        found.append('type ratio       <- %.2fx (typography.%s %gpx -> %dpx deck body)'
                     % (ratio, body_src, web_body, args.body))
    else:
        missing.append('type ratio        no body size in DESIGN.md; the whole ramp '
                       'comes from the fallback ladder. Check it against the system by eye.')

    out_type = {}
    for token, names in TYPE_MAP:
        val, src = resolve(names, types)
        if val and ratio:
            out_type[token] = int(round(val * ratio))
            found.append('%-16s <- typography.%s %gpx x%.2f' % (token, src, val, ratio))
        else:
            out_type[token] = int(round(args.body * LADDER[token]))
            if token != '--t-body':
                missing.append('%-16s not in DESIGN.md; derived %dpx from the ladder'
                               % (token, out_type[token]))
    for token in ('--t-quote', '--t-card', '--t-stat', '--t-stat-md', '--t-stat-sm', '--t-figure'):
        out_type[token] = int(round(args.body * LADDER[token]))

    fonts = {
        '--font-display': scalars.get('font-display') or scalars.get('font-heading')
        or "Figtree,-apple-system,system-ui,'Segoe UI',Roboto,Arial,sans-serif",
        '--font-body': scalars.get('font-body') or scalars.get('font-sans')
        or "Figtree,-apple-system,system-ui,'Segoe UI',Roboto,Arial,sans-serif",
        '--font-mono': scalars.get('font-mono')
        or "'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace",
    }
    for k, v in fonts.items():
        (found if k.replace('--font-', 'font-') in scalars else missing).append(
            '%-16s %s' % (k, v))

    if args.report:
        print('RESOLVED FROM %s  (%d)' % (args.design_md, len(found)))
        for line in found:
            print('  ' + line)
        print('\nFELL BACK  (%d) — decide each of these deliberately' % len(missing))
        for line in missing:
            print('  ' + line)
        print('\nFONT FAMILIES to load: %s | %s | %s'
              % (fonts['--font-display'].split(',')[0],
                 fonts['--font-body'].split(',')[0],
                 fonts['--font-mono'].split(',')[0]))
        return

    w = sys.stdout.write
    w(':root{\n')
    w('  /* Generated by theme_from_design.py from %s.\n' % args.design_md)
    w('     %d tokens resolved from the design system, %d fell back.\n'
      '     Regenerate rather than hand-editing, so the deck cannot drift from\n'
      '     the company\'s other surfaces without anyone noticing. */\n' % (len(found), len(missing)))
    for token in ('--brand', '--brand-hover', '--brand-pressed', '--brand-tint',
                  '--brand-on-dark', '--link'):
        w('  %s:%s;\n' % (token, out_colors[token]))
    w('\n')
    for token in ('--ink', '--ink-body', '--ink-muted', '--canvas', '--surface', '--sunken',
                  '--dark', '--dark-raised', '--footer-bg', '--scrim',
                  '--on-dark', '--on-dark-body', '--on-dark-muted', '--border', '--border-strong'):
        w('  %s:%s;\n' % (token, out_colors[token]))
    w('\n')
    for token in ('--font-display', '--font-body', '--font-mono'):
        w('  %s:%s;\n' % (token, fonts[token]))
    w('\n  /* Type ramp for a 1920x1080 stage%s */\n'
      % (' (%.2fx the system\'s web ramp)' % ratio if ratio else ''))
    for token in ('--t-display', '--t-title', '--t-sub', '--t-lead', '--t-body',
                  '--t-small', '--t-fine', '--t-over', '--t-quote', '--t-card',
                  '--t-stat', '--t-stat-md', '--t-stat-sm', '--t-figure'):
        w('  %s:%dpx;\n' % (token, out_type[token]))
    w('''
  --pad-x:112px; --pad-top:88px; --pad-bottom:120px; --gap-item:24px;
  --foot-b:44px;

  --r-sm:10px; --r-md:14px; --r-lg:20px; --r-xl:28px; --r-full:9999px;
  --e-md:0 4px 6px -1px rgba(28,27,27,.08),0 2px 4px -2px rgba(28,27,27,.06);
  --e-xl:0 24px 48px -12px rgba(28,27,27,.18);
  --ease-out:cubic-bezier(.2,0,0,1);
  --dur-fast:120ms; --dur-base:220ms; --dur-slow:420ms;

  --s:1;
}
''')


if __name__ == '__main__':
    main()
