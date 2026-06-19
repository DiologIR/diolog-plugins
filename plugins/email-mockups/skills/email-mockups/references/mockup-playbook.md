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
- **Commit to scale — big type, generous whitespace, "do less" with conviction.** The
  graphic should read as a confident product *shot*, not a cramped panel. Oversized
  headlines and numerals, real breathing room, three or four elements with room around
  them — not eight crammed together. It still has to survive email downscaling, so the
  focal words stay few and large; but the cure for "too empty" is a richer hero, never a
  busier one. In review, the single most common gap between a good set and a
  best-in-class one is that the best-in-class set is *bigger and calmer* — it trusts one
  idea to fill the frame.
- **Depth over breadth.** A few features rendered as premium product shots beat a long
  row of thin fragments. When you're handed many features, lead with a smaller **hero
  set**, each fully realised, and say so. If the brief really is "all of them", still
  scale the *treatment to the feature*: a full product window (§4A) for the heroes, a
  compact impression for the genuinely thin ones (an install step, a toggle, a
  what's-new panel) — don't give twenty features the same flat, shallow depth.

The benchmark has been raised. The *floor* is the small device graphic in the existing
product-update email — that focus. The *ceiling*, and the target for any hero feature,
is a **premium product shot**: the feature inside a complete, lived-in app window with a
big, substantive hero (§4A). Aim for the ceiling.

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

### Make the kept copy *smart* — show the real insight, not lorem chrome

Cutting the marketing copy is only half the job. The other half — and the **single
biggest lever** on whether the product looks *valuable* rather than merely *present* —
is making the copy you keep genuinely substantive. The graphics that read as
best-in-class don't show a generic "How are you thinking about margins?" placeholder;
they show the product doing what a sharp analyst would: a real, specific, slightly
surprising IR insight, grounded in the company's own record. Spend real effort here —
**the words are the wow as much as the layout is.**

- **Write the result, with specifics.** Not "here's your answer" but the actual finding,
  with a real tension and a real consequence:
  > *"Your last guidance called bookings 'recovering ahead of schedule.' Two peers now
  > point the other way for H2 — your prepared remarks still carry the old framing."*

  Real numbers, a real risk, a recommendation. That sentence makes the product look like
  it earns its seat; "Draft an announcement" does not.
- **Quote the record.** Pull an italic quoted phrase from the company's own disclosure
  (`.dio-quote`) — it makes the AI look like it actually read the filings, not like it's
  improvising.
- **Cite the source, by name.** A `SOURCED FROM` row with named source chips
  (`.dio-source`: "FY25 results · p.12", "Q3 update · draft") — specific documents and
  page numbers, not "1 source". This one move does more for credibility than any styling.
- **Name the actor, truthfully.** The assistant carries a small persona line
  (`.dio-persona`): the **real** product name (the AI's working name is **Guardian**),
  with its real role — never an invented persona. Real beats invented: it keeps the
  graphic truthful while still reading as a finished product.
- **Let one big number carry a card.** A hero stat is an oversized serif numeral with an
  uppercase eyebrow and a tiny status chip (`.dio-statbig`): `12 · INVESTOR QUESTIONS ·
  3 awaiting`. The FT/Bloomberg move — one real figure, large, with room around it.

This is the line between a mockup that looks like *a UI* and one that looks like *a
product worth buying*. If a hero graphic's copy could be swapped for any other SaaS
without anyone noticing, it isn't done.

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

## 4. Two registers, then the framing treatments

Each mock sits on a **board** — a full-bleed ground baked into the artboard — so the
export already carries the backdrop it lands on. Size the board **tight to its content**.

Pick a *register* first, then a treatment.

### 4A. The product window — the premium register, the default for any hero web feature

This is what the strongest reference sets use, and it is the biggest single lever on
"does this look like a real, valuable product." Show the feature inside a clean macOS
browser window (`.dio-browser`: traffic lights + a real URL pill like
`app.diolog.com/conversations`) wrapping the **complete app shell** (`.dio-appshell`):

- a left **rail** carrying the real `diolog` wordmark (`.dio-logo`) and a column of nav
  items (`.dio-navitem`) with exactly **one lit** (`.dio-navitem.is-active` — accent-soft
  pill + label) and the rest ghosted to thin bars;
- a **top bar** with the **company switcher** pill (`.dio-coswitch` — Flight Centre ·
  ASX: FLT), search/bell glyphs, and the IR user's avatar;
- the **main region**, where the feature lives, **big and substantive** (the real insight
  copy from §2 — persona line, quoted phrase, named source chips).

The old playbook said *"no browser frame — it reads like a screenshot."* That was half
right, and worth understanding precisely: a frame around a *thin, empty* composition
reads as a screenshot and adds nothing. A frame around a *complete, lived-in app with a
big substantive hero* reads as the real product — premium, confident, sold. So the rule
is not "avoid the frame," it is **"earn the frame": the window must be a full app shell
with a hero worth looking at.** When in doubt for a hero web feature, build the product
window.

This is **still an impression, not a screenshot:** the rail is ghosted with one lit item,
the surrounding chrome is placeholder, and you are heroing *one* substantive thing inside
a believable shell — not reproducing a dense live screen. You're idealising the app, not
photographing it.

### 4B. The compact impression — secondary / thin features, and small inline slots

Use the lighter, frameless treatments below when a feature can't carry a full product
shot (an install step, a settings toggle, a what's-new panel) or the email slot is small.
Don't stretch a thin feature into a full window, and don't shrink a hero into a fragment.

### The treatments (used within either register)

**Product-surface vignette (frameless).** The feature region itself on a soft/white
board, no chrome — or with a *thin* lit in-app sliver (sidebar edge ≤96px, ghosted). The
light option for the compact register and for finding-tiles. Use `.dio-fragment` /
`.dio-card` / `.dio-detect`.

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
overlap wrapper). Several of the strongest graphics in review were collages — and a
collage reads even better *over* a product window than over a bare board.

**Phone bezel** *(mobile features).* `.dio-phone` (notch + status bar + floating tab
bar). The tab bar must sit **inside** the phone and be **centred** (it has poked out
before). Keep proportions from going too tall-and-narrow. The **navy board reads dark
and plain** on its own — enrich the ground (a subtle brand wash / depth) and let the
phone content carry colour. The mobile equivalent of a product window is a *full, rich
phone screen* — real content top to bottom, the same substantive copy bar — not a sparse
one with two cards and air.

**Public website frame** *(when the thing literally is a public/external site).* Same
`.dio-browser` chrome, but the URL is a **public domain** (`investors.flightcentre.com.au`)
and the body is the **customer's own brand**, not the diolog app shell — e.g. the
Investor Portal Builder, where the tailored URL proves a real, customisable public site.
The distinction from 4A is purely *what the window contains*: the diolog app (a product
window) vs. the customer's public site (a website frame).

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

## 7. Sizing

The two registers size very differently — don't shrink a product window or inflate a
compact impression.

- **Product window (hero register):** the window **~900–1000 wide** on a board sized
  tight around it; app-shell rail ~190–230 wide, top bar ~60–68 tall, and the hero
  content filling the main region at full size (a chat answer card ~520–560, big serif
  numerals 40–56). This is a product *shot* — it is meant to be large, and it carries the
  most generous whitespace in the set.
- **Product-surface vignette / frameless (compact register):** card 440–560 wide on a board sized tight
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
- **Frame test:** a hero web feature is a full **product window** — clean browser chrome
  + the *complete* app shell (rail + real wordmark + one lit nav item + company switcher +
  avatar) + a substantive hero. The failure mode is not the frame, it's a frame around a
  thin/empty composition. Compact impressions stay frameless; the public-site frame
  carries a public URL + the customer's own brand.
- **Substance test:** does the hero show a real, specific insight/result with named
  sources — or generic lorem chrome? Could the copy be swapped onto any other SaaS
  unnoticed? If so it isn't done (see §2, "make the kept copy smart").
- **Scale test:** big type, generous whitespace, "do less" with conviction — a confident
  product shot, not a cramped panel.
- **Brand test:** the Diolog mark is the real `.dio-logo`, never a letter-box.
- **Token test:** every colour is a `--dio-` token; no stray blues; serif ≤600;
  sentence case; no emoji; icons clean.
- **Hygiene test:** consistent radii/padding/alignment; nothing pokes out of frame;
  board trimmed tight.
- **Truth test:** the graphic doesn't imply a capability the feature doesn't have.
