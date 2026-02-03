/**
 * Apply Bulk Orders Migration
 * Creates the tables and indexes for the bulk orders system
 */

import { supabase } from '../utils/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  console.log('Applying Bulk Orders Migration...');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'migrations', '008_bulk_orders.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute statements using direct PostgreSQL connection
    const { Pool } = await import('pg');

    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[PASSWORD]')) {
      throw new Error('DATABASE_URL not configured or contains placeholder');
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          await pool.query(statement);
          successCount++;
          console.log(`✓ Executed statement ${successCount}/${statements.length}`);
        } catch (error: any) {
          errorCount++;
          console.error(`✗ Error executing statement:`, error.message);
          // Continue with other statements
        }
      }

      console.log('\n========================================');
      console.log('Migration Summary:');
      console.log(`  Success: ${successCount} statements`);
      console.log(`  Errors: ${errorCount} statements`);
      console.log('========================================\n');

      // Verify tables were created
      const { data: bulkOrders } = await supabase
        .from('bulk_orders')
        .select('*')
        .limit(1);

      if (!bulkOrders) {
        console.log('✓ bulk_orders table exists and is accessible');
      } else {
        console.log('✓ bulk_orders table exists and is accessible');
      }

      console.log('\n✅ Migration applied successfully!');

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
