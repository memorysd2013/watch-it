<template>
  <div class="exchange-rate-card">
    <div class="rate-header">
      <div class="rate-info">
        <h3 class="rate-pair">{{ rateData.from }}/{{ rateData.to }}</h3>
        <p class="rate-description">{{ getRateDescription() }}</p>
        <span class="type-badge exchange-rate">匯率</span>
      </div>
      <div class="rate-actions">
        <button
          @click="refreshRate"
          :disabled="loading"
          class="refresh-btn"
          title="重新整理匯率"
        >
          <span
            v-if="loading"
            class="loading-spinner"
          ></span>
          <span v-else>🔄</span>
        </button>
        <button
          @click="removeRate"
          class="remove-btn"
          title="移除監控"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="rate-content">
      <div class="main-rate">
        <span class="rate-value">
          {{ formatRate(rateData.rate) }}
        </span>
        <span class="rate-currency">{{ rateData.to }}</span>
      </div>

      <div class="rate-details">
        <div class="rate-info-item">
          <span class="label">匯率:</span>
          <span class="value"
            >1 {{ rateData.from }} = {{ formatRate(rateData.rate) }}
            {{ rateData.to }}</span
          >
        </div>

        <div class="rate-info-item">
          <span class="label">反向匯率:</span>
          <span class="value"
            >1 {{ rateData.to }} = {{ formatReverseRate(rateData.rate) }}
            {{ rateData.from }}</span
          >
        </div>

        <div class="rate-info-item">
          <span class="label">更新時間:</span>
          <span class="value">{{ formatTime(rateData.lastUpdated) }}</span>
        </div>
      </div>

      <!-- 匯率計算器 -->
      <div class="rate-calculator">
        <h4>匯率計算器</h4>
        <div class="calculator-inputs">
          <div class="input-group">
            <label>{{ rateData.from }}</label>
            <input
              v-model="fromAmount"
              type="number"
              placeholder="0"
              @input="calculateToAmount"
            />
          </div>
          <div class="equals">=</div>
          <div class="input-group">
            <label>{{ rateData.to }}</label>
            <input
              v-model="toAmount"
              type="number"
              placeholder="0"
              @input="calculateFromAmount"
            />
          </div>
        </div>
      </div>

      <!-- 價格走勢圖表 -->
      <ExchangeRateChart
        :from-currency="rateData.from"
        :to-currency="rateData.to"
        initial-period="1M"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { exchangeRateAPI } from '../services/api.js';
import ExchangeRateChart from './ExchangeRateChart.vue';

const props = defineProps({
  rateData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['remove', 'update']);

const loading = ref(false);
const fromAmount = ref(1);
const toAmount = ref(0);

// 計算反向匯率
const reverseRate = computed(() => {
  return 1 / props.rateData.rate;
});

// 獲取匯率描述
const getRateDescription = () => {
  const descriptions = {
    'USD/TWD': '美金對台幣匯率',
    'TWD/USD': '台幣對美金匯率',
  };
  return descriptions[`${props.rateData.from}/${props.rateData.to}`] || '匯率';
};

// 格式化匯率
const formatRate = (rate) => {
  if (!rate || isNaN(rate)) return '--';
  return rate.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
};

// 格式化反向匯率
const formatReverseRate = (rate) => {
  if (!rate || isNaN(rate)) return '--';
  const reverse = 1 / rate;
  return reverse.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
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

// 計算轉換金額 (從 from 到 to)
const calculateToAmount = () => {
  if (!fromAmount.value || isNaN(fromAmount.value)) {
    toAmount.value = 0;
    return;
  }
  toAmount.value = (fromAmount.value * props.rateData.rate).toFixed(4);
};

// 計算轉換金額 (從 to 到 from)
const calculateFromAmount = () => {
  if (!toAmount.value || isNaN(toAmount.value)) {
    fromAmount.value = 0;
    return;
  }
  fromAmount.value = (toAmount.value / props.rateData.rate).toFixed(4);
};

// 重新整理匯率
const refreshRate = async () => {
  loading.value = true;
  try {
    let newRateData;
    if (props.rateData.from === 'USD' && props.rateData.to === 'TWD') {
      newRateData = await exchangeRateAPI.getUSDTWDRate();
    } else if (props.rateData.from === 'TWD' && props.rateData.to === 'USD') {
      newRateData = await exchangeRateAPI.getTWDUSDRate();
    }

    if (newRateData) {
      emit('update', newRateData);
      // 重新計算金額
      calculateToAmount();
    }
  } catch (error) {
    console.error('更新匯率失敗:', error);
  } finally {
    loading.value = false;
  }
};

// 移除匯率監控
const removeRate = () => {
  if (
    confirm(
      `確定要移除 ${props.rateData.from}/${props.rateData.to} 匯率監控嗎？`
    )
  ) {
    emit('remove', props.rateData);
  }
};

// 初始化計算
calculateToAmount();
</script>

<style scoped>
.exchange-rate-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-md), var(--shadow-glow);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--warning);
  position: relative;
  overflow: hidden;
}

.exchange-rate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--warning) 50%,
    transparent 100%
  );
  opacity: 0.3;
}

.exchange-rate-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), 0 0 30px rgba(255, 165, 2, 0.2);
  background: var(--card-bg-hover);
  border-color: var(--border-glow);
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.rate-info h3 {
  margin: 0 0 4px 0;
  color: var(--text-bright);
  font-size: 20px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.rate-info p {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.type-badge.exchange-rate {
  background: rgba(255, 165, 2, 0.15);
  color: var(--warning);
  border: 1px solid var(--warning);
  box-shadow: 0 0 10px rgba(255, 165, 2, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rate-actions {
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

.rate-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-rate {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.rate-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-bright);
  text-shadow: 0 0 20px rgba(255, 165, 2, 0.2);
}

.rate-currency {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

.rate-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rate-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.rate-info-item .label {
  color: var(--text-muted);
}

.rate-info-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

.rate-calculator {
  background: rgba(25, 32, 56, 0.5);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.rate-calculator h4 {
  margin: 0 0 12px 0;
  color: var(--text-bright);
  font-size: 16px;
}

.calculator-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
}

.input-group label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(13, 17, 36, 0.6);
  color: var(--text-bright);
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: var(--warning);
  box-shadow: 0 0 15px rgba(255, 165, 2, 0.2);
  background: rgba(13, 17, 36, 0.8);
}

.equals {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-cyan);
  margin: 0 8px;
}

@media (max-width: 768px) {
  .exchange-rate-card {
    padding: 16px;
  }

  .rate-value {
    font-size: 24px;
  }

  .rate-header {
    flex-direction: column;
    gap: 12px;
  }

  .rate-actions {
    align-self: flex-end;
  }

  .calculator-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .equals {
    text-align: center;
    margin: 8px 0;
  }
}
</style>
