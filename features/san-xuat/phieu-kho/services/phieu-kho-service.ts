import type {
  WarehouseItem,
  WarehouseSlip,
  WarehouseSlipLine,
  WarehouseSlipLineRow,
  WarehouseSlipListItem,
} from '../core/types';
import type { WarehouseSlipFormValues, WarehouseSlipLineFormValues } from '../core/schema';
import type { LoaiPhieuKho, MucDichPhieuKho, TrangThaiPhieuKho } from '../core/constants';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import {
  WAREHOUSE_SELECT,
  WAREHOUSE_SLIP_SELECT_DETAIL,
  WAREHOUSE_SLIP_SELECT_LIST,
} from '../core/supabase-select';

type KhoJoin = { ma_kho: string; ten_kho: string } | { ma_kho: string; ten_kho: string }[] | null;
type CnJoin = { ten_chi_nhanh: string } | { ten_chi_nhanh: string }[] | null;
type DhJoin = { ma_don_hang: string } | { ma_don_hang: string }[] | null;
type DmJoin = { ma_don_mua: string } | { ma_don_mua: string }[] | null;
type NlJoin = { ma_nguyen_lieu: string; ten_nguyen_lieu: string } | null;
type CatJoin = { ma_danh_muc: string; ten_danh_muc: string } | null;

type ListRow = {
  id: number;
  ma_phieu_kho: string;
  loai_phieu: string;
  muc_dich: string;
  kho_id: number;
  kho_dich_id: number | null;
  ngay_phieu: string;
  chi_nhanh_id: number | null;
  nhan_vien_id: number | null;
  don_hang_id: number | null;
  don_mua_id: number | null;
  ghi_chu: string | null;
  trang_thai: string;
  da_post_ton: boolean;
  tg_tao: string;
  tg_cap_nhat: string;
  kho: KhoJoin;
  kho_dich: KhoJoin;
  chi_nhanh: CnJoin;
  don_hang: DhJoin;
  don_mua: DmJoin;
  lines?: { count: number }[] | { count: number } | null;
};

type LineRow = {
  id: number;
  phieu_kho_id: number;
  loai_hang: string;
  nguyen_lieu_id: number | null;
  danh_muc_id: number | null;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao: string;
  tg_cap_nhat: string;
  nguyen_lieu: NlJoin | NlJoin[];
  danh_muc: CatJoin | CatJoin[];
};

