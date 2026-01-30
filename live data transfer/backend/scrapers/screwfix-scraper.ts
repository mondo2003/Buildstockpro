import { BaseScraper, ScraperConfig, ScrapedProduct, ScrapingResult } from './base-scraper';
import { load } from 'cheerio';
import { query } from '../utils/database';

/**
 * Screwfix Web Scraper
 *
 * Product categories:
 * - Electrical: /p/electrical/lighting/
 * - Plumbing: /p/plumbing/heating/
 * - Tools: /p/tools/power-tools/
 * - Safety: /p/workwear/safety-wear/
 * - Decorating: /p/decorating/paint/
 * - etc.
 */
export class ScrewfixScraper extends BaseScraper {
  merchantName = 'screwfix';

  constructor() {
    const config: ScraperConfig = {
      baseUrl: 'https://www.screwfix.com',
      rateLimitMs: 2000, // 2 seconds between requests (respectful)
      maxRetries: 3,
      timeout: 15000, // 15 seconds
      useProxy: false, // Set to true in production with proxy rotation
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    super(config);
  }

  /**
   * Scrape products by category
   */
  async scrapeProducts(category = 'electrical'): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let productsScraped = 0;

    try {
      console.log(`[${this.merchantName}] Starting scrape for category: ${category}`);

      // Build category URL
      const categoryUrl = `${this.config.baseUrl}/p/${category}/c`;
      console.log(`[${this.merchantName}] Category URL: ${categoryUrl}`);

      // Fetch category page
      const products = await this.scrapeCategoryPage(categoryUrl);

      // Save to database
      for (const product of products) {
        try {
          await this.saveProduct(product);
          productsScraped++;
        } catch (error) {
          const errorMsg = `Failed to save product ${product.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`[${this.merchantName}] ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        productsScraped,
        errors,
        duration,
        lastScrapedAt: new Date()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        productsScraped,
        errors: [`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        duration,
        lastScrapedAt: new Date()
      };
    }
  }

  /**
   * Scrape products from a category page
   */
  private async scrapeCategoryPage(categoryUrl: string): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];

    const response = await this.withRetry(() => this.fetchWithRateLimit(categoryUrl));
    const html = await response.text();
    const $ = load(html);

    // Screwfix product selectors (may need to be updated based on actual HTML structure)
    $('.product-box').each((_, element) => {
      try {
        const $el = $(element);

        const name = $el.find('.product-box__title').text().trim();
        const sku = $el.find('[data-sku]').attr('data-sku') || this.generateSku(name);
        const priceStr = $el.find('.price__value').text().trim();
        const price = this.parsePrice(priceStr);
        const productUrl = $el.find('a.product-box__link').attr('href') || '';
        const fullUrl = productUrl.startsWith('http') ? productUrl : `${this.config.baseUrl}${productUrl}`;
        const imageUrl = $el.find('img.product-box__image').attr('src') || $el.find('img.product-box__image').attr('data-src');
        const stockText = $el.find('.stock-status').text().trim();
        const stockLevel = this.parseStockLevel(stockText);

        if (!name || price === 0) {
          console.warn(`[${this.merchantName}] Skipping invalid product: ${name}`);
          return;
        }

        products.push({
          name,
          sku,
          category: this.extractCategory(fullUrl),
          description: $el.find('.product-box__description').text().trim() || undefined,
          price,
          stockLevel,
          stockStatus: this.getStockStatus(stockLevel),
          productUrl: fullUrl,
          imageUrl: imageUrl || undefined,
          specifications: this.extractSpecs($el)
        });
      } catch (error) {
        console.error(`[${this.merchantName}] Error parsing product:`, error);
      }
    });

    console.log(`[${this.merchantName}] Found ${products.length} products on page`);

    // Check for pagination
    const nextPage = $('.pagination__next').attr('href');
    if (nextPage) {
      const fullNextUrl = nextPage.startsWith('http') ? nextPage : `${this.config.baseUrl}${nextPage}`;
      console.log(`[${this.merchantName}] Following pagination: ${fullNextUrl}`);
      const nextPageProducts = await this.scrapeCategoryPage(fullNextUrl);
      products.push(...nextPageProducts);
    }

    return products;
  }

  /**
   * Scrape a single product page for detailed info
   */
  async scrapeProductPage(productUrl: string): Promise<ScrapedProduct | null> {
    try {
      const response = await this.withRetry(() => this.fetchWithRateLimit(productUrl));
      const html = await response.text();
      const $ = load(html);

      const name = $('h1.product-page__title').text().trim();
      const sku = $('span.product-sku').text().trim() || this.generateSku(name);
      const priceStr = $('.product-price__value').first().text().trim();
      const price = this.parsePrice(priceStr);
      const imageUrl = $('.product-gallery__image img').attr('src') || $('.product-gallery__image img').attr('data-src');
      const stockText = $('.stock-indicator').text().trim();
      const stockLevel = this.parseStockLevel(stockText);
      const description = $('.product-description').text().trim();

      if (!name || price === 0) {
        return null;
      }

      return {
        name,
        sku,
        category: this.extractCategory(productUrl),
        description: description || undefined,
        price,
        stockLevel,
        stockStatus: this.getStockStatus(stockLevel),
        productUrl,
        imageUrl: imageUrl || undefined,
        specifications: this.extractDetailedSpecs($)
      };
    } catch (error) {
      console.error(`[${this.merchantName}] Error scraping product page ${productUrl}:`, error);
      return null;
    }
  }

  /**
   * Extract category from URL
   */
  private extractCategory(url: string): string {
    const match = url.match(/\/p\/([^\/]+)/);
    return match ? match[1] : 'general';
  }

  /**
   * Generate SKU from product name
   */
  private generateSku(name: string): string {
    return 'SF-' + name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }

  /**
   * Extract specifications from product card
   */
  private extractSpecs($el: any): Record<string, any> | undefined {
    const specs: Record<string, any> = {};

    $el.find('.product-spec li').each((_, el) => {
      const $li = $(el);
      const key = $li.find('.spec-key').text().trim();
      const value = $li.find('.spec-value').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });

    return Object.keys(specs).length > 0 ? specs : undefined;
  }

  /**
   * Extract detailed specifications from product page
   */
  private extractDetailedSpecs($: any): Record<string, any> | undefined {
    const specs: Record<string, any> = {};

    $('.product-specifications__row').each((_, el) => {
      const $row = $(el);
      const key = $row.find('.spec-name').text().trim();
      const value = $row.find('.spec-value').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });

    return Object.keys(specs).length > 0 ? specs : undefined;
  }

  /**
   * Save product to database
   */
  private async saveProduct(product: ScrapedProduct): Promise<void> {
    // Check if product exists
    const existing = await queryOne(
      'SELECT id FROM products WHERE sku = $1',
      [product.sku]
    );

    let productId: string;

    if (existing) {
      productId = existing.id;

      // Update existing product
      await query(
        `UPDATE products SET
          name = $1,
          description = $2,
          specifications = $3,
          image_url = $4,
          updated_at = NOW()
        WHERE id = $5`,
        [
          product.name,
          product.description || null,
          JSON.stringify(product.specifications || {}),
          product.imageUrl || null,
          productId
        ]
      );
    } else {
      // Insert new product
      const [newProduct] = await query(
        `INSERT INTO products (name, sku, category, description, specifications, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (sku) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          specifications = EXCLUDED.specifications,
          image_url = EXCLUDED.image_url
        RETURNING id`,
        [
          product.name,
          product.sku,
          product.category,
          product.description || null,
          JSON.stringify(product.specifications || {}),
          product.imageUrl || null
        ]
      );
      productId = newProduct.id;
    }

    // Get merchant ID
    const merchant = await queryOne(
      "SELECT id FROM merchants WHERE slug = 'screwfix'"
    );

    if (!merchant) {
      throw new Error('Screwfix merchant not found in database');
    }

    // Update or insert product listing
    await query(
      `INSERT INTO product_listings (
        product_id, merchant_id, merchant_sku, price,
        stock_level, stock_status, stock_last_updated,
        is_available, merchant_product_url, last_synced_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, NOW(), true)
      ON CONFLICT (product_id, merchant_id, merchant_sku) DO UPDATE SET
        price = EXCLUDED.price,
        stock_level = EXCLUDED.stock_level,
        stock_status = EXCLUDED.stock_status,
        stock_last_updated = EXCLUDED.stock_last_updated,
        is_available = EXCLUDED.is_available,
        merchant_product_url = EXCLUDED.merchant_product_url,
        last_synced_at = EXCLUDED.last_synced_at`,
      [
        productId,
        merchant.id,
        product.sku,
        product.price,
        product.stockLevel,
        product.stockStatus,
        product.stockLevel > 0
      ]
    );
  }
}

// Helper function for database queries
async function queryOne(sql: string, params: any[] = []): Promise<any> {
  // This should use your actual database connection
  // For now, placeholder
  return null;
}

async function query(sql: string, params: any[] = []): Promise<any[]> {
  // This should use your actual database connection
  // For now, placeholder
  return [];
}
