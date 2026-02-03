/**
 * Apply Merchant Contact Migration
 * Direct SQL execution via PostgreSQL connection
 */

import { readFileSync } from 'fs';
import { Pool } from 'pg';

async function applyMigration() {
  const migrationSQL = readFileSync(
    '/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/009_merchant_contact.sql',
    'utf-8'
  );

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[PASSWORD]')) {
    throw new Error('DATABASE_URL not configured');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📜 Applying merchant contact migration...');
    console.log('-'.repeat(60));

    await pool.query(migrationSQL);

    console.log('✅ Migration applied successfully!');
    console.log('-'.repeat(60));

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('merchant_contact_requests', 'merchant_contact_responses')
      ORDER BY table_name;
    `);

    console.log('\n📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Check view
    const viewResult = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name = 'contact_requests_detail_view';
    `);

    if (viewResult.rows.length > 0) {
      console.log('\n👁️  Created view:');
      console.log(`   ✓ contact_requests_detail_view`);
    }

    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
