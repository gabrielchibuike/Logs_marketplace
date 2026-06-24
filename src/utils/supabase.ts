import { createClient } from '@supabase/supabase-js';

const isProd = import.meta.env.PROD;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabasePublishableKey) missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');
if (!paystackKey) missingVars.push('VITE_PAYSTACK_PUBLIC_KEY');

console.log(supabaseUrl, supabasePublishableKey, paystackKey, "environment variables");


if (missingVars.length > 0) {
  const errorMsg = `🚨 PRODUCTION ERROR: Missing critical environment variables: ${missingVars.join(', ')}. Ensure they are configured in your environment or .env file.`;
  console.error(errorMsg);
  if (isProd) {
    throw new Error(errorMsg);
  }
}

// Custom cookie storage adapter for Supabase client session tracking (XSS mitigation)
const cookieStorage = {
  getItem: (key: string): string | null => {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    const secureFlag = window.location.protocol === 'https:' ? 'Secure;' : '';
    document.cookie = `${key}=${value}; path=/; ${secureFlag} SameSite=Strict`;
  },
  removeItem: (key: string): void => {
    const secureFlag = window.location.protocol === 'https:' ? 'Secure;' : '';
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${secureFlag} SameSite=Strict`;
  }
};

// Export initialized client (with fallback only for dev environment if env is not loaded yet)
export const supabase = createClient(
  supabaseUrl || 'https://mock.supabase.co',
  supabasePublishableKey || 'mock-publishable-key',
  {
    auth: {
      storage: cookieStorage,
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

// Utility to check if Supabase is connected to actual credentials
export const isSupabaseConfigured = () => missingVars.length === 0;
