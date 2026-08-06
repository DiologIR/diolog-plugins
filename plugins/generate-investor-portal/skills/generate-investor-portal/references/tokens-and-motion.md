# Lifting a theme, and choosing motion

## The theme is a copy job, not a design job

A supplied DESIGN.md is **binding**. Take exact values. Do not round `#D72229` to `#D42229`
because it reads the same — it does not, and a near-miss is worse than an obvious substitution
because nobody catches it.

Map the DESIGN.md's names onto the contract's:

| DESIGN.md | contract |
|---|---|
| `primary`, `primary-hover`, `primary-pressed`, `primary-tint` | same |
| `ink`, `ink-body`, `ink-muted` | `ink`, `inkBody`, `inkMuted` |
| `canvas`, `surface`, `surface-sunken`, `surface-dark`, `surface-footer` | camelCase equivalents |
| `font-display`, `font-body`, `font-mono` | `fontDisplay`, `fontBody`, `fontMono` |
| `rounded.*` | `radius.*` |
| `elevation.*` | same |
| `motion.*` | same |
| container / gutter / prose | same |

## The one token you must compute: `primaryOnDark`

Almost no DESIGN.md carries it, and its absence is the most common accessibility failure in a
generated portal.

A brand accent chosen against white will usually fail AA on a charcoal band. Measured on a real
shipped portal: `#D72229` on `#2E2B2B` is **2.77:1** against a 4.5 floor. It landed on the hero
headline, both hero CTAs, the running ticker and the footer's only signup button — **35 failing
nodes on one page**, and the footer button repeated on eight of ten surfaces, making it the
most-repeated AA failure on the site.

Compute the lifted variant rather than guessing one:

```python
def srgb(c):
    c /= 255
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055) ** 2.4

def lum(hex_):
    h = hex_.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return 0.2126*srgb(r) + 0.7152*srgb(g) + 0.0722*srgb(b)

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)
```

Lighten the accent along its own hue until `ratio(candidate, surfaceDark) >= 4.6`. Keep the hue —
a lifted red is still the brand; a pink is not.

**Check the muted-on-dark alphas too.** `rgba(255,255,255,.34)` reads as "subtle" and measures
2.98:1. The honest range is `.55`–`.62`. This is arithmetic, not taste.

**Then assert it.** Do not write the ratios into a comment and move on — a comment carrying six
eyeballed figures is worse than none, because the next reader trusts it. Compute, and put the
computed values in the record's provenance note if you record them at all.

## Motion is a preset, not code

Pick per section from the enumerated set:

| preset | for |
|---|---|
| `reveal` | the default. Fade-and-rise on scroll |
| `lineMask` | a display headline arriving a line at a time |
| `parallax` | a background photograph drifting as its section leaves |
| `countUp` | numerals whose final value is already in the HTML |
| `lineDraw` | an SVG path drawing itself once |
| `clipUncover` | a photograph uncovering on entry |
| `railDrift` | a horizontal rail drifting against the scroll |
| `magnetic` | pointer-following pull on a primary control |
| `marquee` | a continuous tape |
| `webgl` | a three.js layer, named by preset |

### The WebGL preset comes from the company's own world

| preset | suits |
|---|---|
| `spaceFrame` | a drifting Warren truss — fabrication, construction, engineering |
| `strata` | slow-drifting bands — resources, energy, mining |
| `globe` | a wireframe globe with arcs — logistics, shipping, multi-market |
| `pointField` | a displaced point field — the house default when nothing fits |

Set `opacity` low (the shipped reference uses **0.26**) and give it a `mask` so it occupies a
band rather than the whole hero. The first version of that reference ran the frame across the
full hero at 0.55 and it read as scribble through the copy — a mask confining it to a band low
in the frame is what turned it into structure.

### Two rules that are not stylistic

- **Never put content behind motion.** Every layer is an optional CDN load behind SRI; a section
  whose motion never arrives must still render complete.
- **`marquee` requires an operable pause control** — WCAG 2.2.2, Level A. `prefers-reduced-motion`
  is honoured but a media query is not a mechanism, and hover-to-pause does not exist on touch.
