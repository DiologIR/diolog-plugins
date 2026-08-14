# Probing pages with Obscura (full-page screenshots, measured CSS)

The exact commands to measure a site. `obscura` is a single static binary on PATH,
and every `obscura fetch` is its own render — there is no shared browser and no
session to name, so parallel probing needs no isolation scheme at all. What it does
need is care about *which* entry point you use: the one-shot CLI cannot capture a
full page.

## The three ways in, and which one this skill uses

| Path | What it gives you |
|---|---|
| `obscura fetch <url>` | one settled render: `--screenshot` (VIEWPORT ONLY), `--eval`, `--dump text\|html\|links\|markdown` |
| `obscura serve --port N` + CDP | viewport control and a **full-page** screenshot — what phase 2 needs |
| `obscura mcp` | a session that survives a click; only needed for a page you must drive to |

`assets/capture-page.mjs` wraps the middle one: it starts its own `obscura serve` on
its own port, navigates, scrolls the page to trigger lazy content, takes the full-page
screenshot, and runs `assets/probe.js` — one command per page.

**A locally-served page needs `--allow-private-network`, placed BEFORE the
subcommand.** Without it a `127.0.0.1` or `192.168.*` target fails as an SSRF block,
which reads like a broken page rather than a blocked fetch. `capture-page.mjs` passes
it already.

## Phase 1 — discover the key pages (one call each)

```bash
# list internal nav links (absolute, de-duped) to choose the representative set
obscura fetch <rootUrl> --eval "(() => JSON.stringify([...new Set([...document.querySelectorAll('header a[href], nav a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin)))]))()"
# also scan the whole page + footer for an investor hub / IR link
obscura fetch <rootUrl> --eval "(() => JSON.stringify([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>/investor|shareholder|\\/ir(\\/|$)|investors\\.|\\.ir\\./i.test(h))))()"
```

Choose home + about + product/services + contact + any investor hub (cap 6–8). If a
target sits on an `investors.`/`.ir.` subdomain, include that origin too.

Note the wrapping `(() => …)()`: `--eval` takes an **expression**, not a function, and
it does **not** await a promise — an async expression comes back as `{}`.

## Phase 2 — probe ONE page (what each parallel agent runs)

`WORK` can be anywhere you can write; there is no allowed-root restriction. Keep it
with the rest of the run's artifacts — e.g. `WORK=.design-md/<host>`.

```bash
SLUG=home; URL="https://example.com/"; WORK=.design-md/example.com
mkdir -p "$WORK"
# full-page PNG + the measured tokens, in one call
node <skill>/assets/capture-page.mjs --url "$URL" \
  --out-png "$WORK/$SLUG.png" --out-json "$WORK/$SLUG.tokens.json" \
  --probe <skill>/assets/probe.js --width 1280
# trimmed layout structure (header / main / footer) + fonts
obscura fetch "$URL" --eval "(() => JSON.stringify({header:(document.querySelector('header')||{}).outerHTML?.slice(0,4000)||null,footer:(document.querySelector('footer')||{}).outerHTML?.slice(0,4000)||null,fonts:[...document.querySelectorAll('link[href*=\"font\" i],link[href*=\"fonts.googleapis\" i]')].map(l=>l.href),container:getComputedStyle(document.querySelector('main,[class*=container i],body')).maxWidth}))()" --output "$WORK/$SLUG.layout.json"
```

`capture-page.mjs` does the scroll-to-bottom-and-back itself, so lazy sections are
present in both the PNG and the token census.

**Why not `obscura fetch --screenshot`?** It captures the **viewport only** (1280×720)
and has no full-page flag, so it returns the hero and silently drops every section
below the fold — the same defect the old `--full-page` note warned about, with no flag
to fix it. That is the whole reason `capture-page.mjs` exists.

## Measured CSS: read the LONGHANDS

Obscura's `getComputedStyle` is narrower than a browser's, in two ways that both
produce confident wrong numbers rather than errors:

