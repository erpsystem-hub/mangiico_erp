import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { resolveAppUserFromSession } from '@/lib/auth/resolve-app-user';
import { AuthSessionError } from '@/lib/supabase/errors';
import { getQueryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/useStore';
import type { User } from '@/types';

export type SessionStatus = 'initializing' | 'authenticated' | 'unauthenticated';

type StatusListener = (status: SessionStatus) => void;
type UserListener = (user: User | null) => void;
type TransitionListener = (prev: SessionStatus, next: SessionStatus) => void;

let sessionStatus: SessionStatus = 'initializing';
let initStarted = false;
let initPromise: Promise<void> | null = null;
let subscription: { unsubscribe: () => void } | null = null;
let resolveUserGeneration = 0;
let signingOut = false;

const statusListeners = new Set<StatusListener>();
const userListeners = new Set<UserListener>();
const transitionListeners = new Set<TransitionListener>();

function notifyStatus(next: SessionStatus): void {
  const prev = sessionStatus;
  if (prev === next) return;
  sessionStatus = next;
  for (const listener of statusListeners) listener(next);
  for (const listener of transitionListeners) listener(prev, next);
}

function notifyUser(user: User | null): void {
  for (const listener of userListeners) listener(user);
}

function clearAuthState(): void {
  useAuthStore.getState().clearAuthState();
}

/** Sync handler — no await; employee resolve runs deferred outside auth lock. */
function syncFromSession(session: Session | null): void {
  if (!session?.access_token) {
    notifyStatus('unauthenticated');
    clearAuthState();
    notifyUser(null);
    return;
  }

  notifyStatus('authenticated');

  const generation = ++resolveUserGeneration;
  queueMicrotask(() => {
    void (async () => {
      try {
        const user = await resolveAppUserFromSession(session);
        if (generation !== resolveUserGeneration) return;
        if (!user) {
          await signOutAndClear();
          return;
        }
        useAuthStore.getState().login(user);
        notifyUser(user);
      } catch {
        if (generation !== resolveUserGeneration) return;
        await signOutAndClear();
      }
    })();
  });
}

export function getSessionStatus(): SessionStatus {
  return sessionStatus;
}

export function subscribeSessionStatus(listener: StatusListener): () => void {
  listener(sessionStatus);
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export function subscribeSessionTransition(listener: TransitionListener): () => void {
  transitionListeners.add(listener);
  return () => {
    transitionListeners.delete(listener);
  };
}

export function subscribeSessionUser(listener: UserListener): () => void {
  listener(useAuthStore.getState().user);
  userListeners.add(listener);
  return () => {
    userListeners.delete(listener);
  };
}

export async function initSessionManager(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (initStarted) return;
    initStarted = true;

    const supabase = getSupabase();
    if (!supabase) {
      notifyStatus('unauthenticated');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    syncFromSession(session);

    if (!subscription) {
      const {
        data: { subscription: sub },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        syncFromSession(nextSession);
      });
      subscription = sub;
    }
  })();

  return initPromise;
}

export function waitUntilSessionReady(): Promise<void> {
  if (sessionStatus !== 'initializing') return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = subscribeSessionStatus((status) => {
      if (status !== 'initializing') {
        unsub();
        resolve();
      }
    });
  });
}

/** Wait until JWT + app user are ready (post-login). */
export function waitUntilAuthenticated(timeoutMs = 10_000): Promise<boolean> {
  if (sessionStatus === 'authenticated' && useAuthStore.getState().isAuthenticated) {
    return Promise.resolve(true);
  }
  if (sessionStatus === 'unauthenticated') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    const unsubStatus = subscribeSessionStatus((status) => {
      if (status === 'unauthenticated') {
        cleanup();
        resolve(false);
      } else if (status === 'authenticated' && useAuthStore.getState().isAuthenticated) {
        cleanup();
        resolve(true);
      }
    });

    const unsubStore = useAuthStore.subscribe((state) => {
      if (sessionStatus === 'authenticated' && state.isAuthenticated) {
        cleanup();
        resolve(true);
      }
    });

    function cleanup(): void {
      clearTimeout(timeoutId);
      unsubStatus();
      unsubStore();
    }
  });
}

export async function ensureAuthenticated(): Promise<Session> {
  if (sessionStatus === 'initializing') {
    await initSessionManager();
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthSessionError('Supabase chưa được cấu hình');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new AuthSessionError();
  }

  return session;
}

export async function signOutAndClear(): Promise<void> {
  if (signingOut) return;
  signingOut = true;
  resolveUserGeneration++;

  try {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    clearAuthState();
    getQueryClient().clear();
    notifyStatus('unauthenticated');
    notifyUser(null);
  } finally {
    signingOut = false;
  }
}
