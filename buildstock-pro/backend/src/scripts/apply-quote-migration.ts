#!/usr/bin/env bun
/**
 * Apply Quote System Migration
 */

import { readFileSync } from 'fs';
import { supabase } from '../utils/database';

async function applyMigration() {
  console.log('Applying Quote System Migration...\n');

  const migrationSQL = readFileSync(
    '/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/007_quote_system.sql',
    'utf-8'
  );

  // Split into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.substring(0, 60)}...`);

      // Use PostgreSQL connection directly
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      try {
        await pool.query(statement);
        console.log('✅ Success');
        successCount++;
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          console.log('⚠️  Already exists (skipping)');
          successCount++;
        } else {
          console.error('❌ Error:', err.message);
          errorCount++;
        }
      } finally {
        await pool.end();
      }
    } catch (error) {
      console.error('❌ Exception:', error);
      errorCount++;
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Success: ${successCount} statements`);
  console.log(`  Errors: ${errorCount} statements`);

  if (errorCount === 0) {
    console.log('\n✅ Quote system migration applied successfully!');
  }
}

applyMigration().catch(console.error);
