# Icon Directions — choosable recipes for generating a mac app icon

Distilled from the 134-icon corpus (`ICONS.md`) and the icon-anatomy rubric. Each **direction** is a style family made buildable: commit to ONE per icon — from this catalogue, a hybrid, or a novel composition the subject earns (declare a novel one with the same rigour: palette recipe, composition recipe, light model, #10 layering plan). Canvas is always 1024×1024 full-bleed; the system applies the squircle mask + drop shadow — design inside the mask, never bake corners or shadow.

> **Calibration flags:** the corpus's template-default is the **stock-glyph-on-blue/indigo ramp** — technically clean, communicates nothing (the `sparkles`-on-indigo problem: it says "AI app", not *this* app). Blue/indigo grounds need positive justification, and the glyph must name this subject, not its category. The glyph idea comes from subject-mining (the device bank below), never from the SF Symbols default set alone.

**The corpus's one load-bearing lesson (read before choosing anything):** 76% of shipping icons hard-fail variant robustness (rubric #10) because they ship a *flat pre-masked raster* — identity carried by a colour relationship that dies under Dark/Clear/Tinted. Every recipe below therefore ends in a **#10 layering clause**: author 2–4 real layers (background / mid / foreground / optional highlight), carry identity in **shape + value**, let colour be the last 10%. Do this and you beat ~88% of the field on the current era's defining gap.

---

## The 8 directions

### 1. Object Tile (Big-Sur descendant)
**Essence:** a photoreal or clay *noun* front-facing on a gradient squircle. The heart of the corpus (~55 icons) and the heart of the #10 failure.
**Exemplars:** cleanmymac (magenta iMac), waterlemon (candy fruit), soulver, presentify, minarah, revone, mymind.
**Palette recipe:** one saturated hue field + one bounded accent. Field ramp light-at-top→darker-bottom within a single hue, e.g. periwinkle `#F3EDFF→#D8CCF5`; reserve the saturated accent (`#EC2DCB` magenta) for the focal object only.
**Composition:** background = single-hue sky ramp (or flat white plate, à la waterlemon) → glyph = the app's literal object, front-facing, top-down baked soft light with a short contact shadow and a modest specular sheen → overlay = none (add a diagonal tool only if the verb is "act on files" → use Direction 7 instead). **Era:** Big Sur; **light:** top-down soft, one source.
**When to choose:** the app has a concrete physical noun and a warm/consumer personality.
**Do:** subject-mine the object; keep ≤2 hue families. **Don't:** float bright-on-white without a darker rim (waterlemon fails #7 at 1.4:1); don't bake gloss as your identity.
**#10:** separate object / field / contact-shadow / specular into layers; make the object's silhouette + internal value read when hue flattens to a mono tint — do not let the field colour be the only thing distinguishing figure from ground.

### 2. Frosted Glass Object (Liquid-Glass, the target era)
**Essence:** a saturated translucent lens/blob floating on a frosted or near-white slab. Only 12% of the corpus wears this era's clothes, and half fake it.
**Exemplars:** codex (glass cloud + `>_`), textsniper, dropzone, room-service, finbar, mux; AI sub-ramp: cursor, inkline, maestri.
**Palette recipe:** one extended analogous ramp on the glass body + a near-white ground + a hue-shifted specular. AI default: violet→blue `#C3AFFE→#A091FF→#5D7CFE→#3333FF` with a *warm* pink-lavender crown bloom `#E0D1FF` (pink light on cool mass = the glass tell).
**Composition:** background = near-white field with a faint glass rim `#FEFEFE→#F1F1F1` → glyph = a translucent glass object carrying an inlaid/knocked-out mono glyph → overlay = the knockout glyph itself (not a tool). **Era:** Liquid Glass; **light:** environmental glass, crown specular + one soft micro-shadow.
**When to choose:** current-era hero icon; AI/dev/agent app; you want to look 2026-native.
**Do:** genuinely separate the glass layer from its ground so tint/dark hold. **Don't:** bake it as one gradient (the trap 6/16 glass-era icons fell into); don't let a thin light-on-gradient glyph be the whole read (codex smears at 16px).
**#10:** this is the one direction that can *actually pass* if you author it right — build the glass as its own layer with the glyph as a separate foreground plane over a swappable ground; never depend on the white field for glyph contrast.

### 3. Monochrome Logomark (era-agnostic brand mark)
**Essence:** the brand mark verbatim, zero-to-one hue, silhouette does all the work.
**Exemplars:** notion (N-block), coreviz-studio (hex-nut), cursor, atlas, compresto, mole, caesura, hoolo.
**Palette recipe:** achromatic or one hue. Two tones only — off-white `#F8F8F8` on `#000000` (~19:1), or ink-on-paper `#000` on `#FFF`. No gradient, no accent.
**Composition:** background = flat field (commit to shipping WHITE or BLACK — several corpus assets arrive field-less and float in the Dock) → glyph = negative-space cut or keyline-as-depth mark, optically centred with safe-zone margin → overlay = none. **Era:** custom/flat; **light:** none (flat is internally consistent).
**When to choose:** strong existing brand mark; austere/pro/developer personality; Vercel/Linear/Notion register.
**Do:** lean on counter-space and silhouette (this family passes #3 cleanly — 0/15 fail it). **Don't:** ship field-less; don't rely on a strong silhouette to buy #10 — it does NOT (14/15 members hard-fail #10).
**#10:** the honesty trap — a mono mark is only tint-robust once *authored as layers*. Ship an explicit dark variant + a tint-safe layer where the glyph is a filled shape (not a white-on-black knockout that inverts to invisible on a light tint).

### 4. Dark-Field Emissive (nocturnal focal)
**Essence:** a glow-on-black focal that lights its own ground. Deliberately inverts the top-down-light majority.
**Exemplars:** sero (emissive ring), dropzone, onlook, screen-studio, usage, viaduct, backdrop; spectrum-blob: dia, prostir-zvuku.
**Palette recipe:** near-black cool ground `#161616→#14283C` + ONE adjacent-hue emissive sweep. Sero's conic: electric blue `#189FFC` → pale lavender `#E1D1FF`. Warm alt: amber→red. Saturation lives entirely in the focal.
**Composition:** background = near-black vignetted void → glyph = a single self-luminous focal (ring/aperture/orb) blooming a halo into the black → overlay = none; add a radial center vignette for cheap depth. **Era:** custom dark emblem; **light:** emissive (the glyph IS the source), no scene light.
**When to choose:** AI/utility/menu-bar app; premium nocturnal personality; single strong focal shape.
**Do:** one luminous focal, ruthless restraint; pair the glow with a *carrying shape* (sero passes #10 where alcove fails — because the ring silhouette survives tinting, the glow drama doesn't need to).
**Don't:** rely on the glow surviving a mono tint; don't let the black ground be load-bearing for the read.
**#10:** carry identity in the focal's shape+value, treat the bloom as a top highlight layer that can drop out. Verify the mark still names itself as a flat tinted glyph on a light ground.

### 5. Character Mascot (personality-led)
**Essence:** a personified creature or face carries the brand; warmth over utility.
**Exemplars:** keeby, mole, tono, pokey, zush, bartender-6, glance, slapmac.
**Palette recipe:** friendly 2-hue — a warm body hue + a darker feature accent; or monochrome body + single warm focal (klack's ivory-on-black). Keep the eye/catchlight the brightest value.
**Composition:** background = soft field or transparent → glyph = the mascot with eyes/face as focal, readable silhouette, one catchlight → overlay = none. **Era:** Big Sur clay or skeuomorphic-quote; **light:** soft top-left studio, short AO pool.
**When to choose:** consumer/playful app where personality sells harder than function; the mascot need not state the verb.
**Do:** give it a catchlight and a silhouette that survives filled-black. **Don't:** let charm cost 16px legibility (a molded monogram like klack's "K" smears — recovers only by 32px).
**#10:** layer body / features / catchlight; ensure the face reads as shape+value under tint. A photoreal near-black render (klack) hard-fails #10 and #1 — if you need system-safety, pair it with a proper masked squircle variant.

### 6. Device Portrait (the Mac hardware IS the subject)
**Essence:** the notch, screen, or bezel quoted literally — reads instantly for menu-bar utilities.
**Exemplars:** alcove, dynamiclake, healthynotch, folder-hub, corner-time, tellie, droppy, codeshot.
**Palette recipe:** dark bezel `#0F1012` + a bottom-up screen glow (single hue) as the only chroma; or a cool device-silver. Screen content is the accent, bezel is neutral.
**Composition:** background = the squircle IS the display, or a device sits front-facing → glyph = notch cutout / screen-in-bezel with a bottom-up screen glow → overlay = optional badge. **Era:** Big Sur / Liquid Glass; **light:** screen-emissive from below + soft top rim.
**When to choose:** the app acts on the Mac's hardware (notch, menu bar, display, dock).
**Do:** quote the notch/screen literally. **Don't:** over-detail the bezel — it vanishes small (alcove fails #3 and #10 by leaning on the gradient field, not a shape).
**#10:** the device outline is your carrying shape — keep it a real filled silhouette layer; let the screen glow be a droppable highlight, not the identity.

### 7. Diagonal Tool (Big-Sur cleaner/maintenance)
**Essence:** a maintenance tool crosses the plane at an angle — Apple's TextEdit/Preview grammar.
**Exemplars:** cleanmymac (chrome arm), uninstally (broom), deskminder (needle), sweeper, macusb, dropadoo (paperclip).
**Palette recipe:** one saturated field + a chrome/metal tool ramp `#EDEBF4→#DAD5EE→#C1BED9` that picks up the field's cast + optional sparkle-trail whites.
**Composition:** background = saturated hue field → glyph = single white/object glyph → overlay = a tool laid corner-to-corner (top-left→lower-right), the verb of the app. **Era:** Big Sur; **light:** top/top-left soft, bright tool top-edges.
**When to choose:** ONLY when the verb is literally "act on / clean / fix files." 
**Do:** use the tool as the verb. **Don't:** default to this — it is the most template-worn move in the corpus; thin tool arms smear at 16px and the maintenance metaphor is silhouette-fragile (cleanmymac loses the verb at Dock size).
**#10:** layer field / object / tool / sparkle; the tool must read as shape under tint, not as a specular highlight that disappears.

### 8. Instrument Emblem (data-viz / ring-chart)
**Essence:** the app's own chart or gauge becomes the mark — concentric geometry, category colour.
**Exemplars:** code-meter (gauge), sessionwatcher (bars), spacepeek (donut-as-lens), subscription-day (radar), radial (spinner), pieoneer (pie).
**Palette recipe:** neutral ground + a bounded 1–2 hue encoding. Resist a full legend of hues (smears at 16px, fails #6/#7).
**Composition:** background = flat or subtle ground → glyph = the exact in-product artifact (ring/gauge/bars) at icon scale, concentric → overlay = none. **Era:** Big Sur or flat; **light:** flat or soft top-down.
**When to choose:** monitoring/analytics/disk/time apps where the product's own visualization is iconic.
**Do:** quote the exact object the user will use; double-read it (spacepeek's donut = disk-usage = magnifier lens). **Don't:** carry >2 chart hues; don't let fine tick detail define the read.
**#10:** the ring/gauge silhouette is the carrier — keep it a filled-shape layer; encode data by value/position, not by hue alone, so a tint preserves it.

---

## Picker — app subject/personality → candidate directions

| App is… | Primary | Alt |
|---|---|---|
| Act-on-files / cleaner / installer | 7 Diagonal Tool | 1 Object Tile |
| Strong existing brand mark | 3 Monochrome Logomark | 2 Frosted Glass |
| AI / agent / dev current-era hero | 2 Frosted Glass Object | 4 Dark-Field Emissive |
| Menu-bar / notch / display utility | 6 Device Portrait | 4 Dark-Field Emissive |
| Monitoring / analytics / disk / time | 8 Instrument Emblem | 4 Dark-Field Emissive |
| Consumer with a physical noun | 1 Object Tile | 5 Character Mascot |
| Personality-led / playful | 5 Character Mascot | 1 Object Tile |
| Premium / nocturnal / pro utility | 4 Dark-Field Emissive | 3 Monochrome Logomark |
| Pro / silver / menu-bar-native (palette overlay) | any + Monochrome-metal ramp `#E8EAEE→#A6B1C2→#565B65` | — |

---

## The 12-point rubric — delivery bar ≥10/12, checks 1–4 non-negotiable

1. **Mask discipline** — designed for the squircle; no baked corners/shadow. *(non-negotiable)*
2. **Grid adherence** — optically centred, safe-zone margins; wide glyph→inner square, round→larger circle. *(non-negotiable)*
3. **Silhouette test** — nameable filled solid black. *(non-negotiable — 26 icons fail here)*
4. **16px squint** — survives menu-bar/Spotlight; no detail smear. *(non-negotiable)*
5. Single light model — one source/direction (or deliberately none).
6. Palette economy — ≤2 hue families + ramps; accent reserved for focal.
7. Figure-ground — glyph vs ground ≥3:1; survives grayscale.
8. Depth coherence — planes ordered, shadows match light, no z-fight.
9. Era coherence — one era's language (or a knowing quotation).
10. **Variant robustness** — survives Default/Dark/Clear/Tinted; identity not hostage to one bg colour. *(76% fail — the highest-leverage fix)*
11. Personality — ≥1 nameable device beyond glyph-on-gradient.
12. No-text — no words/screenshots/photos (diegetic monogram OK).

Bar: **≥10/12 with zero failures on 1–4.** Report the score and every #10 liability honestly.

---

## Device bank — 15 subject-mining glyph strategies (strategy, not app-copy)

Draw the app's literal noun/verb before reaching for a stock category glyph. Generalised moves from the corpus:

1. **Numeral/letter-as-object** — the brand initial IS the functional shape (1password: "1" = keyhole slot).
2. **Gesture-as-glyph** — draw the interaction, not the file (unfold: the spacebar key as a debossed ⊔ well).
3. **Result-as-physical-object** — the output lifted as a tangible thing (cleanshot: screenshot peeled off the desktop).
4. **One anatomical detail that means the verb** — a single body part carries "digs/grabs/points" (mole: the digging claw).
5. **Dual-function primitive** — one shape reads as two product concepts (sero: ring = O = zero = lens/portal).
6. **Waterline / fill-level as data** — a boundary doubles as a selected row or level (finbar: fin + waterline = list-row).
7. **Punctuation-as-identity** — the name's typographic mark IS the function (caesura: // = pause).
8. **Prompt-as-face** — CLI glyphs re-read as an emoticon (maestri: `>` eye + `|` cursor eye = winking agent).
9. **Junction/fork where cap-shape carries meaning** — arrowhead vs foot encodes redirect vs stay (mux).
10. **Micro-keypad spelling the feature set** — a 2×2 of domain glyphs (soulver: `$ % clock =`).
11. **Glyph knocked out of a material object** — CLI/prompt inlaid into a glass cloud (codex: cloud-compute + terminal).
12. **Colour/shape mismatch as the name** — the pun lives in one wrong attribute (waterlemon: melon shape, lemon colour).
13. **Descending elements resolving into a direction** — motion implied by a sequence (open-screen-shot: dots → down-arrow = scrolling capture).
14. **Container overflowing with what it manages** — the vessel plus its contents (sweeper: Trash overflowing with discarded apps).
15. **Diegetic molded monogram** — the initial molded INTO a rendered object, catching its light (klack: "K" in the keycap), never typeset over it.

Extended bank (for variety across sessions): **the app's in-product artifact at icon scale** (gauge, treemap, radar); **hardware quotation** (notch, screen, bezel as the subject); **the appliance being serviced** (draw the Mac, not "clean"); **negative-space creature** (hoolo: owl from cuts, "oo" = eyes); **material unrolling to reveal** (walltune: wallpaper peeling); **everyday prop standing in for the verb** (shake-it-on: cursor as maracas); **architectural noun** (viaduct: arch, minarah: minaret); **coin/token doubling as currency AND name** (tokens-4-breakfast).

---

## Anti-sameness rules (vary across a session)

When generating multiple icons in one session, actively diversify — the corpus's failure mode is templated sameness:

- **Vary the direction.** Don't ship three Object Tiles or three violet-glass AI blobs. Rotate families across the picker.
- **Vary the palette family.** Blue + indigo/violet dominate the corpus (271 of recorded chromatic hits) — deliberately reach for the under-used ramps: warm accent (amber/coral), acid-green (`#C6F04C`), monochrome-metal, ink-on-paper. Don't let every icon land on electric blue.
- **Vary the glyph type.** Alternate object / mascot / monogram / abstract-emblem / device-portrait — not all literal-object, not all letterform.
- **Vary the ground.** Mix saturated-field, near-white-float, and near-black-emissive so a set doesn't read as one gradient family.
- **Vary the era knowingly.** Prefer Liquid-Glass layer discipline for current-era heroes, but a deliberate Big-Sur or skeuomorphic quote is legitimate when the personality demands it — just commit, don't drift.
- **Never repeat the diagonal-tool default** across a session — it is the single most worn move; use it once, for the one app whose verb is literally "act on files."
