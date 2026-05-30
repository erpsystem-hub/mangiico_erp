export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function trimEnv(v: string | undefined): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** URL + anon key đã trim; `null` khi thiếu hoặc rỗng. */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = trimEnv(import.meta.env.VITE_SUPABASE_URL as string | undefined);
  const anonKey = trimEnv(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function hasSupabaseEnv(): boolean {
  return getSupabaseEnv() != null;
}

/** Throw khi app đang ở chế độ Supabase nhưng thiếu cấu hình. */
export function assertSupabaseConfigured(): SupabaseEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      'Chưa cấu hình Supabase. Thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào .env.local.',
    );
  }
  return env;
}
