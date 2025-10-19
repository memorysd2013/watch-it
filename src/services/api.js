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
  ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
  ALPHA_VANTAGE_API_KEY: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ALPHA_VANTAGE_API_KEY) || 'demo',
  
  // 加密貨幣 API (使用 CoinGecko - 免費)
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  
  // 匯率 API (使用 ExchangeRate-API - 免費)
  EXCHANGE_RATE_BASE_URL: 'https://api.exchangerate-api.com/v4/latest',
  
  // 歷史匯率 API (使用 FreeCurrencyAPI - 免費版每月5000次請求)
  FREECURRENCY_API_KEY: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FREECURRENCY_API_KEY) || null,
  FREECURRENCY_BASE_URL: 'https://api.freecurrencyapi.com/v1',
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

// 美股 API 服務
export const usStockAPI = {
  // 獲取美股價格
  async getStockPrice(symbol) {
    try {
      const response = await apiClient.get(API_CONFIG.ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: API_CONFIG.ALPHA_VANTAGE_API_KEY
        }
      })
      console.log('response', response)
      if (response.data && response.data['Global Quote']) {
        const quote = response.data['Global Quote']
        return {
          symbol: quote['01. symbol'],
          name: quote['01. symbol'], // Alpha Vantage 不提供公司名稱
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
          volume: parseInt(quote['06. volume']) || 0,
          high: parseFloat(quote['03. high']) || 0,
          low: parseFloat(quote['04. low']) || 0,
          open: parseFloat(quote['02. open']) || 0,
          type: 'us'
        }
      }
      throw new Error('美股資料獲取失敗')
    } catch (error) {
      console.error('美股 API 錯誤:', error)
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

  // 獲取歷史匯率數據 (用於圖表) - 帶快取功能
  async getHistoricalRates(fromCurrency, toCurrency, period = '1M') {
    try {
      // 驗證貨幣代碼
      if (!SUPPORTED_CURRENCIES[fromCurrency] || !SUPPORTED_CURRENCIES[toCurrency]) {
        throw new Error(`不支援的貨幣代碼: ${fromCurrency}/${toCurrency}`)
      }

      // 生成快取鍵值
      const cacheKey = cacheManager.generateKey('historical_rates', {
        from: fromCurrency,
        to: toCurrency,
        period: period
      })

      // 1. 嘗試從快取獲取數據
      const cachedData = cacheManager.get(cacheKey)
      if (cachedData) {
        console.log(`📊 使用快取的歷史匯率數據: ${fromCurrency}/${toCurrency} (${period})`)
        return cachedData
      }

      console.log(`🌐 從 API 獲取歷史匯率數據: ${fromCurrency}/${toCurrency} (${period})`)

      // 2. 快取中沒有數據，優先嘗試從 FreeCurrencyAPI 獲取真實歷史數據
      let result

      if (API_CONFIG.FREECURRENCY_API_KEY) {
        try {
          console.log('📡 嘗試從 FreeCurrencyAPI 獲取真實歷史數據...')
          result = await this.getHistoricalRatesFromFreeCurrency(fromCurrency, toCurrency, period)
          console.log('✅ 成功獲取真實歷史數據')
        } catch (error) {
          console.warn('⚠️ FreeCurrencyAPI 獲取失敗，使用模擬數據:', error.message)
        }
      }

      // 3. 如果沒有 API key 或獲取失敗，使用模擬數據
      if (!result) {
        console.log('🎲 使用模擬數據生成歷史趨勢')
        
        // 獲取當前匯率
        const currentRateResponse = await apiClient.get(`${API_CONFIG.EXCHANGE_RATE_BASE_URL}/${fromCurrency}`)
        
        if (!currentRateResponse.data || !currentRateResponse.data.rates || !currentRateResponse.data.rates[toCurrency]) {
          throw new Error('無法獲取當前匯率數據')
        }

        const currentRate = currentRateResponse.data.rates[toCurrency]
        
        // 基於當前匯率生成歷史數據
        const historicalData = this.generateRealisticHistoricalData(
          fromCurrency, 
          toCurrency, 
          period, 
          currentRate
        )

        const fromInfo = getCurrencyInfo(fromCurrency)
        const toInfo = getCurrencyInfo(toCurrency)

        result = {
          from: fromCurrency,
          to: toCurrency,
          period: period,
          data: historicalData,
          lastUpdated: new Date().toISOString(),
          fromInfo,
          toInfo,
          isSimulatedData: true,
          isRealData: false,
          dataSource: 'Simulated',
          isCached: false,
          note: '基於當前匯率生成的歷史趨勢圖，僅供參考'
        }
      }

      // 4. 將結果存入快取
      cacheManager.set(cacheKey, result)

      return result
    } catch (error) {
      console.error('歷史匯率 API 錯誤:', error)
      
      // 如果 API 失敗，嘗試返回快取數據（即使過期）
      const cacheKey = cacheManager.generateKey('historical_rates', {
        from: fromCurrency,
        to: toCurrency,
        period: period
      })
      
      const expiredCache = cacheManager.getFromMemory(cacheKey) || cacheManager.getFromLocalStorage(cacheKey)
      if (expiredCache) {
        console.warn('⚠️ API 失敗，使用過期的快取數據')
        return expiredCache.data || expiredCache
      }
      
      // 最後才返回模擬數據
      return this.getMockHistoricalData(fromCurrency, toCurrency, period)
    }
  },

  // 從 FreeCurrencyAPI 獲取真實的歷史數據
  async getHistoricalRatesFromFreeCurrency(fromCurrency, toCurrency, period = '1M') {
    if (!API_CONFIG.FREECURRENCY_API_KEY) {
      throw new Error('需要 FreeCurrencyAPI API key')
    }

    const endDate = new Date()
    const startDate = new Date()
    
    // 計算日期範圍
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '1W':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    try {
      // FreeCurrencyAPI 使用 historical endpoint
      // 使用 ISO8601 格式的 datetime_start 和 datetime_end
      const response = await apiClient.get(`${API_CONFIG.FREECURRENCY_BASE_URL}/historical`, {
        params: {
          apikey: API_CONFIG.FREECURRENCY_API_KEY,
          base_currency: fromCurrency,
          currencies: toCurrency,
          datetime_start: startDate.toISOString(),
          datetime_end: endDate.toISOString()
        }
      })

      if (!response.data || !response.data.data) {
        throw new Error('FreeCurrencyAPI 返回無效數據')
      }

      // 轉換 API 數據格式
      const historicalData = []
      const dataObj = response.data.data

      // FreeCurrencyAPI 返回格式: { "2025-10-18": { "TWD": 31.5234 } }
      for (const [date, rates] of Object.entries(dataObj)) {
        if (rates[toCurrency]) {
          historicalData.push({
            date: date,
            rate: parseFloat(rates[toCurrency].toFixed(4)),
            timestamp: new Date(date).getTime()
          })
        }
      }

      // 按日期排序
      historicalData.sort((a, b) => a.timestamp - b.timestamp)

      const fromInfo = getCurrencyInfo(fromCurrency)
      const toInfo = getCurrencyInfo(toCurrency)

      return {
        from: fromCurrency,
        to: toCurrency,
        period: period,
        data: historicalData,
        lastUpdated: new Date().toISOString(),
        fromInfo,
        toInfo,
        isSimulatedData: false,
        isRealData: true,
        dataSource: 'FreeCurrencyAPI',
        note: '來自 FreeCurrencyAPI 的真實歷史匯率數據'
      }
    } catch (error) {
      console.error('FreeCurrencyAPI 錯誤:', error)
      
      // 處理不同的錯誤狀態碼
      if (error.response?.status === 401) {
        throw new Error('FreeCurrencyAPI API key 無效')
      } else if (error.response?.status === 422) {
        // 422 驗證錯誤 - 提供詳細信息
        const errorMessage = error.response?.data?.message || '驗證錯誤'
        console.error('422 驗證錯誤詳情:', error.response?.data)
        throw new Error(`FreeCurrencyAPI 驗證錯誤: ${errorMessage}`)
      } else if (error.response?.status === 429) {
        throw new Error('FreeCurrencyAPI 配額已用盡，請稍後再試')
      }
      
      throw error
    }
  },

  // 生成更真實的歷史數據
  generateRealisticHistoricalData(fromCurrency, toCurrency, period, currentRate) {
    const data = []
    const endDate = new Date()
    const startDate = new Date()
    
    // 計算日期範圍
    switch (period) {
      case '1W':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    // 生成更真實的匯率波動
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    let baseRate = currentRate
    
    // 根據時間週期調整波動幅度
    const volatility = {
      '1W': 0.02,   // 2% 波動
      '1M': 0.05,   // 5% 波動
      '3M': 0.08,   // 8% 波動
      '6M': 0.12,   // 12% 波動
      '1Y': 0.15    // 15% 波動
    }[period] || 0.05

    // 生成趨勢（輕微的上升或下降趨勢）
    const trend = (Math.random() - 0.5) * 0.1 // -5% 到 +5% 的趨勢
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      // 計算趨勢影響
      const trendFactor = 1 + (trend * i / days)
      
      // 計算隨機波動
      const randomVariation = (Math.random() - 0.5) * volatility
      
      // 添加一些市場週期性（週末效應等）
      const dayOfWeek = date.getDay()
      const weekendEffect = (dayOfWeek === 0 || dayOfWeek === 6) ? -0.001 : 0
      
      // 計算最終匯率
      const rate = baseRate * trendFactor * (1 + randomVariation + weekendEffect)
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(4)),
        timestamp: date.getTime()
      })
    }

    return data
  },

  // 模擬歷史數據 (當API不可用時)
  getMockHistoricalData(fromCurrency, toCurrency, period) {
    const data = []
    const endDate = new Date()
    const startDate = new Date()
    
    // 計算日期範圍
    switch (period) {
      case '1W':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    // 生成模擬數據 - 根據貨幣對設定不同的基準匯率
    const baseRates = {
      'USD/TWD': 31.5,
      'TWD/USD': 0.032,
      'USD/EUR': 0.85,
      'EUR/USD': 1.18,
      'USD/JPY': 110.0,
      'JPY/USD': 0.009,
      'EUR/TWD': 37.0,
      'TWD/EUR': 0.027,
      'JPY/TWD': 0.29,
      'TWD/JPY': 3.45
    }
    
    const rateKey = `${fromCurrency}/${toCurrency}`
    const baseRate = baseRates[rateKey] || 1.0
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      // 添加隨機波動
      const variation = (Math.random() - 0.5) * 0.1 * baseRate
      const rate = baseRate + variation
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(4)),
        timestamp: date.getTime()
      })
    }

    const fromInfo = getCurrencyInfo(fromCurrency)
    const toInfo = getCurrencyInfo(toCurrency)

    return {
      from: fromCurrency,
      to: toCurrency,
      period: period,
      data: data,
      lastUpdated: new Date().toISOString(),
      isMockData: true,
      fromInfo,
      toInfo
    }
  }
}

// 統一的價格獲取函數
export const getPrice = async (symbol, type) => {
  switch (type) {
    case 'twse':
      return await twseAPI.getStockPrice(symbol)
    case 'us':
      return await usStockAPI.getStockPrice(symbol)
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
  usStockAPI,
  cryptoAPI,
  exchangeRateAPI,
  getPrice,
  notificationAPI,
  cacheManager
}

// 也單獨導出快取管理器
export { cacheManager }
