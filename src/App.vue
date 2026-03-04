<script setup>
import { onMounted } from 'vue';
import TabsContainer from './components/layout/TabsContainer.vue';
import { useWatchlistStore } from './stores/watchlist.js';
import { useAssetAllocationStore } from './stores/assetAllocation.js';
import notificationService from './services/notification.js';

const watchlistStore = useWatchlistStore();
const assetAllocationStore = useAssetAllocationStore();

onMounted(async () => {
  // 載入本地儲存的資料
  watchlistStore.loadFromLocalStorage();
  assetAllocationStore.loadFromLocalStorage();
  watchlistStore.loadNotificationsState();

  // 初始化通知服務
  await notificationService.initialize();
});
</script>

<template>
  <div class="app">
    <main class="app-main">
      <div class="container">
        <!-- 分頁容器 -->
        <TabsContainer />
      </div>
    </main>

    <footer class="app-footer">
      <div class="footer-content"></div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--gradient-bg);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.logo-section {
  text-align: left;
}

.app-title {
  margin: 0 0 4px 0;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(
    135deg,
    var(--accent-cyan),
    var(--accent-blue),
    var(--accent-purple)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.3));
}

.app-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
}

.header-stats {
  display: flex;
  align-items: center;
}

.stat {
  background: var(--gradient-success);
  color: var(--bg-primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  box-shadow:
    var(--shadow-sm),
    0 0 15px rgba(0, 255, 136, 0.3);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.app-main {
  flex: 1;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-footer {
  background: rgba(10, 14, 30, 0.95);
  color: var(--text-secondary);
  padding: 30px 0;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -1px 0 var(--border-glow);
  position: relative;
}

.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--accent-cyan) 50%,
    transparent 100%
  );
  opacity: 0.2;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: var(--accent-cyan);
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

@media (max-width: 768px) {
  .app-title {
    font-size: 24px;
  }

  .app-subtitle {
    font-size: 14px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .logo-section {
    text-align: center;
  }

  .app-main {
    padding: 20px 0;
  }

  .container {
    padding: 0 12px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>
