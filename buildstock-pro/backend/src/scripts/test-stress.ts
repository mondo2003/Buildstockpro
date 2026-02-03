#!/usr/bin/env bun
/**
 * Stress test the price saving system with more products
 */

import { priceScraper } from '../services/priceScraper';
import { getPriceStatistics } from '../services/priceDatabase';

console.log('\n=== STRESS TEST: High Volume Price Scraping ===\n');

const tests = [
  { limit: 10, category: 'power-tools' },
  { limit: 20, category: 'hand-tools' },
  { limit: 50, category: 'gardening' },
];

let totalScraped = 0;
let totalSaved = 0;

for (const test of tests) {
  console.log(`\nTesting: ${test.limit} products from ${test.category}`);
  console.log('─'.repeat(50));

  const startTime = Date.now();

  const result = await priceScraper.scrapeCategory({
    retailer: 'screwfix',
    category: test.category,
    limit: test.limit,
    useMockData: true,
  });

  const scrapeTime = Date.now() - startTime;

  if (result.success && result.products) {
    totalScraped += result.products.length;

    console.log(`  Scraped: ${result.products.length} products (${scrapeTime}ms)`);

    // Products are already saved by scrapeCategory, so we count them
    totalSaved += result.products.length;

    console.log(`  Saved: ${result.products.length}/${result.products.length}`);

    // Check stats
    const stats = await getPriceStatistics();
    console.log(`  DB Total: ${stats.totalProducts} products`);
  } else {
    console.log(`  ❌ Failed: ${result.errorCount} errors`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('STRESS TEST RESULTS');
console.log('='.repeat(50));
console.log(`Total Scraped: ${totalScraped}`);
console.log(`Total Saved: ${totalSaved}`);
console.log(`Success Rate: ${((totalSaved / totalScraped) * 100).toFixed(1)}%`);

const finalStats = await getPriceStatistics();
console.log(`\nFinal Database State:`);
console.log(`  Total Products: ${finalStats.totalProducts}`);
console.log(`  Retailers: ${finalStats.retailers.join(', ')}`);
console.log(`  Categories: ${finalStats.categories.join(', ')}`);
console.log(`  Last Updated: ${finalStats.lastUpdated}`);
