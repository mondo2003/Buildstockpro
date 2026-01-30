// BuildStock Pro - Search Edge Function
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const category = url.searchParams.get('category');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    console.log('Search called with:', { query, category, limit });

    // Build search query
    let dbQuery = supabase
      .from('products')
      .select('*')
      .limit(limit);

    // Search by name, description, or category
    if (query && query.trim()) {
      const searchTerm = query.trim();
      dbQuery = dbQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    // Execute query
    const { data: products, error } = await dbQuery;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Found products:', products?.length || 0);

    return new Response(JSON.stringify({
      results: products || [],
      count: products?.length || 0,
      query: { query, category, limit }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error',
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
