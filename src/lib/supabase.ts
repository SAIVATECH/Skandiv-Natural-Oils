import { createClient } from '@supabase/supabase-js';

// Cache client instances at runtime
let supabaseInstance: any = null;

/**
 * Sanitizes an environment variable value by trimming whitespace and
 * removing surrounding single or double quotes that can be introduced
 * during configuration copy-pasting.
 */
export function sanitizeEnvVar(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let sanitized = value.trim();
  if (
    (sanitized.startsWith('"') && sanitized.endsWith('"')) ||
    (sanitized.startsWith("'") && sanitized.endsWith("'"))
  ) {
    sanitized = sanitized.slice(1, -1).trim();
  }
  return sanitized;
}

/**
 * Validates if a string looks like a valid JWT/JWS token.
 * A valid JWT starts with 'eyJ' and has 3 dot-separated parts.
 */
export function isValidJwt(token: string | undefined): boolean {
  if (!token) return false;
  const sanitized = sanitizeEnvVar(token);
  if (!sanitized) return false;
  const parts = sanitized.split('.');
  return parts.length === 3 && sanitized.startsWith('eyJ');
}

/**
 * Validates and sanitizes a URL.
 */
export function sanitizeUrl(url: string | undefined): string | undefined {
  const sanitized = sanitizeEnvVar(url);
  if (!sanitized) return undefined;
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    return undefined;
  }
  return sanitized;
}

/**
 * Client-side Supabase client (uses anon key, respects RLS)
 * Defer initialization until runtime to prevent Next.js build-time exceptions 
 * when environment variables are not yet loaded or missing.
 */
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const isKeyValid = isValidJwt(supabaseAnonKey);

  if (!supabaseUrl || !isKeyValid) {
    console.warn(
      `[Supabase Client Warning] Missing or invalid configuration. ` +
      `URL present: ${!!supabaseUrl}, Key present & valid: ${isKeyValid}. Returning mock client.`
    );
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

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey!);
  return supabaseInstance;
}

/**
 * Server-side Supabase client (uses service role key, bypasses RLS)
 * Use this ONLY in server-side code (API routes, server components)
 */
export function createServiceClient() {
  const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = sanitizeEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const isKeyValid = isValidJwt(serviceRoleKey);

  if (!supabaseUrl || !isKeyValid) {
    console.warn(
      `[Supabase Service Client Warning] Missing or invalid configuration. ` +
      `URL present: ${!!supabaseUrl}, Service Key present & valid: ${isKeyValid}. Returning mock client.`
    );
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

  return createClient(supabaseUrl, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


