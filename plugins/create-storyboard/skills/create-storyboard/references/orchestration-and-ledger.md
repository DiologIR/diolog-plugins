# Orchestration & the coverage ledger — equal consideration at scale

A storyboard that covers many surfaces fails in a predictable way: the first few screens are dense and considered, and the long tail quietly degrades into stubs. The cause is **uneven attention** — each surface was built in a different context window, against a different slice of the spec, with the reviewer's energy decaying as the list grew. This reference fixes that with two instruments: a **coverage ledger** (the single source of truth for what's done and how well) and **workflow orchestration** (so every surface is built and reviewed by an agent carrying the *same* full context and held to the *same* bar).

Reach for this whenever coverage is more than a handful of screens — a whole project, a broad surface catalogue, or a sweep across an existing storyboard. For one or two screens, build inline; the ledger is overkill.

## The coverage ledger — the single source of truth

Before building, write a ledger file at the storyboard root (e.g. `COVERAGE-LEDGER.md`). It has **one row per surface/screen**, and nothing is "done" until its row is green. The ledger is what guarantees equal consideration: it makes every surface visible at once, so the 50th gets the same scrutiny as the 1st.

```
| Surface | Spec source(s) | Depth target (from reference) | Shell class | States (H/E/L/Er/AI) | Fidelity | Verified | Gaps / notes |
|---------|---------------|-------------------------------|-------------|----------------------|----------|----------|--------------|
| inbox   | specs/inbox.md, mock view-inbox.jsx | 3 sub-tabs · 12-row table · detail w/ 5 sections · 2 modals · Keeper card · data: thread→message | A (owns sidebar) | H E L Er — | ✅ dense | build+interact+shot | — |
| logs    | specs/logs.md, mock view-logs.jsx   | 4 tabs · live table (15 rows) · 6-section detail · filter bar | C (generic shell) | H · L Er AI | 🟡 thin  | build only | metrics tab is 3 stubs vs 6 in ref → populate |
```

