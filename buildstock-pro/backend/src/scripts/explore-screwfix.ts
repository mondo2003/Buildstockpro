#!/usr/bin/env bun
/**
 * Quick script to explore Screwfix website structure
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

async function exploreScrewfix() {
  console.log('========================================');
  console.log('  Exploring Screwfix Website');
  console.log('========================================\n');

  try {
    // Fetch homepage
    console.log('Fetching homepage...');
    const response = await axios.get('https://www.screwfix.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Look for category links
    console.log('\n📁 Category Links:');
    console.log('------------------');
    const categoryLinks: string[] = [];
    $('a[href*="/cat/"], a[href*="/c/"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text && categoryLinks.length < 10) {
        const fullUrl = href.startsWith('http') ? href : `https://www.screwfix.com${href}`;
        console.log(`  ${text}: ${fullUrl}`);
        categoryLinks.push(fullUrl);
      }
    });

    // Look for product links
    console.log('\n📦 Product Link Patterns:');
    console.log('-------------------------');
    $('a[href*="/p/"]').each((i, el) => {
      if (i < 5) {
        const href = $(el).attr('href');
        const fullUrl = href.startsWith('http') ? href : `https://www.screwfix.com${href}`;
        console.log(`  ${fullUrl}`);
      }
    });

    // Look for search form
    console.log('\n🔍 Search Form:');
    console.log('---------------');
    const searchForm = $('form[action*="search"], input[name*="search"], input[type="search"]');
    console.log(`  Found ${searchForm.length} search-related elements`);

    // Look for navigation
    console.log('\n🧭 Navigation:');
    console.log('-------------');
    $('nav a, .nav a, .navigation a').each((i, el) => {
      if (i < 5) {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text) {
          console.log(`  ${text}: ${href}`);
        }
      }
    });

    console.log('\n✅ Exploration complete\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

exploreScrewfix().catch(console.error);
