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

So derive, rather than inherit — and note that **both branches are real**. Writing the light
branch as `undefined` is how the same defect survived on light brands for a whole review cycle:

```js
const isDark = luminance(canvas) < 0.5;
surface:       stated ?? (isDark ? shift(canvas, +10) : '#FFFFFF')
surfaceSunken: stated ?? shift(canvas, isDark ? +18 : -8)   // NOT `: undefined`
border:        stated ?? shift(canvas, isDark ? +28 : -20)
ink:           stated ?? (isDark ? '#F5F5F5' : '#1C1B1B')
inkBody:       stated ?? shift(ink, isDark ? -30 : +30)
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
   reference** — never from invented ones. *Measure before declaring a relationship
   uninventable.* An earlier version of this file said `--link`, `--border-strong` and
   `--surface-footer` were not derivable and a rule for them "would be an invented
   relationship dressed as a recovered one". They were then measured against the reference
   stylesheet and every one of them is **recovered**, to within a unit or two per channel:

   ```
   --border-strong        #E2DFDD → #C4C0BE     −30 / −31 / −31   (border, stepped)
   --surface-dark-raised  #2E2B2B → #3C3939     +14 / +14 / +14
   --surface-footer       #2E2B2B → #181717     −21 / −20 / −20
   --on-dark-muted        #FDFCFC → #B7B2B1     −72 per channel, floored at AA
   --surface-sunken       #F7F6F5 → #EFEDEC      −8 /  −9 /  −9   (canvas, stepped away)
   --ink-body             #1C1B1B → #3A3A3A     +30 / +31 / +31
   --focus-ring           = --primary                identity
   --on-dark              = --surface                identity
   ```

   `--link`, `--primary-hover` and `--primary-pressed` are not fixed offsets: they are the
   accent adjusted **until it is readable**, which is the relationship those numbers encode,
   so compute that. The test for "recovered, not invented" is mechanical — strip the token
   from the reference theme and check the derivation puts the reference's own value back.
   If it does not, you invented it. Assert that reproduction; do not write the offsets into a
   comment and trust them.

   **Do not gate the derivation on `isDark`.** Every derivation in the first version was
   written `isDark ? … : undefined`, because the review that prompted them measured a
   near-black tenant and a light brand feels close enough to a light reference to be safe. It
   is not. Measured on a brand with a `#F6F3EC` warm-cream canvas: `--surface-sunken` and
   `--ink-body` unset, so its sunken bands painted the reference's grey `#EFEDEC` under a
   cream page and its body copy was the reference's ink. **A theme is not the reference's
   because it is also light.**

   And **derive at the root of the chain, not off another optional token.** A derivation
   keyed on a token that is itself optional repairs nothing when both are absent:
   `--border-strong` computed from `border`, `--surface-footer` from `surfaceDark`, and
   `--on-dark` from either — so a record stating only `canvas` and `primary` still left
   thirteen tokens on the reference's values.

2. **Derive in the RENDERER, not only in the generator.** This is the mechanism that repairs
   what is already in the database. A generator fix corrects the next record; the partial
   records already stored keep painting another company until somebody reseeds them, and
   nobody schedules that. One live tenant went from 13 emitted colour tokens to 25 by a
   change in the renderer's variable mapping and nothing the generator did.

   **The schema-refusal version comes last, not first.** An earlier version of this file
   called "make the schema refuse a partial record" the only version that cannot regress. It
   is the version that takes production down: the renderer re-validates every record on the
   way *out* of the database, every stored themed record is partial (that is the finding),
   and tightening the schema 404s all of them the moment it deploys — before any reseed. On a
   platform where the contract file is vendored into the renderer and hash-gated by the build,
   it is also a two-repo change that fails the build on one side until the other lands. The
   order is: derive in the renderer → reseed every stored record → *then* make the schema
   refuse a partial palette, in both repos, in one change.

## A state pair is derived in ONE direction

`hover` and `pressed` are a sequence, not two independent colours. The reference walks
`#D72229 → #B91D23 → #9E1318` — the accent darkened, then darkened again — and on a dark
canvas the same gesture has to go the other way or "pressed" reads as "disabled".

Deriving each of them from the canvas independently produced a real defect: a brand's own
*stated* `#D14A1E` hover (darker) beside a *derived* `#FF7E4E` pressed (lighter), so the
button got darker on hover and lighter on press. **A brand that states one of the pair
decides the direction of the other.** Read the direction off whichever the record gives you;
fall back to the canvas only when it gives you neither.

## `colorScheme` is DERIVED from the canvas, not added as a twenty-sixth token

`color-scheme: light` hard-coded in the stylesheet is one line and it is wrong on every dark
record. The browser-painted surfaces — scrollbars, form controls, the pre-paint canvas — stay
light on a near-black portal.

It is tempting to add it to the contract. Don't: it is not a colour the record chooses, it is a
*consequence* of the canvas the record already states, and a twenty-sixth token is a token
nobody remembers to set. Compute it from the canvas's relative luminance in the same place the
rest of the palette is derived.

> **And then check that something reads it, the same way you would a colour.** The first
> version emitted `color-scheme: var(--scheme)` *inside* the `:root` block — where a
> token-consumed gate that reads consumption from the rules **after** `:root` cannot see it,
> and reported `--scheme is declared but nothing, directly or indirectly, reads it`. It has to
> be a rule (`html{color-scheme:var(--scheme)}`). A token read only by the block that declares
> it is the unread-token defect wearing a disguise.
