// 推播通知服務
class NotificationService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
    this.permission = this.isSupported ? Notification.permission : 'denied'
    this.registration = null
    this.isSafariMobile = this.detectSafariMobile()
  }

  // 檢測是否為 Safari 手機瀏覽器
  detectSafariMobile() {
    const userAgent = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
    return isIOS && isSafari
  }

  // 獲取環境變數的 Safari 相容方法
  getEnvironmentVariable(key) {
    try {
      // 標準方法
      const value = import.meta.env[key]
      
      // Safari 手機瀏覽器特殊處理
      if (this.isSafariMobile && (value === undefined || value === null)) {
        console.warn(`⚠️ Safari 手機瀏覽器環境變數 ${key} 未載入，嘗試備援方案`)
        
        // 嘗試從 window 物件獲取（如果有的話）
        if (window.__ENV__ && window.__ENV__[key]) {
          console.log(`✅ 從 window.__ENV__ 獲取 ${key}`)
          return window.__ENV__[key]
        }
        
        // 嘗試從 localStorage 獲取（開發時可能有用）
        const storedValue = localStorage.getItem(key)
        if (storedValue) {
          console.log(`✅ 從 localStorage 獲取 ${key}`)
          return storedValue
        }
      }
      
      return value
    } catch (error) {
      console.error(`❌ 獲取環境變數 ${key} 失敗:`, error)
      return undefined
    }
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
      // 🔍 詳細的環境變數調試信息
      console.log('🔍 環境變數調試信息:')
      console.log('是否為 Safari 手機瀏覽器:', this.isSafariMobile)
      console.log('import.meta.env:', import.meta.env)
      console.log('VITE_VAPID_PUBLIC_KEY 原始值:', import.meta.env.VITE_VAPID_PUBLIC_KEY)
      console.log('VITE_VAPID_PUBLIC_KEY 類型:', typeof import.meta.env.VITE_VAPID_PUBLIC_KEY)
      console.log('VITE_VAPID_PUBLIC_KEY 是否為 undefined:', import.meta.env.VITE_VAPID_PUBLIC_KEY === undefined)
      console.log('VITE_VAPID_PUBLIC_KEY 是否為 null:', import.meta.env.VITE_VAPID_PUBLIC_KEY === null)
      console.log('VITE_VAPID_PUBLIC_KEY 是否為空字串:', import.meta.env.VITE_VAPID_PUBLIC_KEY === '')
      console.log('瀏覽器:', navigator.userAgent)
      
      // 使用 Safari 相容的方法獲取 VAPID 公鑰
      const envVapidKey = this.getEnvironmentVariable('VITE_VAPID_PUBLIC_KEY')
      console.log('🔍 使用 Safari 相容方法獲取的公鑰:', envVapidKey)
      
      // 取得 VAPID 公鑰（優先使用環境變數，否則使用預設值）
      const vapidPublicKey = envVapidKey || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI0lF3N3QbLYXopXD2XJpN5KFHvS0buXg3x1CJHBw2eGz8ZUrJ8L7rY8rE'
      
      // 🔍 調試信息：印出當前使用的公鑰
      console.log('🔍 VAPID 公鑰調試信息:')
      console.log('最終使用的公鑰:', vapidPublicKey)
      console.log('公鑰長度:', vapidPublicKey.length, '字符')
      console.log('環境變數來源:', import.meta.env.VITE_VAPID_PUBLIC_KEY ? '環境變數' : '預設值')
      
      // 驗證公鑰格式
      if (!vapidPublicKey || vapidPublicKey.length < 80) {
        console.error('❌ VAPID 公鑰格式不正確')
        console.error('公鑰長度:', vapidPublicKey?.length || 0)
        throw new Error('VAPID 公鑰格式不正確')
      }

      // 轉換公鑰
      let applicationServerKey
      try {
        applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey)
        
        // 🔍 調試信息：印出轉換後的公鑰詳情
        console.log('🔍 公鑰轉換詳情:')
        console.log('轉換後長度:', applicationServerKey.length, 'bytes')
        console.log('首字節:', '0x' + applicationServerKey[0].toString(16).padStart(2, '0'))
        console.log('是否為 P-256 標準:', applicationServerKey.length === 65 ? '✅' : '❌')
        
        // Safari 需要驗證 key 的長度（P-256 公鑰應該是 65 bytes）
        if (applicationServerKey.length !== 65) {
          console.error('❌ VAPID 公鑰長度不正確')
          console.error('實際長度:', applicationServerKey.length, 'bytes')
          console.error('預期長度: 65 bytes')
          throw new Error(`VAPID 公鑰長度不正確: ${applicationServerKey.length} bytes (應為 65 bytes)`)
        }
        
        console.log('✅ 公鑰格式驗證通過')
      } catch (conversionError) {
        console.error('❌ 公鑰轉換失敗:', conversionError)
        console.error('原始公鑰:', vapidPublicKey)
        throw new Error('VAPID 公鑰轉換失敗: ' + conversionError.message)
      }

      console.log('🚀 開始訂閱推播通知...')
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })

      console.log('✅ 推播訂閱成功:', subscription)
      return subscription
    } catch (error) {
      console.error('❌ 推播訂閱失敗:', error)
      
      // 🔍 詳細的錯誤調試信息
      console.error('🔍 錯誤詳情:')
      console.error('錯誤類型:', error.name)
      console.error('錯誤訊息:', error.message)
      console.error('錯誤堆疊:', error.stack)
      
      // 如果是 applicationServerKey 相關錯誤，提供更詳細的信息
      if (error.message.includes('applicationServerKey')) {
        console.error('🔍 applicationServerKey 錯誤詳情:')
        console.error('當前公鑰:', import.meta.env.VITE_VAPID_PUBLIC_KEY)
        console.error('公鑰長度:', import.meta.env.VITE_VAPID_PUBLIC_KEY?.length)
        console.error('環境:', import.meta.env.MODE)
        console.error('是否為生產環境:', import.meta.env.PROD)
        
        throw new Error(`VAPID 公鑰無效。請確認公鑰是有效的 P-256 公鑰。\n當前公鑰: ${import.meta.env.VITE_VAPID_PUBLIC_KEY}\n公鑰長度: ${import.meta.env.VITE_VAPID_PUBLIC_KEY?.length} 字符`)
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
      ...options
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
      console.log('🔍 urlBase64ToUint8Array 調試信息:')
      console.log('輸入公鑰:', base64String)
      console.log('輸入長度:', base64String.length, '字符')
      
      // 移除可能的空白字元
      const trimmed = base64String.trim()
      console.log('去除空白後:', trimmed)
      console.log('去除空白後長度:', trimmed.length, '字符')
      
      // 計算需要的 padding
      const padding = '='.repeat((4 - trimmed.length % 4) % 4)
      console.log('需要 padding:', padding.length, '個 = 符號')
      
      // 將 URL-safe base64 轉換為標準 base64
      const base64 = (trimmed + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      
      console.log('標準化後的 base64:', base64)
      console.log('標準化後長度:', base64.length, '字符')

      // 解碼 base64
      let rawData
      try {
        rawData = window.atob(base64)
        console.log('Base64 解碼成功')
        console.log('解碼後長度:', rawData.length, '字符')
      } catch (e) {
        console.error('❌ Base64 解碼失敗:', e.message)
        console.error('嘗試解碼的字符串:', base64)
        throw new Error('Base64 解碼失敗: 公鑰格式可能不正確')
      }

      // 轉換為 Uint8Array
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }

      console.log('轉換為 Uint8Array 成功')
      console.log('輸出長度:', outputArray.length, 'bytes')
      console.log('首字節:', '0x' + outputArray[0].toString(16).padStart(2, '0'))
      console.log('前 10 個字節:', Array.from(outputArray.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '))

      // 驗證結果
      if (outputArray.length === 0) {
        console.error('❌ 轉換後的 key 長度為 0')
        throw new Error('轉換後的 key 長度為 0')
      }

      console.log('✅ urlBase64ToUint8Array 轉換成功')
      return outputArray
    } catch (error) {
      console.error('❌ urlBase64ToUint8Array 錯誤:', error)
      console.error('輸入參數:', base64String)
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
