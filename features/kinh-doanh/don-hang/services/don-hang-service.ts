import type { SalesOrder, SalesOrderLine } from '../core/types';
import type { SalesOrderFormValues } from '../core/schema';
import type { TrangThaiDonHang } from '../core/constants';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  SALES_ORDER_SELECT_DETAIL,
  SALES_ORDER_SELECT_LIST,
} from '../core/supabase-select';

type KhJoin = { ma_doi_tac: string; ten_doi_tac: string } | { ma_doi_tac: string; ten_doi_tac: string }[] | null;
type CnJoin = { ten_chi_nhanh: string } | { ten_chi_nhanh: string }[] | null;
type SpJoin = { ma_san_pham: string; ten_san_pham: string } | { ma_san_pham: string; ten_san_pham: string }[] | null;

type ListRow = {
  id: number;
  ma_don_hang: string;
  khach_hang_id: number;
  chi_nhanh_id: number | null;
  nhan_vien_id: number | null;
  ngay_dat: string;
  ngay_giao_du_kien: string | null;
  dia_chi_giao: string | null;
  ghi_chu: string | null;
  trang_thai: string;
  tong_tien: number;
  tg_tao: string;
  tg_cap_nhat: string;
  khach_hang: KhJoin;
  chi_nhanh: CnJoin;
};

type LineRow = {
  id: number;
  don_hang_id: number;
  san_pham_id: number;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  thanh_tien: number;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
  san_pham: SpJoin;
};

type DetailRow = ListRow & {
  lines?: LineRow[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeLine(raw: LineRow): SalesOrderLine {
  const sp = pickOne(raw.san_pham);
  return {
    id: String(raw.id),
    don_hang_id: String(raw.don_hang_id),
    san_pham_id: String(raw.san_pham_id),
    ma_san_pham: sp?.ma_san_pham ?? '',
    ten_san_pham: sp?.ten_san_pham ?? '',
    so_luong: Number(raw.so_luong),
    don_vi_tinh: String(raw.don_vi_tinh ?? 'cái'),
    don_gia: Number(raw.don_gia),
    thanh_tien: Number(raw.thanh_tien),
    ghi_chu: raw.ghi_chu,
    thu_tu: Number(raw.thu_tu),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function normalizeOrder(raw: ListRow | DetailRow, lines?: SalesOrderLine[]): SalesOrder {
  const kh = pickOne(raw.khach_hang);
  const cn = pickOne(raw.chi_nhanh);
  return {
    id: String(raw.id),
    ma_don_hang: String(raw.ma_don_hang).trim(),
    khach_hang_id: String(raw.khach_hang_id),
    ma_khach_hang: kh?.ma_doi_tac ?? '',
    ten_khach_hang: kh?.ten_doi_tac ?? '',
    chi_nhanh_id: raw.chi_nhanh_id == null ? null : String(raw.chi_nhanh_id),
    ten_chi_nhanh: cn?.ten_chi_nhanh ?? null,
    nhan_vien_id: raw.nhan_vien_id == null ? null : String(raw.nhan_vien_id),
    ngay_dat: raw.ngay_dat,
    ngay_giao_du_kien: raw.ngay_giao_du_kien,
    dia_chi_giao: raw.dia_chi_giao,
    ghi_chu: raw.ghi_chu,
    trang_thai: raw.trang_thai as TrangThaiDonHang,
    tong_tien: Number(raw.tong_tien),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
    lines,
  };
}

function formToRpcPayload(data: SalesOrderFormValues, id?: string) {
  return {
    header: {
      ...(id ? { id } : {}),
      ma_don_hang: data.ma_don_hang?.trim() || null,
      khach_hang_id: data.khach_hang_id,
      chi_nhanh_id: data.chi_nhanh_id || null,
      nhan_vien_id: data.nhan_vien_id || null,
      ngay_dat: data.ngay_dat,
      ngay_giao_du_kien: data.ngay_giao_du_kien || null,
      dia_chi_giao: data.dia_chi_giao || null,
      ghi_chu: data.ghi_chu || null,
      trang_thai: data.trang_thai,
    },
    lines: data.lines.map((ln, i) => ({
      san_pham_id: ln.san_pham_id,
      so_luong: ln.so_luong,
      don_vi_tinh: ln.don_vi_tinh || 'cái',
      don_gia: ln.don_gia,
      ghi_chu: ln.ghi_chu || null,
      thu_tu: ln.thu_tu ?? i + 1,
    })),
  };
}

export const getSalesOrders = async (): Promise<SalesOrder[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_hang')
    .select(SALES_ORDER_SELECT_LIST)
    .order('tg_cap_nhat', { ascending: false });
  handleSupabaseError(error);

  return (data ?? []).map((row) => normalizeOrder(row as ListRow));
};

export const getSalesOrdersByKhachHang = async (
  khachHangId: string,
  limit = 5,
): Promise<SalesOrder[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_hang')
    .select(SALES_ORDER_SELECT_LIST)
    .eq('khach_hang_id', Number(khachHangId))
    .order('tg_cap_nhat', { ascending: false })
    .limit(limit);
  handleSupabaseError(error);

  return (data ?? []).map((row) => normalizeOrder(row as ListRow));
};

export const getSalesOrderById = async (id: string): Promise<SalesOrder | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_hang')
    .select(SALES_ORDER_SELECT_DETAIL)
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

export const upsertSalesOrder = async (
  data: SalesOrderFormValues,
  id?: string,
): Promise<SalesOrder> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { header, lines } = formToRpcPayload(data, id);
  const { data: rpcData, error } = await supabase.rpc('kd_upsert_don_hang', {
    p_header: header,
    p_lines: lines,
  });
  handleSupabaseError(error);

  const result = rpcData as { id?: number; ma_don_hang?: string } | null;
  const newId = result?.id != null ? String(result.id) : id;
  if (!newId) throw new Error(txt('salesOrder.service.saveFailed'));

  const fresh = await getSalesOrderById(newId);
  if (!fresh) throw new Error(txt('salesOrder.service.notFound'));
  return fresh;
};

export const deleteSalesOrder = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase.from('kd_don_hang').delete().eq('id', Number(id));
  handleSupabaseError(error);
};
