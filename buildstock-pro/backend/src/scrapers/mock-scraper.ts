/**
 * Mock scraper for testing and development
 * Generates realistic hardware store product data
 */

import type { ScrapedProduct, ScrapingResult, ScraperConfig } from './base';

export class MockScraper {
  private retailers = ['screwfix', 'wickes', 'bandq', 'jewson', 'travisperkins'];
  private categories = [
    'power-tools',
    'hand-tools',
    'insulation',
    'plumbing',
    'electrical',
    'building-materials',
    'decorating',
    'gardening',
  ];

  private productTemplates = {
    'power-tools': [
      { name: 'Cordless Drill Driver 18V', brand: 'DeWalt', basePrice: 89.99 },
      { name: 'Angle Grinder 115mm 720W', brand: 'Makita', basePrice: 69.99 },
      { name: 'Circular Saw 190mm 1200W', brand: 'Bosch', basePrice: 119.99 },
      { name: 'Impact Driver 18V Brushless', brand: 'Milwaukee', basePrice: 149.99 },
      { name: 'Jigsaw 700W Variable Speed', brand: 'Hitachi', basePrice: 79.99 },
    ],
    'hand-tools': [
      { name: 'Claw Hammer 20oz Fibreglass', brand: 'Stanley', basePrice: 14.99 },
      { name: 'Tape Measure 8m Auto-Lock', brand: 'DeWalt', basePrice: 9.99 },
      { name: 'Spirit Level 1200mm Magnetic', brand: 'Stabila', basePrice: 29.99 },
      { name: 'Screwdriver Set 50 Piece', brand: 'Wera', basePrice: 34.99 },
      { name: 'Adjustable Wrench 10inch', brand: 'Bahco', basePrice: 19.99 },
    ],
    'insulation': [
      { name: 'Insulation Roll 10.82m² 100mm', brand: 'Knauf', basePrice: 24.99 },
      { name: 'Multifoil Insulation 10m Roll', brand: 'YBS', basePrice: 89.99 },
      { name: 'PIR Board 2400mm x 1200mm 50mm', brand: 'Celotex', basePrice: 34.99 },
      { name: 'Loft Insulation Roll 170m²', brand: 'Isover', basePrice: 44.99 },
    ],
    'plumbing': [
      { name: 'Copper Pipe 15mm x 3m', brand: 'Yorkshire', basePrice: 8.99 },
      { name: 'Push-Fit Elbow 15mm x 15mm', brand: 'Speedfit', basePrice: 2.49 },
      { name: 'PTFE Tape 12mm x 10m', brand: 'Plumber', basePrice: 1.29 },
      { name: 'Flexi Hose 300mm 15mm', brand: 'Wras', basePrice: 6.99 },
    ],
    'electrical': [
      { name: 'Twin & Earth Cable 1.5mm² 100m', brand: 'TLC', basePrice: 49.99 },
      { name: 'Socket Double 13A White', brand: 'MK', basePrice: 3.99 },
      { name: 'Light Switch 1 Gang 2 Way', brand: 'Vent-Axia', basePrice: 2.99 },
      { name: 'Junction Box 3 Terminal', brand: 'Wago', basePrice: 1.99 },
    ],
    'building-materials': [
      { name: 'Cement Bag 25kg', brand: 'Blue Circle', basePrice: 7.99 },
      { name: 'Building Sand Bulk Bag', brand: 'Hanson', basePrice: 59.99 },
      { name: 'Plasterboard 12.5mm 2400x1200mm', brand: 'British Gypsum', basePrice: 8.99 },
      { name: 'Timber Studwork 47x100mm 2.4m', brand: 'Wickes', basePrice: 6.99 },
    ],
    'decorating': [
      { name: 'Emulsion Paint White 10L', brand: 'Dulux', basePrice: 39.99 },
      { name: 'Paint Brush Set 5 Piece', brand: 'Harris', basePrice: 12.99 },
      { name: 'Roller Kit Premium', brand: 'Purdy', basePrice: 16.99 },
      { name: 'Wallpaper Striper Steam', brand: 'Earlex', basePrice: 49.99 },
    ],
    'gardening': [
      { name: 'Lawnmower Electric 1600W', brand: 'Flymo', basePrice: 119.99 },
      { name: 'Hedge Trimmer 550W', brand: 'Bosch', basePrice: 69.99 },
      { name: 'Garden Hose 30m Expandable', brand: 'Hozelock', basePrice: 29.99 },
      { name: 'Spade Stainless Steel', brand: 'Spear & Jackson', basePrice: 24.99 },
    ],
  };

