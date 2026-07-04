-- ==========================================
-- PaidLogStore Social Media Account Marketplace
-- Supabase PostgreSQL Database Schema
-- Place this inside the Supabase SQL Editor
-- ==========================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'buyer' CHECK (role IN ('admin', 'buyer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE (Account Listings)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'Twitter/X', 'TikTok', 'YouTube', 'Facebook')),
    category TEXT NOT NULL CHECK (category IN ('Aged Account', 'High Followers', 'Creator', 'Business Page', 'Verified')),
    followers INTEGER DEFAULT 0 CHECK (followers >= 0),
    following INTEGER DEFAULT 0 CHECK (following >= 0),
    engagement NUMERIC(5, 2) DEFAULT 0.00 CHECK (engagement >= 0),
    account_age_days INTEGER DEFAULT 0 CHECK (account_age_days >= 0),
    posts INTEGER DEFAULT 0 CHECK (posts >= 0),
    verified BOOLEAN DEFAULT FALSE,
    niche TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    sample_data JSONB DEFAULT '{}'::jsonb,
    encrypted_credentials TEXT, -- AES-256 encrypted payload
    quantity_total INTEGER DEFAULT 1 CHECK (quantity_total >= 0),
    quantity_available INTEGER DEFAULT 1 CHECK (quantity_available >= 0),
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase')),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'card', 'wallet', 'paystack')),
    payment_reference TEXT,
    paystack_reference TEXT UNIQUE, -- UNIQUE Paystack reference column to prevent double-spending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3b. PRODUCT CREDENTIALS TABLE (One-to-Many with Products)
CREATE TABLE IF NOT EXISTS public.product_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Product Credentials
ALTER TABLE public.product_credentials ENABLE ROW LEVEL SECURITY;

-- 4. PURCHASED ACCOUNTS TABLE (Escrow & Buyer Protection mapping)
CREATE TABLE IF NOT EXISTS public.purchased_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    credential_id UUID REFERENCES public.product_credentials(id) ON DELETE SET NULL,
    protection_status TEXT DEFAULT 'active' CHECK (protection_status IN ('active', 'expired', 'disputed')),
    protection_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '72 hours') NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Purchased Accounts
ALTER TABLE public.purchased_accounts ENABLE ROW LEVEL SECURITY;


-- ========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON USER SIGNUP
-- ========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        new.id,
        new.email,
        CASE 
            WHEN new.raw_user_meta_data->>'role' IN ('admin', 'buyer') 
            THEN new.raw_user_meta_data->>'role' 
            ELSE 'buyer' 
        END
    );
    RETURN NEW;
END;
$$;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ========================================================
-- HELPER SECURITY FUNCTIONS
-- ========================================================

-- Checks if a user is an admin (Security Definer bypasses RLS checks on profiles)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;


-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & PRIVILEGES
-- ========================================================

-- A. PROFILES POLICIES
-- 1. Users can read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Admins can manage all profiles
CREATE POLICY "Admins can view and manage all profiles" 
ON public.profiles FOR ALL 
USING (public.is_admin(auth.uid()));

-- B. PRODUCTS POLICIES
-- 1. Anyone can browse active product catalog (excluding credentials)
CREATE POLICY "Anyone can browse active products" 
ON public.products FOR SELECT 
USING (status = 'active');

-- 1b. Buyers can view their purchased products even if sold
CREATE POLICY "Buyers can view their purchased products" 
ON public.products FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.purchased_accounts 
        WHERE purchased_accounts.product_id = id AND purchased_accounts.buyer_id = auth.uid()
    )
);

-- 2. Admins can do everything on products
CREATE POLICY "Admins can do everything on products" 
ON public.products FOR ALL 
USING (public.is_admin(auth.uid()));

-- Restrict SELECT operations on the credentials column specifically from clients
REVOKE SELECT (encrypted_credentials) ON public.products FROM public, anon, authenticated;

-- C. TRANSACTIONS POLICIES
-- 1. Users can view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can insert deposit/purchase transactions for themselves
CREATE POLICY "Users can insert their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Admins can see all transactions
CREATE POLICY "Admins can view all transactions" 
ON public.transactions FOR SELECT 
USING (public.is_admin(auth.uid()));

-- D. PURCHASED ACCOUNTS POLICIES
-- 1. Buyers can view their purchased accounts
CREATE POLICY "Buyers can view their own purchased accounts" 
ON public.purchased_accounts FOR SELECT 
USING (auth.uid() = buyer_id);

-- 2. Admins can manage all purchased accounts
CREATE POLICY "Admins can view all purchased accounts" 
ON public.purchased_accounts FOR ALL 
USING (public.is_admin(auth.uid()));

