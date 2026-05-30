import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useStore';
import { getAuthService } from '@/lib/supabase/auth';
import { isSupabase } from '@/lib/data/config';
import { queryKeys } from '@/lib/query-keys';

/**
 * Supabase mode: đồng bộ Zustand với Supabase Auth.
 * - Phiên mock cũ (localStorage `auth-storage` không khớp JWT) → đăng xuất để buộc đăng nhập lại.
 * - Có JWT hợp lệ → làm mới `user` từ `var_nhan_vien` (họ tên, chức vụ, …).
 */
export function AuthSessionSynchronizer() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabase() || !hasHydrated) return;

    const auth = getAuthService();
    return auth.onAuthStateChange((session) => {
      const { isAuthenticated, logout, login } = useAuthStore.getState();
      if (!session?.user) {
        if (isAuthenticated) logout();
        return;
      }
      login(session.user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    });
  }, [hasHydrated, queryClient]);

  return null;
}
