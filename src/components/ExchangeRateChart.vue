<template>
  <div class="exchange-rate-chart">
    <div class="chart-header">
      <div class="chart-title-section">
        <h4>價格走勢圖</h4>
        <button
          v-if="chartInstance"
          @click="resetZoom"
          class="reset-zoom-btn"
        >
          🔄 重置縮放
        </button>
      </div>
      <div class="chart-controls">
        <div class="period-selector">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="selectPeriod(period.value)"
            :class="['period-btn', { active: selectedPeriod === period.value }]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div
        v-if="loading"
        class="chart-loading"
      >
        <div class="loading-spinner"></div>
        <p>載入中...</p>
      </div>

      <div
        v-else-if="error"
        class="chart-error"
      >
        <p>{{ error }}</p>
        <button
          @click="loadChartData"
          class="retry-btn"
        >
          重試
        </button>
      </div>

      <div
        v-else
        class="chart-wrapper"
      >
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <div
      v-if="chartData && !loading && !error"
      class="chart-info"
    >
      <div class="info-item">
        <span class="label">數據期間:</span>
        <span class="value">{{ getPeriodLabel(selectedPeriod) }}</span>
      </div>
      <div class="info-item">
        <span class="label">數據點數:</span>
        <span class="value">{{ chartData.data?.length || 0 }} 個</span>
      </div>
      <div class="info-item">
        <span class="label">最新更新:</span>
        <span class="value">{{ formatTime(chartData.lastUpdated) }}</span>
      </div>
      <div
        v-if="chartStats"
        class="info-item"
      >
        <span class="label">平均值:</span>
        <span class="value">{{ chartStats.average }}</span>
      </div>
      <div
        v-if="chartStats"
        class="info-item"
      >
        <span class="label">最高值:</span>
        <span class="value">{{ chartStats.highest }}</span>
      </div>
      <div
        v-if="chartStats"
        class="info-item"
      >
        <span class="label">最低值:</span>
        <span class="value">{{ chartStats.lowest }}</span>
      </div>
      <div
        v-if="chartStats"
        class="info-item"
        :class="{
          positive: chartStats.isPositive,
          negative: !chartStats.isPositive,
        }"
      >
        <span class="label">變化:</span>
        <span class="value"
          >{{ chartStats.isPositive ? '+' : ''
          }}{{ chartStats.changePercent }}%</span
        >
      </div>
      <div
        v-if="chartData.isMockData || chartData.isSimulatedData"
        class="info-item mock-data"
      >
        <span class="label">📊 基於當前匯率生成的歷史趨勢圖</span>
        <span class="value">僅供參考，非實際歷史數據</span>
      </div>
      <div
        v-if="chartData.note"
        class="info-item note"
      >
        <span class="label">📝 {{ chartData.note }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { exchangeRateAPI } from '../services/api.js';

Chart.register(...registerables, zoomPlugin);

const props = defineProps({
  fromCurrency: {
    type: String,
    required: true,
  },
  toCurrency: {
    type: String,
    required: true,
  },
  initialPeriod: {
    type: String,
    default: '1M',
  },
});

// 響應式數據
const loading = ref(false);
const error = ref('');
const chartData = ref(null);
const chartStats = ref(null);
const selectedPeriod = ref(props.initialPeriod);
const chartCanvas = ref(null);
let chartInstance = null;

// 計算統計資訊
const calculateStats = (data) => {
  if (!data || data.length === 0) return null;

  const rates = data.map((item) => item.rate);
  const firstRate = rates[0];
  const lastRate = rates[rates.length - 1];
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const change = lastRate - firstRate;
  const changePercent = ((change / firstRate) * 100).toFixed(2);

  return {
    average: avgRate.toFixed(4),
    highest: maxRate.toFixed(4),
    lowest: minRate.toFixed(4),
    change: change.toFixed(4),
    changePercent: changePercent,
    isPositive: change >= 0,
  };
};

// 時間週期選項
const periods = [
  { value: '1W', label: '1週' },
  { value: '1M', label: '1月' },
  { value: '3M', label: '1季' },
  { value: '6M', label: '半年' },
  { value: '1Y', label: '1年' },
];

// 選擇時間週期
const selectPeriod = (period) => {
  selectedPeriod.value = period;
  loadChartData();
};

// 獲取週期標籤
const getPeriodLabel = (period) => {
  const periodObj = periods.find((p) => p.value === period);
  return periodObj ? periodObj.label : period;
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

// 載入圖表數據
const loadChartData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const data = await exchangeRateAPI.getHistoricalRates(
      props.fromCurrency,
      props.toCurrency,
      selectedPeriod.value
    );

    chartData.value = data;
    chartStats.value = calculateStats(data.data);
    await nextTick();

    // 確保 Canvas 元素已經渲染
    setTimeout(() => {
      renderChart();
    }, 100);
  } catch (err) {
    error.value = '載入圖表數據失敗';
    console.error('載入圖表數據錯誤:', err);
  } finally {
    loading.value = false;
  }
};

