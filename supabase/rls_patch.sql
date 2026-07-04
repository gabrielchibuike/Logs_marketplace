-- Add policy so buyers can view the details of products they have purchased, even if they are marked as 'sold'.
CREATE POLICY "Buyers can view their purchased products" 
ON public.products FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.purchased_accounts 
        WHERE purchased_accounts.product_id = public.products.id 
        AND purchased_accounts.buyer_id = auth.uid()
    )
);