-- E. PRODUCT CREDENTIALS POLICIES
-- 1. Admins can do everything on credentials
CREATE POLICY "Admins can do everything on credentials" 
ON public.product_credentials FOR ALL 
USING (public.is_admin(auth.uid()));

-- Restrict SELECT operations on the credentials column specifically from clients
REVOKE SELECT (encrypted_credentials) ON public.product_credentials FROM public, anon, authenticated;


-- ========================================================
-- HELPER STORED PROCEDURES (RPCs) & TRIGGERS
-- ========================================================

-- Trigger function to automatically sync product quantity counters
CREATE OR REPLACE FUNCTION public.sync_product_quantity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    prod_id UUID;
    total_count INTEGER;
    avail_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        prod_id := OLD.product_id;
    ELSE
        prod_id := NEW.product_id;
    END IF;

    -- Count total and available credentials
    SELECT COUNT(*), COUNT(*) FILTER (WHERE buyer_id IS NULL)
    INTO total_count, avail_count
    FROM public.product_credentials
    WHERE product_id = prod_id;

    -- Update products table
    UPDATE public.products
    SET 
        quantity_total = COALESCE(total_count, 0),
        quantity_available = COALESCE(avail_count, 0),
        status = CASE 
            WHEN COALESCE(avail_count, 0) = 0 THEN 'sold'
            WHEN status = 'draft' THEN 'draft'
            ELSE 'active'
        END
    WHERE id = prod_id;

    RETURN NULL;
END;
$$;

-- Create sync quantity trigger
DROP TRIGGER IF EXISTS trigger_sync_product_quantity ON public.product_credentials;
CREATE TRIGGER trigger_sync_product_quantity
AFTER INSERT OR UPDATE OR DELETE ON public.product_credentials
FOR EACH ROW EXECUTE FUNCTION public.sync_product_quantity();


-- Atomic Checkout RPC (completes checkout using Paystack reference)
CREATE OR REPLACE FUNCTION public.complete_checkout(product_id_param UUID, reference_param TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    buyer_id_var UUID;
    product_price_var NUMERIC(10, 2);
    transaction_id_var UUID;
    credential_id_var UUID;
BEGIN
    -- 1. Secure calling user ID
    buyer_id_var := auth.uid();
    IF buyer_id_var IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Verify Paystack reference hasn't been reused
    IF EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE paystack_reference = reference_param
    ) THEN
        RAISE EXCEPTION 'Transaction reference already processed';
    END IF;

    -- 3. Get and lock the product for update (ensure it is active)
    SELECT price INTO product_price_var 
    FROM public.products 
    WHERE id = product_id_param AND status = 'active'
    FOR UPDATE;

    IF product_price_var IS NULL THEN
        RAISE EXCEPTION 'Product not found or already sold';
    END IF;

    -- 4. Get and lock an unsold credential unit
    SELECT id INTO credential_id_var
    FROM public.product_credentials
    WHERE product_id = product_id_param AND buyer_id IS NULL
    LIMIT 1
    FOR UPDATE;

    -- If no credential unit exists in the product_credentials table (legacy support fallback)
    IF credential_id_var IS NULL AND EXISTS (
        SELECT 1 FROM public.products WHERE id = product_id_param AND encrypted_credentials IS NOT NULL
    ) THEN
        -- Create a temporary credential record for backward compatibility
        INSERT INTO public.product_credentials (product_id, encrypted_credentials)
        SELECT id, encrypted_credentials FROM public.products WHERE id = product_id_param
        RETURNING id INTO credential_id_var;
    END IF;

    IF credential_id_var IS NULL THEN
        RAISE EXCEPTION 'Product is out of stock';
    END IF;

    -- 5. Record transaction entry
    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference, paystack_reference)
    VALUES (buyer_id_var, 'purchase', product_price_var, 'completed', 'card', 'Purchase of unit from product: ' || product_id_param, reference_param)
    RETURNING id INTO transaction_id_var;

    -- 6. Assign credential to the buyer
    UPDATE public.product_credentials
    SET buyer_id = buyer_id_var, transaction_id = transaction_id_var
    WHERE id = credential_id_var;

    -- 7. Map product to purchased accounts list
    INSERT INTO public.purchased_accounts (buyer_id, product_id, transaction_id, credential_id)
    VALUES (buyer_id_var, product_id_param, transaction_id_var, credential_id_var);

    RETURN TRUE;
END;
$$;


