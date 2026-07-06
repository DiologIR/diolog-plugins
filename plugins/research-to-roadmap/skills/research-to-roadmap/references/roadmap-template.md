# Roadmap Document Templates

Exact structures for the two roadmap deliverables, plus the feature-entry format the triage pipeline consumes. Follow the section order; adapt lengths to the material, not the other way around.

## Contents
- §1 Roadmap v1 (single strategic-research report → prioritised roadmap)
- §2 Roadmap v2 (many reports → ambitious wave-based roadmap)
- §3 The feature entry format (both documents)
- §4 Worked feature-entry examples
- §5 Style rules

---

## §1 Roadmap v1 structure

Filename: `product-roadmap-<period>.md` in the team-files repo root.

```markdown
# <Product> Product Roadmap — <period>

> One-paragraph provenance note: what this was synthesised from (research report name+date,
> product surface, prior roadmaps), and "Compiled <date>".

## 1. Strategic context
   - Where the product stands (surface breadth, the moat) — a paragraph.
   - The 2–4 market forces the research evidences, each with its number/date.
   - Any single adoption constraint that governs everything (call it out separately).
   - **Strategy in one sentence** — bolded, at the end of the section.

## 2. Roadmap at a glance
   Quarter/period table: period | headline features | supporting/platform items.
   Follow with one paragraph of sequencing logic (why this order) and where
   long-lead dependencies start relative to their features.

## 3–5. Horizon sections (Now / Next / Later)
   Feature entries per §3 format. Each headline feature gets:
   What it is → Why now → How it builds on what exists → scope discipline note
   (what it is NOT) → the bullet block (segment, positioning, dependencies,
   success measures).

## 6. Continuous platform investments (all periods)

## 7. Explicitly deprioritised (and why) — two-column table, item | rationale

## 8. Key risks & open questions — numbered, each with an owner/next action where possible

## 9. Immediate next steps (this quarter) — numbered, concrete
```

## §2 Roadmap v2 structure (the ambitious synthesis)

Filename: `product-roadmap-v2-<qualifier>.md`. Supersession note in the header pointing at v1.

```markdown
# <Product> Roadmap v2 — <thesis name> (<period>)

> Provenance blockquote: supersedes <v1 file>; delivery-cadence assumption change and what
> it means ("waves of N weeks, feature every few days"); grounded in <N> research reports
> (list them); every feature entry (F-xx) written to be triaged directly into a spec;
> "Compiled <date>".

## 1. Strategy
   - **The thesis has changed** (or: held) — the reframe with its quantified evidence
     (stack costs, incumbent failure quotes, satisfaction stats).
   - The compounding moats, numbered (aim for 3–5; each one line + why it compounds).
   - **Commercial architecture** paragraph — packaging/pricing implications with their
     research basis (this is product scope, not just GTM).
   - **Delivery assumptions** paragraph — name the real constraint (external gates, not
     engineering) and the consequence (gates track front-loaded, waves re-orderable).

## 2. Roadmap at a glance
   Wave table: wave # | window | theme | headline shipments.
   Note under it: "Waves are themes, not barriers — a feature ships the moment its
   gates clear."

## 3..N. One section per wave
   Wave = 1–4 pillars. Each pillar opens with its research verdict in bold
   ("**Verdict from research: Enter, own-data-first…**") plus the 2–3 load-bearing
   findings that justify it, THEN the feature entries (§3).
   Wave 1 ends with the **gates track**: every external thread (counsel, registries/
   partners, data-vendor quotes, certifications, design partners) started in week one,
   each mapped to the features it feeds.

## N+1. Cross-cutting platform investments (all waves)

## N+2. Deprioritised / explicitly not building — table, item | rationale.
   Include the autonomy boundary as a row ("agents propose, humans publish").

## N+3. Risks & open questions — numbered; include gate slippage as risk #1 when
   cadence is AI-accelerated, plus every "verify before committing" claim.

## N+4. Immediate actions (this week) — numbered; open the gate threads, name the
   first triage batch (the load-bearing feature IDs), name the technical spikes.
```

