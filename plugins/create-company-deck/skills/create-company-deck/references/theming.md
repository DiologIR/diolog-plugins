# Theming from the company's own design system

A supplied design system is **binding, not inspiration**. When the company has a
`DESIGN.md`, there is no direction round: every token comes from that file, and
the deck's job is to extend it into the sizes a deck needs without changing what
it says. Approximating a brand colour by eye is the most visible failure a
branded deck has, and no automated check will catch it.

## Generate the token block, don't transcribe it

```bash
python3 scripts/theme_from_design.py path/to/DESIGN.md --report   # read this first
python3 scripts/theme_from_design.py path/to/DESIGN.md > build/theme.css
```

`--report` prints two lists: what resolved from the design system, and what fell
back. Read the fallbacks and decide each one deliberately — a fallback is a
value the company never chose, sitting in their deck.

On a well-formed `DESIGN.md` most tokens resolve. Two almost never do, because
web systems have no reason to define them:

- **`--brand-on-dark`** — the brand colour is usually tuned for white grounds and
  fails on the dark bands a deck uses. Lighten the brand hue until it clears
  4.5:1 on `--dark`, keeping the hue, and record what you did.
- **`--on-dark-body`** — body copy on a dark ground. This token exists because
  the reference build wrote the same off-white as a literal hex on thirteen
  separate slides, which is how a 12-colour palette grows out of an 8-colour
  system.

## The type ramp is one ratio, not a copy

A 17px web body is unreadable on a 1920×1080 stage read at distance. Copying the
web ramp gives a deck nobody at the back can read; inventing a new ramp throws
away the system.

So the script takes the system's own body size, computes the single ratio that
lands it on the deck's body size (default 29px), and applies that ratio to every
step the system defines. The *relationships* between steps are the system, and
they survive intact. On the reference build that ratio was ×1.71.

Where the system is silent — display sizes, stat figures, chart values — the
script derives from a ladder and says so. Extend a silent system in its own
logic rather than importing another system's values.

Use `--body 32` for a sparser deck, `--body 26` for a data-heavy one. Change it
once, at the start; changing it later re-flows every slide.

## Drift is measurable, and it is the tell

The gates print a census of every distinct font size and text colour in the
finished deck. Read it as a number, then read the values.

The reference build shipped with a declared 13-step ramp and **17 actual font
sizes**, and 8 declared text roles against **12 actual colours**. The strays
clustered at 26–32px, right around a 29px body and a 24px small — near-misses,
not bold departures. That clustering is the signature: a deck designed as a
whole has few distinct values, and a deck assembled slide by slide accretes a
28px here and a 31px there, each one locally reasonable.

A healthy census on a 12-slide deck is roughly the ramp's own step count. If it
is much larger, the extra values are strays; find them and pull them onto the
nearest token.

## Cite a deviation, or it is a defect

One deviation in the reference build was intentional and recorded in a CSS
comment: the system's badge spec (brand on brand-tint) measures 4.32:1, under
the 4.5 floor, so chip text takes the system's own deeper `--link` for 5.2:1.
Same palette, contrast floor respected, reason written where the next person
will find it.

That is the whole standard. Deviate when the system's own rules collide — pick
the value from within the system, and write down why in the file.

## Write the direction into the artifact

The shell's head carries a five-block direction contract as an HTML comment:
THESIS, OWN-WORLD, STORY, COVER, FORM. Fill it before building slides.

A direction declared only in conversation drifts by slide 9. Written into the
file, it is checkable: the last pass reads the finished deck against the
contract promise by promise. If a block reads like a mood — "serious and
confident" — the direction is not decided yet. OWN-WORLD takes real values.

When a complete design system was supplied, FORM says so: *"a complete design
system was supplied, which is binding — every token below is lifted from it
verbatim."* That is a legitimate and common answer, and it is why this skill
usually skips the direction round entirely.
