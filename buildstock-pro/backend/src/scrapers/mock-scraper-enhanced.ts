/**
 * Enhanced Mock scraper with real images, unit prices, and specifications
 * Generates realistic hardware store product data with detailed specifications
 */

import type { ScrapedProduct, ScrapingResult } from './base';

interface ProductTemplate {
  name: string;
  brand: string;
  basePrice: number;
  sku: string;
  unit_type: 'each' | 'meter' | 'kg' | 'sqm' | 'litre' | 'pack' | 'pair' | 'set' | 'tonne' | 'roll';
  description: string;
  specs: Record<string, any>;
}

export class EnhancedMockScraper {
  private retailers = ['screwfix', 'wickes', 'bandq', 'jewson', 'travisperkins', 'toolstation'];
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

  private productTemplates: Record<string, ProductTemplate[]> = {
    'power-tools': [
      {
        name: 'Cordless Drill Driver 18V',
        brand: 'DeWalt',
        basePrice: 89.99,
        sku: 'DCD777C2GB',
        unit_type: 'each',
        description: 'Compact cordless drill with 2x 2Ah batteries, ideal for drilling into wood, metal, and plastic.',
        specs: {
          voltage: '18V',
          battery_type: 'Lithium-ion',
          batteries_included: 2,
          battery_capacity: '2Ah',
          max_torque: '60Nm',
          speed_settings: 2,
          weight: '1.8kg',
          chuck_size: '13mm'
        }
      },
      {
        name: 'Angle Grinder 115mm 720W',
        brand: 'Makita',
        basePrice: 69.99,
        sku: 'M9524B',
        unit_type: 'each',
        description: 'Compact and powerful angle grinder for cutting and grinding metal and stone.',
        specs: {
          power: '720W',
          disc_diameter: '115mm',
          spindle_thread: 'M14',
          no_load_speed: '11000rpm',
          weight: '3.5kg',
          spindle_lock: 'Yes'
        }
      },
      {
        name: 'Circular Saw 190mm 1200W',
        brand: 'Bosch',
        basePrice: 119.99,
        sku: 'PKS 55',
        unit_type: 'each',
        description: 'Powerful circular saw with cutting depth up to 65mm, perfect for timber and sheet materials.',
        specs: {
          power: '1200W',
          blade_diameter: '190mm',
          bore_size: '30mm',
          cutting_depth_max: '65mm',
          cutting_depth_45deg: '45mm',
          weight: '4.8kg',
          speed: '4800rpm'
        }
      },
    ],
    'hand-tools': [
      {
        name: 'Claw Hammer 20oz Fibreglass',
        brand: 'Stanley',
        basePrice: 14.99,
        sku: 'FMHT82821',
        unit_type: 'each',
        description: 'Professional claw hammer with fibreglass handle for reduced vibration and fatigue.',
        specs: {
          weight: '20oz',
          handle_material: 'Fibreglass',
          head_material: 'Forged steel',
          claw_type: 'Curved',
          overall_length: '330mm',
          grip: 'Rubber'
        }
      },
      {
        name: 'Tape Measure 8m Auto-Lock',
        brand: 'DeWalt',
        basePrice: 9.99,
        sku: 'DWHT36931',
        unit_type: 'each',
        description: '8m tape measure with auto-lock blade and magnetic hook for one-person measuring.',
        specs: {
          length: '8m',
          blade_width: '25mm',
          lock_type: 'Auto-lock',
          blade_coating: 'BladeArmor',
          magnetic_hook: 'Yes',
          accuracy: 'Class II'
        }
      },
      {
        name: 'Spirit Level 1200mm Magnetic',
        brand: 'Stabila',
        basePrice: 29.99,
        sku: '196S-2',
        unit_type: 'each',
        description: 'Professional 1200mm spirit level with 2 rare earth magnets for hands-free use.',
        specs: {
          length: '1200mm',
          vials: 2,
          vial_type: 'Vertical + Horizontal',
          magnetic: 'Yes',
          accuracy: '0.5mm/m',
          material: 'Aluminium profile',
          end_caps: 'Removable'
        }
      },
    ],
    'insulation': [
      {
        name: 'Insulation Roll 10.82m² 100mm',
        brand: 'Knauf',
        basePrice: 24.99,
        sku: 'Earthwool',
        unit_type: 'sqm',
        description: 'Glass mineral wool insulation roll for loft insulation, low dust and easy to cut.',
        specs: {
          area: '10.82m²',
          thickness: '100mm',
          thermal_conductivity: '0.032W/mK',
          width: '370mm',
          roll_length: '11.7m',
          material: 'Glass mineral wool',
          colour: 'Yellow'
        }
      },
      {
        name: 'PIR Board 2400mm x 1200mm 50mm',
        brand: 'Celotex',
        basePrice: 34.99,
        sku: 'GA5000',
        unit_type: 'each',
        description: 'High-performance PIR insulation board with foil facings for walls and roofs.',
        specs: {
          length: '2400mm',
          width: '1200mm',
          thickness: '50mm',
          thermal_conductivity: '0.022W/mK',
          compressive_strength: '140kPa',
          facings: 'Low emissivity foil',
          coverage: '2.88m²'
        }
      },
    ],
    'plumbing': [
      {
        name: 'Copper Pipe 15mm x 3m',
        brand: 'Yorkshire',
        basePrice: 8.99,
        sku: 'COP15',
        unit_type: 'meter',
        description: 'Half-hard copper tube for hot and cold water services, EN 1057 compliant.',
        specs: {
          diameter: '15mm',
          length: '3m',
          material: 'Copper',
          wall_thickness: '0.7mm',
          standard: 'BS EN 1057',
          temper: 'Half hard',
          usage: 'Domestic water services'
        }
      },
      {
        name: 'Push-Fit Elbow 15mm x 15mm',
        brand: 'Speedfit',
        basePrice: 2.49,
        sku: 'JG15',
        unit_type: 'each',
        description: 'Push-fit elbow fitting for quick and easy pipe connections without tools.',
        specs: {
          size: '15mm x 15mm',
          type: 'Elbow',
          material: 'Plastic with stainless steel grab ring',
          max_pressure: '10 bar',
          temperature_range: '-20°C to +95°C',
          approvals: 'WRAS, KIWA',
          removable: 'Yes'
        }
      },
    ],
    'building-materials': [
      {
        name: 'Cement Bag 25kg',
        brand: 'Blue Circle',
        basePrice: 7.99,
        sku: 'CEM25',
        unit_type: 'each',
        description: 'Portland cement for concrete, mortar and render applications, conforms to BS EN 197-1.',
        specs: {
          weight: '25kg',
          type: 'CEM I Portland cement',
          strength_class: '42.5N',
          color: 'Grey',
          packaging: 'Paper bag',
          setting_time: 'Initial 90 mins',
          applications: 'Concrete, mortar, render, screed'
        }
      },
      {
        name: 'Plasterboard 12.5mm 2400x1200mm',
        brand: 'British Gypsum',
        basePrice: 8.99,
        sku: 'GTEC12',
        unit_type: 'each',
        description: 'Standard tapered edge plasterboard for walls and ceilings.',
        specs: {
          thickness: '12.5mm',
          length: '2400mm',
          width: '1200mm',
          edge: 'Tapered edge',
          type: 'Standard core',
          face: 'Ivory paper',
          back: 'Brown paper',
          coverage: '2.88m²',
          fire_rating: 'Class A1'
        }
      },
    ],
  };

