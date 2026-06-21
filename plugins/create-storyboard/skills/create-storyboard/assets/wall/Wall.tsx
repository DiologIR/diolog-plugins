/**
 * The whole wall — every surface on one infinite pan/zoom canvas (Figma-style): drag or scroll to pan,
 * ⌘/ctrl-scroll or pinch to zoom toward the cursor, plus zoom in/out · Fit · 100%. The world is
 * transformed via a ref so the screens render ONCE and never re-render while you pan (fast at 50+ cells).
 * Used both as a Storybook story (Storyboard / The whole wall) and as the standalone page (wall-main).
 *
 * ── ADAPT TWO THINGS to your project (everything else is reusable verbatim): ──────────────────────────
 *   1. `layout()` — produce the CELLS: one per screen you want on the wall ({ app/group, id, label,
 *      status, col, row }). Drive it off your own catalogue / IA (here: the two apps' sections), grouped
 *      into labelled bands. Status drives the dot colour (shipped/partial/planned → tweak STATUS_HUE).
 *   2. `<AreaScreen .../>` inside each frame — render ONE happy-state screen for a cell. Swap this import
 *      for your project's "render the full themed window for an area" entry (the same one your flow
 *      stories use). It must accept a fixed `height` so every frame is the same size (CELL_H).
 * Replace `./lib/catalogue` (APPS/AppDef) and `./surfaces/registry` (AreaScreen) with your equivalents.
 */
