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
    sample_data TEXT,
    encrypted_credentials TEXT, -- AES-256 encrypted payload
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

-- 4. PURCHASED ACCOUNTS TABLE (Escrow & Buyer Protection mapping)
CREATE TABLE IF NOT EXISTS public.purchased_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
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
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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


-- ========================================================
-- HELPER STORED PROCEDURES (RPCs)
-- ========================================================

-- Atomic Checkout RPC (completes checkout using Paystack reference)
CREATE OR REPLACE FUNCTION public.complete_checkout(product_id_param UUID, reference_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    buyer_id_var UUID;
    product_price_var NUMERIC(10, 2);
    transaction_id_var UUID;
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

    -- 4. Update product status to sold
    UPDATE public.products 
    SET status = 'sold' 
    WHERE id = product_id_param;

    -- 5. Record transaction entry
    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference, paystack_reference)
    VALUES (buyer_id_var, 'purchase', product_price_var, 'completed', 'card', 'Purchase of account: ' || product_id_param, reference_param)
    RETURNING id INTO transaction_id_var;

    -- 6. Map product to purchased accounts list
    INSERT INTO public.purchased_accounts (buyer_id, product_id, transaction_id)
    VALUES (buyer_id_var, product_id_param, transaction_id_var);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Secure asset decryption/retrieval RPC
CREATE OR REPLACE FUNCTION public.get_purchased_asset_data(product_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    buyer_id_var UUID;
    credentials_var TEXT;
BEGIN
    -- 1. Secure calling user ID
    buyer_id_var := auth.uid();
    IF buyer_id_var IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Verify if the buyer actually purchased this product
    IF NOT EXISTS (
        SELECT 1 FROM public.purchased_accounts 
        WHERE buyer_id = buyer_id_var AND product_id = product_id_param
    ) THEN
        RAISE EXCEPTION 'Access denied: You have not purchased this asset';
    END IF;

    -- 3. Retrieve the encrypted credentials (Security Definer runs as owner, bypassing column RLS/privilege limitations)
    SELECT encrypted_credentials INTO credentials_var 
    FROM public.products 
    WHERE id = product_id_param;

    RETURN credentials_var;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant EXECUTE privileges to all authenticated users
GRANT EXECUTE ON FUNCTION public.complete_checkout(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchased_asset_data(UUID) TO authenticated;
