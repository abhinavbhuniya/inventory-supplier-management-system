const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen to all console messages and errors
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  console.log('Navigating to site...');
  await page.goto('https://inventory-supplier-management-syste.vercel.app/', { waitUntil: 'networkidle0' });

  // Wait for the table to populate
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Filling out Product form...');
  await page.type('#prod-name', 'Test Product ' + Date.now());
  await page.type('#prod-category', 'Test Category');
  await page.type('#prod-price', '199.99');
  
  console.log('Submitting form...');
  await page.click('#btn-add-product');
  
  // Wait to see what happens
  await new Promise(r => setTimeout(r, 3000));
  
  // Check the table content
  const tableContent = await page.evaluate(() => {
    return document.getElementById('products-table-body').innerHTML;
  });
  console.log('\n--- TABLE HTML (Products) ---');
  console.log(tableContent);
  
  // Also check orders page
  console.log('\nClicking Orders page...');
  await page.click('#nav-orders');
  await new Promise(r => setTimeout(r, 2000));
  
  const orderTableContent = await page.evaluate(() => {
    return document.getElementById('orders-table-body').innerHTML;
  });
  console.log('\n--- TABLE HTML (Orders) ---');
  console.log(orderTableContent);

  await browser.close();
})();