Columns:
- **Spec source(s)** — every md/spec/mock that governs this surface (see the context contract). If a cell is empty, the surface was built blind — that is itself a gap.
- **Depth target (from reference)** — the per-surface **depth manifest**, mined from the reference BEFORE fan-out (see the next section): the concrete counts the build must hit — sub-tabs (and that each shows distinct content), table/list row counts, detail-pane sections, modals/sheets, the spec's named sub-features, and the data shape (which drill-down levels exist). This converts "match the information density" from a vibe into a checkable bar; it's the target each agent is handed, and the row the verify stage and the completeness-critic grade against. Empty only when there's genuinely no reference — then the qualitative Looks-real checklist (Step 3) is the bar.
- **Shell class** — only when the storyboard has a shell (see `interaction-and-shell.md`): A (owns the middle sidebar) / B (keep generic, real scopes) / C (not a list). Omit for shell-less storyboards.
- **States** — which of Happy/Empty/Loading/Error/AI genuinely apply and are implemented. A dash means "not applicable," not "skipped" — be honest about the difference.
- **Fidelity** — ✅ dense (passes the Looks-real checklist AND meets the surface's depth manifest) / 🟡 thin (renders but under-built, or misses manifest counts) / ❌ stub. **A surface drawn by a generic / kind-templated CONTENT renderer (the same handful of layouts with the label swapped in) is ❌ by definition, however believable it looks — ✅ requires a bespoke renderer carrying THIS surface's reference content.** (A generic *shell* — where the nav lives — is a separate, legitimate choice; see the shell-class column and `interaction-and-shell.md`.) A 🟡 or ❌ is an open gap.
- **Verified** — the strongest check that has actually run for this row: `build` < `render` < `interact` < `shot` (screenshot eyeballed). "It compiled" is the weakest claim; aim for `shot`.
- **Gaps / notes** — the specific next action. "thin" with no note is not actionable.

Keep the ledger current as the single artifact a reviewer (human or the reconcile pass) reads to know the true state. **A surface is only finished when its row is `✅ dense` + `shot` + no gaps.**

## Mine the depth manifest before you fan out (when a reference exists)

The ledger's **Depth target** column is not filled in by guesswork during the build — the lead computes it UP FRONT, in one pass over the reference, *before* spawning any agent. For each surface, open its reference file(s) (`view-<surface>` + `data-<surface>`, or the named mock) and extract the concrete counts: how many sub-tabs and what each one shows, how many rows the primary table/list holds, how many sections the detail pane has, every modal/sheet/wizard, the spec's named secondary sub-features, and the data shape (the drill-down levels). Write that into the row, then hand **each agent its own row's manifest** in the build prompt.

This is the fix for the #1 failure mode at scale: an agent told to "match the reference's density" under-measures under context pressure and ships a plausible-but-thin screen; an agent handed *"this surface has 3 sub-tabs each with distinct content, a 12-row table, a 5-section detail, 2 modals, and a Keeper card — build all of it"* builds to the bar. The manifest is the difference between *go find the bar* and *here is the bar* — and because the lead mines all surfaces in one consistent pass, the 50th surface gets a target as concrete as the 1st. **Porting beats re-deriving:** when the reference is a built mock, the manifest is also the agent's instruction to open that specific file and carry its content/structure/data across (translating only the look), not re-invent a thinner version from the prose spec.

## The per-agent context contract (non-negotiable)

The whole point is that every agent builds with the *same* full context the lead would. When you spawn an agent for a surface (or a flow, or a review), its prompt MUST require all of the following **before it writes a line of UI** — paste the contract verbatim into each agent prompt so none of them shortcut it:

1. **Read the whole project doc/spec tree, not just this surface's file.** A surface is shaped by decisions made elsewhere — shared conventions, sibling surfaces, the product's honesty grammar, cross-surface workflows. List every spec/md up front (`find … -name '*.md'`) and read the relevant ones in full; at minimum the master catalogue, this surface's spec, the mock of record, and any sibling/shared spec it references. A skim under-builds. **Source-of-truth split: the feature spec governs CONTENT (what the surface does, its data, naming, scope); the DESIGN.md governs LOOK (brand, shape, the navigation tier model). When unsure what a surface should show, read the spec — don't guess from the code or a screenshot.** **And when a built reference exists for THIS surface (e.g. a mock-of-record `view-<surface>` + `data-<surface>`), PORT it, don't re-derive it:** open that specific file, read it line by line, and carry its content, structure, sub-tabs, modals, and data shape across into the StyleX build — translating only the *look* to the DESIGN.md, and hitting every count in your **depth manifest** (the row you were handed). Re-deriving a surface from the prose spec when an 800–2,600-line reference already encodes its depth is the surest way to under-build it.
2. **Read the full HIG backbone.** `index.md` first, then every component file relevant to the surface's grammar (master–detail → `split-views` + `sidebars` + `lists-and-tables` + `toolbars`; a form → `text-fields` + `pickers` + `toggles`; etc.), and always the foundation files: `layout`, `accessibility`, `feedback`, `motion`, `writing`, `progress-and-status-indicators`. Take behaviour/structure/accessibility from it, not the macOS look.
3. **Invoke the `design-craft` skill** and run its polish / hierarchy-rhythm / ai-slop / accessibility passes on what it builds — and **measure computed styles in a browser** to match the reference's density, never inferring from tokens.
4. **Build from the shared design system** (tokens → elements → composites/parts), at the fidelity bar (Step 3's Looks-real checklist), reusing the established primitives — never a parallel look or one-off inline styles.
5. **Update its ledger row** with the truth: states covered, fidelity, the verification it actually ran, and any remaining gap.

An agent that skips 1–3 produces exactly the thin, off-brand, context-blind screen this whole approach exists to prevent. Make the contract a hard gate in the prompt, not a suggestion.

### "Confirm" is not "review" — the failure mode that survives a green gate

The surfaces that slip through are not the ones you *build*; they're the ones you *confirm*. An inherited label — "this one's already correct," "exemplar, just polish it" — is a **liability, not a shortcut**: it tells the agent (and you) to stop looking exactly where a real defect may sit. Three rules keep "confirm" honest:

- **Never let a label downgrade scrutiny.** Don't pass agents "this surface is an exemplar — confirm it"; pass them "re-derive whether this surface is correct from its spec/mock." If you wouldn't trust the label without checking, don't propagate it. (A storyboard's most-praised surface shipped with no list view because three reviews in a row were told it was the exemplar.)
- **Gate for capabilities ABSENT, not just defects PRESENT.** It's easy to check "is anything duplicated / dead / broken" — and miss "is the feature's primary surface even here, in the right region?" A surface can pass every present-defect gate (nothing duplicated, every control wired, zero console errors) and still be wrong because its core capability is *missing* (a detail with no list, a mode with an empty rail). Add the positive gate to the contract: *does each surface present its feature's primary browsing/working surface, in the right region, matching the mock's content layout — and is every secondary mode/state built, not just the primary flow?*
- **Verify the confirmed rows, don't just mark them.** In the ledger, a row whose strongest verification is `build`/`interact` but not `shot` is **not** done — it's unexamined. The reconcile pass must screenshot-eyeball the *confirmed* surfaces too, not only the changed ones; "confirmed-correct" without a screenshot is a claim, not evidence.

## Workflow shapes

Use the `Workflow` tool (deterministic fan-out with a shared concurrency cap) once you have the surface list. Scout inline first to discover the list (read the registry / catalogue / spec index), then pipeline over it.

**Default — pipeline per surface, decomposed so depth gets its own budget (no barrier).** Each surface flows through its stages independently; the fast ones don't wait on the slow ones. Critically, **give depth its own stages rather than one build-everything agent** — a single mega-stage that authors data, builds the surface, and adds every sub-feature in one context window is exactly what dilutes per-surface investment and produces the thin tail this whole approach exists to prevent.

```
const surfaces = /* discovered from the registry/catalogue, each carrying its depth manifest (above) */;
const results = await pipeline(
  surfaces,
  s   => agent(CONTEXT_CONTRACT + dataPrompt(s),     { label: `data:${s.id}`,    phase: 'Data',   schema: DATA_MODULE }),
  d   => agent(CONTEXT_CONTRACT + buildPrompt(d),     { label: `build:${d.id}`,   phase: 'Build',  schema: LEDGER_ROW }),
  row => agent(CONTEXT_CONTRACT + deepenPrompt(row),  { label: `deepen:${row.id}`,phase: 'Deepen', schema: LEDGER_ROW }),
  row => agent(CONTEXT_CONTRACT + verifyPrompt(row),  { label: `verify:${row.id}`,phase: 'Verify', schema: VERDICT }),
);
```

- **Data** authors the surface's layered, drill-down-capable sample-data module (Step 3) FIRST — porting the reference's `data-<surface>` where one exists — so the build composes against real data, never placeholders.
- **Build** renders the bespoke surface from that data to the manifest's bar (no generic content renderer).
- **Deepen** adds the spec's SPECIFIC named sub-features, each sub-tab's distinct content, and the secondary states — the work that's always the casualty when build and depth share one agent.
- **Verify** adversarially grades fidelity + depth against the **manifest** (every count present?) and screenshots.

Where `CONTEXT_CONTRACT` is the five-point contract above, embedded in *every* prompt so each agent re-loads the full context (specs + HIG + design-craft) rather than trusting a summary, and `*Prompt(...)` interpolates that surface's manifest row. Each write-stage persists files to disk, so a drop in a later stage keeps the earlier work — see the resume note below.

**Barrier only when a shared change must land first.** If the surfaces need a new shared element/composite/token, build that in a first `parallel`/single stage, let it land, then fan out the surfaces against it — otherwise N agents invent N variants of the same primitive.

**Map agents to FILES, not surfaces, when several surfaces share a file.** Concurrent agents that edit the *same file* clobber each other — the fan-out unit must be **disjoint files**, not logical surfaces. If one file holds six surfaces, one agent owns that file and deepens all six; never spawn six agents at one file. (Worktree isolation is the alternative, but merging N worktrees that all touch shared files is worse than just partitioning by file.)

**Agents report shared-file changes; the lead applies them centrally.** Some edits are intrinsically shared — a shell registry (`OWNS_SIDEBAR`), the design tokens, the catalogue, the `interact.mjs` harness. Do **not** let fan-out agents edit them (that's the collision the barrier exists to prevent). Instead: each agent edits **only its own file** and **returns** the shared change it needs (e.g. `ownsSidebarIds: ['finance','crm']`) in its structured output; the lead collects them and makes the **one** central edit afterward. This is the practical realization of the barrier rule for *post-hoc* shared changes (where you can't know the change until the agents have done their analysis) — and it's how you safely give agents a shell concern (like "make this surface own its sidebar") without 12 of them racing on `AppShell`/`Chrome`.

**Verify centrally, and expect transient agent drops.** Don't trust per-agent self-verification of a shared artifact (an agent can't run the project build without racing every other agent, and a green self-report isn't a green project). Run the real gates — `build-storybook` → `interact.mjs` (zero console errors across *all* stories + targeted assertions) → wall → screenshot — **centrally, after** the fan-out. Heavy agents also **drop on transient API errors** ("connection closed mid-response") — design so a dropped agent is recoverable. There's a real tension here with the decomposed pipeline above: more stages = more depth per surface, but also more agents that can drop. Resolve it in depth's favour — **each write-stage (Data, Build, Deepen) persists files to disk the moment it finishes, so a drop in a later stage does NOT lose the earlier work** (unlike a dropped *review/verify* stage, which only loses a verdict you can re-run). So decompose for depth, keep the verify/review stage last and side-effect-free, and **resume** (`resumeFromRunId`) to re-run only the dropped agents. (This supersedes the older "collapse to a single write-stage" guidance: that optimised resilience at depth's expense; decomposition + per-stage persistence + resume gives you both.) The central gates are what actually certify the result, so a few drops cost nothing if the gates pass.