  /**
   * Generate mock products for a category
   */
  async scrapeCategory(category: string, maxProducts: number = 20): Promise<ScrapingResult> {
    console.log(`[MockScraper] Generating ${maxProducts} mock products for category: ${category}`);

    const result: ScrapingResult = {
      success: true,
      products: [],
      total: 0,
      errors: [],
      category,
      scrapedAt: new Date().toISOString(),
    };

    const templates = this.productTemplates[category as keyof typeof this.productTemplates] ||
                     this.productTemplates['power-tools']; // Default to power tools

    for (let i = 0; i < Math.min(maxProducts, templates.length * 3); i++) {
      const template = templates[i % templates.length];
      const retailer = this.retailers[i % this.retailers.length];
      const priceVariation = (Math.random() - 0.5) * 20; // +/- 10% variation
      const price = Math.max(1, template.basePrice + priceVariation);

      const product: ScrapedProduct = {
        product_name: `${template.brand} ${template.name}`,
        retailer,
        retailer_product_id: `${retailer}-${category}-${i + 1}`,
        price: parseFloat(price.toFixed(2)),
        currency: 'GBP',
        product_url: `https://www.${retailer}.com/product/${i + 1}`,
        image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(template.name)}`,
        brand: template.brand,
        category,
        in_stock: Math.random() > 0.2, // 80% in stock
        stock_text: Math.random() > 0.2 ? 'In Stock' : 'Out of Stock',
      };

      result.products.push(product);
    }

    result.total = result.products.length;
    return result;
  }

  /**
   * Generate a single mock product
   */
  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    const category = this.categories[Math.floor(Math.random() * this.categories.length)];
    const templates = this.productTemplates[category as keyof typeof this.productTemplates];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const retailer = this.retailers[Math.floor(Math.random() * this.retailers.length)];

    return {
      product_name: `${template.brand} ${template.name}`,
      retailer,
      retailer_product_id: `${retailer}-${category}-single`,
      price: template.basePrice,
      currency: 'GBP',
      product_url: url,
      image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(template.name)}`,
      brand: template.brand,
      category,
      in_stock: true,
      stock_text: 'In Stock',
    };
  }

  /**
   * Generate mock search results
   */
  async searchProducts(query: string, maxResults: number = 10): Promise<ScrapingResult> {
    console.log(`[MockScraper] Searching for: ${query}`);

    const result: ScrapingResult = {
      success: true,
      products: [],
      total: 0,
      errors: [],
      category: `search:${query}`,
      scrapedAt: new Date().toISOString(),
    };

    // Find relevant templates based on query
    const allTemplates = Object.values(this.productTemplates).flat();
    const matchingTemplates = allTemplates.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.brand.toLowerCase().includes(query.toLowerCase())
    );

    // If no matches, use random templates
    const templates = matchingTemplates.length > 0 ? matchingTemplates : allTemplates.slice(0, 5);

    for (let i = 0; i < Math.min(maxResults, templates.length); i++) {
      const template = templates[i];
      const retailer = this.retailers[i % this.retailers.length];

      result.products.push({
        product_name: `${template.brand} ${template.name}`,
        retailer,
        retailer_product_id: `${retailer}-search-${i}`,
        price: template.basePrice,
        currency: 'GBP',
        product_url: `https://www.${retailer}.com/search?q=${encodeURIComponent(query)}`,
        image_url: `https://via.placeholder.com/300x300?text=${encodeURIComponent(template.name)}`,
        brand: template.brand,
        category: 'various',
        in_stock: Math.random() > 0.2,
        stock_text: Math.random() > 0.2 ? 'In Stock' : 'Out of Stock',
      });
    }

    result.total = result.products.length;
    return result;
  }
}

// Export singleton instance
export const mockScraper = new MockScraper();
