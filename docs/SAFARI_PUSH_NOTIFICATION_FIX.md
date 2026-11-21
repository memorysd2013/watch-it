# Safari 推播通知錯誤修復指南

## 錯誤訊息
```
applicationServerKey must contain a valid P-256 public key
```

## 問題原因

Safari 對 Web Push 通知的 VAPID 公鑰驗證比其他瀏覽器（Chrome、Firefox）更加嚴格：

1. **公鑰格式要求**：必須是有效的 P-256（prime256v1）橢圓曲線公鑰
2. **長度驗證**：解碼後的公鑰必須正好是 65 bytes
3. **編碼格式**：必須是正確的 base64url 編碼

## 解決方案

### 步驟 1: 生成有效的 VAPID 密鑰對

```bash
# 方法 1: 使用我們提供的腳本
node scripts/generate-vapid-keys.js

# 方法 2: 使用 web-push CLI
npx web-push generate-vapid-keys
```

### 步驟 2: 配置環境變數

創建 `.env` 文件並添加生成的密鑰：

```env
# 前端使用（需要 VITE_ 前綴）
VITE_VAPID_PUBLIC_KEY=你的公鑰

# 後端使用
VAPID_PRIVATE_KEY=你的私鑰
VAPID_EMAIL=mailto:your-email@example.com
```

### 步驟 3: 更新後端 API

更新 `api/notifications/subscribe.js`：

```javascript
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:your-email@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)
```

### 步驟 4: 驗證修復

1. **清除舊的訂閱**：
   ```javascript
   // 在瀏覽器 Console 中執行
   navigator.serviceWorker.getRegistration().then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       if (sub) sub.unsubscribe()
     })
   })
   ```

2. **測試新的訂閱**：
   - 重新載入頁面
   - 開啟通知設定
   - 點擊「啟用推播通知」
   - 應該不再出現錯誤

## 技術細節

### P-256 公鑰規格

- **曲線**：NIST P-256（也稱為 prime256v1 或 secp256r1）
- **未壓縮格式**：65 bytes
  - 第 1 byte：0x04（未壓縮標記）
  - 第 2-33 bytes：X 座標（32 bytes）
  - 第 34-65 bytes：Y 座標（32 bytes）
- **Base64 編碼長度**：88 字符（不含 padding）

### Safari 特定檢查

我們的修復在 `src/services/notification.js` 中添加了以下檢查：

```javascript
// 1. 驗證公鑰長度
if (!vapidPublicKey || vapidPublicKey.length < 80) {
  throw new Error('VAPID 公鑰格式不正確')
}

// 2. 驗證解碼後的長度（P-256 標準）
if (applicationServerKey.length !== 65) {
  throw new Error(`VAPID 公鑰長度不正確: ${applicationServerKey.length} bytes`)
}
```

## 常見問題

### Q1: 為什麼在 Chrome 上正常，Safari 上出錯？

**A**: Chrome 和 Firefox 對公鑰格式的驗證較寬鬆，可能接受某些不完全符合標準的公鑰。Safari 嚴格遵循 Web Push Protocol 標準，只接受完全符合 P-256 規格的公鑰。

### Q2: 更換公鑰後，舊的訂閱怎麼辦？

**A**: 更換公鑰後，所有使用舊公鑰的訂閱都會失效。用戶需要重新訂閱。建議在更換公鑰前通知用戶。

### Q3: 如何在生產環境中管理密鑰？

**A**: 
1. 使用環境變數存儲密鑰
2. 不要將私鑰提交到 Git
3. 在 Vercel/Netlify 等平台的環境變數設定中配置
4. 為不同環境（開發/生產）使用不同的密鑰對

### Q4: 可以使用預設的公鑰嗎？

**A**: 不建議。預設公鑰可能：
- 不符合 P-256 標準（導致 Safari 錯誤）
- 被其他人使用（安全風險）
- 沒有對應的私鑰（無法發送推播）

## 調試技巧

### 檢查公鑰是否有效

在瀏覽器 Console 中執行：

```javascript
const publicKey = 'YOUR_PUBLIC_KEY_HERE'
const decoded = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))
console.log('公鑰長度:', decoded.length, 'bytes')
console.log('是否有效:', decoded.length === 65 ? '✅' : '❌')
console.log('首字節:', '0x' + decoded[0].toString(16), decoded[0] === 0x04 ? '✅' : '❌')
```

### 啟用詳細日誌

```javascript
// 在 notification.js 中啟用調試
const DEBUG = true

if (DEBUG) {
  console.log('VAPID 公鑰:', vapidPublicKey)
  console.log('公鑰長度:', vapidPublicKey.length)
  console.log('解碼後長度:', applicationServerKey.length)
}
```

## 相關資源

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [P-256 Curve](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [web-push Library](https://github.com/web-push-libs/web-push)

## 更新日誌

- **2024-10-19**: 修復 Safari VAPID 公鑰驗證問題
  - 改進 `urlBase64ToUint8Array` 函數
  - 添加公鑰長度驗證（65 bytes）
  - 添加更詳細的錯誤訊息
  - 創建密鑰生成腳本

