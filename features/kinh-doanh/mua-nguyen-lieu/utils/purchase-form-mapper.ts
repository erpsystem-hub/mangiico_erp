import type { PurchaseOrder, PurchaseOrderLine } from '../core/types';
import type { PurchaseOrderFormValues, PurchaseOrderLineFormValues } from '../core/schema';

export type PurchaseLineRow = PurchaseOrderLineFormValues & {
  clientId: string;
  ten_nguyen_lieu?: string;
  ma_nguyen_lieu?: string;
};

export function newPurchaseLineRow(thuTu: number): PurchaseLineRow {
  return {
    clientId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nguyen_lieu_id: '',
    so_luong: 1,
    don_vi_tinh: 'm',
    don_gia: 0,
    ghi_chu: '',
    thu_tu: thuTu,
  };
}

function lineToFormLine(ln: PurchaseOrderLine, index: number): PurchaseOrderLineFormValues {
  return {
    nguyen_lieu_id: ln.nguyen_lieu_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh,
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu,
    thu_tu: ln.thu_tu ?? index + 1,
  };
}

export function purchaseOrderLinesToDraftRows(lines: PurchaseOrderLine[]): PurchaseLineRow[] {
  return lines.map((ln, i) => ({
    clientId: ln.id || `line-${i}`,
    ...lineToFormLine(ln, i),
    ten_nguyen_lieu: ln.ten_nguyen_lieu,
    ma_nguyen_lieu: ln.ma_nguyen_lieu,
  }));
}

export function draftLineToFormValues(row: PurchaseLineRow): PurchaseOrderLineFormValues {
  return {
    nguyen_lieu_id: row.nguyen_lieu_id,
    so_luong: row.so_luong,
    don_vi_tinh: row.don_vi_tinh,
    don_gia: row.don_gia,
    ghi_chu: row.ghi_chu,
    thu_tu: row.thu_tu,
  };
}

export function lineRowsToFormLines(rows: PurchaseLineRow[]): PurchaseOrderLineFormValues[] {
  return rows.map((ln, i) => ({
    nguyen_lieu_id: ln.nguyen_lieu_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh || 'm',
    don_gia: ln.don_gia,
    ghi_chu: ln.ghi_chu || null,
    thu_tu: i + 1,
  }));
}

export function purchaseOrderToFormValues(order: PurchaseOrder): PurchaseOrderFormValues {
  return {
    ma_don_mua: order.ma_don_mua,
    nha_cung_cap_id: order.nha_cung_cap_id,
    chi_nhanh_id: order.chi_nhanh_id ?? '',
    nhan_vien_id: order.nhan_vien_id ?? '',
    ngay_dat: order.ngay_dat,
    ngay_giao_du_kien: order.ngay_giao_du_kien ?? '',
    dia_chi_nhan: order.dia_chi_nhan ?? '',
    ghi_chu: order.ghi_chu ?? '',
    trang_thai: order.trang_thai,
    lines: (order.lines ?? []).map(lineToFormLine),
  };
}

export function purchaseOrderLinesToFormLines(
  lines: PurchaseOrderLine[],
): PurchaseOrderLineFormValues[] {
  return lines.map(lineToFormLine);
}

export function purchaseOrderLineToFormValues(line: PurchaseOrderLine): PurchaseOrderLineFormValues {
  return lineToFormLine(line, line.thu_tu - 1);
}

/** Gộp thêm/sửa một dòng vào payload upsert đơn mua. */
export function mergePurchaseLineIntoFormValues(
  order: PurchaseOrder,
  lineValues: PurchaseOrderLineFormValues,
  editingLineId?: string | null,
): PurchaseOrderFormValues {
  const base = purchaseOrderToFormValues(order);
  if (editingLineId) {
    const idx = (order.lines ?? []).findIndex((ln) => ln.id === editingLineId);
    if (idx < 0) {
      return { ...base, lines: [...base.lines, { ...lineValues, thu_tu: base.lines.length + 1 }] };
    }
    const lines = [...base.lines];
    lines[idx] = { ...lineValues, thu_tu: idx + 1 };
    return { ...base, lines };
  }
  return {
    ...base,
    lines: [...base.lines, { ...lineValues, thu_tu: base.lines.length + 1 }],
  };
}
