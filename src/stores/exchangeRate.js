import { defineStore } from 'pinia';
import { exchangeRateAPI } from '../services/api.js';

const STORAGE_KEY = 'watchit_usd_twd_rate';

export const useExchangeRateStore = defineStore('exchangeRate', {
  state: () => ({
    usdTwdRate: null,
    lastUpdated: null,
  }),

  getters: {
    rate: (state) => state.usdTwdRate,
    lastUpdatedAt: (state) => state.lastUpdated,
    hasRate: (state) => state.usdTwdRate != null && !isNaN(state.usdTwdRate),
  },

  actions: {
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
        }
      } catch (error) {
        console.error('載入匯率快取失敗:', error);
      }
    },
  },
});
