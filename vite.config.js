import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ─────────────────────────────────────────────────────────────────────────────
// vite.config.js
// Lost & Found PWA — Build configuration
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'favicon.ico'],
      manifest: {
        name: 'Lost & Found Portal',
        short_name: 'L&F',
        description: 'Report and claim lost items in your community',
        theme_color: '#1a1a2e',
        background_color: '#0f0f23',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Network-first for API calls; cache-first for static assets
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: { '@': '/src' },
  },

  server: {
    port: 5173,
    // Proxy API calls to Node.js companion server in development
    proxy: {
      '/node-api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/node-api/, ''),
      },
    },
  },
})
