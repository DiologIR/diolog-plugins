---
title: Materials & Liquid Glass
hig: https://developer.apple.com/design/human-interface-guidelines/materials
role: foundation
---

# Materials & Liquid Glass (macOS)

**Purpose.** A material is a visual effect that creates depth, layering, and hierarchy between foreground and background elements — by letting background colour pass through to the foreground, it helps people retain a sense of place. Apple platforms now feature **two kinds of material**: *Liquid Glass*, the dynamic material for the floating control-and-navigation layer, and *standard materials* (blur/vibrancy/blending) that convey structure *within* the content layer beneath the glass. Used correctly, glass keeps content legible while controls float over it; used wrongly (on content, over-tinted) it adds complexity and confuses hierarchy.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/materials · WWDC25 "Meet Liquid Glass".

## Key principles (from Apple's Best practices)

- **Liquid Glass is a distinct functional layer for controls and navigation** (tab bars, sidebars, toolbars) that *floats above* the content layer and lets content scroll and peek through beneath it — establishing a clear hierarchy between functional elements and content while keeping controls legible. [HIG]
- **Don't use Liquid Glass in the content layer.** It works best as a clear distinction between interactive elements and content; including it in content adds unnecessary complexity and a confusing hierarchy — use standard materials for content-layer elements like app backgrounds instead. *Exception:* a transient interactive control in the content layer (sliders, toggles) takes on a Liquid Glass appearance while a person is activating it, to emphasise interactivity. [HIG]
- **Use Liquid Glass effects sparingly.** Standard system components pick up the material automatically; if you apply it to a *custom* control, do so sparingly — overusing it across many custom controls distracts from the underlying content. Limit it to the most important functional elements. [HIG]
- **Only use the clear variant over visually rich backgrounds.** Liquid Glass has two variants, *regular* and *clear*. Their appearance can change with system settings (a preferred look for Liquid Glass, Reduce Transparency, Increase Contrast). [HIG]
  - **Regular** blurs and adjusts the luminosity of background content to maintain legibility; scroll-edge effects further blur and reduce the opacity of background content. Most system components use this. Use it when background content might create legibility issues or the component carries significant text (alerts, sidebars, popovers). [HIG]
  - **Clear** is highly translucent — ideal for prioritising visibility of rich underlying media (photos, video). Determine whether to add a **dimming layer**: if the underlying content is bright, add a dark dimming layer of ~**35% opacity**; if it's sufficiently dark (or you use AVKit's media controls, which dim themselves), no dimming layer is needed. [HIG]
