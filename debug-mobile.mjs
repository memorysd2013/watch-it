import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

// Test at mobile viewport
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  colorScheme: 'dark'
});

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
      lastUpdated: new Date().toISOString()
    }
  ])
};

await page.goto('http://localhost:4178/watchlist');
await page.evaluate((data) => {
  localStorage.setItem('watchlist', data.watchlist);
}, seedData);
await page.reload();
await page.waitForTimeout(1000);

console.log('\n=== Mobile Viewport Debug (390x844) ===\n');

// Check viewport
const viewport = page.viewportSize();
console.log('Viewport:', viewport);

// Check if elements exist
const hasTable = await page.locator('.table-wrapper').count();
const hasList = await page.locator('.list-wrapper').count();
console.log('Table wrapper exists:', hasTable > 0);
console.log('List wrapper exists:', hasList > 0);

// Get computed styles
if (hasTable > 0) {
  const tableDisplay = await page.locator('.table-wrapper').evaluate(el => {
    return window.getComputedStyle(el).display;
  });
  console.log('Table wrapper display:', tableDisplay);
  
  const tableParent = await page.locator('.desktop-only').evaluate(el => {
    return window.getComputedStyle(el).display;
  });
  console.log('.desktop-only display:', tableParent);
}

if (hasList > 0) {
  const listDisplay = await page.locator('.list-wrapper').evaluate(el => {
    return window.getComputedStyle(el).display;
  });
  console.log('List wrapper display:', listDisplay);
  
  const listParent = await page.locator('.mobile-only').evaluate(el => {
    return window.getComputedStyle(el).display;
  });
  console.log('.mobile-only display:', listParent);
}

// Check media query
const mediaMatch = await page.evaluate(() => {
  return window.matchMedia('(max-width: 768px)').matches;
});
console.log('Media query (max-width: 768px) matches:', mediaMatch);

await page.screenshot({ path: '/tmp/mobile-debug.png' });
console.log('\nScreenshot saved to /tmp/mobile-debug.png');

await browser.close();
