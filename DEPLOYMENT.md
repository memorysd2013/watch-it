# 🚀 部署指南

## Vercel 部署步驟

### 1. 準備工作

1. 確保你有一個 GitHub 帳號
2. 將專案推送到 GitHub 倉庫
3. 註冊 Vercel 帳號並連結 GitHub

### 2. 環境變數設定

在 Vercel 專案設定中新增以下環境變數：

```bash
# Vercel Cron 認證密鑰
CRON_SECRET=your-random-secret-key

# VAPID 金鑰 (用於推播通知)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-email@example.com

# Alpha Vantage API Key (美股資料)
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

### 3. 生成 VAPID 金鑰

```bash
# 安裝 web-push
npm install -g web-push

# 生成 VAPID 金鑰
web-push generate-vapid-keys
```

### 4. 部署到 Vercel

1. 在 Vercel Dashboard 中點擊 "New Project"
2. 選擇你的 GitHub 倉庫
3. 設定專案名稱
4. 確認環境變數已設定
5. 點擊 "Deploy"

### 5. 驗證部署

1. 訪問你的 Vercel 網址
2. 測試搜尋功能
3. 測試推播通知
4. 檢查 Cron 任務是否正常執行

## 本地開發

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

## 故障排除

### 推播通知不工作

1. 檢查 VAPID 金鑰是否正確設定
2. 確認瀏覽器支援推播通知
3. 檢查 Service Worker 是否正確註冊

### API 請求失敗

1. 檢查 API 金鑰是否有效
2. 確認網路連接正常
3. 檢查 API 配額是否用完

### Cron 任務不執行

1. 檢查 `vercel.json` 設定
2. 確認 `CRON_SECRET` 環境變數
3. 檢查 Vercel 專案設定

## 效能優化

### 前端優化

1. 啟用 Vite 的程式碼分割
2. 使用 CDN 加速靜態資源
3. 實作快取策略

### 後端優化

1. 實作 API 快取
2. 使用資料庫儲存訂閱資訊
3. 優化 Cron 任務執行時間

## 監控和日誌

### Vercel 監控

1. 使用 Vercel Analytics 監控效能
2. 檢查 Function 執行日誌
3. 監控錯誤率

### 自訂監控

1. 實作錯誤追蹤
2. 監控 API 使用量
3. 設定告警機制

## 安全考量

1. 定期更新依賴套件
2. 使用 HTTPS
3. 實作 API 速率限制
4. 保護敏感資訊

## 擴展功能

### 資料庫整合

1. 使用 Vercel Postgres
2. 儲存用戶訂閱資訊
3. 實作用戶認證

### 進階通知

1. 實作價格警報
2. 自訂通知時間
3. 多語言支援

### 分析功能

1. 價格歷史圖表
2. 投資組合追蹤
3. 績效分析
