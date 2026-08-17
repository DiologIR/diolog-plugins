# ux-craft, calibrated for Gemini

Read this before Mode detection. Then follow the skill as written, with these
overrides. The canon in this skill transfers to Gemini unchanged — what does not
transfer is the assumption that a rule stated in prose will be executed. On this
family a rule needs a cell to fill and a number to report.

## Provenance

**[measured]** items come from one recorded Gemini run (`Egress Gemini`, 2026-08-17)
that invoked this skill plus `design-craft` on a rich brief for a two-platform CI
runner app, producing `~/Dev/egress/design/mocks/html/index.html`; a Claude run on a
near-identical brief produced `interaction-mock.html` beside it, and both were probed
with the same scripts. **n=1** — one honest data point, not a law. **[docs]** items
come from Google's published Gemini 3 prompting guidance and are the stronger
evidence.

**Two notes on using this file.** Google's prompt health checklist names *"conflicting
internal references"* as a defect — instructions the model must *"piece together …
from multiple different places"* — and a conditional side-file is that shape, so read
this in one pass before the skill rather than consulting it mid-build; each override
names the section it lands on. And if you control `thinking_level`, flow and state work
is what Google describes `HIGH` as being for (*"multi-step planning"*); Gemini 3.7
Flash defaults to `MEDIUM`.

## Naming the states was not enough

This is the finding that should change how you read the rest of the skill.

Build mode step 4 already says it, in the skill's own words: *"Design the states, not
the screen. For each screen: first-run/empty, loading, ideal, partial, error, done.
The mock is incomplete until all six exist — this is the single highest-leverage habit
from the whole canon."* Six states, named, with an explicit completeness condition.

**[measured]** The run delivered **one** state — the populated one — across all five
surfaces. Zero loading, zero empty, zero partial, zero error, zero done. The mock has
no `data-state`, no state attribute of any kind, and a 48-line script with three
functions, none of which changes a state. The Claude comparison built 5 states × 10
surfaces × 2 platforms and verified that no two states of a surface render the same
set of blocks.