type DetailRow = ListRow & {
  lines?: LineRow[] | null;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function readLineCount(raw: ListRow): number {
  const lines = raw.lines;
  if (lines == null) return 0;
  const row = Array.isArray(lines) ? lines[0] : lines;
  return Number(row?.count ?? 0);
}

function normalizeLine(raw: LineRow): WarehouseSlipLine {
  const nl = pickOne(raw.nguyen_lieu);
  const cat = pickOne(raw.danh_muc);
  const isNl = raw.loai_hang === 'nguyen_lieu';
  return {
    id: String(raw.id),
    phieu_kho_id: String(raw.phieu_kho_id),
    loai_hang: raw.loai_hang as WarehouseSlipLine['loai_hang'],
    nguyen_lieu_id: raw.nguyen_lieu_id == null ? null : String(raw.nguyen_lieu_id),
    danh_muc_id: raw.danh_muc_id == null ? null : String(raw.danh_muc_id),
    ma_hang: isNl ? (nl?.ma_nguyen_lieu ?? '') : (cat?.ma_danh_muc ?? ''),
    ten_hang: isNl ? (nl?.ten_nguyen_lieu ?? '') : (cat?.ten_danh_muc ?? ''),
    so_luong: Number(raw.so_luong),
    don_vi_tinh: String(raw.don_vi_tinh ?? 'm'),
    ghi_chu: raw.ghi_chu,
    thu_tu: Number(raw.thu_tu),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

function normalizeSlip(raw: ListRow | DetailRow, lines?: WarehouseSlipLine[]): WarehouseSlip {
  const kho = pickOne(raw.kho);
  const khoDich = pickOne(raw.kho_dich);
  const cn = pickOne(raw.chi_nhanh);
  const dh = pickOne(raw.don_hang);
  const dm = pickOne(raw.don_mua);
  return {
    id: String(raw.id),
    ma_phieu_kho: String(raw.ma_phieu_kho).trim(),
    loai_phieu: raw.loai_phieu as LoaiPhieuKho,
    muc_dich: raw.muc_dich as MucDichPhieuKho,
    kho_id: String(raw.kho_id),
    ma_kho: kho?.ma_kho ?? '',
    ten_kho: kho?.ten_kho ?? '',
    kho_dich_id: raw.kho_dich_id == null ? null : String(raw.kho_dich_id),
    ma_kho_dich: khoDich?.ma_kho ?? null,
    ten_kho_dich: khoDich?.ten_kho ?? null,
    ngay_phieu: raw.ngay_phieu,
    chi_nhanh_id: raw.chi_nhanh_id == null ? null : String(raw.chi_nhanh_id),
    ten_chi_nhanh: cn?.ten_chi_nhanh ?? null,
    nhan_vien_id: raw.nhan_vien_id == null ? null : String(raw.nhan_vien_id),
    don_hang_id: raw.don_hang_id == null ? null : String(raw.don_hang_id),
    ma_don_hang: dh?.ma_don_hang ?? null,
    don_mua_id: raw.don_mua_id == null ? null : String(raw.don_mua_id),
    ma_don_mua: dm?.ma_don_mua ?? null,
    ghi_chu: raw.ghi_chu,
    trang_thai: raw.trang_thai as TrangThaiPhieuKho,
    da_post_ton: Boolean(raw.da_post_ton),
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
    lines,
  };
}

function formToRpcPayload(data: WarehouseSlipFormValues, id?: string) {
  return {
    header: {
      ...(id ? { id } : {}),
      ma_phieu_kho: data.ma_phieu_kho?.trim() || null,
      loai_phieu: data.loai_phieu,
      muc_dich: data.muc_dich,
      kho_id: data.kho_id,
      kho_dich_id: data.kho_dich_id || null,
      ngay_phieu: data.ngay_phieu,
      chi_nhanh_id: data.chi_nhanh_id || null,
      nhan_vien_id: data.nhan_vien_id || null,
      don_hang_id: data.don_hang_id || null,
      don_mua_id: data.don_mua_id || null,
      ghi_chu: data.ghi_chu || null,
      trang_thai: data.trang_thai,
    },
    lines: data.lines.map((ln, i) => ({
      loai_hang: ln.loai_hang,
      nguyen_lieu_id: ln.loai_hang === 'nguyen_lieu' ? ln.nguyen_lieu_id : null,
      danh_muc_id: ln.loai_hang === 'thanh_pham' ? ln.danh_muc_id : null,
      so_luong: ln.so_luong,
      don_vi_tinh: ln.don_vi_tinh || 'm',
      ghi_chu: ln.ghi_chu || null,
      thu_tu: ln.thu_tu ?? i + 1,
    })),
  };
}

export const getWarehouses = async (): Promise<WarehouseItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_danh_sach_kho')
    .select(WAREHOUSE_SELECT)
    .eq('trang_thai', 'Đang hoạt động')
    .order('thu_tu', { ascending: true })
    .order('ten_kho', { ascending: true });
  handleSupabaseError(error);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    ma_kho: String(row.ma_kho),
    ten_kho: String(row.ten_kho),
    chi_nhanh_id: row.chi_nhanh_id == null ? null : String(row.chi_nhanh_id),
    dia_chi: row.dia_chi,
    trang_thai: row.trang_thai,
  }));
};

export const getWarehouseSlips = async (): Promise<WarehouseSlipListItem[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_phieu_kho')
    .select(WAREHOUSE_SLIP_SELECT_LIST)
    .order('tg_cap_nhat', { ascending: false });
  handleSupabaseError(error);

  return (data ?? []).map((row) => ({
    ...normalizeSlip(row as ListRow),
    so_dong: readLineCount(row as ListRow),
  }));
};

export const getWarehouseSlipById = async (id: string): Promise<WarehouseSlip | null> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('sx_phieu_kho')
    .select(WAREHOUSE_SLIP_SELECT_DETAIL)
    .eq('id', Number(id))
    .maybeSingle();
  handleSupabaseError(error);
  if (!data) return null;

  const raw = data as DetailRow;
  const lines = (raw.lines ?? []).map((ln) => normalizeLine(ln as LineRow));
  lines.sort((a, b) => a.thu_tu - b.thu_tu || a.id.localeCompare(b.id));
  return normalizeSlip(raw, lines);
};

