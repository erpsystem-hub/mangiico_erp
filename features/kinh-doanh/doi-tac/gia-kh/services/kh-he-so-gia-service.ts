import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { DEFAULT_HE_SO_GIA, HE_SO_GIA_MAX, HE_SO_GIA_MIN } from '../core/constants';

export type ProductGroupColumn = {
  id: string;
  ten_hien_thi: string;
  ma_danh_muc?: string | null;
};

/** danh_muc KH id → nhom SP id → he_so (runtime) */
export type CustomerPriceMatrix = Map<string, Map<string, number>>;

/** Dạng lưu React Query / localStorage persist (Map không serialize được). */
export type CustomerPriceMatrixStored = Record<string, Record<string, number>>;

function normId(v: string): number | null {
  const s = String(v).trim();
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export function parseHeSoGiaInput(raw: string): number | null {
  const t = raw.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < HE_SO_GIA_MIN || n > HE_SO_GIA_MAX) return null;
  return Math.round(n * 10000) / 10000;
}

export function shouldPersistHeSoGia(value: number | null): value is number {
  if (value == null) return false;
  return Math.abs(value - DEFAULT_HE_SO_GIA) > 0.00005;
}

function buildPriceMatrix(
  rows: { danh_muc_khach_hang_id: number; nhom_san_pham_id: number; he_so_gia: number }[],
): CustomerPriceMatrix {
  const m: CustomerPriceMatrix = new Map();
  for (const row of rows) {
    const dm = String(row.danh_muc_khach_hang_id);
    const nhom = String(row.nhom_san_pham_id);
    let inner = m.get(dm);
    if (!inner) {
      inner = new Map();
      m.set(dm, inner);
    }
    inner.set(nhom, Number(row.he_so_gia));
  }
  return m;
}

export function serializePriceMatrix(matrix: CustomerPriceMatrix): CustomerPriceMatrixStored {
  const out: CustomerPriceMatrixStored = {};
  for (const [dm, inner] of matrix) {
    if (inner.size === 0) continue;
    out[dm] = Object.fromEntries(inner);
  }
  return out;
}

/** Khôi phục Map sau persist cache hoặc optimistic update cũ. */
export function ensurePriceMatrix(raw: unknown): CustomerPriceMatrix {
  if (raw instanceof Map) {
    const m: CustomerPriceMatrix = new Map();
    for (const [dm, inner] of raw) {
      if (inner instanceof Map) {
        m.set(dm, new Map(inner));
        continue;
      }
      const innerMap = new Map<string, number>();
      if (inner && typeof inner === 'object') {
        for (const [nhom, val] of Object.entries(inner as Record<string, unknown>)) {
          const n = Number(val);
          if (Number.isFinite(n)) innerMap.set(nhom, n);
        }
      }
      if (innerMap.size > 0) m.set(dm, innerMap);
    }
    return m;
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const m: CustomerPriceMatrix = new Map();
    for (const [dm, inner] of Object.entries(raw as CustomerPriceMatrixStored)) {
      if (!inner || typeof inner !== 'object') continue;
      const innerMap = new Map<string, number>();
      for (const [nhom, val] of Object.entries(inner)) {
        const n = Number(val);
        if (Number.isFinite(n)) innerMap.set(nhom, n);
      }
      if (innerMap.size > 0) m.set(dm, innerMap);
    }
    return m;
  }
  return new Map();
}

