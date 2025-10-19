# 📊 Watch It - 股票與加密貨幣價格監控

一個現代化的股票和加密貨幣價格監控應用程式，支援台股、美股和加密貨幣，具備推播通知和每日摘要功能。

## ✨ 功能特色

- 🔍 **多市場支援**: 台股、美股、加密貨幣、匯率監控
- 📱 **推播通知**: 價格變動即時通知
- 📊 **監控清單**: 自訂監控項目管理
- 🔄 **自動更新**: 每5分鐘自動更新價格
- 📈 **每日摘要**: 每日定時推播價格摘要
- 💾 **本地儲存**: 資料自動儲存到瀏覽器
- 🎨 **現代化 UI**: 響應式設計，支援手機和桌面

## 🚀 快速開始

### 安裝依賴

```bash
npm install
# 或
pnpm install
```

### 開發模式

```bash
npm run dev
# 或
pnpm dev
```

### 建置生產版本

```bash
npm run build
# 或
pnpm build
```

## 🔧 設定說明

### 1. API 金鑰設定

在 `src/services/api.js` 中設定你的 API 金鑰：

```javascript
// Alpha Vantage API Key (美股資料)
ALPHA_VANTAGE_API_KEY: 'your-api-key-here'
```

### 2. 推播通知設定

1. 生成 VAPID 金鑰：
```bash
npx web-push generate-vapid-keys
```

2. 在 `src/services/notification.js` 中更新 VAPID 公鑰
3. 在 API 路由中設定 VAPID 私鑰

### 3. Vercel 部署設定

1. 建立 `vercel.json` 設定檔
2. 設定環境變數：
   - `CRON_SECRET`: Cron 任務認證密鑰
   - `VAPID_PUBLIC_KEY`: VAPID 公鑰
   - `VAPID_PRIVATE_KEY`: VAPID 私鑰
   - `VAPID_EMAIL`: 你的電子郵件

## 📱 使用方式

### 新增監控項目

1. 在搜尋表單中輸入股票代號或匯率對
2. 選擇類型（台股/美股/加密貨幣/匯率）
3. 點擊「新增到監控清單」

**支援的匯率對**:
- USD/TWD (美金對台幣)
- TWD/USD (台幣對美金)

### 推播通知設定

1. 點擊「啟用推播通知」按鈕
2. 允許瀏覽器通知權限
3. 設定通知偏好（價格變動、每日摘要等）

### 監控清單管理

- 查看所有監控項目的即時價格
- 使用篩選器按類型查看
- 手動重新整理價格
- 移除不需要的監控項目

## 🏗️ 技術架構

### 前端技術

- **Vue 3**: 現代化前端框架
- **Pinia**: 狀態管理
- **Vite**: 建置工具
- **Service Worker**: 推播通知支援

### API 整合

- **台股**: 台灣證券交易所 API
- **美股**: Alpha Vantage API
- **加密貨幣**: CoinGecko API
- **匯率**: ExchangeRate-API

### 部署平台

- **Vercel**: 前端部署和 Cron 任務
- **Vercel Functions**: 後端 API 和推播服務

## 📂 專案結構

```
watch-it/
├── src/
│   ├── components/          # Vue 組件
│   │   ├── SearchForm.vue   # 搜尋表單
│   │   ├── PriceCard.vue    # 價格卡片
│   │   ├── Watchlist.vue    # 監控清單
│   │   └── NotificationSettings.vue # 通知設定
│   ├── services/            # API 服務
│   │   ├── api.js          # 價格 API
│   │   └── notification.js # 推播通知
│   ├── stores/             # Pinia 狀態管理
│   │   └── watchlist.js    # 監控清單狀態
│   └── App.vue             # 主應用程式
├── api/                    # Vercel API 路由
│   ├── cron/              # Cron 任務
│   └── notifications/     # 推播通知 API
├── public/
│   └── sw.js              # Service Worker
└── vercel.json            # Vercel 設定
```

## 🔄 每日排程

應用程式使用 Vercel Cron 功能，每天上午 9 點自動執行以下任務：

1. 獲取所有監控項目的最新價格
2. 生成每日價格摘要
3. 發送推播通知給所有訂閱用戶

## 🛠️ 開發指南

### 新增市場支援

1. 在 `src/services/api.js` 中新增 API 服務
2. 更新 `getPrice` 函數
3. 在搜尋表單中新增選項

### 自訂通知

1. 修改 `src/services/notification.js` 中的通知邏輯
2. 更新 Service Worker (`public/sw.js`)
3. 調整 API 路由中的推播內容

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 聯絡

如有問題或建議，請透過 GitHub Issues 聯絡。