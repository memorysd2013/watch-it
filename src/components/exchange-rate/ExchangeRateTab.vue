<template>
  <div class="exchange-rate-tab">
    <h1 class="page-title">匯率資訊</h1>

    <div class="rate-content">
      <!-- Main rates -->
      <div class="main-rates">
        <div class="rate-card">
          <div class="rate-header">
            <span class="rate-pair">USD/TWD</span>
            <span class="rate-label">美金對台幣</span>
          </div>
          <div class="rate-value number">{{ formatRate(usdTwdRate) }}</div>
          <div class="rate-meta">
            <span class="rate-formula">1 USD = {{ formatRate(usdTwdRate) }} TWD</span>
            <span class="rate-updated">{{ formatTime(lastUpdated) }}</span>
          </div>
        </div>

        <div class="rate-card">
          <div class="rate-header">
            <span class="rate-pair">TWD/USD</span>
            <span class="rate-label">台幣對美金</span>
          </div>
          <div class="rate-value number">{{ formatReverseRate(usdTwdRate) }}</div>
          <div class="rate-meta">
            <span class="rate-formula">1 TWD = {{ formatReverseRate(usdTwdRate) }} USD</span>
            <span class="rate-updated">{{ formatTime(lastUpdated) }}</span>
          </div>
        </div>
      </div>

      <button
        @click="refreshRates"
        :disabled="loading"
        class="btn btn-primary refresh-btn"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? '更新中…' : '更新匯率' }}
      </button>

      <!-- Calculator -->
      <div class="calculator-card">
        <h3 class="section-title">匯率計算器</h3>
        
        <div class="calculator-inputs">
          <div class="input-group">
            <label for="usd">美金 (USD)</label>
            <input
              id="usd"
              v-model="usdAmount"
              type="number"
              placeholder="0"
              @input="calculateTwd"
              class="number"
            />
          </div>
          
          <div class="equals">=</div>
          
          <div class="input-group">
            <label for="twd">台幣 (TWD)</label>
            <input
              id="twd"
              v-model="twdAmount"
              type="number"
              placeholder="0"
              @input="calculateUsd"
              class="number"
            />
          </div>
        </div>

        <div class="quick-amounts">
          <span class="quick-label">快速計算</span>
          <div class="quick-buttons">
            <button
              v-for="amount in quickAmounts"
              :key="amount"
              @click="setUsdAmount(amount)"
              class="quick-btn"
            >
              ${{ amount }}
            </button>
          </div>
        </div>
      </div>

      <!-- Trends -->
      <div class="trends-card">
        <h3 class="section-title">匯率資訊</h3>
        <div class="trend-items">
          <div class="trend-item">
            <span class="trend-label">今日開盤</span>
            <span class="trend-value number">{{ formatRate(usdTwdRate) }}</span>
          </div>
          <div class="trend-item">
            <span class="trend-label">24小時變化</span>
            <span class="trend-value">--</span>
          </div>
          <div class="trend-item">
            <span class="trend-label">更新頻率</span>
            <span class="trend-value">每5分鐘</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="message message-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useExchangeRateStore } from '../../stores/exchangeRate.js';

const exchangeRateStore = useExchangeRateStore();
const { usdTwdRate, lastUpdatedAt } = storeToRefs(exchangeRateStore);
const lastUpdated = lastUpdatedAt;

const loading = ref(false);
const error = ref('');
const usdAmount = ref(1);
const twdAmount = ref(0);

const quickAmounts = [1, 10, 100, 1000, 10000];

const formatRate = (rate) => {
  if (!rate || isNaN(rate)) return '--';
  return rate.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
};

const formatReverseRate = (rate) => {
  if (!rate || isNaN(rate)) return '--';
  const reverse = 1 / rate;
  return reverse.toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });
};

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

const calculateTwd = () => {
  if (!usdAmount.value || isNaN(usdAmount.value) || !usdTwdRate.value) {
    twdAmount.value = 0;
    return;
  }
  twdAmount.value = (usdAmount.value * usdTwdRate.value).toFixed(2);
};

const calculateUsd = () => {
  if (!twdAmount.value || isNaN(twdAmount.value) || !usdTwdRate.value) {
    usdAmount.value = 0;
    return;
  }
  usdAmount.value = (twdAmount.value / usdTwdRate.value).toFixed(6);
};

const setUsdAmount = (amount) => {
  usdAmount.value = amount;
  calculateTwd();
};

const refreshRates = async () => {
  loading.value = true;
  error.value = '';

  try {
    await exchangeRateStore.fetchUsdTwdRate();
    calculateTwd();
  } catch (err) {
    error.value = '更新匯率失敗，請稍後再試';
    console.error('更新匯率失敗:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await refreshRates();
});
</script>

<style scoped>
.exchange-rate-tab {
  max-width: 800px;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  margin: 0 0 var(--space-6) 0;
  color: var(--text-primary);
}

.rate-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.main-rates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.rate-card {
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rate-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.rate-pair {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.rate-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.rate-value {
  font-size: 32px;
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}

.rate-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-subtle);
}

.rate-formula {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.rate-updated {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.refresh-btn {
  width: fit-content;
}

.btn {
  height: 40px;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--accent);
  color: var(--bg-deepest);
}

.btn-primary:hover:not(:disabled) {
  background: rgba(245, 165, 36, 0.9);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.calculator-card,
.trends-card {
  background: var(--bg-raised);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
  color: var(--text-primary);
}

.calculator-inputs {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  min-width: 140px;
}

.input-group label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.input-group input {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: inherit;
  background: var(--bg-page);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--ease);
}

.input-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(245, 165, 36, 0.1);
}

.equals {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-muted);
  margin-bottom: 8px;
}

.quick-amounts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.quick-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quick-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.quick-btn {
  height: 32px;
  padding: 0 var(--space-3);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
}

.quick-btn:hover {
  background: var(--bg-raised);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.trend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.trend-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trend-value {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.message {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border-left-width: 3px;
  font-size: var(--text-sm);
}

.message-error {
  background: rgba(229, 72, 77, 0.1);
  color: var(--color-up);
  border: 1px solid rgba(229, 72, 77, 0.3);
}

@media (max-width: 768px) {
  .main-rates {
    grid-template-columns: 1fr;
  }

  .calculator-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .equals {
    text-align: center;
    margin: 0;
  }

  .trend-items {
    grid-template-columns: 1fr;
  }
}
</style>