- **For standard materials, choose by semantic meaning and recommended usage — not by apparent colour** (system settings can change a material's appearance/behaviour). Match the material/vibrancy style to the use case. [HIG]
- **Ensure legibility with vibrant colours on top of materials.** System-defined vibrant colours stay legible across contexts; use vibrant colours on top of any material rather than fixed greys. [HIG]
- **Consider contrast vs. context when combining material with blur/vibrancy:** thicker (more opaque) materials give better contrast for text and fine features; thinner (more translucent) materials preserve context by keeping the background visible. [HIG]

## Metrics & values

**Standard materials** — Apple's macOS page provides "several standard materials with designated purposes" (developer ref `NSVisualEffectView.Material`) and vibrant versions of all system colours; iOS/iPadOS name **four** thicknesses — ultraThin · thin · regular (default) · thick. The public page does **not** publish numeric opacity/blur values. [HIG]

**Material ramp + base fills** [macOS 27 UI Kit] — the design-kit values this app targets (most translucent → most opaque):

| Thickness | Light base `#ECECEC` @ | Dark base `#2C2C2C` @ |
|---|---|---|
| ultraThin | 0.38 | 0.40 |
| thin | 0.50 | 0.49 |
| regular | 0.63 | 0.61 |
| thick | 0.76 | 0.71 |
| ultraThick | 0.88 | 0.82 |

- **Clear-variant dimming = ~35% dark** behind clear glass over bright content (no layer needed over dark content). [HIG]
- **Glass specular edge** ~`rgba(255,255,255,.07)` dark / brighter in light; real Liquid Glass is **multi-layer fills + a dedicated shadow stack** with **±0.5px inner specular edges**, not a single blur. [macOS 27 UI Kit]
- **Capsule radius = height/2**; **child radius = parent radius − padding** (concentricity).
- Apple does **not** publish exact blur radius, saturation, the dimming layer's precise opacity beyond the ~35% guidance, or a size threshold — *measure and tune visually* (convention).

**CSS-equivalent recipe** (a renderer approximation of one Regular layer — measure against a real macOS surface, don't ship blind):

```css
.glass {
  background: rgba(236, 236, 236, 0.63);              /* regular, light */
  -webkit-backdrop-filter: blur(30px) saturate(180%); /* tune both — Apple doesn't publish */
  backdrop-filter: blur(30px) saturate(180%);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.5),         /* top specular edge */
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.06),             /* bottom inner edge */
    0 8px 24px rgba(0, 0, 0, 0.18);                    /* lift shadow */
}
[data-theme="dark"] .glass {
  background: rgba(44, 44, 44, 0.61);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.07),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.5);
}
```

## macOS platform considerations

Apple's macOS subsection is brief — beyond the cross-platform Best practices above it adds:

- **macOS provides several standard materials with designated purposes** plus vibrant versions of all system colours (`NSVisualEffectView.Material`). [HIG]
- **Choose when to allow vibrancy in custom views/controls.** System views/controls use vibrancy to make foreground content stand out against any background; test your interface in varied contexts to find where vibrancy helps. [HIG]
- **Choose a background blending mode that complements your design.** macOS defines two modes — **behind window** and **within window** (`NSVisualEffectView.BlendingMode`). [HIG]

Renderer mapping: reserve glass for chrome (`.toolbar`/`.surface-toolbar`, sidebars, menus, popovers, sheets/modals, inspectors, the floating control pill); keep content columns and scroll surfaces opaque; default to Regular and reach for Clear only over dim-able media; approximate the scroll-edge effect with a top mask/gradient where content meets a bar.

## Common non-native mistakes

- **Glass on content** — frosting cards, panels, page backgrounds, or scroll areas instead of only the floating chrome (Apple: don't use Liquid Glass in the content layer).
- **Glass on glass** — stacking translucent layers so hierarchy dissolves; use vibrant fills/labels on top of one glass layer instead.
- **Over-using glass on custom controls** — Apple says use it sparingly; reserve it for the most important functional elements.
- **Clear over bright content with no dimming layer** — Apple specifies ~35% dark dimming when the background is bright.
- **Choosing a material by its apparent colour** rather than semantic meaning — system settings change its appearance.
- **A single static blur masquerading as Liquid Glass** — missing the multi-layer fill, specular edges, and shadow stack.
- **Non-concentric nesting** — a square-cornered child inside a rounded glass card, or a child radius that ignores padding.

## Accessibility

- **Reduce Transparency** (`prefers-reduced-transparency`): solidify the material to an opaque fill and drop `backdrop-filter` blur/saturate — Apple notes glass variants change appearance under this setting. Keep the same hierarchy with solid chrome (this app already does).
- **Increase Contrast** (`prefers-contrast: more`): firm the borders/hairlines so glass edges stay distinct.
- **Reduce Motion** (`prefers-reduced-motion`): kill the morph / fluid / specular animation.
- Verify label contrast (4.5:1 text / 3:1 controls) against the *translucent* backdrop, not just the solid fallback — translucency is where contrast quietly fails. Apple: use vibrant colours on materials so contrast holds across contexts.

## Related

- [color.md](color.md) — vibrant label/fill variants for colour *on* glass
- [dark-mode.md](dark-mode.md) — per-appearance authoring of the material fills
- [motion.md](motion.md) — the morph/specular animation and Reduce Motion
- [popovers-and-panels.md](popovers-and-panels.md) · [sidebars.md](sidebars.md) · [menus-and-context-menus.md](menus-and-context-menus.md) · [sheets-and-alerts.md](sheets-and-alerts.md) — surfaces that carry glass
- [accessibility.md](accessibility.md)
- [index.md](index.md)
- Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
