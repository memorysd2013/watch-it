import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// Safari 手機瀏覽器環境變數注入插件
function safariEnvPlugin() {
  return {
    name: 'safari-env-injection',
    transformIndexHtml(html) {
      // 在 HTML 中注入環境變數到 window 物件
      const envScript = `
        <script>
          // Safari 手機瀏覽器環境變數注入
          window.__ENV__ = {
            // VITE_ 前綴的環境變數
            VITE_VAPID_PUBLIC_KEY: '${process.env.VITE_VAPID_PUBLIC_KEY || ''}',
            VITE_VAPID_EMAIL: '${process.env.VITE_VAPID_EMAIL || ''}',
            VITE_APP_URL: '${process.env.VITE_APP_URL || ''}',
            VITE_APP_VERSION: '${process.env.npm_package_version || '1.1.0'}',
            
            // 非 VITE_ 前綴的環境變數（Safari 備援方案）
            VAPID_PUBLIC_KEY: '${process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || ''}',
            VAPID_EMAIL: '${process.env.VITE_VAPID_EMAIL || process.env.VAPID_EMAIL || ''}',
            APP_URL: '${process.env.VITE_APP_URL || process.env.APP_URL || ''}',
            APP_VERSION: '${process.env.npm_package_version || '1.1.0'}'
          };
          console.log('🔧 Safari 環境變數已注入:', window.__ENV__);
          console.log('🔍 VAPID 公鑰檢查:', {
            'VITE_VAPID_PUBLIC_KEY': window.__ENV__.VITE_VAPID_PUBLIC_KEY,
            'VAPID_PUBLIC_KEY': window.__ENV__.VAPID_PUBLIC_KEY,
            '兩者是否相同': window.__ENV__.VITE_VAPID_PUBLIC_KEY === window.__ENV__.VAPID_PUBLIC_KEY
          });
        </script>
      `
      return html.replace('<head>', `<head>${envScript}`)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    safariEnvPlugin(), // Safari 手機瀏覽器環境變數注入
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Watch It - 價格追蹤工具',
        short_name: 'Watch It',
        description: '追蹤股票、加密貨幣和商品價格的即時監控工具',
        theme_color: '#4CAF50',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false, // 開發環境不啟用 PWA
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/twse': {
        target: 'https://mis.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/twse/, '/stock/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 移除可能導致問題的 headers
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  }
})
