# design-md-from-website

Generate a spec-compliant `DESIGN.md` for any **live website** by **measuring** its
design, not guessing it. The browser-driven, measure-first successor to
[`design-md-from-screenshots`](../design-md-from-screenshots) and
[`design-md`](https://github.com/google-labs-code/design.md).

## What it does

Give it a URL. It:

1. **Discovers** the representative pages (home, about, product/services, contact, and
   any investor hub/portal — `investor`/`ir`/`shareholders`/`.ir.`/`investors.`).
2. **Probes them in parallel** with `playwright-cli` — one isolated named session per
   page, ≤4 concurrent, with rate-limit backoff. Per page it captures a **full-page
   screenshot** + **`getComputedStyle` measured tokens by role** (body / h1–h3 / p / a
   / button / nav / header / footer / card / input) + a **colour census** (the
   most-repeated saturated colours across the page) + the layout HTML, fonts and logo.
3. **Synthesises** a `DESIGN.md` in the **official google-labs design.md format** — YAML
   token frontmatter (`colors` / `typography` / `rounded` / `spacing` / `elevation` /
   `components` with `{token.ref}` syntax) + the 8 body sections (Overview, Colors,
   Typography, Layout, Elevation & Depth, Shapes, Components, Do's & Don'ts) + a
   self-critique — with **per-token provenance** (`confirmed` / `inferred` / `assumed`).
4. **Refines** the faithful capture into an intentional, upgraded identity — one true
   brand colour with states, a warm/cool-consistent neutral ramp, semantic states, a
   data monospace where functionally justified (a listed company's tables, a dev tool's
   code), and motion / layered-elevation / dark-theme tokens.

## Why measure, not guess

The biggest failure of screenshot-only extraction is a **fabricated brand colour or
font** — three runs produce three different reds. `getComputedStyle` + the colour
census give the exact values the site actually renders, so the palette and type are
correct by construction. Screenshots are used for hierarchy, rhythm, imagery and vibe —
never for reading a colour a measurement can give you.

## When it triggers

Whenever you want a `DESIGN.md`, design system, design tokens, style guide, brand
snapshot, or to "capture the design / vibe / visual language" of a website — even just
pasting a URL with "make me a design system for this" or "extract the tokens from
example.com". **Prefer it over `design-md-from-screenshots` whenever a live URL is
available.**

## Requirements

- `playwright-cli` on PATH (`playwright-cli --version`; else `npx --no-install
  playwright-cli`).

## Layout

```
skills/design-md-from-website/
├── SKILL.md                        # the workflow (discover → probe → synthesise → refine)
├── references/
│   ├── playwright-probe.md         # exact playwright-cli session commands + parallel/backoff
│   ├── extraction-protocol.md      # the measure-don't-guess synthesis (folds design-md-from-screenshots)
│   ├── design-md-spec.md           # the official google-labs output contract
│   └── refine-methodology.md       # the capture-then-refine upgrade rules
└── assets/
    └── probe.js                    # getComputedStyle-by-role + colour census (run via `--raw eval`)
```

## License

See [LICENSE](./LICENSE).
