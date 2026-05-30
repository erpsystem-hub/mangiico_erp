import type { MaterialCatalogItem } from '../core/types';
import type { MaterialCatalogFormValues } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  MATERIAL_CATALOG_RETURNING_FULL,
  MATERIAL_CATALOG_RETURNING_STATUS_ONLY,
  MATERIAL_CATALOG_SELECT_LIST,
} from '../core/supabase-select';
import type { MaterialCategory } from '@/features/san-xuat/danh-muc-nguyen-lieu/core/types';

type CategoryJoin = {
  ten_danh_muc: string;
  ma_danh_muc: string | null;
  cha_id: number | null;
};

type ListRow = {
  id: number;
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  danh_muc_id: number;
  don_vi_tinh: string;
  mau_sac: string | null;
  thanh_phan: string | null;
  kho_vai: string | null;
  dinh_luong_gsm: number | null;
  xuat_xu: string | null;
  mo_ta: string | null;
  trang_thai: string;
  tg_tao: string;
  tg_cap_nhat: string;
  sx_danh_muc_nguyen_lieu: CategoryJoin | CategoryJoin[] | null;
};

function toGsmDb(v: number | null): number | null {
  if (v == null || Number.isNaN(v)) return null;
  return v;
}

function normalizeRow(
  raw: ListRow,
  categoryNameById: Map<string, string>,
): MaterialCatalogItem {
  const dm = Array.isArray(raw.sx_danh_muc_nguyen_lieu)
    ? raw.sx_danh_muc_nguyen_lieu[0]
    : raw.sx_danh_muc_nguyen_lieu;
  const danhMucId = String(raw.danh_muc_id);
  const chaId = dm?.cha_id != null ? String(dm.cha_id) : '';
  const tenNhom = chaId ? (categoryNameById.get(chaId) ?? '') : '';

  return {
    id: String(raw.id),
    ma_nguyen_lieu: String(raw.ma_nguyen_lieu).trim(),
    ten_nguyen_lieu: String(raw.ten_nguyen_lieu).trim(),
    danh_muc_id: danhMucId,
    ten_danh_muc: dm?.ten_danh_muc ?? '',
    ten_nhom_danh_muc: tenNhom,
    ma_danh_muc: dm?.ma_danh_muc ?? null,
    don_vi_tinh: String(raw.don_vi_tinh ?? '').trim(),
    mau_sac: raw.mau_sac,
    thanh_phan: raw.thanh_phan,
    kho_vai: raw.kho_vai,
    dinh_luong_gsm: raw.dinh_luong_gsm != null ? Number(raw.dinh_luong_gsm) : null,
    xuat_xu: raw.xuat_xu,
    mo_ta: raw.mo_ta,
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function buildCategoryNameMap(categories: MaterialCategory[]): Map<string, string> {
  const m = new Map<string, string>();
  categories.forEach((c) => m.set(c.id, c.ten_danh_muc));
  return m;
}

function formToPayload(data: MaterialCatalogFormValues) {
  return {
    ma_nguyen_lieu: data.ma_nguyen_lieu.trim(),
    ten_nguyen_lieu: data.ten_nguyen_lieu.trim(),
    danh_muc_id: Number(data.danh_muc_id),
    don_vi_tinh: data.don_vi_tinh?.trim() ?? '',
    mau_sac: data.mau_sac?.trim() || null,
    thanh_phan: data.thanh_phan?.trim() || null,
    kho_vai: data.kho_vai?.trim() || null,
    dinh_luong_gsm: toGsmDb(data.dinh_luong_gsm),
    xuat_xu: data.xuat_xu?.trim() || null,
    mo_ta: data.mo_ta?.trim() || null,
    trang_thai: data.trang_thai,
  };
}

async function assertUniqueMaNguyenLieu(ma: string, excludeId?: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const key = ma.trim().toLowerCase();
  const { data, error } = await supabase.from('sx_danh_sach_nguyen_lieu').select('id,ma_nguyen_lieu');
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ma_nguyen_lieu).trim().toLowerCase() === key) {
      throw new Error(txt('materialCatalog.service.duplicateCode'));
    }
  }
}

