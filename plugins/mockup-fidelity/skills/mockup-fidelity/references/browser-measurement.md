# Browser measurement — reading getComputedStyle from a rendered surface

You need a real browser to read computed styles and capture screenshots. This applies to **both** sides when both are DOM (the HTML/CSS reference, and a React or react-native-web target), and to the reference side always.

## Tools (any that read the DOM + screenshot works)

- **`playwright-cli`** — Playwright selector ergonomics; good for DOM/console/network inspection. `playwright-cli -s=<session> open <url>`, `screenshot <selector> --filename <path>`, `--raw eval "<js>"`. Output paths are usually restricted to inside the repo — write screenshots to a repo-local scratch dir (gitignore it). Use a separate `-s=<session>` per surface so reference and target stay loaded at once.
- **`agent-browser`** — drives SPAs on `http://localhost/` (not a public HSTS host). Use a viewport **≥ 1680px** for desktop multi-column layouts; **wrap each `eval` in an IIFE** (evals share one global scope); results come back **double-JSON-encoded** — decode twice.
- **Chrome MCP** (`mcp__claude-in-chrome__*`) — load via `ToolSearch` first; good when a logged-in profile is already where you need it.

**Serving a static mock:** open the HTML directly; if `file://` blocks its scripts/fonts, serve the folder (`python3 -m http.server <port>`) and open `http://localhost:<port>/<file>.html`.

**A mock gallery** (many phone frames on one page) is common. Tag each frame once so you can screenshot it by selector:

```js
// give every frame a stable id, then screenshot "#mockframe-N" per screen
(() => { let n=0; document.querySelectorAll('figure.fig, .phone, .frame').forEach(f => { f.id='mockframe-'+n++; }); return n; })()
```

Hide the gallery's own sticky chrome (page header/nav) before screenshotting frames, or it overlaps each frame's top. Measure the frame's pixel size and set the **target viewport to match** (e.g. a 393×852 phone frame).

## Per-property extraction pattern

For the per-property diff (SKILL.md Phase 3C), pull the exact computed values for each named element. Keep evals IIFE-wrapped and return `JSON.stringify`:

```js
(() => {
  const pick = (sel, props) => {
    const el = document.querySelector(sel); if (!el) return null;
    const cs = getComputedStyle(el); const o = {}; props.forEach(p => o[p] = cs[p]); return o;
  };
  const TYPE = ['fontSize','fontWeight','lineHeight','color','letterSpacing','textTransform','fontFamily'];
  const BOX  = ['paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginBottom',
                'borderTopWidth','borderTopColor','borderRadius','backgroundColor','boxShadow','gap','display'];
  return JSON.stringify({
    container: pick('#frame .stats', BOX),
    label:     pick('#frame .stat .k', TYPE),
    value:     pick('#frame .stat .v', TYPE),
  }, null, 1);
})()
```

Print the **full** value — never slice a box-shadow, gradient, or border before comparing. A ✓ requires both full values shown and matching.

**Pseudo-elements & states matter:** `::placeholder` colour is the property most often silently wrong (it's a *different* property from the element's `color`, which is the typed-text colour) — read it with `getComputedStyle(el, '::placeholder')`. Force `:hover`/`:focus-within`/`:active` (add the class / focus the node) and re-extract where the design differs by state.

**Numeric gotchas:** a `0.5px` border computes to `1px` at DPR 1; an `em` letter-spacing computes to px **at the element that declares it** and inherits as that fixed px; a `0px`-width border still reports a style+colour — ignore style/colour when width is 0.

## Structured one-pass snapshot

For everything beyond a handful of named elements — the structural skeleton, every control's containment anchor, region styles, thin/empty/variant flags — use the **fidelity probe** in `fidelity-probe.md`: one `eval` per surface returns the whole detection snapshot, so you classify offline from the JSON instead of re-opening the page. Capture the reference once and reuse it; re-capture only the target after a fix.

## Rendering a protected target

A real app target usually needs its dev login first. Establish a session (the project's dev-login affordance, or ask the user to log in), select any required context, then navigate to the actual route with real-ish data before measuring — a login screen is not the surface you were asked to audit. Pick a context whose data **populates** the screen (the Done-criteria require the populated state, not the fallback) — e.g. choose a tenant/company that actually has rows.

**When the target is also DOM (web↔web — a React/Next app vs a React/Next or HTML reference):** measure it with the *same* `extract-mock.js` you ran on the reference and pass its dump to `diff.mjs` as `--app`. Render both at the **same viewport** so geometry compares directly, select the screen content root with `window.MF_FRAME_SELECTOR` (tag it with a `data-*` attribute for a stable selector), and set `window.MF_CHROME_SELECTOR='__none__'` so the web app-chrome (sidebar/header/nav) is measured rather than skipped — the native-chrome exemption does not apply on the web. Full playbook: `references/react-web.md`.
