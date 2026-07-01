// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS options
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productId, reference, quantity = 1 } = await req.json()

    if (!productId || !reference) {
      return new Response(JSON.stringify({ error: 'Missing productId or reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const qty = parseInt(quantity, 10) || 1
    if (qty < 1) {
      return new Response(JSON.stringify({ error: 'Quantity must be at least 1' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize administrative Supabase client using Service Role to run the complete_checkout_secured RPC
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get client auth token to identify calling buyer securely
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired auth session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Fetch the listing price to verify correct amount was paid
    const { data: product, error: prodError } = await supabaseAdmin
      .from('products')
      .select('price, status')
      .eq('id', productId)
      .single()

    if (prodError || !product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (product.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Account listing is no longer active' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Connect to Paystack verify endpoint using the secure environment key
    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`
    const paystackRes = await fetch(verifyUrl, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    if (!paystackRes.ok) {
      return new Response(JSON.stringify({ error: 'Paystack verification server responded with error' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const paystackData = await paystackRes.json()
    if (!paystackData.status || paystackData.data.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Transaction is not paid or failed verification' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Verify amount match (Paystack uses kobo: price * quantity * 100)
    const expectedKobo = Math.round(product.price * qty * 100)
    const paidKobo = paystackData.data.amount
    if (paidKobo !== expectedKobo) {
      return new Response(JSON.stringify({ error: 'Payment amount mismatch' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Complete purchase transaction on the database securely
    const rpcName = qty > 1 ? 'complete_checkout_secured_multi' : 'complete_checkout_secured'
    const rpcParams = qty > 1 
      ? { product_id_param: productId, reference_param: reference, buyer_id_param: user.id, quantity_param: qty }
      : { product_id_param: productId, reference_param: reference, buyer_id_param: user.id }

    const { data: success, error: checkoutError } = await supabaseAdmin.rpc(rpcName, rpcParams)

    if (checkoutError || !success) {
      return new Response(JSON.stringify({ error: checkoutError?.message || 'Failed to complete transaction ledger entry' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
