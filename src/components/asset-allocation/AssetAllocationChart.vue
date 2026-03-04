<template>
  <div class="asset-chart">
    <div class="chart-header">
      <h4>{{ chartTitle }}</h4>
      <button
        v-if="selectedAssetItem"
        class="back-btn"
        @click="clearSelection"
      >
        ← 返回總覽
      </button>
    </div>

    <div class="chart-container">
      <div
        v-if="!hasData"
        class="chart-empty"
      >
        <p>尚無資料可顯示</p>
      </div>
      <div
        v-else
        class="chart-wrapper"
      >
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { useAssetAllocationStore } from '../../stores/assetAllocation.js';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

const CHART_COLORS = [
  '#00d9ff', // accent-cyan
  '#9c27b0', // accent-purple
  '#00ff88', // success
  '#ffa502', // warning
  '#2196f3', // accent-blue
  '#e91e63', // accent-pink
];

const props = defineProps({
  selectedAssetItem: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['select-asset', 'clear-selection']);

const store = useAssetAllocationStore();
const chartCanvas = ref(null);
let chartInstance = null;

const assetItems = computed(() => store.getAllAssetItems);
const totalAmount = computed(() => store.totalAmount);

const chartTitle = computed(() => {
  if (props.selectedAssetItem) {
    return `${props.selectedAssetItem.name} - 子項目佔比`;
  }
  return '資產配置總覽';
});

const hasData = computed(() => {
  if (props.selectedAssetItem) {
    const subs = props.selectedAssetItem.subItems || [];
    return subs.length > 0 && subs.some((s) => (s.amount || 0) > 0);
  }
  return assetItems.value.length > 0 && totalAmount.value > 0;
});

const chartData = computed(() => {
  if (props.selectedAssetItem) {
    return buildSubItemData(props.selectedAssetItem);
  }
  return buildAssetItemData();
});

function buildAssetItemData() {
  const items = assetItems.value.filter((item) => {
    const total = store.getAssetItemTotal(item);
    return total > 0;
  });

  return {
    labels: items.map((i) => i.name),
    datasets: [
      {
        data: items.map((i) => store.getAssetItemTotal(i)),
        backgroundColor: items.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
        borderColor: 'rgba(20, 25, 45, 0.9)',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };
}

function buildSubItemData(assetItem) {
  const subs = (assetItem.subItems || []).filter((s) => (s.amount || 0) > 0);

  return {
    labels: subs.map((s) => s.name),
    datasets: [
      {
        data: subs.map((s) => s.amount),
        backgroundColor: subs.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
        borderColor: 'rgba(20, 25, 45, 0.9)',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };
}

function createChart() {
  if (!chartCanvas.value || !hasData.value) return;

  destroyChart();

  chartInstance = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#b0b9d4',
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 13,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(20, 25, 45, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#b0b9d4',
          borderColor: 'rgba(0, 217, 255, 0.3)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
              const amount = Number(context.raw).toLocaleString('zh-TW', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              });
              return ` ${context.label}: ${amount} (${percent}%)`;
            },
          },
        },
      },
      onClick: (_, elements) => {
        if (elements.length > 0 && !props.selectedAssetItem) {
          const idx = elements[0].index;
          const item = assetItems.value.filter(
            (i) => store.getAssetItemTotal(i) > 0
          )[idx];
          if (item && (item.subItems?.length || 0) > 0) {
            emit('select-asset', item);
          }
        }
      },
    },
  });
}

function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function clearSelection() {
  emit('clear-selection');
}

watch([chartData, hasData], () => {
  if (hasData.value && chartCanvas.value) {
    createChart();
  } else {
    destroyChart();
  }
});

onMounted(() => {
  if (hasData.value && chartCanvas.value) {
    createChart();
  }
});

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
.asset-chart {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h4 {
  margin: 0;
  color: var(--text-bright);
  font-size: 18px;
  font-weight: 700;
}

.back-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.chart-container {
  min-height: 200px;
}

.chart-wrapper {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 600px) {
  .asset-chart {
    padding: 16px;
  }

  .chart-wrapper {
    max-width: 100%;
  }
}
</style>
