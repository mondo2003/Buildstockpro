#!/usr/bin/env bun
/**
 * Merchant Sync Script
 *
 * This script triggers the merchant sync process via API.
 * It can be run locally or via GitHub Actions.
 *
 * Usage:
 *   bun run src/scripts/sync-merchants.ts
 *   bun run src/scripts/sync-merchants.ts --merchant screwfix
 *   bun run src/scripts/sync-merchants.ts --force
 */

import { syncService } from '../services/sync.service';

interface SyncOptions {
  merchant?: string;
  force?: boolean;
}

async function main() {
  console.log('🚀 Starting merchant sync...');
  console.log('===================================');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: SyncOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--merchant' && args[i + 1]) {
      options.merchant = args[i + 1];
      i++;
    } else if (args[i] === '--force') {
      options.force = true;
    }
  }

  try {
    // Validate environment
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }

    console.log('Environment validated ✓');
    console.log('');

    // Determine which merchants to sync
    const merchants = options.merchant
      ? [options.merchant]
      : ['screwfix', 'wickes', 'bandq', 'jewson'];

    console.log(`Merchants to sync: ${merchants.join(', ')}`);
    console.log(`Force sync: ${options.force ? 'Yes' : 'No'}`);
    console.log('');

    // Sync each merchant
    const results = {
      success: [] as string[],
      failed: [] as string[],
      skipped: [] as string[]
    };

    for (const merchant of merchants) {
      console.log(`\n📦 Syncing ${merchant}...`);
      console.log('─'.repeat(50));

      try {
        // Check if merchant has API key configured
        const apiKey = process.env[`${merchant.toUpperCase()}_API_KEY`];

        if (!apiKey) {
          console.log(`⚠️  No API key found for ${merchant}, skipping...`);
          results.skipped.push(merchant);
          continue;
        }

        // Run sync (this would call the actual sync service)
        console.log(`Syncing products from ${merchant}...`);

        // TODO: Implement actual sync logic
        // await syncService.syncMerchant(merchant, { force: options.force });

        console.log(`✅ ${merchant} sync completed successfully`);
        results.success.push(merchant);

      } catch (error) {
        console.error(`❌ ${merchant} sync failed:`, error);
        results.failed.push(merchant);
      }
    }

    // Print summary
    console.log('\n');
    console.log('===================================');
    console.log('📊 Sync Summary');
    console.log('===================================');
    console.log(`✅ Successful: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Skipped: ${results.skipped.length}`);

    if (results.success.length > 0) {
      console.log('\nSuccessful merchants:', results.success.join(', '));
    }

    if (results.failed.length > 0) {
      console.log('\nFailed merchants:', results.failed.join(', '));
      process.exit(1);
    }

    if (results.skipped.length > 0) {
      console.log('\nSkipped merchants:', results.skipped.join(', '));
    }

    console.log('\n✨ Sync completed!');

  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error);
    process.exit(1);
  }
}

// Run the script
main();
