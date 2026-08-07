# ICONS.md — icon corpus synthesis (v2)

> Load when designing a mac app icon. Corpus: **666 icons** — 134 macapp.supply digests (scored on the 12-point rubric) + **500 most recent macosicongallery.com icons** (2022-02 → 2026-07, A/B/C-graded vision analysis) + **32 ground-truth macOS 26 "Tahoe" captures** (Apple system set + current-idiom third parties). Regenerated 2026-08-07 (v1 frozen 2026-07-19 covered the 134 alone). Corpus level: **Fluent** (icons only). Raw evidence: `../../icon-corpus/` (`analysis/SYNTHESIS.md` aggregate, `analysis/apple-2026.md` answer key, `analysis/batch-01…10.md` per-icon).
>
> **Methodology caveat, load-bearing:** the two sweeps used different instruments — the 134 carry per-icon 12-point rubric scores; the 500 carry structured observations + A/B/C craft grades; the 32 are qualitative ground truth. Counts below merge era taxonomies (`custom`+`custom-web`, `flat-transition`+`flat-brand`) and are directional, not survey-grade. Most sources are 100–540px web renders; fine specular/gradient detail is (estimated) unless a master was seen. Rules promoted to canon required no contradicting member in *any* sweep.

## Era distribution (n=666) — and what it teaches

| era | n | share | reading |
|---|---|---|---|
| big-sur | 293 | 44% | front-facing object/glyph on a gradient squircle, top-down baked light — still the shipping default |
| liquid-glass | 141 | 21% | the current (macOS 26 "Tahoe") gel-glass idiom — dominated by Apple's own Nov-2025 wave + the 32 captures |
| skeuomorphic | 102 | 15% | photoreal object quotes (keycaps, dials, hardware) in a modern squircle; a persistent, Apple-sanctioned pro/utility wing |
| flat-brand | 59 | 9% | flat marks/brand tiles, neither Big Sur depth nor glass |
| custom-web | 71 | 11% | off-platform / web-first / game-IP tiles committing to no mac era |

