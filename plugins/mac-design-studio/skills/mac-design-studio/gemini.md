# mac-design-studio, calibrated for Gemini

Read this before Knowledge sources. Then follow the skill as written, with these
overrides.

This skill's precedence chain is already the right instrument for the way Gemini
misses on platform work — *Apple kit `(specified)` values and HIG → corpus canon →
direction identity tokens → design-craft general craft*. What the measured run shows
is that the chain gets read and then not entered: the values in the artifact came from
none of the four tiers. So the correction is not more guidance about native fidelity;
it is a metric table filled in before the first line of CSS, and a directory listing
before delivery.

## Provenance

**[measured]** items come from one recorded Gemini run (`Egress Gemini`, 2026-08-17)
which invoked `design-craft`, `ux-craft` and a mac design skill on a two-platform
brief — macOS Tahoe app plus a Windows 11 counterpart — and produced
`~/Dev/egress/design/mocks/html/index.html`. A Claude run on a near-identical brief
produced `interaction-mock.html` beside it. Both were measured with the same probes.
**n=1.** **[docs]** items come from Google's published Gemini 3 prompting guidance and
are the stronger evidence.

**Two notes on using this file.** Google's prompt health checklist names *"conflicting
internal references"* as a defect — instructions the model must *"piece together … from
multiple different places"* — which is the shape of any conditional side-file, so read
this in one pass before the skill; each override names the section it lands on. And a
committed multi-surface design with a seven-part audit is what Google describes
`thinking_level: HIGH` as being for (*"multi-step planning"*); Gemini 3.7 Flash defaults
to `MEDIUM`.

## The measured platform errors

Every one of these is a value that had a published number available, and the artifact
used a different one. None is a taste call.

| Property | Artifact | Published | Source |
|---|---|---|---|
| macOS titlebar height | 48px | 33pt title bar, 52pt unified toolbar | HIG / kit `(specified)` |
| Windows titlebar height | 48px | 32px caption band, caption buttons 46×32 | WinUI 3 / Fluent 2 |
| Windows nav pane width | 240px | 320px expanded, 48px compact; items 40px tall | WinUI NavigationView |
| Windows accent | `#0078D4` | `#005FB8` light, `#4CC2FF` dark | Fluent 2 |
| Micro-labels | all-caps, tracked | sentence case, Semibold never Bold | Fluent 2 typography |
| Body/UI face | generic sans | Segoe UI Variable ramp | Fluent 2 |
| Window material | flat fill | Mica on the window, Acrylic on flyouts | WinUI 3 |
| Accent (both platforms) | `#00F0FF` family | present in neither vendor palette | — |

**[measured]** And the structural consequence: with the metrics unsourced, the
"Windows theme" is the macOS theme with the caption buttons moved to the right and a
3px accent bar added. Same titlebar height, same nav width, same type treatment, same
radii, no Mica, no Fluent elevation or contour. The brief said *based on the mac app
but themed using the Windows 11 design system*; what shipped is the first half.

**[measured]** Two more, from the same root: the artifact declared **11** CSS custom
properties and used **45 raw hex literals** alongside them, so there was no token
layer for a platform switch to move; and it contains **zero menus** — no macOS
menu-bar menus, no context menus, no status-item surface — on a product whose own
architecture doc specifies a `MenuBarExtra` companion and a notification-area item.

**[docs]** Two documented mechanisms account for the table, and they need different
fixes.

The first is **Ambiguity**, named in Google's prompt health checklist: *"Avoid using
subjective or relative qualifiers that lack a concrete, measurable definition. Instead,
provide objective constraints (for example, 'write a summary of 3 sentences or less'
instead of 'write a brief summary')."* "Themed using the Windows 11 design system" is a
relative qualifier. `title bar 32px · caption buttons 46×32 · pane 320/48 · accent
#005FB8` is an objective constraint. That is what the override below builds.

The second is **stale recall**, and it explains the accent specifically. **[docs]** The
Gemini 3 family's knowledge cutoff is **January 2025** — March 2026 for 3.7 Flash, with
Google noting that in some domains knowledge is still limited to January 2025 — and
their own remedy is to state the cutoff in the system instruction and to *ground*
time-sensitive work rather than answer from memory. `#0078D4` was Windows' accent for
years before `#005FB8`; recalling it is not a wrong guess so much as an old fact
returned confidently. Which means: **a platform value is read, never remembered.** Open
the kit, the HIG page, the Fluent reference, or the corpus entry, and put the value in
the table with its tier. Google supplies a ready-made system instruction for exactly
this posture, worth adopting verbatim when the design must not exceed its sources —
*"rely only on the facts that are directly mentioned in that context … any facts or
details that are not directly mentioned in the context must be considered **completely
untruthful** and **completely unsupported**."*

## The override: fill the metric table before the first line of CSS

Write it into the artifact as a comment, one row per property, one column per
platform, each cell carrying its value **and its tier**. The tiers are this skill's
own precedence chain, and the tag is the load-bearing part — a cell you cannot tag is
a value you invented.

```
                        macOS 27              tier      Windows 11            tier
title bar               33pt                  kit       32px                  fluent
unified toolbar         52pt                  kit       n/a (command bar 40)  fluent
window radius           10pt                  kit       8px                   fluent
in-page radius          6pt                   kit       4px                   fluent
control height ladder   16/20/24/28/36pt      kit       24/32/40px            fluent
body type               13pt SF               kit       14px Segoe UI Var     fluent
accent (graphics)       system hue            kit       #005FB8 / #4CC2FF     fluent
window material         Liquid Glass, chrome  kit       Mica                  fluent
caption controls        68×14pt cluster       kit       46×32 each            fluent
```

Rules that make the table do work rather than decorate:

- **A cell tagged `direction` is legitimate; a cell tagged nothing is a defect.** The
  skill permits a direction's identity tokens to set values *within* the native
  envelope — chrome metrics are not in that envelope.
- **A second platform needs a second `(specified)` source, or it is a reskin.** This
  skill's knowledge sources are macOS-only by design. When the commission extends to
  Windows, Linux, iOS or the web, name that platform's published system and read it
  before theming. "Based on the mac app" governs *structure and behaviour*; every
  metric, material and casing rule comes from the target platform.
- **Then count the token layer.** Distinct hex literals outside the token block should
  be near zero. A platform switch that has to rewrite 45 literals will not happen, and
  the artifact will read as one platform wearing the other's buttons.

## The seven audits are seven rows, not one sentence

**[measured]** Step 6 lists seven audits — native tells (10 points), the quality
rubric (14 points), `ai-slop-check`, the signature check, the motion floor, the
lookalike check, and the essence test. The run reported all five of its surfaces as
**PASS** in a self-authored `DESIGN-REVIEW.md`, named an engine (`browser-use` CDP)
that failed on all four invocation attempts and never ran, and claimed *"100% pass
rate on contrast (≥4.5:1 on text)"*. Measured afterwards: every primary button
**3.65:1**, every selected sidebar row 3.65:1, one `+` glyph at **1.00:1** — the same
colour as its own background.

**[docs]** Google treats verification as something the prompt has to ask for, not
something the model arrives doing: their thinking guide says to *"Include specific
verification steps in either the system instructions or your prompts directly … ask
Gemini to verify its sources, review its reasoning, identify potential errors, and check
its final answer"*, and their agentic template spends two of its nine rules on it —
*"Review your output against the user's task"* and *"Verify your claims by quoting the
exact applicable information."* So a claimed audit carrying no quoted output is the
expected outcome of stating the audit in prose, not a lapse.

### The override

Report the audits as a table with a verdict per point and the command beside any
number. The skill already models this exactly, at lines 81–91, for the icon audit
sheet — *"an instruction-only rule in this pipeline has a measured history of being
skipped. So treat it mechanically."* Apply that sentence to all seven audits:

```
native tells       9/10   (deviation: <which>, because <why>)
quality rubric    13/14   (fail: <which>)
contrast          <cmd>   examined=<n> failures=<n>
ai-slop-check      pass   (checked: gradients, uppercase tracking, off-palette accent)
signature          pass   (<the element>)
motion floor       n/a    (static mock; motion spec appended)
lookalike          pass   (nearest corpus app: <slug>, differentiated by <what>)
essence test       <three sentences>
```

`examined=0` is a gate that never ran and must never be recorded as a pass. And a
platform-fidelity claim is checkable the same way: paste the computed titlebar height
beside the published one rather than asserting conformance.

## Open the render, and prove the four artifacts exist

**[measured]** The run made 3 render calls and opened **4 images** for 5 surfaces × 2
platforms. Line 47 of this skill already says *"Rendering a screenshot is not seeing
one"*; on this family, give it a number. One capture per surface × state × platform,
all of them opened, and the fraction reported.

**[docs]** And describe each crop before judging it — this is Google's own multimodal
method, not an embellishment: *"Ask the model to describe the images before performing
the task in the prompt"*, with a worked example where "describe this image" returns a
generic caption and naming what to extract returns the data. For a mac surface the
extraction list is the audit itself: name the measured chrome heights, the control
heights, the casing, the corner radii you can see, *then* score. Their disambiguation
trick has a direct use here too — when an audit verdict looks wrong, ask what is in the
image first, which separates a rendering problem from a reasoning one before you change
any CSS.

Then apply the skill's own icon-delivery mechanic to the UI commission: before
reporting done, list the directory and confirm what is on disk — the mock, one capture
per cell, the state matrix, the token table. **[docs]** For low-risk exploratory
reads, Gemini's guidance is to *"Prefer calling the tool with the available
information over asking the user"* — so a listing and a capture are the cheap default,
not a step to weigh.

## Two attempts per tool, then a different family

**[measured]** Four consecutive invocations of one banned, absent browser tool, no
strategy change between them. **[docs]** Google's guidance: retry transient errors
only, and *"change your strategy or arguments, not repeat the same failed call."* A
`command not found` is permanent — one attempt is the whole budget. Read the repo's
own constraints first; this house names its single permitted driver and lists the
banned ones by name.

## Where this skill's specific rules land differently

- **Direction commitment — held.** The artifact committed to one look and applied it
  consistently. That is not the gap. What was missing is the *statement*: no direction
  named, no runner-up, no signature declared, no risk named. On this family, write the
  four into the file as a comment before building; a direction you did not write down
  is one a reviewer cannot check and a switch cannot preserve.
- **AI-default calibration — inverted, usefully.** The run did not reach for Warm
  Paper or Terminal Dark. It reached for a neon cyan that exists in no vendor palette,
  which is the same failure through the opposite door: an accent arrived at before
  there was a reason for it. Keep the skill's one-sentence defence test and add the
  provenance clause — the sentence must name either the subject or a published value.
- **The essence test — the strongest single check available here, and unused.** *Name
  the surface's question, its signature, and its worst state's behaviour.* The run
  built no worst state at all, on any surface, so the third sentence could not have
  been written. Write the three sentences per surface **before** building it; the
  third one is what forces the error state into existence.
- **Keyboard presence — measured zero.** No focus ring anywhere (`:focus-visible`
  **0**, `:focus` **0**), no default-button treatment, no Esc behaviour, and the whole
  navigation of both apps built from **12 `<div onclick>`** — keyboard-dead. Conviction
  7 is greppable: count `role=`, `tabindex`, `:focus-visible` and `<div onclick>` in
  your own output and report the four numbers.
