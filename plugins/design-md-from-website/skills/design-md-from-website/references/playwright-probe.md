# Probing pages with playwright-cli (sessions, screenshots, measured CSS)

The exact commands to measure a site. `playwright-cli` drives a **single stateful
browser per named session**, so parallelism requires one session name per agent —
otherwise concurrent agents fight over the same tab. Full CLI reference: the
`playwright-cli` skill.

## Sessions = isolation (this is what makes parallel probing safe)

```bash
# a named session with its own browser + profile
playwright-cli -s=<name> open <url> --browser=chrome
playwright-cli -s=<name> goto <url>
playwright-cli -s=<name> --raw eval "<js>"
playwright-cli -s=<name> screenshot --filename=<path>.png
playwright-cli -s=<name> close        # stop this session's browser
playwright-cli list                   # see live sessions
playwright-cli close-all              # tidy everything at the end
```

Give each probe agent a distinct `-s=probe-<slug>` (e.g. `probe-home`,
`probe-about`, `probe-investor`). The discover step uses `-s=discover`.

## Phase 1 — discover the key pages (one session)

```bash
playwright-cli -s=discover open <rootUrl> --browser=chrome
# list internal nav links (absolute, de-duped) to choose the representative set
playwright-cli -s=discover --raw eval "JSON.stringify([...new Set([...document.querySelectorAll('header a[href], nav a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin)))])"
# also scan the whole page + footer for an investor hub / IR link
playwright-cli -s=discover --raw eval "JSON.stringify([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>/investor|shareholder|\\/ir(\\/|$)|investors\\.|\\.ir\\./i.test(h)))"
playwright-cli -s=discover close
```

Choose home + about + product/services + contact + any investor hub (cap 6–8). If a
target sits on an `investors.`/`.ir.` subdomain, include that origin too.

## Phase 2 — probe ONE page (what each parallel agent runs)

`WORK` **must be under the repo/allowed root** — `playwright-cli screenshot` denies
paths outside the project (e.g. `/tmp`, session scratch dirs). Use e.g.
`WORK=.playwright-cli/design-md/<host>` (relative to the repo root).

```bash
SLUG=home; URL="https://example.com/"; WORK=.playwright-cli/design-md/example.com
mkdir -p "$WORK"
playwright-cli -s=probe-$SLUG open "$URL" --browser=chrome
# trigger lazy content, then settle
playwright-cli -s=probe-$SLUG --raw eval "new Promise(r=>{let y=0;const t=setInterval(()=>{window.scrollBy(0,900);y+=900;if(y>=document.body.scrollHeight){clearInterval(t);window.scrollTo(0,0);setTimeout(r,600)}},120)})"
# 1) FULL-PAGE screenshot — the --full-page flag is REQUIRED, or you only get the
#    hero viewport (~720px) and miss every section below the fold. Chrome captures
#    the whole scrollable page fine (e.g. 1280×7700). Don't omit it.
playwright-cli -s=probe-$SLUG screenshot --full-page --filename="$WORK/$SLUG.png"
# 2) MEASURED design tokens (authoritative) — the probe snippet, one line
playwright-cli -s=probe-$SLUG --raw eval "$(cat <skill>/assets/probe.js)" > "$WORK/$SLUG.tokens.json"
# 3) trimmed layout structure (header / main / footer) + fonts
playwright-cli -s=probe-$SLUG --raw eval "JSON.stringify({header:(document.querySelector('header')||{}).outerHTML?.slice(0,4000)||null,footer:(document.querySelector('footer')||{}).outerHTML?.slice(0,4000)||null,fonts:[...document.querySelectorAll('link[href*=\"font\" i],link[href*=\"fonts.googleapis\" i]')].map(l=>l.href),container:getComputedStyle(document.querySelector('main,[class*=container i],body')).maxWidth})"
playwright-cli -s=probe-$SLUG close
```

`assets/probe.js` is an IIFE that returns a JSON string, so
`--raw eval "$(cat …/probe.js)"` prints the measured tokens. If your shell mangles
the snippet, paste its body inline instead — it is self-contained.

## Backoff — two kinds, both required

- **Website / navigation** (`open`/`goto` timeout, nav error, HTTP 429): retry the
  page with exponential backoff — sleep ≈2s, then 4s, then 8s, ≤3 attempts. On final
  failure, return a fragment that **states the page failed**; never invent its
  tokens. A polite cap: no more than ~1 request/second per origin across the wave.
- **Agent-API throttle:** if a probe *agent's return value* is an "API Error / rate
  limited / temporarily limiting requests" string (not a page result), re-run that
  agent in a **later** wave. Keep waves **≤4 concurrent** to avoid tripping it at
  all — this is the single most reliable lever.

## Parallel-wave orchestration (the shape to spawn)

For N target pages, process in waves of ≤4:

1. Wave = next ≤4 pages. Spawn one Agent per page (general-purpose is fine); give
   each: the page URL, its `slug`, its `-s=probe-<slug>` session name, the workdir,
   and the phase-2 command block above. Instruct it to return the fixed-shape
   fragment (below) and to close its session.
2. `await` the whole wave before starting the next (a hard barrier — it bounds
   concurrency and lets you retry a throttled agent next wave).
3. Collect all fragments. Any page that returned a failure/partial is recorded as an
   evidence gap for the DESIGN.md's Open-Questions/self-critique — not silently
   dropped.

**Fixed-shape fragment each probe agent returns:**

```
### <role> — <url>
screenshot: <workdir>/<slug>.png
accents: <the measured colour census — top saturated colours by area; the brand accent(s)>
tokens: <the measured-CSS JSON, verbatim (type roles are reliable; button/card may be a utility element on page-builder sites)>
fonts: <font URLs / families>
logo: <logo src + alt, or none>
layout: <2–3 notes — container width, grid, section rhythm, dark bands, chrome pattern>
status: ok | partial(<why>) | failed(<why>)
```

The probe JSON's top-level `accents` array is the **most reliable brand-colour
signal** — the type roles (h1/h2/h3/p) and `accents` are trustworthy; the
`button`/`card` tokens are best-effort (selectors vary by site).

## Notes

- `--browser=chrome` renders like a real browser (webfonts, JS-driven styles) — use
  it, not a scraping-only engine, so the computed styles match what users see.
- Screenshots are for **layout, hierarchy, imagery, and vibe**. Colours, fonts,
  radii, and spacing come from the **measured JSON**. Don't colour-pick a screenshot.
- Always `playwright-cli close-all` at the end so sessions don't leak.
