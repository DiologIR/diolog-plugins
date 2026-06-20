---
title: Accessibility
hig: https://developer.apple.com/design/human-interface-guidelines/accessibility
role: foundation
---

# Accessibility (macOS)

**Purpose.** Accessible interfaces empower everyone, reach a larger audience, and create a more inclusive experience. Apple frames an accessible interface as **intuitive** (familiar, consistent interactions), **perceivable** (never relies on a single sense to convey information), and **adaptable** (responds to system accessibility features and personal settings). Standard system components get most of this for free; a renderer that re-implements controls has to re-earn all of it. Apple groups its guidance by capability: **Vision, Hearing, Mobility, Speech, Cognitive.**

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/accessibility

## Key principles (from Apple's text)

**Vision**
- **Support larger text sizes** — let people enlarge text by at least **200%** (140% on watchOS), via Dynamic Type or custom UI. Use the recommended default/minimum sizes; with a thin custom font, go larger than the defaults. [HIG]
- **Strive to meet colour-contrast minimums** (WCAG Level AA, the values Accessibility Inspector uses). If you can't by default, at least provide a higher-contrast scheme when **Increase Contrast** is on; check both light and dark appearances. [HIG]
- **Prefer system-defined colours** — they have accessible variants that adapt to Increase Contrast and to light/dark automatically. [HIG]
- **Convey information with more than colour alone** — add distinct shapes/icons so people who can't differentiate certain colours (e.g. red-green) can still perceive function and state changes. [HIG]
- **Describe your interface for VoiceOver** so people can use the app without seeing the screen. [HIG]

**Hearing**
- **Support text-based ways to enjoy audio/video** (captions, subtitles, audio descriptions, transcripts) and let people customise their presentation. [HIG]
- **Pair audio cues with haptics, and augment audio with visual cues** so success/error/feedback isn't conveyed by sound alone. [HIG]

**Mobility**
- **Offer sufficiently sized controls** (see the macOS floors below) and **treat spacing as important as size** — Apple suggests ~12pt padding around bezelled elements, ~24pt around the visible edges of bezel-less ones. [HIG]
- **Support simple gestures and offer alternatives to gestures** — give an onscreen button equivalent for any swipe; avoid custom multi-finger/multi-hand gestures for frequent actions. [HIG]
- **Support Voice Control, Siri/Shortcuts, and mobility assistive tech** (VoiceOver, AssistiveTouch, Full Keyboard Access, Pointer Control, Switch Control) — label elements so they work. [HIG]

**Speech**
- **Let people use the keyboard alone** to navigate and interact (Full Keyboard Access); **don't override system keyboard shortcuts**. **Support Switch Control.** [HIG]

**Cognitive**
- **Keep actions simple and intuitive;** prefer familiar system gestures/behaviours over custom ones to learn. [HIG]
- **Minimise time-boxed elements** that auto-dismiss; prefer explicit dismissal. **Let people control audio/video playback** (no autoplay without controls). [HIG]
- **Honour Dim Flashing Lights, and be cautious with fast/blinking animation** — under **Reduce Motion**, reduce automatic/repetitive animation, including zoom, scale, and peripheral motion. [HIG]

## Metrics & values

- **Colour contrast** (WCAG AA, used by Accessibility Inspector) [HIG]:

  | Text size | Text weight | Minimum contrast |
  |---|---|---|
  | up to 17 pt | all | **4.5:1** |
  | 18 pt | all | **3:1** |
  | any | bold | **3:1** |

  Apply the component/graphic floor of **3:1** to icons and meaningful graphics too.
