import { supabase } from '../utils/database';

async function checkSchema() {
  console.log('Checking database schema for enhanced fields...\n');

  // Try to query a record and check if new columns exist
  const { data, error } = await supabase
    .from('scraped_prices')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error querying table:', error);
    return;
  }

  if (data) {
    const columns = Object.keys(data);
    console.log('Columns in scraped_prices table:');
    columns.forEach(col => console.log(`  - ${col}`));

    const enhancedColumns = [
      'unit_price',
      'unit_type',
      'specifications',
      'is_sale',
      'was_price',
      'product_description',
      'manufacturer_sku',
      'barcode'
    ];

    console.log('\nEnhanced columns status:');
    enhancedColumns.forEach(col => {
      const exists = columns.includes(col);
      console.log(`  ${exists ? '✓' : '✗'} ${col}`);
    });
  }

  // Check for existing data with enhanced fields
  const { data: enhancedData, error: enhancedError } = await supabase
    .from('scraped_prices')
    .select('id, product_name, unit_price, unit_type, specifications, manufacturer_sku, product_description')
    .not('specifications', 'is', null)
    .limit(5);

  if (enhancedError) {
    console.error('\nError checking enhanced data:', enhancedError);
  } else {
    console.log(`\nRecords with specifications: ${enhancedData?.length || 0}`);
    if (enhancedData && enhancedData.length > 0) {
      enhancedData.forEach(record => {
        console.log(`  - ${record.product_name}`);
        console.log(`    unit_price: ${record.unit_price || 'null'}`);
        console.log(`    unit_type: ${record.unit_type || 'null'}`);
        console.log(`    manufacturer_sku: ${record.manufacturer_sku || 'null'}`);
        console.log(`    product_description: ${record.product_description || 'null'}`);
        console.log(`    specifications: ${record.specifications ? JSON.stringify(record.specifications).substring(0, 100) : 'null'}`);
      });
    }
  }
}

checkSchema();
