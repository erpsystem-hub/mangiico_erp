import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAuthSessionError } from '@/lib/supabase/errors';
import { SERVER_GC_TIME_MS, SERVER_STALE_TIME_MS } from '@/lib/supabase/query-config';

function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /network|timeout|ECONNREFUSED|ETIMEDOUT|Failed to fetch|fetch/i.test(msg);
}

type AuthQueryErrorHandler = (error: unknown) => boolean;

let authQueryErrorHandler: AuthQueryErrorHandler | null = null;

/** Register handler that returns true when error was handled (skip default toast). */
export function setAuthQueryErrorHandler(handler: AuthQueryErrorHandler | null): void {
  authQueryErrorHandler = handler;
}

function queryErrorToast(error: unknown): void {
  if (authQueryErrorHandler?.(error)) return;
  const msg =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Đã xảy ra lỗi';
  toast.error(msg);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: queryErrorToast,
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      authQueryErrorHandler?.(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: SERVER_STALE_TIME_MS,
      gcTime: SERVER_GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        if (isAuthSessionError(error)) return false;
        return isRetryableError(error);
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export function getQueryClient(): QueryClient {
  return queryClient;
}
