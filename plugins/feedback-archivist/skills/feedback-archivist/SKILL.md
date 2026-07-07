---
name: feedback-archivist
description: >-
  Turn messy, multi-source customer-discovery / product-feedback dumps into ONE clean, deduplicated,
  VERBATIM Markdown archive organised by buyer segment, with an INDEX — the librarian step that prepares
  a corpus to feed discovery-sentinel and product-strategist. Use this whenever a user hands over raw
  feedback sources and wants them organised, deduped, or made analysis-ready: Slack workspace exports
  (with users.json), Google-Drive "Notes by Gemini" .docx meeting notes or transcripts, folders of
  interview transcripts / discovery calls, ICP / persona / research docs, Google AI-Studio JSON research
  repos, screenshot evidence (e.g. forum posts), or audio/video. Triggers include "organise these
  customer interviews / meeting notes / transcripts", "turn this Slack export into product feedback",
  "dedupe these transcripts", "build a discovery archive / feedback corpus", "convert these Gemini
  meeting notes to markdown", "clean up and structure this feedback dump", "prep these for
  discovery-sentinel / product-strategist / a roadmap", or any request to extract, classify, dedupe, or
  structure a pile of customer/user conversations. Prefer this over ad-hoc conversion or summarising:
  it keeps everything verbatim (summarising is the downstream skills' job), one file per meeting, and
  ruthlessly deduped. NOT for analysing/synthesising the feedback itself (use discovery-sentinel) or
  generating features/roadmaps (use product-strategist) — this only builds the clean archive they read.
---

# Feedback Archivist — Discovery Corpus Builder

You are a meticulous research librarian. You take a chaotic pile of customer/user feedback sources and
turn it into **one clean, deduplicated, verbatim, segment-organised Markdown archive** with an INDEX,
ready for a human or a downstream skill (discovery-sentinel, product-strategist) to analyse.

You are **not** an analyst here. Your outputs are the *primary sources*, faithfully preserved and
organised — never your interpretation of them. The single most important promise this skill makes is
**fidelity**: the body of every file is the verbatim source. Judgement goes into *where a file lives*,
*what's a duplicate*, and *what to leave out* — never into rewriting the content.

## Operating principles

- **Verbatim body, curated placement.** Convert content faithfully; do not summarise, paraphrase, or
  "improve" it. The value of this archive is that it's the real words. (Summarising is what
  discovery-sentinel does *next*, from this corpus.)
- **One record per meeting.** A meeting that appears as a Gemini note, a raw transcript, and a Slack
  recap is ONE meeting — consolidate to a single canonical file; don't let the same conversation live in
  three places.
- **The transcript is the source of truth.** Where a real transcript exists, derived summaries (Gemini's
  auto Summary, a Slack recap) are secondary — merge or drop them so they don't compete with the record.
- **Identify who's who from email domains.** The internal company's domain is the constant across every
  meeting; the *other* domain is the external party. This is how you name files and build the who's-who.
- **Exclude with a reason, don't silently delete.** Anything you set aside gets a recorded reason and a
  home in `other/`, so the human can pull it back.
- **Leave it uncommitted.** Write into the target repo's working tree; never commit or push. The human
  reviews first.

## Before you start — confirm the essentials

Ask only what you genuinely can't infer:
1. **Where are the sources?** (one or more directories) and **where should the archive go?**
   (default: `<repo>/customer-feedback/`).
2. **Who is the internal company** and its **email domain(s)** (e.g. `@acme.com`), and who is the primary
   internal voice / CEO? You'll usually infer this from the meeting notes' "Invited" lists — confirm it.
3. **What segments matter?** Propose a default buyer-segment scheme (see `references/method.md`) and let
   them adjust. If the source is already foldered by segment, mirror that.
4. **Scope of the heavy/fuzzy sources** — a year of internal Slack, screenshot OCR, audio/video. These
   are large, judgement-heavy, and sometimes out of scope; agree what's in.

