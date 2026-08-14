#!/usr/bin/env bash
# Run the deck gates across the window sizes a deck actually meets.
#
# One viewport proves nothing about a scaled fixed stage: the defect that
# reached production was invisible at 1280x1024 and clipped 120px off every
# slide at 1680x1050. Sizes wider and narrower than 16:9 are both needed,
# because the scale is bounded by whichever axis runs out first.
#
# Serve over HTTP, never file:// — module scripts, fetches and some fonts fail
# silently from the filesystem, and a deck that "works locally" from a file URL
# has not been tested.
#
# Needs `obscura` on PATH and nothing else. The viewport loop runs over CDP
# because `obscura fetch` renders at a fixed 1280x720 with no way to resize it,
# and a single viewport is precisely what this script exists to refuse.
#
# Usage:  ./run_gates.sh http://localhost:8000/deck.html [cdp-port]

set -euo pipefail
URL="${1:?usage: run_gates.sh <url> [cdp-port]}"
PORT="${2:-9276}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$URL" == file://* ]]; then
  echo "refusing a file:// URL — serve the deck over HTTP (python3 -m http.server)" >&2
  exit 2
fi

command -v obscura >/dev/null || {
  echo "obscura is not on PATH — download the aarch64-macos release from" >&2
  echo "https://github.com/h4ckf0r0day/obscura and put it in ~/.local/bin" >&2
  exit 2
}

# --allow-private-network is not optional: a deck served on localhost is blocked
# by default and every gate fails as an SSRF block, which reads like a broken
# deck rather than a blocked fetch.
obscura --allow-private-network serve --port "$PORT" --quiet >/dev/null 2>&1 &
OBSCURA_PID=$!
trap 'kill "$OBSCURA_PID" 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -sf "http://127.0.0.1:$PORT/json/version" >/dev/null && break
  sleep 0.25
done

GATES_PATH="$HERE/gates.js" URL="$URL" PORT="$PORT" node --input-type=module -e '
import { readFileSync } from "node:fs";
const gates = readFileSync(process.env.GATES_PATH, "utf8");
const v = await (await fetch(`http://127.0.0.1:${process.env.PORT}/json/version`)).json();
const ws = new WebSocket(v.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise(r => {
  const i = ++id; pending.set(i, r);
  ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
});
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise(r => ws.addEventListener("open", r));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const t = await send("Target.createTarget", { url: "about:blank" });
const sid = (await send("Target.attachToTarget", { targetId: t.result.targetId, flatten: true })).result.sessionId;
for (const d of ["Page", "Runtime"]) await send(d + ".enable", {}, sid);

// Obscura emits no Runtime.consoleAPICalled, so the console gate is a page-side
// hook installed before navigation rather than a CDP event stream.
await send("Page.addScriptToEvaluateOnNewDocument", { source: `
  window.__deckConsole = [];
  for (const k of ["log","warn","error","info"]) {
    const o = console[k];
    console[k] = (...a) => { try { window.__deckConsole.push(k + ": " + a.map(String).join(" ")); } catch (e) {} if (o) o.apply(console, a); };
  }
  addEventListener("error", e => window.__deckConsole.push("pageerror: " + (e.message || e.error)));
` }, sid);

const evaluate = async expr => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sid);
  if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description ?? "eval threw" };
  return r.result?.result?.value;
};

await send("Page.navigate", { url: process.env.URL }, sid);
await sleep(2500);

for (const vp of ["1280x800", "1440x900", "1680x1050", "1920x1080", "2560x1440"]) {
  const [w, h] = vp.split("x").map(Number);
  console.log(`═══ ${w}x${h} ═══`);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false }, sid);
  await sleep(600);
  // gates.js is a bare arrow function, and Runtime.evaluate wants an expression
  // — hence the wrapping call.
  console.log(JSON.stringify(await evaluate(`(${gates})()`), null, 2));
  console.log();
}

console.log("═══ console ═══");
const log = await evaluate("JSON.stringify(window.__deckConsole || [])");
for (const line of JSON.parse(log || "[]")) console.log(line);
ws.close();
process.exit(0);
'

cat <<'NOTE'

Read the denominators, not just the failure counts. A row reading `examined: 0`
is a gate that never ran, and uniform zeros across many surfaces are the
signature of an assertion written against a field the probe never sets.

Still not covered by this script, and each needs its own pass:
  · the printed PDF — open page 1, a middle photo slide, and the last one;
    a 12-page PDF whose page 1 composites all twelve slides still counts twelve.
    Obscura's PDF output is raster-backed, so produce the PDF from a real
    browser; do not read print typography off an Obscura render.
  · text sitting over a photograph — see contrastDeferred; measure the median
    luminance of the text's line box from a screenshot, because glyph ink is a
    minority of the box and the median is what the reader sees behind it.
  · whether each image is the one that was commissioned. Look at them.
NOTE
