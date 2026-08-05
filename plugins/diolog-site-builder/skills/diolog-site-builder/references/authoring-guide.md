# Authoring guide — spec, slots, structure, gates, extending

## The site spec

A build is driven by one JSON spec. Shape:

```jsonc
{
  "mode": "full-site" | "investor-centre",
  "header": "full" | "investor",          // optional; defaults from mode
  "footer": "full" | "investor",          // optional; defaults from mode
  "brand": { "COMPANY": "…", "MONO": "N", "TICKER": "NWD", "EXCHANGE": "…", "YEAR": "2026",
             "COMPANY_SITE_URL": "https://www.company.com" },   // COMPANY_SITE_URL for investor-centre back-link
  "themeFile": "theme.default.css",        // OR "theme": "<inline css>"  — the DESIGN.md theme layer
  "customPartials": [
    { "kind": "header", "variant": "custom-company", "sourcePath": "partials/header.html" }
  ],
  "pages": [
    { "slug": "index", "title": "Home", "nav": "home", "header": "custom-company",
      "ticker": true, "desc": "…",
      "blocks": [
        "marketing/hero-split",                                   // a block by id, using its default copy
        { "block": "marketing/feature-grid", "content": {         // a block with content overriding its slots
            "heading": "What we do", "f1_title": "…", "f1_body": "…" } },
        { "block": "custom/market-rail",                           // a from-scratch workspace block
          "sourcePath": "blocks/market-rail.html",
          "content": { "heading": "Market snapshot" } }
      ] }
  ]
}
```

For an exact Home + Investors build, begin with
`templates/presets/two-page-portal.json`. Its `navigation` array is the route contract: the assembler
generates desktop, mobile and footer links from the same list, so omitted pages cannot survive as
dead preset links. Its compact chrome, footer and overlays are already zero-widget; adapt content,
brand tokens, theme and real image URLs without replacing them. The preset deliberately carries a
photo-led Home and a source-photography investor feature: populate every image slot from
`inputs/image-manifest.json`, including the asset's measured `image_width` / `image_height` values. The
local production runner creates that immutable file from the claimed envelope before generation; consume it
as supplied rather than reconstructing an image list from `job.json`.

- **`slug`** → `out/<slug>.html`; the home page must be `index`. Link between pages with `<slug>.html`.
- **`nav`** → marks the matching header nav link `aria-current="page"`. Keys:
  - `full` header: `home` · `about` · `services` · `investors` · `contact`. Every investor sub-page uses
    `nav:"investors"` (the top "Investors" item stays current across the portal).
  - `investor` header: `overview` · `announcements` · `reports` · `videos` · `team` · `invest`. The `ai` page
    has no top item → `nav:""`.
- **`ticker`** → include the sitewide market-ticker tape above the footer (investor pages: true).
- **`blocks`** → the ordered section blocks. A string uses the block's default copy; an object overrides slots.

## Choosing blocks for a structure

Read `templates/manifest.json` and pick blocks per page. Baseline archetypes (see the presets):

| Page                 | Typical blocks                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                 | `marketing/hero-photo` → `capability-photo-grid` → `values-grid` → `stat-band` → `project-photo-grid` → `cta-band`                                                                                 |
| About                | `page-header` → `values-grid` → `stat-band` → `team-grid` → `cta-band`                                                                                                                             |
| Services             | `hero-split` → `feature-rows` → `process-steps` → `cta-band`                                                                                                                                       |
| Pricing              | `page-header` → `pricing-tiers` → `faq` → `cta-band`                                                                                                                                               |
| News / index         | `page-header` → `news-grid`; a post → `article-body`                                                                                                                                               |
| Contact              | `page-header` → `contact-form` → `offices` → `cta-split`                                                                                                                                           |
| Legal                | `legal-body`                                                                                                                                                                                       |
| Investor overview    | `investor-static/inv-hero` → `investor-static/portal-map` → `investor-static/price-snapshot` → `investor-static/resource-digest` → `investor-static/company-feature` → `investor-static/ai-inline` |
| Announcements        | `page-header` → `price-chart-compact` → `announcements-timeline` → `cta-band`                                                                                                                      |
| Announcement detail  | `announcement-reader`                                                                                                                                                                              |
| Reports              | `page-header` → `reports-library`                                                                                                                                                                  |
| Videos               | `page-header` → `video-programme`                                                                                                                                                                  |
| Team                 | `page-header` → `team-masthead` → `governance`                                                                                                                                                     |
| How to invest / FAQs | `page-header` → `calendar-agm` → `brokers` → `capital-structure` → `capital-raise` → `faq-widget` → `notification-prefs`                                                                           |
| AI                   | `page-header` → `ai-fullpage`                                                                                                                                                                      |
| 404                  | `notfound`                                                                                                                                                                                         |

**Mirror the site's real depth — don't flatten it.** A catalogue with detail (announcements, reports, projects)
earns detail pages linked from its index (an index that links nowhere is a defect). Vary hero blocks and section
layouts across pages so the site doesn't read as one template stamped repeatedly.

## Slots & honesty

- Slots are `{{name}}` / `{{name|default}}`. The build resolves brand tokens first, then fills slots from a
  block's `content` map, falling back to the `|default` (the plain-template copy). Unfilled = the plain default.
- **Facts are verbatim; framing is craft.** Headlines/eyebrows/CTAs are yours to write in the company's voice.
  Body copy that states a fact (who/what/figures/names/standards) is reproduced from the source, not reworded.
- **Never fabricate a live figure** — a price, %, market cap, share count, date, or a person's name. Those are
  served by a widget, not written as copy. A stat tile's value must be a real number (a founding year, a count),
  never a currency/percent you invented.
