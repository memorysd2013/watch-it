<template>
  <div class="app-container">
    <!-- 應用程式標題列 -->
    <AppHeader
      :active-tab="activeTab"
      :notification-enabled="notificationEnabled"
      @toggle-side-menu="toggleSideMenu"
    />

    <!-- 側邊選單 -->
    <SideMenu
      :is-open="sideMenuOpen"
      :active-tab="activeTab"
      @close="closeSideMenu"
      @select-tab="selectTab"
    />

    <!-- 主要內容區域 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 新增監控項目 -->
        <SearchForm v-if="activeTab === 'add'" />

        <!-- 推播通知設定 -->
        <NotificationSettings v-if="activeTab === 'notifications'" />

        <!-- 匯率資訊 -->
        <ExchangeRateTab v-if="activeTab === 'exchange-rate'" />

        <!-- 監控清單 -->
        <Watchlist v-if="activeTab === 'watchlist'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useWatchlistStore } from '../stores/watchlist.js';
import AppHeader from './AppHeader.vue';
import SideMenu from './SideMenu.vue';
import SearchForm from './SearchForm.vue';
import NotificationSettings from './NotificationSettings.vue';
import ExchangeRateTab from './ExchangeRateTab.vue';
import Watchlist from './Watchlist.vue';

const watchlistStore = useWatchlistStore();

// 當前活躍的分頁
const activeTab = ref('add');

// 側邊選單狀態
const sideMenuOpen = ref(false);

// 通知狀態
const notificationEnabled = ref(false);

// 監聽監控項目數量變化，自動切換到監控清單
watch(
  () => watchlistStore.getItemCount,
  (newCount, oldCount) => {
    // 如果從 0 增加到 1 或更多，切換到監控清單
    if (oldCount === 0 && newCount > 0) {
      activeTab.value = 'watchlist';
    }
    // 如果從 1 或更多減少到 0，切換到新增監控項目
    else if (oldCount > 0 && newCount === 0) {
      activeTab.value = 'add';
    }
  }
);

// 側邊選單控制方法
const toggleSideMenu = () => {
  sideMenuOpen.value = !sideMenuOpen.value;
};

const closeSideMenu = () => {
  sideMenuOpen.value = false;
};

const selectTab = (tabId) => {
  activeTab.value = tabId;
};

// 初始化時設定預設分頁
onMounted(() => {
  // 預設顯示匯率分頁
  activeTab.value = 'exchange-rate';

  // 檢查通知權限狀態
  if ('Notification' in window) {
    notificationEnabled.value = Notification.permission === 'granted';
  }
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #1a1a2e;
}

.main-content {
  padding: 0;
  min-height: calc(100vh - 60px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .main-content {
    min-height: calc(100vh - 56px);
  }
}

@media (max-width: 480px) {
  .main-content {
    min-height: calc(100vh - 52px);
  }
}
</style>
