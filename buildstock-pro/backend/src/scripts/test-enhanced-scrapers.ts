#!/usr/bin/env bun
/**
 * Test Enhanced Scrapers
 * Verifies that enhanced scrapers produce better quality data
 */

import { enhancedMockScraper } from '../scrapers/mock-scraper-enhanced';
import { priceScraper } from '../services/priceScraper';
import { supabase } from '../utils/database';

console.log('\n=== Testing Enhanced Scrapers ===\n');

// Test 1: Enhanced Mock Scraper
console.log('Test 1: Testing Enhanced Mock Scraper');
console.log('─────────────────────────────────────');

const enhancedResult = await enhancedMockScraper.scrapeCategory('power-tools', 5);

console.log(`✅ Products scraped: ${enhancedResult.products.length}`);
console.log(`✅ Success: ${enhancedResult.success}`);
console.log(`✅ Errors: ${enhancedResult.errors.length}`);

if (enhancedResult.products.length > 0) {
  const sampleProduct = enhancedResult.products[0];
  console.log('\n📦 Sample Product:');
  console.log(`  Name: ${sampleProduct.product_name}`);
  console.log(`  Brand: ${sampleProduct.brand}`);
  console.log(`  Retailer: ${sampleProduct.retailer}`);
  console.log(`  Price: £${sampleProduct.price.toFixed(2)}`);
  console.log(`  Image URL: ${sampleProduct.image_url?.substring(0, 60) || 'MISSING'}...`);
  console.log(`  Unit Type: ${sampleProduct.unit_type || 'N/A'}`);
  console.log(`  Description: ${sampleProduct.product_description?.substring(0, 80) || 'N/A'}...`);
  console.log(`  SKU: ${sampleProduct.manufacturer_sku || 'N/A'}`);
  console.log(`  Barcode: ${sampleProduct.barcode || 'N/A'}`);
  console.log(`  Specifications: ${Object.keys(sampleProduct.specifications || {}).length} fields`);

  if (sampleProduct.specifications) {
    console.log('  Specs preview:');
    Object.entries(sampleProduct.specifications).slice(0, 3).forEach(([key, value]) => {
      console.log(`    - ${key}: ${value}`);
    });
  }

  // Check for real images
  const hasRealImage = !sampleProduct.image_url.includes('via.placeholder.com') &&
                       !sampleProduct.image_url.includes('source.unsplash.com');
  console.log(`  ✅ Real Image: ${hasRealImage ? 'YES' : 'NO (still placeholder)'}`);
}

// Test 2: Price Scraper Integration
console.log('\n\nTest 2: Testing Price Scraper Integration');
console.log('────────────────────────────────────────────');

const scraperResult = await priceScraper.scrapeCategory({
  retailer: 'toolstation',
  category: 'power-tools',
  limit: 3,
  useMockData: false, // Try live first, fall back to mock
});

console.log(`✅ Products scraped: ${scraperResult.products.length}`);
console.log(`✅ Success: ${scraperResult.success}`);
console.log(`✅ Errors: ${scraperResult.errors.length}`);

if (scraperResult.products.length > 0) {
  console.log('\n📦 Sample from Price Scraper:');
  const sample = scraperResult.products[0];
  console.log(`  Name: ${sample.product_name}`);
  console.log(`  Retailer: ${sample.retailer}`);
  console.log(`  Price: £${sample.price.toFixed(2)}`);
  console.log(`  Has Enhanced Fields: ${sample.unit_type ? 'YES' : 'NO'}`);
  console.log(`  Has Specifications: ${sample.specifications ? 'YES' : 'NO'}`);
  console.log(`  Has Description: ${sample.product_description ? 'YES' : 'NO'}`);
}

// Test 3: Check Database
console.log('\n\nTest 3: Checking Database for Enhanced Data');
console.log('──────────────────────────────────────────────');

const { data: dbProducts, error } = await supabase
  .from('scraped_prices')
  .select('*')
  .order('scraped_at', { ascending: false })
  .limit(5);

if (!error && dbProducts && dbProducts.length > 0) {
  console.log(`✅ Found ${dbProducts.length} products in database`);

  const withRealImages = dbProducts.filter(p =>
    p.image_url && !p.image_url.includes('via.placeholder.com')
  ).length;

  const withUnitType = dbProducts.filter(p => p.unit_type).length;
  const withSpecs = dbProducts.filter(p => p.specifications && Object.keys(p.specifications).length > 0).length;
  const withDescription = dbProducts.filter(p => p.product_description).length;

  console.log(`\n📊 Data Quality Metrics:`);
  console.log(`  Products with real images: ${withRealImages}/${dbProducts.length} (${Math.round(withRealImages/dbProducts.length*100)}%)`);
  console.log(`  Products with unit type: ${withUnitType}/${dbProducts.length} (${Math.round(withUnitType/dbProducts.length*100)}%)`);
  console.log(`  Products with specifications: ${withSpecs}/${dbProducts.length} (${Math.round(withSpecs/dbProducts.length*100)}%)`);
  console.log(`  Products with description: ${withDescription}/${dbProducts.length} (${Math.round(withDescription/dbProducts.length*100)}%)`);

  // Show a sample from database
  console.log('\n📦 Sample Database Product:');
  const dbSample = dbProducts[0];
  console.log(`  Name: ${dbSample.product_name}`);
  console.log(`  Image: ${dbSample.image_url?.substring(0, 60) || 'N/A'}...`);
  console.log(`  Unit Type: ${dbSample.unit_type || 'N/A'}`);
  console.log(`  Has Specs: ${dbSample.specifications ? 'YES' : 'NO'}`);

  if (dbSample.specifications) {
    console.log(`  Specs Keys: ${Object.keys(dbSample.specifications).join(', ')}`);
  }
} else {
  console.log('❌ No products found in database or error occurred');
}

// Test 4: Data Quality Report
console.log('\n\nTest 4: Data Quality Report');
console.log('──────────────────────────────');

const allProducts = await supabase
  .from('scraped_prices')
  .select('*');

if (!allProducts.error && allProducts.data && allProducts.data.length > 0) {
  const products = allProducts.data;
  const total = products.length;

  const qualityScore = {
    realImages: products.filter(p => p.image_url && !p.image_url.includes('placeholder')).length,
    hasBrand: products.filter(p => p.brand && p.brand !== 'Unknown').length,
    hasCategory: products.filter(p => p.category).length,
    hasUrl: products.filter(p => p.product_url).length,
    hasUnitType: products.filter(p => p.unit_type).length,
    hasSpecs: products.filter(p => p.specifications && Object.keys(p.specifications).length > 0).length,
    hasDescription: products.filter(p => p.product_description).length,
    hasSku: products.filter(p => p.manufacturer_sku).length,
    hasBarcode: products.filter(p => p.barcode).length,
    inStock: products.filter(p => p.in_stock).length,
  };

  console.log(`\n📈 Overall Data Quality (Total: ${total} products):\n`);

  Object.entries(qualityScore).forEach(([key, count]) => {
    const percentage = Math.round((count / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5));
    console.log(`  ${key.padEnd(20)}: ${count.toString().padStart(4)}/${total} (${percentage.toString().padStart(3)}%) ${bar}`);
  });

  const averageQuality = Object.values(qualityScore).reduce((a, b) => a + b, 0) / Object.keys(qualityScore).length;
  const averagePercentage = Math.round((averageQuality / total) * 100);

  console.log(`\n  ${'Average Quality'.padEnd(20)}: ${Math.round(averageQuality)}/${total} (${averagePercentage}%)`);
}

console.log('\n\n=== Test Complete ===\n');
