# Knowing it worked

Three gates. None is optional, and none is a judgement.

## 1. The contract parses it

```bash
node -e "…PortalRecordSchema.parse(record)"
```

Or emit through the renderer's `/record-export` route, which returns **422 with the issues**
rather than a record when validation fails. A record that cannot be validated must never reach
the database.

This catches: missing provenance, an illustrative value with no reason or a borrowed source, a
free portal carrying an illustrative value, a paid portal whose ledger is short, a section kind
the category does not own, a slug that is not a DNS-safe label, a colour that is not hex.

## 2. It writes, and reads back

```bash
node scripts/seed-portal.mjs record.json
# inserted acme-paid · category=paid · status=draft · 1 page(s), 9 sections
```

The record is validated again on the way **out** of the database. The database is not a trusted
source of shape: a record written by an older generator must not reach the renderer half-formed.

## 3. It renders — and renders *from the database*

```bash
npm start & curl -s localhost:3100/ | grep -c 'data-section'
```

For a company with a reference deployment, run the parity harness. For a new company there is
nothing to compare against, so the gate is different: **open the rendered page and look at it.**
Rendering a screenshot is not seeing one.

### Prove the data path, not just the render

A page that renders is not evidence that it renders *from the database* — a fallback path serves
the same thing and passes every check. Run the negative test:

```
API unreachable, fallback disabled   →  404      ← would be 200 if it were a fallback
API up                               →  200
```

The resolution carries `source: 'api' | 'seed' | 'none'` for exactly this reason.

### Prove it is reading the record you are testing

The trap one layer in from the last one, and it looks exactly like a failed fix. The resolver
tries the **API first** and the database second. So a verification run against a throwaway
database, holding the freshly regenerated record, was answered by a local API still serving
*production's* copy: the first screenshots showed the old unit hierarchy and seven images the
new record does not contain. The record under test was correct the whole time.

Two habits close it:

- **Point every other source at a closed port** (`DIOLOG_API_URL=http://127.0.0.1:1`) so a
  fall-through is a connection error rather than a plausible page.
- **Fingerprint the server you are talking to before you believe it**, especially when a port
  might be held by an earlier run: check the listener's own working directory, and read one
  value off the page that only the record under test contains. A stale server on the right port
  answers 200 to everything and is indistinguishable from a passing run.

The same applies to the database connection: a portal server started **without** its
`MONGODB_URI` falls back to a small built-in seed, serves a handful of tenants perfectly and
404s the rest — which reads as "those tenants are broken" rather than "this server has no
database". Check the row count, not the first 200.

### Where every one of these gates was green while the portal was broken

A full design review of 18 surfaces found three blocking defects that had survived indefinitely
under a completely green oracle set. None of the gates was wrong; each was *narrow* in a way its
output did not say.

| The gate | What it could not see |
|---|---|
| `parity.mjs` — 40 named landmarks, `checks=904 diffs=0` | It loads `/` only, and `.idx` is not a landmark. Every index row of every tenant carried a spurious second grid track the whole time. **A parity oracle needs a per-page landmark set, and must print which pages it compared.** |
| `acceptance-generate.mjs` — 524 assertions, 13 tenants | It never asked whether a generated portal had a **header**. Strong on content (*"people includes `Stephen Hall :: Chief Executive Officer`"*), silent on chrome, and silent on whether the pages link to each other. |
| Every oracle in the set | None opened a viewport below 1280px, none ran axe, and all of them read the *reference* tenant. Adding those three found blocking defects on the first run. |

Five assertions worth owning, because each one is the cheap version of a defect that shipped:

1. **Chrome exists**, and its brand, nav and footer come from this record.
2. **Every declared page is reachable** from at least one other, and its tab-stop count is above
   what a bare document has.
3. **No orphan route resolves 200.**
4. **Every colour token the theme declares is set on a themed record.** An unset token silently
   inherits the reference company's palette (see `tokens-and-motion.md`), and nothing in a 200,
   a parse or a screenshot of the home page reports it.
