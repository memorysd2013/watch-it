# PWA 設定指南

本項目已完成 Progressive Web App (PWA) 設定，支持離線訪問、推送通知和安裝到主屏幕。

## 📋 已完成的設定

### 1. Manifest 配置
- ✅ 創建了 `public/manifest.json`
- ✅ 定義了應用名稱、圖標、主題色等
- ✅ 配置了快捷方式（shortcuts）

### 2. Service Worker
- ✅ `public/sw.js` 已配置
- ✅ 支持離線緩存
- ✅ 支持推送通知
- ✅ 支持背景同步

### 3. HTML Meta 標籤
- ✅ 添加了 PWA 相關的 meta 標籤
- ✅ 配置了 Apple 設備支持
- ✅ 配置了 Microsoft Tiles

### 4. Vite PWA 插件
- ✅ 安裝了 `vite-plugin-pwa`
- ✅ 配置了自動更新
- ✅ 配置了緩存策略

### 5. Service Worker 註冊
- ✅ 在 `src/main.js` 中註冊 Service Worker
- ✅ 僅在生產環境啟用

## 🎨 生成 PWA 圖標

### 方法 1：使用圖標生成器（推薦）

1. 在瀏覽器中打開 `generate-icons.html`
2. 點擊「生成所有圖標」按鈕
3. 右鍵點擊每個圖標，選擇「另存圖片為」
4. 將圖標保存到 `public/icons/` 目錄

需要生成的圖標尺寸：
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 方法 2：使用在線工具

1. 訪問 [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. 上傳 `public/icons/icon.svg` 或你的自定義 logo
3. 下載生成的圖標包
4. 將圖標解壓到 `public/icons/` 目錄

### 方法 3：使用現有圖標

如果你已有設計好的 logo：
1. 將你的 logo 調整為 512x512 像素
2. 使用圖像編輯工具（如 Photoshop、GIMP）生成不同尺寸
3. 保存到 `public/icons/` 目錄

## 🚀 測試 PWA

### 開發環境
```bash
# PWA 功能在開發環境不會啟用
npm run dev
```

### 生產環境預覽
```bash
# 構建並預覽
npm run build
npm run preview
```

### 測試步驟

1. **Chrome DevTools**
   - 打開 Chrome DevTools (F12)
   - 切換到 "Application" 標籤
   - 檢查 "Manifest" 和 "Service Workers"

2. **Lighthouse 審核**
   - 打開 Chrome DevTools
   - 切換到 "Lighthouse" 標籤
   - 選擇 "Progressive Web App"
   - 點擊 "Generate report"

3. **安裝測試**
   - 在 Chrome 地址欄會出現安裝圖標
   - 點擊安裝，將應用添加到桌面
   - 測試離線功能（斷網後重新打開）

## 📱 支持的功能

### ✅ 已實現
- 📥 **安裝到主屏幕** - 支持桌面和移動設備
- 🔔 **推送通知** - 價格更新通知
- 📡 **離線訪問** - 緩存關鍵資源
- 🔄 **背景同步** - 自動同步數據
- 🎨 **自適應圖標** - 支持 maskable icons
- 📲 **Apple 設備支持** - iOS Safari 專用配置
- 🖥️ **桌面應用體驗** - Standalone 模式

### 🔧 緩存策略

1. **API 請求** - NetworkFirst
   - 優先使用網絡
   - 網絡失敗時使用緩存
   - 緩存 1 小時

2. **圖片資源** - CacheFirst
   - 優先使用緩存
   - 緩存 30 天
   - 最多 100 個條目

3. **靜態資源** - 預緩存
   - HTML、CSS、JS、字體
   - 構建時自動緩存

## 🔄 更新機制

### 自動更新
- Service Worker 會自動檢測新版本
- 發現更新時會提示用戶
- 用戶確認後自動重新載入

### 手動更新
```javascript
// 在瀏覽器控制台執行
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.update())
  })
}
```

## 🌐 部署檢查清單

- [ ] 確保所有圖標都已生成並放置在 `public/icons/` 目錄
- [ ] 驗證 `manifest.json` 中的資訊正確
- [ ] 運行 `npm run build` 構建生產版本
- [ ] 使用 `npm run preview` 測試 PWA 功能
- [ ] 在 Chrome DevTools 中檢查 Manifest 和 Service Worker
- [ ] 運行 Lighthouse 審核，確保 PWA 分數 > 90
- [ ] 測試離線功能
- [ ] 測試安裝功能
- [ ] 測試推送通知（如果啟用）
- [ ] 部署到支持 HTTPS 的伺服器

## ⚠️ 注意事項

1. **HTTPS 必需**
   - PWA 功能需要 HTTPS（localhost 除外）
   - 確保生產環境使用 HTTPS

2. **Service Worker 更新**
   - 修改 Service Worker 後需要更新版本號
   - 在 `public/sw.js` 中修改 `CACHE_NAME`

3. **圖標要求**
   - 至少需要 192x192 和 512x512 兩個尺寸
   - PNG 格式
   - 建議使用透明背景或圓角背景

4. **瀏覽器兼容性**
   - Chrome/Edge: 完全支持
   - Firefox: 部分支持
   - Safari: iOS 需要特殊配置

## 📚 相關資源

- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## 🐛 問題排查

### Service Worker 沒有註冊
- 確認在生產環境運行（`npm run build && npm run preview`）
- 檢查瀏覽器控制台是否有錯誤

### 圖標不顯示
- 確認圖標文件存在於 `public/icons/` 目錄
- 檢查文件名是否正確
- 清除瀏覽器緩存重試

### 無法安裝
- 確保使用 HTTPS
- 確認 manifest.json 正確載入
- 檢查是否有 192x192 和 512x512 圖標

### 離線不工作
- 確認 Service Worker 已啟動
- 檢查緩存策略配置
- 查看 Network 面板的請求狀態

