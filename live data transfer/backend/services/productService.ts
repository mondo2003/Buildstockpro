import { query, queryOne } from '../utils/database';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  manufacturer: string | null;
  unit: string | null;
  imageUrl: string | null;
  images: any;
  specifications: any;
  totalListings: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStockCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListing {
  id: string;
  productId: string;
  merchantId: string;
  branchId: string | null;
  merchantSku: string | null;
  merchantProductUrl: string | null;
  price: number;
  tradePrice: number | null;
  vatIncluded: boolean;
  currency: string;
  stockLevel: number;
  stockStatus: string;
  stockLastUpdated: Date | null;
  isAvailable: boolean;
  clickAndCollect: boolean;
  deliveryAvailable: boolean;
  deliveryLeadTimeDays: number | null;
  deliveryCost: number | null;
  lastSyncedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  syncEnabled: boolean;
  syncStatus: string;
  lastSyncAt: Date | null;
  syncFrequencyMinutes: number;
  totalProducts: number;
  activeListings: number;
  createdAt: Date;
  updatedAt: Date;
}

// Search term aliases for common user queries
const SEARCH_ALIASES: Record<string, string[]> = {
  'wood': ['timber', 'lumber', 'plywood', 'wooden'],
  'timber': ['wood', 'lumber'],
  'lumber': ['wood', 'timber'],
  'screw': ['screws'],
  'nail': ['nails'],
  'paint': ['paints', 'coating'],
  'insulation': ['insulator'],
};

// Expand search term with aliases
function expandSearchTerm(search: string): string[] {
  const normalized = search.toLowerCase().trim();
  const terms = [search];

  // Add all aliases for this search term
  for (const [key, aliases] of Object.entries(SEARCH_ALIASES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      terms.push(...aliases);
    }
  }

  return Array.from(new Set(terms)); // Remove duplicates
}

export async function getProducts(
  page: number = 1,
  limit: number = 20,
  search?: string,
  category?: string,
  brand?: string,
  sortBy?: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ products: Product[]; total: number }> {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    const searchTerms = expandSearchTerm(search);

    // Build ILIKE conditions for each search term across name, description, category
    const searchConditions: string[] = [];
    searchTerms.forEach(term => {
      const paramIdx = params.length + 1;
      searchConditions.push(`name ILIKE $${paramIdx}`, `description ILIKE $${paramIdx}`, `category ILIKE $${paramIdx}`);
      params.push(`%${term}%`);
      params.push(`%${term}%`);
      params.push(`%${term}%`);
    });

    conditions.push(`(${searchConditions.join(' OR ')})`);
  }

  if (category) {
    const paramIdx = params.length + 1;
    conditions.push(`category = $${paramIdx}`);
    params.push(category);
  }

  if (brand) {
    const paramIdx = params.length + 1;
    conditions.push(`brand = $${paramIdx}`);
    params.push(brand);
  }

  const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await queryOne(
    `SELECT COUNT(*) as count FROM products${whereClause}`,
    params
  );
  const total = Number(countResult?.count || 0);

  let orderClause = 'ORDER BY created_at DESC';
  if (sortBy === 'name') orderClause = 'ORDER BY name ASC';
  if (sortBy === 'price_asc') orderClause = 'ORDER BY min_price ASC NULLS LAST';
  if (sortBy === 'price_desc') orderClause = 'ORDER BY min_price DESC NULLS LAST';
  if (sortBy === 'distance' && userLocation) {
    // Distance-based sorting using PostGIS
    orderClause = `
      ORDER BY (
        SELECT MIN(ST_Distance(
          mb.location,
          ST_MakePoint($${params.length + 3}, $${params.length + 4})::geography
        )) / 1000
        FROM product_listings pl
        JOIN merchant_branches mb ON pl.branch_id = mb.id
        WHERE pl.product_id = products.id AND pl.is_active = true AND mb.location IS NOT NULL
      ) ASC NULLS LAST
    `;
    params.push(userLocation.lng, userLocation.lat);
  }

  const products = await query<Product>(
    `SELECT * FROM products${whereClause} ${orderClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { products, total };
}

export async function getProductById(id: string): Promise<Product | null> {
  return await queryOne<Product>('SELECT * FROM products WHERE id = $1', [id]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return await queryOne<Product>('SELECT * FROM products WHERE slug = $1', [slug]);
}

export async function getProductListings(
  productId: string,
  userLocation?: { lat: number; lng: number }
): Promise<ProductListing[]> {
  if (userLocation) {
    // Return listings with distance calculation
    return await query<ProductListing>(
      `SELECT
        pl.*,
        mb.branch_name,
        mb.city,
        mb.postcode,
        ST_Distance(
          mb.location,
          ST_MakePoint($2, $3)::geography
        ) / 1000 as distance_km,
        mb.click_and_collect
       FROM product_listings pl
       JOIN merchant_branches mb ON pl.branch_id = mb.id
       WHERE pl.product_id = $1 AND pl.is_active = true
       ORDER BY distance_km ASC, pl.price ASC`,
      [productId, userLocation.lng, userLocation.lat]
    );
  }

  return await query<ProductListing>(
    `SELECT * FROM product_listings
     WHERE product_id = $1 AND is_active = true
     ORDER BY stock_status DESC, price ASC`,
    [productId]
  );
}

export async function getProductWithListings(productId: string) {
  const product = await getProductById(productId);

  if (!product) {
    return null;
  }

  const listings = await getProductListings(productId);

  return {
    ...product,
    listings,
  };
}

export async function getMerchants(
  page: number = 1,
  limit: number = 20,
  syncStatus?: string
): Promise<{ merchants: Merchant[]; total: number }> {
  const offset = (page - 1) * limit;
  let whereClause = '';
  const params: any[] = [];

  if (syncStatus) {
    whereClause = ' WHERE sync_status = $1';
    params.push(syncStatus);
  }

  const countResult = await queryOne(
    `SELECT COUNT(*) as count FROM merchants${whereClause}`,
    params
  );
  const total = Number(countResult?.count || 0);

  const merchants = await query<Merchant>(
    `SELECT * FROM merchants${whereClause} ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  return { merchants, total };
}

export async function getMerchantById(id: string): Promise<Merchant | null> {
  return await queryOne<Merchant>('SELECT * FROM merchants WHERE id = $1', [id]);
}

export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
  return await queryOne<Merchant>('SELECT * FROM merchants WHERE slug = $1', [slug]);
}

export async function triggerMerchantSync(merchantId: string): Promise<any> {
  // This would create a sync job and trigger the sync process
  const syncJob = await queryOne(
    `INSERT INTO sync_jobs (merchant_id, job_type, status, started_at)
     VALUES ($1, 'manual', 'running', NOW())
     RETURNING *`,
    [merchantId]
  );

  return syncJob;
}

export async function getCategories(): Promise<string[]> {
  const result = await query<{ category: string }>(
    `SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category`
  );

  return result.map(r => r.category);
}

export async function getBrands(): Promise<string[]> {
  const result = await query<{ brand: string }>(
    `SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand`
  );

  return result.map(r => r.brand);
}
