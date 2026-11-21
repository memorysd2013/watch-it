// Memory cache
const memoryCache = new Map()

export const cacheManager = {
  generateKey(prefix, params) {
    return `${prefix}_${JSON.stringify(params)}`
  },

  isCacheExpired(timestamp) {
    if (!timestamp) return true
    
    const cachedDate = new Date(timestamp)
    const currentDate = new Date()
    
    return (
      cachedDate.getFullYear() !== currentDate.getFullYear() ||
      cachedDate.getMonth() !== currentDate.getMonth() ||
      cachedDate.getDate() !== currentDate.getDate()
    )
  },

  getFromMemory(key) {
    return memoryCache.get(key)
  },

  setToMemory(key, data) {
    memoryCache.set(key, {
      data,
      timestamp: new Date().toISOString()
    })
  },

  getFromLocalStorage(key) {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null
      
      const parsed = JSON.parse(cached)
      
      if (this.isCacheExpired(parsed.timestamp)) {
        localStorage.removeItem(key)
        return null
      }
      
      return parsed
    } catch (error) {
      console.error('從 LocalStorage 讀取快取失敗:', error)
      return null
    }
  },

  setToLocalStorage(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.error('儲存到 LocalStorage 失敗:', error)
      if (error.name === 'QuotaExceededError') {
        this.clearOldCache()
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

  get(key) {
    const memoryData = this.getFromMemory(key)
    if (memoryData && !this.isCacheExpired(memoryData.timestamp)) {
      return memoryData.data
    }

    const localData = this.getFromLocalStorage(key)
    if (localData) {
      this.setToMemory(key, localData.data)
      return localData.data
    }

    return null
  },

  set(key, data) {
    this.setToMemory(key, data)
    this.setToLocalStorage(key, data)
  },

  clearOldCache() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i))
    }
    
    keys.forEach(key => {
      if (key && (key.includes('_rate') || key.includes('price') || key.includes('crypto'))) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const parsed = JSON.parse(item)
            if (this.isCacheExpired(parsed.timestamp)) {
              localStorage.removeItem(key)
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    })
  }
}

export default cacheManager
