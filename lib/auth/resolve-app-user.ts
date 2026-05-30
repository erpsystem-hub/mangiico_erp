import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import type { User } from '@/types';
import { loginNameToSupabaseEmail, supabaseEmailToLoginName } from '@/lib/auth-email';

const VAR_NHAN_VIEN_AUTH_COLUMNS =
  'id, ten_tai_khoan, ho_va_ten, hinh_anh, id_phong_ban, id_bo_phan, id_chuc_vu, trang_thai';

export interface VarNhanVienAuthRow {
  id: string;
  ten_tai_khoan: string;
  ho_va_ten: string;
  hinh_anh: string | null;
  id_phong_ban: string | null;
  id_bo_phan: string | null;
  id_chuc_vu: string | null;
  ten_chuc_vu?: string | null;
  trang_thai: 'Hoạt động' | 'Khóa';
}

export async function getEmployeeByUsername(username: string): Promise<VarNhanVienAuthRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('var_nhan_vien')
    .select(VAR_NHAN_VIEN_AUTH_COLUMNS)
    .ilike('ten_tai_khoan', username.trim())
    .maybeSingle();
  if (error) return null;
  const row = (data as VarNhanVienAuthRow | null) ?? null;
  if (!row?.id_chuc_vu) return row;
  const { data: cv, error: cvErr } = await supabase
    .from('var_chuc_vu')
    .select('ten_chuc_vu')
    .eq('id', Number(row.id_chuc_vu))
    .maybeSingle();
  if (cvErr || !cv) return row;
  const ten = (cv as { ten_chuc_vu?: string }).ten_chuc_vu;
  return { ...row, ten_chuc_vu: ten?.trim() ? ten : null };
}

export async function resolveNhanVienForAuthEmail(
  authEmail: string | undefined,
): Promise<VarNhanVienAuthRow | null> {
  if (!authEmail?.trim()) return null;
  const normalizedEmail = authEmail.trim().toLowerCase();
  const login = supabaseEmailToLoginName(authEmail);
  if (!login) return null;
  const row = await getEmployeeByUsername(login);
  if (!row) return null;
  if (loginNameToSupabaseEmail(row.ten_tai_khoan).toLowerCase() !== normalizedEmail) return null;
  return row;
}

export function buildAppUser(
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string },
  nhanVien: VarNhanVienAuthRow | null,
): User {
  const meta = authUser.user_metadata ?? {};
  const role: 'admin' | 'user' = 'user';
  return {
    id: authUser.id,
    nhan_vien_id: nhanVien?.id,
    username: nhanVien?.ten_tai_khoan,
    email: authUser.email ?? '',
    full_name: nhanVien?.ho_va_ten ?? (meta.full_name as string | undefined),
    avatar_url: nhanVien?.hinh_anh ?? (meta.avatar_url as string | undefined),
    role,
    created_at: authUser.created_at ?? new Date().toISOString(),
    id_phong_ban: nhanVien?.id_phong_ban ?? null,
    id_bo_phan: nhanVien?.id_bo_phan ?? null,
    id_chuc_vu: nhanVien?.id_chuc_vu ?? null,
    ten_chuc_vu: nhanVien?.ten_chuc_vu ?? null,
    trang_thai: nhanVien?.trang_thai,
  };
}

/** Resolve app `User` from Supabase session — gọi ngoài `onAuthStateChange` listener. */
export async function resolveAppUserFromSession(session: Session): Promise<User | null> {
  if (!session.user?.email) return null;
  const nhanVien = await resolveNhanVienForAuthEmail(session.user.email);
  if (!nhanVien) return null;
  if (nhanVien.trang_thai === 'Khóa') return null;
  return buildAppUser(session.user, nhanVien);
}
