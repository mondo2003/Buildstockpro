/**
 * Price Database Service
 * Direct database access for price scraping operations
 * Uses Supabase client with service role permissions
 */

import { supabase } from '../utils/database';
import type { ScrapedProduct } from '../scrapers/base';

export interface PriceData extends ScrapedProduct {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Save scraped prices to database using Supabase client
 */
export async function savePricesToDatabase(prices: ScrapedProduct[]): Promise<PriceData[]> {
  console.log(`[PriceDB] Saving ${prices.length} prices to database...`);

  const saved: PriceData[] = [];

  for (const price of prices) {
    try {
      // Use Supabase upsert to handle duplicates
      const { data, error } = await supabase
        .from('scraped_prices')
        .upsert({
          product_name: price.product_name,
          retailer: price.retailer,
          retailer_product_id: price.retailer_product_id,
          price: price.price,
          currency: price.currency || 'GBP',
          product_url: price.product_url,
          image_url: price.image_url,
          brand: price.brand,
          category: price.category,
          in_stock: price.in_stock,
          stock_text: price.stock_text,
          scraped_at: new Date().toISOString()
        }, {
          onConflict: 'retailer,retailer_product_id'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        saved.push(data as PriceData);
        console.log(`[PriceDB] ✅ Saved: ${price.product_name}`);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      console.error(`[PriceDB] ❌ Error saving ${price.product_name}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[PriceDB] Successfully saved ${saved.length}/${prices.length} prices`);
  return saved;
}

/**
 * Get latest prices from database
 */
export async function getLatestPrices(limit: number = 100): Promise<PriceData[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_prices')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as PriceData[]) || [];
  } catch (error) {
    console.error('[PriceDB] Error fetching prices:', error);
    return [];
  }
}

/**
 * Get prices by retailer
 */
export async function getPricesByRetailer(retailer: string, limit: number = 50): Promise<PriceData[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_prices')
      .select('*')
      .eq('retailer', retailer)
      .order('scraped_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as PriceData[]) || [];
  } catch (error) {
    console.error('[PriceDB] Error fetching retailer prices:', error);
    return [];
  }
}

/**
 * Get prices for multiple products (batch check)
 */
export async function getPricesBatch(productIds: string[]): Promise<PriceData[]> {
  if (productIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('scraped_prices')
      .select('*')
      .in('retailer_product_id', productIds)
      .order('scraped_at', { ascending: false });

    if (error) throw error;
    return (data as PriceData[]) || [];
  } catch (error) {
    console.error('[PriceDB] Error fetching batch prices:', error);
    return [];
  }
}

/**
 * Get price statistics
 */
export async function getPriceStatistics(): Promise<{
  totalProducts: number;
  retailers: string[];
  categories: string[];
  lastUpdated: string | null;
}> {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('scraped_prices')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get distinct retailers
    const { data: retailers, error: retailerError } = await supabase
      .from('scraped_prices')
      .select('retailer');

    if (retailerError) throw retailerError;

    // Get distinct categories
    const { data: categories, error: categoryError } = await supabase
      .from('scraped_prices')
      .select('category')
      .not('category', 'is', null);

    if (categoryError) throw categoryError;

    // Get last update time
    const { data: lastUpdate, error: lastUpdateError } = await supabase
      .from('scraped_prices')
      .select('scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(1);

    if (lastUpdateError) throw lastUpdateError;

    return {
      totalProducts: count || 0,
      retailers: [...new Set(retailers?.map(r => r.retailer) || [])],
      categories: [...new Set(categories?.map(c => c.category) || [])],
      lastUpdated: lastUpdate?.[0]?.scraped_at || null,
    };
  } catch (error) {
    console.error('[PriceDB] Error getting statistics:', error);
    return {
      totalProducts: 0,
      retailers: [],
      categories: [],
      lastUpdated: null,
    };
  }
}
