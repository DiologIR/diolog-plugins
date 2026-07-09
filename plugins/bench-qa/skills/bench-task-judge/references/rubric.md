# The task-judge rubric: checks, thresholds, and decision tables

This file is the canonical rubric. Every check is binary and every claim needs a
file:line citation, because the judge's output feeds mechanical decision tables — an
uncited or hedged finding cannot be acted on and must be dropped. The thresholds and
tables were calibrated against the manual review in
`docs/internal/TASK-REVIEW-2026-07-09.md` (174 tasks); when in doubt, match what that
review did.

## 1. Stats bands (deterministic — compute, never estimate)

Over decided runs only (`status IN ('passed','failed')`; error/unscored/timeout are
non-results and never count):

| band | condition | immediate implication |
|---|---|---|
| saturated | p >= 0.95 OR haiku_p >= 0.75, with n >= 8 | no ranking signal; RETIRE unless the skill is unique (then SCALE-UP) or judged-score still spreads (ui/optimality: KEEP-AS-JUDGED / HARDEN-BRIEF) |
| false-floor suspect | p <= 0.05 with n >= 8 | per the corpus method guard: almost always an over-fit or all-or-nothing verifier, NOT difficulty. Requires stages 3-4 before any verdict |
| discriminating | strong_p in 0.2-0.8 with visible spread over haiku_p | the target band; default KEEP |
| under-sampled | n < 8 overall, or a per-model cell built on < 3 runs | suppress per-model claims; verdict deferred, output "collect >= N runs" instead. Isolated haiku=1.0 or inverted-strong cells on 1-2 runs are noise — the 2026-07-09 review hit this repeatedly |

Key definitions: `p` = pass rate over all decided runs; `haiku_p` = Haiku's; `strong_p`
= pooled Opus + GPT-5.5; `mean_score` = mean graded score (partial credit).

**The single most diagnostic pattern:** `p <= 0.05` while `mean_score >= 0.4` means
models pass most assertions but a single verifier group ANDs them to zero — an
all-or-nothing conjunction defect, fixed by splitting groups, NOT by rewriting
assertions. Two thirds of the 2026-07-09 FIX-VERIFIER band was exactly this.

**The inversion tell:** haiku_p > strong_p on adequate samples is the hallmark of an
over-fit verifier — strong models make independent (correct, defensive) choices that the
verifier's choreography rejects, while weak models transcribe the obvious shape. Example:
`bff-trusted-ip-forwarding` (haiku 0.5, strong 0.2) byte-surgeried an assumed header
layout the prompt never pinned.

## 2. Static rubric (binary checks; cite file:line for every hit)

### 2a. The five measured over-fit traps (ranked by recurrence in the last cross-family audit)

1. **Array/sequence order** (28/29 tasks last audit): `toEqual`/`deepEqual` on an ordered
   list the instruction never orders. Legal only if instruction.md states the order.
2. **Tenancy/behaviour asserted via query/code TEXT** (22/29): regex or string-match on
   SQL orientation, filter spelling, or wire format instead of observable behaviour.
   Legal only if the prompt pins that exact shape (some tasks legitimately do — e.g.
   `mongoose-repository` mandates the filter fields; `search-index-bulk-upsert` pins the
   NDJSON fields).
3. **Exact error-message text** (20/29): `toThrow('some wording')` where instruction.md
   names only the error type/behaviour. The native-error contradiction is worse: prompt
   says "real errors from X" while the verifier pins a hand-written string.
4. **Stub not genuinely broken / hint comments** (17/29): fixture passes tests it should
   fail, `// BUG:` comments, or bundled solved test files that hand over the answer.
5. **Whole-object deepEqual with incidental keys** (14/29): an extra `createdAt` fails a
   correct solution. Use `toMatchObject`-style checks unless the prompt pins the shape.