**Repairing the interaction harness is its own one-agent, browser-driven job.** After a structural change (e.g. content tabs became sidebar rail rows), `interact.mjs` assertions go stale *en masse* — and the correct new text is only discoverable by *driving the built stories*, not by guessing substrings. Hand it to ONE agent with a browser that empirically finds the new labels/content and rewrites the assertions to green; it's the sole editor of that shared file (no collision). Note the mechanical shift: a `role=tab` content-tab assertion (`tabChanges`) becomes a rail-row detail click (`detailChanges`) when a surface converts to owning its sidebar.

**Applying a cross-cutting SYSTEM (nav model, state taxonomy, a shape convention): codify → primitives → fan out → reconcile.** When you discover an inconsistency that spans many surfaces (e.g. the same nav job built five different ways), do NOT fix it surface-by-surface. (1) **Codify** the rule in the DESIGN.md (the system doc the agents will read) so there's one authority. (2) **Add the shared primitives the rule names** (an underline `ContainerTabs`, a `Breadcrumb`, a state composite) CENTRALLY first — a barrier — because fan-out agents can't edit shared files and every surface needs the primitive to exist. (3) **Fan out** the conformance per disjoint file, each agent reading the codified rule + applying it with the now-existing primitives, reporting any shared change it still needs. (4) **Reconcile**: rebuild, repair the harness, screenshot the signature cases, gate. Driving from the system doc (not ad-hoc per screen) is what makes the result consistent rather than a fresh set of one-offs.

**Loop-until-dry on gaps.** After a round, read the ledger; re-spawn agents for every row that is not `✅ dense` + verified, until two consecutive rounds surface nothing new. Simple "build each once" misses the tail — the tail is exactly where consideration usually drops.

**A completeness-critic stage.** End with one agent whose only job is to diff the ledger against the registry and the spec catalogue and answer: *which surface is missing, which state is absent where the flow can reach it, which fidelity claim is unverified, which spec was never read?* Its findings become the next round's work. Don't let "covered everything" mean "listed everything."

## Reconcile, then gate

After the fan-out, one synthesis pass:
- proves **100% coverage** — every registry/catalogue id has a ledger row, every row is green, every spec source is filled;
- runs the **whole-project gates** end to end (build → interaction harness with a per-surface assertion → screenshot wall), not just the surfaces that changed;
- updates the ledger's `Verified` column to the real result.

Coverage is a claim; the ledger + the green gates are the evidence. If a cap was hit (top-N, sampling, no-retry), say so in the ledger — silent truncation reads as "done" when it isn't.
