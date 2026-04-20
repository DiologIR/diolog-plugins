# Doc Summarizer

A Claude Code plugin that transforms verbose source documents — READMEs, API docs, research papers, technical guides, library docs — into maximally dense, semantically complete reference material, and writes the compressed output to a **`.summary.md`** file that another LLM (or a human skimmer) can consume in a fraction of the tokens.

Tuned for Claude Opus 4.7. Ships as a single skill, `doc-summarizer`.

## What it does

Given a document (a path, a URL, or pasted text), the skill produces a compressed Markdown file with:

1. A one-line completeness marker and compression-ratio header.
2. A **Critical Findings** / front-loaded-risk block — security warnings, breaking changes, data-loss risks surfaced to the top.
3. A **hierarchical body** (3+ levels where the content supports it) organised by concept, not by source-document order, with every item tagged by utility tier:
   - `[CRITICAL]` — must-know risks and mandatory setup
   - `[WORKFLOW]` — named procedures rendered as `START → step1 → step2 → OUTCOME`
   - `[POWER-USER]` — advanced / undocumented features
   - `[GOLDEN-NUGGET]` — non-obvious, high-impact tips (quantified where possible)
   - `[DEPRECATED]` — phase-out items with a migration path
4. A **Strategic Synthesis** footer with three tables — a Maturity Model, a Feature Selection Matrix, and a Workflow Progression Ladder — so a downstream consumer can see at a glance *which feature to use for which goal*.

Target compression: ~60–80% token reduction while preserving 100% of semantically unique information.

## Why it works

- **Triage before compression.** Every fact is classified by utility tier *before* it's compressed, so high-signal items (security warnings, performance wins) are never lost to the cutting-room floor.
- **Contextual integration, not segregated tips.** Golden-nuggets sit *inside* the feature they enhance, not in a trailing "Best Practices" appendix — which is where tips go to die.
- **Solution-first for problems.** Errors and gotchas are always emitted as `PROBLEM → SOLUTION → RESULT`, never as problem descriptions alone.
- **Multi-tier capture.** Features with more than one usage mode emit `BASIC` *and* `ADVANCED` with an explicit trade-off, so the reader understands the cost of each path.
- **Completeness verification.** Before writing the file, the skill enumerates every major source section and confirms each is represented. If anything is omitted, the completeness marker is withheld and the omission is stated explicitly.
- **Tuned for Opus 4.7.** XML-tagged instruction blocks, literal positive rules with explicit scope, no persona narration, no obsolete chunking thresholds. The prompt was migrated from a Claude 3.5-era persona into the Opus 4.7 instruction-following style.

## Installation

```text
/plugin marketplace add DiologIR/diolog-plugins
/plugin install doc-summarizer@diolog-plugins
```

## Example invocations

```text
Summarize ~/Downloads/stripe-api-v2024.md into a compressed reference.
```

```text
Read this README and give me a dense cheat-sheet another AI can load into context.
[attaches README.md]
```

```text
Compress this research paper to ~25% of its length — keep every finding.
https://arxiv.org/pdf/2401.12345.pdf
```

```text
I want the golden nuggets out of the Remotion docs — save it as docs/remotion-distilled.md.
```

## Output file naming

- **Default:** `<source-basename>.summary.md` in the same directory as the source.
- **Pasted text or URL with no obvious basename:** the skill asks for a path (suggesting a sensible default in the current working directory).
- **File would overwrite:** the skill asks before clobbering.

## What it won't do

- Reproduce full code blocks verbatim. Code is summarised as `CODE-BLOCK: purpose | PATTERN: one-line-pseudocode | OUTPUT: expected-result` — the exact command/syntax is preserved only when *it* is the actionable artifact (e.g. a CLI invocation).
- Emit a trailing `## Tips` or `## Best Practices` section. Tips are integrated contextually.
- Invent content to fill a Strategic Synthesis cell. Absent data is emitted as `—`.
- Silently drop a `[CRITICAL]` item to hit a compression target.

## License

MIT
