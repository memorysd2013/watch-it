<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWatchlistStore } from '../../stores/watchlist.js'
import {
  TrendingUp,
  Plus,
  List,
  PieChart,
  Bell
} from 'lucide-vue-next'

const route = useRoute()
const watchlistStore = useWatchlistStore()

const navItems = computed(() => [
  {
    path: '/rates',
    label: '匯率資訊',
    icon: TrendingUp
  },
  {
    path: '/add',
    label: '新增監控',
    icon: Plus
  },
  {
    path: '/watchlist',
    label: '監控清單',
    icon: List,
    badge: watchlistStore.getItemCount > 0 ? watchlistStore.getItemCount : null
  },
  {
    path: '/assets',
    label: '資產配置',
    icon: PieChart
  },
  {
    path: '/notifications',
    label: '推播設定',
    icon: Bell
  }
])

const isActive = (path) => route.path === path
</script>

<template>
  <nav class="nav-sidebar">
    <div class="nav-header">
      <h1 class="app-title">Watch It</h1>
      <p class="app-subtitle">價格監控工具</p>
    </div>

    <div class="nav-items">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="['nav-item', { active: isActive(item.path) }]"
      >
        <component
          :is="item.icon"
          :size="18"
          class="nav-icon"
        />
        <span class="nav-label">{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="nav-badge number"
        >
          {{ item.badge }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.nav-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.nav-header {
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid var(--border-hairline);
}

.app-title {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}

.app-subtitle {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 0;
}

.nav-items {
  flex: 1;
  padding: var(--space-2) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-5);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  transition: all var(--duration-fast) var(--ease);
  border-left: 2px solid transparent;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  color: var(--accent);
  background: rgba(245, 165, 36, 0.08);
  border-left-color: var(--accent);
}

.nav-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: var(--text-xs);
  padding: 2px var(--space-2);
  background: var(--bg-raised);
  border: 1px solid var(--border-hairline);
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.nav-item.active .nav-badge {
  background: var(--accent);
  color: var(--bg-page);
  border-color: var(--accent);
}

/* Focus visible */
.nav-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
</style>
