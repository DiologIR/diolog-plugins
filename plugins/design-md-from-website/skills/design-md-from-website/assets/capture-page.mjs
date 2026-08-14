#!/usr/bin/env node
// capture-page.mjs — one page, fully settled: a FULL-PAGE screenshot plus the measured tokens.
//
// `obscura fetch --screenshot` captures the VIEWPORT ONLY (1280x720) and has no full-page flag, so
// it silently returns the hero and drops every section below the fold — the exact failure this
// skill's probe protocol warns about. Full-page capture needs `Page.captureScreenshot` with
// `captureBeyondViewport` and a clip sized from `Page.getLayoutMetrics`, which means CDP. This
// script is that, plus the lazy-content scroll and the probe eval, in one call per page.
//
// Node 22 has a global WebSocket, so there is nothing to install; `obscura` on PATH is the only
// requirement. Each run starts its OWN `obscura serve` on its own port, so parallel probe agents
// cannot collide — there is no shared session to fight over.
//
// USAGE:
//   node capture-page.mjs --url <url> --out-png <file.png> --out-json <file.json> \
//     [--probe <probe.js>] [--width 1280] [--height 900] [--settle 800]

import { readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

if (spawnSync('obscura', ['--version'], { stdio: 'ignore' }).error) {
  console.error('ERROR: obscura is not on PATH. Download the aarch64-macos release from\n' +
                '       https://github.com/h4ckf0r0day/obscura and put it in ~/.local/bin');
  process.exit(2);
}

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const URL_ = arg('url');
const OUT_PNG = arg('out-png');
const OUT_JSON = arg('out-json');
if (!URL_ || !OUT_PNG || !OUT_JSON) {
  console.error('usage: node capture-page.mjs --url <url> --out-png <f.png> --out-json <f.json> [--probe probe.js] [--width W] [--height H] [--settle MS]');
  process.exit(2);
}
const PROBE = arg('probe', join(HERE, 'probe.js'));
const WIDTH = parseInt(arg('width', '1280'), 10);
const HEIGHT = parseInt(arg('height', '900'), 10);
const SETTLE = parseInt(arg('settle', '800'), 10);
const PORT = 9200 + Math.floor(Math.random() * 300);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --allow-private-network so a locally-served page works too; on a public URL it changes nothing.
const server = spawn('obscura', ['--allow-private-network', 'serve', '--port', String(PORT), '--quiet'],
  { stdio: 'ignore' });
{
  const deadline = Date.now() + 15000;
  let up = false;
  while (Date.now() < deadline && !up) {
    try { up = (await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok; } catch (e) {}
    if (!up) await sleep(200);
  }
  if (!up) { server.kill(); console.error('obscura serve did not come up'); process.exit(1); }
}

const version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
const ws = new WebSocket(version.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 0;
const send = (method, params = {}, sessionId) => new Promise((resolve) => {
  const id = ++nextId;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });

const created = await send('Target.createTarget', { url: 'about:blank' });
const targetId = created.result.targetId;
const sid = (await send('Target.attachToTarget', { targetId, flatten: true })).result.sessionId;
for (const d of ['Page', 'Runtime', 'DOM']) await send(`${d}.enable`, {}, sid);
await send('Emulation.setDeviceMetricsOverride',
  { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false }, sid);

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sid);
  if (r.result?.exceptionDetails) {
    throw new Error(r.result.exceptionDetails.exception?.description ?? 'evaluate threw');
  }
  return r.result?.result?.value;
};

const nav = await send('Page.navigate', { url: URL_ }, sid);
if (nav.error) { console.error('navigate failed:', JSON.stringify(nav.error)); process.exit(1); }
{
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline && await evaluate('document.readyState') !== 'complete') await sleep(150);
}

// Trigger lazy content, then return to the top. Without this a scroll-reveal system leaves every
// band below the fold at opacity 0 and `loading="lazy"` images never decode, so the capture reads
// as a page with one section.
await evaluate(`(async () => {
  const step = Math.max(200, Math.round(window.innerHeight * 0.9));
  const end = document.documentElement.scrollHeight;
  for (let y = 0; y < end; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 600));
})()`);
await sleep(SETTLE);

// Full page: clip the whole content box and let captureBeyondViewport paint past the fold.
const metrics = await send('Page.getLayoutMetrics', {}, sid);
const size = metrics.result?.contentSize ?? metrics.result?.cssContentSize;
const params = { format: 'png' };
if (size) {
  params.clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
  params.captureBeyondViewport = true;
}
const shot = await send('Page.captureScreenshot', params, sid);
if (shot.result?.data) writeFileSync(OUT_PNG, Buffer.from(shot.result.data, 'base64'));
else console.error('WARNING: screenshot returned no data');

// probe.js is an IIFE returning a JSON string.
const tokens = await evaluate(readFileSync(PROBE, 'utf8').trim().replace(/;\s*$/, ''));
writeFileSync(OUT_JSON, typeof tokens === 'string' ? tokens : JSON.stringify(tokens ?? null));

console.error(`captured ${URL_} → ${OUT_PNG} (${size ? `${Math.round(size.width)}×${Math.round(size.height)}` : 'viewport'}) + ${OUT_JSON}`);

await send('Target.closeTarget', { targetId });
ws.close();
server.kill();
process.exit(0);
