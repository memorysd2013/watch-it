// 驗證 VAPID 公鑰是否有效（Safari 兼容性檢查）
// 使用方法: node scripts/verify-vapid-key.js [公鑰]

import { Buffer } from 'buffer';

const publicKey = process.argv[2] || process.env.VITE_VAPID_PUBLIC_KEY;

console.log('🔍 VAPID 公鑰驗證工具\n');
console.log('─'.repeat(80));

if (!publicKey) {
  console.error('❌ 未提供公鑰');
  console.log('\n使用方法：');
  console.log('  node scripts/verify-vapid-key.js YOUR_PUBLIC_KEY');
  console.log('或設定環境變數：');
  console.log('  VITE_VAPID_PUBLIC_KEY=YOUR_KEY node scripts/verify-vapid-key.js');
  process.exit(1);
}

console.log('公鑰:', publicKey.substring(0, 20) + '***REMOVED***');
console.log('─'.repeat(80));

let allChecks = true;

// 檢查 1: 長度
console.log('\n📏 檢查 1: 公鑰長度');
console.log('   字符長度:', publicKey.length);
if (publicKey.length === 88 || publicKey.length === 87) {
  console.log('   ✅ 長度正確 (87-88 字符)');
} else {
  console.log('   ❌ 長度不正確 (應為 87-88 字符)');
  allChecks = false;
}

// 檢查 2: Base64 格式
console.log('\n🔤 檢查 2: Base64 編碼格式');
let decoded;
try {
  // 移除可能的空白
  const trimmed = publicKey.trim();
  
  // 計算 padding
  const padding = '='.repeat((4 - trimmed.length % 4) % 4);
  
  // URL-safe base64 轉標準 base64
  const base64 = (trimmed + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  decoded = Buffer.from(base64, 'base64');
  console.log('   ✅ Base64 解碼成功');
} catch (e) {
  console.log('   ❌ Base64 解碼失敗:', e.message);
  allChecks = false;
  process.exit(1);
}

// 檢查 3: 解碼後的長度（P-256 標準）
console.log('\n📐 檢查 3: 解碼後的長度 (P-256 標準)');
console.log('   解碼後長度:', decoded.length, 'bytes');
if (decoded.length === 65) {
  console.log('   ✅ 長度正確 (65 bytes - P-256 未壓縮公鑰)');
} else {
  console.log('   ❌ 長度不正確 (應為 65 bytes)');
  console.log('   ⚠️  Safari 只接受 65 bytes 的 P-256 公鑰');
  allChecks = false;
}

// 檢查 4: 首字節（未壓縮標記）
console.log('\n🎯 檢查 4: 首字節 (未壓縮格式標記)');
const firstByte = decoded[0];
console.log('   首字節:', '0x' + firstByte.toString(16).padStart(2, '0'));
if (firstByte === 0x04) {
  console.log('   ✅ 正確 (0x04 = 未壓縮格式)');
} else {
  console.log('   ⚠️  非標準格式 (應為 0x04)');
  console.log('   這可能在某些瀏覽器上工作，但不建議使用');
}

// 檢查 5: X 和 Y 座標
console.log('\n📊 檢查 5: 橢圓曲線座標');
if (decoded.length === 65) {
  const x = decoded.slice(1, 33);
  const y = decoded.slice(33, 65);
  console.log('   X 座標長度:', x.length, 'bytes', x.length === 32 ? '✅' : '❌');
  console.log('   Y 座標長度:', y.length, 'bytes', y.length === 32 ? '✅' : '❌');
  
  // 簡單檢查座標不全為 0
  const xSum = x.reduce((sum, byte) => sum + byte, 0);
  const ySum = y.reduce((sum, byte) => sum + byte, 0);
  
  if (xSum > 0 && ySum > 0) {
    console.log('   ✅ 座標包含有效數據');
  } else {
    console.log('   ❌ 座標可能無效（全為 0）');
    allChecks = false;
  }
}

// 最終結果
console.log('\n' + '─'.repeat(80));
console.log('\n🎉 驗證結果:\n');

if (allChecks && decoded.length === 65 && firstByte === 0x04) {
  console.log('✅ 公鑰完全有效！');
  console.log('✅ 兼容所有瀏覽器，包括 Safari');
  console.log('\n可以安全使用此公鑰。');
  process.exit(0);
} else if (decoded.length === 65) {
  console.log('⚠️  公鑰基本有效，但可能存在小問題');
  console.log('⚠️  建議生成新的公鑰以確保完全兼容');
  console.log('\n執行: npm run generate-vapid');
  process.exit(0);
} else {
  console.log('❌ 公鑰無效！');
  console.log('❌ 此公鑰不會在 Safari 上工作');
  console.log('\n請執行以下命令生成新的公鑰：');
  console.log('  npm run generate-vapid');
  process.exit(1);
}

