# Designing a surface that will be driven by data

A page whose content, theme and motion come from a database is not a page with variables in it.
It is a **vocabulary plus a renderer**, and the design decisions move accordingly: you are
choosing what can be expressed, not what one instance looks like.

This is now the normal shape for anything served to many tenants — one deployment, N brands. The
failure modes are specific and none of them are visible in a single instance.

## Design the vocabulary, then design one instance to prove it

Work in this order. The reverse order produces a system that can express exactly one page.

1. **Enumerate the section kinds.** Take them from a real surface you have already designed, not
   from imagination. Every kind is a named component with its own props.
2. **Enumerate the token set.** Colours, type, radii, elevation, motion, container measures. This
   is the entire vocabulary a brand gets — anything not in it cannot vary between tenants.
3. **Enumerate the motion presets.** Named, not authored. `reveal`, `parallax`, `countUp`,
   `lineDraw`, `railDrift`, a WebGL preset by name. A tenant selects; it does not supply code.
4. *Then* author one instance at full fidelity and prove the vocabulary carries it.

If step 4 needs something steps 1–3 do not have, the vocabulary is wrong — extend it deliberately
rather than special-casing the instance.

## The tokens most systems forget, and what they cost

**An on-dark accent.** A brand colour chosen against white will usually fail AA on a dark band.
Measured on a real build: `#D72229` on `#2E2B2B` is **2.77:1** against a 4.5 floor, and it landed
on the hero headline, both hero CTAs, the running ticker and the footer's only signup button —
35 failing nodes on one page, the most-repeated failure on the site. A multi-tenant theme must
carry `primaryOnDark` as its own token, because you cannot compute it per tenant at render time
and you cannot ask each brand to have thought of it.

**Muted-on-dark alphas.** `rgba(255,255,255,.34)` reads as "subtle" and measures 2.98:1. `.55`
to `.62` is the honest range. Alpha is not a taste decision on a dark surface.

**A focus-ring colour that is not the accent.** The accent-coloured ring inherits the accent's
contrast problem exactly where a keyboard user needs it most.

## What must NOT be a token

**Anything a tenant could set that breaks the layout.** Container width, base font size and
spacing scale look like natural tokens and are the ones that turn a coherent grid into a
per-tenant regression surface. Ship them fixed until a real tenant needs otherwise.

**Free-text CSS.** A `styleOverrides` blob is how a design system dies: it is unreviewable,
untestable and it is where every tenant-specific hack accumulates.

## Sections switch off; they do not empty

A tenant with no video does not get an empty video band — the section is absent. This has a
design consequence people miss: **every section must look right as the first thing after the
hero and as the last thing before the footer**, because with sections toggling you cannot know
its neighbours. Band alternation, first-child spacing and divider logic all have to be derived
from position at render time rather than baked per section.

Corollary: design the *empty* tier too. A tenant you hold nothing for still gets a page. It
should place **fewer** sections rather than the same sections with nothing in them — an empty
share-price block reads as broken where its absence reads as honest.

## The renderer must fail loudly

Map section kind → component, and **throw on an unknown kind**. A silently dropped section is
indistinguishable from one the tenant disabled, and no diff can tell you which happened. This is
a design constraint, not an engineering one: it is what makes the vocabulary enforceable.

## Prove it with two instances, not one

A vocabulary validated against a single brand is a vocabulary shaped like that brand. Build the
second one — ideally one with a different accent, a different type family and a different motion
preset — before believing the system generalises. Most of what is actually hard-coded only
becomes visible on the second tenant.
