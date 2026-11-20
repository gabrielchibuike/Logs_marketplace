// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const signature = req.headers.get('x-paystack-signature');
    const rawBody = await req.text();

    // 1. Verify Paystack webhook HMAC SHA512 signature
    if (PAYSTACK_SECRET_KEY && signature) {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(PAYSTACK_SECRET_KEY),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(rawBody)
      );
      const hashHex = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (hashHex !== signature) {
        console.error("Invalid Paystack webhook signature");
        return new Response('Invalid signature', { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log("Received Paystack event:", payload.event);

    // Only process successful charges
    if (payload.event === 'charge.success') {
      const data = payload.data;
      const reference = data.reference;
      const customerEmail = data.customer?.email;
      const metadata = data.metadata || {};
      const productId = metadata.product_id;
      const quantity = parseInt(metadata.quantity, 10) || 1;

      console.log(`Processing successful charge ${reference} for ${customerEmail}, product: ${productId}`);

      if (!productId) {
        console.warn("No product_id found in metadata for reference", reference);
        return new Response(JSON.stringify({ received: true, note: 'No product_id in metadata' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        SUPABASE_URL!,
        SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find user by email or metadata.user_id
      let userId = metadata.user_id;
      if (!userId && customerEmail) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();
        if (profile) {
          userId = profile.id;
        }
      }

      if (!userId) {
        console.error("Could not find user profile for", customerEmail);
        return new Response(JSON.stringify({ error: 'User profile not found' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Execute secured checkout RPC
      const rpcName = quantity > 1 ? 'complete_checkout_secured_multi' : 'complete_checkout_secured';
      const rpcParams = quantity > 1
        ? { product_id_param: productId, reference_param: reference, buyer_id_param: userId, quantity_param: quantity }
        : { product_id_param: productId, reference_param: reference, buyer_id_param: userId };

      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(rpcName, rpcParams);

      if (rpcError) {
        console.error("RPC error during webhook checkout:", rpcError);
        return new Response(JSON.stringify({ error: rpcError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log(`Successfully credited asset to user ${userId} for transaction ${reference}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

