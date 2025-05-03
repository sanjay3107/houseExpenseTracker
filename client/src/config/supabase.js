import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

// Add options to help with connectivity issues
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase-auth'
  },
  global: {
    headers: {
      'X-Client-Info': 'house-expense-tracker-client'
    },
    // Custom fetch function that ignores SSL certificate issues
    // WARNING: Only use this in development, not in production!
    fetch: (...args) => {
      const [url, fetchOptions = {}] = args;
      // Add SSL bypass for development
      const customFetchOptions = {
        ...fetchOptions,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include', // Changed from 'same-origin' to 'include' to allow cross-origin cookies
      };
      return fetch(url, customFetchOptions);
    }
  },
  // Increase timeout for better reliability
  realtime: {
    timeout: 60000
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Add a custom error handler
supabase.handleError = (error) => {
  console.error('Supabase Error:', error);
  return error;
};

export default supabase;
