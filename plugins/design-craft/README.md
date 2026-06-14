# Design Craft

A Claude Code plugin that turns Claude into an opinionated, accessibility-aware, **AI-slop-resistant** design collaborator — a designer who happens to use code, not a code generator who happens to make designs.

## What it does

The skill carries a complete design philosophy in its `SKILL.md` and routes to **14 phased procedures** in `references/` when a task matches. It produces intentional design artifacts in plain HTML / CSS / SVG / JS — landing pages, app screens, dashboards, interactive prototypes, slide decks, wireframes, hi-fi variations, token files, and component inventories — and reviews/fixes designs against accessibility, hierarchy, interaction-state, and "does this look AI-generated" standards.

The philosophy explicitly rejects the generic-template defaults (aggressive gradients, emoji decoration, rounded-corner-with-left-border cards, Inter-everywhere typography, the cream/serif/terracotta editorial-warm house style) and replaces them with content discipline, purposeful aesthetics, a real visual hierarchy + spacing rhythm, committed typography and color systems, WCAG accessibility, complete interaction states, and system thinking (components + tokens over one-off pages).

## The procedures

**Production — build something**
`discovery-questions` · `frontend-aesthetic-direction` · `wireframe` · `make-a-deck` · `make-a-prototype` · `make-tweakable` · `generate-variations`

**System — extract structure**
`design-system-extract` · `component-extract`

**Review — audit and fix**
`accessibility-audit` · `ai-slop-check` · `hierarchy-rhythm-review` · `interaction-states-pass` · `polish-pass`

Procedures chain. A typical greenfield flow: `discovery-questions → frontend-aesthetic-direction → wireframe → make-a-prototype → polish-pass`. A brand-aware flow: `design-system-extract → generate-variations → make-tweakable → polish-pass`.

## What makes it different

- **Anti-AI-slop by construction** — `ai-slop-check` detects and replaces the nine template tropes, and `frontend-aesthetic-direction` pre-empts the default-model look by committing to a stated direction before any hi-fi work.
- **Accessibility is the floor, not a feature** — WCAG AA contrast, semantic HTML, keyboard/focus, motion preferences, and form correctness are baked into both the philosophy and the `accessibility-audit` / `polish-pass` reviews.
- **Rooted in real context** — hi-fi never starts from scratch; the skill reads the codebase/brand/tokens/screenshots and lifts exact values before adding to them.
- **Coverage-first reviews** — review procedures fan out parallel verifier agents (via the `Agent` tool) that report *everything* with confidence/severity, then aggregation filters — so minor findings aren't silently suppressed.
- **Self-contained output** — deck-scaling shells, device frames, side-by-side canvases, and live tweak panels are written as plain, dependency-free HTML/CSS/JS that persist state to `localStorage` and run as standalone files.

## Built for Claude Code

Designed for this environment:

- Kickoff question rounds use the **`AskUserQuestion`** tool (structured options, previews for visual choices).
- Verifier fan-out and parallel reviews use the **`Agent`** tool.
- Browser verification (render, DOM, console, screenshots) drives whatever automation is available — Playwright, `playwright-cli`, or the Chrome MCP — through a verifier subagent.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install design-craft@diolog-plugins
```

## Example invocations

```text
design a landing page for our IR analytics product — three visual directions, single CTA
```
```text
build a clickable onboarding prototype in an iPhone frame: welcome → email → verify → profile → done
```
```text
make a 10-slide pitch deck from docs/PRD.md for an exec audience
```
```text
this dashboard looks AI-generated — run the slop check and fix it
```
```text
polish this before we ship it
```

See `skills/design-craft/SKILL.md` for the full philosophy and the routing table.

## License

MIT
