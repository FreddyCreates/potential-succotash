import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: 'src/manifest.json',
      additionalInputs: ['src/content/index.ts', 'src/offscreen/offscreen.html'],
    }),
    viteStaticCopy({
      targets: [{ src: 'icons', dest: '.' }],
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
  },
  esbuild: {
    keepNames: true,
  },
});
