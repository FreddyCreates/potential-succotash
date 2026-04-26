import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: 'src/manifest.json',
      additionalInputs: ['src/content/index.ts'],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
  esbuild: {
    // Prevents esbuild from trying to assign to Function.prototype.name,
    // which is read-only in Chrome's strict-mode service worker context.
    keepNames: true,
  },
});
