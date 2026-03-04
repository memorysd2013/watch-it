import { defineStore } from 'pinia';

const STORAGE_KEY = 'watchit_asset_allocation';

function parseTargetPercent(val) {
  if (val == null || val === '') return undefined;
  const n = Number(val);
  return !isNaN(n) && n >= 0 && n <= 100 ? n : undefined;
}

export const useAssetAllocationStore = defineStore('assetAllocation', {
  state: () => ({
    assetItems: [],
  }),

  getters: {
    getAllAssetItems: (state) => state.assetItems,

    totalAmount: (state) => {
      return state.assetItems.reduce((sum, item) => {
        const itemTotal = item.subItems?.reduce((s, sub) => s + (sub.amount || 0), 0) || 0;
        return sum + itemTotal;
      }, 0);
    },

    getAssetItemTotal: () => (assetItem) => {
      return assetItem.subItems?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
    },

    getSubItemPercent: () => (subItem, assetItemTotal) => {
      if (!assetItemTotal || assetItemTotal <= 0) return 0;
      return ((subItem.amount || 0) / assetItemTotal) * 100;
    },

    getAssetItemPercent: (state) => (assetItem) => {
      const total = state.assetItems.reduce((sum, item) => {
        const itemTotal = item.subItems?.reduce((s, sub) => s + (sub.amount || 0), 0) || 0;
        return sum + itemTotal;
      }, 0);
      if (!total || total <= 0) return 0;
      const itemTotal = assetItem.subItems?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
      return (itemTotal / total) * 100;
    },
  },

  actions: {
    addAssetItem(name, targetPercent) {
      const newItem = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        name: name?.trim() || '未命名資產',
        subItems: [],
        targetPercent: parseTargetPercent(targetPercent),
      };
      this.assetItems.push(newItem);
      this.saveToLocalStorage();
      return newItem;
    },

    updateAssetItem(id, name, targetPercent) {
      const item = this.assetItems.find((i) => i.id === id);
      if (item) {
        item.name = name?.trim() || item.name;
        item.targetPercent = parseTargetPercent(targetPercent);
        this.saveToLocalStorage();
      }
    },

    removeAssetItem(id) {
      this.assetItems = this.assetItems.filter((i) => i.id !== id);
      this.saveToLocalStorage();
    },

    addSubItem(assetItemId, name, amount, targetPercent) {
      const assetItem = this.assetItems.find((i) => i.id === assetItemId);
      if (!assetItem) return null;
      if (!assetItem.subItems) assetItem.subItems = [];

      const newSubItem = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        name: name?.trim() || '未命名',
        amount: Number(amount) || 0,
        targetPercent: parseTargetPercent(targetPercent),
      };
      assetItem.subItems.push(newSubItem);
      this.saveToLocalStorage();
      return newSubItem;
    },

    updateSubItem(assetItemId, subItemId, name, amount, targetPercent) {
      const assetItem = this.assetItems.find((i) => i.id === assetItemId);
      if (!assetItem?.subItems) return;

      const subItem = assetItem.subItems.find((s) => s.id === subItemId);
      if (subItem) {
        subItem.name = name?.trim() ?? subItem.name;
        subItem.amount = Number(amount) ?? subItem.amount;
        subItem.targetPercent = parseTargetPercent(targetPercent);
        this.saveToLocalStorage();
      }
    },

    removeSubItem(assetItemId, subItemId) {
      const assetItem = this.assetItems.find((i) => i.id === assetItemId);
      if (!assetItem?.subItems) return;

      assetItem.subItems = assetItem.subItems.filter((s) => s.id !== subItemId);
      this.saveToLocalStorage();
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assetItems));
      } catch (error) {
        console.error('保存資產配置失敗:', error);
      }
    },

    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.assetItems = JSON.parse(saved);
        }
      } catch (error) {
        console.error('載入資產配置失敗:', error);
        this.assetItems = [];
      }
    },
  },
});
