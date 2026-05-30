/**
 * Data source: dùng Supabase khi có đủ `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (sau trim, không rỗng).
 * Ép mock toàn app: `VITE_FORCE_MOCK=true`, hoặc (deprecated) `VITE_DATA_SOURCE=mock`.
 */
import { hasSupabaseEnv } from '@/lib/supabase/env';

export type DataSource = 'mock' | 'supabase';

/** Ép mock dù đã cấu hình URL/key (dev / tương thích `.env` cũ). */
function forceMock(): boolean {
  if (import.meta.env.VITE_FORCE_MOCK === 'true') return true;
  const legacy = (import.meta.env.VITE_DATA_SOURCE as string | undefined)?.trim().toLowerCase();
  if (legacy === 'mock') return true;
  return false;
}

export function getDataSource(): DataSource {
  if (forceMock()) return 'mock';
  return hasSupabaseEnv() ? 'supabase' : 'mock';
}

export function isSupabase(): boolean {
  return getDataSource() === 'supabase';
}

export function isMock(): boolean {
  return getDataSource() === 'mock';
}
