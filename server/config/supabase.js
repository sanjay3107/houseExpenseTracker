const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Add options to help with connectivity issues
const options = {
  auth: {
    persistSession: false, // Don't persist the session to avoid cookie issues
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'house-expense-tracker-server'
    }
  }
};

// Create a custom fetch implementation that ignores SSL certificate issues
// WARNING: Only use this in development environments, not in production!
const https = require('https');
const customFetch = require('cross-fetch');
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Ignore SSL certificate issues
});

const fetchWithoutSSLCheck = (url, options = {}) => {
  return customFetch(url, {
    ...options,
    agent: httpsAgent
  });
};

// Pass the custom fetch function to the Supabase client
options.global.fetch = fetchWithoutSSLCheck;

const supabase = createClient(supabaseUrl, supabaseKey, options);

module.exports = supabase;
