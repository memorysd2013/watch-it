import axios from 'axios'

const apiClient = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3'
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


export default cryptoAPI
