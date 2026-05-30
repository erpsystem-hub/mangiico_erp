import type { ProductCatalogItem } from '../core/types';
import type { ProductCatalogFormValues } from '../core/schema';
import { validateRequiredAttributeValues } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  PRODUCT_CATALOG_RETURNING_FULL,
  PRODUCT_CATALOG_RETURNING_STATUS_ONLY,
  PRODUCT_CATALOG_SELECT_LIST,
} from '../core/supabase-select';
import {
  getCategoryAttributeTemplate,
  replaceProductAttributeValues,
} from './san-pham-thuoc-tinh-service';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';

type CategoryJoin = {
  ten_danh_muc: string;
  ma_danh_muc: string | null;
  cha_id: number | null;
};

type ListRow = {
  id: number;
  ma_san_pham: string;
  ten_san_pham: string;
  danh_muc_id: number;
  mo_ta: string | null;
  trang_thai: string;
  tg_tao: string;
  tg_cap_nhat: string;
  sx_danh_muc_hang_hoa: CategoryJoin | CategoryJoin[] | null;
};

function normalizeRow(
  raw: ListRow,
  categoryNameById: Map<string, string>,
): ProductCatalogItem {
  const dm = Array.isArray(raw.sx_danh_muc_hang_hoa)
    ? raw.sx_danh_muc_hang_hoa[0]
    : raw.sx_danh_muc_hang_hoa;
  const danhMucId = String(raw.danh_muc_id);
  const chaId = dm?.cha_id != null ? String(dm.cha_id) : '';
  const tenNhom = chaId ? (categoryNameById.get(chaId) ?? '') : '';

  return {
    id: String(raw.id),
    ma_san_pham: String(raw.ma_san_pham).trim(),
    ten_san_pham: String(raw.ten_san_pham).trim(),
    danh_muc_id: danhMucId,
    ten_danh_muc: dm?.ten_danh_muc ?? '',
    ten_nhom_danh_muc: tenNhom,
    ma_danh_muc: dm?.ma_danh_muc ?? null,
    mo_ta: raw.mo_ta,
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function buildCategoryNameMap(categories: ProductCategory[]): Map<string, string> {
  const m = new Map<string, string>();
  categories.forEach((c) => m.set(c.id, c.ten_danh_muc));
  return m;
}

async function assertUniqueMaSanPham(ma: string, excludeId?: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const key = ma.trim().toLowerCase();
  const { data, error } = await supabase.from('sx_danh_sach_san_pham').select('id,ma_san_pham');
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ma_san_pham).trim().toLowerCase() === key) {
      throw new Error(txt('productCatalog.service.duplicateCode'));
    }
  }
}

export const getProductCatalogItems = async (
  categories: ProductCategory[],
): Promise<ProductCatalogItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_danh_sach_san_pham')
    .select(PRODUCT_CATALOG_SELECT_LIST)
    .order('tg_cap_nhat', { ascending: false });
  if (error) handleSupabaseError(error);

  const nameMap = buildCategoryNameMap(categories);
  return (data ?? []).map((row) => normalizeRow(row as ListRow, nameMap));
};

export const getProductCatalogItemById = async (
  id: string,
  categories: ProductCategory[],
): Promise<ProductCatalogItem | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_danh_sach_san_pham')
    .select(PRODUCT_CATALOG_SELECT_LIST)
    .eq('id', Number(id))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return null;

  const nameMap = buildCategoryNameMap(categories);
  return normalizeRow(data as ListRow, nameMap);
};

export const createProductCatalogItem = async (
  data: ProductCatalogFormValues,
  categories: ProductCategory[],
): Promise<ProductCatalogItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const ma = data.ma_san_pham.trim();
  await assertUniqueMaSanPham(ma);

  const template = await getCategoryAttributeTemplate(data.danh_muc_id);
  const attrErr = validateRequiredAttributeValues(template, data.thuoc_tinh_values);
  if (attrErr) throw new Error(attrErr);

  const now = new Date().toISOString();
  const { data: inserted, error } = await supabase
    .from('sx_danh_sach_san_pham')
    .insert({
      ma_san_pham: ma,
      ten_san_pham: data.ten_san_pham.trim(),
      danh_muc_id: Number(data.danh_muc_id),
      mo_ta: data.mo_ta?.trim() || null,
      trang_thai: data.trang_thai,
      tg_tao: now,
      tg_cap_nhat: now,
    })
    .select(PRODUCT_CATALOG_RETURNING_FULL)
    .single();
  if (error) handleSupabaseError(error);
  if (!inserted) throw new Error(txt('productCatalog.service.createFetchFailed'));

  const id = String(inserted.id);
  await replaceProductAttributeValues(id, data.danh_muc_id, data.thuoc_tinh_values, template);

  const full = await getProductCatalogItemById(id, categories);
  if (!full) throw new Error(txt('productCatalog.service.createFetchFailed'));
  return full;
};

export const updateProductCatalogItem = async (
  id: string,
  data: ProductCatalogFormValues,
  categories: ProductCategory[],
): Promise<ProductCatalogItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const ma = data.ma_san_pham.trim();
  await assertUniqueMaSanPham(ma, id);

  const template = await getCategoryAttributeTemplate(data.danh_muc_id);
  const attrErr = validateRequiredAttributeValues(template, data.thuoc_tinh_values);
  if (attrErr) throw new Error(attrErr);

  const { error } = await supabase
    .from('sx_danh_sach_san_pham')
    .update({
      ma_san_pham: ma,
      ten_san_pham: data.ten_san_pham.trim(),
      danh_muc_id: Number(data.danh_muc_id),
      mo_ta: data.mo_ta?.trim() || null,
      trang_thai: data.trang_thai,
      tg_cap_nhat: new Date().toISOString(),
    })
    .eq('id', Number(id));
  if (error) handleSupabaseError(error);

  await replaceProductAttributeValues(id, data.danh_muc_id, data.thuoc_tinh_values, template);

  const full = await getProductCatalogItemById(id, categories);
  if (!full) throw new Error(txt('productCatalog.service.notFound'));
  return full;
};

export const updateProductCatalogStatus = async (
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<ProductCatalogItem | undefined> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const now = new Date().toISOString();

  await Promise.all(
    ids.map((id) =>
      supabase
        .from('sx_danh_sach_san_pham')
        .update({ trang_thai: status, tg_cap_nhat: now })
        .eq('id', Number(id)),
    ),
  );

  if (ids.length !== 1) return undefined;
  const { data, error } = await supabase
    .from('sx_danh_sach_san_pham')
    .select(PRODUCT_CATALOG_RETURNING_STATUS_ONLY)
    .eq('id', Number(ids[0]))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return undefined;

  return {
    id: String(data.id),
    ma_san_pham: String(data.ma_san_pham),
    ten_san_pham: String(data.ten_san_pham),
    danh_muc_id: String(data.danh_muc_id),
    ten_danh_muc: '',
    ten_nhom_danh_muc: '',
    ma_danh_muc: null,
    mo_ta: null,
    trang_thai: normalizeTrangThaiHoatDong(data.trang_thai),
    tg_tao: now,
    tg_cap_nhat: data.tg_cap_nhat,
  };
};

export const deleteProductCatalogItems = async (ids: string[]): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { error } = await supabase
    .from('sx_danh_sach_san_pham')
    .delete()
    .in('id', ids.map((id) => Number(id)));
  if (error) handleSupabaseError(error);
};
