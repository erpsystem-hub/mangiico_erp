import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_BRANDING_APP_DESCRIPTION,
  DEFAULT_BRANDING_APP_NAME,
  DEFAULT_BRANDING_LOGO,
} from '@/lib/branding-defaults';
import type { AppFontFamily } from '../lib/theme/fonts';
import { DEFAULT_FONT_FAMILY } from '../lib/theme/tokens';
import { AuthState, User } from '../types';
import { usePermissionGrantStore } from './usePermissionGrantStore';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      /** Chỉ xóa state app — dùng `signOutAndClear()` cho đăng xuất đầy đủ. */
      clearAuthState: () => {
        usePermissionGrantStore.getState().clearMatrix();
        set({ user: null, isAuthenticated: false });
      },
      /** @deprecated Dùng `signOutAndClear()` từ session-manager. */
      logout: () => {
        usePermissionGrantStore.getState().clearMatrix();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      version: 4,
      partialize: (state): Pick<AuthState, 'user' | 'isAuthenticated'> => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hasHydrated: true });
      },
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted as AuthState;
        const state = persisted as AuthState;
        if (version < 1) {
          if (state.user?.id === '123' || state.user?.email === 'demo@example.com') {
            state.user = {
              id: 'emp-000',
              email: 'admin@5fedu.com',
              full_name: 'Lê Minh Công',
              role: 'admin',
              created_at: new Date().toISOString(),
              id_phong_ban: 'dep-7',
            };
            state.isAuthenticated = true;
          }
        }
        if (version < 2 && state.user?.id === 'user-123') {
          state.user = {
            ...state.user,
            id: 'emp-000',
            id_phong_ban: 'dep-7',
            role: 'admin',
          };
        }
        if (version < 3) {
          const u = state.user;
          if (
            u &&
            (u.id === 'emp-000' ||
              u.email === 'demo@example.com' ||
              u.role === 'admin' ||
              u.id === '123')
          ) {
            return { user: null, isAuthenticated: false } as AuthState;
          }
        }
        if (version < 4) {
          // v4: auth-storage luôn localStorage (khớp JWT Supabase); dọn sessionStorage cũ.
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('auth-storage');
          }
        }
        return state;
      },
    }
  )
);

/** Thông tin tổ chức + thương hiệu (UI / Zustand; đồng bộ var_thong_tin_to_chuc khi Supabase). */
export interface CompanyInfo {
  appName: string;
  appDescription: string;
  appLogo: string | null;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

/** Mặc định Mangiico ERP — đồng bộ với index.html / PWA; chỉnh trong Hệ thống → Thông tin tổ chức. */
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  appName: DEFAULT_BRANDING_APP_NAME,
  appDescription: DEFAULT_BRANDING_APP_DESCRIPTION,
  appLogo: DEFAULT_BRANDING_LOGO,
  companyName: 'Mặt trận Tổ quốc Việt Nam — tỉnh Nghệ An',
  address: 'Khối 7, đường Hùng Vương, TP. Vinh, tỉnh Nghệ An',
  phone: '',
  email: '',
  website: 'https://mttq.org.vn',
};

interface ThemeState {
  primaryColor: 'blue' | 'violet' | 'emerald' | 'rose' | 'amber' | 'orange' | 'cyan' | 'slate';
  fontFamily: AppFontFamily;
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'light' | 'dark' | 'system';
  timezone: string;
  setTheme: (settings: Partial<Omit<ThemeState, 'setTheme'>>) => void;
}

interface UIState extends ThemeState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // Branding & Company Info
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: Partial<CompanyInfo>) => void;
  // User Preferences
  skipRedirectConfirmation: boolean;
  setSkipRedirectConfirmation: (skip: boolean) => void;
}

