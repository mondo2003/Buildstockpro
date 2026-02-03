#!/usr/bin/env bun
/**
 * Check latest image URLs in database
 */

import { supabase } from '../utils/database';

const { data } = await supabase
  .from('scraped_prices')
  .select('product_name, image_url, retailer, scraped_at')
  .order('scraped_at', { ascending: false })
  .limit(10);

let realCount = 0;
let placeholderCount = 0;

console.log('\n=== Latest 10 Entries ===\n');
data.forEach((p, i) => {
  const isPlaceholder = p.image_url?.includes('placeholder');
  const isReal = !isPlaceholder && p.image_url;

  if (isReal) realCount++;
  else placeholderCount++;

  const status = isReal ? '✅' : '❌';
  const time = new Date(p.scraped_at).toLocaleTimeString();
  console.log(`${i + 1}. ${status} ${p.product_name}`);
  console.log(`   ${p.retailer} | ${time}`);
  console.log(`   ${p.image_url?.substring(0, 60)}...\n`);
});

console.log('─'.repeat(70));
console.log(`Real URLs: ${realCount}/10`);
console.log(`Quality: ${(realCount / 10 * 100).toFixed(0)}%`);
