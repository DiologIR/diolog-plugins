#!/usr/bin/env node
/**
 * build.mjs — block-composing static-site assembler for diolog-site-builder.
 *
 * Given a SITE SPEC (JSON: mode, brand, theme, pages[] where each page is an
 * ordered list of blocks), it composes each page from:
 *   base.css (structure)  +  theme (the DESIGN.md token overrides)  +
 *   a header/footer variant  +  the page's blocks  +  overlays + app.js
 * and writes self-contained out/<slug>.html. The base + chrome are stamped
 * BYTE-IDENTICALLY into every page (css-drift-safe by construction).
 *
 * Tokens inside blocks/partials:
 *   {{COMPANY}} {{MONO}} {{TICKER}} {{EXCHANGE}} {{YEAR}} {{COMPANY_SITE_URL}}
 *   {{COMPANY_ID}} {{PHONE_HREF}} {{PHONE_LABEL}} {{EMAIL}}
 *       → brand values (uppercase keys resolve from spec.brand)
 *   {{slot}} or {{slot|default text}}
 *       → per-block content (lowercase keys resolve from a block's `content`
 *         map; the `|default` renders the plain-template copy when unfilled)
 *
 * Usage:
 *   node build.mjs <site-spec.json> [--out <dir>] [--templates <dir>]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const specPath = resolve(argv.find((a) => !a.startsWith("--")) ?? "site-spec.json");
const TPL = resolve(flag("--templates", HERE));
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const OUT = resolve(flag("--out", join(dirname(specPath), "out")));

const brand = {
  COMPANY: "Northwind", MONO: "N", TICKER: "NWD", EXCHANGE: "[Exchange]",
  YEAR: "20XX", COMPANY_SITE_URL: "index.html", COMPANY_ID: "",
  PHONE_HREF: "tel:", PHONE_LABEL: "Call the company", EMAIL: "investors@example.com",
  ...(spec.brand || {}),
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const navigation = Array.isArray(spec.navigation) && spec.navigation.length
  ? spec.navigation
  : (spec.pages || []).map((page) => ({
      slug: page.slug,
      label: page.navLabel || page.title || page.slug,
      nav: page.nav || page.slug,
    }));
const navItems = navigation.map((item) => {
  if (!item || !/^[a-z0-9-]{1,60}$/.test(String(item.slug || ""))) {
    throw new Error("each navigation item needs a safe local page slug");
  }
  return {
    href: `${item.slug}.html`,
    label: escapeHtml(item.label || item.slug),
    nav: escapeHtml(item.nav || item.slug),
  };
});
brand.NAV_LINKS = navItems.map((item) =>
  `<a href="${item.href}" data-nav="${item.nav}">${item.label}</a>`).join("\n      ");
brand.MOBILE_NAV_LINKS = navItems.map((item) =>
  `<a href="${item.href}">${item.label}</a>`).join("\n  ");
brand.FOOTER_LINKS = navItems.map((item) =>
  `<li><a href="${item.href}">${item.label}</a></li>`).join("\n          ");

const read = (p) => readFileSync(isAbsolute(p) ? p : join(TPL, p), "utf8");
const baseCss = read("base.css");
const appJs = read("app.js");
const overlayVariant = spec.overlays || "overlays";
const overlays = fillBrand(read(`partials/${overlayVariant}.html`));
// theme layer — the DESIGN.md hook. spec.theme = inline CSS; spec.themeFile = a path resolved
// against (in order) an absolute path, the templates dir, then the spec's own dir — so a themed
// spec can carry its brand.css beside it.
function readThemeFile(p) {
  for (const cand of [isAbsolute(p) ? p : null, join(TPL, p), join(dirname(specPath), p)]) {
    if (cand && existsSync(cand)) return readFileSync(cand, "utf8");
  }
  throw new Error(`themeFile not found: ${p}`);
}
const theme = spec.theme != null ? String(spec.theme)
  : spec.themeFile ? readThemeFile(spec.themeFile)
  : existsSync(join(TPL, "theme.default.css")) ? read("theme.default.css") : "";

// Theme contrast floor — enforced HERE, at the stage that decides the shipped ink.
// A generated theme overrides --ink-*/--surface-* wholesale, so base.css cannot
// guarantee the pair it ends up painting. A muted ink one step under AA is exactly
// the defect that ships: `--ink-3:#74757c` on `--surface-2:#f7f7f8` measures 4.28:1
// against the 4.5:1 small-text requirement, and it fails on EVERY eyebrow, meta
// label and caption at once.
// Only the light `:root` set. base.css redefines --surface-*/--ink-* inside a
// dark-mode @media block; flattening both mixes light ink with dark surfaces and
// reports pairs that never paint together.
function stripMediaBlocks(css) {
  let out = "";
  for (let i = 0; i < css.length; ) {
    const at = css.indexOf("@media", i);
    if (at === -1) { out += css.slice(i); break; }
    out += css.slice(i, at);
    let depth = 0;
    let j = css.indexOf("{", at);
    if (j === -1) break;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") { depth--; if (depth === 0) { j++; break; } }
    }
    i = j;
  }
  return out;
}
function parseTokens(css) {
  const out = {};
  // Strip comments first: theme.default.css documents example palettes inside
  // `/* … */`, and a light `--ink` example beside a dark `--surface-0` example
  // is not a pair that ever paints.
  const src = stripMediaBlocks(css.replace(/\/\*[\s\S]*?\*\//g, ""));
  for (const m of src.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    out[m[1]] = m[2];
  }
  return out;
}
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la == null || lb == null) return null;
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
function assertThemeContrast(themeCss) {
  const base = parseTokens(read("base.css"));
  const over = parseTokens(themeCss);
  const tok = { ...base, ...over };
  const inks = ["ink", "ink-2", "ink-3"];
  const surfaces = ["surface-0", "surface-1", "surface-2"];
  const failures = [];
  for (const ink of inks) {
    for (const surface of surfaces) {
      if (!tok[ink] || !tok[surface]) continue;
      const ratio = contrastRatio(tok[ink], tok[surface]);
      if (ratio == null) continue;
      if (ratio < 4.5) {
        failures.push(
          `--${ink} ${tok[ink]} on --${surface} ${tok[surface]} = ${ratio.toFixed(2)}:1 (needs 4.5:1)`
        );
      }
    }
  }
  if (failures.length) {
    throw new Error(
      `theme contrast floor: ${failures.length} token pair(s) below WCAG AA for small text —\n  ` +
        failures.join("\n  ") +
        `\nDarken the muted ink or lighten the surface; every eyebrow, meta label and caption uses this pair.`
    );
  }
}
assertThemeContrast(theme);

function fillBrand(s) {
  return s.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (m, k) => (k in brand ? brand[k] : m));
}
// Fill a block: resolve brand tokens FIRST (so {{COMPANY}}/{{TICKER}} nested inside a
// {{slot|default}} default is already flat text before the slot regex runs), then fill
// {{slot}} / {{slot|default}} from the content map.
//
// A value-UI block (data-diolog-value + a <template>) carries {{field}} tokens the
// PORTAL RENDER fills PER RESOLVED ITEM — they are NOT build-time content slots and
// must survive assembly verbatim. Mask every <template>…</template> out before brand
// + slot substitution, then restore it. Without this the slot regex eats a card's
// {{title}}/{{summary}}/{{category}}/{{url}} at build, which is why value lists
// previously had to be hand-authored and post-injected instead of shipped as blocks.
function fillContent(s, content = {}) {
  // Drop the block's leading authoring doc-comment before masking: gen-manifest reads
  // it from the source file, the built page never needs it, and its prose can mention
  // <template> / {{…}} — which would otherwise fool the template mask + slot fill below.
  s = s.replace(/^\s*<!--\s*BLOCK\b[\s\S]*?-->\s*/i, "");
  const guarded = [];
  s = s.replace(/<template[\s\S]*?<\/template>/gi, (m) => {
    guarded.push(m);
    return `<!--dgtpl:${guarded.length - 1}-->`;
  });
  s = fillBrand(s);
  s = s.replace(/\{\{\s*([a-z][a-z0-9_]*)\s*(?:\|([^}]*))?\}\}/g, (_, k, def) =>
    content[k] != null ? String(content[k]) : (def != null ? def : ""));
  return s.replace(/<!--dgtpl:(\d+)-->/g, (_, i) => guarded[Number(i)]);
}

