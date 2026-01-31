-- BuildStock Pro - Price History & Analytics Migration
-- Created: 2026-01-31
-- Description: Track price changes, trends, and enable price comparison analytics

-- ============================================================================
-- PRICE HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL, -- Retailer's product ID (can be merchant SKU or external ID)
    retailer TEXT NOT NULL, -- Merchant/slug name for tracking

    -- Pricing data
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Stock availability at time of scraping
    in_stock BOOLEAN DEFAULT TRUE,

    -- Timestamps
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata for debugging
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for efficient queries
CREATE INDEX idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX idx_price_history_retailer ON public.price_history(retailer);
CREATE INDEX idx_price_history_scraped_at ON public.price_history(scraped_at DESC);
CREATE INDEX idx_price_history_product_retailer ON public.price_history(product_id, retailer);
CREATE INDEX idx_price_history_product_scraped ON public.price_history(product_id, scraped_at DESC);

-- Composite index for trend analysis queries
CREATE INDEX idx_price_history_trend_analysis ON public.price_history(product_id, retailer, scraped_at DESC);

-- Partial index for recent prices only (last 90 days)
CREATE INDEX idx_price_history_recent ON public.price_history(product_id, scraped_at DESC)
WHERE scraped_at > NOW() - INTERVAL '90 days';

-- ============================================================================
-- PRICE ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User identification (email for now, can be migrated to user_id later)
    user_email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Product identification
    product_id TEXT NOT NULL,
    product_uuid UUID REFERENCES public.products(id) ON DELETE CASCADE,
    retailer TEXT,

    -- Alert configuration
    target_price DECIMAL(10, 2) NOT NULL,
    condition VARCHAR(20) DEFAULT 'below' CHECK (condition IN ('below', 'above', 'equals')),

    -- Alert status
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    triggered_price DECIMAL(10, 2),

    -- Notification settings
    notify_email BOOLEAN DEFAULT TRUE,
    notify_webhook BOOLEAN DEFAULT FALSE,
    webhook_url TEXT,

    -- Alert frequency controls
    last_notified_at TIMESTAMP WITH TIME ZONE,
    notification_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration for temporary alerts

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for price alerts
CREATE INDEX idx_price_alerts_user_email ON public.price_alerts(user_email);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_product_id ON public.price_alerts(product_id);
CREATE INDEX idx_price_alerts_is_active ON public.price_alerts(is_active);
CREATE INDEX idx_price_alerts_created_at ON public.price_alerts(created_at DESC);

-- Composite index for finding active alerts
CREATE INDEX idx_price_alerts_active_product ON public.price_alerts(is_active, product_id)
WHERE is_active = TRUE;

