-- Update cart_items table to support both guest and authenticated users
-- This assumes cart_items table exists. If not, create it first.

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  material_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Ensure either user_id or session_id is set, but not both
  CONSTRAINT cart_items_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_material_id ON public.cart_items(material_id);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own cart items
CREATE POLICY "Users can view own cart items"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Guests can view cart items by session_id
CREATE POLICY "Guests can view own cart items"
  ON public.cart_items
  FOR SELECT
  USING (session_id = current_setting('app.session_id', true));

-- Users can insert their own cart items
CREATE POLICY "Users can insert own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Guests can insert cart items with session_id
CREATE POLICY "Guests can insert own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (session_id = current_setting('app.session_id', true));

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Guests can update cart items by session_id
CREATE POLICY "Guests can update own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (session_id = current_setting('app.session_id', true));

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Guests can delete cart items by session_id
CREATE POLICY "Guests can delete own cart items"
  ON public.cart_items
  FOR DELETE
  USING (session_id = current_setting('app.session_id', true));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.cart_items IS 'Shopping cart items for both guest and authenticated users';
COMMENT ON COLUMN public.cart_items.user_id IS 'Reference to auth.users.id (null for guests)';
COMMENT ON COLUMN public.cart_items.session_id IS 'Session ID for guest users (null for authenticated users)';
