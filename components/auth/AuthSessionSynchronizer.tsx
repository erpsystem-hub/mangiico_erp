import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useStore';
import { initSessionManager, signOutAndClear, subscribeSessionTransition } from '@/lib/auth/session-manager';
import { isAuthSessionError } from '@/lib/supabase/errors';
import { setAuthQueryErrorHandler } from '@/lib/query-client';
import { MASTER_DATA_QUERY_KEYS } from '@/lib/query-keys';

const SESSION_EXPIRED_TOAST = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';

/**
 * Khởi tạo SessionManager + đăng ký handler lỗi auth tập trung.
 * Invalidate master data khi phiên mới được xác thực.
 */
export function AuthSessionSynchronizer() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthQueryErrorHandler((error) => {
      if (!isAuthSessionError(error)) return false;
      void signOutAndClear();
      toast.error(SESSION_EXPIRED_TOAST);
      return true;
    });
    return () => setAuthQueryErrorHandler(null);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    void initSessionManager();

    return subscribeSessionTransition((prev, next) => {
      if (prev !== 'authenticated' && next === 'authenticated') {
        for (const queryKey of MASTER_DATA_QUERY_KEYS) {
          void queryClient.invalidateQueries({ queryKey });
        }
      }
    });
  }, [hasHydrated, queryClient]);

  return null;
}
