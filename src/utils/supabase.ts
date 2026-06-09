import { createClient } from '@supabase/supabase-js';

const isProd = import.meta.env.PROD;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabasePublishableKey) missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');
if (!paystackKey) missingVars.push('VITE_PAYSTACK_PUBLIC_KEY');

if (missingVars.length > 0) {
  const errorMsg = `🚨 PRODUCTION ERROR: Missing critical environment variables: ${missingVars.join(', ')}. Ensure they are configured in your environment or .env file.`;
  console.error(errorMsg);
  if (isProd) {
    throw new Error(errorMsg);
  }
}

// Export initialized client (with fallback only for dev environment if env is not loaded yet)
export const supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabasePublishableKey || 'mock-publishable-key');

// Utility to check if Supabase is connected to actual credentials
export const isSupabaseConfigured = () => missingVars.length === 0;
