-- ========================================================
-- Patch for get_purchased_asset_data RPC:
-- 1. Regular buyers can only see credentials of products THEY purchased.
-- 2. Store administrators (admins) can view credentials for auditing / testing
--    without getting "Access denied: You have not purchased this asset".
-- ========================================================

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
        ELSIF public.is_admin(buyer_id_var) THEN
            -- Allow store administrator to inspect credentials for audit/debugging
            SELECT jsonb_agg(encrypted_credentials) INTO credentials_array
            FROM public.product_credentials
            WHERE product_id = product_id_param;

            IF credentials_array IS NULL THEN
                SELECT jsonb_build_array(encrypted_credentials) INTO credentials_array
                FROM public.products
                WHERE id = product_id_param;
            END IF;
        ELSE
            RAISE EXCEPTION 'Access denied: You have not purchased this asset';
        END IF;
    END IF;

    RETURN credentials_array;
END;
$$;

