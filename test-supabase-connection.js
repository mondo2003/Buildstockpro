#!/usr/bin/env node
/**
 * Supabase Connection Test Script
 * Tests database connectivity and verifies table structure
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from .env.production
const supabaseUrl = 'https://xrhlumtimbmglzrfrnnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected tables
const EXPECTED_TABLES = [
  'users',
  'merchants',
  'merchant_branches',
  'products',
  'product_listings',
  'saved_searches',
  'watched_products',
  'price_alerts',
  'stock_alerts',
  'data_issue_reports',
  'user_preferences',
  'search_analytics',
  'price_history',
  'user_activity',
  'notifications',
  'user_profiles'
];

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection\n');
  console.log('Project ID: xrhlumtimbmglzrfrnnk');
  console.log('Region: EU-West-1');
  console.log('URL:', supabaseUrl);
  console.log('');

  const startTime = Date.now();

  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);

    if (userError) throw userError;
    const latency1 = Date.now() - startTime;
    console.log(`✅ Connection successful! (${latency1}ms)`);
    console.log(`   Found ${users.length} user(s)\n`);

    // Test 2: Check merchants
    console.log('Test 2: Checking merchants table...');
    const { data: merchants, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, website')
      .limit(10);

    if (merchantError) throw merchantError;
    console.log(`✅ Merchants accessible (${Date.now() - startTime}ms)`);
    console.log(`   Found ${merchants.length} merchant(s)`);
    if (merchants.length > 0) {
      merchants.forEach(m => console.log(`   - ${m.name}`));
    }
    console.log('');

    // Test 3: Check products
    console.log('Test 3: Checking products table...');
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log(`✅ Products accessible (${Date.now() - startTime}ms)`);
    console.log(`   Found ${productCount} product(s)\n`);

    // Test 4: Check product listings
    console.log('Test 4: Checking product_listings table...');
    const { count: listingCount, error: listingError } = await supabase
      .from('product_listings')
      .select('*', { count: 'exact', head: true });

    if (listingError) throw listingError;
    console.log(`✅ Product listings accessible (${Date.now() - startTime}ms)`);
    console.log(`   Found ${listingCount} listing(s)\n`);

    // Test 5: Verify all tables exist (by trying to access them)
    console.log('Test 5: Verifying all expected tables exist...');
    const tableResults = [];

    for (const tableName of EXPECTED_TABLES) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          tableResults.push({ table: tableName, status: '❌ ERROR', error: error.message });
        } else {
          tableResults.push({ table: tableName, status: '✅ OK', rows: count });
        }
      } catch (err) {
        tableResults.push({ table: tableName, status: '❌ ERROR', error: err.message });
      }
    }

    // Print table results
    const errors = tableResults.filter(r => r.status.includes('ERROR'));
    console.log(`   ${tableResults.length - errors.length}/${tableResults.length} tables accessible`);
    tableResults.forEach(result => {
      if (result.status.includes('OK')) {
        console.log(`   ${result.status} ${result.table} (${result.rows || 0} rows)`);
      } else {
        console.log(`   ${result.status} ${result.table}: ${result.error || 'Unknown error'}`);
      }
    });
    console.log('');

    // Summary
    const totalLatency = Date.now() - startTime;
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Overall Latency: ${totalLatency}ms`);
    console.log(`Connection: ✅ SUCCESS`);
    console.log(`Tables Verified: ${tableResults.length - errors.length}/${tableResults.length}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors found in ${errors.length} table(s):`);
      errors.forEach(e => console.log(`   - ${e.table}: ${e.error}`));
    } else {
      console.log('\n✅ All tests passed successfully!');
      console.log('\nNext Steps:');
      console.log('1. Add DATABASE_URL to Railway environment variables');
      console.log('2. Deploy backend to Railway');
      console.log('3. Test connection from deployed backend');
    }

    return {
      success: errors.length === 0,
      latency: totalLatency,
      tables: tableResults,
      errors: errors
    };

  } catch (error) {
    const latency = Date.now() - startTime;
    console.log('═══════════════════════════════════════');
    console.log('❌ CONNECTION FAILED');
    console.log('═══════════════════════════════════════');
    console.log(`Error: ${error.message}`);
    console.log(`Hint: ${error.hint || 'None'}`);
    console.log(`Details: ${error.details || 'None'}`);
    console.log(`Code: ${error.code || 'Unknown'}`);
    console.log('');

    console.log('Troubleshooting Steps:');
    console.log('1. Check if Supabase project is active');
    console.log('2. Verify database password in connection string');
    console.log('3. Check network connectivity');
    console.log('4. Verify service role key is correct');
    console.log('5. Check Supabase dashboard for issues');

    return {
      success: false,
      latency: latency,
      error: error.message,
      hint: error.hint,
      code: error.code
    };
  }
}

// Run the test
testConnection()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
