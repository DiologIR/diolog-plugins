# Lecturn Canonical Deck Schema — `lecturn.deck/1`

**The single JSON structure that the AI generator authors, the editor reads and writes, the four
renderers consume, the export service renders, and a PPTX/PDF/Slides import lands into.**

> This document defines the canonical data model referenced throughout
> `lecturn-feature-technical-spec.md` (§4 Data model, §16 Export, §15 Import, §21 Technical
> architecture). It is expressed as annotated **TypeScript declarations** — the most precise and
> readable way to pin a JSON shape — and maps 1:1 onto a Zod discriminated union or JSON Schema
> (draft 2020-12). Where the prose and the declarations disagree, the prose wins.

---

## Contents

- [0. How to read this](#0-how-to-read-this)
- [1. Design rules](#1-design-rules)
- [2. Conventions & shared building blocks](#2-conventions-shared-building-blocks)
- [3. Deck](#3-deck)
- [4. Slide](#4-slide)
- [5. Element base](#5-element-base)
- [6. Element types](#6-element-types)
- [7. Theme snapshot](#7-theme-snapshot)
- [8. Import report & provenance](#8-import-report-provenance)
- [9. The AI-facing (model) subset](#9-the-ai-facing-model-subset)
- [10. Validation & conformance](#10-validation-conformance)
- [11. PPTX → schema crosswalk](#11-pptx-schema-crosswalk)
- [12. Worked example](#12-worked-example)
- [13. Versioning & evolution](#13-versioning-evolution)
- [Appendix A — colour token map (Lecturn ⇄ PPTX scheme)](#appendix-a-colour-token-map-lecturn-pptx-scheme)
- [Appendix B — unit conversions (import time only)](#appendix-b-unit-conversions-import-time-only)

## 0. How to read this

Every field is tagged with the **tier** it belongs to. The tier — not a separate type — is what
lets one schema stay both *lean enough for an LLM to author* and *rich enough to round-trip a
PowerPoint file*.

| Tag | Tier | Who writes it | Rule |
|---|---|---|---|
| `// core` | **Core** | AI generation **and** editor **and** import | The lean, common model. The AI-facing subset (§9) is exactly the core fields. |
| `// fidelity` | **Fidelity** | Import + power-editor + export | Optional, additive. Absent on AI-generated decks; populated by import for exact reproduction. |
| `// carry` | **Carry** | Import only | The opaque escape hatch: exact source fragments + rendered fallbacks for anything not modelled natively (§2.14). |
| `// runtime` | **Runtime** | Never persisted | Listed only to say it is **excluded** from the document (presence, tallies, viewport). |

**Cardinal rule (inherited from the GridMD design):** an importer meets every construct with
exactly one of three outcomes — **represent it natively** (core/fidelity), **carry it verbatim**
(carry + a rendered fallback so it still displays), or **fail loudly** into the import report.
Never silently drop, never fabricate.

---

## 1. Design rules

1. **One schema, both ends.** The generator's output and the editor's read/write model are the
   same type. There is no divergent "generation-only" shape.
2. **Additive & migration-free.** New fields are always optional with no new default. Legacy
   decks parse forever. Removing/renaming a field is a breaking change and bumps the major
   version (§13); adding an optional field does not.
3. **Bare numbers.** No `min`/`max`/`int`/`minItems` constraints appear on the **AI-facing**
   projection of any field — streaming partials legitimately carry empty arrays and
   out-of-order values mid-generation. Bounds are enforced by post-parse predicates, not by the
   type (§10).
4. **Flat elements, referenced groups.** `slide.elements[]` is a single flat, ordered array.
   Grouping is by `groupId` reference, never by nesting arrays — so a group never changes the
   shape of the tree and back-compat holds.
5. **`elements[]` is the sole rendered truth.** Any semantic sidecar (`legacy`, source bullets)
   is metadata, never drawn.
6. **Determinism where it counts.** Geometry, colour resolution, layout reflow, transitions, and
   export are deterministic functions of this document. Only *generation* is probabilistic.
7. **Canvas coordinates, always.** All geometry is in the fixed design surface (default
   **1280×720**, §2.1). Import normalizes source units (EMU) into this space once, at import
   time, and stores px.
8. **Unknown is preserved, not lost.** Unrecognized `x*` extension fields and all `carry`
   payloads round-trip untouched.

---

## 2. Conventions & shared building blocks

### 2.1 Scalars, units & ids

```ts
type Px = number;      // core — canvas pixels in the fixed surface. Bare number.
type Deg = number;     // core — degrees, clockwise. (PPTX stores 60000ths of a degree → ÷60000.)
type Unit = number;    // core — 0..1 fraction unless a field says 0..100.
type Id = string;      // core — stable, unique within its deck (nanoid/uuid). Load-bearing for
                       //        reorder-safety, comments, diffing, and edit-preserves-by-id.

// Import-time only (never stored): EMU→px. 914400 EMU/inch, 12700 EMU/pt, 9525 EMU/px @96dpi.
// A 16:9 deck is 12192000×6858000 EMU → 1280×720 px (emuPerPx = 9525). Recorded in ImportReport.
```

### 2.2 Colour

Colour is a **union**: a plain string for the common case (AI/editor), or a structured
theme-token reference with transforms for full PPTX fidelity.

```ts
type Color =
  | string          // core — "#RRGGBB" | "#RRGGBBAA" | a token shorthand "accent1" | "accent1/40"
  | ThemeColor;     // fidelity — structured theme ref + PPTX colour transforms

interface ThemeColor {                 // fidelity
  token: ColorToken;                   // resolved against the deck theme snapshot (§7)
  transforms?: ColorTransform[];       // ordered, applied as PPTX applies them
}

type ColorToken =                      // Lecturn names ⇄ PPTX scheme (see Appendix A)
  | 'text1' | 'text2' | 'bg1' | 'bg2'
  | 'accent1' | 'accent2' | 'accent3' | 'accent4' | 'accent5' | 'accent6'
  | 'hyperlink' | 'followedHyperlink';

interface ColorTransform {             // fidelity — each value 0..100 (percent)
  kind: 'tint' | 'shade' | 'lumMod' | 'lumOff'
      | 'satMod' | 'satOff' | 'hueMod' | 'alpha';
  value: number;                       // PPTX stores 1000ths of a percent → ÷1000
}
```

### 2.3 Fill

```ts
type Fill =                            // core union; gradient/image/pattern are fidelity variants
  | { type: 'none' }                                             // core
  | { type: 'solid'; color: Color }                             // core
  | { type: 'gradient'; gradient: Gradient }                    // fidelity
  | { type: 'image'; image: ImageFill }                         // fidelity
  | { type: 'pattern'; pattern: PatternFill };                  // fidelity

interface Gradient {                   // fidelity
  kind: 'linear' | 'radial' | 'path';
  angle?: Deg;                         // linear only
  stops: Array<{ pos: number; color: Color }>;  // pos 0..100
  scaled?: boolean;
}

interface ImageFill {                  // fidelity — a blipFill
  assetId?: Id; url?: string;
  mode?: 'stretch' | 'tile';
  crop?: Insets;                       // srcRect
  alpha?: number;                      // 0..100
}

interface PatternFill {                // fidelity
  preset: string;                      // e.g. "pct25", "ltHorz", "dkGrid"
  fg: Color; bg: Color;
}
```

### 2.4 Stroke / line

```ts
interface Stroke {                     // core: color+width. dash/heads/cap/join are fidelity.
  color?: Color;                       // core (shorthand for a solid line fill)
  fill?: Fill;                         // fidelity — gradient/pattern line
  width?: Px;                          // core
  dash?: 'solid' | 'dash' | 'dot' | 'dashDot' | 'lgDash' | 'sysDash' | number[]; // fidelity
  cap?: 'flat' | 'round' | 'square';   // fidelity
  join?: 'round' | 'bevel' | 'miter';  // fidelity
  compound?: 'single' | 'double' | 'thickThin' | 'thinThick' | 'tri'; // fidelity
  headEnd?: ArrowEnd; tailEnd?: ArrowEnd;  // fidelity — connector/line arrowheads
}

interface ArrowEnd {                   // fidelity
  type: 'none' | 'triangle' | 'stealth' | 'arrow' | 'diamond' | 'oval';
  width?: 'sm' | 'med' | 'lg'; length?: 'sm' | 'med' | 'lg';
}
```

### 2.5 Effects

```ts
interface Effects {                    // fidelity — display via native CSS/SVG filters, else F2 fallback
  shadow?: Shadow;
  glow?: { color: Color; radius: Px };
  reflection?: { blur?: Px; distance?: Px; alpha?: number };
  softEdge?: Px;
  bevel?: { preset?: string; width?: Px; height?: Px };   // 3-D; often F2 fallback
}

interface Shadow {                     // fidelity
  type: 'outer' | 'inner';
  color: Color; blur?: Px; distance?: Px; direction?: Deg; alpha?: number;
}
```

### 2.6 Layout

```ts
interface Layout {                     // core
  x: Px; y: Px; w: Px; h: Px;          // top-left origin, canvas coordinates
  rotation?: Deg;                      // core — clockwise about the element centre
  z: number;                           // core — z-order (source document/spTree order on import)
  flipH?: boolean; flipV?: boolean;    // fidelity — PPTX xfrm flips (mostly images/shapes)
}
```

### 2.7 Sizing (auto-layout participation)

```ts
interface Sizing {                     // core — drives reflow inside an auto-layout group (§6.8)
  w: 'fixed' | 'hug' | 'fill';
  h: 'fixed' | 'hug' | 'fill';
}
```

### 2.8 Rich text

The AI writes a plain `text` string; PPTX import (and any run-level styling) writes `rich`. When
`rich` is present it is authoritative for display; `text` is always kept as the flattened,
accessible, searchable fallback.

```ts
interface RichText {                   // fidelity
  paragraphs: Paragraph[];
}

interface Paragraph {                  // fidelity
  runs: Run[];
  align?: 'left' | 'center' | 'right' | 'justify' | 'distributed';
  level?: number;                      // list/indent depth 0..8
  bullet?: Bullet;
  indent?: Px; marginLeft?: Px;
  lineSpacing?: number;                // multiple (1.0) or negative = exact pt
  spaceBefore?: Px; spaceAfter?: Px;
  direction?: 'ltr' | 'rtl';
}

interface Run {                        // fidelity
  text: string;
  bold?: boolean; italic?: boolean;
  underline?: 'none' | 'single' | 'double';
  strike?: 'none' | 'single' | 'double';
  color?: Color; font?: string; size?: Px;
  tracking?: number;                   // letter spacing
  baseline?: 'normal' | 'super' | 'sub';
  highlight?: Color; caps?: 'none' | 'all' | 'small';
  link?: Hyperlink;
}

interface Bullet {                     // fidelity
  kind: 'none' | 'char' | 'number' | 'picture';
  char?: string;                       // e.g. "•"
  scheme?: string;                     // e.g. "arabicPeriod", "romanUcParenR"
  startAt?: number; color?: Color; assetId?: Id;   // picture bullet
}

interface TextBody {                   // fidelity — the text frame (bodyPr)
  vAnchor?: 'top' | 'middle' | 'bottom';
  insets?: Insets;                     // internal margins
  autofit?: 'none' | 'shrink' | 'resize';   // shrink-text-on-overflow | resize-shape-to-fit
  wrap?: boolean;
  columns?: { count: number; gap?: Px };
  direction?: 'horz' | 'vert' | 'vert270' | 'wordArtVert';
}

type Insets = { t?: Px; r?: Px; b?: Px; l?: Px };   // core building block
```

### 2.9 Hyperlink / click action

```ts
interface Hyperlink {                  // core
  action:
    | { kind: 'url'; href: string }
    | { kind: 'slide'; slideId: Id }
    | { kind: 'firstSlide' } | { kind: 'lastSlide' }
    | { kind: 'nextSlide' } | { kind: 'prevSlide' }
    | { kind: 'file'; path: string }   // fidelity
    | { kind: 'none' };
  tooltip?: string;
}
```

### 2.10 Transitions & entrance animations (deterministic)

All motion is code-driven and deterministic; every renderer honours `prefers-reduced-motion` by
degrading to `reducedMotion` (default `crossfade`, or `instant`).

```ts
interface Transition {                 // core
  type: 'none' | 'fade' | 'push' | 'wipe' | 'cover' | 'uncover'
      | 'split' | 'reveal' | 'cut' | 'morph' | 'zoom';   // common set; others → carry
  direction?: 'l' | 'r' | 'u' | 'd';
  durationMs?: number;
  reducedMotion?: 'instant' | 'crossfade';   // fallback under prefers-reduced-motion
}

interface Animation {                  // fidelity — per-element or slide-scoped timeline node
  targetId?: Id;                       // omit for slide-level
  effect: 'fade' | 'fly' | 'wipe' | 'zoom' | 'grow' | 'spin' | 'float' | 'emphasis-*' | 'exit-*';
  trigger?: 'onClick' | 'withPrev' | 'afterPrev';
  delayMs?: number; durationMs?: number;
  order?: number;
  reducedMotion?: 'instant' | 'crossfade';
}
```

### 2.11 Source provenance

```ts
interface SourceLink {                 // core — generic "where did this come from" tag
  sourceId: string;                    // document/dataset id in the host
  location?: string;                   // page / cell / span
  label?: string;                      // caption text under the selected element
}
```

### 2.12 Carry — the escape hatch (import fidelity)

The single mechanism that guarantees "no silent loss." Attached to any element, slide, or the
deck. A converter that fully understands the construct ignores the carry; one that does not
re-emits it untouched.

```ts
interface Carry {                      // carry
  reason?: string;                     // human/AI note ("SmartArt org chart", "OLE spreadsheet")
  class: FidelityClass;                // F0..F3 (§2.13)
  ooxml?: string;                      // exact source XML fragment (a shape/effect not modelled)
  part?: {                             // a whole foreign package part (media, embeddings, fonts)
    path: string;                      // e.g. "ppt/embeddings/oleObject1.bin"
    encoding: 'base64' | 'utf8';
    data: string;                      // canonicalized path; never executed (macros carried inert)
  };
  fallback?: {                         // a rendered raster so it still DISPLAYS when not editable
    kind: 'image';
    assetId?: Id; url?: string; w: Px; h: Px;
  };
}
```

### 2.13 Fidelity classes

```ts
type FidelityClass =
  | 'F0'   // native  — fully represented; round-trips exactly.
  | 'F1'   // carried — represented natively enough to edit/display; exact source carried for lossless re-emit.
  | 'F2'   // fallback— cannot represent; a rendered raster stands in (+ source carried). Visual, not editable.
  | 'F3';  // flagged — cannot represent or even rasterize meaningfully; recorded in the import report. Never silent.
```

---

## 3. Deck

```ts
interface Deck {
  schema: 'lecturn.deck/1';            // core — format + version tag (required, first key)
  id: Id;                              // core
  title: string;                       // core
  canvas: { w: Px; h: Px };            // core — default {1280,720}. Import records source size in `import`.
  theme: ThemeSnapshot;               // core — the frozen brand spec the deck renders against (§7)
  templateId?: string;                 // core — the generation format/template (§10.4 of the feature spec)
  status?: 'draft' | 'in-review' | 'shared';   // core
  slides: Slide[];                     // core — ordered
  defaultTransition?: Transition;      // core

  meta?: DeckMeta;                     // fidelity — document properties (PPTX core.xml/app.xml)
  fonts?: FontRef[];                   // fidelity — referenced/embedded fonts
  assets?: AssetRef[];                 // fidelity — optional registry of referenced binaries
  import?: ImportReport;               // fidelity — provenance + fidelity accounting for an import (§8)

  carry?: Carry[];                     // carry — deck-level parts not mapped natively (unmodelled masters, VBA…)
  x?: Record<string, unknown>;         // extension — round-trips untouched
}

interface DeckMeta {                   // fidelity
  author?: string; company?: string; subject?: string; keywords?: string[];
  created?: string; modified?: string; // ISO-8601
  revision?: number; application?: string; appVersion?: string;
}

interface FontRef {                    // fidelity
  family: string; embedded?: boolean; partPath?: string;  // part carried in deck.carry when embedded
  fallbacks?: string[];
}

interface AssetRef {                   // fidelity — mirrors the image asset descriptor (§6.4)
  assetId: Id; pathname: string; contentType: string; byteSize?: number;
  width?: number; height?: number;
}
```

> **Slide-order safety.** `slides` is an ordered array *in the persisted JSON*, but the live
> collaborative document represents order as a List-with-Move with LWW fractional position
> registers (feature spec §13.2). Serialization flattens that to array order; the fractional
> registers are collaboration-runtime state, not part of this schema.

---

## 4. Slide

```ts
interface Slide {
  id: Id;                              // core
  name?: string;                       // core — rail label
  elements: Element[];                 // core — flat, ordered; the sole rendered truth; non-empty & renderable (§10)
  background?: Background;              // core
  speakerNotes?: string | RichText;    // core (string) / fidelity (RichText from a PPTX notes slide)
  transition?: Transition;             // core
  hidden?: boolean;                    // core — skipped in present/export unless forced

  animations?: Animation[];            // fidelity — slide-scoped timeline
  layoutRef?: LayoutRef;               // fidelity — PPTX master/layout/placeholder provenance
  legacy?: { bullets?: string[]; body?: string; visualCue?: string };  // fidelity — derived metadata, never rendered

  carry?: Carry[];                     // carry
  x?: Record<string, unknown>;         // extension
}

interface Background {                 // core (solid) + fidelity (gradient/image)
  fill: Fill;
}

interface LayoutRef {                  // fidelity — inheritance is resolved into concrete element props;
  masterId?: string; layoutId?: string;// this only records provenance for round-trip.
  layoutName?: string;                 // e.g. "Title and Content"
  placeholders?: Array<{ elementId: Id; type: PlaceholderType; idx?: number }>;
}

type PlaceholderType =                 // fidelity — also surfaced on elements as componentRole
  | 'title' | 'ctrTitle' | 'subTitle' | 'body' | 'pic' | 'chart' | 'tbl'
  | 'dt' | 'sldNum' | 'ftr' | 'hdr' | 'media' | 'obj';
```

---

## 5. Element base

Every element member spreads this base and adds a `type` discriminator.

```ts
interface BaseElement {
  id: Id;                              // core
  type: ElementType;                   // core — discriminant
  layout: Layout;                      // core
  name?: string;                       // core
  groupId?: Id;                        // core — membership in a `group` element (flat)
  sizing?: Sizing;                     // core — auto-layout participation
  locked?: boolean; hidden?: boolean;  // core — respected by selection, render, keyboard, export
  opacity?: Unit;                      // core — element alpha 0..1
  sourceLink?: SourceLink;             // core
  componentRole?: string;              // core — semantic role / PPTX placeholder type
  blockTemplateId?: string;            // core — palette block a factory produced it from
  effects?: Effects;                   // fidelity
  link?: Hyperlink;                    // core — click action on the whole element
  animations?: Animation[];            // fidelity — element-scoped
  carry?: Carry[];                     // carry — unmodelled aspects of THIS element
  x?: Record<string, unknown>;         // extension
}

type ElementType =
  | 'text' | 'stat' | 'chart' | 'image' | 'line'
  | 'shape' | 'table' | 'group' | 'widget' | 'embed';

type Element =
  | TextElement | StatElement | ChartElement | ImageElement | LineElement
  | ShapeElement | TableElement | GroupElement | WidgetElement | EmbedElement;
```

---

## 6. Element types

### 6.1 `text`

```ts
interface TextElement extends BaseElement {
  type: 'text';
  text: string;                        // core — plain text (also the a11y/search fallback)
  size?: Px;                           // core — body ≥16px at 1280×720 (per-medium minimums, feature spec §4)
  font?: 'sans' | 'serif' | string;    // core — family keyword or an explicit family (fidelity)
  align?: 'left' | 'center' | 'right' | 'justify';   // core
  color?: Color;                       // core
  weight?: number | 'regular' | 'medium' | 'semibold' | 'bold';  // core
  tracking?: number;                   // core — letter spacing

  rich?: RichText;                     // fidelity — authoritative when present; `text` is the flattened fallback
  frame?: TextBody;                    // fidelity — text-frame / autofit / anchor / insets / columns
  fill?: Fill;                         // fidelity — text-box background
  stroke?: Stroke;                     // fidelity — text-box border
}
```

### 6.2 `stat`

Lecturn-native KPI block. **No PPTX equivalent** — a PPTX import never produces a `stat`; it
produces `text`/`group`. Emitting to PPTX renders it as grouped text/shape.

```ts
interface StatElement extends BaseElement {
  type: 'stat';
  value: string;                       // core — the figure ("$4.2M", "12%")
  label?: string; unit?: string;       // core
  delta?: string;                      // core — "+12%"
  trend?: 'up' | 'down' | 'flat';      // core
  color?: Color; accent?: Color;       // core
  variant?: string;                    // core — circle/bar/dot-grid/star… (block-template driven)
}
```

### 6.3 `chart`

Native charts carry a data model; imported PPTX charts additionally carry the exact chart XML
(`carry`, F1) so nothing is lost, plus an optional raster `fallback` (F2) when the native
renderer cannot reproduce an exotic sub-option.

```ts
interface ChartElement extends BaseElement {
  type: 'chart';
  chart: 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut'
       | 'scatter' | 'combo' | 'radar' | 'funnel';   // core
  series: ChartSeries[];               // core
  categories?: string[];               // core
  options?: ChartOptions;              // core
  data?: ChartData;                    // fidelity — literal cached values from an imported chart
}

interface ChartSeries {                // core
  name?: string; values: number[];
  color?: Color; kind?: ChartElement['chart']; axis?: 'y' | 'y2';
}
interface ChartOptions {               // core
  legend?: 'none' | 'top' | 'bottom' | 'left' | 'right';
  stacked?: boolean; showValues?: boolean;
  xTitle?: string; yTitle?: string;
}
interface ChartData {                  // fidelity — verbatim import snapshot; carry holds the real chartML
  categories: string[];
  series: Array<{ name?: string; points: Array<number | null> }>;
}
```

### 6.4 `image`

```ts
interface ImageElement extends BaseElement {
  type: 'image';
  url?: string;                        // core — stable authenticated proxy URL (never base64, never public)
  alt?: string;                        // core

  assetId?: Id;                        // fidelity — private-blob asset id
  asset?: AssetDescriptor;             // fidelity — the persisted binary's metadata
  imageKind?: 'photo' | 'illustration' | 'background' | 'motif' | 'graphic' | 'imported';  // fidelity
  crop?: Insets;                       // fidelity — srcRect crop (also expressible via layout+flip)
  recolor?: { mode: 'duotone' | 'grayscale' | 'tint'; colors?: Color[] };  // fidelity

  // AI-image provenance (feature spec §11)
  generationPrompt?: string;           // fidelity
  modelId?: string;                    // fidelity
  providerMetadata?: Record<string, unknown>;   // fidelity
  provenance?: string;                 // fidelity — "generated" | "imported:pptx" | "uploaded"
  labels?: string[];                   // fidelity — grounded labels (never model-invented)

  imageRequest?: ImageRequest;         // runtime→transient — MUST be resolved to a real url before persistence
}

interface AssetDescriptor {            // fidelity
  pathname: string; contentType: string; byteSize: number; width: number; height: number;
}
interface ImageRequest {               // transient — never persisted with the deck
  kind: 'image' | 'labeled-graphic';
  prompt: string; modelTier: 'LITE' | 'GRAPHIC';
  targetLayout?: Partial<Layout>; altText?: string; labels?: string[];
}
```

### 6.5 `line`

```ts
interface LineElement extends BaseElement {
  type: 'line';
  variant?: 'line' | 'line-arrow';     // core — arrow renders as filled block-arrow geometry
  stroke: Stroke;                      // core
  // endpoints are the layout bbox diagonal, oriented by layout.flipH/flipV; explicit form is fidelity:
  points?: { x1: Px; y1: Px; x2: Px; y2: Px };            // fidelity
  connector?: {                        // fidelity — a bound connector (cxnSp)
    from?: { elementId: Id; site?: number };
    to?: { elementId: Id; site?: number };
    routing?: 'straight' | 'elbow' | 'curved';
  };
}
```

### 6.6 `shape`

The common shapes are a small enum; the full PPTX preset library (≈187 geometries) and arbitrary
custom paths are captured by `preset`/`path` without bloating the core.

```ts
interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: 'rect' | 'round-rect' | 'ellipse' | 'ring' | 'triangle' | 'line-arrow'   // core
       | 'preset' | 'custom';          // fidelity discriminators
  fill?: Fill;                         // core (solid) / fidelity (gradient/image/pattern)
  stroke?: Stroke;                     // core (color+width) / fidelity (dash/heads/…)
  strokeWidth?: Px;                    // core — convenience alias for stroke.width
  radius?: Px;                         // core — corner radius for round-rect
  text?: string | RichText;            // core (string) / fidelity (RichText) — centred text
  frame?: TextBody;                    // fidelity — text frame for the centred text

  preset?: string;                     // fidelity — DrawingML preset name when shape==='preset' (e.g. "chevron")
  adjust?: number[];                   // fidelity — adjustment-handle values for the preset
  path?: CustomGeometry;               // fidelity — when shape==='custom'
}

interface CustomGeometry {             // fidelity — path-based geometry (custGeom)
  viewBox: { w: Px; h: Px };
  paths: Array<{ d: string; fill?: boolean; stroke?: boolean }>;   // SVG-style path data
}
```

### 6.7 `table`

The core accepts a plain grid of strings; import writes the full per-cell model with merges,
spans, and per-side borders.

```ts
interface TableElement extends BaseElement {
  type: 'table';
  rows: Array<Array<string | TableCell>>;   // core — a cell is a string, or a rich TableCell (fidelity)
  headerRow?: boolean;                 // core
  borderColor?: Color;                 // core
  fill?: Color;                        // core — default cell fill
  textColor?: Color;                   // core
  fontSize?: Px;                       // core

  columns?: Array<{ w: Px }>;          // fidelity — column widths
  rowHeights?: Px[];                   // fidelity
  style?: string;                      // fidelity — table style id (e.g. "medium-2")
  banding?: { rows?: boolean; cols?: boolean };   // fidelity
  firstCol?: boolean; lastRow?: boolean; lastCol?: boolean;  // fidelity — style toggles
}

interface TableCell {                  // fidelity
  text?: string; rich?: RichText;
  fill?: Fill; align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  borders?: { t?: Stroke; r?: Stroke; b?: Stroke; l?: Stroke };
  colSpan?: number; rowSpan?: number;  // merge origin
  merged?: boolean;                    // true on a cell covered by a span origin (rendered empty)
  margins?: Insets;
}
```

### 6.8 `group`

One element serves **both** layout paradigms. With `autoLayout` it is a reflowing container
(Lecturn-native, feature spec §7). Without it, it is a plain **transform/visual group** — which
is exactly what a PPTX `grpSp` imports as (child transforms are flattened into absolute canvas
coordinates at import; the original group transform is carried for lossless round-trip).

```ts
interface GroupElement extends BaseElement {
  type: 'group';
  autoLayout?: AutoLayout;             // core — present → reflow container; absent → plain visual group
  groupTransform?: {                   // fidelity — original PPTX chOff/chExt for exact re-emit
    childOffset: { x: Px; y: Px }; childExtent: { w: Px; h: Px };
  };
}

interface AutoLayout {                 // core
  direction: 'row' | 'column' | 'wrap';
  gap?: Px;
  padding?: Insets;
  align?: 'start' | 'center' | 'end' | 'stretch';    // cross-axis
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';  // main-axis
  wrap?: boolean;
}
```

> Children reference the group via `element.groupId === group.id`. Rendered as a transparent
> frame; children render individually by z-order. Never nested arrays.

### 6.9 `widget` (live audience element)

Native-only (no PPTX equivalent). Config persists; **live tallies are runtime**, never in the
document.

```ts
interface WidgetElement extends BaseElement {
  type: 'widget';
  widget: 'poll' | 'reaction' | 'scale';   // core
  config: PollConfig | ReactionConfig | ScaleConfig;   // core
  // results?: never — runtime only (feature spec §14.3)
}
interface PollConfig { question: string; options: string[]; multi?: boolean; }
interface ReactionConfig { emojis: string[]; }
interface ScaleConfig { label: string; min: number; max: number; leftLabel?: string; rightLabel?: string; }
```

### 6.10 `embed`

```ts
interface EmbedElement extends BaseElement {
  type: 'embed';
  embed: 'iframe' | 'video' | 'url';   // core
  src: string;                         // core
  poster?: { assetId?: Id; url?: string };   // core — still frame for video/first paint
  isolation?: boolean;                 // core — event isolation so interaction never drives slide nav (feature spec §14.4)
  sandbox?: string[];                  // fidelity — iframe sandbox tokens
  mediaPart?: { path: string };        // fidelity — carried media part for an imported PPTX video/audio
  autoplay?: boolean; loop?: boolean; muted?: boolean;   // core
}
```

---

## 7. Theme snapshot

The deck freezes the brand spec it renders against, so deleting the library theme never breaks
the deck (feature spec §9.2). Both the raw `DESIGN.md` **and** parsed tokens are kept.

```ts
interface ThemeSnapshot {              // core
  themeId?: string;                    // reference to the library theme it came from
  designMd: string;                    // the raw DESIGN.md text (portable brand spec)
  tokens: ThemeTokens;                 // parsed snapshot, so canvas/picker consume without re-parsing
  source?: { kind: 'website' | 'deck' | 'manual'; ref?: string };   // fidelity
}

interface ThemeTokens {                // core
  colors: Partial<Record<ColorToken, string>> & Record<string, string>;  // token → hex
  typography: {
    heading?: FontSpec; body?: FontSpec; mono?: FontSpec;
    scale?: Record<string, Px>;        // e.g. { title: 44, h1: 32, body: 18 }
  };
  rounded?: Px;                        // corner radius token
  spacing?: number[];                  // spacing scale
  backgrounds?: string[];              // ~6 on-brand slide-background swatches
  chart?: { palette: string[] };       // chart colour tokens
}
interface FontSpec { family: string; weights?: number[]; }
```

---

## 8. Import report & provenance

Populated on every import; the honest accounting that makes "no silent loss" auditable
(feature spec §15.3).

```ts
interface ImportReport {               // fidelity
  source: { kind: 'pptx' | 'pdf' | 'gslides'; filename?: string; application?: string; appVersion?: string };
  originalSize: { w: Px; h: Px; type?: '16:9' | '4:3' | 'custom' };
  emuPerPx?: number;                   // conversion factor used (default 9525)
  counts: Record<FidelityClass, number>;
  notes: Array<{
    slideId?: Id; elementId?: Id;
    class: FidelityClass;
    construct: string;                 // e.g. "SmartArt diagram", "OLE object", "animation timing"
    message: string;                   // what happened, in plain language
  }>;
}
```

---

## 9. The AI-facing (model) subset

The generator does **not** author the whole type. It authors a mechanical projection: **the core
fields only**, minus anything a stream can't safely produce. A tiny adapter maps that projection
onto the canonical type; a single canonical parse then validates the result.

- **Included:** `Deck`(core) → `Slide`(core) → `Element` core fields for every type, plus
  `text.text/size/font/align/color/weight`, `shape.shape/fill(solid)/stroke(color,width)/radius/
  text(string)`, `table.rows(strings)/headerRow`, `group.autoLayout`, `stat`, `chart(core)`,
  `image.url/alt` (+ a transient `imageRequest`), `line`, `widget`, `embed(core)`.
- **Excluded from the model wire:** all `// fidelity` and `// carry` fields, `id`s (stamped by
  the insertion surface), `asset`/`assetId`/`provenance` (attached post-generation), `import`,
  `meta`, and every runtime field. **Structured-output constraints:** no numeric `min/max/int`,
  no `minItems`; empty `elements[]` is legal mid-stream and rejected only by the post-parse
  predicate (§10).
- **Budgeted authoring shape.** The model may emit empty strings / explicit sizing placeholders;
  the adapter strips them and maps to canonical. Server-only fields never appear on the wire.

This is the mechanism behind "one canonical schema, both ends" (feature spec §21.1): the AI-facing
schema is a *view* of this document, not a different document.

---

## 10. Validation & conformance

**Reader/writer MUST:**

1. Parse the full type; treat unknown `x*` and all `carry` payloads as opaque and round-trip them
   untouched.
2. Enforce **renderability** by a post-parse predicate, not by the type: a slide's `elements[]`
   must be non-empty and contain ≥1 renderable element, where a `group` counts only if it has ≥1
   non-hidden child. **Validate-and-retry** performs exactly one structural retry on a generated
   slide before a descriptive error — never a silent blank slide.
3. Never fabricate: no mock image urls, no invented chart data, no placeholder that masquerades as
   content. A missing asset resolves to a real loading/error state.
4. Preserve **edit-by-id** data: on any AI mutation, per-element `asset`/`url`/`provenance`/
   `imageKind`/`modelId`/`generationPrompt`/`sourceLink` are carried by `id` even when the edit
   schema cannot express them.

**Importer MUST** classify every source construct as F0/F1/F2/F3 (§2.13), attach `carry` for
F1/F2, a rendered `fallback` for F2, and an `ImportReport` note for F2/F3. A construct it cannot
place at all is an F3 report entry — never a dropped element.

**Modes:**

- **Strict** (machine pipelines): unknown non-`x` element types, duplicate `id`s, out-of-canvas
  geometry beyond a tolerance, and malformed unions are errors.
- **Lenient** (interactive/AI ingestion & import): unknown members are carried, duplicate `id`s
  are re-stamped with a warning, missing optional fidelity fields are never errors.

**Canonical form** (for stable diffs/hashes): keys in declaration order; `schema` first; slides in
order; within a slide, elements by ascending `layout.z` then `id`; omit fields at their default;
colours lowercase hex; numbers shortest round-tripping decimal.

---

## 11. PPTX → schema crosswalk

The complete answer to "anything that might need to be converted in from a PPTX file." Every major
PresentationML / DrawingML construct, and where it lands. `emuPerPx = 9525` (96 dpi); rotations
÷60000; colour transforms ÷1000.

| PPTX / DrawingML construct | → Lecturn schema | Class |
|---|---|---|
| `presentation.xml` `sldSz` (slide size) | `Deck.canvas` (normalized to 1280×720) + `import.originalSize` | F0 |
| `p:sld` (slide) | `Slide` | F0 |
| `p:notes` (notes slide) | `Slide.speakerNotes` (RichText) | F0 |
| slide **layout/master** inheritance | resolved into concrete element props; `Slide.layoutRef` records provenance | F1 |
| `p:spTree` child order | `layout.z` (document order) | F0 |
| `p:sp` + `a:prstGeom` (preset shape) | `shape` (mapped `kind`, else `shape:'preset'` + `preset`/`adjust`) | F0/F1 |
| `p:sp` + `a:custGeom` (custom path) | `shape:'custom'` + `path` (CustomGeometry) | F1 |
| `a:txBody` (paragraphs/runs) | `text.rich` (+ `text` flattened) or `shape.text` | F0 |
| `a:bodyPr` (autofit/anchor/ins/wrap/cols) | `TextBody frame` | F0/F1 |
| `a:pPr` bullets/numbering/indent/spacing | `Paragraph.bullet/level/indent/lineSpacing/…` | F0 |
| `a:rPr` run styling (b/i/u/strike/color/font/size/baseline) | `Run.*` | F0 |
| `a:solidFill` | `Fill{solid}` | F0 |
| `a:gradFill` | `Fill{gradient}` (stops+angle) | F0 |
| `a:blipFill` (on shape) / `p:pic` | `Fill{image}` / `ImageElement` | F0/F1 |
| `a:pattFill` | `Fill{pattern}` | F1 |
| `a:ln` + `a:prstDash` + head/tail | `Stroke` (width/color/dash/heads/cap/join) | F0/F1 |
| `a:effectLst` (outerShdw/innerShdw/glow/reflection/softEdge) | `Effects` | F1, else F2 fallback |
| `a:sp3d` / `a:scene3d` (3-D bevel/rotation) | `Effects.bevel` or raster | F2 |
| `a:xfrm` `rot` / `flipH` / `flipV` | `Layout.rotation/flipH/flipV` | F0 |
| theme/scheme colour + `lumMod`/`lumOff`/`tint`/`shade`/`alpha` | `ThemeColor` + `ColorTransform[]` | F0 |
| `p:pic` + `a:srcRect` (crop) | `ImageElement.crop` | F0 |
| `p:pic` duotone/recolor | `ImageElement.recolor` | F1 |
| `p:cxnSp` (connector) | `LineElement.connector` | F1 |
| `p:grpSp` (group) + `a:chOff`/`a:chExt` | `GroupElement` (no autoLayout) + `groupTransform`; children flattened to absolute | F0/F1 |
| `p:graphicFrame` → `a:tbl` (table) | `TableElement` (per-cell, spans, col/row sizes, style) | F0/F1 |
| `a:tcPr` `gridSpan`/`rowSpan`/`hMerge`/`vMerge` | `TableCell.colSpan/rowSpan/merged` | F0 |
| `p:graphicFrame` → `c:chart` (chart) | `ChartElement.data` + `carry.ooxml` (chartML) | F1, else F2 fallback |
| `p:graphicFrame` → `dgm` (SmartArt) | raster `fallback` + `carry` (diagram parts) | F2 |
| `p:graphicFrame` → OLE / `p:oleObj` | `EmbedElement`/`ImageElement` poster + `carry.part` | F2 |
| `p:pic` **video/audio** media | `EmbedElement{video}` (+ `mediaPart`) or poster image + carried media | F1/F2 |
| `a:hlinkClick` / `p:cNvPr` action | `Hyperlink` (url/slide/nav/file) | F0 |
| `p:ph` (placeholder) | `element.componentRole` + `LayoutRef.placeholders` | F1 |
| `p:bg` (slide background: solid/grad/blip) | `Slide.background.fill` | F0/F1 |
| `p:transition` (slide transition) | `Slide.transition` (mapped set) + `carry` for exotics | F1/F2 |
| `p:timing` (animation timeline) | `Animation[]` (common effects) + `carry` for the rest | F1/F2 |
| `a:latin`/`a:ea`/`a:cs` fonts, embedded fonts | `Run.font` / `Deck.fonts` (+ carried font parts) | F0/F1 |
| `docProps/core.xml` + `app.xml` | `Deck.meta` | F0 |
| `vbaProject.bin` (macros) | `Deck.carry.part` — carried **inert**, never executed | F1 (carried) |
| any unrecognized part / construct | `carry` (F1/F2) or `ImportReport` note (F3) | F1–F3 |

**Import invariants:** (1) every source shape yields exactly one element or one carry entry —
counts reconcile; (2) no F2/F3 without an `ImportReport` note; (3) no F2 without a real rendered
fallback asset; (4) SSRF/path protections apply to every carried part path (canonicalized; no new
fetch paths); (5) macro-bearing parts are carried inert and re-emission into a macro-enabled
container requires explicit consent.

---

## 12. Worked example

A two-slide deck: a native title slide (AI-authorable core only) and an imported slide with a
carried SmartArt diagram (fidelity + carry).

```json
{
  "schema": "lecturn.deck/1",
  "id": "dck_9Fk2",
  "title": "Q3 Review",
  "canvas": { "w": 1280, "h": 720 },
  "templateId": "tmpl_editorial",
  "status": "draft",
  "theme": {
    "themeId": "thm_north",
    "designMd": "---\nname: North\ncolors:\n  primary: \"#1F3FA6\"\n---\n# North\n…",
    "tokens": {
      "colors": { "accent1": "#1f3fa6", "text1": "#141414", "bg1": "#ffffff" },
      "typography": { "heading": { "family": "Inter" }, "body": { "family": "Inter" },
                      "scale": { "title": 44, "body": 18 } },
      "rounded": 8,
      "backgrounds": ["#ffffff", "#f4f6fb", "#1f3fa6"]
    }
  },
  "slides": [
    {
      "id": "sld_01",
      "name": "Cover",
      "background": { "fill": { "type": "solid", "color": "bg1" } },
      "elements": [
        {
          "id": "el_title", "type": "text",
          "layout": { "x": 96, "y": 250, "w": 900, "h": 120, "z": 1 },
          "text": "Third Quarter Review", "size": 44, "font": "sans",
          "align": "left", "color": "text1", "weight": "bold",
          "componentRole": "title"
        },
        {
          "id": "el_kpi", "type": "stat",
          "layout": { "x": 96, "y": 400, "w": 260, "h": 140, "z": 2 },
          "value": "$4.2M", "label": "Revenue", "delta": "+12%", "trend": "up",
          "accent": "accent1",
          "sourceLink": { "sourceId": "doc_fin_q3", "location": "p.4", "label": "Board pack, p.4" }
        }
      ]
    },
    {
      "id": "sld_02",
      "name": "Org",
      "elements": [
        {
          "id": "el_diagram", "type": "image",
          "layout": { "x": 120, "y": 90, "w": 1040, "h": 540, "z": 1 },
          "alt": "Team org chart",
          "provenance": "imported:pptx", "imageKind": "imported",
          "carry": [{
            "class": "F2",
            "reason": "SmartArt organisation chart — not natively modelled",
            "ooxml": "<dgm:relIds …/>",
            "part": { "path": "ppt/diagrams/data1.xml", "encoding": "utf8", "data": "<dsp:dataModel…" },
            "fallback": { "kind": "image", "assetId": "ast_org1", "w": 1040, "h": 540 }
          }]
        }
      ]
    }
  ],
  "import": {
    "source": { "kind": "pptx", "filename": "q3-review.pptx", "application": "PowerPoint", "appVersion": "16.0" },
    "originalSize": { "w": 1280, "h": 720, "type": "16:9" },
    "emuPerPx": 9525,
    "counts": { "F0": 41, "F1": 6, "F2": 1, "F3": 0 },
    "notes": [
      { "slideId": "sld_02", "elementId": "el_diagram", "class": "F2",
        "construct": "SmartArt diagram",
        "message": "Rendered as an image; original diagram parts carried for lossless re-emit and future editing." }
    ]
  }
}
```

---

## 13. Versioning & evolution

- **`schema: "lecturn.deck/1"`** is the format tag; the number is the **major** version.
- **Additive changes** (new optional field, new enum member, new element `type`, new `carry`
  reason) do **not** bump the major — legacy readers ignore what they don't know, and `x*`/`carry`
  preserve it. This is the migration-free contract (feature spec §4.5, §21.9).
- **Breaking changes** (removing/renaming a field, changing a field's meaning, making an optional
  field required) bump to `lecturn.deck/2` and ship a one-way up-converter. Down-conversion falls
  back to `carry`.
- A new element `type` MUST land in all four parity renderers **and** the PPTX exporter/importer
  in the same change, or it is incomplete (feature spec §5.5, §16.3).

---

## Appendix A — colour token map (Lecturn ⇄ PPTX scheme)

| Lecturn `ColorToken` | PPTX scheme slot | Notes |
|---|---|---|
| `text1` | `dk1` (via `tx1` clrMap) | body/heading text |
| `bg1` | `lt1` (via `bg1` clrMap) | primary background |
| `text2` | `dk2` (via `tx2`) | secondary text |
| `bg2` | `lt2` (via `bg2`) | secondary background |
| `accent1`…`accent6` | `accent1`…`accent6` | brand accents |
| `hyperlink` | `hlink` | |
| `followedHyperlink` | `folHlink` | |

`ColorTransform.kind` maps directly to the DrawingML child elements `a:tint`, `a:shade`,
`a:lumMod`, `a:lumOff`, `a:satMod`, `a:satOff`, `a:hueMod`, `a:alpha` (PPTX values are 1000ths of
a percent → divide by 1000 to get the 0..100 stored here).

## Appendix B — unit conversions (import time only)

| Source unit | To px | Factor |
|---|---|---|
| EMU | px | ÷ 9525 (96 dpi) |
| point (pt) | px | × 96/72 (× 1.3333) |
| centimetre | px | × 37.795 |
| rotation (60000ths°) | degrees | ÷ 60000 |
| colour transform (1000ths %) | percent | ÷ 1000 |

---

*End of schema definition. Companion to `lecturn-feature-technical-spec.md`.*