Plus: exact hashes/encodings not fully pinned; unstated enums/status strings/magic
sentinels. The worst single instance found so far: a verifier asserting a private
reference-only sentinel string (`versions.disclosures` in
`diolog-investor-activity-selectors`) — no solver can pass without reading the reference.

### 2b. Contract parity (both directions)

- Everything the verifier asserts must be stated in instruction.md (exact strings,
  counts, formats, field names, skip/blocked codes).
- Everything instruction.md promises must be asserted somewhere.
- A paraphrase is NOT parity: "throws when the company has no ticker" does not license
  `toThrow('ticker is required')`.

### 2c. Structure and scale (deterministic measurements)

- Verifier groups: count `[[scoring.verifier_groups]]` in task.toml and `it(`/`test(`
  blocks per group. **>= 20 assertions in ONE group = conjunction smell** — flag for
  splitting regardless of current pass rate.
- Fixture surface: file count + LOC. Scale is the measured difficulty lever; a
  single-function fixture cannot be frontier no matter how clever.
- Instruction length: > ~2,500 chars is spec-transcription smell (DeepSWE averages
  ~2,158; this corpus once averaged 5,065 and the audit called it out).
- Regression guard present? Property tests invariant-based and seeded?

### 2d. Fit and hygiene

- Realism: mechanism matches the real dAIolog surface (Mongo aggregation, not a SQL AST;
  BFF route, not direct backend calls).
- Redundancy: name any sibling task testing the same skill (the ui set had 5 mergeable
  duplicates).
- Memorisation: OSS import whose solution patch is public = contamination risk; canary
  marker present; no em/en dashes in prompt files.

### 2e. ui (judged) tasks — swap in this checklist

- Brief states SPECIFIC checkable requirements (sections, copy, data values, states,
  tokens), not generic aesthetics.
- Reference image present (fidelity anchor); behavioural gate present (jsdom/vitest) —
  a build-only gate is the weakest shape (`two-factor-setup` was the example).
- Every state the verifier exercises is CAPTURED for the judge (multi-state
  `[scoring.render]`), else the judge grades a default screenshot of features it can't
  see. Core requirements that are interactive-only and uncaptured: flag.