import { useCallback, useEffect, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { APPS, AppDef } from './lib/catalogue';        // ← ADAPT: your catalogue / IA
import { AreaScreen } from './surfaces/registry';      // ← ADAPT: your "render a themed screen" entry

const CELL_W = 1440;   // a screen's logical width  (match your window/story width)
const CELL_H = 800;    // a screen's logical height
const GAP = 72;
const COLS = 6;

const s = stylex.create({
  root: { position: 'fixed', inset: 0, overflow: 'hidden', background: '#E3DFD8', cursor: 'grab', fontFamily: "'SF Pro Text',-apple-system,system-ui,sans-serif", touchAction: 'none' },
  world: { position: 'absolute', top: 0, left: 0, transformOrigin: '0 0', willChange: 'transform' },
  bandLabel: { position: 'absolute', fontWeight: 600, letterSpacing: '-0.02em', color: '#1A1C1E' },
  cell: { position: 'absolute', display: 'flex', flexDirection: 'column', gap: 12 },
  cap: { display: 'flex', alignItems: 'center', gap: 8 },
  capDot: { width: 9, height: 9, borderRadius: 999 },
  capTitle: { fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: '#1A1C1E' },
  capMeta: { fontSize: 12, color: '#7C828B', fontFamily: "'SF Mono',monospace", marginLeft: 'auto' },
  frame: { width: CELL_W, height: CELL_H, borderRadius: 14, overflow: 'hidden' },
  hud: { position: 'fixed', left: '50%', bottom: 22, transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 4, padding: 6, borderRadius: 999, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)', boxShadow: '0 12px 40px -12px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(0,0,0,0.08)' },
  btn: { minWidth: 34, height: 30, paddingInline: 11, border: 'none', borderRadius: 999, background: 'transparent', color: '#1A1C1E', fontSize: 13, fontWeight: 600, cursor: 'default', display: 'grid', placeItems: 'center' },
  sep: { width: 1, height: 18, background: 'rgba(0,0,0,0.12)', marginInline: 3 },
  title: { position: 'fixed', left: 22, top: 18, zIndex: 10 },
  hint: { position: 'fixed', right: 22, top: 22, zIndex: 10, fontSize: 12, color: '#7C828B', fontFamily: "'SF Mono',monospace" },
});

const STATUS_HUE: Record<string, string> = { shipped: '#2BA84A', partial: '#C8780C', planned: '#7C828B' };

type Cell = { app: 'studio' | 'motif'; areaId: string; label: string; status: string; col: number; row: number };

// ADAPT: build the cells + band headers from your own IA.
function layout(): { cells: Cell[]; bands: { label: string; row: number }[]; cols: number; height: number } {
  const cells: Cell[] = [];
  const bands: { label: string; row: number }[] = [];
  let row = 0;
  for (const appId of ['studio', 'motif'] as const) {
    const app: AppDef = APPS[appId];
    bands.push({ label: `${app.name} — ${app.tagline}`, row });
    row += 0.5; // band header occupies half a row of vertical space
    for (const sec of app.sections) {
      let col = 0;
      bands.push({ label: `${app.name} · ${sec.title}`, row });
      row += 0.42;
      for (const it of sec.items) {
        cells.push({ app: appId, areaId: it.id, label: it.label, status: it.status, col, row });
        col++;
        if (col >= COLS) { col = 0; row++; }
      }
      if (col !== 0) row++;
      row += 0.25; // gap between sections
    }
    row += 0.6; // gap between apps
  }
  return { cells, bands, cols: COLS, height: row };
}

export function StoryboardWall() {
  const rootRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const view = useRef({ scale: 0.2, x: 80, y: 120 });

  const apply = useCallback(() => {
    if (worldRef.current) worldRef.current.style.transform = `translate(${view.current.x}px, ${view.current.y}px) scale(${view.current.scale})`;
  }, []);

  const { cells, bands, height } = layout();
  const worldW = COLS * (CELL_W + GAP) + 200;
  const worldH = height * (CELL_H + GAP + 46) + 400;

  const fit = useCallback(() => {
    const el = rootRef.current; if (!el) return;
    const scale = Math.min((el.clientWidth - 80) / worldW, (el.clientHeight - 80) / worldH);
    view.current = { scale, x: 40, y: 40 };
    apply();
  }, [apply, worldW, worldH]);

  useEffect(() => { fit(); }, [fit]);

  const zoomTo = (factor: number, cx?: number, cy?: number) => {
    const el = rootRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (cx ?? rect.width / 2), py = (cy ?? rect.height / 2);
    const v = view.current;
    const ns = Math.min(2, Math.max(0.04, v.scale * factor));
    v.x = px - ((px - v.x) * ns) / v.scale;
    v.y = py - ((py - v.y) * ns) / v.scale;
    v.scale = ns; apply();
  };

  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    let dragging = false, lx = 0, ly = 0;
    const down = (e: PointerEvent) => { dragging = true; lx = e.clientX; ly = e.clientY; el.style.cursor = 'grabbing'; };
    const move = (e: PointerEvent) => { if (!dragging) return; view.current.x += e.clientX - lx; view.current.y += e.clientY - ly; lx = e.clientX; ly = e.clientY; apply(); };
    const up = () => { dragging = false; el.style.cursor = 'grab'; };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) zoomTo(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
      else { view.current.x -= e.deltaX; view.current.y -= e.deltaY; apply(); }
    };
    el.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); el.removeEventListener('wheel', wheel); };
  }, [apply]);

  const yOf = (row: number) => row * (CELL_H + GAP + 46);

  return (
    <div {...stylex.props(s.root)} ref={rootRef}>
      <div {...stylex.props(s.title)}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: '#1A1C1E' }}>The whole storyboard</div>
        <div style={{ fontSize: 12, color: '#7C828B', fontFamily: "'SF Mono',monospace", marginTop: 2 }}>{cells.length} surfaces</div>
      </div>
      <div {...stylex.props(s.hint)}>drag to pan · ⌘-scroll to zoom</div>

      <div {...stylex.props(s.world)} ref={worldRef}>
        {bands.map((b, i) => (
          <div key={i} {...stylex.props(s.bandLabel)} style={{ left: 8, top: yOf(b.row) - 6, fontSize: b.label.includes('—') ? 40 : 22, opacity: b.label.includes('—') ? 1 : 0.62 }}>{b.label}</div>
        ))}
        {cells.map((c) => (
          <div key={`${c.app}-${c.areaId}`} {...stylex.props(s.cell)} style={{ left: c.col * (CELL_W + GAP) + 8, top: yOf(c.row) + 30, width: CELL_W }}>
            <div {...stylex.props(s.cap)}>
              <span {...stylex.props(s.capDot)} style={{ background: STATUS_HUE[c.status] }} />
              <span {...stylex.props(s.capTitle)}>{c.label}</span>
              <span {...stylex.props(s.capMeta)}>{c.status}</span>
            </div>
            {/* ADAPT: render one happy-state screen, fixed-height, for this cell */}
            <div {...stylex.props(s.frame)}><AreaScreen app={c.app} areaId={c.areaId} state="happy" height={CELL_H} /></div>
          </div>
        ))}
      </div>

      <div {...stylex.props(s.hud)}>
        <button {...stylex.props(s.btn)} onClick={() => zoomTo(0.83)} title="Zoom out">−</button>
        <button {...stylex.props(s.btn)} onClick={() => zoomTo(1.2)} title="Zoom in">+</button>
        <span {...stylex.props(s.sep)} />
        <button {...stylex.props(s.btn)} onClick={fit}>Fit</button>
        <button {...stylex.props(s.btn)} onClick={() => { view.current = { scale: 1, x: 40, y: 40 }; apply(); }}>100%</button>
      </div>
    </div>
  );
}
