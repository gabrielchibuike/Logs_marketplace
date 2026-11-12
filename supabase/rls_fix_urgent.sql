-- ============================================================
-- URGENT RLS FIX — Run this in the Supabase SQL Editor NOW
-- Fixes: marketplace blank for anon users, dashboard missing
-- credentials for buyers who purchased sold-out products
-- ============================================================

-- 1. Products table: Allow everyone (including anon) to see ACTIVE products
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (status = 'active');

-- 2. Products table: Allow buyers to see products they have purchased (even if sold out)
DROP POLICY IF EXISTS "Buyers can view their purchased products" ON public.products;
CREATE POLICY "Buyers can view their purchased products"
ON public.products FOR SELECT
USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.purchased_accounts
        WHERE purchased_accounts.product_id = public.products.id
          AND purchased_accounts.buyer_id = auth.uid()
    )
);

-- 3. Admins can see ALL products (draft, active, sold)
DROP POLICY IF EXISTS "Admins can do everything on products" ON public.products;
CREATE POLICY "Admins can do everything on products"
ON public.products FOR ALL
USING (public.is_admin(auth.uid()));

-- ============================================================
-- Verify the fix by running these checks after applying:
-- SELECT id, title, status FROM products;  -- should return all 4 products for admin
-- SELECT id, title, status FROM products;  -- (as anon) should return only active ones
-- ============================================================

