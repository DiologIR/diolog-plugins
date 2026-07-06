# AI Slop Check: Detect and Fix Generic AI Aesthetics

Review the current design for the visual tropes that signal "AI-generated template." Fix any found.

These patterns are rejected because they read as default, not intentional. A design that looks like a hundred other AI outputs is a design that fails to look like the user's design.

Each rule below is **positive-first**: lead with the default to reach for, then list the patterns to detect and replace. The order matters — at write-time you should be biased toward the default; at review-time, scan for the detection patterns.

## Phase 1: Identify the surface to review

Find what to review, in order: (1) the HTML/CSS file the user just edited or asked about; (2) files modified in the current session; (3) if unclear, ask which file or component. Read the file. Skim referenced CSS, tokens, and component files so you can resolve actual values.

## Phase 2: Single-pass review for AI tropes

Walk through the design and apply each rule below. Single agent — these patterns are obvious enough that parallel dispatch is overkill.

Report every detection, including uncertain or low-severity ones, with a confidence and severity estimate. Your job at this stage is coverage — filtering happens when you fix (Phase 3) or when the findings are aggregated by `polish-pass`.

### 1. Gradients — flat or subtle, on-tone

**Default:** flat color from the design system, or a subtle on-tone gradient (two stops, low contrast, same hue family). Flat is almost always stronger.

**Detect & replace:** rainbow / 3+ color gradients (`linear-gradient(135deg, #FF00FF, #00FFFF, #FFFF00)` and similar); saturated purple-to-pink, orange-to-pink, or other "trendy" two-color blends on hero backgrounds, buttons, or large surfaces; gradient overlays on imagery that don't improve legibility or hierarchy.

### 2. Emoji — functional or brand-driven only

**Default:** no emoji. Reach for one only if the brand explicitly uses emoji in existing materials, the emoji is functional (a status indicator, a category marker tied to real meaning), or the user asked for them.

**Detect & remove:** emoji prepending headlines, button text, or list items where the brand doesn't use them (`🚀 Get Started`, `✅ Track progress`); repeated emoji as visual filler (`🎉🎉🎉`); emoji as bullet markers when they don't add meaning. If the layout relied on the emoji for visual weight, replace with a real icon from an established system (Feather, Material, Phosphor, Heroicons) or improve the typographic hierarchy.

### 3. Cards — separate with shadow, thin border, or background

**Default:** distinguish cards with a subtle shadow, a thin all-around border, or pure background separation. Reserve `border-left: 4px solid` for actual semantic emphasis (callouts, alerts, status indicators).

**Detect & replace** the exact pattern:

```css
.card { border-radius: 12px; border-left: 4px solid #...; }
```

…used as the *default* card or container style across the design. This combination is so overused it reads as "default SaaS template." Keep the left border only if it's purposeful (a callout, an alert, a status indicator) and used for that meaning specifically, or it's coming from an existing design system you're matching.

### 4. Imagery — real, licensed, or honest placeholder

**Default, in order of preference:** real photography (Unsplash, brand assets); professional illustration (icon library or commissioned); honest placeholder — striped background with monospace label like `product shot (1200×800)`. A placeholder is better than a bad illustration — it signals "asset needed" without pretending to be the real thing.

**Detect & replace:** custom SVG illustrations of people, scenes, abstract concepts not drawn by a skilled illustrator; "AI-style" character illustrations (giant heads, flat-color blobs, identical posing); decorative SVG that's clearly placeholder-quality but presented as final.

### 5. Type — fonts chosen with intent

**Default:** pick a font with intent, matched to the brand's tone or the medium. With no brand to draw from, suggest 2–3 alternatives that match the design's tone (geometric, humanist, modern, classical) and let the user pick.

**Detect & question** bare use of Inter, Roboto, Arial, Fraunces, or bare system stacks (`-apple-system, sans-serif` with no actual font choice) used as silent defaults without a brand reason. Keep them only if the brand specifies them, the user asked for them, or they're appropriate for the medium and the user has confirmed. Do not silently swap one generic for another.

