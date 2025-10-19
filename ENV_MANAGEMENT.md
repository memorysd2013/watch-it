# 🌍 環境變數管理指南

## 📁 建議的環境變數檔案結構

### 1. **`.env.local`** (本地開發)
- **用途**: 本地開發環境
- **包含**: 開發用的 API Key 和設定
- **安全性**: 已加入 .gitignore，不會提交到 Git

### 2. **`.env.staging`** (測試環境)
- **用途**: 測試環境部署
- **包含**: 測試用的 API Key 和設定
- **安全性**: 已加入 .gitignore

### 3. **`.env.prod`** (生產環境參考)
- **用途**: 生產環境部署參考
- **包含**: 生產環境的環境變數範例
- **安全性**: 已加入 .gitignore，僅作為參考

## 🚀 快速建立環境檔案

### 建立單一環境檔案
```bash
# 本地開發環境
npm run setup-env:local

# 測試環境
npm run setup-env:staging

# 生產環境
npm run setup-env:prod
```

### 建立所有環境檔案
```bash
# 一次建立所有環境檔案
npm run setup-env:all
```

## 🔧 各環境的差異

### 本地開發 (.env.local)
```bash
NODE_ENV=development
VITE_APP_URL=http://localhost:5173
# 使用開發用的 API Key
```

### 測試環境 (.env.staging)
```bash
NODE_ENV=staging
VITE_APP_URL=https://your-app-staging.vercel.app
# 使用測試用的 API Key
```

### 生產環境 (.env.prod)
```bash
NODE_ENV=production
VITE_APP_URL=https://your-app.vercel.app
# 使用生產用的 API Key
```

## 🛡️ 安全最佳實踐

### 1. 不同環境使用不同的 API Key
- **開發環境**: 使用免費額度或測試 Key
- **測試環境**: 使用獨立的測試 Key
- **生產環境**: 使用正式的生產 Key

### 2. 環境變數命名規範
```bash
# 前端環境變數 (會暴露給瀏覽器)
VITE_API_KEY=your-key
VITE_APP_URL=your-url

# 後端環境變數 (只在伺服器端)
DATABASE_URL=your-db-url
SECRET_KEY=your-secret
```

### 3. Vercel 部署設定
在 Vercel Dashboard 中設定環境變數時：
- **不需要** `VITE_` 前綴
- **需要** 設定所有必要的環境變數
- **建議** 為不同環境設定不同的值

## 📋 環境變數檢查清單

### 本地開發
- [ ] 建立 `.env.local`
- [ ] 設定開發用的 API Key
- [ ] 測試本地功能
- [ ] 確認推播通知正常

### 測試環境
- [ ] 建立 `.env.staging`
- [ ] 設定測試用的 API Key
- [ ] 部署到 Vercel Preview
- [ ] 測試所有功能

### 生產環境
- [ ] 建立 `.env.prod` (參考用)
- [ ] 在 Vercel 中設定環境變數
- [ ] 設定生產用的 API Key
- [ ] 部署到生產環境
- [ ] 監控系統運行狀況

## 🔄 環境切換流程

### 開發流程
1. 本地開發: 使用 `.env.local`
2. 功能測試: 部署到 Preview 環境
3. 生產部署: 部署到 Production 環境

### 部署流程
```bash
# 1. 本地開發
npm run dev

# 2. 建置測試版本
npm run build

# 3. 預覽建置結果
npm run preview

# 4. 部署到 Vercel (自動使用 Vercel 環境變數)
git push origin main
```

## 🚨 常見問題

### Q: 需要建立所有環境檔案嗎？
A: 不一定。建議至少建立：
- `.env.local` (本地開發必需)
- `.env.prod` (生產環境參考)

### Q: 測試環境是必需的嗎？
A: 不是必需的，但建議有。可以幫助：
- 測試新功能
- 驗證部署流程
- 避免直接影響生產環境

### Q: 如何管理不同環境的 API Key？
A: 建議：
- 開發環境: 使用免費額度
- 測試環境: 申請獨立的測試 Key
- 生產環境: 使用正式的生產 Key

### Q: Vercel 環境變數如何設定？
A: 在 Vercel Dashboard 中：
1. 進入專案設定
2. 選擇 Environment Variables
3. 新增變數 (注意不要 VITE_ 前綴)
4. 選擇適用的環境 (Production, Preview, Development)

## 📊 環境變數對照表

| 變數名稱 | 本地開發 | 測試環境 | 生產環境 | 說明 |
|---------|---------|---------|---------|------|
| NODE_ENV | development | staging | production | 環境模式 |
| VITE_APP_URL | localhost:5173 | staging.vercel.app | your-app.vercel.app | 應用程式網址 |
| VITE_ALPHA_VANTAGE_API_KEY | 開發Key | 測試Key | 生產Key | 美股API |
| VAPID_PRIVATE_KEY | 開發私鑰 | 測試私鑰 | 生產私鑰 | 推播私鑰 |
| VITE_VAPID_PUBLIC_KEY | 開發公鑰 | 測試公鑰 | 生產公鑰 | 推播公鑰 |
| CRON_SECRET | 開發密鑰 | 測試密鑰 | 生產密鑰 | Cron認證 |