## §3 The feature entry format

Every feature gets a stable ID (`F-01`, `F-02`, … — never renumber once assigned; later documents and the triage pipeline reference them). An entry must let someone write a spec without reopening the research:

```markdown
- **F-NN <Name>.** <What it is — 2–4 sentences, concrete enough to picture the UI/behaviour.
  Include the mechanism, not just the outcome.> <Why / evidence — the specific finding with
  its number, or "Whitespace — no vendor provides this".> *Depends:* F-xx, F-yy.
  **Gate:** <counsel review / POC / partnership — only if one exists.> *Spec notes:*
  <constraints, entity model hints, reuse of existing surface, what it is NOT.>
  *<Differentiating | Table stakes> — <one clause of positioning>.*
```

Field checklist (not every field is a separate label — weave them into the prose, but all must be present or deliberately absent):
- [ ] Stable ID + name
- [ ] What it does (mechanism-level, not slogan-level)
- [ ] Evidence of demand with its number/quote/source-type
- [ ] What it extends (existing area / earlier F-xx) or NEW-PILLAR
- [ ] Segment it wins
- [ ] Differentiating vs table-stakes, with the structural-defensibility clause if differentiating
- [ ] Dependencies (other F-xx, platform primitives, data)
- [ ] Gates (external blockers) — named, with kill-condition if the research gave one
- [ ] Spec notes — the non-obvious constraints a spec writer needs

## §4 Worked feature-entry examples

A platform primitive (note the load-bearing framing and the failure-mode-driven spec notes):

> - **F-19 Linked Values Core.** Source anchors, destination anchors, and link edges as first-class entities in a decoupled graph layer (never embedded in document JSON). **Explicit publish semantics** — local edits show a pending indicator; propagation requires a permission-gated Publish action writing an immutable audit entry. Destinations cache last-published values (survives permission boundaries and source deletion — freeze, never blank). TipTap implementation as `atom: true` inline nodes with custom NodeView `update()` (avoids the documented full-re-render/cursor-loss failure). *Spec notes:* RBAC scoped to PUBLISH_LINK; deletion interception with blast-radius warning; link-health dashboard pre-export. *Load-bearing: the board pack compiler, S2 workspace, and presentations all consume this.*

A gated differentiator (note verdict-derived controls as the product):

> - **F-29 Privilege-Aware AI Minutes.** Transcription + minutes drafting mapped to the agenda, with an AI layer that identifies legally privileged discussion (external-counsel speakers via diarisation) and quarantines it into a **Privilege Vault** excluded from transcripts, search indexing, and AI context. Incumbents ship naive AI minutes that law firms warn create privilege-waiver exposure — solving that is the wedge. **Gate:** external counsel review of the quarantine architecture; if it can't earn sign-off, ship minutes *without* AI transcription rather than shipping the liability. *Whitespace / high differentiation.*

An evidence-anchored table-stakes entry (note honest positioning):

> - **F-13 AI Briefing Books.** One-click and calendar-triggered pre-meeting dossiers synthesising fund profile, holdings context, interaction history, and open items — delivered to the exec's phone. Matches the incumbent's flagship feature using own-data freshness instead of their licensed database. *Table stakes vs Q4, differentiating on data freshness.*

## §5 Style rules

- Prose-first entries; bullets carry structure, not fragments. A reader who was not in the research should understand every entry standalone.
- Numbers stay attached to claims ("$9,450/yr/CUSIP", "45-day lag", "82% have no AI policy") — an unquantified claim can't be ranked or challenged.
- Bold sparingly: verdicts, thesis sentences, gate labels, and the single most important feature of a wave.
- Every document: provenance blockquote at top, compiled date, and inputs listed.
- Deliver via SendUserFile; close the message with the reframe, how each report landed, what you added beyond the research, and the first triage batch.
