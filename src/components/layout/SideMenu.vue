<template>
  <div>
    <!-- 側邊選單遮罩 -->
    <div
      v-if="isOpen"
      class="side-menu-overlay"
      @click="closeMenu"
    ></div>

    <!-- 側邊選單 -->
    <div :class="['side-menu', { 'side-menu-open': isOpen }]">
      <div class="side-menu-header">
        <h3>功能選單</h3>
        <button
          @click="closeMenu"
          class="close-btn"
          aria-label="關閉選單"
        >
          ✕
        </button>
      </div>

      <nav class="side-menu-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectTab(tab.id)"
          :class="['menu-item', { active: activeTab === tab.id }]"
        >
          <span class="menu-icon">{{ tab.icon }}</span>
          <span class="menu-label">{{ tab.label }}</span>
          <span
            v-if="tab.badge && tab.badge > 0"
            class="menu-badge"
          >
            {{ tab.badge }}
          </span>
        </button>
      </nav>

      <div class="side-menu-footer">
        <div class="app-info">
          <p>Watch It</p>
          <small>價格監控工具</small>
          <div class="version-info">
            <span class="version-label">版本</span>
            <span class="version-number">{{ appVersion }}</span>
            <span
              v-if="hasUpdate"
              class="update-badge"
              >有更新</span
            >
          </div>
          <div
            v-if="hasUpdate"
            class="update-info"
          >
            <button
              @click="checkForUpdate"
              class="update-btn"
            >
              🔄 檢查更新
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useWatchlistStore } from '../../stores/watchlist.js';

const watchlistStore = useWatchlistStore();

// 版本相關狀態
const appVersion = ref(
  import.meta.env.VITE_APP_VERSION ||
    window.__ENV__?.VITE_APP_VERSION ||
    '1.1.0'
);
const hasUpdate = ref(false);
const lastCheckTime = ref(null);

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  activeTab: {
    type: String,
    default: 'add',
  },
});

// Emits
const emit = defineEmits(['close', 'select-tab']);

// 分頁配置
const tabs = computed(() => [
  {
    id: 'add',
    label: '新增監控項目',
    icon: '➕',
    badge: null,
  },
  {
    id: 'notifications',
    label: '推播通知設定',
    icon: '🔔',
    badge: null,
  },
  {
    id: 'exchange-rate',
    label: '匯率資訊',
    icon: '💱',
    badge: null,
  },
  {
    id: 'watchlist',
    label: '監控清單',
    icon: '📊',
    badge: watchlistStore.getItemCount > 0 ? watchlistStore.getItemCount : null,
  },
  {
    id: 'asset-allocation',
    label: '資產配置',
    icon: '📈',
    badge: null,
  },
]);

// 關閉選單
const closeMenu = () => {
  emit('close');
};

// 選擇標籤
const selectTab = (tabId) => {
  emit('select-tab', tabId);
  closeMenu();
};

// 檢查更新
const checkForUpdate = async () => {
  try {
    console.log('🔄 檢查應用程式更新...');

    // 模擬檢查更新（實際應用中可以從 API 獲取最新版本）
    const currentVersion = appVersion.value;
    const latestVersion = '1.1.0'; // 這裡可以從 API 獲取

    // 比較版本號
    const isNewer = compareVersions(latestVersion, currentVersion) > 0;

    if (isNewer) {
      hasUpdate.value = true;
      console.log(`📱 發現新版本: ${latestVersion} (當前: ${currentVersion})`);

      // 顯示更新提示
      if (
        confirm(`發現新版本 ${latestVersion}，是否重新載入頁面以獲取更新？`)
      ) {
        window.location.reload();
      }
    } else {
      hasUpdate.value = false;
      console.log('✅ 已是最新版本');
      alert('已是最新版本！');
    }

    // 記錄檢查時間
    lastCheckTime.value = new Date().toISOString();
    localStorage.setItem('lastUpdateCheck', lastCheckTime.value);
  } catch (error) {
    console.error('❌ 檢查更新失敗:', error);
    alert('檢查更新失敗，請稍後再試');
  }
};

