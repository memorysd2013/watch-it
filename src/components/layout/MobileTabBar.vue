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

const tabItems = computed(() => [
  {
    path: '/rates',
    label: '匯率',
    icon: TrendingUp
  },
  {
    path: '/add',
    label: '新增',
    icon: Plus
  },
  {
    path: '/watchlist',
    label: '清單',
    icon: List,
    badge: watchlistStore.getItemCount > 0 ? watchlistStore.getItemCount : null
  },
  {
    path: '/assets',
    label: '資產',
    icon: PieChart
  },
  {
    path: '/notifications',
    label: '推播',
    icon: Bell
  }
])

const isActive = (path) => route.path === path
</script>

<template>
  <nav class="tab-bar">
    <router-link
      v-for="item in tabItems"
      :key="item.path"
      :to="item.path"
      :class="['tab-item', { active: isActive(item.path) }]"
    >
      <div class="tab-icon-wrapper">
        <component
          :is="item.icon"
          :size="20"
          class="tab-icon"
        />
        <span
          v-if="item.badge"
          class="tab-badge number"
        >
          {{ item.badge > 9 ? '9+' : item.badge }}
        </span>
      </div>
      <span class="tab-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tab-bar {
  display: flex;
  /* Minimum 56px tap area + safe area */
  min-height: 56px;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--text-xs);
  transition: color var(--duration-fast) var(--ease);
  position: relative;
}

.tab-item.active {
  color: var(--accent);
}

.tab-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
}

.tab-icon-wrapper {
  position: relative;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  font-size: 10px;
  padding: 0 4px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--bg-page);
  border-radius: 8px;
  font-weight: var(--font-medium);
}

.tab-label {
  font-weight: var(--font-normal);
}

.tab-item.active .tab-label {
  font-weight: var(--font-medium);
}

/* Focus visible */
.tab-item:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}
</style>
