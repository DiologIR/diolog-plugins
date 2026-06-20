---
title: Icons & SF Symbols
hig: https://developer.apple.com/design/human-interface-guidelines/sf-symbols
role: foundation
---

# Icons & SF Symbols (macOS)

**Purpose.** SF Symbols provides thousands of configurable symbols that integrate with the San Francisco system font, automatically aligning with text in all weights and sizes — use one wherever interface icons appear (toolbars, tab bars, context menus, inline in text). *Interface icons* (glyphs) you draw yourself express a single concept in streamlined shapes; *app icons* are layered, Liquid-Glass designs authored in Icon Composer. An Electron renderer can't draw true SF Symbols, but it *can* match the rules (weight matching, variant-as-state, `currentColor`) so the set reads as native rather than a random Material/Feather pack.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/sf-symbols · https://developer.apple.com/design/human-interface-guidelines/app-icons · https://developer.apple.com/design/human-interface-guidelines/icons · SF Symbols 7.

## Key principles (from Apple's text)

**SF Symbols**
- **Four rendering modes** organise a symbol's layers and apply colour differently: *Monochrome* (one colour to all layers), *Hierarchical* (one colour, varied opacity per layer for depth), *Palette* (two+ colours, one per layer), *Multicolor* (intrinsic meaningful colours — e.g. `leaf` green, `trash.slash` red). Use system-provided colours so symbols adapt to accessibility and appearance modes; **confirm the rendering mode works in every context** (size/contrast can hurt legibility). [HIG]
- **Nine weights (ultralight → black) mirror the SF font weights** for precise weight matching between symbols and adjacent text. **Use scale (small / medium-default / large), not weight, to adjust emphasis** — scale changes presence without disrupting weight matching at a given point size. Scales are defined relative to the SF cap height. [HIG]
- **Design variants carry state:** `slash` = item/action unavailable; `fill` = selection/emphasis (good for tab bars, swipe actions, accent-coloured selection); enclosed (`circle`/`square`/`rectangle`) improves legibility at small sizes; outline (the most common variant) suits toolbars/lists alongside text. In many cases the displaying view picks outline vs fill for you (a toolbar takes outline; an iOS tab bar prefers fill). [HIG]
- **Gradients (SF Symbols 7+)** generate a smooth linear gradient from a single source colour, in all rendering modes, best at larger sizes. **Variable color** communicates a changing quantity (capacity/strength/progress) by colouring layers as a value crosses thresholds — *use it to communicate change, not depth* (use Hierarchical for depth). [HIG]
- **Apply animations judiciously and with clear purpose** — too many overwhelm; each animation (Appear/Disappear, Bounce, Scale, Pulse, Variable color, Replace, Magic Replace, Wiggle, Breathe, Rotate, **Draw On/Off** in SF Symbols 7+) communicates a specific action. Consider tone/brand. [HIG]
- **Custom symbols:** start from an exported template and match the system's level of detail, optical weight, alignment, position, and perspective; aim for *simple, recognizable, inclusive, directly related* to its meaning. Provide alternative text labels. Don't replicate Apple products; some symbols are copyrighted/non-customizable. [HIG]

