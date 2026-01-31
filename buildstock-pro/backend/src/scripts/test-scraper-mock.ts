#!/usr/bin/env bun
/**
 * Mock Scraper Test - Tests scraper without database dependency
 */

import { mockScraper } from '../scrapers/mock-scraper';

console.log('========================================');
console.log('  Mock Scraper Test (No Database)');
console.log('========================================\n');

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    console.log(`\n${name}`);
    console.log('----------------------------');
    await fn();
    console.log(`✓ PASS`);
    passed++;
  } catch (error) {
    console.error(`✗ FAIL: ${error}`);
    failed++;
  }
}

// Test 1: Scrape category
await test('Test 1: Scrape power-tools category', async () => {
  const result = await mockScraper.scrapeCategory('power-tools', 10);

  console.log(`  Success: ${result.success}`);
  console.log(`  Products: ${result.total}`);
  console.log(`  Errors: ${result.errors.length}`);

  if (!result.success) throw new Error('Scraping failed');
  if (result.products.length === 0) throw new Error('No products scraped');

  console.log('\n  Sample products:');
  result.products.slice(0, 3).forEach((p, i) => {
    console.log(`    ${i + 1}. ${p.product_name}`);
    console.log(`       £${p.price} | ${p.brand} | ${p.retailer}`);
  });
});

// Test 2: Scrape insulation category
await test('Test 2: Scrape insulation category', async () => {
  const result = await mockScraper.scrapeCategory('insulation', 5);

  console.log(`  Products: ${result.total}`);

  if (result.total === 0) throw new Error('No products found');

  const cheapest = [...result.products].sort((a, b) => a.price - b.price)[0];
  console.log(`  Cheapest: ${cheapest.product_name} - £${cheapest.price}`);
});

// Test 3: Search for products
await test('Test 3: Search for "drill"', async () => {
  const result = await mockScraper.searchProducts('drill', 5);

  console.log(`  Results: ${result.total}`);

  if (result.total === 0) throw new Error('No search results');

  result.products.forEach(p => {
    console.log(`  - ${p.product_name} - £${p.price}`);
  });
});

// Test 4: Search for "insulation"
await test('Test 4: Search for "insulation"', async () => {
  const result = await mockScraper.searchProducts('insulation', 3);

  console.log(`  Results: ${result.total}`);

  result.products.forEach(p => {
    console.log(`  - ${p.product_name} - £${p.price} (${p.brand})`);
  });
});

// Test 5: Scrape single product
await test('Test 5: Scrape single product', async () => {
  const product = await mockScraper.scrapeProduct('https://test.com/product');

  if (!product) throw new Error('Failed to scrape product');

  console.log(`  Product: ${product.product_name}`);
  console.log(`  Price: £${product.price}`);
  console.log(`  Brand: ${product.brand}`);
  console.log(`  Category: ${product.category}`);
  console.log(`  Retailer: ${product.retailer}`);
  console.log(`  In Stock: ${product.in_stock}`);
});

// Test 6: Multiple categories
await test('Test 6: Scrape multiple categories', async () => {
  const categories = ['plumbing', 'electrical', 'hand-tools'];
  const results = [];

  for (const cat of categories) {
    const result = await mockScraper.scrapeCategory(cat, 3);
    results.push({ category: cat, count: result.total });
    console.log(`  ${cat}: ${result.total} products`);
  }

  const totalProducts = results.reduce((sum, r) => sum + r.count, 0);
  console.log(`  Total: ${totalProducts} products across ${categories.length} categories`);

  if (totalProducts === 0) throw new Error('No products scraped');
});

// Test 7: Price distribution
await test('Test 7: Analyze price distribution', async () => {
  const result = await mockScraper.scrapeCategory('power-tools', 20);

  const prices = result.products.map(p => p.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  console.log(`  Products analyzed: ${result.total}`);
  console.log(`  Average price: £${avgPrice.toFixed(2)}`);
  console.log(`  Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)}`);
  console.log(`  Price spread: £${(maxPrice - minPrice).toFixed(2)}`);
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
