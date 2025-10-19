# 匯率走勢圖功能

## 功能概述

為「匯率」功能新增了外幣價格走勢圖表，支援多種時間週期和貨幣對，提供直觀的價格變化視覺化。

## 新增功能

### 1. 價格走勢圖表
- **線圖顯示**: 使用 Chart.js 繪製美觀的線圖
- **時間週期**: 支援 1週、1月、1季、半年、1年
- **互動功能**: 滑鼠懸停顯示詳細資訊
- **響應式設計**: 適配不同螢幕尺寸

### 2. 多貨幣支援
- **支援貨幣**: USD, TWD, EUR, JPY, GBP, AUD, CAD, CHF, CNY, KRW
- **貨幣資訊**: 包含國旗、符號、名稱等完整資訊
- **擴充性**: 易於新增更多貨幣

### 3. 時間週期選擇器
- **1週**: 顯示過去7天的價格變化
- **1月**: 顯示過去30天的價格變化
- **1季**: 顯示過去90天的價格變化
- **半年**: 顯示過去180天的價格變化
- **1年**: 顯示過去365天的價格變化

## 技術實現

### 新增組件

#### 1. ExchangeRateChart.vue
```vue
<ExchangeRateChart
  :from-currency="rateData.from"
  :to-currency="rateData.to"
  initial-period="1M"
/>
```

**功能特點:**
- 使用 Chart.js 繪製線圖
- 支援時間週期切換
- 自動載入歷史數據
- 錯誤處理和重試機制
- 模擬數據備用方案

#### 2. CurrencySelector.vue
```vue
<CurrencySelector v-model="selectedPair" />
```

**功能特點:**
- 貨幣對選擇界面
- 視覺化貨幣資訊
- 響應式網格布局

#### 3. ExchangeRateDemo.vue
```vue
<ExchangeRateDemo />
```

**功能特點:**
- 完整功能演示
- 組件整合展示
- 互動式測試

### 新增配置

#### currencies.js
```javascript
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', name: '美金', symbol: '$', flag: '🇺🇸' },
  TWD: { code: 'TWD', name: '台幣', symbol: 'NT$', flag: '🇹🇼' },
  // ... 更多貨幣
}
```

**功能特點:**
- 統一貨幣配置管理
- 支援貨幣資訊擴充
- 格式化工具函數

### API 擴展

#### 新增方法
```javascript
// 獲取指定貨幣對匯率
exchangeRateAPI.getExchangeRate(fromCurrency, toCurrency)

// 獲取歷史匯率數據
exchangeRateAPI.getHistoricalRates(fromCurrency, toCurrency, period)

// 模擬歷史數據
exchangeRateAPI.getMockHistoricalData(fromCurrency, toCurrency, period)
```

**功能特點:**
- 支援多種貨幣對
- 歷史數據獲取
- 模擬數據備用
- 錯誤處理機制

## 使用方式

### 1. 在現有組件中使用
```vue
<template>
  <ExchangeRateCard :rate-data="rateData">
    <!-- 圖表會自動顯示 -->
  </ExchangeRateCard>
</template>
```

### 2. 獨立使用圖表組件
```vue
<template>
  <ExchangeRateChart
    from-currency="USD"
    to-currency="TWD"
    initial-period="1M"
  />
</template>
```

### 3. 選擇不同貨幣對
```vue
<template>
  <CurrencySelector v-model="selectedPair" />
  <ExchangeRateChart
    :from-currency="selectedPair.from"
    :to-currency="selectedPair.to"
  />
</template>
```

## 數據來源

### 主要 API
- **ExchangeRate-API**: 提供即時和歷史匯率數據
- **免費方案**: 每月 1,500 次請求
- **歷史數據**: 支援過去一年的數據

### 備用方案
- **模擬數據**: API 不可用時自動切換
- **真實波動**: 基於實際匯率範圍生成
- **多貨幣支援**: 包含主要貨幣對的基準匯率

## 樣式設計

### 主題色彩
- **主色調**: #64b5f6 (藍色)
- **背景色**: #2c2c54 (深藍)
- **文字色**: #ffffff (白色)
- **輔助色**: #b0bec5 (灰色)

### 響應式設計
- **桌面版**: 完整功能展示
- **平板版**: 適配中等螢幕
- **手機版**: 優化觸控體驗

## 擴充性設計

### 新增貨幣
1. 在 `currencies.js` 中添加貨幣配置
2. 在 `DEFAULT_CURRENCY_PAIRS` 中添加貨幣對
3. 在模擬數據中添加基準匯率

### 新增時間週期
1. 在 `TIME_PERIODS` 中添加週期配置
2. 在 API 中處理新的週期邏輯
3. 在組件中添加對應選項

### 新增圖表類型
1. 擴展 `ExchangeRateChart` 組件
2. 添加新的 Chart.js 配置
3. 實現相應的數據處理邏輯

## 性能優化

### 數據緩存
- 組件級別緩存歷史數據
- 避免重複 API 請求
- 智能數據更新策略

### 圖表優化
- 按需渲染圖表
- 響應式圖表尺寸
- 平滑動畫效果

### 錯誤處理
- 優雅的錯誤提示
- 自動重試機制
- 降級方案支持

## 測試建議

### 功能測試
1. 測試不同貨幣對的圖表顯示
2. 測試時間週期切換功能
3. 測試 API 失敗時的模擬數據
4. 測試響應式布局

### 性能測試
1. 測試大量數據點的渲染性能
2. 測試圖表切換的流暢度
3. 測試記憶體使用情況

### 兼容性測試
1. 測試不同瀏覽器支援
2. 測試不同螢幕尺寸
3. 測試觸控設備操作

## 未來改進

### 短期目標
- [ ] 添加更多圖表類型 (柱狀圖、面積圖)
- [ ] 實現數據導出功能
- [ ] 添加技術指標顯示

### 中期目標
- [ ] 實現即時數據更新
- [ ] 添加價格警報功能
- [ ] 支援更多數據源

### 長期目標
- [ ] 實現預測分析
- [ ] 添加社交分享功能
- [ ] 支援自定義圖表配置

## 依賴項目

### 新增依賴
```json
{
  "chart.js": "^4.5.0",
  "vue-chartjs": "^5.3.2"
}
```

### 現有依賴
- Vue 3
- Axios
- Pinia

## 部署注意事項

1. 確保 Chart.js 正確載入
2. 檢查 API 請求限制
3. 測試模擬數據功能
4. 驗證響應式設計

## 維護指南

### 定期檢查
- API 使用量監控
- 圖表性能評估
- 用戶反饋收集

### 更新策略
- 定期更新 Chart.js 版本
- 監控 API 服務狀態
- 優化數據載入策略
