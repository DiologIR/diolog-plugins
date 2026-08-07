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

**And check that something reads it.** Emitting the token is not applying it. On a real build
`primaryOnDark` was carried by the contract, set by every record, present in the rendered HTML,
and referenced by **no rule in the stylesheet** — so every accent word on every dark band was
still painted in raw `--primary`, and the house tier's 72px company name sat at **2.14:1**. It
passed every check anyone thought to run, because all of them looked for the token rather than
for the colour on the node.

Two things follow. Grep the stylesheet for `var(--primary-on-dark)` before believing the token
does anything. And when you add the rule, **put it last in the file**: `.thesis__n` and
`.hero h1 em` declare `color: var(--primary)` at equal specificity, so a rule placed earlier
loses to source order and fixes only the selectors that happened to be more specific. An
equal-specificity override that loses to source order is indistinguishable from a rule that was
never written.

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


## The surface set, on a dark theme

`primaryOnDark` is the token everyone knows to compute. The surfaces are the ones that
get missed, and they fail more visibly.

A stylesheet's defaults are not neutral — they were authored for one theme. A DESIGN.md
that states a dark canvas but omits `surface-sunken` therefore inherits a **light**
default for it, and every rule keyed to that token paints a light band on a dark page.
On a real run this was `.facts tbody tr:nth-child(even)`: white bars with invisible text
straight across a dark company's facts table, on a page that had already passed a token
check and a 200.

So derive, rather than inherit:

```js
const isDark = luminance(canvas) < 0.2;
surface:       stated ?? (isDark ? shift(canvas, +10) : '#FFFFFF')
surfaceSunken: stated ?? (isDark ? shift(canvas, +18) : undefined)
border:        stated ?? (isDark ? shift(canvas, +28) : undefined)
ink:           stated ?? (isDark ? '#F5F5F5' : '#1C1B1B')
```

The rule generalises past colour: **the token a brand forgets is the token that breaks.**
Compute it from what the brand did state, and a partial DESIGN.md produces a coherent
portal rather than a half-inverted one.

## Every token, not only the surfaces — an unset token is another company's brand

The derivation above covers the tokens that fail *visibly*. The ones that fail *quietly* are the
rest of the palette, and they fail worse, because the stylesheet's defaults are not neutral
values — they are one specific company's brand, the one the reference build was authored for.

Measured on a live generated portal with a `#0A0A0A` canvas: **12 of 25 colour tokens unset.**

| Token | Fell back to | What it painted |
|---|---|---|
| `--primary-tint` | the reference's pale **pink** | an alert band with white text on pale pink — three lines unreadable |
| `--link` | the reference's red | a facts-table link at 3.28:1 on near-black |
| `--focus-ring` | the reference's red | this company's keyboard focus ring is another company's brand colour |
| `--primary-pressed` | the reference's dark red | pressing this company's orange button turns it the other company's red |
| `--border-strong` | a light grey | near-white hairlines and arrow strokes on a black page |
| `--on-primary` | `#FFFFFF` | every secondary button failing AA **on hover** |

So: **a themed record emits a complete palette.** Two mechanisms, and you want both:

1. **Derive what is genuinely derivable, from relationships you can verify against the
   reference** — never from invented ones. Two that hold: `on-primary` is whichever of white or
   the ink colour actually contrasts with `primary`, computed; `primary-tint` is ~10% of
   `primary` mixed into `surface`, which reproduces the reference's own hand-picked tint to
   within one unit and follows a dark record's surface into the dark. `--link`,
   `--border-strong` and `--surface-footer` are *not* derivable — a rule for them would be an
   invented relationship dressed as a recovered one.
2. **Make the schema refuse the partial record.** A record that states `canvas` and omits the
   rest should not validate. That is the only version of this that cannot regress, because the
   fallback is silent by construction: an unset token produces no error, no warning and no
   visual tell except on the one band that uses it.

## `colorScheme` belongs in the token set

`color-scheme: light` hard-coded in the stylesheet is one line and it is wrong on every dark
record. The browser-painted surfaces — scrollbars, form controls, the pre-paint canvas — stay
light on a near-black portal. It is one token away from correct and it belongs beside the rest
of the theme rather than in the CSS.
