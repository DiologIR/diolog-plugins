---
name: studio-proxy
description: Act as the diolog-studio Eve agent locally inside Claude Code, with zero Eve/gateway spend — generate a site, document, spreadsheet, or deck from a job envelope using the studio's REAL on-disk instructions, wire contract, and skills, streaming the structure-first event log and the final artifact to local files. Use whenever the user wants to preview, test, dry-run, or iterate on a studio generation locally or "in Claude Code" — "preview what the studio would generate", "run the studio locally without spend", "act as the studio agent", "test a studio site/deck/document/spreadsheet", "use the proxy harness", "would the studio produce good output for company X" — even if they don't say "proxy" or "harness". Optionally runs the local Tier-2 screenshot self-review via the capture mock. NOT for running the real Eve runtime (use apps/studio/docs/local-testing.md — eve dev / eve eval) or the Diolog-side dispatcher/apply plumbing (content-studio unit tests).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Studio Proxy — act as the diolog-studio agent, zero spend

You become the `diolog-studio` agent for one generation job. Your model + file/shell
tools stand in for the Eve runtime; everything that defines the studio's behaviour is
read from the REAL on-disk sources, so the output is a faithful (upper-bound) proxy for
what the deployed studio would produce — without the $15–25 an Eve run bills.

**The canonical procedure is `apps/studio/studio-claude-code-harness.md` — read it in
full and follow it exactly.** It specifies: which real files ARE your instructions
(`apps/studio/agent/instructions.md`, the zod wire contract in
`agent/lib/studioContract.ts`, the per-kind subagent instructions + skills, the
design-reviewer criteria you self-apply per site page), how to simulate the two tools
(`emit_generation_event` → append one JSON payload line per event to
`<run-dir>/events.ndjson`, as you go, structure-first; `submit_artifact` →
`<run-dir>/artifact.json` + per-unit files under `<run-dir>/out/`), the real converter
commands (gridmd `.gmd→.xlsx` round-trip; `deckconv validate` — vendor `PYTHONPATH`
paths, NOT the sandbox `/workspace` paths), the validation gates per kind, and the
editable JOB ENVELOPE template.

## Run directory

Default `<run-dir>` = `apps/studio/.local-run/` (gitignored). If the caller designates
a different output directory, use that instead — same layout (`events.ndjson`,
`artifact.json`, `out/`). Never commit run outputs.

## The non-negotiables (the studio's contract, kept even in proxy mode)

- **Structure first, complete.** One `structure` event naming EVERY top-level unit
  before any content exists; per-unit `substructure` before that unit drafts; events
  appended as you go, never batched at the end.
- **Wire-contract fidelity.** Every event payload and the final artifact must satisfy
  the zod shapes in `agent/lib/studioContract.ts` (field names, discriminated unions,
  size caps) — a non-conforming artifact would be rejected by the real dispatcher, so
  it is a failed run here too.
- **Honest failure, never fabrication.** Reproduce the envelope's facts verbatim; cut
  anything you can't ground; live-data surfaces are empty `data-diolog-widget` markers,
  never hand-faked charts or prices. If you genuinely can't ground the artifact, emit
  an `error` event and stop.
- **The site review gate.** For `site`, you play builder AND critic: after drafting
  each page, critique it against `agent/subagents/design-reviewer/instructions.md`
  (`{scores, mustFix}`) and repair every mustFix before the page's `unit-content` —
  exactly one critique loop per page, max 3 rounds, open items stated on exhaustion.

## Optional Tier-2 — real screenshots, still zero gateway spend (site jobs)

The production loop looks at rendered screenshots between lint and review. You can too:

1. Start the capture mock: `cd apps/studio && STUDIO_CAPTURE_SECRET=<any> pnpm local-capture`
   (Docker; builds the baked-Chromium image on first run).
2. After drafting a page, POST it: `curl -s -X POST http://localhost:8080/api/internal/html-capture
   -H "Authorization: Bearer <the same secret>" -H "content-type: application/json"
   -d '{"jobId":"proxy-run","shots":[{"slug":"<page>","html":<the page HTML as a JSON string>}]}'`
   → returns 375px + 1280px screenshot URLs/paths under `apps/studio/local/.shots/`.
3. **Read the PNGs yourself** (the Read tool renders images) and fold what you see —
   overflow at 375px, unreadable contrast, broken layout, missing sections — into the
   design-reviewer critique, then repair.
4. Stop the service when done (Ctrl-C handler removes the container; or
   `docker stop studio-local-capture && docker rm studio-local-capture`).

Skip Tier-2 when Docker is unavailable or the job isn't a site — say so in your summary
(honest degradation), exactly as the real tool does.

## Finishing a run

Report: the artifact location + how to open it (site pages in a browser; `.xlsx` in the
embedded editor; deck JSON validated exit-0), the event count + a one-line confirmation
that structure preceded all content, any review rounds that hit the cap, and the honest
boundary — this proxy validates generation quality and converters, NOT the Diolog
dispatcher/apply/live-view plumbing (that's `pnpm nx test api -- --testPathPatterns=content-studio`)
and it runs a stronger model than the studio's deployed default, so treat quality as an
upper bound. To exercise the real runtime instead, point the user at
`apps/studio/docs/local-testing.md`.
