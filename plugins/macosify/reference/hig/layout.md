---
title: Layout
hig: layout
role: foundation
---
# Layout (macOS)

**Purpose.** How to structure content in a Mac window so it feels at home: grouping, hierarchy, adaptability, and the safe areas/guides the system provides. Apple's framing: a consistent layout that adapts to context **grounds people in your content** the moment they open the app, and familiar relationships between controls and content help people use and discover features.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/layout

## When to use

Every surface. Layout is the structural decision that precedes individual controls — define how content fills the window, how controls separate from content, and how the whole thing adapts to resize, Light/Dark, and Larger Text.

## Anatomy & best practices [HIG]

- **Group related items.** Use negative space, background shapes, colors, materials, or separator lines to show relationships and separate information into distinct areas — while keeping content and controls clearly distinct.
- **Make essential information easy to find** by giving it sufficient space. Show the most important information right away; don't crowd it with nonessential detail (move secondary info elsewhere in the window or into an additional view).
- **Extend content to fill the window.** Backgrounds and full-screen artwork extend to the edges; scrollable layouts continue all the way to the bottom and sides. Controls and navigation (sidebars, tab bars) **appear on top of content, not on the same plane** — lay out with that in mind.
- **Use a background extension view** when content doesn't span the full window, so the material appears to continue behind the control layer (e.g. beneath the sidebar or inspector) — no abrupt seam.

### Visual hierarchy [HIG]

- **Differentiate controls from content.** Take advantage of the **Liquid Glass** material to give controls a distinct, cross-platform appearance. **Instead of a background, use a scroll-edge effect** to transition between content and the control area.
- **Place items to convey relative importance.** People read top-to-bottom and leading-to-trailing, so the most important items generally belong near the **top and leading** side. Reading order varies by language — account for right-to-left.
- **Align components** with one another to make them easy to scan and to communicate organization and hierarchy; alignment plus indentation conveys the information hierarchy.
- **Use progressive disclosure** to reveal hidden content — a disclosure control, or partially showing items to hint that scrolling/interaction reveals more.
- **Make controls easier to use** by providing enough space around them and grouping them in logical sections; crowded or too-close controls are hard to tell apart.

## Behavior & states — adaptability [HIG]

- **Design a layout that adapts gracefully** to context changes while staying recognizably consistent — people expect it to work and feel familiar when they resize a window, add a display, or switch devices.
- Ensure an adaptable interface by **respecting system-defined safe areas, margins, and guides**, and by fine-tuning placement with layout modifiers — rather than hard-coding pixel offsets.
- **Be prepared for text-size changes** — respond appropriately when people choose a different text size (Larger Text / Dynamic Type on platforms that have it).
- **Scale artwork** in response to display changes when needed; don't change the aspect ratio — scale so important visual content stays visible.

## Metrics & layout — guides and safe areas [HIG]

- A **layout guide** defines a rectangular region for positioning, aligning, and spacing content; the system provides predefined guides for **standard margins** and for **restricting text width for optimal readability**. You can define custom guides too.
- A **safe area** defines the region not covered by a toolbar, tab bar, or other window-provided views — essential for avoiding interactive/display features. On the Mac that includes the **camera housing** at the top edge of some models.
- Respect key display and system features per platform; an app that doesn't accommodate them doesn't feel at home and can be harder to use.
- Convention (not in this page): an **8pt base grid with 4pt subdivisions**; concentric corners in macOS 26 — capsule radius = height/2, a child's radius = parent radius − padding. [convention]

## Native macOS conventions [HIG]

- **Avoid placing controls or critical information at the bottom of a window** — people often move windows so the bottom edge sits below the bottom of the screen.
- **Avoid displaying content within the camera housing** at the top edge of the window (see `NSPrefersDisplaySafeAreaCompatibilityMode`).
- Note: macOS adds **no other platform-specific layout considerations** beyond these two in this page; the rest is the cross-platform best practices above.
- Convention: resizable windows with sensible min/max; restore window size/position, sidebar width, scroll, and selection; sidebars use vibrancy/Liquid Glass while the content column stays opaque. [convention]

## Common non-native mistakes

- **Putting primary controls or critical info at the bottom of the window** — Apple explicitly warns against this on macOS.
- **Content under the camera housing** at the top edge, clipped or obscured.
- **A solid background slab behind the toolbar/control area** instead of the scroll-edge effect that Apple prescribes for separating controls from content.
- **A hard seam at the sidebar/inspector edge** when content doesn't span the window — use a background extension view.
- **Crowded, ungrouped controls** with no negative space; nothing aligns.
- **Hard-coded pixel offsets** that ignore safe areas/layout guides and get clipped under chrome, or layouts that don't reflow for Larger Text.

## Accessibility

Honour **Larger Text** — layouts reflow, never clip, when text grows; don't lock heights to one font size. Maintain spacing and target sizes as controls scale, and keep contrast intact as the layout adapts to Dark Mode and Increase Contrast.

## Related
- [designing-for-macos.md](designing-for-macos.md) — the native window in context; menu bar as command surface.
- [motion.md](motion.md) — transitioning between layout states without animating layout properties.
- [branding.md](branding.md) — keeping brand expression in the content area, off the structural chrome.
- Index: [index.md](index.md) · Theme: [../DESIGN.md](../DESIGN.md)
