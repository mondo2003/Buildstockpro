-- BuildStock Pro - Scraping Jobs Table
-- Created: 2026-01-30
-- Description: Queue and tracking for web scraping operations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SCRAPING JOBS (for web scraping queue and tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant VARCHAR(100) NOT NULL, -- 'screwfix', 'travis-perkins', etc.
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full_sync', 'category_sync', 'product_sync', 'stock_check')),
    priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 4), -- 1=low, 2=normal, 3=high, 4=urgent
    category VARCHAR(100), -- For category-specific syncs
    product_url TEXT, -- For individual product syncs

    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    result JSONB, -- ScrapingResult as JSON
    error TEXT,

    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT,

    -- Metadata
    triggered_by VARCHAR(100), -- 'cron', 'manual', 'webhook'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for scraping_jobs
CREATE INDEX idx_scraping_jobs_status ON public.scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_merchant ON public.scraping_jobs(merchant);
CREATE INDEX idx_scraping_jobs_priority ON public.scraping_jobs(priority DESC, created_at ASC);
CREATE INDEX idx_scraping_jobs_created_at ON public.scraping_jobs(created_at DESC);

-- Composite index for job queue queries
CREATE INDEX idx_scraping_jobs_queue ON public.scraping_jobs(status, priority DESC, created_at ASC)
  WHERE status IN ('pending', 'running');

-- ============================================================================
-- MERCHANT BRANCH LOCATIONS (expand for geospatial queries)
-- ============================================================================

-- Add more columns to merchant_branches if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'merchant_branches'
        AND column_name = 'click_and_collect'
    ) THEN
        ALTER TABLE public.merchant_branches ADD COLUMN click_and_collect BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'merchant_branches'
        AND column_name = 'opens_at'
    ) THEN
        ALTER TABLE public.merchant_branches ADD COLUMN opens_at TIME;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'merchant_branches'
        AND column_name = 'closes_at'
    ) THEN
        ALTER TABLE public.merchant_branches ADD COLUMN closes_at TIME;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'merchant_branches'
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.merchant_branches ADD COLUMN phone VARCHAR(50);
    END IF;
END $$;

-- ============================================================================
-- USER LOCATIONS (for distance-based sorting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    label VARCHAR(100), -- e.g. "Home", "Work", "Site A"
    address TEXT,
    postcode VARCHAR(20),
    location GEOGRAPHY(POINT, 4326), -- PostGIS point
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_locations
CREATE INDEX idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX idx_user_locations_location ON public.user_locations USING GIST(location);
CREATE INDEX idx_user_locations_is_default ON public.user_locations(is_default);

-- Ensure only one default per user
CREATE UNIQUE INDEX idx_user_locations_unique_default ON public.user_locations(user_id, is_default)
  WHERE is_default = true;

-- Updated_at trigger
CREATE TRIGGER user_locations_updated_at BEFORE UPDATE ON public.user_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR DISTANCE CALCULATION
-- ============================================================================

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    user_lat DECIMAL,
    user_lng DECIMAL,
    branch_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    user_point GEOGRAPHY := ST_MakePoint(user_lng, user_lat)::geography;
    branch_location GEOGRAPHY;
    distance_m DECIMAL;
BEGIN
    SELECT location INTO branch_location
    FROM merchant_branches
    WHERE id = branch_id;

    IF branch_location IS NULL THEN
        RETURN NULL;
    END IF;

    distance_m := ST_Distance(user_point, branch_location);
    RETURN distance_m / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest branches with product availability
CREATE OR REPLACE FUNCTION find_nearest_branches_with_product(
    product_id UUID,
    user_lat DECIMAL,
    user_lng DECIMAL,
    max_distance_km INT DEFAULT 50,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    branch_id UUID,
    branch_name VARCHAR,
    merchant_name VARCHAR,
    address TEXT,
    city VARCHAR,
    postcode VARCHAR,
    distance_km DECIMAL,
    price DECIMAL,
    stock_level INT,
    stock_status VARCHAR,
    click_and_collect BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mb.id as branch_id,
        mb.branch_name,
        m.name as merchant_name,
        mb.address,
        mb.city,
        mb.postcode,
        ST_Distance(
            mb.location,
            ST_MakePoint(user_lng, user_lat)::geography
        ) / 1000 as distance_km,
        pl.price,
        pl.stock_level,
        pl.stock_status,
        mb.click_and_collect
    FROM product_listings pl
    JOIN merchant_branches mb ON pl.branch_id = mb.id
    JOIN merchants m ON mb.merchant_id = m.id
    WHERE pl.product_id = product_id
      AND pl.is_active = true
      AND mb.location IS NOT NULL
      AND ST_DWithin(
        mb.location,
        ST_MakePoint(user_lng, user_lat)::geography,
        max_distance_km * 1000
      )
    ORDER BY
      distance_km ASC,
      pl.price ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR PRODUCT SEARCH WITH LOCATION
-- ============================================================================

-- View for product listings with distance calculation
CREATE OR REPLACE VIEW public.product_listings_with_distance AS
SELECT
    pl.*,
    p.name as product_name,
    p.slug as product_slug,
    p.category,
    m.name as merchant_name,
    m.slug as merchant_slug,
    m.logo_url as merchant_logo,
    mb.branch_name,
    mb.city,
    mb.postcode,
    mb.location as branch_location
FROM product_listings pl
JOIN products p ON pl.product_id = p.id
JOIN merchants m ON pl.merchant_id = m.id
LEFT JOIN merchant_branches mb ON pl.branch_id = mb.id
WHERE pl.is_active = true;

-- ============================================================================
-- UPDATE PRODUCT_LISTINGS for better sorting support
-- ============================================================================

-- Add composite index for price + stock sorting
CREATE INDEX IF NOT EXISTS idx_listings_price_stock_active
  ON public.product_listings(is_active, stock_status, price)
  WHERE is_active = true;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.scraping_jobs TO authenticated, service_role;
GRANT SELECT ON public.scraping_jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_locations TO authenticated;
GRANT SELECT ON public.user_locations TO anon WHERE auth.uid() = user_id;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

COMMIT;
