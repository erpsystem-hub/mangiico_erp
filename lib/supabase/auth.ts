import type { Session } from '@supabase/supabase-js';
import { subscribeSessionUser } from '@/lib/auth/session-manager';
import { getSupabase } from '@/lib/supabase/client';
import type { User } from '@/types';
import { resolveAuthErrorMessage, resolveSignInAuthError } from '@/lib/auth/auth-error-messages';
import {
  buildAppUser,
  getEmployeeByUsername,
  resolveAppUserFromSession,
  resolveNhanVienForAuthEmail,
  type VarNhanVienAuthRow,
} from '@/lib/auth/resolve-app-user';
import { supabaseEmailToLoginName } from '@/lib/auth-email';
import { txt } from '@/lib/text';

export type { VarNhanVienAuthRow };
export { buildAppUser, getEmployeeByUsername, resolveAppUserFromSession };

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthSession {
  user: User;
}

export interface AuthService {
  signIn(credentials: SignInCredentials): Promise<{ user: User } | { error: string }>;
  signUp(credentials: SignUpCredentials): Promise<{ user?: User; error?: string }>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
}

const authService: AuthService = {
  async signIn(credentials) {
    const supabase = getSupabase();
    if (!supabase) return { error: txt('page.login.errorNotConfigured') };

    const loginName = supabaseEmailToLoginName(credentials.email);
    const employee = loginName ? await getEmployeeByUsername(loginName) : null;

    if (!employee) {
      return { error: txt('page.login.errorAccountNotFound') };
    }
    if (employee.trang_thai === 'Khóa') {
      return { error: txt('page.login.errorAccountLocked') };
    }

    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      return { error: resolveSignInAuthError(error, { employeeExists: true }) };
    }
    if (!data.user?.email) return { error: txt('page.login.errorFailed') };

    const nhanVien = await resolveNhanVienForAuthEmail(data.user.email);
    if (!nhanVien) {
      await supabase.auth.signOut();
      return { error: txt('page.login.errorEmployeeNotFound') };
    }
    if (nhanVien.trang_thai === 'Khóa') {
      await supabase.auth.signOut();
      return { error: txt('page.login.errorAccountLocked') };
    }
    return { user: buildAppUser(data.user, nhanVien) };
  },

  async signUp({ email, password, fullName }) {
    const supabase = getSupabase();
    if (!supabase) return { error: txt('page.login.errorNotConfigured') };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: resolveAuthErrorMessage(error) };
    if (data.user?.email) {
      const nhanVien = await resolveNhanVienForAuthEmail(data.user.email);
      return { user: buildAppUser(data.user, nhanVien) };
    }
    return {};
  },

  async signOut() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
  },

  async getSession() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.email) return null;
    const user = await resolveAppUserFromSession(session);
    return user ? { user } : null;
  },

  onAuthStateChange(callback) {
    return subscribeSessionUser((user) => {
      callback(user ? { user } : null);
    });
  },
};

export function getAuthService(): AuthService {
  return authService;
}
