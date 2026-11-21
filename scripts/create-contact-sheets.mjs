import { chromium } from 'playwright';
import { readFile } from 'fs/promises';

const artifactsDir = '/opt/cursor/artifacts';
const browser = await chromium.launch({ headless: true });

async function createContactSheet(theme, size) {
  // For desktop: 3 columns x 2 rows (3x2 grid)
  // For mobile: 2 columns x 3 rows (2x3 grid)
  const isDesktop = size === 'desktop';
  const cols = isDesktop ? 3 : 2;
  const rows = isDesktop ? 2 : 3;
  
  const files = [
    `rates-${theme}-${size}.png`,
    `add-${theme}-${size}.png`,
    `watchlist-${theme}-${size}.png`,
    `assets-${theme}-${size}.png`,
    `notifications-${theme}-${size}.png`
  ];

  const images = [];
  for (const file of files) {
    const img = await readFile(`${artifactsDir}/${file}`);
    const base64 = img.toString('base64');
    images.push(`data:image/png;base64,${base64}`);
  }

  const bgColor = theme === 'dark' ? '#0f0f10' : '#ffffff';
  const textColor = theme === 'dark' ? '#8b8b8d' : '#696969';
  
  const labels = [
    '匯率資訊',
    '新增監控',
    '監控清單',
    '資產配置',
    '推播設定'
  ];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: ${bgColor};
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(${cols}, 1fr);
          gap: 12px;
        }
        .grid-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .label {
          font-size: 11px;
          color: ${textColor};
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 0 2px;
        }
        img {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid ${theme === 'dark' ? '#232325' : '#e5e5e5'};
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="grid">
        ${images.map((src, i) => `
          <div class="grid-item">
            <div class="label">${labels[i]}</div>
            <img src="${src}" />
          </div>
        `).join('\n')}
      </div>
    </body>
    </html>
  `;

  const viewportWidth = isDesktop ? 1440 * 3 + 40 : 390 * 2 + 40;
  const viewportHeight = isDesktop ? 900 * 2 + 64 : 844 * 3 + 88;

  const page = await browser.newPage({
    viewport: { width: viewportWidth, height: viewportHeight },
    colorScheme: theme
  });

  await page.setContent(html);
  await page.waitForTimeout(500);
  
  const outputFile = `${artifactsDir}/contact-sheet-${size}-${theme}.png`;
  await page.screenshot({ path: outputFile, fullPage: true });
  console.log(`Created ${outputFile}`);
  
  await page.close();
}

// Create all 4 contact sheets
await createContactSheet('dark', 'desktop');
await createContactSheet('light', 'desktop');
await createContactSheet('dark', 'mobile');
await createContactSheet('light', 'mobile');

await browser.close();
console.log('All contact sheets created!');
