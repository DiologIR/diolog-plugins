# Mockup Align

A Claude Code plugin that makes a built UI match a reference design **exactly** — by measuring computed styles, never by eyeballing CSS.

## What it does

Given a **reference** (source of truth) and a **target** (the implementation to fix), it:

1. **Audits interaction architecture first** — maps every trigger to what it opens (modal vs drawer vs popover vs inline-expand vs navigate) and where that container lives in the DOM. A pixel-perfect button that opens the wrong container type is a structural FAIL, fixed before any CSS work.
2. **Enumerates elements, pseudo-elements, states, and variants** — `::placeholder`, `::before`/`::after`, `:hover`/`:focus`/`:active`, urgent-vs-normal rows, each tag colour — each is a separate thing to extract and diff.
3. **Extracts `getComputedStyle` from both sides** in a real browser — base properties plus pseudo-elements and forced states. Resolved values only; token/variant names are never trusted.
4. **Diffs property-by-property** with full, untruncated values (box-shadow, gradients, borders, `::placeholder` colour, hover/focus). A ✓ requires both values printed and exactly matching. Includes spacing-accumulation and sibling-adjacency gap tables.
5. **Fixes every mismatch**, re-renders, and re-diffs — plus content-parity screenshots for every modal/drawer interior. "It opens" ≠ "it matches".

## What makes it different

- **Measured, not eyeballed** — every claim is a printed number; `#9CA0AC` vs `#5E6A82` is a miss even when it "looks close".
- **Behaviour before pixels** — interaction architecture and DOM ancestry are verified before a single property is measured.
- **Framework-agnostic** — the reference can be an HTML+CSS mockup, a served prototype URL, or another rendered component set; the target can author styles in plain CSS, Tailwind, Chakra, CVA, or styled-components. You always diff resolved computed values, so the authoring system on either side is irrelevant.
- **Parallel by design** — a large page is split into one sub-agent per modal/drawer/region, each owning its area end-to-end.
- **Browser-tool flexible** — knows `agent-browser`, `playwright-cli`, and the Chrome MCP tools, with the gotchas for each (localhost vs HSTS, ≥1680px viewport, IIFE-wrapped evals, double-JSON-encoded results).

## Inputs

The user provides:
1. **Reference** — an HTML+CSS mockup path, a served prototype URL, or a component directory to render. If missing, the skill asks for it.
2. **Target** — usually inferred from a page/route name; if it can't be located, the skill asks you to point it at the component directory.
3. **Breakdown areas** (optional) — which surfaces to align in parallel; otherwise derived from the interaction-architecture audit.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install mockup-align@diolog-plugins
```

## Example invocations

```text
align inbox with ~/Downloads/Inbox.html — breakdown: chat sidebar, chat header, modals, junior-analyst panel, prompt container, bottom toolbar
```
```text
make the settings modal match docs/ui-mockups/Settings.html
```
```text
the documents page spacing and shadows are off vs the prototype at http://localhost:6007 — diff and fix it
```

See `skills/mockup-align/SKILL.md` for the full method.

## License

MIT
