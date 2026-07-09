# The motion layer: alive on screen, absent in print

A Diolog guide's product mocks should move the way the product moves. The document itself must not.
DESIGN-Website.md §8 says it in four words: **the product moves, the page settles.**

And the export must be untouched by any of it.

## The contract, and it is the whole file

> **The resting style is the final style. The "from" state lives only inside `@keyframes`.**

```css
/* right: at rest the row is visible. The animation only describes where it came from. */
.row { opacity: 1; transform: none }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } }
.slice.seen .row { animation: fadeUp var(--dur-reveal) var(--ease-out) both }

/* wrong: at rest the row is invisible. Kill the animation and the row is GONE. */
.row { opacity: 0 }
@keyframes fadeUp { to { opacity: 1 } }
```

Get it right and `animation: none` yields the settled design. Print safety, reduced-motion safety, and
a JS-disabled fallback all come free, **by construction**, not by override. You can then write the
neutraliser as one honest rule:

```css
@media print, (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important }
}
```

Get it backwards and that same rule exports blank rows. This is why `design-craft`'s `make-a-doc.md`
warns against `animation:none` for print and reaches for a negative-delay trick
(`animation-delay:-99s; animation-duration:.001s; animation-fill-mode:both`) to skip to the last
frame. That trick is the **fallback for animations you did not author** - a third-party widget, an
inherited stylesheet. When you own the CSS, invert the states instead. It is one refactor, and it
removes an entire failure mode rather than papering over it.

## The governor

All state in CSS; JavaScript only adds and removes classes. Two classes, two lifetimes:

- **`.seen`** - the entrance. Added once, when the component first scrolls into view. Never removed,
  so scrolling back does not replay it. Replaying an entrance on every scroll is the single most
  irritating thing a document can do.
- **`.live`** - the ambient loop (a pulsing status dot, a lit row). Added on enter, **removed on
  exit**, so nothing animates off-screen, and removed on tab blur, so a backgrounded tab is not
  burning a core.

```html
<script>
(function () {
  "use strict";
  if (!("IntersectionObserver" in window)) return;                       // no polyfill: rest = final
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var slices = document.querySelectorAll(".slice");
  if (!slices.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("seen"); e.target.classList.add("live"); }
      else { e.target.classList.remove("live"); }
    });
  }, { threshold: 0.28 });
  Array.prototype.forEach.call(slices, function (s) { io.observe(s); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) return;
    Array.prototype.forEach.call(document.querySelectorAll(".slice.live"), function (s) {
      s.classList.remove("live");
    });
  });
})();
</script>
```

Every early return leaves the document in its resting state, which is its final state. There is no
degraded path, because there is nothing to degrade to.

## The vocabulary

Keep it small. A guide is not a showreel; one orchestrated reveal per mock beats twenty flourishes.

| Keyframe | For | Notes |
|---|---|---|
| `fadeUp` | rows, cards, list items | stagger with `nth-child` and `--stagger` |
| `barFill` | a proportion bar | `transform-origin: left`, `scaleX(0)` in `from` |
| `drawPath` | SVG connectors | `pathLength="1"` + `stroke-dasharray:1`; `from { stroke-dashoffset: 1 }` |
| `washIn` | a highlight `<mark>` | `from { background-color: transparent }` |
| `settleOk` | a status row resolving | `from { background: var(--soft); color: var(--muted) }` |
| `flipOut` | a transient overlay label | `0%,55% { opacity: 1 } 100% { opacity: 0 }` |
| `ringPulse` | an ambient status dot | `.live` only, infinite, slow (6s) |

`pathLength="1"` is worth knowing: it normalises any path's length to 1, so a single
`stroke-dasharray: 1; stroke-dashoffset: 1` draws any path regardless of its real geometry.

## Transient overlays: set an explicit z-index

A "Checking..." overlay on a status chip:

```css
.flip { position: relative }
.flip::after {
  content: "Checking\2026";
  position: absolute; inset: 0; display: grid; place-items: center;
  border-radius: 999px; background: var(--soft); color: var(--muted);
  opacity: 0;                    /* resting = final: the overlay is GONE at rest */
  z-index: 1;                    /* NOT optional */
  animation: flipOut 2200ms var(--ease-out) both;
}
```

Without `z-index: 1` this overlay painted **underneath** the chip's own inline text, and a real
capture rendered `CONSISTEN` + `CHECKING...` + `RRENT DRAFT` on top of each other for about a second.
Every static rule in the harness passed, because at rest the overlay is `opacity:0` and at the end it
is gone. **The bug existed only in a mid-flight frame.**

`guide-qa.mjs` now flags full-cover absolute overlays with `z-index:auto` over inline text
(`overlay-paint-order`, MED), because relying on default paint order is one refactor from breaking.
But the rule is a guardrail, not a substitute: **film the animation and look at the frames.**

## Verifying it

```bash
node scripts/motion-check.mjs guide.html --out frames/ --slice 1 --frames 8 --interval 220
```

Three passes:

1. **`media: print`, at rest.** Lists everything invisible - each entry is content that will be
   missing from the PDF. Checks opacity, `visibility`, near-zero transform scales, and SVG strokes
   left fully dashed out.
2. **`prefers-reduced-motion: reduce`, at rest.** Same, for the audience that asked not to see motion.
3. **Mid-flight frames.** The entrance is restarted deterministically rather than waiting on the
   observer:

   ```js
   el.classList.remove("seen");
   void el.offsetWidth;              // force reflow: this is what restarts the animations
   el.classList.add("seen");
   ```

Then `export-pdf.mjs` greps the produced PDF's extracted text for the overlay labels in
`qa.config.json → motion.overlayText`. If "Checking" appears in the ink, the contract broke somewhere.

**Open the frames.** No rule in this harness, present or future, can see what only exists at t=200ms.

## Budget

Motion is spent, not sprinkled. Per `design-craft/references/motion-design.md`: one orchestrated
moment per mock, entrances only on first sight, ambient loops slow and few, nothing at all on the
document's own typography. The reader is reading. The mock is demonstrating. Only the mock moves.
