<template>
  <div class="exchange-rate-tab">
    <div class="tab-header">
      <h2>匯率資訊</h2>
      <p>即時匯率查詢與計算</p>
    </div>

    <div class="rate-content">
      <!-- 主要匯率顯示 -->
      <div class="main-rates">
        <div class="rate-card usd-twd">
          <div class="rate-header">
            <h3>USD/TWD</h3>
            <p>美金對台幣</p>
          </div>
          <div class="rate-value">
            <span class="value">{{ formatRate(usdTwdRate) }}</span>
            <span class="currency">TWD</span>
          </div>
          <div class="rate-info">
            <span class="label">1 USD = {{ formatRate(usdTwdRate) }} TWD</span>
            <span class="update-time">{{ formatTime(lastUpdated) }}</span>
          </div>
          <button
            @click="refreshRates"
            :disabled="loading"
            class="refresh-btn"
          >
            <span
              v-if="loading"
              class="loading-spinner"
            ></span>
            <span v-else>🔄</span>
            更新匯率
          </button>
        </div>

        <div class="rate-card twd-usd">
          <div class="rate-header">
            <h3>TWD/USD</h3>
            <p>台幣對美金</p>
          </div>
          <div class="rate-value">
            <span class="value">{{ formatReverseRate(usdTwdRate) }}</span>
            <span class="currency">USD</span>
          </div>
          <div class="rate-info">
            <span class="label"
              >1 TWD = {{ formatReverseRate(usdTwdRate) }} USD</span
            >
            <span class="update-time">{{ formatTime(lastUpdated) }}</span>
          </div>
        </div>
      </div>

      <!-- 匯率計算器 -->
      <div class="rate-calculator">
        <h3>匯率計算器</h3>
        <div class="calculator-content">
          <div class="input-section">
            <div class="input-group">
              <label>美金 (USD)</label>
              <input
                v-model="usdAmount"
                type="number"
                placeholder="0"
                @input="calculateTwd"
              />
            </div>
            <div class="equals">=</div>
            <div class="input-group">
              <label>台幣 (TWD)</label>
              <input
                v-model="twdAmount"
                type="number"
                placeholder="0"
                @input="calculateUsd"
              />
            </div>
          </div>

          <div class="quick-amounts">
            <h4>快速計算</h4>
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
      </div>

      <!-- 匯率歷史趨勢 -->
      <div class="rate-trends">
        <h3>匯率趨勢</h3>
        <div class="trend-info">
          <div class="trend-item">
            <span class="label">今日開盤</span>
            <span class="value">{{ formatRate(usdTwdRate) }}</span>
          </div>
          <div class="trend-item">
            <span class="label">24小時變化</span>
            <span class="value neutral">--</span>
          </div>
          <div class="trend-item">
            <span class="label">更新頻率</span>
            <span class="value">每5分鐘</span>
          </div>
        </div>
      </div>

      <!-- 價格走勢圖表 -->
      <div
        v-if="false"
        class="chart-section"
      >
        <div class="chart-header">
          <h3>價格走勢圖</h3>
          <button
            @click="showDataInfo = true"
            class="info-btn"
            title="關於圖表數據"
          >
            ℹ️ 數據說明
          </button>
        </div>
        <ExchangeRateChart
          from-currency="USD"
          to-currency="TWD"
          initial-period="1W"
        />
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>

    <!-- 數據說明對話框 -->
    <div
      v-if="showDataInfo"
      class="modal-overlay"
      @click="showDataInfo = false"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h3>📊 關於匯率圖表數據</h3>
          <button
            @click="showDataInfo = false"
            class="close-btn"
          >
            ✕
          </button>
        </div>
        <div class="modal-body">
          <div class="info-section">
            <h4>🔄 當前匯率</h4>
            <p>
              上方顯示的 USD/TWD 和 TWD/USD
              匯率是<strong>即時真實數據</strong>，來自 ExchangeRate-API。
            </p>
          </div>

          <div class="info-section">
            <h4>📈 歷史走勢圖</h4>
            <p>圖表顯示的歷史數據來源：</p>
            <ul>
              <li>
                <strong>有 API Key：</strong>使用 FreeCurrencyAPI
                提供的真實歷史匯率數據
              </li>
              <li>
                <strong>無 API Key：</strong
                >基於當前匯率生成的模擬數據（僅供參考）
              </li>
              <li>系統會自動選擇最佳數據來源</li>
            </ul>
          </div>

          <div class="info-section">
            <h4>💡 使用建議</h4>
            <ul>
              <li>參考圖表了解匯率可能的波動趨勢</li>
              <li>實際交易請以即時匯率為準</li>
              <li>如需精確歷史數據，建議使用專業金融平台</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="showDataInfo = false"
            class="confirm-btn"
          >
            了解
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useExchangeRateStore } from '../../stores/exchangeRate.js';
import ExchangeRateChart from './ExchangeRateChart.vue';

const exchangeRateStore = useExchangeRateStore();
const { usdTwdRate, lastUpdatedAt } = storeToRefs(exchangeRateStore);
const lastUpdated = lastUpdatedAt;

// 狀態
const loading = ref(false);
const error = ref('');
const usdAmount = ref(1);
const twdAmount = ref(0);
const showDataInfo = ref(false);

