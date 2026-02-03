/**
 * Simple Migration Test - Check if we can create tables via Supabase client
 */

import { supabase } from '../utils/database.js';
import { readFileSync } from 'fs';

async function testMigration() {
  try {
    console.log('📜 Testing merchant contact migration...');
    console.log('-'.repeat(60));

    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('merchant_contact_requests')
      .select('*')
      .limit(1);

    if (tablesError && tablesError.code === 'PGRST204') {
      console.log('⚠️  Tables do not exist yet');
      console.log('   You need to apply the migration manually via Supabase dashboard:');
      console.log('   https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/editor');
      console.log();
      console.log('   Copy the SQL from:');
      console.log('   buildstock-pro/backend/migrations/009_merchant_contact.sql');
      return;
    }

    if (tablesError) {
      throw tablesError;
    }

    console.log('✅ Tables exist!');

    // Try to insert a test record
    const { data: merchants } = await supabase
      .from('merchants')
      .select('id')
      .limit(1)
      .single();

    if (!merchants) {
      throw new Error('No merchants found');
    }

    const { data: testInsert, error: insertError } = await supabase
      .from('merchant_contact_requests')
      .insert({
        user_id: 'test-user',
        merchant_id: merchants.id,
        product_name: 'Test Product',
        inquiry_type: 'general',
        message: 'Test message',
        contact_method: 'email',
        user_name: 'Test User',
        user_email: 'test@example.com',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Test insert successful!');
    console.log(`   ID: ${testInsert.id}`);
    console.log(`   Status: ${testInsert.status}`);

    // Clean up
    await supabase
      .from('merchant_contact_requests')
      .delete()
      .eq('id', testInsert.id);

    console.log('✅ Test record cleaned up');
    console.log('-'.repeat(60));
    console.log('✅ All tests passed! Migration is working.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error();
    console.error('If tables do not exist, please apply the migration manually:');
    console.error('1. Go to: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/editor');
    console.error('2. Copy the SQL from: buildstock-pro/backend/migrations/009_merchant_contact.sql');
    console.error('3. Paste and execute in the SQL editor');
    process.exit(1);
  }
}

testMigration();
