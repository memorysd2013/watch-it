<template>
  <div class="exchange-rate-demo">
    <div class="demo-header">
      <h2>匯率走勢圖演示</h2>
      <p>查看不同貨幣對的價格走勢圖表</p>
    </div>

    <!-- 貨幣選擇器 -->
    <CurrencySelector v-model="selectedPair" />

    <!-- 匯率卡片 -->
    <div
      v-if="selectedPair"
      class="demo-content"
    >
      <ExchangeRateCard
        :rate-data="currentRateData"
        @update="handleRateUpdate"
        @remove="handleRateRemove"
      />
    </div>

    <!-- 獨立圖表演示 -->
    <div
      v-if="selectedPair"
      class="standalone-chart"
    >
      <h3>獨立圖表組件</h3>
      <ExchangeRateChart
        :from-currency="selectedPair.from"
        :to-currency="selectedPair.to"
        initial-period="1M"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { exchangeRateAPI } from '../services/api.js';
import ExchangeRateCard from './ExchangeRateCard.vue';
import ExchangeRateChart from './ExchangeRateChart.vue';
import CurrencySelector from './CurrencySelector.vue';

const selectedPair = ref(null);
const currentRateData = ref(null);
const loading = ref(false);

// 載入匯率數據
const loadRateData = async () => {
  if (!selectedPair.value) return;

  loading.value = true;
  try {
    const rateData = await exchangeRateAPI.getExchangeRate(
      selectedPair.value.from,
      selectedPair.value.to
    );
    currentRateData.value = rateData;
  } catch (error) {
    console.error('載入匯率數據失敗:', error);
  } finally {
    loading.value = false;
  }
};

// 處理匯率更新
const handleRateUpdate = (newRateData) => {
  currentRateData.value = newRateData;
};

// 處理匯率移除
const handleRateRemove = () => {
  currentRateData.value = null;
};

// 監聽貨幣對變化
watch(selectedPair, () => {
  loadRateData();
});

// 初始化
onMounted(() => {
  // 預設選擇 USD/TWD
  selectedPair.value = {
    from: 'USD',
    to: 'TWD',
    name: '美金/台幣',
    description: '美金對台幣匯率',
  };
});
</script>

<style scoped>
.exchange-rate-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 32px;
}

.demo-header h2 {
  margin: 0 0 8px 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  color: #b0bec5;
  font-size: 16px;
}

.demo-content {
  margin-bottom: 32px;
}

.standalone-chart {
  background: #2c2c54;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #40407a;
}

.standalone-chart h3 {
  margin: 0 0 20px 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .exchange-rate-demo {
    padding: 16px;
  }

  .demo-header h2 {
    font-size: 24px;
  }
}
</style>
