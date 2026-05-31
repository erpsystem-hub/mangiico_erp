import type { PartnerCategory, PartnerKind, PartnerListItem } from '../core/types';
import type { PartnerListFormValues } from '../core/schema';
import {
  normalizeTrangThaiHoatDong,
  type TrangThaiHoatDong,
} from '@/lib/constants/trang-thai';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  PARTNER_LIST_RETURNING_FULL,
  PARTNER_LIST_RETURNING_STATUS_ONLY,
  PARTNER_LIST_SELECT_LIST,
} from '../core/supabase-select';

type CategoryJoin = {
  ten_danh_muc: string;
  ma_danh_muc: string | null;
  cha_id: number | null;
};

type ListRow = {
  id: number;
  loai_doi_tac: string;
  ma_doi_tac: string;
  ten_doi_tac: string;
  danh_muc_id: number;
  dien_thoai: string | null;
  email: string | null;
  dia_chi: string | null;
  ma_so_thue: string | null;
  nguoi_lien_he: string | null;
  mo_ta: string | null;
  trang_thai: string;
  tg_tao: string;
  tg_cap_nhat: string;
  kd_danh_muc_doi_tac: CategoryJoin | CategoryJoin[] | null;
};

function buildCategoryNameMap(categories: PartnerCategory[]): Map<string, string> {
  const m = new Map<string, string>();
  categories.forEach((c) => m.set(c.id, c.ten_danh_muc));
  return m;
}

