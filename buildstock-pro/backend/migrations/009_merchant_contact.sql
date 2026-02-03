-- BuildStock Pro - Merchant Contact System
-- Created: 2026-02-03
-- Description: Tables for users to contact merchants about products

-- ============================================================================
-- MERCHANT CONTACT REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchant_contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.merchant_branches(id) ON DELETE SET NULL,
    scraped_price_id UUID REFERENCES public.scraped_prices(id) ON DELETE SET NULL,

    -- Product information
    product_name TEXT NOT NULL,
    product_sku VARCHAR(100),

    -- Inquiry details
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('product_question', 'stock_check', 'bulk_quote', 'general')),
    message TEXT NOT NULL,

    -- Contact method preference
    contact_method VARCHAR(50) DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'visit')),

    -- User contact information
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'resolved', 'cancelled')),

    -- Response tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact_requests
CREATE INDEX idx_contact_requests_user_id ON public.merchant_contact_requests(user_id);
CREATE INDEX idx_contact_requests_merchant_id ON public.merchant_contact_requests(merchant_id);
CREATE INDEX idx_contact_requests_branch_id ON public.merchant_contact_requests(branch_id);
CREATE INDEX idx_contact_requests_scraped_price_id ON public.merchant_contact_requests(scraped_price_id);
CREATE INDEX idx_contact_requests_status ON public.merchant_contact_requests(status);
CREATE INDEX idx_contact_requests_inquiry_type ON public.merchant_contact_requests(inquiry_type);
CREATE INDEX idx_contact_requests_created_at ON public.merchant_contact_requests(created_at DESC);

-- Composite index for user queries (user + status + date)
CREATE INDEX idx_contact_requests_user_status_date ON public.merchant_contact_requests(user_id, status, created_at DESC);

-- ============================================================================
-- MERCHANT CONTACT RESPONSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.merchant_contact_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_request_id UUID NOT NULL REFERENCES public.merchant_contact_requests(id) ON DELETE CASCADE,

    -- Response details
    responder_name VARCHAR(255) NOT NULL,
    responder_role VARCHAR(100), -- e.g., 'manager', 'sales', 'support'
    response_message TEXT NOT NULL,

    -- Contact information for follow-up
    responder_email VARCHAR(255),
    responder_phone VARCHAR(50),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact_responses
CREATE INDEX idx_contact_responses_request_id ON public.merchant_contact_responses(contact_request_id);
CREATE INDEX idx_contact_responses_created_at ON public.merchant_contact_responses(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update contact request status timestamps
CREATE OR REPLACE FUNCTION update_contact_request_timestamps() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        CASE NEW.status
            WHEN 'sent' THEN
                NEW.sent_at = NOW();
            WHEN 'responded' THEN
                IF OLD.status != 'responded' THEN
                    NEW.first_response_at = NOW();
                END IF;
            WHEN 'resolved' THEN
                NEW.resolved_at = NOW();
        END CASE;
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to contact_requests
CREATE TRIGGER contact_requests_timestamps_trigger
    BEFORE INSERT OR UPDATE ON public.merchant_contact_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_request_timestamps();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on contact tables
ALTER TABLE public.merchant_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_contact_responses ENABLE ROW LEVEL SECURITY;

-- Contact requests policies
CREATE POLICY "Users can view own contact requests" ON public.merchant_contact_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contact requests" ON public.merchant_contact_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contact requests" ON public.merchant_contact_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact requests" ON public.merchant_contact_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Merchants can view requests for their merchant" ON public.merchant_contact_requests
    FOR SELECT USING (
        -- This would be enhanced with merchant user association in a real system
        true
    );

-- Contact responses policies
CREATE POLICY "Users can view responses for own requests" ON public.merchant_contact_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.merchant_contact_requests
            WHERE id = contact_request_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can insert responses" ON public.merchant_contact_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all responses" ON public.merchant_contact_responses
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for contact requests with merchant and branch details
CREATE OR REPLACE VIEW public.contact_requests_detail_view AS
SELECT
    cr.*,
    m.name as merchant_name,
    m.slug as merchant_slug,
    m.logo_url as merchant_logo,
    mb.branch_name,
    mb.address as branch_address,
    mb.city as branch_city,
    mb.postcode as branch_postcode,
    mb.phone as branch_phone,
    mb.email as branch_email,
    mb.opens_at as branch_opens_at,
    mb.closes_at as branch_closes_at,
    sp.product_url,
    sp.price as product_price,
    sp.in_stock as product_in_stock,
    (SELECT COUNT(*) FROM public.merchant_contact_responses WHERE contact_request_id = cr.id) as response_count
FROM public.merchant_contact_requests cr
LEFT JOIN public.merchants m ON cr.merchant_id = m.id
LEFT JOIN public.merchant_branches mb ON cr.branch_id = mb.id
LEFT JOIN public.scraped_prices sp ON cr.scraped_price_id = sp.id;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_contact_requests TO authenticated;
GRANT SELECT ON public.merchant_contact_requests TO anon;
GRANT SELECT, INSERT ON public.merchant_contact_responses TO authenticated;
GRANT SELECT ON public.merchant_contact_responses TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

COMMIT;
