// 生成占位符图标的简单脚本
// 这个脚本生成基于 Data URL 的 SVG 图标作为占位符

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG 图标模板
function generateSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#4CAF50"/>
  <g transform="translate(256, 256)">
    <circle cx="0" cy="0" r="120" fill="white" opacity="0.95"/>
    <circle cx="0" cy="0" r="100" fill="none" stroke="#4CAF50" stroke-width="8"/>
    <line x1="0" y1="0" x2="0" y2="-50" stroke="#4CAF50" stroke-width="8" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="35" y2="35" stroke="#4CAF50" stroke-width="6" stroke-linecap="round"/>
    <circle cx="0" cy="-80" r="5" fill="#4CAF50"/>
    <circle cx="80" cy="0" r="5" fill="#4CAF50"/>
    <circle cx="0" cy="80" r="5" fill="#4CAF50"/>
    <circle cx="-80" cy="0" r="5" fill="#4CAF50"/>
    <circle cx="0" cy="0" r="8" fill="#4CAF50"/>
    <g transform="translate(-100, 80)" opacity="0.9">
      <path d="M 0 0 L 15 -10 L 30 5 L 45 -15 L 60 -5" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">Watch It</text>
</svg>`;
}

// 创建 icons 目录
const iconsDir = join(__dirname, '..', 'public', 'icons');
try {
  mkdirSync(iconsDir, { recursive: true });
  console.log('✅ 创建 icons 目录');
} catch (err) {
  if (err.code !== 'EEXIST') {
    console.error('❌ 创建目录失败:', err);
    process.exit(1);
  }
}

// 生成说明文件
const readmePath = join(iconsDir, 'README.md');
const readmeContent = `# PWA 圖標

## 當前狀態
此目錄包含 SVG 格式的占位符圖標。

## 生成 PNG 圖標

### 方法 1：使用瀏覽器工具（推薦）
在瀏覽器中打開項目根目錄的 \`generate-icons.html\` 文件，自動生成所有尺寸的 PNG 圖標。

### 方法 2：使用在線工具
1. 使用 \`icon.svg\` 作為源文件
2. 訪問 https://www.pwabuilder.com/imageGenerator
3. 上傳並下載生成的圖標

### 方法 3：使用 Sharp（需要安裝依賴）
\`\`\`bash
pnpm add -D sharp
node scripts/generate-png-icons.js
\`\`\`

## 需要的圖標尺寸
${sizes.map(size => `- icon-${size}x${size}.png`).join('\n')}
`;

writeFileSync(readmePath, readmeContent, 'utf8');
console.log('✅ 創建 README.md');

// 為每個尺寸創建 SVG 文件（作為臨時占位符）
sizes.forEach(size => {
  const svgContent = generateSVG(size);
  const svgPath = join(iconsDir, `icon-${size}x${size}.svg`);
  writeFileSync(svgPath, svgContent, 'utf8');
  console.log(`✅ 創建 icon-${size}x${size}.svg`);
});

console.log('\n📝 注意事項：');
console.log('1. SVG 文件已生成作為占位符');
console.log('2. 建議使用 generate-icons.html 生成 PNG 格式圖標');
console.log('3. PNG 圖標在 PWA 中兼容性更好');
console.log('4. 生成後請刪除 SVG 占位符文件');
console.log('\n🎨 開始生成：在瀏覽器中打開 generate-icons.html');

