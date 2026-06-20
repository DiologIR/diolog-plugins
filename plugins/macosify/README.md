# macosify

Two macOS-native UI skills that share one bundled knowledge corpus — the full **macOS 26 "Tahoe" / Liquid Glass** Human Interface Guidelines library, a token-level **`DESIGN.md`**, and the **macOS 26 UI Extraction & Native Translation** research framework.

The governing principle of this plugin: **lean to true AppKit-native macOS.** Some Mac apps are genuinely native; many are **iOS-derived** — Mac Catalyst or "Designed for iPad" running on Apple Silicon — which produces an iOS-like look on macOS. Both skills treat AppKit-native as the gold standard and correct iOS-derived looks *toward* it.

## Skills

### `macosify` — refit a UI to feel natively macOS

Takes an existing surface (a page, screen, or component) and refits it so it reads as an authentic macOS 26 app: real window chrome + traffic lights, SF Pro at the **13pt** macOS body scale, dynamic semantic colour bound to the user's accent, **Liquid Glass only on floating chrome** (never content), concentric corners, native lists/tables instead of card grids and per-item buttons, the menu bar as the complete command surface, and the standard keyboard/pointer model. It first diagnoses whether the source is already native, Catalyst-converted, or iOS-on-Mac, then converts iOS-derived tells to their AppKit equivalents.

Grounds every decision in three sources: the bundled **HIG** (`reference/hig/`), **`reference/DESIGN.md`** tokens, and the accumulating **`learnings/macos-ui-learnings.md`**.

> Triggers: "macosify this", "make this feel like a native Mac app", "this looks like a web/iOS app — nativise it for macOS", "refit X to macOS conventions".

### `macos-ui-analyst` — analyse a macOS screenshot (the *GlassReader* persona)

Analyses a static macOS 26 screenshot into a structured **macOS Native Translation Report** (a semantic AX-tree component inventory + SwiftUI/AppKit mapping + design tokens + an epistemic-tagged build guide), classifies the screenshot's **framework lineage** (AppKit-native vs Catalyst vs iOS-on-Mac vs SwiftUI), and **merges durable, generalisable learnings into the single accumulating `learnings/macos-ui-learnings.md`** that `macosify` consumes — so analysing real Mac screenshots makes the refit skill smarter over time.

> Triggers: "analyse this macOS screenshot", "what's native/not-native about this Mac UI", "extract the native structure of this screen", "turn this Mac screenshot into SwiftUI/AppKit".

## Layout

```
macosify/
├── reference/                         # shared, read-only knowledge corpus (copied, version-controlled)
│   ├── hig/                           # 37-file macOS 26 HIG library (foundations + every component)
│   ├── DESIGN.md                      # token-level macOS 26 design system (colour/type/material/spacing)
│   ├── apple-macos-27-ui-kit.tokens.json   # the token export DESIGN.md is sourced from
│   └── macos-26-ui-analysis-framework.md   # the extraction & native-translation framework
├── learnings/
│   └── macos-ui-learnings.md          # the single accumulating knowledge base (analyst writes, macosify reads)
└── skills/
    ├── macosify/SKILL.md
    └── macos-ui-analyst/
        ├── SKILL.md
        └── references/persona.md      # the full GlassReader operating persona
```

## How the two skills compound

`macos-ui-analyst` reads real Mac screenshots → distils durable patterns into `learnings/macos-ui-learnings.md` → `macosify` reads those learnings (alongside the HIG + DESIGN.md) when refitting a UI. The learnings file is the feedback loop between observation and generation.

## Notes

- The bundled HIG + `DESIGN.md` + token kit are a **point-in-time reference for an evolving OS** (the kit is a third-party export labelled macOS 27); strong guidance, but verify specifics against the macOS you ship on. macOS 26→27 is actively changing the window corner-radius behaviour in particular.
- Skills reference their bundled files via `${CLAUDE_PLUGIN_ROOT}` so they resolve wherever the plugin is installed.