-- Secure asset decryption/retrieval RPC (returns JSONB array of buyer's purchased credentials)
-- Drop first in case return type is being changed from TEXT → JSONB
DROP FUNCTION IF EXISTS public.get_purchased_asset_data(UUID);
CREATE OR REPLACE FUNCTION public.get_purchased_asset_data(product_id_param UUID)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    buyer_id_var UUID;
    credentials_array JSONB;
BEGIN
    -- 1. Secure calling user ID
    buyer_id_var := auth.uid();
    IF buyer_id_var IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Retrieve the array of encrypted credentials that the buyer has purchased for this product
    SELECT jsonb_agg(encrypted_credentials) INTO credentials_array
    FROM public.product_credentials
    WHERE product_id = product_id_param AND buyer_id = buyer_id_var;

    IF credentials_array IS NULL THEN
        -- Fallback: Check if the product was purchased in the legacy single-unit system
        IF EXISTS (
            SELECT 1 FROM public.purchased_accounts
            WHERE buyer_id = buyer_id_var AND product_id = product_id_param
        ) THEN
            SELECT jsonb_build_array(encrypted_credentials) INTO credentials_array
            FROM public.products
            WHERE id = product_id_param;
        ELSE
            RAISE EXCEPTION 'Access denied: You have not purchased this asset';
        END IF;
    END IF;

    RETURN credentials_array;
END;
$$;


-- Secure complete checkout function called by Edge Functions
CREATE OR REPLACE FUNCTION public.complete_checkout_secured(product_id_param UUID, reference_param TEXT, buyer_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    product_price_var NUMERIC(10, 2);
    transaction_id_var UUID;
    credential_id_var UUID;
BEGIN
    -- 1. Verify Paystack reference hasn't been reused
    IF EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE paystack_reference = reference_param
    ) THEN
        RAISE EXCEPTION 'Transaction reference already processed';
    END IF;

    -- 2. Get and lock the product for update (ensure it is active)
    SELECT price INTO product_price_var 
    FROM public.products 
    WHERE id = product_id_param AND (status = 'active' OR quantity_available > 0)
    FOR UPDATE;

    IF product_price_var IS NULL THEN
        RAISE EXCEPTION 'Product not found or already sold';
    END IF;

    -- 3. Get and lock an unsold credential unit
    SELECT id INTO credential_id_var
    FROM public.product_credentials
    WHERE product_id = product_id_param AND buyer_id IS NULL
    LIMIT 1
    FOR UPDATE;

    -- Legacy support fallback
    IF credential_id_var IS NULL AND EXISTS (
        SELECT 1 FROM public.products WHERE id = product_id_param AND encrypted_credentials IS NOT NULL
    ) THEN
        INSERT INTO public.product_credentials (product_id, encrypted_credentials)
        SELECT id, encrypted_credentials FROM public.products WHERE id = product_id_param
        RETURNING id INTO credential_id_var;
    END IF;

    IF credential_id_var IS NULL THEN
        RAISE EXCEPTION 'Product is out of stock';
    END IF;

    -- 4. Record transaction entry
    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference, paystack_reference)
    VALUES (buyer_id_param, 'purchase', product_price_var, 'completed', 'card', 'Purchase of unit from product: ' || product_id_param, reference_param)
    RETURNING id INTO transaction_id_var;

    -- 5. Assign credential to the buyer
    UPDATE public.product_credentials
    SET buyer_id = buyer_id_param, transaction_id = transaction_id_var
    WHERE id = credential_id_var;

    -- 6. Map product to purchased accounts list
    INSERT INTO public.purchased_accounts (buyer_id, product_id, transaction_id, credential_id)
    VALUES (buyer_id_param, product_id_param, transaction_id_var, credential_id_var);

    RETURN TRUE;
END;
$$;


