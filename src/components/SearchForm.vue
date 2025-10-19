<template>
  <div class="search-form">
    <div class="search-header">
      <h2>新增監控項目</h2>
      <p>搜尋台股、美股或加密貨幣代號</p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="search-form-content"
    >
      <div class="form-group">
        <label for="symbol">代號</label>
        <input
          id="symbol"
          v-model="form.symbol"
          type="text"
          placeholder="例如: 2330, AAPL, bitcoin"
          required
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="type">類型</label>
        <select
          id="type"
          v-model="form.type"
          required
          :disabled="loading"
        >
          <option value="">選擇類型</option>
          <option value="twse">台股</option>
          <option value="us">美股</option>
          <option value="crypto">加密貨幣</option>
        </select>
      </div>

      <div class="form-group">
        <label for="name">名稱 (選填)</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="自訂名稱"
          :disabled="loading"
        />
      </div>

      <button
        type="submit"
        :disabled="loading || !form.symbol || !form.type"
        class="submit-btn"
      >
        <span
          v-if="loading"
          class="loading-spinner"
        ></span>
        {{ loading ? '搜尋中...' : '新增到監控清單' }}
      </button>
    </form>

    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>

    <div
      v-if="success"
      class="success-message"
    >
      {{ success }}
    </div>

    <!-- 搜尋建議 -->
    <div
      v-if="suggestions.length > 0"
      class="suggestions"
    >
      <h4>搜尋建議:</h4>
      <ul>
        <li
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
        >
          <span class="suggestion-symbol">{{ suggestion.symbol }}</span>
          <span class="suggestion-name">{{ suggestion.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useWatchlistStore } from '../stores/watchlist.js';
import { cryptoAPI } from '../services/api.js';

const watchlistStore = useWatchlistStore();

// 表單資料
const form = reactive({
  symbol: '',
  type: '',
  name: '',
});

// 狀態
const loading = ref(false);
const error = ref('');
const success = ref('');
const suggestions = ref([]);

// 監聽代號變化，提供搜尋建議
watch(
  () => form.symbol,
  async (newSymbol) => {
    if (newSymbol.length >= 2 && form.type === 'crypto') {
      try {
        const cryptoList = await cryptoAPI.getCryptoList();
        suggestions.value = cryptoList
          .filter(
            (crypto) =>
              crypto.id.toLowerCase().includes(newSymbol.toLowerCase()) ||
              crypto.symbol.toLowerCase().includes(newSymbol.toLowerCase())
          )
          .slice(0, 5)
          .map((crypto) => ({
            id: crypto.id,
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
          }));
      } catch (err) {
        console.error('獲取加密貨幣建議失敗:', err);
      }
    } else {
      suggestions.value = [];
    }
  }
);

// 選擇建議
const selectSuggestion = (suggestion) => {
  form.symbol = suggestion.symbol;
  form.name = suggestion.name;
  suggestions.value = [];
};

// 提交表單
const handleSubmit = async () => {
  if (!form.symbol || !form.type) return;

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await watchlistStore.addItem(form.symbol, form.type, form.name);
    success.value = `成功新增 ${form.symbol} 到監控清單`;

    // 重置表單
    form.symbol = '';
    form.type = '';
    form.name = '';
    suggestions.value = [];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// 清除訊息
const clearMessages = () => {
  error.value = '';
  success.value = '';
};

// 監聽表單變化，清除舊訊息
watch([() => form.symbol, () => form.type], clearMessages);
</script>

<style scoped>
.search-form {
  padding: 24px;
}

.search-header {
  text-align: center;
  margin-bottom: 24px;
}

.search-header h2 {
  margin: 0 0 8px 0;
  color: var(--text-bright);
  font-size: 24px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.search-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.search-form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text-bright);
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background-color: rgba(25, 32, 56, 0.5);
  color: var(--text-bright);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
  background-color: rgba(25, 32, 56, 0.8);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: rgba(13, 17, 36, 0.5);
  cursor: not-allowed;
  opacity: 0.5;
}

.submit-btn {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: var(--bg-primary);
  border: 1px solid var(--accent-cyan);
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 217, 255, 0.5),
    0 4px 20px rgba(33, 150, 243, 0.4);
}

.submit-btn:disabled {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.5;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
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

.error-message {
  background: rgba(255, 71, 87, 0.15);
  color: var(--danger);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--danger);
  border-left: 4px solid var(--danger);
  margin-top: 16px;
  font-size: 14px;
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.2);
  backdrop-filter: blur(10px);
}

.success-message {
  background: rgba(0, 255, 136, 0.15);
  color: var(--success);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--success);
  border-left: 4px solid var(--success);
  margin-top: 16px;
  font-size: 14px;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(10px);
}

.suggestions {
  margin-top: 16px;
  padding: 16px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.suggestions h4 {
  margin: 0 0 12px 0;
  color: var(--text-bright);
  font-size: 14px;
}

.suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.suggestion-item:hover {
  background: rgba(0, 217, 255, 0.1);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
}

.suggestion-symbol {
  font-weight: 700;
  color: var(--accent-cyan);
}

.suggestion-name {
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .search-form {
    padding: 16px;
  }

  .search-header h2 {
    font-size: 20px;
  }
}
</style>