**The lag is the story — now time-resolved.** In the dated 500-icon gallery: liquid-glass ≈ **0% of everything shipped 2022–2024** (0/200), **13/100** through mid-2025, **64/100** in the Nov-2025 Tahoe release wave (overwhelmingly Apple's own set), then back to **~16/100** across 2026 indies. Apple has fully moved; third parties have not. A generated icon wearing authentic Tahoe grammar — with real layer discipline — still beats the large majority of the 2026 shipping field. The corpus teaches the *legacy* vocabulary richly and the *target* vocabulary is now fully specified: see the **Tahoe gel-glass grammar** in `icon-directions.md` (nine tells: cushion tile, two ground registers, poured/frosted glyphs, white-as-material with ground-hue bleed, authored overlap blends, one soft light + emissive interiors, softened matte miniatures, diegetic micro-text garnish, iconic-silhouette flat abstraction).

Gallery craft grades: 99 A · 339 B · 62 C (n=500). Rubric health of the scored 134: min 4 / median 11 / mean 10.32 / max 12.

## Recurring palette families (hex ramps + members)

Blue remains the overwhelming category-default ground across all sweeps (the gallery batches each independently report blue as the #1 ground family, `#1E7BE8–#4AA8F8` band), then indigo/violet, then warm amber/orange; white/charcoal/grey dominate neutral grounds.

- **Electric blue** `#37D0FE → #0088FF → #0054EB` (kit Blue `#0088FF`). Members: 1password, cleanshot-x, canary-mail, picmal, supaste, textsniper; gallery: helm, proxyman, TestFlight, Mail/App Store/Keynote (Tahoe). The category-default utility hue — needs positive justification (`icon-directions.md` calibration flag).
- **Indigo / violet** `#6D7CFF → #6155F5 → #3A2E8C` (kit Indigo `#6155F5`). Members: tuple, obsidian, screen-studio, presentify; AI-agent sub-ramp (violet→blue glass): codex, cursor, inkline, maestri; Tahoe: Shortcuts' deep violet.
- **Porcelain / near-white ground** `#FAFAFB · #F1F1F1 · #FBF3E7`. Members: notion, codex, waterlemon, mymind, klack; Tahoe register (a): Safari, Photos, News, Slack, Reminders, Find My, Home, ChatGPT; indie: iA Writer, CleanMyMac, copilot, pasta, parcel, mindnode. **The signature Liquid-Glass canvas** — 14/50 of the Nov-2025 batch sit on one.
- **Charcoal / near-black ground** `#2D2D30 → #0F1012`. Members: cursor, unfold, sero, atlas; Tahoe pro register: Passwords, Icon Composer, Console, Activity Monitor; gallery: prompt-3, codepoint, instruments, flighty. The dark-premium / emissive stage.
- **Monochrome metal** `#E8EAEE → #A6B1C2 → #565B65`. Members: looq-preview, framer, sessionwatcher, coreviz-studio; gallery: Logic's platter, System Information's machined metal, Disk Utility/Font Book neutrals. Reads pro / menu-bar-native.
- **Warm accent** (orange/red/yellow, usually one bounded jewel). Members: folder-hub, hora-calendar, fantastical; gallery: Octavo's red book, parcel's all-warm clay, The Unarchiver's cream; Tahoe: Home/Notes/Tips amber, Music/News coral.
- **Acid green / lime** (rare, high-commitment brand). Members: ayron-time-tracker (`#C6F04C`), leafy-vocabulary, slapmac, super-shortcuts.

**Tahoe palette law (from the system set):** one hue family per icon, differentiated by luminance/opacity — strictly tone-on-tone. Multi-hue only for colour-domain semantics (ColorSync, Photos, Maps), and then quarantined inside one shape.

## Recurring devices (with members)

Frequency across sweeps: glass/refraction · subject-mined literal object · concentric/radial · device/hardware portrait · monogram/letterform · diagonal-tool overlay · mascot/face · emissive glow focal · double-read pun · negative-space cut — all reconfirmed at 4× sample. Gallery adds heavy clusters of: pens/writing tools, folders/documents/cards, magnifiers/loupes, checkmarks, gauges/dials, blueprint-grid dev costumes.

- **Diagonal tool-at-an-angle**: cleanmymac, uninstally, deskminder, sweeper; gallery: hex fiend's crowbar (the one A-grade take — the tool metaphor made exact), Xcode 26's lone hammer. Still the most template-worn move; use once per session at most.
- **Concentric / radial**: 1password, radial, code-meter, screen-studio; Tahoe: Find My, Time Machine, Home's nested outlines.
- **Notch / screen / device portrait**: alcove, dynamiclake, folder-hub, codeshot; gallery: bezel, framous, the two-phones parallax capture.
- **Double-read / name-as-image pun**: 1password, finbar, caesura, waterlemon, maestri; gallery additions: pasta ("P" of pasta), PixelGriddle (pixel-grid waffle), Couverture (name told in chocolate viscosity), betterzip (archive as bound bundle).
- **Negative-space cut**: hoolo, mole, compresto, notion; gallery: tasks-to-do (rainbow through a checkmark aperture).
- **Emissive glow focal (self-lit)**: dropzone, sero, onlook, usage; Tahoe-sanctioned as *emissive interior under glass*: Siri orb, Tips bulb, Home's glow, Activity Monitor's trace; gallery: instruments, elytra's amber core.
- **New, corpus-v2 devices** (full list in `icon-directions.md` device bank #16–26): the icon **performs the verb** (CleanShot X's page-curl, PDF Squeezer, unfolder); **tile-as-machine** with a diegetic aperture; **edge-bleed physicality** (Contacts' tabs); **re-materialised brand mark** (News, Slack, iWork); **data-as-glyph** (Calendar's dot-matrix); **overlap-as-identity** (Shortcuts, Photos, Game Center); **fold/self-shadow ribbon** (Infuse); **UI-primitive-as-mark** (iA Writer's caret); **x-ray technical drawing** (flighty); **material pun**.

## Icon canon (no contradicting member in any sweep)

| Rule | Evidence | Members (sample) |
|---|---|---|
| **Subject-mine, don't stock-glyph.** The strongest marks draw the app's literal noun/verb, not a generic category symbol. | reconfirmed: every gallery A-grade is subject-mined; every "template genericism" failure is not | cleanshot-x, unfold, klack, mole, 1password; v2: PDF Squeezer, unfolder, hex fiend, pasta, Plugin Station |
| **Palette economy: ≤2 hue families, accent bounded or absent.** | 66/134 no-accent; Apple's 26 set is strictly tone-on-tone; gallery A-grades run mono-plus-one | cursor, unfold, compresto; v2: Octavo, parcel, flighty, App Store |
| **Identity must survive a two-value silhouette.** | #3 failed by 26/134; gallery batches name tone-on-tone silhouette collapse as a top failure | passes: klack, unfold, mural / fails: cleanshot-x, alcove, search-everything |
| **Top-down soft light wherever light is modeled** (~72% of light-modeling icons), with the Dark-Field Emissive cluster as the scoped inversion. | reconfirmed; Tahoe hardens it: *one* soft top light, zero hard speculars — gloss sweeps/lens flares are now era-markers for "old" | 1password, keeby, klack; Tahoe: entire system set |
| **Name-as-image double-reads reward the squint.** | 21+ in the 134, reconfirmed by gallery A-grades | 1password, finbar, waterlemon; v2: pasta, PixelGriddle, Couverture |
| **NEW — Authored translucency is the current era's price of entry.** White glyphs are frosted (ground hue bleeds through); overlaps visibly blend. White-on-hue with no translucency cues reads as a flat Big Sur re-tread. | 32/32 Tahoe captures + the Nov-2025 gallery wave, none contradicting | Mail, App Store, Weather, Finder, Contacts, Shortcuts, Photos; indie: darkroom, mindnode, multi, mercury-weather |
| **NEW — Re-materialise, don't redraw, an existing mark.** Era migration keeps the silhouette and swaps the material. | the entire system refresh + Office set, none contradicting | News N, Slack pinwheel, iWork set, Safari dial |

*Contested (both readings held):* **squircle vs. free object** — the photoreal-object family still ships transparent free silhouettes (klack, keeby, waterlemon). Tracks the skeuomorphic-quote cluster boundary; neither is wrong.

## The #10 epidemic — variant robustness (unchanged, and now with the antidote)

**102/134 scored icons (76%) hard-fail check #10** (survives Default/Dark/Clear/Tinted); zero cleanly pass. The gallery sweep reconfirms the cause everywhere: flat pre-masked rasters whose identity is a colour relationship. **What's new in v2 is the demonstrated pass:** all 32 Tahoe captures decompose naturally into Icon Composer layers (ground slab / gel glyph / highlight+bloom) — authored translucency *forces* the layer discipline #10 demands. Design implication unchanged and strengthened: author 2–4 real layers, carry identity in shape + value, colour last.

## Style clusters

The eight v1 clusters (Big-Sur Object Tile ~55 · Liquid-Glass Frosted ~35 · Flat Monochrome Logomark ~20 · Dark-Field Emissive ~18 · Mascot ~21 · Device-Portrait ~17 · Diagonal-Tool ~18 · Data-Viz Emblem ~8) all reappear at the larger sample with the same do/don'ts — the buildable recipes live in `icon-directions.md` (8 directions). Two updates:
- **Cluster 2 is no longer thinly specified.** The Tahoe gel-glass grammar + Direction 2's three sub-registers (porcelain + gel object / saturated tile + white frost / dark glass) replace the v1 guesswork; exemplar roster in `../../icon-corpus/analysis/SYNTHESIS.md`.
- **A ninth recurring shape, full-bleed scene/artifact:** the tile IS the content (Maps' map, Calendar's dot-matrix, Notes, Clock, Claquette) — legal when the artifact silhouette is iconic; still needs the cushion-tile treatment.

## Failure modes (the anti-checklist, n=500 evidence)

1. Template genericism (gradient + stock glyph/checkmark/magnifier, nothing ownable) · 2. white-on-hue with no translucency cues · 3. tone-on-tone silhouette collapse · 4. baked text/wordmarks/screenshots (only sub-legible diegetic engraving is sanctioned) · 5. metaphor pile-ups (3+ ideas per tile) · 6. legacy-era drag (gloss sweeps, lens flares, metal bevels, page curls) · 7. photo texture / game key-art with no macOS grammar · 8. Apple-template mimicry & sibling-SKU sameness · 9. unearned rainbow · 10. flat pre-masked raster delivery.

## Design-mode checklist (icons)

1. **Pick era deliberately.** Current-era = the Tahoe grammar applied for real (you'll beat most of the 2026 field); an older idiom only as a knowing quote.
2. **Choose the direction by function** (picker table in `icon-directions.md`), then **subject-mine** the glyph (device bank, now 26 strategies).
3. **Silhouette first:** solid-black fill test + mental 16px squint before any styling.
4. **Palette economy:** ≤2 hue families; Tahoe law is one family, tone-on-tone, accent bounded or absent.
5. **Author real layers for #10** — bg / mid / fg (/ highlight); authored translucency gets you this for free.
6. **Generate as a variation set, never a single take** — three engines (hand-authored layered SVG master + media-gen-pro Arrow SVG + GPT-Image raster with corpus referenceImages), contact sheet at 1024/128/32/16; pipeline in `icon-directions.md`.
7. **Audit against the 12-point rubric + the failure anti-checklist; report scores and #10 liabilities honestly.**
