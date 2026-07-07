# Method — the judgement behind the pipeline

The bundled scripts do the mechanical work. This file holds the *judgement* — the parts that need a human
brain (or yours) per project: how to classify, dedupe, exclude, and date. Read it before Phase 2.

## Table of contents
1. Recon & the who's-who anchor
2. Segment classification + `classification.json` schema
3. Placement, naming, front-matter, dedup
4. Merging Slack recaps into canonical transcripts
5. Exclusion criteria → `other/`
6. Probable dates + the Gemini-summary strip rule

---

## 1. Recon & the who's-who anchor

Every meeting note lists attendees with **emails** (an "Invited" line in Gemini docs). One domain recurs
in almost every meeting — that's the **internal company** (e.g. `@acme.com`). The person on that domain
who appears everywhere is the **internal voice / CEO**. Everyone on *other* domains is an **external
party**, and their domain identifies their company. This single observation drives file naming, the
who's-who, and segment classification. Confirm the internal domain with the user if unsure.

Also note during recon: which sources are already **foldered by segment** (mirror that), which are
**derived/AI-generated** (AI-Studio repos, ICPs, syntheses — these are research context, not raw
discovery), and which are **internal team chat** (Slack — mine, don't treat as customer conversations).

## 2. Segment classification + `classification.json` schema

Assign each meeting a **buyer segment**. A good default scheme for B2B (adapt names to the domain):

| Folder | Who |
|---|---|
| `01-listed-companies` (or your primary buyer) | End-customer orgs — the core buyer |
| `02-third-party-<agencies>` | Agencies / consultants / partners who serve the buyer (often the richest segment) |
| `03-<pre-buyer / smaller>` | Adjacent / earlier-stage variant of the buyer |
| `04-<end-users>` | The buyer's *users* (primary + secondary research) |
| `05-external-investors` | Investors evaluating *your* company — usually **not** product discovery → often `other/` |
| `06-<geography / market>` | A distinct market/region thread |
| `07-ecosystem-advisors` | Exchanges/regulators/mentors/advisers — product/strategy input but not a buyer |
| `research-and-personas` | ICPs, personas, deep-research, AI-Studio repos, synthesis docs |
| `slack` | Mined internal-channel digests |
| `other` | Set aside (§5) |

Decide each meeting's segment from three signals, in priority order:
1. **Source folder** — if the dump already segments a file, trust it (it's human-curated).
2. **Attendee email domain** — map the external domain to a company + segment (an agency domain → the
   third-party segment; a listed-co domain → the buyer segment; an exchange domain → ecosystem; a VC
   domain → external-investors).
3. **The Summary paragraph** — resolves the ambiguous ones (personal-email attendees, unclear firms).
   Run `scripts/extract_summaries.py` to dump every doc's summary + domains in one pass, then classify.

Encode your decisions in `classification.json` that `place.py` consumes:

```json
{
  "internal_domain": "acme.com",
  "internal_rep": "Jane Doe (co-founder & CEO)",
  "internal_blurb": "Acme is a … platform. **Jane Doe is Acme's CEO** (jane@acme.com).",
  "segment_labels": {"01-listed-companies": "Listed company", "02-third-party-ir": "Third-party IR / advisory", "...": "..."},
  "domain_map": {
    "nh3ce.com": {"segment": "01-listed-companies", "company": "NH3 Clean Energy"},
    "firstadvisers.com.au": {"segment": "02-third-party-ir", "company": "FIRST Advisers"}
  },
  "meetings": {
    "x Ana (NH3)": {"segment": "01-listed-companies", "person": "Ana Stachewicz", "company": "NH3 Clean Energy"},
    "Victoria Geddes": {"segment": "02-third-party-ir", "person": "Victoria Geddes", "company": "FIRST Advisers"}
  },
  "research": {"ICP - Listed company": {"folder": "research-and-personas", "title": "ICP — Listed companies"}},
  "exclude": {"Harrison": "Amy mentoring another founder's startup — no product content", "luke test": "internal test recording"},
  "date_override": {"Jane (Macquarie)": "2025-10-14"},
  "probable": {"Helaina (GYG)": ["2025-09-28", "Google-Drive modified date"]}
}
```

Keys under `meetings`/`research`/`exclude`/`date_override`/`probable` are **substrings** matched against
the original filename (first match wins), so you can key on a short distinctive token. `domain_map`
supplies company+segment when a meeting isn't in the explicit `meetings` map. Anything unmatched should be
reported as UNCLASSIFIED — never guess silently.

## 3. Placement, naming, front-matter, dedup

`place.py` writes each kept file as:
- **Path**: `<segment-folder>/YYYY-MM-DD-<person-slug>-<company-slug>[-transcript|-testimonial].md`
  (`undated-…` when no date is known).
- **Front-matter**: `title`, `date` (or `date_probable` + `date_basis`), `segment`, `company`,
  `internal:` (the CEO/rep), `external:` (the party), `doc_type`, `source` (original filename).
- **Context line**: one blockquote naming the internal company + who's-who + segment + date, so a reader
  (or downstream skill) has instant context. This is the ONLY addition to the verbatim body.
- **Body**: the cleaned, verbatim conversion.

**Dedup:** `place.py` drops files whose normalised content hash already appeared (identical copies across
source trees — common when a Drive dump and a curated folder both contain the same meeting). *Notes* vs
*Transcript* of the same meeting are different content (different hash) → both kept at this stage; Phase 3
then consolidates them. Keep the richer source when two differ only trivially.

## 4. Merging Slack recaps into canonical transcripts

A Slack `#meeting-summaries` post or a `#the-feed` recap that summarises a meeting you already have as a
transcript is a duplicate representation of ONE meeting. For each such recap:
- Match it to its canonical file by **person + firm**, using the posting date as loose corroboration
  (recaps are posted within days of the meeting; a date *inside* the recap text pins it exactly).
- **Append** the recap verbatim to the canonical file under `## Slack recap (posted <date>)` — its
  distilled insight (pain points, next steps) is worth co-locating with the transcript.
- **Replace** the digest entry with a one-line pointer to the canonical file, so the meeting isn't
  double-counted but the chronology is preserved.
Recaps with **no** canonical transcript (a meeting you don't otherwise have) are kept in the digest and
flagged *summary-only* — they're additive coverage, not duplicates. When a match is low-confidence
(date mismatch, ambiguous firm), prefer a lightweight "related:" cross-reference over a merge — don't
conflate two distinct meetings.

## 5. Exclusion criteria → `other/`

Move to `other/` (with a `moved_reason`) anything that isn't product feedback/discovery:
- **External-investor / fundraising** calls (about investing in *your* company, not its product/users).
- **Mentor / networking** calls (business advice *to* the internal team; the internal person is being
  advised, not gathering product signal).
- **Internal test recordings / near-empty stubs** (transcription-tool tests, "summary wasn't produced"
  boilerplate with an empty transcript, meetings that captured nothing).
- **Tangential external reports** only loosely related to the domain.
Also fully **exclude** (never even create a file) obvious non-feedback recorded by filename: security/ISO
governance reviews, audits, and empty auto-recordings. Everything you set aside gets a reason so the human
can pull it back — you're de-prioritising, not judging it worthless.

## 6. Probable dates + the Gemini-summary strip rule

**Probable dates.** For files whose name has no date, the source file's **Drive-modified timestamp**
(`stat -f %Sm`) is a strong proxy — on the dated files it *matches the in-filename date exactly*, so trust
it for the undated Gemini transcripts. For batch-processed interview transcripts the mtime is an
upload/processing date → give a month/quarter estimate. In-document clues (a date in the text, the source
audio's upload date) refine it. Record every estimate as `date_probable` + `date_basis` and show it as
`≈ YYYY-MM` in the INDEX — never present a guess as a confirmed date.

**The Gemini-summary strip rule (Phase 7).** Google's *"Notes by Gemini"* embeds an auto **Summary /
Details / Suggested-next-steps** above the verbatim transcript. The transcript is the source of truth, so:
- **Has a real transcript** (`### 00:` timestamp turns present) → **remove** the Gemini Summary/Details/
  Suggested-next-steps (and the "A summary wasn't produced…" boilerplate). `scripts/strip_gemini_summaries.py`
  keys exactly on the presence of `### 00:`.
- **No transcript** → **keep** the summary; it is the only record of that meeting.
This is a rule the user cares about — a summary-only meeting must never be emptied out.
