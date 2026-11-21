import axios from 'axios'

const apiClient = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

const API_CONFIG = {
  TWSE_BASE_URL: '/api/twse/getStockInfo.jsp'
}

// 台股 API 服務
export const twseAPI = {
  // 獲取台股價格
  async getStockPrice(symbol) {
    try {
      const response = await apiClient.get(API_CONFIG.TWSE_BASE_URL, {
        params: {
          ex_ch: `tse_${symbol}

export default twseAPI