-- ============================================================================
-- PRICE ANOMALIES TABLE (for detecting unusual price changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.price_anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Product reference
    product_id TEXT NOT NULL,
    retailer TEXT NOT NULL,

    -- Anomaly details
    previous_price DECIMAL(10, 2) NOT NULL,
    new_price DECIMAL(10, 2) NOT NULL,
    price_change_percent DECIMAL(10, 2) NOT NULL,

    -- Anomaly classification
    anomaly_type VARCHAR(50) NOT NULL, -- 'spike', 'drop', 'error', 'return_to_normal'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Detection metadata
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_resolved BOOLEAN DEFAULT FALSE,

    -- Additional context
    average_price_30d DECIMAL(10, 2),
    min_price_30d DECIMAL(10, 2),
    max_price_30d DECIMAL(10, 2),
    data_points_30d INT DEFAULT 0,

    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for anomalies
CREATE INDEX idx_price_anomalies_product_id ON public.price_anomalies(product_id);
CREATE INDEX idx_price_anomalies_retailer ON public.price_anomalies(retailer);
CREATE INDEX idx_price_anomalies_detected_at ON public.price_anomalies(detected_at DESC);
CREATE INDEX idx_price_anomalies_is_resolved ON public.price_anomalies(is_resolved);
CREATE INDEX idx_price_anomalies_severity ON public.price_anomalies(severity);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on price_alerts
CREATE TRIGGER price_alerts_updated_at
    BEFORE UPDATE ON public.price_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to detect price anomalies on insert
CREATE OR REPLACE FUNCTION detect_price_anomaly()
RETURNS TRIGGER AS $$
DECLARE
    avg_price DECIMAL(10,2);
    min_price DECIMAL(10,2);
    max_price DECIMAL(10,2);
    data_count INT;
    price_change_percent DECIMAL(10,2);
    prev_price DECIMAL(10,2);
    anomaly_type VARCHAR(50);
    severity VARCHAR(20);
BEGIN
    -- Get average price from last 30 days (excluding today)
    SELECT
        AVG(price),
        MIN(price),
        MAX(price),
        COUNT(*)
    INTO avg_price, min_price, max_price, data_count
    FROM public.price_history
    WHERE product_id = NEW.product_id
      AND retailer = NEW.retailer
      AND scraped_at >= NOW() - INTERVAL '30 days'
      AND scraped_at < NEW.scraped_at::DATE;

    -- Only check if we have at least 3 data points
    IF data_count >= 3 THEN
        -- Get most recent price before this one
        SELECT price INTO prev_price
        FROM public.price_history
        WHERE product_id = NEW.product_id
          AND retailer = NEW.retailer
          AND scraped_at < NEW.scraped_at
        ORDER BY scraped_at DESC
        LIMIT 1;

        IF prev_price IS NOT NULL THEN
            price_change_percent := ((NEW.price - prev_price) / prev_price) * 100;

            -- Detect anomalies (price change > 50%)
            IF ABS(price_change_percent) > 50 THEN
                IF price_change_percent > 0 THEN
                    anomaly_type := 'spike';
                ELSE
                    anomaly_type := 'drop';
                END IF;

                -- Determine severity
                IF ABS(price_change_percent) > 100 THEN
                    severity := 'critical';
                ELSIF ABS(price_change_percent) > 75 THEN
                    severity := 'high';
                ELSE
                    severity := 'medium';
                END IF;

                -- Insert anomaly record
                INSERT INTO public.price_anomalies (
                    product_id,
                    retailer,
                    previous_price,
                    new_price,
                    price_change_percent,
                    anomaly_type,
                    severity,
                    average_price_30d,
                    min_price_30d,
                    max_price_30d,
                    data_points_30d
                ) VALUES (
                    NEW.product_id,
                    NEW.retailer,
                    prev_price,
                    NEW.price,
                    price_change_percent,
                    anomaly_type,
                    severity,
                    avg_price,
                    min_price,
                    max_price,
                    data_count
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-detect anomalies
CREATE TRIGGER detect_price_anomaly_trigger
    AFTER INSERT ON public.price_history
    FOR EACH ROW
    EXECUTE FUNCTION detect_price_anomaly();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for current prices across all retailers
CREATE OR REPLACE VIEW public.current_prices_view AS
SELECT DISTINCT ON (product_id, retailer)
    product_id,
    retailer,
    price,
    currency,
    in_stock,
    scraped_at as last_scraped
FROM public.price_history
ORDER BY product_id, retailer, scraped_at DESC;

-- View for price statistics per product
CREATE OR REPLACE VIEW public.price_stats_view AS
SELECT
    product_id,
    retailer,
    COUNT(*) as data_points,
    MIN(price) as historical_low,
    MAX(price) as historical_high,
    AVG(price) as average_price,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY price) as median_price,
    MAX(scraped_at) as last_updated
FROM public.price_history
GROUP BY product_id, retailer;

-- View for products with biggest recent price drops
CREATE OR REPLACE VIEW public.price_drops_view AS
WITH price_changes AS (
    SELECT
        product_id,
        retailer,
        MAX(price) FILTER (WHERE scraped_at >= NOW() - INTERVAL '30 days') as max_30d,
        MIN(price) FILTER (WHERE scraped_at >= NOW() - INTERVAL '7 days') as min_7d,
        MAX(price) FILTER (WHERE scraped_at >= NOW() - INTERVAL '7 days') as current_price
    FROM public.price_history
    WHERE scraped_at >= NOW() - INTERVAL '30 days'
    GROUP BY product_id, retailer
)
SELECT
    product_id,
    retailer,
    max_30d as previous_price,
    current_price,
    min_7d as lowest_price_7d,
    ((max_30d - current_price) / max_30d * 100) as drop_percent
FROM price_changes
WHERE max_30d > 0
  AND current_price < max_30d
ORDER BY drop_percent DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_anomalies ENABLE ROW LEVEL SECURITY;

-- Price history policies (public read, service write)
CREATE POLICY "Public can view price history" ON public.price_history
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert price history" ON public.price_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update price history" ON public.price_history
    FOR UPDATE USING (true);

CREATE POLICY "Service role can delete price history" ON public.price_history
    FOR DELETE USING (true);

-- Price alerts policies
CREATE POLICY "Users can view own alerts" ON public.price_alerts
    FOR SELECT USING (user_id = auth.uid() OR user_email = current_user);

CREATE POLICY "Users can create own alerts" ON public.price_alerts
    FOR INSERT WITH CHECK (user_id = auth.uid() OR user_email = current_user);

CREATE POLICY "Users can update own alerts" ON public.price_alerts
    FOR UPDATE USING (user_id = auth.uid() OR user_email = current_user);

CREATE POLICY "Service role can manage all alerts" ON public.price_alerts
    FOR ALL USING (true);

-- Price anomalies policies
CREATE POLICY "Public can view anomalies" ON public.price_anomalies
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage anomalies" ON public.price_anomalies
    FOR ALL USING (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_history TO service_role;
GRANT SELECT ON public.price_history TO authenticated, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_alerts TO service_role, authenticated;
GRANT SELECT ON public.price_alerts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_anomalies TO service_role;
GRANT SELECT ON public.price_anomalies TO authenticated, anon;

GRANT SELECT ON public.current_prices_view TO authenticated, anon;
GRANT SELECT ON public.price_stats_view TO authenticated, anon;
GRANT SELECT ON public.price_drops_view TO authenticated, anon;

COMMIT;
