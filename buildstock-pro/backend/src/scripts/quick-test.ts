#!/usr/bin/env bun
/**
 * Quick Start Script for Price Scraping System
 * This script demonstrates the basic functionality
 */

import { priceScraper } from '../services/priceScraper';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   BuildStock Pro - Live Price Scraping Quick Start     ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

async function demo() {
  // Step 1: Scrape some products
  console.log('📊 Step 1: Scraping products...');
  console.log('─────────────────────────────────────────────────────');

  const scrapeResult = await priceScraper.scrapeCategory({
    retailer: 'screwfix',
    category: 'power-tools',
    limit: 5,
    useMockData: true, // Set to false when real scrapers are ready
  });

  console.log(`✓ Scraped ${scrapeResult.total} products`);
  console.log('');

  // Display scraped products
  if (scrapeResult.products.length > 0) {
    console.log('Sample Products:');
    scrapeResult.products.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.product_name}`);
      console.log(`     Price: £${p.price.toFixed(2)} | Brand: ${p.brand} | Stock: ${p.in_stock ? '✓' : '✗'}`);
    });
    console.log('');
  }

  // Step 2: Query the database
  console.log('💾 Step 2: Querying database...');
  console.log('─────────────────────────────────────────────────────');

  const prices = await priceScraper.getLatestPrices({ category: 'power-tools' });
  console.log(`✓ Found ${prices.length} prices in database`);
  console.log('');

  // Step 3: Filter prices
  console.log('🔍 Step 3: Filtering prices...');
  console.log('─────────────────────────────────────────────────────');

  const cheapPrices = await priceScraper.getLatestPrices({
    category: 'power-tools',
    maxPrice: 100,
    inStock: true,
  });

  console.log(`✓ Found ${cheapPrices.length} products under £100 and in stock`);

  if (cheapPrices.length > 0) {
    console.log('\nCheapest Options:');
    cheapPrices.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.product_name} - £${p.price.toFixed(2)} (${p.retailer})`);
    });
  }
  console.log('');

  // Step 4: Search
  console.log('🔎 Step 4: Searching products...');
  console.log('─────────────────────────────────────────────────────');

  const searchResults = await priceScraper.searchProducts('drill');
  console.log(`✓ Found ${searchResults.length} products matching "drill"`);
  console.log('');

  // Step 5: Statistics
  console.log('📈 Step 5: Database statistics...');
  console.log('─────────────────────────────────────────────────────');

  const stats = await priceScraper.getStatistics();
  console.log(`✓ Total products: ${stats.totalProducts}`);
  console.log(`✓ Retailers: ${stats.retailers.join(', ') || 'None'}`);
  console.log(`✓ Categories: ${stats.categories.join(', ') || 'None'}`);
  console.log(`✓ Last updated: ${stats.lastUpdated || 'Never'}`);
  console.log('');

  // Step 6: API usage examples
  console.log('🌐 Step 6: API Usage Examples');
  console.log('─────────────────────────────────────────────────────');
  console.log('');
  console.log('Start the server with: bun run dev');
  console.log('');
  console.log('Then try these commands:');
  console.log('');
  console.log('  # Get all prices');
  console.log('  curl "http://localhost:3001/api/prices"');
  console.log('');
  console.log('  # Get prices by retailer and category');
  console.log('  curl "http://localhost:3001/api/prices/screwfix/power-tools"');
  console.log('');
  console.log('  # Filter by price range');
  console.log('  curl "http://localhost:3001/api/prices?minPrice=10&maxPrice=100&inStock=true"');
  console.log('');
  console.log('  # Search products');
  console.log('  curl "http://localhost:3001/api/prices/search/drill"');
  console.log('');
  console.log('  # Trigger scrape job');
  console.log('  curl -X POST "http://localhost:3001/api/prices/scrape" \\');
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"retailer":"screwfix","category":"power-tools","limit":10,"useMockData":true}\'');
  console.log('');
  console.log('  # Get statistics');
  console.log('  curl "http://localhost:3001/api/prices/stats"');
  console.log('');

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                  Demo Complete! ✓                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('For more information, see: LIVE_PRICE_SCRAPING_GUIDE.md');
  console.log('');
}

// Run the demo
demo().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
