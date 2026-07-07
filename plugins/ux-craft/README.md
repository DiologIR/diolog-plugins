# ux-craft

Book-grounded UX engine for **implementing, mocking, and reviewing** web and mobile
UIs, layouts, and user flows — plus **marketing and transactional emails**.

This is the **UX brain** to `design-craft`'s visual hands: design-craft owns whether
an artifact looks intentional; ux-craft owns whether it works for the distracted,
impatient, phone-holding human on the other side.

## Grounding

The skill operationalizes the UX canon rather than name-dropping it:

- **Krug** — self-evidence, scanning, the trunk test, omit needless words
- **Norman** — affordances, signifiers, feedback, conceptual models; user error = design failure
- **Garrett** — five planes as review altitudes (diagnose at the lowest failing plane)
- **Cooper** — goal-directed design, eliminating excise
- **Nielsen** — the 10 heuristics as a working lens
- **Wroblewski** — mobile-first, touch targets, form design and validation timing
- **Yablonski / Lidwell / Weinschenk** — Hick, Fitts, Jakob, Cowan, Tesler, peak–end,
  progressive disclosure, and the rest of the research base, with honest citations
- **Fogg / Cialdini / Eyal** — persuasion and habit mechanics behind a hard **ethics
  gate** (alignment, sincerity, golden rule; fake urgency and prechecked consent are
  findings, not tactics)
- **Wathan & Schoger** — hierarchy via weight/color, de-emphasis, design-the-states
- **Gothelf / Buley** — mock to learn; lightweight team-of-one methods
- **Butterick** — interface typography correctness

## Modes

| Mode | Trigger shape | What you get |
|---|---|---|
| **Build** | "design the signup flow", "mock the settings screen", "write the reset email" | Goal-anchored flow/screen/email shaped with states, real copy, and mechanism-backed choices |
| **Review** | "review the UX", "audit this flow", "why do users drop off", "check this email" | Multi-lens review (Krug/Norman/Nielsen/Garrett/mobile/a11y/psychology/ethics) with calibrated severities and pasteable fixes |
| **Advise** | "modal or inline?", "what happens if we remove X" | Mechanism-grounded answer, not taste |

## References

| File | Contents |
|---|---|
| `psychology-laws.md` | The behavioral-science base: perception stack (capacity → 50ms impression → fluency → biases → choice architecture), working laws, persuasion with the gate on |
| `review-playbook.md` | Scope-first protocol, 10 lenses, severity honesty, intentional-vs-accidental deviation handling, findings format, report template, prompt-injection guard for reviewed content |
| `flows-and-forms.md` | Flow architecture, GDS one-thing-per-page, forms & validation timing, the state machine, undo vs confirmation, wayfinding & IA essentials, Refactoring-UI hierarchy tactics |
| `mobile-ux.md` | Touch targets, thumb zones, safe areas, iOS/Material platform grammar, mobile forms, mobile a11y, React Native notes |
| `email-ux.md` | The two-second triage contract, structure, email-client rendering constraints, marketing & transactional patterns, compliance floor (CAN-SPAM / GDPR / one-click unsubscribe), pre-send checklist |
| `ux-writing.md` | Microcopy patterns (buttons, errors, empty states, confirmations), tone matrix, plain language, Butterick typography, localization hygiene |
| `checklists.md` | Pre-ship checklists per surface + WCAG 2.2 quick pass + shared severity ladder |

## Ecosystem fit

- Visual artifact production → `design-craft` (ux-craft feeds it the UX shape)
- Pixel-fidelity vs a mock → `mockup-fidelity`
- Figma email graphics → `email-mockups` (ux-craft owns the email's structure/copy/compliance)
- Research & discovery → `intent-layer`, `discovery-sentinel`
- Code quality/security/perf → `code-review`
- Mechanical WCAG verification → optional `npx @accesslint/cli` pass

## Provenance

Synthesized from the book canon plus a survey of ~530 open UX skill files
(awesome-ux-skills, perception-first-design's research corpus, intent-plugin,
noodlemind's expert-panel reviewer, bencium's design-audit and typography skills,
Vercel agent-skills, accesslint). Research citations are to the underlying
published studies; no third-party skill text is reproduced.
