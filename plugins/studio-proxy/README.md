# studio-proxy

Act as the `diolog-studio` Eve agent **locally inside Claude Code, with zero Eve/gateway
spend**. Your model + file/shell tools stand in for the Eve runtime; everything that
defines the studio's behaviour is read from the **real on-disk sources**, so the output is
a faithful (upper-bound) proxy for what the deployed studio would produce — without the
$15–25 an Eve run bills.

## What it does

Given a job envelope (kind = site / document / spreadsheet / deck + a company/brief), it:

1. **Reads the real studio definition** — the canonical procedure is
   `apps/studio/studio-claude-code-harness.md`, which points at the studio's actual
   instructions (`apps/studio/agent/instructions.md`), the zod wire contract
   (`agent/lib/studioContract.ts`), the per-kind subagent instructions + skills, and the
   design-reviewer criteria.
2. **Generates structure-first**, streaming a `structure` → `substructure` → content event
   log to `<run-dir>/events.ndjson` as it goes (never batched at the end), then submits the
   final artifact to `<run-dir>/artifact.json` + per-unit files under `<run-dir>/out/`.
3. **Enforces the studio's contract even in proxy mode** — every event payload and the
   final artifact must satisfy the zod shapes in `agent/lib/studioContract.ts` (field
   names, discriminated unions, size caps); a non-conforming artifact is a failed run here
   too, because the real dispatcher would reject it.
4. **Runs the real validation gates per kind** (gridmd `.gmd→.xlsx` round-trip; `deckconv
   validate`) and, optionally, the local Tier-2 screenshot self-review via the capture mock.

## Run directory

Default `<run-dir>` = `apps/studio/.local-run/` (gitignored). A caller may designate a
different output directory — same layout (`events.ndjson`, `artifact.json`, `out/`). Never
commit run outputs.

## When it triggers

Whenever you want to preview, test, dry-run, or iterate on a studio generation locally or
"in Claude Code" — "preview what the studio would generate", "run the studio locally
without spend", "act as the studio agent", "test a studio site/deck/document/spreadsheet".

**Not** for running the real Eve runtime (use `apps/studio/docs/local-testing.md` — `eve
dev` / `eve eval`) or the Diolog-side dispatcher/apply plumbing (content-studio unit tests).

## Requirements

Run from within the `dAIolog` repo — the skill reads the studio's real instructions, wire
contract, and converter commands from `apps/studio/**` by repo-relative path.

## Layout

```
skills/studio-proxy/
├── SKILL.md              # the procedure (read apps/studio/studio-claude-code-harness.md, then follow it)
└── evals/
    └── evals.json        # skill evals
```

## License

See [LICENSE](./LICENSE).
