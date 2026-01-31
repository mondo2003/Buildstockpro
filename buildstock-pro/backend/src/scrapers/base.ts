/**
 * Base scraper interface and types
 */

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

export interface ScraperConfig {
  baseUrl: string;
  userAgent: string;
  requestDelay: number;
  maxRetries: number;
}

export interface ScrapingResult {
  success: boolean;
  products: ScrapedProduct[];
  total: number;
  errors: string[];
  category: string;
  scrapedAt: string;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  protected extractPrice(priceText: string): number | null {
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return null;
  }

  abstract scrapeCategory(category: string, maxProducts: number): Promise<ScrapingResult>;
  abstract scrapeProduct(url: string): Promise<ScrapedProduct | null>;
  abstract searchProducts(query: string, maxResults: number): Promise<ScrapingResult>;
}
