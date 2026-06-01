import type { OrderLineBomItem, ProductionOrderBomRow } from '../core/order-line-bom-types';
import type { OrderLineBomFormValues } from '../core/order-line-bom-schema';
import { TRANG_THAI_LENH_SX } from '../core/constants';
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

/** Tất cả BOM phẳng của lệnh SX — cho tab BOM. */
export const getAllOrdersBomFlat = async (): Promise<ProductionOrderBomRow[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  type NlJoin = { ma_nguyen_lieu: string; ten_nguyen_lieu: string } | null;
  type DmJoin = { ma_danh_muc: string; ten_danh_muc: string } | null;
  type KhJoin = { ten_doi_tac: string } | null;
  type DhJoin = {
    id: number;
    ma_don_hang: string;
    trang_thai: string;
    ngay_dat: string;
    ngay_giao_du_kien: string | null;
    khach_hang: KhJoin | KhJoin[] | null;
  } | null;
  type ChiJoin = {
    id: number;
    danh_muc_id: number;
    don_hang_id: number;
    so_luong: number;
    sx_danh_muc_hang_hoa: DmJoin | DmJoin[];
    kd_don_hang: DhJoin | DhJoin[];
  } | null;
  type BomRow = {
    id: number;
    don_hang_chi_tiet_id: number;
    nguyen_lieu_id: number;
    so_luong_dinh_muc: number;
    so_luong_tong: number;
    don_vi_tinh: string;
    sx_danh_sach_nguyen_lieu: NlJoin | NlJoin[];
    kd_don_hang_chi_tiet: ChiJoin | ChiJoin[];
  };

  const { data, error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .select(`
      id, don_hang_chi_tiet_id, nguyen_lieu_id, so_luong_dinh_muc, so_luong_tong, don_vi_tinh,
      sx_danh_sach_nguyen_lieu ( ma_nguyen_lieu, ten_nguyen_lieu ),
      kd_don_hang_chi_tiet (
        id, danh_muc_id, don_hang_id, so_luong,
        sx_danh_muc_hang_hoa ( ma_danh_muc, ten_danh_muc ),
        kd_don_hang (
          id, ma_don_hang, trang_thai, ngay_dat, ngay_giao_du_kien,
          khach_hang:kd_danh_sach_doi_tac!kd_don_hang_khach_hang_id_fkey ( ten_doi_tac )
        )
      )
    `);
  handleSupabaseError(error);

  const prodStatuses = new Set<string>(TRANG_THAI_LENH_SX);
  const rows: ProductionOrderBomRow[] = [];

  for (const raw of (data ?? []) as BomRow[]) {
    const chi = Array.isArray(raw.kd_don_hang_chi_tiet)
      ? raw.kd_don_hang_chi_tiet[0]
      : raw.kd_don_hang_chi_tiet;
    if (!chi) continue;

    const dh = Array.isArray(chi.kd_don_hang) ? chi.kd_don_hang[0] : chi.kd_don_hang;
    if (!dh || !prodStatuses.has(dh.trang_thai)) continue;

    const kh = Array.isArray(dh.khach_hang) ? dh.khach_hang[0] : dh.khach_hang;
    const dm = Array.isArray(chi.sx_danh_muc_hang_hoa)
      ? chi.sx_danh_muc_hang_hoa[0]
      : chi.sx_danh_muc_hang_hoa;
    const nl = Array.isArray(raw.sx_danh_sach_nguyen_lieu)
      ? raw.sx_danh_sach_nguyen_lieu[0]
      : raw.sx_danh_sach_nguyen_lieu;

    rows.push({
      id: String(raw.id),
      don_hang_chi_tiet_id: String(raw.don_hang_chi_tiet_id),
      don_hang_id: String(chi.don_hang_id),
      ma_don_hang: String(dh.ma_don_hang),
      ten_khach_hang: kh?.ten_doi_tac ?? '',
      ngay_dat: dh.ngay_dat,
      ngay_giao_du_kien: dh.ngay_giao_du_kien,
      danh_muc_id: String(chi.danh_muc_id),
      ma_danh_muc: dm?.ma_danh_muc ?? '',
      ten_danh_muc: dm?.ten_danh_muc ?? '',
      ten_nhom_danh_muc: '',
      sl_san_pham: Number(chi.so_luong),
      nguyen_lieu_id: String(raw.nguyen_lieu_id),
      ma_nguyen_lieu: nl?.ma_nguyen_lieu ?? '',
      ten_nguyen_lieu: nl?.ten_nguyen_lieu ?? '',
      so_luong_dinh_muc: Number(raw.so_luong_dinh_muc),
      so_luong_tong: Number(raw.so_luong_tong),
      don_vi_tinh: String(raw.don_vi_tinh ?? ''),
    });
  }

  return rows.sort((a, b) => {
    const d = b.ngay_dat.localeCompare(a.ngay_dat);
    if (d !== 0) return d;
    const o = a.ma_don_hang.localeCompare(b.ma_don_hang, 'vi');
    if (o !== 0) return o;
    return a.ten_danh_muc.localeCompare(b.ten_danh_muc, 'vi');
  });
};

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

/** BOM của nhiều dòng SP (dùng trong detail lệnh SX). */
export const getOrderLineBomForLines = async (lineIds: string[]): Promise<OrderLineBomItem[]> => {
  if (lineIds.length === 0) return [];

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .select(ORDER_LINE_BOM_SELECT)
    .in(
      'don_hang_chi_tiet_id',
      lineIds.map((id) => Number(id)),
    )
    .order('don_hang_chi_tiet_id', { ascending: true })
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
