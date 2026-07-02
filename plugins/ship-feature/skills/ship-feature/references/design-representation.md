# Phase 1 — Design representation (design-craft)

Goal: before a single line of the feature is spec'd, planned, or built, make sure the feature's **entire** UI exists in the project's design-system mock world — every surface, state, element, composite, and mock page it needs. This mock UI then becomes the **visual source of truth** every later stage cites: triage's UI preview, the plan's UI slice, `/work`'s UI-fidelity checks, `/gap-fix`'s UI audit, and e2e's flow coverage all measure against it. A feature whose UI is only half-represented here is a feature that ships half-built later — the mock is where "what it looks like and does" is settled cheaply, in HTML/CSS, before it's expensive.

## Inputs to gather first

1. **The feature description** (already in context from Phase 0) — the list of surfaces and behaviours the UI must cover.
2. **The design system itself** — the reliable anchor is **`apps/web-design-system`** (the rendered mock-UI app — the index of which surfaces/elements/composites already exist, its tokens in `apps/web-design-system/tokens/tokens.css`, plus the `apps/*-mobile` islands where the feature touches them). Layered on top, **when one is provided or present**, is a **`DESIGN.md`** design-language spec (palette, type, spacing, shape, motion, voice) — it may be handed to you as an input or live in the repo (commonly at the root, but don't assume a fixed path); read it if you have it, and if you don't, work from `apps/web-design-system` and its tokens. Read what's available to learn what the design system **already covers** and its conventions for adding to it, so you *extend and reconcile* rather than duplicate. Stay surgical while you're in there: add and adjust what *this feature* needs; don't "improve" unrelated components, restyle neighbouring surfaces, or refactor the token layer as a side effect — those changes would ride the feature branch and muddy the merge diff. If your repo lays the design system out differently, locate the equivalents; if you genuinely can't find them, ask the user where the design system lives rather than inventing a structure.
3. **The optional pure HTML/CSS/JS mock** the user supplied for this feature — a file, folder, or URL. It's a strong hint at intended layout/interaction; mine it for structure and copy, but re-express it in the design system's own tokens/elements/composites (don't paste a foreign look in).

## Run design-craft toward *complete representation*

Invoke **`/design-craft`** with the feature + the three inputs above as context. The design-craft skill carries the full design philosophy and its own procedures (design-system-extract, generate-variations, component-extract, polish-pass, accessibility-audit, ai-slop-check) — use the ones that fit. Your specific bar for *this* orchestration is **coverage**, not just polish:

- **Every surface** the feature introduces or changes has a mock page (or an updated one).
- **Every state** each surface can be in is represented — not just the happy path but empty, loading, error, and (where the feature is AI-assisted) the AI/streaming state. Diolog features routinely have all five; a mock that only shows the populated happy path has under-represented the feature.
- **Every reusable part** is a real design-system **element** or **composite** (tokens → elements → composites → pages), not a one-off inline block. When a surface genuinely needs a dense bespoke organism, build it — then fold the reusable parts back into the system. The system is the floor, not the ceiling.
- **Fidelity matches the reference.** Populated lists/tables with realistic domain-true data, real component previews, multiple content regions per surface — the information density of a real product surface, matching any reference the user points at, not a thin wireframe of it.

Design-craft verifies its own renders via a verifier subagent — make sure it does. **A mock that type-checks but renders blank has represented nothing.** Open the rendered surfaces (via the design-system dev host / playwright-cli, as design-craft's environment notes describe) and confirm they actually draw before you call Phase 1 done.

## Two outputs — both matter

1. **On disk: the updated design-system mock UI.** These are real files under `apps/web-design-system` (+ any mobile design-system islands the feature touches). They are **code** and they must ride the feature branch (see "Carrying the mock onto the branch" below) so the mock and the eventual real implementation ship together and stay in sync.
2. **In context: a short UI inventory** you keep for the rest of the run — the list of surfaces × states × components the feature needs, with the mock page path for each. This is the checklist you hand (by reference) to triage, `/work`, `/gap-fix`, and e2e so none of them under-covers the UI. Write it into the feature notes or the spec's context so it survives a context compaction.

## Carrying the mock onto the feature branch

There's a sequencing seam to handle: design-craft runs in the **main working tree** (Phase 1), but `/work` doesn't create the feature branch/worktree until Phase 4 — and it branches fresh from `INT`, so it won't automatically contain your uncommitted design-system changes. Resolve it deliberately (pick per how the team treats the design system; default to the first):

- **Default — the mock is part of the feature.** Keep the design-system changes as working changes in the main tree through triage + plan (they inform both). When `/work` creates `.worktrees/<ID>`, ensure those changes land on `ai/<id>`: the cleanest way is to make the design-system files an explicit slice in the plan's UI work so `/work` re-creates/moves them onto the branch; alternatively, move the working diff into the worktree after it's created (e.g. stash in the main tree, apply in the worktree, commit there). Either way the mock UI ends up committed on `ai/<id>` and merges with the feature. Confirm it's on the branch during Phase 4's per-phase verification.
- **Alternative — the design system evolves on its own commits.** If the team ships design-system updates independently of features, commit the design-craft changes to `INT` directly (their own commit) and treat the mock purely as reference. Only do this if that's the established convention — otherwise the mock and the feature can drift.

Whichever you choose, the design-system mock UI must remain **readable as reference** for every later stage (it's the UI oracle) **and** must not be silently lost between the main tree and the branch. State which path you took in the Phase 1 summary so the human isn't surprised at merge time.

## Done when

Every surface/state/component in the feature's UI inventory has a rendered, on-disk mock; the reusable parts are real elements/composites; the renders were actually verified (not just built); and you've decided and recorded how the mock reaches the feature branch. Then advance to triage with the mock UI named as context.
