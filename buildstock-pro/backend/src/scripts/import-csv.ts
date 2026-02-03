#!/usr/bin/env bun
/**
 * CSV Import Script
 * Import prices from CSV file to database
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { savePricesToDatabase } from '../services/priceDatabase';

const CSV_FILE = join(import.meta.dir, '../../data/sample-prices.csv');

console.log(`
╔════════════════════════════════════════════════════════════╗
║              CSV IMPORT - BuildStock Pro                   ║
╚════════════════════════════════════════════════════════════╝
`);

async function importCSV() {
  try {
    console.log(`\n📂 Reading CSV: ${CSV_FILE}`);

    const csvContent = readFileSync(CSV_FILE, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    console.log(`   Found ${lines.length} lines`);

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`\n📋 Headers: ${headers.join(', ')}`);

    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const product: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        // Convert to appropriate types
        if (header === 'price') {
          product[header] = parseFloat(value);
        } else if (header === 'in_stock') {
          product[header] = value.toLowerCase() === 'true';
        } else {
          product[header] = value;
        }
      });

      // Validate required fields
      if (product.product_name && product.retailer && product.price) {
        products.push(product);
      } else {
        console.log(`   ⚠️  Skipping line ${i}: Missing required fields`);
      }
    }

    console.log(`\n✅ Parsed ${products.length} valid products`);

    // Show sample
    console.log('\n📦 Sample Products:');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.product_name}`);
      console.log(`      Retailer: ${p.retailer} | Price: £${p.price} | Stock: ${p.in_stock ? '✓' : '✗'}`);
    });

    // Import to database
    console.log('\n💾 Importing to database...');
    const saved = await savePricesToDatabase(products);

    console.log(`\n✅ Successfully imported ${saved.length}/${products.length} products`);

    // Show breakdown by retailer
    const byRetailer: Record<string, number> = {};
    saved.forEach(p => {
      byRetailer[p.retailer] = (byRetailer[p.retailer] || 0) + 1;
    });

    console.log('\n📊 Import Breakdown:');
    Object.entries(byRetailer).forEach(([retailer, count]) => {
      console.log(`   ${retailer}: ${count} products`);
    });

    console.log('\n✅ Import complete!');
    console.log('\n💡 To verify: bun run src/scripts/check-db-state.ts');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

importCSV().catch(console.error);
