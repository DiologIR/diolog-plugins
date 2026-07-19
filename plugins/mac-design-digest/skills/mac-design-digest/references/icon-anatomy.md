# macOS App Icon Anatomy & Evaluation

Reference for digesting app icons (e.g., from macapp.supply/icons). Covers canvas geometry, the era model, composition conventions, and the evaluation rubric. Written from Apple HIG app-icon guidance and observed mac indie-icon practice; where a user-supplied Apple UI kit or Icon Composer template contradicts this file, the kit wins.

## 1. Canvas and grid

- **Master canvas:** 1024×1024px, delivered as a full-bleed square; **macOS applies the rounded-rectangle (squircle) mask and the system drop shadow itself**. Since macOS 26, custom-shaped icons and hand-drawn outside-the-mask protrusions are normalised away — design inside the mask.
- **Apple icon grid:** the HIG grid template overlays concentric circles and squares on the canvas. Key uses when analysing:
  - **Optical centring** — glyphs sit on grid circles, not geometric centre.
  - **Consistent visual weight** — a wide glyph uses the inner square; a round glyph uses the larger circle, so different shapes read as the same size in the Dock.
  - **Margin discipline** — primary artwork stays inside the safe zone; art bleeding to the mask edge is a deliberate, nameable choice (common for background fields, rare for glyphs).
- **Required render sizes:** 16, 32, 128, 256, 512 (+@2x). Detail must *degrade gracefully*: an icon that reads at 1024 but smears at 16 fails Dock/Spotlight/menu-bar duty.

## 2. The era model

Classify every digested icon into an era — it anchors the rest of the analysis. Eras are visual languages, not just dates; new indie icons often deliberately quote older eras.

| Era | System window | Signature | Tell-tale evidence |
|---|---|---|---|
| **Classic skeuomorphic** | ≤ OS X Mavericks | Photoreal objects, free silhouettes, heavy textures | Non-squircle outline, literal materials (felt, leather, glass) |
| **Flat-transition** | Yosemite – Catalina | Flattened but still free-form silhouettes; circles, tilted rectangles | Mixed shapes in the Dock; simple gradients |
| **Big Sur unified** | Big Sur – Sequoia | Uniform squircle; front-facing; soft top-down lighting; baked micro-shadows; "tool at an angle" overlays | Squircle base + a diagonal tool/glyph breaking the front plane |
| **Liquid Glass** | macOS 26 (Tahoe) + | Layered glass: background + foreground layers composed in Icon Composer; specular highlights, refraction, translucency; system-generated light/dark/clear/tinted variants | Glass edge highlights, layer parallax feel, tinted-mode compatibility |

## 3. Composition conventions (what to look for)

**Silhouette & figure-ground**
- One dominant glyph or object; instantly nameable ("a paper plane", "a terminal prompt"). Multi-object icons need a single clear anchor.
- Figure-ground: glyph-to-background contrast ≥3:1 as a floor; the best icons hold silhouette clarity even in grayscale.

**Lighting model**
- Canonical light source is **top-down** (Big Sur era) or **environmental glass** (Liquid Glass). One icon = one light model; mixed lighting is a defect.
- Baked shadows are subtle and short; long dramatic shadows read as web-graphic, not mac.

**Palette**
- Typically 1–2 hue families + a gradient ramp within each. Background ramps run light-at-top → darker-at-bottom (sky logic), usually within one hue.
- Saturated accent reserved for the glyph or its focal detail — same de-emphasis logic as UI.

**Depth & materials**
- Big Sur era: 2–3 stacked planes (background field, glyph, optional tool overlay), each with its own micro-shadow.
- Liquid Glass: explicit layer stack (background, 1–4 foreground glass layers); glass properties (specular, translucency) applied per layer in Icon Composer; test mentally against dark and tinted modes.

**Personality devices** (the indie signature space)
- The diagonal tool (pen, hammer, magnifier) crossing the squircle — Apple's own tradition (TextEdit, Preview).
- Mascots/characters, framed-window motifs, glyph-on-tilted-card, macOS-native materials quoted (brushed metal as nostalgia).
- Record these as `[GOLDEN-NUGGET]` observations — they're where icon taste lives.

**Typography in icons**
- Rare and risky; letters shrink badly. Single-letter monograms work only with strong shape logic. Words are almost always a defect.

## 4. Icon evaluation rubric

Score each digested icon pass/fail with evidence. A borderline check counts as a **soft pass**: score it as a pass but flag it in prose — the flag is what matters to synthesis. When *generating* an icon, the delivery bar is **≥10/12** with no failures on checks 1–4 (mask, grid, silhouette, 16px) — those four are non-negotiable because they're what the system and the Dock will do to the icon.

1. **Mask discipline:** artwork designed for the squircle (no fighting the mask, no baked-in corner radius mismatch)?
2. **Grid adherence:** glyph centred and sized on the Apple grid (optical centre, safe-zone margins)?
3. **Silhouette test:** is the subject instantly nameable from shape alone (imagine it filled solid black)?
4. **16px squint test:** does the icon survive at menu-bar/Spotlight size — glyph still identifiable, no detail smear?
5. **Single light model:** one consistent light source/direction across all elements?
6. **Palette economy:** ≤2 hue families + ramps; accent saturation reserved for the focal element?
7. **Figure-ground contrast:** glyph vs. background ≥3:1; survives grayscale?
8. **Depth coherence:** layers/planes ordered sensibly; shadows consistent with the light model; no z-fighting elements?
9. **Era coherence:** all devices from one era's language (or a deliberate, consistent quotation of an older era)?
10. **Variant robustness (Liquid Glass era):** would the composition survive dark, clear, and tinted renders (glyph not dependent on one background colour)?
11. **Personality:** at least one nameable distinctive device beyond a generic glyph-on-gradient? (Not a failure if absent — but its absence is why an icon reads as template.)
12. **No-text check:** free of words/UI screenshots/photographic elements?

## 5. Icon digest fields

Capture per icon (template in corpus-templates.md):

- App, source, era classification, rubric scores
- **Palette:** background ramp (hex → hex), glyph colours, accent
- **Composition:** background field type (flat/ramp/scene), glyph type (abstract/object/mascot/monogram), overlay device (none/tool/badge)
- **Light model:** direction, shadow length/softness, specular presence
- **Layer stack:** enumerated planes, background → front
- **Signature devices:** the nameable moves
- **Cross-icon notes:** which digested icons it rhymes with (feeds icon style clusters)

## 6. What icon digestion feeds

- `icons/<app>.md` — the individual digest
- `ICONS.md` — synthesis: era distribution, recurring palettes, recurring devices, icon style clusters, and **canon rules for generating new mac icons** (same ≥3-independent-apps promotion bar as UI canon)
- Design mode: when asked to design an icon, load ICONS.md + the 2–3 nearest digests, choose era + light model + palette ramp *before* sketching composition, then audit against §4.