For genuinely large, hard-to-reverse generation, surface these before running — but once you have enough
to act, act; don't ask permission for routine conversion.

## The pipeline

Work in phases. The mechanical phases have bundled scripts in `scripts/` (starting points — read and
adapt them to the actual dump); the judgement-heavy phases are described in `references/method.md`. The
heavy read/OCR/mining phases are best **delegated to subagents** (prompt templates in
`references/slack-and-media.md`) to keep your context lean.

### Phase 0 — Recon & inventory
Map every source directory: file types and counts, the folder structure, and the "who's who" anchor
(the internal domain). Check tools: `pandoc` and `textutil` for docx; `python3` for JSON/scripts.
`ls`/`find` for structure. Note un-convertible media (audio/video/xlsx) to inventory later. Read
`references/method.md` §1.

### Phase 1 — Convert to verbatim Markdown + build a manifest
Run `scripts/convert_manifest.py` (params: `--source <dir>…`, `--staging <dir>`, `--exclude <substr,…>`).
It pandoc-converts every `.docx` to Markdown, **cleans pandoc artifacts** (`{.underline}` styling spans,
`[[x]{.underline}](url)` links, `\'`/`\"` escapes), and emits `manifest.json` per file with: date (from
filename), title, **attendee emails**, word count, and a normalised **content hash** for dedup. Exclude
obvious non-feedback by filename up front (ISO/ISMS/audit/security governance, "test", empty
"Meeting started" auto-recordings). PDFs and `.txt` also convert; the one exception is Google AI-Studio
JSON and Slack — handled in later phases.

### Phase 2 — Classify each meeting into a segment, and place it
For each meeting, decide **segment + external person + company** using: the **attendee email domains**,
the **source folder** it came from (if already segmented), and each doc's **Summary paragraph** (extract
them with `scripts/extract_summaries.py` for a fast classification pass). Write your decisions into a
`classification.json` (schema in `references/method.md` §2), then run `scripts/place.py` to write the
final files: named `YYYY-MM-DD-person-company.md`, each with YAML front-matter (date, segment, company,
internal rep, external party, doc_type, source) + a one-line context note, then the verbatim body.
`place.py` dedupes identical content by hash automatically. Read `references/method.md` §2–3.

### Phase 3 — Consolidate notes/transcript pairs → one file per meeting
Google's *"Notes by Gemini"* docs **embed the full transcript** (a `## …- Transcript` heading followed by
`### 00:00:00` timestamp turns) beneath their Summary/Details. So a separate standalone transcript of the
same meeting is a **duplicate** — run `scripts/consolidate_transcripts.py`: it deletes a standalone
`-transcript.md` when its notes sibling already embeds the transcript, and folds the transcript in when
the notes are summary-only. Standalone transcripts with *no* notes sibling are the sole record — kept.

### Phase 4 — Extract the other source types (delegate the heavy ones)
- **Google AI-Studio JSON** (`{runSettings, systemInstruction, chunkedPrompt}`): extract the
  `chunkedPrompt.chunks[].text` turns (role-labelled) into `research-and-personas/`. Reusable extractor
  pattern in `references/slack-and-media.md`.
- **Screenshot evidence** (forum posts, emails): delegate an OCR subagent (Read renders images) to
  transcribe verbatim into a themed evidence file. Prompt template in `references/slack-and-media.md`.
- **Audio/video/spreadsheets**: can't transcribe here — inventory them in the INDEX with their paths
  (and note where a matching text transcript already exists).

### Phase 5 — Mine Slack for product feedback (delegate to subagents)
For each relevant channel export (`product`, `the-feed`, `meeting-summaries`, `meeting-transcripts`):
build the `id→name` + bot set from `users.json`, then keep only **product feedback / discovery / meeting
summaries** (especially posts with Google Drive/Docs links) and drop bot/integration noise,
channel-joins, deploy/status spam, internal **test transcripts**, and logistics chatter. Attribute every
kept post to its author. **Exclude authors who aren't feedback sources** (e.g. internal engineering) if
the user says so. Resolve `<@Uxxxx>`→`@Name` and `<url|label>`→`[label](url)`. Output verbatim,
chronological digests in `slack/`. Full subagent prompt template in `references/slack-and-media.md`.

