import type { OrderLineBomItem } from '../core/order-line-bom-types';
import type { OrderLineBomFormValues } from '../core/order-line-bom-schema';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  ORDER_LINE_BOM_RETURNING,
  ORDER_LINE_BOM_SELECT,
} from '../core/order-line-bom-select';

type MaterialJoin = {
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  don_vi_tinh: string;
} | {
  ma_nguyen_lieu: string;
  ten_nguyen_lieu: string;
  don_vi_tinh: string;
}[] | null;

type LineBomRow = {
  id: number;
  don_hang_chi_tiet_id: number;
  nguyen_lieu_id: number;
  bom_mau_id: number | null;
  so_luong_dinh_muc: number;
  so_luong_tong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
  sx_danh_sach_nguyen_lieu?: MaterialJoin;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeRow(raw: LineBomRow): OrderLineBomItem {
  const nl = pickOne(raw.sx_danh_sach_nguyen_lieu);
  return {
    id: String(raw.id),
    don_hang_chi_tiet_id: String(raw.don_hang_chi_tiet_id),
    nguyen_lieu_id: String(raw.nguyen_lieu_id),
    ma_nguyen_lieu: nl?.ma_nguyen_lieu ?? '',
    ten_nguyen_lieu: nl?.ten_nguyen_lieu ?? '',
    bom_mau_id: raw.bom_mau_id == null ? null : String(raw.bom_mau_id),
    so_luong_dinh_muc: Number(raw.so_luong_dinh_muc),
    so_luong_tong: Number(raw.so_luong_tong),
    don_vi_tinh: String(raw.don_vi_tinh ?? nl?.don_vi_tinh ?? '').trim(),
    ghi_chu: raw.ghi_chu,
    thu_tu: raw.thu_tu,
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function formToPayload(lineId: string, data: OrderLineBomFormValues, lineQty: number) {
  return {
    don_hang_chi_tiet_id: Number(lineId),
    nguyen_lieu_id: Number(data.nguyen_lieu_id),
    so_luong_dinh_muc: data.so_luong_dinh_muc,
    so_luong_tong: data.so_luong_dinh_muc * lineQty,
    don_vi_tinh: data.don_vi_tinh?.trim() ?? '',
    ghi_chu: data.ghi_chu?.trim() || null,
    thu_tu: data.thu_tu ?? 0,
  };
}

export const getOrderLineBom = async (lineId: string): Promise<OrderLineBomItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .select(ORDER_LINE_BOM_SELECT)
    .eq('don_hang_chi_tiet_id', Number(lineId))
    .order('thu_tu', { ascending: true })
    .order('id', { ascending: true });
  handleSupabaseError(error);

  return (data ?? []).map((row) => normalizeRow(row as LineBomRow));
};

export const getTemplateMaterialIdsForCategory = async (danhMucId: string): Promise<string[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_bom')
    .select('nguyen_lieu_id')
    .eq('danh_muc_id', Number(danhMucId))
    .eq('trang_thai', 'Đang hoạt động');
  handleSupabaseError(error);

  return (data ?? []).map((r) => String(r.nguyen_lieu_id));
};

export const generateOrderLineBomFromCategory = async (
  lineId: string,
  replace = false,
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase.rpc('kd_generate_don_hang_chi_tiet_bom', {
    p_don_hang_chi_tiet_id: Number(lineId),
    p_replace: replace,
  });
  handleSupabaseError(error);
};

export const createOrderLineBom = async (
  lineId: string,
  lineQty: number,
  data: OrderLineBomFormValues,
): Promise<OrderLineBomItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = formToPayload(lineId, data, lineQty);
  const { data: inserted, error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .insert(payload)
    .select(ORDER_LINE_BOM_RETURNING)
    .single();
  handleSupabaseError(error);
  if (!inserted) throw new Error(txt('productionOrder.lineBom.service.saveFailed'));

  const fresh = await getOrderLineBom(lineId);
  const item = fresh.find((r) => r.id === String(inserted.id));
  if (!item) throw new Error(txt('productionOrder.lineBom.service.notFound'));
  return item;
};

export const updateOrderLineBom = async (
  id: string,
  lineId: string,
  lineQty: number,
  data: OrderLineBomFormValues,
): Promise<OrderLineBomItem> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = {
    so_luong_dinh_muc: data.so_luong_dinh_muc,
    so_luong_tong: data.so_luong_dinh_muc * lineQty,
    don_vi_tinh: data.don_vi_tinh?.trim() ?? '',
    ghi_chu: data.ghi_chu?.trim() || null,
    thu_tu: data.thu_tu ?? 0,
  };

  const { error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .update(payload)
    .eq('id', Number(id))
    .eq('don_hang_chi_tiet_id', Number(lineId));
  handleSupabaseError(error);

  const fresh = await getOrderLineBom(lineId);
  const item = fresh.find((r) => r.id === id);
  if (!item) throw new Error(txt('productionOrder.lineBom.service.notFound'));
  return item;
};

export const deleteOrderLineBom = async (id: string, lineId: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .delete()
    .eq('id', Number(id))
    .eq('don_hang_chi_tiet_id', Number(lineId));
  handleSupabaseError(error);
};
