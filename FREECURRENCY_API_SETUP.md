# FreeCurrencyAPI 設定指南

## 📋 概述

本專案支援使用 FreeCurrencyAPI 來獲取真實的歷史匯率數據，以提供更準確的價格走勢圖。

## 🎯 為什麼使用 FreeCurrencyAPI？

- ✅ **免費版本**：每月 5000 次 API 請求
- ✅ **真實數據**：提供真實的歷史匯率數據
- ✅ **簡單易用**：API 設計簡潔，易於整合
- ✅ **無需信用卡**：註冊免費帳號即可使用
- ✅ **支援多貨幣**：支援 150+ 種貨幣

## 🚀 快速開始

### 步驟 1：註冊 FreeCurrencyAPI

1. 前往 [FreeCurrencyAPI 官網](https://freecurrencyapi.com)
2. 點擊 "Sign Up" 註冊免費帳號
3. 驗證您的電子郵件地址
4. 登入後前往 Dashboard

### 步驟 2：獲取 API Key

1. 在 Dashboard 中找到您的 API Key
2. 複製 API Key（格式類似：`fca_live_xxxxxxxxxxxxxxxxx`）

### 步驟 3：設定環境變數

#### 開發環境

1. 在專案根目錄創建 `.env` 檔案：
```bash
touch .env
```

2. 在 `.env` 檔案中添加以下內容：
```env
VITE_FREECURRENCY_API_KEY=your_api_key_here
```

3. 將 `your_api_key_here` 替換為您的實際 API Key

#### 生產環境（Vercel）

1. 登入 Vercel Dashboard
2. 選擇您的專案
3. 前往 "Settings" → "Environment Variables"
4. 添加新的環境變數：
   - **Name**: `VITE_FREECURRENCY_API_KEY`
   - **Value**: 您的 API Key
   - **Environment**: 選擇 Production, Preview, Development

### 步驟 4：重新啟動應用

```bash
# 停止當前運行的開發伺服器（Ctrl+C）
# 重新啟動
npm run dev
```

## 📊 驗證設定

### 檢查 Console 日誌

當您查看匯率圖表時，打開瀏覽器的開發者工具（F12），在 Console 中查看：

#### 成功使用真實數據：
```
🌐 從 API 獲取歷史匯率數據: USD/TWD (1W)
📡 嘗試從 FreeCurrencyAPI 獲取真實歷史數據...
✅ 成功獲取真實歷史數據
💾 快取數據已儲存: historical_rates_{"from":"USD","to":"TWD","period":"1W"}
```

#### 使用模擬數據（無 API Key）：
```
🌐 從 API 獲取歷史匯率數據: USD/TWD (1W)
🎲 使用模擬數據生成歷史趨勢
💾 快取數據已儲存: historical_rates_{"from":"USD","to":"TWD","period":"1W"}
```

### 檢查數據來源

在圖表下方的資訊區域，您會看到：
- **真實數據**：「來自 FreeCurrencyAPI 的真實歷史匯率數據」
- **模擬數據**：「基於當前匯率生成的歷史趨勢圖，僅供參考」

## 🔧 API 使用限制

### 免費版限制

- **請求次數**：5000 次/月
- **歷史數據**：支援
- **更新頻率**：每日更新
- **支援貨幣**：150+ 種

### 快取機制

為了節省 API 配額，本專案實作了智能快取系統：

1. **Memory 快取**：數據存儲在記憶體中，頁面刷新前有效
2. **LocalStorage 快取**：數據持久化存儲，隔日自動失效
3. **自動清理**：過期數據會自動清除

**實際 API 調用頻率：**
- 每個貨幣對每個時間週期每天只調用 1 次 API
- 例如：USD/TWD 的 1W、1M、3M、6M、1Y 各調用 1 次/天
- 預估每月使用：約 150-300 次（遠低於 5000 次限制）

## 🔧 最近修復

### 422 驗證錯誤修復（2025-10-19）

**問題：** FreeCurrency API 返回 422 Validation Error

**原因：** API 參數名稱錯誤
- ❌ 錯誤參數：`date_from`, `date_to`
- ✅ 正確參數：`datetime_start`, `datetime_end`（ISO8601 格式）

**解決方案：**
根據 [FreeCurrency API 文檔](https://freecurrencyapi.com/docs/status-codes#validation-errors)，historical endpoint 需要使用：
- `datetime_start`: ISO8601 格式（例如：2021-12-31T23:59:59Z）
- `datetime_end`: ISO8601 格式（例如：2021-12-31T23:59:59Z）
- 時間順序：`datetime_start` 必須早於或等於 `datetime_end`

## 🐛 常見問題

### Q1: 為什麼還是顯示模擬數據？

**可能原因：**
1. 環境變數未正確設定
2. 應用未重新啟動
3. API Key 無效或過期

**解決方法：**
```bash
# 檢查環境變數
echo $VITE_FREECURRENCY_API_KEY

# 重新啟動應用
npm run dev
```

### Q2: API Key 在哪裡查看？

登入 [FreeCurrencyAPI Dashboard](https://app.freecurrencyapi.com/dashboard)，在主頁面即可看到您的 API Key。

### Q3: 如何知道剩餘配額？

在 FreeCurrencyAPI Dashboard 中可以查看：
- 本月已使用次數
- 剩餘配額
- 使用歷史記錄

### Q4: 超過配額會怎樣？

- 系統會自動切換回模擬數據
- 不會影響應用正常運行
- 下個月配額會自動重置

### Q5: 可以升級到付費版嗎？

可以！FreeCurrencyAPI 提供多種付費方案：
- **Starter**: $9.99/月 - 100,000 次請求
- **Professional**: $29.99/月 - 500,000 次請求
- **Enterprise**: 自訂方案

## 📝 環境變數範例

### `.env` 檔案範例

```env
# FreeCurrencyAPI 設定
VITE_FREECURRENCY_API_KEY=fca_live_xxxxxxxxxxxxxxxxx

# 其他 API 設定（可選）
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### `.env.example` 檔案（提交到 Git）

```env
# FreeCurrencyAPI 設定
# 前往 https://freecurrencyapi.com 註冊並獲取 API Key
VITE_FREECURRENCY_API_KEY=

# 其他 API 設定（可選）
VITE_ALPHA_VANTAGE_API_KEY=
```

## 🔒 安全注意事項

1. **不要提交 `.env` 到 Git**
   - 確保 `.env` 在 `.gitignore` 中
   - 只提交 `.env.example` 作為範本

2. **定期更換 API Key**
   - 如果 API Key 洩露，立即在 Dashboard 中重新生成

3. **限制 API Key 權限**
   - FreeCurrencyAPI 的 API Key 只有讀取權限，相對安全

## 📚 相關資源

- [FreeCurrencyAPI 官方文檔](https://freecurrencyapi.com/docs)
- [FreeCurrencyAPI Dashboard](https://app.freecurrencyapi.com/dashboard)
- [支援的貨幣列表](https://freecurrencyapi.com/docs/currency-list)

## 🎉 完成！

設定完成後，您的應用將自動使用真實的歷史匯率數據，提供更準確的價格走勢圖！

---

**需要幫助？** 請查看 [FreeCurrencyAPI 官方文檔](https://freecurrencyapi.com/docs) 或在專案中提交 Issue。

