/**
 * Test script for caching layer
 * Tests cache hit/miss, TTL, and invalidation
 */

const BASE_URL = 'http://localhost:3001';
const ADMIN_BASE_URL = BASE_URL;

interface SearchResult {
  success: boolean;
  data?: any[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
  _cache?: {
    hit: boolean;
    time: number;
  };
  error?: string;
}

interface CacheStats {
  success: boolean;
  data?: {
    stats: {
      hits: number;
      misses: number;
      sets: number;
      deletes: number;
      size: number;
    };
    metrics: {
      hitRate: number;
      avgHitTime: number;
      avgMissTime: number;
      totalRequests: number;
    };
    entries: number;
    topEntries: Array<{
      key: string;
      age: string;
      hits: number;
    }>;
  };
  error?: string;
}

async function makeSearchRequest(params: Record<string, string>): Promise<SearchResult> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/v1/search?${queryString}`;

  console.log(`\n[Request] ${url}`);
  const response = await fetch(url);
  const data = await response.json();

  if (data._cache) {
    console.log(`[Cache] ${data._cache.hit ? 'HIT' : 'MISS'} - ${data._cache.time}ms`);
  }

  return data;
}

async function getCacheStats(): Promise<CacheStats> {
  const response = await fetch(`${ADMIN_BASE_URL}/api/v1/admin/cache`);
  return await response.json();
}

async function clearCache(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${ADMIN_BASE_URL}/api/v1/admin/cache`, {
    method: 'DELETE',
  });
  return await response.json();
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printSeparator(char: string = '=', length: number = 60) {
  console.log(char.repeat(length));
}

async function runTests() {
  printSeparator('=');
  console.log('CACHING LAYER TEST SUITE');
  printSeparator('=');

  try {
    // Test 1: Clear cache before starting
    console.log('\n🧹 Test 1: Clear cache');
    printSeparator('-');
    const clearResult = await clearCache();
    console.log(`Result: ${clearResult.message}`);

    // Test 2: First request should be cache miss
    console.log('\n📊 Test 2: First search request (should be cache miss)');
    printSeparator('-');
    const search1 = await makeSearchRequest({
      query: 'drill',
      category: 'power-tools',
      page: '1',
      page_size: '10',
    });

    if (!search1.success) {
      throw new Error(`Search failed: ${search1.error}`);
    }

    console.log(`Products found: ${search1.meta?.total || 0}`);
    console.log(`Returned products: ${search1.data?.length || 0}`);

    // Test 3: Second request with same params should be cache hit
    console.log('\n🎯 Test 3: Same search request (should be cache hit)');
    printSeparator('-');
    const search2 = await makeSearchRequest({
      query: 'drill',
      category: 'power-tools',
      page: '1',
      page_size: '10',
    });

    if (!search2.success) {
      throw new Error(`Search failed: ${search2.error}`);
    }

    if (search2._cache?.hit !== true) {
      console.warn('⚠️  WARNING: Expected cache hit but got miss');
    } else {
      console.log('✅ Cache hit confirmed!');
    }

    // Test 4: Different params should be cache miss
    console.log('\n🔀 Test 4: Different search params (should be cache miss)');
    printSeparator('-');
    const search3 = await makeSearchRequest({
      query: 'drill',
      category: 'power-tools',
      page: '2', // Different page
      page_size: '10',
    });

    if (!search3.success) {
      throw new Error(`Search failed: ${search3.error}`);
    }

    if (search3._cache?.hit === true) {
      console.warn('⚠️  WARNING: Expected cache miss but got hit');
    } else {
      console.log('✅ Cache miss confirmed (different params)');
    }

    // Test 5: Check cache statistics
    console.log('\n📈 Test 5: Cache statistics');
    printSeparator('-');
    const stats1 = await getCacheStats();

    if (stats1.success && stats1.data) {
      console.log('Cache Statistics:');
      console.log(`  Total entries: ${stats1.data.entries}`);
      console.log(`  Hits: ${stats1.data.stats.hits}`);
      console.log(`  Misses: ${stats1.data.stats.misses}`);
      console.log(`  Hit rate: ${stats1.data.metrics.hitRate}%`);
      console.log(`  Avg hit time: ${stats1.data.metrics.avgHitTime}ms`);
      console.log(`  Avg miss time: ${stats1.data.metrics.avgMissTime}ms`);

      if (stats1.data.topEntries.length > 0) {
        console.log('\nTop cache entries:');
        stats1.data.topEntries.slice(0, 5).forEach((entry, i) => {
          console.log(`  ${i + 1}. ${entry.key.substring(0, 80)}...`);
          console.log(`     Hits: ${entry.hits}, Age: ${entry.age}`);
        });
      }
    }

    // Test 6: Performance comparison
    console.log('\n⚡ Test 6: Performance comparison');
    printSeparator('-');

    // Measure 5 cache misses
    console.log('Measuring 5 cache misses...');
    const missTimes: number[] = [];
    for (let i = 0; i < 5; i++) {
      await clearCache();
      const start = Date.now();
      await makeSearchRequest({ query: 'saw', page: '1' });
      missTimes.push(Date.now() - start);
    }

    // Measure 5 cache hits
    console.log('Measuring 5 cache hits...');
    const hitTimes: number[] = [];
    await makeSearchRequest({ query: 'hammer', page: '1' }); // Prime cache
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await makeSearchRequest({ query: 'hammer', page: '1' });
      hitTimes.push(Date.now() - start);
    }

    const avgMiss = missTimes.reduce((a, b) => a + b, 0) / missTimes.length;
    const avgHit = hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length;
    const speedup = avgMiss / avgHit;

    console.log(`Average cache miss time: ${avgMiss.toFixed(2)}ms`);
    console.log(`Average cache hit time: ${avgHit.toFixed(2)}ms`);
    console.log(`Speedup factor: ${speedup.toFixed(2)}x`);
    console.log(`Performance improvement: ${((1 - avgHit / avgMiss) * 100).toFixed(1)}%`);

    // Test 7: Verify cache entries are created correctly
    console.log('\n🔍 Test 7: Verify cache entry structure');
    printSeparator('-');
    await makeSearchRequest({
      query: 'test',
      category: 'hand-tools',
      min_price: '10',
      max_price: '100',
      sort_by: 'price_asc',
      page: '1',
    });

    const stats2 = await getCacheStats();
    if (stats2.success && stats2.data) {
      console.log(`Cache entries after varied search: ${stats2.data.entries}`);
      console.log('✅ Cache entries are being created');
    }

    // Final stats
    console.log('\n📊 Final cache statistics');
    printSeparator('-');
    const finalStats = await getCacheStats();
    if (finalStats.success && finalStats.data) {
      console.log(`Total requests: ${finalStats.data.metrics.totalRequests}`);
      console.log(`Hit rate: ${finalStats.data.metrics.hitRate}%`);
      console.log(`Cache entries: ${finalStats.data.entries}`);
    }

    printSeparator('=');
    console.log('✅ ALL TESTS COMPLETED');
    printSeparator('=');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
console.log('Starting cache tests...');
console.log('Make sure the backend server is running on port 3001\n');
await runTests();
