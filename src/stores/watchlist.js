import { defineStore } from 'pinia'
import { getPrice } from '../services/api.js'

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    notificationsEnabled: false
  }),

  getters: {
    // 獲取所有監控項目
    getAllItems: (state) => state.items,
    
    // 獲取特定類型的項目
    getItemsByType: (state) => (type) => {
      return state.items.filter(item => item.type === type)
    },
    
    // 獲取項目總數
    getItemCount: (state) => state.items.length,
    
    // 檢查項目是否已存在
    isItemExists: (state) => (symbol, type) => {
      return state.items.some(item => item.symbol === symbol && item.type === type)
    }
  },

  actions: {
    // 添加監控項目
    async addItem(symbol, type, name = '') {
      if (this.isItemExists(symbol, type)) {
        throw new Error('該項目已在監控清單中')
      }

      this.loading = true
      this.error = null

      try {
        // 獲取當前價格
        const priceData = await getPrice(symbol, type)
        
        // 股票/加密貨幣資料結構
        const newItem = {
          id: Date.now().toString(),
          symbol: symbol.toUpperCase(),
          name: name || priceData.name,
          type: type,
          currentPrice: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
          volume: priceData.volume,
          high: priceData.high,
          low: priceData.low,
          open: priceData.open,
          lastUpdated: new Date().toISOString(),
          priceTwd: priceData.priceTwd || null,
          addedAt: new Date().toISOString()
        }

        this.items.push(newItem)
        this.saveToLocalStorage()
        
        return newItem
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 移除監控項目
    removeItem(id) {
      const index = this.items.findIndex(item => item.id === id)
      if (index > -1) {
        this.items.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    // 更新所有項目價格
    async updateAllPrices() {
      this.loading = true
      this.error = null

      try {
        const updatePromises = this.items.map(async (item) => {
          try {
            const priceData = await getPrice(item.symbol, item.type)
            
            // 更新股票/加密貨幣資料
            return {
              ...item,
              currentPrice: priceData.price,
              change: priceData.change,
              changePercent: priceData.changePercent,
              volume: priceData.volume,
              high: priceData.high,
              low: priceData.low,
              open: priceData.open,
              lastUpdated: new Date().toISOString(),
              priceTwd: priceData.priceTwd || item.priceTwd
            }
          } catch (error) {
            console.error(`更新 ${item.symbol} 價格失敗:`, error)
            return item // 保持原有資料
          }
        })

        this.items = await Promise.all(updatePromises)
        this.saveToLocalStorage()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

  // 更新單一項目價格
  async updateItemPrice(id) {
    const item = this.items.find(item => item.id === id)
    if (!item) return

    try {
      const priceData = await getPrice(item.symbol, item.type)
      const index = this.items.findIndex(i => i.id === id)
      
      // 更新股票/加密貨幣資料
      this.items[index] = {
        ...item,
        currentPrice: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        volume: priceData.volume,
        high: priceData.high,
        low: priceData.low,
        open: priceData.open,
        lastUpdated: new Date().toISOString(),
        priceTwd: priceData.priceTwd || item.priceTwd
      }
      
      this.saveToLocalStorage()
    } catch (error) {
      console.error(`更新 ${item.symbol} 價格失敗:`, error)
      throw error
    }
  },

    // 清空監控清單
    clearAll() {
      this.items = []
      this.saveToLocalStorage()
    },

    // 保存到本地儲存
    saveToLocalStorage() {
      try {
        localStorage.setItem('watchlist', JSON.stringify(this.items))
      } catch (error) {
        console.error('保存到本地儲存失敗:', error)
      }
    },

    // 從本地儲存載入
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('watchlist')
        if (saved) {
          this.items = JSON.parse(saved)
        }
      } catch (error) {
        console.error('從本地儲存載入失敗:', error)
        this.items = []
      }
    },

    // 設定通知狀態
    setNotificationsEnabled(enabled) {
      this.notificationsEnabled = enabled
      localStorage.setItem('notificationsEnabled', enabled.toString())
    },

    // 載入通知狀態
    loadNotificationsState() {
      try {
        const saved = localStorage.getItem('notificationsEnabled')
        this.notificationsEnabled = saved === 'true'
      } catch (error) {
        console.error('載入通知狀態失敗:', error)
        this.notificationsEnabled = false
      }
    }
  }
})
