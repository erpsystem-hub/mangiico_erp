import type {
  SalesOrder,
  SalesOrderLine,
  SalesOrderLineAttributeValue,
  SalesOrderLineMeasurementValue,
} from '../core/types';
import type { SalesOrderFormValues } from '../core/schema';
import type { TrangThaiDonHang } from '../core/constants';
import { getSupabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  SALES_ORDER_SELECT_DETAIL,
  SALES_ORDER_SELECT_LIST,
} from '../core/supabase-select';

type KhJoin = { ma_doi_tac: string; ten_doi_tac: string } | { ma_doi_tac: string; ten_doi_tac: string }[] | null;
type CnJoin = { ten_chi_nhanh: string } | { ten_chi_nhanh: string }[] | null;
type DmJoin = {
  ma_danh_muc: string | null;
  ten_danh_muc: string;
  cha_id: number | null;
} | {
  ma_danh_muc: string | null;
  ten_danh_muc: string;
  cha_id: number | null;
}[] | null;

type AttrJoin = {
  thuoc_tinh_id: number;
  gia_tri: string;
  sx_thuoc_tinh_hang_hoa: { ten_hien_thi: string } | { ten_hien_thi: string }[] | null;
} | {
  thuoc_tinh_id: number;
  gia_tri: string;
  sx_thuoc_tinh_hang_hoa: { ten_hien_thi: string } | { ten_hien_thi: string }[] | null;
}[] | null;

type SpecJoin = {
  thong_so_do_id: number;
  gia_tri: number | null;
  sx_thong_so_do: { ten_hien_thi: string; don_vi: string } | { ten_hien_thi: string; don_vi: string }[] | null;
} | {
  thong_so_do_id: number;
  gia_tri: number | null;
  sx_thong_so_do: { ten_hien_thi: string; don_vi: string } | { ten_hien_thi: string; don_vi: string }[] | null;
}[] | null;

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
  danh_muc_id: number;
  so_luong: number;
  don_vi_tinh: string;
  don_gia: number;
  thanh_tien: number;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
  danh_muc: DmJoin;
  thuoc_tinh_values?: AttrJoin;
  thong_so_do_values?: SpecJoin;
};

type DetailRow = ListRow & {
  lines?: LineRow[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeAttrRows(raw: AttrJoin): SalesOrderLineAttributeValue[] {
  const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return rows.map((row) => {
    const master = pickOne(row.sx_thuoc_tinh_hang_hoa);
    return {
      thuoc_tinh_id: String(row.thuoc_tinh_id),
      ten_hien_thi: master?.ten_hien_thi ?? '',
      gia_tri: String(row.gia_tri ?? ''),
    };
  });
}

function normalizeSpecRows(raw: SpecJoin): SalesOrderLineMeasurementValue[] {
  const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return rows.map((row) => {
    const master = pickOne(row.sx_thong_so_do);
    return {
      thong_so_do_id: String(row.thong_so_do_id),
      ten_hien_thi: master?.ten_hien_thi ?? '',
      don_vi: master?.don_vi ?? '',
      gia_tri: row.gia_tri == null ? null : Number(row.gia_tri),
    };
  });
}

function normalizeLine(raw: LineRow, parentNames?: Map<number, string>): SalesOrderLine {
  const dm = pickOne(raw.danh_muc);
  const chaId = dm?.cha_id != null ? Number(dm.cha_id) : null;
  return {
    id: String(raw.id),
    don_hang_id: String(raw.don_hang_id),
    danh_muc_id: String(raw.danh_muc_id),
    ma_danh_muc: dm?.ma_danh_muc ?? '',
    ten_danh_muc: dm?.ten_danh_muc ?? '',
    ten_nhom_danh_muc: chaId != null ? (parentNames?.get(chaId) ?? '') : '',
    so_luong: Number(raw.so_luong),
    don_vi_tinh: String(raw.don_vi_tinh ?? 'cái'),
    don_gia: Number(raw.don_gia),
    thanh_tien: Number(raw.thanh_tien),
    ghi_chu: raw.ghi_chu,
    thu_tu: Number(raw.thu_tu),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
    thuoc_tinh_values: normalizeAttrRows(raw.thuoc_tinh_values ?? null),
    thong_so_do_values: normalizeSpecRows(raw.thong_so_do_values ?? null),
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
      danh_muc_id: ln.danh_muc_id,
      so_luong: ln.so_luong,
      don_vi_tinh: ln.don_vi_tinh || 'cái',
      don_gia: ln.don_gia,
      ghi_chu: ln.ghi_chu || null,
      thu_tu: ln.thu_tu ?? i + 1,
      thuoc_tinh_values: (ln.thuoc_tinh_values ?? []).map((v) => ({
        thuoc_tinh_id: v.thuoc_tinh_id,
        gia_tri: String(v.gia_tri ?? '').trim(),
      })),
      thong_so_do_values: (ln.thong_so_do_values ?? []).map((v) => ({
        thong_so_do_id: v.thong_so_do_id,
        gia_tri: v.gia_tri == null ? null : Number(v.gia_tri),
      })),
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

async function fetchCategoryParentNameMap(
  supabase: SupabaseClient,
  lineRows: LineRow[],
): Promise<Map<number, string>> {
  const chaIds = new Set<number>();
  for (const ln of lineRows) {
    const dm = pickOne(ln.danh_muc);
    if (dm?.cha_id != null) chaIds.add(Number(dm.cha_id));
  }
  if (chaIds.size === 0) return new Map();

  const { data, error } = await supabase
    .from('sx_danh_muc_hang_hoa')
    .select('id, ten_danh_muc')
    .in('id', [...chaIds]);
  handleSupabaseError(error);

  return new Map((data ?? []).map((r) => [Number(r.id), String(r.ten_danh_muc)]));
}

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

  const row = data as unknown as DetailRow;
  const lineRows = (row.lines ?? []) as LineRow[];
  const parentNames = await fetchCategoryParentNameMap(supabase, lineRows);
  const lines = lineRows
    .map((ln) => normalizeLine(ln, parentNames))
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

export const updateSalesOrderStatus = async (
  id: string,
  status: TrangThaiDonHang,
): Promise<SalesOrder> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase
    .from('kd_don_hang')
    .update({ trang_thai: status })
    .eq('id', Number(id));
  handleSupabaseError(error);

  const fresh = await getSalesOrderById(id);
  if (!fresh) throw new Error(txt('salesOrder.service.notFound'));
  return fresh;
};