  /**
   * Get real product image URL from retailers
   */
  private getRealImageUrl(retailer: string, productName: string, productId: string, category: string = 'various'): string {
    // Try to get real images from retailer CDNs
    const realImages: Record<string, string[]> = {
      screwfix: [
        'https://media.screwfix.com/i/screwfix/140006_P01_P.jpg',
        'https://media.screwfix.com/i/screwfix/23924_P01_P.jpg',
        'https://media.screwfix.com/i/screwfix/36065_P01_P.jpg',
        'https://media.screwfix.com/i/screwfix/56372_P01_P.jpg',
        'https://media.screwfix.com/i/screwfix/93826_P01_P.jpg',
        'https://media.screwfix.com/i/screwfix/75898_P01_P.jpg',
      ],
      toolstation: [
        'https://media.toolstation.com/images/145020_medium.jpg',
        'https://media.toolstation.com/images/24351_medium.jpg',
        'https://media.toolstation.com/images/57531_medium.jpg',
        'https://media.toolstation.com/images/68721_medium.jpg',
      ],
    };

    const images = realImages[retailer.toLowerCase()];
    if (images && images.length > 0) {
      // Use a simple hash of the product ID to consistently select the same image
      const hash = productId.split('').reduce((a, b) => {
        const charCode = b.charCodeAt(0);
        return a + charCode;
      }, 0);
      const index = hash % images.length;
      return images[Math.abs(index)];
    }

    // Fallback to Unsplash for realistic images
    const hash = productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return `https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&auto=format&sig=${Math.abs(hash)}`;
  }

