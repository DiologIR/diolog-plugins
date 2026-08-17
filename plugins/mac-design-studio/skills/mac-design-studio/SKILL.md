---
name: mac-design-studio
description: >-
  Design beautiful, varied, authentically native macOS app UIs and app icons from scratch — full mock windows (HTML/CSS or spec) and 1024pt icon designs (SVG/spec) with committed aesthetic directions learned from 135 curated macapp.supply apps, Apple's macOS 27 UI kit ground truth, and the HIG. Use whenever the user asks to design/mock/create a mac app UI, a macOS window, a menu-bar app, a native-feeling interface, or a mac app icon — "design me a mac app for X", "mock the main window", "make an icon for my app", "give me 3 directions for a macOS tool" — including when they just say "make it beautiful/native". Routes native correctness to the macosify HIG library and craft/variation to design-craft. For analysing existing screenshots into the corpus use mac-design-digest; for refitting existing built UI use macosify.
---

# Mac Design Studio

Create new macOS app designs — windows and icons — that are **native to the platform** (correct), **committed to a direction** (beautiful), and **distinct from each other** (varied). This skill is the generation counterpart to `mac-design-digest`: it consumes taste learned from 135 curated apps and the ground truth of Apple's macOS 27 UI kit.

**Running as a Gemini model?** Read `gemini.md` in this directory first, then follow this file with the overrides it names. The precedence chain below is the right instrument for that family's measured misses, but a run read it and did not enter it — chrome metrics, accents and casing came from none of its four tiers. `gemini.md` makes the chain a metric table filled in before the first line of CSS with a tier tagged per cell, turns step 6's seven audits into seven reported rows, and states what a second platform needs before it can be themed rather than reskinned. Other models skip it.

## Knowledge sources — load before designing

