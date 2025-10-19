# PWA 快速開始指南 🚀

## 📝 摘要

您的項目已經完成 PWA（漸進式 Web 應用）配置！現在您可以：
- 📱 將應用安裝到桌面/主屏幕
- 🌐 離線訪問
- 🔔 接收推送通知
- ⚡ 更快的加載速度

## ⚡ 快速步驟

### 1️⃣ 生成 PWA 圖標（5分鐘）

**在瀏覽器中打開圖標生成器：**
```bash
open generate-icons.html
```

或直接雙擊文件 `generate-icons.html`

然後：
1. 頁面會自動生成所有尺寸的圖標
2. 右鍵點擊每個圖標
3. 選擇「另存圖片為」
4. 保存到 `public/icons/` 目錄，使用顯示的文件名

需要的圖標：
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 2️⃣ 構建並測試（2分鐘）

```bash
# 構建生產版本
pnpm build

# 預覽（PWA 功能在這裡啟用）
pnpm preview
```

### 3️⃣ 驗證 PWA（3分鐘）

在 Chrome 瀏覽器中：

1. **打開 DevTools** (按 F12)
2. **點擊 "Application" 標籤**
3. **檢查左側菜單：**
   - ✅ Manifest - 應該顯示應用信息和圖標
   - ✅ Service Workers - 應該顯示 "activated and running"

4. **運行 Lighthouse 審核：**
   - 點擊 "Lighthouse" 標籤
   - 選擇 "Progressive Web App"
   - 點擊 "Generate report"
   - 目標：PWA 分數 > 90

5. **測試安裝功能：**
   - 地址欄右側應該出現安裝圖標 ➕
   - 點擊安裝
   - 應用會被添加到您的桌面/應用列表

6. **測試離線功能：**
   - DevTools > Network 標籤
   - 勾選 "Offline"
   - 重新加載頁面
   - 應用應該仍然可用

## ✅ 完成！

如果以上步驟都正常，恭喜！您的 PWA 已經配置成功。

## 📤 部署

部署到支持 HTTPS 的平台（PWA 必需）：

### Vercel（推薦）
```bash
# 如果還沒安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Netlify
```bash
# 如果還沒安裝 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod
```

### GitHub Pages
需要配置 GitHub Actions，請參考 DEPLOYMENT.md

## 🎨 自定義圖標（可選）

如果您想使用自己的 logo：

1. 準備一個 512x512 的 PNG 或 SVG 圖片
2. 訪問 https://www.pwabuilder.com/imageGenerator
3. 上傳您的圖片
4. 下載生成的圖標包
5. 將圖標解壓到 `public/icons/` 目錄

## 📚 需要更多幫助？

- **詳細設置指南**: [PWA_SETUP.md](./PWA_SETUP.md)
- **配置摘要**: [PWA_CONFIGURATION_SUMMARY.md](./PWA_CONFIGURATION_SUMMARY.md)
- **圖標說明**: [public/icons/README.md](./public/icons/README.md)

## ❓ 常見問題

### Q: 為什麼在開發模式看不到 PWA 功能？
A: PWA 功能僅在生產模式啟用。請使用 `pnpm build && pnpm preview` 測試。

### Q: 為什麼無法安裝應用？
A: 確保：
1. 使用 HTTPS（或 localhost）
2. 已生成 PNG 格式的圖標
3. manifest.json 正確載入
4. Service Worker 已註冊

### Q: 如何更新已安裝的應用？
A: 當您部署新版本時，Service Worker 會自動檢測並提示用戶更新。

### Q: 可以在 iPhone 上安裝嗎？
A: 可以！在 Safari 中點擊分享按鈕 → 添加到主屏幕。

## 🎉 下一步

- [ ] 生成 PNG 圖標
- [ ] 測試 PWA 功能
- [ ] 運行 Lighthouse 審核
- [ ] 部署到生產環境
- [ ] 在實際設備上測試
- [ ] 配置推送通知（如需要）

---

**預計完成時間**: 10-15 分鐘
**難度等級**: ⭐⭐☆☆☆（簡單）

有任何問題，請查看詳細文檔或提交 issue！

