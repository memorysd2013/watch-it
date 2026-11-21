# 🔐 安全設定指南

## API Key 私密性分類

### 🔴 高度私密 (絕對不能公開)

#### VAPID 私鑰
- **風險**: 洩露後可冒充你的應用程式發送推播
- **處理**: 只存在伺服器端環境變數中
- **檔案**: `api/cron/daily-notifications.js`, `api/notifications/subscribe.js`

#### CRON_SECRET
- **風險**: 洩露後可觸發你的 Cron 任務
- **處理**: 只存在 Vercel 環境變數中

### 🟡 中等私密 (需要保護)

#### Alpha Vantage API Key
- **風險**: 洩露後可能被濫用，消耗你的 API 額度
- **處理**: 存在環境變數中，可設定使用限制

### 🟢 低度私密 (相對安全)

#### VAPID 公鑰
- **風險**: 相對較低
- **處理**: 建議用環境變數，但可以寫在程式碼中

#### VAPID_EMAIL
- **風險**: 最低
- **處理**: 可以寫在程式碼中

## 🛡️ 安全最佳實踐

### 1. 環境變數設定

#### 本地開發 (.env.local)
```bash
# 高度私密
VAPID_PRIVATE_KEY=your-private-key
CRON_SECRET=your-random-secret

# 中等私密
VITE_ALPHA_VANTAGE_API_KEY=your-api-key

# 低度私密
VITE_VAPID_PUBLIC_KEY=your-public-key
VITE_VAPID_EMAIL=your-email@example.com
```

#### Vercel 部署環境變數
在 Vercel Dashboard 中設定：
- `VAPID_PRIVATE_KEY`
- `CRON_SECRET`
- `VITE_ALPHA_VANTAGE_API_KEY`
- `VITE_VAPID_PUBLIC_KEY`
- `VITE_VAPID_EMAIL`

### 2. 檔案安全

#### 已加入 .gitignore
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`

#### 不要提交到 Git
- 任何包含真實 API Key 的檔案
- 環境變數檔案
- 私鑰檔案

### 3. 程式碼安全

#### 前端 (Vite)
- 使用 `import.meta.env.VITE_*` 存取環境變數
- 只有 `VITE_` 開頭的變數會暴露給前端

#### 後端 (Vercel Functions)
- 使用 `process.env.*` 存取環境變數
- 所有環境變數都是私密的

### 4. API Key 管理

#### Alpha Vantage
- 定期檢查 API 使用量
- 設定使用限制
- 監控異常請求

#### VAPID 金鑰
- 定期輪換金鑰
- 監控推播通知使用情況
- 設定推播限制

## 🚨 安全檢查清單

### 部署前檢查
- [ ] 確認沒有 API Key 寫在程式碼中
- [ ] 確認 .env 檔案已加入 .gitignore
- [ ] 確認 Vercel 環境變數已設定
- [ ] 確認私鑰只存在伺服器端

### 定期檢查
- [ ] 檢查 API 使用量是否異常
- [ ] 檢查推播通知是否正常
- [ ] 檢查是否有未授權的請求
- [ ] 考慮定期輪換 API Key

## 🔧 故障排除

### 常見問題

#### 1. API Key 無效
- 檢查環境變數是否正確設定
- 檢查 API Key 是否過期
- 檢查 API 額度是否用完

#### 2. 推播通知不工作
- 檢查 VAPID 金鑰是否正確
- 檢查瀏覽器是否支援推播
- 檢查 Service Worker 是否註冊成功

#### 3. Cron 任務不執行
- 檢查 CRON_SECRET 是否設定
- 檢查 Vercel 專案設定
- 檢查函數執行日誌

## 📞 緊急處理

### 如果 API Key 洩露
1. 立即在對應服務商處重新生成 Key
2. 更新所有環境變數
3. 重新部署應用程式
4. 檢查是否有異常使用

### 如果私鑰洩露
1. 立即重新生成 VAPID 金鑰對
2. 更新所有相關環境變數
3. 通知用戶重新訂閱推播通知
4. 重新部署應用程式
