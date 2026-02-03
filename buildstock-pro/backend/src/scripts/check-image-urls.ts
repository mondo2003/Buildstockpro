#!/usr/bin/env bun
/**
 * Check image URL quality in database
 */

import { supabase } from '../utils/database';

console.log('\n=== Image URL Quality Check ===\n');

const { data, error } = await supabase
  .from('scraped_prices')
  .select('product_name, image_url, retailer')
  .limit(20);

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

let placeholders = 0;
let realUrls = 0;
let missing = 0;

data.forEach((p, i) => {
  const hasPlaceholder = p.image_url?.includes('placeholder') || !p.image_url;
  const status = hasPlaceholder ? '❌ Placeholder' : '✅ Real URL';

  if (!p.image_url) missing++;
  else if (p.image_url.includes('placeholder')) placeholders++;
  else realUrls++;

  console.log(`${i + 1}. ${p.product_name}`);
  console.log(`   Retailer: ${p.retailer}`);
  console.log(`   Image: ${status}`);
  console.log(`   URL: ${p.image_url || 'MISSING'}`);
  console.log();
});

console.log('─'.repeat(70));
console.log(`\nTotal checked: ${data.length}`);
console.log(`✅ Real URLs: ${realUrls}`);
console.log(`❌ Placeholders: ${placeholders}`);
console.log(`⚠️  Missing: ${missing}`);
console.log(`\nQuality Score: ${((realUrls / data.length) * 100).toFixed(1)}%`);
