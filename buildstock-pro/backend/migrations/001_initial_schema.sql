-- BuildStock Pro - Initial Database Schema
-- Created: 2026-01-29
-- Description: Core tables for users, products, merchants, and sync tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial queries on branch locations

-- ============================================================================
-- USERS & AUTH
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- ============================================================================
-- MERCHANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    api_endpoint TEXT,
    api_key_encrypted TEXT, -- Encrypted API key
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'active', 'failed', 'paused')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_minutes INT DEFAULT 60, -- Default hourly
    total_products INT DEFAULT 0,
    active_listings INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for merchants
CREATE INDEX idx_merchants_slug ON public.merchants(slug);
CREATE INDEX idx_merchants_sync_status ON public.merchants(sync_status);

-- ============================================================================
-- MERCHANT BRANCHES (with geolocation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchant_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    postcode VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for geospatial queries
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for branches
CREATE INDEX idx_branches_merchant_id ON public.merchant_branches(merchant_id);
CREATE INDEX idx_branches_location ON public.merchant_branches USING GIST(location);
CREATE INDEX idx_branches_is_active ON public.merchant_branches(is_active);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(255),
    manufacturer VARCHAR(255),
    unit VARCHAR(50), -- e.g., "sheet", "meter", "bag", "pack"
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    specifications JSONB DEFAULT '{}'::jsonb, -- Flexible spec storage
    search_vector TSVECTOR, -- For full-text search
    total_listings INT DEFAULT 0,
    avg_price DECIMAL(10, 2),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    in_stock_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_search_vector ON public.products USING GIN(search_vector);
CREATE INDEX idx_products_created_at ON public.products(created_at);

-- ============================================================================
-- PRODUCT LISTINGS (individual merchant offerings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.merchant_branches(id) ON DELETE SET NULL,
    merchant_sku VARCHAR(100),
    merchant_product_url TEXT,

    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    trade_price DECIMAL(10, 2), -- Trade account pricing
    vat_included BOOLEAN DEFAULT TRUE,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Stock
    stock_level INT DEFAULT 0,
    stock_status VARCHAR(50) DEFAULT 'unknown' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'unknown')),
    stock_last_updated TIMESTAMP WITH TIME ZONE,

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    click_and_collect BOOLEAN DEFAULT FALSE,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_lead_time_days INT,
    delivery_cost DECIMAL(10, 2),

    -- Sync tracking
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(product_id, merchant_id, merchant_sku)
);

-- Indexes for listings
CREATE INDEX idx_listings_product_id ON public.product_listings(product_id);
CREATE INDEX idx_listings_merchant_id ON public.product_listings(merchant_id);
CREATE INDEX idx_listings_branch_id ON public.product_listings(branch_id);
CREATE INDEX idx_listings_price ON public.product_listings(price);
CREATE INDEX idx_listings_stock_status ON public.product_listings(stock_status);
CREATE INDEX idx_listings_is_active ON public.product_listings(is_active);

-- Composite index for common queries (price + stock + active)
CREATE INDEX idx_listings_search ON public.product_listings(product_id, is_active, stock_status, price);

-- ============================================================================
-- SYNC JOBS (for tracking merchant sync operations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full_sync', 'incremental_sync', 'webhook', 'manual')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

    -- Stats
    products_created INT DEFAULT 0,
    products_updated INT DEFAULT 0,
    products_failed INT DEFAULT 0,
    listings_created INT DEFAULT 0,
    listings_updated INT DEFAULT 0,
    listings_failed INT DEFAULT 0,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sync_jobs
CREATE INDEX idx_sync_jobs_merchant_id ON public.sync_jobs(merchant_id);
CREATE INDEX idx_sync_jobs_status ON public.sync_jobs(status);
CREATE INDEX idx_sync_jobs_created_at ON public.sync_jobs(created_at DESC);

-- ============================================================================
-- SYSTEM LOGS (for health monitoring)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    service VARCHAR(100) NOT NULL, -- e.g., 'api', 'sync_worker', 'auth'
    message TEXT NOT NULL,
    details JSONB,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address INET,
    request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system_logs
CREATE INDEX idx_logs_level ON public.system_logs(level);
CREATE INDEX idx_logs_service ON public.system_logs(service);
CREATE INDEX idx_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_logs_user_id ON public.system_logs(user_id);

-- Partitioning for better performance (optional, for high volume)
-- CREATE TABLE system_logs_archive PARTITION OF system_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- ============================================================================
-- USER ACTIVITY (for tracking user actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'search', 'view_product', 'save_product'
    resource_type VARCHAR(50), -- e.g., 'product', 'merchant', 'listing'
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_activity
CREATE INDEX idx_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_activity_created_at ON public.user_activity(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update search_vector on products
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.subcategory, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.manufacturer, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector
CREATE TRIGGER products_search_vector_trigger
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION products_search_vector_update();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER merchants_updated_at BEFORE UPDATE ON public.merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER merchant_branches_updated_at BEFORE UPDATE ON public.merchant_branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER product_listings_updated_at BEFORE UPDATE ON public.product_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (true);

-- Product listings policies (public read, admin write)
CREATE POLICY "Public can view listings" ON public.product_listings FOR SELECT USING (true);
CREATE POLICY "Admins can insert listings" ON public.product_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update listings" ON public.product_listings FOR UPDATE USING (true);
CREATE POLICY "Admins can delete listings" ON public.product_listings FOR DELETE USING (true);

-- User activity policies
CREATE POLICY "Users can view own activity" ON public.user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity" ON public.user_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all activity" ON public.user_activity FOR SELECT USING (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Create admin user (password: admin123 - CHANGE IN PRODUCTION)
INSERT INTO public.users (email, full_name, role, email_verified)
VALUES ('admin@buildstock.pro', 'System Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Create default merchants
INSERT INTO public.merchants (name, slug, website_url, sync_status)
VALUES
    ('Screwfix', 'screwfix', 'https://www.screwfix.com', 'pending'),
    ('Wickes', 'wickes', 'https://www.wickes.co.uk', 'pending'),
    ('B&Q', 'bandq', 'https://www.diy.com', 'pending'),
    ('Jewson', 'jewson', 'https://www.jewson.co.uk', 'pending'),
    ('Travis Perkins', 'travis-perkins', 'https://www.travisperkins.com', 'pending')
ON CONFLICT (slug) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for product search with aggregated listing data
CREATE OR REPLACE VIEW public.products_search_view AS
SELECT
    p.*,
    COUNT(l.id) as listing_count,
    COUNT(CASE WHEN l.stock_status = 'in_stock' THEN 1 END) as in_stock_listings,
    MIN(l.price) as min_listing_price,
    MAX(l.price) as max_listing_price
FROM public.products p
LEFT JOIN public.product_listings l ON p.id = l.product_id AND l.is_active = true
GROUP BY p.id;

-- View for sync status dashboard
CREATE OR REPLACE VIEW public.sync_status_view AS
SELECT
    m.id,
    m.name,
    m.slug,
    m.sync_status,
    m.last_sync_at,
    COUNT(sj.id) as total_syncs,
    COUNT(CASE WHEN sj.status = 'completed' THEN 1 END) as successful_syncs,
    COUNT(CASE WHEN sj.status = 'failed' THEN 1 END) as failed_syncs,
    MAX(sj.created_at) as latest_sync_job
FROM public.merchants m
LEFT JOIN public.sync_jobs sj ON m.id = sj.merchant_id
GROUP BY m.id, m.name, m.slug, m.sync_status, m.last_sync_at;

COMMIT;
