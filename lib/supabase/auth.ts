import type { Session } from '@supabase/supabase-js';
import { subscribeSessionUser } from '@/lib/auth/session-manager';
import { getSupabase } from '@/lib/supabase/client';
import type { User } from '@/types';
import {
  buildAppUser,
  getEmployeeByUsername,
  resolveAppUserFromSession,
  resolveNhanVienForAuthEmail,
  type VarNhanVienAuthRow,
} from '@/lib/auth/resolve-app-user';

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
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) return { error: error.message };
    if (!data.user?.email) return { error: 'Đăng nhập thất bại' };

    const nhanVien = await resolveNhanVienForAuthEmail(data.user.email);
    if (!nhanVien) {
      await supabase.auth.signOut();
      return { error: 'Không tìm thấy hồ sơ nhân viên trùng tên đăng nhập. Liên hệ quản trị viên.' };
    }
    if (nhanVien.trang_thai === 'Khóa') {
      await supabase.auth.signOut();
      return { error: 'Tài khoản đã bị khoá. Liên hệ quản trị viên.' };
    }
    return { user: buildAppUser(data.user, nhanVien) };
  },

  async signUp({ email, password, fullName }) {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase chưa được cấu hình' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
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