- **No connective em-dash.** Write full sentences with periods/commas; a connective em-dash between clauses is
  the most-reported AI-writing tell and `copy-lint.mjs` fails a page above ~1 per 300 words.
- **Placeholder images are intentional.** Keep the labelled `.ph-img` where no real asset exists — it tells the
  next pass what belongs there. Replace with an `<img>` only when a real asset exists. Preserve its natural
  `width` and `height` from `inputs/image-manifest.json`; guessed or hard-coded dimensions are a render defect,
  even when `object-fit: cover` makes the first screenshot look plausible.

## Staying gate-clean

Blocks pass the gates by construction; failures come from NEW content. Common causes + fixes:

- **overflow @375** — a custom slot with a fixed-px width, or a header cluster too wide. Use fluid widths; on
  mobile the header collapses to logo + one action + toggle (don't add a labelled action back).
- **stat-numeric** — a `.stat__v` value with no digit. Keep stat values numeric; put a ticker/category/decade
  in the eyebrow or prose.
- **em-dash-density / copy-not-verbatim** — restructure connective em-dashes; reproduce fact sentences verbatim.
- **contrast-in-context** — a themed `--accent`/`--accent-ink` (or on-dark accent) below AA on nav/buttons,
  OR a muted `--ink-3` one step under AA on the page surface. The gate measures BODY text too — eyebrows,
  meta labels, captions and fact labels all paint from `--ink-3`, so one bad token fails every one of them
  at once. `build.mjs` refuses to assemble a theme whose ink × surface matrix drops below 4.5:1.
  Re-pick the theme value; aim primary CTAs ≥ 5:1.
- **orphan line** — a body paragraph whose last line carries one or two words. Do not hard-break
  copy to force a shape; rewrite the sentence or let it wrap. `text-wrap: pretty` already handles
  the common case.
- **lazy images** — every image BELOW the fold ships `loading="lazy" decoding="async"`. The hero
  stays eager: it is the LCP element and lazying it delays the largest paint.
- **heading-order** — a skipped level (`h1` → `h3`, `h2` → `h4`). The document outline is a structural
  contract (WCAG 1.3.1): a screen reader announces the gap. Rank headings by DEPTH, then restyle — never
  pick `h4` because you want small type. Use a class for size and the correct level for rank.
- **proportion** — a display headline that stacks near one word per line: keep hero headlines ~6–9 words; cap the
  measure on the heading itself (never a `ch` max-width on a smaller-font wrapper).
- **interaction** — a ⌘K / mobile-nav trigger opening nothing: don't remove `app.js` or the overlay partials.

For a repository/manual run, execute `node <repo>/apps/studio/scripts/verify.mjs <work>` (needs
`<work>/out`). Fix every `error`; `warn`s are advisory. Do not invoke it inside a deployed Studio
generation container: use `render_preview` (which returns the shared measured
overflow/image-geometry/proportion core) and `review_page`; the runner then performs the broader
independent final production gate. The wire-contract validator also applies — see the studio
harness.

## Extending — new blocks / pages / images

- **New page:** add a page entry composed from existing blocks. No files.
- **New block variant during generation:** clone the nearest template into the ordinary workspace, e.g.
  `blocks/market-rail.html`, then reference it as
  `{"block":"custom/market-rail","sourcePath":"blocks/market-rail.html"}`. Keep the leading
  `<!-- BLOCK id — desc. slots: … -->` header, `{{slot|default}}` on primary copy, and use only existing
  `base.css` classes. `build_site` stages the declared file into its private build directory; never mutate
  the baked skill tree or hand-write another assembler.
- **Custom chrome during generation:** write the header/footer partial in the ordinary workspace, then
  declare it as `{"kind":"header"|"footer","variant":"custom-name","sourcePath":"partials/name.html"}`
  in top-level `customPartials` and use that `custom-name` variant on the page or site spec. This is the
  only supported way to alter chrome during a run; never edit the baked skill.
- **The `.ask` trigger and the overlays partial ship together — never one without the other.** The chrome
  ships `<button class="ask" type="button" data-open="palette">`, and `app.js` binds it by id
  (`doc.getElementById("palette-dlg")`) to the `<dialog id="palette-dlg">` that lives in
  `partials/overlays.html`. `build.mjs` stamps that partial into every page automatically, so a page built
  through `build.mjs` is always consistent. If you hand-author or post-edit a page's chrome you MUST keep
  both halves: rewriting the button into a link (e.g. `<a class="ask" href="index.html#ask">`) or dropping
  the overlays leaves `app.js` binding nothing and ships a **dead trigger**. If a page genuinely has no
  palette, remove the `.ask` trigger too — do not leave it pointing at nothing. The runner's `interaction`
  gate clicks every declared trigger and fails the whole run on one that opens no dialog; that probe does
  NOT run in `render_preview`, so a dead trigger is invisible until the terminal gate.
- **Permanent library block:** add the source under committed `templates/blocks/<cat>/<name>.html` and run
  `node templates/gen-manifest.mjs`. That is repository maintenance, not a generation-time action.
- **New shared component:** add its class to `base.css` (token-driven, context-safe on light AND dark). Define
  both surfaces for anything interactive (a ghost button needs an on-dark variant).
- **Images:** replace a `.ph-img` with `<img src="…" width=W height=H alt="…" style="…object-fit:cover">`,
  matching the source aspect ratio to the slot (a portrait source in a landscape slot crops badly). Add
  `height:auto` when the slot controls the ratio with `aspect-ratio`. Keep placeholders where no asset exists.

## Regenerating the manifest

After adding/editing/removing any block: `node templates/gen-manifest.mjs`. It re-derives `manifest.json`
(blocks → slots + widgets, the widgetIndex, presets, partials) so the catalogue never drifts from the files.
