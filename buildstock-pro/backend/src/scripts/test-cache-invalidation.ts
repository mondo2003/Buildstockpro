/**
 * Test cache invalidation when prices are updated
 */

const BASE_URL = 'http://localhost:3001';

async function getCacheStats() {
  const response = await fetch(`${BASE_URL}/api/v1/admin/cache`);
  return await response.json();
}

async function makeSearch() {
  const response = await fetch(`${BASE_URL}/api/v1/search?query=drill&page=1`);
  return await response.json();
}

async function triggerPriceUpdate() {
  console.log('\n🔄 Triggering price update (scraping)...');
  const response = await fetch(`${BASE_URL}/api/admin/prices/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category: 'power-tools',
      limit: 5,
    }),
  });
  const result = await response.json();
  console.log(`✓ Price update completed: ${result.message || JSON.stringify(result)}`);
  return result;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('========================================');
  console.log('Cache Invalidation Test');
  console.log('========================================');

  try {
    // Step 1: Make some searches to populate cache
    console.log('\n📊 Step 1: Populating cache with searches...');
    await makeSearch();
    await makeSearch();
    await makeSearch();

    await sleep(500);

    const stats1 = await getCacheStats();
    console.log(`✓ Cache entries: ${stats1.data?.entries || 0}`);

    // Step 2: Trigger price update
    const result = await triggerPriceUpdate();

    // Step 3: Check cache was cleared
    console.log('\n📊 Step 3: Checking cache after price update...');
    await sleep(500);

    const stats2 = await getCacheStats();
    console.log(`✓ Cache entries after update: ${stats2.data?.entries || 0}`);

    if (stats2.data?.entries === 0) {
      console.log('\n✅ SUCCESS: Cache was cleared after price update!');
    } else {
      console.log('\n⚠️  WARNING: Cache was not fully cleared');
    }

    console.log('\n========================================');
    console.log('Test completed');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main();
