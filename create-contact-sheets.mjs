import { chromium } from 'playwright';
import { readFile } from 'fs/promises';

const artifactsDir = '/opt/cursor/artifacts';
const browser = await chromium.launch({ headless: true });

async function createContactSheet(theme, size) {
  const page = await browser.newPage({
    viewport: { width: size === 'desktop' ? 7200 + 32 : 1950 + 32, height: size === 'desktop' ? 900 + 16 : 844 + 16 },
    colorScheme: theme
  });

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
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: ${bgColor};
          padding: 8px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        img {
          display: block;
          height: auto;
        }
      </style>
    </head>
    <body>
      ${images.map(src => `<img src="${src}" />`).join('\n')}
    </body>
    </html>
  `;

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