function declaredContentSlots(s) {
  // Value-UI item fields inside <template> are resolved later by the portal
  // renderer, not by this assembler. Only placeholders in the authored block
  // body are legal keys in a block's `content` map.
  const authoredBody = s
    .replace(/^\s*<!--\s*BLOCK\b[\s\S]*?-->\s*/i, "")
    .replace(/<template[\s\S]*?<\/template>/gi, "");
  return new Set(
    [...authoredBody.matchAll(/\{\{\s*([a-z][a-z0-9_]*)\s*(?:\|[^}]*)?\}\}/g)]
      .map((match) => match[1])
  );
}

function assertKnownContentSlots(ref, source, content) {
  const supplied = Object.keys(content || {});
  if (!supplied.length) return;
  const declared = declaredContentSlots(source);
  const unknown = supplied.filter((key) => !declared.has(key));
  if (!unknown.length) return;
  const available = [...declared].sort();
  throw new Error(
    `block ${ref} received unknown content slot${unknown.length === 1 ? "" : "s"}: ` +
    `${unknown.sort().join(", ")}. Valid slots: ${available.join(", ") || "(none)"}`
  );
}

const partialCache = new Map();
function partial(name) {
  if (!partialCache.has(name)) partialCache.set(name, read(`partials/${name}.html`));
  return partialCache.get(name);
}
function headerFor(variant, navKey) {
  let h = fillBrand(partial(`header.${variant}`));
  if (navKey) h = h.replace(`data-nav="${navKey}"`, `data-nav="${navKey}" aria-current="page"`);
  return h;
}
function blockHtml(ref, content) {
  const path = ref.endsWith(".html") ? ref : `blocks/${ref}.html`;
  const source = read(path);
  assertKnownContentSlots(ref, source, content);
  return fillContent(source, content);
}

