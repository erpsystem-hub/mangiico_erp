import type { SalesOrder, SalesOrderLine } from '../core/types';
import type { SalesOrderFormValues, SalesOrderLineFormValues } from '../core/schema';
import type { OrderLineRow } from '../components/order-lines-editor';

export function lineRowsToFormLines(rows: OrderLineRow[]): SalesOrderLineFormValues[] {
  return rows.map((ln, i) => ({
    san_pham_id: ln.san_pham_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh || 'cái',
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu || null,
    thu_tu: i + 1,
  }));
}

export function salesOrderToFormValues(order: SalesOrder): SalesOrderFormValues {
  return {
    ma_don_hang: order.ma_don_hang,
    khach_hang_id: order.khach_hang_id,
    chi_nhanh_id: order.chi_nhanh_id ?? '',
    nhan_vien_id: order.nhan_vien_id ?? '',
    ngay_dat: order.ngay_dat,
    ngay_giao_du_kien: order.ngay_giao_du_kien ?? '',
    dia_chi_giao: order.dia_chi_giao ?? '',
    ghi_chu: order.ghi_chu ?? '',
    trang_thai: order.trang_thai,
    lines: (order.lines ?? []).map((ln, i) => ({
      san_pham_id: ln.san_pham_id,
      so_luong: ln.so_luong,
      don_vi_tinh: ln.don_vi_tinh,
      don_gia: ln.don_gia,
      ghi_chu: ln.ghi_chu,
      thu_tu: ln.thu_tu ?? i + 1,
    })),
  };
}

export function salesOrderLinesToFormLines(lines: SalesOrderLine[]): SalesOrderLineFormValues[] {
  return lines.map((ln, i) => ({
    san_pham_id: ln.san_pham_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh,
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu,
    thu_tu: ln.thu_tu ?? i + 1,
  }));
}
