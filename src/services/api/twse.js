import axios from 'axios'

const apiClient = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

const API_CONFIG = {
  TWSE_BASE_URL: '/api/twse/getStockInfo.jsp'
}

export const twseAPI = {
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

export default twseAPI
