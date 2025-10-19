import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// 註冊 Service Worker（僅在生產環境）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker 註冊成功:', registration.scope)
        
        // 檢查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('發現新版本的 Service Worker')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用，提示使用者重新載入
              console.log('新版本已安裝，請重新整理頁面以使用')
              
              // 可選：自動更新
              if (confirm('發現新版本！是否要立即更新？')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        })
      })
      .catch((error) => {
        console.error('Service Worker 註冊失敗:', error)
      })
    
    // 監聽 Service Worker 控制器變更
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  })
}

// 開發環境提示
if (import.meta.env.DEV) {
  console.log('開發模式：Service Worker 未啟用')
  console.log('請使用 npm run build && npm run preview 來測試 PWA 功能')
}
