---
title: Branding
hig: branding
role: foundation
---
# Branding (macOS)

**Purpose.** How to express a product's identity on the Mac **without** breaking native conventions. Apple's framing: apps express a unique brand identity in ways that make them **instantly recognizable while feeling at home on the platform** and giving people a consistent experience.

**Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/branding

## When to use

Whenever you reach for a brand colour, font, logo, or splash. The recurring rule across Apple's guidance: **branding always defers to content**, and personality comes through voice, accent, font, and the app icon — not through repainting the system chrome.

## Anatomy & best practices [HIG]

- **Use your brand's unique voice and tone** in all written communication you display (e.g. encouragement and optimism via plain words, occasional exclamation marks and emoji, simple sentences).
- **Consider choosing an accent color.** On most platforms you can specify a color the system applies to interface icons, buttons, and text. **In macOS, people can also choose their own accent color, which the system can use in place of the one your app specifies** — so defer to the user's choice.
- **Consider a custom font.** If your brand is strongly tied to a font, ensure it's **legible at all sizes** and supports accessibility (bold text, larger type). It works well to use a custom font for **headlines and subheadings** while using the **system font for body copy and captions**, since system fonts are tuned for legibility at small sizes.
- **Ensure branding always defers to content.** Space spent on a pure brand asset is space taken from the content people care about — incorporate branding in refined, unobtrusive ways.
- **Help people feel comfortable by using standard patterns consistently.** Even a highly stylized interface stays approachable if it keeps familiar behaviors — place UI components in expected locations and use standard symbols for common actions.
- **Resist the temptation to display your logo throughout the app.** People rarely need reminding which app they're using; the space is usually better spent on information and controls.
- **Avoid using a launch screen as a branding opportunity.** A launch screen disappears too quickly to convey anything — consider a welcome/onboarding screen for branding instead.
- **Follow Apple's trademark guidelines** — Apple trademarks must not appear in your app name or images.

## Behavior & states

- Brand expression lives in **content, accent, voice, custom font, and the app icon** — and adapts to the user's appearance and accent settings, never overriding them.
- On macOS specifically, treat the **user's chosen accent color** as the default expectation for many controls; apply your brand tint to *your* content and accents.

## Metrics & layout

- Use the **system font** (SF Pro via `-apple-system`) for body and captions; reserve any custom face for headlines/subheadings, and verify legibility + accessibility (bold, larger type) at every size.
- Keep brand colour **off the structural chrome** (window frame, menu bar, standard controls) and **on** your content, selection, and primary-action accents. Verify the brand colour meets contrast in **both** Light and Dark.

## Native macOS conventions

- Apple states there are **no additional branding considerations for iOS, iPadOS, macOS, tvOS, visionOS, or watchOS** — the cross-platform best practices above are the whole guidance. The macOS-specific note is the one above: **users can set their own accent color**, and your app should defer to it.
- Don't recolour the title bar, traffic lights, menu bar, standard controls, or sidebar/toolbar materials.
- Never paint fake chrome to carry brand: no fake traffic lights, fake title bar, decorative desktop backdrop, or nested window frame (see [designing-for-macos.md](designing-for-macos.md)).
- Brand voice lives in copy, labels, and empty/error states — written in the clear, human macOS tone.

## The app icon (brief)

- Convention (macOS 26 / WWDC25): the icon is a **layered Liquid Glass** mark assembled in Apple's **Icon Composer** from separate background / mid-ground / foreground layers; the system adds depth, translucency, and specular highlights and exports a single `.icon` file that adapts across devices. [convention]
- Author at **1024×1024** and design for the system's **rounded-rectangle (squircle) mask** — don't draw your own frame; let the system mask and apply the glass treatment. [convention]
- Don't just drop in the iOS/web artwork unchanged; design intentionally for the Mac, simple and recognisable at small sizes across Light/Dark. [convention]

## Common non-native mistakes

- **Recolouring the chrome** — a brand-coloured title bar/toolbar, custom-tinted traffic lights, or overriding the user's accent on system controls (Apple: macOS users can choose their own accent — defer to it).
- **A persistent logo / watermark** throughout the app, against "resist displaying your logo."
- **A branded launch screen** treated as a branding moment, against Apple's explicit guidance.
- **Bundling a brand web font for the whole UI** instead of using the system font for body and captions.
- **Faking the window frame** to carry a brand look — the cardinal native sin.
- **Brand colour that fails contrast** in Dark Mode, or that conveys state with colour alone.

## Accessibility

Brand colour must meet contrast in **both** Light and Dark and under **Increase Contrast**; never rely on a brand colour alone to convey state (pair it with a label/icon/shape). A custom brand font must support **bold text and larger type** and stay legible at all sizes — Apple's stated condition for using one. Respect **Reduce Transparency** so branded accents remain legible when glass solidifies.

## Related
- [designing-for-macos.md](designing-for-macos.md) — match the system; never fake chrome to carry brand.
- [layout.md](layout.md) — express brand in the content area, the star; keep it off the structural frame.
- [motion.md](motion.md) — don't replace system transitions with branded motion.
- Index: [index.md](index.md) · Theme/tokens: the user-supplied DESIGN.md (the look comes from there, not this library)