- **macOS control size** [HIG]: **default 28×28pt**, **minimum 20×20pt**. (The 44×44pt figure is the **iOS/iPadOS** target — *not* macOS; don't copy it onto a Mac surface.) Add ~12pt padding around bezelled controls, ~24pt around bezel-less ones.
- **macOS text size** [HIG]: **default 13pt**, **minimum 10pt** for custom type styles; support enlargement to ≥200%.
- **Reduce Motion best practices** [HIG]: tighten animation springs (less bounce); track animation to the user's gesture; avoid z-axis depth changes; replace x/y/z transitions with fades; avoid animating into/out of blurs.

**System setting → CSS media-query mapping:**

| macOS setting | CSS query | Renderer response |
|---|---|---|
| Reduce Motion | `prefers-reduced-motion: reduce` | reduce/disable automatic + repetitive animation; transform/opacity only; fades over slides |
| Reduce Transparency | `prefers-reduced-transparency: reduce` | solidify glass/materials (drop `backdrop-filter`) |
| Increase Contrast | `prefers-contrast: more` | firm borders/hairlines, raise label alphas, switch to a higher-contrast scheme |
| Differentiate Without Color | — (no query) | always ship a second cue (icon/shape/text) |

## macOS platform considerations

Apple states *"No additional considerations for iOS, iPadOS, macOS, tvOS, or watchOS"* — the cross-platform guidance above applies to macOS directly. Renderer mapping for a Mac-feeling app:

- **Full Keyboard Access:** Tab/Shift-Tab move focus, Space activates; the system highlights the focused item and its colour/contrast/size is user-customisable — don't suppress the default focus ring without replacing it. The web equivalent is a strong `:focus-visible` ring on every focusable element (this app ships a global accent ring). [HIG]
- **VoiceOver:** every control needs a meaningful label (an icon-only button must carry one or VoiceOver reads "star.fill"); assign correct roles/traits and a logical reading order. [HIG]
- **Dynamic Type / system text size:** use named text styles so text scales and layouts reflow (not clip/truncate) at larger sizes. [HIG]
- **Set accessibility responses globally** at the chrome/material/motion token level so every surface inherits them rather than each component re-checking.

## Common non-native mistakes

- **Suppressing the focus ring** (`outline: none`) with no replacement — breaks Full Keyboard Access.
- **Status/selection carried by colour alone** (red/green dots, accent-only selection) with no icon, shape, or label.
- **Links distinguished only by colour**, with no underline or other indicator.
- **Glass that never solidifies** under Reduce Transparency, or **animation that keeps running** under Reduce Motion.
- **Icon-only buttons with no accessibility label** — silent or nonsense to VoiceOver.
- **Click targets under the macOS floor** (default 28×28pt, min 20×20pt) — or copying the iOS 44pt target onto Mac and assuming that's the rule.
- **Body text below 10pt or in a thin custom weight** that fails contrast at real sizes.
- **Custom controls that re-implement a native control** (a div "checkbox") without re-adding label/trait/keyboard/focus.
- **Auto-dismissing, time-boxed UI** or **autoplaying media with no controls** — penalises people who need more time.

## Accessibility (self — the cross-cutting checklist)

- Test both appearances against 4.5:1 / 3:1; verify against translucent backdrops, not just solid fallbacks.
- Tab through the whole app with no mouse; confirm a visible focus ring at every stop and a logical order; don't override system shortcuts.
- Run VoiceOver over each surface: every interactive element announces a name + role; headings are headings.
- Toggle each system setting (Reduce Motion, Reduce Transparency, Increase Contrast, Differentiate Without Color) and confirm the app visibly responds.
- Never use colour as the sole carrier of meaning, anywhere; meet the macOS control-size floors.

## Related

- [color.md](color.md) — contrast floors + colour-is-not-the-only-signal + system colours
- [typography.md](typography.md) — named text styles; macOS 13pt default / 10pt min; thin-weight caveat
- [materials-and-liquid-glass.md](materials-and-liquid-glass.md) — Reduce Transparency / Increase Contrast responses
- [motion.md](motion.md) — Reduce Motion behaviour
- [icons-and-sf-symbols.md](icons-and-sf-symbols.md) — icon-button labels + control size
- [index.md](index.md)
- [../DESIGN.md](../DESIGN.md)
