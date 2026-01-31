import axios from 'axios';
import * as cheerio from 'cheerio';

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

const SCREWFIX_BASE_URL = 'https://www.screwfix.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const REQUEST_DELAY = 2000; // 2 seconds between requests to respect rate limits

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Clean and extract text
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// Extract price from text (handles various formats)
function extractPrice(priceText: string): number | null {
  const match = priceText.match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ''));
  }
  return null;
}

// Generate product ID from URL
function extractProductId(url: string): string {
  const match = url.match(/\/([^\/]+)\/?$/);
  return match ? match[1] : '';
}

/**
 * Scrape a single product page
 */
export async function scrapeProduct(url: string): Promise<ScrapedProduct | null> {
  try {
    console.log(`[Screwfix] Scraping product: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const product: ScrapedProduct = {
      product_name: '',
      retailer: 'screwfix',
      retailer_product_id: '',
      price: 0,
      currency: 'GBP',
      product_url: url,
      image_url: '',
      brand: '',
      category: '',
      in_stock: false,
      stock_text: '',
    };

    // Extract product name
    product.product_name = $('h1.product-name, h1.product_title, .product-page-title, [data-test="product-name"]').first().text().trim() ||
                          $('.product-info h1').first().text().trim() ||
                          $('h1').first().text().trim();

    // Extract price
    const priceSelector = '.product-price, .price-value, [data-test="product-price"], .product-price__value';
    const priceText = $(priceSelector).first().text().trim();
    const price = extractPrice(priceText);
    if (price !== null) {
      product.price = price;
    }

    // Extract brand
    product.brand = $('.product-brand, [data-test="product-brand"], .brand-name').first().text().trim() ||
                   $('meta[property="product:brand"]').attr('content') || '';

    // Extract image
    product.image_url = $('.product-image img, .main-image img, [data-test="product-image"]').first().attr('src') ||
                       $('meta[property="og:image"]').attr('content') || '';

    // Ensure image URL is absolute
    if (product.image_url && !product.image_url.startsWith('http')) {
      product.image_url = SCREWFIX_BASE_URL + product.image_url;
    }

    // Extract stock status
    const stockText = $('.stock-status, [data-test="stock-status"], .availability').first().text().trim();
    product.stock_text = stockText;
    product.in_stock = /in stock|available|add to cart/i.test(stockText);

    // Extract product ID
    product.retailer_product_id = extractProductId(url);

    // Extract category from breadcrumb
    product.category = $('.breadcrumb a:last, .breadcrumbs a:last').text().trim() ||
                      $('meta[property="product:category"]').attr('content') || '';

    console.log(`[Screwfix] Successfully scraped: ${product.product_name} - £${product.price}`);
    return product;

  } catch (error) {
    console.error(`[Screwfix] Error scraping product ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Scrape products from a category page
 */
export async function scrapeCategory(category: string, maxProducts: number = 20): Promise<ScrapingResult> {
  const result: ScrapingResult = {
    success: false,
    products: [],
    total: 0,
    errors: [],
    category,
    scrapedAt: new Date().toISOString(),
  };

  try {
    console.log(`[Screwfix] Starting category scrape: ${category} (max ${maxProducts} products)`);

    // Build category URL
    const categoryUrl = `${SCREWFIX_BASE_URL}/${category}`; // e.g., '/cat/power-tools-cat830092'

    console.log(`[Screwfix] Fetching category page: ${categoryUrl}`);

    const response = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Find product links on the category page
    const productLinks: string[] = [];

    // Try multiple selectors for product links
    const selectors = [
      'a.product-tile__link',
      'a.product-link',
      '.product-item a',
      '.product-list a',
      'a[href*="/p/"]',
      '.product-tile a',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('/p/') && productLinks.length < maxProducts) {
          const fullUrl = href.startsWith('http') ? href : SCREWFIX_BASE_URL + href;
          if (!productLinks.includes(fullUrl)) {
            productLinks.push(fullUrl);
          }
        }
      });

      if (productLinks.length > 0) {
        console.log(`[Screwfix] Found ${productLinks.length} products using selector: ${selector}`);
        break;
      }
    }

    if (productLinks.length === 0) {
      result.errors.push('No products found on category page');
      console.warn('[Screwfix] No product links found. The page structure may have changed.');
      return result;
    }

    console.log(`[Screwfix] Found ${productLinks.length} product links. Starting to scrape...`);

    // Scrape each product
    let scrapedCount = 0;
    for (const productUrl of productLinks) {
      if (scrapedCount >= maxProducts) break;

      try {
        const product = await scrapeProduct(productUrl);
        if (product) {
          result.products.push(product);
          scrapedCount++;
        }

        // Rate limiting: delay between requests
        await delay(REQUEST_DELAY);

      } catch (error) {
        const errorMsg = `Failed to scrape ${productUrl}: ${error instanceof Error ? error.message : error}`;
        result.errors.push(errorMsg);
        console.error(`[Screwfix] ${errorMsg}`);
      }
    }

    result.total = result.products.length;
    result.success = result.products.length > 0;

    console.log(`[Screwfix] Category scrape complete: ${result.products.length}/${productLinks.length} products scraped`);
    return result;

  } catch (error) {
    const errorMsg = `Failed to scrape category ${category}: ${error instanceof Error ? error.message : error}`;
    result.errors.push(errorMsg);
    console.error(`[Screwfix] ${errorMsg}`);
    return result;
  }
}

/**
 * Check if scraping is allowed by robots.txt
 */
export async function checkRobotsTxt(): Promise<boolean> {
  try {
    const response = await axios.get(`${SCREWFIX_BASE_URL}/robots.txt`, {
      timeout: 5000,
    });

    const robotsTxt = response.data;
    console.log('[Screwfix] robots.txt:', robotsTxt);

    // Check if scraping is disallowed
    if (robotsTxt.includes('Disallow: /')) {
      console.warn('[Screwfix] robots.txt disallows all scraping');
      return false;
    }

    return true;

  } catch (error) {
    console.warn('[Screwfix] Could not fetch robots.txt, proceeding with caution');
    return true; // Assume allowed if we can't check
  }
}

/**
 * Search for products on Screwfix
 */
export async function searchProducts(query: string, maxResults: number = 10): Promise<ScrapingResult> {
  const result: ScrapingResult = {
    success: false,
    products: [],
    total: 0,
    errors: [],
    category: `search:${query}`,
    scrapedAt: new Date().toISOString(),
  };

  try {
    console.log(`[Screwfix] Searching for: ${query}`);

    const searchUrl = `${SCREWFIX_BASE_URL}/search?q=${encodeURIComponent(query)}&searchButton=`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const productLinks: string[] = [];

    // Extract product links from search results
    $('a[href*="/p/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && productLinks.length < maxResults) {
        const fullUrl = href.startsWith('http') ? href : SCREWFIX_BASE_URL + href;
        if (!productLinks.includes(fullUrl)) {
          productLinks.push(fullUrl);
        }
      }
    });

    console.log(`[Screwfix] Found ${productLinks.length} products for search: ${query}`);

    // Scrape each product
    for (const productUrl of productLinks) {
      const product = await scrapeProduct(productUrl);
      if (product) {
        result.products.push(product);
      }
      await delay(REQUEST_DELAY);
    }

    result.total = result.products.length;
    result.success = result.products.length > 0;

    return result;

  } catch (error) {
    result.errors.push(`Search failed: ${error instanceof Error ? error.message : error}`);
    console.error('[Screwfix] Search error:', error);
    return result;
  }
}