function normalizeRow(raw: ListRow, categoryNameById: Map<string, string>): PartnerListItem {
  const dm = Array.isArray(raw.kd_danh_muc_doi_tac)
    ? raw.kd_danh_muc_doi_tac[0]
    : raw.kd_danh_muc_doi_tac;
  const danhMucId = String(raw.danh_muc_id);
  const chaId = dm?.cha_id != null ? String(dm.cha_id) : '';
  const tenNhom = chaId ? (categoryNameById.get(chaId) ?? '') : '';

  return {
    id: String(raw.id),
    loai_doi_tac: raw.loai_doi_tac as PartnerKind,
    ma_doi_tac: String(raw.ma_doi_tac).trim(),
    ten_doi_tac: String(raw.ten_doi_tac).trim(),
    danh_muc_id: danhMucId,
    ten_danh_muc: dm?.ten_danh_muc ?? '',
    ten_nhom_danh_muc: tenNhom,
    ma_danh_muc: dm?.ma_danh_muc ?? null,
    dien_thoai: raw.dien_thoai,
    email: raw.email,
    dia_chi: raw.dia_chi,
    ma_so_thue: raw.ma_so_thue,
    nguoi_lien_he: raw.nguoi_lien_he,
    mo_ta: raw.mo_ta,
    trang_thai: normalizeTrangThaiHoatDong(raw.trang_thai),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function formToPayload(kind: PartnerKind, data: PartnerListFormValues) {
  return {
    loai_doi_tac: kind,
    ma_doi_tac: data.ma_doi_tac.trim(),
    ten_doi_tac: data.ten_doi_tac.trim(),
    danh_muc_id: Number(data.danh_muc_id),
    dien_thoai: data.dien_thoai?.trim() || null,
    email: data.email?.trim() || null,
    dia_chi: data.dia_chi?.trim() || null,
    ma_so_thue: data.ma_so_thue?.trim() || null,
    nguoi_lien_he: data.nguoi_lien_he?.trim() || null,
    mo_ta: data.mo_ta?.trim() || null,
    trang_thai: data.trang_thai,
  };
}

async function assertUniqueMaDoiTac(
  kind: PartnerKind,
  ma: string,
  excludeId?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const key = ma.trim().toLowerCase();
  const { data, error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .select('id,ma_doi_tac')
    .eq('loai_doi_tac', kind);
  handleSupabaseError(error);
  for (const row of data ?? []) {
    if (excludeId && String(row.id) === excludeId) continue;
    if (String(row.ma_doi_tac).trim().toLowerCase() === key) {
      throw new Error(txt('partnerList.service.duplicateCode'));
    }
  }
}

export const getPartnerListItems = async (
  kind: PartnerKind,
  categories: PartnerCategory[],
): Promise<PartnerListItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .select(PARTNER_LIST_SELECT_LIST)
    .eq('loai_doi_tac', kind)
    .order('tg_cap_nhat', { ascending: false });
  if (error) handleSupabaseError(error);

  const nameMap = buildCategoryNameMap(categories);
  return (data ?? []).map((row) => normalizeRow(row as ListRow, nameMap));
};

export const getPartnerListItemById = async (
  kind: PartnerKind,
  id: string,
  categories: PartnerCategory[],
): Promise<PartnerListItem | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .select(PARTNER_LIST_SELECT_LIST)
    .eq('loai_doi_tac', kind)
    .eq('id', Number(id))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return null;

  const nameMap = buildCategoryNameMap(categories);
  return normalizeRow(data as ListRow, nameMap);
};

export const createPartnerListItem = async (
  kind: PartnerKind,
  data: PartnerListFormValues,
  categories: PartnerCategory[],
): Promise<PartnerListItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = formToPayload(kind, data);
  await assertUniqueMaDoiTac(kind, payload.ma_doi_tac);

  const now = new Date().toISOString();
  const { data: inserted, error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .insert({ ...payload, tg_tao: now, tg_cap_nhat: now })
    .select(PARTNER_LIST_RETURNING_FULL)
    .single();
  if (error) handleSupabaseError(error);
  if (!inserted) throw new Error(txt('partnerList.service.createFetchFailed'));

  const full = await getPartnerListItemById(kind, String(inserted.id), categories);
  if (!full) throw new Error(txt('partnerList.service.createFetchFailed'));
  return full;
};

export const updatePartnerListItem = async (
  kind: PartnerKind,
  id: string,
  data: PartnerListFormValues,
  categories: PartnerCategory[],
): Promise<PartnerListItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = formToPayload(kind, data);
  await assertUniqueMaDoiTac(kind, payload.ma_doi_tac, id);

  const { error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .update({ ...payload, tg_cap_nhat: new Date().toISOString() })
    .eq('loai_doi_tac', kind)
    .eq('id', Number(id));
  if (error) handleSupabaseError(error);

  const full = await getPartnerListItemById(kind, id, categories);
  if (!full) throw new Error(txt('partnerList.service.notFound'));
  return full;
};

export const updatePartnerListStatus = async (
  kind: PartnerKind,
  ids: string[],
  status: TrangThaiHoatDong,
): Promise<PartnerListItem | undefined> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const now = new Date().toISOString();

  await Promise.all(
    ids.map((id) =>
      supabase
        .from('kd_danh_sach_doi_tac')
        .update({ trang_thai: status, tg_cap_nhat: now })
        .eq('loai_doi_tac', kind)
        .eq('id', Number(id)),
    ),
  );

  if (ids.length !== 1) return undefined;
  const { data, error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .select(PARTNER_LIST_RETURNING_STATUS_ONLY)
    .eq('loai_doi_tac', kind)
    .eq('id', Number(ids[0]))
    .maybeSingle();
  if (error) handleSupabaseError(error);
  if (!data) return undefined;

  return {
    id: String(data.id),
    loai_doi_tac: kind,
    ma_doi_tac: String(data.ma_doi_tac),
    ten_doi_tac: String(data.ten_doi_tac),
    danh_muc_id: String(data.danh_muc_id),
    ten_danh_muc: '',
    ten_nhom_danh_muc: '',
    ma_danh_muc: null,
    dien_thoai: null,
    email: null,
    dia_chi: null,
    ma_so_thue: null,
    nguoi_lien_he: null,
    mo_ta: null,
    trang_thai: normalizeTrangThaiHoatDong(data.trang_thai),
    tg_tao: now,
    tg_cap_nhat: data.tg_cap_nhat,
  };
};

export const deletePartnerListItems = async (kind: PartnerKind, ids: string[]): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');
  const { error } = await supabase
    .from('kd_danh_sach_doi_tac')
    .delete()
    .eq('loai_doi_tac', kind)
    .in('id', ids.map((id) => Number(id)));
  if (error) handleSupabaseError(error);
};
