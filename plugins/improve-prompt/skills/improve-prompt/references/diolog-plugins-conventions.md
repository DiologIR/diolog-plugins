# diolog-plugins house conventions

Read this when improving a skill that lives in the diolog-plugins repo (or any repo following its style). These are the established idioms — respect them when rewriting, and use the known-weaknesses list as a targeted diagnostic. Surveyed July 2026 across 37 skills in 28 plugins.

## Established idioms (preserve these)

- **Frontmatter**: `name` + `description` only. No `version`, `license`, or `metadata` in SKILL.md — semver lives in the plugin's `.claude-plugin/plugin.json` and its mirrored entry in the repo-root `.claude-plugin/marketplace.json`. When you edit a skill, bump plugin.json AND sync the marketplace entry.
- **Trigger-burst descriptions**: house style is long descriptions that state what the skill does, then enumerate verbatim user phrasings ("plan DIO-1234", "macosify this"), and often a "use THIS not that" disambiguation against sibling skills. Keep the coverage; fix the readability (see weaknesses).
- **Two body archetypes**:
  1. *Persona*: identity paragraph (often a `<role>` XML block, sometimes `<objectives>`/`<hard_rules>`) → "When to activate / Do NOT activate" → numbered operating protocol.
  2. *Workflow/pipeline*: Inputs → Setup → ordered Phases (none skippable) → Finalize, ending the final message with a terminal status token (`READY`, `NEEDS IMPROVEMENT`, `NEEDS WORK`, `NEEDS TRIAGE`) as a machine-readable handoff between pipeline stages. Never remove the status-token contract — downstream stages parse it.
- **Section ordering**: H1 → identity/role → when-to-use (+ when-not) → inputs → numbered procedure → hard rules → delivery format.
- **Bundled files**: per-skill `references/<file>.md` loaded lazily via a routing table ("load only the one you need" — create-luke-content is the exemplar), or plugin-level `shared/` addressed as `${CLAUDE_PLUGIN_ROOT}/shared/…` when multiple skills in one plugin consume the same asset.
- **Deterministic gates**: voice/content skills run bundled Python lints (`voice_lint.py`) that hard-fail on em dashes and AI-cliché phrases — framed as "so 'I checked' actually means checked". Preserve and never soften these gates.
- **Pipeline safety triad**: workflow skills cap fan-out at ≤4 concurrent agents, retry transient failures, prefer plain-text agent returns.
- **Local-branch convention**: worker skills commit locally in `.worktrees/<ID>` on `ai/<id>`, never push or open PRs; stage only touched files, never `git add .`.
- **De-Diolog'd twins**: some plugins exist in a Diolog-specific form (linear-issue-pipeline) and a generalized form (feature-spec-pipeline). Generic skills show Diolog as a worked example but instruct "for any target repo, substitute its load-bearing rules". Don't re-specialize a deliberately generalized skill.

## Known weaknesses (targeted diagnostics)

Check for these first — they are the repo's recurring failure modes:

1. **Description bloat**: several descriptions run 1,700–2,600 characters as single run-on sentences. Tighten into short sentences without dropping trigger phrases or disambiguations.
2. **Missing "Do NOT use" scope**: only ~5 skills declare negative scope. Trigger-heavy skills without a NOT-clause collide with siblings; add one whenever a neighbouring skill could catch the same query.
3. **Bloated single files**: skills holding 200–430 lines inline with zero references/ are progressive-disclosure candidates — split stable domain material into routed reference files.
4. **Verbatim duplicated blocks**: the fan-out safety triad and "production code only / no mocks/stubs/fallbacks" blocks are copy-pasted across the pipeline skills. When improving one of these, note the duplication; if asked to fix the family, extract to a shared reference rather than editing N copies.
5. **Frontmatter key drift**: both `allowed-tools:` and `tools:` appear in the repo, and several skills have an *empty* `allowed-tools:` list (likely an unintended blank grant). Normalize to `allowed-tools` with an explicit list, or remove the key entirely.
6. **Stale hardcoded facts**: model names baked into prose ("executed by Claude Opus 4.7") and Diolog-repo specifics (`pnpm graphql:codegen`, `origin/staging`) inside supposedly generic skills. Replace with capability-relative language ("the session's model") or "discover from the target repo" instructions.
7. **Prose-only deliverables**: strategy/persona skills that describe their output without a copyable fenced skeleton. The strongest skills in the repo embed exact output templates — add one.

## Exemplars to emulate when rewriting

- **create-luke-content** — 87-line body, routing table to 8 references, deterministic lint gate, sibling disambiguation.
- **mockup-fidelity** — names the self-deceptions the skill defeats and inverts the burden of proof (explains *why* each rule exists).
- **doc-summarizer / design-md-from-screenshots** — explicit "Do NOT activate for…" and measurable targets ("60–80% compression", "<1,500 words") instead of adjectives.
- **design-craft** — reason-per-rule style: each rule leads with the right move, trailing clause names the failure it prevents.
- **gap-fix / triage** — phase discipline, terminal status contract, exact output template.
