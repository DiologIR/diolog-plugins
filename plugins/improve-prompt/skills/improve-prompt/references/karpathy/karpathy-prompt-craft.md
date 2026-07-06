# Karpathy Prompt Craft: The Guidelines as a Model of How to Write Rules

`karpathy-guidelines.md` is bundled for its *content* (the four behavioural principles). This file mines it for its *form* — the karpathy CLAUDE.md is one of the best-written short prompts in circulation, and the moves that make it work are reusable in any prompt you rewrite. Use this file two ways: as a **style model when writing or rewriting rules** in any artifact, and as the source of the **reusable hardening block** to merge into agent/coding prompts.

## 1. The seven craft moves (steal these when rewriting any prompt)

Read `karpathy-guidelines.md` side-by-side with this list — every move is visible in under 70 lines:

1. **Tradeoff statement up front.** *"These guidelines bias toward caution over speed. For trivial tasks, use judgment."* One sentence names the cost of following the rules and grants an escape hatch — so the model doesn't apply full rigor to a typo fix. Most rule files fail by implying their rules are free and universal. When a prompt you're improving has rules with real costs (latency, verbosity, caution), add the tradeoff sentence.
2. **Principle anatomy: name → bold directive → checkable bullets → self-test.** Each section is a memorable *name* ("Surgical Changes"), a one-line bold *directive* ("Touch only what you must. Clean up only your own mess."), then 3–5 bullets, then a closing *test*. The name makes it citable, the directive makes it memorable, the bullets make it executable, the test makes it self-policing. Rewrite shapeless rule paragraphs into this anatomy.
3. **Rules as observable behaviours, not adjectives.** Never "keep it simple" — instead "No abstractions for single-use code", "No error handling for impossible scenarios", "If you write 200 lines and it could be 50, rewrite it." Each bullet is checkable against a diff. When a prompt says "be thorough / professional / careful", ask: what observable behaviour would prove it? Write that instead.
4. **Self-tests the model can run on its own output.** *"Would a senior engineer say this is overcomplicated?"* · *"Every changed line should trace directly to the user's request."* A test converts a rule from something the model was told into something it can check before finishing. High-value addition to any prompt whose failure mode is drift.
5. **Imperative → verifiable transforms, shown as a table.** *"Add validation" → "Write tests for invalid inputs, then make them pass."* The prompt doesn't just say "define success criteria" — it demonstrates the transform on three real inputs. When a prompt gives the model open-ended tasks, add 2–3 worked transforms in its own domain.
6. **Ownership-scoped cleanup.** *"Remove imports YOUR changes made unused; don't remove pre-existing dead code unless asked."* The rule distinguishes the model's mess from the world's mess — precision that prevents both under- and over-cleanup. Reuse the pattern anywhere a prompt needs "fix X but don't touch Y": scope by causation, not by list.
7. **"Working if" — the prompt defines its own eval.** The file ends with observable success signals: *fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, clarifying questions before implementation rather than after mistakes.* A prompt that states what success looks like in the world gives its owner a way to measure it and the model a target to generalize toward. Add a working-if line to system prompts and rule files you rewrite.

## 2. Cross-surface reuse: write hardening once, wrap it per surface

The karpathy repo ships the *same* principle text on three surfaces, and the deltas are instructive:

| Surface | File | What changes | What never changes |
| --- | --- | --- | --- |
| Claude Code skill | `skills/karpathy-guidelines/SKILL.md` | Adds YAML frontmatter: third-person `description` with trigger conditions ("Use when writing, reviewing, or refactoring code…") | The four principle blocks |
| Project rules file | `CLAUDE.md` | Adds one merge line ("Merge with project-specific instructions as needed"); no frontmatter — always-on | The four principle blocks |
| Cursor rule | `.cursor/rules/*.mdc` | Rule metadata (`alwaysApply: true`) instead of trigger description | The four principle blocks |

The lesson for any multi-surface prompt estate (and for this repo's plugins): **keep one canonical, surface-neutral principle text; port by wrapping (frontmatter, triggers, metadata), never by rewriting.** When you find near-duplicate rule text drifting across a skill + a CLAUDE.md + an agent prompt, that's a finding — consolidate to one canonical block and reference or copy it verbatim, and note (as the repo's CURSOR.md does) which copies must be kept in sync.

## 3. The reusable hardening block

When an artifact drives agentic/coding behaviour and lacks behaviour-under-ambiguity discipline, prefer merging this condensed block (or the full `karpathy-guidelines.md` text) over authoring bespoke rules — it's battle-tested, and bespoke rewordings of it drift:

```markdown
**Tradeoff:** these rules bias toward caution over speed; for trivial tasks, use judgment.

- **Think before acting.** State assumptions explicitly; if multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. If confused, stop and ask.
- **Simplicity first.** Minimum change that solves the problem. No speculative features, abstractions, configurability, or impossible-case handling. Test: would a senior reviewer call this overcomplicated?
- **Surgical changes.** Don't "improve" adjacent code/content; match existing style; mention unrelated problems instead of fixing them. Clean up only orphans your own change created. Test: every changed line traces to the request.
- **Goal-driven execution.** Transform the task into verifiable success criteria before starting ("fix the bug" → "a test reproducing it passes; the suite stays green") and loop until verified.
```

**When to merge it:** agent instructions, coding assistants, CLAUDE.md files, multi-step autonomous skills — anything that edits someone else's artifacts or acts with autonomy.
**When not to:** single-shot classifiers, extraction/summarization templates, latency-critical high-volume prompts — there the block is dead weight (Simplicity First applies to the block itself).

## 4. Application checklist (run during Step 2 diagnosis on ANY artifact)

Beyond the behavioural checks in SKILL.md (assumption handling, scope discipline, verifiable criteria), check the artifact's rules *as writing*:

- [ ] Rules with real costs carry a **tradeoff/judgment clause** — or does the prompt demand full rigor for trivial cases?
- [ ] Each rule is an **observable behaviour** — or an adjective ("be careful", "high quality") the model can't check?
- [ ] Rule clusters end in a **self-test** the model can run on its own output before finishing?
- [ ] Open-ended tasks come with **worked imperative→verifiable transforms** in the prompt's own domain?
- [ ] Cleanup/scope rules are **ownership-scoped** (your mess vs pre-existing) rather than blanket?
- [ ] The prompt states **"working if" signals** its owner could actually observe?
- [ ] Rule text duplicated across surfaces has **one canonical copy** and a sync note?

Each unchecked box is a candidate finding; cite this file as the principle. When rewriting to fix one, use the anatomy from §1 — name, bold directive, checkable bullets, self-test — rather than adding another paragraph of prose.
