#!/usr/bin/env bun
/**
 * Integration Test for Price Scraping System
 * Tests the complete flow without requiring the server to be running
 */

import { priceScraper } from '../services/priceScraper';

console.log('========================================');
console.log('  Price Scraping Integration Tests');
console.log('========================================\n');

let passed = 0;
let failed = 0;

async function runTest(name: string, testFn: () => Promise<void>) {
  try {
    console.log(`\n[Test] ${name}`);
    console.log('----------------------------');
    await testFn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ FAIL: ${name}`);
    console.error('  Error:', error instanceof Error ? error.message : error);
    failed++;
  }
}

// Test 1: Scrape category using mock data
await runTest('Scrape category with mock data', async () => {
  const result = await priceScraper.scrapeCategory({
    retailer: 'screwfix',
    category: 'power-tools',
    limit: 5,
    useMockData: true,
  });

  if (!result.success) {
    throw new Error('Scraping failed');
  }

  if (result.products.length === 0) {
    throw new Error('No products scraped');
  }

  console.log(`  Scraped ${result.products.length} products`);
  console.log(`  Sample product: ${result.products[0].product_name} - £${result.products[0].price}`);
});

// Test 2: Get latest prices
await runTest('Get latest prices', async () => {
  const prices = await priceScraper.getLatestPrices({});

  if (!Array.isArray(prices)) {
    throw new Error('Prices is not an array');
  }

  console.log(`  Found ${prices.length} prices in database`);

  if (prices.length > 0) {
    console.log(`  Sample: ${prices[0].product_name} - £${prices[0].price} (${prices[0].retailer})`);
  }
});

// Test 3: Filter by retailer
await runTest('Filter prices by retailer', async () => {
  const prices = await priceScraper.getLatestPrices({ retailer: 'screwfix' });

  console.log(`  Found ${prices.length} prices for screwfix`);

  // Verify all results are from screwfix
  const allScrewfix = prices.every(p => p.retailer === 'screwfix');

  if (!allScrewfix && prices.length > 0) {
    throw new Error('Not all prices are from screwfix');
  }
});

// Test 4: Filter by category
await runTest('Filter prices by category', async () => {
  const prices = await priceScraper.getLatestPrices({ category: 'power-tools' });

  console.log(`  Found ${prices.length} prices for power-tools`);

  if (prices.length > 0) {
    const allCategory = prices.every(p => p.category === 'power-tools');
    if (!allCategory) {
      throw new Error('Not all prices are from power-tools category');
    }
  }
});

// Test 5: Filter by price range
await runTest('Filter prices by range', async () => {
  const prices = await priceScraper.getLatestPrices({ minPrice: 10, maxPrice: 100 });

  console.log(`  Found ${prices.length} prices between £10 and £100`);

  if (prices.length > 0) {
    const inRange = prices.every(p => p.price >= 10 && p.price <= 100);
    if (!inRange) {
      throw new Error('Some prices are outside the range');
    }
  }
});

// Test 6: Filter by stock status
await runTest('Filter prices by stock status', async () => {
  const prices = await priceScraper.getLatestPrices({ inStock: true });

  console.log(`  Found ${prices.length} in-stock prices`);

  if (prices.length > 0) {
    const allInStock = prices.every(p => p.in_stock === true);
    if (!allInStock) {
      throw new Error('Some prices are out of stock');
    }
  }
});

// Test 7: Search products
await runTest('Search products', async () => {
  const prices = await priceScraper.searchProducts('drill');

  console.log(`  Found ${prices.length} prices matching "drill"`);

  if (prices.length > 0) {
    console.log(`  Sample: ${prices[0].product_name}`);
  }
});

// Test 8: Get statistics
await runTest('Get price statistics', async () => {
  const stats = await priceScraper.getStatistics();

  console.log(`  Total products: ${stats.totalProducts}`);
  console.log(`  Retailers: ${stats.retailers.join(', ')}`);
  console.log(`  Categories: ${stats.categories.join(', ')}`);
  console.log(`  Last updated: ${stats.lastUpdated || 'Never'}`);

  if (stats.totalProducts === 0) {
    console.warn('  Warning: No products in database (this is expected on first run)');
  }
});

// Test 9: Scrape single product (mock)
await runTest('Scrape single product', async () => {
  const product = await priceScraper.scrapeProduct(
    'https://www.screwfix.com/p/test-product',
    'screwfix',
    true // use mock data
  );

  if (!product) {
    throw new Error('Failed to scrape product');
  }

  console.log(`  Product: ${product.product_name} - £${product.price}`);
  console.log(`  Brand: ${product.brand}, Stock: ${product.in_stock ? 'In Stock' : 'Out of Stock'}`);
});

// Test 10: Trigger scrape job
await runTest('Trigger scrape job', async () => {
  const result = await priceScraper.triggerScrape({
    retailer: 'wickes',
    category: 'hand-tools',
    limit: 3,
    useMockData: true,
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  console.log(`  ${result.message}`);
  if (result.data) {
    console.log(`  Products scraped: ${result.data.total}`);
  }
});

// Summary
console.log('\n========================================');
console.log('  Test Summary');
console.log('========================================');
console.log(`✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('All tests passed! ✓');
  process.exit(0);
} else {
  console.log('Some tests failed. ✗');
  process.exit(1);
}