**Serif discipline.** "Creative brief = serif" is itself an AI tell — reach for a serif only when the brand names one, or the aesthetic is genuinely editorial/luxury/publication and you can say why *this* serif fits *this* brand. Fraunces and Instrument Serif are banned as defaults (the two LLM-favorite display serifs). For in-headline emphasis, use italic or bold of the **same family** — never inject a lone serif word into a sans headline for "visual interest"; mixed-family emphasis reads amateur. When italic display text contains a descender (`y g j p q`), `line-height: 1` clips it — use ≥1.1 and reserve a few px below; audit every italic display word.

### 6. Color — subtly toned whites and blacks

**Default:** whites and blacks subtly toned to match the palette. Warm: `#FFFAF0` bg / `#2D2118` text. Cool: `#F5F7FA` bg / `#1F2937` text. Neutral: `#FAFAFA` bg / `#1A1A1A` text.

**Detect & replace:** exact `#FFFFFF` background paired with exact `#000000` text. The combination is harsh, cold, and reads as unfinished.

### 7. Color values — trace to a token or harmonious palette

**Default:** every color value should trace to a design token, brand variable, or `oklch()`-derived harmonious palette. If creating a palette from scratch, use `oklch()` to keep lightness and chroma consistent across hues.

**Detect & consolidate:** color values that don't trace anywhere. Five different blues across the file (`#0066CC`, `#0077DD`, `#3498DB`, `#3B82F6`, `#5B8DEF`) is a smell — colors were invented inline. More than ~12 raw hex values outside `:root` means tokens weren't honoured — consolidate into custom properties. And treat the default Tailwind indigo family as an automatic fail when used as the accent: `#6366F1`, `#4F46E5`, `#4338CA`, `#3730A3`, `#8B5CF6`, `#7C3AED`, `#A855F7`. Indigo is the textbook AI tell; replace with the committed accent.

### 8. Spacing — snap to a 4px or 8px scale

**Default:** define spacing tokens (`--space-xs: 4px` through `--space-2xl: 64px`) and use them. Multiples of 4 or 8 feel intentional.

**Detect & replace:** off-scale values like `padding: 7px 15px`, `margin: 18px`, `gap: 13px`. They feel chaotic.

### 9. The editorial-warm house style — deliberate or absent

**Default:** an aesthetic direction chosen for the brief (see `frontend-aesthetic-direction.md`). The warm-editorial look is legitimate for editorial, hospitality, and portfolio work — when it traces to a brand or an explicitly committed direction.

**Detect & question** the combination, absent a brand reason: cream / warm off-white page backgrounds in the `#F4F1EA` family; serif display faces as silent defaults (Georgia, Playfair Display, Fraunces); italic word-accents in headlines; terracotta / amber accent palette.

Any one of these can be a deliberate choice. All of them together — especially on a dashboard, dev tool, fintech, healthcare, or enterprise surface — is the default-template look, today's equivalent of the purple gradient. Replace with the committed direction, or flag for the user if no direction exists.

**Its successor default: the premium-consumer palette.** For premium-consumer briefs (cookware, wellness, artisan goods, DTC home) the model now defaults to warm beige/cream backgrounds + brass/clay/oxblood accents + espresso near-black text. That palette on every premium brief makes the brand invisible. Acceptable only when the brief names those colors or the identity is genuinely vintage-craft. Otherwise rotate to a different family: **Cold Luxury** (silver-grey + chrome + smoke), **Forest** (deep green + bone + amber), **Black-and-Tan** (true off-black + warm tan, no beige), **Cobalt + Cream**, **Terracotta + Slate**, or **monochrome + one saturated pop**. Never ship the beige+brass family twice in a row.

### 10. Hero — one moment, max 4 text elements

**Default:** eyebrow *or* brand strip (or neither), headline (max 2 lines desktop), subtext (≤20 words), CTAs (1 primary + at most 1 secondary). Top padding ≤6rem — more and the content floats mid-viewport and reads as a bug. A 4-line hero headline is always a font-size error, never a copy-length problem.

**Detect & remove** extra hero tenants: tiny taglines below CTAs, trust micro-strips, pricing teasers, feature bullet lists, social-proof avatar rows — all move to their own sections below. Logo walls live under the hero, never inside it.

### 11. Layout rhythm — vary the section families

**Default:** a page of 8 sections uses at least 4 different layout families; density alternates (one tight section, one breathing one).

