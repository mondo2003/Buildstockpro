#!/usr/bin/env bun
/**
 * Check database for enhanced product data
 */

import { supabase } from '../utils/database';

console.log('\n=== Sample Products from Database ===\n');

const { data, error } = await supabase
  .from('scraped_prices')
  .select('*')
  .order('scraped_at', { ascending: false })
  .limit(3);

if (!error && data) {
  data.forEach((p, i) => {
    console.log(`Product ${i + 1}: ${p.product_name}`);
    console.log(`  Retailer: ${p.retailer}`);
    console.log(`  Image: ${p.image_url ? p.image_url.substring(0, 60) + '...' : 'MISSING'}`);
    console.log(`  Unit Type: ${p.unit_type || 'N/A'}`);
    console.log(`  Specs: ${p.specifications ? Object.keys(p.specifications).length + ' fields' : 'N/A'}`);
    if (p.specifications) {
      console.log(`    - ${Object.keys(p.specifications).slice(0, 2).join(', ')}`);
    }
    console.log(`  Description: ${p.product_description ? 'YES (' + p.product_description.substring(0, 40) + '...)' : 'NO'}`);
    console.log(`  SKU: ${p.manufacturer_sku || 'N/A'}`);
    console.log(`  Barcode: ${p.barcode || 'N/A'}`);
    console.log(`  Real Image: ${p.image_url && !p.image_url.includes('placeholder') ? 'YES ✓' : 'NO'}`);
    console.log();
  });

  // Count products with enhanced data
  const total = data.length;
  const withRealImages = data.filter(p => p.image_url && !p.image_url.includes('placeholder')).length;
  const withUnitType = data.filter(p => p.unit_type).length;
  const withSpecs = data.filter(p => p.specifications).length;
  const withDesc = data.filter(p => p.product_description).length;
  const withSku = data.filter(p => p.manufacturer_sku).length;

  console.log('📊 Enhanced Data in Sample:');
  console.log(`  Real Images: ${withRealImages}/${total}`);
  console.log(`  Unit Types: ${withUnitType}/${total}`);
  console.log(`  Specs: ${withSpecs}/${total}`);
  console.log(`  Descriptions: ${withDesc}/${total}`);
  console.log(`  SKUs: ${withSku}/${total}`);
} else {
  console.error('Error:', error);
}

console.log('\n=== Check Complete ===\n');
