// 推播通知服務
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    this.permission = this.isSupported ? Notification.permission : 'denied'
    this.registration = null
  }

  // 請求通知權限
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('此瀏覽器不支援推播通知')
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      throw new Error('通知權限已被拒絕，請在瀏覽器設定中啟用')
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('請求通知權限失敗:', error)
      throw error
    }
  }

  // 註冊 Service Worker
  async registerServiceWorker() {
    if (!this.isSupported) {
      throw new Error('此瀏覽器不支援 Service Worker')
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker 註冊成功:', this.registration)
      return this.registration
    } catch (error) {
      console.error('Service Worker 註冊失敗:', error)
      throw error
    }
  }

  // 訂閱推播通知
  async subscribe() {
    if (!this.isSupported) {
      throw new Error('此瀏覽器不支援推播通知')
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        throw new Error('通知權限被拒絕')
      }
    }

    if (!this.registration) {
      await this.registerServiceWorker()
    }

    try {
      // 取得 VAPID 公鑰
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
        '***REMOVED***'
      
      // 驗證公鑰格式
      if (!vapidPublicKey || vapidPublicKey.length < 80) {
        throw new Error('VAPID 公鑰格式不正確')
      }

      // 轉換公鑰
      let applicationServerKey
      try {
        applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey)
        
        // Safari 需要驗證 key 的長度（P-256 公鑰應該是 65 bytes）
        if (applicationServerKey.length !== 65) {
          throw new Error(`VAPID 公鑰長度不正確: ${applicationServerKey.length} bytes (應為 65 bytes)`)
        }
      } catch (conversionError) {
        console.error('公鑰轉換失敗:', conversionError)
        throw new Error('VAPID 公鑰轉換失敗: ' + conversionError.message)
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })

      console.log('推播訂閱成功:', subscription)
      return subscription
    } catch (error) {
      console.error('推播訂閱失敗:', error)
      
      // 提供更詳細的錯誤訊息
      if (error.message.includes('applicationServerKey')) {
        throw new Error('VAPID 公鑰無效。請確認公鑰是有效的 P-256 公鑰。')
      }
      throw error
    }
  }

  // 取消訂閱推播通知
  async unsubscribe() {
    if (!this.registration) {
      return false
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        console.log('推播取消訂閱成功')
        return true
      }
      return false
    } catch (error) {
      console.error('推播取消訂閱失敗:', error)
      throw error
    }
  }

  // 檢查訂閱狀態
  async getSubscription() {
    if (!this.registration) {
      return null
    }

    try {
      return await this.registration.pushManager.getSubscription()
    } catch (error) {
      console.error('獲取訂閱狀態失敗:', error)
      return null
    }
  }

  // 發送本地通知
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('無法發送通知: 權限不足或不支援')
      return
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      ***REMOVED***options
    }

    try {
      const notification = new Notification(title, defaultOptions)
      
      // 自動關閉通知
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('發送本地通知失敗:', error)
    }
  }

  // 發送價格變動通知
  showPriceAlert(symbol, price, change, changePercent) {
    const isPositive = change >= 0
    const emoji = isPositive ? '📈' : '📉'
    const sign = isPositive ? '+' : ''
    
    const title = `${emoji} ${symbol} 價格變動`
    const body = `價格: $${price.toFixed(2)}\n變動: ${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`
    
    return this.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `price-${symbol}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '查看詳情'
        },
        {
          action: 'dismiss',
          title: '忽略'
        }
      ]
    })
  }

  // 發送每日摘要通知
  showDailySummary(summary) {
    const title = '📊 每日價格摘要'
    const body = `監控 ${summary.total} 個項目\n上漲: ${summary.positive} 個\n下跌: ${summary.negative} 個`
    
    return this.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'daily-summary',
      requireInteraction: false
    })
  }

  // 發送匯率變動通知
  showExchangeRateAlert(from, to, rate, change, changePercent) {
    const isPositive = change >= 0
    const emoji = isPositive ? '📈' : '📉'
    const sign = isPositive ? '+' : ''
    
    const title = `${emoji} ${from}/${to} 匯率變動`
    const body = `匯率: ${rate.toFixed(4)}\n變動: ${sign}${change.toFixed(4)} (${sign}${changePercent.toFixed(2)}%)`
    
    return this.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `rate-${from}-${to}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '查看詳情'
        },
        {
          action: 'dismiss',
          title: '忽略'
        }
      ]
    })
  }

  // 將 VAPID 公鑰轉換為 Uint8Array（Safari 相容版本）
  urlBase64ToUint8Array(base64String) {
    try {
      // 移除可能的空白字元
      base64String = base64String.trim()
      
      // 計算需要的 padding
      const padding = '='.repeat((4 - base64String.length % 4) % 4)
      
      // 將 URL-safe base64 轉換為標準 base64
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')

      // 解碼 base64
      let rawData
      try {
        rawData = window.atob(base64)
      } catch (e) {
        throw new Error('Base64 解碼失敗: 公鑰格式可能不正確')
      }

      // 轉換為 Uint8Array
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }

      // 驗證結果
      if (outputArray.length === 0) {
        throw new Error('轉換後的 key 長度為 0')
      }

      return outputArray
    } catch (error) {
      console.error('urlBase64ToUint8Array 錯誤:', error)
      throw error
    }
  }

  // 初始化通知服務
  async initialize() {
    if (!this.isSupported) {
      console.warn('此瀏覽器不支援推播通知')
      return false
    }

    try {
      await this.registerServiceWorker()
      return true
    } catch (error) {
      console.error('初始化通知服務失敗:', error)
      return false
    }
  }

  // 獲取支援狀態
  getSupportStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.permission,
      hasServiceWorker: !!this.registration
    }
  }
}

// 創建單例實例
const notificationService = new NotificationService()

export default notificationService
