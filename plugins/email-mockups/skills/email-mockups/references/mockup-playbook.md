# The email-mockup playbook — impressions, not replicas

Distilled from the original Diolog product-mockup build and tuned for this skill.
Read this before building. The actual HTML is produced via the **design-craft**
skill (see SKILL.md) — this file is the brief you hand it: the constraints that
make a graphic read as Diolog and survive an email.

---

## 1. The golden rule: impressions, not replicas

These graphics convey **the idea/impact of a feature at a glance** — they are *not*
literal, pixel-dense screenshots. When in doubt, do less.

- **One clear idea per graphic.** Pick the single element that says "this is the
  feature" and make it the hero. Everything else is supporting cast.
- **Ghost everything secondary.** Render non-focal UI as soft placeholder
  bars/blocks ("shadow demos"), not real content. A ghosted sidebar with one lit
  nav item says "this is the app" without the busywork. Use the `.dio-ghost-*`
  classes.
- **Generous whitespace.** Lots of breathing room around the focal element.
- **Legible at email scale.** A graphic shown ~520–600px wide in an email is
  downscaled hard. Big type, few words on the focal element. Short copy beats
  accurate copy — but the words you do use must be the feature's real words
  (pulled from the plain docs), not invented.

The benchmark is the small device graphic already in the product-update email —
that level of simplicity, not a Figma-perfect product shot. If a request asks for
"more of a replica" or "show the whole app", reach for the browser-framed
treatment — but still keep the content sparse and ghosted.

---

## 2. Build on the Diolog design system (the mock-kit carries it)

**`DESIGN.md` at the repo root is the canonical authority** for the look — the
palette, type, the one-accent / two-blue rules, radii, shadows, the component
inventory, and the voice. Read it before you build; the mock must not contradict
it. `assets/mock-kit.css` is an implementation of those tokens (under `--dio-`
names) plus the mock primitives — compose mocks from these, and if `DESIGN.md`
ever disagrees with the kit, `DESIGN.md` wins (update the kit values to match).
Don't reinvent colours or shapes.

- **Grounds:** `--dio-bg-canvas` (#fff), `--dio-bg-window` (#F5F7FB soft stage),
  `--dio-bg-brand` (navy #0A1733).
- **Ink:** `--dio-fg-primary / -secondary / -muted / -faint / -on-dark`.
- **One accent only:** `--dio-accent` (#1F3FA6), plus `-deep`, `-soft`,
  `-soft-ink`. Do not introduce a second blue (the live system reserves macOS
  `#007AFF` strictly for OS affordances — don't use it in a marketing graphic).
- **State:** `--dio-success / -warning / -danger` and their `-soft` washes.
- **Type:** **Newsreader** (serif) for display/headlines & big numerals;
  **Inter** (sans) for everything; **JetBrains Mono** for tickers, dates,
  char counts. **Never bold the serif** (≤600). **Sentence case** everywhere.
- **Icons:** thin (1.5px), outlined, Phosphor-style. **No emoji, ever.**
- **Voice:** confident, sober, anti-puffery. The on-brand phrases — *"on the
  record", "sourced", "consistent with record", "deserves a look", "drafted
  reply"* — do real work; use them. **Banned words:** unlock, supercharge,
  AI-powered, seamless, effortless, powerful, revolutionary, and similar.
- **Demo identities:** company **Flight Centre (ASX: FLT)**; IR user **Nathan B.,
  Head of IR**. (If a feature's mock screens use a different demo company, e.g.
  ASX:NH3 in the mobile flows, either keep theirs or normalise to FLT — just be
  consistent within a set.)

---

## 3. The four framing treatments (offer a mix)

Each mock sits on a **board** — a full-bleed ground baked into the artboard — so
the export already carries the backdrop it lands on in the email.

1. **Soft panel + peeking device** *(the house style — start here)*
   A `--dio-bg-window` rounded panel (`.dio-soft-panel`), a white `New · Feature`
   chip (`.dio-newtag`), and a **phone** (mobile) or **browser** (web) card
   peeking out the bottom (panel clips; the card uses `.dio-peek` — top corners
   only, no bottom border). On a **white** board. This is the one people like most
   and it matches the existing email graphic.

2. **Frameless fragment** — a single product card (a consistency flag, an AI
   answer, a metric trio) on a soft ground with a soft shadow, **no chrome**
   (`.dio-fragment`). Best dropped inline beside copy.

3. **Browser window** — full window chrome (`.dio-browser`: traffic lights + URL
   pill) with a **ghosted** app shell (`.dio-ghost-sidebar`) and one lit feature.
   Use when you need it to read as "the web app". On a **soft** board.

4. **Phone bezel** — `.dio-phone` (notch + status bar + floating tab bar), sparse
   content, on a **navy** board. Use for "the investor app".

---

## 4. Sizing (what renders legibly after email downscaling)

- **Soft panels:** ~640×500 artboard; panel ~560 wide; phone card ~300 /
  browser card ~460.
- **Browser-framed:** frame ~880×560 (keep it smallish so type survives
  downscaling); artboard ~968×648; ghost sidebar 150px.
- **Phone:** screen ~320 wide × ~700 tall, on a navy board with ~54px padding →
  artboard ~430×820.
- **Frameless:** card 440–520 wide, on a ~600-wide soft board.
- Focal headline ≥16px; big numerals 34–50px (serif). Put important content
  **above** any panel's bottom clip — let the clip eat padding/spacers, never the
  key line.

---

## 5. Quality bar before you call it done

- Squint test: at 50% size, is it obvious what the one idea is?
- Token check: every colour is a `--dio-` token; no stray blues; serif never
  bolder than 600; everything sentence case; no emoji.
- Copy check: the words are the feature's real words, short, on-brand, no banned
  puffery.
- Clip check: nothing important is cut by a panel's bottom edge.
- Truth check: the graphic doesn't imply a capability the feature doesn't have.
