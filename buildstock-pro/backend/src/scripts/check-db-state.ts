#!/usr/bin/env bun
/**
 * Check database state and price history
 */

import { supabase } from '../utils/database';

console.log('\n=== Database State Check ===\n');

const { data, error } = await supabase
  .from('scraped_prices')
  .select('*')
  .order('scraped_at', { ascending: false });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Total records: ${data.length}`);

// Group by product
const products = {};
data.forEach(p => {
  const key = `${p.retailer}-${p.retailer_product_id}`;
  if (!products[key]) products[key] = [];
  products[key].push(p);
});

console.log(`Unique products: ${Object.keys(products).length}`);
console.log(`Retailers: ${[...new Set(data.map(p => p.retailer))].join(', ')}\n`);

// Show latest for each product
console.log('Latest prices per product:');
console.log('─'.repeat(70));

Object.entries(products).forEach(([key, records]: [string, any[]]) => {
  const latest = records[0];
  console.log(`\n${latest.product_name}`);
  console.log(`  Retailer: ${latest.retailer}`);
  console.log(`  Price: £${latest.price.toFixed(2)} | Stock: ${latest.in_stock ? '✓' : '✗'}`);
  console.log(`  Updated: ${new Date(latest.scraped_at).toLocaleString()}`);
  console.log(`  History: ${records.length} update(s)`);

  // Show price history
  if (records.length > 1) {
    const prices = records.map(r => r.price).reverse();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log(`  Price range: £${minPrice.toFixed(2)} - £${maxPrice.toFixed(2)}`);
  }
});

console.log('\n' + '─'.repeat(70));