5. **Every accent/ground pairing clears the floor its ROLE carries** — 4.5:1 where the pairing is
   body-size text, 3:1 where it is large text or non-text. This is a record-level gate: it reads
   the resolved token map, so it runs with no server and no deployment and it bites on the next
   brand rather than on the next axe run. It caught a real brand orange at 3.37:1 as an eyebrow
   and 3.72:1 under its own stated white ink.

Two of these are now real gates on this pipeline and both are worth copying in shape, not just
in subject:

- The reachability assertion **quotes the renderer's own nav filter** rather than
  paraphrasing it, so a change to how the header is derived cannot leave the gate measuring a
  nav nobody renders. It reports pages-reached over pages-declared, and it **fails when fewer
  than two tenants declare more than one page** — otherwise a fixture set that drifted to
  single-page records would pass it having asserted nothing.
- The palette assertion **computes its token list from the reference theme** instead of listing
  it, so a twenty-sixth colour added to the contract is covered the day it lands rather than
  the day somebody remembers the file. Its one exclusion — the semantic conventions
  (success / warning / danger / info), which are green-amber-red-blue rather than anybody's
  brand — is named in the case, not silently skipped.

And the discipline that makes any of these readable: **print the denominator.** `diffs=0` on its
own cannot be told apart from a selector list that matched nothing. `checks=904 diffs=0` can.

### A gate that SKIPS an unresolved input is a gate-shaped hole

The sharpest version of the denominator rule, and it was found by mutating a gate that had just
been written to enforce the rule above. The contrast gate read each token off the resolved map
and skipped any pairing whose token was absent — deliberately, and for a good reason: the
stylesheet's default *is* the reference company's palette, so filling from it would measure
another company's contrast and report it as this brand's.

Then the derivation under test was deleted. Every `--primary-ink` pairing became unresolved,
every one of them was skipped, and **the suite stayed green** while the accent went raw into
every eyebrow on the page. Two of the three mutations bit; the one aimed at the thing the case
existed for did not.

The fix is not "stop skipping". It is that **the stylesheet declares those tokens as
`var(--primary)`**, so an unresolved token still *paints* something and that something is
knowable. Follow the declared fallback instead of skipping it, assert that the tokens with a
fallback are never among the skips, and print the skip list beside the count. A skip is a
measurement you did not take, and a gate that does not say how many it did not take is reporting
its coverage as its result.

### A gate that PRINTS its own counter-example and passes

Worse than a skip, because the evidence is on the screen. Measured on production 2026-08-08,
`rendered-typeface.mjs` — a probe written specifically to catch a record naming a face nobody
serves — emitted this and exited 0:

```
── https://jb-hi-fi-limited.diolog.app
   /            ok   leads "Roboto" → renders "Helvetica" (local)

RESULT  checks=12  failures=0  every portal renders the typeface it names, from its own origin
```

The row states the defect (*leads Roboto → renders Helvetica*) and the summary denies it. The
predicate was `matchesLead || (leadIsSystem && SYSTEM_OK.has(rendered))` and `roboto` was on
`SYSTEM_OK` — so "the reader's own machine supplied it" was true of the *fallback* while the
lead went unserved.

Two rules fall out, and both generalise past fonts:

- **When a check has an "acceptable alternative" branch, the branch must be narrower than the
  thing it excuses.** "A system face rendered" is a fine outcome when the record *led* with a
  system face. It is not a fine outcome when the record led with something else and the system
  face is what the reader got instead.
- **If a gate prints a field, compare the printed fields.** `leads X → renders Y` was already
  in the output. Nothing compared X to Y under the condition that mattered. A one-line
  post-condition — *no `ok` row may print two different families* — would have caught it
  without understanding fonts at all.

### A record-level contrast gate cannot see a pairing the renderer hardcodes

Assertion 5 above is a real gate and it is worth having. It reads the **resolved token map**,
which means it can only see pairings that are expressed as tokens. Measured on production:

```tsx
// app/site/sections.tsx — inside a panel whose background is var(--surface-dark)
<span className="over" style={{ color: 'var(--primary)' }}>{id?.legalName}</span>
```

`--primary-on-dark` exists, every theme carries it, and the vars layer computes it to exactly
4.5:1 against that ground. This one component reached past it. Result: **five of six live
tenants**, the company's own name at 13px, between **1.97:1** and 4.46:1 — and the
record-level gate was green because the pairing (`--primary` × `--surface-dark`) is not in
the token map; it is in a JSX inline style.

So the record gate needs a **source-side sibling**, which is cheap and needs no browser:

> Grep the renderer for `var(--primary)` in a `color:` position, and fail any occurrence
> whose enclosing element sits inside a `--surface-dark` / `.on-dark` subtree. The on-dark
> role exists; a component that does not use it is a bug whether or not a reader has met it.

The general shape: **a gate that reads the record proves things about the record.** Anything
the renderer decides for itself — an inline style, a hardcoded class, a default — is outside
its domain, and the fix is a second gate at that layer rather than a wider claim from the
first one.

### Open a SECOND tenant beside the first

Every gate on this pipeline is per-tenant, and the defect that shipped is between tenants.
Measured on production 2026-08-08 across six live portals: **`metallium-ltd` and
`telstra-group-limited` publish the same eight pages, with the same section kinds in the same
order on every one of them, under the same archetype.** `jb-hi-fi-limited` matches Telstra on
seven of eight and additionally carries a byte-identical WebGL vector — which the repo's own
framebuffer gate scores at a still-distance of **1.169 against a floor of 1.9**.

Every per-tenant gate was green. They cannot be otherwise: sameness is not a property of a
record, it is a property of a *pair*.

Three checks, and they are cheap because both records are already in the database:

1. **Structural collision.** For a new `paid` record, compare `(archetype, page paths,
   per-page section-kind order)` against every published paid tenant. An exact triple match
   is a refusal, not a warning.
2. **Motion collision.** Compare the seven-value canvas vector (`preset`, `palette`,
   `density`, `figure`, `stroke`, `accentRation`, `intensity`). Identical vectors on two
   tenants means the hero's moving layer differs only by hue.
3. **Copy collision.** Compare `/` section headings after substituting the company name out.
   Today five generated tenants share five of five.

And the gate that already exists must be pointed at production: `webgl-probe.mjs --assert`
defaults to three *local* fixtures. A gate whose default target set is not the thing that
ships is a gate that measures a rehearsal.

### The viewport is part of the gate, and 1280 is not a safe default

`acceptance` has no width. The sweep that found it did:
`document.documentElement.scrollWidth` against the viewport, at 375 / 768 / 1280 / 1440 /
1920, on every page of every tenant. Result: **21 overflowing page-widths across three
tenants**, including the primary "Contact investor relations" CTA rendering *entirely
off-screen* at both 1280 and 1440 on two of them, and every page of a third overflowing by
32px at 375 with its mobile nav labels clipped.

This is three lines and it needs no judgement:

```js
const sw = await page.evaluate(() => document.documentElement.scrollWidth);
const vw = page.viewportSize().width;
ok(sw <= vw + 1, `${path} @${vw}: document is ${sw}px wide — it scrolls sideways`);
```

Run it at **1440 as well as 1280**. The two tenants above are fine at 768 and 1024, broken at
1280 and 1440, and correct again above ~1600 — so a matrix that skips the middle reports a
working header.

## Report the three claims separately

```
Gates:       contract parses · written as draft · 9 sections rendered
Looked at:   home @1440 and @375, hero crop, facts table
Not checked: print, the empty state of the disclosures section
```

Line 1 is what a machine asserts. Line 2 is true only for captures you opened. Line 3 is never
empty — if you think it is, you have confused the scope of your checks with the scope of the
artifact.
