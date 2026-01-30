import { createClient } from '@supabase/supabase-js';

// Note: Bun automatically loads .env files

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Database config:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseKey ? 'configured' : 'missing',
  keyLength: supabaseKey?.length,
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Service Role Key must be configured in .env file');
  throw new Error('Supabase URL and Service Role Key must be configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Main query function with TypeScript overloads for type safety
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]>;
export async function query<T = any>(table: string, options?: {
  select?: string;
  filter?: { column: string; operator: string; value: any };
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}): Promise<T[]>;
export async function query<T = any>(
  tableOrSql: string,
  optionsOrParams?: any
): Promise<T[]> {
  const start = Date.now();

  // Detect if this is a raw SQL query (contains SELECT and parameter placeholders)
  const isRawSql = tableOrSql.toUpperCase().includes('SELECT') && tableOrSql.includes('$') && Array.isArray(optionsOrParams);

  if (isRawSql) {
    // This is a raw SQL query - use PostgreSQL connection directly
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[PASSWORD]')) {
      throw new Error('DATABASE_URL not configured or contains placeholder');
    }

    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      try {
        const result = await pool.query(tableOrSql, optionsOrParams);
        const duration = Date.now() - start;
        console.log(`Raw SQL query completed in ${duration}ms, ${result.rows.length} rows`);
        return result.rows as T[];
      } finally {
        await pool.end();
      }
    } catch (error) {
      console.error('Raw SQL query error:', error);
      throw error;
    }
  }

  // Otherwise use Supabase client for table queries
  const options = optionsOrParams as {
    select?: string;
    filter?: { column: string; operator: string; value: any };
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  } | undefined;

  try {
    let supabaseQuery = supabase.from(tableOrSql).select(options?.select || '*');

    if (options?.filter) {
      supabaseQuery = supabaseQuery.filter(options.filter.column, options.filter.operator, options.filter.value);
    }

    if (options?.orderBy) {
      supabaseQuery = supabaseQuery.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    if (options?.limit) {
      supabaseQuery = supabaseQuery.limit(options.limit);
    }

    if (options?.offset) {
      supabaseQuery = supabaseQuery.range(options.offset, (options.offset + (options?.limit || 10) - 1));
    }

    const { data, error } = await supabaseQuery;

    const duration = Date.now() - start;

    if (error) {
      console.error(`Query error on ${tableOrSql}:`, error);
      throw error;
    }

    console.log(`Query on ${tableOrSql} completed in ${duration}ms, ${data?.length || 0} rows`);
    return (data as T[]) || [];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// For counting records
export async function count(table: string, filter?: { column: string; operator: string; value: any }): Promise<number> {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    if (filter) {
      query = query.filter(filter.column, filter.operator, filter.value);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Count error:', error);
    throw error;
  }
}

export async function queryOne<T = any>(tableOrSql: string, params?: any[] | string): Promise<T | null> {
  const start = Date.now();

  // Check if this is a raw SQL query (contains SELECT and multiple parameters)
  if (tableOrSql.includes('SELECT') && tableOrSql.includes('$') && Array.isArray(params)) {
    // This is a raw SQL query - use rawQuery
    try {
      const result = await rawQuery<T>(tableOrSql, params);
      return result[0] || null;
    } catch (error) {
      console.error('Raw SQL query error:', error);
      throw error;
    }
  }

  // Otherwise treat as table name with ID lookup
  try {
    const id = params as string;
    const { data, error } = await supabase.from(tableOrSql).select('*').eq('id', id).single();

    const duration = Date.now() - start;

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Query error on ${tableOrSql}:`, error);
      throw error;
    }

    console.log(`Query on ${tableOrSql} completed in ${duration}ms, 1 row`);
    return data as T;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function testConnection(): Promise<{ success: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      throw error;
    }

    return { success: true, latency: Date.now() - start };
  } catch (error) {
    return { success: false, latency: Date.now() - start, error: (error as Error).message };
  }
}

// Raw SQL query function for complex queries (requires DATABASE_URL)
export async function rawQuery<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[PASSWORD]')) {
    throw new Error('DATABASE_URL not configured or contains placeholder');
  }

  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(text, params);
    return result.rows as T[];
  } finally {
    await pool.end();
  }
}
