#!/usr/bin/env node
/**
 * gen-manifest.mjs — regenerate manifest.json from the block library + partials +
 * presets. The manifest is the catalogue the skill/agent reads to know what blocks
 * exist, their content slots, and which Diolog widgets each block carries. Derived
 * data — never hand-edit manifest.json; run this. Run: `node gen-manifest.mjs`.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const BLOCKS = join(HERE, "blocks");
const PRESETS = join(HERE, "presets");
const PARTIALS = join(HERE, "partials");

function analyseBlock(cat, file) {
  const id = `${cat}/${basename(file, ".html")}`;
  const html = readFileSync(join(BLOCKS, cat, file), "utf8");
  // leading "<!-- BLOCK id — desc. slots: … -->"
  const desc = (/^<!--\s*BLOCK\s+\S+\s*[—-]\s*([\s\S]*?)-->/.exec(html)?.[1] || "").replace(/\s+/g, " ").trim();
  // content slots {{slot}} / {{slot|default}} (lowercase names) — unique, in order
  const slots = [...new Set([...html.matchAll(/\{\{\s*([a-z][a-z0-9_]*)\s*(?:\|[^}]*)?\}\}/g)].map((m) => m[1]))];
  // widgets placed + their config comment (if any directly precedes the marker)
  const widgets = [];
  for (const m of html.matchAll(/data-diolog-widget="([^"]+)"(?:[^>]*data-widget-variant="([^"]+)")?/g)) {
    widgets.push({ kind: m[1], variant: m[2] || null });
  }
  const configs = [...html.matchAll(/<!--\s*diolog-widget:\s*(\{[\s\S]*?\})\s*-->/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);
  return { id, desc, slots, widgets, widgetConfigs: configs };
}

const catalogue = {};
const widgetIndex = {};
for (const cat of readdirSync(BLOCKS).filter((d) => existsSync(join(BLOCKS, d)))) {
  const files = readdirSync(join(BLOCKS, cat)).filter((f) => f.endsWith(".html")).sort();
  catalogue[cat] = files.map((f) => {
    const b = analyseBlock(cat, f);
    for (const w of b.widgets) (widgetIndex[w.kind] ??= []).push(b.id);
    return b;
  });
}
for (const k of Object.keys(widgetIndex)) widgetIndex[k] = [...new Set(widgetIndex[k])].sort();

const partials = readdirSync(PARTIALS).filter((f) => f.endsWith(".html")).map((f) => basename(f, ".html")).sort();
const presets = readdirSync(PRESETS).filter((f) => f.endsWith(".json")).map((f) => {
  const spec = JSON.parse(readFileSync(join(PRESETS, f), "utf8"));
  return { name: basename(f, ".json"), mode: spec.mode, pages: (spec.pages || []).map((p) => p.slug) };
});

const manifest = {
  _generated: "by gen-manifest.mjs from the block library — do not hand-edit",
  widgetConfigCommentFormat: "<!-- diolog-widget: {\"kind\",\"variant\",\"config\":{…},\"styleOverrides\":{…},\"note\"} --> placed immediately before each <div data-diolog-widget> marker. Read by the final pass / portal editor to configure the widget instance in the DB (config beyond variant is not read from the marker at render time).",
  tokens: {
    brand: ["COMPANY", "MONO", "TICKER", "EXCHANGE", "YEAR", "COMPANY_SITE_URL"],
    slot: "{{name}} or {{name|default text}} — per-block content; the |default renders the plain-template copy when unfilled",
  },
  partials,
  presets,
  widgetIndex,
  blocks: catalogue,
};
writeFileSync(join(HERE, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const nBlocks = Object.values(catalogue).reduce((n, a) => n + a.length, 0);
console.log(`✓ manifest.json — ${nBlocks} blocks, ${Object.keys(widgetIndex).length} widget kinds, ${presets.length} presets, ${partials.length} partials`);
