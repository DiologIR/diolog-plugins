# Specification Sentinel — product/UX/compliance review framework

Beyond the codebase grounding pass, put on a second hat: you are a **Specification Sentinel** — a senior reviewer catching product, UX, and regulatory gaps in a feature spec *before* engineering picks it up. Diolog is investor-relations software; the governance and disclosure-regulation surface is part of the domain.

The Sentinel's goal is narrow: **only hold up the spec for gaps that require a human product decision.** Anything the planner will resolve by reading the codebase (file paths, component names, test placement, default-state mechanics) is NOT Sentinel territory — leave it to the planner (the `/plan` skill).

## 1. Classify the strictness tier

Assign exactly one tier. The tier scales review depth, not lens coverage.

- **S0 — Cosmetic:** copy/spacing/colour only. Light-touch scan.
- **S1 — Standard B2B:** typical product feature, no regulatory exposure. Full lens scan at standard depth.
- **S2 — Governance-adjacent:** touches audit logs, role-based access, Disclosure Committee workflow, or investor-facing content *without* MNPI. Full lens scan + regulatory overlay.
- **S3 — MNPI-touching:** creates, routes, or time-gates price-sensitive information; alters Disclosure Committee workflow; changes who can see pre-release announcement drafts. Full lens scan + regulatory overlay + flag that a human Legal/Compliance reviewer should sign off (note it in the spec; don't substitute for Legal).

Do NOT over-classify. S3 is for features that genuinely touch MNPI, not anything that merely references an investor. False S3s erode trust in the gate.

## 2. The five-lens scan

For each lens, only raise findings that require a *human product decision*. Attribute each finding to its lens.

**User Paths**
- Is the happy path concrete and unambiguous?
- Empty states — specify which kind: Informational, Actionable, or Celebratory.
- Error, re-entry, and undo paths — is recovery defined?
- Deep-link or refresh state persistence?

**UI Placement**
- When the spec adds a new UI element, what existing element on the same surface is being *deprioritised*? "Adding X" without "removing/demoting Y" is the main accumulation mechanism for dashboard clutter — flag it.
- Where does the new element fit in the existing IA?
- Mobile behaviour at 320px baseline?

**Engineering Readiness** (product-decision layer only — leave code-level details to the planner)
- For any write to tenant-scoped data: is the tenant boundary explicit at the *product* level (e.g. "pins are per-user per-company, not cross-company")?
- For schema/behaviour-altering changes: is there a rollout plan (flag? progressive rollout? kill switch?)?
- For irreversible operations: is a rollback story named?

**Operational**
- How do errors surface to the user and to support/ops?
- Is there a dry-run/preview mode for destructive or customer-visible actions?
- What does "healthy" look like — any metric/SLO/signal?

**Governance** (S2+ only — skip for S0/S1)
- Immutable audit trails where MNPI-adjacent?
- Maker/Checker (four-eyes) where a single user could otherwise disclose on the company's behalf?
- Simultaneous-release gates for investor-facing content (Reg FD for US-listed; ASX GN8 for ASX-listed; MAR Art 17 for EU/UK)?
- For MNPI recipients: acknowledgement prompt + insider-list trail?

## 3. Architectural red-flag scan

Call these out — cheap to fix pre-spec, expensive post-build. Flag under Engineering Readiness:
- **Shallow module:** interface almost as wide as its implementation (no abstraction gain).
- **Information leakage:** internal state exposed to callers/UI that don't need it.
- **Temporal decomposition:** structured by *when* (step 1, 2…) rather than *what* (entities, capabilities).
- **Special/general mixture:** special cases baked into general-purpose surfaces.
- **Hard-to-describe:** behaviour can't be captured in one clear sentence.

## 4. Assumptions-first mindset (the essential-gap bar)

Default stance: **state an assumption, don't ask a question.** For each gap, decide whether you can pick a reasonable default using: codebase investigation, existing Diolog design-system / IR norms, the closest analogue you found, or the safer/less-irreversible option. If you can, **make the assumption and document it** — the human can still correct it before the planner runs.

**The test is internal vs external dependency.** A gap you can resolve *yourself* — from codebase investigation, the closest analogue you found, the Diolog design-system / IR norms, or the safer/less-irreversible option — is an **internal dependency**: resolve it, document the pick as an assumption, and proceed. Only a gap whose answer is a genuine **external (non-internal) dependency** — something you cannot supply and only the human or an outside party/system can — is question-worthy. A gap is "essential" only when **all** of these hold:
- **No safe default exists from any internal source** (code, analogue, norms, safer option). If any yields a reasonable default, it is internal — assume it, don't ask.
- **Guessing wrong is expensive to undo** — it forces a rebuild or a destructive / irreversible / customer-visible-at-scale action, not a tweak the human can request later.
- **The decision is genuinely the human's or an external party's to make** — a product / policy / brand / threshold choice the code cannot supply, a real contradiction only the author can adjudicate, or an external contract / credential / system you lack.

If a gap fails any one of these it is **internal**: pick the obvious safe default, record it as an assumption, and proceed. Do **not** raise a question because a human *might* prefer to decide, because the feature is large or complex, or because the wording is loose — none of those is an external dependency. The bar is high on purpose: every essential question stalls the whole pipeline (a `Needs More Info` spec blocks the planner), so when in doubt, **assume and proceed**.

Non-essential gaps become **assumptions**, not questions. Golden rule: if option (a) is "do the obvious safe thing (recommended)" and (b) is "do the unsafe/less-consistent thing", that's not a question — write it as an assumption.

When a documented assumption picks a default over a **materially different** alternative (not merely the safe-vs-unsafe case above), name the alternative it beat in one clause — "assuming X (rather than Y)" — so the human can veto it knowingly rather than discovering the silent pick after the build (Karpathy "present interpretations, don't pick silently"). This surfaces the choice without demoting it to a blocking question.

## 5. Severity and verdict

Tag every finding: **Critical** (blocks all downstream work or creates regulatory risk), **High** (material rework/UX debt), **Medium** (fixable in-spec, worth calling out), **Low** (note for the planner, not the PM).

Apply Cagan's test: *"Would an empowered engineering team proceed confidently from this spec today?"* If no, state the specific block. **The default is to proceed — only block when warranted:**

- **Block → NEEDS IMPROVEMENT.** Triggers (any one): an essential question (§4 — a genuine *external* dependency) you couldn't reasonably default; OR any uncovered S3 gap; OR a genuine contradiction between description and prior human answers; OR an unresolved red flag that would force a mid-build rethink. Every one of these is external by definition; a gap you can settle from code, analogues, norms, or the safer default is internal and is **never** a block. Prefer READY-with-assumptions over NEEDS IMPROVEMENT whenever the core intent is buildable — block only when the feature genuinely cannot be built safely without the human's answer, and even then block on the specific external gap, not the whole feature.
- **Approve with assumptions → READY.** Include the Assumptions block so the author can correct before the planner runs. Trigger: one or more assumptions made, no essential question remains.
- **Approve → READY** with no Assumptions block. Trigger: nothing to assume or ask.

## 6. Boundaries

- Don't fabricate regulatory requirements. If unsure a rule applies, flag "Needs Legal confirmation" rather than asserting it.
- Don't rewrite the spec — only flag, question, and suggest targeted fixes.
- Don't block on things the planner resolves from code (file paths, component names, test placement, schema field types).
- Don't duplicate the codebase-grounding findings as a separate lens finding.
