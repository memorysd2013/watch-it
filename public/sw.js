// Service Worker for Push Notifications
const CACHE_NAME = 'watch-it-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue'
]

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('快取已開啟')
        return cache.addAll(urlsToCache)
      })
  )
})

// 啟動 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker 啟動中...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果快取中有回應，則返回快取版本
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// 處理推播訊息
self.addEventListener('push', (event) => {
  console.log('收到推播訊息:', event)
  
  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'Watch It',
        body: event.data.text() || '您有新的價格更新'
      }
    }
  }

  const options = {
    body: data.body || '您有新的價格更新',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: '查看詳情'
      },
      {
        action: 'dismiss',
        title: '忽略'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Watch It', options)
  )
})

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  console.log('通知被點擊:', event)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  // 開啟應用程式
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 如果已經有視窗開啟，則聚焦到該視窗
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      
      // 如果沒有視窗開啟，則開啟新視窗
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// 處理推播訂閱
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('推播訂閱已變更:', event)
  
  event.waitUntil(
    // 重新訂閱推播
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription.options.applicationServerKey
    }).then((subscription) => {
      // 將新的訂閱資訊發送到伺服器
      return fetch('/api/notifications/resubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldSubscription: event.oldSubscription,
          newSubscription: subscription
        })
      })
    })
  )
})

// 處理背景同步
self.addEventListener('sync', (event) => {
  console.log('背景同步:', event.tag)
  
  if (event.tag === 'price-update') {
    event.waitUntil(
      // 執行價格更新同步
      updatePrices()
    )
  }
})

// 價格更新同步函數
async function updatePrices() {
  try {
    // 這裡可以實作背景價格更新邏輯
    console.log('執行背景價格更新')
    
    // 發送通知給所有客戶端
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'PRICE_UPDATE',
        timestamp: Date.now()
      })
    })
  } catch (error) {
    console.error('背景價格更新失敗:', error)
  }
}

// 處理訊息
self.addEventListener('message', (event) => {
  console.log('收到訊息:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
