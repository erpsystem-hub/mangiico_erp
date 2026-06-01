import type { WarehouseSlip, WarehouseSlipLine } from '../core/types';
import type { WarehouseSlipFormValues, WarehouseSlipLineFormValues } from '../core/schema';
import type { WarehouseSlipLineDraft } from '../core/types';

export function newSlipLineDraft(thuTu: number): WarehouseSlipLineDraft {
  return {
    clientId: crypto.randomUUID(),
    loai_hang: 'nguyen_lieu',
    nguyen_lieu_id: null,
    danh_muc_id: null,
    so_luong: 1,
    don_vi_tinh: 'm',
    ghi_chu: '',
    thu_tu: thuTu,
  };
}

export function slipLinesToDraftRows(lines: WarehouseSlipLine[]): WarehouseSlipLineDraft[] {
  return lines.map((ln) => ({
    clientId: ln.id,
    loai_hang: ln.loai_hang,
    nguyen_lieu_id: ln.nguyen_lieu_id,
    danh_muc_id: ln.danh_muc_id,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh,
    ghi_chu: ln.ghi_chu ?? '',
    thu_tu: ln.thu_tu,
  }));
}

export function draftRowsToFormLines(rows: WarehouseSlipLineDraft[]): WarehouseSlipLineFormValues[] {
  return rows.map((r, i) => ({
    loai_hang: r.loai_hang,
    nguyen_lieu_id: r.nguyen_lieu_id,
    danh_muc_id: r.danh_muc_id,
    so_luong: r.so_luong,
    don_vi_tinh: r.don_vi_tinh || 'm',
    ghi_chu: r.ghi_chu || null,
    thu_tu: r.thu_tu ?? i + 1,
  }));
}

export function formLinesToDraftRows(
  lines: WarehouseSlipLineFormValues[],
): WarehouseSlipLineDraft[] {
  return lines.map((ln, i) => ({
    clientId: crypto.randomUUID(),
    loai_hang: ln.loai_hang,
    nguyen_lieu_id: ln.nguyen_lieu_id ?? null,
    danh_muc_id: ln.danh_muc_id ?? null,
    so_luong: ln.so_luong,
    don_vi_tinh: ln.don_vi_tinh || 'm',
    ghi_chu: ln.ghi_chu ?? '',
    thu_tu: ln.thu_tu ?? i + 1,
  }));
}

export function warehouseSlipToFormValues(slip: WarehouseSlip): WarehouseSlipFormValues {
  return {
    ma_phieu_kho: slip.ma_phieu_kho,
    loai_phieu: slip.loai_phieu,
    muc_dich: slip.muc_dich,
    kho_id: slip.kho_id,
    kho_dich_id: slip.kho_dich_id,
    ngay_phieu: slip.ngay_phieu,
    chi_nhanh_id: slip.chi_nhanh_id,
    nhan_vien_id: slip.nhan_vien_id,
    don_hang_id: slip.don_hang_id,
    don_mua_id: slip.don_mua_id,
    ghi_chu: slip.ghi_chu,
    trang_thai: slip.trang_thai,
    lines: (slip.lines ?? []).map((ln) => ({
      loai_hang: ln.loai_hang,
      nguyen_lieu_id: ln.nguyen_lieu_id,
      danh_muc_id: ln.danh_muc_id,
      so_luong: ln.so_luong,
      don_vi_tinh: ln.don_vi_tinh,
      ghi_chu: ln.ghi_chu,
      thu_tu: ln.thu_tu,
    })),
  };
}
