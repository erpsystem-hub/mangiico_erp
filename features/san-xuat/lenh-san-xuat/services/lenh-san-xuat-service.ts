import type { SalesOrder } from '@/features/kinh-doanh/don-hang/core/types';
import type { TrangThaiDonHang } from '@/features/kinh-doanh/don-hang/core/constants';
import { getSalesOrderById } from '@/features/kinh-doanh/don-hang/services/don-hang-service';
import { getSupabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/supabase/errors';
import { txt } from '@/lib/text';
import { PRODUCTION_ORDER_SELECT_LIST } from '../core/supabase-select';
import { isProductionOrderStatus, TRANG_THAI_LENH_SX, type TrangThaiLenhSx } from '../core/constants';
import type { ProductionOrderLineRow } from '../core/types';

type KhJoin = { ma_doi_tac: string; ten_doi_tac: string } | { ma_doi_tac: string; ten_doi_tac: string }[] | null;
type CnJoin = { ten_chi_nhanh: string } | { ten_chi_nhanh: string }[] | null;

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
  tg_tao: string;
  tg_cap_nhat: string;
  khach_hang: KhJoin;
  chi_nhanh: CnJoin;
};

function pickOne<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function normalizeOrder(raw: ListRow): SalesOrder {
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
    tong_tien: 0,
    tg_tao: raw.tg_tao,
    tg_cap_nhat: raw.tg_cap_nhat,
  };
}

export const getProductionOrders = async (): Promise<SalesOrder[]> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { data, error } = await supabase
    .from('kd_don_hang')
    .select(PRODUCTION_ORDER_SELECT_LIST)
    .in('trang_thai', [...TRANG_THAI_LENH_SX])
    .order('tg_cap_nhat', { ascending: false });
  handleSupabaseError(error);

  return (data ?? []).map((row) => normalizeOrder(row as ListRow));
};

/** Detail tái sử dụng service đơn hàng (đã verify embed dòng) — UI không hiển thị giá. */
export const getProductionOrderById = async (id: string): Promise<SalesOrder | null> => {
  const order = await getSalesOrderById(id);
  if (!order || !isProductionOrderStatus(order.trang_thai)) return null;
  return order;
};

/** Tất cả dòng sản phẩm của lệnh SX (phẳng, kèm thông tin đơn). */
export const getProductionOrderLines = async (): Promise<ProductionOrderLineRow[]> => {
  const orders = await getProductionOrders();
  const details = await Promise.all(orders.map((o) => getProductionOrderById(o.id)));
  const rows: ProductionOrderLineRow[] = [];

  for (const order of details) {
    if (!order) continue;
    for (const line of order.lines ?? []) {
      rows.push({
        id: line.id,
        don_hang_id: line.don_hang_id,
        danh_muc_id: line.danh_muc_id,
        ma_don_hang: order.ma_don_hang,
        khach_hang_id: order.khach_hang_id,
        ten_khach_hang: order.ten_khach_hang,
        trang_thai: order.trang_thai as TrangThaiLenhSx,
        ngay_dat: order.ngay_dat,
        ngay_giao_du_kien: order.ngay_giao_du_kien,
        ma_danh_muc: line.ma_danh_muc,
        ten_danh_muc: line.ten_danh_muc,
        ten_nhom_danh_muc: line.ten_nhom_danh_muc,
        so_luong: line.so_luong,
        don_vi_tinh: line.don_vi_tinh,
        ghi_chu: line.ghi_chu,
        thu_tu: line.thu_tu,
        tg_tao: line.tg_tao,
        tg_cap_nhat: line.tg_cap_nhat,
        thuoc_tinh_values: line.thuoc_tinh_values,
        thong_so_do_values: line.thong_so_do_values,
      });
    }
  }

  return rows.sort((a, b) => {
    const dateCmp = b.ngay_dat.localeCompare(a.ngay_dat);
    if (dateCmp !== 0) return dateCmp;
    const orderCmp = a.ma_don_hang.localeCompare(b.ma_don_hang, 'vi');
    if (orderCmp !== 0) return orderCmp;
    return a.thu_tu - b.thu_tu;
  });
};

export const updateProductionOrderStatus = async (
  id: string,
  status: TrangThaiLenhSx,
): Promise<SalesOrder> => {
  if (!isProductionOrderStatus(status)) {
    throw new Error(txt('productionOrder.validation.invalidStatus'));
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is not configured.');

  const { error } = await supabase
    .from('kd_don_hang')
    .update({ trang_thai: status })
    .eq('id', Number(id))
    .in('trang_thai', [...TRANG_THAI_LENH_SX]);
  handleSupabaseError(error);

  const fresh = await getProductionOrderById(id);
  if (!fresh) throw new Error(txt('productionOrder.service.notFound'));
  return fresh;
};
