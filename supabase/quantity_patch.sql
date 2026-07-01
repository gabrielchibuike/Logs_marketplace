-- ========================================================
-- QUANTITY & PER-UNIT CREDENTIALS DATABASE MIGRATION PATCH
-- Run this inside your Supabase SQL Editor
-- ========================================================

-- 1. Alter products table to add quantity columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS quantity_total INTEGER DEFAULT 1 CHECK (quantity_total >= 0),
ADD COLUMN IF NOT EXISTS quantity_available INTEGER DEFAULT 1 CHECK (quantity_available >= 0);

-- 2. Create product_credentials table if not exists
CREATE TABLE IF NOT EXISTS public.product_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS and set policies
ALTER TABLE public.product_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can do everything on credentials" ON public.product_credentials;
CREATE POLICY "Admins can do everything on credentials" 
ON public.product_credentials FOR ALL 
USING (public.is_admin(auth.uid()));

-- Revoke client select permissions on credentials column
REVOKE SELECT (encrypted_credentials) ON public.product_credentials FROM public, anon, authenticated;

-- 4. Alter purchased_accounts table to link specific credential unit
ALTER TABLE public.purchased_accounts 
ADD COLUMN IF NOT EXISTS credential_id UUID REFERENCES public.product_credentials(id) ON DELETE SET NULL;

-- 5. Create Trigger function to sync product quantity
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

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_product_quantity ON public.product_credentials;
CREATE TRIGGER trigger_sync_product_quantity
AFTER INSERT OR UPDATE OR DELETE ON public.product_credentials
FOR EACH ROW EXECUTE FUNCTION public.sync_product_quantity();

-- 6. Update complete_checkout RPC
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

-- 7. Update get_purchased_asset_data RPC (drop first — return type changes from TEXT to JSONB)
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

-- 8. Update complete_checkout_secured RPC
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


-- 9. Add complete_checkout_secured_multi RPC for multi-unit backend verification
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


-- 9. Admin RPC to get credentials of a product for editing
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

-- 10. Add complete_checkout_multi RPC for multi-unit purchases
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
    -- 1. Validate quantity
    IF quantity_param < 1 THEN
        RAISE EXCEPTION 'Quantity must be at least 1';
    END IF;

    -- 2. Secure calling user ID
    buyer_id_var := auth.uid();
    IF buyer_id_var IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 3. Verify Paystack reference hasn't been reused
    IF EXISTS (
        SELECT 1 FROM public.transactions
        WHERE paystack_reference = reference_param
    ) THEN
        RAISE EXCEPTION 'Transaction reference already processed';
    END IF;

    -- 4. Get and lock the product
    SELECT price INTO product_price_var
    FROM public.products
    WHERE id = product_id_param AND status = 'active'
    FOR UPDATE;

    IF product_price_var IS NULL THEN
        RAISE EXCEPTION 'Product not found or unavailable';
    END IF;

    -- 5. Verify enough stock
    IF (
        SELECT COUNT(*) FROM public.product_credentials
        WHERE product_id = product_id_param AND buyer_id IS NULL
    ) < quantity_param THEN
        RAISE EXCEPTION 'Insufficient stock: not enough units available';
    END IF;

    -- 6. Record ONE transaction for the total amount (price × quantity)
    INSERT INTO public.transactions (user_id, type, amount, status, payment_method, payment_reference, paystack_reference)
    VALUES (
        buyer_id_var,
        'purchase',
        product_price_var * quantity_param,
        'completed',
        'card',
        'Multi-unit purchase (' || quantity_param || ') of product: ' || product_id_param,
        reference_param
    )
    RETURNING id INTO transaction_id_var;

    -- 7. Assign N credential units to the buyer
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

-- 11. Grant execute privileges
GRANT EXECUTE ON FUNCTION public.complete_checkout(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_checkout_multi(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchased_asset_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_product_credentials(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_checkout_secured(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_checkout_secured_multi(UUID, TEXT, UUID, INTEGER) FROM PUBLIC, anon, authenticated;

-- 11. Run data migration to copy legacy credentials to the credentials table
INSERT INTO public.product_credentials (product_id, encrypted_credentials, buyer_id, transaction_id)
SELECT 
    p.id, 
    p.encrypted_credentials, 
    pa.buyer_id, 
    pa.transaction_id
FROM public.products p
LEFT JOIN public.purchased_accounts pa ON pa.product_id = p.id
WHERE p.encrypted_credentials IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.product_credentials pc 
    WHERE pc.product_id = p.id
);

-- Update purchased_accounts to link to the new credentials
UPDATE public.purchased_accounts pa
SET credential_id = pc.id
FROM public.product_credentials pc
WHERE pc.product_id = pa.product_id AND pc.transaction_id = pa.transaction_id
AND pa.credential_id IS NULL;
