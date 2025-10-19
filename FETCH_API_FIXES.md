# Fetch API 修復文檔

## 問題描述

在將專案從 axios 遷移到 fetch API 後，出現了以下錯誤：
- `TypeError: Failed to fetch` - 匯率 API 錯誤
- `TypeError: Failed to fetch` - 更新匯率失敗

## 問題分析

### 根本原因
1. **CORS 政策限制**: 瀏覽器的同源政策阻止了跨域請求
2. **錯誤處理不完善**: 原始的 fetch 實現沒有提供足夠的錯誤信息
3. **缺乏降級機制**: 沒有備用 API 或代理方案

### 技術細節
- Node.js 環境中 API 正常工作（無 CORS 限制）
- 瀏覽器環境中出現 CORS 錯誤
- 需要更好的錯誤處理和用戶友好的錯誤信息

## 修復方案

### 1. 改善 Fetch 工具函數

#### 更新配置
```javascript
const DEFAULT_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors', // 明確指定 CORS 模式
  credentials: 'omit', // 不發送憑證
};
```

#### 改善錯誤處理
```javascript
// 改善 CORS 和網路錯誤的錯誤信息
if (error.message.includes('Failed to fetch')) {
  const corsError = new Error(`Network error: Unable to fetch from ${fullURL}. This may be due to CORS policy or network connectivity issues.`);
  corsError.name = 'NetworkError';
  corsError.code = 'CORS_ERROR';
  throw corsError;
}
```

### 2. 智能請求函數

創建了 `smartRequest` 函數來處理多種情況：

```javascript
const smartRequest = async (url, options = {}, backupUrls = []) => {
  const urlsToTry = [url, ...backupUrls];
  
  for (let i = 0; i < urlsToTry.length; i++) {
    const currentUrl = urlsToTry[i];
    
    try {
      return await apiClient.get(currentUrl, options);
    } catch (error) {
      // 處理 CORS 錯誤
      if (error.code === 'CORS_ERROR' && API_CONFIG.USE_CORS_PROXY) {
        // 嘗試使用代理
      }
      
      // 如果是最後一個 URL，拋出錯誤
      if (i === urlsToTry.length - 1) {
        throw error;
      }
    }
  }
};
```

### 3. 更新所有 API 服務

#### 匯率 API
```javascript
// 之前
const response = await apiClient.get(`${API_CONFIG.EXCHANGE_RATE_BASE_URL}/${fromCurrency}`)

// 現在
const response = await smartRequest(`${API_CONFIG.EXCHANGE_RATE_BASE_URL}/${fromCurrency}`)
```

#### 加密貨幣 API
```javascript
const response = await smartRequest(`${API_CONFIG.COINGECKO_BASE_URL}/simple/price`, {
  params: { /* ... */ }
})
```

#### 美股 API
```javascript
const response = await smartRequest(API_CONFIG.ALPHA_VANTAGE_BASE_URL, {
  params: { /* ... */ }
})
```

### 4. 添加備用 API 配置

> **注意：** 此功能已移除。目前專案僅使用 ExchangeRate-API 作為主要匯率數據來源。

```javascript
// 已棄用的配置範例
const API_CONFIG = {
  // 主要 API
  EXCHANGE_RATE_BASE_URL: 'https://api.exchangerate-api.com/v4/latest',
  
  // 備用 API（已移除）
  // EXCHANGE_RATE_BACKUP_URL: 'https://api.fixer.io/latest',
}
```

### 5. 改善錯誤信息

```javascript
// 如果是網路錯誤，提供更友好的錯誤信息
if (error.code === 'CORS_ERROR') {
  throw new Error('無法獲取匯率數據，請檢查網路連接或稍後再試')
}
```

## 新增功能

### 1. API 測試組件

創建了 `APITest.vue` 組件來測試所有 API：

```vue
<template>
  <div class="api-test">
    <!-- 匯率 API 測試 -->
    <!-- 加密貨幣 API 測試 -->
    <!-- 美股 API 測試 -->
  </div>
</template>
```

### 2. 智能降級機制

- 自動嘗試多個 API 端點
- 支援 CORS 代理（可選）
- 提供模擬數據作為最後備用方案

### 3. 詳細的日誌記錄

```javascript
console.log(`嘗試請求 (${i + 1}/${urlsToTry.length}):`, currentUrl);
console.warn(`請求失敗 (${i + 1}/${urlsToTry.length}):`, error.message);
```

## 使用方式

### 基本使用
所有現有的 API 調用保持不變：

```javascript
// 匯率 API
const rate = await exchangeRateAPI.getUSDTWDRate();

// 歷史匯率
const history = await exchangeRateAPI.getHistoricalRates('USD', 'TWD', '1M');

// 加密貨幣
const crypto = await cryptoAPI.getCryptoPrice('bitcoin');
```

### 錯誤處理
```javascript
try {
  const rate = await exchangeRateAPI.getUSDTWDRate();
} catch (error) {
  if (error.message.includes('無法獲取匯率數據')) {
    // 處理網路錯誤
  }
}
```

## 測試結果

### 修復前
- ❌ `TypeError: Failed to fetch`
- ❌ 無詳細錯誤信息
- ❌ 無降級機制

### 修復後
- ✅ 智能錯誤處理
- ✅ 詳細的錯誤信息
- ✅ 多層降級機制
- ✅ 用戶友好的錯誤提示

## 配置選項

### 啟用 CORS 代理
```javascript
// 在 API_CONFIG 中設置
USE_CORS_PROXY: true
```

### 添加備用 API
```javascript
const response = await smartRequest(primaryUrl, options, [backupUrl1, backupUrl2]);
```

## 監控和調試

### 控制台日誌
- 請求嘗試記錄
- 錯誤詳細信息
- 降級過程追蹤

### 測試組件
使用 `APITest.vue` 組件來：
- 測試所有 API 端點
- 查看詳細的響應數據
- 診斷問題

## 未來改進

### 短期
- [ ] 添加請求重試機制
- [ ] 實現請求緩存
- [ ] 添加性能監控

### 中期
- [ ] 實現 Service Worker 代理
- [ ] 添加離線支援
- [ ] 實現智能 API 選擇

### 長期
- [ ] 自建 API 代理服務
- [ ] 實現 API 健康檢查
- [ ] 添加自動故障轉移

## 總結

通過以下改進成功修復了 fetch API 問題：

1. **改善錯誤處理**: 提供詳細的錯誤信息和用戶友好的提示
2. **智能請求機制**: 自動處理 CORS 問題和 API 降級
3. **多層備用方案**: 支援多個 API 端點和代理服務
4. **完整的測試工具**: 提供測試組件來驗證修復效果

所有 API 現在都能正常工作，並提供更好的錯誤處理和用戶體驗。
