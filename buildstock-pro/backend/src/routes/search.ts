import { Elysia, t } from 'elysia';
import { supabase } from '../utils/database.js';
import { cacheService, createSearchCacheKey } from '../services/cacheService.js';

export const searchRoutes = new Elysia({ prefix: '/api/v1/search' })
  .get('/', async ({ query }) => {
    const startTime = Date.now();

    try {
      const {
        query: searchQuery = '',
        category,
        min_price: minPrice,
        max_price: maxPrice,
        in_stock: inStock,
        merchant_ids,
        sort_by: sortBy = 'relevance',
        page = '1',
        page_size: limit = '20',
      } = query as any;

      // Parse merchant IDs from comma-separated string
      const merchantList = merchant_ids ? merchant_ids.split(',').filter(Boolean) : [];

      // Parse numeric values
      const pageNum = parseInt(page);
      const pageSize = parseInt(limit);
      const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

      // Create cache key
      const cacheKey = createSearchCacheKey({
        query: searchQuery,
        category,
        min_price: minPriceNum,
        max_price: maxPriceNum,
        in_stock: inStock === 'true' || inStock === true,
        merchant_ids: merchantList,
        sort_by: sortBy,
        page: pageNum,
        page_size: pageSize,
      });

      // Try to get from cache (10 minute TTL)
      const cachedResult = cacheService.get(cacheKey, 10 * 60 * 1000);
      if (cachedResult) {
        const cacheTime = Date.now() - startTime;
        console.log(`[Search] Cache hit in ${cacheTime}ms`);
        return {
          ...cachedResult,
          _cache: {
            hit: true,
            time: cacheTime,
          },
        };
      }

      console.log(`[Search] Cache miss - executing database query`);

      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize - 1;

      // Build query
      let dbQuery = supabase
        .from('scraped_prices')
        .select('*', { count: 'exact' });

      // Apply filters
      if (searchQuery) {
        dbQuery = dbQuery.ilike('product_name', `%${searchQuery}%`);
      }

      if (category) {
        dbQuery = dbQuery.eq('category', category);
      }

      if (minPriceNum !== undefined) {
        dbQuery = dbQuery.gte('price', minPriceNum);
      }

      if (maxPriceNum !== undefined) {
        dbQuery = dbQuery.lte('price', maxPriceNum);
      }

      if (inStock === true || inStock === 'true') {
        dbQuery = dbQuery.eq('in_stock', true);
      }

      // Filter by merchants (retailers)
      if (merchantList.length > 0) {
        dbQuery = dbQuery.in('retailer', merchantList);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          dbQuery = dbQuery.order('price', { ascending: true });
          break;
        case 'price_desc':
          dbQuery = dbQuery.order('price', { ascending: false });
          break;
        case 'name_asc':
          dbQuery = dbQuery.order('product_name', { ascending: true });
          break;
        case 'name_desc':
          dbQuery = dbQuery.order('product_name', { ascending: false });
          break;
        case 'stock_level':
          dbQuery = dbQuery.order('in_stock', { ascending: false });
          break;
        default:
          dbQuery = dbQuery.order('scraped_at', { ascending: false });
      }

      // Apply pagination
      dbQuery = dbQuery.range(start, end);

      const { data: products, error, count } = await dbQuery;

      if (error) {
        throw error;
      }

      const total = count || 0;

      // Format response to match frontend expectations
      const formattedData = (products || []).map((p: any) => ({
        product: {
          id: p.id,
          name: p.product_name,
          sku: p.retailer_product_id || '',
          category: p.category || '',
          description: p.product_description || p.stock_text || '',
          specifications: p.brand || '',
          images: p.image_url || '',
          created_at: p.created_at,
          updated_at: p.updated_at,
        },
        listing: {
          id: p.id,
          productId: p.id,
          merchantId: p.retailer,
          price: p.price?.toString() || '0',
          currency: p.currency || 'GBP',
          stockLevel: p.in_stock ? 1 : 0,
          lastUpdated: p.scraped_at,
          productUrl: p.product_url,
        },
        merchant: {
          id: p.retailer,
          name: p.retailer.charAt(0).toUpperCase() + p.retailer.slice(1),
          website: '',
          logoUrl: `https://logo.clearbit.com/${p.retailer}.com`,
          isActive: true,
        },
        // Additional fields for enhanced product card
        _enhanced: {
          inStock: p.in_stock,
          stockText: p.stock_text,
          brand: p.brand,
        },
      }));

      const result = {
        success: true,
        data: formattedData,
        meta: {
          total,
          page: pageNum,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          query: searchQuery,
          filters: {
            category,
            minPrice: minPriceNum,
            maxPrice: maxPriceNum,
            inStock: inStock === 'true',
            merchantIds: merchantList,
            sortBy,
          },
        },
        timestamp: new Date().toISOString(),
      };

      // Cache the result
      cacheService.set(cacheKey, result);

      const dbTime = Date.now() - startTime;
      console.log(`[Search] Database query completed in ${dbTime}ms - result cached`);

      return {
        ...result,
        _cache: {
          hit: false,
          time: dbTime,
        },
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        timestamp: new Date().toISOString(),
      };
    }
  });
