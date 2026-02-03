import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTable() {
  try {
    // Try to query the table
    const { data, error, status } = await supabase
      .from('scraped_prices')
      .select('*')
      .limit(1);

    console.log('\n=== Test Results ===');
    console.log('Status:', status);
    console.log('Error:', error);
    console.log('Data:', data);

    if (error) {
      console.error('\n❌ Table check failed:', error.message);
      console.error('Code:', error.code);
      console.error('Hints:', error.hint);
    } else {
      console.log('\n✅ Table exists! Current records:', data?.length || 0);
    }

    // Try to insert a test record
    console.log('\n=== Testing Insert ===');
    const { data: insertData, error: insertError } = await supabase
      .from('scraped_prices')
      .insert({
        product_name: 'TEST PRODUCT',
        retailer: 'test',
        retailer_product_id: 'test-123',
        price: 99.99,
        currency: 'GBP',
        category: 'test',
        in_stock: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Insert successful!');
      console.log('Inserted data:', insertData);

      // Clean up test data
      await supabase
        .from('scraped_prices')
        .delete()
        .eq('retailer_product_id', 'test-123');
      console.log('✅ Test data cleaned up');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testTable();
