import { load } from 'cheerio';
import { ProxyAgent } from 'undici';

/**
 * Web scraping configuration
 */
export interface ScraperConfig {
  baseUrl: string;
  rateLimitMs: number; // Milliseconds between requests
  maxRetries: number;
  timeout: number;
  useProxy: boolean;
  proxyUrl?: string;
  userAgent: string;
}

/**
 * Scraped product data
 */
export interface ScrapedProduct {
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  stockLevel: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  productUrl: string;
  imageUrl?: string;
  branchCode?: string; // For branch-specific scraping
  specifications?: Record<string, any>;
}

/**
 * Scraping result
 */
export interface ScrapingResult {
  success: boolean;
  productsScraped: number;
  errors: string[];
  duration: number;
  lastScrapedAt: Date;
}

/**
 * Robots.txt rule
 */
interface RobotsRule {
  path: string;
  allow: boolean;
}

/**
 * Base scraper with ethical web scraping practices
 */
export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected robotsRules: RobotsRule[] = [];
  protected lastRequestTime = 0;
  protected requestCount = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Merchant identifier (e.g., 'screwfix', 'travis-perkins')
   */
  abstract merchantName: string;

  /**
   * Fetch and parse robots.txt
   */
  protected async fetchRobotsTxt(): Promise<void> {
    try {
      const robotsUrl = new URL('/robots.txt', this.config.baseUrl).toString();
      const response = await this.fetchWithRateLimit(robotsUrl);
      const text = await response.text();

      this.parseRobotsTxt(text);
      console.log(`[${this.merchantName}] Parsed robots.txt: ${this.robotsRules.length} rules`);
    } catch (error) {
      console.warn(`[${this.merchantName}] Could not fetch robots.txt:`, error);
      // Default to allowing all if robots.txt is unavailable
      this.robotsRules = [];
    }
  }

  /**
   * Parse robots.txt content
   */
  private parseRobotsTxt(text: string): void {
    this.robotsRules = [];
    const lines = text.split('\n');
    let userAgent = '*';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, value] = trimmed.split(':').map(s => s.trim().toLowerCase());

      if (key === 'user-agent') {
        userAgent = value;
      } else if (key === 'disallow') {
        this.robotsRules.push({
          path: value,
          allow: false
        });
      } else if (key === 'allow') {
        this.robotsRules.push({
          path: value,
          allow: true
        });
      }
    }
  }

  /**
   * Check if URL is allowed by robots.txt
   */
  protected isAllowed(url: string): boolean {
    const urlPath = new URL(url).pathname;

    // If no rules, allow everything
    if (this.robotsRules.length === 0) return true;

    // Check all matching rules (most specific wins)
    const matchingRules = this.robotsRules
      .filter(rule => urlPath.startsWith(rule.path))
      .sort((a, b) => b.path.length - a.path.length); // Longer paths = more specific

    if (matchingRules.length === 0) return true;

    // Return the most specific rule
    return matchingRules[0].allow;
  }

  /**
   * Fetch with rate limiting
   */
  protected async fetchWithRateLimit(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    // Check robots.txt
    if (!this.isAllowed(url)) {
      throw new Error(`Disallowed by robots.txt: ${url}`);
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.rateLimitMs) {
      const waitTime = this.config.rateLimitMs - timeSinceLastRequest;
      console.log(`[${this.merchantName}] Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options?.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };

    // Add proxy if configured
    if (this.config.useProxy && this.config.proxyUrl) {
      const dispatcher = new ProxyAgent(this.config.proxyUrl);
      // @ts-ignore - undici dispatcher
      fetchOptions.dispatcher = dispatcher;
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
        console.warn(`[${this.merchantName}] Rate limited (429). Waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.fetchWithRateLimit(url, options);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`[${this.merchantName}] Fetch error:`, error);
      throw error;
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    retries = this.config.maxRetries
  ): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries) {
          throw error;
        }

        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s...
        console.warn(`[${this.merchantName}] Retry ${i + 1}/${retries} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Parse price from string (e.g., "£12.99" -> 12.99)
   */
  protected parsePrice(priceStr: string): number {
    const cleaned = priceStr
      .replace(/[£$€¥,]/g, '')
      .trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Parse stock level from text
   */
  protected parseStockLevel(stockText: string): number {
    const lower = stockText.toLowerCase();

    // Look for numbers in the text
    const numberMatch = stockText.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }

    // Use keywords
    if (lower.includes('in stock') || lower.includes('available')) {
      return 100; // Assume high stock
    }
    if (lower.includes('low stock') || lower.includes('few left')) {
      return 10;
    }
    if (lower.includes('out of stock') || lower.includes('unavailable')) {
      return 0;
    }

    return 0; // Default to unknown/0
  }

  /**
   * Parse stock status from level
   */
  protected getStockStatus(level: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (level === 0) return 'out_of_stock';
    if (level < 20) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Main scraping method - to be implemented by each merchant
   */
  abstract scrapeProducts(category?: string): Promise<ScrapingResult>;

  /**
   * Scrape a single product page
   */
  abstract scrapeProductPage(productUrl: string): Promise<ScrapedProduct | null>;

  /**
   * Initialize scraper (fetch robots.txt, etc.)
   */
  async initialize(): Promise<void> {
    await this.fetchRobotsTxt();
    console.log(`[${this.merchantName}] Scraper initialized`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithRateLimit(this.config.baseUrl, {
        method: 'HEAD'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
