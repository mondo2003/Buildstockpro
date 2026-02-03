/**
 * Simple Screwfix Live Scraper
 * Scrapes product data from Screwfix website
 */

import { load } from 'cheerio';

export interface ScrapedProduct {
  product_name: string;
  retailer: string;
  retailer_product_id: string;
  price: number;
  currency: string;
  product_url: string;
  image_url: string;
  brand: string;
  category: string;
  in_stock: boolean;
  stock_text: string;
}

export interface ScrapingResult {
  success: boolean;
  products: ScrapedProduct[];
  total: number;
  errors: string[];
  category: string;
  scrapedAt: string;
}

export class ScrewfixLiveScraper {
  private readonly baseUrl = 'https://www.screwfix.com';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  /**
   * Scrape products from a category page
   */
  async scrapeCategory(category: string, limit: number = 20): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const products: ScrapedProduct[] = [];

    try {
      // Try different URL formats for Screwfix
      const possibleUrls = [
        `${this.baseUrl}/p/${category}/c`,
        `${this.baseUrl}/p/${category}`,
        `${this.baseUrl}/cat/${category}`,
        `${this.baseUrl}/search/results?q=${encodeURIComponent(category)}`,
      ];

      let html: string | null = null;
      let workingUrl = '';

      for (const url of possibleUrls) {
        console.log(`[ScrewfixLive] Trying: ${url}`);

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-GB,en;q=0.9',
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (response.ok) {
            html = await response.text();
            workingUrl = url;
            console.log(`[ScrewfixLive] ✅ Success with: ${url}`);
            break;
          } else {
            console.log(`[ScrewfixLive] ❌ HTTP ${response.status}`);
          }
        } catch (err) {
          console.log(`[ScrewfixLive] ❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }

      if (!html) {
        errors.push('Failed to fetch page - all URL formats failed');
        throw new Error('All URL formats returned errors');
      }

      const $ = load(html);

      // Try different selectors that Screwfix might use
      const productSelectors = [
        '.product-box',
        '[data-component="product-list-item"]',
        '.product-tile',
        '.item',
        '[data-product-id]'
      ];

      let foundCount = 0;

      for (const selector of productSelectors) {
        $(selector).each((_, element) => {
          if (products.length >= limit) return false; // Stop if we hit the limit

          try {
            const $el = $(element);

            // Extract product data with multiple selector attempts
            const name = this.extractText($el, [
              '.product-box__title',
              '[data-product-name]',
              'h3',
              '.product-name'
            ]);

            const priceText = this.extractText($el, [
              '.price__value',
              '[data-price]',
              '.price',
              '.product-price'
            ]);

            const price = this.parsePrice(priceText);
            const productUrl = this.extractAttr($el, 'href', [
              'a.product-box__link',
              'a[href*="/p/"]',
              'a'
            ]);

            const imageUrl = this.extractAttr($el, 'src', [
              'img.product-box__image',
              'img[src*="images"]',
              'img'
            ]);

            const stockText = this.extractText($el, [
              '.stock-status',
              '[data-stock]',
              '.availability'
            ]);

            // Skip if missing critical data
            if (!name || !price || price <= 0) {
              return;
            }

            const fullUrl = productUrl?.startsWith('http')
              ? productUrl
              : productUrl
                ? `${this.baseUrl}${productUrl}`
                : '';

            products.push({
              product_name: name.trim(),
              retailer: 'screwfix',
              retailer_product_id: this.generateProductId(name, fullUrl),
              price,
              currency: 'GBP',
              product_url: fullUrl,
              image_url: imageUrl || '',
              brand: this.extractBrand(name),
              category: this.formatCategory(category),
              in_stock: this.parseStockStatus(stockText),
              stock_text: stockText || 'Unknown',
            });

            foundCount++;

          } catch (error) {
            // Silently skip invalid products
          }
        });

        if (products.length > 0) {
          console.log(`[ScrewfixLive] Found ${products.length} products with selector: ${selector}`);
          break; // Use first successful selector
        }
      }

      if (products.length === 0) {
        errors.push('No products found - selectors may need updating');
      }

      const duration = Date.now() - startTime;
      console.log(`[ScrewfixLive] Scraped ${products.length} products in ${duration}ms`);

      return {
        success: errors.length === 0,
        products,
        total: products.length,
        errors,
        category,
        scrapedAt: new Date().toISOString(),
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ScrewfixLive] Error: ${errorMsg}`);
      errors.push(errorMsg);

      return {
        success: false,
        products,
        total: 0,
        errors,
        category,
        scrapedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Extract text using multiple selector attempts
   */
  private extractText($el: any, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $el.find(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }

  /**
   * Extract attribute using multiple selector attempts
   */
  private extractAttr($el: any, attr: string, selectors: string[]): string {
    for (const selector of selectors) {
      const value = $el.find(selector).first().attr(attr);
      if (value) return value;
    }
    return '';
  }

  /**
   * Parse price from text
   */
  private parsePrice(priceText: string): number {
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  /**
   * Generate product ID from name and URL
   */
  private generateProductId(name: string, url: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const hash = url.split('/').filter(Boolean).pop() || 'unknown';
    return `sfx-${cleanName}-${hash.slice(0, 10)}`;
  }

  /**
   * Extract brand from product name
   */
  private extractBrand(name: string): string {
    const brands = [
      'DeWalt', 'Makita', 'Bosch', 'Milwaukee', 'Hitachi', 'Stanley',
      'Bahco', 'Wera', 'Stabila', 'Flymo', 'Hozelock', 'Spear & Jackson',
      'Draper', 'Silverline', 'Erbauer', 'Titan', 'Eraser', 'Stanley',
      'Trend', 'Rutland', 'CK', 'Faithfull', 'Record', 'Irwin', 'Lenox'
    ];

    const upperName = name.toUpperCase();
    for (const brand of brands) {
      if (upperName.includes(brand.toUpperCase())) {
        return brand;
      }
    }

    return 'Unknown';
  }

  /**
   * Format category for display
   */
  private formatCategory(category: string): string {
    return category.split('/').pop() || category;
  }

  /**
   * Parse stock status
   */
  private parseStockStatus(stockText: string): boolean {
    const text = stockText.toLowerCase();
    return !text.includes('out of stock') &&
           !text.includes('unavailable') &&
           !text.includes('sold out');
  }
}

// Singleton instance
export const screwfixLive = new ScrewfixLiveScraper();
