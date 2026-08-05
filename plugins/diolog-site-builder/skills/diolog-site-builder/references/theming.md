# Theming — DESIGN.md → the site theme + the widget theme

A build has TWO theming surfaces that must agree so the page and the widgets injected into it look like
one design:

1. **The site theme** — a CSS `:root { … }` override layer that re-brands `base.css`'s token defaults.
2. **The widget theme** — the Diolog **PortalTheme** record that server-rendered widgets read (`--portal-*`
   / `--widget-*` vars). The DESIGN.md maps to both from the same source values.

## 1. The site theme layer

`base.css` ships plain, brand-neutral token defaults and reads EVERYTHING from tokens, so a re-brand only
overrides the THEME-HOOK tokens. Write the overrides to a `theme.css` and pass it via `spec.themeFile`
(path) or `spec.theme` (inline). The build injects it in `<style data-theme-overrides>` AFTER `base.css`,
so `:root` overrides win. **Never edit `base.css` to theme** — that breaks reuse and the css-drift guarantee.

### The hook tokens (override these, nothing else)

| Token | Role | DESIGN.md source |
|---|---|---|
| `--font-display` | headings / hero | the brand display/heading font (quote multi-word families) |
| `--font-sans` | body + UI | the brand body font |
| `--font-mono` | eyebrows, data, tickers, labels | a mono / the brand's data face |
| `--accent` | **primary brand colour** — CTAs, focus, links-hover, live dots | the brand primary/accent hex |
| `--accent-ink` | text ON the accent (must clear AA on `--accent`) | white or a dark brand ink |
| `--accent-soft` | quiet accent tint | a light tint of the accent |
| `--surface-0/1/2` | page / raised / recessed backgrounds | brand off-whites (never pure `#fff`) |
| `--ink`, `--ink-2`, `--ink-3` | primary / secondary / muted text | brand near-blacks (never pure `#000`) |
| `--line`, `--line-2` | hairlines / dividers | a tonal neutral |
| `--up`, `--down`, `--warning` | semantic states | keep muted; always paired with a non-colour cue |

### The dark contexts

`.section--dark`, `.band--dark`, `.ftr`, `.dlg__brand` re-map the SAME tokens to an on-dark palette, so
every component (buttons, links, badges, forms, widget frames) re-themes on a dark band automatically. Give
them their own overrides — an on-dark accent, surfaces, and inks — so the footer / dark bands are on brand.

### Example theme.css

```css
:root {
  --font-display: "Fraunces", Georgia, serif;
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --accent: #0b5d3b;  --accent-ink: #ffffff;  --accent-soft: #e7f1ec;
  --surface-0: #fbfaf7;  --surface-1: #ffffff;  --surface-2: #f2f0ea;
  --ink: #14231c;  --ink-2: #46564e;  --ink-3: #6b7a72;  --line: #e3e8e4;
}
.section--dark, .band--dark, .ftr, .dlg__brand {
  --accent: #7fd4a8;  --accent-ink: #08251a;
  --surface-0: #0c1a13;  --surface-1: #15271d;  --surface-2: #1d3327;
  --ink: #eef4f0;  --ink-2: #c2d0c8;  --ink-3: #93a49a;  --line: rgba(238,244,240,.16);
}
```

### Modernise a captured DESIGN.md first
If the DESIGN.md is a scrape of the company's existing site (`designMdProvenance: "captured"`), do the
design-craft modernise pass BEFORE mapping: hold the brand anchors (hues, type family, logo) fixed, but push
dated execution to its intentional target (near-black ink over muddy grey, a warm neutral ramp, display
tracking, layered elevation, a data mono). Map the modernised values into the tokens above. A `curated`
DESIGN.md binds as-is.

### Verify contrast after theming
The render-audit measures nav + button contrast against their real backdrop in both header states, top and
scrolled, light and dark. A themed `--accent` that fails AA on `--accent-ink` (or an on-dark accent that
fails) is a gate error. Aim primary CTAs ≥ 5:1. Rebuild + `verify.mjs` after theming.

## 2. The widget theme (PortalTheme)

Server-rendered widgets do NOT read the page's CSS tokens — they self-theme from a Diolog **PortalTheme**
record (`libs/shared/src/widgets/widget-instance.ts` → `PortalThemeOverrides`), applied by
`apps/web/lib/widgets/render-widget.server.ts` as `--portal-*` / `--widget-*` vars. To make widgets match the
site, map the DESIGN.md to the portal theme fields (this is applied by Diolog when the site is stored/served —
you supply the values, typically in the DESIGN.md → generation envelope, not in the page HTML):

| PortalTheme field | Map from |
|---|---|
| `primaryColor` / `accent` | `--accent` |
| `textColor` | `--ink` |
| `mutedTextColor` | `--ink-3` |
| `canvasColor` | `--surface-0` |
| `surfaceColor` | `--surface-1` |
| `borderColor` | `--line` |
| `typography` | `--font-sans` family name |
| `cornerRadius` | `--r-2` (px) |
| `fontSize` | body size |

Keep the two surfaces in sync: if the site accent is green, the widget `primaryColor` is the same green, so a
price chart / announcement card injected into the page reads as part of it. Per-instance visual tweaks beyond
the portal theme go in the widget's `styleOverrides` (the config comment) and are applied via the portal
editor — see `references/widgets.md`.
