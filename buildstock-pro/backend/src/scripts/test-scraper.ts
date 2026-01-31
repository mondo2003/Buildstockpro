#!/usr/bin/env bun
/**
 * Test script for Screwfix scraper
 * Run with: bun run src/scripts/test-scraper.ts
 */

import { scrapeCategory, searchProducts, checkRobotsTxt } from '../scrapers/screwfix';

console.log('========================================');
console.log('  Screwfix Scraper Test');
console.log('========================================\n');

// Test 1: Check robots.txt
console.log('Test 1: Checking robots.txt...');
console.log('----------------------------------------');
const robotsAllowed = await checkRobotsTxt();
console.log(`Robots.txt allows scraping: ${robotsAllowed ? 'YES' : 'NO'}`);
console.log('\n');

// Test 2: Search for products (safer than category scraping)
console.log('Test 2: Searching for products...');
console.log('----------------------------------------');
const searchQuery = 'drill';
const searchResults = await searchProducts(searchQuery, 3);

console.log(`Search Results for "${searchQuery}":`);
console.log(`  Success: ${searchResults.success}`);
console.log(`  Total Products: ${searchResults.total}`);
console.log(`  Errors: ${searchResults.errors.length}`);

if (searchResults.products.length > 0) {
  console.log('\n  Sample Products:');
  searchResults.products.forEach((product, index) => {
    console.log(`    ${index + 1}. ${product.product_name}`);
    console.log(`       Price: £${product.price}`);
    console.log(`       Brand: ${product.brand || 'N/A'}`);
    console.log(`       Stock: ${product.in_stock ? 'In Stock' : 'Out of Stock'}`);
    console.log(`       URL: ${product.product_url}`);
    console.log('');
  });
}

console.log('\n');

// Test 3: Try to scrape a category (optional, may fail if structure changes)
console.log('Test 3: Attempting category scrape...');
console.log('----------------------------------------');
// Note: You may need to adjust the category path based on Screwfix's actual URL structure
// Common categories: cat/power-tools-cat830092, cat/hand-tools-cat830093, etc.
const category = 'cat/power-tools-cat830092';
const categoryResults = await scrapeCategory(category, 5);

console.log(`Category Results for "${category}":`);
console.log(`  Success: ${categoryResults.success}`);
console.log(`  Total Products: ${categoryResults.total}`);
console.log(`  Errors: ${categoryResults.errors.length}`);

if (categoryResults.products.length > 0) {
  console.log('\n  Sample Products:');
  categoryResults.products.forEach((product, index) => {
    console.log(`    ${index + 1}. ${product.product_name}`);
    console.log(`       Price: £${product.price}`);
    console.log(`       Brand: ${product.brand || 'N/A'}`);
    console.log(`       Stock: ${product.in_stock ? 'In Stock' : 'Out of Stock'}`);
    console.log('');
  });
}

if (categoryResults.errors.length > 0) {
  console.log('\n  Errors encountered:');
  categoryResults.errors.forEach((error) => {
    console.log(`    - ${error}`);
  });
}

console.log('\n');
console.log('========================================');
console.log('  Test Complete');
console.log('========================================');
console.log('\nSummary:');
console.log(`  - Robots.txt check: ${robotsAllowed ? 'PASS' : 'WARN'}`);
console.log(`  - Search test: ${searchResults.success ? 'PASS' : 'FAIL'} (${searchResults.total} products)`);
console.log(`  - Category test: ${categoryResults.success ? 'PASS' : 'FAIL'} (${categoryResults.total} products)`);
console.log('\nNext steps:');
console.log('  1. If tests pass, integrate with price scraping service');
console.log('  2. If tests fail, update selectors based on current website structure');
console.log('  3. Always respect rate limits and robots.txt');
console.log('');
