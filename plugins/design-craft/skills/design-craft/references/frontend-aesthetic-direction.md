# Frontend Aesthetic Direction: Commit to a Look When No Brand Exists

Establish an aesthetic direction (typography, color, density, mood, component style) when the user is designing without an existing brand or design system. Use this **before** drawing hi-fi work in a greenfield context.

**Mocking a hi-fi design from scratch without committing to an aesthetic is the fastest path to AI-template aesthetics.** Without a deliberate direction, you default to safe, generic, indistinct designs. Pick a direction first, then design within it.

## Phase 1: Confirm there's truly no existing context

Before committing to a new direction, double-check that no existing context applies:

- No brand guide
- No existing app or product to match
- No reference site the user explicitly wants to mimic
- No partial design system in the codebase

If any of these exist, **stop and use them** instead. Aesthetic direction is for true greenfield. If the user has a brand and forgot to attach it, ask for it before proceeding.

Also check for a **local design-system library** (on this user's machine: `~/Dev/open-design/design-systems/` — 150+ portable `DESIGN.md` systems). Two uses here: a brief that names or clearly evokes a brand ("something like Linear", "Stripe-quality") gets the actual system as context rather than your memory of it; and when proposing the 4 directions below, a well-authored library system (atelier-zero, kami, a strong product system) can *be* one of the candidates, tokens and all. Skim before trusting — entries with generic default palettes are boilerplate, not direction.

## Phase 2: Discover the intent

Ask the user (or confirm if they've stated):

- **Three adjectives** that describe the desired feel. ("Editorial / serious / spacious" vs "Playful / bold / loud" vs "Minimal / quiet / utilitarian.")
- **Audience.** B2B engineers respond to different aesthetics than consumer or editorial audiences.
- **Industry context.** SaaS, consumer, editorial, fintech, healthcare, government — each has its own reasonable defaults.
- **Reference designs they admire.** Specific brands, sites, or apps. Ask what specifically they admire — the type, the spacing, the color, the tone, the density?
- **Off-limits.** What aesthetics or tropes does the user explicitly want to avoid?

**Mine the subject before consulting the map.** Pin down one concrete subject, its audience, and the surface's single job (state your choice if the brief leaves it open). The subject's own world — its materials, instruments, artifacts, and vernacular — is where non-template choices come from: a coffee brand suggests crema tones and kraft textures; a synth plugin suggests panel silkscreen type and patch-cable color; a climbing gym suggests chalk, rope weaves, topo lines. Subject-mining tells you *which* family to pick and how to remix it; the range map alone produces family-generic output. Anything you remember about this user's prior designs or preferences counts as context too.

Set three dials (1–10) from the brief and say them out loud — they calibrate everything downstream: **VARIANCE** (how far from category convention), **MOTION** (how much movement), **DENSITY** (how much per screen). A Linear-style dev tool reads ~5/3/2; a public-sector portal ~3/2/5; a festival site ~9/8/4. If the brief reads as an established design system (Material, Fluent, Carbon, Polaris, GOV.UK), **install the official package rather than hand-faking its CSS** — one system per project; aesthetics like glassmorphism or brutalism have no official package, so build them honestly and label approximations.

If the user is unsure, propose **4 distinct visual directions**, each specified concretely — background hex / accent hex / display + body typeface, with a one-line rationale tied to the brief — and let them pick. Draw them from different rows of the range map below; the directions must not share a palette family (four takes on warm-cream is one direction, not four), and at least one must be deliberately off-distribution. Ship each direction as a complete drop-in `:root` block (5–6 color tokens + font stacks) plus 4–6 "posture" bullets (border weight, radius, accent budget, motion mode, what to avoid) — once chosen, that block is binding. (The `AskUserQuestion` tool's `preview` field is ideal here — show each direction as a small swatch/type sample so the user compares them side by side.)

### The range map — named aesthetic families

Real variety is picked from a map, not hoped for. Each family names its tokens so a direction is buildable, not a vibe. **Never converge on the same family across consecutive projects or variation rounds** — repetition across generations is how a house style calcifies into a template.

| Family | Type | Color & surface | Signature moves |
|---|---|---|---|
| **Swiss / International** | One grotesk (Helvetica Now, Suisse), tight scale | Near-white, near-black, ONE red or blue | Hard grid, exposed structure, no radius, no shadow |
| **Editorial / literary** | Modern serif display + humanist sans | Toned paper, ink, one warm accent | Drop caps, pull quotes, column rhythm, generous leading |
| **Brutalist / raw** | Mono or grotesk, oversized | Unmixed primaries or b/w, visible borders | Default-looking controls, hard shadows (4px offset, no blur), marquees |
| **Neo-grotesque product** (Linear/Vercel) | Inter-class sans but tracked and weighted deliberately | Dark or light neutral ramp, one electric accent | Subtle borders, glass panels, glow accents, dense-calm layouts |
| **Luxury / fashion** | High-contrast serif (Canela, Didot-class), airy caps | Cream/black or monochrome + metallic restraint | Huge whitespace, small centered nav, full-bleed photography |
| **Playful / toy** | Rounded sans (Nunito-class), chunky weights | Saturated pastels, 2–3 hues | Pill everything, springy motion, sticker shadows |
| **Terminal / hacker** | Mono everywhere | Black/green or black/amber, scanline grain | Box-drawing chars, blinking cursor, log aesthetics |
| **Retro-futurist / Y2K** | Extended/condensed pairings, chrome effects | Gradients earned: chrome, iridescent mesh | Outlines, starbursts, pixel dither, marquee energy |
| **Organic / soft** | Low-contrast humanist faces | Earth tones, blurred mesh backgrounds | Blob masks, grain, hand-feel spacing irregularity |
| **Industrial / utilitarian** | DIN/Univers-class, all-caps labels | Concrete neutrals, safety-orange accent | Rulers, specs, stencils, exposed metadata (ISO-style) |

These are starting points to remix, not costumes: pull one family's type with another's surface treatment when the brief supports it. Match implementation complexity to the vision — maximalism needs elaborate effects executed fully; minimalism needs restraint and precision. Half-committed is the only wrong dose.

Two rows carry a warning: **Neo-grotesque product (dark neutral + one electric/acid accent)** and **Editorial/literary** are the looks current models reach for unprompted on dev-tool and creative briefs respectively — choosing them requires the same stated reason the warm-editorial combination does (see `ai-slop-check.md` §9's three-look family).

## Phase 3: Commit to the system — make it concrete

Vocalize your decisions as a comment block at the top of the file the user can see. **Be specific.** Vague aesthetic statements ("modern and clean") produce generic designs.

Commit on each axis:

### Typography

Pick **specific** fonts (not "a sans-serif"):

- **Headline font** — name, weight, size scale
- **Body font** — name (often the same family), weight, size scale
- **Mono font** (if needed for code) — name
- **Utility face** (optional) — for captions, data tables, and metadata on data-heavy surfaces; often the mono doing double duty

Avoid the overused defaults — Inter, Roboto, Arial, bare system stacks, and the silent serif-display defaults (Fraunces, Playfair Display, Georgia-as-display). Pick something with intent: a humanist sans (Söhne, Suisse), a modern serif (Tiempos, GT Sectra), an editorial classic (Tiempos Headline, Canela), a typewriter mono (JetBrains Mono, IBM Plex Mono), a geometric sans (Visby), depending on the mood.

If the user might not have access to a paid foundry, suggest the closest free alternative (e.g. "Inter is overused, but Söhne is paid — try Söhne for production, or Albert Sans / Geist as free alternatives").

Commit to a type scale (sizes, weights, line heights). 1–2 families maximum. **When pairing two faces, pair on a contrast axis** — serif + sans, geometric + humanist, display + text — or use one family in multiple weights. Never pair similar-but-not-identical faces (two geometric sans, two humanist sans): the near-match reads as a mistake, not a choice.

### Color

**First pick a strategy — the commitment axis** (how much of the surface color carries):

- **Restrained** — tinted neutrals + one accent ≤10% of pixels. The product-UI default.
- **Committed** — one saturated color carries 30–60% of the surface. Identity-driven pages.
- **Full palette** — 3–4 named color roles, each used deliberately. Campaigns, data-viz.
- **Drenched** — the surface *is* the color. Heroes and campaign pages.

Choosing Restrained is fine; *defaulting* to it unexamined is how timid, evenly-distributed palettes happen. State the strategy in the direction block.

**Theme (dark vs light) is never a default.** Not dark "because tools look cool dark," not light "to be safe." Before choosing, write one sentence of physical scene: who uses this, where, under what ambient light, in what mood. If the sentence doesn't force the answer, it isn't concrete enough — add detail until it does.

Then pick a tone:

- **Warm** — cream, beige, gold, terracotta, rust
- **Cool** — gray, slate, ice, blue
- **Neutral** — concrete, charcoal, off-white

**The warm-editorial combination (cream background + serif display + terracotta/amber accent) is the current default-model look.** Choose it only when the brief is genuinely editorial, hospitality, or portfolio — and say so explicitly in the direction block. If the direction drifts there without a stated reason, pick again. Its successor default is already visible: **beige/cream + brass/clay/oxblood + espresso** appears unprompted on every cookware/wellness/artisan brief. When a brief pulls that way, deliberately rotate: cold luxury (silver/chrome/smoke), deep forest + bone + amber, black-and-tan, cobalt + cream, terracotta + slate, or monochrome + one saturated pop.

Then pick:

- **Primary brand color** (with light and dark variants)
- **One accent** (optional — a single accent color is often enough)
- **Semantic colors** (success / warning / error / info)
- **Neutral scale** (5–10 steps from near-white to near-black, on the chosen tone)

Use `oklch()` to keep harmony if the palette is from scratch:

```css
--brand-primary: oklch(55% 0.18 250);
--brand-accent:  oklch(70% 0.15 30);
```

**Subtly tone whites and blacks.** Pure `#FFFFFF` and `#000000` is harsh. Match the chosen tone (e.g. `#FAFAFA` warm-neutral, `#1A1A1A` near-black).

**Write the accent budget as enforceable rules, not adjectives.** "Use sparingly" is unenforceable; a frequency, a role ban, and a forbidden value are checkable at review. The pattern (from magazine-grade systems):

- *Frequency:* "one accent moment per viewport-and-a-half — if two CTAs are accent-filled, the section markers drop to muted ink."
- *Role bans:* "the secondary accent is never a CTA — it is jewelry (a single ★, a highlighted stat ring, one annotation dot)."
- *Forbidden values:* "pure white only as inverse text inside the dark panel, never on the paper ground; nothing darker than the committed ink."

Two or three rules of this shape make the direction self-policing — a reviewer (or the swap test) can catch violations mechanically.

### Density

Pick a spacing scale (4px or 8px base) and commit to a density:

- **Tight** — compact dashboards, dense data UIs (smaller padding)
- **Normal** — typical product UI (comfortable padding)
- **Loose** — editorial, marketing, premium feel (generous padding, lots of whitespace)

The density choice is felt as much as seen — it's a major part of the aesthetic.

### Border radius and shadow

- **Sharp** (radius 0–2px) — utilitarian, brutalist, editorial
- **Soft** (radius 4–8px) — typical modern product
- **Pill / fully-rounded** (radius 9999px on buttons; 12–16px on cards) — playful, friendly, consumer

Shadows similarly: sharp / soft / none. Commit to one elevation system, not a mix.

### Component style

- **Filled** — solid backgrounds, primary actions saturated
- **Ghost** — no fill, only border or just text
- **Outlined** — bordered, transparent fill
- **Elevated** — cards float on shadow

Pick a default, with secondary styles for hierarchy.

### Imagery and iconography

- **Photography** — real photos (Unsplash, brand commission, stock)
- **Illustration** — professional library or commission
- **Icons** — Feather, Material, Phosphor, Heroicons, or a paid set
- **Honest placeholders** when assets aren't available

Avoid hand-drawn SVG illustrations.

### Motion

- **Quiet** — minimal motion, transitions only on state changes (200ms ease)
- **Expressive** — entrance animations, scroll-driven reveals, view transitions
- **Playful** — overshoots, springs, micro-interactions on hover

Commit to one mode; mixed motion modes feel unintentional. Whatever the mode, spend the budget in one place: **a single well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.** Implement per `motion-design.md` (tokens, easing curves, choreography).

### Depth and texture

- **Flat** — borders and background contrast only
- **Elevated** — a tokenized shadow/elevation system
- **Textured** — grain, mesh gradients, glass, image treatments
- **Dimensional** — CSS 3D moments or a WebGL centerpiece

Commit alongside the motion mode; implement per `depth-and-3d.md` (the technique ladder, budgets, and fallbacks). Texture is the cheapest "designed, not generated" signal — and the easiest to overdose.

### Signature

Name **the single element this design will be remembered by** — the one place the boldness budget is spent, derived from the subject (Phase 2), while everything around it stays quiet and disciplined. A signature is concrete ("the hero's headline set in the subject's stencil lettering, drawn on scroll"), not a vibe ("memorable typography"). This is the plan-time version of the 80/20 soul rule in `ai-slop-check.md` — commit to the memorable element before writing code rather than hoping one emerges and checking at review.

## Phase 3.5: The swap test — a genericness gate

Before documenting, run the counterfactual: imagine a neighboring brief — a different product in the same category — and ask whether your committed direction would fit it unchanged. Any axis that transfers untouched is a default, not a choice: revise that axis and say what you changed and why. (The anti-convergence rule above only works across sessions; the swap test works inside this one.)

Then run it **one tier deeper**: could someone guess your chosen family from the category *plus your anti-references* alone? "Fintech, but not navy-and-gold → terminal dark" and "AI workflow tool, but not SaaS-cream → editorial-typographic" are second-order reflexes — the predictable alternative is still a reflex. Rework until neither the first-order nor the second-order guess lands.

## Phase 4: Document the direction in the file

Write the chosen direction into the file as a visible block — both as a comment at the top of the source AND as a "design system summary" section in the rendered output. Like a junior designer showing their thinking to their manager.

```
/* Aesthetic direction:
 * Editorial / serious / spacious.
 * - Type: Tiempos Headline (display) + Söhne (body) — paid foundry.
 *   Free alternative: GT Sectra → Albert Sans.
 * - Color: cool-neutral. #FAFAFA bg / #1A1A1A text.
 *   Brand: oklch(55% 0.18 250) deep blue. No accent.
 * - Density: loose. 8px scale, generous padding.
 * - Radius: 4px (sharp-ish). No shadow — borders only.
 * - Components: ghost buttons. Filled for primary CTA only.
 * - Imagery: real photography, full-bleed.
 * - Motion: quiet. 200ms ease transitions, no entrance animations.
 * - Signature: full-bleed duotone hero photo with the headline knocked out of it.
 */
```

## Phase 5: Apply, then test

Build a small surface (a hero, a card, a button group) using the direction. Show it to the user early. Ask: "Does this read as [the three adjectives you committed to]?" If no — or if the user pushes back on a specific axis — revise the direction before going broader. A direction that works at small scale holds up across a full design; one that doesn't will get worse, not better.

## Phase 6: Use the direction consistently

Every subsequent design should reference the direction's tokens, not invent new values. If a new design needs a value the direction doesn't define, **add it to the direction first**, then use it. Don't introduce one-off values inline. Eventually the direction is mature enough to extract into a tokens file — that's when `design-system-extract` becomes useful.

## Phase 7: Summarize

Report: the three adjectives; the committed type, color, density, radius, component, imagery, and motion choices; any axes the user should review before you go broader; the first surface built using the direction (link to the file).
