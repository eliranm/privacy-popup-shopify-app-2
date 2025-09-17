import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [],
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      './globalThis.css.js': '@shopify/polaris/build/esm/styles.css',
    },
  },
  optimizeDeps: {
    include: ['@shopify/polaris'],
  },
});