/** Cột ma trận = loại hàng (danh mục HH cấp 2), sắp theo nhóm cha rồi thứ tự loại. */
export async function getProductGroupColumns(): Promise<ProductGroupColumn[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data: roots, error: rootsError } = await supabase
    .from('sx_danh_muc_hang_hoa')
    .select('id, thu_tu')
    .eq('cap_do', 1)
    .eq('trang_thai', 'Đang hoạt động')
    .order('thu_tu', { ascending: true });
  handleSupabaseError(rootsError);

  const rootOrder = new Map<string, number>();
  (roots ?? []).forEach((r, idx) => rootOrder.set(String(r.id), idx));

  const { data, error } = await supabase
    .from('sx_danh_muc_hang_hoa')
    .select('id, ten_danh_muc, ma_danh_muc, thu_tu, cha_id, trang_thai, cap_do')
    .eq('cap_do', 2)
    .eq('trang_thai', 'Đang hoạt động');
  handleSupabaseError(error);

  return (data ?? [])
    .map((r) => ({
      id: String(r.id),
      ten_hien_thi: String(r.ten_danh_muc).trim(),
      ma_danh_muc: r.ma_danh_muc,
      cha_id: r.cha_id != null ? String(r.cha_id) : null,
      thu_tu: r.thu_tu ?? 0,
    }))
    .sort((a, b) => {
      const oa = a.cha_id != null ? (rootOrder.get(a.cha_id) ?? 999) : 999;
      const ob = b.cha_id != null ? (rootOrder.get(b.cha_id) ?? 999) : 999;
      if (oa !== ob) return oa - ob;
      if (a.thu_tu !== b.thu_tu) return a.thu_tu - b.thu_tu;
      return a.ten_hien_thi.localeCompare(b.ten_hien_thi, 'vi');
    })
    .map(({ id, ten_hien_thi, ma_danh_muc }) => ({ id, ten_hien_thi, ma_danh_muc }));
}

export async function getAllCustomerPriceMatrix(): Promise<CustomerPriceMatrixStored> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_kh_he_so_gia_nhom_sp')
    .select('danh_muc_khach_hang_id, nhom_san_pham_id, he_so_gia');
  handleSupabaseError(error);

  const rows = (data ?? []).map((r) => ({
    danh_muc_khach_hang_id: Number(r.danh_muc_khach_hang_id),
    nhom_san_pham_id: Number(r.nhom_san_pham_id),
    he_so_gia: Number(r.he_so_gia),
  }));
  return serializePriceMatrix(buildPriceMatrix(rows));
}

export async function saveCustomerPriceRatio(
  danhMucKhachHangId: string,
  nhomSanPhamId: string,
  heSoGia: number | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const dmId = normId(danhMucKhachHangId);
  const nhomId = normId(nhomSanPhamId);
  if (dmId == null || nhomId == null) return;

  if (!shouldPersistHeSoGia(heSoGia)) {
    const { error } = await supabase
      .from('kd_kh_he_so_gia_nhom_sp')
      .delete()
      .eq('danh_muc_khach_hang_id', dmId)
      .eq('nhom_san_pham_id', nhomId);
    if (error) handleSupabaseError(error);
    return;
  }

  const { error } = await supabase.from('kd_kh_he_so_gia_nhom_sp').upsert(
    {
      danh_muc_khach_hang_id: dmId,
      nhom_san_pham_id: nhomId,
      he_so_gia: heSoGia!,
    },
    { onConflict: 'danh_muc_khach_hang_id,nhom_san_pham_id' },
  );
  if (error) handleSupabaseError(error);
}

export function getHeSoFromMatrix(
  matrix: CustomerPriceMatrix | CustomerPriceMatrixStored | unknown,
  danhMucKhachHangId: string,
  nhomSanPhamId: string,
): number {
  const m = ensurePriceMatrix(matrix);
  return m.get(danhMucKhachHangId)?.get(nhomSanPhamId) ?? DEFAULT_HE_SO_GIA;
}

export function setMatrixHeSo(
  matrix: CustomerPriceMatrix | CustomerPriceMatrixStored | unknown,
  danhMucKhachHangId: string,
  nhomSanPhamId: string,
  heSoGia: number | null,
): CustomerPriceMatrix {
  const next: CustomerPriceMatrix = new Map();
  for (const [dm, inner] of ensurePriceMatrix(matrix)) {
    next.set(dm, new Map(inner));
  }
  let inner = next.get(danhMucKhachHangId);
  if (!inner) {
    inner = new Map();
    next.set(danhMucKhachHangId, inner);
  }
  if (heSoGia == null || !shouldPersistHeSoGia(heSoGia)) {
    inner.delete(nhomSanPhamId);
    if (inner.size === 0) next.delete(danhMucKhachHangId);
  } else {
    inner.set(nhomSanPhamId, heSoGia);
  }
  return next;
}
