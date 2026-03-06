<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="cancel"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEdit ? '編輯子項目' : '新增子項目' }}</h3>
        <button
          class="close-btn"
          @click="cancel"
          aria-label="關閉"
        >
          ✕
        </button>
      </div>
      <form
        class="modal-body"
        @submit.prevent="submit"
      >
        <div class="form-group">
          <label for="sub-name">名稱</label>
          <input
            id="sub-name"
            v-model="formName"
            type="text"
            placeholder="例如：台積電、0050"
            required
            autofocus
          />
        </div>
        <div class="form-group">
          <label for="sub-amount">金額</label>
          <div class="amount-row">
            <input
              id="sub-amount"
              v-model="formAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              required
            />
            <div class="currency-options">
              <label class="currency-option">
                <input
                  v-model="formCurrency"
                  type="radio"
                  value="TWD"
                />
                <span>台幣 (TWD)</span>
              </label>
              <label class="currency-option">
                <input
                  v-model="formCurrency"
                  type="radio"
                  value="USD"
                />
                <span>美金 (USD)</span>
              </label>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="sub-target">目標比例（選填，佔該資產 0–100%）</label>
          <input
            id="sub-target"
            v-model="formTargetPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="例如：50"
          />
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="btn-cancel"
            @click="cancel"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn-submit"
          >
            {{ isEdit ? '儲存' : '新增' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  editSubItem: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => !!props.editSubItem);
const formName = ref('');
const formAmount = ref('');
const formCurrency = ref('TWD');
const formTargetPercent = ref('');

watch(
  () => [props.show, props.editSubItem],
  () => {
    formName.value = props.editSubItem?.name ?? '';
    formAmount.value = props.editSubItem?.amount ?? '';
    formCurrency.value = props.editSubItem?.currency === 'USD' ? 'USD' : 'TWD';
    formTargetPercent.value =
      props.editSubItem?.targetPercent != null
        ? String(props.editSubItem.targetPercent)
        : '';
  },
  { immediate: true },
);

const submit = () => {
  const name = formName.value?.trim();
  const amount = parseFloat(formAmount.value);
  if (!name) return;
  if (isNaN(amount) || amount < 0) return;
  const raw = formTargetPercent.value;
  const targetPercent = raw != null && raw !== '' ? String(raw) : undefined;
  const currency = formCurrency.value === 'USD' ? 'USD' : 'TWD';
  emit('submit', { name, amount, currency, targetPercent });
};

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow:
    var(--shadow-lg),
    0 0 30px rgba(0, 217, 255, 0.15);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 217, 255, 0.05);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-bright);
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 71, 87, 0.2);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-bright);
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.amount-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.currency-options {
  display: flex;
  gap: 16px;
}

.currency-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
}

.currency-option input {
  width: auto;
  padding: 0;
}

.currency-option:hover {
  color: var(--text-bright);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  border-color: var(--text-muted);
  color: var(--text-bright);
}

.btn-submit {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  border: 1px solid var(--accent-cyan);
  color: var(--bg-primary);
}

.btn-submit:hover {
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
  transform: translateY(-1px);
}
</style>
