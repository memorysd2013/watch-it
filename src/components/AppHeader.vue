<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左側：選單按鈕和標題 -->
      <div class="header-left">
        <button
          @click="toggleSideMenu"
          class="menu-toggle-btn"
          aria-label="開啟選單"
        >
          <span class="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div class="header-title">
          <h1>Watch It</h1>
          <span class="current-page">{{ currentPageTitle }}</span>
        </div>
      </div>

      <!-- 右側：狀態指示器 -->
      <div class="header-right">
        <div class="status-indicators">
          <!-- 監控項目數量 -->
          <div
            v-if="watchlistCount > 0"
            class="status-item"
            title="監控項目數量"
          >
            <span class="status-icon">📊</span>
            <span class="status-text">{{ watchlistCount }}</span>
          </div>

          <!-- 通知狀態 -->
          <div
            v-if="notificationEnabled"
            class="status-item"
            title="通知已啟用"
          >
            <span class="status-icon">🔔</span>
          </div>

          <!-- 匯率更新狀態 -->
          <div
            v-if="isExchangeRateActive"
            class="status-item"
            title="匯率即時更新"
          >
            <span class="status-icon">💱</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useWatchlistStore } from '../stores/watchlist.js';

const watchlistStore = useWatchlistStore();

// Props
const props = defineProps({
  activeTab: {
    type: String,
    default: 'add',
  },
  notificationEnabled: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['toggle-side-menu']);

// 計算屬性
const watchlistCount = computed(() => watchlistStore.getItemCount);

const isExchangeRateActive = computed(
  () => props.activeTab === 'exchange-rate'
);

const currentPageTitle = computed(() => {
  const titles = {
    add: '新增監控項目',
    notifications: '推播通知設定',
    'exchange-rate': '匯率資訊',
    watchlist: '監控清單',
  };
  return titles[props.activeTab] || 'Watch It';
});

// 切換側邊選單
const toggleSideMenu = () => {
  emit('toggle-side-menu');
};
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 17, 36, 0.95);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-md), 0 1px 0 var(--border-glow);
  backdrop-filter: blur(20px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 選單切換按鈕 */
.menu-toggle-btn {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid var(--accent-cyan);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle-btn:hover {
  background: rgba(0, 217, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
  transform: scale(1.05);
}

.menu-toggle-btn:active {
  transform: scale(0.95);
}

/* 漢堡選單圖標 */
.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 20px;
  height: 16px;
}

.hamburger-icon span {
  width: 100%;
  height: 2px;
  background: var(--accent-cyan);
  border-radius: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 0 5px rgba(0, 217, 255, 0.3);
}

.menu-toggle-btn:hover .hamburger-icon span {
  background: var(--text-bright);
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.6);
}

/* 標題區域 */
.header-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title h1 {
  margin: 0;
  color: var(--text-bright);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.current-page {
  color: var(--accent-cyan);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 右側狀態指示器 */
.header-right {
  display: flex;
  align-items: center;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid var(--accent-cyan);
  border-radius: 16px;
  padding: 6px 10px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.status-item:hover {
  background: rgba(0, 217, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
  transform: translateY(-1px);
}

.status-icon {
  font-size: 14px;
}

.status-text {
  color: var(--accent-cyan);
  font-size: 12px;
  font-weight: 700;
  min-width: 16px;
  text-align: center;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    padding: 10px 16px;
  }

  .header-left {
    gap: 12px;
  }

  .header-title h1 {
    font-size: 18px;
  }

  .current-page {
    font-size: 11px;
  }

  .status-indicators {
    gap: 8px;
  }

  .status-item {
    padding: 4px 8px;
  }

  .status-icon {
    font-size: 12px;
  }

  .status-text {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 8px 12px;
  }

  .header-left {
    gap: 8px;
  }

  .header-title h1 {
    font-size: 16px;
  }

  .current-page {
    font-size: 10px;
  }

  .menu-toggle-btn {
    padding: 6px;
  }

  .hamburger-icon {
    width: 16px;
    height: 14px;
  }

  .hamburger-icon span {
    height: 1.5px;
  }

  .status-indicators {
    gap: 6px;
  }

  .status-item {
    padding: 3px 6px;
  }
}

/* 動畫效果 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.status-item:hover .status-icon {
  animation: pulse 1.5s infinite;
}
</style>
