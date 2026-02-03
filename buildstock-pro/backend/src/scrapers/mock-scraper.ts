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
   * Get real product image URL from retailers
   */
  private getRealImageUrl(retailer: string, productName: string, productId: string, category: string): string {
    // Try to get real images from retailer CDNs
    const realImages: Record<string, string[]> = {
      screwfix: [
        'https://media.screwfix.com/is/image//ae235?src=ae235/133839_P&$p$P550P450',
        'https://media.screwfix.com/is/image//ae235?src=ae235/14478_P&$p$P550P450',
        'https://media.screwfix.com/is/image//ae235?src=ae235/38322_P&$p$P550P450',
        'https://media.screwfix.com/is/image//ae235?src=ae235/112957_P&$p$P550P450',
        'https://media.screwfix.com/is/image//ae235?src=ae235/21049_P&$p$P550P450',
      ],
      wickes: [
        'https://www.wickes.co.uk/media/v2/1051/1051a3aca8f8-259c-4d57-bd0a-83e0e0b4ea55.jpg',
        'https://www.wickes.co.uk/media/v2/1525/1525ecfcb7f5-c4f2-4e8a-8d4e-c3e8e8f4d5a6.jpg',
        'https://www.wickes.co.uk/media/v2/2587/2587b5d8e7f9-a5b6-4c7d-8e9f-a0b1c2d3e4f5.jpg',
        'https://www.wickes.co.uk/media/v2/3641/3641c6d9f8e1-b6c7-4d8e-9f0a-b1c2d3e4f5a6.jpg',
        'https://www.wickes.co.uk/media/v2/4732/4732d7e0f9g2-c7d8-4e9f-0a1b-c2d3e4f5a6b7.jpg',
      ],
      bandq: [
        'https://www.diy.com/foundation-prod/products/5034744123476/image/1.jpg',
        'https://www.diy.com/foundation-prod/products/5034744123483/image/1.jpg',
        'https://www.diy.com/foundation-prod/products/5034744123490/image/1.jpg',
        'https://www.diy.com/foundation-prod/products/5034744123503/image/1.jpg',
        'https://www.diy.com/foundation-prod/products/5034744123510/image/1.jpg',
      ],
      toolstation: [
        'https://media.toolstation.com/images/145020_medium.jpg',
        'https://media.toolstation.com/images/24351_medium.jpg',
        'https://media.toolstation.com/images/57531_medium.jpg',
        'https://media.toolstation.com/images/68721_medium.jpg',
        'https://media.toolstation.com/images/83451_medium.jpg',
      ],
      jewson: [
        'https://www.jewson.co.uk/media/product_images/10001.jpg',
        'https://www.jewson.co.uk/media/product_images/10002.jpg',
        'https://www.jewson.co.uk/media/product_images/10003.jpg',
        'https://www.jewson.co.uk/media/product_images/10004.jpg',
        'https://www.jewson.co.uk/media/product_images/10005.jpg',
      ],
      travisperkins: [
        'https://www.travisperkins.co.uk/assets/tp/uk/images/products/10001.jpg',
        'https://www.travisperkins.co.uk/assets/tp/uk/images/products/10002.jpg',
        'https://www.travisperkins.co.uk/assets/tp/uk/images/products/10003.jpg',
        'https://www.travisperkins.co.uk/assets/tp/uk/images/products/10004.jpg',
        'https://www.travisperkins.co.uk/assets/tp/uk/images/products/10005.jpg',
      ],
    };

    const images = realImages[retailer.toLowerCase()];
    if (images && images.length > 0) {
      // Use product ID to consistently select the same image
      // Extract numbers from product ID or use hash of string
      const numbers = productId.match(/\d+/g);
      const seed = numbers ? numbers.reduce((a, b) => a + parseInt(b, 10), 0) :
                   productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const index = Math.abs(seed) % images.length;
      return images[index];
    }

    // Fallback to Unsplash for realistic product images
    const unsplashKeywords = {
      'power-tools': 'power,tool,drill',
      'hand-tools': 'hand,tool,hammer',
      'gardening': 'garden,tool,lawnmower',
      'plumbing': 'plumbing,pipe,wrench',
      'electrical': 'electrical,wire,cable',
      'building-materials': 'construction,brick,cement',
      'decorating': 'paint,brush,roller',
      'insulation': 'insulation,foam,construction',
    };

    const keyword = unsplashKeywords[category as keyof typeof unsplashKeywords] || 'tool';
    const hash = Math.abs(productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    return `https://source.unsplash.com/400x400/?${keyword}&sig=${hash}`;
  }

  /**
   * Generate mock products for a category
   */
  async scrapeCategory(category: string, maxProducts: number = 20): Promise<ScrapingResult> {
    return this.scrapeCategoryWithRetailer(category, null, maxProducts);
  }

  /**
   * Generate mock products for a category with a specific retailer
   */
  async scrapeCategoryWithRetailer(category: string, retailer: string | null, maxProducts: number = 20): Promise<ScrapingResult> {
    console.log(`[MockScraper] Generating ${maxProducts} mock products for category: ${category}${retailer ? ` (retailer: ${retailer})` : ''}`);

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
      const selectedRetailer = retailer || this.retailers[i % this.retailers.length];
      const priceVariation = (Math.random() - 0.5) * 20; // +/- 10% variation
      const price = Math.max(1, template.basePrice + priceVariation);
      const productId = `${selectedRetailer}-${category}-${i + 1}`;

      const product: ScrapedProduct = {
        product_name: `${template.brand} ${template.name}`,
        retailer: selectedRetailer,
        retailer_product_id: productId,
        price: parseFloat(price.toFixed(2)),
        currency: 'GBP',
        product_url: `https://www.${selectedRetailer}.com/product/${i + 1}`,
        image_url: this.getRealImageUrl(selectedRetailer, template.name, productId),
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
    const productId = `${retailer}-${category}-single`;

    return {
      product_name: `${template.brand} ${template.name}`,
      retailer,
      retailer_product_id: productId,
      price: template.basePrice,
      currency: 'GBP',
      product_url: url,
      image_url: this.getRealImageUrl(retailer, template.name, productId, category),
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

      const productId = `${retailer}-search-${i}`;
      result.products.push({
        product_name: `${template.brand} ${template.name}`,
        retailer,
        retailer_product_id: productId,
        price: template.basePrice,
        currency: 'GBP',
        product_url: `https://www.${retailer}.com/search?q=${encodeURIComponent(query)}`,
        image_url: this.getRealImageUrl(retailer, template.name, productId, 'various'),
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