export const getMaterialCatalogItems = async (
  categories: MaterialCategory[],
): Promise<MaterialCatalogItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_danh_sach_nguyen_lieu')
    .select(MATERIAL_CATALOG_SELECT_LIST)
    .order('tg_cap_nhat', { ascending: false });
  if (error) handleSupabaseError(error);

  const nameMap = buildCategoryNameMap(categories);
  return (data ?? []).map((row) => normalizeRow(row as ListRow, nameMap));
};

export const getMaterialCatalogItemById = async (
  id: string,
  categories: MaterialCategory[],
): Promise<MaterialCatalogItem | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_danh_sach_nguyen_lieu')
    .select(MATERIAL_CATALOG_SELECT_LIST)
    .eq('id', Number(id))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return null;

  const nameMap = buildCategoryNameMap(categories);
  return normalizeRow(data as ListRow, nameMap);
};

export const createMaterialCatalogItem = async (
  data: MaterialCatalogFormValues,
  categories: MaterialCategory[],
): Promise<MaterialCatalogItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = formToPayload(data);
  await assertUniqueMaNguyenLieu(payload.ma_nguyen_lieu);

  const now = new Date().toISOString();
  const { data: inserted, error } = await supabase
    .from('sx_danh_sach_nguyen_lieu')
    .insert({ ...payload, tg_tao: now, tg_cap_nhat: now })
    .select(MATERIAL_CATALOG_RETURNING_FULL)
    .single();
  if (error) handleSupabaseError(error);
  if (!inserted) throw new Error(txt('materialCatalog.service.createFetchFailed'));

  const full = await getMaterialCatalogItemById(String(inserted.id), categories);
  if (!full) throw new Error(txt('materialCatalog.service.createFetchFailed'));
  return full;
};

export const updateMaterialCatalogItem = async (
  id: string,
  data: MaterialCatalogFormValues,
  categories: MaterialCategory[],
): Promise<MaterialCatalogItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = formToPayload(data);
  await assertUniqueMaNguyenLieu(payload.ma_nguyen_lieu, id);

  const { error } = await supabase
    .from('sx_danh_sach_nguyen_lieu')
    .update({ ...payload, tg_cap_nhat: new Date().toISOString() })
    .eq('id', Number(id));
  if (error) handleSupabaseError(error);

  const full = await getMaterialCatalogItemById(id, categories);
  if (!full) throw new Error(txt('materialCatalog.service.notFound'));
  return full;
};

export const updateMaterialCatalogStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<MaterialCatalogItem | undefined> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const now = new Date().toISOString();

  await Promise.all(
    ids.map((id) =>
      supabase
        .from('sx_danh_sach_nguyen_lieu')
        .update({ trang_thai: status, tg_cap_nhat: now })
        .eq('id', Number(id)),
    ),
  );

  if (ids.length !== 1) return undefined;
  const { data, error } = await supabase
    .from('sx_danh_sach_nguyen_lieu')
    .select(MATERIAL_CATALOG_RETURNING_STATUS_ONLY)
    .eq('id', Number(ids[0]))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return undefined;

  return {
    id: String(data.id),
    ma_nguyen_lieu: String(data.ma_nguyen_lieu),
    ten_nguyen_lieu: String(data.ten_nguyen_lieu),
    danh_muc_id: String(data.danh_muc_id),
    ten_danh_muc: '',
    ten_nhom_danh_muc: '',
    ma_danh_muc: null,
    don_vi_tinh: String(data.don_vi_tinh ?? ''),
    mau_sac: data.mau_sac,
    thanh_phan: null,
    kho_vai: null,
    dinh_luong_gsm: null,
    xuat_xu: null,
    mo_ta: null,
    trang_thai: normalizeTrangThaiHoatDong(data.trang_thai),
    tg_tao: now,
    tg_cap_nhat: data.tg_cap_nhat,
  };
};

export const deleteMaterialCatalogItems = async (ids: string[]): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { error } = await supabase
    .from('sx_danh_sach_nguyen_lieu')
    .delete()
    .in('id', ids.map((id) => Number(id)));
  if (error) handleSupabaseError(error);
};