- **Shorthands are not trustworthy.** `padding` and `margin` resolve to `0px` whatever
  the element sets (the longhands `paddingTop`/`paddingLeft`/`marginTop`/… are
  correct), `borderRadius` resolves to `0px` while `borderTopLeftRadius` is right, and
  `gap` reads `normal` while `rowGap`/`columnGap` are right.
- **An empty string means "not implemented", not "not set".** `boxShadow`,
  `backgroundImage`, `textTransform`, `fontStyle`, `flex`, `outline`, `textDecoration`
  and `aspectRatio` all come back as `""` even when the element plainly sets them.
  `gridTemplateColumns` reads `none` on a real grid (the child geometry is still
  correct), and `overflowX`/`cursor` return plausible-but-wrong defaults.

Reliable: `backgroundColor`, `color`, `fontSize`, `fontWeight`, `fontFamily`,
`lineHeight`, `letterSpacing`, `width`, `height`, `display`, `position`, `zIndex`,
`opacity`, the padding/margin/border-side/border-corner longhands, and everything from
`getBoundingClientRect()`. `assets/probe.js` reads roles from this set.

**Fonts cannot be measured here at all.** Obscura does not load web fonts — a working
woff2 and a 404'd one measure identically, and every `@font-face` stays `unloaded`.
Take the type stack from the `<link>` hrefs and the declared `font-family` string,
label it accordingly, and never claim a rendered typeface from an Obscura run.

## Backoff — two kinds, both required

- **Website / navigation** (navigation error, timeout, HTTP 429): retry the page with
  exponential backoff — sleep ≈2s, then 4s, then 8s, ≤3 attempts. On final failure,
  return a fragment that **states the page failed**; never invent its tokens. A polite
  cap: no more than ~1 request/second per origin across the wave.
- **Agent-API throttle:** if a probe *agent's return value* is an "API Error / rate
  limited / temporarily limiting requests" string (not a page result), re-run that
  agent in a **later** wave. Keep waves **≤4 concurrent** to avoid tripping it at
  all — this is the single most reliable lever.

## Parallel-wave orchestration (the shape to spawn)

For N target pages, process in waves of ≤4:

1. Wave = next ≤4 pages. Spawn one Agent per page (general-purpose is fine); give
   each: the page URL, its `slug`, the workdir, and the phase-2 command block above.
   Instruct it to return the fixed-shape fragment (below). No session name is needed —
   each `capture-page.mjs` run starts and stops its own browser on its own port.
2. `await` the whole wave before starting the next (a hard barrier — it bounds
   concurrency and lets you retry a throttled agent next wave).
3. Collect all fragments. Any page that returned a failure/partial is recorded as an
   evidence gap for the DESIGN.md's Open-Questions/self-critique — not silently
   dropped.

The wave cap is now about the site and the agent API, not the browser: N concurrent
Obscura processes do not interfere, they just cost N page loads.

**Fixed-shape fragment each probe agent returns:**

```
### <role> — <url>
screenshot: <workdir>/<slug>.png
accents: <the measured colour census — top saturated colours by area; the brand accent(s)>
tokens: <the measured-CSS JSON, verbatim (type roles are reliable; button/card may be a utility element on page-builder sites)>
fonts: <font URLs / declared families — DECLARED, never rendered; see above>
logo: <logo src + alt, or none>
layout: <2–3 notes — container width, grid, section rhythm, dark bands, chrome pattern>
status: ok | partial(<why>) | failed(<why>)
```

The probe JSON's top-level `accents` array is the **most reliable brand-colour
signal** — the type roles (h1/h2/h3/p) and `accents` are trustworthy; the
`button`/`card` tokens are best-effort (selectors vary by site).

## Notes

- Obscura is a Rust engine, not packaged Chrome. Its own documentation expects
  divergence in long-tail CSS, service workers, some Web APIs, native media, GPU and
  compositor effects, and font rasterization. Colours and geometry are dependable;
  anything that turns on a webfont, an animation or a compositor effect is not.
- Screenshots are for **layout, hierarchy, imagery, and vibe**. Colours, radii, and
  spacing come from the **measured JSON**. Don't colour-pick a screenshot.
- Nothing to tidy at the end — `capture-page.mjs` stops the browser it started, and a
  bare `obscura fetch` exits on its own.
