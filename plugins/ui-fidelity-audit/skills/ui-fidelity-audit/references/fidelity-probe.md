# Fidelity probe — one-pass capture

The audit's biggest time sink is **re-navigating to the same surface to check one more thing**. Each visit costs a login + load + state-setup, and Step 3 has ~8 render-time checks; doing them as separate visits multiplies that cost. This probe collapses all of them into **one `eval` per surface/state**: it runs inside the already-rendered page and returns a JSON snapshot carrying every render-time signal the audit needs. Capture once, then classify offline from the JSON (and the screenshot) — never re-open the page to re-check a single property.

What it is and isn't:
- It **augments** the screenshots — it does not replace rendering. The probe only runs because the page is rendered, so its output is *rendered evidence* (the live DOM), exactly what this skill demands — never source-read inference. Screenshots remain mandatory ledger evidence.
- It is a **detection** snapshot (enough signal to find, prove, and classify drift), **not** mockup-align's per-property alignment. Hand confirmed stylistic gaps to mockup-align; don't try to pixel-diff here.

## Usage

1. `Read` this file, copy the `probeFidelity` function, and inject it into the rendered page with whatever browser tool you're using, calling it once and returning `JSON.stringify(...)`. Save the result to a workspace file so the audit, the fix loop, and any sub-agents read from disk instead of re-navigating.
2. Pass the elements/regions/variants you care about as `{ elements: { label: cssSelector } }` — named matches are the highest-signal output. Variant sets (urgent vs normal row, each status colour, sizes) should be passed as one selector that matches all siblings, or one label per variant; the probe records each so you can compare them **against each other** (the `variantsIdentical` check) without another visit.
3. Run it identically on the **reference** and the **target** for each state. The reference never changes during an audit — capture it **once** and reuse that JSON for every later diff and every fix-loop iteration; only the target is re-captured after a fix.

Per-tool injection:
- **agent-browser** — wrap in an IIFE; the eval result comes back double-JSON-encoded, so decode twice: `(function(){ /* paste fn */ return JSON.stringify(probeFidelity({elements:{...}})); })()`
- **playwright-cli** — `page.evaluate(() => { /* paste fn */ return probeFidelity({elements:{...}}); })`
- **Chrome MCP** (`mcp__claude-in-chrome__javascript_tool` / `evaluate_script`) — paste the function, then `return JSON.stringify(probeFidelity({elements:{...}}))`.

Open every gated state (modal/drawer/popover/expanded) in the **same** session — drive each trigger, then probe that state before moving on — so all states are captured in one navigation rather than one navigation per modal.

## The probe

