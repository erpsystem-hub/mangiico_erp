import type { ProductionOrder, ProductionOrderLine, ProductionOrderLineRow } from '../core/types';

export function productionOrderFromLineRow(row: ProductionOrderLineRow): ProductionOrder {
  return {
    id: row.don_hang_id,
    ma_don_hang: row.ma_don_hang,
    khach_hang_id: row.khach_hang_id,
    ma_khach_hang: '',
    ten_khach_hang: row.ten_khach_hang,
    chi_nhanh_id: null,
    ten_chi_nhanh: null,
    nhan_vien_id: null,
    ngay_dat: row.ngay_dat,
    ngay_giao_du_kien: row.ngay_giao_du_kien,
    dia_chi_giao: null,
    ghi_chu: null,
    trang_thai: row.trang_thai,
    tong_tien: 0,
    tg_tao: row.tg_tao ?? '',
    tg_cap_nhat: row.tg_cap_nhat ?? '',
  };
}

export function productionLineFromRow(row: ProductionOrderLineRow): ProductionOrderLine {
  return {
    id: row.id,
    don_hang_id: row.don_hang_id,
    danh_muc_id: row.danh_muc_id,
    ma_danh_muc: row.ma_danh_muc,
    ten_danh_muc: row.ten_danh_muc,
    ten_nhom_danh_muc: row.ten_nhom_danh_muc,
    so_luong: row.so_luong,
    don_vi_tinh: row.don_vi_tinh,
    don_gia: 0,
    thanh_tien: 0,
    ghi_chu: row.ghi_chu,
    thu_tu: row.thu_tu,
    tg_tao: row.tg_tao,
    tg_cap_nhat: row.tg_cap_nhat,
    thuoc_tinh_values: row.thuoc_tinh_values,
    thong_so_do_values: row.thong_so_do_values,
  };
}
