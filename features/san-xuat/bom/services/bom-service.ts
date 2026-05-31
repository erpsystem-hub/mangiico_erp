import type { BomItem } from '../core/types';
import type { BomFormValues } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  BOM_RETURNING_FULL,
  BOM_RETURNING_STATUS_ONLY,
  BOM_SELECT_LIST,
} from '../core/supabase-select';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';

type ProductCategoryJoin = {
  ten_danh_muc: string;
  ma_danh_muc: string | null;
  cha_id: number | null;
};

type MaterialJoin = {
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  don_vi_tinh: string;
};

type BomListRow = {
  id: number;
  danh_muc_id: number;
  nguyen_lieu_id: number;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  trang_thai: string;
  tg_tao: string;
  tg_cap_nhat: string;
  sx_danh_muc_hang_hoa: ProductCategoryJoin | ProductCategoryJoin[] | null;
  sx_danh_sach_nguyen_lieu: MaterialJoin | MaterialJoin[] | null;
};

function buildCategoryNameMap(categories: ProductCategory[]): Map<string, string> {
  const m = new Map<string, string>();
  categories.forEach((c) => m.set(c.id, c.ten_danh_muc));
  return m;
}

function normalizeBomRow(raw: BomListRow, categoryNameById: Map<string, string>): BomItem {
  const dm = Array.isArray(raw.sx_danh_muc_hang_hoa)
    ? raw.sx_danh_muc_hang_hoa[0]
    : raw.sx_danh_muc_hang_hoa;
  const nl = Array.isArray(raw.sx_danh_sach_nguyen_lieu)
    ? raw.sx_danh_sach_nguyen_lieu[0]
    : raw.sx_danh_sach_nguyen_lieu;
  const chaId = dm?.cha_id != null ? String(dm.cha_id) : '';
  const tenNhom = chaId ? (categoryNameById.get(chaId) ?? '') : '';

  return {
    id: String(raw.id),
    danh_muc_id: String(raw.danh_muc_id),
    ma_danh_muc: dm?.ma_danh_muc ?? '',
    ten_danh_muc: dm?.ten_danh_muc ?? '',
    ten_nhom_danh_muc: tenNhom,
    nguyen_lieu_id: String(raw.nguyen_lieu_id),
    ma_nguyen_lieu: nl?.ma_nguyen_lieu ?? '',
    ten_nguyen_lieu: nl?.ten_nguyen_lieu ?? '',
    so_luong: Number(raw.so_luong),
    don_vi_tinh: String(raw.don_vi_tinh ?? nl?.don_vi_tinh ?? '').trim(),
    ghi_chu: raw.ghi_chu,
    thu_tu: raw.thu_tu,
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function formToPayload(data: BomFormValues) {
  return {
    danh_muc_id: Number(data.danh_muc_id),
    nguyen_lieu_id: Number(data.nguyen_lieu_id),
    so_luong: data.so_luong,
    don_vi_tinh: data.don_vi_tinh?.trim() ?? '',
    ghi_chu: data.ghi_chu?.trim() || null,
    thu_tu: data.thu_tu ?? 0,
    trang_thai: data.trang_thai,
  };
}

async function assertUniqueDmNl(
  danhMucId: string,
  nguyenLieuId: string,
  excludeId?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data, error } = await supabase
    .from('sx_bom')
    .select('id')
    .eq('danh_muc_id', Number(danhMucId))
    .eq('nguyen_lieu_id', Number(nguyenLieuId));
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    throw new Error(txt('bom.service.duplicatePair'));
  }
}

export const getBomItems = async (productCategories: ProductCategory[]): Promise<BomItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_bom')
    .select(BOM_SELECT_LIST)
    .order('tg_cap_nhat', { ascending: false });
  if (error) handleSupabaseError(error);

  const nameMap = buildCategoryNameMap(productCategories);
  return (data ?? []).map((row) => normalizeBomRow(row as unknown as BomListRow, nameMap));
};

export const getBomItemById = async (
  id: string,
  productCategories: ProductCategory[],
): Promise<BomItem | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_bom')
    .select(BOM_SELECT_LIST)
    .eq('id', Number(id))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return null;

  const nameMap = buildCategoryNameMap(productCategories);
  return normalizeBomRow(data as unknown as BomListRow, nameMap);
};

export const createBomItem = async (
  data: BomFormValues,
  productCategories: ProductCategory[],
): Promise<BomItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  await assertUniqueDmNl(data.danh_muc_id, data.nguyen_lieu_id);

  const now = new Date().toISOString();
  const { data: inserted, error } = await supabase
    .from('sx_bom')
    .insert({ ...formToPayload(data), tg_tao: now, tg_cap_nhat: now })
    .select(BOM_RETURNING_FULL)
    .single();
  if (error) handleSupabaseError(error);
  if (!inserted) throw new Error(txt('bom.service.createFetchFailed'));

  const full = await getBomItemById(String(inserted.id), productCategories);
  if (!full) throw new Error(txt('bom.service.createFetchFailed'));
  return full;
};

export const updateBomItem = async (
  id: string,
  data: BomFormValues,
  productCategories: ProductCategory[],
): Promise<BomItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  await assertUniqueDmNl(data.danh_muc_id, data.nguyen_lieu_id, id);

  const { error } = await supabase
    .from('sx_bom')
    .update({ ...formToPayload(data), tg_cap_nhat: new Date().toISOString() })
    .eq('id', Number(id));
  if (error) handleSupabaseError(error);

  const full = await getBomItemById(id, productCategories);
  if (!full) throw new Error(txt('bom.service.notFound'));
  return full;
};

export const updateBomStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
  productCategories: ProductCategory[],
): Promise<BomItem | undefined> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const now = new Date().toISOString();

  await Promise.all(
    ids.map((id) =>
      supabase.from('sx_bom').update({ trang_thai: status, tg_cap_nhat: now }).eq('id', Number(id)),
    ),
  );

  if (ids.length !== 1) return undefined;
  const { data, error } = await supabase
    .from('sx_bom')
    .select(BOM_RETURNING_STATUS_ONLY)
    .eq('id', Number(ids[0]))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return undefined;

  const full = await getBomItemById(String(data.id), productCategories);
  return full ?? undefined;
};

export const deleteBomItems = async (ids: string[]): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { error } = await supabase
    .from('sx_bom')
    .delete()
    .in('id', ids.map((id) => Number(id)));
  if (error) handleSupabaseError(error);
};
