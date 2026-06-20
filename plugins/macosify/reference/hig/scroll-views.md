---
title: Scroll Views
hig: https://developer.apple.com/design/human-interface-guidelines/scroll-views
role: presentation
---

# Scroll Views (macOS)

**Purpose.** A scroll view lets people view content larger than the view's boundaries by moving it vertically or horizontally. The scroll view itself has no appearance, but it can show a **translucent scroll indicator** that typically appears after people begin scrolling and signals whether the visible content is near the beginning, middle, or end. In macOS 26 the seam where scrolling content meets glass chrome is handled by the **scroll-edge effect**. Web defaults (always-on chunky scrollbars, opaque toolbars) are an instant "this isn't native" tell.

**Apple HIG:** [Scroll views](https://developer.apple.com/design/human-interface-guidelines/scroll-views)

## When to use

- Any region whose content can exceed its frame — lists, documents, canvases, sidebars.
- Use a **single** scroll view per scrollable axis in a region. A horizontal scroll view *inside* a vertical one (or vice versa) is fine; nesting **same-orientation** scroll views is not. [HIG]

## Anatomy

- **Content view** (the scrollable payload) + a **translucent scroll indicator** (the macOS scroll bar) that fades in over the content rather than reserving a gutter.
- In macOS 26, the **scroll-edge effect** — a visual separation between floating interface elements (e.g. toolbars) and the scrolling content behind them.

## Behavior & states

- **Support default scrolling gestures and keyboard shortcuts** [HIG] — people expect the systemwide behaviour everywhere. If you build custom scrolling, **make scroll indicators use the elastic (rubber-band) behaviour** people expect. [HIG]
- **Make it apparent when content is scrollable** [HIG] — because indicators aren't always visible, **display partial content at the edge** to show there's more in that direction.
- **Scroll automatically only as much as necessary** to help people retain context [HIG] — bring a found search match or an off-screen insertion point into view; follow the pointer past the view edge during a selection.
- **Content scrolls *under* the floating toolbar** — the toolbar is Liquid Glass and content passes beneath it; the scroll-edge effect manages legibility at that seam.
- **Scroll-edge effect styles** [HIG]: **prefer the `automatic` style**; it gives a more opaque separation for top toolbars with many controls, text outside Liquid Glass controls, and pinned table headers. `hard` is a crisp divider; `soft` is a diffused fade — test thoroughly for legibility before using `soft`.
- If you support **zoom**, set sensible maximum and minimum scale values. [HIG]

## Metrics & layout

- **Scroll indicators are translucent and appear on demand** (no reserved gutter): **[HIG]**.
- **Content peeks at the edge** to signal more content: **[HIG]**.
- **No nested same-orientation** scroll views: **[HIG]**.
- **Scroll-edge effects aren't decorative** [HIG] — they don't block or darken like overlays; **only use one when a scroll view is behind floating interface elements**, and **apply one scroll-edge effect per view**. In split layouts each pane can have its own — **keep them the same height** to maintain alignment. [HIG]
- In a tight panel, **use small or mini scroll bars** and keep all controls in that panel the same size. [HIG]
- Cross-cutting macOS sizing: scroll bars are **15pt (regular) / 11pt (small)** — convention; let the platform draw them.
- Momentum/elastic scrolling preserved: **[HIG]**.

## Native macOS conventions

- In macOS, a scroll indicator is commonly called a **scroll bar**. [HIG] Let the platform draw it (overlay style, accent-aware). In Electron, set `overflow` to scroll and use overlay-style webkit scrollbars rather than a custom always-visible track.
- Don't put an **opaque background** behind the toolbar that hides content — rely on the **scroll-edge effect** so controls stay distinct while content scrolls beneath. [HIG]
- Keep safe insets so the first/last item isn't permanently hidden under the toolbar or a bottom bar.
- Consider **page-by-page scrolling** with an overlap unit (a line/row) where it suits the content. [HIG]

## Common non-native mistakes

- ❌ **Always-visible, chunky web scrollbars** with a reserved gutter.
- ❌ **Nesting** a vertical scroll view inside another vertical scroll view (scroll-trapping).
- ❌ An **opaque toolbar background** instead of letting content scroll under glass with a scroll-edge effect.
- ❌ Using a scroll-edge effect **decoratively** (where there's no floating element behind the scroll view), or applying **more than one per view**.
- ❌ **Disabling momentum / elastic overscroll** (`overscroll-behavior: none` everywhere).
- ❌ No **edge peek** — content cut flush at the boundary so users can't tell it scrolls.
- ❌ First/last item permanently **trapped under the toolbar** (missing safe insets).

## Accessibility

- Keep scroll containers keyboard-scrollable (arrow keys, Page Up/Down, Home/End) and focusable.
- Honour `prefers-reduced-motion` — soften or skip elastic/momentum animation; honour `prefers-reduced-transparency` so the scroll-edge effect stays legible.
- Ensure VoiceOver can reach off-screen content; don't hide it from the accessibility tree just because it's scrolled out of view.

## Related

- [windows.md](./windows.md) — toolbar + content area the scroll view fills
- [popovers-and-panels.md](./popovers-and-panels.md) — scrolling inside inspectors/panels
- [modality.md](./modality.md) — scrolling within sheets/modals
- [index.md](./index.md)
- [../DESIGN.md](../DESIGN.md)
