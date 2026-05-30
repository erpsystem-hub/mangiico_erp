import { useSyncExternalStore } from 'react';
import {
  getSessionStatus,
  subscribeSessionStatus,
  type SessionStatus,
} from '@/lib/auth/session-manager';
import { useAuthStore } from '@/store/useStore';

function getServerSessionStatus(): SessionStatus {
  return 'initializing';
}

export function useSessionStatus(): SessionStatus {
  return useSyncExternalStore(subscribeSessionStatus, getSessionStatus, getServerSessionStatus);
}

export function useAppSessionReady(): {
  isInitializing: boolean;
  isAuthenticated: boolean;
} {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const sessionStatus = useSessionStatus();
  return {
    isInitializing: !hasHydrated || sessionStatus === 'initializing',
    isAuthenticated: sessionStatus === 'authenticated' && useAuthStore.getState().isAuthenticated,
  };
}