export const getWarehouseSlipLines = async (): Promise<WarehouseSlipLineRow[]> => {
  const slips = await getWarehouseSlips();
  const details = await Promise.all(slips.map((s) => getWarehouseSlipById(s.id)));
  const rows: WarehouseSlipLineRow[] = [];

  for (const slip of details) {
    if (!slip) continue;
    for (const line of slip.lines ?? []) {
      rows.push({
        id: line.id,
        phieu_kho_id: slip.id,
        ma_phieu_kho: slip.ma_phieu_kho,
        loai_phieu: slip.loai_phieu,
        muc_dich: slip.muc_dich,
        kho_id: slip.kho_id,
        ten_kho: slip.ten_kho,
        ngay_phieu: slip.ngay_phieu,
        trang_thai: slip.trang_thai,
        loai_hang: line.loai_hang,
        nguyen_lieu_id: line.nguyen_lieu_id,
        danh_muc_id: line.danh_muc_id,
        ma_hang: line.ma_hang,
        ten_hang: line.ten_hang,
        so_luong: line.so_luong,
        don_vi_tinh: line.don_vi_tinh,
        ghi_chu: line.ghi_chu,
        thu_tu: line.thu_tu,
        ma_don_hang: slip.ma_don_hang,
        tg_cap_nhat: line.tg_cap_nhat,
      });
    }
  }

  return rows.sort((a, b) => {
    const dateCmp = b.ngay_phieu.localeCompare(a.ngay_phieu);
    if (dateCmp !== 0) return dateCmp;
    return a.ma_phieu_kho.localeCompare(b.ma_phieu_kho, 'vi');
  });
};

export const upsertWarehouseSlip = async (
  data: WarehouseSlipFormValues,
  id?: string,
): Promise<WarehouseSlip> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const payload = formToRpcPayload(data, id);
  const { data: result, error } = await supabase.rpc('sx_upsert_phieu_kho', {
    p_header: payload.header,
    p_lines: payload.lines,
  });
  handleSupabaseError(error);

  const savedId = String((result as { id: number })?.id ?? id);
  const fresh = await getWarehouseSlipById(savedId);
  if (!fresh) throw new Error(txt('warehouseSlip.service.saveFailed'));
  return fresh;
};

export const cancelWarehouseSlip = async (id: string): Promise<WarehouseSlip> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase.rpc('sx_cancel_phieu_kho', {
    p_phieu_kho_id: Number(id),
  });
  handleSupabaseError(error);

  const fresh = await getWarehouseSlipById(id);
  if (!fresh) throw new Error(txt('warehouseSlip.service.notFound'));
  return fresh;
};

export const deleteWarehouseSlip = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase.from('sx_phieu_kho').delete().eq('id', Number(id));
  handleSupabaseError(error);
};

/** Gộp BOM tất cả dòng SP của lệnh SX — dùng prefill xuất sản xuất. */
export const getBomLinesForProductionOrder = async (
  donHangId: string,
): Promise<WarehouseSlipLineFormValues[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data: lineRows, error: lineErr } = await supabase
    .from('kd_don_hang_chi_tiet')
    .select('id')
    .eq('don_hang_id', Number(donHangId));
  handleSupabaseError(lineErr);

  const lineIds = (lineRows ?? []).map((r) => Number(r.id));
  if (lineIds.length === 0) return [];

  const { data: bomRows, error } = await supabase
    .from('kd_don_hang_chi_tiet_bom')
    .select(
      `
      nguyen_lieu_id,
      so_luong_tong,
      don_vi_tinh,
      sx_danh_sach_nguyen_lieu ( don_vi_tinh )
    `,
    )
    .in('don_hang_chi_tiet_id', lineIds);
  handleSupabaseError(error);

  const merged = new Map<string, { qty: number; unit: string }>();
  for (const row of bomRows ?? []) {
    const nlId = String(row.nguyen_lieu_id);
    const nl = pickOne(row.sx_danh_sach_nguyen_lieu as { don_vi_tinh: string } | null);
    const unit = String(row.don_vi_tinh ?? nl?.don_vi_tinh ?? 'm');
    const qty = Number(row.so_luong_tong);
    const prev = merged.get(nlId);
    merged.set(nlId, { qty: (prev?.qty ?? 0) + qty, unit: prev?.unit ?? unit });
  }

  return [...merged.entries()].map(([nguyen_lieu_id, v], i) => ({
    loai_hang: 'nguyen_lieu' as const,
    nguyen_lieu_id,
    danh_muc_id: null,
    so_luong: v.qty,
    don_vi_tinh: v.unit,
    ghi_chu: null,
    thu_tu: i + 1,
  }));
};