/** Allowed font families – used for migration from old settings. */
const ALLOWED_FONTS = new Set<AppFontFamily>([
  'Inter',
  'Be Vietnam Pro',
  'Lexend',
  'Nunito',
  'Source Sans 3',
  'Merriweather',
]);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Default Theme Settings
      primaryColor: 'blue',
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: 'medium',
      colorScheme: 'light',
      timezone: 'Asia/Ho_Chi_Minh',
      setTheme: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },

      // Thông tin tổ chức + thương hiệu (persist; đồng bộ var_thong_tin_to_chuc từ Supabase)
      companyInfo: { ...DEFAULT_COMPANY_INFO },
      setCompanyInfo: (info) => set((state) => ({
        companyInfo: { ...state.companyInfo, ...info }
      })),

      // User Preferences
      skipRedirectConfirmation: false,
      setSkipRedirectConfirmation: (skip) => set({ skipRedirectConfirmation: skip }),
    }),
    {
      name: 'ui-storage', // Persist UI settings including branding
      version: 7,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted as UIState;
        const state = persisted as Record<string, unknown> & Partial<ThemeState>;
        // v0 → v1: fonts list reduced
        if (
          version === 0 &&
          state.fontFamily &&
          typeof state.fontFamily === 'string' &&
          !ALLOWED_FONTS.has(state.fontFamily as ThemeState['fontFamily'])
        ) {
          state.fontFamily = DEFAULT_FONT_FAMILY;
        }
        // v1 → v2: chỉ còn tiếng Việt — bỏ language khỏi state đã lưu
        if (version < 2) {
          delete state.language;
        }
        // v2 → v3: nâng branding mặc định từ template 5F lên Mangiico ERP (chỉ khi chưa đổi tên mẫu)
        if (version < 3) {
          const ci = state.companyInfo as CompanyInfo | undefined;
          if (ci?.appName === '5F template' && ci?.companyName === '5F template') {
            state.companyInfo = { ...DEFAULT_COMPANY_INFO };
          }
        }
        // v3 → v4: bỏ taxId (module Thông tin tổ chức)
        if (version < 4 && state.companyInfo && typeof state.companyInfo === 'object') {
          const ci = { ...(state.companyInfo as Record<string, unknown>) };
          delete ci.taxId;
          state.companyInfo = { ...DEFAULT_COMPANY_INFO, ...ci } as CompanyInfo;
        }
        // v4 → v5: logo + tên Mangiico mới (chỉ khi vẫn dùng mặc định cũ)
        if (version < 5 && state.companyInfo && typeof state.companyInfo === 'object') {
          const ci = state.companyInfo as CompanyInfo;
          const oldLogo = 'https://datafiles.nghean.gov.vn/nan-ubnd/6556/Album/quochuy%20(1).png';
          const oldNames = new Set(['Mangiico ERP', '5F template']);
          const oldDescs = new Set(['Hệ thống quản trị doanh nghiệp', 'Hệ thống nền tảng số']);
          const updates: Partial<CompanyInfo> = {};
          if (!ci.appLogo || ci.appLogo === oldLogo) updates.appLogo = DEFAULT_BRANDING_LOGO;
          if (oldNames.has(ci.appName)) updates.appName = DEFAULT_BRANDING_APP_NAME;
          if (oldDescs.has(ci.appDescription)) updates.appDescription = DEFAULT_BRANDING_APP_DESCRIPTION;
          if (Object.keys(updates).length > 0) {
            state.companyInfo = { ...ci, ...updates };
          }
        }
        // v5 → v6: branding Mangiico ERP mới (5F edu / mô tả cũ / tên công ty mẫu)
        if (version < 6 && state.companyInfo && typeof state.companyInfo === 'object') {
          const ci = state.companyInfo as CompanyInfo;
          const oldAppNames = new Set([
            '5f edu',
            '5f template',
            'mangiico',
            'mangiico erp',
          ]);
          const oldDescs = new Set([
            'số hóa doanh nghiệp hiệu quả',
            'hệ thống quản trị',
            'hệ thống quản trị doanh nghiệp',
            'hệ thống nền tảng số',
          ]);
          const updates: Partial<CompanyInfo> = {};
          const appNameNorm = (ci.appName ?? '').trim().toLowerCase();
          const appDescNorm = (ci.appDescription ?? '').trim().toLowerCase();
          if (oldAppNames.has(appNameNorm)) {
            updates.appName = DEFAULT_BRANDING_APP_NAME;
          }
          if (oldDescs.has(appDescNorm)) {
            updates.appDescription = DEFAULT_BRANDING_APP_DESCRIPTION;
          }
          if (ci.companyName === 'Mặt trận Tổ quốc Việt Nam') {
            updates.companyName = DEFAULT_COMPANY_INFO.companyName;
          }
          if (Object.keys(updates).length > 0) {
            state.companyInfo = { ...ci, ...updates };
          }
        }
        // v6 → v7: branding Mặt trận số Nghệ An (từ Mangiico ERP)
        if (version < 7 && state.companyInfo && typeof state.companyInfo === 'object') {
          const ci = state.companyInfo as CompanyInfo;
          const oldAppNames = new Set([
            '5f edu',
            '5f template',
            'mangiico',
            'mangiico erp',
          ]);
          const oldDescs = new Set([
            'số hóa doanh nghiệp hiệu quả',
            'hệ thống quản trị',
            'hệ thống quản trị doanh nghiệp',
            'hệ thống nền tảng số',
            'phần mềm quản trị erp',
          ]);
          const oldLogo =
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKffuRSheGugfycCmEm46856oXbHMXKHiOjg&s';
          const updates: Partial<CompanyInfo> = {};
          const appNameNorm = (ci.appName ?? '').trim().toLowerCase();
          const appDescNorm = (ci.appDescription ?? '').trim().toLowerCase();
          if (oldAppNames.has(appNameNorm)) {
            updates.appName = DEFAULT_BRANDING_APP_NAME;
          }
          if (oldDescs.has(appDescNorm)) {
            updates.appDescription = DEFAULT_BRANDING_APP_DESCRIPTION;
          }
          if (!ci.appLogo || ci.appLogo === oldLogo) {
            updates.appLogo = DEFAULT_BRANDING_LOGO;
          }
          if (ci.companyName === 'Mangiico') {
            updates.companyName = DEFAULT_COMPANY_INFO.companyName;
          }
          if (Object.keys(updates).length > 0) {
            state.companyInfo = { ...ci, ...updates };
          }
        }
        return persisted as UIState;
      },
    }
  )
);