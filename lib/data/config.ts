/**
 * App chỉ dùng Supabase — cần `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong `.env.local`.
 */
import { hasSupabaseEnv } from '@/lib/supabase/env';

export function isSupabase(): boolean {
  return hasSupabaseEnv();
}