const FAVICON = `<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='7'%20fill='%232b2a24'/%3E%3C/svg%3E">`;

function renderPage(page) {
  const headerVariant = page.header || spec.header || (spec.mode === "investor-centre" ? "investor" : "full");
  const footerVariant = page.footer || spec.footer || (spec.mode === "investor-centre" ? "investor" : "full");
  const main = (page.blocks || []).map((b) =>
    typeof b === "string" ? blockHtml(b, {}) : blockHtml(b.block, b.content || {})).join("\n");
  const ticker = page.ticker ? fillBrand(partial("ticker")) + "\n" : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${(page.title || "Page")} · ${brand.COMPANY}</title>
<meta name="description" content="${(page.desc || "").replace(/"/g, "&quot;")}">
<meta name="robots" content="noindex">
${FAVICON}
<style>
${baseCss}
</style>
<style data-theme-overrides>
${theme}
</style>
</head>
<body>
${headerFor(headerVariant, page.nav)}
<main id="main">
${main}
</main>
${ticker}${fillBrand(partial(`footer.${footerVariant}`))}
${overlays}
<script>
${appJs}
</script>
</body>
</html>
`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const built = [];
for (const page of spec.pages || []) {
  try { writeFileSync(join(OUT, `${page.slug}.html`), renderPage(page)); built.push(page.slug); }
  catch (e) { console.error(`✗ ${page.slug}: ${e.message}`); process.exitCode = 1; }
}
console.log(`✓ built ${built.length} page(s) → ${OUT}\n  ${built.join(", ")}`);
export { renderPage, spec };
