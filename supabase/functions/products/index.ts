// BuildStock Pro - Products Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Den.env.get('SUPABASE_URL')!;
const supabaseKey = Den.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    const path = url.pathname;

    console.log('Request path:', path);
    console.log('Request method:', req.method);

    // List all products - handle both root and ID paths
    // When called as /functions/v1/products, path will be /functions/v1/products
    // When called as /functions/v1/products/123, path will be /functions/v1/products/123

    const pathMatch = path.match(/\/functions\/v1\/products\/?([^/]*)$/);
    console.log('Path match:', pathMatch);

    if (req.method === 'GET') {
      const productId = pathMatch ? pathMatch[1] : null;

      // If there's a product ID, get single product
      if (productId && productId !== '') {
        console.log('Fetching single product:', productId);

        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            productListings (
              *,
              merchants (*)
            )
          `)
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        return new Response(JSON.stringify({ product: data }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // Otherwise, list all products
      console.log('Fetching all products');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          productListings (
            *,
            merchants (*)
          )
        `)
        .limit(100);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Returning products:', data?.length || 0);
      return new Response(JSON.stringify({ products: data }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    console.log('Method not allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({
      error: error.message,
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
