<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useWatchlistStore } from './stores/watchlist.js'
import { useAssetAllocationStore } from './stores/assetAllocation.js'
import { useExchangeRateStore } from './stores/exchangeRate.js'
import notificationService from './services/notification.js'
import AppNav from './components/layout/AppNav.vue'
import MobileTabBar from './components/layout/MobileTabBar.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { usePWA } from './composables/usePWA.js'

const watchlistStore = useWatchlistStore()
const assetAllocationStore = useAssetAllocationStore()
const exchangeRateStore = useExchangeRateStore()

usePWA()

const isDesktop = ref(window.innerWidth > 768)

const updateLayout = () => {
  isDesktop.value = window.innerWidth > 768
}

onMounted(async () => {
  watchlistStore.loadFromLocalStorage()
  assetAllocationStore.loadFromLocalStorage()
  exchangeRateStore.loadFromLocalStorage()
  watchlistStore.loadNotificationsState()
  await notificationService.initialize()
  
  window.addEventListener('resize', updateLayout)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout)
})
</script>

<template>
  <div class="app-layout">
    <AppNav v-if="isDesktop" class="app-nav" />
    
    <main class="app-main">
      <div class="content-container">
        <router-view />
      </div>
    </main>

    <MobileTabBar v-if="!isDesktop" class="mobile-tab-bar" />
    <ToastContainer />
  </div>
</template>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
}

/* Desktop: fixed left nav */
@media (min-width: 769px) {
  .app-nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--sidebar-width);
    background: var(--bg-deepest);
    border-right: 1px solid var(--border-hairline);
    z-index: 100;
  }

  .app-main {
    flex: 1;
    margin-left: var(--sidebar-width);
    padding: var(--space-6);
  }
}

/* Mobile: bottom tab bar */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .app-main {
    flex: 1;
    padding: var(--space-4);
    padding-bottom: calc(var(--space-16) + var(--space-4));
  }

  .mobile-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-deepest);
    border-top: 1px solid var(--border-hairline);
    z-index: 100;
  }
}

.content-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
}
</style>
