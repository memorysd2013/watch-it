// 支援的貨幣配置
export const SUPPORTED_CURRENCIES = {
  USD: {
    code: 'USD',
    name: '美金',
    symbol: '$',
    flag: '🇺🇸',
    description: '美國美元'
  },
  TWD: {
    code: 'TWD',
    name: '台幣',
    symbol: 'NT$',
    flag: '🇹🇼',
    description: '新台幣'
  },
  EUR: {
    code: 'EUR',
    name: '歐元',
    symbol: '€',
    flag: '🇪🇺',
    description: '歐元'
  },
  JPY: {
    code: 'JPY',
    name: '日圓',
    symbol: '¥',
    flag: '🇯🇵',
    description: '日本日圓'
  },
  GBP: {
    code: 'GBP',
    name: '英鎊',
    symbol: '£',
    flag: '🇬🇧',
    description: '英國英鎊'
  },
  AUD: {
    code: 'AUD',
    name: '澳幣',
    symbol: 'A$',
    flag: '🇦🇺',
    description: '澳洲澳幣'
  },
  CAD: {
    code: 'CAD',
    name: '加幣',
    symbol: 'C$',
    flag: '🇨🇦',
    description: '加拿大加幣'
  },
  CHF: {
    code: 'CHF',
    name: '瑞士法郎',
    symbol: 'CHF',
    flag: '🇨🇭',
    description: '瑞士法郎'
  },
  CNY: {
    code: 'CNY',
    name: '人民幣',
    symbol: '¥',
    flag: '🇨🇳',
    description: '中國人民幣'
  },
  KRW: {
    code: 'KRW',
    name: '韓圓',
    symbol: '₩',
    flag: '🇰🇷',
    description: '韓國韓圓'
  }
}

// 預設的匯率對
export const DEFAULT_CURRENCY_PAIRS = [
  { from: 'USD', to: 'TWD', name: '美金/台幣', description: '美金對台幣匯率' },
  { from: 'TWD', to: 'USD', name: '台幣/美金', description: '台幣對美金匯率' },
  { from: 'USD', to: 'EUR', name: '美金/歐元', description: '美金對歐元匯率' },
  { from: 'USD', to: 'JPY', name: '美金/日圓', description: '美金對日圓匯率' },
  { from: 'EUR', to: 'TWD', name: '歐元/台幣', description: '歐元對台幣匯率' },
  { from: 'JPY', to: 'TWD', name: '日圓/台幣', description: '日圓對台幣匯率' }
]

// 時間週期配置
export const TIME_PERIODS = [
  { value: '1W', label: '1週', days: 7 },
  { value: '1M', label: '1月', days: 30 },
  { value: '3M', label: '1季', days: 90 },
  { value: '6M', label: '半年', days: 180 },
  { value: '1Y', label: '1年', days: 365 }
]

// 獲取貨幣資訊
export const getCurrencyInfo = (currencyCode) => {
  return SUPPORTED_CURRENCIES[currencyCode] || {
    code: currencyCode,
    name: currencyCode,
    symbol: currencyCode,
    flag: '🌍',
    description: `${currencyCode} 貨幣`
  }
}

// 獲取匯率對資訊
export const getCurrencyPairInfo = (fromCurrency, toCurrency) => {
  const fromInfo = getCurrencyInfo(fromCurrency)
  const toInfo = getCurrencyInfo(toCurrency)
  
  return {
    from: fromInfo,
    to: toInfo,
    pair: `${fromCurrency}/${toCurrency}`,
    name: `${fromInfo.name}/${toInfo.name}`,
    description: `${fromInfo.name}對${toInfo.name}匯率`
  }
}

// 檢查是否支援該貨幣
export const isSupportedCurrency = (currencyCode) => {
  return currencyCode in SUPPORTED_CURRENCIES
}

// 獲取所有支援的貨幣代碼
export const getSupportedCurrencyCodes = () => {
  return Object.keys(SUPPORTED_CURRENCIES)
}

// 獲取所有支援的貨幣列表
export const getSupportedCurrencies = () => {
  return Object.values(SUPPORTED_CURRENCIES)
}

// 格式化貨幣顯示
export const formatCurrencyDisplay = (currencyCode, amount, options = {}) => {
  const currencyInfo = getCurrencyInfo(currencyCode)
  const { showSymbol = true, showFlag = false, decimals = 4 } = options
  
  let display = ''
  
  if (showFlag) {
    display += `${currencyInfo.flag} `
  }
  
  if (showSymbol) {
    display += `${currencyInfo.symbol}`
  }
  
  if (amount !== undefined && amount !== null) {
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    display += formattedAmount
  }
  
  return display
}

// 獲取時間週期資訊
export const getTimePeriodInfo = (periodValue) => {
  return TIME_PERIODS.find(period => period.value === periodValue) || TIME_PERIODS[1] // 預設1月
}

export default {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY_PAIRS,
  TIME_PERIODS,
  getCurrencyInfo,
  getCurrencyPairInfo,
  isSupportedCurrency,
  getSupportedCurrencyCodes,
  getSupportedCurrencies,
  formatCurrencyDisplay,
  getTimePeriodInfo
}
