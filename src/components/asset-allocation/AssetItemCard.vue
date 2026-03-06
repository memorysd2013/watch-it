<template>
  <div
    class="asset-card"
    @click="clearSelections"
  >
    <div
      class="card-header"
      @click.stop="toggleCardSelection"
    >
      <div class="asset-info">
        <h3 class="asset-name">{{ assetItem.name }}</h3>
        <div class="asset-summary">
          <span class="total-amount"
            >{{ formatAmount(itemTotal) }}
            <span class="currency-suffix">TWD</span></span
          >
          <span
            v-if="totalAmount > 0"
            class="percent-badge"
          >
            {{ formatPercent(itemPercent) }}
          </span>
        </div>
        <div
          v-if="getAssetTargetDisplay()"
          class="asset-target-row"
        >
          <span :class="['target-hint', getAssetTargetHintClass()]">
            {{ getAssetTargetDisplay() }}
          </span>
        </div>
      </div>
      <div
        v-if="cardSelected"
        class="card-actions-float"
        @click.stop
      >
        <button
          class="action-btn edit-btn"
          @click="$emit('edit-asset', assetItem)"
          title="編輯資產項目"
        >
          ✏️
        </button>
        <button
          class="action-btn add-btn"
          @click="$emit('add-sub', assetItem)"
          title="新增子項目"
        >
          ➕
        </button>
        <button
          class="action-btn remove-btn"
          @click="confirmRemove"
          title="刪除資產項目"
        >
          ✕
        </button>
      </div>
    </div>

    <div
      v-if="assetItem.subItems?.length > 0"
      class="sub-items"
    >
      <div class="sub-items-header">
        <span class="col-name">名稱</span>
        <span class="col-amount">金額</span>
        <span class="col-percent">
          <span class="percent-label">佔比</span>
          <span class="percent-hint">（總資產% / 資產項目%）</span>
        </span>
      </div>
      <div
        v-for="sub in assetItem.subItems"
        :key="sub.id"
        class="sub-item-block"
      >
        <div
          class="sub-item-row"
          :class="{ selected: selectedSubId === sub.id }"
          @click.stop="toggleSubSelection(sub.id)"
        >
          <span class="col-name">{{ sub.name }}</span>
          <span class="col-amount"
            >{{ formatAmount(getDisplayAmount(sub)) }}
            {{ getDisplayCurrency(sub) === 'USD' ? 'USD' : 'TWD' }}</span
          >
          <span class="col-percent">
            {{ totalAmount > 0 ? getSubPercentDisplay(sub) : '—' }}
          </span>
          <div
            v-if="selectedSubId === sub.id"
            class="sub-actions-float"
            @click.stop
          >
            <button
              class="sub-action-btn currency-toggle"
              :title="
                '切換顯示：' +
                (getDisplayCurrency(sub) === 'USD' ? '改為 TWD' : '改為 USD')
              "
              @click="toggleSubDisplay(sub)"
            >
              {{ getDisplayCurrency(sub) === 'USD' ? 'USD' : 'TWD' }}
            </button>
            <button
              class="sub-action-btn"
              @click="$emit('edit-sub', assetItem, sub)"
              title="編輯"
            >
              ✏️
            </button>
            <button
              class="sub-action-btn sub-remove"
              @click="confirmRemoveSub(sub)"
              title="刪除"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          v-if="getSubTargetDisplay(sub) || sub.targetPercent == null"
          class="sub-item-row-2"
        >
          <span
            v-if="getSubTargetDisplay(sub)"
            :class="['col-target', getSubTargetHintClass(sub)]"
          >
            {{ getSubTargetDisplay(sub) }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-else
      class="empty-subs"
      @click.stop="toggleCardSelection"
    >
      <p>尚無子項目，點擊此處或上方標題以顯示按鈕新增</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useAssetAllocationStore } from '../../stores/assetAllocation.js';
import { useExchangeRateStore } from '../../stores/exchangeRate.js';

const selectedSubId = ref(null);
const cardSelected = ref(false);
const subDisplayCurrency = reactive({});

const clearSelections = () => {
  selectedSubId.value = null;
  cardSelected.value = false;
};

const toggleCardSelection = () => {
  cardSelected.value = !cardSelected.value;
  selectedSubId.value = null;
};

const toggleSubSelection = (id) => {
  if (id) cardSelected.value = false;
  selectedSubId.value = selectedSubId.value === id ? null : id;
};

const toggleSubDisplay = (sub) => {
  const current = subDisplayCurrency[sub.id] ?? sub.currency ?? 'TWD';
  subDisplayCurrency[sub.id] = current === 'TWD' ? 'USD' : 'TWD';
};

