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
    rollupOptions: {
      output: {
        // Chrome extensions cannot load files whose names start with "_".
        // Rollup's CommonJS interop generates "_commonjsHelpers.js"; this
        // renames any chunk whose name starts with underscores so the extension
        // loads without error.
        sanitizeFileName: (name) => name.replace(/^_+/, ''),
      },
    },
  },
  esbuild: {
    keepNames: true,
  },
});
