<script setup>
import { ref, computed } from 'vue'
import { useWatchlistStore } from '../../stores/watchlist.js'
import { useToast } from '../../composables/useToast.js'
import { RefreshCw, Trash2, TrendingUp, TrendingDown } from 'lucide-vue-next'

const watchlistStore = useWatchlistStore()
const { success, error: errorToast } = useToast()

const loading = ref(false)
const sortBy = ref('symbol')
const sortOrder = ref('asc')
const activeFilter = ref('all')

const watchlistItems = computed(() => watchlistStore.getAllItems)

const filters = [
  { value: 'all', label: '全部' },
  { value: 'twse', label: '台股' },
  { value: 'crypto', label: '加密貨幣' }
]

const filteredItems = computed(() => {
  let items = activeFilter.value === 'all'
    ? watchlistItems.value
    : watchlistItems.value.filter(item => item.type === activeFilter.value)

  return items.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})

const setSortBy = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const refreshAll = async () => {
  loading.value = true
  try {
    await watchlistStore.updateAllPrices()
    success('已更新所有價格')
  } catch (err) {
    errorToast('更新失敗：' + err.message)
  } finally {
    loading.value = false
  }
}

const deleteItem = (item) => {
  const deletedItem = { ***REMOVED***item }
  watchlistStore.removeItem(item.id)
  
  success('已刪除項目', {
    action: '復原',
    duration: 5000,
    onUndo: () => {
      watchlistStore.items.push(deletedItem)
      watchlistStore.saveToLocalStorage()
      success('已恢復項目')
    }
  })
}

const formatPrice = (price) => {
  if (!price) return '--'
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatChange = (change) => {
  if (!change) return '--'
  const prefix = change > 0 ? '+' : ''
  return prefix + change.toFixed(2)
}

const formatPercent = (percent) => {
  if (!percent) return '--'
  const prefix = percent > 0 ? '+' : ''
  return prefix + percent.toFixed(2) + '%'
}

const formatTime = (isoString) => {
  if (!isoString) return '--'
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

const getTypeLabel = (type) => {
  const labels = {
    twse: '台股',
    crypto: '加密貨幣'
  }
  return labels[type] || type
}
</script>

<template>
  <div class="watchlist-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">監控清單</h1>
        <p
          v-if="watchlistItems.length > 0"
          class="view-subtitle"
        >
          共 {{ watchlistItems.length }} 個項目
        </p>
      </div>
      <button
        v-if="watchlistItems.length > 0"
        @click="refreshAll"
        :disabled="loading"
        class="btn btn-secondary"
      >
        <RefreshCw
          :size="16"
          :class="{ 'spinning': loading }"
        />
        {{ loading ? '更新中' : '更新全部' }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="watchlistItems.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">
        <TrendingUp :size="48" />
      </div>
      <h3>還沒有監控項目</h3>
      <p>前往「新增監控」頁面添加台股或加密貨幣</p>
    </div>

    <!-- Watchlist table -->
    <div
      v-else
      class="watchlist-content"
    >
      <!-- Filters -->
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

      <!-- Table -->
      <div class="table-wrapper">
        <table class="watchlist-table">
          <thead>
            <tr>
              <th @click="setSortBy('type')">
                類型
              </th>
              <th @click="setSortBy('symbol')">
                代號
              </th>
              <th @click="setSortBy('name')">
                名稱
              </th>
              <th
                @click="setSortBy('currentPrice')"
                class="text-right"
              >
                價格
              </th>
              <th
                @click="setSortBy('changePercent')"
                class="text-right"
              >
                漲跌幅
              </th>
              <th class="text-right">
                更新時間
              </th>
              <th class="text-center">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="table-row"
            >
              <td class="type-cell">
                {{ getTypeLabel(item.type) }}
              </td>
              <td class="symbol-cell number">
                {{ item.symbol }}
              </td>
              <td class="name-cell">
                {{ item.name }}
              </td>
              <td class="price-cell text-right number">
                {{ formatPrice(item.currentPrice) }}
              </td>
              <td
                :class="['change-cell', 'text-right', 'number', {
                  'price-up': item.changePercent > 0,
                  'price-down': item.changePercent < 0
                }]"
              >
                <component
                  :is="item.changePercent > 0 ? TrendingUp : TrendingDown"
                  :size="14"
                  class="change-icon"
                />
                {{ formatPercent(item.changePercent) }}
              </td>
              <td class="time-cell text-right number">
                {{ formatTime(item.lastUpdated) }}
              </td>
              <td class="action-cell text-center">
                <button
                  @click="deleteItem(item)"
                  class="btn-icon"
                  aria-label="刪除"
                >
                  <Trash2 :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <!-- Mobile list view -->
      <div class="mobile-only">
        <div class="list-wrapper">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="list-item"
        >
          <div class="list-item-main">
            <div class="list-item-left">
              <span class="list-symbol number">{{ item.symbol }}</span>
              <span class="list-name">{{ item.name }}</span>
              <span class="list-type">{{ getTypeLabel(item.type) }}</span>
            </div>
            <div class="list-item-right">
              <div class="list-price number">{{ formatPrice(item.currentPrice) }}</div>
              <div
                :class="['list-change', 'number', {
                  'price-up': item.changePercent > 0,
                  'price-down': item.changePercent < 0
                }]"
              >
                <component
                  :is="item.changePercent > 0 ? TrendingUp : TrendingDown"
                  :size="12"
                  class="change-icon"
                />
                {{ formatPercent(item.changePercent) }}
              </div>
            </div>
          </div>
          <div class="list-item-footer">
            <span class="list-time number">{{ formatTime(item.lastUpdated) }}</span>
            <button
              @click="deleteItem(item)"
              class="btn-icon-small"
              aria-label="刪除"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.watchlist-view {
  width: 100%;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.view-title {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  margin: 0;
  color: var(--text-primary);
}

.view-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: var(--space-1) 0 0 0;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-16) var(--space-4);
}

.empty-icon {
  margin-bottom: var(--space-4);
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
}

.empty-state p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Filters */
.filters {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.filter-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
}

.filter-btn:hover {
  color: var(--text-primary);
  background: var(--bg-raised);
}

.filter-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(245, 165, 36, 0.08);
  font-weight: var(--font-medium);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
}

.watchlist-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

thead {
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border-hairline);
}

th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;
  transition: color var(--duration-fast) var(--ease);
}

th:hover {
  color: var(--text-primary);
}

.table-row {
  border-bottom: 1px solid var(--border-hairline);
  transition: background var(--duration-fast) var(--ease);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg-raised);
}

td {
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
}

.type-cell {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.symbol-cell {
  font-weight: var(--font-medium);
}

.name-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
}

.change-icon {
  flex-shrink: 0;
}

.time-cell {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.btn-icon {
  padding: var(--space-1);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease);
}

.btn-icon:hover {
  color: var(--color-up);
  background: rgba(229, 72, 77, 0.1);
}

/* Utilities */
.text-right {
  text-align: right;
  justify-content: flex-end;
}

.text-center {
  text-align: center;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none;
  }
}

/* Desktop and mobile view toggling */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}
</style>
