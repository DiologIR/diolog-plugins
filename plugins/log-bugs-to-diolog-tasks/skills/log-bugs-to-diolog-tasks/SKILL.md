---
name: log-bugs-to-diolog-tasks
description: "Create Diolog Tasks issues from a code-review markdown report. Each `### [SEVERITY] Title` finding becomes one Tasks issue with severity (Critical/High/Medium/Low) plus type (Vulnerability/Bug) labels and Todo status. Formerly log-bugs-to-linear. Use this skill whenever the user asks to log, file, create, import, sync, raise, or 'load' findings from a code-review .md (or security audit / PR review report) into Diolog Tasks, even if they don't say 'skill' or 'Diolog' explicitly. Triggers on phrases like 'log these to Tasks', 'create Tasks issues for each finding', 'import this code review into Diolog Tasks', 'file these bugs as tickets', 'raise tickets for these findings', or any prompt that points at a markdown file with `[CRITICAL]` / `[HIGH]` / `[MEDIUM]` / `[LOW]` severity-tagged sections."
allowed-tools:
  - "Read"
  - "Bash"
  - "ToolSearch"
  - "TaskCreate"
  - "TaskUpdate"
---

# Log Bugs to Diolog Tasks

<role>
You are a triage operator. You take a code-review (or security-audit, PR-review) markdown report and turn each finding into a properly-tagged Diolog Tasks issue, fast and without losing fidelity. You preserve the reviewer's exact prose, file:line citations, fix recommendations, confidence scores, and verification notes — those are what make the issue actionable later.

You do not summarise, paraphrase, or "improve" findings. The reviewer's words are the artefact.
</role>

## When to activate this skill

Trigger when the user:
- Points at a code-review `.md` file (or pastes one) and asks to log / file / create / import / sync / raise issues from it.
- Says "create Tasks issues for each finding", "log these bugs to Diolog Tasks", "load these findings into Tasks", or similar.
- Has just generated a code review (e.g. via the `code-review` skill or `/ultrareview`) and asks to put the output into Diolog Tasks.

Do **not** activate this skill for:
- Single-issue creation when the user describes a bug conversationally — call `mcp__diolog-tasks__create_issue` directly.
- Updating or commenting on existing issues.
- Migrating issues from another tracker (Jira, GitHub Issues) — the parsing rules below assume the input matches the project's code-review report shape.

## Operating protocol

### 1. Confirm intent and locate the source file

- Resolve the file path the user gave you. If the path is ambiguous, ask before parsing.
- The default target is the project with key **`DIO`**. If the user names a different project, switch to that project for this run only — do not change the default.

### 2. Load the diolog-tasks MCP tools

The diolog-tasks MCP tools are typically deferred and must be loaded before the first call. At the start of each run:

```
ToolSearch query: "select:mcp__diolog-tasks__list_projects,mcp__diolog-tasks__list_labels,mcp__diolog-tasks__list_workflow_states,mcp__diolog-tasks__create_label,mcp__diolog-tasks__create_issue"
```

If you later need a tool that wasn't in the initial load (e.g. `mcp__diolog-tasks__list_issues` for de-duplication), load it the same way before calling it.

### 3. Parse the report

Findings are separated by `---` and headed with `### [SEVERITY] Title` where `SEVERITY ∈ {CRITICAL, HIGH, MEDIUM, LOW}`. The body of each finding may include any combination of:

- An issue / description paragraph
- A `**File:**` line **or** a `## Locations` block
- A `**Fix:**` line **or** `## Fix` block
- `**Confidence:**`, `**Verification:**`, `**Status:**` lines or blocks

**Skip** findings explicitly marked **refuted**, **withdrawn**, or **duplicate-of** in the body. Note them in the final summary so the user knows what wasn't filed and why.

### 4. Setup checks (run once before creating issues)

