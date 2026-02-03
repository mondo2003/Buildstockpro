#!/usr/bin/env bun
/**
 * Quick test for enhanced scrapers
 */

import { enhancedMockScraper } from '../scrapers/mock-scraper-enhanced';
import { priceScraper } from '../services/priceScraper';

console.log('\n=== Quick Test: Enhanced Scrapers ===\n');

// Test 1: Enhanced Mock Scraper
console.log('Test 1: Enhanced Mock Scraper');
const result = await enhancedMockScraper.scrapeCategory('power-tools', 3);
console.log(`✅ Scraped ${result.products.length} products`);
if (result.products.length > 0) {
  const p = result.products[0];
  console.log(`  - ${p.product_name}`);
  console.log(`    Image: ${p.image_url.substring(0, 50)}...`);
  console.log(`    SKU: ${p.manufacturer_sku}`);
  console.log(`    Unit Type: ${p.unit_type}`);
  console.log(`    Specs: ${Object.keys(p.specifications || {}).length} fields`);
  const hasRealImage = !p.image_url.includes('placeholder') && !p.image_url.includes('unsplash');
  console.log(`    Real Image: ${hasRealImage ? 'YES ✓' : 'NO'}`);
}

// Test 2: Price Scraper with Wickes
console.log('\nTest 2: Price Scraper Integration (Wickes)');
const scraperResult = await priceScraper.scrapeCategory({
  retailer: 'wickes',
  category: 'power-tools',
  limit: 2,
  useMockData: false,
});
console.log(`✅ Scraped ${scraperResult.products.length} products from Wickes`);
if (scraperResult.products.length > 0) {
  const p = scraperResult.products[0];
  console.log(`  - ${p.product_name}`);
  console.log(`    Image: ${p.image_url ? 'YES' : 'NO'}`);
  console.log(`    Unit Type: ${p.unit_type || 'N/A'}`);
  console.log(`    Specs: ${p.specifications ? 'YES' : 'NO'}`);
  console.log(`    Description: ${p.product_description ? 'YES' : 'NO'}`);
}

// Test 3: Price Scraper with Toolstation
console.log('\nTest 3: Price Scraper Integration (Toolstation)');
const toolstationResult = await priceScraper.scrapeCategory({
  retailer: 'toolstation',
  category: 'hand-tools',
  limit: 2,
  useMockData: false,
});
console.log(`✅ Scraped ${toolstationResult.products.length} products from Toolstation`);
if (toolstationResult.products.length > 0) {
  const p = toolstationResult.products[0];
  console.log(`  - ${p.product_name}`);
  console.log(`    Image: ${p.image_url ? 'YES' : 'NO'}`);
  console.log(`    Unit Type: ${p.unit_type || 'N/A'}`);
  console.log(`    Specs: ${p.specifications ? 'YES' : 'NO'}`);
}

console.log('\n=== Test Complete ===\n');
