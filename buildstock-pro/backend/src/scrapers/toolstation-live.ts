/**
 * Toolstation Live Scraper
 * Scrapes product data from Toolstation website
 */

import { load } from 'cheerio';
import type { ScrapedProduct, ScrapingResult } from './base';

export class ToolstationLiveScraper {
  private readonly baseUrl = 'https://www.toolstation.com';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  /**
   * Scrape products from a category page
   */
  async scrapeCategory(category: string, limit: number = 20): Promise<ScrapingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const products: ScrapedProduct[] = [];

    try {
      // Try different URL formats for Toolstation
      const possibleUrls = [
        `${this.baseUrl}/${category}/c/${category}`,
        `${this.baseUrl}/shop/${category}`,
        `${this.baseUrl}/search?q=${encodeURIComponent(category)}`,
      ];

      let html: string | null = null;
      let workingUrl = '';

      for (const url of possibleUrls) {
        console.log(`[ToolstationLive] Trying: ${url}`);

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': this.userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-GB,en;q=0.9',
            },
            signal: AbortSignal.timeout(10000),
          });

          if (response.ok) {
            html = await response.text();
            workingUrl = url;
            console.log(`[ToolstationLive] ✅ Success with: ${url}`);
            break;
          } else {
            console.log(`[ToolstationLive] ❌ HTTP ${response.status}`);
          }
        } catch (err) {
          console.log(`[ToolstationLive] ❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }

      if (!html) {
        errors.push('Failed to fetch page - all URL formats failed');
        throw new Error('All URL formats returned errors');
      }

      const $ = load(html);

      // Try different selectors that Toolstation might use
      const productSelectors = [
        '.product-tile',
        '[data-component="product-card"]',
        '.product-list-item',
        '.product',
        '[class*="product"]'
      ];

      let foundCount = 0;

      for (const selector of productSelectors) {
        $(selector).each((_, element) => {
          if (products.length >= limit) return false;

          try {
            const $el = $(element);

            // Extract product data with multiple selector attempts
            const name = this.extractText($el, [
              '.product-name',
              '[data-product-name]',
              'h3',
              '.product-title',
              'a[title]'
            ]);

            const priceText = this.extractText($el, [
              '.price',
              '[data-price]',
              '.product-price',
              '.price-value'
            ]);

            const price = this.parsePrice(priceText);
            const productUrl = this.extractAttr($el, 'href', [
              'a.product-link',
              'a[href*="/p/"]',
              'a[href*="/shop/"]',
              'a'
            ]);

            const imageUrl = this.extractAttr($el, 'src', [
              'img.product-image',
              'img[src*="media"]',
              'img[class*="image"]',
              'img'
            ]);

            const stockText = this.extractText($el, [
              '.stock-status',
              '[data-stock]',
              '.availability',
              '.stock'
            ]);

            const sku = this.extractText($el, [
              '[data-sku]',
              '.sku',
              '.product-code'
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

            const fullImageUrl = imageUrl?.startsWith('http')
              ? imageUrl
              : imageUrl
                ? `${this.baseUrl}${imageUrl}`
                : this.getDefaultImage(category);

            products.push({
              product_name: name.trim(),
              retailer: 'toolstation',
              retailer_product_id: sku || this.generateProductId(name, fullUrl),
              price,
              currency: 'GBP',
              product_url: fullUrl,
              image_url: fullImageUrl,
              brand: this.extractBrand(name),
              category: this.formatCategory(category),
              in_stock: this.parseStockStatus(stockText),
              stock_text: stockText || 'Unknown',
              unit_type: this.detectUnitType(name),
              product_description: this.extractDescription($el),
            });

            foundCount++;

          } catch (error) {
            // Silently skip invalid products
          }
        });

        if (products.length > 0) {
          console.log(`[ToolstationLive] Found ${products.length} products with selector: ${selector}`);
          break;
        }
      }

      if (products.length === 0) {
        errors.push('No products found - selectors may need updating');
      }

      const duration = Date.now() - startTime;
      console.log(`[ToolstationLive] Scraped ${products.length} products in ${duration}ms`);

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
      console.error(`[ToolstationLive] Error: ${errorMsg}`);
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
    return `ts-${cleanName}-${hash.slice(0, 10)}`;
  }

  /**
   * Extract brand from product name
   */
  private extractBrand(name: string): string {
    const brands = [
      'DeWalt', 'Makita', 'Bosch', 'Milwaukee', 'Hitachi', 'Stanley',
      'Bahco', 'Wera', 'Stabila', 'Flymo', 'Hozelock', 'Spear & Jackson',
      'Draper', 'Silverline', 'Erbauer', 'Titan', 'Eraser', 'CK',
      'Faithfull', 'Record', 'Irwin', 'Lenox', 'Blue Point', 'Taparia'
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

  /**
   * Detect unit type from product name
   */
  private detectUnitType(name: string): 'each' | 'meter' | 'kg' | 'sqm' | 'litre' | 'pack' | 'pair' | 'set' | 'tonne' | 'm2' | 'm3' | undefined {
    const lower = name.toLowerCase();
    if (lower.includes('per meter') || lower.includes('/m')) return 'meter';
    if (lower.includes('per kg') || lower.includes('/kg')) return 'kg';
    if (lower.includes('per sqm') || lower.includes('m²')) return 'sqm';
    if (lower.includes('per litre') || lower.includes('/l')) return 'litre';
    if (lower.includes('pack') || lower.includes('pack of')) return 'pack';
    if (lower.includes('pair')) return 'pair';
    if (lower.includes('set')) return 'set';
    if (lower.includes('tonne')) return 'tonne';
    return 'each';
  }

  /**
   * Extract product description
   */
  private extractDescription($el: any): string | undefined {
    const desc = this.extractText($el, ['.product-description', '.description', '[data-description]']);
    return desc || undefined;
  }

  /**
   * Get default image based on category
   */
  private getDefaultImage(category: string): string {
    const defaultImages: Record<string, string> = {
      'power-tools': 'https://media.toolstation.com/images/145020_medium.jpg',
      'hand-tools': 'https://media.toolstation.com/images/24351_medium.jpg',
      'plumbing': 'https://media.toolstation.com/images/57531_medium.jpg',
      'electrical': 'https://media.toolstation.com/images/68721_medium.jpg',
    };

    return defaultImages[category] || 'https://media.toolstation.com/images/145020_medium.jpg';
  }
}

// Singleton instance
export const toolstationLive = new ToolstationLiveScraper();
