#!/usr/bin/env bun
/**
 * Debug script to see actual Screwfix category page structure
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function debugCategoryPage() {
  const categoryUrl = 'https://www.screwfix.com/c/tools/cat830034';

  console.log('Fetching:', categoryUrl);

  try {
    const response = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Save HTML for inspection
    fs.writeFileSync('/tmp/screwfix-page.html', response.data);
    console.log('\n✅ HTML saved to /tmp/screwfix-page.html\n');

    // Look for any links
    console.log('🔗 All links found:');
    console.log('------------------');
    const allLinks: string[] = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && i < 50) {
        allLinks.push(href);
      }
    });

    // Filter for product links
    const productLinks = allLinks.filter(link => link && link.includes('/p/'));
    console.log(`\n📦 Product links found: ${productLinks.length}`);
    productLinks.slice(0, 10).forEach(link => {
      console.log(`  ${link}`);
    });

    // Look for common product container classes
    console.log('\n🏷️  Classes found:');
    console.log('----------------');
    const classes = new Set<string>();
    $('*').each((_, el) => {
      const classList = $(el).attr('class');
      if (classList) {
        classList.split(' ').forEach(c => {
          if (c.toLowerCase().includes('product') || c.toLowerCase().includes('tile') || c.toLowerCase().includes('item')) {
            classes.add(c);
          }
        });
      }
    });
    Array.from(classes).slice(0, 20).forEach(c => console.log(`  .${c}`));

    // Show page title
    console.log('\n📄 Page Info:');
    console.log('------------');
    console.log(`Title: ${$('title').text()}`);
    console.log(`Total <a> tags: ${allLinks.length}`);
    console.log(`Total <div> tags: ${$('div').length}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

debugCategoryPage().catch(console.error);
