import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { getCategoryAttributeLinks } from '@/features/san-xuat/danh-muc-hang-hoa/services/danh-muc-hang-hoa-links-service';
import type { CategoryAttributeLink } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import type { ProductAttributeValue } from '../core/types';
import { PRODUCT_ATTRIBUTE_VALUE_SELECT } from '../core/supabase-select';

function normId(v: string): number | null {
  const s = String(v).trim();
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

export async function getCategoryAttributeTemplate(
  danhMucId: string,
): Promise<CategoryAttributeLink[]> {
  return getCategoryAttributeLinks(danhMucId);
}

async function getDanhMucIdForSanPham(sanPhamId: string): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) return '';
  const spId = normId(sanPhamId);
  if (spId == null) return '';
  const { data, error } = await supabase
    .from('sx_danh_sach_san_pham')
    .select('danh_muc_id')
    .eq('id', spId)
    .maybeSingle();
  if (error) handleSupabaseError(error);
  return data ? String(data.danh_muc_id) : '';
}

export async function getProductAttributeValues(
  sanPhamId: string,
): Promise<ProductAttributeValue[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const spId = normId(sanPhamId);
  if (spId == null) return [];

  const danhMucId = await getDanhMucIdForSanPham(sanPhamId);
  const template = danhMucId ? await getCategoryAttributeLinks(danhMucId) : [];

  const { data, error } = await supabase
    .from('sx_san_pham_thuoc_tinh')
    .select(PRODUCT_ATTRIBUTE_VALUE_SELECT)
    .eq('san_pham_id', spId);
  if (error) handleSupabaseError(error);

  const valueByAttr = new Map<string, string>();
  for (const row of data ?? []) {
    valueByAttr.set(String(row.thuoc_tinh_id), String(row.gia_tri ?? ''));
  }

  return template.map((t) => ({
    thuoc_tinh_id: t.thuoc_tinh_id,
    ten_hien_thi: t.ten_hien_thi,
    gia_tri: valueByAttr.get(t.thuoc_tinh_id) ?? '',
    bat_buoc: t.bat_buoc,
    thu_tu: t.thu_tu,
  }));
}

export async function replaceProductAttributeValues(
  sanPhamId: string,
  danhMucId: string,
  rows: { thuoc_tinh_id: string; gia_tri: string }[],
  template: CategoryAttributeLink[],
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const spId = normId(sanPhamId);
  if (spId == null) return;

  const allowed = new Set(template.map((t) => t.thuoc_tinh_id));
  const payload = rows
    .filter((r) => allowed.has(r.thuoc_tinh_id))
    .map((r) => {
      const tid = normId(r.thuoc_tinh_id);
      if (tid == null) throw new Error(`Invalid thuoc_tinh_id: ${r.thuoc_tinh_id}`);
      return {
        san_pham_id: spId,
        thuoc_tinh_id: tid,
        gia_tri: String(r.gia_tri ?? '').trim(),
      };
    });

  const { error: delErr } = await supabase
    .from('sx_san_pham_thuoc_tinh')
    .delete()
    .eq('san_pham_id', spId);
  if (delErr) handleSupabaseError(delErr);

  if (payload.length === 0) return;

  const { error } = await supabase.from('sx_san_pham_thuoc_tinh').insert(payload);
  if (error) handleSupabaseError(error);

  void danhMucId;
}

export function mergeAttributeValuesWithTemplate(
  template: CategoryAttributeLink[],
  existing: ProductAttributeValue[],
): { thuoc_tinh_id: string; gia_tri: string }[] {
  const existingById = new Map(existing.map((e) => [e.thuoc_tinh_id, e.gia_tri]));
  return template.map((t) => ({
    thuoc_tinh_id: t.thuoc_tinh_id,
    gia_tri: existingById.get(t.thuoc_tinh_id) ?? '',
  }));
}

export function buildEmptyAttributeValues(
  template: CategoryAttributeLink[],
): { thuoc_tinh_id: string; gia_tri: string }[] {
  return template.map((t) => ({ thuoc_tinh_id: t.thuoc_tinh_id, gia_tri: '' }));
}
