#!/usr/bin/env node

/**
 * 環境變數設定腳本
 * 自動生成各種環境的 .env 檔案
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// 生成隨機密鑰
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// 檢查檔案是否存在
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// 建立環境變數檔案
function createEnvFile(envType) {
  const envPath = path.join(__dirname, `.env.${envType}`);
  
  if (fileExists(envPath)) {
    console.log(`⚠️  .env.${envType} 檔案已存在`);
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`是否要覆蓋現有的 .env.${envType} 檔案？ (y/N): `, (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        writeEnvFile(envPath, envType);
      } else {
        console.log(`❌ 取消建立 .env.${envType} 檔案`);
      }
      rl.close();
    });
  } else {
    writeEnvFile(envPath, envType);
  }
}

// 寫入環境變數檔案
function writeEnvFile(envPath, envType) {
  const cronSecret = generateSecret(32);
  
  let envContent = '';
  
  switch (envType) {
    case 'local':
      envContent = `# Watch It - 本地開發環境變數
# 自動生成於 ${new Date().toISOString()}

# ===== 高度私密 (絕對不能公開) =====
# VAPID 私鑰 - 用於伺服器端推播通知認證
# 生成方式: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=your-vapid-private-key-here

# Vercel Cron 認證密鑰 (已自動生成)
CRON_SECRET=${cronSecret}

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
`;
      break;
      
    case 'prod':
      envContent = `# Watch It - 生產環境變數
# 自動生成於 ${new Date().toISOString()}
# 注意：此檔案用於 Vercel 部署參考，實際部署時請在 Vercel Dashboard 中設定

# ===== 高度私密 (絕對不能公開) =====
# VAPID 私鑰 - 用於伺服器端推播通知認證
VAPID_PRIVATE_KEY=your-vapid-private-key-here

# Vercel Cron 認證密鑰
CRON_SECRET=${cronSecret}

# ===== 中等私密 (需要保護) =====
# Alpha Vantage API Key - 美股資料
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# ===== 低度私密 (相對安全) =====
# VAPID 公鑰 - 客戶端推播訂閱
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here

# VAPID 聯絡電子郵件
VITE_VAPID_EMAIL=your-email@example.com

# ===== 生產設定 =====
# 生產模式
NODE_ENV=production

# 應用程式網址 (生產環境)
VITE_APP_URL=https://your-app.vercel.app
`;
      break;
      
    case 'staging':
      envContent = `# Watch It - 測試環境變數
# 自動生成於 ${new Date().toISOString()}

# ===== 高度私密 (絕對不能公開) =====
# VAPID 私鑰 - 用於伺服器端推播通知認證
VAPID_PRIVATE_KEY=your-vapid-private-key-here

# Vercel Cron 認證密鑰
CRON_SECRET=${cronSecret}

# ===== 中等私密 (需要保護) =====
# Alpha Vantage API Key - 美股資料
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# ===== 低度私密 (相對安全) =====
# VAPID 公鑰 - 客戶端推播訂閱
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here

# VAPID 聯絡電子郵件
VITE_VAPID_EMAIL=your-email@example.com

# ===== 測試設定 =====
# 測試模式
NODE_ENV=staging

# 應用程式網址 (測試環境)
VITE_APP_URL=https://your-app-staging.vercel.app
`;
      break;
      
    default:
      console.error(`❌ 不支援的環境類型: ${envType}`);
      return;
  }

  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ .env.${envType} 檔案建立成功！`);
    
    if (envType === 'local') {
      console.log('🔑 CRON_SECRET 已自動生成');
      console.log('');
      console.log('📋 接下來需要手動設定：');
      console.log('1. 生成 VAPID 金鑰: npm run generate-vapid');
      console.log('2. 更新 VAPID_PRIVATE_KEY 和 VITE_VAPID_PUBLIC_KEY');
      console.log('3. 更新 VITE_VAPID_EMAIL 為你的電子郵件');
      console.log('');
      console.log('🚀 設定完成後執行: npm run dev');
    } else if (envType === 'prod') {
      console.log('');
      console.log('📋 生產環境設定步驟：');
      console.log('1. 在 Vercel Dashboard 中設定環境變數');
      console.log('2. 注意：Vercel 中不需要 VITE_ 前綴');
      console.log('3. 設定完成後重新部署');
    }
  } catch (error) {
    console.error(`❌ 建立 .env.${envType} 檔案失敗:`, error.message);
  }
}

// 主程式
const args = process.argv.slice(2);
const envType = args[0] || 'local';

console.log('🔧 Watch It 環境變數設定工具');
console.log('================================');
console.log(`📁 建立環境: ${envType}`);
console.log('');

if (envType === 'all') {
  // 建立所有環境檔案
  ['local', 'staging', 'prod'].forEach(type => {
    console.log(`\n🔄 建立 .env.${type}...`);
    createEnvFile(type);
  });
} else {
  createEnvFile(envType);
}