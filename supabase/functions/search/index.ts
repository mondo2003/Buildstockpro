// BuildStock Pro - Search Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('Search function called');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const category = url.searchParams.get('category');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    console.log('Search params:', { query, category, limit });

    // Build search query - start with basic select
    let dbQuery = supabase
      .from('products')
      .select('*')
      .limit(limit);

    // Search by name, description, or category
    if (query && query.trim()) {
      const searchTerm = query.trim();
      console.log('Searching for:', searchTerm);
      dbQuery = dbQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    if (category) {
      console.log('Filtering by category:', category);
      dbQuery = dbQuery.eq('category', category);
    }

    // Execute query
    const { data: products, error } = await dbQuery;

    if (error) {
      console.error('Search query error:', error);
      throw error;
    }

    console.log('Found products:', products?.length || 0);

    // Return results
    return new Response(JSON.stringify({
      results: products || [],
      count: products?.length || 0,
      query: { query, category, limit }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Search function error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      details: error
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});
