# Orchestration & the coverage ledger — equal consideration at scale

A storyboard that covers many surfaces fails in a predictable way: the first few screens are dense and considered, and the long tail quietly degrades into stubs. The cause is **uneven attention** — each surface was built in a different context window, against a different slice of the spec, with the reviewer's energy decaying as the list grew. This reference fixes that with two instruments: a **coverage ledger** (the single source of truth for what's done and how well) and **workflow orchestration** (so every surface is built and reviewed by an agent carrying the *same* full context and held to the *same* bar).

Reach for this whenever coverage is more than a handful of screens — a whole project, a broad surface catalogue, or a sweep across an existing storyboard. For one or two screens, build inline; the ledger is overkill.

## The coverage ledger — the single source of truth

Before building, write a ledger file at the storyboard root (e.g. `COVERAGE-LEDGER.md`). It has **one row per surface/screen**, and nothing is "done" until its row is green. The ledger is what guarantees equal consideration: it makes every surface visible at once, so the 50th gets the same scrutiny as the 1st.

```
| Surface | Spec source(s) | Shell class | States (H/E/L/Er/AI) | Fidelity | Verified | Gaps / notes |
|---------|---------------|-------------|----------------------|----------|----------|--------------|
| inbox   | specs/inbox.md, mock view-inbox.jsx | A (owns sidebar) | H E L Er — | ✅ dense | build+interact+shot | — |
| logs    | specs/logs.md, mock view-logs.jsx   | C (generic)      | H · L Er AI | 🟡 thin  | build only | metrics tab is 3 stubs → populate |
```

Columns:
- **Spec source(s)** — every md/spec/mock that governs this surface (see the context contract). If a cell is empty, the surface was built blind — that is itself a gap.
- **Shell class** — only when the storyboard has a shell (see `interaction-and-shell.md`): A (owns the middle sidebar) / B (keep generic, real scopes) / C (not a list). Omit for shell-less storyboards.
- **States** — which of Happy/Empty/Loading/Error/AI genuinely apply and are implemented. A dash means "not applicable," not "skipped" — be honest about the difference.
- **Fidelity** — ✅ dense (passes the Looks-real checklist) / 🟡 thin (renders but under-built) / ❌ stub. A 🟡 or ❌ is an open gap.
- **Verified** — the strongest check that has actually run for this row: `build` < `render` < `interact` < `shot` (screenshot eyeballed). "It compiled" is the weakest claim; aim for `shot`.
- **Gaps / notes** — the specific next action. "thin" with no note is not actionable.

Keep the ledger current as the single artifact a reviewer (human or the reconcile pass) reads to know the true state. **A surface is only finished when its row is `✅ dense` + `shot` + no gaps.**

## The per-agent context contract (non-negotiable)

The whole point is that every agent builds with the *same* full context the lead would. When you spawn an agent for a surface (or a flow, or a review), its prompt MUST require all of the following **before it writes a line of UI** — paste the contract verbatim into each agent prompt so none of them shortcut it:

1. **Read the whole project doc/spec tree, not just this surface's file.** A surface is shaped by decisions made elsewhere — shared conventions, sibling surfaces, the product's honesty grammar, cross-surface workflows. List every spec/md up front (`find … -name '*.md'`) and read the relevant ones in full; at minimum the master catalogue, this surface's spec, the mock of record, and any sibling/shared spec it references. A skim under-builds.
2. **Read the full HIG backbone.** `index.md` first, then every component file relevant to the surface's grammar (master–detail → `split-views` + `sidebars` + `lists-and-tables` + `toolbars`; a form → `text-fields` + `pickers` + `toggles`; etc.), and always the foundation files: `layout`, `accessibility`, `feedback`, `motion`, `writing`, `progress-and-status-indicators`. Take behaviour/structure/accessibility from it, not the macOS look.
3. **Invoke the `design-craft` skill** and run its polish / hierarchy-rhythm / ai-slop / accessibility passes on what it builds — and **measure computed styles in a browser** to match the reference's density, never inferring from tokens.
4. **Build from the shared design system** (tokens → elements → composites/parts), at the fidelity bar (Step 3's Looks-real checklist), reusing the established primitives — never a parallel look or one-off inline styles.
5. **Update its ledger row** with the truth: states covered, fidelity, the verification it actually ran, and any remaining gap.

An agent that skips 1–3 produces exactly the thin, off-brand, context-blind screen this whole approach exists to prevent. Make the contract a hard gate in the prompt, not a suggestion.

## Workflow shapes

Use the `Workflow` tool (deterministic fan-out with a shared concurrency cap) once you have the surface list. Scout inline first to discover the list (read the registry / catalogue / spec index), then pipeline over it.

**Default — pipeline per surface (no barrier).** Each surface flows through its stages independently; the fast ones don't wait on the slow ones.

```
const surfaces = /* discovered from the registry/catalogue */;
const results = await pipeline(
  surfaces,
  s => agent(CONTEXT_CONTRACT + buildPrompt(s),  { label: `build:${s.id}`,  phase: 'Build',  schema: LEDGER_ROW }),
  row => agent(CONTEXT_CONTRACT + verifyPrompt(row), { label: `verify:${row.id}`, phase: 'Verify', schema: VERDICT }),
);
```

Where `CONTEXT_CONTRACT` is the five-point contract above, embedded in *every* prompt so each agent re-loads the full context (specs + HIG + design-craft) rather than trusting a summary.

**Barrier only when a shared change must land first.** If the surfaces need a new shared element/composite/token, build that in a first `parallel`/single stage, let it land, then fan out the surfaces against it — otherwise N agents invent N variants of the same primitive.

**Loop-until-dry on gaps.** After a round, read the ledger; re-spawn agents for every row that is not `✅ dense` + verified, until two consecutive rounds surface nothing new. Simple "build each once" misses the tail — the tail is exactly where consideration usually drops.

**A completeness-critic stage.** End with one agent whose only job is to diff the ledger against the registry and the spec catalogue and answer: *which surface is missing, which state is absent where the flow can reach it, which fidelity claim is unverified, which spec was never read?* Its findings become the next round's work. Don't let "covered everything" mean "listed everything."

## Reconcile, then gate

After the fan-out, one synthesis pass:
- proves **100% coverage** — every registry/catalogue id has a ledger row, every row is green, every spec source is filled;
- runs the **whole-project gates** end to end (build → interaction harness with a per-surface assertion → screenshot wall), not just the surfaces that changed;
- updates the ledger's `Verified` column to the real result.

Coverage is a claim; the ledger + the green gates are the evidence. If a cap was hit (top-N, sampling, no-retry), say so in the ledger — silent truncation reads as "done" when it isn't.