**Bundled (always read):**
1. `references/design-directions.md` — the aesthetic direction catalogue synthesised from the macapp.supply corpus: named style clusters with identity tokens, member exemplars, and do/don'ts. **Direction choice is the first design decision — this file is calibration for it, not a closed menu.** The corpus exists to teach what *high-quality, committed* macOS design looks like broadly; the directions are its proven exemplars, and a new or hybrid direction is always legitimate when the subject earns it.
2. `references/native-foundation.md` — the distilled platform floor every design must stand on: macOS 27 control ladder + type ramp + label tiers `(specified)`, the native-feel grammar, Liquid Glass layer discipline, and the delivery audits.
3. `references/icon-directions.md` — the icon style catalogue (eras, palette families, recurring devices, composition recipes, the Tahoe gel-glass grammar, the three-engine generation pipeline) synthesised from 134 curated digests + the 500 most recent macosicongallery.com icons + 32 ground-truth macOS 26 captures. For icon work. The raw corpus + per-icon analysis lives in `references/icon-corpus/` (`analysis/SYNTHESIS.md` is the aggregate; the images themselves are usable as raster-engine style references).
4. `references/motion-and-feel.md` — fluid-interface physics (springs, interruptibility, materials-on-web, optical typography, reduced-motion floor) and the eight Apple design principles as review vocabulary. Mandatory for any interactive/HTML deliverable; static mocks take its typography + materials sections and ship with its motion spec appendix.
5. `references/mac-essence.md` — **the spine.** The eight convictions distilled from the corpus + the UX canon on what actually makes a great mac app great (familiarity-as-canvas, restraint-as-confidence, the surface's single question, states-are-the-quality, words-as-load-bearing, forgiveness, the keyboard, invisible completeness), the essence test, and the **yield table** — where design-craft/ux-craft's web-first rules bend to mac grammar (cursor, targets, casing, toasts…). Read after choosing a direction, before building; its convictions generate the mock's *requirements* the way the direction generates its *look*.

**External (read the relevant parts per task):**
- **macosify plugin** (`plugins/macosify/`): `reference/hig/index.md` → read every component file relevant to the surfaces you're designing (its "common non-native mistakes" lists are the correction table); `reference/DESIGN.md` for material ramp, motion tokens, elevation, and the hard-HIG-numbers table; `learnings/macos-ui-learnings.md` for evidence-backed native tells.
- **design-craft plugin**: follow its router for craft procedures — `frontend-aesthetic-direction` (when the user has no direction preference), `wireframe` (structure before polish), `generate-variations` (when asked for options), `hierarchy-rhythm-review`, `interaction-states-pass`, `ai-slop-check`, `polish-pass` (always, before delivery), `unit-critique-gate` (per surface on multi-surface commissions — early mistakes compound into every screen that copies them). Its content discipline binds throughout: every element passes the five-question test; realistic content or honest placeholders, never filler.
- **ux-craft plugin** — a **standing dependency, not a conditional one** (mirroring design-craft's own rule): its non-negotiables are the UX floor this skill's aesthetics build on — one primary action, the trunk test (where am I / what can I do / what happens next), designed states for everything, recognition over recall, undo over confirm, real content real states. Load `references/flows-and-forms.md` before any multi-step surface (shape the flow — one decision per step, exits mapped — before any screen), `references/ux-writing.md` for the copy pass, `references/psychology-laws.md` when grounding a choice. A beautiful screen on a broken flow is polish spent on brokenness. **Where either skill's web-first rules collide with mac grammar, the yield table in `mac-essence.md` decides — native wins inside app chrome.**
- **Live corpus** (if present, default `./design-corpus/` or the user's stated location): `TASTE.md`, `patterns/*.md`, `ICONS.md`, `kit/macos-27.md` (the full Apple macOS 27 UI-kit deconstruction — complete `(specified)` swatch tables, per-tier radii, chrome anatomy, era deltas; `references/corpus-snapshot/kit-macos-27.md` is the bundled copy), and specific `apps/<slug>.md` / `icons/<slug>.md` profiles — richer and fresher than the bundled snapshots; prefer it when available.

**Precedence:** Apple kit `(specified)` values and HIG → corpus canon → chosen direction's identity tokens → design-craft general craft. Native correctness is never traded for style; style is chosen *within* the native envelope.

## Procedure — designing an app UI

1. **Brief.** Pin down: what the app does, its audience (pro tool / consumer utility / menu-bar companion / creative), the surface(s) to design (main window / settings / onboarding / menu-bar extra), light/dark or both. Ask only what the request leaves genuinely open.
2. **Choose a direction — deliberately.** Start from `design-directions.md` by audience + subject match, but treat the catalogue as calibration, not a whitelist: you may hybridise two directions or compose a novel one when the subject demands it — a new direction must be stated with the same rigour (identity tokens, do/don'ts, differentiation from its nearest catalogue neighbours). State the choice, the runner-up, and *why*. Rules:
   - **AI-default calibration** works at the *type* level too. The face this model reaches for when told to be distinctive is **Space Grotesk** — which makes it the opposite of distinctive; the same applies to Inter/Roboto/system-stack as silent defaults. A font choice you can defend in one sentence ("a typewriter mono, because the app reads logs") is a choice; a name you arrived at before you had a reason is gravity. Direction-level: Warm Paper (cream + terracotta + serif display) and Terminal Dark (near-black + single acid accent) are simultaneously corpus-proven directions *and* the looks AI currently defaults to on any brief. When the brief explicitly asks for them, or the subject positively earns them (a break app named after a musical rest earned its paper), commit fully. When the brief leaves the aesthetic axis free, don't spend that freedom on either — reach for a direction the subject actually pulls toward.
   - Never default to the same direction twice in a row across a session; if the user asks for "another app", pick a different direction or justify staying.
   - Subject-mine (design-craft vocabulary): let the app's own world pull the palette/type personality *within* the direction.
   - **Trawl reference evidence for the content area, and for any companion surface.** The corpus leads on mac *chrome* — Mobbin indexes iOS and web, not macOS, so it cannot tell you what a native toolbar or sidebar should be. What it can tell you is what a real, shipped version of the *content* looks like: the density of a live transaction list, the anatomy of a settings pane, how a shipped product handles the partial state. Query it (`search_screens`, `platform: ios` for the app's own surfaces, `web` for a companion or marketing surface), open the images, and note what transferred. When the commission includes an iPhone or iPad companion, or a marketing site, that surface gets a proper trawl — design-craft's `plugins/design-craft/skills/design-craft/references/mobbin-trawl.md` is the playbook. Two or three searches; not installed is a one-line note in the delivery, never a silent skip.
   - If the user wants options, produce 2–3 directions as thumbnail-level descriptions first (design-craft `generate-variations` discipline) — genuinely different directions, not tints of one.
   - **Name the risk and the signature.** Every design declares (a) one signature element — the single thing it will be remembered by (draw from or generalise the corpus signature-move bank, or invent) — and (b) one justified aesthetic risk. Spend the boldness there; keep everything around it quiet and disciplined. Before delivery, apply the remove-one-accessory pass: cut any decoration that isn't the signature or serving it. Not taking a risk is itself a risk — "competent but anonymous" is the corpus's named failure mode.
3. **Structure before polish.** Name the surface's **single question** (mac-essence conviction 3) — the thing a user opens it to learn or do — and promote its answer to the visual hero. For multi-step surfaces, shape the flow first (ux-craft flows-and-forms: entry → one-decision steps → completion signal → recovery exits). Then lay out the window from the pattern library: three-zone window (toolbar / sidebar / content), correct chrome archetype, native lists-tables-forms — per `native-foundation.md` metrics and the relevant HIG files. Sketch the skeleton (regions + kit-tier sizes) before any styling, and run the trunk test on it: where am I, what can I do, what happens next.
4. **Apply the system.** Tokens first: derive the app's palette (accent bound to a system hue, label tiers for text, Fills tiers for bezels), type from the 11-role ramp (13pt body), spacing on the 8pt grid, radii concentric. Liquid Glass only on floating chrome, scroll-edge where content meets it. Every value from the kit ladder or the direction's identity tokens — no magic numbers.
5. **Build the artifact — states, words, and pixels together.**
   - Default: a self-contained HTML/CSS mock (no external assets; system font stack; both appearances if asked) rendered at a realistic window size (e.g. 840×400+ or 1200×760). Alternative on request: a token-precise written spec. Realistic content, never lorem ipsum (design-craft's five-question test binds per element).
   - **Design the states, not the screen** (the canon's highest-leverage habit): render the ideal state *and* the empty/first-run state; specify loading, partial, error, and done in an accompanying state matrix with real copy for the unhappy paths. Every control carries its interaction states (hover/focus/active/disabled — arrow cursor in chrome, per the mac-essence yield table).
   - **Write the real words as part of the design** (ux-craft ux-writing + mac-essence conviction 5): sentence case, verb-first buttons, "…" discipline, adjacent non-blaming errors, one name per action.
   - **Keyboard presence** (conviction 7): name the default button (Return), Esc behaviour, and the 3–5 signature shortcuts in the spec; show the focus ring somewhere in the mock.
   - Apply `motion-and-feel.md`: interactive mocks get real press/hover states (pointer-down response, spring defaults, materialize-not-fade on floating surfaces) and the three accessibility media queries; static mocks ship with the short motion-spec appendix so the implementer inherits the feel, not just the pixels.
6. **Audit before delivery — non-negotiable.** Run, and report honestly:
   - **Open the render before you audit it.** Serve the mock, load it, capture crops at DPR 2–3, and read each one asking *"what is wrong with this?"* — not *"is this done?"*; the same pixels answer those two questions differently. Rendering a screenshot is not seeing one. Do this yourself: it is a handful of tool calls, and looking is cheaper than reasoning about what you would see.
   - The 10-point native-tells audit (`native-foundation.md`) — all ten pass unless the direction deliberately deviates (say which and why).
   - The 14-point quality rubric (grid, type scale, hierarchy, contrast, targets).
   - design-craft `ai-slop-check` — kill template tropes (gradient-on-everything, purple-blue SaaS wash, uniform card grids, tracked-uppercase labels) — plus the AI-default calibration above (unjustified Warm Paper / Terminal Dark counts as slop even though both are corpus-legitimate when earned).
   - The signature check: the declared signature element is present, singular, and the boldest thing on the surface; the remove-one-accessory pass has run.
   - Motion floor (interactive deliverables): springs not durations, interruptible, reduced-motion/transparency/contrast queries present (`motion-and-feel.md` quick reference).
   - The lookalike check: if the mock would pass as a specific corpus app's screen, differentiate deliberately.
   - **The essence test** (mac-essence): name the surface's question, its signature, and its worst state's behaviour — one sentence each. A mock that passes every rubric point but can't answer these isn't done. When a weakness survives, say which conviction it violates.
7. **Deliver** with the direction named, the audit scores, the state matrix, and the token table (so an implementer or another AI can build it). Keep the delivery note to those four things plus what you did *not* check — written output drifts long by default, and a spec padded with restated rationale buries the token table an implementer actually needs.

## Procedure — designing an app icon

**Route this to `create-mac-icon` (fledgeling-plugins) when it is installed.**
That skill grew out of this one's icon pipeline and has since moved well past
it: it carries the same direction catalogue and 12-point rubric, plus a
ground-truth corpus the master is measured against rather than merely described
from, a `scripts/fidelity.py` harness that scores the shipped SVG against the
winning raster at five sizes with a Pareto gate, a bounded iteration loop with
one edit class per round, a served human review sheet, a blind three-family
judge panel, and a `material-recipes.md` library that grows with every
commission. Icon work done here instead starts every lesson over.

Invoke it, or spawn an agent briefed to read its SKILL.md and follow it. Pass
the app's subject, personality and any brand constraints; it owns the rest.

If it is not installed, the fallback is the pipeline in
`references/icon-directions.md` § Generation pipeline: one shared spec, three
engines (hand-authored layered SVG, Arrow vector, corpus-referenced raster),
every take rendered at 1024/128/48/32/16, and an `audit.html` written from
`assets/icon-audit-template.html` with losing takes scored on the sheet. The
delivery bar is ≥10/12 with checks 1-4 non-negotiable. Note plainly in the
delivery that the fidelity loop was unavailable, since the master then ships
unmeasured against its reference.

**The audit sheet is a deliverable, and it is the one this pipeline drops.**
Twice on record the commission shipped icons with no sheet, and the user had to
ask *"why no audit.html? doesn't the skill say to create one?"* — it did say so,
which is the point: an instruction-only rule in this pipeline has a measured
history of being skipped. So treat it mechanically. Before you report the icon
done, list the directory and confirm four things are on disk: `audit.html`, one
render per take at each size, the master, and the losing takes. Then **open the
sheet in a browser and read it** — a contact sheet whose images 404 is the exact
artifact that gets shipped unseen, since nothing about writing the file reveals
that its `src` paths are wrong. If any of the four is missing, the commission is
not finished; say which is missing rather than reporting completion.

Sizes: render 1024, and retina pairs for the display sizes — 256/128/96/64/32
sources shown at 128/64/48/32/16 css px. The 48px row exists because that is the
size a Finder list and a plugin marketplace tile actually use, and an icon that
survives 128 and 16 can still fail between them.

**One silhouette across the whole set.** When a commission produces several
icons — variants, a family, a marketplace row — every one shares the same outer
shape, from `assets/squircle-path.txt`. A single icon whose corner radius or
outline differs from its siblings reads as a mistake at any size, and has been
caught by the user rather than by this pipeline.

## Variety discipline (what makes this a studio, not a template)

- **The corpus is a taste education, not a style library.** 135 curated apps taught what high-quality macOS design looks like *broadly*: mathematical consistency, one committed identity, restraint everywhere else, native grammar honoured even at the edges. Apply that understanding to any direction — catalogued, hybrid, or new. Copying the catalogue's surface without its discipline produces exactly the templated output the corpus exists to prevent.
- **One direction per design, fully committed** — depth of commitment beats breadth of features. The corpus's strongest lesson: memorable mac apps pick one signature move (a serif display face, a single saturated accent on graphite, a mascot) and honour the native grammar everywhere else.
- **Track what you've produced this session** (directions, palettes, glyph types) and steer new work away from repeats.
- **Beautiful ≠ maximal.** "Competent but anonymous" is the failure mode; so is decoration fighting the platform. The target: an app a macapp.supply curator would accept — native at a glance, distinct at a second look.

## Boundary conditions

- **User has an existing brand/design system:** it wins over the direction catalogue — use design-craft's rule (existing context beats greenfield direction), mapped into the native envelope.
- **User asks for iOS/web styling on macOS:** flag the specific non-native tells it would introduce (macosify correction table), offer the native equivalent, follow their call — recording it as a deliberate deviation in the audit.
- **Corpus absent:** the bundled reference snapshots stand alone; note that live-corpus depth (per-app profiles) is unavailable.
- **Asked to clone a specific app:** decline per the inspiration-not-cloning constraint; offer its cluster's direction instead.
