import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'mock-anon-key';

const isMissingEnv = !import.meta.env.VITE_SUPABASE_URL || (!import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);



if (isMissingEnv) {
  console.warn(
    '⚠️ PaidLogStore: Supabase environment variables are missing! ' +
    'The application is falling back to mock mode. To connect to your database: \n' +
    '  1. Create a `.env` file at the root of the project.\n' +
    '  2. Copy and configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from `.env.example`.'
  );
}

// Export initialized client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility to check if Supabase is connected to actual credentials
export const isSupabaseConfigured = () => !isMissingEnv;

console.log(!isMissingEnv, "checking....");

