import { chromium } from 'playwright';
import { mkdir, access } from 'fs/promises';

const artifactsDir = '/opt/cursor/artifacts';
try {
  await mkdir(artifactsDir, { recursive: true, mode: 0o777 });
  await access(artifactsDir);
  console.log(`Artifacts directory ready: ${artifactsDir}`);
} catch (err) {
  console.error(`Failed to create artifacts directory: ${err.message}`);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });

// Seed data
const seedData = {
  watchlist: JSON.stringify([
    {
      id: '1',
      symbol: '2330',
      name: '台積電',
      type: 'twse',
      currentPrice: 590.00,
      change: 5.00,
      changePercent: 0.85,
      volume: 25000,
      high: 595.00,
      low: 585.00,
      open: 587.00,
      lastUpdated: new Date().toISOString(),
      addedAt: new Date().toISOString()
    },
    {
      id: '2',
      symbol: 'bitcoin',
      name: 'Bitcoin',
      type: 'crypto',
      currentPrice: 95234.56,
      priceTwd: 3012345.67,
      change: 1234.56,
      changePercent: 1.31,
      volume: 28500000000,
      lastUpdated: new Date().toISOString(),
      addedAt: new Date().toISOString()
    }
  ])
};

const routes = [
  { path: '/rates', name: 'rates-dark-desktop' },
  { path: '/add', name: 'add-dark-desktop' },
  { path: '/watchlist', name: 'watchlist-dark-desktop' },
  { path: '/assets', name: 'assets-dark-desktop' },
  { path: '/notifications', name: 'notifications-dark-desktop' }
];

// Desktop dark
console.log('Capturing desktop dark theme***REMOVED***');
const page1 = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'dark'
});

await page1.goto('http://localhost:4173/rates');
await page1.evaluate((data) => {
  localStorage.setItem('watchlist', data.watchlist);
}, seedData);

for (const route of routes) {
  await page1.goto(`http://localhost:4173${route.path}`);
  await page1.waitForTimeout(500);
  await page1.screenshot({ 
    path: `/opt/cursor/artifacts/${route.name}.png`,
    fullPage: false
  });
  console.log(`Captured ${route.name}.png`);
}

await page1.close();

// Desktop light
console.log('Capturing desktop light theme***REMOVED***');
const page2 = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'light'
});

await page2.goto('http://localhost:4173/rates');
await page2.evaluate((data) => {
  localStorage.setItem('watchlist', data.watchlist);
}, seedData);

for (const route of routes) {
  await page2.goto(`http://localhost:4173${route.path}`);
  await page2.waitForTimeout(500);
  await page2.screenshot({ 
    path: `/opt/cursor/artifacts/${route.name.replace('dark', 'light')}.png`,
    fullPage: false
  });
  console.log(`Captured ${route.name.replace('dark', 'light')}.png`);
}

await page2.close();

// Mobile dark
console.log('Capturing mobile dark theme***REMOVED***');
const page3 = await browser.newPage({
  viewport: { width: 390, height: 844 },
  colorScheme: 'dark'
});

await page3.goto('http://localhost:4173/rates');
await page3.evaluate((data) => {
  localStorage.setItem('watchlist', data.watchlist);
}, seedData);

for (const route of routes) {
  await page3.goto(`http://localhost:4173${route.path}`);
  await page3.waitForTimeout(500);
  await page3.screenshot({ 
    path: `/opt/cursor/artifacts/${route.name.replace('desktop', 'mobile')}.png`,
    fullPage: false
  });
  console.log(`Captured ${route.name.replace('desktop', 'mobile')}.png`);
}

await page3.close();

// Mobile light
console.log('Capturing mobile light theme***REMOVED***');
const page4 = await browser.newPage({
  viewport: { width: 390, height: 844 },
  colorScheme: 'light'
});

await page4.goto('http://localhost:4173/rates');
await page4.evaluate((data) => {
  localStorage.setItem('watchlist', data.watchlist);
}, seedData);

for (const route of routes) {
  await page4.goto(`http://localhost:4173${route.path}`);
  await page4.waitForTimeout(500);
  await page4.screenshot({ 
    path: `/opt/cursor/artifacts/${route.name.replace('dark-desktop', 'light-mobile')}.png`,
    fullPage: false
  });
  console.log(`Captured ${route.name.replace('dark-desktop', 'light-mobile')}.png`);
}

await page4.close();
await browser.close();

console.log('All screenshots captured successfully!');
