<template>
  <div class="notification-settings">
    <div class="settings-header">
      <h3>推播通知設定</h3>
      <p>設定價格變動和每日摘要通知</p>
    </div>

    <div class="settings-content">
      <!-- 支援狀態 -->
      <div class="support-status">
        <div class="status-item">
          <span class="status-label">瀏覽器支援:</span>
          <span
            class="status-value"
            :class="supportStatus.isSupported ? 'supported' : 'not-supported'"
          >
            {{ supportStatus.isSupported ? '✅ 支援' : '❌ 不支援' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">通知權限:</span>
          <span
            class="status-value"
            :class="getPermissionClass()"
          >
            {{ getPermissionText() }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Service Worker:</span>
          <span
            class="status-value"
            :class="
              supportStatus.hasServiceWorker ? 'supported' : 'not-supported'
            "
          >
            {{ supportStatus.hasServiceWorker ? '✅ 已註冊' : '❌ 未註冊' }}
          </span>
        </div>
      </div>

      <!-- 通知設定 -->
      <div class="notification-options">
        <div class="option-group">
          <label class="option-label">
            <input
              type="checkbox"
              v-model="settings.priceAlerts"
              :disabled="!canEnableNotifications"
            />
            <span class="checkmark"></span>
            價格變動通知
          </label>
          <p class="option-description">
            當監控的股票或加密貨幣價格有顯著變動時發送通知
          </p>
        </div>

        <div class="option-group">
          <label class="option-label">
            <input
              type="checkbox"
              v-model="settings.dailySummary"
              :disabled="!canEnableNotifications"
            />
            <span class="checkmark"></span>
            每日摘要通知
          </label>
          <p class="option-description">每天定時發送監控清單的價格摘要</p>
        </div>

        <div class="option-group">
          <label class="option-label">
            <input
              type="checkbox"
              v-model="settings.soundEnabled"
              :disabled="!canEnableNotifications"
            />
            <span class="checkmark"></span>
            通知音效
          </label>
          <p class="option-description">發送通知時播放音效</p>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <button
          v-if="!isSubscribed"
          @click="enableNotifications"
          :disabled="loading || !supportStatus.isSupported"
          class="enable-btn"
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
          class="disable-btn"
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
          class="test-btn"
        >
          測試通知
        </button>
      </div>

      <!-- 訂閱資訊 -->
      <div
        v-if="isSubscribed"
        class="subscription-info"
      >
        <h4>訂閱資訊</h4>
        <div class="info-item">
          <span class="info-label">訂閱狀態:</span>
          <span class="info-value">✅ 已啟用</span>
        </div>
        <div class="info-item">
          <span class="info-label">啟用時間:</span>
          <span class="info-value">{{ formatTime(subscriptionTime) }}</span>
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </div>

      <!-- 成功訊息 -->
      <div
        v-if="success"
        class="success-message"
      >
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useWatchlistStore } from '../stores/watchlist.js';
import notificationService from '../services/notification.js';

const watchlistStore = useWatchlistStore();

// 狀態
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

// 設定
const settings = reactive({
  priceAlerts: true,
  dailySummary: true,
  soundEnabled: true,
});

// 計算屬性
const canEnableNotifications = computed(() => {
  return (
    supportStatus.value.isSupported &&
    supportStatus.value.permission === 'granted' &&
    supportStatus.value.hasServiceWorker
  );
});

// 方法
const getPermissionText = () => {
  const permission = supportStatus.value.permission;
  switch (permission) {
    case 'granted':
      return '✅ 已授權';
    case 'denied':
      return '❌ 已拒絕';
    case 'default':
      return '⚠️ 未設定';
    default:
      return '❓ 未知';
  }
};

const getPermissionClass = () => {
  const permission = supportStatus.value.permission;
  switch (permission) {
    case 'granted':
      return 'supported';
    case 'denied':
      return 'not-supported';
    case 'default':
      return 'warning';
    default:
      return 'not-supported';
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
    // 初始化通知服務
    await notificationService.initialize();

    // 請求權限
    const granted = await notificationService.requestPermission();
    if (!granted) {
      throw new Error('通知權限被拒絕');
    }

    // 訂閱推播
    const subscription = await notificationService.subscribe();

    // 儲存設定
    watchlistStore.setNotificationsEnabled(true);

    isSubscribed.value = true;
    subscriptionTime.value = new Date().toISOString();
    success.value = '推播通知已成功啟用！';

    // 更新支援狀態
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
      body: '這是一個測試通知，如果您看到這個訊息，表示推播通知功能正常運作！',
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
      // 從本地儲存載入訂閱時間
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

// 生命週期
onMounted(async () => {
  // 載入設定
  loadSettings();

  // 載入通知狀態
  watchlistStore.loadNotificationsState();

  // 更新支援狀態
  updateSupportStatus();

  // 檢查訂閱狀態
  await checkSubscriptionStatus();
});

// 監聽設定變化
import { watch } from 'vue';
watch(settings, saveSettings, { deep: true });
</script>

<style scoped>
.notification-settings {
  padding: 24px;
}

.settings-header {
  text-align: center;
  margin-bottom: 24px;
}

.settings-header h3 {
  margin: 0 0 8px 0;
  color: var(--text-bright);
  font-size: 20px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.settings-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.support-status {
  background: var(--card-bg);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.status-value {
  font-size: 14px;
  font-weight: 600;
}

.status-value.supported {
  color: var(--success);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.status-value.not-supported {
  color: var(--danger);
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
}

.status-value.warning {
  color: var(--warning);
  text-shadow: 0 0 10px rgba(255, 165, 2, 0.3);
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-bright);
}

.option-label input[type='checkbox'] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  background: rgba(25, 32, 56, 0.5);
}

.option-label input[type='checkbox']:checked + .checkmark {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  border-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.4);
}

.option-label input[type='checkbox']:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--bg-primary);
  font-size: 12px;
  font-weight: bold;
}

.option-label input[type='checkbox']:disabled + .checkmark {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-description {
  margin: 0 0 0 32px;
  font-size: 14px;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.enable-btn,
.disable-btn,
.test-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.enable-btn {
  background: var(--gradient-success);
  color: var(--bg-primary);
  border: 1px solid var(--success);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.enable-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
}

.disable-btn {
  background: var(--gradient-danger);
  color: var(--text-bright);
  border: 1px solid var(--danger);
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.3);
}

.disable-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(255, 71, 87, 0.5);
}

.test-btn {
  background: rgba(25, 32, 56, 0.5);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.test-btn:hover:not(:disabled) {
  background: rgba(0, 217, 255, 0.15);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
}

.enable-btn:disabled,
.disable-btn:disabled,
.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
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

.subscription-info {
  background: rgba(0, 255, 136, 0.15);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--success);
  border-left: 4px solid var(--success);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(10px);
}

.subscription-info h4 {
  margin: 0 0 12px 0;
  color: var(--success);
  font-size: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--success);
}

.error-message {
  background: rgba(255, 71, 87, 0.15);
  color: var(--danger);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--danger);
  border-left: 4px solid var(--danger);
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
  font-size: 14px;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .notification-settings {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .enable-btn,
  .disable-btn,
  .test-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
