# Diolog widgets — the server-rendered contract + config comments

Live investor data is served by Diolog **widgets**. This file is the contract for placing them in a
generated page and configuring them.

## How a widget renders (server-side, NEVER an iframe)

`apps/web/lib/widgets/inject-widgets.server.ts` → `injectServerRenderedWidgets(html, companyId, theme)`:
1. Cheerio finds every `[data-diolog-widget]` marker in the stored page HTML.
2. For each, it reads **only** `data-diolog-widget` (the KIND) and `data-widget-variant` (the VARIANT).
3. It renders the widget with React `renderToStaticMarkup` (`render-widget.server.ts`), themed from a
   **PortalTheme** and populated with the company's live data, then **replaces the marker's inner HTML** with
   that static HTML.
4. One bad/slow widget degrades to a labelled placeholder; it never blanks the page. Max 24 widgets/page.

So a marker in your page is a real widget. The **skeleton you put inside the marker is the pre-render /
loading state** — Diolog replaces it on inject. Injection happens at request/render time for the generated-
site artifact route, not at store time.

## The marker + frame contract

Every live surface is an **empty-on-render** marker wrapped in a finished frame:

```html
<!-- diolog-widget: {"kind":"KIND","variant":"VARIANT","config":{…},"styleOverrides":{…},"note":"…"} -->
<div class="wframe">
  <div class="wframe__head"><div><p class="wframe__eyebrow">…</p><h3 class="wframe__title">…</h3></div><span class="live-tag">Live</span></div>
  <div class="wmarker" data-diolog-widget="KIND" data-widget-variant="VARIANT" aria-label="…">
     …a sized skeleton shaped like the content: shimmer bars, a drawn chart axis, table headers…
  </div>
  <span class="wframe__note">…honest "served live" note; the "delayed ≥20 min / not advice" tagline where it applies…</span>
</div>
```

Rules that keep it honest and gate-clean:
- The skeleton contains **zero fabricated figures** — no prices, %, share counts, dates, names, durations.
  Only shimmer bars / sized boxes, plus inert real labels (axis captions, range tabs `1M/3M/6M/YTD/1Y`,
  column headers `OPEN/HIGH/LOW/VWAP`, a listing code the brief grounds).
- Skeleton widths are **fluid** (`%` / flex), never fixed px (fixed px overflows a phone column).
- A chart-shaped surface gets a **drawn axis + placeholder path**, never a grey void (`.wf-chart` + `.wf-*`).
- **modal / palette** kinds (`leadCapture` modal, `chatAssistant` palette) sit inside a `<dialog>` the
  template owns (trigger + Esc/backdrop close, in `partials/overlays.html` + `app.js`); the widget fills the body.
- `marketTicker` (tape) and `leadCapture` (footer) live in the chrome partials (sitewide); the rest are blocks.

## The config comment (the hand-off to the portal editor / DB)

The injector reads only kind+variant from the marker. **All other config lives in the DB** — a per-instance
record resolved through a 6-layer cascade (`libs/shared/src/widgets/widget-instance.ts` `resolveWidgetConfig`:
kind defaults → company config → portal theme → instance config → instance styleOverrides → editor patches).
That is where the portal editor writes when a user selects and configures a widget, and it is the preferred
config channel.

So each marker carries a machine-readable comment stating the INTENDED config, immediately before it:

```html
<!-- diolog-widget: {"kind":"announcements","variant":"timeline","config":{"itemsToShow":12,"groupBy":"year","highlightFilings":true},"styleOverrides":{},"note":"…"} -->
```

The final apply pass (or a human in the portal editor) reads these and writes the per-instance config +
styleOverrides to the DB. **Do not** encode config as marker attributes or CSS around the marker — it won't be
read. Keep the comment's `config` keys within the kind's real fields (below). `styleOverrides` is per-instance
visual tweaks (colour/spacing) beyond the portal theme.

## Catalogue — kinds, variants, config fields

Authoritative source: `libs/shared/src/widgets/widget-config.schema.ts` (+ the generated
`apps/studio/agent/skills/diolog-widgets/references/catalogue.md`). Summary:

| kind | availability | variants | key config fields |
|---|---|---|---|
| `stockPrice` | listed | card · strip · **badge** | symbol, showMarketCap, showDayRange, showFiftyTwoWeekRange |
| `stockChart` | listed | full · compact · sparkline | symbol, period(5D/1M/3M/6M/1Y), showAnnouncementMarkers, priceSensitiveRing |
| `marketTicker` | listed | tape · board · compact | instruments[], scrollSpeed, pauseOnHover, showChangeArrows |
| `announcements` | has-announcements | list · featured · timeline · rail | itemsToShow, highlightFilings, showAiSummary, groupBy(none/month/year) |
| `announcementReader` | always | full · compact · summary-only | showAiSummary, showCitation, showRelated, showPdfEmbed, dropCap |
| `companySnapshot` | always | tiles · list · split | thesisPoints, facts[], showLiveSharesOnIssue |
| `documentsLibrary` | has-documents | featured-index · grid · list | showAskAi, showFileMeta, groupBy(year/type/none) |
| `videoLibrary` | always | programme · featured · grid · rail | videos[], showDuration |
| `teamProfiles` | always | masthead · grid · list · compact | people[], governanceStats[], showGovernanceStats, alternatePortraitSide |
| `capitalStructure` | listed | table · tiles | rows[], footnote, showLiveSharesOnIssue |
| `calendar` | has-announcements | list · month | displayFormat(list/grid), monthsAhead |
| `agm` | always | default | — |
| `brokers` | always | numbered-list · cards · table | intro, brokers[], footnote |
| `capitalRaise` | always | card-form · stats-only · form-only | lastRaise[], body, collectIndicativeInterest |
| `faqs` | always | accordion · embedded | — |
| `chatAssistant` | always | palette · fullpage · inline · popup | welcomeMessage, promptPlaceholder, suggestedQuestions, showCitations |
| `leadCapture` | always | inline · **modal** · **footer** · banner | heading, bullets, segmentOptions |
| `notificationPreferences` | always | default | heading |
| `contactForm` | always | default | showCategories, categories[], requirePhone, successMessage |
| `companySnapshot`/`generalContent` | always | (generalContent: prose·hero·callout·columns) | eyebrow, heading, body, align |

**Availability:** the live-data kinds only exist for a company that qualifies (listed → market widgets;
has-announcements → feed/calendar; has-documents → library). If the brief's company doesn't qualify, drop the
block rather than placing an empty marker for a kind it can't serve.

The `blocks/investor/*` blocks already place these correctly with sensible default config comments — start
from the block, adjust the comment, don't hand-build a marker.
