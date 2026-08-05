# Investor-home blueprint — the overview page's target composition

The canonical composition for the investor centre's **overview page** (`/` in
`investor-centre` mode; the investor-hub page in `full-site` mode). Distilled from
the strongest reviewed investor-home design in the product's history (the ALFABS
interactive redesign, July 2026) and the failure modes of the sparse first-run
portals. Compose the overview to THIS density — an investor should get the whole
story without scrolling past dead space.

## The section order (top → bottom)

1. **Two-tier header.** Brand bar (logo · main nav · ticker chip · phone/primary CTA),
   then an investor sub-nav bar (Overview · Announcements · Reports · Videos · Team ·
   FAQs · Ask-AI · Subscribe). One header. The ticker chip lives IN the header — never
   floating over it.

2. **Editorial hero + thesis rail** (two columns, ~60/40):
   - Left: mono eyebrow (`INVESTOR PORTAL · last updated <date>`), a display headline
     that states the investment identity in one sentence with ONE italic/accent word
     (e.g. "An ASX-listed, *family-led* heavy-industry group."), a 2–3 line supporting
     paragraph, then exactly two CTAs (primary filled: latest announcements; secondary
     outline: ask a question).
   - Right: **"The thesis · in four lines"** — a numbered 01–04 rail of the four facts
     an investor most needs (business model, ownership/history + listing, capital
     discipline e.g. dividend, scale/people). Ground every line in VOICE.md/crawl facts.
   - The hero earns ~one viewport TOTAL including the thesis rail. Never a paragraph
     floating in empty canvas.

3. **§01 Live snapshot.** A row of 4 stat cards (last price · volume · market cap ·
   52-week range with position marker), a thin peer/index ticker tape strip, then the
   full share-price chart card (range tabs, announcement markers if available, and an
   OHLC/VWAP/EPS/P&E stats row under the plot). All live values are WIDGET markers —
   never copy. Lead the section with the delayed-data disclaimer line.

4. **§02 The latest.** Two columns: a featured latest-disclosure card (category +
   price-sensitive chips, date, headline, plain-English summary block, pages/size meta,
   one "Read announcement" link) beside a "Recent" rail of 3–4 items each with date +
   category label. The featured item must NOT repeat inside the recent rail.

5. **§03 From the CEO / video.** A video hero (real thumbnail frame, duration, title
   overlay) plus 2–3 categorised tiles (Site tour / Webinar replay / Explainer). If the
   company has NO videos, OMIT the whole section — never ship an empty frame or an
   admin-facing "no videos configured" state.

6. **§04 Find what you need.** A tile grid of the portal's other surfaces, each tile
   carrying a live COUNT (ASX announcements · N disclosures, Reports & decks · N
   documents, Video library · N videos, Meet the team · N people, Company website,
   How to invest). Counts come from widget config/live data — omit a tile whose count
   is zero.

7. **Contained AI-assistant block.** ONE dark, contained card (tokens flipped for
   on-dark) pitching the disclosure-grounded assistant, with 2–3 sample questions and
   one CTA. This is the only assistant entry point on the page.

8. **Footer.** Standard investor footer variant: nav columns, registered office +
   share registry, compliance disclaimer, and the SINGLE subscribe form. Never a second
   subscribe form anywhere above it.

## Rhythm and numbering

- Number the section eyebrows (`§01` … `§04` in mono) — the numbering IS the page's
  rhythm and tells an investor how much is left.
- Every section starts within ~120px of the previous section's end. If a section feels
  empty, cut it or merge it — never pad with whitespace.
- One background rhythm: light canvas, white cards, at most one contained dark block
  (the AI card) plus the footer. Dark-on-dark text is an automatic gate failure.

## Anti-patterns (each of these shipped once and got flagged)

- A hero occupying a full viewport with content pushed into one corner.
- The same announcement summary rendered twice (featured + first recent item).
- Two subscribe forms / two assistant entry points on one page.
- An empty section frame with a builder-facing empty state on a public page.
- Section headings styled with canvas-ink on a dark background (token flip missed).
- A raw logo image dropped on the canvas as a "section".
