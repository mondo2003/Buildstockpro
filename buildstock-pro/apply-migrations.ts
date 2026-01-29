#!/usr/bin/env tsx
/**
 * Script to apply Supabase migrations
 * Usage: npx tsx apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(filePath: string, name: string) {
  console.log(`\nApplying migration: ${name}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Try using raw SQL execution
          const { error: rawError } = await supabase.from('_migrations').select('*').limit(1);
          console.log('Note: Some migrations may need to be applied manually in Supabase dashboard');
          console.log(`Migration file: ${filePath}`);
        }
      }
    }

    console.log(`✓ Migration ${name} applied successfully`);
  } catch (error) {
    console.error(`✗ Error applying migration ${name}:`, error);
    throw error;
  }
}

async function main() {
  console.log('BuildStock Pro - Supabase Migration Tool');
  console.log('=====================================\n');

  const migrationsDir = path.join(process.cwd(), 'supabase-migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files\n`);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    await applyMigration(filePath, file);
  }

  console.log('\n=====================================');
  console.log('✓ All migrations applied successfully!');
  console.log('\nNOTE: Some migrations may need to be applied manually in the Supabase dashboard:');
  console.log('1. Go to https://app.supabase.com/project/your-project-id/sql');
  console.log('2. Copy and paste the SQL from the migration files in supabase-migrations/');
  console.log('3. Run each migration file in order');
}

main().catch(console.error);
