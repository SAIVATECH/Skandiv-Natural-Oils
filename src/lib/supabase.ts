import { createClient } from '@supabase/supabase-js';

// Cache client instances at runtime
let supabaseInstance: any = null;

/**
 * Client-side Supabase client (uses anon key, respects RLS)
 * Defer initialization until runtime to prevent Next.js build-time exceptions 
 * when environment variables are not yet loaded or missing.
 */
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase Client Warning] Missing supabaseUrl or supabaseAnonKey in environment. Returning mock client.');
    // Graceful proxy/mock object to bypass Next.js build-time static scanning crashes
    return {
      storage: {
        from: () => ({
          upload: async () => ({ error: new Error('Supabase client not initialized') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
      }
    } as any;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

/**
 * Server-side Supabase client (uses service role key, bypasses RLS)
 * Use this ONLY in server-side code (API routes, server components)
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Supabase Service Client Warning] Missing supabaseUrl or serviceRoleKey in environment. Returning mock client.');
    // Graceful mock fallback for static compilation phases
    return {
      storage: {
        from: () => ({
          upload: async () => ({ error: new Error('Supabase service client not initialized') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          createBucket: async () => ({ error: new Error('Supabase service client not initialized') }),
        })
      }
    } as any;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

