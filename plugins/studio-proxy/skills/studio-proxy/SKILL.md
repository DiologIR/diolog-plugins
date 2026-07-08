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

## What this skill covers — and what it deliberately does NOT

**The generation contract and craft are NOT restated here** — they live in the studio agent's
own on-disk sources you load per the harness: `agent/instructions.md` (structure-first
streaming, honest-failure/no-fabrication, real imagery, the modernise-DESIGN.md pass, IA
depth, live-data widget frames, the per-page `design-reviewer` gate, and — for investor
surfaces — the shared `diolog-widgets` `references/investor-portal.md` blueprint), the wire
contract in `agent/lib/studioContract.ts`, and the seeded skills. **Follow all of that FROM
those files.** Re-documenting it here is exactly what would let the proxy drift from the
deployed agent — so this skill stays thin and points back.

This skill covers only what is genuinely **different in proxy mode**:

- **You build the envelope the deployed dispatcher would build.** The deployed agent is handed
  its envelope by the Diolog backend crawler; the proxy isn't inside the dispatcher, so it must
  reconstruct it. Build it with the bundled capture (any site):
  `node apps/studio/scripts/capture-site.mjs --url <root> --out <run-dir> --widgets a,b,c`
  → `inputs/envelope.json` with real `pages[].images[]` + structure-preserving
  `pages[].markdown` (it mirrors the deployed crawler's innerHTML→markdown, strips chrome, and
  prioritises informational pages — about/leadership/history/investor/governance/contact — so a
  deep site's real story reaches the agent, not nav boilerplate). Origin image URLs are kept
  (not rehosted). A thin, nav-only envelope is a proxy **capture** defect (re-run with
  `--pages`/`--max`), never the studio's ceiling — say so in your summary if a surface is thin.
- **Simulate the two tools to files, run the local converters, validate per kind** — all
  detailed in the harness (`emit_generation_event` → `<run-dir>/events.ndjson`;
  `submit_artifact` → `<run-dir>/artifact.json` + `out/`; vendor `PYTHONPATH` converter paths).
- The **run directory** (above), **Tier-2 locally** (below), and the **honest boundary report**
  (below).

**Finding the skills on disk (robustness).** The proxy reads the sources directly, so use the
**committed, always-present** copies — never assume a built copy exists:
- site build skills → the vendored submodule `apps/studio/vendor/diolog-plugins/plugins/*/skills/*`;
- the `diolog-widgets` skill → **`scripts/generated/diolog-widgets-skill/`** (committed): its
  `SKILL.md` + `references/catalogue.md` + `references/investor-portal.md`.

The `apps/studio/agent/skills/*` copies are **built by `sync-skills` (predev/prebuild) and
gitignored** — they may be absent in a fresh checkout. If a skill or reference isn't where you
expect, read the committed generated/vendored paths above, or run
`node apps/studio/scripts/sync-skills.mjs` (and, for `diolog-widgets`,
`pnpm tsx scripts/generate-widgets-skill.ts`) first. Never fail a run because a built copy is missing.

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
dispatcher/apply/live-view plumbing (that's `pnpm nx test api -- --testPathPatterns=content-studio`).
It runs at least the deployed studio's model tier (Claude Code may run a higher one), so
treat quality as a near-equal-or-upper bound, not the exact deployed behaviour. To exercise
the real runtime instead, point the user at `apps/studio/docs/local-testing.md`.
