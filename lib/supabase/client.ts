import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client. Singleton; returns null if env not set.
 * Auth: PKCE + refresh token phù hợp SPA; tránh gọi createClient lặp lại (tốn bộ nhớ / duplicate listeners).
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (supabaseInstance !== null) return supabaseInstance;
  const env = getSupabaseEnv();
  if (!env) return null;
  supabaseInstance = createClient<Database>(env.url, env.anonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-client-info': 'mttqvn-web' },
    },
  });
  return supabaseInstance;
}