// 快速計算金額
const quickAmounts = [1, 10, 100, 1000, 10000];

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
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
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

// 計算台幣金額
const calculateTwd = () => {
  if (!usdAmount.value || isNaN(usdAmount.value) || !usdTwdRate.value) {
    twdAmount.value = 0;
    return;
  }
  twdAmount.value = (usdAmount.value * usdTwdRate.value).toFixed(2);
};

// 計算美金金額
const calculateUsd = () => {
  if (!twdAmount.value || isNaN(twdAmount.value) || !usdTwdRate.value) {
    usdAmount.value = 0;
    return;
  }
  usdAmount.value = (twdAmount.value / usdTwdRate.value).toFixed(6);
};

// 設定美金金額
const setUsdAmount = (amount) => {
  usdAmount.value = amount;
  calculateTwd();
};

// 更新匯率（取得後會自動存入 localStorage）
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

// 初始化
onMounted(async () => {
  await refreshRates();
});

// 清理（保留以備未來使用）
onUnmounted(() => {});
</script>

<style scoped>
.exchange-rate-tab {
  padding: 24px;
}

.tab-header {
  text-align: center;
  margin-bottom: 32px;
}

.tab-header h2 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
}

.tab-header p {
  margin: 0;
  color: #b0bec5;
  font-size: 16px;
}

.rate-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-rates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.rate-card {
  background: #2c2c54;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #40407a;
  transition: all 0.3s ease;
}

.rate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.rate-card.usd-twd {
  border-left: 4px solid #4caf50;
}

.rate-card.twd-usd {
  border-left: 4px solid #ff9800;
}

.rate-header h3 {
  margin: 0 0 4px 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.rate-header p {
  margin: 0 0 16px 0;
  color: #b0bec5;
  font-size: 14px;
}

.rate-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.rate-value .value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.rate-value .currency {
  font-size: 16px;
  color: #b0bec5;
  font-weight: 500;
}

.rate-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.rate-info .label {
  color: #b0bec5;
  font-size: 14px;
}

.rate-info .update-time {
  color: #90a4ae;
  font-size: 12px;
}

.refresh-btn {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #42a5f5, #2196f3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.4);
}

.refresh-btn:disabled {
  background: #546e7a;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.rate-calculator {
  background: #2c2c54;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #40407a;
}

.rate-calculator h3 {
  margin: 0 0 20px 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.calculator-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 150px;
}

.input-group label {
  font-size: 14px;
  color: #b0bec5;
  font-weight: 600;
}

.input-group input {
  padding: 12px 16px;
  border: 2px solid #40407a;
  border-radius: 8px;
  font-size: 16px;
  background-color: #1a1a2e;
  color: #ffffff;
  transition: border-color 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #64b5f6;
}

.equals {
  font-size: 20px;
  font-weight: 600;
  color: #b0bec5;
  margin: 0 8px;
}

.quick-amounts h4 {
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  background: #40407a;
  color: #ffffff;
  border: 1px solid #40407a;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: #64b5f6;
  border-color: #64b5f6;
  transform: translateY(-1px);
}

.rate-trends {
  background: #2c2c54;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #40407a;
}

.rate-trends h3 {
  margin: 0 0 20px 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.trend-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trend-item .label {
  font-size: 12px;
  color: #b0bec5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trend-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.trend-item .value.neutral {
  color: #b0bec5;
}

.chart-section {
  background: #2c2c54;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #40407a;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.info-btn {
  background: #40407a;
  color: #b0bec5;
  border: 1px solid #40407a;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.info-btn:hover {
  background: #64b5f6;
  border-color: #64b5f6;
  color: #ffffff;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #ffcdd2;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #f44336;
  margin-top: 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .exchange-rate-tab {
    padding: 16px;
  }

  .main-rates {
    grid-template-columns: 1fr;
  }

  .input-section {
    flex-direction: column;
    align-items: stretch;
  }

  .equals {
    text-align: center;
    margin: 8px 0;
  }

  .quick-buttons {
    justify-content: center;
  }

  .trend-info {
    grid-template-columns: 1fr;
  }
}

/* 對話框樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #2c2c54;
  border-radius: 12px;
  border: 1px solid #40407a;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #40407a;
}

.modal-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: #b0bec5;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #40407a;
  color: #ffffff;
}

.modal-body {
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  margin: 0 0 12px 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.info-section p {
  margin: 0 0 8px 0;
  color: #b0bec5;
  font-size: 14px;
  line-height: 1.5;
}

.info-section ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
  color: #b0bec5;
  font-size: 14px;
  line-height: 1.5;
}

.info-section li {
  margin-bottom: 4px;
}

.info-section code {
  background: #40407a;
  color: #64b5f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.info-section a {
  color: #64b5f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.info-section a:hover {
  color: #42a5f5;
  text-decoration: underline;
}

.info-section ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
  color: #b0bec5;
  font-size: 14px;
  line-height: 1.8;
}

.info-section ol li {
  margin-bottom: 8px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #40407a;
  text-align: right;
}

.confirm-btn {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #42a5f5, #2196f3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.4);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .info-btn {
    align-self: flex-start;
  }
}
</style>
