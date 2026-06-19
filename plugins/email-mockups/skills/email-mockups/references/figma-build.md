# Building the mockups in Figma (tool-agnostic)

The skill doesn't assume a specific Figma MCP. It discovers whatever is connected
at run time and adapts. The endpoint is: each HTML artboard becomes a **titled,
spaced frame** on a Figma canvas, faithful to the HTML.

---

## Step 1 — Discover the Figma MCP and check it can WRITE

Figma MCPs come in two kinds, and the difference is decisive:

- **Read-only** (Figma's official *Dev Mode* MCP, Framelink/`figma-developer-mcp`,
  most "figma-context" servers): they *extract* design → code. They **cannot
  create** nodes on a canvas. For this skill they count as "no Figma MCP".
- **Write-capable** (the "Talk to Figma" family — e.g. `cursor-talk-to-figma-mcp`,
  `claude-talk-to-figma-mcp`): a Figma **plugin + local socket bridge** that lets
  you create frames, rectangles, text, set fills, corner radius, effects, and
  move nodes in the **currently open** Figma document. This is what the skill
  needs.

Find what's available:

```
ToolSearch  →  query: "figma"   (and try "talk to figma", "create frame figma")
```

Inspect the matched tools' schemas. You're looking for create/modify verbs
(create_frame, create_rectangle, create_text, set_fill_color, set_corner_radius,
set_effect/clone, move_node, set_text_content, join_channel, …). If you only find
read/extract verbs (get_file, get_node, get_code, get_image), it's read-only.

**Decision:**
- **Write-capable MCP found** → continue to Step 2.
- **Only read-only, or none** → STOP the Figma step. Keep the HTML file as the
  final deliverable, tell the user it's the output, and (briefly) that wiring up a
  write-capable "Talk to Figma" MCP would let the skill build the canvas directly.
  Do **not** fake the Figma step or claim it ran.

These bridges drive the **open** Figma document. If the tools expose a channel/
join step (the plugin shows a channel id), join it first. If nothing is open or
the plugin isn't running, ask the user to open Figma and start the plugin rather
than guessing.

---

## Step 2 — Plan the canvas from the HTML

You already have the source of truth: the rendered HTML. Treat each
`<figure class="dio-artboard">` as one Figma frame.

- **Container:** make one parent frame/section named
  `Diolog · <feature> · email mockups`.
- **Layout:** place artboard frames left-to-right (wrap into a grid for many),
  with a consistent gap (~96px) so each reads as a discrete export — mirror the
  `.dio-canvas` spacing.
- **Title:** above each frame, a text node with the artboard's title (the
  `.dio-artboard__title` text), JetBrains Mono, uppercase, `--dio-fg-muted`.
- **Caption:** *below* each frame, a text node with the under-mock marketing summary (the
  `.dio-artboard__note` text), Inter ~13.5px, `--dio-fg-secondary`, max ~60ch. This is the
  brief non-technical benefit for IR teams + their agencies; carry it across verbatim. (The
  email-hero artboards have no note — their benefit is in the copy column inside the frame.)
- **Frame size:** use the artboard's pixel size from the HTML (e.g. 640×500).
- **Board fill:** the board colour (white / `#F5F7FB` / `#0A1733`).

Pull exact values from the HTML/computed styles so Figma matches — hex fills,
corner radii (9/10/14/16/20), the shadow tokens (`--dio-shadow-md` etc. → Figma
drop-shadow effects), font family/size/weight, and text. Don't re-derive by eye.

A fast, faithful path if your write-MCP supports it: import each artboard as an
**SVG or image** (render the HTML node to SVG, or screenshot it) and place that as
the frame's content, then add the title text. If it only supports primitive
nodes, rebuild node-by-node from the plan above. Either way the result must look
like the HTML.

---

## Step 3 — Verify and finish

- Take a screenshot of the Figma canvas (or fetch a node image) and compare to the
  HTML render. Fix any drift (wrong fill, clipped text, mismatched radius/shadow).
- When the Figma build is confirmed good, **delete the intermediate HTML file**
  (it was scaffolding). If the build failed or is partial, keep the HTML and say so.
- Tell the user where the Figma frames are and that each frame exports to PNG for
  the email.
