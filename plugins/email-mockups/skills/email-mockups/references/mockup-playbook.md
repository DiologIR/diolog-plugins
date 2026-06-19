# The email-mockup playbook — impressions, not replicas

Distilled from the original Diolog product-mockup build and a round of marketing
review on a full product-update set. Read this before building. The actual HTML is
produced via the **design-craft** skill (see SKILL.md) — this file is the brief you
hand it: the constraints that make a graphic read as Diolog, sell the feature, and
survive an email.

---

## 1. The golden rule: impressions, not replicas — but rich, not bare

These graphics convey **the idea/impact of a feature at a glance** — they are *not*
literal, pixel-dense screenshots. But "impression" does not mean "sparse and grey".
The single most common failure in review is a graphic that reads as a plain, empty
screenshot. Two ideas pull in tension here; hold both:

- **"Do less" governs SCOPE, not richness.** Cut the *number of things* shown — one
  idea, the rest of the app ghosted away — but make the one thing you keep
  high-fidelity, colourful, and full of believable, tailored detail. A graphic that
  feels empty is a *composition* problem; fix it with a richer hero or tighter
  framing, never by adding explanatory copy.

- **Lead with the wow — show the payoff, not the plumbing.** The hero is the *result
  the feature produces*, not its mechanism or generic chrome. When the wow is an
  effect on something else, show that something and the feature acting on it:
  - AI memory → a remembered fact surfacing *inside a real draft*, not edit/forget buttons.
  - Document collaboration → the *comment* is the focal point, on a draft you can read.
  - Chat feedback → the thumbs and the *consequence*, on a real answer.
  - Settings → the *tone/word preferences* (the differentiated part), not colour swatches.

The rest follows from those two:

- **One clear idea per graphic.** Pick the single element that *is* the feature and
  make it the hero. Everything else is supporting cast.
- **Ghost the supporting cast, not the hero.** Render surrounding UI as soft
  placeholder bars/blocks (`.dio-ghost-*`) so the eye goes straight to the lit
  element — a thin ghosted sidebar with one lit nav item says "this is the app"
  without busywork. Ghosting is the *frame around* a rich hero, not the whole graphic.
- **Tailor it — make it feel like *their* product.** Use believable, company-specific
  data (Flight Centre's tickers, peers, document names, figures), not generic
  placeholders. "FY25 results announcement · Searchable" beats "Document 1".
- **Legible at email scale.** A graphic shown ~520–600px wide is downscaled hard.
  Big type, few words on the focal element; the words must be the feature's real
  words (from the plain docs), not invented.

The benchmark is the small device graphic in the existing product-update email — that
*focus*, with richer fidelity on the one thing it shows.

---

## 2. What goes in a mockup — and what stays out (no marketing copy)

A mockup shows what the product **does** — its real surfaces and data. The *messaging*
about the feature lives in the email body, never inside the graphic. This is the other
recurring review note, so be deliberate about the line:

- **Keep — real product text.** Labels, button text, verdicts, status chips, tickers,
  data, and the on-brand product microcopy the UI actually renders: *"Escalate"*,
  *"Searchable"*, *"Apply result"*, *"On the record"*, *"Consistent with record"*,
  *"Drafted reply"*, *"Deserves a look"*. These are chrome and they belong.
- **Cut — anything the email would say.** Taglines, explainer/"typewriter" lines,
  reassurance and disclaimer sentences, and "powered by" attribution. Real offenders
  to recognise and remove: *"never sends without your OK"*, *"always verify against
  your disclosure obligations"*, *"set per document, always shown, change any time"*,
  *"decision support only"*, *"powered by Morningstar"*.
- **Also cut everyday secondary UI that isn't the wow** — tooltips, "how X works"
  links, help text. They dilute the one idea.

> Rule of thumb: a **label or value the product renders as chrome → keep**; a
> **sentence you'd write in the email body → cut**. (This refines the old advice to
> "use the on-brand phrases": those phrases earn their place *as product microcopy* —
> a chip, a verdict, a button — not as explainer sentences floating on the graphic.)

