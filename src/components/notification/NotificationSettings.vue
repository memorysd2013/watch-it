<template>
  <div class="notification-settings">
    <div class="settings-content">
      <!-- Support status -->
      <div class="support-status">
        <div class="status-item">
          <span class="status-label">瀏覽器支援</span>
          <span
            class="status-value"
            :class="supportStatus.isSupported ? 'status-ok' : 'status-error'"
          >
            {{ supportStatus.isSupported ? '支援' : '不支援' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">通知權限</span>
          <span
            class="status-value"
            :class="getPermissionClass()"
          >
            {{ getPermissionText() }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Service Worker</span>
          <span
            class="status-value"
            :class="
              supportStatus.hasServiceWorker ? 'status-ok' : 'status-error'
            "
          >
            {{ supportStatus.hasServiceWorker ? '已註冊' : '未註冊' }}
          </span>
        </div>
      </div>

      <!-- Notification options -->
      <div class="notification-options">
        <label class="option-label">
          <input
            type="checkbox"
            v-model="settings.priceAlerts"
            :disabled="!canEnableNotifications"
          />
          <span class="checkmark"></span>
          <span class="label-text">
            <span class="label-title">價格變動通知</span>
            <span class="label-desc">當監控的股票或加密貨幣價格有顯著變動時發送通知</span>
          </span>
        </label>

        <label class="option-label">
          <input
            type="checkbox"
            v-model="settings.dailySummary"
            :disabled="!canEnableNotifications"
          />
          <span class="checkmark"></span>
          <span class="label-text">
            <span class="label-title">每日摘要通知</span>
            <span class="label-desc">每天定時發送監控清單的價格摘要</span>
          </span>
        </label>

        <label class="option-label">
          <input
            type="checkbox"
            v-model="settings.soundEnabled"
            :disabled="!canEnableNotifications"
          />
          <span class="checkmark"></span>
          <span class="label-text">
            <span class="label-title">通知音效</span>
            <span class="label-desc">發送通知時播放音效</span>
          </span>
        </label>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button
          v-if="!isSubscribed"
          @click="enableNotifications"
          :disabled="loading || !supportStatus.isSupported"
          class="btn btn-primary"
        >
          <span
            v-if="loading"
            class="loading-spinner"
          ></span>
          {{ loading ? '設定中...' : '啟用推播通知' }}
        </button>

        <button
          v-if="isSubscribed"
          @click="disableNotifications"
          :disabled="loading"
          class="btn btn-danger"
        >
          <span
            v-if="loading"
            class="loading-spinner"
          ></span>
          {{ loading ? '停用中...' : '停用推播通知' }}
        </button>

        <button
          @click="testNotification"
          :disabled="!canEnableNotifications || loading"
          class="btn btn-secondary"
        >
          測試通知
        </button>
      </div>

      <!-- Subscription info -->
      <div
        v-if="isSubscribed"
        class="subscription-info"
      >
        <div class="info-item">
          <span class="info-label">訂閱狀態</span>
          <span class="info-value status-ok">已啟用</span>
        </div>
        <div class="info-item">
          <span class="info-label">啟用時間</span>
          <span class="info-value">{{ formatTime(subscriptionTime) }}</span>
        </div>
      </div>

      <!-- Error message -->
      <div
        v-if="error"
        class="message message-error"
      >
        {{ error }}
      </div>

      <!-- Success message -->
      <div
        v-if="success"
        class="message message-success"
      >
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useWatchlistStore } from '../../stores/watchlist.js';
import notificationService from '../../services/notification.js';

const watchlistStore = useWatchlistStore();

const loading = ref(false);
const error = ref('');
const success = ref('');
const isSubscribed = ref(false);
const subscriptionTime = ref('');
const supportStatus = ref({
  isSupported: false,
  permission: 'default',
  hasServiceWorker: false,
});

const settings = reactive({
  priceAlerts: true,
  dailySummary: true,
  soundEnabled: true,
});

const canEnableNotifications = computed(() => {
  return (
    supportStatus.value.isSupported &&
    supportStatus.value.permission === 'granted' &&
    supportStatus.value.hasServiceWorker
  );
});

const getPermissionText = () => {
  const permission = supportStatus.value.permission;
  switch (permission) {
    case 'granted':
      return '已授權';
    case 'denied':
      return '已拒絕';
    case 'default':
      return '未設定';
    default:
      return '未知';
  }
};

const getPermissionClass = () => {
  const permission = supportStatus.value.permission;
  switch (permission) {
    case 'granted':
      return 'status-ok';
    case 'denied':
      return 'status-error';
    case 'default':
      return 'status-warning';
    default:
      return 'status-error';
  }
};

const formatTime = (timeString) => {
  if (!timeString) return '--';
  return new Date(timeString).toLocaleString('zh-TW');
};

const enableNotifications = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await notificationService.initialize();
    const granted = await notificationService.requestPermission();
    if (!granted) {
      throw new Error('通知權限被拒絕');
    }

    await notificationService.subscribe();
    watchlistStore.setNotificationsEnabled(true);

    isSubscribed.value = true;
    subscriptionTime.value = new Date().toISOString();
    success.value = '推播通知已成功啟用';

    updateSupportStatus();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const disableNotifications = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await notificationService.unsubscribe();
    watchlistStore.setNotificationsEnabled(false);

    isSubscribed.value = false;
    subscriptionTime.value = '';
    success.value = '推播通知已停用';

    updateSupportStatus();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const testNotification = () => {
  try {
    notificationService.showNotification('測試通知', {
      body: '這是一個測試通知，如果您看到這個訊息，表示推播通知功能正常運作',
      icon: '/favicon.ico',
      requireInteraction: true,
    });
    success.value = '測試通知已發送';
  } catch (err) {
    error.value = '發送測試通知失敗: ' + err.message;
  }
};

const updateSupportStatus = () => {
  supportStatus.value = notificationService.getSupportStatus();
};

const checkSubscriptionStatus = async () => {
  try {
    const subscription = await notificationService.getSubscription();
    isSubscribed.value = !!subscription;

    if (subscription) {
      const savedTime = localStorage.getItem('subscriptionTime');
      if (savedTime) {
        subscriptionTime.value = savedTime;
      }
    }
  } catch (err) {
    console.error('檢查訂閱狀態失敗:', err);
  }
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(settings, parsed);
    }
  } catch (err) {
    console.error('載入通知設定失敗:', err);
  }
};

