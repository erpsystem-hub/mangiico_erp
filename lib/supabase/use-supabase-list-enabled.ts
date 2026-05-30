import { useAuthStore } from '@/store/useStore';
import { useSessionStatus } from '@/hooks/use-auth-session';

/**
 * Chỉ fetch sau khi auth hydrate + JWT Supabase sẵn sàng (tránh cache RLS `[]` từ request anon).
 */
export function useSupabaseReady(baseEnabled = true): boolean {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const sessionStatus = useSessionStatus();

  if (!baseEnabled) return false;
  if (!hasHydrated) return false;
  return sessionStatus === 'authenticated';
}

/** @deprecated Dùng `useSupabaseReady`. */
export function useSupabaseListEnabled(baseEnabled = true): boolean {
  return useSupabaseReady(baseEnabled);
}
