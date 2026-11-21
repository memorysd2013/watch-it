<template>
  <div class="search-form">
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
          placeholder="例如: 2330, bitcoin"
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
        {{ loading ? '搜尋中***REMOVED***' : '新增到監控清單' }}
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
import { useWatchlistStore } from '../../stores/watchlist.js';
import { cryptoAPI } from '../../services/api/index.js';

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
  max-width: 560px;
}

.search-form-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.form-group input,
.form-group select {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: inherit;
  background: var(--bg-raised);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--ease);
}

.form-group select {
  cursor: pointer;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(245, 165, 36, 0.1);
  background: var(--bg-page);
}

.form-group input:disabled,
.form-group select:disabled {
  background: var(--bg-subtle);
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-btn {
  height: 40px;
  background: var(--accent);
  color: var(--bg-deepest);
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
  margin-top: var(--space-2);
}

.submit-btn:hover:not(:disabled) {
  background: rgba(245, 165, 36, 0.9);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.submit-btn:disabled {
  background: var(--bg-raised);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.5;
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

.error-message {
  background: rgba(229, 72, 77, 0.1);
  color: var(--color-up);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(229, 72, 77, 0.3);
  border-left-width: 3px;
  margin-top: var(--space-4);
  font-size: var(--text-sm);
}

.success-message {
  background: rgba(48, 164, 108, 0.1);
  color: var(--color-down);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(48, 164, 108, 0.3);
  border-left-width: 3px;
  margin-top: var(--space-4);
  font-size: var(--text-sm);
}

.suggestions {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--bg-raised);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
}

.suggestions h4 {
  margin: 0 0 var(--space-2) 0;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease);
  border: 1px solid transparent;
}

.suggestion-item:hover {
  background: var(--bg-subtle);
  border-color: var(--border-default);
}

.suggestion-symbol {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.suggestion-name {
  color: var(--text-muted);
  font-size: var(--text-sm);
}
</style>