const props = defineProps({
  assetItem: {
    type: Object,
    required: true,
  },
});

defineEmits(['edit-asset', 'add-sub', 'edit-sub']);

const store = useAssetAllocationStore();
const exchangeStore = useExchangeRateStore();

const totalAmount = computed(() => store.totalAmount);
const itemTotal = computed(() => store.getAssetItemTotal(props.assetItem));
const itemPercent = computed(() => store.getAssetItemPercent(props.assetItem));

const getSubPercent = (subItem) => {
  return store.getSubItemPercent(subItem, itemTotal.value);
};

const getSubPercentOfTotal = (subItem) => {
  return store.getSubItemPercentOfTotal(subItem);
};

const getSubPercentDisplay = (subItem) => {
  const ofTotal = getSubPercentOfTotal(subItem);
  const ofAsset = getSubPercent(subItem);
  return `${formatPercent(ofTotal)} / ${formatPercent(ofAsset)}`;
};

const getAssetTargetDisplay = () => {
  const target = props.assetItem.targetPercent;
  if (target == null || totalAmount.value <= 0) return '';
  const current = itemPercent.value;
  const diff = current - target;
  if (Math.abs(diff) < 0.1) return ''; // 符合時不顯示
  return diff > 0
    ? `目標 ${target}%，超出 ${diff.toFixed(1)}%`
    : `目標 ${target}%，低於 ${Math.abs(diff).toFixed(1)}%`;
};

const getAssetTargetHintClass = () => {
  const target = props.assetItem.targetPercent;
  if (target == null) return '';
  const current = itemPercent.value;
  const diff = current - target;
  if (Math.abs(diff) < 0.1) return 'target-match';
  return diff > 0 ? 'target-over' : 'target-under';
};

const getSubTargetDisplay = (sub) => {
  const target = sub.targetPercent;
  if (target == null || itemTotal.value <= 0) return '';
  const current = getSubPercent(sub);
  const diff = current - target;
  if (Math.abs(diff) < 0.1) return ''; // 符合時不顯示
  return diff > 0
    ? `目標 ${target}%，超出 ${diff.toFixed(1)}%`
    : `目標 ${target}%，低於 ${Math.abs(diff).toFixed(1)}%`;
};

const getSubTargetHintClass = (sub) => {
  const target = sub.targetPercent;
  if (target == null) return '';
  const current = getSubPercent(sub);
  const diff = current - target;
  if (Math.abs(diff) < 0.1) return 'target-match';
  return diff > 0 ? 'target-over' : 'target-under';
};

const getDisplayCurrency = (sub) => {
  return subDisplayCurrency[sub.id] ?? sub.currency ?? 'TWD';
};

const getDisplayAmount = (sub) => {
  const storedCurrency = sub.currency ?? 'TWD';
  const displayCurrency = getDisplayCurrency(sub);
  const amount = sub.amount ?? 0;
  const rate = exchangeStore.effectiveRate;
  if (displayCurrency === storedCurrency) return amount;
  if (storedCurrency === 'TWD' && displayCurrency === 'USD')
    return rate > 0 ? amount / rate : amount;
  if (storedCurrency === 'USD' && displayCurrency === 'TWD')
    return amount * rate;
  return amount;
};

const formatAmount = (val) => {
  if (val == null || isNaN(val)) return '—';
  return Number(val).toLocaleString('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatPercent = (val) => {
  if (val == null || isNaN(val)) return '—';
  return `${Number(val).toFixed(1)}%`;
};

const confirmRemove = () => {
  if (confirm(`確定要刪除「${props.assetItem.name}」嗎？`)) {
    store.removeAssetItem(props.assetItem.id);
  }
};

const confirmRemoveSub = (sub) => {
  if (confirm(`確定要刪除「${sub.name}」嗎？`)) {
    store.removeSubItem(props.assetItem.id, sub.id);
  }
};
</script>

<style scoped>
.asset-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-md), var(--shadow-glow);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.asset-card:hover {
  border-color: var(--border-glow);
  box-shadow:
    var(--shadow-lg),
    0 0 25px rgba(0, 217, 255, 0.15);
}

.card-header {
  position: relative;
  margin-bottom: 16px;
}

.asset-info h3 {
  margin: 0 0 8px 0;
  color: var(--text-bright);
  font-size: 20px;
  font-weight: 700;
}

.asset-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-cyan);
  text-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
}

.currency-suffix {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 2px;
}

