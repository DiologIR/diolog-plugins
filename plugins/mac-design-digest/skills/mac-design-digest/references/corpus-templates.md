# Corpus File Templates

Exact templates for every file the skill writes. Use these structures verbatim — cross-session incrementality depends on files being predictably parseable by the *next* invocation. Replace `{{…}}`; never leave a placeholder in a written file.

## Corpus layout

```
design-corpus/
├── TASTE.md            # master synthesis: canon, clusters, conventions, gaps — the file a generating AI loads
├── ICONS.md            # icon synthesis: eras, palettes, devices, icon canon
├── ledger.md           # digestion log — read FIRST on every invocation
├── apps/<app>.md       # one profile per app (all its surfaces accumulate here)
├── icons/<app>.md      # one digest per icon
├── patterns/<pattern>.md  # cross-app pattern entries (sidebar.md, toolbar.md, settings.md, empty-state.md, onboarding.md, list.md, inspector.md …)
└── kit/<kit>.md        # ground-truth tokens from official UI kits (e.g. macos-27.md)
```

## Provenance marks (used on every token everywhere)

Measurement quality: `(specified)` — from an official UI kit or HIG numeric spec, authoritative · `(measured)` — clean pixel measurement from a screenshot · `(estimated)` — inferred within a stated range · `(assumed)` — gap-filling default.

Evidence strength: `(inferred)` — one surface · `(confirmed)` — repeated within one app · `(recurring)` — 2 independent apps · `(canon)` — ≥3 independent apps, promoted to TASTE.md · `(contested)` — apps disagree; both readings recorded.

`(specified)` values override conflicting `(measured)`/`(estimated)` values — but log the conflict: a shipping app deviating from the kit is itself a finding.

## ledger.md

```markdown
# Digestion Ledger

| # | Date | Source file | SHA-1 (8) | Type | App | Surface / subject | Digested into |
|---|------|------------|-----------|------|-----|-------------------|---------------|
| 1 | 2026-07-19 | quill-hero.png | 3fa2b91c | ui | Quill | main window, light | apps/quill.md, patterns/toolbar.md |
| 2 | 2026-07-19 | quill-icon.png | 88d10a4e | icon | Quill | app icon | icons/quill.md |

## Synthesis history
- 2026-07-19 — corpus level: Novice (2 items, 1 app). Promotions: none.

## Pending questions
- {{open contradictions or user questions awaiting more evidence}}
```

Type is one of `ui | icon | kit`. Hash with `shasum <file> | cut -c1-8`. If a hash already appears in the ledger, tell the user it's already digested and skip (unless they say re-digest, e.g. after an app update — then supersede the old evidence and note it). Multiple source files of the same subject (e.g. hero + Dock renders of one icon) get one ledger row each, all pointing at the same digest file.

## apps/<app>.md

```markdown
# {{App}} — profile

- **Source:** {{macapp.supply / user}} · **Surfaces digested:** {{list}} · **Last updated:** {{date}}
- **One-sentence identity:** {{peer-reference vibe, e.g. "Things' calm discipline applied to a markdown editor"}}
- **Cluster:** {{cluster-name or "unassigned"}}
- **Lineage:** {{native / catalyst / ios-on-mac / web-electron}} ({{confidence}}) — non-native evidence never feeds macOS canon
- **Era (chrome):** {{e.g. Liquid Glass native / legacy-native (pre-Tahoe) / custom-drawn}}

## Tokens

| Token | Value | Provenance | Notes |
|---|---|---|---|
| bg/canvas | #ECECEE (estimated)(confirmed) | | window background, light mode |
| type/body | 13px SF Pro Regular, lh ~16px (estimated)(confirmed) | | |
| space/base | 8px grid, 4px micro (measured)(confirmed) | | one 22px deviation, see Defects |
| accent/primary | … | | |
| radius/card | … | | |
| chrome/sidebar | {{width, material, vibrancy?}} | | |

## Layout skeletons
{{One per digested surface: ASCII-free structural description — regions, column widths, alignment axes.}}

## Signature moves
- {{[GOLDEN-NUGGET] systematic, purposeful deviations that define this app's character}}

## Defects
- {{anti-pattern name → evidence → what canon would do instead}}

## Rubric history
| Surface | Score | Failures |
|---|---|---|
| main window | 12/14 | #6 line length, #10 border contrast |
```

## patterns/<pattern>.md

```markdown
# Pattern: {{sidebar}}

## Evidence
| App | Surface | Key values | Provenance |
|---|---|---|---|
| Quill | main | 220px, full-height, vibrancy material, 28px rows | (estimated) |

## Converged rules ({{n}} apps)
- {{rule}} — apps: {{list}} — {{(recurring)/(canon)}}

## Divergences
- {{where apps split, and whether the split tracks cluster lines}}

## Generation guidance
{{The distilled how-to-build-one, token-precise. Only write once ≥2 apps evidence it.}}
```

