/**
 * Create Bulk Orders Tables
 * Uses Supabase SQL execution to create tables
 */

import { supabase } from '../utils/database';

async function createTables() {
  console.log('Creating Bulk Orders Tables...');

  try {
    // First, let's check if we can execute raw SQL via the Supabase client
    // We'll use the rpc() function to execute SQL

    const tables = [
      {
        name: 'bulk_orders',
        sql: `
          CREATE TABLE IF NOT EXISTS public.bulk_orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            order_number TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
            total_items INTEGER DEFAULT 0,
            total_retailers INTEGER DEFAULT 0,
            estimated_total DECIMAL(12,2) DEFAULT 0.00,
            delivery_location TEXT,
            delivery_postcode TEXT,
            customer_notes TEXT,
            internal_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'bulk_order_items',
        sql: `
          CREATE TABLE IF NOT EXISTS public.bulk_order_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            bulk_order_id UUID NOT NULL REFERENCES public.bulk_orders(id) ON DELETE CASCADE,
            scraped_price_id UUID NOT NULL REFERENCES public.scraped_prices(id) ON DELETE RESTRICT,
            product_name TEXT NOT NULL,
            retailer TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            in_stock BOOLEAN DEFAULT TRUE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'bulk_order_retailers',
        sql: `
          CREATE TABLE IF NOT EXISTS public.bulk_order_retailers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            bulk_order_id UUID NOT NULL REFERENCES public.bulk_orders(id) ON DELETE CASCADE,
            retailer TEXT NOT NULL,
            item_count INTEGER NOT NULL DEFAULT 0,
            retailer_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
            retailer_status TEXT NOT NULL DEFAULT 'pending' CHECK (retailer_status IN ('pending', 'acknowledged', 'preparing', 'ready')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    console.log('Attempting to create tables using PostgreSQL connection...');

    // Use direct PostgreSQL connection
    const { Pool } = await import('pg');

    // Get the connection string from environment
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString || connectionString.includes('[PASSWORD]')) {
      throw new Error('DATABASE_URL not configured properly');
    }

    const pool = new Pool({
      connectionString,
    });

    try {
      for (const table of tables) {
        console.log(`Creating table: ${table.name}`);

        try {
          await pool.query(table.sql);
          console.log(`✓ Created ${table.name}`);
        } catch (error: any) {
          console.error(`✗ Error creating ${table.name}:`, error.message);
        }
      }

      // Create indexes
      console.log('\nCreating indexes...');

      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_bulk_orders_user_id ON public.bulk_orders(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_orders_status ON public.bulk_orders(status);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_orders_order_number ON public.bulk_orders(order_number);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_orders_created_at ON public.bulk_orders(created_at DESC);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_order_items_bulk_order_id ON public.bulk_order_items(bulk_order_id);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_order_items_scraped_price_id ON public.bulk_order_items(scraped_price_id);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_order_items_retailer ON public.bulk_order_items(retailer);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_order_retailers_bulk_order_id ON public.bulk_order_retailers(bulk_order_id);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_order_retailers_retailer ON public.bulk_order_retailers(retailer);',
        'CREATE INDEX IF NOT EXISTS idx_bulk_order_retailers_status ON public.bulk_order_retailers(retailer_status);',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_bulk_order_retailers_unique ON public.bulk_order_retailers(bulk_order_id, retailer);',
      ];

      for (const indexSql of indexes) {
        try {
          await pool.query(indexSql);
          console.log(`✓ Created index`);
        } catch (error: any) {
          console.error(`✗ Error creating index:`, error.message);
        }
      }

      // Create trigger function
      console.log('\nCreating triggers...');

      const triggerFunction = `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      try {
        await pool.query(triggerFunction);
        console.log('✓ Created trigger function');
      } catch (error: any) {
        console.error('✗ Error creating trigger function:', error.message);
      }

      // Create triggers
      const triggers = [
        'DROP TRIGGER IF EXISTS update_bulk_orders_updated_at ON public.bulk_orders;',
        'CREATE TRIGGER update_bulk_orders_updated_at BEFORE UPDATE ON public.bulk_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
        'DROP TRIGGER IF EXISTS update_bulk_order_retailers_updated_at ON public.bulk_order_retailers;',
        'CREATE TRIGGER update_bulk_order_retailers_updated_at BEFORE UPDATE ON public.bulk_order_retailers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      ];

      for (const triggerSql of triggers) {
        try {
          await pool.query(triggerSql);
          console.log('✓ Created trigger');
        } catch (error: any) {
          console.error('✗ Error creating trigger:', error.message);
        }
      }

      // Enable RLS
      console.log('\nEnabling Row Level Security...');

      const rls = [
        'ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.bulk_order_items ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.bulk_order_retailers ENABLE ROW LEVEL SECURITY;',
      ];

      for (const rlsSql of rls) {
        try {
          await pool.query(rlsSql);
          console.log('✓ Enabled RLS');
        } catch (error: any) {
          console.error('✗ Error enabling RLS:', error.message);
        }
      }

      // Create policies
      console.log('\nCreating RLS policies...');

      const policies = [
        'DROP POLICY IF EXISTS "Users can view own bulk orders" ON public.bulk_orders;',
        'CREATE POLICY "Users can view own bulk orders" ON public.bulk_orders FOR SELECT USING (user_id = auth.uid());',
        'DROP POLICY IF EXISTS "Users can insert own bulk orders" ON public.bulk_orders;',
        'CREATE POLICY "Users can insert own bulk orders" ON public.bulk_orders FOR INSERT WITH CHECK (user_id = auth.uid());',
        'DROP POLICY IF EXISTS "Users can update own bulk orders" ON public.bulk_orders;',
        'CREATE POLICY "Users can update own bulk orders" ON public.bulk_orders FOR UPDATE USING (user_id = auth.uid());',
        'DROP POLICY IF EXISTS "Service role full access on bulk_orders" ON public.bulk_orders;',
        'CREATE POLICY "Service role full access on bulk_orders" ON public.bulk_orders FOR ALL USING (auth.role() = \'service_role\');',
      ];

      for (const policySql of policies) {
        try {
          await pool.query(policySql);
          console.log('✓ Created policy');
        } catch (error: any) {
          console.error('✗ Error creating policy:', error.message);
        }
      }

      console.log('\n✅ Tables created successfully!');

      // Verify
      const { data, error } = await supabase
        .from('bulk_orders')
        .select('*')
        .limit(1);

      if (!error) {
        console.log('✓ Verification: bulk_orders table is accessible');
      } else {
        console.error('✗ Verification failed:', error.message);
      }

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
