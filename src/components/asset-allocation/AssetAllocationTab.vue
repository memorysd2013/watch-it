<template>
  <div class="asset-allocation">
    <div class="tab-header">
      <div class="header-title">
        <h2>資產配置</h2>
        <div class="header-buttons">
          <button
            v-if="assetItems.length > 0"
            class="toggle-view-btn"
            @click="viewMode = viewMode === 'list' ? 'chart' : 'list'"
          >
            {{ viewMode === 'list' ? '📊 圖表' : '📋 列表' }}
          </button>
          <button
            class="add-asset-btn"
            @click="openAddAsset"
          >
            ➕ 新增資產項目
          </button>
        </div>
      </div>
      <div class="header-total">
        <div
          v-if="assetItems.length > 0"
          class="total-display"
        >
          <span class="total-label">總資產 (TWD)</span>
          <span class="total-value">{{ formatAmount(store.totalAmount) }}</span>
        </div>
        <div
          v-if="!exchangeStore.isUsingApiRate"
          class="default-rate-block"
        >
          <span class="default-rate-label">預設匯率 1 USD =</span>
          <input
            v-model.number="defaultRateInput"
            type="number"
            min="1"
            step="0.01"
            class="default-rate-input"
            @blur="applyDefaultRate"
          />
          <span class="default-rate-unit">TWD</span>
        </div>
      </div>
    </div>

    <div
      v-if="assetItems.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">📈</div>
      <h3>還沒有資產項目</h3>
      <p>點擊「新增資產項目」開始記錄您的資產配置</p>
      <button
        class="add-first-btn"
        @click="openAddAsset"
      >
        新增第一個資產項目
      </button>
    </div>

    <div
      v-else
      class="asset-content"
    >
      <AssetAllocationChart
        v-if="viewMode === 'chart'"
        :selected-asset-item="chartSelectedAsset"
        @select-asset="chartSelectedAsset = $event"
        @clear-selection="chartSelectedAsset = null"
      />
      <div
        v-else
        class="asset-cards"
      >
        <AssetItemCard
          v-for="item in assetItems"
          :key="item.id"
          :asset-item="item"
          @edit-asset="openEditAsset"
          @add-sub="openAddSub"
          @edit-sub="openEditSub"
        />
      </div>
    </div>

    <AssetItemForm
      :show="showAssetForm"
      :edit-item="editingAssetItem"
      @submit="onAssetSubmit"
      @cancel="closeAssetForm"
    />

    <SubItemForm
      :show="showSubForm"
      :edit-sub-item="editingSubItem"
      @submit="onSubSubmit"
      @cancel="closeSubForm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAssetAllocationStore } from '../../stores/assetAllocation.js';
import { useExchangeRateStore } from '../../stores/exchangeRate.js';
import AssetItemCard from './AssetItemCard.vue';
import AssetAllocationChart from './AssetAllocationChart.vue';
import AssetItemForm from './AssetItemForm.vue';
import SubItemForm from './SubItemForm.vue';

const store = useAssetAllocationStore();
const exchangeStore = useExchangeRateStore();

const assetItems = computed(() => store.getAllAssetItems);
const defaultRateInput = ref(exchangeStore.defaultUsdTwdRate);

watch(
  () => exchangeStore.defaultUsdTwdRate,
  (v) => {
    defaultRateInput.value = v;
  },
);

const showAssetForm = ref(false);
const editingAssetItem = ref(null);

const showSubForm = ref(false);
const editingAssetItemForSub = ref(null);
const editingSubItem = ref(null);
const chartSelectedAsset = ref(null);
const viewMode = ref('list'); // 'list' | 'chart'

const formatAmount = (val) => {
  if (val == null || isNaN(val)) return '—';
  return Number(val).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const openAddAsset = () => {
  editingAssetItem.value = null;
  showAssetForm.value = true;
};

const openEditAsset = (item) => {
  editingAssetItem.value = item;
  showAssetForm.value = true;
};

const onAssetSubmit = ({ name, targetPercent }) => {
  if (editingAssetItem.value) {
    store.updateAssetItem(editingAssetItem.value.id, name, targetPercent);
  } else {
    store.addAssetItem(name, targetPercent);
  }
  closeAssetForm();
};

const closeAssetForm = () => {
  showAssetForm.value = false;
  editingAssetItem.value = null;
};

const openAddSub = (assetItem) => {
  editingAssetItemForSub.value = assetItem;
  editingSubItem.value = null;
  showSubForm.value = true;
};

const openEditSub = (assetItem, subItem) => {
  editingAssetItemForSub.value = assetItem;
  editingSubItem.value = subItem;
  showSubForm.value = true;
};

const applyDefaultRate = () => {
  const n = Number(defaultRateInput.value);
  if (!isNaN(n) && n > 0) exchangeStore.setDefaultRate(n);
};

const onSubSubmit = ({ name, amount, currency, targetPercent }) => {
  if (!editingAssetItemForSub.value) return;

  if (editingSubItem.value) {
    store.updateSubItem(
      editingAssetItemForSub.value.id,
      editingSubItem.value.id,
      name,
      amount,
      targetPercent,
      currency,
    );
  } else {
    store.addSubItem(
      editingAssetItemForSub.value.id,
      name,
      amount,
      targetPercent,
      currency,
    );
  }
  closeSubForm();
};

const closeSubForm = () => {
  showSubForm.value = false;
  editingAssetItemForSub.value = null;
  editingSubItem.value = null;
};
</script>

<style scoped>
.asset-allocation {
  padding: 24px;
}

.tab-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-view-btn {
  padding: 6px 14px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-view-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.tab-header h2 {
  margin: 0;
  color: var(--text-bright);
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.header-total {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.default-rate-block {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid var(--warning);
  border-radius: 10px;
  font-size: 13px;
}

.default-rate-label {
  color: var(--text-secondary);
}

.default-rate-input {
  width: 72px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-bright);
  font-size: 14px;
  text-align: right;
}

.default-rate-input:focus {
  outline: none;
  border-color: var(--accent-cyan);
}

.default-rate-unit {
  color: var(--text-muted);
  font-size: 12px;
}

.total-display {
  padding: 10px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-cyan);
  text-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
}

.add-asset-btn {
  padding: 6px 14px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: var(--bg-primary);
  border: 1px solid var(--accent-cyan);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.25);
}

.add-asset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.3));
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--text-bright);
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.add-first-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  color: var(--bg-primary);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(0, 217, 255, 0.5);
}

.asset-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.asset-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 768px) {
  .asset-allocation {
    padding: 0 12px;
  }

  .tab-header {
    grid-template-columns: 1fr auto;
  }

  .header-total {
    justify-content: flex-end;
  }
}
</style>
