import { useAuthStore } from '@/store/useStore';
import { isSupabase } from '@/lib/data/config';

/** Chỉ fetch list Supabase sau khi auth hydrate + có JWT (tránh cache RLS `[]`). */
export function useSupabaseListEnabled(baseEnabled = true): boolean {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!baseEnabled) return false;
  if (!isSupabase()) return true;
  return Boolean(hasHydrated && isAuthenticated);
}