  /**
   * Generate enhanced mock products for a category
   */
  async scrapeCategory(category: string, maxProducts: number = 20): Promise<ScrapingResult> {
    console.log(`[EnhancedMockScraper] Generating ${maxProducts} enhanced products for: ${category}`);

    const result: ScrapingResult = {
      success: true,
      products: [],
      total: 0,
      errors: [],
      category,
      scrapedAt: new Date().toISOString(),
    };

    const templates = this.productTemplates[category as keyof typeof this.productTemplates] ||
                     this.productTemplates['power-tools'];

    for (let i = 0; i < Math.min(maxProducts, templates.length * 3); i++) {
      const template = templates[i % templates.length];
      const retailer = this.retailers[i % this.retailers.length];
      const priceVariation = (Math.random() - 0.5) * 20;
      const price = Math.max(1, template.basePrice + priceVariation);
      const isSale = Math.random() > 0.7;
      const wasPrice = isSale ? price * 1.2 : undefined;
      const productId = `${retailer}-${template.sku}-${i + 1}`;

      const product: ScrapedProduct = {
        product_name: `${template.brand} ${template.name}`,
        retailer,
        retailer_product_id: productId,
        price: parseFloat(price.toFixed(2)),
        currency: 'GBP',
        product_url: `https://www.${retailer}.com/p/${template.sku}`,
        image_url: this.getRealImageUrl(retailer, template.name, productId, category),
        brand: template.brand,
        category,
        in_stock: Math.random() > 0.2,
        stock_text: Math.random() > 0.2 ? 'In Stock' : 'Out of Stock',
        unit_price: template.unit_type !== 'each' ? parseFloat((price / 2).toFixed(2)) : undefined,
        unit_type: template.unit_type,
        specifications: template.specs,
        is_sale: isSale,
        was_price: wasPrice,
        product_description: template.description,
        manufacturer_sku: template.sku,
        barcode: `${Math.floor(Math.random() * 1000000000000)}`,
      };

      result.products.push(product);
    }

    result.total = result.products.length;
    return result;
  }

  /**
   * Generate a single enhanced mock product
   */
  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    const category = this.categories[Math.floor(Math.random() * this.categories.length)];
    const templates = this.productTemplates[category as keyof typeof this.productTemplates];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const retailer = this.retailers[Math.floor(Math.random() * this.retailers.length)];
    const productId = `${retailer}-${template.sku}-single`;

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
      unit_price: template.unit_type !== 'each' ? template.basePrice / 2 : undefined,
      unit_type: template.unit_type,
      specifications: template.specs,
      is_sale: false,
      product_description: template.description,
      manufacturer_sku: template.sku,
      barcode: `${Math.floor(Math.random() * 1000000000000)}`,
    };
  }

  /**
   * Generate enhanced search results
   */
  async searchProducts(query: string, maxResults: number = 10): Promise<ScrapingResult> {
    console.log(`[EnhancedMockScraper] Searching for: ${query}`);

    const result: ScrapingResult = {
      success: true,
      products: [],
      total: 0,
      errors: [],
      category: `search:${query}`,
      scrapedAt: new Date().toISOString(),
    };

    const allTemplates = Object.values(this.productTemplates).flat();
    const matchingTemplates = allTemplates.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.brand.toLowerCase().includes(query.toLowerCase())
    );

    const templates = matchingTemplates.length > 0 ? matchingTemplates : allTemplates.slice(0, 5);

    for (let i = 0; i < Math.min(maxResults, templates.length); i++) {
      const template = templates[i];
      const retailer = this.retailers[i % this.retailers.length];
      const productId = `${retailer}-${template.sku}-search-${i}`;

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
        unit_price: template.unit_type !== 'each' ? template.basePrice / 2 : undefined,
        unit_type: template.unit_type,
        specifications: template.specs,
        is_sale: false,
        product_description: template.description,
        manufacturer_sku: template.sku,
        barcode: `${Math.floor(Math.random() * 1000000000000)}`,
      });
    }

    result.total = result.products.length;
    return result;
  }
}

// Export singleton instance
export const enhancedMockScraper = new EnhancedMockScraper();