- Deck tasks: slides render declared; slide count/structure/content pinned.
- Saturation nuance: gate saturating (haiku passes) is tolerable IF the judge mean still
  spreads — verdict KEEP-MINOR with "re-anchor the judge" rather than RETIRE. The
  re-anchoring mechanism is **reference-anchored comparison** (one judge call per
  artifact vs the task's fixed reference image on a binary checklist — linear cost).
  Never recommend O(n²) pairwise Elo: owner decision, too costly to run.

## 3. Mutation harness (proof, not opinion)

Mutate a COPY of `reference/`, one mutation at a time; re-run every verifier group per
mutant. A mutant that still satisfies the written instruction but FAILS a group proves
that group over-fit — this overrides any stage-2 opinion in either direction.

| id | mutation | proves |
|---|---|---|
| M1 | permute an unordered array the reference returns | order-pinning |
| M2 | reword every thrown error message (keep class/name/fields) | unstated exact-message assertions |
| M3 | add one incidental key to returned objects | whole-object deepEqual |
| M4 | rewrite one query/filter/wire format in an equivalent shape | choreography pinning |

Discard a mutant that breaks real behaviour (fails checks the prompt DOES pin) — retry
once, then skip that mutation. Until `pnpm task:mutate` exists, do this by hand in a temp
dir: copy fixture + overlay mutated reference + run each group's `test_command`.

## 4. Replay (false-floor tasks only; zero model spend)

For each saved solution in `results/runs/<taskId>__*/generated/`, overlay onto a fresh
fixture copy and run every verifier group in isolation. Outputs that matter:
- **Universal-fail group(s)**: every model fails the same group → that group is either
  over-fit (check against stages 2-3) or the single genuinely-hard behaviour.
- Per-solution failing assertions: read 2-3 strong-model solutions' failures and classify
  each as genuine bug vs correct-but-different implementation.
`pnpm rescore` (without `--write`) is the existing machinery closest to this.

## 5. Verdict decision table (pattern-match; do not invent)

| evidence | verdict |
|---|---|
| saturated + skill covered elsewhere | RETIRE |
| saturated + unique skill worth deepening | SCALE-UP |
| saturated gate + judged score still spreads (ui/optimality) | KEEP-AS-JUDGED or HARDEN-BRIEF (+ pairwise) |
| discriminating + no findings | KEEP |
| discriminating + small verifier-side fix or additive case | KEEP-MINOR |
| proven over-fit (mutation kill or cited trap) at any band | FIX-VERIFIER |
| false-floor + mean_score >= 0.4 + single group | FIX-VERIFIER (split groups) |
| false-floor + no trap found + replay shows genuine failures | AUDIT (genuine hardness: keep as ceiling probe or scope down) |
| verifier asserts something instruction.md doesn't state, best fixed in the prompt | TIGHTEN-PROMPT |
| duplicate of a stronger sibling | MERGE |
| under-sampled | defer: "collect N runs" |

## 6. Re-run policy (what the fix costs)

What changed determines whether run history survives:

| change | history | action |
|---|---|---|
| verifier-only (relax assertion, split groups) | VALID — same prompt, same fixture | `pnpm rescore --write` replays saved solutions; zero model spend |
| instruction.md (contract) | INVALID for that task | re-run the task; bump task version |
| fixture | INVALID | re-run; bump version |
| SCALE-UP / HARDEN-BRIEF result | it is a NEW task | fresh runs under a new version; never mix rows |
| RETIRE / MERGE | keep rows for provenance | exclude from bench universe |

Prefer the verifier-side fix wherever both options exist, precisely because it preserves
history. Sequence corpus-wide work as: all verifier fixes → ONE rescore sweep (back up
the store first; `rescore --write` does not update `data` blobs or
`results/runs/*/record.json`, so a later `db:import` resurrects pre-rescore scores — sync
or re-rescore after any import) → re-run only prompt-changed tasks → `pnpm calibrate
--write` → regenerate the site.

## 7. review.json output shape

Write to `tasks/<dimension>/<taskId>/review.json`. **Emit the canonical shape below
EXACTLY — every enum value verbatim, no invented variants.** The harness schema
(`packages/harness/src/tasks/review-schema.ts`) ingests leniently because the first
implementation pass proved that 30+ parallel agents WILL drift (it produced
`AUDIT->SPLIT`, `rerun+version-bump`, `side: "scoring"`, verdicts nested under a
`reviewRow` key — and the strict reader skipped all 61 files). Lenient ingest is the
safety net, not permission: a review that needs normalising is a review that may be
misread. Canonical vocabularies: verdict = the §5 table values only (one word, no
arrows); rerun = `none | rescore | rerun | new-version` (a version bump is implied by
`new-version`, never appended to `rerun`); side = `verifier | instruction | fixture |
reference | task-toml | none`; band = the §1 table values only.

```jsonc
{
  "taskId": "...", "date": "YYYY-MM-DD", "reviewerModel": "...",
  "stats": { "n": 0, "p": 0, "haikuP": 0, "strongP": 0, "meanScore": 0, "band": "..." },
  "staticFindings": [ {"check": "exact-error-text", "file": "verifier/src/x.spec.ts", "line": 733, "evidence": "..."} ],
  "mutations": [ {"id": "M2", "result": "FAIL", "group": "service", "assertion": "..."} ],
  "replay": { "universalFailGroups": [], "solutionsReplayed": 0 },
  "verdict": "FIX-VERIFIER",
  "changes": [ {"side": "verifier", "description": "split into N groups: ..."} ],
  "rerun": "rescore"
}
```

`rerun` ∈ `none | rescore | rerun | new-version`. `side` ∈ `verifier | prompt | fixture |
meta`. Also append a human-readable block (the TASK-REVIEW table-row format) to your
final report.