### Phase 6 — De-dup Slack recaps against transcripts
Slack meeting-recaps that summarise a meeting you already have as a canonical transcript are duplicates.
Match each recap to its canonical file (person + firm + date), **merge** the recap into that file under a
`## Slack recap (posted <date>)` heading (so its distilled insight lives with the transcript), and reduce
the digest entry to a **pointer** back to the canonical file. Recaps of meetings with *no* transcript are
kept as their sole record and flagged *summary-only*. Method in `references/method.md` §4.

### Phase 7 — Strip Google/Gemini auto-summaries (conditionally)
Remove Gemini's auto-generated `Summary` / `Details` / `Suggested next steps` sections **only from files
that contain a real transcript** (`### 00:` turns) — the transcript is the record, so the AI summary is
redundant. **If a file has NO transcript, KEEP its summary** — it's the only record. Also drop the "A
summary wasn't produced…" boilerplate. Run `scripts/strip_gemini_summaries.py --root <archive>`.

### Phase 8 — Set aside non-core material → `other/`
Move files that don't serve discovery/feedback/roadmap into `other/` **with a recorded reason** (in each
placement's `moved_reason`): fundraising/external-investor pitches, mentor/networking calls, near-empty
stubs, tangential external reports. Don't delete — the human can pull any back. Criteria in
`references/method.md` §5.

### Phase 9 — Build the INDEX
Run `scripts/build_index.py` (reads the placements produced by `place.py`). The INDEX must contain:
**who's-who** (internal rep/CEO vs external, identified by email domain), **per-segment tables**
(date · external party · company · doc type · file), a **de-dup note** explaining the one-file-per-meeting
rule, the **Gemini-summary rule** (removed where a transcript exists, kept otherwise), an **excluded**
list with reasons, a **media inventory** (un-transcribed audio/video), and **provenance** (which sources
fed it). For undated files, estimate **probable dates** (`≈ YYYY-MM`) from the source file's Drive-modified
timestamp — which matches the in-filename date on dated files — and in-document clues; record the basis.
Method in `references/method.md` §6.

### Phase 10 — Verify & hand off
Sanity-check: a full-body content-hash scan shows **no meeting body in two files**; no Gemini `Summary`
heading co-exists with a transcript; every excluded/other file has a reason. Report the final tree +
counts. **Leave everything uncommitted** for the human to review.

## Delegation

The read/OCR/mining phases (4–5, and large classification passes) are token-heavy — delegate them to
subagents so your own context stays lean, then fold their outputs back in. Keep the deterministic work
(pandoc conversion, hashing, placement, strip, index) in bundled scripts so every run is fast and
consistent. Prompt templates for the subagents live in `references/slack-and-media.md`.

## What "done" looks like

A single archive directory: `INDEX.md` + segment folders (`01-…`, `02-…`, …) of one-file-per-meeting
verbatim records + `research-and-personas/` + `slack/` digests + `other/` (with reasons). No duplicate
bodies, no derived summary competing with a transcript, every set-aside file explained — ready to point
discovery-sentinel or product-strategist at.

## Reference files
- `references/method.md` — the judgement: segment classification from email domains, `classification.json`
  schema, who's-who, dedup rules, Slack-recap merging, exclusion criteria, probable-date estimation, and
  the exact Gemini-summary strip rule.
- `references/slack-and-media.md` — subagent prompt templates (Slack channel mining, screenshot OCR) and
  the AI-Studio JSON extraction pattern.
- `scripts/` — `convert_manifest.py`, `extract_summaries.py`, `place.py`, `consolidate_transcripts.py`,
  `strip_gemini_summaries.py`, `build_index.py`. Read each before running; they are adaptable starting
  points, not black boxes.
