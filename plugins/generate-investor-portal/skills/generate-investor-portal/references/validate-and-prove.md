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

### Where every one of these gates was green while the portal was broken

A full design review of 18 surfaces found three blocking defects that had survived indefinitely
under a completely green oracle set. None of the gates was wrong; each was *narrow* in a way its
output did not say.

| The gate | What it could not see |
|---|---|
| `parity.mjs` — 40 named landmarks, `checks=904 diffs=0` | It loads `/` only, and `.idx` is not a landmark. Every index row of every tenant carried a spurious second grid track the whole time. **A parity oracle needs a per-page landmark set, and must print which pages it compared.** |
| `acceptance-generate.mjs` — 524 assertions, 13 tenants | It never asked whether a generated portal had a **header**. Strong on content (*"people includes `Stephen Hall :: Chief Executive Officer`"*), silent on chrome, and silent on whether the pages link to each other. |
| Every oracle in the set | None opened a viewport below 1280px, none ran axe, and all of them read the *reference* tenant. Adding those three found blocking defects on the first run. |

Four assertions worth owning, because each one is the cheap version of a defect that shipped:

1. **Chrome exists**, and its brand, nav and footer come from this record.
2. **Every declared page is reachable** from at least one other, and its tab-stop count is above
   what a bare document has.
3. **No orphan route resolves 200.**
4. **Every colour token the theme declares is set on a themed record.** An unset token silently
   inherits the reference company's palette (see `tokens-and-motion.md`), and nothing in a 200,
   a parse or a screenshot of the home page reports it.

And the discipline that makes any of these readable: **print the denominator.** `diffs=0` on its
own cannot be told apart from a selector list that matched nothing. `checks=904 diffs=0` can.

## Report the three claims separately

```
Gates:       contract parses · written as draft · 9 sections rendered
Looked at:   home @1440 and @375, hero crop, facts table
Not checked: print, the empty state of the disclosures section
```

Line 1 is what a machine asserts. Line 2 is true only for captures you opened. Line 3 is never
empty — if you think it is, you have confused the scope of your checks with the scope of the
artifact.