1. Resolve the target project via `mcp__diolog-tasks__list_projects` (default: the project with key `DIO`; if it doesn't exist, list the available projects and ask). Capture the project ID — `create_issue` requires it.
2. Fetch existing labels via `mcp__diolog-tasks__list_labels`; ensure these exist, creating any missing ones via `mcp__diolog-tasks__create_label` (labels are company-wide — no team scoping):
   - **Severity:** `Critical` (#C81E1E), `High` (#EB5757), `Medium` (#F2994A), `Low` (#27AE60)
   - **Type:** `Vulnerability` (#9333EA), `Bug` (#EB5757 — usually already exists)
   - If `create_label` reports a duplicate (e.g. a different-case variant already exists), use the existing label's ID and note the variant in the final summary rather than creating a near-duplicate.
3. Resolve the `Todo` workflow state ID via `mcp__diolog-tasks__list_workflow_states`. If no `Todo` state exists, list the available states and ask which to use.

### 5. Per-issue field mapping

| Field | Value |
|---|---|
| `projectId` | The resolved target project (default key `DIO`) |
| `title` | The heading text **with the `[SEVERITY]` prefix removed**. Do not embed severity in the title — that's the label's job. |
| `stateId` | The resolved `Todo` state ID |
| `priority` | Critical → 1 (Urgent), High → 2 (High), Medium → 3 (Normal), Low → 4 (Low) |
| `labelIds` | Two label IDs: severity (`Critical` / `High` / `Medium` / `Low`) **and** type (`Vulnerability` for security findings; `Bug` for correctness / functionality findings) |
| `descriptionMarkdown` | Full markdown body of the finding — Issue, Locations, Fix, Confidence, Verification, Status. Preserve fenced code blocks and bullet lists. Do **not** add a TL;DR or paraphrase. |

**Type-label heuristic.** Apply `Vulnerability` when the finding has a security impact: auth/authz, IDOR, injection (SQL / NoSQL / command / template), crypto weakness, secret leakage, signature bypass, CRLF, SSRF, prototype pollution, missing rate-limit on a security-sensitive endpoint, exposed admin route, missing tenant scope, etc. Apply `Bug` for correctness or functionality findings: mock data in production, broken fallbacks, schema typos, missing methods, race conditions, dead code, performance, etc. When in doubt, prefer `Vulnerability` if the finding's body explicitly discusses an attacker, exploit, leak, or unauthorised-access path.

### 6. Execute

- Create issues by parallelising `mcp__diolog-tasks__create_issue` calls in batches of ~12. Larger batches sometimes get rate-limited.
- Use `TaskCreate` to track progress so the user can see where you are if the run is long.
- After all issues are created, output a single summary: count by severity, count by type-label, the issue identifier range (e.g. DIO-4702..DIO-4728), and any findings you skipped (with reason).

### 7. Re-run handling

If asked to re-run on the same `.md` file, ask first: skip findings whose title already exists in the project (check via `mcp__diolog-tasks__search_issues`), or update them in place? Do not create duplicates by default.

## Constraints

- **Do not modify the source .md file.** It is the audit record.
- **Do not create projects, milestones, or comments.** Only issues and (if missing) labels.
- **Do not paraphrase finding bodies.** The reviewer's exact prose is part of the artefact.
- **Do not invent severities or labels.** If a finding lacks a `[SEVERITY]` tag, ask the user how to triage rather than guessing.
- **Do not silently substitute labels.** If you hit the duplicate-label caveat in §4.2, surface it.

## Why these choices

- **Severity is a label, not a title prefix.** Tasks board filters and saved views are label-driven, so a `Critical` label gives the user a one-click triage view that a `[CRITICAL]` title prefix doesn't.
- **Two labels per issue (severity + type) instead of one combined label** keeps the cardinality low (4 × 2 = 8 distinct combinations rather than 8 separate labels) and lets the user filter "all critical" or "all vulnerabilities" independently.
- **Todo, not Backlog** because code-review findings are actionable now. They've already been verified by the reviewer; they're not aspirational.
- **Preserve the full description verbatim** so the audit chain is intact: anyone reading the issue six months later can see the same evidence the reviewer saw, including the confidence score and verification status.
