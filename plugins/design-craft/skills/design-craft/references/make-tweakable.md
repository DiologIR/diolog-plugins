# Make Tweakable: Add In-Design Tweak Controls

Add a floating control panel to a finished design that lets the user adjust selected aspects live — colors, fonts, spacing, copy, layout variants, feature flags. Use this when the user wants to "play with options," "see different versions," or compare visual choices side by side.

**One file, many variants.** Tweaks let a single design hold multiple visual exploration paths without scattering `v1.html / v2.html / v3.html` across the project.

## Phase 1: Identify what should be tweakable

Confirm with the user — or propose and check — which aspects to expose. Common candidates:

- **Color** — primary brand color, accent, background tone
- **Typography** — font family, base size, scale ratio
- **Density** — spacing scale (tight / normal / loose)
- **Layout variant** — centered vs left-aligned, single-column vs multi-column
- **Component variants** — button style (filled / ghost / outlined), card treatment
- **Copy** — headline, subhead, CTA text
- **Feature flags** — show/hide testimonials section, show/hide footer signup, etc.

Resist exposing every possible knob. **Keep the tweak surface small** — 3–8 controls is a healthy range. The point is a few meaningful axes to explore, not to recreate Figma. If the user didn't ask for tweaks but the design has obvious axes of variation, add 1–2 by default to surface interesting possibilities.

**Lead with expressive, multi-variable knobs — the kind a design tool couldn't give.** One control that moves several tokens at once is worth more than five pixel-pushers: a *minimalism slider* (strips ornament, collapses the palette, opens up whitespace), a *time-of-day slider* (morphs the palette dawn → dusk → night), a *brutalism toggle*, an *era slider* (1998 → flat → glass). These are the reason to tweak in code rather than in Figma. A border-radius or spacing slider is fine as the third control, never the first. Every knob must still be implementable as keys in the defaults object plus a control — skip anything that needs new assets or network calls. Knobs always tweak the **user's design content**, never the panel, frame, or scaffolding around it.

## Phase 2: Design the tweak panel

The panel lives **inside the page**, as a floating element — typically bottom-right, semi-transparent, with a subtle border and a small toggle button. Title it **"Tweaks."** Each control should be the right type for its value:

- **Color** → color picker (`<input type="color">`)
- **Font / family / variant** → dropdown or button group
- **Number (font size, spacing)** → slider (`<input type="range">`) with sensible min/max
- **Boolean (show/hide section)** → toggle (`<input type="checkbox">`)
- **Copy** → text input or textarea

Keep controls compact — a tight stacked column beats a sprawling panel.

## Phase 3: Wire up live updates via CSS custom properties

Drive visual tokens with CSS custom properties — changing one updates everything that references it:

```css
:root {
  --tweak-primary: #0066CC;
  --tweak-font: "Söhne", system-ui, sans-serif;
  --tweak-density: 16px;
}
.cta { background: var(--tweak-primary); }
body  { font-family: var(--tweak-font); }
.section { padding: var(--tweak-density); }
```

```js
input.addEventListener('input', () =>
  document.documentElement.style.setProperty('--tweak-primary', input.value));
```

For non-CSS values (copy, layout variants, feature flags), use JS state with re-render or direct DOM manipulation (`el.textContent = …`, `el.hidden = !on`).

## Phase 4: Self-contained toggle + persistence (no host required)

This skill is self-contained. The panel owns its own show/hide and persists tweak values to `localStorage` so they survive a reload.

```html
<button id="tweak-toggle" aria-expanded="false" aria-controls="tweak-panel"
  style="position:fixed; bottom:16px; right:16px; z-index:9999;">Tweaks</button>

<aside id="tweak-panel" hidden aria-label="Tweaks"
  style="position:fixed; bottom:60px; right:16px; z-index:9999; width:260px;
         padding:16px; border:1px solid rgba(0,0,0,.12); border-radius:12px;
         background:rgba(255,255,255,.92); backdrop-filter:blur(8px);
         box-shadow:0 8px 24px rgba(0,0,0,.12); font:14px/1.4 system-ui;">
  <!-- controls go here -->
</aside>

<script>
  const KEY = 'design.tweaks';
  const panel = document.getElementById('tweak-panel');
  const toggle = document.getElementById('tweak-toggle');
  const root = document.documentElement;

  // The single source of truth for tweakable defaults:
  const DEFAULTS = { primaryColor: '#0066CC', fontSize: 16, dark: false };

  function apply(state) {
    root.style.setProperty('--tweak-primary', state.primaryColor);
    root.style.setProperty('--tweak-density', state.fontSize + 'px');
    document.body.classList.toggle('dark', state.dark);
  }
  function save(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
  function load() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return { ...DEFAULTS }; }
  }

  const state = load();
  apply(state);
  // …wire each control's `input` event to mutate `state`, then apply(state) + save(state)…

  toggle.addEventListener('click', () => {
    const open = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
  });
</script>
```

Keep **one** `DEFAULTS` object as the canonical default state. Reset-to-defaults is just `localStorage.removeItem(KEY)` + `apply(DEFAULTS)`.

## Phase 5: Hide the controls when off

The design should look final when Tweaks is toggled off. The panel must be **entirely hidden** — not dimmed, not collapsed to a corner. The user should see a polished artifact with no visible tweak chrome. This is non-negotiable: any tweak-panel chrome left visible when tweaks are off makes the design look unfinished. (The toggle button itself can stay as a small unobtrusive affordance, or be hidden behind a keyboard shortcut if the user wants a perfectly clean view.)

## Phase 6: Verify

In a browser: toggle the panel on and off — it shows/hides cleanly; change each tweak — it updates live; reload the page — the tweaked values persist; check the design with the panel off — it looks like a finished design, no tweak chrome visible.

## Phase 7: Summarize

Report: tweaks exposed and their value types; defaults; any tweaks you considered but excluded (and why); whether the tweak set covers the user's intended exploration axes.
