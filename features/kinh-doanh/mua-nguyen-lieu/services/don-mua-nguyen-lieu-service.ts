import type { PurchaseOrder, PurchaseOrderLine } from '../core/types';
import type { PurchaseOrderFormValues } from '../core/schema';
import type { TrangThaiDonMua } from '../core/constants';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  PURCHASE_ORDER_SELECT_DETAIL,
  PURCHASE_ORDER_SELECT_LIST,
} from '../core/supabase-select';

type NccJoin = { ma_doi_tac: string; ten_doi_tac: string } | { ma_doi_tac: string; ten_doi_tac: string }[] | null;
type CnJoin = { ten_chi_nhanh: string } | { ten_chi_nhanh: string }[] | null;
type NlJoin = { ma_nguyen_lieu: string; ten_nguyen_lieu: string } | { ma_nguyen_lieu: string; ten_nguyen_lieu: string }[] | null;

type ListRow = {
  id: number;
  ma_don_mua: string;
  nha_cung_cap_id: number;
  chi_nhanh_id: number | null;
  nhan_vien_id: number | null;
  ngay_dat: string;
  ngay_giao_du_kien: string | null;
  dia_chi_nhan: string | null;
  ghi_chu: string | null;
  trang_thai: string;
  tong_tien: number;
  tg_tao: string;
  tg_cap_nhat: string;
  nha_cung_cap: NccJoin;
  chi_nhanh: CnJoin;
};

type LineRow = {
  id: number;
  don_mua_id: number;
  nguyen_lieu_id: number;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  thanh_tien: number;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
  nguyen_lieu: NlJoin;
};

type DetailRow = ListRow & {
  lines?: LineRow[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeLine(raw: LineRow): PurchaseOrderLine {
  const nl = pickOne(raw.nguyen_lieu);
  return {
    id: String(raw.id),
    don_mua_id: String(raw.don_mua_id),
    nguyen_lieu_id: String(raw.nguyen_lieu_id),
    ma_nguyen_lieu: nl?.ma_nguyen_lieu ?? '',
    ten_nguyen_lieu: nl?.ten_nguyen_lieu ?? '',
    so_luong: Number(raw.so_luong),
    don_vi_tinh: String(raw.don_vi_tinh ?? 'm'),
    don_gia: Number(raw.don_gia),
    thanh_tien: Number(raw.thanh_tien),
    ghi_chu: raw.ghi_chu,
    thu_tu: Number(raw.thu_tu),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function normalizeOrder(raw: ListRow | DetailRow, lines?: PurchaseOrderLine[]): PurchaseOrder {
  const ncc = pickOne(raw.nha_cung_cap);
  const cn = pickOne(raw.chi_nhanh);
  return {
    id: String(raw.id),
    ma_don_mua: String(raw.ma_don_mua).trim(),
    nha_cung_cap_id: String(raw.nha_cung_cap_id),
    ma_nha_cung_cap: ncc?.ma_doi_tac ?? '',
    ten_nha_cung_cap: ncc?.ten_doi_tac ?? '',
    chi_nhanh_id: raw.chi_nhanh_id == null ? null : String(raw.chi_nhanh_id),
    ten_chi_nhanh: cn?.ten_chi_nhanh ?? null,
    nhan_vien_id: raw.nhan_vien_id == null ? null : String(raw.nhan_vien_id),
    ngay_dat: raw.ngay_dat,
    ngay_giao_du_kien: raw.ngay_giao_du_kien,
    dia_chi_nhan: raw.dia_chi_nhan,
    ghi_chu: raw.ghi_chu,
    trang_thai: raw.trang_thai as TrangThaiDonMua,
    tong_tien: Number(raw.tong_tien),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
    lines,
  };
}

function formToRpcPayload(data: PurchaseOrderFormValues, id?: string) {
  return {
    header: {
      ...(id ? { id } : {}),
      ma_don_mua: data.ma_don_mua?.trim() || null,
      nha_cung_cap_id: data.nha_cung_cap_id,
      chi_nhanh_id: data.chi_nhanh_id || null,
      nhan_vien_id: data.nhan_vien_id || null,
      ngay_dat: data.ngay_dat,
      ngay_giao_du_kien: data.ngay_giao_du_kien || null,
      dia_chi_nhan: data.dia_chi_nhan || null,
      ghi_chu: data.ghi_chu || null,
      trang_thai: data.trang_thai,
    },
    lines: data.lines.map((ln, i) => ({
      nguyen_lieu_id: ln.nguyen_lieu_id,
      so_luong: ln.so_luong,
      don_vi_tinh: ln.don_vi_tinh || 'm',
      don_gia: ln.don_gia,
      ghi_chu: ln.ghi_chu || null,
      thu_tu: ln.thu_tu ?? i + 1,
    })),
  };
}

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_mua')
    .select(PURCHASE_ORDER_SELECT_LIST)
    .order('tg_cap_nhat', { ascending: false });
  handleSupabaseError(error);

  return (data ?? []).map((row) => normalizeOrder(row as ListRow));
};

export const getPurchaseOrdersByNhaCungCap = async (
  nhaCungCapId: string,
  limit = 5,
): Promise<PurchaseOrder[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_mua')
    .select(PURCHASE_ORDER_SELECT_LIST)
    .eq('nha_cung_cap_id', Number(nhaCungCapId))
    .order('tg_cap_nhat', { ascending: false })
    .limit(limit);
  handleSupabaseError(error);

  return (data ?? []).map((row) => normalizeOrder(row as ListRow));
};

export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_mua')
    .select(PURCHASE_ORDER_SELECT_DETAIL)
    .eq('id', Number(id))
    .maybeSingle();
  handleSupabaseError(error);
  if (!data) return null;

  const row = data as DetailRow;
  const lineRows = row.lines ?? [];
  const lines = lineRows
    .map((ln) => normalizeLine(ln as LineRow))
    .sort((a, b) => a.thu_tu - b.thu_tu);
  return normalizeOrder(row, lines);
};

export const upsertPurchaseOrder = async (
  data: PurchaseOrderFormValues,
  id?: string,
): Promise<PurchaseOrder> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { header, lines } = formToRpcPayload(data, id);
  const { data: rpcData, error } = await supabase.rpc('kd_upsert_don_mua', {
    p_header: header,
    p_lines: lines,
  });
  handleSupabaseError(error);

  const result = rpcData as { id?: number; ma_don_mua?: string } | null;
  const newId = result?.id != null ? String(result.id) : id;
  if (!newId) throw new Error(txt('purchaseOrder.service.saveFailed'));

  const fresh = await getPurchaseOrderById(newId);
  if (!fresh) throw new Error(txt('purchaseOrder.service.notFound'));
  return fresh;
};

export const deletePurchaseOrder = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase.from('kd_don_mua').delete().eq('id', Number(id));
  handleSupabaseError(error);
};

export const updatePurchaseOrderStatus = async (
  id: string,
  status: TrangThaiDonMua,
): Promise<PurchaseOrder> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase
    .from('kd_don_mua')
    .update({ trang_thai: status })
    .eq('id', Number(id));
  handleSupabaseError(error);

  const fresh = await getPurchaseOrderById(id);
  if (!fresh) throw new Error(txt('purchaseOrder.service.notFound'));
  return fresh;
};
