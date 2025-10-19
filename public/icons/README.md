# PWA 圖標

## 當前狀態
此目錄包含 SVG 格式的占位符圖標。

## 生成 PNG 圖標

### 方法 1：使用瀏覽器工具（推薦）
在瀏覽器中打開項目根目錄的 `generate-icons.html` 文件，自動生成所有尺寸的 PNG 圖標。

### 方法 2：使用在線工具
1. 使用 `icon.svg` 作為源文件
2. 訪問 https://www.pwabuilder.com/imageGenerator
3. 上傳並下載生成的圖標

### 方法 3：使用 Sharp（需要安裝依賴）
```bash
pnpm add -D sharp
node scripts/generate-png-icons.js
```

## 需要的圖標尺寸
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