/**
 * Bulk query — tổng SL đã nhập theo (don_hang_id, danh_muc_id) cho TẤT CẢ đơn.
 * Key = `${don_hang_id}:${danh_muc_id}`.
 * Dùng cho tab "Chi tiết" Lệnh SX (nhiều đơn cùng lúc).
 */
export const getAllOrdersReceivedQty = async (): Promise<Map<string, number>> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data: slipRows, error: slipErr } = await supabase
    .from('sx_phieu_kho')
    .select('id, don_hang_id')
    .eq('loai_phieu', 'Nhập')
    .eq('muc_dich', 'Nhập sản xuất')
    .eq('trang_thai', 'Hoàn thành')
    .not('don_hang_id', 'is', null);
  handleSupabaseError(slipErr);

  const slipIds = (slipRows ?? []).map((r) => Number(r.id));
  const slipDonHangMap = new Map<number, string>(
    (slipRows ?? []).map((r) => [Number(r.id), String(r.don_hang_id)]),
  );
  if (slipIds.length === 0) return new Map();

  const { data: lineRows, error: lineErr } = await supabase
    .from('sx_phieu_kho_chi_tiet')
    .select('phieu_kho_id, danh_muc_id, so_luong')
    .in('phieu_kho_id', slipIds)
    .eq('loai_hang', 'thanh_pham');
  handleSupabaseError(lineErr);

  const result = new Map<string, number>();
  for (const row of lineRows ?? []) {
    const donHangId = slipDonHangMap.get(Number(row.phieu_kho_id));
    if (!donHangId || !row.danh_muc_id) continue;
    const key = `${donHangId}:${row.danh_muc_id}`;
    result.set(key, (result.get(key) ?? 0) + Number(row.so_luong));
  }
  return result;
};

/**
 * Tổng SL theo lệnh và SL đã nhập theo don_hang_id — cho cột tiến độ tổng ở danh sách đơn.
 * Key = don_hang_id. Trả về Map<don_hang_id, { lenh: number; nhap: number }>.
 */
export const getOrdersProgressSummary = async (): Promise<
  Map<string, { lenh: number; nhap: number }>
> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const [lenhRes, nhapRes] = await Promise.all([
    supabase.from('kd_don_hang_chi_tiet').select('don_hang_id, so_luong'),
    supabase
      .from('sx_phieu_kho')
      .select('id, don_hang_id')
      .eq('loai_phieu', 'Nhập')
      .eq('muc_dich', 'Nhập sản xuất')
      .eq('trang_thai', 'Hoàn thành')
      .not('don_hang_id', 'is', null),
  ]);
  handleSupabaseError(lenhRes.error);
  handleSupabaseError(nhapRes.error);

  const result = new Map<string, { lenh: number; nhap: number }>();

  for (const r of lenhRes.data ?? []) {
    const key = String(r.don_hang_id);
    const prev = result.get(key) ?? { lenh: 0, nhap: 0 };
    result.set(key, { ...prev, lenh: prev.lenh + Number(r.so_luong) });
  }

  const slipIds = (nhapRes.data ?? []).map((r) => Number(r.id));
  const slipDonHangMap = new Map<number, string>(
    (nhapRes.data ?? []).map((r) => [Number(r.id), String(r.don_hang_id)]),
  );

  if (slipIds.length > 0) {
    const { data: lineRows, error } = await supabase
      .from('sx_phieu_kho_chi_tiet')
      .select('phieu_kho_id, so_luong')
      .in('phieu_kho_id', slipIds)
      .eq('loai_hang', 'thanh_pham');
    handleSupabaseError(error);

    for (const row of lineRows ?? []) {
      const donHangId = slipDonHangMap.get(Number(row.phieu_kho_id));
      if (!donHangId) continue;
      const prev = result.get(donHangId) ?? { lenh: 0, nhap: 0 };
      result.set(donHangId, { ...prev, nhap: prev.nhap + Number(row.so_luong) });
    }
  }

  return result;
};

