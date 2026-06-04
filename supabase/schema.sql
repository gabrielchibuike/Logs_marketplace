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
    wallet_balance NUMERIC(10, 2) DEFAULT 500.00 CHECK (wallet_balance >= 0),
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
    payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'card', 'wallet')),
    payment_reference TEXT,
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
    INSERT INTO public.profiles (id, email, role, wallet_balance)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
        COALESCE((new.raw_user_meta_data->>'wallet_balance')::numeric, 500.00)
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- A. PROFILES POLICIES
-- 1. Users can read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can update their own profile (e.g. for wallet updates, though typically handled via functions)
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

-- Purchase Product RPC (Atomic checkout transaction)
CREATE OR REPLACE FUNCTION public.checkout_product(product_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    buyer_id_var UUID;
    product_price_var NUMERIC(10, 2);
    buyer_balance_var NUMERIC(10, 2);
    transaction_id_var UUID;
BEGIN
    -- 1. Secure calling user ID
    buyer_id_var := auth.uid();
    IF buyer_id_var IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Get and lock the product for update (ensure it is active)
    SELECT price INTO product_price_var 
    FROM public.products 
    WHERE id = product_id_param AND status = 'active'
    FOR UPDATE;

    IF product_price_var IS NULL THEN
        RAISE EXCEPTION 'Product not found or already sold';
    END IF;

    -- 3. Get and lock buyer profile balance
    SELECT wallet_balance INTO buyer_balance_var 
    FROM public.profiles 
    WHERE id = buyer_id_var
    FOR UPDATE;

    -- 4. Check if buyer has enough balance
    IF buyer_balance_var < product_price_var THEN
        RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;

    -- 5. Deduct balance from buyer
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance - product_price_var 
    WHERE id = buyer_id_var;

    -- 6. Update product status to sold
    UPDATE public.products 
    SET status = 'sold' 
    WHERE id = product_id_param;

    -- 7. Record transaction entry
    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference)
    VALUES (buyer_id_var, 'purchase', product_price_var, 'completed', 'wallet', 'purchase_' || product_id_param)
    RETURNING id INTO transaction_id_var;

    -- 8. Map product to purchased accounts list
    INSERT INTO public.purchased_accounts (buyer_id, product_id, transaction_id)
    VALUES (buyer_id_var, product_id_param, transaction_id_var);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
