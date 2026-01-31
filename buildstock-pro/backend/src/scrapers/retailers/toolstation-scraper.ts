import { BaseScraper, ScraperConfig, ScrapedProduct, ScrapingResult } from '../base-scraper';
import { load } from 'cheerio';
import { query, queryOne } from '../../utils/database';

/**
 * Toolstation Web Scraper
 *
 * Toolstation is similar to Screwfix with a trade-focused customer base
 * Website: https://www.toolstation.com
 *
 * Product categories:
 * - Power Tools: /power-tools/c/
 * - Hand Tools: /hand-tools/c/
 * - Electrical: /electrical/lighting/c/
 * - Plumbing: /plumbing/heating/c/
 * - Workwear: /workwear-safety/c/
 * - Security: /security/c/
 */
export class ToolstationScraper extends BaseScraper {
  merchantName = 'toolstation';

  // Toolstation-specific CSS selectors
  private selectors = {
    productCard: '.product-tile',
    productName: '.product-tile__name',
    productPrice: '.product-tile__price',
    productSku: '[data-product-code]',
    productUrl: 'a.product-tile__link',
    imageUrl: '.product-tile__image img',
    stockStatus: '.stock-status',
    productPage: {
      container: '.product-page',
      name: '.product-page__title, h1.product-name',
      price: '.product-price__value, .price__value',
      sku: '.product-code, .sku',
      description: '.product-description, .product-details',
      image: '.product-gallery img',
      stock: '.availability, .stock-indicator'
    },
    pagination: '.pagination a[rel="next"]'
  };

  constructor() {
    const config: ScraperConfig = {
      baseUrl: 'https://www.toolstation.com',
      rateLimitMs: 2500, // 2.5 seconds between requests (respectful)
      maxRetries: 3,
      timeout: 15000,
      useProxy: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    super(config);
  }

  /**
   * Scrape products by category
   */
  async scrapeProducts(category = 'power-tools'): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let productsScraped = 0;

    try {
      console.log(`[${this.merchantName}] Starting scrape for category: ${category}`);

      // Build category URL
      const categoryUrl = `${this.config.baseUrl}/${category}/c`;
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

    try {
      const response = await this.withRetry(() => this.fetchWithRateLimit(categoryUrl));
      const html = await response.text();
      const $ = load(html);

      // Extract products using Toolstation selectors
      $(this.selectors.productCard).each((_, element) => {
        try {
          const $el = $(element);

          const name = $el.find(this.selectors.productName).text().trim() ||
                      $el.find('.product-name').text().trim();
          const sku = $el.find(this.selectors.productSku).attr('data-product-code') ||
                     $el.find('[data-sku]').attr('data-sku') ||
                     this.generateSku(name);
          const priceStr = $el.find(this.selectors.productPrice).first().text().trim() ||
                          $el.find('.price').text().trim();
          const price = this.parsePrice(priceStr);
          const productUrl = $el.find(this.selectors.productUrl).attr('href') ||
                            $el.find('a[href*="/product/"]').attr('href');
          const fullUrl = productUrl?.startsWith('http')
            ? productUrl
            : productUrl
              ? `${this.config.baseUrl}${productUrl}`
              : '';
          const imageUrl = $el.find(this.selectors.imageUrl).attr('src') ||
                          $el.find(this.selectors.imageUrl).attr('data-src');
          const stockText = $el.find(this.selectors.stockStatus).text().trim();
          const stockLevel = this.parseStockLevel(stockText);

          if (!name || price === 0) {
            console.warn(`[${this.merchantName}] Skipping invalid product: ${name}`);
            return;
          }

          products.push({
            name,
            sku: `TS-${sku}`,
            category: this.extractCategory(fullUrl),
            description: $el.find('.product-description').text().trim() || undefined,
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
      const nextPageLink = $(this.selectors.pagination).attr('href');
      if (nextPageLink) {
        const fullNextUrl = nextPageLink.startsWith('http')
          ? nextPageLink
          : `${this.config.baseUrl}${nextPageLink}`;
        console.log(`[${this.merchantName}] Following pagination: ${fullNextUrl}`);
        const nextPageProducts = await this.scrapeCategoryPage(fullNextUrl);
        products.push(...nextPageProducts);
      }

    } catch (error) {
      console.error(`[${this.merchantName}] Error scraping category page:`, error);
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

      const name = $(this.selectors.productPage.name).first().text().trim() ||
                  $('h1').text().trim();
      const sku = $(this.selectors.productPage.sku).text().trim() ||
                 this.generateSku(name);
      const priceStr = $(this.selectors.productPage.price).first().text().trim();
      const price = this.parsePrice(priceStr);
      const imageUrl = $(this.selectors.productPage.image).attr('src') ||
                      $(this.selectors.productPage.image).attr('data-src');
      const stockText = $(this.selectors.productPage.stock).text().trim();
      const stockLevel = this.parseStockLevel(stockText);
      const description = $(this.selectors.productPage.description).text().trim();

      if (!name || price === 0) {
        return null;
      }

      return {
        name,
        sku: `TS-${sku}`,
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
    // Extract from path like /power-tools/drills/c/
    const match = url.match(/\/([^\/]+)\/c/);
    return match ? match[1].replace(/-/g, ' ') : 'general';
  }

  /**
   * Generate SKU from product name
   */
  private generateSku(name: string): string {
    return name
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

    $el.find('.product-spec li, .spec-item').each((_, el) => {
      const $li = $(el);
      const text = $li.text().trim();
      const parts = text.split(':');
      if (parts.length === 2) {
        specs[parts[0].trim()] = parts[1].trim();
      }
    });

    return Object.keys(specs).length > 0 ? specs : undefined;
  }

  /**
   * Extract detailed specifications from product page
   */
  private extractDetailedSpecs($: any): Record<string, any> | undefined {
    const specs: Record<string, any> = {};

    $('.product-specifications tr, .spec-row').each((_, el) => {
      const $row = $(el);
      const key = $row.find('th, .spec-label').text().trim();
      const value = $row.find('td, .spec-value').text().trim();
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
    // Remove TS- prefix for database lookup
    const cleanSku = product.sku.replace(/^TS-/, '');

    // Check if product exists
    const existing = await queryOne(
      'SELECT id FROM products WHERE sku = $1 OR sku = $2',
      [cleanSku, product.sku]
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
      "SELECT id FROM merchants WHERE slug = 'toolstation'"
    );

    if (!merchant) {
      throw new Error('Toolstation merchant not found in database');
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
