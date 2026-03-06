<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="cancel"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEdit ? '編輯資產項目' : '新增資產項目' }}</h3>
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
          <label for="asset-name">名稱</label>
          <input
            id="asset-name"
            v-model="formName"
            type="text"
            placeholder="例如：股票、不動產"
            required
            autofocus
          />
        </div>
        <div class="form-group">
          <label for="asset-target">目標比例（選填，0–100%）</label>
          <input
            id="asset-target"
            v-model="formTargetPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="例如：30"
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
  editItem: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => !!props.editItem);
const formName = ref('');
const formTargetPercent = ref('');

watch(
  () => [props.show, props.editItem],
  () => {
    formName.value = props.editItem?.name ?? '';
    formTargetPercent.value =
      props.editItem?.targetPercent != null
        ? String(props.editItem.targetPercent)
        : '';
  },
  { immediate: true },
);

const submit = () => {
  const name = formName.value?.trim();
  if (!name) return;
  const raw = formTargetPercent.value;
  const targetPercent = raw != null && raw !== '' ? String(raw) : undefined;
  emit('submit', { name, targetPercent });
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