## icons/<app>.md

```markdown
# Icon: {{App}}

- **Era:** {{…}} · **Rubric:** {{n}}/12 · **Digested:** {{date}}

| Dimension | Reading |
|---|---|
| Background | {{flat / ramp #hex→#hex / scene}} |
| Glyph | {{type, colours, optical position on grid}} |
| Overlay device | {{none / diagonal tool / badge}} |
| Light model | {{direction, shadow character, specular}} |
| Layer stack | {{back → front enumeration}} |
| Palette economy | {{hue families count, accent placement}} |

## Signature devices
- {{nameable moves}}

## Failures
- {{rubric failures with evidence}}

## Rhymes with
- {{other digested icons sharing devices/palette logic}}
```

## TASTE.md

```markdown
# TASTE.md — macOS design corpus synthesis

> Load this file (plus the relevant cluster section and 1–2 app profiles) when generating a new macOS mock.
> Corpus level: {{Novice/Competent/Proficient/Expert}} — {{n}} items, {{n}} apps, {{n}} icons. Updated {{date}}.

## Canon — universal ({{promoted from ≥3 independent apps; never edit without evidence}})
| Rule | Values | Supporting apps | Since |
|---|---|---|---|

## Canon — macOS conventions
{{Platform-specific: chrome metrics, materials usage, traffic-light spacing, sidebar/toolbar norms. Kit `(specified)` values live in kit/ and are cited here.}}

## Style clusters
### {{cluster-name}} — {{one-sentence identity + reference peers}}
- **Members:** {{apps}}
- **Audience:** {{pro tool / consumer utility / creative}}
- **Identity tokens:** {{the 5–10 tokens that make this cluster itself: density, radius, palette temperature, type personality, depth philosophy}}
- **Cluster do/don't:** {{3–6 bullets}}

## Contested
{{Rules apps disagree on — both readings, member lists.}}

## Knowledge gaps
{{What the corpus cannot yet answer: unseen surface types, no dark-mode evidence, single-cluster blindness… Never empty below Proficient.}}

## Design-mode checklist
1. Pick cluster by audience match (state choice + runner-up).
2. Inherit cluster identity tokens; fill gaps from canon; fill remaining from kit/ then HIG defaults `(assumed)`.
3. Build layout skeleton from the nearest pattern entries.
4. Audit against the 14-point rubric (macOS calibration) before delivery; report score honestly.
5. Lookalike check: if the result would pass as a specific digested app's screen, differentiate deliberately.
```

## ICONS.md

```markdown
# ICONS.md — icon corpus synthesis

> Load when designing a mac app icon. Corpus: {{n}} icons. Updated {{date}}.

## Era distribution
{{count per era; what the corpus can/can't teach}}

## Recurring palettes
{{ramp families with hex ranges + member icons}}

## Recurring devices
{{diagonal tools, mascots, framed motifs… with member icons}}

## Icon canon ({{≥3 independent icons}})
| Rule | Evidence | Members |
|---|---|---|

## Icon clusters
{{style families, same structure as TASTE.md clusters}}

## Design-mode checklist (icons)
1. Choose era + light model + palette ramp before composition.
2. Sketch silhouette first; run the mental 16px squint test.
3. Audit against the 12-point icon rubric; report score.
```

## kit/<kit>.md (official UI kit ingestion)

```markdown
# Kit: {{Apple macOS 27 UI Kit (Figma)}}

- **Source:** {{file name/version}} · **Ingested:** {{date}} · **Authority:** overrides screenshot estimates
- **Coverage:** {{which component sheets were provided}}

## Control metrics `(specified)`
| Control | Size/metrics | States seen | Notes |
|---|---|---|---|
| Push button (regular) | {{h × min-w, radius, padding}} | {{default/hover/…}} | |
| Sidebar row | … | | |

## Type styles `(specified)`
| Role | Size/weight/lh | Usage |
|---|---|---|

## Colour semantics `(specified)`
| Token | Light | Dark | Maps to |
|---|---|---|---|

## Materials & chrome
{{window chrome metrics, material names, corner radii, traffic-light geometry}}

## Deltas vs. previous macOS
{{what changed — this is high-value: shipping apps will lag}}
```

## Per-screenshot digest block (returned in chat, not written to a corpus file)

```markdown
### Digest: {{file}} — {{App}}, {{surface}}
**Rubric:** {{n}}/14 · **Failures:** {{#s + one-line evidence each}}
**New tokens:** {{count}} ({{measured/estimated/assumed split}})
**Signature:** {{the one observation worth remembering, or "none — competent but anonymous"}}
**Corpus effect:** {{promotions, cluster moves, contradictions raised}}
```