/** Dòng sản phẩm của lệnh SX (gộp theo danh_muc_id) — dùng bảng 4 cột SL khi Nhập sản xuất. */
export interface ProductionOrderProductLine {
  danh_muc_id: string;
  ma_danh_muc: string;
  ten_danh_muc: string;
  so_luong_lenh: number;
  don_vi_tinh: string;
}

export const getProductLinesForProductionOrder = async (
  donHangId: string,
): Promise<ProductionOrderProductLine[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  type CatJoin2 =
    | { ma_danh_muc: string; ten_danh_muc: string; don_vi_tinh: string | null }
    | null;

  const { data, error } = await supabase
    .from('kd_don_hang_chi_tiet')
    .select(
      `
      danh_muc_id,
      so_luong,
      don_vi_tinh,
      sx_danh_muc_hang_hoa (
        ma_danh_muc,
        ten_danh_muc
      )
    `,
    )
    .eq('don_hang_id', Number(donHangId))
    .order('thu_tu', { ascending: true });
  handleSupabaseError(error);

  const merged = new Map<
    string,
    { ma: string; ten: string; qty: number; unit: string }
  >();
  for (const row of data ?? []) {
    const id = String(row.danh_muc_id);
    const cat = pickOne(row.sx_danh_muc_hang_hoa as CatJoin2 | CatJoin2[]);
    const qty = Number(row.so_luong);
    const unit = String(row.don_vi_tinh ?? 'cái');
    const prev = merged.get(id);
    merged.set(id, {
      ma: cat?.ma_danh_muc ?? '',
      ten: cat?.ten_danh_muc ?? '',
      qty: (prev?.qty ?? 0) + qty,
      unit: prev?.unit ?? unit,
    });
  }

  return [...merged.entries()].map(([danh_muc_id, v]) => ({
    danh_muc_id,
    ma_danh_muc: v.ma,
    ten_danh_muc: v.ten,
    so_luong_lenh: v.qty,
    don_vi_tinh: v.unit,
  }));
};

/** Tổng SL đã nhập theo danh_muc_id từ các phiếu Nhập sản xuất Hoàn thành của cùng đơn. */
export const getReceivedQtyByProduct = async (
  donHangId: string,
  excludeSlipId?: string,
): Promise<Map<string, number>> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  let q = supabase
    .from('sx_phieu_kho')
    .select('id')
    .eq('don_hang_id', Number(donHangId))
    .eq('loai_phieu', 'Nhập')
    .eq('muc_dich', 'Nhập sản xuất')
    .eq('trang_thai', 'Hoàn thành');
  if (excludeSlipId) {
    q = q.neq('id', Number(excludeSlipId));
  }
  const { data: slipRows, error: slipErr } = await q;
  handleSupabaseError(slipErr);

  const slipIds = (slipRows ?? []).map((r) => Number(r.id));
  if (slipIds.length === 0) return new Map();

  const { data: lineRows, error: lineErr } = await supabase
    .from('sx_phieu_kho_chi_tiet')
    .select('danh_muc_id, so_luong')
    .in('phieu_kho_id', slipIds)
    .eq('loai_hang', 'thanh_pham');
  handleSupabaseError(lineErr);

  const result = new Map<string, number>();
  for (const row of lineRows ?? []) {
    const id = String(row.danh_muc_id);
    result.set(id, (result.get(id) ?? 0) + Number(row.so_luong));
  }
  return result;
};

export const getPurchaseLinesForImport = async (
  donMuaId: string,
): Promise<WarehouseSlipLineFormValues[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_mua_chi_tiet')
    .select('nguyen_lieu_id, so_luong, don_vi_tinh, thu_tu')
    .eq('don_mua_id', Number(donMuaId))
    .order('thu_tu', { ascending: true });
  handleSupabaseError(error);

  return (data ?? []).map((row, i) => ({
    loai_hang: 'nguyen_lieu' as const,
    nguyen_lieu_id: String(row.nguyen_lieu_id),
    danh_muc_id: null,
    so_luong: Number(row.so_luong),
    don_vi_tinh: String(row.don_vi_tinh ?? 'm'),
    ghi_chu: null,
    thu_tu: row.thu_tu ?? i + 1,
  }));
};
