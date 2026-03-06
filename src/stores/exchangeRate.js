import { defineStore } from 'pinia';
import { exchangeRateAPI } from '../services/api.js';

const STORAGE_KEY = 'watchit_usd_twd_rate';
const DEFAULT_USD_TWD_RATE = 31.5;

export const useExchangeRateStore = defineStore('exchangeRate', {
  state: () => ({
    usdTwdRate: null,
    lastUpdated: null,
    defaultUsdTwdRate: DEFAULT_USD_TWD_RATE,
  }),

  getters: {
    rate: (state) => state.usdTwdRate,
    lastUpdatedAt: (state) => state.lastUpdated,
    hasRate: (state) => state.usdTwdRate != null && !isNaN(state.usdTwdRate),
    /** 匯率為 null 時使用預設值，供資產配置 USD 轉換 */
    effectiveRate: (state) => {
      if (state.usdTwdRate != null && !isNaN(state.usdTwdRate)) return state.usdTwdRate;
      const def = state.defaultUsdTwdRate;
      return def != null && !isNaN(def) ? def : DEFAULT_USD_TWD_RATE;
    },
    /** 是否使用 API 匯率（false 表示使用預設匯率） */
    isUsingApiRate: (state) => state.usdTwdRate != null && !isNaN(state.usdTwdRate),
  },

  actions: {
    setDefaultRate(rate) {
      const n = Number(rate);
      if (!isNaN(n) && n > 0) {
        this.defaultUsdTwdRate = n;
        this.saveToLocalStorage();
      }
    },
    setRate(rate, lastUpdated) {
      this.usdTwdRate = rate;
      this.lastUpdated = lastUpdated || new Date().toISOString();
      this.saveToLocalStorage();
    },

    async fetchUsdTwdRate() {
      const rateData = await exchangeRateAPI.getUSDTWDRate();
      const rate = rateData?.rate;
      const lastUpdated = new Date().toISOString();

      if (rate != null && !isNaN(rate)) {
        this.usdTwdRate = rate;
        this.lastUpdated = lastUpdated;
        this.saveToLocalStorage();
      }

      return { rate: this.usdTwdRate, lastUpdated: this.lastUpdated };
    },

    saveToLocalStorage() {
      try {
        const data = {
          usdTwdRate: this.usdTwdRate,
          lastUpdated: this.lastUpdated,
          defaultUsdTwdRate: this.defaultUsdTwdRate,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('保存匯率快取失敗:', error);
      }
    },

    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          this.usdTwdRate = data.usdTwdRate ?? null;
          this.lastUpdated = data.lastUpdated ?? null;
          const def = data.defaultUsdTwdRate;
          this.defaultUsdTwdRate =
            def != null && !isNaN(Number(def)) && Number(def) > 0 ? Number(def) : DEFAULT_USD_TWD_RATE;
        }
      } catch (error) {
        console.error('載入匯率快取失敗:', error);
      }
    },
  },
});
