# Watch It - 價格追蹤工具

一個支持 PWA 的即時價格追蹤應用，可以監控股票、加密貨幣和商品價格。

## ✨ 功能特性

- 📊 即時價格監控
- 💱 匯率查詢與圖表
- 🔔 價格提醒通知
- 📱 PWA 支持 - 可安裝到桌面
- 🌐 離線訪問
- 📈 歷史數據圖表

## 🚀 快速開始

### 安裝依賴

```bash
pnpm install
# 或
npm install
```

### 開發環境

```bash
pnpm dev
# 或
npm run dev
```

### 生產構建

```bash
pnpm build
# 或
npm run build
```

### 預覽生產版本

```bash
pnpm preview
# 或
npm run preview
```

## 🎨 PWA 圖標設置

項目已包含 PWA 配置，但需要生成圖標：

1. **使用瀏覽器工具生成（推薦）**
   ```bash
   # 在瀏覽器中打開
   open generate-icons.html
   ```
   然後按照頁面說明保存圖標到 `public/icons/` 目錄

2. **使用佔位符腳本**
   ```bash
   node scripts/generate-placeholder-icons.js
   ```

詳細說明請查看 [PWA_SETUP.md](./PWA_SETUP.md)

## 📦 項目結構

```
watch-it/
├── public/              # 靜態資源
│   ├── icons/          # PWA 圖標
│   ├── manifest.json   # PWA Manifest
│   └── sw.js          # Service Worker
├── src/
│   ├── components/    # Vue 組件
│   ├── services/      # API 服務
│   ├── stores/        # Pinia 狀態管理
│   └── utils/         # 工具函數
└── api/               # Serverless API 函數

```

## 🔧 環境變量設置

```bash
# 設置環境變量
pnpm setup-env
# 或
npm run setup-env
```

### 推播通知設定（重要！）

推播通知需要配置 VAPID 密鑰，特別是 **Safari 瀏覽器需要有效的 P-256 公鑰**：

```bash
# 1. 生成 VAPID 密鑰對
npm run generate-vapid

# 2. 創建 .env 文件並填入生成的密鑰
# 查看 ENV_VAPID_SETUP.md 了解詳細步驟
```

**Safari 推播通知錯誤？** 查看 [Safari 推播通知快速修復指南](./SAFARI_NOTIFICATION_QUICK_FIX.md)

## 📚 相關文檔

所有詳細文檔已移至 `docs/` 目錄：

### 基礎設定
- [PWA 設定指南](./docs/PWA_SETUP.md)
- [部署指南](./docs/DEPLOYMENT.md)
- [環境變量管理](./docs/ENV_MANAGEMENT.md)
- [安全性指南](./docs/SECURITY.md)

### 推播通知
- [VAPID 密鑰設定指南](./docs/ENV_VAPID_SETUP.md)
- [Safari 推播通知快速修復](./docs/SAFARI_NOTIFICATION_QUICK_FIX.md) ⭐
- [Safari 推播通知詳細技術文檔](./docs/SAFARI_PUSH_NOTIFICATION_FIX.md)

## 🛠️ 技術棧

- **框架**: Vue 3
- **構建工具**: Vite
- **狀態管理**: Pinia
- **圖表**: Chart.js
- **PWA**: vite-plugin-pwa
- **部署**: Vercel

## 📄 License

MIT
