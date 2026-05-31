import type { SalesOrder, SalesOrderLine } from '../core/types';
import type { SalesOrderFormValues, SalesOrderLineFormValues } from '../core/schema';

export type OrderLineRow = SalesOrderLineFormValues & {
  clientId: string;
  ten_danh_muc?: string;
  ma_danh_muc?: string;
};

export function newOrderLineRow(thuTu: number): OrderLineRow {
  return {
    clientId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    danh_muc_id: '',
    so_luong: 1,
    don_vi_tinh: 'cái',
    don_gia: 0,
    ghi_chu: '',
    thu_tu: thuTu,
    thuoc_tinh_values: [],
    thong_so_do_values: [],
  };
}

export function salesOrderLinesToDraftRows(lines: SalesOrderLine[]): OrderLineRow[] {
  return lines.map((ln, i) => ({
    clientId: ln.id || `line-${i}`,
    ...lineToFormLine(ln, i),
    ten_danh_muc: ln.ten_danh_muc,
    ma_danh_muc: ln.ma_danh_muc,
  }));
}

export function draftLineToFormValues(row: OrderLineRow): SalesOrderLineFormValues {
  return {
    danh_muc_id: row.danh_muc_id,
    so_luong: row.so_luong,
    don_vi_tinh: row.don_vi_tinh,
    don_gia: row.don_gia,
    ghi_chu: row.ghi_chu,
    thu_tu: row.thu_tu,
    thuoc_tinh_values: row.thuoc_tinh_values ?? [],
    thong_so_do_values: row.thong_so_do_values ?? [],
  };
}

function lineToFormLine(ln: SalesOrderLine, index: number): SalesOrderLineFormValues {
  return {
    danh_muc_id: ln.danh_muc_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh,
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu,
    thu_tu: ln.thu_tu ?? index + 1,
    thuoc_tinh_values: (ln.thuoc_tinh_values ?? []).map((v) => ({
      thuoc_tinh_id: v.thuoc_tinh_id,
      gia_tri: v.gia_tri,
    })),
    thong_so_do_values: (ln.thong_so_do_values ?? []).map((v) => ({
      thong_so_do_id: v.thong_so_do_id,
      gia_tri: v.gia_tri,
    })),
  };
}

export function lineRowsToFormLines(rows: OrderLineRow[]): SalesOrderLineFormValues[] {
  return rows.map((ln, i) => ({
    danh_muc_id: ln.danh_muc_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh || 'cái',
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu || null,
    thu_tu: i + 1,
    thuoc_tinh_values: ln.thuoc_tinh_values ?? [],
    thong_so_do_values: ln.thong_so_do_values ?? [],
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
    lines: (order.lines ?? []).map(lineToFormLine),
  };
}

export function salesOrderLinesToFormLines(lines: SalesOrderLine[]): SalesOrderLineFormValues[] {
  return lines.map(lineToFormLine);
}

export function salesOrderLineToFormValues(line: SalesOrderLine): SalesOrderLineFormValues {
  return lineToFormLine(line, line.thu_tu - 1);
}

/** Gộp thêm/sửa một dòng vào payload upsert đơn hàng. */
export function mergeOrderLineIntoFormValues(
  order: SalesOrder,
  lineValues: SalesOrderLineFormValues,
  editingLineId?: string | null,
): SalesOrderFormValues {
  const base = salesOrderToFormValues(order);
  if (editingLineId) {
    const idx = (order.lines ?? []).findIndex((ln) => ln.id === editingLineId);
    if (idx < 0) return { ...base, lines: [...base.lines, { ...lineValues, thu_tu: base.lines.length + 1 }] };
    const lines = [...base.lines];
    lines[idx] = { ...lineValues, thu_tu: idx + 1 };
    return { ...base, lines };
  }
  return {
    ...base,
    lines: [...base.lines, { ...lineValues, thu_tu: base.lines.length + 1 }],
  };
}