// 渲染圖表
const renderChart = () => {
  console.log('🎨 開始渲染圖表...');
  console.log('Canvas 元素:', chartCanvas.value);
  console.log('圖表數據:', chartData.value);

  if (!chartCanvas.value || !chartData.value) {
    console.warn('❌ 缺少必要元素:', {
      canvas: !!chartCanvas.value,
      data: !!chartData.value,
    });
    return;
  }

  // 銷毀現有圖表
  if (chartInstance) {
    console.log('🗑️ 銷毀現有圖表');
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  const data = chartData.value.data;

  console.log('📊 圖表數據:', data);
  console.log('📊 數據點數:', data?.length);

  // 準備圖表數據
  const labels = data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
  });

  const rates = data.map((item) => item.rate);

  console.log('📈 標籤:', labels);
  console.log('📈 匯率:', rates);

  // 根據數據點數量動態調整顯示
  const dataPointCount = data.length;
  const pointRadius =
    dataPointCount > 90
      ? 0
      : dataPointCount > 60
      ? 1
      : dataPointCount > 30
      ? 2
      : 4;
  const pointHoverRadius = pointRadius > 0 ? pointRadius + 2 : 4;

  // 計算顏色
  const firstRate = rates[0];
  const lastRate = rates[rates.length - 1];
  const isPositive = lastRate >= firstRate;
  const lineColor = isPositive ? '#4caf50' : '#f44336';
  const fillColor = isPositive
    ? 'rgba(76, 175, 80, 0.1)'
    : 'rgba(244, 67, 54, 0.1)';

  console.log('🎨 圖表顏色:', { lineColor, fillColor, isPositive });
  console.log('📊 數據點配置:', {
    dataPointCount,
    pointRadius,
    pointHoverRadius,
  });

  try {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: `${props.fromCurrency}/${props.toCurrency}`,
            data: rates,
            borderColor: lineColor,
            backgroundColor: fillColor,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: lineColor,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: pointRadius,
            pointHoverRadius: pointHoverRadius,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              modifierKey: 'ctrl',
            },
            zoom: {
              wheel: {
                enabled: true,
                speed: 0.1,
              },
              pinch: {
                enabled: true,
              },
              mode: 'x',
            },
            limits: {
              x: { min: 'original', max: 'original' },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: lineColor,
            borderWidth: 1,
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                const date = new Date(data[index].date);
                return date.toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              },
              label: (context) => {
                return `匯率: ${context.parsed.y.toFixed(4)} ${
                  props.toCurrency
                }`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false,
            },
            ticks: {
              color: '#b0bec5',
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false,
            },
            ticks: {
              color: '#b0bec5',
              callback: function (value) {
                return value.toFixed(4);
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });

    console.log('✅ 圖表創建成功:', chartInstance);
  } catch (error) {
    console.error('❌ 圖表創建失敗:', error);
    throw error;
  }
};

// 重置縮放
const resetZoom = () => {
  if (chartInstance) {
    chartInstance.resetZoom();
  }
};

// 監聽貨幣對變化
watch([() => props.fromCurrency, () => props.toCurrency], () => {
  loadChartData();
});

// 組件掛載
onMounted(() => {
  loadChartData();
});

// 組件卸載
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.exchange-rate-chart {
  background: #2c2c54;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #40407a;
  margin-top: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.chart-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-header h4 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.reset-zoom-btn {
  background: rgba(100, 181, 246, 0.15);
  color: #64b5f6;
  border: 1px solid rgba(100, 181, 246, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.reset-zoom-btn:hover {
  background: rgba(100, 181, 246, 0.25);
  border-color: rgba(100, 181, 246, 0.5);
  transform: translateY(-1px);
}

.reset-zoom-btn:active {
  transform: translateY(0);
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.period-btn {
  background: #40407a;
  color: #b0bec5;
  border: 1px solid #40407a;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-btn:hover {
  background: #64b5f6;
  border-color: #64b5f6;
  color: #ffffff;
}

.period-btn.active {
  background: #64b5f6;
  border-color: #64b5f6;
  color: #ffffff;
}

.chart-container {
  position: relative;
  height: 300px;
  margin-bottom: 16px;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #b0bec5;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid transparent;
  border-top: 3px solid #64b5f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #f44336;
  text-align: center;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #d32f2f;
}

.chart-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}

.chart-wrapper canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.chart-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #40407a;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #b0bec5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.info-item.mock-data .label {
  color: #ff9800;
}

.info-item.note .label {
  color: #64b5f6;
  font-size: 11px;
}

.info-item.positive .value {
  color: #4caf50;
}

.info-item.negative .value {
  color: #f44336;
}

@media (max-width: 768px) {
  .exchange-rate-chart {
    padding: 16px;
  }

  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-title-section {
    justify-content: space-between;
  }

  .chart-header h4 {
    font-size: 16px;
  }

  .reset-zoom-btn {
    padding: 5px 10px;
    font-size: 11px;
  }

  .chart-controls {
    width: 100%;
  }

  .period-selector {
    justify-content: center;
    width: 100%;
  }

  .period-btn {
    flex: 1;
    min-width: 50px;
  }

  .chart-container {
    height: 250px;
  }

  .chart-info {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .chart-header h4 {
    font-size: 15px;
  }

  .reset-zoom-btn {
    padding: 4px 8px;
    font-size: 10px;
  }

  .period-btn {
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>
