<template>
  <div class="chart-debug">
    <h3>圖表調試工具</h3>

    <div class="debug-section">
      <h4>1. 數據檢查</h4>
      <button @click="testDataLoad">測試數據載入</button>
      <div
        v-if="debugData"
        class="debug-info"
      >
        <p><strong>數據狀態:</strong> {{ debugData.status }}</p>
        <p><strong>數據點數:</strong> {{ debugData.dataPoints }}</p>
        <p><strong>數據類型:</strong> {{ debugData.dataType }}</p>
        <p><strong>錯誤信息:</strong> {{ debugData.error || '無' }}</p>
      </div>
    </div>

    <div class="debug-section">
      <h4>2. Canvas 檢查</h4>
      <button @click="testCanvas">測試 Canvas</button>
      <div
        v-if="canvasInfo"
        class="debug-info"
      >
        <p>
          <strong>Canvas 元素:</strong>
          {{ canvasInfo.exists ? '存在' : '不存在' }}
        </p>
        <p><strong>Canvas 尺寸:</strong> {{ canvasInfo.dimensions }}</p>
        <p>
          <strong>Context:</strong> {{ canvasInfo.context ? '可用' : '不可用' }}
        </p>
      </div>
    </div>

    <div class="debug-section">
      <h4>3. Chart.js 檢查</h4>
      <button @click="testChartJS">測試 Chart.js</button>
      <div
        v-if="chartJSInfo"
        class="debug-info"
      >
        <p><strong>Chart.js 版本:</strong> {{ chartJSInfo.version }}</p>
        <p>
          <strong>註冊狀態:</strong>
          {{ chartJSInfo.registered ? '已註冊' : '未註冊' }}
        </p>
        <p>
          <strong>測試圖表:</strong>
          {{ chartJSInfo.testChart ? '成功' : '失敗' }}
        </p>
      </div>
    </div>

    <div class="debug-section">
      <h4>4. 實際圖表測試</h4>
      <button @click="testRealChart">測試實際圖表</button>
      <div
        class="chart-container"
        style="height: 300px; background: #f0f0f0; border: 1px solid #ccc"
      >
        <canvas ref="debugCanvas"></canvas>
      </div>
    </div>

    <div class="debug-section">
      <h4>5. 控制台日誌</h4>
      <div class="console-log">
        <div
          v-for="(log, index) in consoleLogs"
          :key="index"
          class="log-item"
        >
          <span class="log-time">{{ log.time }}</span>
          <span
            class="log-level"
            :class="log.level"
            >{{ log.level }}</span
          >
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import { exchangeRateAPI } from '../services/api.js';

// 註冊 Chart.js
Chart.register(...registerables);

const debugData = ref(null);
const canvasInfo = ref(null);
const chartJSInfo = ref(null);
const debugCanvas = ref(null);
const consoleLogs = ref([]);

// 添加日誌
const addLog = (level, message) => {
  consoleLogs.value.push({
    time: new Date().toLocaleTimeString(),
    level,
    message,
  });
};

// 測試數據載入
const testDataLoad = async () => {
  addLog('INFO', '開始測試數據載入...');

  try {
    const data = await exchangeRateAPI.getHistoricalRates('USD', 'TWD', '1M');

    debugData.value = {
      status: '成功',
      dataPoints: data.data?.length || 0,
      dataType: data.isSimulatedData ? '模擬數據' : '真實數據',
      error: null,
    };

    addLog('SUCCESS', `數據載入成功: ${data.data?.length || 0} 個數據點`);

    // 檢查數據格式
    if (data.data && data.data.length > 0) {
      const firstItem = data.data[0];
      addLog('INFO', `數據格式: ${JSON.stringify(firstItem)}`);
    }
  } catch (error) {
    debugData.value = {
      status: '失敗',
      dataPoints: 0,
      dataType: '無',
      error: error.message,
    };

    addLog('ERROR', `數據載入失敗: ${error.message}`);
  }
};

// 測試 Canvas
const testCanvas = () => {
  addLog('INFO', '開始測試 Canvas...');

  const canvas = debugCanvas.value;

  if (!canvas) {
    canvasInfo.value = {
      exists: false,
      dimensions: 'N/A',
      context: false,
    };
    addLog('ERROR', 'Canvas 元素不存在');
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const context = canvas.getContext('2d');

  canvasInfo.value = {
    exists: true,
    dimensions: `${rect.width}x${rect.height}`,
    context: !!context,
  };

  addLog('SUCCESS', `Canvas 檢查完成: ${rect.width}x${rect.height}`);
};

// 測試 Chart.js
const testChartJS = () => {
  addLog('INFO', '開始測試 Chart.js...');

  try {
    const version = Chart.version;
    const registered = Chart.registry && Chart.registry.controllers;

    chartJSInfo.value = {
      version: version || '未知',
      registered: !!registered,
      testChart: false,
    };

    addLog('SUCCESS', `Chart.js 版本: ${version}`);

    // 測試創建簡單圖表
    const canvas = debugCanvas.value;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const testChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [
            {
              label: '測試',
              data: [1, 2, 3],
              borderColor: '#4caf50',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });

      chartJSInfo.value.testChart = true;
      addLog('SUCCESS', '測試圖表創建成功');

      // 清理測試圖表
      setTimeout(() => {
        testChart.destroy();
      }, 2000);
    }
  } catch (error) {
    chartJSInfo.value = {
      version: '錯誤',
      registered: false,
      testChart: false,
    };

    addLog('ERROR', `Chart.js 測試失敗: ${error.message}`);
  }
};

// 測試實際圖表
const testRealChart = async () => {
  addLog('INFO', '開始測試實際圖表...');

  try {
    // 載入數據
    const data = await exchangeRateAPI.getHistoricalRates('USD', 'TWD', '1M');

    if (!data.data || data.data.length === 0) {
      addLog('ERROR', '沒有可用的圖表數據');
      return;
    }

    // 準備圖表數據
    const labels = data.data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
      });
    });

    const rates = data.data.map((item) => item.rate);

    // 創建圖表
    const canvas = debugCanvas.value;
    if (!canvas) {
      addLog('ERROR', 'Canvas 元素不存在');
      return;
    }

    const ctx = canvas.getContext('2d');

    // 銷毀現有圖表
    if (window.debugChartInstance) {
      window.debugChartInstance.destroy();
    }

    window.debugChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'USD/TWD',
            data: rates,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#333',
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#333',
            },
          },
        },
      },
    });

    addLog('SUCCESS', '實際圖表創建成功');
  } catch (error) {
    addLog('ERROR', `實際圖表測試失敗: ${error.message}`);
  }
};

onMounted(() => {
  addLog('INFO', '圖表調試工具已載入');
});
</script>

<style scoped>
.chart-debug {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 20px;
}

.debug-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.debug-section button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.debug-section button:hover {
  background: #0056b3;
}

.debug-info {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.debug-info p {
  margin: 5px 0;
  font-family: monospace;
}

.console-log {
  background: #1e1e1e;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 5px;
}

.log-time {
  color: #888;
  margin-right: 10px;
}

.log-level {
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 10px;
  font-weight: bold;
}

.log-level.INFO {
  background: #17a2b8;
  color: white;
}

.log-level.SUCCESS {
  background: #28a745;
  color: white;
}

.log-level.ERROR {
  background: #dc3545;
  color: white;
}

.chart-container {
  position: relative;
  margin-top: 10px;
}
</style>
