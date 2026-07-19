# mac-design-digest

Build AI design taste the way a human expert does: one closely-studied macOS app at a time.

Feed it screenshots and app icons (curated from [macapp.supply](https://macapp.supply)) and it incrementally digests them into a persistent `design-corpus/`:

- **`apps/<app>.md`** — per-app token profiles (spacing, type, colour, chrome) with measurement-honest provenance marks
- **`patterns/*.md`** — cross-app pattern entries (sidebars, toolbars, settings, empty states…)
- **`icons/<app>.md` + `ICONS.md`** — icon anatomy digests (era, palette ramps, light model, layer stack, signature devices)
- **`kit/*.md`** — ground-truth `(specified)` tokens ingested from official Apple UI kits (Figma/Sketch exports)
- **`TASTE.md`** — the master synthesis: canon rules (promoted only at ≥3 independent apps), aesthetic style clusters, contested findings, and honest knowledge gaps

Analysis is run by the **Mac Design Archivist** persona against a deep-research knowledge base: a 14-point screenshot evaluation rubric, a named anti-pattern taxonomy (Magic Number Spacing, Focal Collision, Target Starvation…), and quantitative thresholds from WCAG 2.2, Apple HIG, Material 3, Fluent 2, Carbon, and Polaris.

**Design mode:** once a corpus exists, ask for a new mock or icon "using the corpus" — the skill inherits cluster identity tokens, builds from pattern skeletons, audits its own output against the rubric, and runs a lookalike check so you get inspiration, never a clone.

The skill never fetches screenshots itself — you curate the inputs.

## Install

```
/plugin install mac-design-digest@diolog-plugins
```

## Typical session

```
> Digest these: things-main.png, things-settings.png, things-icon.png
…
> [later, corpus at Competent+] Design the main window for my backup utility in the warm-indie cluster
```
