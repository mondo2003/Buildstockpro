#!/usr/bin/env bun
/**
 * Simple database connection test
 */

import { rawQuery } from '../utils/database';

async function testDatabase() {
  console.log('Testing database connection...\n');

  try {
    // Test 1: Simple connection test
    console.log('Test 1: Connection Test');
    console.log('------------------------');
    const result = await rawQuery('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connected:', result[0]);
    console.log('');

    // Test 2: Check if scraped_prices table exists
    console.log('Test 2: Check Tables');
    console.log('---------------------');
    const tables = await rawQuery(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%scraped%'
      ORDER BY table_name
    `);
    console.log('Tables found:', tables);
    console.log('');

    // Test 3: Try to query scraped_prices
    console.log('Test 3: Query scraped_prices');
    console.log('---------------------------');
    const prices = await rawQuery('SELECT COUNT(*) as count FROM scraped_prices');
    console.log('Total scraped prices:', prices[0]?.count || 0);
    console.log('');

  } catch (error) {
    console.error('❌ Database error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testDatabase().catch(console.error);