.percent-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(33, 150, 243, 0.15);
  color: var(--accent-blue);
  border: 1px solid rgba(33, 150, 243, 0.4);
}

.card-actions-float {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 4px;
  background: var(--card-bg);
  padding: 4px 6px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 2;
}

.card-actions-float .action-btn {
  width: 28px;
  height: 28px;
  font-size: 12px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(0, 217, 255, 0.1);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.add-btn {
  background: rgba(0, 255, 136, 0.1);
  color: var(--success);
  border-color: var(--success);
}

.remove-btn {
  background: rgba(255, 71, 87, 0.1);
  color: var(--danger);
  border-color: var(--danger);
}

.action-btn:hover {
  transform: scale(1.05);
}

.edit-btn:hover {
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
}

.add-btn:hover {
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
}

.remove-btn:hover {
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.4);
}

.asset-target-row {
  margin-top: 8px;
  font-size: 12px;
}

.asset-target-row .target-hint {
  display: inline-block;
  padding: 0;
  border: none;
  background: none;
  border-radius: 0;
}

.sub-items {
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.sub-items-header {
  display: grid;
  grid-template-columns: 1fr 120px 80px;
  gap: 12px;
  padding: 8px 0;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.sub-item-block {
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sub-item-block:last-child {
  border-bottom: none;
}

.sub-item-row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 120px 80px;
  gap: 12px;
  align-items: center;
  padding: 10px 0 4px 0;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 8px;
  margin: 0 -4px;
}

.sub-item-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.sub-item-row.selected {
  background: rgba(0, 217, 255, 0.08);
}

.sub-actions-float {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  background: var(--card-bg);
  padding: 4px 6px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 2;
}

.sub-item-row-2 {
  padding: 4px 0 10px 0;
  padding-left: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.col-name {
  color: var(--text-primary);
}

.col-amount {
  color: var(--accent-cyan);
  font-weight: 600;
}

.col-percent {
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sub-items-header .percent-label {
  font-weight: 600;
}

.sub-items-header .percent-hint {
  font-size: 10px;
  font-weight: 400;
  color: var(--text-muted);
  text-transform: none;
}

.col-target {
  font-size: 12px;
}

.col-target-empty {
  color: var(--text-muted);
}

.target-over {
  color: var(--warning);
  font-weight: 600;
}

.target-under {
  color: var(--success);
  font-weight: 600;
}

.target-match {
  color: var(--success);
  font-weight: 600;
}

.target-hint {
  font-size: 12px;
}

.asset-summary .target-hint.target-over,
.asset-summary .target-hint.target-under,
.asset-summary .target-hint.target-match,
.asset-target-row .target-hint.target-over,
.asset-target-row .target-hint.target-under,
.asset-target-row .target-hint.target-match {
  background: none;
  border: none;
}

.sub-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.sub-action-btn:hover {
  background: rgba(0, 217, 255, 0.15);
  color: var(--accent-cyan);
}

.sub-action-btn.sub-remove:hover {
  background: rgba(255, 71, 87, 0.15);
  color: var(--danger);
}

.sub-action-btn.currency-toggle {
  font-size: 10px;
  padding: 4px 8px;
  min-width: 36px;
}

.empty-subs {
  margin-top: 16px;
  padding: 24px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.empty-subs p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

/* 平板 */
@media (max-width: 700px) {
  .sub-items-header,
  .sub-item-row {
    grid-template-columns: 1fr 90px 60px;
    gap: 8px;
    font-size: 13px;
  }

  .col-target {
    font-size: 11px;
  }
}

/* 手機：維持列表佈局，縮小欄寬 */
@media (max-width: 500px) {
  .asset-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .asset-info h3 {
    font-size: 18px;
  }

  .asset-summary {
    gap: 8px;
  }

  .total-amount {
    font-size: 20px;
  }

  .sub-items-header,
  .sub-item-row {
    grid-template-columns: minmax(0, 1fr) 70px 55px;
    gap: 6px 8px;
    font-size: 12px;
  }

  .sub-item-row {
    padding: 8px 0 4px 0;
    font-size: 12px;
  }

  .sub-item-row-2 {
    padding: 4px 0 8px 0;
    font-size: 11px;
  }

  .sub-items-header .percent-hint {
    font-size: 9px;
  }

  .col-amount {
    font-size: 12px;
  }

  .col-target {
    font-size: 10px;
  }

  .sub-action-btn {
    width: 26px;
    height: 26px;
    font-size: 11px;
  }

  .sub-actions-float {
    right: 2px;
    padding: 2px 4px;
  }

  .col-name {
    min-width: 0;
    word-break: break-word;
  }
}
</style>