```js
// fidelity-probe — one-pass UI fidelity snapshot. Runs IN the rendered page.
// Returns JSON-serialisable detection signal for the whole surface in one call.
function probeFidelity(opts) {
  opts = opts || {};
  var rootSel = opts.root || 'body';
  var named = opts.elements || null;        // { label: cssSelector } — the things you care about
  var maxEls = opts.max || 400;
  var root = document.querySelector(rootSel) || document.body;
  var cls = function (el) { return (el.getAttribute && el.getAttribute('class')) || ''; };

  function sideBorder(cs, side) {
    var w = cs.getPropertyValue('border-' + side + '-width');
    if (parseFloat(w) === 0) return '0';    // a 0-width border still reports style+colour; ignore it
    return w + ' ' + cs.getPropertyValue('border-' + side + '-style') + ' ' + cs.getPropertyValue('border-' + side + '-color');
  }
  function styleOf(el) {
    var cs = getComputedStyle(el);
    return {
      display: cs.display, position: cs.position,
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage === 'none' ? '' : cs.backgroundImage,
      borderTop: sideBorder(cs, 'top'), borderRight: sideBorder(cs, 'right'),
      borderBottom: sideBorder(cs, 'bottom'), borderLeft: sideBorder(cs, 'left'),
      radius: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '),
      shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow,
      color: cs.color,
      font: cs.fontWeight + ' ' + cs.fontSize + '/' + cs.lineHeight + ' ' + (cs.fontFamily || '').split(',')[0],
      letterSpacing: cs.letterSpacing,
      pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
      gap: cs.rowGap + ' ' + cs.columnGap,
      opacity: cs.opacity, visibility: cs.visibility
    };
  }
  // visual fingerprint — equal fp on two sibling variants ⇒ a variant prop isn't wired
  function fingerprint(s) { return [s.bg, s.borderTop, s.borderLeft, s.radius, s.shadow, s.color, s.font].join(' | '); }
  function svgInfo(el) {
    var svg = el.querySelector('svg');
    if (!svg) return { hasSvg: false, paths: 0 };
    return { hasSvg: true, paths: svg.querySelectorAll('path,line,circle,rect,polygon,polyline').length };
  }
  function rec(el, label) {
    var r = el.getBoundingClientRect();
    var s = styleOf(el);
    var txt = (el.textContent || '').trim();
    var svg = svgInfo(el);
    var isEditor = !!(el.matches && el.matches('textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,.cm-editor,.tiptap,.ql-editor'))
                 || !!el.querySelector('[contenteditable="true"],.ProseMirror,.cm-editor,.ql-editor');
    return {
      label: label, tag: el.tagName.toLowerCase(), role: (el.getAttribute && el.getAttribute('role')) || '',
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      textLen: txt.length, text: txt.slice(0, 80), childCount: el.childElementCount,
      svg: svg, editor: isEditor, style: s, fp: fingerprint(s),
      // thin/empty: exists but paints essentially nothing (content didn't reach the DOM)
      empty: (r.height < 2 || r.width < 2) || (txt.length === 0 && el.childElementCount === 0 && !svg.hasSvg)
    };
  }

  var out = {
    meta: { url: location.href, title: document.title,
            viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio }, capturedRoot: rootSel },
    named: {}, controls: [], editors: [], regions: []
  };

  // (1) explicitly named elements / regions / variant sets — highest-signal; pass these in
  if (named) Object.keys(named).forEach(function (label) {
    var nodes = root.querySelectorAll(named[label]);
    if (!nodes.length) { out.named[label] = { label: label, missing: true, selector: named[label] }; return; }
    out.named[label] = nodes.length === 1
      ? rec(nodes[0], label)
      : Array.prototype.slice.call(nodes, 0, 24).map(function (n, i) { return rec(n, label + '[' + i + ']'); });
  });

  // (2) every interactive control — presence + placement in one capture (control-placement / extras / broken-icon checks)
  var ctlSel = 'button,a[href],[role="button"],[role="tab"],[role="menuitem"],input,select,textarea,[contenteditable="true"]';
  Array.prototype.slice.call(root.querySelectorAll(ctlSel), 0, maxEls).forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    var svg = svgInfo(el), txt = (el.textContent || '').trim();
    out.controls.push({
      tag: el.tagName.toLowerCase(), role: (el.getAttribute('role') || ''), type: (el.getAttribute('type') || ''),
      text: txt.slice(0, 60), textLen: txt.length,
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      iconOnly: txt.length === 0 && svg.hasSvg, brokenIcon: svg.hasSvg && svg.paths === 0, childCount: el.childElementCount
    });
  });

  // (3) rich editors / contenteditable (editor-rendered-as-static-text check)
  Array.prototype.slice.call(root.querySelectorAll('textarea,[contenteditable="true"],[role="textbox"],.ProseMirror,.cm-editor,.tiptap,.ql-editor'), 0, 40)
    .forEach(function (el) { var r = el.getBoundingClientRect();
      out.editors.push({ tag: el.tagName.toLowerCase(), cls: ('' + cls(el)).slice(0, 80), box: { w: Math.round(r.width), h: Math.round(r.height) } }); });

  // (4) significant region containers (region-wrapper / separator check): sizeable elements carrying bg/border/shadow
  var seen = 0;
  Array.prototype.slice.call(root.querySelectorAll('*')).some(function (el) {
    if (seen >= maxEls) return true;
    var r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 40) return false;
    var cs = getComputedStyle(el);
    var hasBg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    var hasBorder = ['top', 'right', 'bottom', 'left'].some(function (sd) { return parseFloat(cs.getPropertyValue('border-' + sd + '-width')) > 0; });
    var hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
    if (!(hasBg || hasBorder || hasShadow)) return false;
    seen++;
    var label = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
      (cls(el) ? '.' + ('' + cls(el)).trim().split(/\s+/).slice(0, 2).join('.') : '');
    out.regions.push(rec(el, label));
    return false;
  });

  return out;
}
```

## Reading the snapshot offline (each Step 3 check → a field, no re-visit)

Diff the reference JSON against the target JSON — every Step 3 signal is already in hand:

- **Region containers / separators** — compare `regions[].style` (`bg`, `border*`, `radius`, `shadow`): a reference region with a background/border/shadow whose target counterpart reads bare is a missing wrapper/divider.
- **Control placement & presence / extras** — diff the `controls` list by `text`+`role`: in reference but not target ⇒ missing affordance; in target but not reference ⇒ an added extra; compare `box` to catch a control in the wrong place (kebab top-right vs inline).
- **Editors & rich affordances** — reference `editors` non-empty but target `editors` empty (or the same region's `editor:false`) ⇒ a rich editor rendered as static text.
- **Data-driven emptiness / thin renders** — `empty:true`, `textLen:0` where the reference has text, or `box.h` near zero ⇒ content didn't reach the DOM.
- **Broken icons** — `controls[].brokenIcon` / a `named` record with `svg.hasSvg && svg.paths===0` ⇒ an icon that renders a blank square.
- **Un-wired variants** — among a `named` variant array, if two siblings share the same `fp`, the variant prop is dead.
- **Missing named element** — `named[label].missing === true`.

A row in the ledger still needs its screenshot pair; the probe gives you the exact, measured *why* behind each row in one pass.
