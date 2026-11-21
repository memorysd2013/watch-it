# Safari 推播通知快速修復指南

## 🚨 錯誤訊息
```
applicationServerKey must contain a valid P-256 public key
```

## ⚡ 快速修復（5 分鐘）

### 1️⃣ 生成新的 VAPID 密鑰對

```bash
npm run generate-vapid
```

你會看到類似以下的輸出：
```
✅ VAPID 密鑰對生成成功！

請將以下密鑰添加到您的 .env 文件中：

VITE_VAPID_PUBLIC_KEY=BN9xY8w...（88 字符）
VAPID_PRIVATE_KEY=abc123...（43 字符）
```

### 2️⃣ 創建 .env 文件

在專案根目錄創建 `.env` 文件：

```bash
# 複製範例文件
cp .env.example .env
```

然後填入剛才生成的密鑰：

```env
# 前端使用
VITE_VAPID_PUBLIC_KEY=BN9xY8w...（你的公鑰）

# 後端使用
VAPID_PRIVATE_KEY=abc123...（你的私鑰）
VAPID_EMAIL=mailto:your-email@example.com
```

### 3️⃣ 重新啟動開發伺服器

```bash
# 停止當前的開發伺服器（Ctrl+C）
# 重新啟動
npm run dev
```

### 4️⃣ 清除舊的推播訂閱

在 Safari 開發者工具的 Console 中執行：

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.pushManager.getSubscription().then(sub => {
      if (sub) {
        sub.unsubscribe().then(() => {
          console.log('✅ 舊訂閱已清除')
          location.reload()
        })
      }
    })
  }
})
```

### 5️⃣ 測試推播通知

1. 重新載入頁面
2. 打開側邊選單 → 通知設定
3. 點擊「啟用推播通知」
4. 允許通知權限
5. 點擊「測試通知」

✅ 如果看到測試通知，表示修復成功！

## 📦 部署到生產環境

### Vercel

1. 前往 Vercel Dashboard → 你的專案 → Settings → Environment Variables
2. 添加以下環境變數：
   ```
   VITE_VAPID_PUBLIC_KEY = 你的公鑰
   VAPID_PRIVATE_KEY = 你的私鑰
   VAPID_EMAIL = mailto:your-email@example.com
   ```
3. 重新部署專案

### Netlify

1. 前往 Netlify Dashboard → Site settings → Environment variables
2. 添加相同的環境變數
3. Trigger deploy

## 🔍 驗證修復

### 檢查公鑰是否有效

在瀏覽器 Console 中執行：

```javascript
// 替換為你的公鑰
const publicKey = 'BN9xY8w...'

try {
  const decoded = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))
  console.log('✅ 公鑰有效')
  console.log('長度:', decoded.length, 'bytes', decoded.length === 65 ? '✅' : '❌')
  console.log('首字節:', '0x' + decoded[0].toString(16), decoded[0] === 0x04 ? '✅' : '❌')
} catch (e) {
  console.error('❌ 公鑰無效:', e.message)
}
```

預期輸出：
```
✅ 公鑰有效
長度: 65 bytes ✅
首字節: 0x4 ✅
```

## ❓ 常見問題

### Q: 為什麼只有 Safari 出現這個錯誤？

A: Safari 嚴格驗證 VAPID 公鑰是否符合 P-256 標準（65 bytes）。Chrome 和 Firefox 的驗證較寬鬆。

### Q: 更換密鑰後，舊用戶怎麼辦？

A: 舊用戶需要重新訂閱通知。可以在 App 中顯示提示訊息，引導用戶重新啟用通知。

### Q: 可以在前端和後端使用不同的公鑰嗎？

A: 不可以！前端和後端必須使用同一對 VAPID 密鑰（公鑰和私鑰成對）。

### Q: 密鑰需要定期更換嗎？

A: 不需要。VAPID 密鑰可以長期使用，除非：
- 私鑰洩露
- 遷移到新的推播服務
- 需要區隔不同環境

## 📚 詳細文檔

查看完整的技術文檔：[SAFARI_PUSH_NOTIFICATION_FIX.md](./SAFARI_PUSH_NOTIFICATION_FIX.md)

## 🆘 仍然無法解決？

1. **確認密鑰格式**：
   ```bash
   npm run generate-vapid
   ```
   確保生成的公鑰長度為 88 字符

2. **檢查環境變數**：
   ```bash
   # 在 Node.js 中
   console.log('VITE_VAPID_PUBLIC_KEY:', process.env.VITE_VAPID_PUBLIC_KEY)
   console.log('長度:', process.env.VITE_VAPID_PUBLIC_KEY?.length)
   
   # 在瀏覽器中
   console.log('VAPID 公鑰:', import.meta.env.VITE_VAPID_PUBLIC_KEY)
   ```

3. **清除所有快取**：
   - Safari → 設定 → 隱私權 → 管理網站資料 → 移除全部
   - 開發者工具 → Storage → Clear Site Data

4. **重新安裝 Service Worker**：
   ```javascript
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister())
   }).then(() => location.reload())
   ```

## 📞 需要協助？

如果以上步驟都無法解決問題，請提供以下資訊：

- Safari 版本
- macOS/iOS 版本
- 瀏覽器 Console 完整錯誤訊息
- 公鑰長度（不要分享完整公鑰）
- 環境（開發/生產）

---

最後更新：2024-10-19