// 版本號比較函數
const compareVersions = (version1, version2) => {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;

    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }

  return 0;
};

// 初始化版本檢查
const initializeVersionCheck = () => {
  // 從 localStorage 獲取上次檢查時間
  const lastCheck = localStorage.getItem('lastUpdateCheck');
  if (lastCheck) {
    lastCheckTime.value = lastCheck;

    // 如果超過 24 小時未檢查，自動檢查更新
    const hoursSinceLastCheck =
      (Date.now() - new Date(lastCheck).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastCheck > 24) {
      checkForUpdate();
    }
  } else {
    // 首次使用，檢查更新
    checkForUpdate();
  }
};

// 組件掛載時初始化
onMounted(() => {
  initializeVersionCheck();
});
</script>

<style scoped>
/* 遮罩層 */
.side-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 998;
  backdrop-filter: blur(4px);
}

/* 側邊選單 */
.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(
    180deg,
    var(--bg-secondary) 0%,
    var(--bg-primary) 100%
  );
  border-right: 1px solid var(--border-glow);
  z-index: 999;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 217, 255, 0.1);
}

.side-menu-open {
  transform: translateX(0);
}

/* 選單標題 */
.side-menu-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 217, 255, 0.05);
  position: relative;
}

.side-menu-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-cyan),
    transparent
  );
  opacity: 0.3;
}

.side-menu-header h3 {
  margin: 0;
  color: var(--text-bright);
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 71, 87, 0.2);
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.4);
  transform: scale(1.1);
}

/* 選單導航 */
.side-menu-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
}

.menu-item:hover {
  background: rgba(0, 217, 255, 0.1);
  color: var(--accent-cyan);
}

.menu-item.active {
  background: rgba(0, 217, 255, 0.15);
  color: var(--accent-cyan);
  border-right: 3px solid var(--accent-cyan);
  box-shadow: inset 0 0 20px rgba(0, 217, 255, 0.1);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent-cyan), var(--accent-blue));
  box-shadow: 0 0 10px var(--accent-cyan);
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 15px;
}

.menu-badge {
  background: var(--gradient-danger);
  color: var(--text-bright);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
  border: 1px solid var(--danger);
  box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}

/* 選單底部 */
.side-menu-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.3);
  position: relative;
}

.side-menu-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-cyan),
    transparent
  );
  opacity: 0.3;
}

.app-info {
  text-align: center;
}

.app-info p {
  margin: 0 0 4px 0;
  color: var(--text-bright);
  font-size: 16px;
  font-weight: 700;
}

.app-info small {
  color: var(--text-secondary);
  font-size: 12px;
}

/* 版本資訊 */
.version-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 12px;
  font-size: 11px;
}

.version-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.version-number {
  color: var(--accent-cyan);
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.update-badge {
  background: var(--gradient-danger);
  color: var(--text-bright);
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid var(--danger);
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 更新資訊 */
.update-info {
  margin-top: 8px;
  text-align: center;
}

.update-btn {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: var(--text-bright);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 217, 255, 0.3);
}

.update-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.5);
}

.update-btn:active {
  transform: translateY(0);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .side-menu {
    width: 100%;
    max-width: 320px;
  }

  .side-menu-header {
    padding: 16px 20px;
  }

  .side-menu-header h3 {
    font-size: 16px;
  }

  .menu-item {
    padding: 14px 20px;
    font-size: 14px;
  }

  .menu-icon {
    font-size: 16px;
    width: 20px;
  }

  .menu-label {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .side-menu {
    width: 100%;
  }

  .side-menu-header {
    padding: 12px 16px;
  }

  .menu-item {
    padding: 12px 16px;
    font-size: 13px;
  }

  .menu-icon {
    font-size: 14px;
    width: 18px;
  }

  .menu-label {
    font-size: 13px;
  }
}
</style>