So the enumeration existed and was still improvised away. **[docs]** Google's prompt
health checklist explains why, under **Ambiguity**: *"Avoid using subjective or relative
qualifiers that lack a concrete, measurable definition. Instead, provide objective
constraints (for example, 'write a summary of 3 sentences or less' instead of 'write a
brief summary')."* "The mock is incomplete until all six exist" is a completeness
condition with no count in it — a relative qualifier. `10 surfaces × 6 states = 60
cells` is an objective constraint. The verbosity default compounds it: these models
"provide direct and efficient answers" unless a fuller response is explicitly
requested, so a list inside a paragraph of guidance reads as context rather than as a
manifest. The nine-state matrix in `references/flows-and-forms.md` has the same
exposure.

**[docs]** And one pass is the wrong container for it anyway. The same checklist warns
against **Too many tasks** — *"several distinct cognitive actions in a single pass …
Break the requests into separate prompts"* — with chaining as the remedy. So build the
screens, then run a **states pass** across all of them, then a flows pass. Six states
authored while you are still deciding what the screen is will lose to the screen every
time.

### The override: the state matrix is an artifact, not an instruction

Write the grid into the deliverable before building any screen, one row per surface,
one column per state, every cell filled with either the state's real copy or
`n/a: <reason>`:

| Surface | first-run/empty | loading | ideal | partial | error | done |
|---|---|---|---|---|---|---|
| Runner pool | "No runners yet…" | skeleton rows | 4 registered | 1 offline, 3 claiming | backend unreachable | n/a: continuous |

Then at delivery, count the cells and report the fraction: *"48 of 50 cells built, 2
n/a with reasons"*. An unfilled cell is visible; "all states designed" is not.

The same conversion applies to every other enumeration in this skill: the
non-negotiables (11 items), the four walkthrough questions per step, the checklists.
Each becomes a row with a verdict, not a paragraph you have read.

**Fill one row completely before you fill any other.** **[docs]** Google's strongest
stated lever is few-shot: *"We recommend to always include few-shot examples … you can
remove instructions from your prompt if your examples are clear enough in showing the
task at hand"*, and on output structure, *"show the output structure in your few-shot
examples"*. So author one surface's six states at full fidelity — real copy, real
skeleton geometry, the real error text — and treat that row as the exemplar the other
nine are measured against. A grid filled from a prose rule drifts by row four; a grid
filled from a worked first row does not.

## Unhappy paths are where this family stops

**[measured]** With one state built, the consequences follow mechanically:

- **Errors say what happened + how to fix it** — no error state exists anywhere, so
  the rule had nothing to grade.
- **Every interactive element has designed states** — `:focus-visible` **0**,
  `:focus` **0**, `:active` **0**, `:disabled` **0**; six `:hover` rules in the whole
  file.
- **Recognition over recall** — the pairing surface shows a 6-digit code and an ECDH
  fingerprint with nothing to compare either against, no expiry countdown, and no UI
  at all for the *receiving* side. The brief asked for four pairing directions
  (mac→win, win→mac, win→win, mac→mac); the artifact has one screen, and its primary
  button reads **"Simulate Pairing Complete"**.
- **Accessibility is a floor** — `aria-*` **0**, `role=` **0**, `tabindex` **0**,
  `prefers-reduced-motion` **0**, and **12 `<div onclick>`** carrying the entire
  navigation of both apps. Every nav item, on both platforms, is keyboard-dead.
  Measured contrast: every primary button 3.65:1, every selected sidebar row 3.65:1,
  a section header 3.37:1, one `+` glyph at **1.00:1** — invisible against its own
  background. The self-authored review claimed "100% pass rate".

**[docs]** Google's health checklist has a name for the shape of this whole class —
**Underspecified task**: *"Ensure that the prompt's instructions provide a clear path
for handling edge cases and unexpected inputs, and provide instructions for handling
missing data rather than assuming inserted data will always be present and
well-formed."* It is written about prompts, and it describes exactly a mock built on the
assumption that its data always arrives present and well-formed. The unhappy paths are
the edge-case path, and they are the part that has to be specified rather than inferred.

### The override

Treat the accessibility floor as a build step with a count, not a value. Before
delivery, grep your own artifact and report the numbers:

```
role=            <n>     tabindex        <n>     aria-label   <n>
:focus-visible   <n>     :active         <n>     :disabled    <n>
prefers-reduced-motion   <n>            <div onclick>  <n>  ← must be 0
```

A zero in any row that should be non-zero is the finding. This costs one command and
catches the whole class.

## Flows: a screen that mentions a flow is not a flow

**[measured]** Build mode step 3 asks for *"entry point → steps → completion signal →
recovery paths"* and *"Map every exit: back, cancel, abandon-and-resume."* The run
produced **zero** multi-step flows. Two places show the shape of the miss:

- **Pairing** is a single card with `Cancel` / `Simulate Pairing Complete`. No
  waiting-for-peer step, no code-mismatch branch, no success state, no inbound
  variant, no expiry. It is also a *nav destination* with a selected sidebar row —
  but a live, expiring out-of-band code is modal by nature, and both platforms have a
  modality for it (sheet, ContentDialog). Rendering it as a place is a structural
  choice that removes the flow's boundaries.
- **The onboarding wizard** renders a 4-step rail with step **2 "Runtime &
  Hypervisor"** highlighted while its body shows step **1**'s role selection — the
  indicator and the content disagree inside a single frame. Krug's trunk test fails
  on "where am I" without a user doing anything. And the wizard sits inside the app
  window with the sidebar behind it advertising "Runner Pool (2)", "Job Queue (3)"
  and a paired peer — a fully configured cluster behind the screen whose premise is
  that nothing is configured yet.

### The override

A flow is delivered as a **numbered step list with its exits, before any screen**, and
each step becomes a captured frame. Name the count: `pair-out (4 steps)`,
`onboarding (6 steps)`. Then assert the two consistency conditions that failed here:

1. The step indicator equals the rendered step. Check it per frame.
2. The chrome around a first-run flow reflects the first-run state, not the populated
   one. If the sidebar shows data the user cannot have yet, the flow is being shown
   over the wrong ground.

And never ship a control whose label describes the mock rather than the product.
"Simulate Pairing Complete" is the artifact admitting the flow is absent; the honest
alternatives are to build the step or to label it as a jump in the harness, outside
the app window.

## One primary action, and proportional friction

**[measured]** Both rules broke the same way, on the same control group:

- The runner card header carries **`Cancel All Runners`** (red, destructive) and
  **`Set Max Concurrency`** (blue, primary) side by side at equal visual weight, with
  the destructive one **first in reading order**. Windows shows `Restart Docker` and
  `Save Concurrency` in the same arrangement.
- **Every destructive action fires a toast and nothing else.** `Cancel All Runners`,
  `Restart Docker`, `Stop` on a runner — one click, `triggerAction()`, a 3-second
  "✓ …" confirmation. No dialog, no named consequence, no type-to-confirm, no undo.
  There is exactly one feedback mechanism in the artifact and it is the same for
  every action in the app.
- Conversely, `Stop` on an **idle** runner is styled destructive-red, so the friction
  is inversely proportional: the harmless action looks dangerous and the
  cluster-wide one has no gate at all.

### The override

Two mechanical checks, both cheap:

- **Count same-weight actions per region.** More than one filled/accent button in a
  card header or page header is the finding. Demote all but one.
- **Tabulate every destructive action against its gate** before delivery:

  | Action | Blast radius | Gate built |
  |---|---|---|
  | Cancel all runners | every job on the host | named-consequence dialog + undo window |
  | Restart Docker | all containers on the node | dialog naming what stops |
  | Stop one idle runner | nothing running | none — and not styled as destructive |

  A row whose gate column reads "toast" is a defect.

## Persistent chrome, and the one inverted rule

**[measured]** Non-negotiable 11 — *chrome reserves its own space; it never floats
over content* — failed in the harness rather than the app: the surface-selector row
runs off the right edge with no wrap, clipping the fifth surface to
"Security & Quarant…". Five of the artifact's most prominent controls also spill
their own fixed-height boxes: `Cancel All Runners`, `Set Max Concurrency`,
`Sync Queue`, `Simulate Pairing Complete`, and `Continue to GitHub Auth →`, whose
arrow is clipped by the button's bottom border. A one-command check finds all of
them: for every control, compare `scrollHeight` against computed `height`.

**[measured]** Non-negotiable 12 — *never show the reader your verification output* —
failed **inverted**, and it is worth naming because it is the same instinct. The run
shipped a `DESIGN.md` whose review matrix carried a *"Verification Status"* column
reading **"Verified & Tested"** on every row, including "Text contrast ≥ 4.5:1 …
Verified & Tested" — while the measured artifact fails 4.5:1 on every primary button.
The reader was shown a verification claim in place of provenance, and the claim was
false. Rule 12 forbids showing the reader your working; this adds its twin: **never
let the artifact assert its own verification.** Record what was run, or record
nothing.

## Review mode, on your own work

**[measured]** Build mode step 7 says *"Self-review before handoff using the matching
checklist … and fix what you find rather than shipping a findings list about your own
work."* The run shipped `DESIGN-REVIEW.md` — a findings list about its own work, five
surfaces, five rows, all **PASS**, one minor issue found and resolved, and a named
engine (`browser-use` CDP) that failed on all four attempts and never ran.

**[docs]** Gemini's guidance asks the model to "Verify your claims by quoting the
exact applicable information" — verification is prompted, not automatic. So the
correction is not "review harder"; it is that a self-review with no probe output in
it should not be written at all.

### The override

If you did not run a probe, do not write a review section. Write the three lines this
skill's honesty rules already imply:

```
Built:       <n> of <n> state cells · <n> of <n> flows · <n> steps captured
Measured:    <command>  → examined=<n> failures=<n>
Not checked: <the honest list — never empty>
```

An empty "not checked" list means you have confused the scope of your checks with the
scope of the artifact.
