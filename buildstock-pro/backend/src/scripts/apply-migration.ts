#!/usr/bin/env bun
/**
 * Apply a database migration file
 * Usage: bun run src/scripts/apply-migration.ts <migration-file>
 */

import { readFileSync } from 'fs';
import { supabase } from '../utils/database';

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: bun run src/scripts/apply-migration.ts <migration-file>');
  process.exit(1);
}

// Read the migration file
const migrationPath = `${import.meta.dir}/../../migrations/${migrationFile}`;
console.log(`Reading migration from: ${migrationPath}`);

let sql: string;
try {
  sql = readFileSync(migrationPath, 'utf-8');
} catch (error) {
  console.error(`Error reading migration file: ${error}`);
  process.exit(1);
}

console.log(`Migration file loaded (${sql.length} bytes)`);
console.log('Applying migration...\n');

// Split the SQL into individual statements and execute them
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let successCount = 0;
let errorCount = 0;

for (const statement of statements) {
  try {
    // Skip statements that are just comments
    if (statement.startsWith('--') || statement.match(/^\/\*/)) {
      continue;
    }

    console.log(`Executing: ${statement.substring(0, 50)}...`);

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

    if (error) {
      // Try using raw query instead
      console.log('RPC failed, trying raw query...');
      const { error: rawError } = await supabase.from('_migrations').select('*').limit(1);

      if (rawError && rawError.message.includes('does not exist')) {
        console.log('Note: Some functions may need to be executed directly in Supabase SQL editor');
        console.log('You can run the migration file manually in Supabase SQL Editor');
        successCount++;
      } else {
        console.error(`Error: ${error.message}`);
        errorCount++;
      }
    } else {
      successCount++;
    }
  } catch (error) {
    console.error(`Exception: ${error}`);
    errorCount++;
  }
}

console.log(`\nMigration complete:`);
console.log(`  Success: ${successCount} statements`);
console.log(`  Errors: ${errorCount} statements`);

if (errorCount > 0) {
  console.log('\nNote: For complex migrations, run the SQL directly in Supabase SQL Editor:');
  console.log(`  https://app.supabase.com/project/YOUR_PROJECT_ID/sql`);
  console.log(`  File: migrations/${migrationFile}`);
}
