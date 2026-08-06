import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Local: /ops/ · GitHub project Pages: /goldenbayholidayhomes/ops/
const rawBase = process.env.VITE_BASE_PATH || '/ops/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [],
      },
      manifest: {
        name: 'GBHH Ops',
        short_name: 'GBHH Ops',
        description: 'Golden Bay Holiday Homes staff & property operations',
        theme_color: '#1a5f6e',
        background_color: '#f3efe6',
        display: 'standalone',
        start_url: base,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('fullcalendar')) return 'calendar';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
