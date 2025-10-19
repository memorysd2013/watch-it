// 生成 VAPID 密鑰對
// 使用方法: node scripts/generate-vapid-keys.js

import webpush from 'web-push';

console.log('🔐 正在生成 VAPID 密鑰對***REMOVED***\n');

try {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('✅ VAPID 密鑰對生成成功！\n');
  console.log('請將以下密鑰添加到您的 .env 文件中：\n');
  console.log('─'.repeat(80));
  console.log('VITE_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
  console.log('─'.repeat(80));
  console.log('\n⚠️  注意事項：');
  console.log('1. 公鑰 (VITE_VAPID_PUBLIC_KEY) 在前端使用，需要 VITE_ 前綴');
  console.log('2. 私鑰 (VAPID_PRIVATE_KEY) 僅在後端使用，不應暴露給前端');
  console.log('3. 請妥善保管私鑰，不要提交到版本控制系統');
  console.log('4. 公鑰長度應為 88 字符，解碼後為 65 bytes (P-256 標準)');
  console.log('\n📝 驗證公鑰：');
  console.log('長度:', vapidKeys.publicKey.length, '字符');
  
  // 驗證公鑰
  try {
    const decoded = Buffer.from(vapidKeys.publicKey, 'base64');
    console.log('解碼後長度:', decoded.length, 'bytes', decoded.length === 65 ? '✅' : '❌');
  } catch (e) {
    console.log('❌ 公鑰解碼失敗');
  }
  
} catch (error) {
  console.error('❌ 生成密鑰失敗:', error.message);
  console.error('\n請確保已安裝 web-push 套件：');
  console.error('npm install web-push');
  process.exit(1);
}

