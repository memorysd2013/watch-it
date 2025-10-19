<template>
  <div class="chart-test">
    <h2>圖表測試頁面</h2>

    <div class="test-section">
      <h3>1. 基本圖表測試</h3>
      <ExchangeRateChart
        from-currency="USD"
        to-currency="TWD"
        initial-period="1M"
      />
    </div>

    <div class="test-section">
      <h3>2. 調試工具</h3>
      <ChartDebug />
    </div>
  </div>
</template>

<script setup>
import ExchangeRateChart from './ExchangeRateChart.vue';
import ChartDebug from './ChartDebug.vue';
</script>

<style scoped>
.chart-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.test-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}
</style>
