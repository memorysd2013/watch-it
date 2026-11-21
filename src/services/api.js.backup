import axios from 'axios'
import { SUPPORTED_CURRENCIES, getCurrencyInfo } from '../config/currencies.js'

// ==================== 快取管理系統 ====================

// Memory 快取
const memoryCache = new Map()

// LocalStorage 快取管理
const cacheManager = {
  // 生成快取鍵值
  generateKey(prefix, params) {
    return `${prefix}_${JSON.stringify(params)}`
  },

  // 檢查快取是否過期（是否為隔日）
  isCacheExpired(timestamp) {
    if (!timestamp) return true
    
    const cachedDate = new Date(timestamp)
    const currentDate = new Date()
    
    // 檢查是否為不同日期
    return (
      cachedDate.getFullYear() !== currentDate.getFullYear() ||
      cachedDate.getMonth() !== currentDate.getMonth() ||
      cachedDate.getDate() !== currentDate.getDate()
    )
  },

  // 從 Memory 快取獲取數據
  getFromMemory(key) {
    return memoryCache.get(key)
  },

  // 儲存到 Memory 快取
  setToMemory(key, data) {
    memoryCache.set(key, {
      data,
      timestamp: new Date().toISOString()
    })
  },

  // 從 LocalStorage 獲取數據
  getFromLocalStorage(key) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      
      const parsed = JSON.parse(cached)
      
      // 檢查是否過期
      if (this.isCacheExpired(parsed.timestamp)) {
        // 過期則刪除
        localStorage.removeItem(key)
        return null
      }
      
      return parsed
    } catch (error) {
      console.error('從 LocalStorage 讀取快取失敗:', error)
      return null
    }
  },

  // 儲存到 LocalStorage
  setToLocalStorage(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.error('儲存到 LocalStorage 失敗:', error)
      // 如果 localStorage 滿了，清理舊的快取
      if (error.name === 'QuotaExceededError') {
        this.clearOldCache()
        // 再試一次
        try {
          const cacheData = {
            data,
            timestamp: new Date().toISOString()
          }
          localStorage.setItem(key, JSON.stringify(cacheData))
        } catch (retryError) {
          console.error('重試儲存失敗:', retryError)
        }
      }
    }
  },

  // 獲取快取數據（優先從 Memory，然後 LocalStorage）
  get(key) {
    // 1. 先檢查 Memory 快取
    const memoryData = this.getFromMemory(key)
    if (memoryData && !this.isCacheExpired(memoryData.timestamp)) {
      console.log(`✅ 從 Memory 快取獲取數據: ${key}`)
      return memoryData.data
    }

    // 2. 檢查 LocalStorage 快取
    const localData = this.getFromLocalStorage(key)
    if (localData) {
      console.log(`✅ 從 LocalStorage 快取獲取數據: ${key}`)
      // 同時更新到 Memory 快取
      this.setToMemory(key, localData.data)
      return localData.data
    }

    return null
  },

  // 設定快取數據（同時存到 Memory 和 LocalStorage）
  set(key, data) {
    this.setToMemory(key, data)
    this.setToLocalStorage(key, data)
    console.log(`💾 快取數據已儲存: ${key}`)
  },

  // 清除特定快取
  remove(key) {
    memoryCache.delete(key)
    localStorage.removeItem(key)
  },

  // 清理所有過期的快取
  clearExpiredCache() {
    // 清理 Memory 快取
    for (const [key, value] of memoryCache.entries()) {
      if (this.isCacheExpired(value.timestamp)) {
        memoryCache.delete(key)
      }
    }

    // 清理 LocalStorage 快取
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('historical_rates_') || key.startsWith('exchange_rate_')) {
          const cached = localStorage.getItem(key)
          if (cached) {
            const parsed = JSON.parse(cached)
            if (this.isCacheExpired(parsed.timestamp)) {
              localStorage.removeItem(key)
            }
          }
        }
      })
    } catch (error) {
      console.error('清理過期快取失敗:', error)
    }
  },

  // 清理舊的快取（當空間不足時）
  clearOldCache() {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => 
        key.startsWith('historical_rates_') || key.startsWith('exchange_rate_')
      )
      
      // 刪除最舊的 50% 快取
      const keysToRemove = cacheKeys.slice(0, Math.ceil(cacheKeys.length / 2))
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      console.log(`🗑️ 清理了 ${keysToRemove.length} 個舊快取`)
    } catch (error) {
      console.error('清理舊快取失敗:', error)
    }
  },

  // 清除所有快取
  clearAll() {
    memoryCache.clear()
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('historical_rates_') || key.startsWith('exchange_rate_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('清除所有快取失敗:', error)
    }
  }
}

// 應用啟動時清理過期快取
cacheManager.clearExpiredCache()

// ==================== API 配置 ====================

// API 配置
const API_CONFIG = {
  // 台股 API (使用代理避免 CORS 問題)
  TWSE_BASE_URL: '/api/twse/getStockInfo.jsp',
  
  // 美股 API (使用 Alpha Vantage - 需要 API key)
  
  // 加密貨幣 API (使用 CoinGecko - 免費)
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  
  // 匯率 API (使用 ExchangeRate-API - 免費)
  EXCHANGE_RATE_BASE_URL: 'https://api.exchangerate-api.com/v4/latest',
  
  // 歷史匯率 API (使用 FreeCurrencyAPI - 免費版每月5000次請求)
}