**Detect & fix:** the same layout family (3-column cards, split text-image, full-width quote) appearing more than once per page; more than 2 consecutive zigzag (image-left/image-right alternating) sections — break the third with a full-width or vertical-stack section; **eyebrows over every section header** — ration to max 1 eyebrow per 3 sections (hero counts), and when in doubt drop it: the headline alone is enough; bento grids with filler — a bento has exactly as many cells as you have content for (3 items → 3 cells; an empty tile means the grid shape is wrong, reshape it).

### 12. CTAs and nav — one label per intent

**Detect & fix:** two CTAs with the same intent under different labels ("Get in touch" + "Contact us" + "Let's talk" are all *contact*) — pick one label and reuse it everywhere on the page; CTA text that wraps at desktop (shorten to ≤3 words or widen the button — a wrapped CTA is broken, full stop); nav taller than 80px or wrapping to two lines at desktop (64–72px is the healthy default).

### 13. Content tells — decoration that screams AI

**Detect & remove**, all banned as defaults: fake product UI built from `<div>` rectangles (fake dashboards, task lists, terminals — use a real screenshot, a generated image, or nothing); version labels as hero eyebrows (`V0.6`, `BETA`, `EARLY ACCESS`) and version footers on marketing pages (`v1.4.2 · last sync 4s ago`); section-number eyebrows (`001 · Capabilities`, `00 / INDEX`) — eyebrows name topics, they don't enumerate; decorative colored status dots on nav items, list rows, and badges (a dot only when it conveys real live state, max one per section); locale/time/weather strips ("Lisbon 14:23 · 18°C") unless the brief is genuinely about place; scroll cues ("Scroll to explore", animated mouse icons — the user knows what scrolling is); photo-credit-style captions as decoration (`Plate 03 · House archive`) — credit only real photographers; poetic section labels ("Field notes", "On our desks") — use plain functional labels or none; generic step labels ("Step 1 / Step 2 / Phase 01") — the verb is the label ("Install", "Configure", "Ship"); the middle-dot rationed to max 1 per metadata line, never the universal separator.

### 14. Sample data — kill the Jane Doe effect

**Default:** believable, specific, slightly messy data. Locale-appropriate realistic names (never "John Doe" / "Sarah Chan"), photo-style avatars (never the SVG egg or a user icon), organic numbers (`47.2%`, `+1 (312) 847-1928` — never `99.99%`, `50%`, `1234567`), contextual brand names that sound real (never Acme, Nexus, SmartFlow, Cloudly), concrete verbs (never Elevate, Seamless, Unleash, Revolutionize, Next-Gen). Testimonial quotes are ≤3 lines — a landing-page quote is a snippet, not the review — with real attribution: name + role (+ company), never "— Sarah".

### 15. Theme lock — one theme per page

**Default:** pick light, dark, or `prefers-color-scheme` at the page level and lock it. Background tints within the theme family are fine; a light warm-paper section sandwiched mid-scroll into a dark page reads as walking into a different website. One deliberate full theme-switch device is allowed only when the brief calls for it. If the page supports both modes, **test both before shipping** — half-themed dark mode is worse than none.

## Phase 3: Fix and summarize

Apply fixes directly. For decisions where multiple options are reasonable (e.g. which non-Inter font to use), pick the most defensible default and note the choice in your summary so the user can override.

**Copy self-audit before ship.** Re-read every visible string — headlines, eyebrows, buttons, captions, alt text, footer. Flag and rewrite anything grammatically broken, with unclear referents, or that reads like an LLM trying to sound thoughtful (forced metaphors, mock-poetic micro-meta, fake-craftsman humility). If unsure whether a string makes sense, replace it with a plain functional sentence — AI-cute copy is worse than boring copy.

**The 80/20 soul rule.** Slop removal isn't the same as soul. Aim for ~80% proven patterns + ~20% distinctive choice: one bold visual move, voice in the microcopy ("Start tracking" beats "Get started"), one memorable micro-interaction, one detail only someone who used the product would add. The screenshot test: if someone outside the project can look at a screenshot and say which product it is, the design has soul; if not, you shipped a template.

When done, summarize: tropes found by category; fixes applied; open questions for the user (font choice, asset replacement, etc.).
