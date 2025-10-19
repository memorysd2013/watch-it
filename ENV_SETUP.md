# 🔧 環境變數設定指南

## 📁 建立 .env.local 檔案

請在專案根目錄建立 `.env.local` 檔案，並填入以下內容：

```bash
# Watch It - 本地開發環境變數
# 請填入你的實際 API Key 和設定值

# ===== 高度私密 (絕對不能公開) =====
# VAPID 私鑰 - 用於伺服器端推播通知認證
# 生成方式: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=your-vapid-private-key-here

# Vercel Cron 認證密鑰 (隨機字串)
CRON_SECRET=your-random-secret-key-here

# ===== 中等私密 (需要保護) =====
# Alpha Vantage API Key - 美股資料
# 申請網址: https://www.alphavantage.co/support/#api-key
VITE_ALPHA_VANTAGE_API_KEY=KJXS30WM3BMR44WO

# ===== 低度私密 (相對安全) =====
# VAPID 公鑰 - 客戶端推播訂閱
# 生成方式: npx web-push generate-vapid-keys
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HI0lF3N3QbLYXopXD2XJpN5KFHvS0buXg3x1CJHBw2eGz8ZUrJ8L7rY8rE

# VAPID 聯絡電子郵件
VITE_VAPID_EMAIL=your-email@example.com

# ===== 開發設定 =====
# 開發模式
NODE_ENV=development

# 應用程式網址 (本地開發)
VITE_APP_URL=http://localhost:5173
```

## 🔑 需要設定的 API Key

### 1. Alpha Vantage API Key (已設定)
- **目前值**: `KJXS30WM3BMR44WO`
- **用途**: 美股資料
- **狀態**: ✅ 已設定

### 2. VAPID 金鑰 (需要生成)
你需要生成一對 VAPID 金鑰：

```bash
# 安裝 web-push (如果還沒安裝)
npm install -g web-push

# 生成 VAPID 金鑰
web-push generate-vapid-keys
```

生成後會得到：
- **Public Key**: 用於 `VITE_VAPID_PUBLIC_KEY`
- **Private Key**: 用於 `VAPID_PRIVATE_KEY`

### 3. CRON_SECRET (需要生成)
生成一個隨機密鑰：

```bash
# 方法 1: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2: 使用 openssl
openssl rand -hex 32

# 方法 3: 線上生成
# 前往 https://generate-secret.vercel.app/32
```

## 🚀 快速設定步驟

### 步驟 1: 建立 .env.local 檔案
```bash
# 在專案根目錄執行
touch .env.local
```

### 步驟 2: 複製範例內容
將上面的環境變數內容複製到 `.env.local` 檔案中

### 步驟 3: 生成 VAPID 金鑰
```bash
npx web-push generate-vapid-keys
```

### 步驟 4: 更新 .env.local
將生成的 VAPID 金鑰填入對應的環境變數

### 步驟 5: 生成 CRON_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步驟 6: 更新電子郵件
將 `VITE_VAPID_EMAIL` 改為你的實際電子郵件

## 🔍 驗證設定

### 檢查環境變數是否正確載入
在瀏覽器開發者工具中檢查：
```javascript
console.log(import.meta.env.VITE_ALPHA_VANTAGE_API_KEY)
console.log(import.meta.env.VITE_VAPID_PUBLIC_KEY)
```

### 測試 API 連線
1. 啟動開發伺服器：`npm run dev`
2. 嘗試新增美股到監控清單
3. 檢查是否成功獲取價格資料

## 🚨 重要注意事項

1. **不要提交 .env.local 到 Git**
   - 檔案已加入 .gitignore
   - 確保不會意外提交敏感資訊

2. **Vercel 部署設定**
   - 在 Vercel Dashboard 中設定相同的環境變數
   - 注意：Vercel 中不需要 `VITE_` 前綴

3. **API Key 安全**
   - 定期檢查 API 使用量
   - 監控異常請求
   - 考慮定期輪換金鑰

## 📋 檢查清單

- [ ] 建立 `.env.local` 檔案
- [ ] 設定 Alpha Vantage API Key
- [ ] 生成並設定 VAPID 金鑰
- [ ] 生成並設定 CRON_SECRET
- [ ] 設定 VAPID 電子郵件
- [ ] 測試本地開發環境
- [ ] 在 Vercel 中設定環境變數
- [ ] 測試推播通知功能

## 🆘 故障排除

### 環境變數未載入
- 確認檔案名稱為 `.env.local`
- 確認檔案在專案根目錄
- 重啟開發伺服器

### API 請求失敗
- 檢查 API Key 是否正確
- 檢查網路連線
- 檢查 API 額度

### 推播通知不工作
- 檢查 VAPID 金鑰是否正確
- 檢查瀏覽器是否支援推播
- 檢查 Service Worker 是否註冊
