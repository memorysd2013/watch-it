# Safari 推播通知錯誤修復

## 🚨 遇到這個錯誤？

```
applicationServerKey must contain a valid P-256 public key
```

## ⚡ 最快解決方法（1 分鐘）

### 步驟 1: 清除舊訂閱

在 Safari 瀏覽器的開發者工具 Console 中貼上並執行：

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.pushManager.getSubscription().then(sub => {
      if (sub) {
        sub.unsubscribe().then(() => {
          console.log('✅ 已清除舊訂閱')
          location.reload()
        })
      } else {
        console.log('ℹ️ 沒有找到訂閱')
        location.reload()
      }
    })
  }
})
```

### 步驟 2: 重新訂閱

1. 頁面重新載入後
2. 打開側邊選單 → 「通知設定」
3. 點擊「啟用推播通知」
4. 允許通知權限
5. 完成！

---

## 🔧 如果還是不行？生成新密鑰

### 1. 生成 VAPID 密鑰對

```bash
npm run generate-vapid
```

### 2. 創建 .env 文件

在專案根目錄創建 `.env` 文件，貼上生成的密鑰：

```env
VITE_VAPID_PUBLIC_KEY=BN9xY8w...（你的公鑰）
VAPID_PRIVATE_KEY=abc123...（你的私鑰）
VAPID_EMAIL=mailto:your-email@example.com
```

### 3. 重新啟動

```bash
# 停止開發伺服器（Ctrl+C）
npm run dev
```

---

## 🧪 驗證密鑰是否有效

```bash
npm run verify-vapid YOUR_PUBLIC_KEY
```

應該看到：
```
✅ 公鑰完全有效！
✅ 兼容所有瀏覽器，包括 Safari
```

---

## 📱 測試通知

1. 重新載入頁面
2. 通知設定 → 點擊「測試通知」
3. 應該會收到通知 ✅

---

## ❓ 為什麼會出現這個錯誤？

Safari 比其他瀏覽器（Chrome、Firefox）更嚴格地驗證推播通知的密鑰：

- ✅ Chrome/Firefox：較寬鬆的驗證
- ❌ Safari：嚴格要求 **P-256 標準**（65 bytes）

我們的修復：
- 改進了密鑰轉換函數
- 添加了長度驗證（65 bytes）
- 提供了更清楚的錯誤訊息

---

## 📚 詳細文檔

- [5 分鐘快速修復](./SAFARI_NOTIFICATION_QUICK_FIX.md)
- [完整技術文檔](./SAFARI_PUSH_NOTIFICATION_FIX.md)
- [修復總結](./SAFARI_PUSH_FIX_SUMMARY.md)

---

## 🆘 還是不行？

檢查以下幾點：

1. **Safari 版本**：確保是最新版本
2. **通知權限**：系統設定 → 通知 → Safari → 允許
3. **清除快取**：Safari → 設定 → 隱私權 → 管理網站資料 → 移除全部
4. **Service Worker**：在 Console 確認已註冊

```javascript
navigator.serviceWorker.getRegistration().then(reg => 
  console.log('Service Worker:', reg ? '✅ 已註冊' : '❌ 未註冊')
)
```

---

**大多數情況下，清除舊訂閱並重新訂閱就可以解決問題！** 🎉

