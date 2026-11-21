import axios from 'axios'
import { SUPPORTED_CURRENCIES, getCurrencyInfo } from '../../config/currencies.js'

const apiClient = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

const API_CONFIG = {
  EXCHANGE_RATE_BASE_URL: 'https://api.exchangerate-api.com/v4/latest'
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


export default exchangeRateAPI
