import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages sub-paths and inside Capacitor.
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