**Interface icons (glyphs)**
- **Create a recognizable, highly simplified design** with familiar metaphors directly related to the action/content. [HIG]
- **Maintain visual consistency** across all interface icons — same size, level of detail, stroke weight, and perspective (adjust an icon's dimensions if its visual weight differs). [HIG]
- **In general, match icon weight to adjacent text weight** unless you want to emphasise one or the other. [HIG]
- **Add padding for optical alignment** — geometrically-centred asymmetric icons can look off-centre; nudge then bake the offset into padding so geometric centring works. [HIG]
- **Provide a selected-state version only if necessary** — standard components (toolbars, tab bars, buttons) update the selected appearance automatically (a selected toolbar icon receives the app's accent colour). [HIG]
- **Use a vector format (PDF/SVG)** for custom interface icons so the system scales them; provide alternative text labels. Use inclusive, gender-neutral imagery; localize/flip icons that contain characters or imply reading direction. [HIG]

**App icons**
- **Author layered, full-bleed, square layers; the system applies the effects.** iOS/iPadOS/macOS/watchOS icons coalesce a background layer + foreground layer(s) and take on **Liquid Glass attributes — specular highlights, refraction, translucency** — that adapt with size and can differ between system versions. Import layers into **Icon Composer** to set the background, place foregrounds, apply effects, and annotate **Default / Dark / Mono** variants. [HIG]
- **Embrace simplicity** (a single core idea, minimal shapes, simple background); **prefer vector graphics**, clearly-defined (not feathered) edges, and varied foreground opacity for depth. **Include text only when essential**; prefer illustrations to photos; don't replicate UI components or Apple hardware. [HIG]
- **Let the system handle blurring and effects** — don't bake in specular highlights, drop shadows, bevels, blurs, or glows; they conflict with the system's dynamic effects. **Provide square, unmasked layers** (the system rounds the corners). [HIG]
- **Keep core features consistent across appearances** (default/dark/clear/tinted); base the dark icon on the light one with complementary colours. [HIG]

## Metrics & values

- **9 weights** — Ultralight, Thin, Light, Regular, Medium, Semibold, Bold, Heavy, Black (mirror SF font weights). [HIG]
- **3 scales** — small, medium (default), large, defined relative to the SF **cap height** (not fixed px). [HIG]
- **4 rendering modes** — monochrome, hierarchical, palette, multicolor; not every symbol supports every mode. [HIG]
- A custom-symbol template carries **27 variations** (9 weights × 3 scales). [HIG]
- **App-icon layout canvas = 1024×1024 px** (square; rounded-rectangle after system masking) for iOS/iPadOS/macOS; watchOS layout is 1088×1088 px (circular mask). macOS appearances: default, dark, clear light, clear dark, tinted light, tinted dark. Colour spaces: sRGB, Gray Gamma 2.2, Display P3. [HIG]
- **SF Symbols 7:** single-source **gradient** rendering, **Draw On/Off** animations, **Magic Replace** (preserves shared enclosures/badges), **Variable color** progress. [HIG]
- **macOS control / hit-target floors** (Accessibility): default **28×28pt**, minimum **20×20pt** — keep icon-button targets within these (these are macOS values; 44×44pt is the iOS/iPadOS target). [HIG]
- **Icon contrast:** meet the contrast floors — ≥**3:1** for icons/graphics, the same as UI components. [HIG]

## macOS platform considerations

- **SF Symbols & app icons:** Apple states *"No additional considerations for macOS"* — the cross-platform Best practices above apply directly. [HIG]
- **Interface icons — Document icons (macOS-specific):** a custom document type can have a document icon, traditionally a sheet of paper with the **top-right corner folded down** so people distinguish documents from apps even at tiny sizes. If you don't supply one, macOS composites your app icon + the file extension onto the canvas. Supply any combination of **background fill, center image, and text**; the system layers, positions, and masks them onto the folded-corner shape. [HIG]
  - Design simple images recognizable down to **16×16 px**; reduce complexity at small sizes (fewer/thicker lines, drop fine detail). Avoid important content in the top-right corner (the white folded corner sits there). [HIG]
  - The **center image is half the canvas** (e.g. 16×16 px image for a 32×32 px icon); keep ~**80%** of it inside a ~10% margin. The system shows the file extension at the bottom (uppercased) — supply a short descriptive term if the extension is unfamiliar. [HIG]

### Electron / renderer note (matching, not reproducing)

You can't render true SF Symbols outside AppKit. To *match* the look:
- **Align icon stroke weight to the adjacent text weight**; step *size/scale* (not stroke) for emphasis.
- **Ship outline + fill (+ slash) variants** of each glyph and switch variant for state — don't fake state by recolouring.
- **Draw with `currentColor`** so icons inherit the label/accent token and adapt to light/dark/contrast.
- Pick one icon family with SF-like geometry and stick to it; don't mix icon packs.
- Lean on Apple's **standard action symbols** for parity: Add `plus`, More `ellipsis`, Delete `trash`, Search `magnifyingglass`, Filter `line.3.horizontal.decrease`, Share `square.and.arrow.up`, Done `checkmark`, Cancel/Close `xmark`, Undo `arrow.uturn.backward`, Redo `arrow.uturn.forward`, Compose `square.and.pencil`, Rename `pencil`, Account `person.crop.circle`. [HIG]

## Common non-native mistakes

- **Bolding a symbol's weight to emphasise it** instead of increasing scale — breaks alignment with text.
- **Recolouring one glyph to show state** instead of outline/fill/`slash` variants.
- **Icon weight that doesn't track the text beside it**, or **mixing icon families** so strokes/terminals disagree.
- **Hardcoded icon colours** that ignore light/dark and the accent token (use `currentColor`).
- **Baking gloss / shadow / rounded corners / specular into an app icon** — the system applies these; pre-masked or feathered layers look jagged.
- **Reusing the iOS app icon verbatim** instead of an adapted, layered, appearance-aware design.
- **Variable color used for depth** (use Hierarchical) or **too many symbol animations** at once.
- **Icon-button targets under the macOS floor** (≥20×20pt min, 28×28pt default).

## Accessibility

- **Every icon-only button needs a real accessibility label** — give the verb ("Add member"), not the symbol name (VoiceOver would read "star.fill"). Apple: provide alternative text labels for custom symbols and interface icons. [HIG]
- **State must not be colour-only** — the outline/fill/slash variant *is* the non-colour cue; keep it even when colour also changes (supports colour-blind users; Apple: convey information with more than colour alone).
- Honour **Increase Contrast** (firm icon-vs-background contrast to ≥3:1) and **Reduce Motion** (disable Draw / Magic-Replace / other symbol animations).
- Keep icon-button hit targets within the macOS control floors (≥20×20pt, default 28×28pt) and ensure spacing between adjacent controls.

## Related

- [typography.md](typography.md) — the SF weights/cap-height icons are matched against
- [color.md](color.md) — rendering-mode tints + `currentColor` token binding
- [materials-and-liquid-glass.md](materials-and-liquid-glass.md) — app-icon Liquid Glass + toolbar chrome
- [branding.md](branding.md) — app-icon identity
- [accessibility.md](accessibility.md) — icon-button labels + contrast + control size
- [index.md](index.md)
- [../DESIGN.md](../DESIGN.md)