-- Admin RPC to get credentials of a product for editing
CREATE OR REPLACE FUNCTION public.admin_get_product_credentials(product_id_param UUID)
RETURNS TABLE (
    id UUID,
    encrypted_credentials TEXT,
    is_sold BOOLEAN,
    buyer_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Verify caller is admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: Administrative privileges required';
    END IF;

    -- 2. Return credentials details
    RETURN QUERY
    SELECT 
        pc.id,
        pc.encrypted_credentials,
        (pc.buyer_id IS NOT NULL) AS is_sold,
        p.email AS buyer_email
    FROM public.product_credentials pc
    LEFT JOIN public.profiles p ON p.id = pc.buyer_id
    WHERE pc.product_id = product_id_param
    ORDER BY pc.created_at ASC;
END;
$$;


-- Multi-unit atomic checkout RPC
CREATE OR REPLACE FUNCTION public.complete_checkout_multi(
    product_id_param UUID,
    reference_param TEXT,
    quantity_param INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    buyer_id_var UUID;
    product_price_var NUMERIC(10, 2);
    transaction_id_var UUID;
    cred_rec RECORD;
    assigned INTEGER := 0;
BEGIN
    IF quantity_param < 1 THEN
        RAISE EXCEPTION 'Quantity must be at least 1';
    END IF;

    buyer_id_var := auth.uid();
    IF buyer_id_var IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.transactions WHERE paystack_reference = reference_param
    ) THEN
        RAISE EXCEPTION 'Transaction reference already processed';
    END IF;

    SELECT price INTO product_price_var
    FROM public.products
    WHERE id = product_id_param AND status = 'active'
    FOR UPDATE;

    IF product_price_var IS NULL THEN
        RAISE EXCEPTION 'Product not found or unavailable';
    END IF;

    IF (
        SELECT COUNT(*) FROM public.product_credentials
        WHERE product_id = product_id_param AND buyer_id IS NULL
    ) < quantity_param THEN
        RAISE EXCEPTION 'Insufficient stock: not enough units available';
    END IF;

    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference, paystack_reference)
    VALUES (
        buyer_id_var, 'purchase', product_price_var * quantity_param,
        'completed', 'card',
        'Multi-unit purchase (' || quantity_param || ') of product: ' || product_id_param,
        reference_param
    )
    RETURNING id INTO transaction_id_var;

    FOR cred_rec IN
        SELECT id FROM public.product_credentials
        WHERE product_id = product_id_param AND buyer_id IS NULL
        ORDER BY created_at ASC
        LIMIT quantity_param
        FOR UPDATE
    LOOP
        UPDATE public.product_credentials
        SET buyer_id = buyer_id_var, transaction_id = transaction_id_var
        WHERE id = cred_rec.id;

        INSERT INTO public.purchased_accounts (buyer_id, product_id, transaction_id, credential_id)
        VALUES (buyer_id_var, product_id_param, transaction_id_var, cred_rec.id);

        assigned := assigned + 1;
    END LOOP;

    IF assigned < quantity_param THEN
        RAISE EXCEPTION 'Could only assign % of % requested units', assigned, quantity_param;
    END IF;

    RETURN TRUE;
END;
$$;


-- Secure complete checkout function for multi-unit called by Edge Functions
CREATE OR REPLACE FUNCTION public.complete_checkout_secured_multi(
    product_id_param UUID,
    reference_param TEXT,
    buyer_id_param UUID,
    quantity_param INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    product_price_var NUMERIC(10, 2);
    transaction_id_var UUID;
    cred_rec RECORD;
    assigned INTEGER := 0;
BEGIN
    IF quantity_param < 1 THEN
        RAISE EXCEPTION 'Quantity must be at least 1';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE paystack_reference = reference_param
    ) THEN
        RAISE EXCEPTION 'Transaction reference already processed';
    END IF;

    SELECT price INTO product_price_var 
    FROM public.products 
    WHERE id = product_id_param AND status = 'active'
    FOR UPDATE;

    IF product_price_var IS NULL THEN
        RAISE EXCEPTION 'Product not found or unavailable';
    END IF;

    IF (
        SELECT COUNT(*) FROM public.product_credentials
        WHERE product_id = product_id_param AND buyer_id IS NULL
    ) < quantity_param THEN
        RAISE EXCEPTION 'Insufficient stock: not enough units available';
    END IF;

    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference, paystack_reference)
    VALUES (
        buyer_id_param,
        'purchase',
        product_price_var * quantity_param,
        'completed',
        'card',
        'Multi-unit purchase (' || quantity_param || ') of product: ' || product_id_param,
        reference_param
    )
    RETURNING id INTO transaction_id_var;

    FOR cred_rec IN
        SELECT id FROM public.product_credentials
        WHERE product_id = product_id_param AND buyer_id IS NULL
        ORDER BY created_at ASC
        LIMIT quantity_param
        FOR UPDATE
    LOOP
        UPDATE public.product_credentials
        SET buyer_id = buyer_id_param, transaction_id = transaction_id_var
        WHERE id = cred_rec.id;

        INSERT INTO public.purchased_accounts (buyer_id, product_id, transaction_id, credential_id)
        VALUES (buyer_id_param, product_id_param, transaction_id_var, cred_rec.id);

        assigned := assigned + 1;
    END LOOP;

    IF assigned < quantity_param THEN
        RAISE EXCEPTION 'Could only assign % of % requested units', assigned, quantity_param;
    END IF;

    RETURN TRUE;
END;
$$;


-- Grant EXECUTE privileges to all authenticated users
GRANT EXECUTE ON FUNCTION public.complete_checkout(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_checkout_multi(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchased_asset_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_product_credentials(UUID) TO authenticated;

-- Revoke execute permissions on the secure backend RPC from public client access
REVOKE EXECUTE ON FUNCTION public.complete_checkout_secured(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_checkout_secured_multi(UUID, TEXT, UUID, INTEGER) FROM PUBLIC, anon, authenticated;

