/**
 * Price Scraping Service
 * Manages scraping operations from various retailers and saves to database
 */

import { supabase } from '../utils/database';
import type { ScrapedProduct, ScrapingResult } from '../scrapers/base';
import { mockScraper } from '../scrapers/mock-scraper';

export interface PriceData extends ScrapedProduct {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScrapingOptions {
  retailer: string;
  category?: string;
  limit?: number;
  useMockData?: boolean;
}

export interface PriceFilters {
  retailer?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  brand?: string;
  search?: string;
}

export interface PriceComparison {
  productId: string;
  productName: string;
  retailers: Array<{
    retailer: string;
    price: number;
    inStock: boolean;
    productUrl: string;
    scrapedAt: string;
  }>;
  lowestPrice: number;
  highestPrice: number;
  savings: number;
}

/**
 * Main Price Scraping Service
 */
export class PriceScrapingService {
  private readonly tableName = 'scraped_prices';
  private readonly requestDelay = 2000; // 2 seconds between requests

  /**
   * Scrape products by category
   */
  async scrapeCategory(options: ScrapingOptions): Promise<ScrapingResult> {
    console.log(`[PriceScraper] Starting category scrape:`, options);

    try {
      let result: ScrapingResult;

      if (options.useMockData) {
        // Use mock scraper for testing
        result = await mockScraper.scrapeCategory(options.category || 'power-tools', options.limit || 20);
      } else {
        // Use real scraper (placeholder for when real scrapers are ready)
        console.warn('[PriceScraper] Real scraper not implemented, using mock data');
        result = await mockScraper.scrapeCategory(options.category || 'power-tools', options.limit || 20);
      }

      if (result.success && result.products.length > 0) {
        // Save scraped prices to database
        const saved = await this.savePrices(result.products);
        console.log(`[PriceScraper] Saved ${saved.length}/${result.products.length} prices to database`);
      }

      return result;

    } catch (error) {
      console.error('[PriceScraper] Error scraping category:', error);
      return {
        success: false,
        products: [],
        total: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        category: options.category || 'unknown',
        scrapedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Scrape a single product by URL
   */
  async scrapeProduct(url: string, retailer: string, useMockData: boolean = true): Promise<PriceData | null> {
    console.log(`[PriceScraper] Scraping product: ${url}`);

    try {
      let product: ScrapedProduct | null;

      if (useMockData) {
        product = await mockScraper.scrapeProduct(url);
      } else {
        // Use real scraper when available
        console.warn('[PriceScraper] Real scraper not implemented, using mock data');
        product = await mockScraper.scrapeProduct(url);
      }

      if (!product) {
        return null;
      }

      // Check if product already exists
      const existing = await this.getExistingProduct(retailer, product.retailer_product_id);

      if (existing) {
        // Update existing product
        const { data, error } = await supabase
          .from(this.tableName)
          .update({
            price: product.price,
            in_stock: product.in_stock,
            stock_text: product.stock_text,
            scraped_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('[PriceScraper] Error updating product:', error);
          return null;
        }

        console.log(`[PriceScraper] Updated product: ${product.product_name}`);
        return data as PriceData;
      } else {
        // Insert new product
        const { data, error } = await supabase
          .from(this.tableName)
          .insert({
            ...product,
            scraped_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('[PriceScraper] Error inserting product:', error);
          return null;
        }

        console.log(`[PriceScraper] Inserted product: ${product.product_name}`);
        return data as PriceData;
      }

    } catch (error) {
      console.error('[PriceScraper] Error scraping product:', error);
      return null;
    }
  }

  /**
   * Save multiple prices to database
   */
  async savePrices(prices: ScrapedProduct[]): Promise<PriceData[]> {
    console.log(`[PriceScraper] Saving ${prices.length} prices to database...`);

    const saved: PriceData[] = [];

    for (const price of prices) {
      try {
        // Check if product already exists
        const existing = await this.getExistingProduct(price.retailer, price.retailer_product_id);

        if (existing) {
          // Update existing product
          const { data, error } = await supabase
            .from(this.tableName)
            .update({
              price: price.price,
              in_stock: price.in_stock,
              stock_text: price.stock_text,
              scraped_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (!error && data) {
            saved.push(data as PriceData);
          }
        } else {
          // Insert new product
          const { data, error } = await supabase
            .from(this.tableName)
            .insert({
              ...price,
              scraped_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!error && data) {
            saved.push(data as PriceData);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`[PriceScraper] Error saving price for ${price.product_name}:`, error);
      }
    }

    console.log(`[PriceScraper] Successfully saved ${saved.length}/${prices.length} prices`);
    return saved;
  }

  /**
   * Get latest prices with optional filters
   */
  async getLatestPrices(filters?: PriceFilters): Promise<PriceData[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters?.retailer) {
        query = query.eq('retailer', filters.retailer);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.inStock !== undefined) {
        query = query.eq('in_stock', filters.inStock);
      }

      if (filters?.brand) {
        query = query.eq('brand', filters.brand);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.search) {
        // Using a case-insensitive search
        query = query.ilike('product_name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[PriceScraper] Error fetching prices:', error);
        return [];
      }

      return (data as PriceData[]) || [];

    } catch (error) {
      console.error('[PriceScraper] Error in getLatestPrices:', error);
      return [];
    }
  }

  /**
   * Get prices by retailer
   */
  async getPricesByRetailer(retailer: string, category?: string): Promise<PriceData[]> {
    return this.getLatestPrices({ retailer, category });
  }

  /**
   * Compare prices across retailers for a product
   */
  async comparePrices(productId: string): Promise<PriceComparison | null> {
    try {
      // Get all prices for this product (from various retailers)
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`retailer_product_id.eq.${productId},product_name.ilike.%${productId}%`)
        .gte('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('scraped_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return null;
      }

      // Group by retailer and get latest price from each
      const retailerMap = new Map<string, PriceData>();

      for (const price of data as PriceData[]) {
        if (!retailerMap.has(price.retailer)) {
          retailerMap.set(price.retailer, price);
        }
      }

      const retailers = Array.from(retailerMap.values()).map(p => ({
        retailer: p.retailer,
        price: p.price,
        inStock: p.in_stock,
        productUrl: p.product_url,
        scrapedAt: p.scraped_at,
      }));

      const prices = retailers.map(r => r.price);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      const savings = highestPrice - lowestPrice;

      return {
        productId,
        productName: data[0].product_name,
        retailers,
        lowestPrice,
        highestPrice,
        savings,
      };

    } catch (error) {
      console.error('[PriceScraper] Error comparing prices:', error);
      return null;
    }
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(retailer: string, productId: string, days: number = 30): Promise<PriceData[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('retailer', retailer)
        .eq('retailer_product_id', productId)
        .gte('scraped_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('scraped_at', { ascending: false });

      if (error) {
        console.error('[PriceScraper] Error fetching price history:', error);
        return [];
      }

      return (data as PriceData[]) || [];

    } catch (error) {
      console.error('[PriceScraper] Error in getPriceHistory:', error);
      return [];
    }
  }

  /**
   * Search products by name
   */
  async searchProducts(query: string, filters?: PriceFilters): Promise<PriceData[]> {
    return this.getLatestPrices({ ...filters, search: query });
  }

  /**
   * Get statistics about scraped prices
   */
  async getStatistics(): Promise<{
    totalProducts: number;
    retailers: string[];
    categories: string[];
    lastUpdated: string | null;
  }> {
    try {
      // Get total count
      const { count } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Get unique retailers
      const { data: retailers } = await supabase
        .from(this.tableName)
        .select('retailer');

      // Get unique categories
      const { data: categories } = await supabase
        .from(this.tableName)
        .select('category');

      // Get last update time
      const { data: lastUpdate } = await supabase
        .from(this.tableName)
        .select('scraped_at')
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalProducts: count || 0,
        retailers: [...new Set(retailers?.map(r => r.retailer) || [])],
        categories: [...new Set(categories?.map(c => c.category).filter(Boolean) || [])],
        lastUpdated: lastUpdate?.scraped_at || null,
      };

    } catch (error) {
      console.error('[PriceScraper] Error getting statistics:', error);
      return {
        totalProducts: 0,
        retailers: [],
        categories: [],
        lastUpdated: null,
      };
    }
  }

  /**
   * Helper: Get existing product by retailer and product ID
   */
  private async getExistingProduct(retailer: string, productId: string): Promise<PriceData | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('retailer', retailer)
        .eq('retailer_product_id', productId)
        .order('scraped_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as PriceData;

    } catch (error) {
      return null;
    }
  }

  /**
   * Trigger a scrape job
   */
  async triggerScrape(options: ScrapingOptions): Promise<{ success: boolean; message: string; data?: any }> {
    console.log('[PriceScraper] Triggering scrape job:', options);

    try {
      const result = await this.scrapeCategory(options);

      return {
        success: result.success,
        message: result.success
          ? `Successfully scraped ${result.total} products`
          : `Scraping failed: ${result.errors.join(', ')}`,
        data: result,
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const priceScraper = new PriceScrapingService();
