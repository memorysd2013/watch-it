<template>
  <div
    class="price-card"
    :class="{ loading: loading }"
  >
    <div class="card-header">
      <div class="symbol-info">
        <h3 class="symbol">{{ item.symbol }}</h3>
        <p class="name">{{ item.name }}</p>
        <span
          class="type-badge"
          :class="item.type"
        >
          {{ getTypeLabel(item.type) }}
        </span>
      </div>
      <div class="card-actions">
        <button
          @click="refreshPrice"
          :disabled="loading"
          class="refresh-btn"
          title="重新整理價格"
        >
          <span
            v-if="loading"
            class="loading-spinner"
          ></span>
          <span v-else>🔄</span>
        </button>
        <button
          @click="removeItem"
          class="remove-btn"
          title="移除監控"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="price-info">
      <div class="main-price">
        <span
          class="price"
          :class="getPriceClass()"
        >
          {{ formatPrice(item.currentPrice) }}
        </span>
        <span class="currency">{{ getCurrency() }}</span>
      </div>

      <div class="price-details">
        <div class="change-info">
          <span
            class="change"
            :class="getChangeClass()"
          >
            {{ formatChange(item.change) }}
          </span>
          <span
            class="change-percent"
            :class="getChangeClass()"
          >
            ({{ formatPercent(item.changePercent) }})
          </span>
        </div>

        <div class="additional-info">
          <div class="info-item">
            <span class="label">成交量:</span>
            <span class="value">{{ formatVolume(item.volume) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最高:</span>
            <span class="value">{{ formatPrice(item.high) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最低:</span>
            <span class="value">{{ formatPrice(item.low) }}</span>
          </div>
          <div class="info-item">
            <span class="label">開盤:</span>
            <span class="value">{{ formatPrice(item.open) }}</span>
          </div>
        </div>
      </div>

      <div class="last-updated">
        最後更新: {{ formatTime(item.lastUpdated) }}
      </div>
    </div>

    <!-- 台幣價格 (僅加密貨幣顯示) -->
    <div
      v-if="item.type === 'crypto' && item.priceTwd"
      class="twd-price"
    >
      <span class="twd-label">台幣價格:</span>
      <span class="twd-value">NT$ {{ formatPrice(item.priceTwd) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useWatchlistStore } from '../stores/watchlist.js';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const watchlistStore = useWatchlistStore();
const loading = ref(false);

// 獲取類型標籤
const getTypeLabel = (type) => {
  const labels = {
    twse: '台股',
    us: '美股',
    crypto: '加密貨幣',
  };
  return labels[type] || type;
};

// 獲取貨幣符號
const getCurrency = () => {
  if (props.item.type === 'crypto') return 'USD';
  if (props.item.type === 'twse') return 'TWD';
  if (props.item.type === 'us') return 'USD';
  return '';
};

// 格式化價格
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '--';

  if (props.item.type === 'crypto') {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }

  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// 格式化變化
const formatChange = (change) => {
  if (!change || isNaN(change)) return '--';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
};

// 格式化百分比
const formatPercent = (percent) => {
  if (!percent || isNaN(percent)) return '--';
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

// 格式化成交量
const formatVolume = (volume) => {
  if (!volume || isNaN(volume)) return '--';

  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }

  return volume.toLocaleString();
};

// 格式化時間
const formatTime = (timeString) => {
  if (!timeString) return '--';

  const date = new Date(timeString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} 小時前`;

  return date.toLocaleString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 獲取價格樣式類別
const getPriceClass = () => {
  if (!props.item.change || isNaN(props.item.change)) return '';
  return props.item.change >= 0 ? 'positive' : 'negative';
};

// 獲取變化樣式類別
const getChangeClass = () => {
  if (!props.item.change || isNaN(props.item.change)) return '';
  return props.item.change >= 0 ? 'positive' : 'negative';
};

// 重新整理價格
const refreshPrice = async () => {
  loading.value = true;
  try {
    await watchlistStore.updateItemPrice(props.item.id);
  } catch (error) {
    console.error('更新價格失敗:', error);
  } finally {
    loading.value = false;
  }
};

// 移除項目
const removeItem = () => {
  if (confirm(`確定要移除 ${props.item.symbol} 嗎？`)) {
    watchlistStore.removeItem(props.item.id);
  }
};
</script>

<style scoped>
.price-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-md), var(--shadow-glow);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent-blue);
  position: relative;
  overflow: hidden;
}

.price-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--accent-blue) 50%,
    transparent 100%
  );
  opacity: 0.3;
}

.price-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), 0 0 30px rgba(33, 150, 243, 0.2);
  background: var(--card-bg-hover);
  border-color: var(--border-glow);
}

.price-card.loading {
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.symbol-info h3 {
  margin: 0 0 4px 0;
  color: var(--text-bright);
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.symbol-info p {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
}

.type-badge.twse {
  background: rgba(0, 255, 136, 0.15);
  color: var(--success);
  border-color: var(--success);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
}

.type-badge.us {
  background: rgba(0, 217, 255, 0.15);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.2);
}

.type-badge.crypto {
  background: rgba(255, 165, 2, 0.15);
  color: var(--warning);
  border-color: var(--warning);
  box-shadow: 0 0 10px rgba(255, 165, 2, 0.2);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn,
.remove-btn {
  width: 32px;
  height: 32px;
  border: 1px solid;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.refresh-btn {
  background: rgba(0, 217, 255, 0.1);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(0, 217, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
  transform: scale(1.05);
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.remove-btn {
  background: rgba(255, 71, 87, 0.1);
  color: var(--danger);
  border-color: var(--danger);
}

.remove-btn:hover {
  background: rgba(255, 71, 87, 0.2);
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.4);
  transform: scale(1.05);
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

.price-info {
  margin-bottom: 16px;
}

.main-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
}

.price.positive {
  color: var(--success);
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.price.negative {
  color: var(--danger);
  text-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
}

.currency {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

.change-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.change,
.change-percent {
  font-size: 16px;
  font-weight: 600;
}

.change.positive,
.change-percent.positive {
  color: var(--success);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.change.negative,
.change-percent.negative {
  color: var(--danger);
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}

.additional-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-item .label {
  color: var(--text-muted);
}

.info-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.last-updated {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

.twd-price {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.twd-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.twd-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-cyan);
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.3);
}

@media (max-width: 768px) {
  .price-card {
    padding: 16px;
  }

  .price {
    font-size: 24px;
  }

  .additional-info {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .card-actions {
    align-self: flex-end;
  }
}
</style>
