<template>
  <div class="watchlist">
    <div class="watchlist-header">
      <h2>監控清單</h2>
      <div class="header-actions">
        <button
          @click="refreshAll"
          :disabled="loading"
          class="refresh-all-btn"
        >
          <span
            v-if="loading"
            class="loading-spinner"
          ></span>
          {{ loading ? '更新中...' : '全部更新' }}
        </button>
        <button
          v-if="watchlistItems.length > 0"
          @click="clearAll"
          class="clear-all-btn"
        >
          清空清單
        </button>
      </div>
    </div>

    <div
      v-if="watchlistItems.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">📊</div>
      <h3>還沒有監控項目</h3>
      <p>使用上方的搜尋功能新增台股、美股或加密貨幣到監控清單</p>
    </div>

    <div
      v-else
      class="watchlist-content"
    >
      <!-- 統計資訊 -->
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">總計</span>
          <span class="stat-value">{{ watchlistItems.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">台股</span>
          <span class="stat-value">{{ getItemsByType('twse').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">美股</span>
          <span class="stat-value">{{ getItemsByType('us').length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">加密貨幣</span>
          <span class="stat-value">{{ getItemsByType('crypto').length }}</span>
        </div>
      </div>

      <!-- 篩選器 -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 價格卡片列表 -->
      <div class="price-cards">
        <PriceCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
        />
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useWatchlistStore } from '../../stores/watchlist.js';
import PriceCard from './PriceCard.vue';

const watchlistStore = useWatchlistStore();

// 狀態
const loading = ref(false);
const error = ref('');
const activeFilter = ref('all');

// 篩選器選項
const filters = [
  { value: 'all', label: '全部' },
  { value: 'twse', label: '台股' },
  { value: 'us', label: '美股' },
  { value: 'crypto', label: '加密貨幣' },
];

// 計算屬性
const watchlistItems = computed(() => watchlistStore.getAllItems);

const getItemsByType = (type) => {
  return watchlistStore.getItemsByType(type);
};

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') {
    return watchlistItems.value;
  }
  return getItemsByType(activeFilter.value);
});

// 方法
const refreshAll = async () => {
  loading.value = true;
  error.value = '';

  try {
    await watchlistStore.updateAllPrices();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const clearAll = () => {
  if (confirm('確定要清空所有監控項目嗎？此操作無法復原。')) {
    watchlistStore.clearAll();
  }
};

// 生命週期
onMounted(() => {
  // 載入本地儲存的資料
  watchlistStore.loadFromLocalStorage();

  // 自動更新價格 (每5分鐘)
  setInterval(() => {
    if (watchlistItems.value.length > 0 && !loading.value) {
      refreshAll();
    }
  }, 5 * 60 * 1000);
});
</script>

<style scoped>
.watchlist {
  padding: 24px;
}

.watchlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.watchlist-header h2 {
  margin: 0;
  color: var(--text-bright);
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-all-btn,
.clear-all-btn {
  padding: 10px 16px;
  border: 1px solid;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.refresh-all-btn {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: var(--bg-primary);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
}

.refresh-all-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 217, 255, 0.5);
}

.refresh-all-btn:disabled {
  background: var(--bg-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.5;
}

.clear-all-btn {
  background: rgba(255, 71, 87, 0.15);
  color: var(--danger);
  border-color: var(--danger);
}

.clear-all-btn:hover {
  background: rgba(255, 71, 87, 0.25);
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.4);
  transform: translateY(-2px);
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.3));
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--text-bright);
  font-size: 20px;
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.watchlist-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-cyan);
  text-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: rgba(25, 32, 56, 0.5);
  color: var(--text-secondary);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.filter-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  border-color: var(--accent-cyan);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
  font-weight: 700;
}

.price-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.error-message {
  background: rgba(255, 71, 87, 0.15);
  color: var(--danger);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--danger);
  border-left: 4px solid var(--danger);
  margin-top: 16px;
  font-size: 14px;
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.2);
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .watchlist {
    padding: 0 12px;
  }

  .watchlist-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .price-cards {
    grid-template-columns: 1fr;
  }

  .filters {
    justify-content: center;
  }
}
</style>