---

## 3. Build on the Diolog design system (the mock-kit carries it)

**`DESIGN.md` at the repo root is the canonical authority** for the look — the palette,
type, the one-accent / two-blue rules, radii, shadows, the component inventory, and the
voice. Read it before you build; the mock must not contradict it. `assets/mock-kit.css`
is an implementation of those tokens (under `--dio-` names) plus the mock primitives —
compose mocks from these, and if `DESIGN.md` ever disagrees with the kit, `DESIGN.md`
wins (update the kit values to match). Don't reinvent colours or shapes.

- **Grounds:** `--dio-bg-canvas` (#fff), `--dio-bg-window` (#F5F7FB soft stage),
  `--dio-bg-brand` (navy #0A1733).
- **Ink:** `--dio-fg-primary / -secondary / -muted / -faint / -on-dark`.
- **One accent only:** `--dio-accent` (#1F3FA6), plus `-deep`, `-soft`, `-soft-ink`.
  Do not introduce a second blue (the live system reserves macOS `#007AFF` strictly
  for OS affordances — don't use it in a marketing graphic).
- **State:** `--dio-success / -warning / -danger` and their `-soft` washes. These are
  your colour — lean on the semantic washes to make a graphic feel alive (a green
  "all clear", an amber verdict, an accent-soft chip), rather than leaving it grey.
- **Type:** **Newsreader** (serif) for display/headlines & big numerals; **Inter**
  (sans) for everything; **JetBrains Mono** for tickers, dates, char counts. **Never
  bold the serif** (≤600). **Sentence case** everywhere.
- **Icons:** thin (1.5px), outlined, Phosphor/Feather-style, `currentColor`. Compose
  them deliberately — a wrong/garbled path is worse than no icon. **No emoji, ever.**
- **The Diolog logo is real — never fake it.** Use the `.dio-logo` lockup: the navy
  droplet mark (`assets/diolog-icon.svg`) in a **white rounded tile**, beside the
  lowercase **"diolog"** wordmark in Newsreader (medium, never bold). A letter in a
  navy square (a "D"/"F" box) is **not** the logo — in review it read as "a random
  box" / "the logo is wrong". If you can't place the real mark cleanly, omit it. (A
  *customer/demo company's* own monogram tile is fine — only the **Diolog** mark must
  be the real one.)
- **Demo identities:** company **Flight Centre (ASX: FLT)**; IR user **Nathan B.,
  Head of IR**. Keep one identity consistent across a set. (If a feature's mock screens
  use a different demo company — e.g. ASX:NH3 in the mobile flows — normalise to FLT.)

---

## 4. Framing treatments — default to the product surface

Each mock sits on a **board** — a full-bleed ground baked into the artboard — so the
export already carries the backdrop it lands on. Size the board **tight to its
content**: a big empty ground reads as unfinished.

**Default — product-surface vignette (frameless).** Show the feature region *itself*,
rich and lit, on a soft or white board, with **no browser chrome**. People already
know it's a web app; a window frame just makes the graphic read like a screenshot and
adds nothing. If the feature needs a little "this is the app" context, include a *thin*
sliver of real in-app chrome (a slim lit sidebar edge, a top-bar fragment) — keep it
**thin** (the old default sidebar ran too wide) and ghosted. This is the right
treatment for almost every web feature. Use `.dio-fragment` / `.dio-card` /
`.dio-detect`.

**Soft panel + peeking device** *(the "new feature" reveal / house style).* A
`--dio-bg-window` rounded panel (`.dio-soft-panel`), a white `New · Feature` chip
(`.dio-newtag`), and a phone (mobile) or product card (web) peeking out the bottom
(`.dio-peek` — top corners only, no bottom border; the panel clips). Give the peeking
device **enough rich content that it actually clips** (peeks) rather than floating with
empty space below. On a **white** board. Best for *announcing* a feature.

**Collage / overlap** *(a technique, combine with any treatment).* Overlap a smaller
"finding" tile — a verdict, a notification, a memory note — on the larger surface it
acts on (a disclosure verdict over the draft it flags; a memory note over the draft it
informed; an agent result over the task). This adds context and depth and is the cure
for a small tile floating alone on a big empty board. Use `.dio-collage` (a positioned
overlap wrapper). Several of the strongest graphics in review were collages.

**Phone bezel** *(mobile features).* `.dio-phone` (notch + status bar + floating tab
bar). The tab bar must sit **inside** the phone and be **centred** (it has poked out
before). Keep proportions from going too tall-and-narrow. The **navy board reads dark
and plain** on its own — enrich the ground (a subtle brand wash / depth) and let the
phone content carry colour, so it doesn't look like a black slab.

**Website frame** *(ONLY when the thing literally is an external/public website).* Full
browser chrome (`.dio-browser`: traffic lights + URL pill) is **right here** — e.g. the
Investor Portal Builder, where a tailored URL like `investors.flightcentre.com.au` is
*part of the story* (it proves a real, customisable public site). Do **not** reach for
the browser frame as a generic "this is the web app" wrapper — that's the default
product-surface vignette's job.

---

## 5. Framing & consistency hygiene

Small inconsistencies read as "unfinished" even when the idea is right. Before you ship
an artboard:

- **Uniform radii** — use the radius tokens; don't mix roundings on sibling elements.
- **Uniform padding/margins**, and **centre content within its board** — don't let an
  input or card crowd one edge while floating off the other.
- **One alignment per artboard** — don't mix centred and left-aligned blocks in the
  same graphic; pick one and hold it.
- **Nothing pokes outside its frame** — tab bars inside the phone, content inside the
  card, the peeking device clipped by the panel.
- **Board sized tight to content** — trim dead space.

---

## 6. Make the channel clear, and avoid misreads

- **Show where it surfaces.** If a feature can appear in more than one place, make the
  channel unambiguous — a morning briefing *in the dashboard* and *as an email* are
  different graphics; pick one and make it obvious which.
- **Avoid framings that can be misread.** A company switcher can look like an agency
  flipping between clients; a comparison reads better as *my data beside the
  competitor's*. Ask "what could a skim-reader mistake this for?" and remove the
  ambiguity.

---

## 7. Sizing (what renders legibly after email downscaling)

- **Product-surface vignette / frameless:** card 440–560 wide on a board sized tight
  around it (~520–680 wide). Thin in-app chrome (if any): sidebar sliver ≤96px.
- **Soft panels:** ~640×500 artboard; panel ~560 wide; peeking phone card ~300 /
  product card ~460, with enough content to clip.
- **Phone:** screen ~320 wide × ~700 tall, on an enriched navy board → artboard
  ~430×760 (avoid making it taller/narrower than this).
- **Website frame:** frame ~880 wide (keep it smallish so type survives downscaling);
  board sized tight around it.
- Focal headline ≥16px; big numerals 34–50px (serif). Put important content **above**
  any panel's bottom clip — let the clip eat padding/spacers, never the key line.

---

## 8. Quality bar before you call it done

- **Wow test:** at 50% size, is the *payoff* obvious — the result the feature produces,
  not generic UI?
- **Richness test:** does it look tailored and alive (colour, real-feeling Flight Centre
  data), or like an empty grey screenshot? Empty space = fix the composition.
- **Copy test:** only real product chrome text — no taglines, explainers, disclaimers,
  "powered by", or stray help microcopy. No banned puffery (unlock, supercharge,
  AI-powered, seamless, effortless, powerful, revolutionary).
- **Chrome test:** no browser frame unless the thing *is* a public website; in-app
  chrome is thin and ghosted.
- **Brand test:** the Diolog mark is the real `.dio-logo`, never a letter-box.
- **Token test:** every colour is a `--dio-` token; no stray blues; serif ≤600;
  sentence case; no emoji; icons clean.
- **Hygiene test:** consistent radii/padding/alignment; nothing pokes out of frame;
  board trimmed tight.
- **Truth test:** the graphic doesn't imply a capability the feature doesn't have.
