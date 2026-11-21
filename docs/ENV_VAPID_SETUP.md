# VAPID 密鑰環境變數設定指南

## 創建 .env 文件

在專案根目錄創建 `.env` 文件：

```bash
touch .env
```

## .env 文件內容範本

將以下內容複製到 `.env` 文件中，並替換為實際的值：

```env
# =====================================
# VAPID 密鑰（推播通知）
# =====================================
# 執行 "npm run generate-vapid" 生成密鑰對

# 前端使用（需要 VITE_ 前綴）
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here

# 後端使用（不要暴露給前端）
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_EMAIL=mailto:your-email@example.com

# =====================================
# API 金鑰（可選）
# =====================================
VITE_COINGECKO_API_KEY=your_coingecko_api_key_here
VITE_FREECURRENCY_API_KEY=your_freecurrency_api_key_here
```

## 生成 VAPID 密鑰

執行以下命令生成密鑰：

```bash
npm run generate-vapid
```

輸出範例：
```
✅ VAPID 密鑰對生成成功！

請將以下密鑰添加到您的 .env 文件中：

────────────────────────────────────────────────────────────────────────────────
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HI0lF3N3QbLYXopXD2XJpN5KFHvS0buXg3x1CJHBw2eGz8ZUrJ8L7rY8rE
VAPID_PRIVATE_KEY=abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG
────────────────────────────────────────────────────────────────────────────────
```

## 驗證設定

### 方法 1: 使用 Node.js

創建測試文件 `test-env.js`：

```javascript
// test-env.js
import dotenv from 'dotenv'
dotenv.config()

console.log('VITE_VAPID_PUBLIC_KEY:', process.env.VITE_VAPID_PUBLIC_KEY ? '✅ 已設定' : '❌ 未設定')
console.log('VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY ? '✅ 已設定' : '❌ 未設定')

if (process.env.VITE_VAPID_PUBLIC_KEY) {
  console.log('公鑰長度:', process.env.VITE_VAPID_PUBLIC_KEY.length, '字符')
  
  const decoded = Buffer.from(process.env.VITE_VAPID_PUBLIC_KEY, 'base64')
  console.log('解碼後長度:', decoded.length, 'bytes', decoded.length === 65 ? '✅' : '❌')
}
```

執行：
```bash
node test-env.js
```

### 方法 2: 在應用程式中檢查

啟動開發伺服器後，在瀏覽器 Console 中執行：

```javascript
console.log('VAPID 公鑰:', import.meta.env.VITE_VAPID_PUBLIC_KEY)
console.log('是否已設定:', import.meta.env.VITE_VAPID_PUBLIC_KEY ? '✅' : '❌')
```

## 重要注意事項

### ⚠️ 安全性

1. **不要提交 .env 到 Git**：
   ```bash
   # 確認 .gitignore 包含
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **不要分享私鑰**：
   - 私鑰只能在伺服器端使用
   - 不要在前端代碼、日誌或截圖中暴露私鑰

3. **使用不同的密鑰對於不同環境**：
   - 開發環境：`.env.local`
   - 測試環境：`.env.staging`
   - 生產環境：在部署平台的環境變數設定

### 📝 密鑰規格

- **公鑰格式**：Base64 編碼，88 字符
- **私鑰格式**：Base64 編碼，43 字符
- **解碼後公鑰長度**：65 bytes（P-256 標準）
- **首字節**：應為 0x04（未壓縮格式）

### 🔄 密鑰輪換

如果需要更換密鑰：

1. 生成新的密鑰對
2. 更新 .env 文件
3. 部署更新
4. 通知用戶重新訂閱通知

## 環境變數層級

Vite 會按以下順序載入環境變數（優先級由高到低）：

1. `.env.[mode].local`（例如 `.env.development.local`）
2. `.env.[mode]`（例如 `.env.production`）
3. `.env.local`
4. `.env`

## 除錯技巧

### 環境變數未載入

```bash
# 1. 確認檔案存在
ls -la .env

# 2. 確認內容
cat .env

# 3. 重新啟動開發伺服器
# Vite 只在啟動時載入環境變數
```

### 公鑰格式錯誤

```javascript
// 在瀏覽器 Console 中測試
const key = 'YOUR_PUBLIC_KEY'
const decoded = Uint8Array.from(atob(key), c => c.charCodeAt(0))
console.log('長度:', decoded.length)  // 應為 65
console.log('首字節:', decoded[0])    // 應為 4
```

## 相關文件

- [ENV_SETUP.md](./ENV_SETUP.md) - 完整的環境變數設定指南
- [SAFARI_NOTIFICATION_QUICK_FIX.md](./SAFARI_NOTIFICATION_QUICK_FIX.md) - Safari 推播通知修復
- [SAFARI_PUSH_NOTIFICATION_FIX.md](./SAFARI_PUSH_NOTIFICATION_FIX.md) - 詳細技術文檔