// 創建 axios 實例
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 台股 API 服務
export const twseAPI = {
  // 獲取台股價格
  async getStockPrice(symbol) {
    try {
      const response = await apiClient.get(API_CONFIG.TWSE_BASE_URL, {
        params: {
          ex_ch: `tse_${symbol}.tw`
        }
      })
      
      if (response.data && response.data.msgArray && response.data.msgArray.length > 0) {
        const stock = response.data.msgArray[0]
        return {
          symbol: stock.c,
          name: stock.n,
          price: parseFloat(stock.z) || 0,
          change: parseFloat(stock.y) - parseFloat(stock.z) || 0,
          changePercent: ((parseFloat(stock.y) - parseFloat(stock.z)) / parseFloat(stock.y) * 100) || 0,
          volume: parseInt(stock.tv) || 0,
          high: parseFloat(stock.h) || 0,
          low: parseFloat(stock.l) || 0,
          open: parseFloat(stock.o) || 0,
          type: 'twse'
        }
      }
      throw new Error('台股資料獲取失敗')
    } catch (error) {
      console.error('台股 API 錯誤:', error)
      throw error
    }
  }
}

// 加密貨幣 API 服務
export const cryptoAPI = {
  // 獲取加密貨幣價格
  async getCryptoPrice(symbol) {
    try {
      const response = await apiClient.get(`${API_CONFIG.COINGECKO_BASE_URL}/simple/price`, {
        params: {
          ids: symbol.toLowerCase(),
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_last_updated_at: true
        }
      })
      
      if (response.data && response.data[symbol.toLowerCase()]) {
        const crypto = response.data[symbol.toLowerCase()]
        return {
          symbol: symbol.toUpperCase(),
          name: symbol.toUpperCase(),
          price: crypto.usd || 0,
          priceTwd: crypto.twd || 0,
          change: crypto.usd_24h_change || 0,
          changePercent: crypto.usd_24h_change || 0,
          volume: crypto.usd_24h_vol || 0,
          lastUpdated: crypto.last_updated_at,
          type: 'crypto'
        }
      }
      throw new Error('加密貨幣資料獲取失敗')
    } catch (error) {
      console.error('加密貨幣 API 錯誤:', error)
      throw error
    }
  },

  // 獲取加密貨幣列表
  async getCryptoList() {
    try {
      const response = await apiClient.get(`${API_CONFIG.COINGECKO_BASE_URL}/coins/list`)
      return response.data
    } catch (error) {
      console.error('獲取加密貨幣列表錯誤:', error)
      throw error
    }
  }
}

// 匯率 API 服務
export const exchangeRateAPI = {
  // 獲取指定貨幣對的匯率
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // 驗證貨幣代碼
      if (!SUPPORTED_CURRENCIES[fromCurrency] || !SUPPORTED_CURRENCIES[toCurrency]) {
        throw new Error(`不支援的貨幣代碼: ${fromCurrency}/${toCurrency}`)
      }

      const response = await apiClient.get(`${API_CONFIG.EXCHANGE_RATE_BASE_URL}/${fromCurrency}`)
      
      if (response.data && response.data.rates && response.data.rates[toCurrency]) {
        const fromInfo = getCurrencyInfo(fromCurrency)
        const toInfo = getCurrencyInfo(toCurrency)
        
        return {
          from: fromCurrency,
          to: toCurrency,
          rate: response.data.rates[toCurrency],
          lastUpdated: response.data.date,
          type: 'exchange_rate',
          fromInfo,
          toInfo
        }
      }
      throw new Error('匯率資料獲取失敗')
    } catch (error) {
      console.error('匯率 API 錯誤:', error)
      throw error
    }
  },

  // 獲取美金對台幣匯率 (向後兼容)
  async getUSDTWDRate() {
    return this.getExchangeRate('USD', 'TWD')
  },

  // 獲取台幣對美金匯率 (向後兼容)
  async getTWDUSDRate() {
    return this.getExchangeRate('TWD', 'USD')
  },

  // 獲取所有支援的貨幣匯率
  async getAllRates() {
    try {
      const response = await apiClient.get(`${API_CONFIG.EXCHANGE_RATE_BASE_URL}/USD`)
      return response.data
    } catch (error) {
      console.error('獲取所有匯率失敗:', error)
      throw error
    }
  },

}

// 統一的價格獲取函數
export const getPrice = async (symbol, type) => {
  switch (type) {
    case 'twse':
      return await twseAPI.getStockPrice(symbol)
    case 'crypto':
      return await cryptoAPI.getCryptoPrice(symbol)
    case 'exchange_rate':
      // 解析貨幣對 (格式: FROM/TO)
      const [fromCurrency, toCurrency] = symbol.split('/')
      if (fromCurrency && toCurrency) {
        return await exchangeRateAPI.getExchangeRate(fromCurrency, toCurrency)
      }
      // 向後兼容舊格式
      if (symbol === 'USD/TWD') {
        return await exchangeRateAPI.getUSDTWDRate()
      } else if (symbol === 'TWD/USD') {
        return await exchangeRateAPI.getTWDUSDRate()
      }
      throw new Error('不支援的匯率對')
    default:
      throw new Error('不支援的類型')
  }
}

// 推播通知 API
export const notificationAPI = {
  // 訂閱推播通知
  async subscribe(subscription) {
    try {
      const response = await apiClient.post('/api/notifications/subscribe', {
        subscription
      })
      return response.data
    } catch (error) {
      console.error('訂閱推播通知錯誤:', error)
      throw error
    }
  },

  // 取消訂閱推播通知
  async unsubscribe(subscription) {
    try {
      const response = await apiClient.post('/api/notifications/unsubscribe', {
        subscription
      })
      return response.data
    } catch (error) {
      console.error('取消訂閱推播通知錯誤:', error)
      throw error
    }
  }
}

export default {
  twseAPI,
  cryptoAPI,
  exchangeRateAPI,
  getPrice,
  notificationAPI,
  cacheManager
}

// 也單獨導出快取管理器
export { cacheManager }
