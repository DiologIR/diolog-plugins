# Slack mining, screenshot OCR, and AI-Studio extraction

These phases are token-heavy and judgement-light-but-voluminous — **delegate each to a subagent** so your
own context stays lean, then fold the returned digest into the archive. Below are prompt templates
(adapt the bracketed parts) and the AI-Studio extraction pattern.

---

## Slack export shape (orient first)

A Slack workspace export is one directory per channel, each holding `YYYY-MM-DD.json` — a JSON array of
message objects. Key fields: `user` (a `Uxxxx` id), `text` (may contain `<@Uxxxx>` mentions and
`<url|label>` / `<url>` links and Slack markup), `ts` (epoch string), `type`, optional `subtype`
(`channel_join`, `bot_message`, `message_changed`…), `bot_id`, `thread_ts`, `user_profile.real_name`,
`reactions`. A top-level `users.json` maps `id → {name, profile.real_name, is_bot}` — build the id→name
map (prefer `profile.real_name`) **and the set of bot ids** from it before mining.

Channels worth mining for product signal: **`product`** (dedicated — keep almost everything human),
**`the-feed`** (team-wide — mostly noise, keep only product/recap posts), **`meeting-summaries`** /
**`meeting-transcripts`** (team-authored meeting recaps — high value, keep all substantive posts).

Author-line colon placement varies between exports/miners (`**Name:**` vs `**Name**:`); when you later
filter authors, match `^\*\*(↳ )?<Name>\b` to catch every variant including threaded `↳` replies.

## Subagent template — mine one channel

> Mine an internal Slack **#[CHANNEL]** channel export into ONE verbatim Markdown digest of product
> feedback / discovery. Do NOT read all files into context blindly — script it.
>
> **Context:** [COMPANY] is a [one line]. Humans include [names/roles]; there are many bot/integration
> accounts (Jira, Linear, Sentry, Google Drive, Calendly, Zapier…) whose messages are noise.
> **Inputs (quote paths — they contain spaces):** messages dir `"[…/CHANNEL/]"` (YYYY-MM-DD.json);
> user map `"[…/users.json]"`.
> **Task:** Build id→name + bot-id set from users.json. Keep ONLY (a) **meeting summaries / recaps of
> customer conversations**, especially posts with **Google Drive/Docs links** (capture text + links); and
> (b) **product feedback / discovery / user-research** (feature ideas, pain points, insights from calls,
> roadmap/prioritisation, UX findings, ICP/persona, demo feedback, competitor notes). DROP: bot messages,
> channel-joins, deploy/CI/status noise, standup/scheduling pings, market-news/status auto-posts,
> internal **test transcripts**, and off-topic chatter. [If asked: **exclude posts authored by
> <internal-engineering names>** — not feedback sources; their name may still appear in others' posts.]
> Resolve `<@id>`→`@Name` and `<url|label>`→`[label](url)`; unescape HTML entities; dedupe thread
> broadcasts.
> **Approach:** write a Python script (via Bash) that walks the JSON in date order, drops bot/subtype
> noise, flags candidates (google link OR long human message OR product keywords: feedback, feature,
> roadmap, user, customer, insight, persona, ICP, demo, competitor, pain, interview, transcript, recap,
> sentiment, onboarding, churn), and prints them by date with author resolved; then keep the genuinely
> product-relevant ones.
> **Output** → `[archive]/slack/[channel]-product-notes.md`: front-matter + a 2-3 sentence context note
> (curated verbatim digest; bot/test/chatter dropped; authors resolved from users.json), then
> chronological `## YYYY-MM-DD` sections, each kept post as `**<Author>:**` + verbatim blockquote, links
> preserved. Reply with: messages kept, date range, count of Google-Drive links, and a 4-6 bullet list of
> the most notable themes.

## Subagent template — map Slack recaps to canonical transcripts (read-only)

Before merging recaps (Phase 6), get an accurate mapping without burning context:

> READ-ONLY. Do not modify files. Given (1) a canonical-meeting index `person | company | date | path`
> and (2) the Slack digest file(s), list every dated entry that recaps a SPECIFIC external meeting and
> match it to a canonical file by person AND/OR company (posting date as corroboration; company phrased
> loosely — "EQT"="Equity Trustees"). Return a table: `digest | date | who/firm | canonical path or NO
> TRANSCRIPT | confidence | unique anchor` where **anchor** is a verbatim ~40-char substring from that
> entry (distinctive — include a name/number) I can string-match to edit it. Skip general product
> discussion that isn't a specific meeting recap.

Then merge the high-confidence matches with a small anchored script (append to canonical + replace digest
entry with a pointer); cross-reference the low-confidence ones instead of merging.

## Subagent template — OCR screenshot evidence

> Transcribe [N] screenshots into one verbatim Markdown evidence file. These are [what they are — e.g.
> forum posts / emails] collected as evidence of [the pain]. `ls` the dir `"[…]"`; **Read** each image
> (Read renders images) and transcribe ALL visible text VERBATIM — post text, usernames, timestamps,
> counts, UI labels; mark unreadable text `[illegible]`. Write to `[archive]/04-[end-users]/
> [theme]-evidence.md`: short context note, then thematic `##` headings (derive from filenames), each
> image a `### <filename>` + a blockquote of its transcribed text. Reply with count transcribed + any
> failures.

## AI-Studio JSON extraction (inline — small, no subagent needed)

A Google AI-Studio export is `{ runSettings, systemInstruction, chunkedPrompt }`. The conversation is in
`chunkedPrompt.chunks[]` — each `{text, role}`. The `user` turns are pasted source material; `model` turns
are the AI's synthesis. Extract into `research-and-personas/ai-studio-<slug>.md`: a header noting it's an
AI-Studio session (user = pasted sources, model = derived synthesis — treat as analysis, not primary
evidence), the `systemInstruction.text` (the persona given to the model), then each non-empty chunk as
`### [ROLE]` + its verbatim text. Minimal Python:

```python
import json
d = json.load(open(path))
sysi = (d.get("systemInstruction") or {}).get("text", "")
for c in d["chunkedPrompt"]["chunks"]:
    t = (c.get("text") or "").strip()
    if t:
        emit(f"### [{c.get('role','?').upper()}]\n\n{t}\n")
```
