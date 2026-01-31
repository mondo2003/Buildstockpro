#!/usr/bin/env bun
/**
 * Price Sync Script
 * Run by GitHub Actions every 6 hours to update prices from all retailers
 *
 * Usage: bun run src/scripts/sync-prices.ts
 * Environment variables:
 *   - DATABASE_URL: Supabase database connection string
 *   - SUPABASE_URL: Supabase API URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 */

import { priceScraper } from '../services/priceScraper';

console.log('========================================');
console.log('  BuildStock Pro - Price Sync');
console.log('========================================\n');
console.log(`Started at: ${new Date().toISOString()}\n`);

// Categories to scrape (can be expanded)
const categories = [
  'power-tools',
  'hand-tools',
  'electrical',
  'plumbing',
  'building-materials',
  'insulation',
  'decorating',
];

// Retailers to scrape (can be expanded)
const retailers = ['screwfix', 'bq', 'wickes', 'travis-perkins'];

async function main() {
  const startTime = Date.now();
  let totalScraped = 0;
  let totalErrors = 0;

  try {
    // Scrape each category for each retailer
    for (const retailer of retailers) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`  Retailer: ${retailer.toUpperCase()}`);
      console.log(`${'='.repeat(50)}\n`);

      for (const category of categories) {
        console.log(`[${retailer}] Scraping category: ${category}...`);

        try {
          const result = await priceScraper.scrapeCategory({
            retailer,
            category,
            limit: 20, // Adjust based on rate limits
            useMockData: process.env.USE_MOCK_DATA === 'true',
          });

          if (result.success) {
            console.log(`  ✅ Scraped ${result.total} products`);
            totalScraped += result.total;

            if (result.errors.length > 0) {
              console.log(`  ⚠️  Errors: ${result.errors.length}`);
              totalErrors += result.errors.length;
            }
          } else {
            console.log(`  ❌ Failed: ${result.errors.join(', ')}`);
            totalErrors += result.errors.length;
          }

        } catch (error) {
          console.error(`  ❌ Error scraping ${category}:`, error);
          totalErrors++;
        }

        // Rate limiting between categories (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Rate limiting between retailers (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log('  Price Sync Complete');
    console.log('========================================\n');
    console.log(`Summary:`);
    console.log(`  - Total products scraped: ${totalScraped}`);
    console.log(`  - Total errors: ${totalErrors}`);
    console.log(`  - Duration: ${duration}s`);
    console.log(`  - Completed at: ${new Date().toISOString()}\n`);

    // Get and display statistics
    const stats = await priceScraper.getStatistics();
    console.log(`Database Statistics:`);
    console.log(`  - Total products in DB: ${stats.totalProducts}`);
    console.log(`  - Retailers: ${stats.retailers.join(', ')}`);
    console.log(`  - Categories: ${stats.categories.join(', ')}`);
    console.log(`  - Last updated: ${stats.lastUpdated || 'Never'}\n`);

    if (totalErrors === 0) {
      console.log('✅ All price sync operations completed successfully!');
      process.exit(0);
    } else {
      console.log(`⚠️  Price sync completed with ${totalErrors} errors`);
      process.exit(0); // Don't fail the workflow if some scrapes fail
    }

  } catch (error) {
    console.error('\n❌ Fatal error during price sync:', error);
    process.exit(1);
  }
}

// Run the sync
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
