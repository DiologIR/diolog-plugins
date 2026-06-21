/**
 * Standalone build of the single-page storyboard wall (the "one large webpage").
 * Reuses the SAME StyleX pipeline as Storybook: the React plugin runs `.babelrc.cjs` (the StyleX babel
 * transform) and Vite auto-loads `postcss.config.mjs` (the StyleX PostCSS extraction over your sources),
 * so the wall renders byte-identical to the Storybook stories — same tokens, same components.
 *
 *   npm run wall:build   → outputs storyboard-wall/  (serve storyboard-wall/index.html via a static server)
 *   npm run wall:serve   → vite preview of that build
 *
 * package.json scripts to add:
 *   "wall:build": "vite build -c vite.wall.config.ts",
 *   "wall:serve": "vite preview -c vite.wall.config.ts --outDir storyboard-wall --port 6010"
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react({ babel: { babelrc: true } })],
  build: {
    outDir: 'storyboard-wall',
    emptyOutDir: true,
    rollupOptions: { input: 'index.html' },
    chunkSizeWarningLimit: 4000,
  },
});
