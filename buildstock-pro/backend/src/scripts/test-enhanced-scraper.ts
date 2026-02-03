#!/usr/bin/env bun
/**
 * Test Enhanced Scraper
 * Tests the improved scraper with real image URLs and retry logic
 */

import { priceScraper } from '../services/priceScraper';
import { supabase } from '../utils/database';

console.log('\n========================================');
console.log('  Testing Enhanced Price Scraper');
console.log('========================================\n');

async function testEnhancedScraper() {
  try {
    console.log('Step 1: Testing with real image URLs...\n');

    // Test screwfix with new image URLs
    const result = await priceScraper.scrapeCategory({
      retailer: 'screwfix',
      category: 'power-tools',
      limit: 5,
      useMockData: false,
    });

    console.log('\n========================================');
    console.log('  Scrape Results');
    console.log('========================================\n');

    console.log(`Success: ${result.success ? '✅' : '❌'}`);
    console.log(`Products: ${result.total}`);
    console.log(`Errors: ${result.errors.length}\n`);

    if (result.products.length > 0) {
      console.log('Sample Products:');
      result.products.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.product_name}`);
        console.log(`   Retailer: ${p.retailer}`);
        console.log(`   Price: £${p.price}`);
        console.log(`   Stock: ${p.in_stock ? '✓ In Stock' : '✗ Out of Stock'}`);
        console.log(`   Image: ${p.image_url.substring(0, 60)}...`);
      });
    }

    console.log('\n========================================');
    console.log('  Database Verification');
    console.log('========================================\n');

    // Check what was saved
    const { data: latestPrices, error } = await supabase
      .from('scraped_prices')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching from database:', error);
    } else {
      console.log('Latest 5 prices in database:\n');

      let realImageCount = 0;
      let placeholderCount = 0;

      latestPrices?.forEach((p, i) => {
        const hasPlaceholder = p.image_url?.includes('placeholder') || !p.image_url;
        const status = hasPlaceholder ? '❌' : '✅';

        if (hasPlaceholder) {
          placeholderCount++;
        } else {
          realImageCount++;
        }

        console.log(`${i + 1}. ${p.product_name}`);
        console.log(`   Retailer: ${p.retailer}`);
        console.log(`   Price: £${p.price}`);
        console.log(`   Image: ${status} ${p.image_url?.substring(0, 50)}...`);
        console.log();
      });

      console.log('─'.repeat(70));
      console.log(`Image Quality Score:`);
      console.log(`  ✅ Real URLs: ${realImageCount}`);
      console.log(`  ❌ Placeholders: ${placeholderCount}`);
      console.log(`  📊 Quality: ${((realImageCount / latestPrices!.length) * 100).toFixed(1)}%`);
      console.log('─'.repeat(70));
    }

    console.log('\n========================================');
    console.log('  Testing Multiple Retailers');
    console.log('========================================\n');

    const retailers = ['screwfix', 'wickes', 'bandq', 'toolstation', 'travisperkins', 'jewson'];
    const results = [];

    for (const retailer of retailers) {
      console.log(`Testing ${retailer}...`);
      const retailerResult = await priceScraper.scrapeCategory({
        retailer,
        category: 'power-tools',
        limit: 2,
        useMockData: false,
      });

      results.push({
        retailer,
        success: retailerResult.success,
        products: retailerResult.total,
        errors: retailerResult.errors.length,
      });

      console.log(`  ${retailerResult.success ? '✅' : '❌'} ${retailerResult.total} products\n`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n========================================');
    console.log('  Retailer Test Summary');
    console.log('========================================\n');

    results.forEach(r => {
      console.log(`${r.retailer}:`);
      console.log(`  Status: ${r.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`  Products: ${r.products}`);
      console.log(`  Errors: ${r.errors}`);
      console.log();
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`Overall Success Rate: ${successCount}/${retailers.length} (${(successCount / retailers.length * 100).toFixed(1)}%)`);

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testEnhancedScraper().catch(console.error);
