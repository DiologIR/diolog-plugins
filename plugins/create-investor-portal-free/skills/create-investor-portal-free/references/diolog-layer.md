# The Diolog layer

The portal wears the subject company's identity. Diolog appears in exactly three places, in
its own visual system, and never borrows the company's tokens or lends it Diolog's.

Source of truth: `diolog-team-files/website/DESIGN-Website.md` and the live
`diolog.com.au/for-investors` page. Read them if a decision here is contested.

## Tokens

Kept in a second `:root` block, below the company's swappable block and clearly labelled as
fixed. These never change when the portal is re-skinned for a different company.

```css
:root{
  --d-navy:#0A1733; --d-navy-deep:#050B1F;
  --d-accent:#1F3FA6; --d-accent-deep:#142A78; --d-accent-soft:#E6EEF9;
  --d-accent-bright:#6E8EF5;   /* data on navy only, never on light, never a button fill */
  --d-fg-on-dark:#E8EEF8; --d-fg-on-dark-muted:#9AA8C4;
  --d-fg-primary:#0F1A2E; --d-fg-secondary:#3D4A66;
  --d-border-on-dark:rgba(255,255,255,.10);
  --d-on-accent:#FDFDFD;
  --d-serif:"Newsreader",ui-serif,Georgia,serif;
  --d-sans:"Inter",-apple-system,system-ui,sans-serif;
  --d-mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
}
```

## The three placements

**1. A thin sticky banner at the very top.** 34px. One mono line stating the proposition, and
a quiet underlined link, not a filled pill. Two filled buttons forty pixels apart is the fastest
way to make a page look assembled rather than designed, and the company's own CTA sits just
below.

```html
<div class="dbanner">
  <div class="wrap dbanner__in">
    <div class="dbanner__left">
      <span class="dlock"><svg class="dio dio--on-dark" …><use href="#dio-mark"/></svg><span class="dmark">diolog</span></span>
      <span class="dbanner__sep" aria-hidden="true"></span>
      <p class="dbanner__txt">A direct line to the companies you own</p>
    </div>
    <a class="dbanner__cta" href="#get-the-app">Get the app →</a>
  </div>
</div>
```

Below 700px the sentence is hidden and the mark plus the action remain. Four lines of wrapped
banner copy above the fold is worse than no banner copy.

**2. A navy band above the footer.** This is the app pitch, and the imagery *is* the product:
a phone frame holding one real screen, built in HTML and CSS. Not a floating abstract card,
not a stock photo, not an illustration.

The screen shows what the product actually leads with: a shareholder question, the investor
relations reply, and the citations under it, then the followed-companies list and the composer.
Copy comes from the live for-investors page rather than being invented:

- headline: "A direct line to *the companies you own*." with the italic accent phrase
- three points: "Ask them directly" / "Everything in one place" / "Answers you can trust"
- "Free for investors · companies pay to be on the platform"

Store buttons rather than a generic pill pair. A `radial-gradient` navy ground with a faint
72px mono grid; optionally a WebGL point field over it, always with a scrim so the field never
crosses the copy.

**3. A quiet footer line.** The droplet mark, "Powered by", and the wordmark in Newsreader.
The mark says the name once; do not also write "Diolog" in the sentence, or the line reads
"diolog Powered by Diolog".

## The mark

Two-tone droplet, inlined once as a `<symbol>` and referenced with `<use>`. Fills go through
custom properties, because class selectors do not cross the shadow boundary, and the aspect
ratio is 264:243, not square. Both traps are in `rendering-traps.md`.

```css
.dio{flex:none; height:1em; width:1.086em; --dio-a:var(--d-navy); --dio-b:var(--d-accent)}
.dio--on-dark{--dio-a:var(--d-fg-on-dark); --dio-b:var(--d-accent-bright)}
.dio--quiet{--dio-a:#9A9391; --dio-b:#7E7876}
```

The wordmark is lowercase `diolog` in Newsreader. Never a letter in a box.

## Copy rules

The Diolog sections are Diolog's voice, and it is stricter than the company's:

- no em or en dashes anywhere; the house connective is a spaced hyphen, a comma, or a new
  sentence
- Australian English, sentence case headings
- plain copulas: Diolog *is* the workspace, a module *has* a job. Not "serves as"
- measured confidence, never a guaranteed outcome, never a volunteered percentage
- exactly one italic accent phrase per headline, and it carries the meaning
- banned: revolutionary, game-changing, seamless, leverage, cutting-edge, easy, simple, just

If `create-diolog-content` is installed, route any new Diolog copy through it and run its
voice lint. The rules above are the subset that matters for this page.

## What Diolog never does here

It does not brand the company's sections, tint the company's components, or appear in the
company's nav. The company's accent and Diolog's blue never sit in the same viewport. A reader
should be able to describe the page as the company's, with a tool credited at top and bottom.
