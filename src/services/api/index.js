import twseAPI from './twse.js'
import cryptoAPI from './crypto.js'
import exchangeRateAPI from './exchange-rate.js'
import cacheManager from './cache.js'

export const getPrice = async (symbol, type) => {
  switch (type) {
    case 'twse':
      return await twseAPI.getStockPrice(symbol)
    case 'crypto':
      return await cryptoAPI.getCryptoPrice(symbol)
    case 'exchange_rate': {
      const [fromCurrency, toCurrency] = symbol.split('/')
      if (fromCurrency && toCurrency) {
        return await exchangeRateAPI.getExchangeRate(fromCurrency, toCurrency)
      }
      if (symbol === 'USD/TWD') {
        return await exchangeRateAPI.getUSDTWDRate()
      } else if (symbol === 'TWD/USD') {
        return await exchangeRateAPI.getTWDUSDRate()
      }
      throw new Error('不支援的匯率對')
    }
    default:
      throw new Error('不支援的類型')
  }
}

export const notificationAPI = {
  async subscribe(subscription) {
    // Placeholder for notification subscription
    return { success: true }
  },

  async unsubscribe(subscription) {
    // Placeholder for notification unsubscription
    return { success: true }
  }
}

export {
  twseAPI,
  cryptoAPI,
  exchangeRateAPI,
  cacheManager
}

export default {
  twseAPI,
  cryptoAPI,
  exchangeRateAPI,
  getPrice,
  notificationAPI,
  cacheManager
}