const saveSettings = () => {
  try {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  } catch (err) {
    console.error('儲存通知設定失敗:', err);
  }
};

onMounted(async () => {
  loadSettings();
  watchlistStore.loadNotificationsState();
  updateSupportStatus();
  await checkSubscriptionStatus();
});

watch(settings, saveSettings, { deep: true });
</script>

<style scoped>
.notification-settings {
  max-width: 640px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.support-status {
  background: var(--bg-raised);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.status-value {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  font-variant-numeric: tabular-nums;
}

.status-ok {
  color: var(--color-down);
}

.status-error {
  color: var(--color-up);
}

.status-warning {
  color: var(--accent);
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.option-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
}

.option-label input[type='checkbox'] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all var(--duration-fast) var(--ease);
  background: var(--bg-raised);
  margin-top: 2px;
}

.option-label input[type='checkbox']:checked + .checkmark {
  background: var(--accent);
  border-color: var(--accent);
}

.option-label input[type='checkbox']:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-deepest);
  font-size: 12px;
  font-weight: bold;
}

.option-label input[type='checkbox']:disabled + .checkmark {
  opacity: 0.5;
  cursor: not-allowed;
}

.label-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.label-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.btn {
  height: 40px;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--accent);
  color: var(--bg-deepest);
}

.btn-primary:hover:not(:disabled) {
  background: rgba(245, 165, 36, 0.9);
}

.btn-danger {
  background: var(--color-up);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(229, 72, 77, 0.9);
}

.btn-secondary {
  background: var(--bg-raised);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-subtle);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.subscription-info {
  background: rgba(48, 164, 108, 0.1);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(48, 164, 108, 0.3);
  border-left-width: 3px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.info-value {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.message {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border-left-width: 3px;
  font-size: var(--text-sm);
}

.message-error {
  background: rgba(229, 72, 77, 0.1);
  color: var(--color-up);
  border: 1px solid rgba(229, 72, 77, 0.3);
}

.message-success {
  background: rgba(48, 164, 108, 0.1);
  color: var(--color-down);
  border: 1px solid rgba(48, 164, 108, 0.3);
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
