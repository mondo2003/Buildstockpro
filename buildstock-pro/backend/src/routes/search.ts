import { Elysia, t } from 'elysia';
import { rawQuery, supabase } from '../utils/database.js';

export const searchRoutes = new Elysia({ prefix: '/api/v1/search' })
  .get('/', async ({ query }) => {
    try {
      const {
        search = '',
        category,
        minPrice,
        maxPrice,
        ecoRating,
        inStock,
        sortBy = 'relevance',
        page = '1',
        limit = '20',
      } = query as any;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let dbQuery = `
        SELECT DISTINCT 
          p.*,
          json_agg(
            json_build_object(
              'id', l.id,
              'merchant_id', l.merchant_id,
              'merchant_name', m.name,
              'price', l.price,
              'stock_level', l.stock_level,
              'stock_quantity', l.stock_quantity,
              'distance', l.distance
            )
          ) as listings
        FROM products p
        LEFT JOIN listings l ON l.product_id = p.id
        LEFT JOIN merchants m ON m.id = l.merchant_id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        dbQuery += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.category ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (category) {
        dbQuery += ` AND p.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (minPrice) {
        dbQuery += ` AND l.price >= $${paramIndex}`;
        params.push(parseFloat(minPrice));
        paramIndex++;
      }

      if (maxPrice) {
        dbQuery += ` AND l.price <= $${paramIndex}`;
        params.push(parseFloat(maxPrice));
        paramIndex++;
      }

      if (ecoRating) {
        dbQuery += ` AND p.eco_rating = $${paramIndex}`;
        params.push(ecoRating);
        paramIndex++;
      }

      if (inStock === 'true') {
        dbQuery += ` AND l.stock_quantity > 0`;
      }

      dbQuery += ` GROUP BY p.id`;

      // Sorting
      switch (sortBy) {
        case 'price_asc':
          dbQuery += ` ORDER BY MIN(l.price) ASC NULLS LAST`;
          break;
        case 'price_desc':
          dbQuery += ` ORDER BY MIN(l.price) DESC NULLS LAST`;
          break;
        case 'rating':
          dbQuery += ` ORDER BY p.average_rating DESC NULLS LAST`;
          break;
        case 'carbon':
          dbQuery += ` ORDER BY p.carbon_footprint ASC NULLS LAST`;
          break;
        case 'distance':
          dbQuery += ` ORDER BY MIN(l.distance) ASC NULLS LAST`;
          break;
        default:
          dbQuery += ` ORDER BY p.name ASC`;
      }

      dbQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), offset);

      const products = await rawQuery(dbQuery, params);

      // Get total count
      let countQuery = `SELECT COUNT(DISTINCT p.id) as count FROM products p LEFT JOIN listings l ON l.product_id = p.id WHERE 1=1`;
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (search) {
        countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex} OR p.category ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      if (category) {
        countQuery += ` AND p.category = $${countParamIndex}`;
        countParams.push(category);
        countParamIndex++;
      }

      const countResult = await rawQuery(countQuery, countParams);
      const total = parseInt(countResult[0]?.count || '0');

      return {
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        timestamp: new Date().toISOString(),
      };
    }
  });
